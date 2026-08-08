const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

const hits = new Map<string, number[]>();

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfter: number };

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const recent = (hits.get(ip) ?? []).filter((t) => t > windowStart);

  if (recent.length >= MAX_REQUESTS) {
    const retryAfter = Math.max(1, Math.ceil((recent[0] + WINDOW_MS - now) / 1000));
    return { allowed: false, retryAfter };
  }

  recent.push(now);
  hits.set(ip, recent);
  return { allowed: true };
}

export function resetRateLimits() {
  hits.clear();
}