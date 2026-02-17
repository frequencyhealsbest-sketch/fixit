'use client';

import { useState, FormEvent } from 'react';

// ─── Razorpay types (loaded via CDN script in layout.tsx) ────────────────────
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key:         string;
  amount:      number;
  currency:    string;
  name:        string;
  description: string;
  order_id:    string;
  prefill: {
    name:    string;
    email:   string;
    contact: string;
  };
  theme: { color: string };
  handler: (response: RazorpayPaymentResponse) => void;
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayPaymentResponse {
  razorpay_order_id:   string;
  razorpay_payment_id: string;
  razorpay_signature:  string;
}

interface RazorpayInstance {
  open: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HeroConsultationForm() {
  const [formData, setFormData] = useState({
    name:             '',
    email:            '',
    phone:            '',
    projectType:      '',
    consultationDate: '',
    consultationTime: '',
    message:          '',
  });

  // 'idle' | 'paying' | 'submitting' | 'success' | 'error'
  const [uiState,   setUiState]   = useState<'idle' | 'paying' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg,  setErrorMsg]  = useState('');

  const isDisabled = uiState === 'paying' || uiState === 'submitting' || uiState === 'success';

  // ── Step 2: after payment succeeds, submit consultation ─────────────────
  async function submitConsultation(paymentResponse: RazorpayPaymentResponse) {
    setUiState('submitting');

    try {
      // First verify payment server-side
      const verifyRes  = await fetch('/api/payment/verify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(paymentResponse),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.verified) {
        throw new Error(verifyData.error ?? 'Payment verification failed. Please contact support.');
      }

      // Then submit consultation with payment proof
      const consultRes  = await fetch('/api/consultation', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...formData,
          razorpay_order_id:   paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature:  paymentResponse.razorpay_signature,
        }),
      });
      const consultData = await consultRes.json();

      if (!consultRes.ok || !consultData.success) {
        throw new Error(consultData.error ?? 'Consultation booking failed after payment.');
      }

      setUiState('success');
      setFormData({
        name: '', email: '', phone: '', projectType: '',
        consultationDate: '', consultationTime: '', message: '',
      });

    } catch (err) {
      console.error('Submission error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setUiState('error');
    }
  }

  // ── Step 1: validate form → create Razorpay order → open checkout ────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setUiState('paying');
    setErrorMsg('');

    try {
      // Create order on server
      const orderRes  = await fetch('/api/payment/create-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: formData.name, email: formData.email }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error ?? 'Could not create payment order. Please try again.');
      }

      // Open Razorpay checkout
      const rzp = new window.Razorpay({
        key:         orderData.keyId,
        amount:      orderData.amount,
        currency:    orderData.currency,
        name:        'FixIt Studio',
        description: 'Consultation Fee — ₹299',
        order_id:    orderData.orderId,
        prefill: {
          name:    formData.name,
          email:   formData.email,
          contact: formData.phone,
        },
        theme: { color: '#ffffff' },
        handler: (response: RazorpayPaymentResponse) => {
          // Called by Razorpay SDK on success
          submitConsultation(response);
        },
        modal: {
          ondismiss: () => {
            // User closed the checkout without paying
            setUiState('idle');
          },
        },
      });

      rzp.open();

    } catch (err) {
      console.error('Payment init error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Payment could not be initialised.');
      setUiState('error');
    }
  }

  // ─── Render helpers ──────────────────────────────────────────────────────
  function getButtonLabel() {
    if (uiState === 'paying')     return 'Opening Payment...';
    if (uiState === 'submitting') return 'Booking Consultation...';
    if (uiState === 'success')    return 'Booked Successfully!';
    return 'Pay ₹299 & Book Consultation';
  }

  // ─── JSX ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-2xl mx-auto glass-card rounded-3xl shadow-2xl p-8 md:p-10 border border-white/10">
      <h3 className="text-2xl font-bold mb-2 text-center text-white">
        Get a consultation for the price of a single coffee
      </h3>
      <p className="text-gray-400 text-center mb-8">
        Share your vision and we'll craft a custom solution
      </p>

      {/* ── Success state ── */}
      {uiState === 'success' && (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-green-400 text-sm text-center">
          ✅ Payment successful! Your consultation has been booked. We'll be in touch within 3 hours.
        </div>
      )}

      {/* ── Error state ── */}
      {uiState === 'error' && errorMsg && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400 text-sm text-center">
          ❌ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name + Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="hero-name" className="block text-sm font-medium text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              id="hero-name"
              required
              disabled={isDisabled}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/20 outline-none transition-all placeholder-gray-500 disabled:opacity-40"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="hero-email" className="block text-sm font-medium text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="hero-email"
              required
              disabled={isDisabled}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/20 outline-none transition-all placeholder-gray-500 disabled:opacity-40"
              placeholder="your@email.com"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="hero-phone" className="block text-sm font-medium text-gray-300 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="hero-phone"
            required
            disabled={isDisabled}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/20 outline-none transition-all placeholder-gray-500 disabled:opacity-40"
            placeholder="+91 98765 43210"
          />
        </div>

        {/* Project Type */}
        <div>
          <label htmlFor="hero-projectType" className="block text-sm font-medium text-gray-300 mb-2">
            Project Type *
          </label>
          <select
            id="hero-projectType"
            required
            disabled={isDisabled}
            value={formData.projectType}
            onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
            className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/20 outline-none transition-all disabled:opacity-40"
          >
            <option value="">Select a service</option>
            <option value="video">Video Production</option>
            <option value="audio">Audio Enhancement</option>
            <option value="vfx">VFX</option>
            <option value="animation">Animation</option>
            <option value="generative-ui">Generative UI</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="hero-consultationDate" className="block text-sm font-medium text-gray-300 mb-2">
              Consultation Date *
            </label>
            <input
              type="date"
              id="hero-consultationDate"
              required
              disabled={isDisabled}
              value={formData.consultationDate}
              onChange={(e) => setFormData({ ...formData, consultationDate: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/20 outline-none transition-all disabled:opacity-40"
            />
          </div>

          <div>
            <label htmlFor="hero-consultationTime" className="block text-sm font-medium text-gray-300 mb-2">
              Consultation Time Slot *
            </label>
            <select
              id="hero-consultationTime"
              required
              disabled={isDisabled}
              value={formData.consultationTime}
              onChange={(e) => setFormData({ ...formData, consultationTime: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-600 text-black rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all disabled:opacity-40"
            >
              <option value="">Select Time Slot</option>
              <option value="10:00 – 10:20">10:00 – 10:20</option>
              <option value="10:30 – 10:50">10:30 – 10:50</option>
              <option value="11:00 – 11:20">11:00 – 11:20</option>
              <option value="11:30 – 11:50">11:30 – 11:50</option>
              <option value="12:00 – 12:20">12:00 – 12:20</option>
              <option value="12:30 – 12:50">12:30 – 12:50</option>
              <option value="14:00 – 14:20">14:00 – 14:20</option>
              <option value="14:30 – 14:50">14:30 – 14:50</option>
              <option value="15:00 – 15:20">15:00 – 15:20</option>
              <option value="15:30 – 15:50">15:30 – 15:50</option>
            </select>
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="hero-message" className="block text-sm font-medium text-gray-300 mb-2">
            Message *
          </label>
          <textarea
            id="hero-message"
            required
            disabled={isDisabled}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/20 outline-none transition-all resize-none placeholder-gray-500 disabled:opacity-40"
            placeholder="Tell us about your project..."
          />
        </div>

        {/* Payment notice */}
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="text-white text-sm font-medium">Secure Payment via Razorpay</p>
            <p className="text-gray-400 text-xs mt-0.5">
              A one-time consultation fee of <span className="text-white font-semibold">₹299</span> is charged to confirm your slot.
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isDisabled}
          className="w-full bg-white text-black py-4 px-6 rounded-xl font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {getButtonLabel()}
        </button>

        <p className="text-sm text-gray-400 text-center">
          We respond to all consultation requests within approximately 3 hours.
        </p>
      </form>
    </div>
  );
}
