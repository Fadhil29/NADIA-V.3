import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// aktor (asumsi, konfirmasi ke PM): staff -> atasan
// hapus .fixme setelah langkah TODO terisi
test.fixme('Attachment NKA', async ({ as }) => {
  const perihal = `${uniqueTag('ATTNKA')} uji automation`;

  await test.step('Staff: compose dengan lampiran tests/files/contoh.pdf lalu kirim', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun staff
  });

  await test.step('Atasan: lampiran tampil dan bisa diunduh', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun atasan
  });
});
