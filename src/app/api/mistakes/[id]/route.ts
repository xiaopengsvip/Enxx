import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { mapDbMistakeToClient } from "@/lib/learning-db";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const item = await prisma.mistake.update({ where: { id, userId: user.id }, data: { resolved: Boolean(body.resolved) } });
    return NextResponse.json({ item: mapDbMistakeToClient(item) });
  } catch (error) {
    return handleApiError(error);
  }
}
