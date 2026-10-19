import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Zacma Technology Training Center API',
      timestamp: new Date().toISOString(),
      firebaseConfigured: true,
    });
  });

  // Privileged Staff Account Promotion endpoint
  app.post('/api/admin/promote-role', async (req, res) => {
    try {
      const { targetUid, newRole, requesterEmail } = req.body;
      const allowedRoles = ['student', 'teacher', 'secretary', 'accountant', 'admin', 'super_admin'];

      if (!targetUid || !newRole || !allowedRoles.includes(newRole)) {
        return res.status(400).json({ error: 'Invalid UID or role specified' });
      }

      // Check that requester is authorized (Super Admin or authorized admin email)
      const authorizedEmails = ['zekimuluken@gmail.com', 'superadmin@zacma.tech', 'admin@zacma.tech'];
      const isAuthorizedAdmin = authorizedEmails.includes(requesterEmail?.toLowerCase());
      if (!isAuthorizedAdmin) {
        return res.status(403).json({ error: 'Forbidden: Only Super Administrator can promote user roles' });
      }

      res.json({
        success: true,
        message: `Successfully verified promotion of user ${targetUid} to role ${newRole}`,
        targetUid,
        newRole,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
