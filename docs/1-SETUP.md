# 1. Setup awal

## Instalasi

```
npm install
npx playwright install chromium
git config core.longpaths true
```

## Isi `.env`

Salin `.env.example` menjadi `.env`, lalu isi akun tiap role:

```
ENV=staging
NADIA_STAFF_USERNAME=...
NADIA_STAFF_PASSWORD=...
NADIA_STAFF_NAME=NAMA DI HEADER NADIA
```

- `ENV` menentukan folder data uji (`data/staging/`). Untuk environment lain buat `.env.<ENV>` berisi nilai yang berbeda (mis. `FAMILIA_BASE_URL`).
- `_NAME` opsional; dipakai untuk memastikan session tersimpan atas nama akun yang benar.
- Daftar role dan aliasnya (atasan = divhead, dst.) ada di `config/roles.ts`.

## Login

```
npm run auth
```

Session tersimpan di `playwright/.auth/<role>.json`. Ulangi kalau session kedaluwarsa atau password diganti. Untuk login tanpa membuka browser di PowerShell: `$env:CI=1; npm run auth; Remove-Item Env:CI`.

## Cek

```
npx tsc -p .
npx playwright test --list
```
