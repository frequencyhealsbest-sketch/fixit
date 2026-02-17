# FixIt Studio — Complete Setup Guide

## What This Project Does

FixIt Studio is a production-ready Next.js portfolio website for a media post-production agency. Users browse your work, fill a consultation form, **pay ₹299 via Razorpay**, and only after successful payment is their booking saved and notifications sent.

---

## Prerequisites

Before starting, make sure you have these installed on your computer:

| Tool | Minimum Version | Check Command |
|------|----------------|---------------|
| Node.js | 18 or higher | `node --version` |
| npm | 9 or higher | `npm --version` |
| Git (optional) | Any | `git --version` |

Download Node.js from https://nodejs.org if you don't have it.

---

## Overview of Services You Need

| Service | Purpose | Cost |
|---------|---------|------|
| **Supabase** | Database to store bookings | Free |
| **Razorpay** | Payment processing (₹299 fee) | Free to set up, 2% per transaction |
| **Resend** | Email notifications | Free (100/day) |
| **Twilio** | WhatsApp notifications | Free trial ($15 credit) |

Resend and Twilio are **optional** — the app works without them, you'll just check Supabase manually for new bookings.

---

## STEP 1 — Extract and Install

```bash
# 1. Extract the zip file
unzip studio-portfolio-final.zip
cd studio-portfolio

# 2. Install all dependencies
npm install

# 3. Create your environment file
cp .env.example .env.local
```

Open `.env.local` in any text editor (VS Code, Notepad, etc.) — you'll fill it in during the steps below.

---

## STEP 2 — Set Up Supabase (Database)

### 2.1 Create Account and Project

1. Go to **https://supabase.com** and click "Start your project"
2. Sign up with GitHub or email
3. Click **"New project"**
4. Fill in:
   - **Name:** `fixit-studio` (or anything you like)
   - **Database Password:** Create a strong password and save it somewhere safe
   - **Region:** Choose the one closest to your users
5. Click **"Create new project"**
6. Wait about 2 minutes for it to initialize

### 2.2 Get Your API Keys

1. In the left sidebar, click the **gear icon (Settings)**
2. Click **"API"**
3. You'll see two things to copy:

**Project URL** — looks like:
```
https://abcdefghijklmno.supabase.co
```

**anon public** key — starts with:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ Copy the **anon** key, NOT the service_role key.

### 2.3 Add to .env.local

