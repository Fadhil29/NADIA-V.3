import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// aktor (asumsi, konfirmasi ke PM): atasan -> staff -> atasan
// hapus .fixme setelah langkah TODO terisi
test.fixme('Edit Jenis Tanda Tangan setelah Using SSO', async ({ as }) => {
  const perihal = `${uniqueTag('TTD')} uji automation`;

  await test.step('Atasan: ubah jenis tanda tangan setelah login SSO', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun atasan
  });

  await test.step('Staff: kirim surat ke atasan', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun staff
  });

  await test.step('Atasan: tanda tangan memakai jenis yang baru', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun atasan
  });
});
