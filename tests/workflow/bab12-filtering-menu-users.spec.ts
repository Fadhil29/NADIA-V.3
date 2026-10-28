import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';

// BAB 12 - Filtering Menu Users (Admin)
// Aktor : admin HO (akun ada); admin regional dan admin cabang (belum ada akun)
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// CATATAN: Pindahan dari tests/access/filtering-menu-user-admin.spec.ts. Asersi lama (baris pertama kelihatan) terlalu lemah: cek SEMUA baris hasil sesuai filter.
// CATATAN: Risiko RBAC utama: admin regional/cabang tidak boleh melihat data di luar scope-nya. Butuh akun admin regional dan cabang.
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB12 Filtering Menu Users: hasil filter Location dan Branch sesuai kriteria', { tag: ['@bab12', '@tier1'] }, async ({ as }) => {
  await test.step('Admin HO: menu User Admin, filter Location (HO, Reg 1-6) dan Branch', async () => {
    const admin = await as('admin');
    await admin.goto(NADIA_HOME);
    // TODO(codegen admin):
    //   1. buka menu User Admin
    //   2. pakai filter Location
    //   3. pakai filter Branch
    // CEK (manual): semua baris hasil sesuai kriteria filter
  });
});

test.fixme('BAB12 Filtering Menu Users: admin regional/cabang hanya melihat data scope-nya', { tag: ['@bab12', '@tier1'] }, async ({ as }) => {
  await test.step('Admin Regional: filter hanya menampilkan user dalam scope regionalnya', async () => {
    const adminRegional = await as('admin-regional');
    await adminRegional.goto(NADIA_HOME);
    // TODO(codegen admin-regional):
    //   1. buka menu User Admin
    //   2. coba filter Location ke regional lain
    // CEK (manual): data di luar scope tidak tampil/tidak bisa diakses
  });

  await test.step('Admin Cabang: filter hanya menampilkan user dalam scope cabangnya', async () => {
    const adminCabang = await as('admin-cabang');
    await adminCabang.goto(NADIA_HOME);
    // TODO(codegen admin-cabang):
    //   1. buka menu User Admin
    //   2. coba filter Branch ke cabang lain
    // CEK (manual): data di luar scope tidak tampil/tidak bisa diakses
  });
});
