import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';

// BAB 3 - Active/Inactive Role
// Aktor : admin (aktor tidak disebut di manual, diasumsikan admin)
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// CATATAN: EFEK SAMPING: mengubah role mempengaruhi akun lain. Wajib restore status awal di finally, jangan jalan paralel, jangan sampai mengunci akun test.
// CATATAN: Catat status awal role sebelum toggle supaya bisa dikembalikan.
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB03 Active/Inactive Role: toggle role menampilkan disclaimer dan mengubah status card', { tag: ['@bab03', '@tier1'] }, async ({ as }) => {
  await test.step('Admin: toggle on/off pada profile card role', async () => {
    const admin = await as('admin');
    await admin.goto(NADIA_HOME);
    // TODO(codegen admin):
    //   1. catat status awal role (ON/OFF)
    //   2. klik toggle switch on/off pada profile card
    //   3. RESTORE status awal di blok finally
    // CEK (manual): muncul kotak dialog Information/Disclaimer berisi ketentuan penggunaan role
    // CEK (manual): setelah role diaktifkan: card berwarna dan berstatus "ON"
  });
});
