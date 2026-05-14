"use client";

import { AuthInput } from "@/components/auth/auth-input";

export function EmailCodeInput({
  value,
  onChange,
  error,
  label = "邮箱验证码",
  placeholder = "请输入 6 位邮箱验证码",
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
}) {
  return (
    <AuthInput
      id="email-code"
      name="code"
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(nextValue) => onChange(nextValue.replace(/\D/g, "").slice(0, 6))}
      error={error}
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      className="text-center text-lg font-black tracking-[0.45em] placeholder:tracking-normal"
    />
  );
}
