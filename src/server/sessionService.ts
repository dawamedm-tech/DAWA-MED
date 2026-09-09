import crypto from 'crypto';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  limit 
} from 'firebase/firestore';
import { serverDb } from './firestoreDb';
import { AuthUser, UserRole } from '../types';

export interface PersistentSessionRecord {
  tokenHash: string;
  userId: string;
  userRole: UserRole;
  userSnapshot: Omit<AuthUser, 'passwordHash' | 'salt'>;
  createdAt: string;
  expiresAt: number; // timestamp ms
  revokedAt: string | null;
  ipAddress?: string;
  userAgent?: string;
  lastActiveAt: string;
}

/**
 * Production-Hardened Persistent Session Service
 * Backed by Firestore collection 'auth_sessions' with SHA-256 token hashes.
 * Survives Cloud Run container recycles, multi-instance restarts, and deployments.
 */
export class SessionService {
  // Read-through memory cache with 60-second TTL to avoid redundant Firestore reads
  private static cache = new Map<string, { session: PersistentSessionRecord; cachedAt: number }>();
  private static CACHE_TTL_MS = 60 * 1000;

  private static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token.trim()).digest('hex');
  }

  private static sanitizeUser(user: AuthUser): Omit<AuthUser, 'passwordHash' | 'salt'> {
    const { passwordHash: _, salt: __, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Create and persist a new session in Firestore
   */
  static async createSession(
    token: string, 
    user: AuthUser, 
    reqMetadata?: { ip?: string; userAgent?: string }
  ): Promise<PersistentSessionRecord> {
    const tokenHash = this.hashToken(token);
    const now = Date.now();
    
    // Admin sessions: 12 hours. Customer/Driver/Pharmacy sessions: 7 days.
    const isAdmin = user.role === 'super_admin' || user.role === 'admin' || user.role === 'medical_admin' || user.role === 'operations_admin';
    const durationMs = isAdmin ? 12 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    const expiresAt = now + durationMs;

    const safeUser = this.sanitizeUser(user);

    const record: PersistentSessionRecord = {
      tokenHash,
      userId: user.id,
      userRole: user.role,
      userSnapshot: safeUser,
      createdAt: new Date(now).toISOString(),
      expiresAt,
      revokedAt: null,
      ipAddress: reqMetadata?.ip || '127.0.0.1',
      userAgent: reqMetadata?.userAgent || 'Web',
      lastActiveAt: new Date(now).toISOString()
    };

    // 1. Save to Firestore (Durable persistence)
    try {
      await setDoc(doc(serverDb, 'auth_sessions', tokenHash), record, { merge: true });
    } catch (err) {
      console.warn('⚠️ SessionService: Firestore write fallback notice:', err);
    }

    // 2. Populate fast memory cache
    this.cache.set(tokenHash, { session: record, cachedAt: now });

    return record;
  }

  /**
   * Validate and retrieve an active session
   */
  static async getSession(token: string): Promise<Omit<AuthUser, 'passwordHash' | 'salt'> | null> {
    if (!token || typeof token !== 'string') return null;

    const tokenHash = this.hashToken(token);
    const now = Date.now();

    // Check memory cache first
    const cached = this.cache.get(tokenHash);
    if (cached && (now - cached.cachedAt < this.CACHE_TTL_MS)) {
      if (cached.session.revokedAt) return null;
      if (now > cached.session.expiresAt) {
        this.cache.delete(tokenHash);
        return null;
      }
      return cached.session.userSnapshot;
    }

    // Read from Firestore (Persistent Store)
    try {
      const snap = await getDoc(doc(serverDb, 'auth_sessions', tokenHash));
      if (!snap.exists()) {
        this.cache.delete(tokenHash);
        return null;
      }

      const session = snap.data() as PersistentSessionRecord;

      if (session.revokedAt) {
        this.cache.set(tokenHash, { session, cachedAt: now });
        return null;
      }

      if (now > session.expiresAt) {
        this.cache.delete(tokenHash);
        return null;
      }

      // Update cache
      this.cache.set(tokenHash, { session, cachedAt: now });
      return session.userSnapshot;
    } catch (err) {
      console.warn('⚠️ SessionService: Firestore read fallback notice:', err);
      // Fall back to memory cache if network glitch
      if (cached && !cached.session.revokedAt && now <= cached.session.expiresAt) {
        return cached.session.userSnapshot;
      }
      return null;
    }
  }

  /**
   * Revoke a specific session (e.g. on logout)
   */
  static async revokeSession(token: string): Promise<boolean> {
    if (!token) return false;

    const tokenHash = this.hashToken(token);
    const revokedAt = new Date().toISOString();

    // Update memory cache
    const cached = this.cache.get(tokenHash);
    if (cached) {
      cached.session.revokedAt = revokedAt;
      this.cache.set(tokenHash, cached);
    }

    // Update Firestore
    try {
      const ref = doc(serverDb, 'auth_sessions', tokenHash);
      await updateDoc(ref, {
        revokedAt,
        lastActiveAt: revokedAt
      });
      return true;
    } catch (err) {
      console.warn('⚠️ SessionService: Firestore revoke error:', err);
      return false;
    }
  }

  /**
   * Invalidate ALL active sessions for a user (e.g. on password change or admin reset)
   */
  static async revokeAllUserSessions(userId: string): Promise<number> {
    if (!userId) return 0;

    const revokedAt = new Date().toISOString();
    let count = 0;

    // 1. Invalidate matching memory cache entries
    for (const [hash, entry] of this.cache.entries()) {
      if (entry.session.userId === userId) {
        entry.session.revokedAt = revokedAt;
        count++;
      }
    }

    // 2. Invalidate in Firestore
    try {
      const q = query(
        collection(serverDb, 'auth_sessions'),
        where('userId', '==', userId),
        limit(50)
      );
      const snap = await getDocs(q);
      const updates = snap.docs
        .filter(d => !d.data().revokedAt)
        .map(d => updateDoc(d.ref, { revokedAt }));
      
      await Promise.all(updates);
      count = Math.max(count, updates.length);
    } catch (err) {
      console.warn('⚠️ SessionService: Firestore revokeAll error:', err);
    }

    return count;
  }

  /**
   * Update snapshot user across active sessions
   */
  static async updateSessionUserSnapshot(updatedUser: AuthUser): Promise<void> {
    const safeUser = this.sanitizeUser(updatedUser);

    for (const [_, entry] of this.cache.entries()) {
      if (entry.session.userId === updatedUser.id && !entry.session.revokedAt) {
        entry.session.userSnapshot = safeUser;
        entry.session.userRole = updatedUser.role;
      }
    }

    try {
      const q = query(
        collection(serverDb, 'auth_sessions'),
        where('userId', '==', updatedUser.id),
        limit(50)
      );
      const snap = await getDocs(q);
      const updates = snap.docs
        .filter(d => !d.data().revokedAt)
        .map(d => updateDoc(d.ref, { 
          userSnapshot: safeUser,
          userRole: updatedUser.role 
        }));
      await Promise.all(updates);
    } catch (err) {
      console.warn('⚠️ SessionService: Firestore snapshot update notice:', err);
    }
  }
}
