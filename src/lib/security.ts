export const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function sanitizeText(value: string, maxLength = 200): string {
  return value.replace(/[<>"'&]/g, "").trim().slice(0, maxLength);
}

export function getClientIp(request: Pick<Request, "headers">): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export function validateSameOrigin(request: Pick<Request, "headers">): boolean {
  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");

  const expectedHosts = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).hostname : undefined,
    process.env.VERCEL_URL ? new URL(`https://${process.env.VERCEL_URL}`).hostname : undefined,
  ].filter(Boolean) as string[];

  if (!originHeader && !refererHeader) {
    return false;
  }

  const checkedValue = originHeader ?? refererHeader ?? "";
  try {
    const url = new URL(checkedValue);
    return expectedHosts.includes(url.hostname) || url.hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterMs: Math.max(0, existing.resetAt - now),
    };
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);
  return { allowed: true };
}
