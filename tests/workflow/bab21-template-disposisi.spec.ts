import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// BAB 21 - Template & Disposisi
// Aktor : atasan (pejabat pembuat template)
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// CATATAN: Tujuan fitur: grup penerima terstandar menekan risiko salah tujuan. Uji juga multi user dan toggle favorit.
// CATATAN: Template tipe Compose (BAB 21.1.1) belum ada rincian langkah di manual.
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB21 Template Disposisi: template favorit muncul sebagai checkbox dan mengisi penerima otomatis', { tag: ['@bab21', '@tier1'] }, async ({ as }) => {
  const perihal = `${uniqueTag('TPLDISPO')} uji automation`;

  await test.step('Atasan: Others > Templates > Create New > isi nama, tipe, branch user, single/multiple user > Submit', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. buka menu "Others", sub menu "Templates"
    //   2. klik "Create New"
    //   3. isi nama template
    //   4. pilih tipe Compose/Disposisi
    //   5. pilih branch user
    //   6. pilih single atau multiple user, klik Submit
    // CEK (manual): template tersimpan dan berada di urutan paling atas
  });

  await test.step('Atasan: favoritkan template dengan klik star di kolom Fav', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. klik icon bintang di kolom "Fav"
    // CEK (manual): kuning = favorit aktif, abu-abu = nonaktif
  });

  await test.step('Atasan: Inbox > Historical Inbox > Disposition > pilih template favorit', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. buka Inbox, buka historical inbox salah satu surat masuk
    //   2. klik "Disposition"
    //   3. klik checkbox template favorit
    // CEK (manual): template favorit tampil sebagai checkbox
    // CEK (manual): user-user pada template otomatis tampil saat checkbox diklik
  });
});
