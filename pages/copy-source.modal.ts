import { expect, Page } from '@playwright/test';
import { nadia, T } from './nadia-shell';

// endpoint pencarian Copy Source (observasi 30/10)
export const ENDPOINT_CARI = '/documentSearchCopySource';

// penolakan karena hak akses (dokumen bukan milik user), bukan karena aturan yang sedang diuji
export const tolakAkses = (pesan: string) => /do not have access/i.test(pesan);

// Modal Copy Source di form Compose (#addSource) + popup pesan (SweetAlert)
export class CopySourceModal {
  constructor(private readonly page: Page) {}

  private get app() {
    return nadia(this.page);
  }

  readonly tombolBuka = () => this.app.getByRole('button', { name: /Copy Source\s*$/ });
  readonly modal = () => this.app.locator('#addSource');
  // label input beda antar form (Nota Dinas: "Input Doc Number"), jadi dicari di dalam modal
  readonly inputDocno = () =>
    this.modal()
      .getByRole('textbox', { name: 'Input Doc Number' })
      .or(this.modal().locator('input[type="text"], input:not([type])').filter({ visible: true }))
      .first();
  readonly tombolSearch = () => this.modal().getByRole('button', { name: /Search\s*$/ });
  readonly tombolSelect = () => this.app.getByRole('button', { name: /Select\s*$/ });
  readonly popup = () => this.app.locator('.swal2-popup');

  // buka modal, isi No. Document, Search; kembalikan response endpoint pencarian
  async cari(docno: string) {
    await this.tombolBuka().click();
    await expect(this.modal()).toBeVisible(T);
    await this.inputDocno().fill(docno);
    const res = this.page.waitForResponse((r) => r.url().includes(ENDPOINT_CARI), T);
    await this.tombolSearch().click();
    return res;
  }

  // tutup popup pesan kalau ada; kembalikan teksnya ('' kalau tidak ada popup)
  async tutupPesan() {
    if (!(await this.popup().waitFor({ timeout: 3000 }).then(() => true, () => false))) return '';
    const pesan = (await this.popup().innerText()).replace(/\s+/g, ' ').replace(/\bOK\b\s*$/, '').trim();
    await this.popup().locator('.swal2-confirm').click();
    await expect(this.popup()).toBeHidden(T);
    return pesan;
  }

  async tutup() {
    await this.tutupPesan();
    await this.modal().locator('.btn-close').click();
    await expect(this.modal()).toBeHidden(T);
  }
}
