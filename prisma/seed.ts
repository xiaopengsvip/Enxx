import { PrismaClient, type Prisma } from "@prisma/client";
import { hashPassword } from "../src/lib/password";
import { seedWords } from "../src/data/seed/words";
import { seedPatterns } from "../src/data/seed/patterns";
import { seedScenes } from "../src/data/seed/scenes";
import { seedQuestions } from "../src/data/seed/questions";

const prisma = new PrismaClient();

const mailProviderSeeds = [
  { key: "qq_smtp", name: "QQ SMTP", type: "smtp", enabled: true, isDefault: true, capability: "production_ready", status: "healthy", host: "smtp.qq.com", port: 465, secure: true, fromName: "ENXX", fromAddress: "", replyTo: "test@allapple.top", testTo: "test@allapple.top", description: "当前生产可用邮件通道，使用 QQ SMTP 发信。" },
  { key: "custom_smtp", name: "自建 SMTP", type: "smtp", enabled: false, isDefault: false, capability: "test_only", status: "unconfigured", host: "", port: 587, secure: false, fromName: "ENXX", fromAddress: "enxx@enxx.allapple.top", replyTo: "test@allapple.top", testTo: "test@allapple.top", description: "自建 SMTP 测试通道。测试通过前不要设为默认。" },
  { key: "google_smtp", name: "Google SMTP", type: "smtp", enabled: false, isDefault: false, capability: "test_only", status: "unconfigured", host: "smtp.gmail.com", port: 587, secure: false, fromName: "ENXX", fromAddress: "", replyTo: "test@allapple.top", testTo: "test@allapple.top", description: "Google/Gmail/Workspace SMTP 通道。需要使用授权码或对应 SMTP 凭据，测试通过后才可启用。" },
  { key: "resend", name: "Resend", type: "resend", enabled: false, isDefault: false, capability: "coming_soon", status: "developing", domain: "enxx.allapple.top", fromName: "ENXX", fromAddress: "enxx@enxx.allapple.top", replyTo: "test@allapple.top", testTo: "test@allapple.top", description: "支持自定义发信域的开发者邮件服务商，后续接入。" },
  { key: "brevo", name: "Brevo", type: "brevo", enabled: false, isDefault: false, capability: "coming_soon", status: "developing", fromName: "ENXX", replyTo: "test@allapple.top", testTo: "test@allapple.top", description: "主流事务邮件/营销邮件服务商，后续接入。" },
  { key: "mailgun", name: "Mailgun", type: "mailgun", enabled: false, isDefault: false, capability: "coming_soon", status: "developing", domain: "enxx.allapple.top", fromName: "ENXX", fromAddress: "enxx@enxx.allapple.top", replyTo: "test@allapple.top", testTo: "test@allapple.top", description: "主流邮件 API 服务商，后续接入。" },
  { key: "amazon_ses", name: "Amazon SES", type: "amazon_ses", enabled: false, isDefault: false, capability: "coming_soon", status: "developing", domain: "enxx.allapple.top", fromName: "ENXX", fromAddress: "enxx@enxx.allapple.top", replyTo: "test@allapple.top", testTo: "test@allapple.top", description: "低成本正式发信通道，后续接入。" },
  { key: "sendgrid", name: "SendGrid", type: "sendgrid", enabled: false, isDefault: false, capability: "coming_soon", status: "planned", fromName: "ENXX", replyTo: "test@allapple.top", testTo: "test@allapple.top", description: "主流邮件 API 服务商，规划中。" },
  { key: "postmark", name: "Postmark", type: "postmark", enabled: false, isDefault: false, capability: "coming_soon", status: "planned", fromName: "ENXX", replyTo: "test@allapple.top", testTo: "test@allapple.top", description: "高送达事务邮件服务商，规划中。" },
  { key: "mock", name: "Mock Mail", type: "mock", enabled: process.env.NODE_ENV !== "production", isDefault: false, capability: "test_only", status: "healthy", fromName: "ENXX", fromAddress: "mock@enxx.local", replyTo: "test@allapple.top", testTo: "test@allapple.top", description: "开发环境模拟邮件通道。" },
] as const;

