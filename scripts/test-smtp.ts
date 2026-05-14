import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getMailFromConfig, getTestEmailRecipient, isValidEmail, isValidMailbox } from "../src/lib/mail-config";
import { sendTestEmail } from "../src/lib/mail";

type CliArgs = {
  to?: string;
  from?: string;
  replyTo?: string;
  subject?: string;
};

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

function parseCliArgs(): CliArgs {
  const result: CliArgs = {};
  const args = process.argv.slice(2);
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const readValue = (name: string): string | undefined => {
      if (arg.startsWith(`--${name}=`)) return arg.slice(name.length + 3).trim();
      if (arg === `--${name}`) return args[index + 1]?.trim();
      return undefined;
    };

    const to = readValue("to");
    if (to !== undefined) result.to = to;
    const from = readValue("from");
    if (from !== undefined) result.from = from;
    const replyTo = readValue("reply-to");
    if (replyTo !== undefined) result.replyTo = replyTo;
    const subject = readValue("subject");
    if (subject !== undefined) result.subject = subject;
  }
  return result;
}

function maskEmailInText(value: string): string {
  return value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, (email) => {
    const [local, domain] = email.split("@");
    const safeLocal = local.length <= 2 ? `${local[0] ?? ""}***` : `${local.slice(0, 2)}***`;
    return `${safeLocal}@${domain}`;
  });
}

function redactSensitiveValues(value: string): string {
  const secret = process.env.SMTP_PASS?.trim();
  if (!secret) return value;
  return value.split(secret).join("[SMTP_PASS_REDACTED]");
}

function shouldPrintFromProviderHint(from?: string): boolean {
  return Boolean(from && from.includes("@enxx.allapple.top"));
}

async function main(): Promise<void> {
  loadLocalEnv();
  const args = parseCliArgs();

  if (args.to && !isValidEmail(args.to)) {
    throw new Error("Invalid --to email address");
  }
  if (args.from && !isValidMailbox(args.from)) {
    throw new Error("Invalid --from email address");
  }
  if (args.replyTo && !isValidEmail(args.replyTo)) {
    throw new Error("Invalid --reply-to email address");
  }

  const to = await getTestEmailRecipient(args.to);
  const fromConfig = await getMailFromConfig(args.from, args.replyTo);
  const displayFrom = args.from ? fromConfig.from : maskEmailInText(fromConfig.from);

  console.log(`Using test from: ${displayFrom}`);
  console.log(`Using test recipient: ${to}`);
  if (fromConfig.replyTo) console.log(`Using reply-to: ${args.replyTo ? fromConfig.replyTo : maskEmailInText(fromConfig.replyTo)}`);

  const result = await sendTestEmail(to, { from: args.from, replyTo: args.replyTo, subject: args.subject });
  if (result.ok === true) {
    console.log("SMTP test email sent successfully.");
    if (result.messageId) {
      console.log(`messageId: ${result.messageId}`);
    }
    return;
  }

  console.error("SMTP test failed.");
  console.error(`error: ${redactSensitiveValues(result.error ?? result.reason)}`);
  if (shouldPrintFromProviderHint(args.from)) {
    console.error("SMTP provider may not allow this From address. Please verify sending domain or use a provider that supports custom domains.");
  }
  process.exitCode = 1;
}

void main().catch((error: unknown) => {
  console.error("SMTP test failed.");
  const message = error instanceof Error ? error.message : "unknown error";
  console.error(`error: ${redactSensitiveValues(message)}`);
  process.exitCode = 1;
});
