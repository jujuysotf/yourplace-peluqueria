import express from 'express';
import { createApiApp } from './createApp';

/**
 * Vercel rewrites /api/* to this function. Depending on the runtime, Express
 * sees either the original path or /api/index?__path=... from vercel.json.
 */
function rewriteVercelApiUrl(url: string): string {
  const queryIndex = url.indexOf('?');
  const query = queryIndex === -1 ? '' : url.slice(queryIndex + 1);
  const params = new URLSearchParams(query);
  const forwarded = params.get('__path');
  if (!forwarded) {
    return url;
  }

  params.delete('__path');
  const clean = forwarded.replace(/^\/+/, '').replace(/^api\//, '').split('?')[0];
  const rest = params.toString();
  return `/api/${clean}${rest ? `?${rest}` : ''}`;
}

const api = createApiApp();
const handler = express();

handler.use((req, _res, next) => {
  req.url = rewriteVercelApiUrl(req.url || '/');
  next();
});

handler.use(api);

export default handler;
