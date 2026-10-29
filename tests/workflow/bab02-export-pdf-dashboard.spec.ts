import { NADIA_HOME } from '../../scripts/roles';
import { expect, test } from '../fixtures';
import { nadia, waitForNadia } from '../helpers/nav';

// BAB 2 - Export PDF Dashboard | aktor: admin
// Dari dump-page.ts (29/10/2026): "Export PDF" membuka POPUP dengan URL blob: yang dirender viewer PDF bawaan Chrome.
// Viewer itu bukan bagian NADIA (nama iframe-nya hash dinamis dan tombol download ada di toolbar Chrome),
// jadi yang dites adalah ISI blob-nya: harus PDF yang valid dan tidak kosong, bukan DOM viewer.
// BELUM DIUJI di staging. Catatan: viewer PDF hanya ada di Chrome headed; di headless navigasi PDF bisa jadi download.
test('BAB02 Export PDF Dashboard: popup membuka PDF yang valid', { tag: ['@bab02', '@tier3'] }, async ({ as }) => {
  const admin = await as('admin');
  await admin.goto(NADIA_HOME);
  await waitForNadia(admin);
  const app = nadia(admin);
  await expect(app.getByRole('heading', { name: 'Total Document', exact: true })).toBeVisible({ timeout: 20000 });

  // TODO(manual langkah 2-5): pilih Location dan Periode, klik "Filter" sebelum export. Rekam kondisinya dengan dump-page.ts.

  const popupPromise = admin.waitForEvent('popup', { timeout: 30000 });
  await app.getByRole('link', { name: /Export PDF/ }).click();
  const popup = await popupPromise;

  await expect
    .poll(() => popup.url(), { message: 'popup harus berisi blob: hasil export', timeout: 30000 })
    .toMatch(/^blob:https?:\/\//);

  const pdf = await popup.evaluate(async (url) => {
    const res = await fetch(url);
    const bytes = new Uint8Array(await res.arrayBuffer());
    return { size: bytes.length, magic: String.fromCharCode(...Array.from(bytes.slice(0, 5))) };
  }, popup.url());

  expect(pdf.magic, 'isi popup bukan PDF').toBe('%PDF-');
  expect(pdf.size, 'PDF kosong').toBeGreaterThan(1024);
  // TODO: isi PDF ("Dashboard Report", periode sesuai filter) butuh parser PDF (mis. pdf-parse). Belum ditambah, perlu persetujuan nambah dependency.
  await popup.close();
});
