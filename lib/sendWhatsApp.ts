import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Format: whatsapp:+14155238886
const teamWhatsAppNumber = process.env.TEAM_WHATSAPP_NUMBER; // Format: whatsapp:+1234567890

// Initialize Twilio client
let client: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured');
  }
  if (!client) {
    client = twilio(accountSid, authToken);
  }
  return client;
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

/**
 * Format phone number for WhatsApp
 * Converts to E.164 format: whatsapp:+[country code][number]
 * Preserves international country codes
 */
function formatWhatsAppNumber(phone: string): string {
  // Remove all non-digit characters except leading +
  let cleanPhone = phone.trim();
  
  // If it already has a +, keep it; otherwise strip all non-digits
  if (cleanPhone.startsWith('+')) {
    cleanPhone = '+' + cleanPhone.replace(/\D/g, '');
  } else {
    cleanPhone = cleanPhone.replace(/\D/g, '');
    // Only add + if there are digits
    if (cleanPhone) {
      cleanPhone = '+' + cleanPhone;
    }
  }
  
  // Ensure we have the whatsapp: prefix
  return `whatsapp:${cleanPhone}`;
}

/**
 * Send WhatsApp notification to internal team
 */
export async function sendTeamWhatsAppNotification(data: ConsultationData) {
  try {
    if (!twilioWhatsAppNumber || !teamWhatsAppNumber) {
      console.warn('WhatsApp numbers not configured, skipping team notification');
      return { success: false, error: 'WhatsApp not configured' };
    }

    const twilioClient = getTwilioClient();

    const formattedDate = new Date(data.consultation_date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });

    const message = await twilioClient.messages.create({
      from: twilioWhatsAppNumber,
      to: teamWhatsAppNumber,
      body: `🎯 *New Consultation Request*

*Client:* ${data.name}
*Category:* ${data.category}
*Date:* ${formattedDate}
*Time:* ${data.consultation_time}

*Contact:*
📧 ${data.email}
📱 ${data.phone}

*Message:*
${data.message.substring(0, 200)}${data.message.length > 200 ? '...' : ''}

Please respond within 3 hours.
_- FixIt Studio System_`
    });

    console.log('Team WhatsApp sent:', message.sid);
    return { success: true, data: message };
  } catch (error) {
    console.error('Team WhatsApp error:', error);
    return { success: false, error };
  }
}

/**
 * Send WhatsApp confirmation to client
 * 
 * Note: For production, you should use an approved WhatsApp Business template.
 * This is a basic implementation that works with Twilio Sandbox.
 * 
 * For production WhatsApp Business API, create an approved template like:
 * 
 * Template Name: consultation_confirmation
 * Template Body: 
 * "Hello {{1}}, your consultation request has been received successfully. 
 * Scheduled Time: {{2}} - {{3}}. Our team will contact you shortly. - FixIt Studio"
 * 
 * Then use: client.messages.create({ contentSid: 'HX...', contentVariables: {...} })
 */
export async function sendClientWhatsAppConfirmation(data: ConsultationData) {
  try {
    if (!twilioWhatsAppNumber) {
      console.warn('Twilio WhatsApp number not configured, skipping client confirmation');
      return { success: false, error: 'WhatsApp not configured' };
    }

    const twilioClient = getTwilioClient();
    const clientWhatsAppNumber = formatWhatsAppNumber(data.phone);

    const formattedDate = new Date(data.consultation_date).toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

    // For Twilio Sandbox (development/testing)
    // In production, replace this with an approved template message
    const message = await twilioClient.messages.create({
      from: twilioWhatsAppNumber,
      to: clientWhatsAppNumber,
      body: `Hello ${data.name},

✅ Your consultation request has been received successfully!

📅 *Scheduled Time:*
${formattedDate}
${data.consultation_time}

🎯 *Service:* ${data.category}

Our team will contact you shortly to confirm the details and discuss your project.

Thank you for choosing FixIt Studio!

_For immediate assistance, reply to this message._`
    });

    console.log('Client WhatsApp sent:', message.sid);
    return { success: true, data: message };
  } catch (error) {
    console.error('Client WhatsApp error:', error);
    return { success: false, error };
  }
}

/**
 * Send using WhatsApp Business approved template (Production)
 * 
 * Use this function when you have an approved WhatsApp Business template
 */
export async function sendClientWhatsAppWithTemplate(
  data: ConsultationData,
  templateSid: string
) {
  try {
    if (!twilioWhatsAppNumber) {
      throw new Error('Twilio WhatsApp number not configured');
    }

    const twilioClient = getTwilioClient();
    const clientWhatsAppNumber = formatWhatsAppNumber(data.phone);

    const formattedDate = new Date(data.consultation_date).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

    const message = await twilioClient.messages.create({
      from: twilioWhatsAppNumber,
      to: clientWhatsAppNumber,
      contentSid: templateSid,
      contentVariables: JSON.stringify({
        1: data.name,
        2: formattedDate,
        3: data.consultation_time
      })
    });

    console.log('Client WhatsApp (template) sent:', message.sid);
    return { success: true, data: message };
  } catch (error) {
    console.error('Client WhatsApp (template) error:', error);
    return { success: false, error };
  }
}
