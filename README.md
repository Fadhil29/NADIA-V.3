# nadia-role-tests

Playwright multi-role untuk NADIA V3 (familia-sim). Pola sama dengan INSIDE: login sekali per akun, satu project per role, plus project `workflow` untuk alur lintas akun.

## Setup

```
npm install
npx playwright install chromium
git config core.longpaths true
copy .env.example .env      # isi username, password, dan NAME tiap akun
npm run auth                # login semua akun, cek identitas
```

## Struktur

| Path | Isi |
| --- | --- |
| `scripts/roles.ts` | Daftar akun, URL, helper akun |
| `scripts/generate-auth.ts` | Login SSO per akun, simpan session (termasuk IndexedDB) |
| `tests/access/` | Test hak akses, jalan di semua project role |
| `tests/workflow/` | Satu file per modul, alur lintas akun lewat `as(role)` |
| `tests/<slug>/` | Sanity khusus satu akun |
| `tests/helpers/` | `uniqueTag`, `openMenu`, `waitForText`, deteksi DataTables |
| `tests/files/contoh.pdf` | Lampiran untuk Attachment NKA |
| `reporters/excel-reporter.ts` | Rekap Excel ke `excel-report/hasil-test-*.xlsx` |

Semua spec workflow masih `test.fixme` (otomatis di-skip). Hapus `.fixme` setelah langkah TODO diisi dari codegen.

## Menjalankan

```
npm run test:access
npm run test:workflow
npx playwright test memo-intern --headed
npm run report
```

## Aturan

- Test workflow hanya di staging, jangan di production.
- Semua data uji pakai awalan `AUTO-`.
- `.env` dan `playwright/.auth/` tidak di-commit. Repo private.
