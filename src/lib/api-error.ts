import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { AuthError } from "@/lib/auth";

export function handleApiError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return NextResponse.json({ error: "记录不存在或无权访问" }, { status: 404 });
  }
  console.error(error);
  return NextResponse.json({ error: "服务器暂时不可用" }, { status: 500 });
}
