import { account } from '../../scripts/roles';
import { test } from '../fixtures';

const admin = account('admin');

test('BAB01 Dashboard Admin menampilkan ringkasan dan grafik', { tag: ['@bab01', '@tier3'] }, async ({ page }) => {
  test.skip(!admin.username || !admin.password, 'Isi NADIA_ADMIN_USERNAME dan NADIA_ADMIN_PASSWORD di .env');

  await page.goto('https://familia-sim.injourneyairports.id/');
  await page.goto('https://familia-sim.injourneyairports.id/login');
  await page.getByRole('textbox', { name: 'Enter your username' }).fill(admin.username);
  await page.getByRole('textbox', { name: 'Enter your password' }).fill(admin.password);
  await page.getByRole('button', { name: 'Logo Familia Familia Single' }).click();
  await page.goto('https://familia-sim.injourneyairports.id/u/home');
  await page.getByRole('button', { name: 'Tutup' }).click();
  await page.locator('div:nth-child(5) > .h-12').click();
  await page.goto('https://familia-sim.injourneyairports.id/u/f/nadia/');
  await page.getByRole('button', { name: 'Reload' }).click();
  await page.locator('iframe').contentFrame().getByRole('link', { name: 'Dashboard ' }).click();
  await page.locator('iframe').contentFrame().getByText('Dashboard Export PDF').click();
});