Open `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.4 Create the Database Tables

1. In Supabase, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `database/schema.sql` from this project
4. Copy the **entire contents** and paste into the Supabase SQL Editor
5. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)
6. You should see: `Success. No rows returned`

**Then run the payment migration:**

1. Click **"New query"** again
2. Open `database/payment_migration.sql` from this project
3. Copy the entire contents and paste it in
4. Click **"Run"**
5. You should see: `Success. No rows returned`

### 2.5 Fix Row Level Security

Since you disabled RLS previously, run this to keep it disabled (simplest approach):

```sql
ALTER TABLE consultations DISABLE ROW LEVEL SECURITY;
```

Or if you want to use RLS properly, run:

```sql
DROP POLICY IF EXISTS "Allow public inserts" ON consultations;
CREATE POLICY "Allow public inserts" ON consultations
  FOR INSERT
  WITH CHECK (true);
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
```

### 2.6 Verify the Tables Exist

1. Click **"Table Editor"** in the left sidebar
2. You should see a `consultations` table
3. Click on it — you should see these columns:
   - id, name, email, phone, category
   - consultation_date, consultation_time, message
   - status, **payment_id**, **payment_status**, created_at

✅ Supabase is ready.

---

## STEP 3 — Set Up Razorpay (Payments)

### 3.1 Create Account

1. Go to **https://razorpay.com** and click "Sign Up"
2. Enter your details and verify your email
3. You can start with a test account immediately (no KYC needed for testing)

### 3.2 Get API Keys

1. In the Razorpay Dashboard, click **"Settings"** in the left sidebar
2. Click **"API Keys"**
3. Click **"Generate Test Key"** (for development)
4. You'll see:
   - **Key ID:** starts with `rzp_test_`
   - **Key Secret:** shown only once — copy it immediately!

⚠️ The Key Secret is only shown **once**. If you miss it, you'll need to regenerate.

### 3.3 Add to .env.local

```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
```

### 3.4 Test Cards (for Development)

Use these card details when testing payments — no real money charged:

| Field | Value |
|-------|-------|
| Card Number | `4111 1111 1111 1111` |
| Expiry | Any future date (e.g. 12/26) |
| CVV | Any 3 digits (e.g. 123) |
| Name | Any name |
| OTP | `1234` (if asked) |

Other test cards:
- **Success:** `5104 0600 0000 0008` (Mastercard)
- **Failure:** `4000 0000 0000 0002` (to test failure flow)

### 3.5 Going Live (Production)

When you're ready to accept real payments:

1. Complete Razorpay KYC (business verification)
2. Go to Settings → API Keys
3. Generate **Live Keys** (prefix: `rzp_live_`)
4. Replace the test keys in your production environment variables

✅ Razorpay is ready.

---

## STEP 4 — Set Up Resend (Email Notifications) — OPTIONAL

Skip this step if you don't need email notifications. The booking system works without it.

### 4.1 Create Account

1. Go to **https://resend.com** and click "Get Started"
2. Sign up with GitHub or email
3. Verify your email

### 4.2 Get API Key

1. In the Resend dashboard, click **"API Keys"**
2. Click **"Create API Key"**
3. Name it: `fixit-studio`
4. Copy the key — it starts with `re_`

### 4.3 Add to .env.local

**For development/testing** (works immediately, no domain needed):
```env
RESEND_API_KEY=re_YOUR_API_KEY_HERE
RESEND_FROM_EMAIL=FixIt Studio <onboarding@resend.dev>
TEAM_EMAIL=your-personal-email@gmail.com
```

**For production** (requires domain verification):
```env
RESEND_API_KEY=re_YOUR_API_KEY_HERE
RESEND_FROM_EMAIL=FixIt Studio <hello@yourdomain.com>
TEAM_EMAIL=team@yourdomain.com
```

### 4.4 Verify Your Domain (Production Only)

1. In Resend, click **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain (e.g. `fixit.studio`)
4. Add the DNS records Resend shows you to your domain registrar
5. Click **"Verify"** — can take up to 48 hours

✅ Resend is ready.

---

## STEP 5 — Set Up Twilio WhatsApp — OPTIONAL

Skip this step if you don't need WhatsApp notifications.

### 5.1 Create Account

1. Go to **https://www.twilio.com/try-twilio**
2. Sign up and verify your phone number
3. You get $15 free trial credit

### 5.2 Get Credentials

1. From the Twilio Console home page, copy:
   - **Account SID** — starts with `AC`
   - **Auth Token** — click the eye icon to reveal

### 5.3 Set Up WhatsApp Sandbox

For testing (free, no approval needed):

1. In Twilio Console, go to **Messaging → Try it out → Send a WhatsApp message**
2. Note the sandbox number (e.g. `+1 415 523 8886`)
3. **Your phone must join the sandbox first:**
   - Open WhatsApp on your phone
   - Send a message to `+14155238886`
   - The message should be: `join [your-unique-code]`
   - Example: `join happy-penguin`
   - You'll get a confirmation reply
4. Every team member who needs to receive notifications must do this too

### 5.4 Add to .env.local

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TEAM_WHATSAPP_NUMBER=whatsapp:+919876543210
```

⚠️ Replace `+919876543210` with your actual WhatsApp number including country code.

⚠️ The `whatsapp:` prefix is **required** — don't leave it out.

### 5.5 Format for TEAM_WHATSAPP_NUMBER

| Country | Format | Example |
|---------|--------|---------|
| India | `whatsapp:+91XXXXXXXXXX` | `whatsapp:+919876543210` |
| US/Canada | `whatsapp:+1XXXXXXXXXX` | `whatsapp:+15551234567` |
| UK | `whatsapp:+44XXXXXXXXXX` | `whatsapp:+447700900123` |
| UAE | `whatsapp:+971XXXXXXXXX` | `whatsapp:+971501234567` |

✅ Twilio is ready.

