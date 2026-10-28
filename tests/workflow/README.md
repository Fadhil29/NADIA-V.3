# tests/workflow: satu file per BAB Manual_Book_NADIA_V3

Sumber kebenaran sementara: manual guidebook. Manual = perilaku terdokumentasi, belum tentu sama dengan requirement.
Semua test masih `test.fixme` (skeleton). Tier = usulan awal berdasar sifat fitur, BUKAN berdasar defect history.

| BAB | File | Aktor | Tier | Status |
|---|---|---|---|---|
| 1 | `bab01-dashboard-admin.spec.ts` | admin | 3 | fixme |
| 2 | `bab02-export-pdf-dashboard.spec.ts` | admin | 3 | fixme |
| 3 | `bab03-active-inactive-role.spec.ts` | admin (aktor tidak disebut di manual, diasumsikan admin) | 1 | fixme |
| 4 | `bab04-copy-source.spec.ts` | staff (drafter) | 2 | fixme |
| 5 | `bab05-edit-document.spec.ts` | staff -> atasan -> staff | 1 | fixme |
| 6 | `bab06-hide-document.spec.ts` | staff | 2 | fixme |
| 7 | `bab07-template-bilingual.spec.ts` | staff -> atasan | 3 | fixme |
| 8 | `bab08-form-konfirmasi-anggaran.spec.ts` | staff (drafter) -> atasan (main signer) | 1 | fixme |
| 9 | `bab09-disposisi-sekretaris.spec.ts` | staff (drafter) -> atasan (pejabat penerima) -> sekretaris | 1 | fixme |
| 10 | `bab10-reply-forward.spec.ts` | staff -> atasan (penerima nodin) | 2 | fixme |
| 11 | `bab11-add-reference.spec.ts` | staff -> atasan | 2 | fixme |
| 12 | `bab12-filtering-menu-users.spec.ts` | admin HO (akun ada); admin regional dan admin cabang (belum ada akun) | 1 | fixme |
| 13 | `bab13-attachment-nka.spec.ts` | staff (drafter) -> atasan (main signer) | 1 | fixme |
| 14 | `bab14-delete-nka.spec.ts` | staff (drafter) -> atasan (main signer, reject) | 1 | fixme |
| 15 | `bab15-memo-intern.spec.ts` | staff -> atasan (main signer) -> staff | 2 | fixme |
| 16 | `bab16-follow-up.spec.ts` | staff -> atasan | 2 | fixme |
| 17 | `bab17-multi-sign-compose.spec.ts` | staff (drafter) -> atasan (initial signer) -> atasan2 (initial signer) -> staff | 1 | fixme |
| 18 | `bab18-move-document.spec.ts` | staff -> atasan -> atasan2 (tujuan, asumsi: manual tidak menyebut akun tujuan) | 2 | fixme |
| 19 | `bab19-edit-signature-type.spec.ts` | atasan (manual tidak menyebut aktor; spec lama memakai atasan) | 3 | fixme |
| 20 | `bab20-tagging-discussion.spec.ts` | staff -> atasan | 3 | fixme |
| 21 | `bab21-template-disposisi.spec.ts` | atasan (pejabat pembuat template) | 1 | fixme |

Jalankan per prioritas: `npx playwright test --project=workflow --grep @tier1`

`out-of-manual/` berisi spec lama yang tidak ada di manual (`multi-atasan`, `mirroring-inbox-sent`). Konfirmasi masih masuk scope V3 atau dibuang.
Aktor tanpa akun (lihat `ACTORS_WITHOUT_ACCOUNT` di `scripts/roles.ts`) harus ditambah dulu sebelum `.fixme` dihapus.
