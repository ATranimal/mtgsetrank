export async function onRequest(context) {
  const url = new URL(context.request.url);
  const key = url.pathname.replace(/^\/images\//, '');

  // Check Cloudflare's edge cache first
  const cache = caches.default;
  const cached = await cache.match(context.request);
  if (cached) return cached;

  const object = await context.env.IMAGES_BUCKET.get(key);
  if (!object) return new Response('Not Found', { status: 404 });

  const response = new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });

  context.waitUntil(cache.put(context.request, response.clone()));
  return response;
}
