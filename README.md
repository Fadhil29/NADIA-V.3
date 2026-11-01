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

## Evidence UAT (video)

File UAT: sheet per fitur. CASE ID di file asli tidak unik, jadi dibuat salinan dengan ID per sheet (`CS-01`, `ROLE-02`, ...).

```
npm run uat:prepare -- "C:\path\UAT_pengembangan_fitur_V_2.xlsx"   # sekali, hasil: uat/UAT_NADIA_V3.xlsx + uat/cases.json
```

Case yang sudah di-automate: pasang `annotation: uat('<sheet>', '<ID>', ...)` di test, lalu jalankan dengan rekaman:

```
npm run test:evidence -- bab04 --project=workflow --workers=1
```

Case manual: buka browser yang sudah login sebagai role, jalankan langkahnya, tekan Enter di terminal.

```
npm run evidence -- "Copy Source" CS-03 divhead
npm run evidence -- "Login Refuse" LOGIN-01 tanpa-login
```

Video tersimpan di `evidence/<sheet>/<ID>_<role>_<PASS|FAIL>.webm`, dicatat di `evidence/manifest.json`.

Isi Excel:

1. Upload folder `evidence/` ke Google Drive.
2. `npm run uat:fill` membuat `evidence/links.csv`; isi link Drive tiap video.
3. `npm run uat:fill` lagi, hasil: `uat/UAT_NADIA_V3_hasil.xlsx` (STATUS, TANGGAL UJI, ROLE, FILE VIDEO, LINK EVIDENCE).

`evidence/` dan `uat/` tidak di-commit (berisi dokumen klien dan rekaman layar).
