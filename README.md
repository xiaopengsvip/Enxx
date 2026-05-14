# ENXX English Self-Learning

项目名称：ENXX English Self-Learning｜英语自学网站

域名：`https://enxx.allapple.top`
默认端口：`3000`，生产模式默认仅监听 `127.0.0.1:3000`，通过 Caddy 反向代理对外访问。
项目目录：`/www/wwwroot/enxx.allapple.top`

英语自学网站，支持字母、音标、单词、句型、场景、AI Tutor、复习、笔记、错题、账号体系、邮箱验证码、后台管理和邮件系统。

ENXX 不只是背单词，而是通过：查词、听发音、学句型、拆句子、AI 检查、写笔记、做复习，建立完整英语自学闭环。

核心 slogan：

> 单词是零件，语法是组装方式，句子才是成品。

## 当前版本

- Version: `0.3.2-beta`
- Updated: `2026-05-15`
- Developer: Everett / AI SYSTEMS
- Developer Site: https://allapple.top/


## 新增核心模块

1. 英语字典 Dictionary：支持查词、音标、发音、例句、短语、词形变化、同义词、反义词、学习笔记、收藏和加入复习。
2. 每日学习计划 Daily Plan：按“听、学、练、查、复习”组织每日 10 分钟自学路径。
3. 听力播放器 Listen Player：连续播放字母、音标、单词、例句、场景句和今日复习内容。
4. 语法路线 Grammar Path：从主谓宾、be 动词、主系表，到时态、疑问句、否定句、情态动词、there be、because/if/when 等基础语法。
5. 句子拆解器 Sentence Analyzer：规则拆解主语、谓语、宾语、表语、状语，复杂句可转 AI Tutor。
6. 学习等级：Zero / Starter / Basic / Explorer / Speaker / Advanced。
7. 连续学习打卡：基于 DailyStudyLog 显示今日完成、连续天数、最长连续、本周/本月学习天数。
8. 学习徽章：字母完成、音标入门、100 词达成、主谓宾掌握、7 天连续学习等基础徽章。

## 功能清单

- Dashboard 首页：今日学习任务、今日单词数量、今日句型、今日复习数量、学习进度、连续学习天数、快速入口。
- Vocabulary 单词学习：英文、中文、词性、发音、例句、场景联想、造句检查、收藏、已掌握。
- Sentence Structure 句子结构：5 个基础句型、中文解释、英文公式、例句、句子拆解、练习题、AI 检查。
- Sentence Analyzer 句子拆解工具：规则模拟主语、谓语、宾语、状语、句子骨架。
- Scene Practice 场景学习：Room、Light、Door、Curtain、Air Conditioner、Phone、Computer、Network、AI System、Hotel Control。
- AI Tutor：中文转简单英文、英文语法检查、主谓宾拆解、生成练习。
- Alphabet / Learn Path：字母、自然拼读、音标和零基础学习路线入口。
- Auth / Account / Admin / Notes：登录注册、账号信息、管理员统计、学习笔记等数据库能力（生产已配置 PostgreSQL + JWT_SECRET）。
- API Health：`/api/health` 返回服务版本和健康状态。
- Review Plan：1-3-7-15 复习法，支持“不会 / 有点印象 / 基本会 / 已掌握”，登录后复习卡写入数据库。
- Progress：已学单词、掌握单词、句型、练习、连续天数、今日时长、复习完成率、错题数量；登录后优先显示数据库进度，未登录回退本地记录。
- Mistakes：错题记录、用户答案、正确答案、错误原因、重新练习、标记解决；登录后错题按 userId 隔离存储。
- Developer Footer：Everett / AI SYSTEMS 开发者信息与版本信息。
- 本地进度：使用 Zustand + localStorage 作为未登录/接口异常 fallback；登录后新产生的学习记录写入 PostgreSQL。

- Dictionary 英语字典：查词即学习，支持模糊搜索、中文意思、分类、场景、Level，支持发音、短语、词形、同义词、反义词、收藏、复习、笔记和造句。
- Daily Plan 今日计划：6 步式学习流，未登录可预览，登录后写入 DailyStudyLog。
- Listen Player 听力播放器：字母、音标、单词、例句、场景句连续播放，支持中英/英文、慢速/标准/正常。
- Grammar Path 语法路线：Level 0-15 基础语法路线图，含例句、拆解、常见错误和练习。
- Sentence Analyzer 句子拆解器：支持主谓宾、主系表、there be、情态动词、否定句等 MVP 规则拆解。
- Level / Streak / Badges：账号和进度页显示学习等级、打卡连续学习和徽章。


## 账号体系

### 独立 Auth 页面

