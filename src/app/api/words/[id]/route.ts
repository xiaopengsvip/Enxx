import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { wordSchema } from "@/lib/validators";
import { wordsById } from "@/data/words";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const item = await prisma.word.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "未找到单词" }, { status: 404 });
    return NextResponse.json({ item });
  } catch {
    const item = wordsById.get(id);
    if (!item) return NextResponse.json({ error: "未找到单词" }, { status: 404 });
    return NextResponse.json({ item, source: "local-fallback" });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  await requireAdmin();
  const { id } = await context.params;
  const parsed = wordSchema.partial().safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "参数错误" }, { status: 400 });
  }
  const item = await prisma.word.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ item });
}

export async function DELETE(_request: Request, context: RouteContext) {
  await requireAdmin();
  const { id } = await context.params;
  await prisma.word.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
