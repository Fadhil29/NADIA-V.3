import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// BAB 18 - Move Document
// Aktor : staff -> atasan -> atasan2 (tujuan, asumsi: manual tidak menyebut akun tujuan)
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// CATATAN: Akun tujuan Move belum jelas di manual. Spec lama memakai staff-dispo, sekarang diasumsikan atasan2. Konfirmasi.
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB18 Move Document: dokumen dipindah ke pihak tujuan lewat Inbox > Move', { tag: ['@bab18', '@tier2'] }, async ({ as }) => {
  const perihal = `${uniqueTag('MOVE')} uji automation`;

  await test.step('Staff: kirim surat ke atasan', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. Compose, kirim (perihal variabel)
  });

  await test.step('Atasan: Inbox > pilih dokumen > action button > Move > isi field > Submit', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. buka Inbox, pilih dokumen
    //   2. klik action button, pilih "Move"
    //   3. isi semua field, klik "Submit"
    // CEK (manual): status dokumen menampilkan dokumen resmi yang dijadikan referensi
  });

  await test.step('Pihak tujuan: dokumen ada di lokasi baru (dari spec lama, di luar manual)', async () => {
    const atasan2 = await as('atasan2');
    await atasan2.goto(NADIA_HOME);
    // TODO(codegen atasan2):
    //   1. buka Inbox pihak tujuan
    // CEK (manual): dokumen ada di lokasi baru
    // CEK (manual): tidak duplikat di lokasi lama
  });
});