const commonDictionary: Record<string, Partial<Prisma.WordCreateInput>> = {
  i: { definitionEn: "the speaker or writer", synonyms: ["me"], antonyms: [], forms: { subject: "I", object: "me", possessive: "my" }, phrases: ["I am", "I can", "I want to"], usageNotes: "I 永远大写，用来表达自己。", difficulty: "easy", frequency: 10 },
  you: { definitionEn: "the person or people being spoken to", synonyms: [], antonyms: [], forms: { subject: "you", object: "you", possessive: "your" }, phrases: ["you are", "you can", "thank you"], usageNotes: "you 可以表示你，也可以表示你们。", difficulty: "easy", frequency: 10 },
  control: { definitionEn: "to make a machine, system, or situation work in the way you want", synonyms: ["manage", "operate"], antonyms: ["release"], forms: { base: "control", thirdPerson: "controls", past: "controlled", ing: "controlling" }, phrases: ["control the light", "remote control", "control system"], usageNotes: "control 后面常接被控制的对象。", difficulty: "medium", frequency: 8 },
  system: { definitionEn: "a group of connected parts that work together", synonyms: ["platform", "network"], antonyms: [], forms: { singular: "system", plural: "systems" }, phrases: ["AI system", "control system", "learning system"], usageNotes: "system 强调整体和规则。", difficulty: "medium", frequency: 8 },
  learn: { definitionEn: "to get knowledge or a skill", synonyms: ["study", "practice"], antonyms: ["forget"], forms: { base: "learn", thirdPerson: "learns", past: "learned", ing: "learning" }, phrases: ["learn English", "learn from mistakes", "keep learning"], usageNotes: "learn 强调学会，study 强调学习过程。", difficulty: "easy", frequency: 9 },
  review: { definitionEn: "to study something again", synonyms: ["revise", "practice"], antonyms: [], forms: { base: "review", thirdPerson: "reviews", past: "reviewed", ing: "reviewing" }, phrases: ["review words", "review plan", "daily review"], usageNotes: "review 用于复习和回顾。", difficulty: "easy", frequency: 7 },
  note: { definitionEn: "a short written record to help you remember something", synonyms: ["memo", "record"], antonyms: [], forms: { singular: "note", plural: "notes" }, phrases: ["take notes", "learning note", "note down"], usageNotes: "note 可作名词，也可作动词。", difficulty: "easy", frequency: 7 },
  dictionary: { definitionEn: "a tool or book that explains words", synonyms: ["wordbook", "lexicon"], antonyms: [], forms: { singular: "dictionary", plural: "dictionaries" }, phrases: ["online dictionary", "English dictionary"], usageNotes: "dictionary 是查词工具，本项目里查词后要进入学习闭环。", difficulty: "medium", frequency: 6 },
  listen: { definitionEn: "to pay attention to sound", synonyms: ["hear", "pay attention"], antonyms: ["ignore"], forms: { base: "listen", thirdPerson: "listens", past: "listened", ing: "listening" }, phrases: ["listen to English", "listen carefully"], usageNotes: "listen 后面接对象时常用 listen to。", difficulty: "easy", frequency: 8 },
  speak: { definitionEn: "to say words with your voice", synonyms: ["talk", "say"], antonyms: ["listen"], forms: { base: "speak", thirdPerson: "speaks", past: "spoke", pastParticiple: "spoken", ing: "speaking" }, phrases: ["speak English", "speak slowly"], usageNotes: "speak English 表示说英语。", difficulty: "easy", frequency: 8 },
};

