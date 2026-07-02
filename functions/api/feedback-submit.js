const rateLimitMap = new Map();

function checkRateLimit(ip) {
  if (!ip) return false;

  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (entry && now - entry.reset < 600000) {
    entry.count++;
    return entry.count > 3;
  }

  rateLimitMap.set(ip, { count: 1, reset: now });
  return false;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const data = await request.json();

  const ip =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For') ||
    '';

  if (checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Too many submissions. Please try again later.',
      }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const siteverify = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: env.CLOUDFLARE_SECRET_KEY,
        response: data.cfToken,
        remoteip: ip,
      }),
    },
  );

  const outcome = await siteverify.json();

  if (!outcome.success) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Captcha verification failed' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const embed = {
    title: `New Feedback — ${data.category}`,
    color: 0x7c58cc,
    fields: [
      {
        name: 'Rating',
        value: '⭐'.repeat(data.rating) + '☆'.repeat(5 - data.rating),
        inline: true,
      },
      {
        name: 'Feedback',
        value: truncate(data.feedback, 1024),
      },
      {
        name: 'Contact',
        value: data.contact || '—',
        inline: true,
      },
      {
        name: 'IP Address',
        value: `||${ip}||`,
        inline: true,
      },
    ],
    footer: {
      text: 'MCToolkit Feedback',
    },
    timestamp: new Date().toISOString(),
  };

  const threadName = `Feedback — ${data.category}`;

  const discordRes = await fetch(env.DISCORD_FEEDBACK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ thread_name: threadName, embeds: [embed] }),
  });

  if (!discordRes.ok) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Discord webhook failed' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

function truncate(str, max = 1024) {
  if (!str) return '—';
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
}
