import { FrameLocator } from '@playwright/test';
import { NADIA_HOME } from '../../scripts/roles';
import { expect, test } from '../fixtures';
import { nadia, waitForNadia } from '../helpers/nav';

// BAB 1 - Dashboard Admin | aktor: admin
// Selector dari scripts/dump-page.ts (29/10/2026). Angka TIDAK di-hardcode karena data dev berubah-ubah:
// yang dicek adalah komponen tampil dan angka konsisten antar widget. Isi chart/peta belum punya oracle.
const T = { timeout: 20000 };

// angka berformat "29.891" (id) atau "2,322" (en): ambil digitnya saja
const digits = (s: string | null | undefined) => Number((s ?? '').replace(/[^\d]/g, ''));

const heading = (app: FrameLocator, name: string) => app.getByRole('heading', { name, exact: true }); // exact: "Total Document" != "Total Documents"
// nilai kartu = <h1> berikutnya setelah judul kartu (urutan DOM = urutan pohon aksesibilitas)
const valueAfter = (app: FrameLocator, name: string) => heading(app, name).locator('xpath=following::h1[1]');
// nilai per bulan = <h2> terdekat sebelum nama bulan
const monthValue = (app: FrameLocator, month: string) => heading(app, month).locator('xpath=preceding::h2[1]');

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

test('BAB01 Dashboard Admin menampilkan ringkasan dan grafik', { tag: ['@bab01', '@tier3'] }, async ({ as }) => {
  const admin = await as('admin');
  await admin.goto(NADIA_HOME);
  await waitForNadia(admin);
  const app = nadia(admin);

  // komponen yang disebut manual BAB 1
  const headings = [
    'Total Document', 'Archive Destruction', 'Letter In', 'Letter Out', 'User NADIA',
    'Total User', 'Total Documents', 'Document Type', 'Documents Per Month', 'Top 5 Unit Backdate', 'Document Digital/Manual',
  ];
  for (const name of headings) await expect.soft(heading(app, name), `heading "${name}"`).toBeVisible(T);
  await expect.soft(app.getByText('Active and Inactive Archives'), 'ringkasan Active/Inactive Archives').toBeVisible(T);
  await expect.soft(app.getByRole('img', { name: 'Indonesia Map' }), 'peta sebaran').toBeVisible(T);
});

test('BAB01 angka antar widget konsisten', { tag: ['@bab01', '@tier3'] }, async ({ as }) => {
  const admin = await as('admin');
  await admin.goto(NADIA_HOME);
  await waitForNadia(admin);
  const app = nadia(admin);
  await expect(heading(app, 'Total Document')).toBeVisible(T);

  const total = digits(await valueAfter(app, 'Total Document').textContent(T));
  const active = digits(await valueAfter(app, 'Active Archives').textContent(T));
  const inactive = digits(await valueAfter(app, 'Inactive Archives').textContent(T));
  expect(total, 'Total Document 0: data dashboard kosong, test ini tidak bermakna').toBeGreaterThan(0);

  // CATATAN: invarian ini terbukti benar di snapshot 29/10 pada filter default (HO, periode tahun berjalan).
  // Kalau gagal, cek dulu apakah aturannya memang begitu sebelum menganggap bug.
  expect(active + inactive, 'Active + Inactive Archives harus = Total Document').toBe(total);

  let perBulan = 0;
  for (const m of MONTHS) perBulan += digits(await monthValue(app, m).textContent(T));
  expect(perBulan, 'jumlah 12 bulan pada Documents Per Month harus = Total Document').toBe(total);
  // TODO: Document Digital/Manual (digital + manual = total) setelah selector kontainernya dari dump --html
});