- 登录、注册、忘记密码、重置密码使用独立 Auth Layout：`/login`、`/register`、`/forgot-password`、`/reset-password`。
- Auth 页面不显示普通主导航、移动端底部导航、普通 Footer 大卡片和全局 AI 悬浮按钮，避免遮挡账号表单。
- Auth 页面之间使用 `next/link` 切换，保持同一套背景、品牌栏和容器，并通过轻量动画完成无感切换。
- Auth Layout 顶部只保留 ENXX 品牌、返回首页和主题切换按钮。

### 账号功能

- 支持普通用户注册登录，注册必须通过邮箱验证码。
- 登录支持邮箱验证码二次验证；管理员无邮箱账号保留兼容登录逻辑。
- 支持管理员账号和后台入口。
- 支持忘记密码 / 找回密码。
- 支持重置密码。
- 支持管理员后台新增账号并强制首次改密。
- 支持管理员重置用户密码。
- 登录后永久保存学习记录、笔记、错题和复习计划。

默认管理员账号：

```text
username: adminenxx
email: adminenxx@allapple.top
initial password: enxx@allapple.top
```

安全提醒：首次登录后请立即修改默认管理员密码；生产环境必须更换 `JWT_SECRET`。

### 账号中心

- `/account` 是正式账号中心，用户可以查看学习数据、修改资料、上传头像、修改密码。
- 管理员账号会显示“管理员专区”和后台入口；普通用户看不到后台管理入口。
- `/account/profile` 支持修改显示名称、邮箱、个人简介、学习目标、timezone 和 locale。
- 头像上传支持 jpg、jpeg、png、webp，限制 2MB，保存到 `/uploads/avatars`。

### 后台入口

后台入口：`/admin`。后台模块包括：

- 概览
- 用户管理
- 内容管理
- 邮件中心
- 学习数据
- 系统设置

后台使用独立 Admin Layout，管理员可管理用户、词库、语法、题库、邮件、学习数据和系统配置；普通用户不能访问后台页面和后台 API。

## 全局 AI 助手

ENXX 提供全局 AI Tutor 悬浮按钮，用户可以在任意页面快速进行中文转英文、英文纠错、句子拆解和造句练习。悬浮按钮支持拖拽、边缘吸附和位置记忆，位置保存在浏览器 `localStorage`。

## 邮件系统和 SMTP

ENXX 邮件系统支持：

- 注册验证码邮件。
- 登录验证码二次验证邮件。
- 重置密码邮件。
- 注册欢迎邮件。
- 管理员创建账号通知邮件。
- 后台发送单个 / 多个 / 全体 / 指定角色用户通知邮件。
- 邮件模板预览。
- 邮件发送日志。
- 后台 SMTP 数据库配置、脱敏查看和测试发送。

邮件模板统一使用 ENXX Liquid Glass 蓝紫科技风 HTML 基座，同时提供 text 纯文本版本。验证码和 reset token 不会明文写入数据库或邮件日志。

生产环境建议配置 SMTP：

```bash
SMTP_HOST="smtp.qq.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="your@qq.com"
SMTP_FROM="ENXX <your@qq.com>"
EMAIL_FROM_NAME="ENXX"
EMAIL_FROM_ADDRESS=""
EMAIL_REPLY_TO="test@allapple.top"
EMAIL_SENDING_DOMAIN="enxx.allapple.top"
EMAIL_LOGO_URL="https://enxx.allapple.top/icon-192.png"
SMTP_TEST_TO="test@allapple.top"
```

敏感授权码只应写入服务器本地 `.env` 或后台 `SystemSetting` 加密项，不能写入 README、日志或代码仓库。

### 注册验证码、登录验证码和后台邮箱配置

- 用户注册必须先发送邮箱验证码；验证码 10 分钟有效，验证通过后才创建账号。
- 登录支持账号密码后邮箱验证码二次验证；验证通过后才写入登录 cookie。
- 管理员可在 `/admin/settings/email` 配置 SMTP，后台配置保存到 `SystemSetting` 并优先于 `.env`。
- `SMTP_PASS` 不会明文显示，也不会通过 API 返回前端；留空保存表示不修改旧授权码。
- `SMTP_USER` 是 SMTP 登录账号，`EMAIL_FROM_ADDRESS` 是邮件里显示的 From 地址，两者可以不同，但 SMTP 服务商可能要求 From 必须是已验证地址。
- `EMAIL_FROM_ADDRESS` 留空时，系统使用 `SMTP_FROM`；如果要临时测试 `enxx@enxx.allapple.top`，请先确认 SMTP provider 支持自定义发件域。
- 邮件发送统一走 `getMailConfig()`、`getMailFromConfig()` 和 `sendMail()`，注册验证码、登录验证码、忘记密码、欢迎邮件、系统通知和后台测试邮件共用同一配置。

### Cloudflare Email Routing 注意事项

