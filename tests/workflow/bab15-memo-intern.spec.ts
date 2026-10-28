import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// BAB 15 - Memo Intern
// Aktor : staff -> atasan (main signer) -> staff
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB15 Memo Intern: buat, update draft, ditandatangani Main Signer, tampil di out/in', { tag: ['@bab15', '@tier2'] }, async ({ as }) => {
  const perihal = `${uniqueTag('MEMO')} uji automation`;

  await test.step('Staff: Memo Intern > Create Memo > isi form > forward draft ke diri sendiri atau atasan', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. buka menu Memo Intern
    //   2. klik sub menu "Create Memo"
    //   3. isi semua field (perihal variabel)
    //   4. forward ke diri sendiri atau atasan sebagai draft
  });

  await test.step('Staff: Memo Intern > Draft Memo > update perihal, Cc, message', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. buka sub menu "Draft Memo"
    //   2. klik perihal memo untuk update
    //   3. edit perihal, tambah Cc, tambah message
    // CEK (manual): perubahan tersimpan
  });

  await test.step('Atasan (Main Signer): Memo Intern > Draft Memo > buka perihal > tanda tangan', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. login sebagai Main Signer
    //   2. buka Memo Intern > Draft Memo
    //   3. klik perihal memo, tanda tangani
  });

  await test.step('Staff: memo tampil di sub menu "out", penerima melihat di "memo in"', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. buka sub menu "out"
    // CEK (manual): memo terkirim tampil di "out"
    // CEK (manual): "memo in" penerima menampilkan memo yang ditujukan kepadanya
    // CEK (manual): status memo berubah jadi disetujui (dari spec lama, di luar manual)
  });
});
