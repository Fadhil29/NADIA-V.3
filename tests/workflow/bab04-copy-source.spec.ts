import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// BAB 4 - Copy Source
// Aktor : staff (drafter)
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// CATATAN: Precondition: butuh dokumen sumber dengan Docno yang sudah ada (buat dulu lewat helper atau pakai dokumen AUTO- yang sudah dikirim).
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB04 Copy Source: data dokumen sumber otomatis terisi ke form Official Memo baru', { tag: ['@bab04', '@tier2'] }, async ({ as }) => {
  const perihal = `${uniqueTag('COPY')} uji automation`;

  await test.step('Staff: Compose > Official Memo/Nota Dinas > "+ Copy Source" > input Docno > Preview > Select', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. klik menu Compose
    //   2. buka sub menu Official Memo/Nota Dinas
    //   3. klik "+ Copy Source" di kanan atas form
    //   4. input Docno dokumen sumber
    //   5. klik "Preview" untuk melihat isi
    //   6. klik "Select"
    // CEK (manual): penerima, subjek, dan isi surat dari dokumen sumber otomatis terisi ke form baru
  });
});
