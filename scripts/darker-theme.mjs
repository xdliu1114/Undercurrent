import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// 深色主题整体下移到接近纯黑，保持原有层次间隔
// 注意：不能用 !important，否则会压过 html:not(.dark) 的浅色变量
const BLOCK = `/* 深色主题：更接近纯黑（原 --background 16.5% 偏暖灰） */
:root {
  --background: oklch(7% .002 105);
  --card: oklch(12% .005 105);
  --popover: oklch(13% .005 105);
  --muted: oklch(14% .005 105);
  --secondary: oklch(16% .006 105);
  --accent: oklch(18% .007 105);
  --input: oklch(20% .008 105);
  --border: oklch(40% .009 105);
}`;

for (const rel of ['public/index.html', ...fs.readdirSync(path.join(ROOT, 'snapshots')).filter((x) => x.endsWith('.html')).map((x) => 'snapshots/' + x)]) {
  const fp = path.join(ROOT, rel);
  let src = fs.readFileSync(fp, 'utf8');
  if (src.includes('深色主题：更接近纯黑')) {
    console.log('skip', rel);
    continue;
  }
  const nl = src.includes('\r\n') ? '\r\n' : '\n';
  // 放在内联 style 最前面（变量会被后续规则引用，位置不影响继承）
  src = src.replace('<style id="uc-threads-layout">' + nl, '<style id="uc-threads-layout">' + nl + BLOCK.replace(/\n/g, nl) + nl + nl);
  fs.writeFileSync(fp, src, 'utf8');
  console.log('added', rel);
}
console.log('\nDone.');
