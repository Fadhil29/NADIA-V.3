import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// aktor (asumsi, konfirmasi ke PM): staff -> atasan -> staff-dispo -> atasan
// hapus .fixme setelah langkah TODO terisi
test.fixme('Follow Up/Tindak Lanjut', async ({ as }) => {
  const perihal = `${uniqueTag('FOLLOW')} uji automation`;

  await test.step('Staff: kirim surat ke atasan', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun staff
  });

  await test.step('Atasan: buat tindak lanjut / disposisi ke staff dispo', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun atasan
  });

  await test.step('Staff Dispo: tindak lanjut masuk dan bisa direspons', async () => {
    const staffDispo = await as('staff-dispo');
    await staffDispo.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun staff-dispo
  });

  await test.step('Atasan: status tindak lanjut ter-update', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun atasan
  });
});