---

## STEP 6 — Run the Project

```bash
# Make sure you're in the project folder
cd studio-portfolio

# Install dependencies (if not done yet)
npm install

# Start development server
npm run dev
```

Open your browser and go to: **http://localhost:3000**

### Check the Logs

Watch your terminal — when the server starts you should see:
```
▲ Next.js 15.x.x
- Local: http://localhost:3000
✓ Ready in XXXXms
```

You should NOT see any red error messages about missing variables.

---

## STEP 7 — Test the Complete Flow

### 7.1 Submit a Test Booking

1. Go to http://localhost:3000
2. Fill in the consultation form:
   - Name: `Test User`
   - Email: your email address
   - Phone: `+919876543210` (your number for WhatsApp test)
   - Project Type: `Video Production`
   - Date: any future date
   - Time: any slot
   - Message: `This is a test booking`
3. Click **"Pay ₹299 & Book Consultation"**

### 7.2 Complete the Test Payment

The Razorpay checkout modal will open:
1. Enter test card: `4111 1111 1111 1111`
2. Expiry: `12/26`
3. CVV: `123`
4. Name: `Test User`
5. Click **Pay**
6. Enter OTP: `1234` if prompted

### 7.3 Verify Everything Worked

**Green success banner appears on the form** ✅

**Check Supabase:**
1. Go to Supabase → Table Editor → `consultations`
2. Your booking should appear with:
   - `payment_status = paid`
   - `payment_id = pay_XXXXXXXX` (Razorpay payment ID)

**Check your email** (if Resend configured):
- Team notification email received
- Confirmation email sent to the email you entered

**Check WhatsApp** (if Twilio configured):
- Team WhatsApp notification received
- Confirmation WhatsApp sent to the phone number entered

---

## STEP 8 — Deploy to Production

### Option A: Vercel (Recommended — Free)

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
# Create a new repo at github.com, then:
git remote add origin https://github.com/yourusername/fixit-studio.git
git push -u origin main
```

2. **Connect to Vercel:**
   - Go to https://vercel.com and sign in with GitHub
   - Click **"New Project"**
   - Import your GitHub repository
   - Click **"Deploy"** (Vercel auto-detects Next.js)

3. **Add Environment Variables in Vercel:**
   - Go to your project → **Settings → Environment Variables**
   - Add every variable from your `.env.local` file one by one
   - Make sure to add them for **Production**, **Preview**, and **Development**
   - Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

4. **Redeploy:**
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment
   - Your site is live!

5. **Switch to Razorpay Live Keys:**
   - Complete Razorpay KYC
   - Generate live keys
   - Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Vercel environment variables
   - Redeploy

### Option B: Your Own Server / VPS

```bash
# On your server
git clone https://github.com/yourusername/fixit-studio.git
cd fixit-studio
npm install
npm run build

# Create .env.local with all your production variables
nano .env.local

# Start with PM2 (keeps it running)
npm install -g pm2
pm2 start npm --name "fixit-studio" -- start
pm2 save
pm2 startup
```

---

## Complete .env.local Reference

Here is what your final `.env.local` should look like with all services configured:

```env
# SUPABASE (Required)
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmno.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ubyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ2NzUyNDA3fQ.XXXXXXXX

# RAZORPAY (Required)
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX

# RESEND EMAIL (Optional)
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXX
RESEND_FROM_EMAIL=FixIt Studio <onboarding@resend.dev>
TEAM_EMAIL=your@email.com

