import { Page } from '@playwright/test';
import { expect, test } from '../../config/fixtures';
import { NADIA_HOME, RoleSlug } from '../../config/roles';
import { getData } from '../../config/testdata';
import { uat } from '../../config/uat';
import { ComposePage } from '../../pages/compose.page';
import { CopySourceModal, tolakAkses } from '../../pages/copy-source.modal';
import { T, waitForNadia } from '../../pages/nadia-shell';
import { ItemSent, SentItemPage } from '../../pages/sent-item.page';
import { hasil, langkah, mulaiCase } from '../../utils/evidence';

// UAT sheet "Copy Source": satu test = satu case = satu video evidence. Role: staff (drafter)
// npm run test:evidence -- copy-source --project=uat
const AKTOR: RoleSlug = 'staff';
const MAKS_COBA = 3; // docno sejenis yang dicoba sebelum case positif dinyatakan gagal

// No. Document milik AKTOR per jenis: data/<ENV>/copy-source.json
// (Sent Item juga berisi surat mirroring tim yang ditolak 403, jadi data uji ditentukan manual)
const DATA = getData<Record<string, string[]>>('copy-source');

// submenu Compose memakai nama menu NADIA (alias manual book: Official Memo = Nota Dinas, dst.)
const JENIS = [
  {
    nama: 'Nota Dinas',
    submenu: 'Official Memo',
    sama: /^(nota dinas|official memo)/i,
    beda: /(undangan|invitation)/i,
    bedaNama: 'Surat Undangan',
    ids: { form: 'CS-01', sama: ['CS-02', 'CS-06'], beda: ['CS-03', 'CS-07'], kirim: ['CS-04', 'CS-08'], ubah: ['CS-05', 'CS-09'] },
  },
  {
    nama: 'Surat Dinas Keluar',
    submenu: 'Official Letter',
    sama: /^(surat dinas keluar|official letter)/i,
    beda: /^(nota dinas|official memo)/i,
    bedaNama: 'Nota Dinas',
    ids: { form: 'CS-10', sama: ['CS-11', 'CS-15'], beda: ['CS-12', 'CS-16'], kirim: ['CS-13', 'CS-17'], ubah: ['CS-14', 'CS-18'] },
  },
  {
    nama: 'Surat Undangan',
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

// pakai No. Document dari data uji; kalau kosong, ambil dari tabel Sent Item
async function ambilDocno(user: Page, pola: RegExp, label: string): Promise<ItemSent[]> {
  const sentItem = new SentItemPage(user);
  const dariData = DATA[label] ?? [];
  if (dariData.length) {
    // tetap tampilkan dokumennya di Sent Item supaya video evidence menunjukkan sumber docno
    await langkah(user, `Cari ${dariData[0]} (${label}) di Sent Item`, () => sentItem.cari(dariData[0]));
    return dariData.map((docno) => ({ docno, jenis: label }));
  }
  return langkah(user, `Ambil No. Document ${label} dari Sent Item`, async () => {
    const semua = await sentItem.daftar();
    const cocok = semua.filter((s) => pola.test(s.jenis));
    test.skip(!cocok.length, `Sent Item ${AKTOR} belum punya dokumen ${label} (jenis yang ada: ${[...new Set(semua.map((s) => s.jenis))].join(', ') || '-'})`);
    return cocok;
  });
}

for (const j of JENIS) {
  test.describe(`Copy Source ${j.nama}`, () => {
    test(`${j.ids.form} Masuk ke Halaman Form ${j.nama}`, { tag: ['@uat', '@copy-source'], annotation: uat('Copy Source', j.ids.form) }, async ({ as }) => {
      const user = await mulai(as, j.ids.form, `Masuk ke Halaman Form ${j.nama}`);
      const compose = new ComposePage(user);
      await langkah(user, `Compose → ${j.submenu}`, () => compose.buka(j.submenu));
      await expect(compose.penandaForm()).toBeVisible(T);
      await hasil(user, `form ${j.nama} tampil`);
    });

    for (const id of j.ids.sama) {
      test(`${id} Copy Source No. Document ${j.nama} (tipe sama)`, { tag: ['@uat', '@copy-source'], annotation: uat('Copy Source', id) }, async ({ as }) => {
        const user = await mulai(as, id, `Copy Source No. Document ${j.nama} dari Sent Item (tipe sama)`);
        const copySource = new CopySourceModal(user);
        const kandidat = (await ambilDocno(user, j.sama, j.nama)).slice(0, MAKS_COBA);
        await langkah(user, `Compose → ${j.submenu}`, () => new ComposePage(user).buka(j.submenu));

        let dipakai: ItemSent | undefined;
        const ditolak: string[] = [];
        for (const k of kandidat) {
          const ok = await langkah(user, `Copy Source → input ${k.docno} → Search`, async () => {
            const res = await copySource.cari(k.docno);
            if (res.status() < 400) return true;
            ditolak.push(`${k.docno} (${res.status()}: ${await copySource.tutupPesan()})`);
            await copySource.tutup();
            return false;
          });
          if (ok) {
            dipakai = k;
            break;
          }
        }
        if (ditolak.length) test.info().annotations.push({ type: 'temuan', description: `docno ${j.nama} sejenis ditolak: ${ditolak.join('; ')}` });
        expect(dipakai, `tidak ada docno ${j.nama} yang bisa dipakai: ${ditolak.join('; ')}`).toBeDefined();
        await expect(copySource.tombolSelect(), 'reference document tidak tampil').toBeVisible(T);
        await hasil(user, `reference document ${dipakai!.docno} tampil`);
      });
    }

    for (const id of j.ids.beda) {
      test(`${id} Copy Source No. Document ${j.bedaNama} di form ${j.nama} (tipe berbeda)`, { tag: ['@uat', '@copy-source'], annotation: uat('Copy Source', id) }, async ({ as }) => {
        const user = await mulai(as, id, `Copy Source No. Document ${j.bedaNama} di form ${j.nama} (tipe berbeda)`);
        const compose = new ComposePage(user);
        const copySource = new CopySourceModal(user);
        const [k] = await ambilDocno(user, j.beda, j.bedaNama);
        await langkah(user, `Compose → ${j.submenu}`, () => compose.buka(j.submenu));
        const sebelum = await compose.isianStabil();

        await langkah(user, `Copy Source → input ${k.docno} (${k.jenis}) → Search`, async () => {
          const res = await copySource.cari(k.docno);
          const pesan = await copySource.tutupPesan();
          test.info().annotations.push({ type: 'pesan penolakan', description: `${k.docno} → ${res.status()}: ${pesan || '(tanpa pesan)'}` });
          expect(res.status(), `docno tipe berbeda harus ditolak, server membalas ${res.status()}`).toBeGreaterThanOrEqual(400);
          // ditolak karena bukan pemilik dokumen tidak membuktikan validasi tipe
          expect(tolakAkses(pesan), `${k.docno} ditolak karena hak akses ("${pesan}"), bukan karena tipe berbeda; ganti data uji`).toBe(false);
          await expect(copySource.tombolSelect(), 'reference document tipe berbeda tidak boleh tampil').toBeHidden();
        });
        await langkah(user, 'Tutup Copy Source: form tetap kosong', async () => {
          await copySource.tutup();
          const baru = ComposePage.isianBaru(sebelum, await compose.isianStabil());
          expect(baru, `form terisi padahal docno ditolak. Isian baru: ${baru.join(' | ')}`).toEqual([]);
        });
        await hasil(user, 'reference document tidak tampil (ditolak)');
      });
    }

    // TODO(codegen): langkah Submit/Send setelah Select belum direkam.
    // PERHATIAN: surat benar-benar terkirim ke penerima dokumen sumber di staging.
    for (const id of [...j.ids.kirim, ...j.ids.ubah]) {
      const ubah = (j.ids.ubah as readonly string[]).includes(id);
      test.fixme(`${id} Send ${j.nama} dari Copy Source ${ubah ? 'dengan mengubah' : 'tanpa mengubah'} isi field`, { tag: ['@uat', '@copy-source'], annotation: uat('Copy Source', id) }, async () => {});
    }
  });
}
