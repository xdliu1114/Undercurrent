# Undercurrent — 本地恢复版

从 `https://hip-hop-music-site.netlify.app` 公开部署产物完整抓取的本地副本（截图里的项目 `hip-hop-music-site`）。已完成品牌改名：原 **SUBTERRA 地下频段** → **Undercurrent**，图标改为三道下沉水流，中文副标已移除。

## 页面布局（Threads 风格三栏）

- **左栏（≥768px 固定）**：LOGO（48px 方块 + 1.6rem 字，比原 32px 放大一档）、竖直排列的导航（当前页用左侧荧光竖条标记）、底部竖排按钮组（发布 / 主题切换 / 登录）。
- **中间内容列**：水平居中，宽度按档位自适应——两栏时 `min(760px, 100vw - 272px)`（1080 宽下 760px，比最初的 500px 明显更舒展）；三栏时 `min(760px, 100vw - 580px)`。靠 `body` 的 `padding-left: 224px`（+ 三栏时 `padding-right: 328px`）给两侧让位。
- **右栏断点 1120px**：低于 1120 只显示左栏 + 内容两栏（与 Threads 一致，1080 屏不给右栏留位，中间才够宽）；≥1120 才出现推荐关注栏。
- **右栏推荐（≥1024px）**：搜索框 + 「推荐关注」列表，用 `data/mock-data.json` 的真实音乐人数据（按粉丝数排序取前 5），带头像色块、认证徽章和粉丝数。
- **窄屏回退**：<768px 回到原来的顶部导航；768–1023px 是左栏 + 内容两栏；≥1024px 三栏齐全。这样在 1080px 窗口也能看到完整三栏。
- **栅格降级（关键）**：原站页面用的是宽栅格（首页 hero `lg:grid-cols-12`、讨论区 `lg:grid-cols-[13rem_1fr_17rem]`、插件区多列等），内容列收窄到约 500px 后每列只剩几十像素，内容会全部叠在一起。所以三栏模式下把所有带断点的栅格容器（`[class*="lg:grid-cols"]` / `md:` / `xl:`）改为 `display:flex; flex-direction:column` 纵向堆叠，作品库卡片网格单独保留 2 列。统计数字那组 `grid-cols-3`（无断点前缀）不动，窄栏下三个数字仍正常显示。
- ⚠️ **CSS 选择器坑**：不能在属性选择器的字符串里写方括号，例如 `[class*="lg:grid-cols-["]`——CSS 解析器会判定整条选择器列表无效，连带同组其他选择器一起失效。必须用 `[class*="lg:grid-cols"]` 这种不含内部方括号的写法。
- **讨论区分类横排**：分类列表原本是 `lg:flex-col` 竖排，改成 `flex-direction: row` + `overflow-x: auto` 横向滚动。
- **帖子列表去外框**：讨论列表外层 `section` 原本是 `sm:border-x`（左右竖线，看起来像个大表格框）。去掉左右边框后只保留每条帖子的 `border-b`，变成 Threads 那种"无框 + 横向分隔线"的简约列表。
- ⚠️ **sticky 坑（最容易踩）**：原站在顶部导航下有多个 `sticky top-16` 的吸顶条（作品库/插件区筛选条、讨论区工具条、讨论区分类侧栏 `lg:sticky lg:top-24`）。顶部导航改成左栏后，这些 `top-16`（64px）失去参照，滚动时会浮起来盖住内容，看起来就像"被导航栏压住"。现在统一 `body > main [class*="sticky"] { position: static }` 全部回到正常流；同时收敛筛选条的 `-mx-4` 负边距，避免横向溢出到左栏下方。
- 四页（首页/讨论区/作品库/插件区）实测：main 内元素最左坐标 255px > 左栏右缘 224px，滚动前后一致，sticky 吸附数全部为 0。首页跑马灯（`animate-marquee` + `overflow-hidden`）的坐标偏移是动画位移造成的，视觉上被父容器裁剪，不影响布局。
- 实现：布局 CSS 内联在每个 HTML 的 `<style id="uc-threads-layout">`，用 `!important` 压过 Tailwind 的 `.sticky` / `h-16` 等原子类；右栏 HTML 由 `scripts/threads-layout.mjs` 注入 body 末尾（React root 之外，不影响 hydration）。
- **关键教训**：媒体查询断点必须按真实视口设计——最初设 `min-width: 1024px`，但测试环境实际只有 819px 宽，整条规则不生效，误判成 CSS 失效。现在左栏降到 768px，窄窗口也能看到效果。

