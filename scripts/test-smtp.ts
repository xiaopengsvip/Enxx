import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getTestEmailRecipient } from "../src/lib/mail-config";
import { sendTestEmail } from "../src/lib/mail";

function unquoteEnvValue(value: string): string {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function loadLocalEnv(): void {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const equalsIndex = line.indexOf("=");
    if (equalsIndex <= 0) {
      continue;
    }
    const key = line.slice(0, equalsIndex).trim();
    const value = unquoteEnvValue(line.slice(equalsIndex + 1));
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function getCliTo(): string | undefined {
  const args = process.argv.slice(2);
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg.startsWith("--to=")) {
      return arg.slice("--to=".length).trim();
    }
    if (arg === "--to") {
      return args[index + 1]?.trim();
    }
  }
  return undefined;
}

async function main(): Promise<void> {
  loadLocalEnv();

  const to = await getTestEmailRecipient(getCliTo());
  console.log(`Using test recipient: ${to}`);

  const result = await sendTestEmail(to);
  if (result.ok === true) {
    console.log("SMTP test email sent successfully.");
    if (result.messageId) {
      console.log(`messageId: ${result.messageId}`);
    }
    return;
  }

  console.error("SMTP test failed.");
  console.error(`error: ${result.error ?? result.reason}`);
  process.exitCode = 1;
}

void main().catch((error: unknown) => {
  console.error("SMTP test failed.");
  console.error(`error: ${error instanceof Error ? error.message : "unknown error"}`);
  process.exitCode = 1;
});
