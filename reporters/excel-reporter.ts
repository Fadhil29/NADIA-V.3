import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { ROLES } from '../scripts/roles';

type Row = { role: string; file: string; scenario: string; status: string; durationS: number; error: string };

const COLOR: Record<string, string> = { passed: 'FFC6EFCE', failed: 'FFFFC7CE', timedOut: 'FFFFC7CE', skipped: 'FFEDEDED', interrupted: 'FFFFEB9C' };

export default class ExcelReporter implements Reporter {
  private rows: Row[] = [];

  onTestEnd(test: TestCase, result: TestResult) {
    const project = test.parent.project()?.name ?? '-';
    const failedStep = result.steps.find((s) => s.error)?.title;
    const msg = (result.error?.message ?? '').replace(/\u001b\[[0-9;]*m/g, '').split('\n')[0];
    this.rows.push({
      role: project,
      file: path.basename(test.location.file),
      scenario: test.title,
      status: result.status,
      durationS: Math.round(result.duration / 100) / 10,
      error: failedStep ? `[${failedStep}] ${msg}` : msg,
    });
  }

  async onEnd(_: FullResult) {
    const rows = this.rows;
    if (rows.length === 0) return;
    const wb = new ExcelJS.Workbook();

    // urutan kolom: role sesuai ROLES, lalu project lain (misalnya workflow)
    const roleOrder = [...ROLES.map((r) => r.slug as string), ...rows.map((r) => r.role)]
      .filter((s, i, all) => all.indexOf(s) === i && rows.some((r) => r.role === s));
    const scenarios = [...new Set(rows.map((r) => `${r.file} › ${r.scenario}`))];

    const sum = wb.addWorksheet('Ringkasan');
    sum.addRow(['Skenario', ...roleOrder]).font = { bold: true };
    for (const sc of scenarios) {
      const line = sum.addRow([sc, ...roleOrder.map((role) => rows.find((r) => r.role === role && `${r.file} › ${r.scenario}` === sc)?.status ?? '')]);
      line.eachCell((cell, col) => {
        const c = col > 1 ? COLOR[String(cell.value)] : undefined;
        if (c) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c } };
      });
    }
    sum.getColumn(1).width = 70;
    roleOrder.forEach((_, i) => (sum.getColumn(i + 2).width = 14));

    const det = wb.addWorksheet('Detail');
    det.addRow(['Role/Project', 'File', 'Skenario', 'Status', 'Durasi (s)', 'Error']).font = { bold: true };
    rows.forEach((r) => det.addRow([r.role, r.file, r.scenario, r.status, r.durationS, r.error]));
    [16, 32, 60, 12, 12, 90].forEach((w, i) => (det.getColumn(i + 1).width = w));

    const total = (s: string) => rows.filter((r) => r.status === s).length;
    const stat = wb.addWorksheet('Statistik');
    [['Total', rows.length], ['Passed', total('passed')], ['Failed', total('failed') + total('timedOut')], ['Skipped', total('skipped')]]
      .forEach((r) => stat.addRow(r));

    fs.mkdirSync('excel-report', { recursive: true });
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    const out = `excel-report/hasil-test-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.xlsx`;
    await wb.xlsx.writeFile(out);
    console.log(`Rekap Excel: ${out}`);
  }
}