## 明暗主题切换

页头「登录」左侧有一个主题切换按钮（太阳/月亮图标），点击在暗色/亮色间切换：

- **暗色**（默认）：原有 oklch 深暖灰 + 荧光绿
- **亮色**：暖白 `#f5f5f1` 底 + 深墨字 + 深一档的荧光绿强调，文字对比度全部通过 WCAG AA（正文 16.6:1、次要文字 6.8:1、边框 3.3:1）
- **持久化**：选择存 `localStorage.uc-theme`，刷新保持；`<head>` 内联脚本在首屏渲染前恢复主题，无闪白/闪黑；`theme-color` meta 同步更新

实现位置：token 在 `public/assets/index-CI3z2CFS.css` 末尾 `html:not(.dark){...}`；按钮逻辑在 `index-D8H8Au6A.js` 的 `K_` 组件；由 `scripts/add-theme-toggle.mjs` + `scripts/add-theme-ssr.mjs` 落地。切换只改 token，不改 JS 逻辑。

## 鼠标样式与交互反馈

**当前使用浏览器原生指针**，没有自定义光标。之前试过像素光标、DOM 跟随光标（含竖中指手势），均已停用，CSS 里的 `cursor: url(...)` 声明和 HTML 里的光标脚本全部移除。

- 想恢复改装光标：历史实现归档在 `.cursor-archive/`（`uc-cursor.js` + 两枚 SVG），相关脚本 `scripts/gen-pixel-cursors.mjs`、`build-dome-cursor.mjs`、`normalize-cursor-css.mjs`、`restore-native-cursor.mjs` 都保留着，可参照重建。
- 撤销脚本：`scripts/restore-native-cursor.mjs`——把自定义光标声明整块替换为原生指针，并清掉 HTML 里的脚本与模板注入。

**保留的交互反馈**（与光标无关，仍生效）：按钮 hover 加 1px 荧光描边、active 缩到 0.96 并加深描边；链接 active 缩到 0.98。自带 `hover:scale` / `hover:-translate` 的播放按钮和卡片已排除，保留原有动效。规则包在 `@media (hover:hover) and (pointer:fine)` 内，触屏不受影响，`prefers-reduced-motion` 下禁用缩放。

## 品牌定制（LOGO 名称 / 图标 / 配色）

全站品牌文本、LOGO 图标、页面标题、页脚、meta 已统一改为 Undercurrent。改动由 `scripts/rebrand.mjs` 完成，同时覆盖压缩产物 `public/assets/`、可读副本 `readable/` 和所有 SSR HTML。

**LOGO 当前样式：纯三条波浪线，无背景方块**。线条颜色跟随主题前景色——暗色主题白波浪、亮色主题黑波浪，任何背景下都清晰。容器 `.uc-logo-mark` 背景透明、`color: var(--foreground)`，暗色下尺寸 48px、内部 SVG 28px。想改回实心方块：把 `--logo-bg` 设成颜色、`.uc-logo-mark` 加回 `border-radius`。

