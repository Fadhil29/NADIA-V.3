import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// aktor (asumsi, konfirmasi ke PM): staff -> atasan -> atasan2 -> staff
// hapus .fixme setelah langkah TODO terisi
test.fixme('Multi Atasan', async ({ as }) => {
  const perihal = `${uniqueTag('MATASAN')} uji automation`;

  await test.step('Staff: kirim surat ke multi atasan', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun staff
  });

  await test.step('Atasan: approve', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun atasan
  });

  await test.step('Atasan 2: approve', async () => {
    const atasan2 = await as('atasan2');
    await atasan2.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun atasan2
  });

  await test.step('Staff: status final', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun staff
  });
});
