import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// aktor (asumsi, konfirmasi ke PM): staff -> atasan
// hapus .fixme setelah langkah TODO terisi
test.fixme('Add Reference', async ({ as }) => {
  const perihal = `${uniqueTag('ADDREF')} uji automation`;

  await test.step('Staff: compose surat dengan reference ke dokumen lain lalu kirim', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun staff
  });

  await test.step('Atasan: surat masuk inbox, reference tampil dan bisa dibuka', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun atasan
  });
});