- Cloudflare Email Routing 负责收信转发，不等于 SMTP 发信。
- 测试 `enxx@enxx.allapple.top` 发信时，不要修改 `allapple.top` 主域 MX。
- 推荐使用子域 `enxx.allapple.top` 配置独立发信认证。
- 测试收件邮箱默认 `test@allapple.top`。
- `lianxingtz@qq.com` 只作为 QQ SMTP 发件邮箱，不作为默认测试收件邮箱。
- 如果要正式使用 `enxx@enxx.allapple.top` 发信，需要配置 SPF、DKIM、DMARC，并使用支持自定义发件域的 SMTP 服务商。

### 测试邮件默认收件邮箱

默认测试收件邮箱：

```text
test@allapple.top
```

SMTP 测试命令：

```bash
npm run test:smtp
```

如果未指定 `--to`，系统按优先级解析测试邮箱，未配置时发送到 `test@allapple.top`。

临时指定其他测试邮箱或临时 From：

```bash
npm run test:smtp -- --to=custom@example.com
npm run test:smtp -- --from=enxx@enxx.allapple.top --to=test@allapple.top
```

后台也可以在 `/admin/settings/email` 配置自定义测试接收邮箱，或在测试发送时传入临时 From。

测试邮箱优先级：

```text
命令行/请求传入 > 后台配置 > .env SMTP_TEST_TO > test@allapple.top
```

注意：`lianxingtz@qq.com` 仅可作为 SMTP 发件邮箱示例或服务器发件配置，不作为默认测试收件邮箱。邮件主题不能嵌入图片图标；ENXX HTML 邮件正文顶部显示品牌 Logo。默认 Email Logo URL：`https://enxx.allapple.top/icon-192.png`，后台可在 `/admin/settings/email` 修改。收件箱列表 Logo 需要后续配置 BIMI。


## 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand
- localStorage fallback
- Next.js API Routes mock AI
- Prisma 6.19.3
- PostgreSQL 16（生产启用，公共学习页和 mock AI 仍保留无登录 fallback）
- JWT
- bcrypt
- Nodemailer
- SMTP
- PM2
- Caddy 反向代理

## 安装依赖

```bash
cd /www/wwwroot/enxx.allapple.top
npm install
```

## 开发启动

```bash
npm run dev
```

访问：`http://127.0.0.1:3000`


## 本地开发

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

## 生产部署

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run build
npm start
```

## PM2 启动

```bash
pm2 start npm --name enxx -- start
pm2 save
```

## 后续更新部署

```bash
git pull
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart enxx
```

## 构建检查

```bash
npm test
npm run lint
npm run typecheck
npm run build
```


## 数据库与认证

生产环境已启用 PostgreSQL：

```text
Host: 127.0.0.1:5432
Database: enxx_db
User: enxx_user
Env file: /www/wwwroot/enxx.allapple.top/.env (mode 600)
```

不要把 `.env` 或真实 `DATABASE_URL` / `JWT_SECRET` 提交到仓库或写进前端。首次部署/恢复数据库：

```bash
cd /www/wwwroot/enxx.allapple.top
npm run db:generate
npm run db:deploy
npm run db:seed

