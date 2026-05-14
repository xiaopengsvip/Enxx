import { NextResponse } from "next/server";
import { analyzeSentence, checkSentenceQuality } from "@/lib/sentence-analyzer";
import type { AiCheckResponse } from "@/types/learning";

interface CheckRequest {
  sentence?: string;
  requiredWord?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as CheckRequest;
  const sentence = body.sentence ?? "";
  const quality = checkSentenceQuality(sentence, body.requiredWord);
  const analysis = analyzeSentence(sentence || quality.suggestion);
  const response: AiCheckResponse = {
    isCorrect: quality.isCorrect,
    suggestion: quality.suggestion,
    simpleReason: quality.reason,
    encouragement: quality.isCorrect ? "很好！这个句子已经能表达清楚意思。" : "没关系，我们先把句子主干搭起来。",
    examples: ["I control the light.", "The device is online.", "The system controls the room."],
    analysis,
  };
  return NextResponse.json(response);
}
