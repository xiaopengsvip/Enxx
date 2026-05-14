import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(1, "请输入用户名")
  .min(3, "用户名至少 3 位")
  .max(24, "用户名最多 24 位")
  .regex(/^[A-Za-z0-9_]+$/, "用户名仅支持字母、数字和下划线");

export const registerSchema = z
  .object({
    username: usernameSchema,
    email: z.string().min(1, "请输入邮箱").email("请输入正确的邮箱地址"),
    password: z.string().min(1, "请输入密码").min(8, "密码至少需要 8 位"),
    confirmPassword: z.string().min(1, "请再次输入密码").min(8, "密码至少需要 8 位"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "两次输入的密码不一致",
  });

export const loginSchema = z.object({
  username: z.string().min(1, "请输入账号"),
  password: z.string().min(1, "请输入密码"),
});

export const emailCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "请输入 6 位邮箱验证码"),
});

export const registerVerifySchema = registerSchema.extend({
  code: z.string().regex(/^\d{6}$/, "请输入 6 位邮箱验证码"),
});

export const loginVerifyCodeSchema = z.object({
  loginTicket: z.string().min(1, "登录票据无效或已过期"),
  code: z.string().regex(/^\d{6}$/, "请输入 6 位登录验证码"),
});

export const loginResendCodeSchema = z.object({
  loginTicket: z.string().min(1, "登录票据无效或已过期"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "请输入当前密码"),
    newPassword: z.string().min(1, "请输入新密码").min(8, "密码至少需要 8 位"),
    confirmPassword: z.string().min(1, "请再次输入密码").min(8, "密码至少需要 8 位"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "两次输入的密码不一致",
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "请输入邮箱").email("请输入正确的邮箱地址"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "链接无效或已过期，请重新申请找回密码"),
    password: z.string().min(1, "请输入新密码").min(8, "密码至少需要 8 位"),
    confirmPassword: z.string().min(1, "请再次输入密码").min(8, "密码至少需要 8 位"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "两次输入的密码不一致",
  });

export const adminResetPasswordSchema = z.object({
  newPassword: z.string().min(1, "请输入新密码").min(8, "密码至少需要 8 位"),
});

export const noteSchema = z.object({
  title: z.string().min(1, "请输入标题").max(120, "标题太长"),
  content: z.string().min(1, "请输入正文"),
  tags: z.array(z.string()).optional().default([]),
  relatedType: z.enum(["WORD", "SENTENCE", "PATTERN", "SCENE", "QUESTION", "GENERAL"]).optional().default("GENERAL"),
  relatedId: z.string().optional().nullable(),
  pinned: z.boolean().optional().default(false),
});

export const wordSchema = z.object({
  word: z.string().min(1, "请输入单词"),
  meaning: z.string().min(1, "请输入中文意思"),
  phonetic: z.string().optional().nullable(),
  partOfSpeech: z.string().min(1, "请输入词性"),
  level: z.coerce.number().int().min(0).optional().default(0),
  category: z.string().min(1, "请输入分类").optional().default("basic"),
  example: z.string().min(1, "请输入例句"),
  exampleMeaning: z.string().min(1, "请输入例句中文"),
  scene: z.string().optional().nullable(),
  definitionEn: z.string().optional().nullable(),
  collocations: z.array(z.string()).optional().default([]),
  phrases: z.array(z.string()).optional().default([]),
  forms: z.record(z.string(), z.string()).optional().default({}),
  synonyms: z.array(z.string()).optional().default([]),
  antonyms: z.array(z.string()).optional().default([]),
  usageNotes: z.string().optional().nullable(),
  commonMistake: z.string().optional().nullable(),
  difficulty: z.string().optional().nullable(),
  frequency: z.coerce.number().int().min(1).max(10).optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
});

export const mistakeSchema = z.object({
  questionId: z.string().optional().nullable(),
  question: z.string().min(1, "请输入题目"),
  userAnswer: z.string().optional().nullable(),
  correctAnswer: z.string().min(1, "请输入正确答案"),
  explanation: z.string().optional().nullable(),
  sourceType: z.string().optional().nullable(),
  sourceId: z.string().optional().nullable(),
});
