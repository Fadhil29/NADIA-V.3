import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// BAB 7 - Template Bilingual
// Aktor : staff -> atasan
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// CATATAN: Dua varian: Language Indonesia dan English. Pertimbangkan test.describe + loop atas dua bahasa setelah langkah dari codegen terisi.
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB07 Template Bilingual: lampiran dan kop surat mengikuti Language yang dipilih', { tag: ['@bab07', '@tier3'] }, async ({ as }) => {
  const perihal = `${uniqueTag('BILING')} uji automation`;

  await test.step('Staff: Compose > Invitation, Language: Indonesia, destination internal/eksternal, Message, Send Option', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. Compose > pilih Invitation
    //   2. pilih Language: Indonesia
    //   3. Choose Template Destination: Internal Corporate / External Institution
    //   4. isi Message undangan
    //   5. Attachment (opsional) dan Send Option (Draft atau dokumen resmi), kirim
    // CEK (manual): lampiran surat berbahasa Indonesia sesuai template
  });

  await test.step('Staff: Compose > Invitation, Language: English, To/CC External Institution, Message, Attachment, Complimentary, Send Option', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. pilih Language: English
    //   2. isi To/CC External Institution
    //   3. isi Message dalam bahasa Inggris
    //   4. tentukan Attachment, Complimentary, Send Option, kirim
    // CEK (manual): lampiran surat berbahasa Inggris
    // CEK (manual): alamat kop surat berbahasa Inggris
  });

  await test.step('Atasan: isi dan preview dua bahasa tampil benar (dari spec lama, di luar manual)', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. buka Inbox, buka dokumen
    // CEK (manual): isi dan preview sesuai bahasa
  });
});
