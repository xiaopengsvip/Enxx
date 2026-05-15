export type AdminNavStatus = "ready" | "beta" | "developing" | "planned" | "maintenance";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: string;
  status: AdminNavStatus;
  description: string;
};

export type AdminNavGroup = {
  title: string;
  items: AdminNavItem[];
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    title: "概览",
    items: [
      { href: "/admin", label: "后台首页", icon: "⌂", status: "ready", description: "后台总览页面，展示用户、内容、邮件、学习数据和系统状态。" },
      { href: "/admin/system", label: "系统状态", icon: "◇", status: "beta", description: "展示系统健康状态、数据库连接、版本、API 健康检查和邮件服务状态。" },
    ],
  },
  {
    title: "用户管理",
    items: [
      { href: "/admin/users", label: "用户列表", icon: "U", status: "ready", description: "查看用户资料、头像、邮箱、角色、等级、首次改密状态和最近登录信息。" },
      { href: "/admin/users/create", label: "新增用户", icon: "+", status: "beta", description: "管理员创建新用户，可设置初始密码、角色，并发送账号通知邮件。" },
      { href: "/admin/security", label: "账号安全", icon: "盾", status: "beta", description: "查看账号安全策略、强制改密、登录验证码、邮箱绑定和安全提醒。" },
      { href: "/admin/login-logs", label: "登录记录", icon: "IP", status: "ready", description: "查看用户登录 IP、地区、设备、浏览器、系统、来源和时间。" },
      { href: "/admin/admins", label: "管理员账号", icon: "♛", status: "planned", description: "集中查看管理员账号、权限、登录状态和安全状态。" },
      { href: "/admin/roles", label: "角色权限", icon: "钥", status: "planned", description: "后续用于管理 ADMIN / USER / EDITOR 等角色权限。" },
    ],
  },
  {
    title: "内容管理",
    items: [
      { href: "/admin/words", label: "单词词库", icon: "W", status: "beta", description: "管理单词学习内容；当前单词内容统一由字典词库管理。" },
      { href: "/admin/dictionary", label: "字典词库", icon: "D", status: "beta", description: "管理字典词条、音标、释义、例句、短语、难度和频率。" },
      { href: "/admin/letters", label: "字母管理", icon: "Aa", status: "developing", description: "管理 26 个英文字母大小写、发音、例词和练习内容。" },
      { href: "/admin/phonetics", label: "音标管理", icon: "音", status: "developing", description: "管理英语音标、发音示例、口型说明、音频和练习。" },
      { href: "/admin/patterns", label: "句型管理", icon: "P", status: "beta", description: "管理句型模板、例句、中文解释和练习题。" },
      { href: "/admin/grammar", label: "语法内容", icon: "G", status: "beta", description: "管理 0-15 Level 语法课程内容。" },
      { href: "/admin/scenes", label: "场景管理", icon: "S", status: "beta", description: "管理生活场景英语内容，例如酒店、机场、餐厅、购物、问路、电话等。" },
      { href: "/admin/questions", label: "题库管理", icon: "Q", status: "beta", description: "管理练习题、选择题、填空题、听力题和错题来源。" },
      { href: "/admin/listening", label: "听力内容", icon: "听", status: "planned", description: "后续管理听力材料、音频、听写和跟读内容。" },
      { href: "/admin/ai-tutor", label: "AI Tutor 内容", icon: "AI", status: "planned", description: "后续管理 AI Tutor 提示词、系统角色、训练内容、回答风格和教学策略。" },
    ],
  },
  {
    title: "邮件中心",
    items: [
      { href: "/admin/settings/mail-providers", label: "邮件通道", icon: "@", status: "beta", description: "管理 QQ SMTP、自建 SMTP、Google SMTP、Resend、Brevo、Mailgun、Amazon SES、SendGrid、Postmark 等邮件 Provider 通道。" },
      { href: "/admin/settings/email", label: "邮件配置", icon: "SMTP", status: "ready", description: "配置基础 SMTP、默认测试邮箱、邮件 Logo、发件名称等。" },
      { href: "/admin/emails/send", label: "发送邮件", icon: "✉", status: "beta", description: "给单个用户、多选用户、指定角色或全部用户发送系统通知邮件。" },
      { href: "/admin/emails/templates", label: "邮件模板", icon: "T", status: "beta", description: "预览注册验证码、登录验证码、重置密码、欢迎邮件、更换邮箱、系统通知等模板。" },
      { href: "/admin/email-logs", label: "邮件日志", icon: "L", status: "ready", description: "查看邮件发送记录、Provider、From、To、状态、messageId、错误和时间。" },
      { href: "/admin/email-codes", label: "验证码记录", icon: "验", status: "planned", description: "后续用于查看邮箱验证码发送状态，不显示验证码明文。" },
    ],
  },
  {
    title: "学习数据",
    items: [
      { href: "/admin/study-logs", label: "学习日志", icon: "↗", status: "beta", description: "查看用户学习记录、每日学习时长和学习行为。" },
      { href: "/admin/notes", label: "用户笔记", icon: "N", status: "beta", description: "查看用户学习笔记。" },
      { href: "/admin/mistakes", label: "错题数据", icon: "M", status: "beta", description: "查看用户错题、错误答案、正确答案和解释。" },
      { href: "/admin/reviews", label: "复习数据", icon: "R", status: "beta", description: "查看复习计划、复习完成情况和记忆曲线。" },
      { href: "/admin/analytics", label: "学习统计", icon: "图", status: "planned", description: "后续展示全站学习趋势、活跃用户、学习完成率和内容热度。" },
      { href: "/admin/badges", label: "徽章成就", icon: "章", status: "planned", description: "后续管理用户学习徽章、成就规则和奖励体系。" },
    ],
  },
  {
    title: "系统设置",
    items: [
      { href: "/admin/settings", label: "基础设置", icon: "⚙", status: "beta", description: "管理站点名称、品牌信息、Logo、版本、站点 URL 等基础配置。" },
      { href: "/admin/settings/security", label: "安全设置", icon: "锁", status: "planned", description: "后续管理登录策略、验证码策略、密码策略、IP 限制等。" },
      { href: "/admin/tools", label: "测试工具", icon: "✓", status: "developing", description: "后续提供 SMTP 测试、DNS 检查、Provider 测试、AI 接口测试等工具入口。" },
      { href: "/admin/releases", label: "版本更新", icon: "V", status: "beta", description: "展示当前版本、历史版本、更新记录、GitHub 链接和 CHANGELOG。" },
      { href: "/admin/system-logs", label: "系统日志", icon: "Log", status: "planned", description: "后续查看系统运行日志、错误日志和操作日志。" },
      { href: "/admin/backups", label: "数据备份", icon: "DB", status: "planned", description: "后续支持数据库备份、导出和恢复。" },
    ],
  },
];

export const adminNavItems = adminNavGroups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.title })));

export function getAdminNavStatusLabel(status: AdminNavStatus) {
  const labels: Record<AdminNavStatus, string> = {
    ready: "可用",
    beta: "Beta",
    developing: "开发中",
    planned: "规划中",
    maintenance: "维护中",
  };
  return labels[status];
}

export function getAdminNavItem(pathname: string) {
  return adminNavItems.find((item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`)));
}

export function getAdminBreadcrumb(pathname: string): string {
  return getAdminNavItem(pathname)?.label ?? "后台模块";
}

export function getAdminSection(pathname: string): string {
  return getAdminNavItem(pathname)?.group ?? "Admin";
}

export function getAdminNavSummary() {
  return { groupCount: adminNavGroups.length, itemCount: adminNavItems.length };
}
