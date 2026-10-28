import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// aktor (asumsi, konfirmasi ke PM): staff -> atasan -> staff -> staff-dispo
// hapus .fixme setelah langkah TODO terisi
test.fixme('Reply/Forward', async ({ as }) => {
  const perihal = `${uniqueTag('REPLY')} uji automation`;

  await test.step('Staff: kirim surat ke atasan', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun staff
  });

  await test.step('Atasan: reply ke staff dan forward ke staff dispo', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun atasan
  });

  await test.step('Staff: reply diterima dengan thread yang benar', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun staff
  });

  await test.step('Staff Dispo: forward diterima', async () => {
    const staffDispo = await as('staff-dispo');
    await staffDispo.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun staff-dispo
  });
});
