import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// BAB 14 - Delete Form Konfirmasi Anggaran
// Aktor : staff (drafter) -> atasan (main signer, reject)
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// CATATAN: "Delete" di manual sebenarnya CANCEL dengan reason, hanya dari status Rejected. Spec lama (hapus lalu hilang dari inbox atasan) tidak sesuai manual.
// CATATAN: Precondition: NKA berstatus Rejected, jadi Main Signer harus Reject dulu (detail NKA punya aksi update, reject, approve).
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB14 NKA: Cancel NKA berstatus Rejected menghasilkan status Cancelled dan masuk Trash', { tag: ['@bab14', '@tier1'] }, async ({ as }) => {
  const perihal = `${uniqueTag('NKADEL')} uji automation`;

  await test.step('Staff: buat NKA dan forward ke Main Signer', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. Budget Reservation > Create Form, isi, forward ke Main Signer
  });

  await test.step('Atasan (Main Signer): Reject NKA', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. buka detail NKA, klik Reject
    // CEK (manual): status NKA "Rejected"
  });

  await test.step('Staff: pilih NKA Rejected > action button > Cancel > isi reason > Cancel', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. buka "Budget Reservation"
    //   2. pilih data berstatus "Rejected"
    //   3. klik action button, pilih "Cancel"
    //   4. input reason cancel, klik "Cancel"
    // CEK (manual): status berubah menjadi "Cancelled"
    // CEK (manual): NKA Cancelled tampil di menu "Trash"
  });

  await test.step('Atasan: NKA yang dibatalkan tidak muncul di inbox (dari spec lama, di luar manual)', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. cek Inbox
    // CEK (manual): NKA tidak muncul
  });
});
