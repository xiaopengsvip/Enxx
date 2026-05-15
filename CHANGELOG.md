# Changelog

## 0.3.3-beta - 2026-05-15

- 后台管理系统升级为专业 Admin Console 布局：固定左侧 Sidebar、全局 Admin Topbar、统一右侧内容容器。
- 新增后台通用组件：AdminSidebar、AdminTopbar、AdminContentContainer、AdminPageHeader、AdminStatsRow、AdminToolbar、AdminTableCard、AdminFilterBar、AdminEmptyState、AdminStatusBadge、AdminSectionCard。
- `/admin/users` 重构为标准后台内容页模板：唯一 PageHeader、统计卡、规整筛选栏、统一玻璃 TableCard、空状态和分页区域。
- 修复后台页面标题重复问题，Topbar 不再承担页面主标题职责。
- 用户表格字段改为更友好的展示命名：显示名称、首次改密、创建时间等。
- `/admin`、`/admin/login-logs`、`/admin/dictionary`、`/admin/email-logs`、`/admin/settings/mail-providers` 接入统一后台页面组件。

## 0.3.2-beta - 2026-05-15

- 规范化升级后台 Admin Console 页面结构
- 规范后台侧边栏导航与所有功能入口状态
- 新增用户登录记录 LoginLog
- 登录时记录 IP、IP 地区、设备、浏览器和系统信息
- 后台用户详情支持查看登录历史
- 我的账号页面显示最近登录 IP、地区和设备
- 新增更换绑定邮箱验证码流程
- 用户头像上传流程做通并同步顶部用户菜单
- 后台用户管理与账号中心资料联动
- 新增多邮件通道 Provider 管理架构
- 保持 QQ SMTP 为当前稳定默认邮件通道
- 新增自建 SMTP 测试通道 custom_smtp
- 新增 Google SMTP 测试通道 google_smtp
- 新增 Resend、Brevo、Mailgun、Amazon SES、SendGrid、Postmark 通道预留
- 后台新增邮件通道管理页面
- 支持按通道单独配置、测试、查看状态
- 已验证通道才允许设为默认
- 未验证或未接入通道显示开发中/维护中/规划中
- EmailLog 增加 providerKey、from、to 记录
- 新增 test:mail 邮件通道测试脚本
- 新增 check:mail-dns DNS 检查脚本
- 保持 test@allapple.top 为默认测试收件邮箱
- 明确 lianxingtz@qq.com 仅作为 QQ SMTP 发件账号
- 保持 Cloudflare Email Routing 不受影响

## 0.3.0-beta - 2026-05-15

- 全新升级后台控制台 UI
- 新增后台 Admin Layout
- 后台功能分组为概览、用户管理、内容管理、邮件中心、学习数据、系统设置
- 全新升级我的账号页面
- 我的账号页面支持角色权限区分
- 管理员账号提示与普通用户提示分离
- 默认管理员邮箱改为 adminenxx@allapple.top
- 新增用户头像上传能力
- 新增用户资料设置页面
- 新增账号安全中心
- 账号中心与后台用户管理联动
- 顶部用户菜单支持显示头像、显示名、角色
- 后台用户管理支持查看用户资料、重置密码、标记强制改密
- 后台邮件配置支持自定义测试接收邮箱
- 所有测试邮件默认接收邮箱统一为 test@allapple.top
- lianxingtz@qq.com 仅作为 SMTP 发件邮箱，不作为默认测试收件邮箱
- 新增 getTestEmailRecipient 统一测试收件邮箱解析逻辑
- 邮件模板顶部增加 ENXX 品牌图标
- 邮件主题统一 ENXX 品牌前缀
- 后台邮件配置支持 Email Logo URL
- 优化邮件模板预览
- 优化后台移动端适配
- 邮件配置扩展 `EMAIL_FROM_NAME`、`EMAIL_FROM_ADDRESS`、`EMAIL_REPLY_TO`、`EMAIL_SENDING_DOMAIN`，支持自定义显示 From 和 Reply-To。
- SMTP 测试脚本支持 `--from`、`--reply-to`、`--subject`；临时 From 不写入后台配置或 `.env`。
- 后台测试发信支持临时 From，并在 EmailLog 中记录安全的 from/to/subject/status/error/messageId。
- README 和 AGENTS 增加 Cloudflare Email Routing 保护说明：测试 `enxx@enxx.allapple.top` 发信时不修改 `allapple.top` 主域 MX。
- `EmailLog` 新增可选 `from` 字段，继续禁止记录 SMTP_PASS、验证码明文和 reset token 明文。