function enrichWord(word: Prisma.WordCreateInput): Prisma.WordCreateInput {
  const key = String(word.word).toLowerCase();
  const common = commonDictionary[key] ?? {};
  const category = String(word.category ?? "basic");
  const basePhrases = Array.isArray(word.collocations) ? word.collocations : [`learn ${word.word}`, `use ${word.word}`];
  return {
    ...word,
    definitionEn: common.definitionEn ?? word.definitionEn ?? `a useful English word for ${category} learning`,
    phrases: common.phrases ?? word.phrases ?? basePhrases,
    forms: common.forms ?? word.forms ?? { base: String(word.word), plural: `${word.word}s` },
    synonyms: common.synonyms ?? word.synonyms ?? [],
    antonyms: common.antonyms ?? word.antonyms ?? [],
    usageNotes: common.usageNotes ?? word.usageNotes ?? `把 ${word.word} 放进短句里反复听、说、写。`,
    difficulty: common.difficulty ?? word.difficulty ?? (Number(word.level ?? 0) <= 1 ? "easy" : Number(word.level ?? 0) <= 3 ? "medium" : "hard"),
    frequency: common.frequency ?? word.frequency ?? Math.max(1, 10 - Number(word.level ?? 0)),
  };
}


async function main() {
  const adminUsername = process.env.ADMIN_USERNAME ?? "adminenxx";
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD ?? "please-change-admin-password";
  const adminEmail = process.env.ADMIN_EMAIL ?? "adminenxx@allapple.top";
  const existingAdmin = await prisma.user.findUnique({ where: { username: adminUsername } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        username: adminUsername,
        email: adminEmail,
        passwordHash: await hashPassword(adminPassword),
        role: "ADMIN",
        displayName: "ENXX Admin",
        mustChangePassword: true,
      },
    });
    console.log("Default admin account created.");
  } else {
    const updateData: Prisma.UserUpdateInput = {};
    if (existingAdmin.role !== "ADMIN") updateData.role = "ADMIN";
    if (!existingAdmin.email || existingAdmin.email === "admin@enxx.local") updateData.email = adminEmail;
    if (!existingAdmin.displayName) updateData.displayName = "ENXX Admin";
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({ where: { id: existingAdmin.id }, data: updateData });
    }
    console.log("Default admin account already exists.");
  }


  for (const provider of mailProviderSeeds) {
    await prisma.mailProviderConfig.upsert({
      where: { key: provider.key },
      update: {
        name: provider.name,
        type: provider.type,
        capability: provider.capability,
        description: provider.description,
        host: "host" in provider ? provider.host : undefined,
        port: "port" in provider ? provider.port : undefined,
        secure: "secure" in provider ? provider.secure : undefined,
        domain: "domain" in provider ? provider.domain : undefined,
        fromName: provider.fromName,
        fromAddress: "fromAddress" in provider ? provider.fromAddress : undefined,
        replyTo: provider.replyTo,
        testTo: provider.testTo,
      },
      create: provider,
    });
  }
  const defaultProviders = await prisma.mailProviderConfig.findMany({ where: { isDefault: true }, select: { key: true } });
  if (!defaultProviders.some((provider) => provider.key === "qq_smtp")) {
    await prisma.mailProviderConfig.updateMany({ data: { isDefault: false } });
    await prisma.mailProviderConfig.update({ where: { key: "qq_smtp" }, data: { isDefault: true, enabled: true, status: "healthy" } });
  }

  for (const word of seedWords) {
    const data = enrichWord(word as Prisma.WordCreateInput);
    const exists = await prisma.word.findFirst({ where: { word: word.word } });
    if (!exists) {
      await prisma.word.create({ data });
    } else {
      await prisma.word.update({ where: { id: exists.id }, data });
    }
  }
  for (const pattern of seedPatterns) {
    const exists = await prisma.sentencePattern.findFirst({ where: { name: pattern.name } });
    if (!exists) await prisma.sentencePattern.create({ data: pattern });
  }
  for (const scene of seedScenes) {
    const exists = await prisma.scene.findFirst({ where: { name: scene.name } });
    if (!exists) await prisma.scene.create({ data: scene });
  }
  for (const question of seedQuestions) {
    const exists = await prisma.practiceQuestion.findFirst({ where: { question: question.question } });
    if (!exists) await prisma.practiceQuestion.create({ data: question as Prisma.PracticeQuestionCreateInput });
  }

  console.log(`Seed complete: ${seedWords.length} words, ${seedPatterns.length} patterns, ${seedScenes.length} scenes, ${seedQuestions.length} questions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
