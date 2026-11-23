import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fp = path.join(ROOT, 'public/assets/thread-card-BiVhtaO2.js');
let src = fs.readFileSync(fp, 'utf8');

if (src.includes('name:`bookmark`')) {
  console.log('已改造过，跳过');
  process.exit(0);
}

// 1) 新增 bookmark 图标定义（lucide 原路径），插在 function O 之前
const bookmarkDef = 'var Bk={name:`bookmark`,size:24,node:[[`path`,{d:`m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z`,key:`bk1zjx`}]]};Bk.node;var bm=l(Bk);';

// 2) 定位原 O 函数（括号配平）
const start = src.indexOf('function O({thread:n}){');
if (start < 0) throw new Error('未找到 O 函数');
const parenOpen = src.indexOf('(', start);
const parenClose = src.indexOf(')', parenOpen);
const bodyStart = src.indexOf('{', parenClose);
let i = bodyStart, depth = 0, end = -1;
for (; i < src.length; i++) {
  if (src[i] === '{') depth++;
  else if (src[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
}
const oldO = src.slice(start, end);
console.log('函数体起点检查:', JSON.stringify(src.slice(bodyStart, bodyStart + 30)));
console.log('原 O 函数长度:', oldO.length);

// 3) 新顺序：点赞 → 评论 → 转发 → 分享 → 收藏
const newO =
  'function O({thread:n}){return(0,T.jsxs)(`div`,{className:`mt-3 flex items-center gap-5`,children:[' +
  '(0,T.jsx)(D,{id:n.id,base:n.likes}),' +
  '(0,T.jsxs)(r,{to:`/threads/$threadId`,params:{threadId:n.id},className:`inline-flex items-center gap-1.5 rounded-sm px-1.5 py-1 font-mono text-xs text-muted-foreground hover:text-primary`,"aria-label":`${n.replies.length} 条回复`,children:[(0,T.jsx)(v,{className:`size-4`}),n.replies.length]}),' +
  '(0,T.jsxs)(`button`,{type:`button`,onClick:e=>{e.stopPropagation(),t(`转发功能将与账号系统一起上线`)},className:`inline-flex items-center gap-1.5 rounded-sm px-1.5 py-1 font-mono text-xs text-muted-foreground hover:text-primary`,"aria-label":`转发`,children:[(0,T.jsx)(S,{className:`size-4`}),e(n.reposts)]}),' +
  '(0,T.jsx)(`button`,{type:`button`,onClick:e=>{e.stopPropagation();let r=`${window.location.origin}/threads/${n.id}`;navigator.clipboard?.writeText(r).then(()=>t.success(`链接已复制`),()=>t.error(`复制失败，请手动复制地址栏`))},className:`inline-flex items-center gap-1.5 rounded-sm px-1.5 py-1 text-muted-foreground hover:text-primary`,"aria-label":`分享`,children:(0,T.jsx)(w,{className:`size-4`})}),' +
  '(0,T.jsx)(`button`,{type:`button`,onClick:e=>{e.stopPropagation(),t(`收藏功能将与账号系统一起上线`)},className:`inline-flex items-center gap-1.5 rounded-sm px-1.5 py-1 text-muted-foreground hover:text-primary`,"aria-label":`收藏`,children:(0,T.jsx)(bm,{className:`size-4`})})' +
  ']})}';

src = src.slice(0, start) + bookmarkDef + newO + src.slice(end);
fs.writeFileSync(fp, src, 'utf8');
console.log('已改造');
console.log('验证：bookmark 定义存在 =', src.includes('name:`bookmark`'));
console.log('验证：五个 aria-label 顺序 =', (src.match(/aria-label":`(条回复|转发|分享|收藏|喜欢|取消喜欢)/g) || []).join(' → '));
