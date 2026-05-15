export type ReleaseNote = {
  version: string;
  date: string;
  title: string;
  highlights: string[];
};

export const releaseNotes: ReleaseNote[] = [
  {
    version: "0.3.4-beta",
    date: "2026-05-15",
    title: "SaaS Admin Console 规范化精修",
    highlights: ["Sidebar 精修", "Sticky Topbar", "版本浮窗", "SaaS 后台规范化"],
  },
  {
    version: "0.3.3-beta",
    date: "2026-05-15",
    title: "后台系统化重设计",
    highlights: ["固定 Sidebar 与全局 Topbar", "后台通用组件抽象", "用户管理标准模板", "表格字段友好化"],
  },
  {
    version: "0.3.2-beta",
    date: "2026-05-15",
    title: "登录安全与邮件通道",
    highlights: ["LoginLog", "邮件多通道", "更换邮箱验证码", "Provider 状态管理"],
  },
  {
    version: "0.3.0-beta",
    date: "2026-05-15",
    title: "Admin Console 初版",
    highlights: ["Admin Console 初版", "头像上传", "我的账号升级", "后台用户管理"],
  },
];

export const latestRelease = releaseNotes[0];
