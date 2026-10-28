import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// aktor (asumsi, konfirmasi ke PM): staff -> atasan -> staff-dispo
// hapus .fixme setelah langkah TODO terisi
test.fixme('Moving Surat/Dispo', async ({ as }) => {
  const perihal = `${uniqueTag('MOVE')} uji automation`;

  await test.step('Staff: kirim surat ke atasan', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun staff
  });

  await test.step('Atasan: disposisi ke staff dispo lalu move surat/dispo', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun atasan
  });

  await test.step('Staff Dispo: surat ada di lokasi baru, tidak duplikat di lokasi lama', async () => {
    const staffDispo = await as('staff-dispo');
    await staffDispo.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun staff-dispo
  });
});
