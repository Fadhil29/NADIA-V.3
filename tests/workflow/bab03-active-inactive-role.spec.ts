import { FrameLocator, Page } from '@playwright/test';
import fs from 'fs';
import { ACTORS_WITHOUT_ACCOUNT, authFile, NADIA_HOME, ROLES } from '../../scripts/roles';
import { expect, test } from '../fixtures';
import { nadia, reloadNadia, waitForNadia } from '../helpers/nav';

// BAB 3 - Active/Inactive Role | aktor: semua role user
// Alur (rekaman user): buka dropdown role -> pilih role satu di bawah role aktif -> toggle ON/OFF muncul.
// Toggle = checkbox berlabel "ON"/"OFF" (dump staff/bab03 29/10).
// EFEK SAMPING: mengubah role aktif dan status role tiap akun; keduanya di-restore di finally.
// Jalankan dengan --workers=1, terpisah dari spec workflow lain.

const T = { timeout: 20000 };
// CSS, bukan getByRole: saat modal konfirmasi terbuka, elemen di belakangnya diberi aria-hidden sehingga getByRole tidak menemukannya
const toggle = (app: FrameLocator) => app.locator('input[type="checkbox"]').first();
const label = (app: FrameLocator, on: boolean) => app.getByText(on ? 'ON' : 'OFF', { exact: true });
// tombol konfirmasi "Ya, ..." (ON: "Ya, Lanjutkan"). Sengaja TIDAK mencocokkan "OK", supaya popup error tidak dianggap konfirmasi
const lanjutkan = (app: FrameLocator) => app.getByRole('button', { name: /^\s*Ya\b/i }).filter({ visible: true }).first();
// tombol penutup popup info/error/sukses
const tombolTutup = (app: FrameLocator) => app.getByRole('button', { name: /^\s*(OK|Mengerti|Got It)\s*$/i }).filter({ visible: true }).first();
const TANPA_ROLE = ['admin']; // akun tanpa dropdown role

// validasi spam: jeda minimal 3 detik antar aksi (konfirmasi dev 29/10), beri margin
const COOLDOWN_MS = 4000;
// TODO: ganti teks ini kalau pesan error spam sudah diperbaiki. getByText tidak terpengaruh aria-hidden
const errorProses = (app: FrameLocator) => app.getByText('An error occurred while processing').filter({ visible: true });

async function tutupPopup(app: FrameLocator) {
  if (await tombolTutup(app).isVisible().catch(() => false)) await tombolTutup(app).click({ timeout: 3000 }).catch(() => {});
}

// setelah klik toggle: tunggu popup konfirmasi atau error. Status checkbox tidak dipakai di sini
// karena toggle sudah berpindah posisi sebelum server menjawab.
async function responsToggle(app: FrameLocator, ms = 4000): Promise<'konfirmasi' | 'error' | 'tanpa popup'> {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await errorProses(app).count()) return 'error';
    if (await lanjutkan(app).isVisible().catch(() => false)) return 'konfirmasi';
    await new Promise((r) => setTimeout(r, 300));
  }
  return 'tanpa popup';
}

// dropdown role = select2 #position-select (dari inspect 29/10)
// CSS: getByRole('combobox') hilang selama ada popup yang memberi aria-hidden
const roleBox = (app: FrameLocator) => app.locator('.select2-selection').first();
const roleOptions = (app: FrameLocator) => app.locator('li.select2-results__option[id^="select2-position-select-result-"]');
const rapikan = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();

async function roleAktif(app: FrameLocator) {
  const rendered = app.locator('#select2-position-select-container');
  return rapikan((await rendered.getAttribute('title').catch(() => null)) ?? (await rendered.innerText().catch(() => '')));
}

async function bukaDropdown(app: FrameLocator) {
  await roleBox(app).click();
  await expect(roleOptions(app).first(), 'daftar role tidak muncul').toBeVisible(T);
}

async function pilihRole(user: Page, pilih: (texts: string[], aktif: number) => number) {
  const app = nadia(user);
  await bukaDropdown(app);
  const texts = (await roleOptions(app).allInnerTexts()).map(rapikan);
  const flags = await roleOptions(app).evaluateAll((els) => els.map((e) => e.getAttribute('aria-selected') === 'true'));
  const i = pilih(texts, flags.indexOf(true));
  const nama = texts[i];
  if (!nama) throw new Error(`role tidak ditemukan di dropdown. Isi: ${texts.join(' | ')}`);
  // switch role memuat ulang isi iframe; tunggu reload selesai supaya tidak memegang DOM lama
  const reload = user.waitForEvent('framenavigated', { predicate: (f) => f !== user.mainFrame(), timeout: 10000 }).catch(() => null);
  await roleOptions(app).nth(i).click();
  await reload;
  await waitForNadia(user);
  await expect.poll(() => roleAktif(app), { message: `role aktif harus "${nama}"`, ...T }).toContain(nama.split(' - ')[0]);
  return nama;
}

