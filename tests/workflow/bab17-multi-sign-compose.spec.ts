import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// BAB 17 - Multi-Sign Compose
// Aktor : staff (drafter) -> atasan (initial signer) -> atasan2 (initial signer) -> staff
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// CATATAN: Aturan inti dari manual: dokumen yang punya initial signer WAJIB menyelesaikan penandatanganan dulu agar bisa dikirim.
// CATATAN: Alur Reject juga harus dites (status initial "Rejected"), pakai teknik decision table: approve/reject per initial signer.
// CATATAN: Spec multi-atasan.spec.ts lama tumpang tindih dengan BAB ini dan dipindah ke out-of-manual/.
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB17 Multi-Sign Compose: dokumen belum bisa dikirim sebelum semua initial approve', { tag: ['@bab17', '@tier1'] }, async ({ as }) => {
  const perihal = `${uniqueTag('MSIGN')} uji automation`;

  await test.step('Staff: Compose > Nota Dinas > isi form > Initial List > Add Initial (pilih branch lalu pejabat) > Submit', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. klik menu Compose, buka Nota Dinas
    //   2. isi semua field
    //   3. buka accordion panel "Initial List"
    //   4. klik "Add Initial"
    //   5. pilih branch, pilih pejabat, klik Submit
    // CEK (manual): pejabat muncul di list datatable initial dengan status "New Initial"
    // CEK (manual): dokumen belum bisa dikirim sebelum paraf selesai (perilaku persis dari codegen)
  });

  await test.step('Atasan (initial signer): Draft > detail > section initial list > Approval > approve', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. buka menu Draft, buka detail draft yang butuh approval initial
    //   2. buka section initial list
    //   3. klik "Approval"
    //   4. pilih action approve
    // CEK (manual): status initial berubah "Approved"
  });

  await test.step('Atasan 2 (initial signer): approve atau reject, urutan sesuai setting', async () => {
    const atasan2 = await as('atasan2');
    await atasan2.goto(NADIA_HOME);
    // TODO(codegen atasan2):
    //   1. ulangi langkah approval sebagai initial signer kedua
    // CEK (manual): status "Approved"; jika ditolak statusnya "Rejected"
  });

  await test.step('Staff: setelah semua paraf selesai dokumen bisa dikirim', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. buka Draft, kirim dokumen
    // CEK (manual): dokumen terkirim, status final sesuai
  });
});