## 0.2.8-beta - 2026-05-14

- 修复注册页发送验证码后没有验证码输入框的问题
- 注册流程改为两步：发送邮箱验证码 → 输入验证码并完成注册
- 登录流程支持邮箱验证码二次验证
- 后台新增 SMTP 邮箱配置页面
- 邮件配置保存到 SystemSetting 数据库表
- 邮件发送工具统一读取后台 SMTP 配置
- SMTP_PASS 仅服务端可用，前端只显示已配置状态
- 忘记密码、注册验证码、登录验证码、欢迎邮件接入统一邮件配置
- 优化验证码输入框、倒计时、重发验证码和错误提示
- 后台邮件配置支持自定义测试接收邮箱
- 所有测试邮件默认接收邮箱统一为 test@allapple.top
- SMTP 测试脚本未指定收件人时默认发送到 test@allapple.top
- 后台测试发信未指定收件人时默认发送到 test@allapple.top
- 测试邮箱优先级调整为：请求传入 > 后台配置 > 环境变量 > 系统默认
- 新增 getTestEmailRecipient 统一测试收件邮箱解析逻辑

## 0.2.7-beta - 2026-05-14

- 新增高质量 HTML 邮件模板系统
- 新增注册邮箱验证码流程
- 新增登录邮箱验证码二次验证流程
- 新增后台创建用户账号能力
- 新增后台给用户发送通知邮件能力
- 新增后台群发邮件能力
- 新增邮件模板管理能力
- 新增邮件验证码数据模型
- 新增邮件通知发送日志
- 优化注册、登录、找回密码、系统通知邮件界面
- 增强账号安全与验证码校验机制

## 0.2.6-beta - 2026-05-14

- 接入 Nodemailer 邮件发送工具，支持 QQ 邮箱 SMTP 配置、测试邮件和找回密码邮件
- 新增 `npm run test:smtp` SMTP 发信测试脚本，测试输出不打印敏感授权码或完整环境变量
- 更新 `.env.example` SMTP 示例配置，服务器 `.env` 仅保存本地真实配置且不提交
- 忘记密码接口生成 token 后接入真实邮件发送，SMTP 未配置或发送失败时仍返回统一提示

## 0.2.5-beta - 2026-05-14

- 将登录、注册、忘记密码、重置密码页面迁移到独立 Auth Layout
- Auth 页面隐藏普通主导航、底部导航和全局 AI 悬浮按钮
- 优化登录 / 注册 / 忘记密码 / 重置密码之间的无感切换体验
- 增加 Auth 页面切换动画
- 统一账号页面输入框、密码框、按钮和错误提示样式
- 保持登录链路、注册链路、找回密码链路和重置密码链路可用
- 优化移动端账号页面体验
- 保留 PC 顶部「更多」菜单修复：避免 Liquid Glass overflow 裁切并保持 z-index、ARIA 和关闭交互

## 0.2.4-beta - 2026-05-14

- 修复登录点击无反应问题
- 修复登录 API 错误反馈
- 修复登录成功后 httpOnly cookie 写入和页面跳转
- 修复登录后导航状态刷新
- 完善默认管理员账号 seed 检查
- 优化登录表单 loading、success、error 状态
- 优化 PC 顶部登录 / 注册展示方式
- 登录 / 注册移动到右侧账号区域
- 注册按钮改为「免费注册」并强化显示
- 已登录后显示用户头像 / 用户名下拉菜单
- 管理员下拉菜单增加后台入口
- 从顶部导航移除 AI 菜单项
- 新增全局可拖拽 AI 悬浮按钮
- 新增 AI 快捷面板
- 支持 AI 悬浮按钮拖拽、边缘吸附和位置记忆
- 增加密码显示 / 隐藏眼睛按钮
- 完善登录、注册、修改密码、找回密码、重置密码输入框 placeholder
- 新增忘记密码 / 找回密码页面
- 新增重置密码页面
- 新增 PasswordResetToken 数据模型
- 新增 forgot-password 和 reset-password API
- 预留 SMTP 邮件配置
- 增加管理员重置用户密码能力预留
- 优化移动端账号入口体验

