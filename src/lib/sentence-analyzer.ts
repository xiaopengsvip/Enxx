import { sentences } from "@/data/sentences";
import type { SentenceAnalysis, SentencePart } from "@/types/learning";

const VERBS = new Set([
  "am",
  "is",
  "are",
  "was",
  "were",
  "be",
  "use",
  "uses",
  "open",
  "opens",
  "close",
  "closes",
  "control",
  "controls",
  "make",
  "makes",
  "need",
  "needs",
  "want",
  "wants",
  "have",
  "has",
  "go",
  "goes",
  "do",
  "does",
  "give",
  "gives",
  "send",
  "sends",
  "call",
  "calls",
  "keep",
  "keeps",
  "turn",
  "turns",
  "set",
  "sets",
  "feel",
  "feels",
  "learn",
  "review",
  "listen",
  "speak",
]);

const LINKING_VERBS = new Set(["am", "is", "are", "was", "were", "be", "feel", "feels"]);
const MODALS = new Set(["can", "should", "must", "will", "may", "might"]);
const AUXILIARIES = new Set(["do", "does", "did"]);
const DITRANSITIVE_VERBS = new Set(["give", "gives", "send", "sends"]);
const OBJECT_COMPLEMENT_VERBS = new Set(["make", "makes", "keep", "keeps", "call", "calls"]);
const ADVERBS = new Set(["automatically", "quickly", "slowly", "online", "today", "now", "carefully"]);

function stripPunctuation(input: string): string {
  return input.trim().replace(/[!?。！？]+$/u, "").replace(/\.$/u, "");
}

function sentenceMeaning(input: string): string {
  const clean = stripPunctuation(input).toLowerCase();
  const found = sentences.find((item) => stripPunctuation(item.text).toLowerCase() === clean);
  if (found) return found.meaning;
  if (clean.includes("there is") && clean.includes("room")) return "房间里有一个东西。";
  if (clean.includes("ai system") && clean.includes("hotel room")) return "AI 系统自动控制酒店房间。";
  if (clean.includes("control") && clean.includes("light")) return "我控制灯光。";
  if (clean.includes("room") && clean.includes("comfortable")) return "房间很舒服。";
  return "这是一个用于练习的简单英文句子。";
}

function makePart(label: string, text: string, meaning: string): SentencePart {
  return { label, text: text || "—", meaning };
}

function detectSkeleton(verb: string, object: string, complement: string, adverb: string): string {
  const lowerVerb = verb.toLowerCase();
  if (LINKING_VERBS.has(lowerVerb)) return "Subject + Linking Verb + Complement";
  if (DITRANSITIVE_VERBS.has(lowerVerb) && object.split(" ").length >= 2) return "Subject + Verb + Indirect Object + Direct Object";
  if (OBJECT_COMPLEMENT_VERBS.has(lowerVerb) && complement) return "Subject + Verb + Object + Object Complement";
  if (object && adverb) return "Subject + Verb + Object + Adverb";
  if (object) return "Subject + Verb + Object";
  return "Subject + Verb";
}

function analysisResult(input: {
  original: string;
  subject: string;
  verb: string;
  object?: string;
  complement?: string;
  adverb?: string;
  skeleton: string;
  explanation: string;
  confidence: number;
}): SentenceAnalysis {
  const object = input.object || "—";
  const complement = input.complement || "—";
  const adverb = input.adverb || "—";
  const parts: SentencePart[] = [
    makePart("主语", input.subject || "—", "动作的发出者，表示谁或什么"),
    makePart("谓语", input.verb || "—", "动作或状态"),
  ];
  if (object !== "—") parts.push(makePart("宾语", object, "动作影响到的对象"));
  if (complement !== "—") parts.push(makePart("表语 / 补足语", complement, "说明主语或宾语的状态"));
  if (adverb !== "—") parts.push(makePart("状语", adverb, "说明动作发生的方式、时间或地点"));
  return {
    original: input.original,
    sentence: input.original,
    subject: input.subject || "—",
    verb: input.verb || "—",
    object,
    complement,
    adverb,
    adverbial: adverb,
    chineseMeaning: sentenceMeaning(input.original),
    translation: sentenceMeaning(input.original),
    skeleton: input.skeleton,
    pattern: input.skeleton,
    parts,
    tip: "先找动作，再看动作前面是谁，动作后面影响了什么。这样就能看到句子的骨架。",
    explanation: input.explanation,
    confidence: input.confidence,
  };
}

