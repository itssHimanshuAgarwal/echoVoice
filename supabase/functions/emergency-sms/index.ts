import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmergencyAlertRequest {
  userLocation?: string;
  userName?: string;
  emergencyMessage?: string;
  emergencyContacts?: Array<{
    name: string;
    phone: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userLocation, userName, emergencyMessage, emergencyContacts }: EmergencyAlertRequest = await req.json();

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      throw new Error('Missing Twilio credentials');
    }

    const timestamp = new Date().toLocaleString();
    const defaultMessage = emergencyMessage || "EMERGENCY ALERT: Help needed immediately!";
    const locationText = userLocation || "Location unknown";
    const nameText = userName || "EchoVoice user";

    const fullMessage = `🚨 EMERGENCY ALERT 🚨
${nameText} needs immediate help!

Message: ${defaultMessage}

Location: ${locationText}
Time: ${timestamp}

This is an automated emergency alert from the EchoVoice app.`;

    console.log('Sending emergency SMS alerts...');
    console.log('Message:', fullMessage);

    const results = [];

    // If no emergency contacts provided, send to a default number (could be 911 or user's own number)
    const contactsToAlert = emergencyContacts && emergencyContacts.length > 0 
      ? emergencyContacts 
      : [{ name: 'Emergency Services', phone: twilioPhoneNumber }]; // Fallback to Twilio number for testing

    for (const contact of contactsToAlert) {
      try {
        console.log(`Sending SMS to ${contact.name} at ${contact.phone}`);

        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: twilioPhoneNumber,
            To: contact.phone,
            Body: fullMessage,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Twilio API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log(`SMS sent successfully to ${contact.name}:`, result.sid);
        
        results.push({
          contact: contact.name,
          phone: contact.phone,
          success: true,
          messageId: result.sid,
          status: result.status,
        });

      } catch (error) {
        console.error(`Failed to send SMS to ${contact.name}:`, error);
        results.push({
          contact: contact.name,
          phone: contact.phone,
          success: false,
          error: error.message,
        });
      }
    }

    // Count successful sends
    const successfulSends = results.filter(r => r.success).length;
    const totalContacts = results.length;

    return new Response(JSON.stringify({
      success: successfulSends > 0,
      message: `Emergency alerts sent to ${successfulSends}/${totalContacts} contacts`,
      results,
      timestamp,
      location: locationText,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in emergency SMS function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      message: 'Failed to send emergency SMS alerts'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});