import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

const LOGIN_TICKET_TTL_MS = 10 * 60 * 1000;

export function generateLoginTicket(): string {
  return randomBytes(32).toString("base64url");
}

export function hashLoginTicket(ticket: string): string {
  return createHash("sha256").update(ticket).digest("hex");
}

function verifyTicketHash(ticket: string, hash: string): boolean {
  const actual = Buffer.from(hashLoginTicket(ticket), "hex");
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function createLoginTicket({ userId, ip, userAgent }: { userId: string; ip?: string | null; userAgent?: string | null }) {
  const ticket = generateLoginTicket();
  const expiresAt = new Date(Date.now() + LOGIN_TICKET_TTL_MS);
  await prisma.loginTicket.create({
    data: {
      userId,
      ticketHash: hashLoginTicket(ticket),
      expiresAt,
      ip: ip ?? null,
      userAgent: userAgent ?? null,
    },
  });
  return { ticket, expiresAt };
}

export async function getValidLoginTicket(ticket: string) {
  const ticketHash = hashLoginTicket(ticket);
  const record = await prisma.loginTicket.findFirst({
    where: { ticketHash, usedAt: null, expiresAt: { gt: new Date() } },
    include: {
      user: {
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
          passwordHash: true,
        },
      },
    },
  });
  if (!record || !verifyTicketHash(ticket, record.ticketHash)) return null;
  return record;
}

export async function consumeLoginTicket(id: string) {
  await prisma.loginTicket.update({ where: { id }, data: { usedAt: new Date() } });
}
