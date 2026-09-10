import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth, DecodedIdToken } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let hasCustomCredential = false;

function getAdminAuth(): Auth {
  if (!adminAuth) {
    if (getApps().length === 0) {
      let credential = undefined;
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
          if (serviceAccount.project_id === firebaseConfig.projectId) {
            credential = cert(serviceAccount);
            hasCustomCredential = true;
          } else {
            console.warn(`[Firebase Admin] Service account project_id (${serviceAccount.project_id}) mismatch with config (${firebaseConfig.projectId})`);
          }
        } catch (e) {
          console.error('[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON:', e);
        }
      }

      adminApp = initializeApp({
        projectId: firebaseConfig.projectId,
        ...(credential ? { credential } : {})
      });
    } else {
      adminApp = getApp();
    }
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

  const cleanToken = idToken.trim();

  // 1. Primary: Verify using Firebase Admin SDK verifyIdToken
  try {
    const auth = getAdminAuth();
    // Cryptographically validates RS256 signature against Google's public keys,
    // verifies expiration, audience (gen-lang-client-0240923987), issuer, and authentic UID.
    // checkRevoked is enabled only when custom service account credentials exist to avoid host IAM conflicts.
    const decoded: DecodedIdToken = await auth.verifyIdToken(cleanToken, hasCustomCredential);

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
  } catch (adminErr: any) {
    // 2. Secondary fallback: Official Google Identity Toolkit accounts:lookup REST API
    try {
      const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`;
      const lookupResponse = await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: cleanToken })
      });

      const lookupData = await lookupResponse.json();

      if (lookupResponse.ok && lookupData?.users && lookupData.users.length > 0) {
        const googleUser = lookupData.users[0];
        const email = (googleUser.email || '').toLowerCase().trim();
        const emailVerified = Boolean(googleUser.emailVerified);

        if (email && emailVerified) {
          return {
            success: true,
            user: {
              uid: googleUser.localId,
              email,
              emailVerified: true,
              name: googleUser.displayName || email.split('@')[0],
              picture: googleUser.photoUrl
            }
          };
        }
      }
    } catch (fallbackErr) {
      console.warn('[Firebase Auth] Identity Toolkit fallback warning:', fallbackErr);
    }

    const code = adminErr.code || 'TOKEN_VERIFICATION_FAILED';
    const message = adminErr.message || 'Failed to verify Firebase ID token.';
    return {
      success: false,
      error: message,
      code
    };
  }
}
