import { expect, test } from '@playwright/test';
import { NADIA_HOME } from '../../scripts/roles';
import { openMenu } from '../helpers/nav';

// jalan di semua project role; hanya admin yang boleh melihat menu User Admin
test('Filtering Menu User Admin: filter menampilkan user sesuai kriteria', async ({ page }, info) => {
  test.skip(info.project.name !== 'admin', 'skenario fungsional khusus akun admin');
  await page.goto(NADIA_HOME);
  await openMenu(page, 'User Admin'); // TODO: sesuaikan nama menu
  // TODO: isi filter dari rekaman, lalu cek semua baris hasil sesuai filter
  const rows = page.getByRole('row').filter({ visible: true });
  await expect(rows.first()).toBeVisible();
});
