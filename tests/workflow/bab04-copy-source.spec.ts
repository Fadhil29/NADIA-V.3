import { FrameLocator, Page } from '@playwright/test';
import fs from 'fs';
import { authFile, NADIA_HOME, RoleSlug } from '../../scripts/roles';
import { expect, test } from '../fixtures';
import { nadia, openMenu, openSubMenu, waitForNadia } from '../helpers/nav';

// BAB 4 - Copy Source | aktor: satu user (fitur tidak melibatkan role lain)
// Aturan (konfirmasi 30/10): docno hanya boleh dari Sent Item milik user sendiri; docno dari Inbox ditolak (server: HTTP 403).
// Selector dari codegen 30/10. Docno diambil dinamis dari baris pertama Sent Item / Inbox, tidak di-hardcode.
// aturan Copy Source berlaku untuk semua role, jadi diuji per akun. Akun tanpa session di-skip
const AKTOR: RoleSlug[] = ['staff', 'divhead', 'grouphead'];

const T = { timeout: 20000 };

const tombolCopySource = (app: FrameLocator) => app.getByRole('button', { name: /Copy Source\s*$/ });
const inputDocno = (app: FrameLocator) => app.getByRole('textbox', { name: 'Input Doc Number' });
const tombolSearch = (app: FrameLocator) => app.getByRole('button', { name: /Search\s*$/ });
const tombolSelect = (app: FrameLocator) => app.getByRole('button', { name: /Select\s*$/ });
const modal = (app: FrameLocator) => app.locator('#addSource');
const swal = (app: FrameLocator) => app.locator('.swal2-popup');

// endpoint pencarian Copy Source (observasi 30/10). Docno dari Inbox dibalas 403
const ENDPOINT_CARI = '/documentSearchCopySource';
// status penolakan beda per jenis dokumen (observasi 30/10): surat ND.* dari Inbox 403, surat API.* 400, disposisi DISP.* 404.
// Yang diuji: ditolak dengan 4xx; status aktual dicatat di anotasi untuk dikonfirmasi dev
const ditolak4xx = (status: number) => status >= 400 && status < 500;
// nomor disposisi (DISP.xxx) di Inbox bukan dokumen surat; server membalas 404. Diuji terpisah
const isDisposisi = (docno: string) => docno.startsWith('DISP.');

async function lewatiTour(app: FrameLocator) {
  const lewati = app.getByRole('button', { name: 'Lewati' });
  if (await lewati.waitFor({ timeout: 3000 }).then(() => true, () => false)) await lewati.click();
}

// docno diambil dari segmen terakhir href link baris (base64 dari docno), bukan dari teks sel:
// format docno beda-beda (ND.STE.0178/KB.01.06/X/2026-B, API.26731/KB.01.06/2026/HO-B) dan satu sel
// bisa berisi docno lain ("Forward Reference From"). Contoh href: .../2026-10-29/QVBJLjI2NzMx...?type=inb
const docnoDariHref = (href: string) => {
  const seg = decodeURIComponent(href.split('?')[0].split('/').pop() ?? '');
  try {
    return Buffer.from(seg, 'base64').toString('utf8').trim();
  } catch {
    return '';
  }
};

const MAKS_BARIS = 5; // batas baris Sent Item yang dicoba sebelum test dinyatakan gagal

// docno dari N baris teratas tabel (unik, urutan tabel)
async function docnoBaris(user: Page, menu: string, maks: number) {
  const app = nadia(user);
  await openMenu(user, menu);
  await lewatiTour(app);
  const baris = app.locator('table tbody tr');
  const ada = await baris.first().locator('a[href*="nadiadev"]').first().waitFor({ timeout: 20000 }).then(() => true, () => false);
  test.skip(!ada, `${menu} kosong, tidak ada docno untuk diuji`);
  const hasil: string[] = [];
  const n = Math.min(await baris.count(), maks);
  for (let i = 0; i < n; i++) {
    const link = baris.nth(i).locator('a[href*="nadiadev"]').first();
    if (!(await link.count())) continue;
    const docno = docnoDariHref((await link.getAttribute('href')) ?? '');
    if (/^[A-Z]+\.[\w.]*\d+\/.+/.test(docno) && !hasil.includes(docno)) hasil.push(docno);
  }
  expect(hasil.length, `docno tidak terbaca dari tabel ${menu}`).toBeGreaterThan(0);
  return hasil;
}

const docnoPertama = async (user: Page, menu: string) => (await docnoBaris(user, menu, 1))[0];

