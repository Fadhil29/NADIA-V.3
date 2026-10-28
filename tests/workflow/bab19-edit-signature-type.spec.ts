import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';

// BAB 19 - Edit Signature Type (Using Soon)
// Aktor : atasan (manual tidak menyebut aktor; spec lama memakai atasan)
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// CATATAN: Alur manual lewat menu Generate Number, bukan alur kirim surat. Alur surat dari spec lama (atasan -> staff -> atasan TTD) masuk sebagai langkah tambahan.
// CATATAN: Perhatian: Generate Number memakai nomor dokumen. Cek apakah data uji bisa dibersihkan atau menambah beban nomor.
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB19 Edit Signature Type: jenis tanda tangan docno Using Soon bisa diubah', { tag: ['@bab19', '@tier3'] }, async ({ as }) => {
  await test.step('Atasan: Generate Number > Generate New Document Number (Is Reserved: Using Soon, Signature: Digital Sign)', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. buka menu Generate Number
    //   2. klik "Generate New Document Number"
    //   3. Is Reserved: Using Soon, Signature: Digital Sign
    //   4. simpan
  });

  await test.step('Atasan: klik edit > ubah Signature (manual sign / digital sign)', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. klik button edit
    //   2. ubah Signature Type ke manual sign atau digital sign
    // CEK (manual): jenis tanda tangan berubah sesuai pilihan
  });

  await test.step('Staff: kirim surat ke atasan (dari spec lama, di luar manual)', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. Compose, kirim
  });

  await test.step('Atasan: tanda tangan memakai jenis yang baru (dari spec lama, di luar manual)', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. buka surat, tanda tangani
    // CEK (manual): tanda tangan memakai jenis yang baru
  });
});
