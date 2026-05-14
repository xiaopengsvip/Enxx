export type RenderedEmail = {
  html: string;
  text: string;
};

export type BaseEmailInput = {
  title: string;
  preheader: string;
  content: string;
  textContent?: string;
  actionLabel?: string;
  actionUrl?: string;
  footerNote?: string;
  logoUrl?: string;
};

const DEFAULT_EMAIL_LOGO_URL = "https://enxx.allapple.top/icon-192.png";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeHttpsLogoUrl(value?: string): string {
  if (!value) return DEFAULT_EMAIL_LOGO_URL;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") return DEFAULT_EMAIL_LOGO_URL;
    return parsed.toString();
  } catch {
    return DEFAULT_EMAIL_LOGO_URL;
  }
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;color:#334155;font-size:15px;line-height:1.8;">${escapeHtml(text)}</p>`;
}

export function codeBlock(code: string): string {
  return `<div style="margin:20px 0 22px;padding:20px 18px;border-radius:20px;background:linear-gradient(135deg,#e0f2fe 0%,#ede9fe 52%,#f5f3ff 100%);border:1px solid rgba(99,102,241,.18);box-shadow:inset 0 1px 0 rgba(255,255,255,.86);text-align:center;"><div style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:36px;line-height:1.1;font-weight:900;letter-spacing:8px;color:#1d4ed8;">${escapeHtml(code)}</div></div>`;
}

export function renderBaseEmail({ title, preheader, content, textContent, actionLabel, actionUrl, footerNote, logoUrl }: BaseEmailInput): RenderedEmail {
  const safeTitle = escapeHtml(title);
  const safePreheader = escapeHtml(preheader);
  const safeLogoUrl = escapeHtml(safeHttpsLogoUrl(logoUrl));
  const action = actionLabel && actionUrl
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 10px;"><tr><td style="border-radius:999px;background:linear-gradient(90deg,#38bdf8,#2563eb,#8b5cf6);box-shadow:0 16px 40px rgba(37,99,235,.28);"><a href="${escapeHtml(actionUrl)}" style="display:inline-block;padding:13px 24px;border-radius:999px;color:#ffffff;text-decoration:none;font-weight:900;font-size:15px;">${escapeHtml(actionLabel)}</a></td></tr></table>`
    : "";
  const footer = footerNote ? `<p style="margin:16px 0 0;color:#64748b;font-size:13px;line-height:1.7;">${escapeHtml(footerNote)}</p>` : "";
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:#eef5ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,'Microsoft YaHei',sans-serif;color:#0f172a;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${safePreheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:radial-gradient(circle at 15% 10%,rgba(56,189,248,.22),transparent 34%),radial-gradient(circle at 88% 8%,rgba(139,92,246,.24),transparent 34%),linear-gradient(180deg,#f8fbff 0%,#eef5ff 100%);padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;width:100%;">
          <tr>
            <td style="padding:0 8px 18px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="display:inline-table;padding:10px 14px;border-radius:18px;background:rgba(255,255,255,.68);border:1px solid rgba(255,255,255,.72);box-shadow:0 18px 50px rgba(15,23,42,.10);">
                <tr>
                  <td style="vertical-align:middle;padding-right:10px;"><img src="${safeLogoUrl}" width="42" height="42" alt="ENXX Logo" style="display:block;width:42px;height:42px;border-radius:14px;object-fit:cover;border:1px solid rgba(37,99,235,.14);"></td>
                  <td style="vertical-align:middle;">
                    <div style="font-size:18px;font-weight:900;letter-spacing:-.02em;color:#0f172a;">ENXX English Self-Learning</div>
                    <div style="margin-top:4px;font-size:12px;font-weight:800;color:#64748b;">英语自学网站 · AI English Learning OS · Liquid Glass</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="border-radius:32px;background:rgba(255,255,255,.86);border:1px solid rgba(255,255,255,.88);box-shadow:0 28px 90px rgba(30,64,175,.16);overflow:hidden;">
              <div style="height:6px;background:linear-gradient(90deg,#38bdf8,#2563eb,#8b5cf6);"></div>
              <div style="padding:30px 26px 28px;">
                <h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;font-weight:900;letter-spacing:-.04em;color:#0f172a;">${safeTitle}</h1>
                ${content}
                ${action}
                ${footer}
                <div style="margin-top:24px;padding:14px 16px;border-radius:20px;background:#f8fafc;border:1px solid #e2e8f0;color:#64748b;font-size:13px;line-height:1.7;">安全提醒：验证码、链接和初始密码仅用于本人操作，请勿转发或泄露给他人。</div>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px 12px 0;color:#64748b;font-size:12px;line-height:1.8;">
              <div style="font-weight:900;color:#334155;">© 2026 ENXX</div>
              <div>Everett · AI SYSTEMS · allapple.top</div>
              <div><a href="https://enxx.allapple.top/" style="color:#2563eb;text-decoration:none;font-weight:800;">https://enxx.allapple.top/</a></div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  const text = [
    "ENXX English Self-Learning｜英语自学网站 · AI English Learning OS",
    title,
    "",
    textContent ?? preheader,
    actionLabel && actionUrl ? `${actionLabel}: ${actionUrl}` : "",
    footerNote ?? "",
    "",
    "© 2026 ENXX · Everett · AI SYSTEMS · allapple.top",
    "https://enxx.allapple.top/",
  ].filter(Boolean).join("\n");
  return { html, text };
}
