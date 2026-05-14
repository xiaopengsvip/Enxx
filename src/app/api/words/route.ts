import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { wordSchema } from "@/lib/validators";
import { words as localWords } from "@/data/words";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") ?? "24"), 1), 100);
  const keyword = searchParams.get("keyword")?.trim();
  const category = searchParams.get("category")?.trim();
  const level = searchParams.get("level");
  const where: Prisma.WordWhereInput = {
    ...(keyword ? { OR: [{ word: { contains: keyword, mode: "insensitive" } }, { meaning: { contains: keyword, mode: "insensitive" } }] } : {}),
    ...(category ? { category } : {}),
    ...(level ? { level: Number(level) } : {}),
  };
  try {
    const [items, total] = await Promise.all([
      prisma.word.findMany({ where, orderBy: [{ level: "asc" }, { word: "asc" }], skip: (page - 1) * pageSize, take: pageSize }),
      prisma.word.count({ where }),
    ]);
    return NextResponse.json({ items, total, page, pageSize });
  } catch {
    const filtered = localWords.filter((word) => {
      const matchesKeyword = keyword ? `${word.word} ${word.meaning}`.toLowerCase().includes(keyword.toLowerCase()) : true;
      return matchesKeyword;
    });
    return NextResponse.json({ items: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length, page, pageSize, source: "local-fallback" });
  }
}

export async function POST(request: Request) {
  await requireAdmin();
  const parsed = wordSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "参数错误" }, { status: 400 });
  }
  const item = await prisma.word.create({ data: parsed.data });
  return NextResponse.json({ item }, { status: 201 });
}