# TWILIO WHATSAPP (Optional)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TEAM_WHATSAPP_NUMBER=whatsapp:+919876543210
```

---

## File Structure Reference

```
studio-portfolio/
├── app/
│   ├── api/
│   │   ├── consultation/
│   │   │   └── route.ts          ← Saves booking (requires verified payment)
│   │   └── payment/
│   │       ├── create-order/
│   │       │   └── route.ts      ← Creates Razorpay order (₹299)
│   │       └── verify/
│   │           └── route.ts      ← Verifies payment signature
│   ├── globals.css               ← Global styles
│   ├── layout.tsx                ← Loads Razorpay SDK script
│   └── page.tsx                  ← Homepage
├── components/
│   ├── HeroConsultationForm.tsx  ← Main form with payment flow
│   ├── ConsultationModal.tsx     ← Modal form with payment flow
│   ├── FloatingConsultationButton.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Section.tsx
│   ├── VideoCard.tsx
│   └── Contact.tsx
├── lib/
│   ├── sendEmail.ts              ← Resend email integration
│   └── sendWhatsApp.ts          ← Twilio WhatsApp (international numbers fixed)
├── database/
│   ├── schema.sql                ← Run FIRST in Supabase
│   └── payment_migration.sql    ← Run SECOND in Supabase
├── .env.example                  ← Template — copy to .env.local
├── package.json
└── SETUP_GUIDE.md               ← This file
```

---

## How the Payment Flow Works

```
User fills form → clicks "Pay ₹299 & Book Consultation"
        ↓
POST /api/payment/create-order
  → Creates Razorpay order
  → Returns order ID + public key to browser
        ↓
Razorpay checkout modal opens in browser
  → User enters card/UPI details
  → Razorpay processes payment
        ↓
Payment success → Razorpay calls handler with:
  razorpay_order_id, razorpay_payment_id, razorpay_signature
        ↓
POST /api/payment/verify
  → Recomputes HMAC-SHA256 signature server-side
  → Compares with Razorpay's signature (timing-safe)
  → Returns verified: true
        ↓
POST /api/consultation (with payment proof)
  → Re-verifies signature AGAIN (cannot be bypassed)
  → Saves to Supabase with payment_status: "paid"
  → Fires email + WhatsApp notifications
        ↓
Green success message shown to user ✅
```

If payment is cancelled, closed, or fails — the consultation is **never saved**.

---

## Troubleshooting

### "Payment gateway not configured"
→ `RAZORPAY_KEY_ID` or `RAZORPAY_KEY_SECRET` is missing from `.env.local`
→ Restart server after editing `.env.local`

### Razorpay modal opens but payment fails
→ Make sure you're using test card `4111 1111 1111 1111`
→ OTP is `1234` for test mode

### "Payment verification failed"
→ `RAZORPAY_KEY_SECRET` might be wrong — double-check it
→ Make sure there are no extra spaces in the env value

### Form submits but nothing saves to database
→ Check Supabase credentials in `.env.local`
→ Make sure you ran both SQL files (schema.sql AND payment_migration.sql)
→ Check terminal for the exact error message

### "column payment_id does not exist"
→ You forgot to run `database/payment_migration.sql`
→ Go to Supabase SQL Editor and run it now

### Email/WhatsApp not sending
→ These are optional — form still works without them
→ Check that your API keys are correct
→ For WhatsApp: make sure your phone joined the Twilio sandbox

### "new row violates row-level security policy"
→ Run this in Supabase SQL Editor:
  ```sql
  ALTER TABLE consultations DISABLE ROW LEVEL SECURITY;
  ```

### Port 3000 already in use
```bash
# Use a different port
npm run dev -- -p 3001
```

---

## Quick Start Checklist

- [ ] `npm install` completed without errors
- [ ] `.env.local` created from `.env.example`
- [ ] Supabase project created and URL/key added to `.env.local`
- [ ] `database/schema.sql` executed in Supabase SQL Editor
- [ ] `database/payment_migration.sql` executed in Supabase SQL Editor
- [ ] Razorpay account created and test keys added to `.env.local`
- [ ] (Optional) Resend account and API key configured
- [ ] (Optional) Twilio account, WhatsApp sandbox joined, keys configured
- [ ] `npm run dev` starts without errors
- [ ] Test booking completed successfully with test card
- [ ] Booking appears in Supabase with `payment_status = paid`

---

## Support Resources

| Service | Documentation | Dashboard |
|---------|--------------|-----------|
| Supabase | https://supabase.com/docs | https://supabase.com/dashboard |
| Razorpay | https://razorpay.com/docs | https://dashboard.razorpay.com |
| Resend | https://resend.com/docs | https://resend.com |
| Twilio | https://www.twilio.com/docs/whatsapp | https://console.twilio.com |
| Next.js | https://nextjs.org/docs | — |
