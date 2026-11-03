# 2. Menambah modul UAT dari rekaman codegen

Satu modul = satu sheet di file UAT = satu file `tests/uat/<modul>.spec.ts`.

## Langkah

1. **Rekam satu alur penuh** dengan role yang dipakai untuk evidence:
   ```
   npx playwright codegen --load-storage=playwright/.auth/staff.json https://familia-sim.injourneyairports.id/u/f/nadia/dashboard
   ```
   Lewati semua cabang fitur sekali (positif dan negatif). Hapus baris password sebelum dibagikan.

2. **Pindahkan selector ke page object** di `pages/`. Satu halaman = satu file:
   - halaman yang sudah ada → tambah method di class-nya (mis. `SentItemPage`);
   - halaman baru → buat `pages/<halaman>.page.ts`.
   Semua elemen NADIA dicari lewat `nadia(page)` (NADIA ada di dalam iframe). Menu sidebar pakai `bukaMenu` / `bukaSubMenu` dari `nadia-shell`.

3. **Taruh data uji di `data/staging/<modul>.json`**, baca dengan `getData('<modul>')`. Jangan taruh No. Document atau data uji di `.env`.

4. **Tulis satu test per case UAT** di `tests/uat/<modul>.spec.ts`:
   ```ts
   test('EDIT-02 ...', { tag: ['@uat', '@edit-document'], annotation: uat('Edit Dokumen', 'EDIT-02') }, async ({ as }) => {
     const user = await as('staff');
     mulaiCase(user, 'EDIT-02', '<skenario>');
     await langkah(user, '<langkah 1>', async () => { /* ... */ });
     await hasil(user, '<hasil yang terlihat>');
   });
   ```
   - `uat('<nama sheet>', '<CASE ID>')` menghubungkan test ke baris Excel (nama sheet harus ada di `config/uat.ts`).
   - `langkah()` dan `hasil()` menampilkan label di video evidence.
   - Fitur berjenjang (staff → divhead → grouphead): panggil `as()` untuk tiap role di satu test.

5. **Jalankan**:
   ```
   npx tsc -p .
   npm run uat -- <modul> --headed
   npm run test:evidence -- --project=uat <modul>
   ```

## Pola yang sudah terbukti (dari Copy Source)

- Menu yang tidak ditemukan harus FAIL, bukan skip: pakai `bukaMenu`, bukan `openMenu`.
- Guidance wizard menutupi sidebar: sudah ditangani `tutupWizard` dan `klikUlang`.
- Bandingkan isi form pakai `ComposePage.isianStabil()`, jangan langsung setelah form dibuka.
- Penolakan server: cek status response endpoint dan teks popup, bukan hanya tampilan.
