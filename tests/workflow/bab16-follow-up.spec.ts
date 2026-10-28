import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// BAB 16 - Follow Up / Tindak Lanjut
// Aktor : staff -> atasan
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB16 Follow Up: kirim tindak lanjut dengan message dan attachment dari Inbox', { tag: ['@bab16', '@tier2'] }, async ({ as }) => {
  const perihal = `${uniqueTag('FOLLOW')} uji automation`;

  await test.step('Staff: kirim surat ke atasan', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. Compose, kirim (perihal variabel)
  });

  await test.step('Atasan: Inbox > pilih data > action button > "Follow Up/Report" > isi message dan attachment', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. buka Inbox, pilih salah satu data
    //   2. klik action button
    //   3. klik "Follow Up/Report"
    //   4. isi message dan tambah attachment (sesuai kebutuhan), kirim
    // CEK (manual): pop up fitur Follow Up tampil
    // CEK (manual): tindak lanjut terkirim
    // CEK (manual): status tindak lanjut ter-update (dari spec lama, di luar manual)
  });
});
