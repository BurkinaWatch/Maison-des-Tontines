const API_ORIGIN = "http://127.0.0.1:4000";

async function proxyToApi(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const headers = new Headers(request.headers);

  headers.delete("host");
  headers.delete("x-forwarded-for");
  headers.delete("x-forwarded-host");
  headers.delete("x-forwarded-proto");

  try {
    const response = await fetch(`${API_ORIGIN}${requestUrl.pathname}${requestUrl.search}`, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer(),
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("connection");
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("transfer-encoding");

    return new Response(await response.arrayBuffer(), {
      status: response.status,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      { message: "Le service de vérification est temporairement indisponible. Réessayez dans un instant." },
      { status: 502 }
    );
  }
}

export const GET = proxyToApi;
export const POST = proxyToApi;
export const PUT = proxyToApi;
export const PATCH = proxyToApi;
export const DELETE = proxyToApi;
export const OPTIONS = proxyToApi;