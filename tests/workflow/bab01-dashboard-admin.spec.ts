import { NADIA_HOME } from '../../scripts/roles';
import { expect, test } from '../fixtures';

// Isi dengan teks widget/judul yang WAJIB ada di dashboard admin.
// Contoh: ['Total Surat Masuk', 'Surat Belum Dibaca']. Kosong = hanya cek generik.
const WIDGET_KRITIS: string[] = [];

const NADIA_URL = new URL('/u/f/nadia/', NADIA_HOME).toString();

test(
  'BAB01 Dashboard Admin menampilkan ringkasan dan grafik',
  { tag: ['@bab01', '@tier3', '@smoke'] },
  async ({ as }) => {
    const admin = await as('admin');

    // catat request data yang gagal selama test (termasuk dari dalam iframe)
    const failed: string[] = [];
    admin.on('response', (r) => {
      const type = r.request().resourceType();
      if (['xhr', 'fetch', 'document'].includes(type) && r.status() >= 400) {
        failed.push(`${r.status()} ${r.url()}`);
      }
    });

    await test.step('Admin: buka NADIA', async () => {
      await admin.goto(NADIA_URL);
      await admin.waitForLoadState('networkidle');

      // popup "Tutup" hanya diklik kalau muncul
      const tutup = admin.getByRole('button', { name: 'Tutup' });
      if (await tutup.isVisible({ timeout: 3000 }).catch(() => false)) await tutup.click();

      // tombol "Reload" dari rekaman: diklik hanya kalau ada
      const reload = admin.getByRole('button', { name: 'Reload' });
      if (await reload.isVisible({ timeout: 3000 }).catch(() => false)) await reload.click();
    });

    const nadia = admin.frameLocator('iframe');

    await test.step('Admin: masuk ke menu Dashboard', async () => {
      // ikon bisa ada di depan atau di belakang teks, jadi \W* di kedua sisi
      const dashboardLink = nadia.getByRole('link', { name: /^\W*Dashboard\W*$/ }).filter({ visible: true }).first();

      try {
        await dashboardLink.waitFor({ state: 'visible', timeout: 30000 });
      } catch {
        const ada = await nadia.getByRole('link').allInnerTexts().catch(() => [] as string[]);
        throw new Error(
          `Link "Dashboard" tidak ketemu di iframe. Link yang terbaca: ${JSON.stringify(ada.map((t) => t.trim()))}`,
        );
      }
      await dashboardLink.click();

      await expect(nadia.getByText('Dashboard Export PDF').first(), 'menu/halaman Dashboard tidak terbuka').toBeVisible({
        timeout: 30000,
      });
    });

    await test.step('Ringkasan tampil dan berisi angka', async () => {
      for (const teks of WIDGET_KRITIS) {
        await expect(nadia.getByText(teks).first(), `widget "${teks}" tidak tampil`).toBeVisible();
      }
      await expect(nadia.locator('body'), 'dashboard tidak berisi angka sama sekali').toContainText(/\d/);
    });

    await test.step('Grafik ter-render', async () => {
      await expect
        .poll(
          async () =>
            (
              await nadia.locator('canvas, svg').evaluateAll((els) =>
                els.map((e) => {
                  const r = e.getBoundingClientRect();
                  return r.width >= 150 && r.height >= 100; // abaikan ikon kecil
                }),
              )
            ).some(Boolean),
          { message: 'tidak ada grafik berukuran wajar yang ter-render', timeout: 20000 },
        )
        .toBe(true);
    });

    await test.step('Tidak ada request data yang gagal', async () => {
      expect(failed, `request gagal:\n${failed.join('\n')}`).toEqual([]);
    });
  },
);