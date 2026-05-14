import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { searchLocalDictionary } from "@/lib/dictionary-fallback";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();
  const scene = searchParams.get("scene")?.trim();
  const level = searchParams.get("level")?.trim();
  const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") ?? "24"), 1), 80);
  const where: Prisma.WordWhereInput = {
    ...(q
      ? {
          OR: [
            { word: { contains: q, mode: "insensitive" } },
            { meaning: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
            { scene: { contains: q, mode: "insensitive" } },
            { definitionEn: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(category ? { category: { contains: category, mode: "insensitive" } } : {}),
    ...(scene ? { scene: { contains: scene, mode: "insensitive" } } : {}),
    ...(level ? { level: Number(level) } : {}),
  };
  try {
    const [items, total] = await Promise.all([
      prisma.word.findMany({ where, orderBy: [{ frequency: "desc" }, { level: "asc" }, { word: "asc" }], skip: (page - 1) * pageSize, take: pageSize }),
      prisma.word.count({ where }),
    ]);
    if (total > 0) {
      return NextResponse.json({ items, total, page, pageSize, source: "database" });
    }
    return NextResponse.json(searchLocalDictionary(q ?? "", pageSize, page));
  } catch {
    return NextResponse.json(searchLocalDictionary(q ?? "", pageSize, page));
  }
}
