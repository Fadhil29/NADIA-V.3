import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// BAB 13 - Attachment Form Konfirmasi Anggaran
// Aktor : staff (drafter) -> atasan (main signer)
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// CATATAN: Isi BAB 13 di manual sebenarnya alur forward + approval Main Signer, bukan upload lampiran. Judul BAB tidak sesuai isi.
// CATATAN: Cek lampiran (tests/files/contoh.pdf) tampil dan bisa diunduh masuk sebagai tambahan dari spec lama.
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB13 NKA: forward ke Main Signer lalu approve mengubah status ke Approved', { tag: ['@bab13', '@tier1'] }, async ({ as }) => {
  const perihal = `${uniqueTag('NKAATT')} uji automation`;

  await test.step('Staff: Budget Reservation > Create Form > isi semua field > forward draft ke Main Signer', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. buka "Budget Reservation", klik "Create Form"
    //   2. isi semua field
    //   3. forward draft ke penandatangan utama
    // CEK (manual): status berubah menjadi "Waiting Approval"
  });

  await test.step('Atasan (Main Signer): Budget Reservation > buka detail > Approve', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. buka "Budget Reservation"
    //   2. klik perihal NKA untuk melihat detail
    //   3. klik Approve
    // CEK (manual): muncul pop up konfirmasi approval
    // CEK (manual): muncul pop up berhasil menyetujui
    // CEK (manual): status berubah menjadi "Approved"
  });

  await test.step('Atasan: lampiran tampil dan bisa diunduh (dari spec lama, di luar manual)', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. cek lampiran tests/files/contoh.pdf
    // CEK (manual): lampiran tampil dan bisa diunduh
  });
});
