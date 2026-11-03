// Data uji per environment: data/<ENV>/<nama>.json
// Contoh: getData<CopySourceData>('copy-source') -> data/staging/copy-source.json
import fs from 'fs';
import path from 'path';
import { ENV } from './env';

export function getData<T = Record<string, unknown>>(nama: string): T {
  const file = path.resolve(__dirname, '..', 'data', ENV, `${nama}.json`);
  if (!fs.existsSync(file)) throw new Error(`File data uji tidak ada: data/${ENV}/${nama}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

// path file lampiran uji (data/files/), sama untuk semua environment
export const fileUji = (nama: string) => path.resolve(__dirname, '..', 'data', 'files', nama);
