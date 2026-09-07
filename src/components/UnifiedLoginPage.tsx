import React, { useState, useEffect } from 'react';
import { 
  Language, 
  CountryConfig, 
} from '../types';
import { 
  User, 
  Mail, 
  MapPin, 
  LocateFixed, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import {
  AuthLayout,
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

export interface UnifiedLoginPageProps {
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  selectedCountry: CountryConfig;
  onCountryChange?: (country: CountryConfig) => void;
  onAuthSuccess: (user: any, token: string) => void;
  onCancel?: () => void;
  initialMode?: 'login' | 'admin_login' | 'register' | 'forgot_password' | 'reset_code' | '2fa_challenge';
}

export type AuthScreenMode = 'login' | 'admin_login' | 'register' | 'forgot_password' | 'reset_code' | '2fa_challenge';

export const UnifiedLoginPage: React.FC<UnifiedLoginPageProps> = ({
  language,
  selectedCountry,
  onAuthSuccess,
  onCancel,
  initialMode = 'login',
}) => {
  const isRtl = language === 'ar';
  const countryCode = selectedCountry?.code || 'KE';

  // Screen mode
  const [authMode, setAuthMode] = useState<AuthScreenMode>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/admin/login') return 'admin_login';
      if (path === '/register') return 'register';
      if (path === '/forgot-password') return 'forgot_password';
      if (path === '/reset-password') return 'reset_code';
      if (path === '/verify-otp') return '2fa_challenge';
    }
    return initialMode;
  });

  // Login Input states (Customer/General)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Admin Login Input states
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Register Input states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Common UX states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 2FA Admin state
  const [twoFactorTicket, setTwoFactorTicket] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // Forgot / Reset password state
  const [forgotTarget, setForgotTarget] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [sandboxOtp, setSandboxOtp] = useState<string | null>(null);

  // Clear errors on input change
  useEffect(() => {
    if (errorMsg) setErrorMsg(null);
  }, [
    identifier, 
    password, 
    adminUsername,
    adminPassword,
    regName, 
    regEmail, 
    regPhone, 
    regPassword, 
    regConfirmPassword, 
    regAddress, 
    forgotTarget, 
    resetCode, 
    newPassword,
    confirmNewPassword
  ]);

  // Navigate mode safely while syncing browser history URL
  const switchMode = (mode: AuthScreenMode) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setAuthMode(mode);

    const urlMap: Record<AuthScreenMode, string> = {
      login: '/login',
      admin_login: '/admin/login',
      register: '/register',
      forgot_password: '/forgot-password',
      reset_code: '/reset-password',
      '2fa_challenge': '/verify-otp'
    };

    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', urlMap[mode]);
    }
  };

  // Close handler
  const handleClose = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

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

    if (!password) {
      setErrorMsg(isRtl ? 'يرجى إدخال كلمة المرور' : 'Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanIdentifier,
          password
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.code === 'ACCOUNT_SUSPENDED') {
          setErrorMsg(isRtl ? 'تم تجميد هذا الحساب من قبل إدارة الامتثال الطبي لـ دواء ميد.' : 'Account suspended by DAWA MED compliance.');
        } else {
          setErrorMsg(data.error || (isRtl ? 'بيانات الدخول غير صحيحة، يرجى التحقق والمحاولة مجددًا.' : 'Invalid credentials, please try again.'));
        }
        setIsLoading(false);
        return;
      }

      if (data.requires2FA) {
        setTwoFactorTicket(data.twoFactorTicket || '');
        switchMode('2fa_challenge');
        setIsLoading(false);
        return;
      }

      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setErrorMsg(isRtl ? 'حدث خطأ في الاتصال بالخادم، يرجى المحاولة لاحقًا.' : 'Server connection error, please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1.b Submit Admin Login (Username + Password authentication)
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanUsername = adminUsername.trim();
    if (!cleanUsername) {
      setErrorMsg(isRtl ? 'يرجى إدخال اسم المستخدم' : 'Please enter your username');
      return;
    }

    if (!adminPassword) {
      setErrorMsg(isRtl ? 'يرجى إدخال كلمة المرور' : 'Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          password: adminPassword
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.code === 'ACCOUNT_SUSPENDED') {
          setErrorMsg(isRtl ? 'تم تجميد هذا الحساب الإداري.' : 'Account suspended.');
        } else if (data.code === 'FORBIDDEN_ADMIN_REQUIRED') {
          setErrorMsg(isRtl ? 'ليس لديك صلاحية للوصول إلى لوحة الإدارة' : 'You do not have administrative privileges');
        } else if (data.code === 'TOO_MANY_ATTEMPTS') {
          setErrorMsg(isRtl ? 'محاولات تسجيل دخول كثيرة، يرجى المحاولة لاحقًا' : 'Too many attempts, please try again later');
        } else {
          setErrorMsg(data.error || (isRtl ? 'بيانات تسجيل الدخول غير صحيحة' : 'Invalid administrative credentials'));
        }
        setIsLoading(false);
        return;
      }

      if (data.requires2FA) {
        setTwoFactorTicket(data.twoFactorTicket || '');
        switchMode('2fa_challenge');
        setIsLoading(false);
        return;
      }

      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setErrorMsg(isRtl ? 'حدث خطأ في الاتصال بالخادم، يرجى المحاولة لاحقًا.' : 'Server connection error, please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit Register (Customer Registration - strictly enforces customer role)
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

    if (!regPassword) {
      setErrorMsg(isRtl ? 'يرجى إدخال كلمة المرور' : 'Please enter a password');
      return;
    }

    if (regPassword.length < 8) {
      setErrorMsg(isRtl ? 'يجب أن لا تقل كلمة المرور عن 8 أحرف' : 'Password must be at least 8 characters');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg(isRtl ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
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

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMsg(data.error || (isRtl ? 'فشل إنشاء الحساب، يرجى المحاولة مجددًا.' : 'Registration failed, please try again.'));
        setIsLoading(false);
        return;
      }

      setSuccessMsg(isRtl ? 'تم إنشاء حسابك بنجاح! مرحبًا بك في دواء ميد.' : 'Account created successfully! Welcome to DAWA MED.');
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setErrorMsg(isRtl ? 'حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة لاحقًا.' : 'Error creating account, please try again.');
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
      (position) => {
        setIsLocating(false);
        const lat = position.coords.latitude.toFixed(4);
        const lng = position.coords.longitude.toFixed(4);
        setRegAddress(isRtl ? `موقع GPS مُحدد (${lat}, ${lng})` : `GPS Verified Location (${lat}, ${lng})`);
      },
      () => {
        setIsLocating(false);
        setRegAddress(isRtl ? 'المنطقة الطبية، كليماني' : 'Kilimani Medical District');
      },
      { timeout: 8000 }
    );
  };

  // 3. Submit Forgot Password Request
  const handleRequestPasswordReset = async (e: React.FormEvent) => {
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
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: target, email: target })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMsg(data.error || (isRtl ? 'فشل إرسال تعليمات استعادة كلمة المرور.' : 'Failed to send reset code.'));
        setIsLoading(false);
        return;
      }

      if (data.sandboxOtp) {
        setSandboxOtp(data.sandboxOtp);
      }
      setSuccessMsg(isRtl ? 'تم إرسال رمز التحقق بنجاح إلى حسابك.' : 'Verification code sent to your account.');
      switchMode('reset_code');
    } catch (err) {
      setErrorMsg(isRtl ? 'حدث خطأ أثناء معالجة الطلب.' : 'Error processing request.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Submit Reset Password Confirmation
  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!resetCode.trim()) {
      setErrorMsg(isRtl ? 'يرجى إدخال رمز التحقق' : 'Please enter verification code');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMsg(isRtl ? 'يجب أن لا تقل كلمة المرور عن 8 أحرف' : 'Password must be at least 8 characters');
      return;
    }

    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      setErrorMsg(isRtl ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: forgotTarget.trim(),
          code: resetCode.trim(),
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMsg(data.error || (isRtl ? 'فشل إعادة تعيين كلمة المرور.' : 'Failed to reset password.'));
        setIsLoading(false);
        return;
      }

      setSuccessMsg(isRtl ? 'تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.' : 'Password updated successfully! You can now log in.');
      setIdentifier(forgotTarget);
      setPassword('');
      switchMode('login');
    } catch (err) {
      setErrorMsg(isRtl ? 'حدث خطأ أثناء إعادة تعيين كلمة المرور.' : 'Error resetting password.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Submit 2FA Verification (Admin & Privileged Accounts)
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!twoFactorCode.trim()) {
      setErrorMsg(isRtl ? 'يرجى إدخال رمز الأمان المكون من 6 أرقام' : 'Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/admin/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          twoFactorTicket,
          code: twoFactorCode.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMsg(data.error || (isRtl ? 'رمز الأمان غير صحيح أو انتهت صلاحيته.' : 'Invalid or expired 2FA code.'));
        setIsLoading(false);
        return;
      }

      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setErrorMsg(isRtl ? 'فشل التحقق من الرمز الأمني.' : 'Failed to verify security code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Social Login Demo helper
  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    setIdentifier('patient@dawamed.com');
    setPassword('DawaMed@2026!Secure');
    setSuccessMsg(
      isRtl 
        ? `تم تسجيل الدخول السريع عبر ${provider === 'google' ? 'Google' : 'Facebook'}`
        : `Connected via ${provider === 'google' ? 'Google' : 'Facebook'}`
    );
  };

  return (
    <AuthLayout onClose={handleClose} isRtl={isRtl}>
      {/* ========================================================================= */}
      {/* 1. LOGIN VIEW (Pixel-Perfect to Reference Screenshot)                      */}
      {/* ========================================================================= */}
      {authMode === 'login' && (
        <div className="w-full flex flex-col items-center">
          <AuthLogo />

          <AuthTitle id="login-title">
            {isRtl ? 'تسجيل الدخول' : 'Sign In'}
          </AuthTitle>

          <AuthSubtitle id="login-subtitle">
            {isRtl 
              ? 'سجل دخولك لتتبع طلباتك وإضافة منتجات مميزة لحسابك الشخصي.' 
              : 'Sign in to track your orders and manage your medical prescriptions.'}
          </AuthSubtitle>

          <form onSubmit={handleLoginSubmit} className="w-full mt-3.5" id="login-form">
            <AuthInput
              id="login-identifier"
              labelId="login-identifier-label"
              label={isRtl ? 'البريد الإلكتروني أو رقم الهاتف' : 'Email Address or Phone'}
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
              id="login-password"
              labelId="login-password-label"
              label={isRtl ? 'كلمة المرور' : 'Password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              containerClassName="mb-1"
            />

            {errorMsg && (
              <p className="text-[11.5px] text-[#E91E4D] font-medium text-center mt-2 leading-tight" id="login-error-msg">
                {errorMsg}
              </p>
            )}

            {successMsg && (
              <p className="text-[11.5px] text-[#0E7A4B] font-medium text-center mt-2 leading-tight" id="login-success-msg">
                {successMsg}
              </p>
            )}

            <AuthPrimaryButton
              type="submit"
              id="login-submit-button"
              isLoading={isLoading}
              className="mt-3.5"
            >
              {isRtl ? 'تسجيل الدخول' : 'Sign In'}
            </AuthPrimaryButton>
          </form>

          {/* Divider */}
          <AuthDivider text={isRtl ? 'أو عبر' : 'Or with'} className="my-3.5" />

          {/* Google Sign In Button */}
          <div className="flex justify-center items-center w-full" id="login-social-row">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="w-full max-w-[220px] h-[40px] rounded-[11px] bg-white border border-[#DFE8F6] hover:bg-[#F8FAFC] flex items-center justify-center gap-2.5 shadow-2xs transition-all active:scale-98 cursor-pointer text-[12.5px] font-medium text-[#374151]"
              title="Google"
              aria-label="Google Sign In"
              id="social-google-button"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              <span>{isRtl ? 'المتابعة بواسطة Google' : 'Continue with Google'}</span>
            </button>
          </div>

          <AuthDivider className="my-3.5" />

          {/* Forgot Password Link */}
          <div className="flex flex-col items-center select-none" id="login-forgot-password-area">
            <button
              type="button"
              onClick={() => {
                setForgotTarget(identifier);
                switchMode('forgot_password');
              }}
              className="text-[12px] font-medium text-[#F59E0B] hover:text-[#D97706] transition-colors flex items-center justify-center gap-1 cursor-pointer"
              id="forgot-password-link"
            >
              <span>🔑</span>
              <span>{isRtl ? 'هل نسيت كلمة المرور؟' : 'Forgot Password?'}</span>
            </button>

            <p className="text-[11.5px] text-[#8FA3BF] mt-0.5 text-center">
              {isRtl ? 'نسيت كلمة المرور؟ لا تقلق، سنساعدك!' : "Don't worry, we'll help you recover it!"}
            </p>
          </div>

          {/* Switch to Register Link */}
          <AuthFooterLink
            promptText={isRtl ? 'ليس لديك حساب؟' : "Don't have an account?"}
            actionText={isRtl ? 'إنشاء حساب جديد' : 'Create New Account'}
            onAction={() => switchMode('register')}
            id="login-switch-to-register-link"
            className="mt-2"
          />

          {/* Switch to Admin Login Link */}
          <div className="mt-3 pt-2 text-center border-t border-[#F1F5F9] w-full select-none" id="login-admin-switch-area">
            <button
              type="button"
              onClick={() => switchMode('admin_login')}
              className="text-[11px] font-medium text-[#6B7280] hover:text-[#0E7A4B] transition-colors cursor-pointer inline-flex items-center gap-1.5"
              id="switch-to-admin-login-link"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#0E7A4B]" />
              <span>{isRtl ? 'دخول الكادر الإداري والرقابي' : 'Administrative Portal Login'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1.b ADMIN LOGIN VIEW (DAWA MED Unified Green Design System)               */}
      {/* ========================================================================= */}
      {authMode === 'admin_login' && (
        <div className="w-full flex flex-col items-center" id="admin-login-screen">
          <AuthLogo />

          <AuthTitle id="admin-login-title">
            {isRtl ? 'تسجيل دخول الإدارة' : 'Administrative Sign In'}
          </AuthTitle>

          <AuthSubtitle id="admin-login-subtitle">
            {isRtl 
              ? 'بوابة الإشراف الطبي والرقابة الصيدلانية السريرية المعتمدة.' 
              : 'Authorized regulatory and clinical governance portal.'}
          </AuthSubtitle>

          <form onSubmit={handleAdminLoginSubmit} className="w-full mt-3.5" id="admin-login-form">
            <AuthInput
              id="admin-username"
              labelId="admin-username-label"
              label={isRtl ? 'اسم المستخدم' : 'Username'}
              icon={<User className="w-4 h-4 text-[#8FA3BF]" />}
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              placeholder="admin"
              type="text"
              autoComplete="username"
              required
              containerClassName="mb-2.5"
            />

            <AuthPasswordInput
              id="admin-password"
              labelId="admin-password-label"
              label={isRtl ? 'كلمة المرور' : 'Password'}
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              containerClassName="mb-1"
            />

            {errorMsg && (
              <p className="text-[11.5px] text-[#E91E4D] font-medium text-center mt-2 leading-tight" id="admin-login-error-msg">
                {errorMsg}
              </p>
            )}

            {successMsg && (
              <p className="text-[11.5px] text-[#0E7A4B] font-medium text-center mt-2 leading-tight" id="admin-login-success-msg">
                {successMsg}
              </p>
            )}

            <AuthPrimaryButton
              type="submit"
              id="admin-login-submit-button"
              isLoading={isLoading}
              className="mt-3.5"
            >
              {isRtl ? 'تسجيل الدخول' : 'Sign In'}
            </AuthPrimaryButton>
          </form>

          <AuthFooterLink
            promptText={isRtl ? 'حساب مريض أو عميل؟' : 'Patient or customer account?'}
            actionText={isRtl ? 'العودة لتسجيل الدخول العام' : 'Return to Standard Login'}
            onAction={() => switchMode('login')}
            id="admin-return-to-login-link"
            className="mt-4"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REGISTER VIEW (Pixel-Perfect Rebuild Matching Reference Language)       */}
      {/* ========================================================================= */}
      {authMode === 'register' && (
        <div className="w-full flex flex-col items-center">
          <AuthLogo />

          <AuthTitle id="register-title">
            {isRtl ? 'إنشاء حساب جديد' : 'Create New Account'}
          </AuthTitle>

          <AuthSubtitle id="register-subtitle">
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

          <form onSubmit={handleRegisterSubmit} className="w-full mt-3.5 space-y-2.5" id="register-form">
            {/* FIELD 1: Full Name */}
            <AuthInput
              id="reg-name"
              labelId="reg-name-label"
              label={isRtl ? 'الاسم الكامل' : 'Full Name'}
              icon={<User className="w-4 h-4 text-[#8FA3BF]" />}
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              placeholder="Grace Muthoni"
              type="text"
              autoComplete="name"
              required
            />

            {/* FIELD 2: Email */}
            <AuthInput
              id="reg-email"
              labelId="reg-email-label"
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

            {/* FIELD 3: Phone (Country Code Selector + Phone Number, NO undefined) */}
            <AuthPhoneInput
              id="reg-phone"
              labelId="reg-phone-label"
              label={isRtl ? 'رقم الهاتف' : 'Phone Number'}
              value={regPhone}
              selectedCountryCode={countryCode}
              onChange={(full) => setRegPhone(full)}
              placeholder={isRtl ? '+256 700 000 000' : '+254 712 345 678'}
            />

            {/* FIELD 4: Password */}
            <AuthPasswordInput
              id="reg-password"
              labelId="reg-password-label"
              label={isRtl ? 'كلمة المرور' : 'Password'}
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />

            {/* FIELD 5: Confirm Password */}
            <AuthPasswordInput
              id="reg-confirm-password"
              labelId="reg-confirm-password-label"
              label={isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              value={regConfirmPassword}
              onChange={(e) => setRegConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />

            {/* ADDRESS FIELD: Compact with MapPin and subtle Auto GPS detect */}
            <div>
              <div className="flex items-center justify-between mb-1 select-none">
                <label htmlFor="reg-address" className="text-[11px] font-medium text-[#8FA3BF]">
                  {isRtl ? 'عنوان التوصيل' : 'Delivery Address'}
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0E7A4B] hover:text-[#0B6840] hover:underline cursor-pointer"
                  id="reg-detect-location-btn"
                >
                  <LocateFixed className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? (isRtl ? 'جارِ التحديد...' : 'Locating...') : (isRtl ? 'اكتشاف موقعي' : 'Auto GPS')}</span>
                </button>
              </div>

              <div className="relative w-full h-[38px]">
                <MapPin className="w-4 h-4 text-[#8FA3BF] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  id="reg-address"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder={isRtl ? 'House 14B, Ole Odume Road, Kilimani' : 'House 14B, Ole Odume Road, Kilimani'}
                  className="w-full h-[38px] bg-[#EAF1FC] rounded-[12px] border border-[#DFE8F6] focus:border-[#BED4F7] outline-none ps-9 pe-3 text-[13px] text-[#111827] placeholder:text-[#94A3B8] transition-colors"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-[11.5px] text-[#E91E4D] font-medium text-center mt-2 leading-tight" id="reg-error-msg">
                {errorMsg}
              </p>
            )}

            {successMsg && (
              <p className="text-[11.5px] text-[#0E7A4B] font-medium text-center mt-2 leading-tight" id="reg-success-msg">
                {successMsg}
              </p>
            )}

            {/* REGISTER BUTTON: Full form width, 41px height, #E91E4D primary red/pink */}
            <AuthPrimaryButton
              type="submit"
              id="register-submit-button"
              isLoading={isLoading}
              className="mt-3.5"
            >
              {isRtl ? 'إنشاء الحساب' : 'Create Account'}
            </AuthPrimaryButton>
          </form>

          {/* Subtly phrased medical security badge */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8FA3BF] mt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0E7A4B]" />
            <span>{isRtl ? 'حماية بياناتك الطبية مشفرة بالكامل 256-bit' : '256-bit Encrypted Health Data Protection'}</span>
          </div>

          <AuthDivider className="my-3" />

          {/* LOGIN LINK at the bottom */}
          <AuthFooterLink
            promptText={isRtl ? 'لديك حساب بالفعل؟' : 'Already have an account?'}
            actionText={isRtl ? 'تسجيل الدخول' : 'Sign In'}
            onAction={() => switchMode('login')}
            id="register-switch-to-login-link"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FORGOT PASSWORD VIEW                                                   */}
      {/* ========================================================================= */}
      {authMode === 'forgot_password' && (
        <div className="w-full flex flex-col items-center">
          <div className="w-[72px] h-[72px] rounded-full border-2 border-[#FECDD3] bg-white flex items-center justify-center p-2.5 shadow-2xs shrink-0 select-none relative mt-1">
            <span className="text-2xl">🔑</span>
          </div>

          <AuthTitle id="forgot-title">
            {isRtl ? 'استعادة كلمة المرور' : 'Reset Password'}
          </AuthTitle>

          <AuthSubtitle id="forgot-subtitle">
            {isRtl 
              ? 'أدخل بريدك الإلكتروني المسجل وسنرسل لك رمز استعادة الحساب فورًا.' 
              : 'Enter your registered email and we will send you a verification code.'}
          </AuthSubtitle>

          <form onSubmit={handleRequestPasswordReset} className="w-full mt-4">
            <AuthInput
              id="forgot-target-input"
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
              id="forgot-submit-button"
              isLoading={isLoading}
            >
              {isRtl ? 'إرسال رمز التحقق' : 'Send Verification Code'}
            </AuthPrimaryButton>
          </form>

          <AuthFooterLink
            promptText={isRtl ? 'تذكرت كلمة المرور؟' : 'Remembered password?'}
            actionText={isRtl ? 'العودة لتسجيل الدخول' : 'Back to Login'}
            onAction={() => switchMode('login')}
            className="mt-4"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RESET CODE & NEW PASSWORD VIEW                                         */}
      {/* ========================================================================= */}
      {authMode === 'reset_code' && (
        <div className="w-full flex flex-col items-center">
          <div className="w-[72px] h-[72px] rounded-full border-2 border-[#A7F3D0] bg-white flex items-center justify-center p-2.5 shadow-2xs shrink-0 select-none relative mt-1">
            <Sparkles className="w-7 h-7 text-[#0E7A4B]" />
          </div>

          <AuthTitle id="reset-code-title">
            {isRtl ? 'تعيين كلمة المرور الجديدة' : 'Set New Password'}
          </AuthTitle>

          <AuthSubtitle id="reset-code-subtitle">
            {isRtl 
              ? 'أدخل رمز التحقق المكون من 6 أرقام وكلمة المرور الجديدة لحسابك.' 
              : 'Enter the 6-digit code sent to you and your new password.'}
          </AuthSubtitle>

          {sandboxOtp && (
            <div className="w-full my-2 p-2 bg-[#EAF1FC] border border-[#DFE8F6] rounded-xl text-xs text-[#111827] flex items-center justify-between">
              <span>{isRtl ? 'رمز الاختبار التوضيحي:' : 'Demo Sandbox Code:'} <strong className="font-mono text-[#0E7A4B]">{sandboxOtp}</strong></span>
              <button
                type="button"
                onClick={() => setResetCode(sandboxOtp)}
                className="text-[11px] font-bold text-[#0E7A4B] hover:underline cursor-pointer"
              >
                {isRtl ? 'استخدام الرمز' : 'Auto Fill'}
              </button>
            </div>
          )}

          <form onSubmit={handleConfirmPasswordReset} className="w-full mt-3 space-y-2.5">
            <div>
              <label htmlFor="reset-code-input" className="block text-[11px] font-medium text-[#8FA3BF] text-start mb-1">
                {isRtl ? 'رمز التحقق (6 أرقام)' : 'Verification Code'}
              </label>
              <input
                type="text"
                id="reset-code-input"
                maxLength={6}
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="123456"
                className="w-full h-[40px] bg-[#EAF1FC] rounded-[12px] border border-[#DFE8F6] focus:border-[#BED4F7] outline-none text-center font-mono text-lg tracking-[0.3em] font-bold text-[#111827]"
                required
              />
            </div>

            <AuthPasswordInput
              id="reset-new-password"
              label={isRtl ? 'كلمة المرور الجديدة' : 'New Password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <AuthPasswordInput
              id="reset-confirm-new-password"
              label={isRtl ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {errorMsg && (
              <p className="text-[11.5px] text-[#E91E4D] font-medium text-center leading-tight">
                {errorMsg}
              </p>
            )}

            <AuthPrimaryButton
              type="submit"
              id="confirm-reset-submit-button"
              isLoading={isLoading}
              className="mt-2"
            >
              {isRtl ? 'حفظ كلمة المرور وتسجيل الدخول' : 'Save Password & Sign In'}
            </AuthPrimaryButton>
          </form>

          <AuthFooterLink
            promptText={isRtl ? 'إلغاء العملية؟' : 'Cancel?'}
            actionText={isRtl ? 'العودة لتسجيل الدخول' : 'Back to Login'}
            onAction={() => switchMode('login')}
            className="mt-3"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. 2FA CHALLENGE VIEW (Administrative Accounts)                            */}
      {/* ========================================================================= */}
      {authMode === '2fa_challenge' && (
        <div className="w-full flex flex-col items-center">
          <div className="w-[72px] h-[72px] rounded-full border-2 border-[#A7F3D0] bg-white flex items-center justify-center p-2.5 shadow-2xs shrink-0 select-none relative mt-1">
            <ShieldCheck className="w-8 h-8 text-[#0E7A4B]" />
          </div>

          <AuthTitle id="2fa-title">
            {isRtl ? 'التحقق بخطوتين (2FA)' : 'Two-Factor Authentication'}
          </AuthTitle>

          <AuthSubtitle id="2fa-subtitle">
            {isRtl 
              ? 'أدخل رمز الأمان المكون من 6 أرقام المُرسل إلى جهازك لتأكيد الهوية.' 
              : 'Enter the 6-digit security code sent to verify your identity.'}
          </AuthSubtitle>

          <form onSubmit={handleVerify2FA} className="w-full mt-4">
            <div className="mb-3">
              <label htmlFor="2fa-code-input" className="block text-[11px] font-medium text-[#8FA3BF] text-center mb-1.5">
                {isRtl ? 'رمز الأمان (6 أرقام)' : 'Security Code (6 Digits)'}
              </label>
              <input
                type="text"
                id="2fa-code-input"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="123456"
                className="w-full h-[44px] bg-[#EAF1FC] rounded-[12px] border border-[#DFE8F6] focus:border-[#BED4F7] outline-none text-center font-mono text-xl tracking-[0.35em] font-black text-[#111827]"
                autoFocus
                required
              />
            </div>

            {errorMsg && (
              <p className="text-[11.5px] text-[#E91E4D] font-medium text-center mb-2 leading-tight">
                {errorMsg}
              </p>
            )}

            <AuthPrimaryButton
              type="submit"
              id="verify-2fa-submit-button"
              isLoading={isLoading}
            >
              {isRtl ? 'تأكيد الرمز والدخول' : 'Verify & Continue'}
            </AuthPrimaryButton>
          </form>

          <AuthFooterLink
            promptText={isRtl ? 'واجهت مشكلة؟' : 'Having trouble?'}
            actionText={isRtl ? 'تسجيل الدخول بحساب آخر' : 'Login with another account'}
            onAction={() => switchMode('login')}
            className="mt-4"
          />
        </div>
      )}
    </AuthLayout>
  );
};
