import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// aktor (asumsi, konfirmasi ke PM): staff -> staff
// hapus .fixme setelah langkah TODO terisi
test.fixme('Hide Document', async ({ as }) => {
  const perihal = `${uniqueTag('HIDE')} uji automation`;

  await test.step('Staff: kirim surat lalu hide dari Sent Item', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun staff
  });

  await test.step('Staff: surat tidak tampil di list dan Copy Source menampilkan "Document not found"', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun staff
  });
});
