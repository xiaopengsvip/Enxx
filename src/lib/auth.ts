import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import type { UserRole } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";

export { hashPassword, verifyPassword };

export const AUTH_COOKIE_NAME = "enxx_token";
const TOKEN_EXPIRES_IN = "7d";

type TokenPayload = {
  id: string;
  username: string;
  role: UserRole;
};

export type SafeUser = {
  id: string;
  username: string;
  email: string | null;
  role: UserRole;
  displayName: string | null;
  avatar: string | null;
  level: number;
  mustChangePassword: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
};

export class AuthError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 16) {
    return secret;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production");
  }
  return "development-only-enxx-jwt-secret-change-me";
}

export function signToken(user: { id: string; username: string; role: UserRole }): string {
  const payload: TokenPayload = { id: user.id, username: user.username, role: user.role };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: TOKEN_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded === "object" && decoded && "id" in decoded && "username" in decoded && "role" in decoded) {
      const role = decoded.role === "ADMIN" ? "ADMIN" : "USER";
      return { id: String(decoded.id), username: String(decoded.username), role };
    }
    return null;
  } catch {
    return null;
  }
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function publicUser(user: SafeUser) {
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
  };
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }
  return prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      displayName: true,
      avatar: true,
      level: true,
      mustChangePassword: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });
}

export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError(401, "请先登录");
  }
  return user;
}

export async function requireAdmin(): Promise<SafeUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new AuthError(403, "没有管理员权限");
  }
  return user;
}
