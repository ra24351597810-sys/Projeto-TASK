import { createClient } from 'npm:@supabase/supabase-js@2.57.4';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};


const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { autoRefreshToken: false, persistSession: false } },
);


const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL = 'TaskFlow <onboarding@resend.dev>';


function jsonResponse(body: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}


function generate6DigitCode(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += (bytes[i] % 10).toString();
  }
  return code;
}


async function sendVerificationEmail(email: string, code: string): Promise<{ ok: boolean; error: string }> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }


  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>TaskFlow - Código de Verificação</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#0a0a0a;margin:0;padding:40px 0;">
  <div style="max-width:480px;margin:0 auto;background:#111;border-radius:16px;overflow:hidden;border:1px solid #222;">
    <div style="background:#059669;padding:24px 32px;text-align:center;">
      <span style="color:#fff;font-size:20px;font-weight:bold;">TaskFlow</span>
    </div>
    <div style="padding:32px;">
      <h1 style="color:#fff;font-size:22px;margin:0 0 16px 0;">Seu código de verificação</h1>
      <p style="color:#a1a1aa;font-size:15px;line-height:1.5;margin:0 0 24px 0;">
        Use o código abaixo para concluir seu cadastro no TaskFlow. Este código expira em 10 minutos.
      </p>
      <div style="background:#1a1a1a;border:1px solid #27272a;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px 0;">