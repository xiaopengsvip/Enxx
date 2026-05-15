# AGENTS.md - ENXX English Self-Learning

This project is a Next.js English self-learning website deployed at `/www/wwwroot/enxx.allapple.top` for `https://enxx.allapple.top`.

## Project identity

Unified project name:

ENXX English Self-Learning｜英语自学网站

Do not use legacy naming in product UI, SEO, manifest, README, or user-facing copy:

- 英语搭建器
- English Builder
- ENXX English Builder

All site identity, version, update date, and developer information must come from:

```text
src/config/site.ts
```

Current version:

```text
0.3.3-beta
```

Updated:

```text
2026-05-15
```

## Role

You are the maintenance agent for ENXX English Self-Learning. Keep the product focused on zero-based English learners. The learning loop is:

daily plan + dictionary + listening + grammar path + sentence analyzer + AI check + notes + review plan.

Do not turn it into a word-memorization-only app.

## Commands

```bash
npm install
npm test
npm run lint
npm run typecheck
npm run build
npm run dev
npm start
```

Default port: `3000`. Production start binds to `127.0.0.1:3000` and should be exposed through Caddy reverse proxy only.

PM2:

```bash
pm2 start ecosystem.config.js
pm2 restart enxx-english-self-learning
pm2 logs enxx-english-self-learning
```

## Important files

- `src/config/site.ts` - canonical site name, version, updated date, domain, developer info.
- `src/app/layout.tsx` - SEO, PWA metadata, JSON-LD, root layout.
- `src/components/layout/AppShell.tsx` - global shell, sticky header, desktop nav, mobile bottom nav.
- `src/components/layout/floating-ai-button.tsx` - global draggable AI Tutor entry.
- `src/components/auth/password-input.tsx` / `auth-input.tsx` / `user-menu.tsx` - shared auth UI controls.
- `src/components/layout/developer-footer.tsx` - developer footer and version display.
- `src/components/layout/BrandIntro.tsx` - first-load intro animation.
- `src/app/(main)/page.tsx` - Dashboard.
- `src/app/(main)/vocabulary/page.tsx` - Vocabulary page.
- `src/app/(main)/structures/page.tsx` - Sentence Structure page.
- `src/app/(main)/scenes/page.tsx` - Scene Practice page.
- `src/app/(main)/ai-tutor/page.tsx` - AI Tutor page.
- `src/app/(main)/review/page.tsx` - Review Plan page.
- `src/app/(main)/alphabet/page.tsx` - Alphabet, phonics, and phonetic starter page.
- `src/app/(main)/learn-path/page.tsx` - Zero-based learning path page.
- `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/app/(main)/account/page.tsx`, `src/app/(main)/account/profile/page.tsx` - Auth/account pages.
- `src/app/(main)/notes/page.tsx`, `src/app/(admin)/admin/page.tsx`, `src/app/(admin)/admin/layout.tsx` - Database-backed notes/admin pages and independent Admin Layout.
- `src/app/(main)/progress/page.tsx` - Progress page.
- `src/app/(main)/mistakes/page.tsx` - Mistakes page.
- `src/app/(main)/dictionary/page.tsx` - Dictionary 查词即学习页面。
- `src/app/(main)/daily-plan/page.tsx` - Daily Plan 今日步骤式学习计划页面。
- `src/app/(main)/listen/page.tsx` - Listen Player 听力连续播放页面。
- `src/app/(main)/grammar/page.tsx` - Grammar Path 语法路线页面。
- `src/app/(main)/analyzer/page.tsx` - Sentence Analyzer 句子拆解器页面。
- `src/app/api/dictionary/*` - 字典搜索、详情、收藏、复习、笔记、造句 API。
- `src/app/api/daily-plan/*` - 今日计划模板、步骤完成、整日完成 API。
- `src/data/daily-plan.ts`, `src/data/grammar.ts`, `src/data/badges.ts` - 每日计划、语法路线、徽章静态规则。
- `src/lib/level.ts` - 用户等级和 streak 统计规则。
- `src/lib/speech.ts` / `src/components/learning/speak-button.tsx` - 统一浏览器语音朗读能力。
- `src/app/api/ai/*/route.ts` - Mock AI API routes and future real AI integration points.
- `src/app/api/health/route.ts` - Lightweight public health/version endpoint.
- `src/lib/email/*` - Email templates, code hashing, template rendering, and mail-security helpers.
- `src/app/api/admin/emails/*`, `src/app/api/admin/email-logs/route.ts`, `src/app/api/admin/settings/email/*` - Admin mail center APIs.
- `src/components/admin/email-template-preview.tsx`, `email-send-form.tsx`, `user-create-form.tsx` - Admin mail/user UI components.
- `src/lib/learning-db.ts` - Client/API mapping helpers for DB review items, mistakes, and word slug lookup.
- `tests/learning-db.test.ts` - Node test coverage for database-to-client learning data mapping.
- `src/lib/sentence-analyzer.ts` - Rule-based MVP sentence analyzer.
- `src/lib/review.ts` - 1-3-7-15 review scheduling.
- `src/store/learning-store.ts` - Zustand store with localStorage persistence.
- `src/data/*.ts` - Built-in learning content.
- `CHANGELOG.md` - required for every version change.

