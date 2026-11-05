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

// data staging hidup (user lain terus membuat dokumen): dua request yang berselang detik bisa beda beberapa dokumen.
// Toleransi 0,1% (min. 10 dokumen); filter yang salah selisihnya jauh lebih besar. Angka ikut tercetak di pesan gagal.
const dekat = (aktual: number, harapan: number, label: string) =>
  expect(Math.abs(aktual - harapan), `${label}: ${aktual} vs ${harapan}`).toBeLessThanOrEqual(Math.max(10, Math.round(harapan * 0.001)));

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
    dekat(jumlah(r.values), r.total, 'jumlah dokumen per region harus = Total Document');
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
    dekat(r.values[0], r.total, 'jumlah dokumen CGK harus = Total Document');
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
    dekat(jumlah(r.values), r.total, 'jumlah dokumen per lokasi harus = Total Document');
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
    dekat(r.data[0].total, nd!.total, 'jumlah ND harus sama dengan ND di baseline');
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
      dekat(d.total, (semua.data.find((x) => x.codeAP2 === d.codeAP2)?.total ?? -1), `jumlah ${d.codeAP2} harus sama dengan baseline`);
    }
    expect(r.data.length, 'jumlah tipe di chart harus berkurang').toBeLessThan(semua.data.length);
    await hasil(user, `Tipe dokumen ${semua.data.length} → ${r.data.length} (${r.data.map((d) => `${d.codeAP2}: ${d.total}`).join(', ')})`);
  });
});

// Admin regional & cabang: tiap case dijalankan untuk kedua akun (NADIA_ADMINREG_*, NADIA_ADMINCABANG_* di .env)
const ADMIN_WILAYAH = ['admin-regional', 'admin-cabang'] as const;

test.describe('Dashboard Admin Regional/Cabang', () => {
  test('DASH-07 Show location: hanya lokasi sesuai akun', { ...TAG, annotation: uat(SHEET, 'DASH-07') }, async ({ as }) => {
    const pusat = await mulai(await as('admin'), 'DASH-07', 'Show location: hanya lokasi sesuai akun admin regional/cabang');
    const semua = await langkah(await as('admin'), 'Admin Pusat: catat semua lokasi di filter Branch', () => pusat.opsiBranch());

    for (const role of ADMIN_WILAYAH) {
      const user = await as(role);
      const dash = await mulai(user, 'DASH-07', `Show location (${role})`);
      const opsi = await langkah(user, 'Catat lokasi yang tampil di filter Branch', () => dash.opsiBranch());

      expect(opsi.length, `${role}: filter Branch tidak boleh kosong`).toBeGreaterThan(0);
      expect(opsi.length, `${role}: lokasi harus lebih sedikit dari admin pusat`).toBeLessThan(semua.length);
      expect(opsi.filter((o) => !semua.includes(o)), `${role}: lokasi di luar daftar sistem`).toEqual([]);
      await hasil(user, `${role}: ${opsi.length} lokasi (admin pusat: ${semua.length})`);
    }
  });

  test('DASH-08 Kosongkan filter document type', { ...TAG, annotation: uat(SHEET, 'DASH-08') }, async ({ as }) => {
    for (const role of ADMIN_WILAYAH) {
      const user = await as(role);
      const dash = await mulai(user, 'DASH-08', `Kosongkan filter document type (${role})`);
      const satu = await langkah(user, 'Filter Document Type ND dulu', async () => {
        await dash.kosongkan('naskahFilter');
        await dash.pilih('naskahFilter', 'ND');
        return dash.filterJenis();
      });
      await langkah(user, 'Kosongkan filter Document Type', () => dash.kosongkan('naskahFilter'));
      const r = await langkah(user, 'Klik Filter Document Type', () => dash.filterJenis());

      expect(r.jenis, `${role}: filter kosong tidak boleh mengirim jenis[]`).toEqual([]);
      expect(r.data.length, `${role}: chart harus kembali menampilkan semua tipe`).toBeGreaterThan(satu.data.length);
      await hasil(user, `${role}: tipe dokumen ${satu.data.length} → ${r.data.length}`);
    }
  });

  test('DASH-09 Add single document type', { ...TAG, annotation: uat(SHEET, 'DASH-09') }, async ({ as }) => {
    for (const role of ADMIN_WILAYAH) {
      const user = await as(role);
      const dash = await mulai(user, 'DASH-09', `Add single document type (${role})`);
      const semua = await semuaJenis(user, dash);
      const nd = semua.data.find((d) => d.codeAP2 === 'ND');
      expect(nd, `${role}: baseline harus punya Nota Dinas`).toBeTruthy();
      await langkah(user, 'Pilih Document Type ND - Nota Dinas', () => dash.pilih('naskahFilter', 'ND'));
      const r = await langkah(user, 'Klik Filter Document Type', () => dash.filterJenis());

      expect(r.data.map((d) => d.codeAP2), `${role}: chart hanya Nota Dinas`).toEqual(['ND']);
      dekat(r.data[0].total, nd!.total, `${role}: jumlah ND harus sama dengan baseline`);
      expect(r.data.length, `${role}: jumlah tipe di chart harus berkurang`).toBeLessThan(semua.data.length);
      await hasil(user, `${role}: tipe dokumen ${semua.data.length} → 1 (ND: ${r.data[0].total})`);
    }
  });

  test('DASH-10 Add multiple document type', { ...TAG, annotation: uat(SHEET, 'DASH-10') }, async ({ as }) => {
    const kode = ['ND', 'BAC', 'NKA'];
    for (const role of ADMIN_WILAYAH) {
      const user = await as(role);
      const dash = await mulai(user, 'DASH-10', `Add multiple document type (${role})`);
      const semua = await semuaJenis(user, dash);
      await langkah(user, `Pilih Document Type ${kode.join(', ')}`, async () => {
        for (const k of kode) await dash.pilih('naskahFilter', k);
      });
      const r = await langkah(user, 'Klik Filter Document Type', () => dash.filterJenis());

      const tampil = r.data.map((d) => d.codeAP2);
      expect(tampil.length, `${role}: minimal satu tipe tampil`).toBeGreaterThan(0);
      expect(tampil.filter((c) => !kode.includes(c)), `${role}: tipe di luar filter`).toEqual([]);
      for (const d of r.data) {
        dekat(d.total, (semua.data.find((x) => x.codeAP2 === d.codeAP2)?.total ?? -1), `${role}: jumlah ${d.codeAP2} harus sama dengan baseline`);
      }
      expect(r.data.length, `${role}: jumlah tipe di chart harus berkurang`).toBeLessThan(semua.data.length);
      await hasil(user, `${role}: tipe dokumen ${semua.data.length} → ${r.data.length}`);
    }
  });
});
