import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// --- 1. 内联 CSS 检查 ---
const html = fs.readFileSync(path.join(ROOT, 'public/index.html'), 'utf8');
const inline = html.match(/<style id="uc-threads-layout">([\s\S]*?)<\/style>/)[1];
let depth = 0;
for (const c of inline) { if (c === '{') depth++; else if (c === '}') depth--; }

console.log('=== 内联 CSS ===');
console.log((depth === 0 ? 'PASS' : 'FAIL').padEnd(5), '括号平衡');
const cssChecks = [
  ['分享 图标规则', inline.includes('[aria-label="分享"] > svg')],
  ['收藏 图标规则', inline.includes('[aria-label="收藏"] > svg')],
  ['分享 按钮规则', /body > main \[aria-label="分享"\](,| \{)/.test(inline)],
  ['收藏 按钮规则', /body > main \[aria-label="收藏"\](,| \{)/.test(inline)],
  ['旧 复制链接 已清理', !inline.includes('[aria-label="复制链接"]')],
];
for (const [n, v] of cssChecks) console.log((v ? 'PASS' : 'FAIL').padEnd(5), n);

// --- 2. 互动栏顺序检查 ---
const js = fs.readFileSync(path.join(ROOT, 'public/assets/thread-card-BiVhtaO2.js'), 'utf8');
const start = js.indexOf('function O({thread:n}){');
const bodyStart = js.indexOf('{', js.indexOf(')', js.indexOf('(', start)));
let d2 = 0, end = -1;
for (let i = bodyStart; i < js.length; i++) {
  if (js[i] === '{') d2++;
  else if (js[i] === '}') { d2--; if (d2 === 0) { end = i + 1; break; } }
}
const oFn = js.slice(start, end);

// 按出现位置排序五个动作
const markers = [
  ['点赞', oFn.indexOf('(0,T.jsx)(D,{id:n.id')],
  ['评论', oFn.indexOf('条回复')],
  ['转发', oFn.indexOf('`转发`')],
  ['分享', oFn.indexOf('`分享`')],
  ['收藏', oFn.indexOf('`收藏`')],
];
const sorted = [...markers].sort((a, b) => a[1] - b[1]);
console.log('\n=== 互动栏顺序 ===');
const orderOk = sorted.map((x) => x[0]).join('→') === '点赞→评论→转发→分享→收藏';
sorted.forEach((m, i) => console.log(`  ${i + 1}. ${m[0]} (位置 ${m[1]})`));
console.log((orderOk ? 'PASS' : 'FAIL').padEnd(5), '顺序正确');

console.log('\n=== 图标定义 ===');
console.log((js.includes('name:`bookmark`') ? 'PASS' : 'FAIL').padEnd(5), 'bookmark 图标已定义');
console.log((js.includes('var bm=l(Bk)') ? 'PASS' : 'FAIL').padEnd(5), '收藏图标组件已创建');
console.log((js.includes('gap-5') ? 'PASS' : 'FAIL').padEnd(5), '间距 gap-5');
