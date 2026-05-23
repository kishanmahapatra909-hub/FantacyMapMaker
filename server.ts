import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import compression from 'compression';

// Define standard ES Module path utilities
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // This points directly to the 'dist' folder in production!

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API placeholder
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      name: 'Fantasy Game Board Maker API',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Client Static Files + Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // CRITICAL FIX: Since this server file is built into /dist, 
    // __dirname already represents the /dist folder itself.
    app.use(express.static(__dirname));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    });
  }

  // CRITICAL FIX: Remove '0.0.0.0' to let Hostinger naturally proxy route the port mapping
  app.listen(Number(port), () => {
    console.log(`Server running safely on port ${port}`);
  });
}

startServer();