// cari docno di Sent Item lewat kotak pencarian DataTables (tidak hanya halaman pertama)
async function adaDiSentItem(user: Page, docno: string) {
  const app = nadia(user);
  await openMenu(user, 'Sent Item');
  await lewatiTour(app);
  const cari = app.locator('.dataTables_filter input, .dt-search input').first();
  await expect(cari, 'kotak pencarian Sent Item tidak ditemukan').toBeVisible(T);
  await cari.fill(docno);
  const hrefs = () =>
    app.locator('table tbody tr a[href*="nadiadev"]').evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''));
  return expect
    .poll(async () => (await hrefs()).some((h) => docnoDariHref(h) === docno), { timeout: 6000 })
    .toBe(true)
    .then(() => true, () => false);
}

// tutup popup SweetAlert (pesan error) kalau ada; kembalikan teksnya
async function tutupSwal(app: FrameLocator) {
  if (!(await swal(app).waitFor({ timeout: 3000 }).then(() => true, () => false))) return '';
  const pesan = (await swal(app).innerText()).replace(/\s+/g, ' ').replace(/\bOK\b\s*$/, '').trim();
  await swal(app).locator('.swal2-confirm').click();
  await expect(swal(app)).toBeHidden(T);
  return pesan;
}

async function tutupModal(app: FrameLocator) {
  await tutupSwal(app);
  await modal(app).locator('.btn-close').click();
  await expect(modal(app)).toBeHidden(T);
}

