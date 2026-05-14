import { NextResponse } from "next/server";
import { analyzeSentence, translateChineseMock } from "@/lib/sentence-analyzer";
import type { AiTranslateResponse } from "@/types/learning";

interface TranslateRequest {
  input?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as TranslateRequest;
  const input = body.input ?? "";
  const translated = translateChineseMock(input);
  const analysis = analyzeSentence(translated.english);
  const response: AiTranslateResponse = {
    input,
    english: translated.english,
    breakdown: analysis.parts,
    structure: translated.structure,
    note: translated.note,
  };
  return NextResponse.json(response);
}
