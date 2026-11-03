import { expect, Page } from '@playwright/test';
import { bukaSubMenu, nadia, T } from './nadia-shell';

// Form Compose (Nota Dinas / Official Memo, Surat Dinas Keluar / Official Letter, Undangan / Invitation)
export class ComposePage {
  constructor(private readonly page: Page) {}

  private get app() {
    return nadia(this.page);
  }

  // penanda form sudah termuat: tombol Copy Source ada di semua form Compose
  readonly penandaForm = () => this.app.getByRole('button', { name: /Copy Source\s*$/ });

  async buka(submenu: string) {
    await bukaSubMenu(this.page, 'Compose', submenu);
    await expect(this.penandaForm(), `form ${submenu} belum terbuka`).toBeVisible(T);
  }

  // semua isian form yang terlihat (di luar modal), untuk membandingkan sebelum/sesudah aksi
  async isian() {
    return this.app.locator('body').evaluate(() => {
      const tampil = (e: Element) => !!(e as HTMLElement).offsetParent && !e.closest('.modal');
      const isi: string[] = [];
      document.querySelectorAll('input:not([type]), input[type="text"], input[type="date"], textarea, select').forEach((e) => {
        const el = e as HTMLInputElement;
        if (tampil(el) && el.type !== 'search' && el.value.trim()) isi.push(el.value.trim());
      });
      document.querySelectorAll('[contenteditable="true"], .select2-selection__choice').forEach((e) => {
        const t = (e as HTMLElement).innerText.trim();
        if (tampil(e) && t) isi.push(t);
      });
      return isi;
    });
  }

  // nilai default form (tanggal, pengirim, dll.) terisi beberapa saat setelah dibuka.
  // Snapshot diambil setelah isinya tidak berubah 1,5 dtk (CS-03 02/11)
  async isianStabil(maksMs = 10000) {
    let lama = JSON.stringify(await this.isian());
    let sejak = Date.now();
    const akhir = Date.now() + maksMs;
    while (Date.now() < akhir) {
      await new Promise((r) => setTimeout(r, 500));
      const kini = JSON.stringify(await this.isian());
      if (kini !== lama) {
        lama = kini;
        sejak = Date.now();
      } else if (Date.now() - sejak >= 1500) break;
    }
    return JSON.parse(lama) as string[];
  }

  // isian yang muncul setelah aksi
  static isianBaru(sebelum: string[], sesudah: string[]) {
    return sesudah.filter((v) => !sebelum.includes(v));
  }
}
