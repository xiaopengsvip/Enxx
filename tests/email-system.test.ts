import { strict as assert } from "node:assert";
import { test } from "node:test";
import { generateEmailCode, hashEmailCode, verifyEmailCode } from "../src/lib/email/code";
import { renderEmailTemplate, emailTemplateCatalog } from "../src/lib/email/render-email";

test("email codes are six digit numbers and are stored only as hashes", () => {
  const code = generateEmailCode();
  assert.match(code, /^\d{6}$/);
  const hash = hashEmailCode(code);
  assert.notEqual(hash, code);
  assert.equal(verifyEmailCode(code, hash), true);
  assert.equal(verifyEmailCode("000000", hash), false);
});

test("all required ENXX email templates render html and text without scripts", () => {
  const keys = emailTemplateCatalog.map((template) => template.key).sort();
  assert.deepEqual(keys, [
    "admin_created_user",
    "change_email_verification",
    "login_verification",
    "notification",
    "password_reset",
    "register_verification",
    "welcome",
  ]);

  for (const key of keys) {
    const email = renderEmailTemplate(key, {});
    assert.ok(email.subject.includes("ENXX"), `${key} subject should include ENXX`);
    assert.ok(email.html.includes("ENXX English Self-Learning"), `${key} html should include brand`);
    assert.ok(email.html.includes("Liquid Glass"), `${key} html should mention visual system`);
    assert.equal(/<script/i.test(email.html), false, `${key} must not contain scripts`);
    assert.ok(email.text.includes("ENXX"), `${key} text should include ENXX`);
  }
});
