import express from 'express';
import { createApiApp } from './createApp';

/**
 * Vercel catch-all (`api/[...path].cjs`) may pass the original URL
 * (`/api/calendar/availability?...`) or only the remainder (`/calendar/availability?...`).
 * Routes in createApiApp always include the /api prefix.
 */
export function toApiPath(url: string): string {
  const queryIndex = url.indexOf('?');
  const path = queryIndex === -1 ? url : url.slice(0, queryIndex);
  const query = queryIndex === -1 ? '' : url.slice(queryIndex + 1);
  const params = new URLSearchParams(query);
  const forwarded = params.get('__path');

  if (forwarded) {
    params.delete('__path');
    const clean = forwarded.replace(/^\/+/, '').replace(/^api\//, '').split('?')[0];
    const rest = params.toString();
    return `/api/${clean}${rest ? `?${rest}` : ''}`;
  }

  if (path === '/api' || path.startsWith('/api/')) {
    return url;
  }

  const withSlash = path.startsWith('/') ? path : `/${path}`;
  const rest = params.toString();
  return `/api${withSlash}${rest ? `?${rest}` : ''}`;
}

const api = createApiApp();
const handler = express();

handler.use((req, _res, next) => {
  req.url = toApiPath(req.url || '/');
  next();
});

handler.use(api);

export default handler;
