// pemetaan test Playwright ke case UAT (file UAT NADIA V3, sheet per fitur)
// prefix dipakai uat-prepare untuk membuat CASE ID unik per sheet, contoh: CS-02
export const UAT_PREFIX = {
  'Form NKA': 'NKA',
  'Template surat Bilingual': 'BIL',
  'Copy Source': 'CS',
  'Fitur Reply': 'RPL',
  'Fitur Forward': 'FWD',
  'Hide Document': 'HIDE',
  'Edit Dokumen': 'EDIT',
  'Dashboard Admin': 'DASH',
  'ActiveInactive Role': 'ROLE',
  'Login Refuse': 'LOGIN',
  'Export PDF Dashboard': 'PDF',
  'SSO Integration App': 'SSO',
  'Disposisi Sekretaris': 'DISPO',
} as const;

export type UatSheet = keyof typeof UAT_PREFIX;

// pakai di opsi test: { annotation: uat('Copy Source', 'CS-02') }
export const uat = (sheet: UatSheet, ...ids: string[]) => ({ type: 'uat', description: `${sheet}|${ids.join(',')}` });

export const parseUat = (description = '') => {
  const [sheet, ids = ''] = description.split('|');
  return { sheet, ids: ids.split(',').map((s) => s.trim()).filter(Boolean) };
};
