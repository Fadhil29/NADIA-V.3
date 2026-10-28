import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// BAB 8 - Form Konfirmasi Anggaran (NKA)
// Aktor : staff (drafter) -> atasan (main signer)
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// CATATAN: Status menurut manual: Draft (masih disusun di staff/pejabat non Main Signer), Waiting for approval (sudah di-forward ke Main Signer), Approve, Rejected.
// CATATAN: Cocok dites dengan state transition. Approve/Reject oleh Main Signer ada di BAB 13 dan 14.
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB08 NKA: buat form, forward draft, dan status berubah sesuai alur', { tag: ['@bab08', '@tier1'] }, async ({ as }) => {
  const perihal = `${uniqueTag('NKA')} uji automation`;

  await test.step('Staff: Budget Reservation > Create Form > lengkapi unit kerja, PIC, klasifikasi, rincian Work Program', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. buka menu "Budget Reservation"
    //   2. klik "Create Form"
    //   3. isi unit kerja, PIC, klasifikasi, Work Program
    // CEK (manual): status awal: Draft
  });

  await test.step('Staff: submit/forward draft ke diri sendiri atau ke atasan', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. klik submit/forward draft ke diri sendiri
    //   2. ulangi forward ke atasan (Main Signer)
    // CEK (manual): status "Waiting for approval" setelah di-forward ke Main Signer
  });
});
