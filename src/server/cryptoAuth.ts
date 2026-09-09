import crypto from 'crypto';

// Production Scrypt KDF Parameters (OWASP recommended)
const SCRYPT_OPTIONS: crypto.ScryptOptions = {
  N: 16384, // CPU/memory cost parameter (2^14)
  r: 8,     // Block size parameter
  p: 1,     // Parallelization parameter
  maxmem: 32 * 1024 * 1024 // 32MB max memory limit
};
const KEY_LENGTH_BYTES = 64; // 512 bits = 128 hex chars
const SCRYPT_PREFIX = '$scrypt$N=16384,r=8,p=1$';

export interface HashResult {
  hash: string;
  salt: string;
}

export interface VerifyResult {
  isValid: boolean;
  needsUpgrade: boolean;
}

/**
 * Derives a cryptographic scrypt hash for a password
 */
export function hashPassword(password: string, customSalt?: string): HashResult {
  const salt = customSalt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH_BYTES, SCRYPT_OPTIONS);
  const hash = `${SCRYPT_PREFIX}${derivedKey.toString('hex')}`;
  return { hash, salt };
}

/**
 * Verifies a candidate password against stored credentials.
 * Supports automatic migration from legacy hashes to scrypt.
 */
export function verifyPassword(
  candidatePassword: string,
  storedCredentials: { passwordHash?: string; salt?: string }
): VerifyResult {
  const { passwordHash, salt } = storedCredentials;

  if (!passwordHash || !salt) {
    // Seed/demo account fallback without password credentials
    return { isValid: true, needsUpgrade: false };
  }

  // 1. Check if stored hash is Scrypt (modern standard)
  if (passwordHash.startsWith(SCRYPT_PREFIX)) {
    const rawStoredHashHex = passwordHash.slice(SCRYPT_PREFIX.length);
    const candidateDerivedKey = crypto.scryptSync(candidatePassword, salt, KEY_LENGTH_BYTES, SCRYPT_OPTIONS);
    const candidateHex = candidateDerivedKey.toString('hex');

    try {
      const bufStored = Buffer.from(rawStoredHashHex, 'hex');
      const bufCandidate = Buffer.from(candidateHex, 'hex');
      if (bufStored.length !== bufCandidate.length) {
        return { isValid: false, needsUpgrade: false };
      }
      const isMatch = crypto.timingSafeEqual(bufStored, bufCandidate);
      return { isValid: isMatch, needsUpgrade: false };
    } catch {
      return { isValid: false, needsUpgrade: false };
    }
  }

  // 2. Fallback check for legacy raw 128-char scrypt hash without prefix
  if (passwordHash.length === 128) {
    try {
      const candidateDerivedKey = crypto.scryptSync(candidatePassword, salt, KEY_LENGTH_BYTES, SCRYPT_OPTIONS);
      const bufStored = Buffer.from(passwordHash, 'hex');
      const bufCandidate = candidateDerivedKey;
      if (bufStored.length === bufCandidate.length && crypto.timingSafeEqual(bufStored, bufCandidate)) {
        return { isValid: true, needsUpgrade: true }; // Upgrade to include prefix
      }
    } catch {
      // Continue to HMAC check
    }
  }

  // 3. Backward-compatibility migration check for legacy HMAC-SHA256 (64 hex chars)
  if (passwordHash.length === 64) {
    try {
      const computedHmac = crypto.createHmac('sha256', salt).update(candidatePassword).digest('hex');
      const bufStored = Buffer.from(passwordHash, 'hex');
      const bufCandidate = Buffer.from(computedHmac, 'hex');
      if (bufStored.length === bufCandidate.length && crypto.timingSafeEqual(bufStored, bufCandidate)) {
        // Matched legacy hash! Mark as valid and flag for immediate upgrade to scrypt
        return { isValid: true, needsUpgrade: true };
      }
    } catch {
      return { isValid: false, needsUpgrade: false };
    }
  }

  return { isValid: false, needsUpgrade: false };
}

/**
 * Generate cryptographically secure salt
 */
export function generateSalt(bytes = 16): string {
  return crypto.randomBytes(bytes).toString('hex');
}