## Version update rule

Version format:

```text
major.minor.patch-stage
```

Examples:

```text
0.0.1-beta
0.0.2-beta
0.0.3-beta
0.0.4-beta
0.1.0-beta
1.0.0
```

Rules:

- Small feature or content update: patch +1.
- New page/module: minor +1 and reset patch to 0.
- Stable public release: `1.0.0`.
- Every meaningful change must update `siteConfig.version`, `siteConfig.updatedAt`, and `CHANGELOG.md` together.

## Product rules

1. Use simple Chinese explanations.
2. Prefer simple English examples.
3. Always connect words to sentences and scenes.
4. AI Tutor replies should be clear, encouraging, and avoid complex grammar terminology.
5. Mobile-first UI is required.
6. Support both light and dark mode.
7. 生产环境已启用 PostgreSQL；登录后的进度/复习/错题/笔记必须写入数据库，同时未登录或接口异常时公共学习页和 mock AI 必须仍可用。
8. Do not remove existing learning content unless asked.
9. When adding real AI, keep mock fallback so the site still works without API keys.
10. Before finishing changes, run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.



## Auth and global AI rules

1. 登录链路属于 P0 功能，不能只做 UI。
2. 登录必须完成：表单提交、API、bcrypt、JWT、httpOnly cookie、跳转、导航刷新。
3. 登录失败必须显示错误，不能点击无反应。
4. Auth 页面必须使用独立 Auth Layout；`/login`、`/register`、`/forgot-password`、`/reset-password` 不允许放在普通 `AppShell` 中。
5. Auth 页面不显示普通主导航、移动端底部导航、普通 Footer 大卡片和全局 AI 悬浮按钮。
6. Auth 页面之间必须使用 `next/link` 切换，保持共享背景和品牌栏，不要整页闪烁。
7. Auth 页面切换应使用轻量动画，避免白屏、layout 大跳动和输入框焦点混乱。
8. AI Tutor 不再作为顶部导航普通项。
9. 全局 AI 入口统一使用 `FloatingAiButton`。
10. 不要在多个页面重复创建不同样式的 AI 入口。
11. 悬浮按钮位置状态存储在 `localStorage`，必须只在客户端访问。
12. 登录 / 注册在 PC 顶部右侧账号区域展示，不混入主导航。
13. 移动端账号入口统一通过“我的”。
14. 所有密码输入框必须使用 `PasswordInput` 组件。
15. 密码框必须支持眼睛图标显示 / 隐藏。
16. 所有输入框必须有清晰 placeholder。
17. 忘记密码不能暴露邮箱是否注册。
18. `PasswordResetToken` 只能存 hash，不能存明文 token。
19. SMTP 未配置时不能导致 build 失败。
20. 不允许把 reset token 打印到生产日志。
21. 登录和注册页面必须保持 Liquid Glass 风格。
22. 表单必须具备 loading、错误提示、密码显示隐藏。
23. 移动端必须避免悬浮 AI 遮挡底部导航。
24. `/api/auth/me` 返回 401 必须静默处理为未登录：`setUser(null)`，不 `console.error`，不阻断页面渲染。
25. 每次账号体系修改后必须测试注册、登录、退出、忘记密码、重置密码、修改密码。
26. 每次账号相关修改后必须运行 `npx prisma generate`、`npm run lint` 和 `npm run build`。
27. 注册必须经过邮箱验证码，不能绕过 `/api/auth/register/send-code` 和 `/api/auth/register/verify`。
28. 登录验证码流程不能绕过，除非管理员账号没有邮箱时使用兼容逻辑。
29. 验证码不允许明文存储，只能保存 hash。
30. 邮件模板必须使用统一 base template，并同时支持 html 和 text。
31. 后台发送邮件和后台新增用户必须 `requireAdmin`。
32. SMTP_PASS 绝不返回前端，授权码也不写入日志或源码。
33. EmailLog 不记录验证码明文和 reset token 明文。
34. 任何邮件相关功能修改后必须测试发送。
35. 后台新增用户必须设置 `mustChangePassword=true`。
36. 登录 ticket 不允许明文存数据库，使用后必须写入 `usedAt`。
37. 注册页发送验证码后必须显示验证码输入框。
38. 注册必须 verify 成功后才创建用户。
39. 登录验证码流程必须在同一卡片内完成。
40. SMTP 配置必须通过 `SystemSetting` 保存。
41. SMTP_PASS 永远不能明文返回前端。
42. 邮件配置读取统一走 `getMailConfig`。
43. 邮件发送统一走 `sendMail`。
44. 验证码和 ticket 不允许明文存储。
45. 修改注册 / 登录后必须测试验证码收发。

