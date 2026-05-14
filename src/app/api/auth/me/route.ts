import { NextResponse } from "next/server";
import { getCurrentUser, publicUser } from "@/lib/auth";
import { authErrorPayload } from "@/lib/auth-response";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(authErrorPayload("未登录"), { status: 401 });
    }
    return NextResponse.json({ ok: true, user: publicUser(user) });
  } catch {
    return NextResponse.json(authErrorPayload("未登录"), { status: 401 });
  }
}
