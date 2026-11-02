import { Page } from '@playwright/test';
import { NADIA_HOME, RoleSlug } from '../../scripts/roles';
import {
  bukaForm,
  bukaSentItem,
  cariDocno,
  daftarSentItem,
  isianForm,
  ItemSent,
  lewatiTour,
  T,
  tombolCopySource,
  tolakAkses,
  tombolSelect,
  tutupModal,
  tutupSwal,
} from '../helpers/copy-source';
import { hasil, langkah, mulaiCase } from '../helpers/evidence';
import { nadia, waitForNadia } from '../helpers/nav';
import { uat } from '../helpers/uat';
import { expect, test } from '../fixtures';

// UAT sheet "Copy Source": satu test = satu case = satu video evidence. Role: staff (drafter)
// npm run test:evidence -- uat-copy-source --project=workflow --workers=1
const AKTOR: RoleSlug = 'staff';
const MAKS_COBA = 3; // docno sejenis yang dicoba sebelum case positif dinyatakan gagal

// submenu Compose memakai nama menu NADIA (alias manual book: Official Memo = Nota Dinas, dst.)
// TODO(verifikasi): nama submenu Official Letter / Invitation dan teks jenis di kolom pertama Sent Item
const JENIS = [
  {
    nama: 'Nota Dinas',
    env: 'NADIA_CS_NOTA_DINAS',
    submenu: 'Official Memo',
    sama: /^(nota dinas|official memo)/i,
    beda: /(undangan|invitation)/i,
    bedaNama: 'Surat Undangan',
    ids: { form: 'CS-01', sama: ['CS-02', 'CS-06'], beda: ['CS-03', 'CS-07'], kirim: ['CS-04', 'CS-08'], ubah: ['CS-05', 'CS-09'] },
  },
  {
    nama: 'Surat Dinas Keluar',
    env: 'NADIA_CS_SURAT_DINAS_KELUAR',
    submenu: 'Official Letter',
    sama: /^(surat dinas keluar|official letter)/i,
    beda: /^(nota dinas|official memo)/i,
    bedaNama: 'Nota Dinas',
    ids: { form: 'CS-10', sama: ['CS-11', 'CS-15'], beda: ['CS-12', 'CS-16'], kirim: ['CS-13', 'CS-17'], ubah: ['CS-14', 'CS-18'] },
  },
  {
    nama: 'Surat Undangan',
    env: 'NADIA_CS_UNDANGAN',
    submenu: 'Invitation',
    sama: /(undangan|invitation)/i,
    beda: /^(nota dinas|official memo)/i,
    bedaNama: 'Nota Dinas',
    ids: { form: 'CS-19', sama: ['CS-20', 'CS-24'], beda: ['CS-21', 'CS-25'], kirim: ['CS-22', 'CS-26'], ubah: ['CS-23', 'CS-27'] },
  },
] as const;

async function mulai(as: (r: RoleSlug) => Promise<Page>, id: string, skenario: string) {
  const user = await as(AKTOR);
  mulaiCase(user, id, skenario);
  await langkah(user, 'Buka NADIA', async () => {
    await user.goto(NADIA_HOME);
    await waitForNadia(user);
  });
  return user;
}

// docno uji dari .env (dibuat sendiri oleh AKTOR). Sent Item juga berisi surat mirroring tim
// yang tidak boleh di-copy (403), jadi docno dari .env lebih diutamakan. Boleh lebih dari satu, pisahkan koma
const docnoEnv = (label: string) => {
  const j = JENIS.find((x) => x.nama === label);
  return (process.env[j?.env ?? ''] ?? '').split(',').map((d) => d.trim()).filter(Boolean);
};

async function ambilDocno(user: Page, pola: RegExp, label: string): Promise<ItemSent[]> {
  const dariEnv = docnoEnv(label);
  if (dariEnv.length) {
    // tetap tampilkan dokumennya di Sent Item supaya video evidence menunjukkan sumber docno
    await langkah(user, `Cari ${dariEnv[0]} (${label}) di Sent Item`, async () => {
      const app = nadia(user);
      await bukaSentItem(user);
      await lewatiTour(app);
      await app.locator('.dataTables_filter input, .dt-search input').first().fill(dariEnv[0]).catch(() => {});
      await expect.soft(app.locator('table tbody tr').first(), `${dariEnv[0]} tidak ditemukan di Sent Item ${AKTOR}`).toContainText(dariEnv[0], T);
    });
    return dariEnv.map((docno) => ({ docno, jenis: label }));
  }
  return langkah(user, `Ambil No. Document ${label} dari Sent Item`, async () => {
    const semua = await daftarSentItem(user);
    const cocok = semua.filter((s) => pola.test(s.jenis));
    test.skip(!cocok.length, `Sent Item ${AKTOR} belum punya dokumen ${label} (jenis yang ada: ${[...new Set(semua.map((s) => s.jenis))].join(', ') || '-'})`);
    return cocok;
  });
}