- **改图标**：`public/assets/index-D8H8Au6A.js` 与 `readable/index-D8H8Au6A.js` 里的 `G_` 组件（即 LOGO），SVG 是三道 `<path>`；SSR HTML 中页头页脚各有一份，也要同步。
- **改图标底色**：不用动 JS，只改 CSS 变量即可。默认跟随站点主色：

  ```css
  :root { --logo-bg: var(--primary); }        /* 默认荧光绿 */
  :root { --logo-bg: #B96CFF; }               /* 例：电光紫 */
  :root { --logo-bg: #FF7A45; }               /* 例：信号橙 */
  ```

  该规则在 `public/assets/index-CI3z2CFS.css` 和 `readable/index-CI3z2CFS.css` 末尾。配套 class `.bg-\[var\(--logo-bg\)\]` 需保留（Tailwind 预编译产物不会自动生成，已手动补上）。
- **改品牌名**：直接跑 `node scripts/rebrand.mjs` 会把残留 SUBTERRA 全部替换（脚本幂等，已替换过的不重复改）。

## 先说清楚：能拿到什么、拿不到什么

| 项目 | 状态 | 说明 |
| --- | --- | --- |
| 线上可访问的全部文件（HTML / JS / CSS / PNG） | ✅ 已抓取 | 与 Netlify 线上完全一致，含 5 个按需懒加载的路由 chunk |
| 站点数据（音乐人、作品、插件、讨论串等） | ✅ 已提取 | `data/mock-data.json` |
| 各路由的 SSR 页面文本 | ✅ 已抓取 | `snapshots/` |
| 格式化后的可读 JS/CSS | ✅ 已生成 | `readable/` |
| 原始 JSX / 组件文件结构 / `package.json` 依赖清单 | ❌ 拿不到 | 部署产物没有 sourcemap，`.git`、`src/`、`package.json` 均未暴露 |

也就是说：**能拿到的是编译后的代码，不是原始工程源码**。不过这份 bundle 没有混淆变量名以外的东西，中文文案、Tailwind class、组件逻辑都完整保留，配合格式化副本和 JSON 数据，继续开发是可行的。

想要真正的源码，需要以下任意一项：GitHub / GitLab 仓库地址（或本地原始工程目录），或 Netlify 的 access token（用于读部署记录和构建设置）。

## 本地运行

零依赖，Node 18+ 即可：

```bash
cd E:/Undercurrent/hip-hop-music-site-local
npm run dev
```

打开 http://127.0.0.1:4173 。服务带 SPA fallback，`/threads`、`/tracks`、`/plugins`、`/threads/th1` 等路由直接访问也能正常渲染。改端口：`PORT=3000 npm run dev`。

## 目录说明

```
public/                  与线上一致的部署产物（服务根目录）
  index.html             Vite 入口，已含 SSR 内容
  assets/*.js|css        全部 13 个 JS chunk 与样式（含 threads/tracks/plugins/search/_threadId 懒加载 chunk）
  img/*.png              原图（7 张，已校验 PNG IEND 完整）
readable/                同样的 JS/CSS，经 Prettier 格式化，方便阅读和改写
data/mock-data.json      从 bundle 提取的结构化数据
scripts/extract-data.mjs 数据提取脚本（npm run extract:data）
scripts/rebrand.mjs      品牌改名 / 换图标脚本（幂等）
scripts/fix-review.mjs   设计评审修复脚本（错误边界/排版/对比度/图片本地化）
scripts/add-count.mjs    作品库结果计数补丁
scripts/add-theme-toggle.mjs  明暗主题切换（token + 按钮）
scripts/add-theme-ssr.mjs     主题按钮 SSR 同步
scripts/add-interaction.mjs   按钮 hover/按压反馈（光标部分已停用）
scripts/restore-native-cursor.mjs 撤销自定义光标，恢复系统原生指针
scripts/gen-pixel-cursors.mjs 像素光标生成器（已停用，保留备查）
scripts/normalize-cursor-css.mjs 光标规则归一化（已停用，保留备查）
scripts/build-dome-cursor.mjs DOM 跟随光标注入（已停用，保留备查）
scripts/verify-cursor.mjs    光标行为测试（jsdom，已停用）
scripts/restyle-logo.mjs      LOGO 黑白圆角改造
scripts/threads-layout.mjs    Threads 三栏布局（CSS + 右栏推荐栏注入）
scripts/inline-threads-css.mjs 三栏布局 CSS 内联与断点调整
scripts/check-layout.mjs      布局完整性校验
.cursor-archive/         已停用的光标实现（uc-cursor.js + 两枚 SVG）
DESIGN-REVIEW.md         impeccable 三件套评审报告与修复记录
snapshots/               各路由 SSR HTML，便于对照文案和页面结构
server.mjs               零依赖静态服务器 + SPA fallback
```

