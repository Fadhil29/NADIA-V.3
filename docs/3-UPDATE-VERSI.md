# 3. Update versi NADIA

## Saat NADIA rilis versi baru

1. **Jalankan semua test di versi baru** tanpa mengubah apa pun:
   ```
   npm run uat
   npm run regression
   npm run access
   ```
2. **Pisahkan penyebab test gagal**:
   - selector berubah (tombol/menu ganti nama atau posisi) → perbaiki di `pages/`, bukan di spec;
   - alur berubah (mis. Sent Item dipecah jadi tab) → perbaiki method page object terkait (mis. `SentItemPage.buka()`);
   - perilaku berubah → laporkan ke PM/dev dulu, jangan langsung ubah expected result.
3. **Fitur baru**: tambah sheet di file UAT versi baru, daftarkan nama sheet di `config/uat.ts`, lalu ikuti [panduan 2](2-TAMBAH-MODUL-UAT.md).
4. **Data uji**: perbarui `data/staging/*.json` kalau dokumen uji lama sudah tidak valid.

## File UAT versi baru

```
npm run uat:prepare -- "<file UAT versi baru>.xlsx"
```
Hasilnya `uat/UAT_NADIA_V3.xlsx` (nama file output ada di `scripts/uat-prepare.ts`; ganti saat pindah versi). Prefix CASE ID per sheet diatur di `config/uat.ts`.

## Environment lain

Buat `.env.<nama>` (mis. `.env.prod`) dan `data/<nama>/`, lalu jalankan dengan `ENV=<nama>`. Di production hanya jalankan test yang tidak mengirim surat (`npm run access`).
