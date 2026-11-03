# nadia-role-tests

Automation Playwright untuk NADIA V3 (Familia, InJourney Airports): UAT dengan evidence video per test case, regression per BAB manual book, dan cek hak akses per role.

## Struktur

```
config/       env.ts (URL & ENV), roles.ts (akun), fixtures.ts (as(role), rekam video),
              testdata.ts (baca data/), uat.ts (pemetaan sheet UAT)
data/
  staging/    data uji per modul (copy-source.json, ...)
  files/      lampiran uji (contoh.pdf)
pages/        page object: nadia-shell (iframe, sidebar, wizard), sent-item, compose, copy-source modal
tests/
  uat/        1 test = 1 case UAT = 1 video          → project "uat"
  regression/ alur per BAB manual book, multi-role   → project "regression"
  access/     hak akses menu, sekali per role         → project <role>
utils/        uniqueTag, label video evidence
reporters/    rekap Excel, evidence (manifest + video)
scripts/      login, rekam evidence manual, isi Excel UAT, dump halaman/menu
docs/         panduan
```

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run auth` / `npm run auth -- staff` | login semua akun / satu akun |
| `npm run uat -- copy-source` | jalankan UAT satu modul |
| `npm run test:evidence -- --project=uat copy-source` | UAT + rekam video evidence |
| `npm run regression -- bab03` | regression satu BAB |
| `npm run access` | cek hak akses semua role |
| `npm run evidence -- "Copy Source" CS-05 staff` | rekam evidence manual |
| `npm run uat:prepare -- "<file UAT>.xlsx"` | siapkan salinan Excel UAT (ID unik) |
| `npm run uat:fill` | isi status + link evidence ke Excel UAT |
| `npm run report` | buka laporan HTML terakhir |

Tambah `--headed` untuk melihat browser, `--last-failed` untuk mengulang yang gagal saja.

## Panduan

1. [Setup awal](docs/1-SETUP.md)
2. [Menambah modul UAT dari rekaman codegen](docs/2-TAMBAH-MODUL-UAT.md)
3. [Update versi NADIA](docs/3-UPDATE-VERSI.md)

## Aturan

- Workflow yang mengirim surat hanya dijalankan di staging, tidak di production.
- Data uji pakai awalan `AUTO-` (lihat `utils/data.ts`).
- `.env`, `playwright/.auth/`, `evidence/`, `uat/` tidak di-commit. Repo harus private.