// role tepat di bawah role aktif; kalau aktif di paling bawah, ambil yang di atasnya
const satuDiBawah = (texts: string[], aktif: number) => (aktif + 1 < texts.length ? aktif + 1 : aktif - 1);

const disclaimerMuncul = (app: FrameLocator, timeout = 5000) =>
  lanjutkan(app).waitFor({ state: 'visible', timeout }).then(() => true, () => false);

async function pastikanRole(user: Page, role: string) {
  if (!(await roleAktif(nadia(user))).includes(role.split(' - ')[0])) await pilihRole(user, (texts) => texts.indexOf(role));
}

async function expectStatus(user: Page, role: string, on: boolean, pesan: string) {
  const app = nadia(user);
  // kalau toggle hilang (header dirender ulang / role aktif berpindah), muat ulang dan pilih role itu lagi
  const ada = await toggle(app).waitFor({ state: 'visible', timeout: 5000 }).then(() => true, () => false);
  if (!ada) {
    await reloadNadia(user);
    await waitForNadia(user);
    await pastikanRole(user, role);
  }
  await expect(toggle(app), pesan).toBeChecked({ checked: on, ...T });
  await expect.soft(label(app, on), `label harus "${on ? 'ON' : 'OFF'}"`).toBeVisible(T);
}

async function ubahStatus(user: Page, role: string, target: boolean, wajibDisclaimer: boolean) {
  const app = nadia(user);
  await user.waitForTimeout(COOLDOWN_MS); // hindari validasi spam dari aksi sebelumnya
  await expect(toggle(app), `toggle role "${role}" hilang sebelum diklik`).toBeVisible({ timeout: 30000 });
  await toggle(app).click(); // bukan check(): status baru berubah setelah konfirmasi
  let r = await responsToggle(app);
  if (r === 'konfirmasi') {
    await lanjutkan(app).click();
    await expect(lanjutkan(app), 'konfirmasi tidak tertutup').toBeHidden(T);
    if (await errorProses(app).waitFor({ timeout: 3000 }).then(() => true, () => false)) r = 'error';
  }
  if (r === 'error') {
    await tutupPopup(app);
    throw new Error(`server menolak ubah status ke ${target ? 'ON' : 'OFF'} untuk role "${role}" ("An error occurred while processing") padahal sudah jeda ${COOLDOWN_MS / 1000} dtk`);
  }
  if (wajibDisclaimer) expect(r, 'disclaimer harus muncul saat role diaktifkan (manual BAB 3)').toBe('konfirmasi');
  await tutupPopup(app); // popup sukses, kalau ada
  await expectStatus(user, role, target, `status role harus ${target ? 'ON' : 'OFF'}`);
}

const siap = (slug: string) =>
  fs.existsSync(authFile(slug)) && !(ACTORS_WITHOUT_ACCOUNT as readonly string[]).includes(slug);

for (const { slug } of ROLES) {
  test(`BAB03 [${slug}] switch role, toggle status berubah dan bertahan setelah reload`, { tag: ['@bab03', '@tier1'] }, async ({ as }) => {
    test.skip(TANPA_ROLE.includes(slug), `akun ${slug} tidak punya role`);
    test.skip(!siap(slug), `akun ${slug} belum punya session atau belum terdaftar`);
    const user = await as(slug);
    const app = nadia(user);
    await user.goto(NADIA_HOME);
    await waitForNadia(user);

    const roleAwal = await roleAktif(app);
    let statusAwal: boolean | undefined;
    let roleUji = '';

    try {
      await test.step(`${slug}: switch ke role satu di bawah role aktif`, async () => {
        await bukaDropdown(app);
        const jumlah = await roleOptions(app).count();
        await user.keyboard.press('Escape');
        test.skip(jumlah < 2, `akun ${slug} hanya punya 1 role`);
        roleUji = await pilihRole(user, satuDiBawah);
        await expect(toggle(app), 'toggle ON/OFF tidak muncul setelah switch role').toBeVisible(T);
        statusAwal = await toggle(app).isChecked();
      });

      await test.step(`${slug}: ubah status role`, async () => {
        await ubahStatus(user, roleUji, !statusAwal, !statusAwal);
      });

      await test.step(`${slug}: status bertahan setelah reload`, async () => {
        await reloadNadia(user);
        await waitForNadia(user);
        await expectStatus(user, roleUji, !statusAwal, 'status kembali setelah reload: UI berubah tapi tidak tersimpan');
      });
    } finally {
      await tutupPopup(app);
      if (statusAwal !== undefined && (await toggle(app).isChecked().catch(() => statusAwal)) !== statusAwal) {
        await pastikanRole(user, roleUji);
        await ubahStatus(user, roleUji, statusAwal, false);
      }
      if (roleAwal && (await roleAktif(app)) !== roleAwal) await pilihRole(user, (texts) => texts.indexOf(roleAwal));
    }
  });
}

