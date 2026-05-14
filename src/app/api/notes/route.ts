import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { noteSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword")?.trim();
    const relatedType = searchParams.get("relatedType")?.trim();
    const where: Prisma.NoteWhereInput = {
      userId: user.id,
      ...(keyword ? { OR: [{ title: { contains: keyword, mode: "insensitive" } }, { content: { contains: keyword, mode: "insensitive" } }] } : {}),
      ...(relatedType ? { relatedType: relatedType as Prisma.EnumRelatedTypeFilter<"Note"> } : {}),
    };
    const items = await prisma.note.findMany({ where, orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }], take: 100 });
    return NextResponse.json({ items });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = noteSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "参数错误" }, { status: 400 });
    }
    const item = await prisma.note.create({ data: { userId: user.id, ...parsed.data } });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
