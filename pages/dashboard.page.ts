import { expect, Page, Response } from '@playwright/test';
import { nadia, T } from './nadia-shell';

// Dashboard admin (observasi 03/11 di staging):
// - blok atas  : Location (#filter, single) + Branch (#branch, multi) + #btnFilterCard -> semua kartu & chart per branch
// - Document Type: #naskahFilter (multi) + #docFIlter -> /dashboard/typeDocument/chart, ikut branch blok atas
// - blok bawah : #filterPhase + #locationFilter + #btnFilterPhase -> chart per bulan & digital/manual (tidak dipakai UAT)
// Branch kosong = parameter branch[] tidak dikirim = semua lokasi.
export const ENDPOINT = {
  kartu: '/dashboard/cardDocumentCount/chart',
  region: '/dashboard/regionDoc/chart',
  jenis: '/dashboard/typeDocument/chart',
} as const;

export type Jenis = { JenisId: string; JenisName: string; codeAP2: string; total: number };

const params = (res: Response, nama: string) => new URL(res.url()).searchParams.getAll(`${nama}[]`);

export class DashboardPage {
  constructor(private readonly page: Page) {}

  private get app() {
    return nadia(this.page);
  }

  readonly judul = () => this.app.getByRole('heading', { name: 'Dashboard', exact: true });
  readonly totalDocument = () => this.app.getByRole('heading', { name: 'Total Document', exact: true }).locator('xpath=following::h1[1]');
  private readonly select2 = (id: string) => this.app.locator(`#${id} + .select2-container`);
  private readonly nilaiKartu = (nama: string) => this.app.getByRole('heading', { name: nama, exact: true }).locator('xpath=following::h1[1]');

  // angka kartu yang tampil di layar, untuk dibandingkan sebelum vs sesudah filter
  async kartu() {
    const baca = async (nama: string) => angka(await this.nilaiKartu(nama).textContent(T));
    return { total: await baca('Total Document'), active: await baca('Active Archives') };
  }

  // tunggu kartu Total Document di layar menampilkan angka hasil filter
  async tungguTotal(total: number) {
    await expect.poll(async () => (await this.kartu()).total, { ...T, message: 'Total Document di layar' }).toBe(total);
  }

  // overlay loading menutupi halaman selama request awal dashboard; interaksi sebelum hilang ikut tertimpa
  readonly loading = () => this.app.locator('#global-loading');

  async tunggu() {
    await expect(this.judul()).toBeVisible(T);
    await expect(this.totalDocument()).not.toHaveText('', T);
    await expect(this.loading()).toBeHidden({ timeout: 60000 });
  }

  // request yang DIKIRIM setelah klik (bukan sisa request awal halaman), lalu response-nya
  private async klikDanTunggu(tombol: string, ...endpoint: string[]) {
    await expect(this.loading()).toBeHidden({ timeout: 60000 });
    // query semua lokasi bisa > 20 detik di staging
    const req = endpoint.map((e) => this.page.waitForRequest((r) => r.url().includes(e), { timeout: 60000 }));
    await this.app.locator(tombol).click();
    return Promise.all(
      req.map(async (r, i) => {
        const res = (await (await r).response())!;
        expect(res.status(), `${endpoint[i]} gagal`).toBe(200);
        return res;
      }),
    );
  }

  // kosongkan pilihan select2 multi lewat tombol × di tiap chip (seperti user)
  async kosongkan(id: string) {
    const hapus = this.select2(id).locator('.select2-selection__choice__remove');
    for (let i = 0; i < 60 && (await hapus.count()); i++) {
      await hapus.first().click();
      // select2 membuka dropdown setelah chip dihapus: tutup supaya tidak menutupi tombol
      await this.page.keyboard.press('Escape');
    }
    await expect(this.select2(id).locator('.select2-selection__choice')).toHaveCount(0);
  }

  // pilih opsi select2 dengan mengetik kode (CGK, ND, ...) lalu klik hasil yang diawali kode itu
  async pilih(id: string, kode: string) {
    await this.select2(id).locator('.select2-selection').click();
    const cari = this.app.locator('.select2-container--open .select2-search__field');
    await cari.fill(kode);
    // Document Type: li.select2-results__option; Branch: treeitem tanpa class itu
    const pola = new RegExp(`^${kode} - `);
    await this.app
      .locator('.select2-results__option')
      .filter({ hasText: pola })
      .or(this.app.getByRole('treeitem', { name: pola }))
      .first()
      .click();
    await this.page.keyboard.press('Escape');
    // teks chip diawali "×" (tombol hapus); [^A-Z] supaya "ND - " tidak cocok dengan "UND - "
    const chip = new RegExp(`(^|[^A-Z])${kode} - `);
    await expect(this.select2(id).locator('.select2-selection__choice').filter({ hasText: chip }), `chip ${kode} terpilih`).toHaveCount(1);
  }

  async terpilih(id: string): Promise<string[]> {
    return this.select2(id).locator('.select2-selection__choice').evaluateAll((els) => els.map((e) => (e.getAttribute('title') ?? e.textContent ?? '').replace(/^×/, '').trim()));
  }

  // klik Filter blok atas; kembalikan response kartu & region (oracle angka)
  async filterBranch() {
    const [rk, rr] = await this.klikDanTunggu('#btnFilterCard', ENDPOINT.kartu, ENDPOINT.region);
    const total: number = (await rk.json()).data.totalDocument;
    const { labels, values } = (await rr.json()).data.countDoc as { labels: string[]; values: number[] };
    return { branch: params(rk, 'branch'), total, labels, values };
  }

  async filterJenis() {
    const [r] = await this.klikDanTunggu('#docFIlter', ENDPOINT.jenis);
    return { jenis: params(r, 'jenis'), data: (await r.json()).data as Jenis[] };
  }
}

// angka "29.891" (id) / "29,891" (en) -> 29891
export const angka = (s: string | null) => Number((s ?? '').replace(/[^\d]/g, ''));
