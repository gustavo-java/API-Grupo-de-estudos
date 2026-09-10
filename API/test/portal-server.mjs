// Disposable database and uploads: never reads or mutates the configured project DB.
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { readFile, readdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const db = await PGlite.create();
for (const name of (await readdir('prisma/migrations')).sort()) {
  if (name === 'migration_lock.toml') continue;
  await db.exec(
    await readFile(`prisma/migrations/${name}/migration.sql`, 'utf8'),
  );
}
const socket = new PGLiteSocketServer({
  db,
  host: '127.0.0.1',
  port: 55432,
  maxConnections: 10,
});
await socket.start();
const uploads = await mkdtemp(join(tmpdir(), 'nexo-test-uploads-'));
const server = spawn(process.execPath, ['dist/src/main.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: '3100',
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:55432/postgres',
    JWT_SECRET: 'isolated-test-secret-only-for-this-disposable-database',
    UPLOAD_DIR: uploads,
  },
});
let closing = false;
async function close() {
  if (closing) return;
  closing = true;
  server.kill('SIGTERM');
  await socket.stop();
  await db.close();
  await rm(uploads, { recursive: true, force: true });
  process.exit(0);
}
process.on('SIGINT', close);
process.on('SIGTERM', close);
server.on('exit', (code) => {
  if (!closing) {
    console.error(`Test API exited: ${code}`);
    void close();
  }
});
