import type { Page } from '@playwright/test';

// env = awalan variabel di .env: <env>_USERNAME, <env>_PASSWORD, <env>_NAME (opsional)
export const ROLES = [
  { slug: 'staff', name: 'Staff', env: 'NADIA_STAFF' },
  { slug: 'divhead', name: 'Div Head', env: 'NADIA_DIVHEAD' },
  { slug: 'grouphead', name: 'Group Head', env: 'NADIA_GROUPHEAD' },
  { slug: 'admin', name: 'Admin', env: 'NADIA_ADMIN' },
  // tambah pejabat & pgs kalau Mirroring masuk scope
] as const;

// penerima surat, tidak login
export const PEJABAT_TUJUAN = process.env.NADIA_PEJABAT_TUJUAN ?? ''; // TODO: teks yang dipilih di field To

export type RoleSlug = (typeof ROLES)[number]['slug'];

export const authFile = (slug: string) => `playwright/.auth/${slug}.json`;

export const SSO_LOGIN_URL = 'https://familia-sim.injourneyairports.id/'; // TODO: halaman login dari rekaman
export const NADIA_HOME = 'https://familia-sim.injourneyairports.id/'; // TODO: halaman utama NADIA setelah login

export const account = (slug: string) => {
  const role = ROLES.find((r) => r.slug === slug);
  if (!role) throw new Error(`role "${slug}" tidak ada di ROLES`);
  return {
    ...role,
    username: process.env[`${role.env}_USERNAME`] ?? '',
    password: process.env[`${role.env}_PASSWORD`] ?? '',
    displayName: process.env[`${role.env}_NAME`],
  };
};

// halaman login masih terbuka = session tidak valid
export const isOnLoginPage = (page: Page) =>
  page.getByRole('textbox', { name: 'Enter your username' }).isVisible().catch(() => false);
