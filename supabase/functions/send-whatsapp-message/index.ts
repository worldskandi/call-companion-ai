import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { 
      to, 
      message, 
      template_name,
      template_language = 'de',
      template_components,
      phone_number_id 
    } = await req.json();

    if (!to) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone number (to) is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's WhatsApp integration
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: integration, error: integrationError } = await supabaseAdmin
      .from('user_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'whatsapp_business')
      .eq('is_active', true)
      .single();

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'WhatsApp Business not connected. Please connect your WhatsApp Business account in settings.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token is expired
    if (integration.token_expires_at && new Date(integration.token_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'WhatsApp token expired. Please reconnect your WhatsApp Business account.' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get WhatsApp Business Account Phone Number ID from metadata or use provided one
    const metadata = integration.metadata as { phone_number_id?: string; waba_id?: string } | null;
    const whatsappPhoneNumberId = phone_number_id || metadata?.phone_number_id;

    if (!whatsappPhoneNumberId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'WhatsApp Phone Number ID not configured. Please set up your WhatsApp Business phone number.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number (remove + and spaces)
    const formattedPhone = to.replace(/[^\d]/g, '');

    // Build message payload
    let messagePayload: Record<string, unknown>;

    if (template_name) {
      // Send template message
      messagePayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'template',
        template: {
          name: template_name,
          language: { code: template_language },
          ...(template_components && { components: template_components }),
        },
      };
    } else if (message) {
      // Send text message
      messagePayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'text',
        text: { 
          preview_url: true,
          body: message 
        },
      };
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Either message or template_name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send message via WhatsApp Cloud API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${whatsappPhoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${integration.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', data);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.error?.message || 'Failed to send WhatsApp message',
          details: data.error
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('WhatsApp message sent successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message_id: data.messages?.[0]?.id,
        contacts: data.contacts
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error sending WhatsApp message:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
