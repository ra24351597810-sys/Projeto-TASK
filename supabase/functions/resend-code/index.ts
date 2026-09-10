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

async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return false;
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
        <span style="color:#34d399;font-size:42px;font-weight:bold;letter-spacing:12px;">${code}</span>
      </div>
      <p style="color:#a1a1aa;font-size:14px;line-height:1.5;margin:0;">
        Se você não criou uma conta no TaskFlow, pode ignorar este e-mail.
      </p>
    </div>
    <div style="padding:16px 32px 24px;border-top:1px solid #222;">
      <p style="color:#52525b;font-size:12px;margin:0;text-align:center;">
        TaskFlow - Gestão inteligente de tarefas
      </p>
    </div>
  </div>
</body>
</html>`;

  const textBody = `TaskFlow\n\nSeu código de verificação é: ${code}\n\nDigite este código na tela de verificação do TaskFlow para concluir seu cadastro.\n\nEste código expira em 10 minutos.\n\nSe você não criou uma conta no TaskFlow, pode ignorar este e-mail.`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: 'Seu código de verificação do TaskFlow',
        html,
        text: textBody,
      }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      console.error('Resend error:', res.status, errBody);
    }
    return res.ok;
  } catch (err) {
    console.error('Resend fetch failed:', err);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método não permitido.' }, 405);
  }

  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email) {
      return jsonResponse({ error: 'E-mail é obrigatório.' }, 400);
    }

    // Invalidate all previous unused codes for this email
    await supabaseAdmin
      .from('otp_codes')
      .update({ used: true })
      .eq('email', email)
      .eq('used', false);

    const code = generate6DigitCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: insertError } = await supabaseAdmin.from('otp_codes').insert({
      email,
      code,
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error('Failed to store OTP:', insertError.message);
      return jsonResponse({ error: 'Não foi possível gerar o código.' }, 500);
    }

    const sent = await sendVerificationEmail(email, code);
    if (!sent) {
      return jsonResponse({ error: 'Não foi possível enviar o e-mail.' }, 500);
    }

    return jsonResponse({ ok: 'true' });
  } catch {
    return jsonResponse({ error: 'Não foi possível enviar o código.' }, 400);
  }
});
