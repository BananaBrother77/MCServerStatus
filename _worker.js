export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    console.log('PATH:', url.pathname);
    console.log('AUTH_SECRET defined:', !!env.AUTH_SECRET);
    const cookie = request.headers.get('Cookie') || '';
    console.log('COOKIE:', cookie);

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

    if (url.pathname.startsWith('/login')) {
      return env.ASSETS.fetch(request);
    }

    const cookie2 = request.headers.get('Cookie') || '';
    if (!cookie2.includes(`auth_token=${env.AUTH_SECRET}`)) {
      return Response.redirect(new URL('/login/login.html', request.url), 302);
    }

    return env.ASSETS.fetch(request);
  },
};
