type AuthSafeUser = {
  id: string;
  username: string;
  email: string | null;
  role: "ADMIN" | "USER";
  displayName: string | null;
  avatar: string | null;
  level: number;
  mustChangePassword: boolean;
  createdAt: Date | string;
  lastLoginAt: Date | string | null;
};

export function serializeAuthUser(user: AuthSafeUser) {
  return {
    ...user,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
    lastLoginAt: user.lastLoginAt instanceof Date ? user.lastLoginAt.toISOString() : user.lastLoginAt,
  };
}

export function authSuccessPayload(user: AuthSafeUser) {
  const safeUser = serializeAuthUser(user);
  return {
    ok: true,
    user: safeUser,
    mustChangePassword: safeUser.mustChangePassword,
  };
}

export function authErrorPayload(message: string) {
  return { ok: false, message };
}

export function normalizeAuthErrorMessage(message: string | undefined | null, fallback: string): string {
  return message?.trim() ? message : fallback;
}