## 0.2.2-beta - 2026-05-14

- 新增英语字典 Dictionary 模块
- 新增每日学习计划 Daily Plan
- 新增听力播放器 Listen Player
- 新增语法路线 Grammar Path
- 新增句子拆解器 Sentence Analyzer
- 新增用户等级、打卡和徽章基础体系
- 字典支持查词、音标、发音、例句、短语、词形变化、同义词、反义词、学习笔记和加入复习
- 每日学习计划支持按步骤学习：听、学、练、查、复习
- 听力播放器支持字母、音标、单词、例句、场景句连续播放
- 语法路线支持从主谓宾到时态、疑问句、否定句、情态动词等基础语法
- 句子拆解器支持主语、谓语、宾语、表语、状语等基础拆解
- 增强学习进度和学习激励体验
- 启用生产 PostgreSQL：创建 `enxx_db` / `enxx_user`，写入安全 `.env`，执行 Prisma migration/deploy/seed
- 补齐数据库到前端闭环：单词学习、造句、复习卡、复习提交、错题、笔记、进度页都可按登录用户写入/读取数据库
- 修复 protected API 未登录时可能抛出 500 的问题，统一返回 JSON 401/403/404/500
- 修复静态单词 slug 与数据库 Word 主键不一致导致 `/api/study/word` 保存失败的问题
- 增加 `src/lib/learning-db.ts` 和 `npm test`，覆盖复习/错题数据映射、单词 slug 查找、复习类型枚举映射
- 更新 README / AGENTS 的数据库、认证、安全、测试和部署说明

## 0.2.1-beta - 2026-05-14

- 将 Prisma / @prisma/client 固定到 6.19.3，恢复传统 `@prisma/client` 生成方式，修复 Prisma 7 配置不兼容导致的 typecheck/build 失败
- 增加 `postinstall` 自动执行 `prisma generate`，降低重新安装依赖后 Prisma Client 缺失的风险
- 修复 seed 脚本类型错误和未使用变量，保证 `npm run typecheck` 通过
- 修复 Notes 页面 React Hooks lint 错误，保证 `npm run lint` 通过
- 新增 `/api/health` 健康检查接口，返回服务状态、版本、更新时间和数据库配置状态
- 未配置 DATABASE_URL 时，登录/注册接口返回明确 503 JSON 提示，避免生产 500；已有登录态也会被安全视为未登录
- 同步 README / AGENTS 版本说明到 `0.2.1-beta`

## 0.0.4-beta - 2026-05-14

- 调整底部 Footer 宽度，移除组件内额外 max-width 和二次横向 padding，让 Footer 与页面内容主轴对齐
- 将底部信息改为桌面三栏对齐：左侧品牌、中间版权/版本/开发者、右侧 allapple.top 链接
- 优化移动端 Footer 堆叠间距，保留紧凑信息层级并继续适配底部导航安全区

## 0.0.3-beta - 2026-05-14

- 优化底部 Footer 信息层级，移除冗长的双语说明展示
- 将底部信息压缩为版权、开发者、版本与 allapple.top 链接的单行结构
- 增强移动端底部安全区适配，避免与底部导航冲突

## 0.0.2-beta - 2026-05-14

- 统一网站名称为 ENXX English Self-Learning｜英语自学网站
- 移除「英语搭建器 / English Builder」旧命名
- 优化网站定位为英语自学网站
- 增加开发者 Footer
- 增加版本号和更新时间显示
- 增加统一 siteConfig 配置
- 优化顶部导航固定效果
- 优化移动端导航重复问题

## 0.0.1-beta - 2026-05-14

- 初始化 ENXX 英语自学网站 MVP
- 完成首页、单词、句型、场景、AI Tutor、复习、进度、错题页面
- 增加 Liquid Glass UI
- 增加 PWA 图标和基础 SEO
- 增加本地学习记录能力
- 增加 1-3-7-15 复习法基础逻辑
