import { NextResponse } from "next/server";
import { analyzeSentence } from "@/lib/sentence-analyzer";

interface AnalyzeRequest {
  sentence?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as AnalyzeRequest;
  return NextResponse.json(analyzeSentence(body.sentence ?? ""));
}
