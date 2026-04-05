export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle login POST request
    if (url.pathname === '/login' && request.method === 'POST') {
      const body = await request.json();

      if (body.password === env.SITE_PASSWORD) {
        return new Response(JSON.stringify({ ok: true }), {
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': `auth_token=${env.AUTH_SECRET}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`,
          },
        });
      }

      return new Response(JSON.stringify({ ok: false }), { status: 401 });
    }

    // Allow login page through without auth check
    if (url.pathname.startsWith('/login')) {
      return env.ASSETS.fetch(request);
    }

    // Protect everything else
    const cookie = request.headers.get('Cookie') || '';
    if (!cookie.includes(`auth_token=${env.AUTH_SECRET}`)) {
      return Response.redirect(new URL('/login/login.html', request.url), 302);
    }

    return env.ASSETS.fetch(request);
  },
};
