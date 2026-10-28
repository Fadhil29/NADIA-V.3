import { NADIA_HOME } from '../../scripts/roles';
import { expect, test } from '../fixtures';
import { uniqueTag } from '../helpers/data';
import { waitForText } from '../helpers/nav';

// aktor: staff -> atasan -> staff
// hapus .fixme setelah langkah TODO terisi
test.fixme('Memo Intern: staff kirim, atasan setujui, staff lihat status', async ({ as }) => {
  const perihal = `${uniqueTag('MEMO')} memo uji automation`;

  await test.step('Staff: buat dan kirim memo ke atasan', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO: langkah compose dari rekaman akun staff, perihal diisi dengan variabel perihal
  });

  await test.step('Atasan: memo masuk ke inbox, lalu setujui', async () => {
    const atasan = await as('atasan');
    await atasan.goto(NADIA_HOME);
    // TODO: buka menu Inbox
    await waitForText(atasan, perihal);
    await atasan.getByText(perihal).first().click();
    // TODO: klik Setujui / Tanda Tangan dari rekaman akun atasan
  });

  await test.step('Staff: status memo berubah jadi disetujui', async () => {
    const staff = await as('staff');
    await staff.goto(NADIA_HOME);
    // TODO: buka menu Sent Item
    const row = staff.getByRole('row').filter({ hasText: perihal });
    await expect(row).toContainText(/disetujui|approved/i); // TODO: sesuaikan teks status
  });
});
