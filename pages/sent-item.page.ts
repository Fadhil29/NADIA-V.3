import { expect, Page } from '@playwright/test';
import { bukaMenu, nadia, reloadNadia, T, tutupWizard, waitForNadia } from './nadia-shell';

export type ItemSent = { docno: string; jenis: string };

// segmen terakhir href baris Sent Item = base64 dari No. Document
export const docnoDariHref = (href: string) => {
  const seg = decodeURIComponent(href.split('?')[0].split('/').pop() ?? '');
  try {
    return Buffer.from(seg, 'base64').toString('utf8').trim();
  } catch {
    return '';
  }
};

// Halaman Sent Item. Kalau nanti Sent Item dipecah jadi beberapa tab, ubah buka() saja.
export class SentItemPage {
  constructor(private readonly page: Page) {}

  private get app() {
    return nadia(this.page);
  }

  readonly kolomCari = () => this.app.locator('.dataTables_filter input, .dt-search input').first();
  readonly baris = () => this.app.locator('table tbody tr');

  async buka() {
    await bukaMenu(this.page, 'Sent Item');
  }

  // cari No. Document lewat search bar: tunggu 1,5 dtk; kalau belum muncul, refresh lalu ketik ulang
  async cari(docno: string, percobaan = 3) {
    for (let i = 1; i <= percobaan; i++) {
      if (i > 1) {
        await reloadNadia(this.page);
        await waitForNadia(this.page);
      }
      await this.buka();
      await tutupWizard(this.page);
      await expect(this.kolomCari(), 'search bar Sent Item tidak ditemukan').toBeVisible(T);
      await this.kolomCari().fill(docno);
      const hasil = this.baris().filter({ hasText: docno }).first();
      if (await hasil.waitFor({ timeout: 1500 }).then(() => true, () => false)) return;
    }
    throw new Error(`${docno} tidak ditemukan di Sent Item setelah ${percobaan}x cari (refresh di antaranya)`);
  }

  // No. Document + jenis dokumen dari baris teratas. Link pertama baris berisi "<jenis> - <tujuan>"
  async daftar(maks = 25): Promise<ItemSent[]> {
    await this.buka();
    await tutupWizard(this.page);
    const baris = this.baris();
    await baris.first().locator('a[href*="nadiadev"]').first().waitFor({ timeout: 20000 }).catch(() => {});
    const hasil: ItemSent[] = [];
    const n = Math.min(await baris.count(), maks);
    for (let i = 0; i < n; i++) {
      const link = baris.nth(i).locator('a[href*="nadiadev"]').first();
      if (!(await link.count())) continue;
      const docno = docnoDariHref((await link.getAttribute('href')) ?? '');
      const jenis = (await link.innerText()).split(' - ')[0].trim();
      if (/^[A-Z]+\.[\w.]*\d+\/.+/.test(docno) && !docno.startsWith('DISP.') && !hasil.some((h) => h.docno === docno)) {
        hasil.push({ docno, jenis });
      }
    }
    return hasil;
  }
}
