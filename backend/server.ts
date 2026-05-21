import 'dotenv/config';

import http from 'http';
import app from './src/app.ts';

const PORT = process.env.PORT || 3100;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`[server] Listening on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`);
});

// ── Graceful shutdown ────────────────────────────────────────────────────────

function shutdown(signal: string) {
  console.log(`[server] ${signal} received — shutting down gracefully`);
  server.close(() => {
    console.log('[server] HTTP server closed');
    process.exit(0);
  });
  // Force exit if shutdown hangs beyond 10 s
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled rejection:', reason);
  server.close(() => process.exit(1));
});