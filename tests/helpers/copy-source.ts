import { expect, FrameLocator, Page } from '@playwright/test';
import { menuItem, menuLink, nadia, waitForNadia } from './nav';

// selector Copy Source (codegen 30/10, sama dengan bab04-copy-source.spec.ts)
export const T = { timeout: 20000 };
export const ENDPOINT_CARI = '/documentSearchCopySource';
export const tombolCopySource = (app: FrameLocator) => app.getByRole('button', { name: /Copy Source\s*$/ });
export const modal = (app: FrameLocator) => app.locator('#addSource');
// dicari di dalam modal: label input berbeda antar form (Nota Dinas: "Input Doc Number"; form lain gagal ditemukan 01/11)
export const inputDocno = (app: FrameLocator) =>
  modal(app).getByRole('textbox', { name: 'Input Doc Number' }).or(modal(app).locator('input[type="text"], input:not([type])').filter({ visible: true })).first();
export const tombolSearch = (app: FrameLocator) => modal(app).getByRole('button', { name: /Search\s*$/ });
export const tombolSelect = (app: FrameLocator) => app.getByRole('button', { name: /Select\s*$/ });
export const swal = (app: FrameLocator) => app.locator('.swal2-popup');

export async function lewatiTour(app: FrameLocator) {
  const lewati = app.getByRole('button', { name: 'Lewati' });
  if (await lewati.waitFor({ timeout: 3000 }).then(() => true, () => false)) await lewati.click();
}

// segmen terakhir href baris = base64 dari docno
export const docnoDariHref = (href: string) => {
  const seg = decodeURIComponent(href.split('?')[0].split('/').pop() ?? '');
  try {
    return Buffer.from(seg, 'base64').toString('utf8').trim();
  } catch {
    return '';
  }
};

export type ItemSent = { docno: string; jenis: string };

// baris Sent Item: link pertama berisi "<jenis dokumen> - <tujuan>", href-nya berisi docno
// buka Sent Item. Tidak pakai openMenu: openMenu men-skip test kalau menu tidak ketemu,
// padahal untuk UAT menu yang hilang/berubah harus jadi FAIL (RCA run 02/11 13:45)
export async function bukaSentItem(user: Page) {
  await waitForNadia(user);
  const link = menuLink(user, 'Sent Item');
  await expect(link, 'menu "Sent Item" tidak ditemukan di sidebar (nama atau struktur menu berubah?)').toBeVisible(T);
  await link.click();
}

export async function daftarSentItem(user: Page, maks = 25): Promise<ItemSent[]> {
  const app = nadia(user);
  await bukaSentItem(user);
  await lewatiTour(app);
  const baris = app.locator('table tbody tr');
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

// klik Compose sampai submenu terlihat: klik pertama kadang jatuh saat animasi sidebar (CS-02 01/11)
export async function bukaForm(user: Page, submenu: string) {
  const app = nadia(user);
  await waitForNadia(user);
  const sub = menuLink(user, submenu);
  for (let i = 0; i < 3 && !(await sub.isVisible().catch(() => false)); i++) {
    await menuItem(user, 'Compose').click();
    await sub.waitFor({ timeout: 5000 }).catch(() => {});
  }
  await sub.click();
  await lewatiTour(app);
  await expect(tombolCopySource(app), `form ${submenu} belum terbuka`).toBeVisible(T);
}

// buka Copy Source, isi docno, Search; kembalikan response endpoint pencarian
export async function cariDocno(user: Page, docno: string) {
  const app = nadia(user);
  await tombolCopySource(app).click();
  await expect(modal(app)).toBeVisible(T);
  await inputDocno(app).fill(docno);
  const res = user.waitForResponse((r) => r.url().includes(ENDPOINT_CARI), T);
  await tombolSearch(app).click();
  return res;
}

// penolakan karena hak akses, bukan karena aturan yang sedang diuji
export const tolakAkses = (pesan: string) => /do not have access/i.test(pesan);

export async function tutupSwal(app: FrameLocator) {
  if (!(await swal(app).waitFor({ timeout: 3000 }).then(() => true, () => false))) return '';
  const pesan = (await swal(app).innerText()).replace(/\s+/g, ' ').replace(/\bOK\b\s*$/, '').trim();
  await swal(app).locator('.swal2-confirm').click();
  await expect(swal(app)).toBeHidden(T);
  return pesan;
}

export async function tutupModal(app: FrameLocator) {
  await tutupSwal(app);
  await modal(app).locator('.btn-close').click();
  await expect(modal(app)).toBeHidden(T);
}

// isian form yang terlihat (di luar modal) untuk membandingkan sebelum/sesudah Copy Source
export async function isianForm(app: FrameLocator) {
  return app.locator('body').evaluate(() => {
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