test('BAB03 validasi spam: ubah status dua kali dalam 3 detik ditolak dan status tetap konsisten', { tag: ['@bab03', '@tier1'] }, async ({ as }) => {
  const user = await as('staff');
  const app = nadia(user);
  await user.goto(NADIA_HOME);
  await waitForNadia(user);
  const roleAwal = await roleAktif(app);
  const roleUji = await pilihRole(user, satuDiBawah);
  await expect(toggle(app)).toBeVisible(T);
  const awal = await toggle(app).isChecked();

  try {
    // dua aksi harus jatuh dalam 3 detik, jadi tidak pakai ubahStatus (yang menunggu popup sampai 4 dtk)
    await test.step('Ubah status sekali (valid)', async () => {
      await user.waitForTimeout(COOLDOWN_MS);
      await toggle(app).click();
      if ((await responsToggle(app, 1500)) === 'konfirmasi') await lanjutkan(app).click();
      await user.waitForTimeout(300);
    });

    await test.step('Ubah lagi tanpa jeda: harus ditolak', async () => {
      await toggle(app).click();
      const r = await responsToggle(app, 1500);
      if (r === 'konfirmasi') await lanjutkan(app).click(); // arah ON: error muncul setelah konfirmasi
      const pesan = r === 'error' || (await errorProses(app).first().waitFor({ timeout: 3000 }).then(() => true, () => false));
      // temuan 29/10: spam ditolak tanpa pesan. Dicatat sebagai anotasi sampai PM memutuskan pesan wajib atau tidak
      if (!pesan) test.info().annotations.push({ type: 'temuan', description: 'aksi kedua dalam 3 detik ditolak tanpa pesan ke user' });
      await tutupPopup(app);
      await user.waitForTimeout(COOLDOWN_MS);
      await expect.soft(toggle(app), 'UI tidak sesuai backend: toggle menampilkan hasil aksi yang ditolak').toBeChecked({ checked: !awal, ...T });
    });

    await test.step('Setelah reload, status = hasil aksi pertama', async () => {
      await reloadNadia(user);
      await waitForNadia(user);
      await expectStatus(user, roleUji, !awal, 'aksi kedua (spam) ikut tersimpan: validasi tidak bekerja');
    });
  } finally {
    await tutupPopup(app);
    await pastikanRole(user, roleUji);
    if ((await toggle(app).isChecked().catch(() => awal)) !== awal) await ubahStatus(user, roleUji, awal, false);
    if (roleAwal && (await roleAktif(app)) !== roleAwal) await pilihRole(user, (texts) => texts.indexOf(roleAwal));
  }
});

// TODO(codegen): nama tombol batal/tutup di disclaimer
test.fixme('BAB03 disclaimer dibatalkan: status tidak berubah', { tag: ['@bab03', '@tier1'] }, async ({ as }) => {
  const user = await as('staff');
  const app = nadia(user);
  await user.goto(NADIA_HOME);
  await waitForNadia(user);
  const roleUji = await pilihRole(user, satuDiBawah);
  const awal = await toggle(app).isChecked();
  test.skip(awal, 'disclaimer hanya muncul saat mengaktifkan; role sedang ON');

  await toggle(app).click();
  expect(await disclaimerMuncul(app), 'disclaimer harus muncul').toBe(true);
  // TODO: klik tombol batal/tutup dari rekaman
  await expectStatus(user, roleUji, awal, 'batal tidak boleh mengubah status');
});