const apiOrigin = process.env.API_PROXY_URL || "http://127.0.0.1:4000";
const forwardedRequestHeaders = ["accept", "authorization", "content-type"] as const;
const forwardedResponseHeaders = ["cache-control", "content-type"] as const;

async function proxyApiRequest(request: Request): Promise<Response> {
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, apiOrigin);
  const headers = new Headers();

  for (const name of forwardedRequestHeaders) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      ...(hasBody ? { body: await request.arrayBuffer() } : {}),
    });
  } catch {
    return new Response(
      JSON.stringify({
        message: "Le service est temporairement indisponible. Réessaie dans un instant.",
      }),
      {
        status: 503,
        headers: { "content-type": "application/json; charset=utf-8" },
      }
    );
  }

  const responseHeaders = new Headers();
  for (const name of forwardedResponseHeaders) {
    const value = upstreamResponse.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  const responseBody =
    request.method === "HEAD" || upstreamResponse.status === 204
      ? null
      : await upstreamResponse.arrayBuffer();

  return new Response(responseBody, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export const GET = proxyApiRequest;
export const POST = proxyApiRequest;
export const PUT = proxyApiRequest;
export const PATCH = proxyApiRequest;
export const DELETE = proxyApiRequest;
export const HEAD = proxyApiRequest;