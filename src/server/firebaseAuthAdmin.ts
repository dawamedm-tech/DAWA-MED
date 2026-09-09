import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth, Auth, DecodedIdToken } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let adminApp: App | null = null;
let adminAuth: Auth | null = null;

function getAdminAuth(): Auth {
  if (!adminAuth) {
    adminApp = getApps().length === 0 
      ? initializeApp({ projectId: firebaseConfig.projectId }) 
      : getApp();
    adminAuth = getAuth(adminApp);
  }
  return adminAuth;
}

export interface VerifiedGoogleUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
}

export type VerifyGoogleResult = 
  | { success: true; user: VerifiedGoogleUser }
  | { success: false; error: string; code: string };

/**
 * Verifies a Firebase Google ID token cryptographically using Firebase Admin SDK
 * Never trusts client-asserted email, name, role, or UID.
 */
export async function verifyFirebaseGoogleIdToken(idToken: string): Promise<VerifyGoogleResult> {
  if (!idToken || typeof idToken !== 'string' || idToken.trim().length < 20) {
    return {
      success: false,
      error: 'Invalid or missing Firebase ID token.',
      code: 'TOKEN_INVALID_FORMAT'
    };
  }

  try {
    const auth = getAdminAuth();
    // Cryptographically validates RS256 signature, expiry, project audience, and issuer
    const decoded: DecodedIdToken = await auth.verifyIdToken(idToken.trim(), true);

    const email = decoded.email?.toLowerCase().trim();
    if (!email) {
      return {
        success: false,
        error: 'Google account does not have a valid email address.',
        code: 'MISSING_EMAIL'
      };
    }

    if (!decoded.email_verified) {
      return {
        success: false,
        error: 'Google email address is not verified. Please verify your email with Google.',
        code: 'EMAIL_NOT_VERIFIED'
      };
    }

    return {
      success: true,
      user: {
        uid: decoded.uid,
        email,
        emailVerified: true,
        name: decoded.name || email.split('@')[0],
        picture: decoded.picture
      }
    };
  } catch (err: any) {
    // If the token is expired or forged
    const code = err.code || 'TOKEN_VERIFICATION_FAILED';
    const message = err.message || 'Failed to verify Firebase ID token.';
    return {
      success: false,
      error: message,
      code
    };
  }
}