46. ENXX 项目的底层默认测试收件邮箱必须是 `test@allapple.top`。
47. 所有测试相关邮件都必须遵守 `getTestEmailRecipient` 优先级。
48. 不允许默认使用发件邮箱作为测试收件邮箱。
49. 不允许默认使用个人邮箱作为测试收件邮箱。
50. 后台可以配置其他测试邮箱，但未配置时必须 fallback 到 `test@allapple.top`。
51. SMTP 测试脚本未传 `--to` 时不能报错，应使用 `test@allapple.top`。
52. 后台测试发信未传 `to` 时不能报错，应使用 `getTestEmailRecipient`。
53. 邮件相关功能不能输出 SMTP_PASS。
54. 邮件日志不能记录验证码明文。
55. 邮件日志不能记录 reset token 明文。
56. 推送 GitHub 前必须检查 `.env` 和敏感信息。

57. 默认管理员邮箱必须是 `adminenxx@allapple.top`。
58. `/account` 页面必须根据 role 区分显示；管理员才显示后台入口，普通用户不得看到后台管理入口。
59. `mustChangePassword` 提示必须根据 ADMIN / USER 区分文案。
60. 头像上传必须限制文件类型和大小：jpg/jpeg/png/webp，最大 2MB，不允许 svg 或可执行文件。
61. 用户只能修改自己的资料；管理员可以在后台查看和管理用户。
62. `/api/auth/me` 必须返回 avatar、displayName、role、mustChangePassword。
63. 上传头像或修改资料后必须刷新用户菜单。
64. 后台必须使用独立 Admin Layout，不要放在普通 AppShell route group 中。
65. 后台 API 必须 `requireAdmin`，后台不能返回 SMTP_PASS。
66. 后台首页只展示概览，不要塞太多完整列表；字典词库完整管理放在 `/admin/dictionary`。
67. 所有 HTML 邮件必须使用 base-template，顶部必须显示 ENXX 品牌 Logo。
68. Email Logo URL 必须使用 HTTPS 绝对地址，不允许 javascript: 或 data: URL。
69. `lianxingtz@qq.com` 只作为 SMTP 发件邮箱，不作为默认测试收件邮箱。
70. 推送 GitHub 前必须检查 `.env`、真实密钥、node_modules、.next 和用户上传头像。
71. Cloudflare Email Routing 只负责收信转发，不等于 SMTP 发信服务；测试发信时不能修改 `allapple.top` 主域 MX。
72. 如需测试 `enxx@enxx.allapple.top` 发信，只允许通过临时 From 或子域 `enxx.allapple.top` 的发信服务商验证，不要默认切换生产 From。
73. 自定义 From 必须走 `getMailFromConfig`，优先级为后台 `EMAIL_FROM_NAME` + `EMAIL_FROM_ADDRESS`、环境变量、`SMTP_FROM`、`ENXX <SMTP_USER>`。
74. 后台测试发信和 `scripts/test-smtp.ts` 必须支持临时 `from`，但临时 From 不写入配置。
75. EmailLog 可以记录安全的 `from`、`to`、`subject`、`status`、`error`、`messageId`，但不能记录 SMTP_PASS、验证码明文、reset token 明文。

## Learning system module rules

1. 新增学习模块时必须接入导航和学习路线。
2. 新增用户学习行为时，已登录必须写入数据库并按 `userId` 隔离。
3. 未登录只能临时体验，保存时引导登录，不要抛 500。
4. 字典模块是核心学习工具，不允许简化为单词列表；必须保留查词、发音、例句、造句、复习、笔记闭环。
5. 听力功能统一使用 `src/lib/speech.ts` 和 `SpeakButton`，`speechSynthesis` 逻辑只能在 client component 中执行。
6. 句子拆解优先使用 `src/lib/sentence-analyzer.ts`，后续可接 AI Provider。
7. 不要把成人自学网站做成儿童卡片风格；保持 Liquid Glass、蓝紫科技、移动优先。
8. 每次改动后必须更新 `CHANGELOG.md`。
9. 每次改动后必须运行 `npm run lint` 和 `npm run build`；涉及 schema 时还必须运行 `npx prisma generate`。

## Do not break

