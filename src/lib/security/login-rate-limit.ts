type LoginAttempt = {
  failures: number;
  windowStartedAt: number;
  blockedUntil: number;
};

type RequestHeaders = Record<string, string | string[] | undefined>;

const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;
const ACCOUNT_FAILURE_LIMIT = 10;
const IP_FAILURE_LIMIT = 30;
const MAX_TRACKED_KEYS = 10_000;

const globalForLoginRateLimit = globalThis as typeof globalThis & {
  loginRateLimitStore?: Map<string, LoginAttempt>;
};

const attempts = globalForLoginRateLimit.loginRateLimitStore ?? new Map<string, LoginAttempt>();
globalForLoginRateLimit.loginRateLimitStore = attempts;

function getHeader(headers: RequestHeaders, name: string) {
  const value = headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function getClientIp(headers: RequestHeaders) {
  const forwardedFor = getHeader(headers, "x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || getHeader(headers, "x-real-ip")?.trim();
}

function getKeys(email: string, headers: RequestHeaders) {
  const keys = [`account:${email}`];
  const clientIp = getClientIp(headers);

  if (clientIp) keys.push(`ip:${clientIp}`);
  return keys;
}

function getFailureLimit(key: string) {
  return key.startsWith("account:") ? ACCOUNT_FAILURE_LIMIT : IP_FAILURE_LIMIT;
}

function removeExpiredAttempts(now: number) {
  if (attempts.size < MAX_TRACKED_KEYS) return;

  for (const [key, attempt] of attempts) {
    if (attempt.blockedUntil <= now && now - attempt.windowStartedAt >= WINDOW_MS) {
      attempts.delete(key);
    }
  }

  while (attempts.size >= MAX_TRACKED_KEYS) {
    const oldestKey = attempts.keys().next().value;
    if (!oldestKey) break;
    attempts.delete(oldestKey);
  }
}

export function isLoginBlocked(email: string, headers: RequestHeaders, now = Date.now()) {
  return getKeys(email, headers).some((key) => (attempts.get(key)?.blockedUntil ?? 0) > now);
}

export function recordFailedLogin(email: string, headers: RequestHeaders, now = Date.now()) {
  removeExpiredAttempts(now);

  for (const key of getKeys(email, headers)) {
    const previous = attempts.get(key);
    const attempt = !previous || now - previous.windowStartedAt >= WINDOW_MS
      ? { failures: 0, windowStartedAt: now, blockedUntil: 0 }
      : previous;

    attempt.failures += 1;
    if (attempt.failures >= getFailureLimit(key)) {
      attempt.blockedUntil = now + BLOCK_MS;
    }
    attempts.set(key, attempt);
  }
}

export function clearLoginFailures(email: string, headers: RequestHeaders) {
  for (const key of getKeys(email, headers)) attempts.delete(key);
}
