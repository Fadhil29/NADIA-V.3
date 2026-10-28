import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// BAB 6 - Hide Document
// Aktor : staff
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB06 Hide Document: dokumen disembunyikan dan tercatat di Trash', { tag: ['@bab06', '@tier2'] }, async ({ as }) => {
  const perihal = `${uniqueTag('HIDE')} uji automation`;

  await test.step('Staff: kirim surat lalu Sent Item > Action > Hide Document > isi Reason > Send', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. kirim surat (perihal variabel)
    //   2. buka Sent Item
    //   3. klik Action pada dokumen, pilih "Hide Document"
    //   4. isi Reason, klik "Send"
  });

  await test.step('Staff: dokumen ada di Trash dengan Reason dan Hidden By', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. buka menu "Trash"
    // CEK (manual): baris dokumen tampil beserta Reason dan Hidden By
  });

  await test.step('Staff: dokumen tidak tampil di list dan Copy Source menampilkan "Document not found" (dari spec lama, di luar manual)', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. cek Sent Item tidak lagi menampilkan dokumen
    //   2. coba Copy Source dengan Docno dokumen itu
    // CEK (manual): pesan "Document not found"
  });
});
