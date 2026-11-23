import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const BLOCK = `/* ===== 回复框字号与评论区一致 ===== */
/* textarea 上的 text-base(16px) 压过了 md:text-sm(14px)，点开回复显得字突然变大 */
body textarea#reply {
  font-size: 14px !important;
  line-height: 1.55 !important;
}
body textarea#reply::placeholder {
  font-size: 14px !important;
  line-height: 1.55 !important;
}`;

for (const rel of ['public/index.html', ...fs.readdirSync(path.join(ROOT, 'snapshots')).filter((x) => x.endsWith('.html')).map((x) => 'snapshots/' + x)]) {
  const fp = path.join(ROOT, rel);
  let src = fs.readFileSync(fp, 'utf8');
  if (src.includes('回复框字号与评论区一致')) {
    console.log('skip', rel);
    continue;
  }
  const nl = src.includes('\r\n') ? '\r\n' : '\n';
  src = src.replace('</style>', BLOCK.replace(/\n/g, nl) + nl + '</style>');
  fs.writeFileSync(fp, src, 'utf8');
  console.log('added', rel);
}
console.log('\nDone.');
