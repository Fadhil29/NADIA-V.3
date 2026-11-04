import { Page } from '@playwright/test';
import { expect, test } from '../../config/fixtures';
import { NADIA_HOME } from '../../config/roles';
import { uat } from '../../config/uat';
import { DashboardPage } from '../../pages/dashboard.page';
import { waitForNadia } from '../../pages/nadia-shell';
import { hasil, langkah, mulaiCase } from '../../utils/evidence';

// UAT sheet "Dashboard Admin": satu test = satu case = satu video evidence. Role: admin (admin pusat)
// npm run test:evidence -- --project=uat dashboard-admin
// Filter divalidasi dari PERUBAHAN data: baseline sebelum filter vs sesudah filter (kartu di layar + data chart).
// Angka tidak di-hardcode karena data staging berubah tiap hari.
const TAG = { tag: ['@uat', '@dashboard-admin'] };
const SHEET = 'Dashboard Admin';

async function mulai(user: Page, id: string, skenario: string) {
  mulaiCase(user, id, skenario);
  const dash = new DashboardPage(user);
  await langkah(user, 'Buka halaman Dashboard', async () => {
    await user.goto(NADIA_HOME);
    await waitForNadia(user);
    await dash.tunggu();
  });
  return dash;
}

const jumlah = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

const SEMUA_REGION = ['HO', 'Region 1', 'Region 2', 'Region 3', 'Region 4', 'Region 5', 'Region 6'];
// kode select #branch
const BRANCH = { CGK: '01', HLP: '02', BDJ: '42' } as const;

// baseline "semua lokasi": kosongkan Branch lalu Filter
async function semuaLokasi(user: Page, dash: DashboardPage) {
  return langkah(user, 'Baseline: kosongkan Branch (semua lokasi), klik Filter', async () => {
    await dash.kosongkan('branch');
    const r = await dash.filterBranch();
    await dash.tungguTotal(r.total);
    return r;
  });
}

// baseline "semua tipe dokumen": kosongkan Document Type lalu Filter
async function semuaJenis(user: Page, dash: DashboardPage) {
  return langkah(user, 'Baseline: kosongkan Document Type (semua tipe), klik Filter', async () => {
    await dash.kosongkan('naskahFilter');
    return dash.filterJenis();
  });
}

// Validasi filter = data BERUBAH sesuai filter: bandingkan sebelum vs sesudah, di layar (kartu) dan di data chart
test.describe('Dashboard Admin Pusat - Filter Location', () => {
  test('DASH-01 Kosongkan filter location lalu search', { ...TAG, annotation: uat(SHEET, 'DASH-01') }, async ({ as }) => {
    const user = await as('admin');
    const dash = await mulai(user, 'DASH-01', 'Kosongkan filter location lalu klik search');
    const sebelum = await langkah(user, 'Catat angka kartu default (Branch HO)', () => dash.kartu());
    await langkah(user, 'Kosongkan filter Branch', () => dash.kosongkan('branch'));
    const r = await langkah(user, 'Klik Filter', () => dash.filterBranch());
    await dash.tungguTotal(r.total);

    expect(r.branch, 'filter kosong tidak boleh mengirim branch[]').toEqual([]);
    expect(r.labels, 'chart Total Documents harus berisi HO dan semua regional').toEqual(SEMUA_REGION);
    expect(jumlah(r.values), 'jumlah dokumen per region harus = Total Document').toBe(r.total);
    expect(r.total, 'semua lokasi harus lebih banyak dari HO saja').toBeGreaterThan(sebelum.total);
    await hasil(user, `Total Document berubah ${sebelum.total} (HO) → ${r.total} (semua lokasi)`);
  });

  test('DASH-02 Pilih single location', { ...TAG, annotation: uat(SHEET, 'DASH-02') }, async ({ as }) => {
    const user = await as('admin');
    const dash = await mulai(user, 'DASH-02', 'Pilih single location (CGK)');
    const semua = await semuaLokasi(user, dash);
    await langkah(user, 'Pilih Branch CGK', () => dash.pilih('branch', 'CGK'));
    const r = await langkah(user, 'Klik Filter', () => dash.filterBranch());
    await dash.tungguTotal(r.total);

    expect(r.branch, 'request harus mengirim CGK').toEqual([BRANCH.CGK]);
    expect(r.labels, 'chart Total Documents hanya CGK').toEqual(['CGK']);
    expect(r.values[0], 'jumlah dokumen CGK harus = Total Document').toBe(r.total);
    expect(r.total, 'CGK harus lebih sedikit dari semua lokasi').toBeLessThan(semua.total);
    await hasil(user, `Total Document berubah ${semua.total} (semua) → ${r.total} (CGK)`);
  });

  test('DASH-03 Pilih multiple location', { ...TAG, annotation: uat(SHEET, 'DASH-03') }, async ({ as }) => {
    const user = await as('admin');
    const dash = await mulai(user, 'DASH-03', 'Pilih multiple location (CGK, BDJ, HLP)');
    const lokasi = ['CGK', 'BDJ', 'HLP'] as const;
    const semua = await semuaLokasi(user, dash);
    await langkah(user, `Pilih Branch ${lokasi.join(', ')}`, async () => {
      for (const l of lokasi) await dash.pilih('branch', l);
    });
    const r = await langkah(user, 'Klik Filter', () => dash.filterBranch());
    await dash.tungguTotal(r.total);

    expect([...r.branch].sort(), 'request harus mengirim ketiga lokasi').toEqual(lokasi.map((l) => BRANCH[l]).sort());
    expect([...r.labels].sort(), 'chart Total Documents hanya lokasi yang difilter').toEqual([...lokasi].sort());
    expect(jumlah(r.values), 'jumlah dokumen per lokasi harus = Total Document').toBe(r.total);
    expect(r.total, '3 lokasi harus lebih sedikit dari semua lokasi').toBeLessThan(semua.total);
    await hasil(user, `Total Document berubah ${semua.total} (semua) → ${r.total} (${lokasi.join(', ')})`);
  });
});

