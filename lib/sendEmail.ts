import { Resend } from 'resend';

// Lazy initialisation — avoids crashing at build time when env var is absent
function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
}

interface ConsultationData {
  name: string;
  email: string;
  phone: string;
  category: string;
  consultation_date: string;
  consultation_time: string;
  message: string;
}

export async function sendTeamNotificationEmail(data: ConsultationData) {
  try {
    const resend = getResendClient();
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'FixIt Studio <notifications@fixit.studio>',
      to: process.env.TEAM_EMAIL || 'team@fixit.studio',
      subject: `New Consultation Request - ${data.category}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .header h1 { margin: 0; font-size: 24px; }
              .content {
                background: #f9fafb;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
                border-radius: 0 0 8px 8px;
              }
              .field {
                margin-bottom: 20px;
                background: white;
                padding: 15px;
                border-radius: 6px;
                border-left: 4px solid #667eea;
              }
              .field-label {
                font-weight: 600;
                color: #6b7280;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
              }
              .field-value { color: #1f2937; font-size: 16px; }
              .message-box {
                background: white;
                padding: 15px;
                border-radius: 6px;
                border: 1px solid #e5e7eb;
                margin-top: 10px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
              .cta-button {
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
                font-weight: 600;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎯 New Consultation Request</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 25px;">
                A new consultation request has been submitted. Please review the details below:
              </p>
              <div class="field">
                <div class="field-label">Client Name</div>
                <div class="field-value">${data.name}</div>
              </div>
              <div class="field">
                <div class="field-label">Email Address</div>
                <div class="field-value">
                  <a href="mailto:${data.email}" style="color: #667eea; text-decoration: none;">${data.email}</a>
                </div>
              </div>
              <div class="field">
                <div class="field-label">Phone Number</div>
                <div class="field-value">
                  <a href="tel:${data.phone}" style="color: #667eea; text-decoration: none;">${data.phone}</a>
                </div>
              </div>
              <div class="field">
                <div class="field-label">Service Category</div>
                <div class="field-value">${data.category}</div>
              </div>
              <div class="field">
                <div class="field-label">Scheduled Consultation</div>
                <div class="field-value">
                  📅 ${new Date(data.consultation_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  <br>🕐 ${data.consultation_time}
                </div>
              </div>
              <div class="field">
                <div class="field-label">Client Message</div>
                <div class="message-box">${data.message.replace(/\n/g, '<br>')}</div>
              </div>
              <div style="text-align: center;">
                <a href="mailto:${data.email}" class="cta-button">Reply to Client</a>
              </div>
              <div class="footer">
                <p>This is an automated notification from FixIt Studio consultation system.</p>
                <p>Please respond to the client within 3 hours as per our service commitment.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
New Consultation Request - ${data.category}

Client Information:
-------------------
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Category: ${data.category}

Scheduled Time:
--------------
Date: ${data.consultation_date}
Time: ${data.consultation_time}

Client Message:
--------------
${data.message}

Please respond to the client within 3 hours.
      `.trim()
    });

    if (error) {
      console.error('Team email error:', error);
      return { success: false, error };
    }
    return { success: true, data: emailData };
  } catch (error) {
    console.error('Team email exception:', error);
    return { success: false, error };
  }
}

export async function sendClientConfirmationEmail(data: ConsultationData) {
  try {
    const resend = getResendClient();
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'FixIt Studio <hello@fixit.studio>',
      to: data.email,
      subject: 'Consultation Request Received - FixIt Studio',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .header h1 { margin: 0; font-size: 28px; }
              .header p { margin: 10px 0 0 0; opacity: 0.9; }
              .content {
                background: white;
                padding: 40px;
                border: 1px solid #e5e7eb;
                border-top: none;
                border-radius: 0 0 8px 8px;
              }
              .highlight-box {
                background: #f0f4ff;
                border-left: 4px solid #667eea;
                padding: 20px;
                margin: 25px 0;
                border-radius: 6px;
              }
              .highlight-box strong { color: #667eea; }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
              .checkmark { font-size: 48px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="checkmark">✅</div>
              <h1>Thank You, ${data.name}!</h1>
              <p>Your consultation request has been received</p>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">
                We're excited to help bring your vision to life! Your consultation request has been successfully submitted and our team is reviewing the details.
              </p>
              <div class="highlight-box">
                <strong>Scheduled Consultation:</strong><br>
                📅 ${new Date(data.consultation_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
                🕐 ${data.consultation_time}<br>
                📂 Service: ${data.category}
              </div>
              <h3 style="color: #1f2937; margin-top: 30px;">What happens next?</h3>
              <ul style="color: #4b5563; line-height: 2;">
                <li>Our team will review your project details</li>
                <li>We'll reach out within <strong>3 hours</strong> to confirm your consultation</li>
                <li>During the call, we'll discuss your requirements in depth</li>
                <li>You'll receive a custom proposal tailored to your needs</li>
              </ul>
              <p style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
                <strong>💡 Pro Tip:</strong> Have any reference materials or examples ready for our consultation call to help us better understand your vision!
              </p>
              <div class="footer">
                <p><strong>FixIt Studio</strong></p>
                <p>Professional Media Repair, Enhancement, and Post-Production Solutions</p>
                <p style="margin-top: 15px;">Questions? Reply to this email or call us directly.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Thank You, ${data.name}!

Your consultation request has been received successfully.

Scheduled Consultation:
----------------------
Date: ${new Date(data.consultation_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${data.consultation_time}
Service: ${data.category}

What happens next?
-----------------
- Our team will review your project details
- We'll reach out within 3 hours to confirm your consultation
- During the call, we'll discuss your requirements in depth
- You'll receive a custom proposal tailored to your needs

Pro Tip: Have any reference materials or examples ready for our consultation call!

---
FixIt Studio
Professional Media Repair, Enhancement, and Post-Production Solutions

Questions? Reply to this email or call us directly.
      `.trim()
    });

    if (error) {
      console.error('Client email error:', error);
      return { success: false, error };
    }
    return { success: true, data: emailData };
  } catch (error) {
    console.error('Client email exception:', error);
    return { success: false, error };
  }
}
