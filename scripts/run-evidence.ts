import { spawnSync } from 'child_process';

// npm run test:evidence -- bab04 --project=workflow --workers=1
// set EVIDENCE=1 lintas OS (PowerShell tidak mendukung VAR=1 di depan perintah)
const r = spawnSync('npx', ['playwright', 'test', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, EVIDENCE: '1' },
});
process.exit(r.status ?? 1);
