import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { registerRoutes } from './server/routes';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // All CareSync + ServiceNow API routes.
  registerRoutes(app);

  // Vite middleware in dev; static dist in prod.
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log('=======================================================');
    console.log(' CareSync · Clinical Orchestration Portal');
    console.log(` Server active on http://localhost:${PORT}`);
    console.log('=======================================================');
  });
}

startServer();
