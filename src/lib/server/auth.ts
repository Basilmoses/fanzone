import type { RequestEvent } from "@sveltejs/kit";
import { database } from "./db";

const SESSION_COOKIE = "fz_session";
const SESSION_SECONDS = 60 * 60 * 24 * 30;
const PASSWORD_ITERATIONS = 210_000;
const encoder = new TextEncoder();

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function digestHex(value: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const result = new Uint8Array(await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt.buffer as ArrayBuffer, iterations: PASSWORD_ITERATIONS },
    key,
    256
  ));
  return "pbkdf2-sha256$" + PASSWORD_ITERATIONS + "$" + base64Url(salt) + "$" + base64Url(result);
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, rawIterations, rawSalt, rawHash] = stored.split("$");
  const iterations = Number(rawIterations);
  if (algorithm !== "pbkdf2-sha256" || !rawSalt || !rawHash || !Number.isInteger(iterations) || iterations < 100_000 || iterations > 600_000) {
    return false;
  }
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const candidate = new Uint8Array(await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: fromBase64Url(rawSalt), iterations },
    key,
    256
  ));
  const expected = fromBase64Url(rawHash);
  if (candidate.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < candidate.length; index += 1) difference |= candidate[index] ^ expected[index];
  return difference === 0;
}

export function normaliseEmail(value: string): string {
  return value.trim().toLowerCase();
}

export async function allowAuthAttempt(event: RequestEvent, email: string): Promise<boolean> {
  const db = database(event.platform);
  const ip = event.request.headers.get("CF-Connecting-IP")
    ?? event.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
  const bucket = await digestHex(ip + "\u0000" + email);
  const now = Math.floor(Date.now() / 1000);
  const row = await db.prepare(
    "INSERT INTO auth_rate_limits (bucket, window_started_at, attempts) VALUES (?, ?, 1) " +
    "ON CONFLICT(bucket) DO UPDATE SET " +
    "attempts = CASE WHEN auth_rate_limits.window_started_at <= ? THEN 1 ELSE auth_rate_limits.attempts + 1 END, " +
    "window_started_at = CASE WHEN auth_rate_limits.window_started_at <= ? THEN ? ELSE auth_rate_limits.window_started_at END " +
    "RETURNING attempts"
  ).bind(bucket, now, now - 900, now - 900, now).first<{ attempts: number }>();
  return (row?.attempts ?? 1) <= 10;
}

export async function currentUser(event: RequestEvent): Promise<FanZoneUser | null> {
  const token = event.cookies.get(SESSION_COOKIE);
  if (!token) return null;
  const db = database(event.platform);
  const now = Math.floor(Date.now() / 1000);
  const user = await db.prepare(
    "SELECT users.id, users.display_name AS displayName, users.email " +
    "FROM sessions JOIN users ON users.id = sessions.user_id " +
    "WHERE sessions.token_hash = ? AND sessions.expires_at > ?"
  ).bind(await digestHex(token), now).first<FanZoneUser>();
  return user ?? null;
}

export async function createSession(event: RequestEvent, userId: string): Promise<void> {
  const token = base64Url(crypto.getRandomValues(new Uint8Array(32)));
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + SESSION_SECONDS;
  await database(event.platform).prepare(
    "INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)"
  ).bind(await digestHex(token), userId, expiresAt, now).run();
  event.cookies.set(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    secure: event.url.protocol === "https:",
    sameSite: "lax",
    maxAge: SESSION_SECONDS,
    expires: new Date(expiresAt * 1000)
  });
}

export async function destroySession(event: RequestEvent): Promise<void> {
  const token = event.cookies.get(SESSION_COOKIE);
  if (token) {
    await database(event.platform).prepare("DELETE FROM sessions WHERE token_hash = ?")
      .bind(await digestHex(token)).run();
  }
  event.cookies.delete(SESSION_COOKIE, { path: "/" });
}