for (const j of JENIS) {
  test.describe(`Copy Source ${j.nama}`, () => {
    test(`${j.ids.form} Masuk ke Halaman Form ${j.nama}`, { tag: ['@uat', '@bab04'], annotation: uat('Copy Source', j.ids.form) }, async ({ as }) => {
      const user = await mulai(as, j.ids.form, `Masuk ke Halaman Form ${j.nama}`);
      await langkah(user, `Compose → ${j.submenu}`, () => bukaForm(user, j.submenu));
      await expect(tombolCopySource(nadia(user))).toBeVisible(T);
      await hasil(user, `form ${j.nama} tampil`);
    });

    for (const id of j.ids.sama) {
      test(`${id} Copy Source No. Document ${j.nama} (tipe sama)`, { tag: ['@uat', '@bab04'], annotation: uat('Copy Source', id) }, async ({ as }) => {
        const user = await mulai(as, id, `Copy Source No. Document ${j.nama} dari Sent Item (tipe sama)`);
        const app = nadia(user);
        const kandidat = (await ambilDocno(user, j.sama, j.nama)).slice(0, MAKS_COBA);
        await langkah(user, `Compose → ${j.submenu}`, () => bukaForm(user, j.submenu));

        let dipakai: ItemSent | undefined;
        const ditolak: string[] = [];
        for (const k of kandidat) {
          const ok = await langkah(user, `Copy Source → input ${k.docno} → Search`, async () => {
            const res = await cariDocno(user, k.docno);
            if (res.status() < 400) return true;
            ditolak.push(`${k.docno} (${res.status()}: ${await tutupSwal(app)})`);
            await tutupModal(app);
            return false;
          });
          if (ok) {
            dipakai = k;
            break;
          }
        }
        if (ditolak.length) test.info().annotations.push({ type: 'temuan', description: `docno ${j.nama} sejenis ditolak: ${ditolak.join('; ')}` });
        expect(dipakai, `tidak ada docno ${j.nama} yang bisa dipakai: ${ditolak.join('; ')}`).toBeDefined();
        await expect(tombolSelect(app), 'reference document tidak tampil').toBeVisible(T);
        await hasil(user, `reference document ${dipakai!.docno} tampil`);
      });
    }

    for (const id of j.ids.beda) {
      test(`${id} Copy Source No. Document ${j.bedaNama} di form ${j.nama} (tipe berbeda)`, { tag: ['@uat', '@bab04'], annotation: uat('Copy Source', id) }, async ({ as }) => {
        const user = await mulai(as, id, `Copy Source No. Document ${j.bedaNama} di form ${j.nama} (tipe berbeda)`);
        const app = nadia(user);
        const [k] = await ambilDocno(user, j.beda, j.bedaNama);
        await langkah(user, `Compose → ${j.submenu}`, () => bukaForm(user, j.submenu));
        const sebelum = await isianForm(app);

        await langkah(user, `Copy Source → input ${k.docno} (${k.jenis}) → Search`, async () => {
          const res = await cariDocno(user, k.docno);
          const pesan = await tutupSwal(app);
          test.info().annotations.push({ type: 'pesan penolakan', description: `${k.docno} → ${res.status()}: ${pesan || '(tanpa pesan)'}` });
          expect(res.status(), `docno tipe berbeda harus ditolak, server membalas ${res.status()}`).toBeGreaterThanOrEqual(400);
          // ditolak karena bukan pemilik dokumen tidak membuktikan validasi tipe: data uji harus docno yang bisa di-copy di form jenisnya sendiri
          expect(tolakAkses(pesan), `${k.docno} ditolak karena hak akses ("${pesan}"), bukan karena tipe berbeda; ganti data uji`).toBe(false);
          await expect(tombolSelect(app), 'reference document tipe berbeda tidak boleh tampil').toBeHidden();
        });
        await langkah(user, 'Tutup Copy Source: form tetap kosong', async () => {
          await tutupModal(app);
          expect(await isianForm(app), 'form terisi padahal docno ditolak').toEqual(sebelum);
        });
        await hasil(user, 'reference document tidak tampil (ditolak)');
      });
    }

    // TODO(codegen): langkah Submit/Send setelah Select (tombol, konfirmasi, pemaraf/penandatangan) belum direkam.
    // PERHATIAN: surat benar-benar terkirim ke penerima dokumen sumber di staging.
    for (const id of [...j.ids.kirim, ...j.ids.ubah]) {
      const ubah = (j.ids.ubah as readonly string[]).includes(id);
      test.fixme(`${id} Send ${j.nama} dari Copy Source ${ubah ? 'dengan mengubah' : 'tanpa mengubah'} isi field`, { tag: ['@uat', '@bab04'], annotation: uat('Copy Source', id) }, async () => {});
    }
  });
}
