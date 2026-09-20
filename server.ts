import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createApiApp } from './server/createApp';

const app = createApiApp();

// Vercel detects this default export and runs Express as a serverless function.
// Do NOT call app.listen() on Vercel.
export default app;

async function startLocalServer() {
  if (process.env.ALLOW_INSECURE_TLS === '1') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.warn('[dev] ALLOW_INSECURE_TLS=1 — verificación TLS desactivada');
  }

  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    // Dynamic import so Vercel serverless never loads Vite
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'public');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only boot the local Node server outside Vercel
if (!process.env.VERCEL) {
  startLocalServer().catch((err) => {
    console.error('Failed to start local server:', err);
    process.exit(1);
  });
}
