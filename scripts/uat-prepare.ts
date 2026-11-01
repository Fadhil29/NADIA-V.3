import ExcelJS from 'exceljs';
import fs from 'fs';
import { UAT_PREFIX } from '../tests/helpers/uat';
import { cariTabel, KOLOM_TAMBAHAN, teks } from './uat-shared';

// npm run uat:prepare -- "path/UAT_pengembangan_fitur_V_2.xlsx"
// buat salinan uat/UAT_NADIA_V3.xlsx: CASE ID unik per sheet (CS-01, CS-02, ...) + kolom evidence.
// File asli tidak diubah.
const OUT = 'uat/UAT_NADIA_V3.xlsx';

async function main() {
  const src = process.argv[2];
  if (!src || !fs.existsSync(src)) throw new Error('Pakai: npm run uat:prepare -- "<path file UAT .xlsx>"');
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(src);
  // exceljs gagal menulis shared formula kalau master-nya diganti: ubah semua jadi formula biasa
  wb.eachSheet((ws) =>
    ws.eachRow((row) =>
      row.eachCell((c) => {
        const v = c.value as ExcelJS.CellSharedFormulaValue | null;
        if (v && typeof v === 'object' && 'sharedFormula' in v) c.value = { formula: c.formula, result: v.result } as ExcelJS.CellFormulaValue;
      }),
    ),
  );

  const cases: { sheet: string; id: string; idLama: string; baris: number; action: string; scenario: string }[] = [];
  for (const [sheet, prefix] of Object.entries(UAT_PREFIX)) {
    const ws = wb.getWorksheet(sheet);
    if (!ws) {
      console.log(`SKIP sheet "${sheet}": tidak ada di file`);
      continue;
    }
    let n = 0;
    for (const t of cariTabel(ws)) {
      // kolom tambahan di kanan header terakhir; kolom "EVIDENCE" yang sudah ada dipakai untuk link
      let last = Math.max(...Object.values(t.cols));
      const gaya = ws.getCell(t.header, last).style;
      for (const nama of KOLOM_TAMBAHAN) {
        if (nama === 'LINK EVIDENCE' && t.cols.EVIDENCE) continue;
        if (t.cols[nama]) continue;
        last += 1;
        const c = ws.getCell(t.header, last);
        c.value = nama;
        c.style = { ...gaya };
        ws.getColumn(last).width = nama === 'LINK EVIDENCE' || nama === 'FILE VIDEO' ? 40 : 14;
      }
      for (const r of t.rows) {
        const cell = ws.getCell(r, 1);
        const id = `${prefix}-${String(++n).padStart(2, '0')}`;
        cases.push({
          sheet,
          id,
          idLama: teks(cell.value),
          baris: r,
          action: t.cols.ACTION ? teks(ws.getCell(r, t.cols.ACTION).value) : '',
          scenario: teks(ws.getCell(r, t.cols.SCENARIO).value),
        });
        cell.value = id;
      }
    }
    console.log(`${sheet}: ${n} case (${prefix}-01 s.d. ${prefix}-${String(n).padStart(2, '0')})`);
  }

  fs.mkdirSync('uat', { recursive: true });
  await wb.xlsx.writeFile(OUT);
  fs.writeFileSync('uat/cases.json', JSON.stringify(cases, null, 2));
  console.log(`\nTersimpan: ${OUT} dan uat/cases.json (daftar case untuk dipetakan ke test)`);
}

main();
