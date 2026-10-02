type NodeHandler = (req: unknown, res: unknown) => unknown;

export async function runNodeHandler(request: Request, handler: NodeHandler) {
  const url = new URL(request.url);
  let statusCode = 200;
  let payload: unknown = null;

  const req = {
    url: `${url.pathname}${url.search}`,
    query: Object.fromEntries(url.searchParams.entries()),
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: undefined as unknown,
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      req.body = await request.json();
    } catch {
      req.body = {};
    }
  }

  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(body: unknown) {
      payload = body;
    },
  };

  await handler(req, res);
  return Response.json(payload, { status: statusCode });
}
