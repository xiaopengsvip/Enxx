import { NextResponse } from "next/server";
import { sentences } from "@/data/sentences";
import { words } from "@/data/words";
import type { AiPracticeResponse } from "@/types/learning";

interface PracticeRequest {
  input?: string;
  level?: "zero" | "basic";
}

export async function POST(request: Request) {
  const body = (await request.json()) as PracticeRequest;
  const keyword = body.input?.trim().toLowerCase() ?? "";
  const matchedWords = words.filter((word) => keyword && word.word.toLowerCase().includes(keyword)).slice(0, 3);
  const selectedSentences = sentences
    .filter((sentence) => !keyword || sentence.text.toLowerCase().includes(keyword) || sentence.meaning.includes(keyword))
    .slice(0, 4);
  const response: AiPracticeResponse = {
    title: "零基础简单句练习",
    sentences: selectedSentences.length ? selectedSentences.map((sentence) => sentence.text) : ["I control the light.", "The device is online.", "The room is comfortable.", "I want to learn English."],
    task: matchedWords.length ? `用 ${matchedWords.map((word) => word.word).join("、")} 各写一个简单句。` : "选择一个单词，写一个 Subject + Verb + Object 句子。",
    tip: "不要追求复杂。先保证主语、动作、对象清楚，再慢慢加细节。",
  };
  return NextResponse.json(response);
}
