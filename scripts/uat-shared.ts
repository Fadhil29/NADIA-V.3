import ExcelJS from 'exceljs';

export const KOLOM_TAMBAHAN = ['STATUS', 'TANGGAL UJI', 'ROLE', 'FILE VIDEO', 'LINK EVIDENCE'] as const;

export const teks = (v: ExcelJS.CellValue): string => {
  if (v == null) return '';
  if (typeof v === 'object') {
    if ('result' in v) return teks((v as ExcelJS.CellFormulaValue).result as ExcelJS.CellValue);
    if ('richText' in v) return (v as ExcelJS.CellRichTextValue).richText.map((r) => r.text).join('');
    if ('text' in v) return String((v as ExcelJS.CellHyperlinkValue).text);
  }
  return String(v).trim();
};

export type Tabel = { header: number; cols: Record<string, number>; rows: number[] };

// satu sheet bisa berisi beberapa tabel (header "CASE ID" berulang). Baris data = kolom SCENARIO terisi
export function cariTabel(ws: ExcelJS.Worksheet): Tabel[] {
  const hasil: Tabel[] = [];
  for (let r = 1; r <= ws.rowCount; r++) {
    if (teks(ws.getCell(r, 1).value).toUpperCase() === 'CASE ID') {
      const cols: Record<string, number> = {};
      ws.getRow(r).eachCell((c, i) => {
        const h = teks(c.value).toUpperCase();
        if (h && !(h in cols)) cols[h] = i;
      });
      hasil.push({ header: r, cols, rows: [] });
    } else if (hasil.length) {
      const t = hasil[hasil.length - 1];
      // baris judul sub-tabel berupa sel merge yang melebar sampai kolom SCENARIO: bukan case
      const sc = t.cols.SCENARIO ? ws.getCell(r, t.cols.SCENARIO) : undefined;
      if (sc && !sc.isMerged && teks(sc.value)) t.rows.push(r);
    }
  }
  return hasil;
}
