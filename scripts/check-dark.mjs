import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(ROOT, 'public/index.html'), 'utf8');
const inline = html.match(/<style id="uc-threads-layout">([\s\S]*?)<\/style>/)[1];

function oklchToHex(L, C, h) {
  const hr = (h * Math.PI) / 180;
  const a = C * Math.cos(hr), b = C * Math.sin(hr);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  let r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const f = (x) => {
    x = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(x, 0), 1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, x)) * 255);
  };
  return '#' + [f(r), f(g), f(bl)].map((v) => v.toString(16).padStart(2, '0')).join('');
}

const pairs = [
  ['background', 0.10, 0],
  ['card', 0.14, 0],
  ['popover', 0.15, 0],
  ['muted', 0.16, 0],
  ['secondary', 0.18, 0],
  ['accent', 0.20, 0],
  ['input', 0.22, 0],
  ['border', 0.42, 0],
];

console.log('=== 新深色色板（中性无偏色）===');
for (const [name, L, C] of pairs) {
  const has = new RegExp('--' + name + ':\\s*oklch\\(' + Math.round(L * 100) + '%').test(inline);
  console.log((has ? 'OK  ' : 'MISS') + ' --' + name.padEnd(11), 'oklch(' + (L * 100) + '% 0 0) ≈', oklchToHex(L, C, 0));
}
console.log('\n=== 与改前对比 ===');
console.log('  改前 background oklch(16.5% .006 105) ≈', oklchToHex(0.165, 0.006, 105), '(偏黄绿)');
console.log('  改后 background oklch(10% 0 0)        ≈', oklchToHex(0.10, 0, 0), '(中性)');
console.log('  参考 GitHub 深色                       ≈ #0d1117 (偏蓝)');
