/**
 * The session: a cookie holding who signed in and until when, signed with HMAC-SHA256 under the
 * worker's SESSION_SECRET, so it cannot be forged and the worker keeps no session table.
 */
export type Session = { readonly githubId: number; readonly login: string; readonly exp: number };

export const SESSION_COOKIE = "foundations_session";
export const SESSION_DAYS = 30;

const encoder = new TextEncoder();

const base64url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");

const fromBase64url = (text: string): Uint8Array =>
  Uint8Array.from(atob(text.replaceAll("-", "+").replaceAll("_", "/")), (c) => c.charCodeAt(0));

const key = (secret: string): Promise<CryptoKey> =>
  crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);

export async function sign(session: Session, secret: string): Promise<string> {
  const payload = base64url(encoder.encode(JSON.stringify(session)));
  const mac = await crypto.subtle.sign("HMAC", await key(secret), encoder.encode(payload));
  return `${payload}.${base64url(new Uint8Array(mac))}`;
}

/** The session a cookie value carries, or null when it is malformed, forged or expired. */
export async function verify(value: string, secret: string, now: number): Promise<Session | null> {
  const [payload, mac, ...rest] = value.split(".");
  if (payload === undefined || mac === undefined || rest.length > 0) return null;
  try {
    const ok = await crypto.subtle.verify(
      "HMAC",
      await key(secret),
      fromBase64url(mac),
      encoder.encode(payload),
    );
    if (!ok) return null;
    const session = JSON.parse(new TextDecoder().decode(fromBase64url(payload))) as Session;
    return typeof session.githubId === "number" &&
      typeof session.login === "string" &&
      session.exp > now
      ? session
      : null;
  } catch {
    return null;
  }
}

export function readCookie(request: Request, name: string): string | null {
  for (const part of (request.headers.get("Cookie") ?? "").split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

export function cookie(name: string, value: string, maxAge: number, secure: boolean): string {
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}
