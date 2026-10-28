import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// BAB 10 - Reply & Forward
// Aktor : staff -> atasan (penerima nodin)
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// CATATAN: Reply dan Forward dua alur terpisah; pertimbangkan dua test setelah langkah dari codegen terisi.
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB10 Reply & Forward: referensi balasan/forward tampil di Sent Item', { tag: ['@bab10', '@tier2'] }, async ({ as }) => {
  const perihal = `${uniqueTag('REPLYFWD')} uji automation`;

  await test.step('Staff: kirim surat ke atasan', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. Compose Official Memo ke atasan, kirim (perihal variabel)
  });

  await test.step('Atasan: Inbox > dokumen > Historical Inbox > Reply, pilih jenis naskah balasan', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. buka Inbox, buka dokumen
    //   2. pada Historical Inbox klik action button "Reply"
    //   3. pilih jenis balasan: Official Memo, Official Letter, atau Invitation
    //   4. isi form dan kirim
    // CEK (manual): bagian "Reply Reference From" otomatis berisi naskah asli
    // CEK (manual): Sent Item menampilkan keterangan "Reply Reference From"
  });

  await test.step('Atasan: Inbox > dokumen > icon Forward di kolom Action, pilih jenis compose', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. klik icon Forward di kolom Action pada Historical Doc Inbox
    //   2. pilih jenis surat compose
    //   3. isi form dan kirim
    // CEK (manual): bagian "Forward Reference From" otomatis berisi naskah utama
    // CEK (manual): Sent Item menampilkan keterangan "Forward Reference From"
  });

  await test.step('Staff: reply diterima dengan thread yang benar (dari spec lama, di luar manual)', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. buka Inbox
    // CEK (manual): reply tampil dengan thread yang benar
  });
});
