import { resolveMx, resolveTxt } from "node:dns/promises";

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((item) => item.startsWith(prefix))?.slice(prefix.length);
}

async function txt(name: string) {
  try {
    const records = await resolveTxt(name);
    return records.map((parts) => parts.join("")).join(" | ");
  } catch {
    return "未发现";
  }
}

async function mx(name: string) {
  try {
    const records = await resolveMx(name);
    return records.map((item) => `${item.exchange}(${item.priority})`).join(", ") || "未发现";
  } catch {
    return "未发现";
  }
}

async function main() {
  const domain = arg("domain") || "enxx.allapple.top";
  const rootDomain = "allapple.top";
  console.log(`ENXX mail DNS read-only check for ${domain}`);
  console.log("注意：只读检查，不修改 DNS。不要修改 allapple.top 主域 MX；Cloudflare Email Routing 负责收信转发，不等于 SMTP 发信。");
  for (const name of [domain, `_dmarc.${domain}`, `default._domainkey.${domain}`, `mail._domainkey.${domain}`, `resend._domainkey.${domain}`]) {
    console.log(`TXT ${name}: ${await txt(name)}`);
  }
  console.log(`MX ${rootDomain}: ${await mx(rootDomain)}`);
  console.log(`MX ${domain}: ${await mx(domain)}`);
  console.log("自建发信建议只在 enxx.allapple.top 子域配置 SPF/DKIM/DMARC/PTR/IP 信誉，不要影响 Cloudflare Email Routing。");
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exit(1); });
