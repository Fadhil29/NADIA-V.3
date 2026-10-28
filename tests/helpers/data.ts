// contoh hasil: AUTO-MEMO-20261028-143015-k3f9
export const uniqueTag = (prefix: string) => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  const stamp = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  return `AUTO-${prefix}-${stamp}-${Math.random().toString(36).slice(2, 6)}`;
};
