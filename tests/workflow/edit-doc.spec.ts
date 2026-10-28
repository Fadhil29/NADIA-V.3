import { NADIA_HOME } from '../../scripts/roles';
import { test } from '../fixtures';
import { uniqueTag } from '../helpers/data';

// aktor (asumsi, konfirmasi ke PM): staff -> atasan -> staff
// hapus .fixme setelah langkah TODO terisi
test.fixme('Edit Doc', async ({ as }) => {
  const perihal = `${uniqueTag('EDIT')} uji automation`;

  await test.step('Staff: kirim surat, lalu edit subject dalam batas 24 jam', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun staff
  });

  await test.step('Atasan: inbox menampilkan versi terbaru dan historical document', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun atasan
  });

  await test.step('Staff: edit setelah 24 jam harus ditolak (bug lama: validasi 24 jam bisa di-bypass)', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun staff
  });
});
