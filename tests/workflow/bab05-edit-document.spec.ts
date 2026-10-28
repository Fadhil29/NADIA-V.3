import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// BAB 5 - Edit Document
// Aktor : staff -> atasan -> staff
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// CATATAN: Skenario "edit setelah 24 jam harus ditolak" (bug lama: validasi 24 jam bisa di-bypass) TIDAK bisa dites dengan menunggu 24 jam.
// CATATAN: Opsi: pakai dokumen lama yang memang sudah lewat 24 jam, atau cek di level API. page.clock hanya menguji sisi client.
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB05 Edit Document: ubah dokumen terkirim dari Sent Item', { tag: ['@bab05', '@tier1'] }, async ({ as }) => {
  const perihal = `${uniqueTag('EDIT')} uji automation`;

  await test.step('Staff: Compose Official Memo (Choose Template Destination, To, Message, lampiran opsional) lalu kirim', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. Compose > Official Memo/Nota Dinas
    //   2. Choose Template Destination dan isi penerima (To)
    //   3. isi Message, lampiran (opsional)
    //   4. kirim, perihal pakai variabel perihal
  });

  await test.step('Staff: Sent Item > action button > Edit Document, ubah To/Cc/Message lalu kirim', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. buka Sent Item
    //   2. klik action button pada surat
    //   3. pilih "Edit Document"
    //   4. tambah tujuan (To), tembusan (Cc), ubah Message
    // CEK (manual): form Official Memo terbuka lagi dengan data sebelumnya
  });

  await test.step('Staff: buka detail dokumen setelah edit', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. klik detail dokumen
    // CEK (manual): perihal, tanggal kirim, dan lampiran sesuai hasil edit
  });

  await test.step('Atasan: inbox menampilkan versi terbaru dan historical document (dari spec lama, di luar manual)', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. buka Inbox, buka dokumen
    // CEK (manual): versi terbaru tampil, historical document tersedia
  });

  await test.step('Staff: edit setelah 24 jam harus ditolak (dari spec lama, di luar manual)', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. lihat catatan di atas soal cara mensimulasikan >24 jam
    // CEK (manual): edit ditolak (bug lama: validasi bisa di-bypass)
  });
});
