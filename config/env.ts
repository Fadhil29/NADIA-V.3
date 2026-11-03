// Memuat .env, lalu .env.<ENV> kalau ada (contoh ENV=prod -> .env.prod) untuk menimpa nilai .env.
// ENV juga menentukan folder data uji: data/<ENV>/ (default: staging).
import dotenv from 'dotenv';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(ROOT, '.env'), quiet: true });

export const ENV = process.env.ENV || 'staging';
dotenv.config({ path: path.join(ROOT, `.env.${ENV}`), override: true, quiet: true });

// URL Familia/NADIA. Default staging (familia-sim); untuk environment lain isi di .env.<ENV>
const FAMILIA_BASE = process.env.FAMILIA_BASE_URL || 'https://familia-sim.injourneyairports.id';
export const SSO_LOGIN_URL = `${FAMILIA_BASE}/login`;
export const FAMILIA_HOME = `${FAMILIA_BASE}/u/home`;
export const NADIA_HOME = `${FAMILIA_BASE}/u/f/nadia/dashboard`;
