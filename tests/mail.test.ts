import { strict as assert } from "node:assert";
import { test } from "node:test";
import { buildMailConfig, decryptSettingValue, encryptSettingValue, getTestEmailRecipient } from "../src/lib/mail-config";
import { getSmtpConfig, isSmtpConfigured, sendMail } from "../src/lib/mail";

const SMTP_KEYS = ["SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "SMTP_USER", "SMTP_PASS", "SMTP_FROM", "SMTP_TEST_TO", "DATABASE_URL"] as const;

type SmtpEnv = Partial<Record<(typeof SMTP_KEYS)[number], string>>;

async function withSmtpEnv<T>(env: SmtpEnv, run: () => T | Promise<T>): Promise<T> {
  const previous = new Map<string, string | undefined>();
  for (const key of SMTP_KEYS) {
    previous.set(key, process.env[key]);
    delete process.env[key];
  }
  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) {
      process.env[key] = value;
    }
  }
  try {
    return await run();
  } finally {
    for (const key of SMTP_KEYS) {
      const value = previous.get(key);
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test("SMTP config requires host, port, user and pass, while FROM falls back to user", async () => {
  await withSmtpEnv(
    {
      SMTP_HOST: "smtp.qq.com",
      SMTP_PORT: "465",
      SMTP_SECURE: "false",
      SMTP_USER: "learner@qq.com",
      SMTP_PASS: "dummy-secret",
      SMTP_FROM: "",
    },
    async () => {
      const config = await getSmtpConfig();
      assert.ok(config);
      assert.equal(await isSmtpConfigured(), true);
      assert.equal(config.host, "smtp.qq.com");
      assert.equal(config.port, 465);
      assert.equal(config.secure, true);
      assert.equal(config.from, "learner@qq.com");
      assert.equal(config.source, "env");
    },
  );
});

test("SMTP port 587 forces secure=false", () => {
  const config = buildMailConfig(
    {
      SMTP_HOST: "smtp.qq.com",
      SMTP_PORT: "587",
      SMTP_SECURE: "true",
      SMTP_USER: "learner@qq.com",
      SMTP_PASS: "dummy-secret",
      SMTP_FROM: "ENXX <learner@qq.com>",
    },
    "database",
  );
  assert.ok(config);
  assert.equal(config.secure, false);
  assert.equal(config.source, "database");
});

test("SMTP database secret encryption roundtrips without storing the raw value", () => {
  const secret = "dummy-authorization-code";
  const encrypted = encryptSettingValue(secret);
  assert.notEqual(encrypted, secret);
  assert.match(encrypted, /^v1:/);
  assert.equal(decryptSettingValue(encrypted), secret);
});

test("sendMail returns SMTP_NOT_CONFIGURED when secret SMTP_PASS is missing", async () => {
  await withSmtpEnv(
    {
      SMTP_HOST: "smtp.qq.com",
      SMTP_PORT: "465",
      SMTP_USER: "learner@qq.com",
      SMTP_FROM: "ENXX <learner@qq.com>",
    },
    async () => {
      const result = await sendMail({
        to: "receiver@example.com",
        subject: "Test",
        text: "Hello",
      });
      assert.deepEqual(result, { ok: false, reason: "SMTP_NOT_CONFIGURED" });
    },
  );
});

test("test email recipient falls back to test@allapple.top when no valid input or env exists", async () => {
  await withSmtpEnv({ SMTP_TEST_TO: "not-an-email" }, async () => {
    assert.equal(await getTestEmailRecipient(""), "test@allapple.top");
    assert.equal(await getTestEmailRecipient("bad-value"), "test@allapple.top");
  });
});

test("test email recipient prefers explicit input then SMTP_TEST_TO env", async () => {
  await withSmtpEnv({ SMTP_TEST_TO: "env-test@allapple.top" }, async () => {
    assert.equal(await getTestEmailRecipient("custom@example.com"), "custom@example.com");
    assert.equal(await getTestEmailRecipient(), "env-test@allapple.top");
  });
});
