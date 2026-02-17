import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// ─── Validate env var at module load ────────────────────────────────────────
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RAZORPAY_KEY_SECRET) {
  console.error('❌ Missing RAZORPAY_KEY_SECRET — payment verification will fail');
}

// ─── POST /api/payment/verify ────────────────────────────────────────────────
//
// Razorpay's signature verification algorithm:
//   HMAC-SHA256( razorpay_order_id + "|" + razorpay_payment_id , KEY_SECRET )
//   must equal razorpay_signature sent by the checkout SDK.
//
// This endpoint is the SECURITY GATE — the consultation is only stored after
// this check passes. Never skip or weaken this validation.
// ────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        {
          success: false,
          error:   'Payment verification not configured',
          hint:    'Add RAZORPAY_KEY_SECRET to your .env.local file',
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    // ── 1. Validate all three fields are present ─────────────────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error:   'Missing payment verification fields',
          details: 'razorpay_order_id, razorpay_payment_id, and razorpay_signature are all required',
        },
        { status: 400 }
      );
    }

    // ── 2. Recompute expected signature ──────────────────────────────────────
    const payload          = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');

    // ── 3. Constant-time comparison (prevents timing attacks) ────────────────
    const signaturesMatch = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(razorpay_signature,  'hex')
    );

    if (!signaturesMatch) {
      console.warn(`⚠️  Signature mismatch for order ${razorpay_order_id}`);
      return NextResponse.json(
        {
          success: false,
          error:   'Payment verification failed',
          details: 'Signature mismatch — payment could not be authenticated',
        },
        { status: 400 }
      );
    }

    // ── 4. Signature valid → return verified status ──────────────────────────
    console.log(`✅ Payment verified: order=${razorpay_order_id} payment=${razorpay_payment_id}`);

    return NextResponse.json(
      {
        success:    true,
        verified:   true,
        paymentId:  razorpay_payment_id,
        orderId:    razorpay_order_id,
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('❌ Payment verification error:', error);

    // crypto.timingSafeEqual throws if buffers are different lengths
    // (i.e., the signature string was malformed hex)
    if (error instanceof RangeError || (error instanceof Error && error.message.includes('length'))) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature format' },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : 'Verification failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
