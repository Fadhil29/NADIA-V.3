import { NADIA_HOME } from '../../../scripts/roles';
import { test } from '../../fixtures';
import { uniqueTag } from '../../helpers/data';

// aktor (asumsi, konfirmasi ke PM): staff -> pejabat -> pgs -> pgs
// hapus .fixme setelah langkah TODO terisi
test.fixme('Mirroring Inbox/Sent Item (pejabat definitif & PGS)', async ({ as }) => {
  const perihal = `${uniqueTag('MIRROR')} uji automation`;

  await test.step('Staff: kirim surat ke pejabat definitif', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun staff
  });

  await test.step('Pejabat: surat tampil di inbox pejabat', async () => {
    const pejabat = await as('pejabat');
    await pejabat.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun pejabat
  });

  await test.step('PGS: surat yang sama ter-mirror di inbox PGS', async () => {
    const pgs = await as('pgs');
    await pgs.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun pgs
  });

  await test.step('PGS: aksi PGS tercermin di Sent Item pejabat', async () => {
    const pgs = await as('pgs');
    await pgs.goto(NADIA_HOME);
    // TODO: langkah dari rekaman codegen akun pgs
  });
});
