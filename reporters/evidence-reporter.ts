import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { bacaManifest, Entry, hariIni, keyOf, simpanManifest, simpanVideo } from '../scripts/evidence-store';
import { parseUat } from '../tests/helpers/uat';

// aktif hanya saat EVIDENCE=1. Video test yang punya anotasi uat() disalin ke evidence/<sheet>/
// dan dicatat di evidence/manifest.json. Satu case bisa dipetakan ke beberapa test (mis. per role):
// statusnya FAIL kalau salah satu gagal, video semuanya disimpan.
export default class EvidenceReporter implements Reporter {
  private run: Record<string, Entry> = {};

  onTestEnd(test: TestCase, result: TestResult) {
    if (!process.env.EVIDENCE || result.status === 'skipped') return;
    const maps = test.annotations.filter((a) => a.type === 'uat').map((a) => parseUat(a.description));
    if (!maps.length) return;

    const status = result.status === 'passed' ? 'PASS' : 'FAIL';
    const videos = result.attachments.filter((a) => a.name.startsWith('video') && a.path);
    const project = test.parent.project()?.name ?? '';
    const error = (result.error?.message ?? '').replace(/\u001b\[[0-9;]*m/g, '').split('\n')[0];

    for (const { sheet, ids } of maps) {
      for (const id of ids) {
        const key = keyOf(sheet, id);
        const e = (this.run[key] ??= { sheet, id, status, tanggal: hariIni(), roles: [], files: [], sumber: 'otomatis' });
        if (status === 'FAIL') {
          e.status = 'FAIL';
          e.catatan = [e.catatan, `${test.title}: ${error}`].filter(Boolean).join('\n');
        }
        for (const v of videos) {
          const role = v.name === 'video' ? project : v.name.replace(/^video-/, '');
          if (!e.roles.includes(role)) e.roles.push(role);
          e.files.push(simpanVideo(v.path!, sheet, id, role, status));
        }
      }
    }
  }

  onEnd() {
    const keys = Object.keys(this.run);
    if (!keys.length) return;
    simpanManifest({ ...bacaManifest(), ...this.run }); // hasil run terbaru menimpa entri lama per case
    console.log(`Evidence: ${keys.length} case UAT tercatat di evidence/manifest.json`);
  }
}
