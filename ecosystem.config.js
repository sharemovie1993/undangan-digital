const fs = require('fs');
const path = require('path');

// Helper to read and parse a .env file dynamically
function readEnv(filePath) {
  const env = {};
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const firstEqual = trimmed.indexOf('=');
          if (firstEqual > 0) {
            const key = trimmed.substring(0, firstEqual).trim();
            let val = trimmed.substring(firstEqual + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.substring(1, val.length - 1);
            }
            env[key] = val;
          }
        }
      });
    }
  } catch (err) {
    console.error(`[PM2 Ecosystem] Error reading env file at ${filePath}:`, err);
  }
  return env;
}

// Load backend .env configuration
const backendEnv = readEnv(path.join(__dirname, 'backend', '.env'));
const backendPort = process.env.PORT || backendEnv.PORT || '4001';

console.log('\x1b[36m==================================================\x1b[0m');
console.log('\x1b[33m   ✨  LUXURY DIGITAL INVITATION PLATFORM  ✨   \x1b[0m');
console.log('\x1b[36m==================================================\x1b[0m');
console.log(` 🌐 Backend API : \x1b[35mhttp://localhost:${backendPort}\x1b[0m`);
console.log(` 🏛️  Deploy Mode : \x1b[32m${backendEnv.DEPLOY_SCENARIO || 'Hybrid / SaaS Ready'}\x1b[0m`);
console.log('\x1b[36m==================================================\x1b[0m\n');

module.exports = {
  apps: [
    {
      name: 'undangan-backend',
      script: 'dist/server.js',
      cwd: path.join(__dirname, 'backend'),
      instances: 1,
      exec_mode: 'fork',
      windowsHide: true,
      max_restarts: 10,
      restart_delay: 4000,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
        PORT: backendPort,
        ...backendEnv
      },
      watch: false
    }
  ]
};
