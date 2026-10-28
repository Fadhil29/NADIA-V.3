import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// aktor (asumsi, konfirmasi ke PM): staff -> atasan
// hapus .fixme setelah langkah TODO terisi
test.fixme('Tagging Discussion', async ({ as }) => {
  const perihal = `${uniqueTag('TAG')} uji automation`;

  await test.step('Staff: kirim surat lalu tag atasan di discussion', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun staff
  });

  await test.step('Atasan: notifikasi tag muncul dan komentar tampil', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun atasan
  });
});
