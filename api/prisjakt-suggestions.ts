export const config = { runtime: 'edge' };

export default async function handler(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) return new Response('Missing q', { status: 400 });

  const upstream = await fetch(
    `https://www.prisjakt.no/api/search-suggestions?q=${encodeURIComponent(q)}`
  );

  const data = await upstream.text();
  return new Response(data, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
