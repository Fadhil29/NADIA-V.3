import type { Page } from '@playwright/test';

// env = awalan variabel di .env: <env>_USERNAME, <env>_PASSWORD, <env>_NAME (opsional)
export const ROLES = [
  { slug: 'staff', name: 'Staff', env: 'NADIA_STAFF' },
  { slug: 'divhead', name: 'Div Head', env: 'NADIA_DIVHEAD' },
  { slug: 'grouphead', name: 'Group Head', env: 'NADIA_GROUPHEAD' },
  { slug: 'admin', name: 'Admin', env: 'NADIA_ADMIN' },
  { slug: 'pgs', name: 'PGS', env: 'NADIA_PGS' },
  { slug: 'staff-dispo', name: 'Staff Dispo', env: 'NADIA_STAFFDISPO' },
  // tambah pejabat & pgs kalau Mirroring masuk scope
] as const;

// penerima surat, tidak login
export const PEJABAT_TUJUAN = process.env.NADIA_PEJABAT_TUJUAN ?? ''; // TODO: teks yang dipilih di field To

export type RoleSlug = (typeof ROLES)[number]['slug'];

// Nama aktor di skenario (bahasa bisnis) -> akun yang dipakai. Ubah di SINI kalau pemetaannya berubah.
// TODO: konfirmasi pemetaan ini, ini asumsi sementara
export const ACTOR_ALIASES = {
  atasan: 'divhead',
  atasan2: 'grouphead',
} as const satisfies Record<string, RoleSlug>;

// aktor yang dipakai spec tapi belum punya akun; spec-nya tetap test.fixme sampai akun ada
export const ACTORS_WITHOUT_ACCOUNT = [
  'sekretaris',
  'admin-regional',
  'admin-cabang',
  'staff-dispo',
  'pejabat',
  'pgs',
] as const;

export type ActorName = RoleSlug | keyof typeof ACTOR_ALIASES | (typeof ACTORS_WITHOUT_ACCOUNT)[number];

export function resolveRole(actor: ActorName): RoleSlug {
  if ((ACTORS_WITHOUT_ACCOUNT as readonly string[]).includes(actor)) {
    throw new Error(`aktor "${actor}" belum punya akun di ROLES/.env, tambahkan dulu sebelum menghapus test.fixme`);
  }
  return (ACTOR_ALIASES as Record<string, RoleSlug>)[actor] ?? (actor as RoleSlug);
}

export const authFile = (slug: string) => `playwright/.auth/${slug}.json`;

export const SSO_LOGIN_URL = 'https://familia-sim.injourneyairports.id/login';
export const FAMILIA_HOME = 'https://familia-sim.injourneyairports.id/u/home';
export const NADIA_HOME = 'https://familia-sim.injourneyairports.id/u/f/nadia/dashboard';

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
