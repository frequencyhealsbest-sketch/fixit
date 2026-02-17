import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendTeamNotificationEmail, sendClientConfirmationEmail } from '@/lib/sendEmail';
import { sendTeamWhatsAppNotification, sendClientWhatsAppConfirmation } from '@/lib/sendWhatsApp';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Missing Supabase environment variables!');
}
if (!RAZORPAY_SECRET) {
  console.error('❌ CRITICAL: Missing RAZORPAY_KEY_SECRET — paid submissions will be blocked');
}

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!RAZORPAY_SECRET) return false;
  const expected = crypto
    .createHmac('sha256', RAZORPAY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error', details: 'Database connection not configured.' },
        { status: 500 }
      );
    }

    console.log('📝 Consultation form submission received...');
    const body = await request.json();

    const { name, email, phone, projectType, consultationDate, consultationTime, message,
            razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!name || !email || !phone || !projectType || !consultationDate || !consultationTime || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(consultationDate)) {
      return NextResponse.json({ success: false, error: 'Invalid date format. Expected YYYY-MM-DD' }, { status: 400 });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.warn('🚫 Submission blocked — payment fields missing');
      return NextResponse.json(
        { success: false, error: 'Payment required', details: 'A verified Razorpay payment is required.' },
        { status: 402 }
      );
    }

    if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      console.warn(`🚫 Invalid signature for order ${razorpay_order_id}`);
      return NextResponse.json(
        { success: false, error: 'Payment verification failed', details: 'Invalid payment signature.' },
        { status: 400 }
      );
    }

    console.log(`✅ Payment verified: order=${razorpay_order_id} payment=${razorpay_payment_id}`);

    const consultationData = {
      name:              name.trim(),
      email:             email.trim().toLowerCase(),
      phone:             phone.trim(),
      category:          projectType,
      consultation_date: consultationDate,
      consultation_time: consultationTime,
      message:           message.trim(),
      status:            'pending',
      payment_id:        razorpay_payment_id,
      payment_status:    'paid',
    };

    console.log('💾 Saving to database...');

    const { data, error } = await supabase
      .from('consultations')
      .insert([consultationData])
      .select();

    if (error) {
      console.error('❌ Database error:', error);
      let hint = '';
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        hint = 'Run database/schema.sql in Supabase SQL Editor.';
      } else if (error.message.includes('column') && error.message.includes('does not exist')) {
        hint = 'Run database/payment_migration.sql in Supabase SQL Editor.';
      } else if (error.message.includes('JWT')) {
        hint = 'Check your NEXT_PUBLIC_SUPABASE_ANON_KEY.';
      }
      return NextResponse.json(
        { success: false, error: 'Failed to save consultation request', details: error.message, hint },
        { status: 500 }
      );
    }

    console.log('✅ Consultation saved to database:', data[0].id);

    // Fire-and-forget notifications — errors are logged but never block the response
    Promise.allSettled([
      sendTeamNotificationEmail(consultationData).then(r => {
        console.log(r.success ? '✅ Team email sent' : `❌ Team email failed: ${r.error}`);
      }),
      sendClientConfirmationEmail(consultationData).then(r => {
        console.log(r.success ? '✅ Client email sent' : `❌ Client email failed: ${r.error}`);
      }),
      sendTeamWhatsAppNotification(consultationData).then(r => {
        console.log(r.success ? '✅ Team WhatsApp sent' : `❌ Team WhatsApp failed: ${r.error}`);
      }),
      sendClientWhatsAppConfirmation(consultationData).then(r => {
        console.log(r.success ? '✅ Client WhatsApp sent' : `❌ Client WhatsApp failed: ${r.error}`);
      }),
    ]).then(results => {
      const passed = results.filter(r => r.status === 'fulfilled').length;
      console.log(`📊 Notifications: ${passed}/4 completed`);
    });

    return NextResponse.json(
      { success: true, message: 'Consultation request submitted successfully', data: data[0] },
      { status: 201 }
    );

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(_request: NextRequest) {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
