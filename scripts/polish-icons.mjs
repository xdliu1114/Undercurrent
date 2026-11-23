import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const BLOCK = `/* ===== 帖子互动栏图标精细化 ===== */
/* 原来 16px + stroke-width 2，小尺寸下线条糊成一团；改 18px + 1.7 更精致 */
body > main [aria-label$="条回复"] > svg,
body > main [aria-label="转发"] > svg,
body > main [aria-label$="喜欢"] > svg,
body > main [aria-label="复制链接"] > svg {
  width: 18px !important;
  height: 18px !important;
  stroke-width: 1.7 !important;
  transition: transform .16s cubic-bezier(.2,.7,.2,1), color .16s ease;
}
/* 按钮本体：去掉任何边框/底色，数字tabular对齐更整齐 */
body > main [aria-label$="条回复"],
body > main [aria-label="转发"],
body > main [aria-label$="喜欢"],
body > main [aria-label="复制链接"] {
  border: 0 !important;
  outline: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 7px !important;
  padding: 4px 5px !important;
  gap: 5px !important;
  font-variant-numeric: tabular-nums !important;
  letter-spacing: .01em !important;
}
/* hover：图标轻微上浮放大，数字不动 */
body > main [aria-label$="条回复"]:hover > svg,
body > main [aria-label="转发"]:hover > svg,
body > main [aria-label="复制链接"]:hover > svg {
  transform: translateY(-1px) scale(1.06);
}
/* 点赞 hover / 已赞：心形弹性放大 */
body > main [aria-label$="喜欢"]:hover > svg {
  transform: scale(1.14);
}
/* 已点赞：实心红心，线宽减一档避免填充后显胖 */
body > main [aria-label="取消喜欢"] > svg {
  fill: currentColor !important;
  stroke-width: 1.4 !important;
}
/* 复制链接图标 hover 旋转微动 */
body > main [aria-label="复制链接"]:hover > svg {
  transform: translateY(-1px);
}
@media (prefers-reduced-motion: reduce) {
  body > main [aria-label$="条回复"] > svg,
  body > main [aria-label="转发"] > svg,
  body > main [aria-label$="喜欢"] > svg,
  body > main [aria-label="复制链接"] > svg {
    transition: none;
  }
  body > main [aria-label$="喜欢"]:hover > svg,
  body > main [aria-label$="条回复"]:hover > svg,
  body > main [aria-label="转发"]:hover > svg,
  body > main [aria-label="复制链接"]:hover > svg {
    transform: none;
  }
}`;

for (const rel of ['public/index.html', ...fs.readdirSync(path.join(ROOT, 'snapshots')).filter((x) => x.endsWith('.html')).map((x) => 'snapshots/' + x)]) {
  const fp = path.join(ROOT, rel);
  let src = fs.readFileSync(fp, 'utf8');
  if (src.includes('帖子互动栏图标精细化')) {
    console.log('skip', rel);
    continue;
  }
  const nl = src.includes('\r\n') ? '\r\n' : '\n';
  // 追加到内联 style 末尾
  src = src.replace('</style>', BLOCK.replace(/\n/g, nl) + nl + '</style>');
  fs.writeFileSync(fp, src, 'utf8');
  console.log('added', rel);
}
console.log('\nDone.');
