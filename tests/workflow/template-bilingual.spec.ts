import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// aktor (asumsi, konfirmasi ke PM): staff -> atasan
// hapus .fixme setelah langkah TODO terisi
test.fixme('Template Bilingual', async ({ as }) => {
  const perihal = `${uniqueTag('BILING')} uji automation`;

  await test.step('Staff: compose pakai template bilingual lalu kirim', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun staff
  });

  await test.step('Atasan: isi dan preview dua bahasa tampil benar', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun atasan
  });
});
