import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(ROOT, 'snapshots/threads.html'), 'utf8');
const inline = html.match(/<style id="uc-threads-layout">([\s\S]*?)<\/style>/)[1];

// 页面里实际的按钮 aria-label
const labels = [...html.matchAll(/aria-label="([^"]*)"/g)].map((m) => m[1]);
const uniq = [...new Set(labels)];

const targets = [
  { sel: '[aria-label$="条回复"]', desc: '评论（结尾是"条回复"）' },
  { sel: '[aria-label="转发"]', desc: '转发' },
  { sel: '[aria-label$="喜欢"]', desc: '喜欢 / 取消喜欢' },
  { sel: '[aria-label="复制链接"]', desc: '复制链接' },
];

console.log('=== 选择器命中检查 ===');
for (const t of targets) {
  const attr = t.sel.match(/aria-label(\$?=")([^"]+)"/);
  const isSuffix = t.sel.includes('$=');
  const needle = attr[2];
  const hits = uniq.filter((l) => (isSuffix ? l.endsWith(needle) : l === needle));
  console.log(`${hits.length ? 'HIT ' : 'MISS'} ${t.desc}`);
  console.log(`       选择器 ${t.sel} → 命中: ${hits.length ? hits.join(' / ') : '无'}`);
}

console.log('\n=== 规则就位 ===');
const checks = [
  ['图标 18px', /width:\s*18px !important/.test(inline)],
  ['线宽 1.7', /stroke-width:\s*1\.7 !important/.test(inline)],
  ['按钮去边框', /border:\s*0 !important/.test(inline)],
  ['数字等宽', /font-variant-numeric:\s*tabular-nums/.test(inline)],
  ['已赞实心', /\[aria-label="取消喜欢"\] > svg/.test(inline)],
  ['hover 微动效', /scale\(1\.14\)/.test(inline)],
  ['减少动效兜底', /prefers-reduced-motion/.test(inline)],
];
let ok = 0;
for (const [n, v] of checks) {
  console.log((v ? 'PASS' : 'FAIL').padEnd(5), n);
  if (v) ok++;
}
console.log(`\n${ok}/${checks.length}`);
