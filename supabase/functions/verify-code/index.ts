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


function jsonResponse(body: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
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
    const code = typeof body.code === 'string' ? body.code.trim() : '';


    if (!email || !code) {
      return jsonResponse({ error: 'E-mail e código são obrigatórios.' }, 400);
    }


    if (!/^\d{6}$/.test(code)) {
      return jsonResponse({ error: 'Código inválido. Digite os 6 dígitos.' }, 400);
    }


    const { data, error } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();


    if (error) {
      console.error('DB error:', error.message);
      return jsonResponse({ error: 'Não foi possível verificar o código.' }, 500);
    }


    if (!data) {
      return jsonResponse({ error: 'Nenhum código ativo encontrado. Solicite um novo código.' }, 400);
    }


    if (new Date(data.expires_at) < new Date()) {
      await supabaseAdmin.from('otp_codes').update({ used: true }).eq('id', data.id);
      return jsonResponse({ error: 'Código expirado. Solicite um novo código.' }, 400);