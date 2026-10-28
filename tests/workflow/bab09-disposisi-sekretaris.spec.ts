import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// BAB 9 - Disposisi Sekretaris
// Aktor : staff (drafter) -> atasan (pejabat penerima) -> sekretaris
// Sumber: Manual_Book_NADIA_V3.pptx. Tier = usulan sementara (belum berdasar defect history).
// CATATAN: Aktor sekretaris belum punya akun di ROLES/.env. Tambahkan dulu sebelum menghapus .fixme.
// Hapus .fixme setelah semua TODO terisi dari codegen. Jangan menebak selector.
test.fixme('BAB09 Disposisi Sekretaris: nodin didisposisikan ke sekretaris dan ditandai di inbox sekretaris', { tag: ['@bab09', '@tier1'] }, async ({ as }) => {
  const perihal = `${uniqueTag('DISPOSEK')} uji automation`;

  await test.step('Staff (drafter): kirim Nota Dinas ke pejabat', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO(codegen staff):
    //   1. isi semua form Nota Dinas, kirim (perihal variabel)
  });

  await test.step('Atasan (pejabat penerima): Inbox > detail nodin > Historical Inbox > Disposition > Add New Disposition ke sekretaris', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO(codegen atasan):
    //   1. buka Inbox, pilih nota dinas yang baru diterima
    //   2. klik detail nota dinas
    //   3. pada Historical Inbox klik "Disposition"
    //   4. lengkapi form Add New Disposition dengan tujuan sekretaris, kirim
  });

  await test.step('Sekretaris: Inbox > sub menu "Sekretaris"', async () => {
    const sekretaris = await as('sekretaris');
    await sekretaris.goto(NADIA_HOME);
    // TODO(codegen sekretaris):
    //   1. klik menu Inbox, buka sub menu "Sekretaris"
    // CEK (manual): surat yang didisposisikan ditandai warna kuning
  });
});
