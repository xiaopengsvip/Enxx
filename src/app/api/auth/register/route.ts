import { NextResponse } from "next/server";
import { authErrorPayload } from "@/lib/auth-response";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(authErrorPayload("注册必须先发送邮箱验证码，请使用 /api/auth/register/send-code 和 /api/auth/register/verify。"), { status: 400 });
}