## 各 JS chunk 大致职责

- `bits-*.js` — 核心数据、状态管理（subscribe/store）、播放器（Web Audio 合成鼓机，无需音频文件）、通用 UI 组件
- `routes-*.js` — 页面组件：首页、讨论区列表/详情、作品列表、插件列表/详情等
- `thread-*.js` — 讨论串卡片
- `index-*.js` — 应用入口与 React 运行时
- `preload-helper-*.js` — 路由预加载辅助
- 其余几个极小的 chunk 是 lucide 图标

## 继续开发的建议

1. **内容修改**：优先改 `data/mock-data.json`，数据原本就集中在一个数组里。
2. **逻辑修改**：在 `readable/` 里改；但 `public/` 里的文件名带哈希，改完要同步文件名和 `index.html` 中的引用，否则线上产物那套静态服务不会加载新文件。
3. **想恢复正常工程结构**：以 `readable/` 为参考重新搭一个 Vite + React + Tailwind + React Router 项目，把数据直接接 `data/mock-data.json`。这比在压缩产物上改要省事得多。
4. **注意**：站点字体走 Google Fonts CDN，离线环境下字体会回退；封面图是本地 PNG，不依赖 Netlify 的图片转换接口。
5. **排错**：如果页面显示 `This page couldn't load`，基本都是某个懒加载 chunk 404 了（本目录最初只抓了首页预加载的 8 个 chunk，补上 5 个路由 chunk 后已修复）。检查 DevTools Network 里的 `/assets/*.js` 是否为 404 即可。

- **按钮圆角**：原站全局 `--radius` 只有 `0.2rem`（3.2px），按钮和输入框看起来接近直角。现在提到 `0.625rem`（10px），并显式覆盖 `.rounded-sm`(6px) / `.rounded-md`(8px) / `.rounded-lg`(10px) / `.rounded-xl`(14px)，不依赖 CSS 变量计算。没有圆角类的 `button` / `select` / `textarea` / `input` 由兜底规则补 8px；`rounded-full` 的头像和播放键不受影响（保持圆形）。校验脚本 `node scripts/check-radius.mjs`。

- **深色主题为中性纯黑**：原 `--background` 是 `oklch(16.5% .006 105)`（约 #0f0e0c，带黄绿偏色，所以看着"不是纯黑"）。现改为 `oklch(10% 0 0)`（≈#030303）完全中性，卡片/次级面/边框同步下移保持层次：card 14%、popover 15%、muted 16%、secondary 18%、accent 20%、input 22%、border 42%。浅色主题不受影响（`html:not(.dark)` 特异性更高）。校验 `node scripts/check-dark.mjs`。

- **帖子互动栏图标精细化**：原图标 `size-4`(16px) + `stroke-width: 2`，小尺寸下线条糊。改为 18px + 1.7，按钮去边框/底色、数字 `tabular-nums` 对齐，hover 图标微上浮放大，已赞态实心红心（`[aria-label="取消喜欢"]` 时 fill）。选择器用 `aria-label` 精确命中（`$="条回复"` 覆盖"0/1/2/3 条回复"，`$="喜欢"` 覆盖喜欢与取消喜欢两态）。校验 `node scripts/check-icons.mjs`。