- Liquid Glass UI.
- Mobile adaptation.
- Bottom navigation.
- Sticky top navigation.
- AI Tutor page.
- Review plan logic.
- localStorage learning records.
- Mock AI API routes.

## UI style

Modern, clean, technology learning product style inspired by Apple / Linear / Notion / Duolingo. Use card-based layout, soft Liquid Glass effect, blue-violet technology palette, and natural motion.

## Future AI integration suggestion

Create `src/lib/ai-provider.ts` with an interface like:

```ts
export interface AiProvider {
  checkSentence(input: string): Promise<AiCheckResponse>;
  translate(input: string): Promise<AiTranslateResponse>;
  analyzeSentence(input: string): Promise<SentenceAnalysis>;
  generatePractice(input: string): Promise<AiPracticeResponse>;
}
```

Then call it from `src/app/api/ai/*/route.ts`. Read API settings from `.env.local` and keep `src/lib/sentence-analyzer.ts` as fallback.


## Database / auth operations

Production database is local PostgreSQL on `127.0.0.1:5432`, database `enxx_db`, user `enxx_user`. Runtime secrets live in `/www/wwwroot/enxx.allapple.top/.env` with mode `600`; never print or commit real secrets.

Required database commands after schema/content changes:

```bash
npm run db:generate
npm run db:deploy
npm run db:seed
```

The seed script creates the default admin from `ADMIN_USERNAME` / `ADMIN_INITIAL_PASSWORD` and marks `mustChangePassword=true`. Do not remove the localStorage fallback: logged-out users should still be able to learn, and protected API routes should return JSON 401/403 instead of unhandled 500 errors.


## 0.3.3-beta Admin Console layout rules

1. 后台必须使用标准 Admin Console 结构：固定 Sidebar + 全局 Topbar + AdminContentContainer + 页面唯一 AdminPageHeader。
2. Topbar 只做全局操作栏和当前位置提示，不渲染页面主标题或长描述。
3. 每个后台页面只允许一个页面主标题区；禁止 Hero 标题和内容标题重复。
4. 右侧内容必须放入统一 `AdminContentContainer`，最大宽度约 1360px，统一 padding 和 section 间距。
5. `/admin/users` 是标准后台内容页模板：PageHeader、StatsRow、Toolbar、TableCard、EmptyState、分页区域。
6. 表格字段展示必须用户友好，不直接暴露数据库字段名；例如 `mustChangePassword` 显示为“首次改密”，`createdAt` 显示为“创建时间”。
7. 新后台页面优先复用 `src/components/admin/admin-*` 通用组件，不要每页重复手写一套壳和标题。
8. Sidebar PC 端固定，移动端抽屉化；Topbar 保持稳定悬浮，用户菜单包含我的账号、后台首页、修改密码和退出登录。

## 0.3.2-beta Admin / LoginLog / Mail Provider rules

1. 后台侧边栏入口不能 404。
2. 未完成功能必须标识开发中/规划中/维护中。
3. 登录成功必须记录 LoginLog。
4. LoginLog 记录 IP、地区、设备、浏览器、系统。
5. IP 地区识别失败不能影响登录。
6. 用户更换邮箱必须走 CHANGE_EMAIL 验证码。
7. /account/profile 不允许直接 PATCH 修改 email。
8. 用户头像上传必须限制类型和大小。
9. 顶部用户菜单必须同步头像和 displayName。
10. 后台用户详情必须显示最近登录记录。
11. 普通用户只能查看自己的登录记录。
12. 管理员可以查看所有登录记录。
13. QQ SMTP 是当前稳定 Provider，不要破坏。
14. custom_smtp 是自建测试通道，测试成功前不得设为默认。
15. google_smtp 是可配置通道，测试成功前不得设为默认。
16. Resend/Brevo/Mailgun/SES/SendGrid/Postmark 未真实接入前必须显示开发中或规划中。
17. Provider 扩展必须通过 MailProviderConfig。
18. 所有业务邮件必须走 sendMail。
19. 不允许业务 API 直接调用 nodemailer。
20. test@allapple.top 是默认测试收件邮箱。
21. lianxingtz@qq.com 只作为 QQ SMTP 发件账号。
22. enxx@enxx.allapple.top 只能通过 custom_smtp 或自定义域 Provider 正式发信。
23. 不修改 allapple.top 主域 MX。
24. 自建 SMTP 需要 DNS 与 IP 信誉检查。
25. 邮件日志不得记录敏感信息。
26. 切换默认 Provider 前必须测试成功。
27. 未验证通道不能开放为默认发信通道。
28. 维护中/开发中/规划中的通道不能设为默认。
29. 所有 Provider 测试默认收件人必须是 test@allapple.top。
