import fs from 'fs';
import path from 'path';

// catatan hasil evidence, dibaca uat-fill. Satu entri per case UAT (sheet + id)
export const EVIDENCE_DIR = 'evidence';
export const MANIFEST = path.join(EVIDENCE_DIR, 'manifest.json');

export type Status = 'PASS' | 'FAIL';
export type Entry = {
  sheet: string;
  id: string;
  status: Status;
  tanggal: string;
  roles: string[];
  files: string[]; // relatif terhadap folder evidence
  sumber: 'otomatis' | 'manual';
  catatan?: string;
};

export const keyOf = (sheet: string, id: string) => `${sheet}|${id}`;

export function bacaManifest(): Record<string, Entry> {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  } catch {
    return {};
  }
}

export function simpanManifest(data: Record<string, Entry>) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST, JSON.stringify(data, null, 2));
}

const aman = (s: string) => s.replace(/[\\/:*?"<>|]+/g, '-').trim();

// judul skenario untuk nama file: buang CASE ID di depan, karakter non huruf/angka jadi "-", maks 75 karakter
export const slugSkenario = (judul = '', id = '') =>
  judul
    .replace(new RegExp(`^\\s*${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`), '')
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(.{0,75})(-.*)?$/, '$1') // potong di batas kata terakhir sebelum 75 karakter
    .slice(0, 75);

// salin video ke evidence/<sheet>/<ID>_<skenario>_<role>_<STATUS>[_n].webm, kembalikan path relatif
export function simpanVideo(src: string, sheet: string, id: string, role: string, status: Status, judul = '') {
  const dir = path.join(EVIDENCE_DIR, aman(sheet));
  fs.mkdirSync(dir, { recursive: true });
  const skenario = slugSkenario(judul, id);
  const dasar = [aman(id), skenario, aman(role), status].filter(Boolean).join('_');
  let nama = `${dasar}.webm`;
  for (let i = 2; fs.existsSync(path.join(dir, nama)); i++) nama = `${dasar}_${i}.webm`;
  fs.copyFileSync(src, path.join(dir, nama));
  return path.relative(EVIDENCE_DIR, path.join(dir, nama)).split(path.sep).join('/');
}

export const hariIni = () => new Date().toISOString().slice(0, 10);

// hapus video lama satu case (mis. *_FAIL dari run sebelumnya) supaya folder hanya berisi hasil terakhir
export function hapusVideoLama(sheet: string, id: string) {
  const dir = path.join(EVIDENCE_DIR, aman(sheet));
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) if (f.startsWith(`${aman(id)}_`) && f.endsWith('.webm')) fs.rmSync(path.join(dir, f));
}
