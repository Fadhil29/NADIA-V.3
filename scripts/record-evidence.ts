import { chromium } from '@playwright/test';
import 'dotenv/config';
import fs from 'fs';
import { createInterface } from 'readline/promises';
import { authFile, NADIA_HOME, SSO_LOGIN_URL } from './roles';
import { bacaManifest, hariIni, keyOf, simpanManifest, simpanVideo, Status } from './evidence-store';
import { UAT_PREFIX } from '../tests/helpers/uat';

// rekam evidence case UAT yang dijalankan manual
// npm run evidence -- "Copy Source" CS-05 divhead
// role "tanpa-login" untuk case yang dimulai dari halaman login (Login Refuse)
async function main() {
  const [sheet, id, role] = process.argv.slice(2);
  if (!sheet || !id || !role) {
    console.log('Pakai: npm run evidence -- "<nama sheet>" <CASE ID> <role|tanpa-login>');
    console.log('Sheet:', Object.keys(UAT_PREFIX).join(', '));
    process.exit(1);
  }
  if (!(sheet in UAT_PREFIX)) throw new Error(`sheet "${sheet}" tidak dikenal. Pilihan: ${Object.keys(UAT_PREFIX).join(', ')}`);
  const tanpaLogin = role === 'tanpa-login';
  if (!tanpaLogin && !fs.existsSync(authFile(role))) throw new Error(`session ${role} belum ada, jalankan: npm run auth -- ${role}`);

  const tmp = fs.mkdtempSync('test-results/evidence-');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    ...(tanpaLogin ? {} : { storageState: authFile(role) }),
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: tmp, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  await page.goto(tanpaLogin ? SSO_LOGIN_URL : NADIA_HOME);

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  console.log(`\nMerekam ${sheet} / ${id} sebagai ${role}. Jalankan langkah test di browser.`);
  await rl.question('Tekan Enter kalau sudah selesai...');
  const jawab = (await rl.question('Hasil? [p]ass / [f]ail: ')).trim().toLowerCase();
  const catatan = (await rl.question('Actual result / catatan (opsional): ')).trim();
  rl.close();

  const status: Status = jawab.startsWith('f') ? 'FAIL' : 'PASS';
  const video = page.video();
  await context.close();
  await browser.close();
  // judul skenario dari uat/cases.json (hasil uat:prepare), kalau ada
  let judul = '';
  try {
    const cases: { sheet: string; id: string; scenario: string }[] = JSON.parse(fs.readFileSync('uat/cases.json', 'utf8'));
    judul = cases.find((c) => c.sheet === sheet && c.id === id)?.scenario ?? '';
  } catch {}
  const file = simpanVideo(await video!.path(), sheet, id, role, status, judul);
  fs.rmSync(tmp, { recursive: true, force: true });

  // case lintas role direkam per role: rekaman di hari yang sama digabung ke entri yang sama
  const data = bacaManifest();
  const key = keyOf(sheet, id);
  const lama = data[key];
  if (lama && lama.sumber === 'manual' && lama.tanggal === hariIni()) {
    lama.files.push(file);
    if (!lama.roles.includes(role)) lama.roles.push(role);
    if (status === 'FAIL') lama.status = 'FAIL';
    if (catatan) lama.catatan = [lama.catatan, `${role}: ${catatan}`].filter(Boolean).join('\n');
  } else {
    data[key] = { sheet, id, status, tanggal: hariIni(), roles: [role], files: [file], sumber: 'manual', ...(catatan ? { catatan } : {}) };
  }
  simpanManifest(data);
  console.log(`Tersimpan: evidence/${file} (${status})`);
}

main();
