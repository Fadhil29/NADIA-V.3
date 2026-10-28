import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';

// BAB 2 - Export PDF Dashboard Admin
// Aktor : admin
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// CATATAN: Unduhan: pakai page.waitForEvent("download"). Isi PDF belum punya oracle; minimal cek file terunduh dan tidak kosong.
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB02 Export PDF Dashboard: laporan terunduh sesuai Location dan Periode', { tag: ['@bab02', '@tier3'] }, async ({ as }) => {
  await test.step('Admin: Dashboard > pilih Location (contoh Regional 1) dan Periode (tahun) > Export PDF', async () => {
    const admin = await as('admin');
    await admin.goto(NADIA_HOME);
    // TODO(codegen admin):
    //   1. buka Dashboard
    //   2. isi Location (lokasi kerja / Regional)
    //   3. isi Periode (tahun)
    //   4. klik tombol "Export PDF" di kanan atas
    // CEK (manual): file PDF terunduh (Document Management Report), ukuran > 0
  });
});
