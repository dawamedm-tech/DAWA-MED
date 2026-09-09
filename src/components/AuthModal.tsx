import React, { useState, useEffect } from 'react';
import { UserProfile, CountryConfig, Language, UserRole } from '../types';
import { 
  X, 
  User, 
  Mail, 
  MapPin, 
  LocateFixed,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AuthLogo,
  AuthTitle,
  AuthSubtitle,
  AuthInput,
  AuthPasswordInput,
  AuthPhoneInput,
  AuthPrimaryButton,
  AuthDivider,
  AuthFooterLink,
  getSafeDialCode
} from './auth';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';

export type AuthMode = 'login' | 'register' | 'admin' | 'pharmacy_register' | 'forgot_password';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  userProfile?: UserProfile;
  currentProfile?: UserProfile;
  onSaveProfile: (profile: UserProfile, token?: string) => void;
  onLogout?: () => void;
  selectedCountry: CountryConfig;
  language: Language;
  onSwitchRole?: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  userProfile,
  currentProfile,
  onSaveProfile,
  onLogout,
  selectedCountry,
  language,
  onSwitchRole
}) => {
  const isRtl = language === 'ar';
  const countryCode = selectedCountry?.code || 'KE';

  // Internal mode: strictly 'login' | 'register' | 'forgot_password'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>(() => {
    if (initialMode === 'register') return 'register';
    if (initialMode === 'forgot_password') return 'forgot_password';
    return 'login';
  });

  useEffect(() => {
    if (initialMode === 'register') setMode('register');
    else if (initialMode === 'forgot_password') setMode('forgot_password');
    else setMode('login');
  }, [initialMode]);

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const [forgotTarget, setForgotTarget] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clear errors when typing
  useEffect(() => {
    if (errorMsg) setErrorMsg(null);
  }, [identifier, loginPassword, regName, regEmail, regPhone, regPassword, regConfirmPassword, regAddress, forgotTarget]);

  if (!isOpen) return null;

  // 1. Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setErrorMsg(isRtl ? 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف' : 'Please enter your email or phone number');
      return;
    }

    if (!loginPassword) {
      setErrorMsg(isRtl ? 'يرجى إدخال كلمة المرور' : 'Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanIdentifier, password: loginPassword })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || (isRtl ? 'بيانات الدخول غير صحيحة، يرجى المحاولة مجددًا.' : 'Invalid credentials, please try again.'));
        setIsLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('dawa_auth_token', data.token);
        if (data.user?.id) localStorage.setItem('dawa_user_id', data.user.id);
        if (data.user?.role) localStorage.setItem('dawa_user_role', data.user.role);
      }

      const updatedProfile: UserProfile = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || '+254 700 000 000',
        countryCode: data.user.countryCode || countryCode,
        city: data.user.city || selectedCountry.sampleCity,
        streetAddress: data.user.streetAddress || 'DAWA Hub',
        isRegistered: true,
        preferredLanguage: language
      };

      onSaveProfile(updatedProfile, data.token);
      if (onSwitchRole && data.user.role) {
        const uRole = data.user.role;
        const targetRole: UserRole = (uRole === 'super_admin' || uRole === 'medical_admin' || uRole === 'operations_admin' || uRole === 'support_admin')
          ? 'admin'
          : (uRole as UserRole) || 'customer';
        onSwitchRole(targetRole);
      }
      onClose();
    } catch (err) {
      setErrorMsg(isRtl ? 'حدث خطأ في الاتصال بالخادم.' : 'Server connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit Register (Patient Registration - strictly customer role)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim();

    if (!cleanName) {
      setErrorMsg(isRtl ? 'يرجى إدخال الاسم الكامل' : 'Please enter your full name');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg(isRtl ? 'يرجى إدخال بريد إلكتروني صالح' : 'Please enter a valid email address');
      return;
    }

    if (!regPassword || regPassword.length < 8) {
      setErrorMsg(isRtl ? 'يجب أن لا تقل كلمة المرور عن 8 أحرف' : 'Password must be at least 8 characters');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg(isRtl ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          phone: regPhone || `${getSafeDialCode(countryCode).dialCode} 700 000 000`,
          password: regPassword,
          streetAddress: regAddress || (isRtl ? 'العنوان الافتراضي للتوصيل' : 'Primary Delivery Address'),
          countryCode,
          preferredLanguage: language
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || (isRtl ? 'فشل إنشاء الحساب، يرجى المحاولة مجددًا.' : 'Registration failed, please try again.'));
        setIsLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('dawa_auth_token', data.token);
        if (data.user?.id) localStorage.setItem('dawa_user_id', data.user.id);
        if (data.user?.role) localStorage.setItem('dawa_user_role', data.user.role);
      }

      const updatedProfile: UserProfile = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || '+254 700 000 000',
        countryCode: data.user.countryCode || countryCode,
        city: data.user.city || selectedCountry.sampleCity,
        streetAddress: data.user.streetAddress || 'DAWA Hub',
        isRegistered: true,
        preferredLanguage: language
      };

      onSaveProfile(updatedProfile, data.token);
      if (onSwitchRole) onSwitchRole('customer');
      onClose();
    } catch (err) {
      setErrorMsg(isRtl ? 'حدث خطأ أثناء إنشاء الحساب.' : 'Error creating account.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto GPS Location Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setRegAddress(isRtl ? 'شارع المستشفى المركزي، نيروبي' : 'Central Hospital Road, Nairobi');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        setRegAddress(isRtl ? `موقع GPS مُحدد (${lat}, ${lng})` : `GPS Verified Location (${lat}, ${lng})`);
      },
      () => {
        setIsLocating(false);
        setRegAddress(isRtl ? 'المنطقة الطبية، كليماني' : 'Kilimani Medical District');
      },
      { timeout: 8000 }
    );
  };

  // 3. Submit Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const target = forgotTarget.trim();
    if (!target) {
      setErrorMsg(isRtl ? 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف' : 'Please enter your email or phone number');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: target, email: target })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || (isRtl ? 'فشل إرسال تعليمات الاستعادة.' : 'Failed to send reset code.'));
        setIsLoading(false);
        return;
      }

      setSuccessMsg(isRtl ? 'تم إرسال رمز التحقق بنجاح إلى حسابك.' : 'Verification code sent to your account.');
    } catch (err) {
      setErrorMsg(isRtl ? 'حدث خطأ أثناء معالجة الطلب.' : 'Error processing request.');
    } finally {
      setIsLoading(false);
    }
  };

  // Real Firebase Google Sign-In with Server-Side ID Token Verification
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await userCredential.user.getIdToken();

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setErrorMsg(
          data?.error || 
          (isRtl ? 'فشل التحقق من حساب Google لدى خادم المنصة.' : 'Google authentication verification failed on server.')
        );
        return;
      }

      setSuccessMsg(
        isRtl 
          ? `تم تسجيل الدخول بنجاح عبر Google (${data.user.name || data.user.email})` 
          : `Signed in successfully with Google (${data.user.name || data.user.email})`
      );

      onSaveProfile(data.user, data.token);
      onClose();
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setErrorMsg(isRtl ? 'تم إغلاق نافذة تسجيل الدخول بواسطة المستخدم.' : 'Google sign-in popup was closed.');
      } else if (err?.code === 'auth/popup-blocked') {
        setErrorMsg(isRtl ? 'تم حظر النافذة المنبثقة من قبل المتصفح. يرجى السماح بالنوافذ المنبثقة.' : 'Popup was blocked by browser. Please allow popups.');
      } else {
        setErrorMsg(err?.message || (isRtl ? 'حدث خطأ أثناء تسجيل الدخول بواسطة Google.' : 'Error during Google sign-in.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
      id="auth-modal-backdrop"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="bg-white rounded-[24px] max-w-[380px] w-full p-4 sm:p-5 relative shadow-2xl border border-[#DFE8F6] my-auto select-none"
        id="auth-modal-card"
      >
        {/* Circular Close Button at Top */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} w-[32px] h-[32px] rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] active:scale-95 flex items-center justify-center transition-all cursor-pointer z-20 border border-[#E2E8F0]/40 shadow-2xs`}
          aria-label="Close"
          id="auth-modal-close-btn"
        >
          <X className="w-3.5 h-3.5 text-[#475569] stroke-[2.5]" />
        </button>

        {/* =================================================================== */}
        {/* LOGIN VIEW                                                          */}
        {/* =================================================================== */}
        {mode === 'login' && (
          <div className="w-full flex flex-col items-center">
            <AuthLogo />

            <AuthTitle id="modal-login-title">
              {isRtl ? 'تسجيل الدخول' : 'Sign In'}
            </AuthTitle>

            <AuthSubtitle id="modal-login-subtitle">
              {isRtl 
                ? 'سجل دخولك لتتبع طلباتك وإضافة منتجات مميزة لحسابك الشخصي.' 
                : 'Sign in to track your orders and manage your prescriptions.'}
            </AuthSubtitle>

            <form onSubmit={handleLoginSubmit} className="w-full mt-3.5">
              <AuthInput
                id="modal-login-identifier"
                label={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                icon={<Mail className="w-4 h-4 text-[#8FA3BF]" />}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="grace@example.com"
                type="text"
                autoComplete="username"
                required
                containerClassName="mb-2.5"
              />

              <AuthPasswordInput
                id="modal-login-password"
                label={isRtl ? 'كلمة المرور' : 'Password'}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                containerClassName="mb-1"
              />

              {errorMsg && (
                <p className="text-[11.5px] text-[#E91E4D] font-medium text-center mt-2 leading-tight">
                  {errorMsg}
                </p>
              )}

              {successMsg && (
                <p className="text-[11.5px] text-[#0E7A4B] font-medium text-center mt-2 leading-tight">
                  {successMsg}
                </p>
              )}

              <AuthPrimaryButton
                type="submit"
                id="modal-login-submit-btn"
                isLoading={isLoading}
                className="mt-3.5"
              >
                {isRtl ? 'تسجيل الدخول' : 'Sign In'}
              </AuthPrimaryButton>
            </form>

            <AuthDivider text={isRtl ? 'أو عبر' : 'Or with'} className="my-3.5" />

            {/* Google Sign In Button */}
            <div className="flex justify-center items-center w-full max-w-[260px] mx-auto">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-[44px] rounded-[11px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] flex items-center justify-center gap-2.5 shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 text-[13px] font-medium text-[#374151]"
                title="Google"
                aria-label="Google Sign In"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>{isRtl ? 'المتابعة بواسطة Google' : 'Continue with Google'}</span>
              </button>
            </div>

            <AuthDivider className="my-3.5" />

            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  setForgotTarget(identifier);
                  setMode('forgot_password');
                }}
                className="text-[12px] font-medium text-[#F59E0B] hover:text-[#D97706] transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>🔑</span>
                <span>{isRtl ? 'هل نسيت كلمة المرور؟' : 'Forgot Password?'}</span>
              </button>
              <p className="text-[11.5px] text-[#8FA3BF] mt-0.5 text-center">
                {isRtl ? 'نسيت كلمة المرور؟ لا تقلق، سنساعدك!' : "Don't worry, we'll help you recover it!"}
              </p>
            </div>

            <AuthFooterLink
              promptText={isRtl ? 'ليس لديك حساب؟' : "Don't have an account?"}
              actionText={isRtl ? 'إنشاء حساب جديد' : 'Create New Account'}
              onAction={() => setMode('register')}
              className="mt-2"
            />
          </div>
        )}

        {/* =================================================================== */}
        {/* REGISTER VIEW (Pixel-Perfect Matching Reference Language)            */}
        {/* =================================================================== */}
        {mode === 'register' && (
          <div className="w-full flex flex-col items-center">
            <AuthLogo />

            <AuthTitle id="modal-register-title">
              {isRtl ? 'إنشاء حساب جديد' : 'Create New Account'}
            </AuthTitle>

            <AuthSubtitle id="modal-register-subtitle">
              {isRtl ? (
                <>
                  أنشئ حسابك للوصول إلى خدمات DAWA MED
                  <br />
                  وتتبع طلباتك وأدويتك بسهولة.
                </>
              ) : (
                'Create your account to access DAWA MED services and track your orders easily.'
              )}
            </AuthSubtitle>

            <form onSubmit={handleRegisterSubmit} className="w-full mt-3.5 space-y-2.5">
              <AuthInput
                id="modal-reg-name"
                label={isRtl ? 'الاسم الكامل' : 'Full Name'}
                icon={<User className="w-4 h-4 text-[#8FA3BF]" />}
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Grace Muthoni"
                type="text"
                autoComplete="name"
                required
              />

              <AuthInput
                id="modal-reg-email"
                label={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                icon={<Mail className="w-4 h-4 text-[#8FA3BF]" />}
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="grace@example.com"
                type="email"
                autoComplete="email"
                dir="ltr"
                required
              />

              <AuthPhoneInput
                id="modal-reg-phone"
                label={isRtl ? 'رقم الهاتف' : 'Phone Number'}
                value={regPhone}
                selectedCountryCode={countryCode}
                onChange={(full) => setRegPhone(full)}
                placeholder={isRtl ? '+256 700 000 000' : '+254 712 345 678'}
              />

              <AuthPasswordInput
                id="modal-reg-password"
                label={isRtl ? 'كلمة المرور' : 'Password'}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />

              <AuthPasswordInput
                id="modal-reg-confirm-password"
                label={isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="modal-reg-address" className="text-[11px] font-medium text-[#8FA3BF]">
                    {isRtl ? 'عنوان التوصيل' : 'Delivery Address'}
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#E91E4D] hover:underline cursor-pointer"
                  >
                    <LocateFixed className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? (isRtl ? 'جارِ التحديد...' : 'Locating...') : (isRtl ? 'اكتشاف موقعي' : 'Auto GPS')}</span>
                  </button>
                </div>

                <div className="relative w-full h-[38px]">
                  <MapPin className="w-4 h-4 text-[#8FA3BF] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    id="modal-reg-address"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="House 14B, Ole Odume Road, Kilimani"
                    className="w-full h-[38px] bg-[#EAF1FC] rounded-[12px] border border-[#DFE8F6] focus:border-[#BED4F7] outline-none ps-9 pe-3 text-[13px] text-[#111827] placeholder:text-[#94A3B8] transition-colors"
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-[11.5px] text-[#E91E4D] font-medium text-center mt-2 leading-tight">
                  {errorMsg}
                </p>
              )}

              {successMsg && (
                <p className="text-[11.5px] text-[#0E7A4B] font-medium text-center mt-2 leading-tight">
                  {successMsg}
                </p>
              )}

              <AuthPrimaryButton
                type="submit"
                id="modal-register-submit-btn"
                isLoading={isLoading}
                className="mt-3.5"
              >
                {isRtl ? 'إنشاء الحساب' : 'Create Account'}
              </AuthPrimaryButton>
            </form>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8FA3BF] mt-3">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0E7A4B]" />
              <span>{isRtl ? 'حماية بياناتك الطبية مشفرة بالكامل 256-bit' : '256-bit Encrypted Health Data Protection'}</span>
            </div>

            <AuthDivider className="my-3" />

            <AuthFooterLink
              promptText={isRtl ? 'لديك حساب بالفعل؟' : 'Already have an account?'}
              actionText={isRtl ? 'تسجيل الدخول' : 'Sign In'}
              onAction={() => setMode('login')}
            />
          </div>
        )}

        {/* =================================================================== */}
        {/* FORGOT PASSWORD VIEW                                                */}
        {/* =================================================================== */}
        {mode === 'forgot_password' && (
          <div className="w-full flex flex-col items-center">
            <div className="w-[72px] h-[72px] rounded-full border-2 border-[#FECDD3] bg-white flex items-center justify-center p-2.5 shadow-2xs shrink-0 select-none relative mt-1">
              <span className="text-2xl">🔑</span>
            </div>

            <AuthTitle id="modal-forgot-title">
              {isRtl ? 'استعادة كلمة المرور' : 'Reset Password'}
            </AuthTitle>

            <AuthSubtitle id="modal-forgot-subtitle">
              {isRtl 
                ? 'أدخل بريدك الإلكتروني المسجل وسنرسل لك رمز استعادة الحساب.' 
                : 'Enter your registered email to receive a reset code.'}
            </AuthSubtitle>

            <form onSubmit={handleForgotSubmit} className="w-full mt-4">
              <AuthInput
                id="modal-forgot-target"
                label={isRtl ? 'البريد الإلكتروني أو رقم الهاتف' : 'Email or Phone'}
                icon={<Mail className="w-4 h-4 text-[#8FA3BF]" />}
                value={forgotTarget}
                onChange={(e) => setForgotTarget(e.target.value)}
                placeholder="grace@example.com"
                type="text"
                required
                containerClassName="mb-3"
              />

              {errorMsg && (
                <p className="text-[11.5px] text-[#E91E4D] font-medium text-center mb-2 leading-tight">
                  {errorMsg}
                </p>
              )}

              {successMsg && (
                <p className="text-[11.5px] text-[#0E7A4B] font-medium text-center mb-2 leading-tight">
                  {successMsg}
                </p>
              )}

              <AuthPrimaryButton
                type="submit"
                id="modal-forgot-submit-btn"
                isLoading={isLoading}
              >
                {isRtl ? 'إرسال رمز التحقق' : 'Send Verification Code'}
              </AuthPrimaryButton>
            </form>

            <AuthFooterLink
              promptText={isRtl ? 'تذكرت كلمة المرور؟' : 'Remembered password?'}
              actionText={isRtl ? 'العودة لتسجيل الدخول' : 'Back to Login'}
              onAction={() => setMode('login')}
              className="mt-4"
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};