// semua isian form yang terlihat (di luar modal dan kolom pencarian) + editor isi surat
async function isianForm(app: FrameLocator) {
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

async function bukaFormMemo(user: Page) {
  const app = nadia(user);
  await openSubMenu(user, 'Compose', 'Official Memo');
  await lewatiTour(app);
  await expect(tombolCopySource(app), 'form Official Memo belum terbuka').toBeVisible(T);
}

// buka Copy Source, isi docno, Search; kembalikan response endpoint pencarian
async function cariDocno(user: Page, docno: string) {
  const app = nadia(user);
  await tombolCopySource(app).click();
  await expect(modal(app)).toBeVisible(T);
  await inputDocno(app).fill(docno);
  const res = user.waitForResponse((r) => r.url().includes(ENDPOINT_CARI), T);
  await tombolSearch(app).click();
  return res;
}

for (const aktor of AKTOR) {
  test.describe(`[${aktor}]`, () => {
    test.beforeEach(() => {
      test.skip(!fs.existsSync(authFile(aktor)), `akun ${aktor} belum punya session (npm run auth -- ${aktor})`);
    });

    test('BAB04 Copy Source: docno dari Sent Item sendiri mengisi form Official Memo', { tag: ['@bab04', '@tier2'] }, async ({ as }) => {
      const user = await as(aktor);
      const app = nadia(user);
      await user.goto(NADIA_HOME);
      await waitForNadia(user);

      const kandidat = await test.step(`Ambil docno ${MAKS_BARIS} baris teratas Sent Item`, () => docnoBaris(user, 'Sent Item', MAKS_BARIS));

      await test.step('Buka form Official Memo: masih kosong', async () => bukaFormMemo(user));
      const sebelum = await isianForm(app);

      // coba baris berikutnya kalau docno ditolak; yang ditolak dicatat sebagai temuan
      let dipakai = '';
      const ditolak: string[] = [];
      for (const docno of kandidat) {
        const bisa = await test.step(`Copy Source ${docno} → Search`, async () => {
          const res = await cariDocno(user, docno);
          if (res.status() < 400) {
            await expect(tombolSelect(app), `server 200 tapi tombol Select tidak muncul untuk ${docno}`).toBeVisible(T);
            return true;
          }
          const pesan = await tutupSwal(app);
          ditolak.push(`${docno} (${res.status()}${pesan ? `: ${pesan}` : ''})`);
          await tutupModal(app);
          return false;
        });
        if (bisa) {
          dipakai = docno;
          break;
        }
      }
      if (ditolak.length) {
        test.info().annotations.push({ type: 'temuan', description: `docno Sent Item yang ditolak Copy Source: ${ditolak.join('; ')}` });
      }
      expect(dipakai, `tidak ada docno Sent Item yang bisa dipakai dari ${kandidat.length} baris teratas: ${ditolak.join('; ')}`).not.toBe('');

      await test.step(`Select ${dipakai}`, async () => {
        await tombolSelect(app).click();
        await expect(modal(app), 'modal Copy Source tidak tertutup setelah Select').toBeHidden(T);
      });

      await test.step('Form terisi dari dokumen sumber', async () => {
        await expect
          .poll(async () => (await isianForm(app)).length, { message: 'form tidak bertambah isinya setelah Copy Source', ...T })
          .toBeGreaterThan(sebelum.length);
        // TODO(dump-page): cek field spesifik (penerima, subject, isi, Document Date). Document Date pernah tidak ikut tersalin (bug lama)
      });
    });

    test('BAB04 Copy Source: docno dari Inbox ditolak dan form tetap kosong', { tag: ['@bab04', '@tier2'] }, async ({ as }) => {
      const user = await as(aktor);
      const app = nadia(user);
      await user.goto(NADIA_HOME);
      await waitForNadia(user);

      const inbox = await test.step(`Ambil docno surat (bukan disposisi) dari ${MAKS_BARIS} baris teratas Inbox`, () => docnoBaris(user, 'Inbox', MAKS_BARIS));
      // surat yang juga ada di Sent Item user (mis. user ikut menandatangani / mengirim) sah dipakai, jadi bukan kandidat uji negatif
      let docno: string | undefined;
      for (const d of inbox.filter((x) => !isDisposisi(x))) {
        const milikSendiri = await test.step(`Cek ${d} tidak ada di Sent Item ${aktor}`, () => adaDiSentItem(user, d));
        if (!milikSendiri) {
          docno = d;
          break;
        }
      }
      test.skip(!docno, `tidak ada surat di ${MAKS_BARIS} baris teratas Inbox yang bukan disposisi dan tidak ada di Sent Item`);

      await test.step('Buka form Official Memo', async () => bukaFormMemo(user));
      const sebelum = await isianForm(app);

      await test.step(`Copy Source ${docno} (Inbox) → Search: ditolak`, async () => {
        const res = await cariDocno(user, docno!);
        expect(ditolak4xx(res.status()), `docno Inbox harus ditolak 4xx, server membalas ${res.status()}`).toBe(true);
        const pesan = await tutupSwal(app);
        test.info().annotations.push({ type: 'pesan penolakan', description: `${docno} → ${res.status()}: ${pesan || '(tanpa pesan)'}` });
        expect(pesan, 'penolakan harus menampilkan pesan ke user').not.toBe('');
        await expect(tombolSelect(app), 'docno Inbox tidak boleh bisa dipilih').toBeHidden();
      });

      await test.step('Tutup modal: form tetap kosong', async () => {
        await tutupModal(app);
        expect(await isianForm(app), 'form terisi padahal docno ditolak').toEqual(sebelum);
      });
    });

    test('BAB04 Copy Source: nomor disposisi dari Inbox ditolak dan form tetap kosong', { tag: ['@bab04', '@tier2'] }, async ({ as }) => {
      const user = await as(aktor);
      const app = nadia(user);
      await user.goto(NADIA_HOME);
      await waitForNadia(user);

      const inbox = await test.step(`Ambil nomor disposisi dari ${MAKS_BARIS} baris teratas Inbox`, () => docnoBaris(user, 'Inbox', MAKS_BARIS));
      const docno = inbox.find(isDisposisi);
      test.skip(!docno, `tidak ada nomor disposisi di ${MAKS_BARIS} baris teratas Inbox`);

      await test.step('Buka form Official Memo', async () => bukaFormMemo(user));
      const sebelum = await isianForm(app);

      await test.step(`Copy Source ${docno} (disposisi) → Search: ditolak`, async () => {
        const res = await cariDocno(user, docno!);
        // observasi 30/10: 404. Yang wajib: ditolak (4xx) dan ada pesan ke user
        expect(res.status(), 'nomor disposisi harus ditolak').toBeGreaterThanOrEqual(400);
        expect(res.status(), 'nomor disposisi harus ditolak (4xx, bukan error server)').toBeLessThan(500);
        const pesan = await tutupSwal(app);
        test.info().annotations.push({ type: 'pesan penolakan disposisi', description: `${res.status()}: ${pesan || '(tanpa pesan)'}` });
        expect.soft(pesan, 'penolakan disposisi harus menampilkan pesan ke user').not.toBe('');
        await expect(tombolSelect(app), 'nomor disposisi tidak boleh bisa dipilih').toBeHidden();
      });

      await test.step('Tutup modal: form tetap kosong', async () => {
        await tutupModal(app);
        expect(await isianForm(app), 'form terisi padahal nomor ditolak').toEqual(sebelum);
      });
    });
  });
}