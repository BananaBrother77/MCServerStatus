export async function onRequest(context) {
  const { request, next, env } = context;
  const response = await next();

  if (response.status === 404) {
    const url = new URL(request.url);
    const notFoundRes = await env.ASSETS.fetch(new Request(`${url.origin}/404`, request));
    return new Response(await notFoundRes.text(), { status: 404, headers: { 'Content-Type': 'text/html' } });
  }

  return response;
}
