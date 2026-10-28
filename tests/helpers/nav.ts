import { expect, Page, test } from '@playwright/test';

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// link berikon: cocokkan nama tanpa ikon di depan
export const menuLink = (page: Page, name: string) =>
  page.getByRole('link', { name: new RegExp(`^\\W*${esc(name)}$`) }).filter({ visible: true }).first();

// buka menu sidebar; skip test kalau menu tidak ada untuk akun ini
export async function openMenu(page: Page, name: string) {
  const link = menuLink(page, name);
  if ((await link.count()) === 0) test.skip(true, `menu "${name}" tidak ada untuk akun ini`);
  await link.click();
  await page.waitForLoadState('networkidle');
}

// terima semua confirm() bawaan browser, catat alert DataTables sebagai error
export function watchDialogs(page: Page) {
  const dataTablesErrors: string[] = [];
  page.on('dialog', async (d) => {
    if (d.message().includes('DataTables warning')) dataTablesErrors.push(d.message());
    await d.accept().catch(() => {});
  });
  return dataTablesErrors;
}

export const expectNoDataTablesError = (errors: string[]) =>
  expect(errors, `DataTables error: ${errors.join(' | ')}`).toHaveLength(0);

// tunggu data muncul di akun lain, reload sampai batas waktu
export async function waitForText(page: Page, text: string, timeout = 60000) {
  await expect(async () => {
    await page.reload();
    await expect(page.getByText(text).first()).toBeVisible({ timeout: 5000 });
  }).toPass({ timeout });
}
