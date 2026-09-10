import crypto from 'crypto';
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

export interface VerifiedSocialUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
  providerId?: string;
}

export type VerifySocialResult = 
  | { success: true; user: VerifiedSocialUser }
  | { success: false; error: string; code: string };

// Cache for Google's public certificates (TTL: 1 hour)
let googleCertsCache: Record<string, string> | null = null;
let googleCertsExpiry = 0;

async function getGooglePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (googleCertsCache && googleCertsExpiry > now) {
    return googleCertsCache;
  }
  try {
    const res = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com', {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      googleCertsCache = await res.json();
      googleCertsExpiry = now + 3600 * 1000;
      return googleCertsCache || {};
    }
  } catch (e) {
    console.warn('[Firebase Auth] Failed to fetch Google public certs:', e);
  }
  return googleCertsCache || {};
}

/**
 * Verifies a Firebase ID token (Google, Facebook, etc.) cryptographically using:
 * 1. Native RS256 signature verification against Google's authoritative public certificates
 * 2. Firebase Admin SDK verifyIdToken
 * 3. Google Identity Toolkit REST API (accounts:lookup)
 * 4. Google OAuth2 tokeninfo endpoint
 * Never trusts client-asserted email, name, role, or UID.
 */
export async function verifyFirebaseIdToken(
  idToken: string, 
  providerName: 'google' | 'facebook' | 'social' = 'social'
): Promise<VerifySocialResult> {
  if (!idToken || typeof idToken !== 'string' || idToken.trim().length < 20) {
    return {
      success: false,
      error: 'رمز التحقق الأمني غير صالح أو مفقود (Invalid or missing token).',
      code: 'TOKEN_INVALID_FORMAT'
    };
  }

  const cleanToken = idToken.trim();

  // Layer 1: Native Cryptographic RS256 Verification against Google's Public Key Infrastructure
  try {
    const parts = cleanToken.split('.');
    if (parts.length === 3) {
      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));

      const nowSec = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp && payload.exp < nowSec;
      const isAudValid = payload.aud === firebaseConfig.projectId || payload.aud === firebaseConfig.oAuthClientId;
      const isIssValid = 
        payload.iss === `https://securetoken.google.com/${firebaseConfig.projectId}` ||
        payload.iss === 'https://accounts.google.com' ||
        payload.iss === 'accounts.google.com';

      if (!isExpired && (isAudValid || isIssValid) && header.kid) {
        const certs = await getGooglePublicCerts();
        const cert = certs[header.kid];

        if (cert) {
          const verifier = crypto.createVerify('RSA-SHA256');
          verifier.update(`${parts[0]}.${parts[1]}`);
          const isSignatureValid = verifier.verify(cert, parts[2], 'base64url');

          if (isSignatureValid) {
            const email = (payload.email || '').toLowerCase().trim();
            const uid = payload.sub || payload.user_id || payload.uid;

            if (uid && email) {
              const signInProvider = payload.firebase?.sign_in_provider || providerName;
              return {
                success: true,
                user: {
                  uid,
                  email,
                  emailVerified: Boolean(payload.email_verified),
                  name: payload.name || email.split('@')[0],
                  picture: payload.picture,
                  providerId: signInProvider
                }
              };
            }
          }
        }
      }
    }
  } catch (cryptoErr) {
    console.warn('[Firebase Auth] Native crypto verification note:', cryptoErr);
  }

  // Layer 2: Official Google Identity Toolkit accounts:lookup REST API
  try {
    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`;
    const lookupResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: cleanToken })
    });

    const lookupData = await lookupResponse.json();

    if (lookupResponse.ok && lookupData?.users && lookupData.users.length > 0) {
      const socialUser = lookupData.users[0];
      const email = (socialUser.email || '').toLowerCase().trim();
      const emailVerified = Boolean(socialUser.emailVerified);

      if (email && socialUser.localId) {
        return {
          success: true,
          user: {
            uid: socialUser.localId,
            email,
            emailVerified,
            name: socialUser.displayName || email.split('@')[0],
            picture: socialUser.photoUrl,
            providerId: providerName
          }
        };
      }
    }
  } catch (lookupErr) {
    console.warn('[Firebase Auth] Identity Toolkit lookup note:', lookupErr);
  }

  // Layer 3: Firebase Admin SDK verifyIdToken
  try {
    const auth = getAdminAuth();
    const decoded: DecodedIdToken = await auth.verifyIdToken(cleanToken, false);

    const email = decoded.email?.toLowerCase().trim();
    if (email && decoded.uid) {
      const signInProvider = decoded.firebase?.sign_in_provider || providerName;
      return {
        success: true,
        user: {
          uid: decoded.uid,
          email,
          emailVerified: Boolean(decoded.email_verified),
          name: decoded.name || email.split('@')[0],
          picture: decoded.picture,
          providerId: signInProvider
        }
      };
    }
  } catch (adminErr: any) {
    console.warn('[Firebase Auth] Admin SDK verify note:', adminErr?.message || adminErr);
  }

  // Layer 4: Google OAuth2 tokeninfo verification (for direct Google OAuth ID tokens)
  try {
    const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${cleanToken}`);
    if (tokenInfoRes.ok) {
      const tokenInfo = await tokenInfoRes.json();
      const email = (tokenInfo.email || '').toLowerCase().trim();
      const uid = tokenInfo.sub || tokenInfo.user_id;

      if (email && uid) {
        return {
          success: true,
          user: {
            uid,
            email,
            emailVerified: tokenInfo.email_verified === 'true' || tokenInfo.email_verified === true,
            name: tokenInfo.name || email.split('@')[0],
            picture: tokenInfo.picture,
            providerId: 'google.com'
          }
        };
      }
    }
  } catch (tokenInfoErr) {
    console.warn('[Firebase Auth] Tokeninfo lookup note:', tokenInfoErr);
  }

  if (providerName === 'facebook') {
    return {
      success: false,
      error: 'NOT VERIFIED — META/FACEBOOK CREDENTIALS REQUIRED: يلزم تفعيل مزود Facebook وإدخال بيانات Meta App ID و App Secret في لوحة Firebase Console.',
      code: 'FACEBOOK_CREDENTIALS_REQUIRED'
    };
  }

  return {
    success: false,
    error: 'فشل التحقق من صحة حساب Google لدى خوادم التحقق الرسمية (Invalid Google ID Token).',
    code: 'TOKEN_VERIFICATION_FAILED'
  };
}

/**
 * Backward compatibility alias for Google verification
 */
export const verifyFirebaseGoogleIdToken = (idToken: string) => verifyFirebaseIdToken(idToken, 'google');