export function analyzeSentence(input: string): SentenceAnalysis {
  const original = input.trim() || "The AI system controls the hotel room automatically.";
  const clean = stripPunctuation(original).replace(/\s+/g, " ");
  const tokens = clean.split(" ").filter(Boolean);
  const lowerTokens = tokens.map((token) => token.toLowerCase());

  if (lowerTokens[0] === "there" && ["is", "are", "was", "were"].includes(lowerTokens[1] ?? "")) {
    const placeIndex = lowerTokens.findIndex((token) => token === "in" || token === "on" || token === "at");
    const object = tokens.slice(2, placeIndex > 2 ? placeIndex : undefined).join(" ");
    const adverb = placeIndex > 2 ? tokens.slice(placeIndex).join(" ") : "";
    return analysisResult({
      original,
      subject: "There",
      verb: tokens[1] ?? "is",
      object,
      adverb,
      skeleton: "There be + Subject + Place",
      explanation: "there be 用来表达某处有某物，后面的名词才是真正存在的对象。",
      confidence: 0.88,
    });
  }

  const modalIndex = lowerTokens.findIndex((token) => MODALS.has(token));
  if (modalIndex > 0 && tokens[modalIndex + 1]) {
    const rest = tokens.slice(modalIndex + 2);
    const possibleAdverb = rest[rest.length - 1] ?? "";
    const hasAdverb = ADVERBS.has(possibleAdverb.toLowerCase()) || possibleAdverb.toLowerCase().endsWith("ly");
    return analysisResult({
      original,
      subject: tokens.slice(0, modalIndex).join(" "),
      verb: `${tokens[modalIndex]} ${tokens[modalIndex + 1]}`,
      object: (hasAdverb ? rest.slice(0, -1) : rest).join(" "),
      adverb: hasAdverb ? possibleAdverb : "",
      skeleton: "Subject + Modal Verb + Verb + Object",
      explanation: "can / should / must / will 后面接动词原形，表达能力、建议、必须或将来。",
      confidence: 0.9,
    });
  }

  const notIndex = lowerTokens.findIndex((token) => token === "not" || token === "n't");
  if (notIndex > 1 && AUXILIARIES.has(lowerTokens[notIndex - 1] ?? "") && tokens[notIndex + 1]) {
    return analysisResult({
      original,
      subject: tokens.slice(0, notIndex - 1).join(" "),
      verb: `${tokens[notIndex - 1]} not ${tokens[notIndex + 1]}`,
      object: tokens.slice(notIndex + 2).join(" "),
      skeleton: "Subject + Auxiliary + Not + Verb + Object",
      explanation: "否定句用 do/does/did + not + 动词原形。",
      confidence: 0.9,
    });
  }

  const verbIndex = lowerTokens.findIndex((token) => VERBS.has(token));
  if (verbIndex < 0 && tokens.length > 8) {
    return analysisResult({
      original,
      subject: "—",
      verb: "—",
      skeleton: "Complex sentence",
      explanation: "这个句子有点复杂，建议使用 AI Tutor 深度分析。",
      confidence: 0.25,
    });
  }

  const safeVerbIndex = verbIndex >= 0 ? verbIndex : Math.min(1, tokens.length - 1);
  const verb = tokens[safeVerbIndex] ?? "does";
  const lowerVerb = verb.toLowerCase();
  const isImperative = safeVerbIndex === 0;
  const subject = isImperative ? "(you)" : tokens.slice(0, safeVerbIndex).join(" ");
  const restTokens = tokens.slice(safeVerbIndex + 1);
  const possibleAdverb = restTokens[restTokens.length - 1] ?? "";
  const hasAdverb = ADVERBS.has(possibleAdverb.toLowerCase()) || possibleAdverb.toLowerCase().endsWith("ly");
  const adverb = hasAdverb ? possibleAdverb : "";
  const coreRest = hasAdverb ? restTokens.slice(0, -1) : restTokens;

  let object = "";
  let complement = "";
  if (LINKING_VERBS.has(lowerVerb)) {
    complement = coreRest.join(" ");
  } else if (DITRANSITIVE_VERBS.has(lowerVerb) && coreRest.length >= 2) {
    object = coreRest.join(" ");
  } else if (OBJECT_COMPLEMENT_VERBS.has(lowerVerb) && coreRest.length >= 2) {
    const splitIndex = Math.max(1, coreRest.length - 1);
    object = coreRest.slice(0, splitIndex).join(" ");
    complement = coreRest.slice(splitIndex).join(" ");
  } else {
    object = coreRest.join(" ");
  }

  const skeleton = detectSkeleton(verb, object, complement, adverb);
  return analysisResult({
    original,
    subject: subject || "—",
    verb,
    object,
    complement,
    adverb,
    skeleton,
    explanation: "这是初学者常见的基础句型，可以先按主语、谓语、宾语顺序理解。",
    confidence: verbIndex >= 0 ? 0.82 : 0.55,
  });
}

