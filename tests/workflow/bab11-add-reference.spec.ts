import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// BAB 11 - Add Reference
// Aktor : staff -> atasan
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// CATATAN: Nomor dokumen referensi bisa diambil dari Inbox, Sent Item, dan Generate Number.
// CATATAN: Precondition: butuh minimal 2 dokumen yang sudah ada supaya urutan referensi bisa dites.
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB11 Add Reference: dokumen referensi bisa ditambah, diurutkan, dan tampil di Sent Item', { tag: ['@bab11', '@tier2'] }, async ({ as }) => {
  const perihal = `${uniqueTag('ADDREF')} uji automation`;

  await test.step('Staff: Sent Item > salin nomor dokumen > Compose > Official Memo > Add Reference > input Docno > Search > Select', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. buka Sent Item, salin nomor dokumen
    //   2. Compose > Official Memo
    //   3. klik "Add Reference"
    //   4. input Docno, Search
    //   5. review dokumen atau langsung klik "Select"
    // CEK (manual): data document reference tampil setelah dipilih
  });

  await test.step('Staff: atur urutan referensi (lebih dari satu) lalu kirim', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. tambah referensi kedua
    //   2. pindahkan urutan dengan drag up/down atau tombol up dan down
    //   3. isi form Nota Dinas, kirim
    // CEK (manual): urutan referensi sesuai pengaturan
    // CEK (manual): Sent Item menampilkan dokumen referensinya
  });

  await test.step('Atasan: surat masuk inbox, reference tampil dan bisa dibuka (dari spec lama, di luar manual)', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. buka Inbox
    // CEK (manual): reference tampil dan bisa dibuka
  });
});
