import { chromium, Frame } from '@playwright/test';
import 'dotenv/config';
import fs from 'fs';
import readline from 'readline';
import { authFile, NADIA_HOME } from './roles';

// Pakai : npx tsx scripts/dump-page.ts <role> <nama-dump> [--html]
// Contoh: npx tsx scripts/dump-page.ts admin bab02
// Klik manual sampai halaman target tampil (popup boleh), lalu tekan Enter di terminal.
// Output: playwright/.auth/dump-<role>-<nama>.txt (folder ini di-gitignore; jangan di-commit).
// SEBELUM dikirim: ganti nama orang, NIK, email, dan angka sensitif.
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const withHtml = process.argv.includes('--html');
const slug = args[0] ?? 'staff';
const name = args[1] ?? 'halaman';
if (!fs.existsSync(authFile(slug))) throw new Error(`${authFile(slug)} belum ada, jalankan: npm run auth -- ${slug}`);

const waitEnter = (q: string) =>
  new Promise<void>((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(q, () => {
      rl.close();
      resolve();
    });
  });

async function dumpFrame(f: Frame, depth: number, htmlFiles: string[]): Promise<string> {
  const pad = '  '.repeat(depth);
  let out = `${pad}### FRAME name="${f.name()}" url=${f.url()}\n`;
  try {
    const tree = await f.locator('body').ariaSnapshot({ timeout: 10000 });
    out += tree.split('\n').map((l) => pad + l).join('\n') + '\n';
  } catch (e) {
    out += `${pad}(gagal dump: ${(e as Error).message.split('\n')[0]})\n`;
  }
  if (withHtml) {
    const file = `playwright/.auth/dump-${slug}-${name}-frame${htmlFiles.length}.html`;
    fs.writeFileSync(file, await f.content().catch(() => '(gagal baca HTML)'));
    htmlFiles.push(file);
    out += `${pad}(HTML: ${file})\n`;
  }
  for (const child of f.childFrames()) out += await dumpFrame(child, depth + 1, htmlFiles);
  return out;
}

async function main() {
  fs.mkdirSync('playwright/.auth', { recursive: true });
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ storageState: authFile(slug) });
  const page = await context.newPage();
  await page.goto(NADIA_HOME, { waitUntil: 'domcontentloaded' });

  await waitEnter('\nKlik manual sampai halaman target tampil (popup juga boleh), lalu tekan Enter di sini... ');

  const htmlFiles: string[] = [];
  let out = `# dump ${slug}/${name} @ ${new Date().toISOString()}\n`;
  for (const [i, p] of context.pages().entries()) {
    out += `\n===== PAGE ${i} url=${p.url()} title="${await p.title().catch(() => '')}"\n`;
    out += await dumpFrame(p.mainFrame(), 0, htmlFiles);
  }
  const file = `playwright/.auth/dump-${slug}-${name}.txt`;
  fs.writeFileSync(file, out);
  console.log(`\nTersimpan: ${file}${htmlFiles.length ? ` (+ ${htmlFiles.length} file HTML)` : ''}`);
  await browser.close();
}

main();