import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// aktor (asumsi, konfirmasi ke PM): staff -> atasan
// hapus .fixme setelah langkah TODO terisi
test.fixme('Delete NKA', async ({ as }) => {
  const perihal = `${uniqueTag('DELNKA')} uji automation`;

  await test.step('Staff: buat NKA lalu hapus', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun staff
  });

  await test.step('Atasan: NKA yang dihapus tidak muncul di inbox', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun atasan
  });
});