# 本次后台、账号资料、头像和邮件系统升级迁移名：
npx prisma migrate dev --name admin_account_mail_upgrade
```

seed 会创建默认管理员账号（用户名由 `ADMIN_USERNAME` 控制），首次登录必须修改默认密码。当前学习内容 seed 规模：304 个唯一单词、20 个句型、12 个场景、160 道练习题。

登录后以下数据按账号隔离保存到数据库：

- 单词学习/收藏/掌握状态：`UserWord`
- 造句记录：`UserSentence`
- 复习卡和复习提交：`ReviewItem` + `DailyStudyLog`
- 错题本：`Mistake`
- 学习笔记：`Note`

未登录或登录失效时，前端会明确提示并回退到浏览器本地记录，不再出现 500 静默失败。

## 生产启动

```bash
npm run build
npm start
```

## PM2 部署

```bash
cd /www/wwwroot/enxx.allapple.top
pm2 start ecosystem.config.js
pm2 save
```

常用命令：

```bash
pm2 status
pm2 logs enxx-english-self-learning
pm2 restart enxx-english-self-learning
```

## Caddy 配置

当前域名通过 `/etc/caddy/Caddyfile` 反向代理到：

```text
127.0.0.1:3000
```

项目内仍保留 Nginx 示例：

```text
/www/wwwroot/enxx.allapple.top/nginx.enxx.allapple.top.conf.example
```

## 统一配置

站点名称、版本、更新时间、开发者信息集中在：

```text
src/config/site.ts
```

修改品牌、版本或开发者信息时，应优先修改 `siteConfig`，不要在组件里重复硬编码。

## 版本规则

版本格式：

```text
主版本.次版本.修订版本-阶段
```

示例：

```text
0.0.1-beta
0.0.2-beta
0.1.0-beta
1.0.0
```

规则：

- 小功能修改：修订版本 +1，例如 `0.0.2-beta → 0.0.3-beta`
- 页面模块新增：次版本 +1，例如 `0.0.3-beta → 0.1.0-beta`
- 正式稳定版：`1.0.0`
- 每次明显改动后，需要同步更新 `siteConfig.version` 和 `siteConfig.updatedAt`
- 每次版本变更都需要更新 `CHANGELOG.md`

## AI 接口预留

当前是 mock AI，后续接真实 AI API 的位置：

- `src/app/api/ai/check-sentence/route.ts`
- `src/app/api/ai/translate/route.ts`
- `src/app/api/ai/analyze-sentence/route.ts`
- `src/app/api/ai/generate-practice/route.ts`
- `src/lib/sentence-analyzer.ts`

建议将 provider 封装到 `src/lib/ai-provider.ts`，读取 `.env.local`：

```bash
AI_PROVIDER=openai
AI_API_BASE_URL=https://api.openai.com/v1
AI_API_KEY=your_key
AI_MODEL=gpt-4o-mini
```

## 数据位置

- 单词：`src/data/words.ts`
- 首批句子：`src/data/sentences.ts`
- 句型：`src/data/patterns.ts`
- 场景：`src/data/scenes.ts`
- 练习题：`src/data/questions.ts`
- 每日计划：`src/data/daily-plan.ts`
- 语法路线：`src/data/grammar.ts`
- 学习徽章：`src/data/badges.ts`

## 状态管理

- Store：`src/store/learning-store.ts`
- localStorage key：`enxx-learning-progress-v1`
- 主题 key：`enxx-theme`


## 0.3.2-beta 后台、登录安全与邮件通道

后台功能：用户管理、登录记录、邮件中心、邮件通道、内容管理、学习数据、系统设置。后台路径包括 `/admin/settings/mail-providers` 邮件通道、`/admin/settings/email` 邮件基础设置、`/admin/email-logs` 邮件日志、`/admin/login-logs` 登录记录。侧边栏入口不能 404；未完成功能必须显示开发中、规划中或维护中状态。

登录安全：系统在登录成功后记录 LoginLog，包括登录 IP、地区、设备、浏览器、系统、来源和状态。管理员可在后台查看所有用户登录记录，后台用户详情显示最近 10 条登录历史；普通用户可在 `/account` 和 `/account/security` 查看自己的最近登录记录。

邮箱绑定：用户更换邮箱必须通过新邮箱验证码。验证码 10 分钟有效，60 秒内不能重复发送，`/account/profile` 不允许直接 PATCH 修改 email。

头像上传：支持 jpg、jpeg、png、webp，最大 2MB，保存到 `/uploads/avatars`，服务器转换为 256x256 webp。上传成功后 `/api/auth/me` 与顶部用户菜单同步头像和 displayName。

邮件通道架构：所有业务邮件统一走 `sendMail`。当前默认通道是 QQ SMTP；`custom_smtp` 是自建 SMTP 测试通道；`google_smtp` 是 Google/Gmail/Workspace 可配置通道；Resend、Brevo、Mailgun、Amazon SES、SendGrid、Postmark 为预留通道。只有已启用、测试健康且不是开发中/规划中/维护中的通道才允许设为默认；测试通道设为默认需要管理员显式确认。

默认测试收件邮箱：`test@allapple.top`。`lianxingtz@qq.com` 只作为 QQ SMTP 发件账号，不作为默认测试收件邮箱。`enxx@enxx.allapple.top` 需要通过 `custom_smtp` 或第三方自定义域 Provider 正式发信，不要在 QQ SMTP 下设为默认 From。

Cloudflare Email Routing 保护：Cloudflare Email Routing 负责 `allapple.top` 收信转发；不要修改 `allapple.top` 主域 MX。自建发信使用 `enxx.allapple.top` 子域，只配置 SPF、DKIM、DMARC、PTR 和 IP 信誉相关记录；Google SMTP、custom_smtp、第三方服务商都不能修改 Cloudflare Email Routing。自建 SMTP 测试失败不会影响当前 QQ SMTP fallback。

测试命令：

```bash
npm run test:mail -- --provider=qq_smtp
npm run test:mail -- --provider=custom_smtp
npm run test:mail -- --provider=google_smtp
npm run test:mail -- --provider=custom_smtp --from=enxx@enxx.allapple.top --to=test@allapple.top
npm run check:mail-dns -- --domain=enxx.allapple.top
```

通道状态说明：可用、未配置、测试失败、开发中、维护中、规划中。