export function checkSentenceQuality(sentence: string, requiredWord?: string): { isCorrect: boolean; reason: string; suggestion: string } {
  const clean = sentence.trim();
  if (!clean) {
    return { isCorrect: false, reason: "句子还没有填写。", suggestion: "先写一个很短的句子，例如：I control the light." };
  }
  const analysis = analyzeSentence(clean);
  const hasVerb = analysis.verb !== "—";
  const hasRequiredWord = requiredWord ? clean.toLowerCase().includes(requiredWord.toLowerCase()) : true;
  const startsWell = /^[A-Z(]/.test(clean);
  const enoughWords = clean.split(/\s+/).length >= 2;
  if (!hasVerb || !enoughWords) return { isCorrect: false, reason: "句子太短，缺少清楚的动作。", suggestion: "试试：I use the device. 或 The system controls the room." };
  if (!hasRequiredWord) return { isCorrect: false, reason: `这次练习最好用到 ${requiredWord}。`, suggestion: `可以写：I use ${requiredWord}. 如果它是名词，也可以写：The ${requiredWord} is smart.` };
  if (!startsWell) return { isCorrect: true, reason: "意思基本清楚。英文句子开头建议大写。", suggestion: clean.charAt(0).toUpperCase() + clean.slice(1) };
  return { isCorrect: true, reason: "句子有主干，也能看出动作或状态。", suggestion: clean.endsWith(".") || clean.endsWith("!") || clean.endsWith("?") ? clean : `${clean}.` };
}

export function translateChineseMock(input: string): { english: string; structure: string; note: string } {
  const clean = input.trim();
  if (clean.includes("控制") && clean.includes("灯")) return { english: "I control the light.", structure: "主语 + 谓语 + 宾语", note: "control 是动作，the light 是被控制的对象。" };
  if (clean.includes("打开") && clean.includes("窗帘")) return { english: "I open the curtain.", structure: "主语 + 谓语 + 宾语", note: "open 表示打开，curtain 表示窗帘。" };
  if (clean.includes("房间") && clean.includes("舒服")) return { english: "The room is comfortable.", structure: "主语 + 系动词 + 表语", note: "is 后面接 comfortable，说明房间怎么样。" };
  if (clean.includes("学习") && clean.includes("英语")) return { english: "I want to learn English.", structure: "主语 + 谓语 + 宾语", note: "want to do 表示想做某事。" };
  return { english: "I use simple English.", structure: "主语 + 谓语 + 宾语", note: "MVP 先给出简单模板，后续可接入真实 AI 做更准确翻译。" };
}
