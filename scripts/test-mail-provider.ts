import { getMailProviderConfig, getProviderTestRecipient, resolveProviderFrom, sendViaProvider } from "../src/lib/mail-provider";
import { prisma } from "../src/lib/prisma";

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((item) => item.startsWith(prefix))?.slice(prefix.length);
}

async function main() {
  const providerKey = arg("provider");
  const provider = await getMailProviderConfig(providerKey);
  const to = await getProviderTestRecipient(arg("to"), provider.key);
  const fromInput = arg("from");
  const envelope = await resolveProviderFrom(provider, fromInput);
  const from = fromInput || envelope.from;
  const subject = arg("subject") || `🧪 ENXX 邮件通道测试 · ${provider.key}`;
  const result = await sendViaProvider(provider, { from, replyTo: envelope.replyTo, to, subject, text: `ENXX mail provider test: ${provider.key}`, html: `<p>ENXX mail provider test: <b>${provider.key}</b></p>` });
  await prisma.emailLog.create({ data: { providerKey: provider.key, from: String(from), to, subject, type: "provider_test_cli", status: result.ok ? "success" : "failed", messageId: result.ok ? result.messageId ?? null : null, error: result.ok ? null : result.error ?? result.reason } }).catch(() => undefined);
  console.log(JSON.stringify({ provider: provider.key, from, to, subject, status: result.ok ? "success" : "failed", messageId: result.ok ? result.messageId ?? null : null, error: result.ok ? null : result.error ?? result.reason }, null, 2));
  if (!result.ok) process.exitCode = 1;
}

main().finally(async () => prisma.$disconnect());
