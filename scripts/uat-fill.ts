import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { UAT_PREFIX } from '../tests/helpers/uat';
import { bacaManifest, EVIDENCE_DIR } from './evidence-store';
import { cariTabel, teks } from './uat-shared';

// npm run uat:fill
// isi STATUS, TANGGAL UJI, ROLE, FILE VIDEO, LINK EVIDENCE di uat/UAT_NADIA_V3.xlsx dari evidence/manifest.json
// link Google Drive diambil dari evidence/links.csv (kolom: file,link). Kalau belum ada, dibuatkan template.
const SRC = 'uat/UAT_NADIA_V3.xlsx';
const OUT = 'uat/UAT_NADIA_V3_hasil.xlsx';
const LINKS = path.join(EVIDENCE_DIR, 'links.csv');

function bacaLinks(files: string[]) {
  if (!fs.existsSync(LINKS)) {
    fs.writeFileSync(LINKS, ["file,link", ...files.map((f) => `"${f}",`)].join("\n") + "\n");
    console.log(`Template ${LINKS} dibuat: isi kolom link dengan link Google Drive tiap video, lalu jalankan lagi.`);
  }
  // video baru yang belum ada di links.csv ditambahkan sebagai baris kosong
  const isi = fs.readFileSync(LINKS, 'utf8');
  const baru = files.filter((f) => !isi.includes(f) && !isi.includes(path.basename(f)));
  if (baru.length) {
    fs.appendFileSync(LINKS, (isi.endsWith('\n') ? '' : '\n') + baru.map((f) => `"${f}",`).join('\n') + '\n');
    console.log(`${baru.length} video baru ditambahkan ke ${LINKS}, isi link-nya.`);
  }
  const map = new Map<string, string>();
  for (const line of fs.readFileSync(LINKS, 'utf8').split(/\r?\n/).slice(1)) {
    const m = line.match(/^"?([^"]*)"?\s*,\s*"?([^"]*)"?\s*$/);
    if (m && m[2]) {
      map.set(m[1], m[2]);
      map.set(path.basename(m[1]), m[2]); // boleh isi nama file saja
    }
  }
  return map;
}

async function main() {
  if (!fs.existsSync(SRC)) throw new Error(`${SRC} belum ada, jalankan dulu: npm run uat:prepare -- "<file UAT>"`);
  const manifest = bacaManifest();
  const entries = Object.values(manifest);
  if (!entries.length) throw new Error('evidence/manifest.json kosong, belum ada evidence yang direkam');
  const links = bacaLinks(entries.flatMap((e) => e.files));

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(SRC);
  let terisi = 0;
  const tanpaBaris: string[] = [];

  for (const sheet of Object.keys(UAT_PREFIX)) {
    const ws = wb.getWorksheet(sheet);
    if (!ws) continue;
    for (const t of cariTabel(ws)) {
      for (const r of t.rows) {
        const e = manifest[`${sheet}|${teks(ws.getCell(r, 1).value)}`];
        if (!e) continue;
        const set = (kolom: string | undefined, v: ExcelJS.CellValue) => {
          if (kolom && t.cols[kolom]) ws.getCell(r, t.cols[kolom]).value = v;
        };
        set('STATUS', e.status);
        if (t.cols.STATUS) {
          ws.getCell(r, t.cols.STATUS).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: e.status === 'PASS' ? 'FFC6EFCE' : 'FFFFC7CE' },
          };
        }
        set('TANGGAL UJI', e.tanggal);
        set('ROLE', e.roles.join(', '));
        set('FILE VIDEO', e.files.map((f) => path.basename(f)).join('\n'));
        const ls = e.files.map((f) => links.get(f) ?? links.get(path.basename(f))).filter(Boolean) as string[];
        const kolomLink = t.cols['LINK EVIDENCE'] ? 'LINK EVIDENCE' : 'EVIDENCE';
        if (ls.length === 1) set(kolomLink, { text: 'Lihat video', hyperlink: ls[0] });
        else if (ls.length > 1) set(kolomLink, ls.join('\n'));
        if (e.catatan && (e.status === 'FAIL' || e.sumber === 'manual')) set('ACTUAL RESULT', e.catatan);
        terisi++;
      }
    }
  }
  for (const e of entries) {
    const ws = wb.getWorksheet(e.sheet);
    const ada = ws && cariTabel(ws).some((t) => t.rows.some((r) => teks(ws.getCell(r, 1).value) === e.id));
    if (!ada) tanpaBaris.push(`${e.sheet} / ${e.id}`);
  }

  await wb.xlsx.writeFile(OUT);
  console.log(`Tersimpan: ${OUT} (${terisi} case terisi)`);
  if (tanpaBaris.length) console.log(`PERINGATAN, evidence tanpa baris di Excel (cek CASE ID): ${tanpaBaris.join('; ')}`);
}

main();
