import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { wordSchema } from "@/lib/validators";

export const runtime = "nodejs";

const patchSchema = wordSchema.partial().extend({ id: z.string().min(1) });
const deleteSchema = z.object({ id: z.string().min(1) });

function completeness(word: { phonetic: string | null; definitionEn: string | null; example: string; phrases: Prisma.JsonValue; forms: Prisma.JsonValue }) {
  const checks = [Boolean(word.phonetic), Boolean(word.definitionEn), Boolean(word.example), Array.isArray(word.phrases) ? word.phrases.length > 0 : Boolean(word.phrases), word.forms && typeof word.forms === "object" ? Object.keys(word.forms as Record<string, unknown>).length > 0 : Boolean(word.forms)];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
    const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") ?? "30"), 1), 100);
    const keyword = searchParams.get("keyword")?.trim();
    const category = searchParams.get("category")?.trim();
    const scene = searchParams.get("scene")?.trim();
    const level = searchParams.get("level")?.trim();
    const where: Prisma.WordWhereInput = {
      ...(keyword ? { OR: [{ word: { contains: keyword, mode: "insensitive" } }, { meaning: { contains: keyword, mode: "insensitive" } }, { definitionEn: { contains: keyword, mode: "insensitive" } }] } : {}),
      ...(category ? { category } : {}),
      ...(scene ? { scene: { contains: scene, mode: "insensitive" } } : {}),
      ...(level ? { level: Number(level) } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.word.findMany({ where, orderBy: [{ level: "asc" }, { word: "asc" }], skip: (page - 1) * pageSize, take: pageSize }),
      prisma.word.count({ where }),
    ]);
    return NextResponse.json({ ok: true, items: items.map((item) => ({ ...item, completeness: completeness(item) })), total, page, pageSize });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = wordSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "参数错误" }, { status: 400 });
    const item = await prisma.word.create({ data: parsed.data });
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const parsed = patchSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "参数错误" }, { status: 400 });
    const { id, ...data } = parsed.data;
    const item = await prisma.word.update({ where: { id }, data });
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const parsed = deleteSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ ok: false, message: "缺少词条 ID" }, { status: 400 });
    await prisma.word.delete({ where: { id: parsed.data.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
