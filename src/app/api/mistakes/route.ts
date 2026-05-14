import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { mapDbMistakeToClient } from "@/lib/learning-db";
import { mistakeSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireUser();
    const items = await prisma.mistake.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 });
    return NextResponse.json({ items: items.map(mapDbMistakeToClient) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = mistakeSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "参数错误" }, { status: 400 });
    }
    const item = await prisma.mistake.create({ data: { userId: user.id, ...parsed.data } });
    return NextResponse.json({ item: mapDbMistakeToClient(item) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
