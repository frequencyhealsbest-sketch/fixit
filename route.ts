import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendTeamNotificationEmail, sendClientConfirmationEmail } from '@/lib/sendEmail';
import { sendTeamWhatsAppNotification, sendClientWhatsAppConfirmation } from '@/lib/sendWhatsApp';

// ─── Environment variables ───────────────────────────────────────────────────
const supabaseUrl      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const RAZORPAY_SECRET  = process.env.RAZORPAY_KEY_SECRET;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Missing Supabase environment variables!');
}
if (!RAZORPAY_SECRET) {
  console.error('❌ CRITICAL: Missing RAZORPAY_KEY_SECRET — paid submissions will be blocked');
}

// ─── Supabase client ─────────────────────────────────────────────────────────
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ─── Internal: re-verify Razorpay signature server-side ─────────────────────
function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!RAZORPAY_SECRET) return false;
  const expected = crypto
    .createHmac('sha256', RAZORPAY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected,  'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    return false;
  }
}

// ─── POST /api/consultation ───────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error:   'Server configuration error',
          details: 'Database connection not configured.',
          hint:    'Make sure .env.local exists with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY',
        },
        { status: 500 }
      );
    }

    console.log('📝 Consultation form submission received...');
    const body = await request.json();

    const {
      name,
      email,
      phone,
      projectType,
      consultationDate,
      consultationTime,
      message,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    // ── Validate consultation fields ───────────────────────────────────────
    if (!name || !email || !phone || !projectType || !consultationDate || !consultationTime || !message) {
      return NextResponse.json(
        {
          success: false,
          error:   'Missing required fields',
          details: 'All fields are required: name, email, phone, projectType, consultationDate, consultationTime, message',
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(consultationDate)) {
      return NextResponse.json({ success: false, error: 'Invalid date format. Expected YYYY-MM-DD' }, { status: 400 });
    }

    // ── PAYMENT GATE 1: fields must be present ─────────────────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.warn('🚫 Submission blocked — payment fields missing');
      return NextResponse.json(
        {
          success: false,
          error:   'Payment required',
          details: 'A verified Razorpay payment is required before submitting a consultation.',
        },
        { status: 402 }
      );
    }

    // ── PAYMENT GATE 2: server-side signature re-verification ──────────────
    const signatureValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!signatureValid) {
      console.warn(`🚫 Invalid signature for order ${razorpay_order_id}`);
      return NextResponse.json(
        {
          success: false,
          error:   'Payment verification failed',
          details: 'The payment signature is invalid.',
        },
        { status: 400 }
      );
    }

    console.log(`✅ Payment verified: order=${razorpay_order_id} payment=${razorpay_payment_id}`);

    // ── Build record ───────────────────────────────────────────────────────
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

      let userMessage = 'Failed to save consultation request';
      let hint = '';

      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        hint = 'Database table not found. Please run the SQL from database/schema.sql in your Supabase dashboard.';
      } else if (error.message.includes('JWT')) {
        hint = 'Authentication error. Please check your NEXT_PUBLIC_SUPABASE_ANON_KEY is correct.';
      } else if (error.message.includes('connect')) {
        hint = 'Cannot connect to database. Please check your NEXT_PUBLIC_SUPABASE_URL is correct.';
      } else if (error.message.includes('column') && error.message.includes('does not exist')) {
        hint = 'Run the payment migration SQL in database/payment_migration.sql to add payment columns.';
      }

      return NextResponse.json(
        { success: false, error: userMessage, details: error.message, hint },
        { status: 500 }
      );
    }

    console.log('✅ Consultation saved to database:', data[0].id);

    // ── Notifications (fire-and-forget — unchanged pipeline) ──────────────
    type NotifResult = { success: boolean; error?: unknown; data?: unknown };
    const notificationResults: Record<string, NotifResult> = {
      teamEmail:      { success: false },
      clientEmail:    { success: false },
      teamWhatsApp:   { success: false },
      clientWhatsApp: { success: false },
    };

    Promise.all([
      sendTeamNotificationEmail(consultationData)
        .then(r => { notificationResults.teamEmail = r;    console.log(r.success ? '✅ Team email sent'       : '❌ Team email failed:',    r.error); })
        .catch(e => { notificationResults.teamEmail = { success: false, error: e }; console.error('❌ Team email exception:', e); }),

      sendClientConfirmationEmail(consultationData)
        .then(r => { notificationResults.clientEmail = r;  console.log(r.success ? '✅ Client email sent'     : '❌ Client email failed:',  r.error); })
        .catch(e => { notificationResults.clientEmail = { success: false, error: e }; console.error('❌ Client email exception:', e); }),

      sendTeamWhatsAppNotification(consultationData)
        .then(r => { notificationResults.teamWhatsApp = r; console.log(r.success ? '✅ Team WhatsApp sent'    : '❌ Team WhatsApp failed:', r.error); })
        .catch(e => { notificationResults.teamWhatsApp = { success: false, error: e }; console.error('❌ Team WhatsApp exception:', e); }),

      sendClientWhatsAppConfirmation(consultationData)
        .then(r => { notificationResults.clientWhatsApp = r; console.log(r.success ? '✅ Client WhatsApp sent' : '❌ Client WhatsApp failed:', r.error); })
        .catch(e => { notificationResults.clientWhatsApp = { success: false, error: e }; console.error('❌ Client WhatsApp exception:', e); }),
    ]).then(() => {
      console.log('📊 Notification Summary:', {
        teamEmail:      notificationResults.teamEmail.success      ? '✅' : '❌',
        clientEmail:    notificationResults.clientEmail.success    ? '✅' : '❌',
        teamWhatsApp:   notificationResults.teamWhatsApp.success   ? '✅' : '❌',
        clientWhatsApp: notificationResults.clientWhatsApp.success ? '✅' : '❌',
      });
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
