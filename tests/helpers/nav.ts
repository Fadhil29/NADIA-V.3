import { expect, FrameLocator, Page, test } from '@playwright/test';

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// NADIA dirender di dalam <iframe> pada shell Familia (<main><iframe>).
// Semua elemen NADIA (menu, tabel, form) dicari lewat nadia(page), BUKAN lewat page langsung.
export const nadia = (page: Page): FrameLocator => page.getByRole('main').frameLocator('iframe');

// tunggu NADIA selesai termuat di iframe. Wajib sebelum cek "tidak boleh terlihat",
// kalau tidak, iframe yang belum termuat bikin test lolos palsu (count 0).
export async function waitForNadia(page: Page, timeout = 30000) {
  await expect(
    nadia(page).getByRole('link').filter({ visible: true }).first(),
    'NADIA belum termuat di iframe (atau menu sidebar bukan role "link")',
  ).toBeVisible({ timeout });
}

// menu biasa = link berikon dan berbadge: cocokkan nama tanpa ikon di depan dan angka badge di belakang ("Inbox 10")
const leafLink = (page: Page, name: string) =>
  nadia(page).getByRole('link', { name: new RegExp(`^\\W*${esc(name)}(?:\\s*\\d+)?\\W*$`) }).filter({ visible: true });

// menu induk yang punya submenu (Compose, Memo Intern, Others, Guide) BUKAN link, hanya teks di dalam listitem
const parentItem = (page: Page, name: string) =>
  nadia(page).getByRole('listitem').filter({ hasText: new RegExp(`^\\W*${esc(name)}\\b`) }).filter({ visible: true });

export const menuLink = (page: Page, name: string) => leafLink(page, name).first();

// menu apa pun di sidebar (link biasa ATAU menu induk): untuk cek terlihat / tidak terlihat
export const menuItem = (page: Page, name: string) => leafLink(page, name).or(parentItem(page, name)).first();

// buka menu sidebar; skip test kalau menu tidak ada untuk akun ini
// (tidak pakai networkidle: halaman NADIA tidak pernah benar-benar sepi; spec cukup assert hasil klik)
export async function openMenu(page: Page, name: string) {
  await waitForNadia(page);
  const link = menuLink(page, name);
  if ((await link.count()) === 0) test.skip(true, `menu "${name}" tidak ada untuk akun ini`);
  await link.click();
}

// buka submenu: klik menu induk (expand), lalu klik submenu-nya. Label submenu: lihat hasil scripts/dump-menu.ts
export async function openSubMenu(page: Page, parent: string, child: string) {
  await waitForNadia(page);
  await parentItem(page, parent).first().click();
  await leafLink(page, child).first().click();
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

// reload isi NADIA saja. page.reload() memuat ulang shell Familia dan kemungkinan mengembalikan iframe ke dashboard
export async function reloadNadia(page: Page) {
  const handle = await page.getByRole('main').locator('iframe').elementHandle();
  const frame = await handle?.contentFrame();
  await frame?.evaluate(() => location.reload());
}

// tunggu data muncul di akun lain, reload NADIA sampai batas waktu
export async function waitForText(page: Page, text: string, timeout = 60000) {
  await expect(async () => {
    await reloadNadia(page);
    await expect(nadia(page).getByText(text).filter({ visible: true }).first()).toBeVisible({ timeout: 5000 });
  }).toPass({ timeout });
}