test.describe('Dashboard Admin Pusat - Filter Document Type', () => {
  test('DASH-04 Kosongkan filter document type', { ...TAG, annotation: uat(SHEET, 'DASH-04') }, async ({ as }) => {
    const user = await as('admin');
    const dash = await mulai(user, 'DASH-04', 'Kosongkan filter document type lalu klik search');
    // isi dulu supaya langkah "kosongkan" benar-benar mengubah filter
    const satu = await langkah(user, 'Filter Document Type ND dulu', async () => {
      await dash.kosongkan('naskahFilter');
      await dash.pilih('naskahFilter', 'ND');
      return dash.filterJenis();
    });
    await langkah(user, 'Kosongkan filter Document Type', () => dash.kosongkan('naskahFilter'));
    const r = await langkah(user, 'Klik Filter Document Type', () => dash.filterJenis());

    expect(r.jenis, 'filter kosong tidak boleh mengirim jenis[]').toEqual([]);
    expect(r.data.length, 'chart harus kembali menampilkan semua tipe dokumen').toBeGreaterThan(satu.data.length);
    await hasil(user, `Tipe dokumen di chart berubah ${satu.data.length} → ${r.data.length}`);
  });

  test('DASH-05 Add single document type', { ...TAG, annotation: uat(SHEET, 'DASH-05') }, async ({ as }) => {
    const user = await as('admin');
    const dash = await mulai(user, 'DASH-05', 'Add single document type (Nota Dinas)');
    const semua = await semuaJenis(user, dash);
    const nd = semua.data.find((d) => d.codeAP2 === 'ND');
    expect(nd, 'baseline harus punya Nota Dinas').toBeTruthy();
    await langkah(user, 'Pilih Document Type ND - Nota Dinas', () => dash.pilih('naskahFilter', 'ND'));
    const r = await langkah(user, 'Klik Filter Document Type', () => dash.filterJenis());

    expect(r.jenis, 'request harus mengirim ND').toEqual([nd!.JenisId]);
    expect(r.data.map((d) => d.codeAP2), 'chart hanya Nota Dinas').toEqual(['ND']);
    expect(r.data[0].total, 'jumlah ND harus sama dengan ND di baseline').toBe(nd!.total);
    expect(r.data.length, 'jumlah tipe di chart harus berkurang').toBeLessThan(semua.data.length);
    await hasil(user, `Tipe dokumen ${semua.data.length} → 1 (ND: ${r.data[0].total})`);
  });

  test('DASH-06 Add multiple document type', { ...TAG, annotation: uat(SHEET, 'DASH-06') }, async ({ as }) => {
    const user = await as('admin');
    const dash = await mulai(user, 'DASH-06', 'Add multiple document type (ND, BAC, NKA)');
    const kode = ['ND', 'BAC', 'NKA'];
    const semua = await semuaJenis(user, dash);
    await langkah(user, `Pilih Document Type ${kode.join(', ')}`, async () => {
      for (const k of kode) await dash.pilih('naskahFilter', k);
    });
    const r = await langkah(user, 'Klik Filter Document Type', () => dash.filterJenis());

    expect(r.jenis, 'request harus mengirim ketiga tipe').toHaveLength(kode.length);
    // tipe tanpa dokumen boleh tidak muncul, tapi tidak boleh ada tipe lain
    const tampil = r.data.map((d) => d.codeAP2);
    expect(tampil.length, 'minimal satu tipe tampil').toBeGreaterThan(0);
    expect(tampil.filter((c) => !kode.includes(c)), 'tipe di luar filter').toEqual([]);
    for (const d of r.data) {
      expect(d.total, `jumlah ${d.codeAP2} harus sama dengan baseline`).toBe(semua.data.find((x) => x.codeAP2 === d.codeAP2)?.total);
    }
    expect(r.data.length, 'jumlah tipe di chart harus berkurang').toBeLessThan(semua.data.length);
    await hasil(user, `Tipe dokumen ${semua.data.length} → ${r.data.length} (${r.data.map((d) => `${d.codeAP2}: ${d.total}`).join(', ')})`);
  });
});

// Akun admin regional/cabang belum ada di .env (ACTORS_WITHOUT_ACCOUNT di config/roles.ts)
test.describe('Dashboard Admin Regional/Cabang', () => {
  for (const [id, skenario] of [
    ['DASH-07', 'Show location: hanya lokasi sesuai akun admin regional/cabang'],
    ['DASH-08', 'Kosongkan filter document type'],
    ['DASH-09', 'Add single document type'],
    ['DASH-10', 'Add multiple document type'],
  ]) {
    test(`${id} ${skenario}`, { ...TAG, annotation: uat(SHEET, id) }, async () => {
      test.fixme(true, 'butuh akun admin regional/cabang (NADIA_ADMINREGIONAL_* di .env)');
    });
  }
});
