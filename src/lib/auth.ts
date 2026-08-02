import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "admin_session";

/** The password itself is the HMAC key, so there's no separate secret to configure. */
function sign(message: string): string {
  return createHmac("sha256", requirePassword()).update(message).digest("hex");
}

function requirePassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not set");
  }
  return password;
}

export function checkPassword(candidate: string): boolean {
  const expected = Buffer.from(requirePassword());
  const actual = Buffer.from(candidate);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createSessionToken(): string {
  return sign("admin-session");
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = Buffer.from(createSessionToken());
  const actual = Buffer.from(token);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

const LOGIN_WINDOW_MS = 5 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;

// ponytail: per-instance in-memory map — resets on cold start and isn't
// shared across Vercel instances. Fine for a single-password admin login;
// swap for a durable store (Upstash/Redis) if this ever needs to withstand
// a real distributed brute force.
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function isLoginRateLimited(key: string): boolean {
  const entry = loginAttempts.get(key);
  return !!entry && entry.resetAt > Date.now() && entry.count >= MAX_LOGIN_ATTEMPTS;
}

export function recordFailedLogin(key: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
  } else {
    entry.count++;
  }
}

export function clearLoginAttempts(key: string): void {
  loginAttempts.delete(key);
}
