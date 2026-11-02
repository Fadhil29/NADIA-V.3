import { expect, FrameLocator, Locator, Page } from '@playwright/test';
import { menuItem, menuLink, nadia, reloadNadia, waitForNadia } from './nav';

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

// guidance wizard NADIA: ditutup dengan Esc (konfirmasi user 02/11), tombol "Lewati" sebagai cadangan.
// Esc hanya ditekan kalau wizard terlihat, supaya tidak ikut menutup modal lain (mis. Copy Source)
export async function lewatiTour(app: FrameLocator, tunggu = 3000) {
  const lewati = app.getByRole('button', { name: 'Lewati' });
  const wizard = lewati.or(app.locator('.driver-popover, .introjs-tooltip, .shepherd-element')).first();
  if (!(await wizard.waitFor({ timeout: tunggu }).then(() => true, () => false))) return;
  await app.locator('body').press('Escape').catch(() => {}); // press di dalam iframe, bukan halaman induk
  if (await wizard.waitFor({ state: 'hidden', timeout: 2000 }).then(() => false, () => true)) await lewati.click().catch(() => {});
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
  await lewatiTour(nadia(user)); // popup tour bisa menutupi sidebar (CS-24 02/11)
  const link = menuLink(user, 'Sent Item');
  await expect(link, 'menu "Sent Item" tidak ditemukan di sidebar (nama atau struktur menu berubah?)').toBeVisible(T);
  await klikUlang(user, link);
}

// klik dengan percobaan ulang: klik bisa terhalang popup/animasi sesaat
export async function klikUlang(user: Page, target: Locator) {
  await expect(async () => {
    await lewatiTour(nadia(user), 500);
    await target.click({ timeout: 5000 });
  }).toPass(T);
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
  await lewatiTour(app); // popup tour bisa menutupi sidebar (CS-19 02/11)
  const sub = menuLink(user, submenu);
  for (let i = 0; i < 3 && !(await sub.isVisible().catch(() => false)); i++) {
    await klikUlang(user, menuItem(user, 'Compose'));
    await sub.waitFor({ timeout: 5000 }).catch(() => {});
  }
  await klikUlang(user, sub);
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

// form baru selesai terisi nilai default (tanggal, pengirim, dll.) beberapa saat setelah dibuka.
// Ambil snapshot setelah isinya tidak berubah 1,5 dtk, supaya pembanding "sebelum" tidak kurang (CS-03 02/11)
export async function isianStabil(app: FrameLocator, maksMs = 10000) {
  let lama = JSON.stringify(await isianForm(app));
  let sejak = Date.now();
  const akhir = Date.now() + maksMs;
  while (Date.now() < akhir) {
    await new Promise((r) => setTimeout(r, 500));
    const kini = JSON.stringify(await isianForm(app));
    if (kini !== lama) {
      lama = kini;
      sejak = Date.now();
    } else if (Date.now() - sejak >= 1500) break;
  }
  return JSON.parse(lama) as string[];
}

// isian yang muncul setelah aksi, untuk pesan error yang bisa dibaca
export const isianBaru = (sebelum: string[], sesudah: string[]) => sesudah.filter((v) => !sebelum.includes(v));

// cari docno lewat search bar Sent Item: tunggu 1,5 dtk; kalau belum muncul, refresh lalu ketik ulang
export async function cariDiSentItem(user: Page, docno: string, percobaan = 3) {
  const app = nadia(user);
  for (let i = 1; i <= percobaan; i++) {
    if (i > 1) {
      await reloadNadia(user);
      await waitForNadia(user);
    }
    await bukaSentItem(user);
    await lewatiTour(app);
    const cari = app.locator('.dataTables_filter input, .dt-search input').first();
    await expect(cari, 'search bar Sent Item tidak ditemukan').toBeVisible(T);
    await cari.fill(docno);
    const baris = app.locator('table tbody tr').filter({ hasText: docno }).first();
    if (await baris.waitFor({ timeout: 1500 }).then(() => true, () => false)) return;
  }
  throw new Error(`${docno} tidak ditemukan di Sent Item setelah ${percobaan}x cari (refresh di antaranya)`);
}
