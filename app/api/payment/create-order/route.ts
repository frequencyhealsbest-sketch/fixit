import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// ─── Validate env vars at module load ───────────────────────────────────────
const RAZORPAY_KEY_ID     = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.error('❌ Missing Razorpay environment variables: RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET');
}

// ─── Razorpay client (lazily validated in POST) ──────────────────────────────
function getRazorpayClient(): Razorpay {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }
  return new Razorpay({
    key_id:     RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

// ─── Constants ───────────────────────────────────────────────────────────────
const CONSULTATION_FEE_PAISE = 29900; // ₹299 in paise (1 INR = 100 paise)
const CURRENCY               = 'INR';

// ─── POST /api/payment/create-order ─────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // Validate Razorpay config is available
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        {
          success: false,
          error:   'Payment gateway not configured',
          hint:    'Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env.local file',
        },
        { status: 500 }
      );
    }

    // Optional: parse customer context from body for receipt labelling
    const body = await request.json().catch(() => ({}));
    const customerEmail: string = (body.email ?? 'unknown').toString().trim();
    const customerName:  string = (body.name  ?? 'unknown').toString().trim();

    // Build a short, unique receipt ID (Razorpay limit: 40 chars)
    const receiptId = `rcpt_${Date.now()}`.slice(0, 40);

    console.log(`💳 Creating Razorpay order for: ${customerName} <${customerEmail}>`);

    const razorpay = getRazorpayClient();

    const order = await razorpay.orders.create({
      amount:   CONSULTATION_FEE_PAISE,
      currency: CURRENCY,
      receipt:  receiptId,
      notes: {
        customer_name:  customerName,
        customer_email: customerEmail,
        purpose:        'Consultation Fee - FixIt Studio',
      },
    });

    console.log(`✅ Razorpay order created: ${order.id}`);

    return NextResponse.json(
      {
        success:  true,
        orderId:  order.id,
        amount:   order.amount,         // paise — frontend uses this for display
        currency: order.currency,
        keyId:    RAZORPAY_KEY_ID,      // safe to expose (public key)
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('❌ Razorpay order creation failed:', error);

    const message =
      error instanceof Error ? error.message : 'Failed to create payment order';

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
