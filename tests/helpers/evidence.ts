import { Page, test } from '@playwright/test';

// label di pojok video evidence: "<CASE ID> · <skenario>" + langkah yang sedang berjalan.
// Hanya aktif saat EVIDENCE=1; run biasa tidak terpengaruh.
const REKAM = !!process.env.EVIDENCE;
const judul = new WeakMap<Page, string>();

async function tampilkan(page: Page, teks: string) {
  if (!REKAM) return;
  await page
    .evaluate((t) => {
      let el = document.getElementById('__uat_caption');
      if (!el) {
        el = document.createElement('div');
        el.id = '__uat_caption';
        Object.assign(el.style, {
          position: 'fixed',
          left: '12px',
          bottom: '12px',
          zIndex: '2147483647',
          background: 'rgba(17,24,39,.88)',
          color: '#fff',
          font: '600 14px/1.45 system-ui, sans-serif',
          padding: '8px 12px',
          borderRadius: '6px',
          maxWidth: '70%',
          pointerEvents: 'none',
          whiteSpace: 'pre-line',
        });
        document.body.appendChild(el);
      }
      el.textContent = t;
    }, teks)
    .catch(() => {});
}

export function mulaiCase(page: Page, id: string, skenario: string) {
  judul.set(page, `${id} · ${skenario}`);
}

// test.step + label di video. Label dipasang ulang tiap langkah karena navigasi halaman menghapusnya
export async function langkah<T>(page: Page, teks: string, fn: () => Promise<T>): Promise<T> {
  return test.step(teks, async () => {
    await tampilkan(page, `${judul.get(page) ?? ''}\n${teks}`);
    return fn();
  });
}

// tahan layar hasil akhir sebentar supaya terlihat di video
export async function hasil(page: Page, teks: string) {
  await tampilkan(page, `${judul.get(page) ?? ''}\nHasil: ${teks}`);
  if (REKAM) await page.waitForTimeout(2000);
}
