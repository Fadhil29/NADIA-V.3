import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';

// BAB 1 - Dashboard Admin
// Aktor : admin
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// CATATAN: Angka di dashboard belum punya oracle (API/DB). Sampai ada, test ini hanya cek komponen tampil, BUKAN kebenaran angka.
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB01 Dashboard Admin menampilkan ringkasan dan grafik', { tag: ['@bab01', '@tier3'] }, async ({ as }) => {
  await test.step('Admin: buka menu Dashboard', async () => {
    const admin = await as('admin');
    await admin.goto(NADIA_HOME);
    // TODO(codegen admin):
    //   1. login sebagai Admin, buka menu Dashboard
    // CEK (manual): ringkasan: Total Document, Active/Inactive Archives, Archive Destruction, Letter In, Letter Out, User NADIA
    // CEK (manual): peta sebaran unit kerja/cabang
    // CEK (manual): grafik Total User dan Total Documents per unit kerja, grafik Document Type
    // CEK (manual): Documents Per Month, Top 5 Unit Backdate, perbandingan Document Digital/Manual
  });
});
