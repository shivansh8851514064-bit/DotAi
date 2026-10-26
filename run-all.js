import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let clientDir = path.resolve(__dirname, 'client');
let serverDir = path.resolve(__dirname, 'server');

if (!fs.existsSync(clientDir)) {
  clientDir = path.resolve(__dirname, 'contract-extractor-main', 'client');
  serverDir = path.resolve(__dirname, 'contract-extractor-main', 'server');
}

const isWindows = process.platform === 'win32';

function freePort(port) {
  try {
    if (isWindows) {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0' && pid !== `${process.pid}`) {
            try {
              execSync(`taskkill /F /PID ${pid} /T`, { stdio: 'ignore' });
            } catch (_) {}
          }
        }
      }
    }
  } catch (_) {}
}

// Clean up any stale processes occupying project ports
freePort(8000);
freePort(5173);

console.log('='.repeat(60));
console.log(' 🚀 Starting NLP Contract Extractor Full Stack');
console.log('='.repeat(60));
console.log(` 📂 Client Directory: ${clientDir}`);
console.log(` 📂 Server Directory: ${serverDir}\n`);

const backendCmd = 'python';
const backendArgs = ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'];

const backendEnv = {
  ...process.env,
  PYTHONIOENCODING: 'utf-8',
  PYTHONUTF8: '1'
};

const backend = spawn(backendCmd, backendArgs, {
  cwd: serverDir,
  shell: true,
  stdio: 'inherit',
  env: backendEnv
});

const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: clientDir,
  shell: true,
  stdio: 'inherit'
});

function cleanup() {
  console.log('\n🛑 Shutting down backend & frontend servers...');
  if (isWindows) {
    if (backend && backend.pid) {
      try { spawn('taskkill', ['/pid', backend.pid.toString(), '/f', '/t'], { stdio: 'ignore' }); } catch (_) {}
    }
    if (frontend && frontend.pid) {
      try { spawn('taskkill', ['/pid', frontend.pid.toString(), '/f', '/t'], { stdio: 'ignore' }); } catch (_) {}
    }
    freePort(8000);
    freePort(5173);
  } else {
    try { backend.kill(); } catch (_) {}
    try { frontend.kill(); } catch (_) {}
  }
}

process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});
