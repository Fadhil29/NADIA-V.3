import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// BAB 20 - Tagging Discussion
// Aktor : staff -> atasan
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB20 Tagging Discussion: tag @name.user muncul di Discussion', { tag: ['@bab20', '@tier3'] }, async ({ as }) => {
  const perihal = `${uniqueTag('TAG')} uji automation`;

  await test.step('Staff: Draft > buka detail dokumen > section Discussion > tag atasan dengan "@name.user"', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. buka menu Draft, pilih dokumen draft
    //   2. klik perihal untuk detail
    //   3. di section Discussion tulis tag "@name.user"
    //   4. kirim komentar
    // CEK (manual): hasil tagging tampil di field Discussion
  });

  await test.step('Atasan: notifikasi tag muncul dan komentar tampil (dari spec lama, di luar manual)', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. cek notifikasi
    // CEK (manual): notifikasi tag muncul, komentar tampil
  });
});
