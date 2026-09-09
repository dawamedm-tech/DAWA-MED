export interface RateLimitStatus {
  isLocked: boolean;
  remainingSec: number;
  currentAttempts: number;
}

interface AttemptEntry {
  count: number;
  firstAttempt: number;
  lockedUntil: number;
}

/**
 * Production In-Memory / Contextual Rate Limiter
 * Provides granular brute-force defense per IP + identifier tuple.
 * Prevents global lockouts while strictly throttling brute force attacks.
 */
export class RateLimiter {
  private attempts = new Map<string, AttemptEntry>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly lockoutMs: number;

  constructor(options?: { maxAttempts?: number; windowMs?: number; lockoutMs?: number }) {
    this.maxAttempts = options?.maxAttempts || 5;
    this.windowMs = options?.windowMs || 15 * 60 * 1000; // 15 minutes window
    this.lockoutMs = options?.lockoutMs || 15 * 60 * 1000; // 15 minutes lockout
  }

  check(key: string): RateLimitStatus {
    const entry = this.attempts.get(key);
    if (!entry) {
      return { isLocked: false, remainingSec: 0, currentAttempts: 0 };
    }

    const now = Date.now();

    // If currently locked out
    if (entry.lockedUntil > now) {
      const remainingSec = Math.ceil((entry.lockedUntil - now) / 1000);
      return { isLocked: true, remainingSec, currentAttempts: entry.count };
    }

    // If window expired, reset
    if (now - entry.firstAttempt > this.windowMs) {
      this.attempts.delete(key);
      return { isLocked: false, remainingSec: 0, currentAttempts: 0 };
    }

    return { isLocked: false, remainingSec: 0, currentAttempts: entry.count };
  }

  recordFailure(key: string): RateLimitStatus {
    const now = Date.now();
    let entry = this.attempts.get(key);

    if (!entry || (now - entry.firstAttempt > this.windowMs && entry.lockedUntil <= now)) {
      entry = { count: 1, firstAttempt: now, lockedUntil: 0 };
    } else {
      entry.count += 1;
    }

    if (entry.count >= this.maxAttempts) {
      entry.lockedUntil = now + this.lockoutMs;
    }

    this.attempts.set(key, entry);

    const isLocked = entry.lockedUntil > now;
    const remainingSec = isLocked ? Math.ceil((entry.lockedUntil - now) / 1000) : 0;
    return { isLocked, remainingSec, currentAttempts: entry.count };
  }

  clear(key: string): void {
    this.attempts.delete(key);
  }
}

// Pre-configured rate limiters for distinct security boundaries
export const loginRateLimiter = new RateLimiter({ maxAttempts: 5, lockoutMs: 15 * 60 * 1000 });
export const adminLoginRateLimiter = new RateLimiter({ maxAttempts: 5, lockoutMs: 15 * 60 * 1000 });
export const googleAuthRateLimiter = new RateLimiter({ maxAttempts: 10, lockoutMs: 5 * 60 * 1000 });
export const passwordResetRateLimiter = new RateLimiter({ maxAttempts: 5, lockoutMs: 15 * 60 * 1000 });
export const twoFactorRateLimiter = new RateLimiter({ maxAttempts: 3, lockoutMs: 10 * 60 * 1000 });
