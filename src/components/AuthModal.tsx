import React, { useState } from 'react';
import { UserProfile, CountryConfig, Language, UserRole } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { translate } from '../utils/i18n';
import { 
  X, 
  Smartphone, 
  ShieldCheck, 
  MapPin, 
  User, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  RefreshCw,
  LocateFixed,
  Building2,
  KeyRound,
  Mail,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  Sparkles,
  LogOut,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const profile = userProfile || currentProfile;
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isRtl = language === 'ar';

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  
  // Form fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(selectedCountry.phonePrefix + ' ');
  const [city, setCity] = useState(selectedCountry.sampleCity);
  const [streetAddress, setStreetAddress] = useState('');
  
  // Pharmacy fields
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacistName, setPharmacistName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  
  // OTP & 2FA state
  const [otpCode, setOtpCode] = useState('');
  const [twoFactorTicket, setTwoFactorTicket] = useState('');
  const [twoFactorExpiresIn, setTwoFactorExpiresIn] = useState(300);
  const [is2FAStage, setIs2FAStage] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [sandboxCode, setSandboxCode] = useState<string | undefined>();
  
  // Loading & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Sync mode when initialMode changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg('');
      setSuccessMsg('');
      setIs2FAStage(false);
      setOtpCode('');
      setSandboxCode(undefined);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Handle GPS location detection
  const handleDetectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          setStreetAddress(`${selectedCountry.sampleCity} District Hub (GPS Fixed)`);
        },
        () => {
          setIsLocating(false);
          setStreetAddress(`${selectedCountry.sampleCity} Main Health Plaza`);
        }
      );
    } else {
      setIsLocating(false);
      setStreetAddress(`${selectedCountry.sampleCity} Main Health Plaza`);
    }
  };

  // 1. Standard Customer & Staff Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (authMethod === 'otp') {
        // Step 1: Send OTP
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: identifier, countryCode: selectedCountry.code })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to dispatch verification code');
        
        setIs2FAStage(true);
        if (data.sandboxOtp) setSandboxCode(data.sandboxOtp);
        setSuccessMsg(data.message || 'Verification code dispatched.');
        setIsLoading(false);
        return;
      }

      // Password Login
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed. Please verify your credentials.');

      if (data.requires2FA) {
        // Redirect to admin 2FA flow
        setMode('admin');
        setErrorMsg('Administrative access requires Two-Factor Authentication. Please sign in via the Admin Gate.');
        setIsLoading(false);
        return;
      }

      // Save user session
      const authUser = data.user;
      const updatedProfile: UserProfile = {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        phone: authUser.phone || identifier,
        countryCode: authUser.countryCode || selectedCountry.code,
        city: authUser.city || selectedCountry.sampleCity,
        streetAddress: authUser.streetAddress || 'DAWA Delivery Location',
        isRegistered: true,
        preferredLanguage: authUser.preferredLanguage || language,
      };

      if (data.token) {
        localStorage.setItem('dawa_auth_token', data.token);
        localStorage.setItem('dawa_user_id', authUser.id);
        localStorage.setItem('dawa_user_role', authUser.role);
      }

      onSaveProfile(updatedProfile, data.token);
      if (onSwitchRole && authUser.role) {
        onSwitchRole(authUser.role);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify OTP Login
  const handleVerifyOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: identifier, code: otpCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid or expired OTP code.');

      const authUser = data.user;
      const updatedProfile: UserProfile = {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        phone: authUser.phone || identifier,
        countryCode: authUser.countryCode || selectedCountry.code,
        city: authUser.city || selectedCountry.sampleCity,
        streetAddress: authUser.streetAddress || 'DAWA Delivery Location',
        isRegistered: true,
        preferredLanguage: authUser.preferredLanguage || language,
      };

      if (data.token) {
        localStorage.setItem('dawa_auth_token', data.token);
        localStorage.setItem('dawa_user_id', authUser.id);
        localStorage.setItem('dawa_user_role', authUser.role);
      }

      onSaveProfile(updatedProfile, data.token);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Customer Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          countryCode: selectedCountry.code,
          city,
          streetAddress: streetAddress || 'Default Residential Address',
          preferredLanguage: language
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration could not be completed.');

      const authUser = data.user;
      const updatedProfile: UserProfile = {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        phone: authUser.phone,
        countryCode: authUser.countryCode,
        city: authUser.city,
        streetAddress: authUser.streetAddress,
        isRegistered: true,
        preferredLanguage: authUser.preferredLanguage,
      };

      if (data.token) {
        localStorage.setItem('dawa_auth_token', data.token);
        localStorage.setItem('dawa_user_id', authUser.id);
        localStorage.setItem('dawa_user_role', 'customer');
      }

      onSaveProfile(updatedProfile, data.token);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Pharmacy Partner Registration
  const handlePharmacyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/pharmacy/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacyName,
          pharmacistName,
          email,
          phone,
          licenseNumber,
          password,
          countryCode: selectedCountry.code,
          city,
          streetAddress: streetAddress || 'Commercial Pharmacy Facility',
          preferredLanguage: language
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit pharmacy registration.');

      setSuccessMsg(data.message || 'Application submitted successfully.');
      setTimeout(() => {
        setMode('login');
        setSuccessMsg('Your pharmacy partnership application has been submitted and is in the administrative review queue.');
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Pharmacy registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Admin Portal Login & 2FA Challenge
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Administrative access denied.');

      if (data.requires2FA) {
        setTwoFactorTicket(data.twoFactorTicket);
        setMaskedEmail(data.maskedEmail);
        setIs2FAStage(true);
        if (data.sandboxCode) setSandboxCode(data.sandboxCode);
        setSuccessMsg(`2FA security code dispatched to ${data.maskedEmail}.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Admin authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Verify Admin 2FA
  const handleVerifyAdmin2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/admin/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          twoFactorTicket,
          code: otpCode
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid 2FA code.');

      const authUser = data.user;
      const updatedProfile: UserProfile = {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        phone: authUser.phone || '',
        countryCode: authUser.countryCode || selectedCountry.code,
        city: authUser.city || 'Nairobi',
        streetAddress: 'Operations Headquarters',
        isRegistered: true,
        preferredLanguage: authUser.preferredLanguage || language,
      };

      if (data.token) {
        localStorage.setItem('dawa_auth_token', data.token);
        localStorage.setItem('dawa_user_id', authUser.id);
        localStorage.setItem('dawa_user_role', authUser.role);
      }

      onSaveProfile(updatedProfile, data.token);
      if (onSwitchRole) {
        onSwitchRole(authUser.role === 'super_admin' ? 'admin' : authUser.role);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '2FA verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch reset email.');

      setSuccessMsg(data.message || 'Password reset link sent.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Switch Preset Demo Accounts
  const handleQuickDemoSwitch = async (targetRole: UserRole) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        const u = data.user;
        const p: UserProfile = {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || '+254 700 000 000',
          countryCode: u.countryCode || selectedCountry.code,
          city: u.city || selectedCountry.sampleCity,
          streetAddress: u.streetAddress || 'DAWA Hub',
          isRegistered: true,
          preferredLanguage: language
        };
        if (data.token) {
          localStorage.setItem('dawa_auth_token', data.token);
          localStorage.setItem('dawa_user_id', u.id);
          localStorage.setItem('dawa_user_role', u.role);
        }
        onSaveProfile(p, data.token);
        if (onSwitchRole) onSwitchRole(targetRole);
        onClose();
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto" 
      id="auth-modal-backdrop"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#D8E2DC] my-auto"
        id="auth-modal-container"
      >
        {/* Modal Top Header */}
        <div className={`p-5 sm:p-6 relative text-white ${
          mode === 'admin' ? 'bg-[#081C15]' : 'bg-[#1B4332]'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-4 sm:top-5 end-4 sm:end-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            id="auth-modal-close-btn"
            aria-label={translate('close', language)}
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-[#74C69D] text-xs font-bold uppercase tracking-wider mb-1">
            {mode === 'admin' ? (
              <>
                <KeyRound className="w-4 h-4 text-[#D8F3DC]" />
                <span className="text-[#D8F3DC] font-black">2FA Clinical Security Portal</span>
              </>
            ) : mode === 'pharmacy_register' ? (
              <>
                <Building2 className="w-4 h-4 text-[#74C69D]" />
                <span>MOH Licensed Pharmacy Gate</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-[#74C69D]" />
                <span>DAWA MED Unified Health Access</span>
              </>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            {mode === 'login' && (translate('loginTitle', language) || 'Sign In to DAWA MED')}
            {mode === 'register' && (translate('registerTitle', language) || 'Create Patient Account')}
            {mode === 'admin' && (translate('adminPortalLogin', language) || 'Clinical Operations & Admin Portal')}
            {mode === 'pharmacy_register' && (translate('pharmacyPartnerRegister', language) || 'Register Licensed Pharmacy')}
            {mode === 'forgot_password' && (translate('forgotPassword', language) || 'Reset Password')}
          </h2>

          <p className="text-xs text-[#D8F3DC]/90 mt-1">
            {mode === 'admin' 
              ? (translate('adminLoginDesc', language) || 'Restricted administrative access with 2FA encryption.')
              : mode === 'pharmacy_register'
              ? 'Join Africa’s premier verified pharmacy dispensing network.'
              : 'Safe, cold-chain medication access across Africa.'}
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex items-center gap-1 mt-4 p-1 bg-white/10 rounded-2xl text-xs font-bold">
            <button
              onClick={() => { setMode('login'); setIs2FAStage(false); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer text-center ${
                mode === 'login' ? 'bg-white text-[#1B4332] shadow-xs' : 'text-[#D8F3DC] hover:bg-white/10'
              }`}
              id="auth-tab-login"
            >
              {translate('login', language) || 'Login'}
            </button>
            <button
              onClick={() => { setMode('register'); setIs2FAStage(false); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer text-center ${
                mode === 'register' ? 'bg-white text-[#1B4332] shadow-xs' : 'text-[#D8F3DC] hover:bg-white/10'
              }`}
              id="auth-tab-register"
            >
              {translate('register', language) || 'Register'}
            </button>
            <button
              onClick={() => { setMode('pharmacy_register'); setIs2FAStage(false); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer text-center truncate ${
                mode === 'pharmacy_register' ? 'bg-white text-[#1B4332] shadow-xs' : 'text-[#D8F3DC] hover:bg-white/10'
              }`}
              id="auth-tab-pharmacy"
            >
              {language === 'ar' ? 'صيدلية' : language === 'fr' ? 'Pharmacie' : 'Pharmacy'}
            </button>
            <button
              onClick={() => { setMode('admin'); setIs2FAStage(false); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer text-center ${
                mode === 'admin' ? 'bg-[#52B788] text-white shadow-xs' : 'text-[#D8F3DC] hover:bg-white/10'
              }`}
              id="auth-tab-admin"
            >
              {language === 'ar' ? 'الإدارة' : 'Admin'}
            </button>
          </div>
        </div>

        {/* Modal Form Content */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {/* Feedback messages */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 font-semibold" id="auth-error-banner">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-[#D8F3DC] border border-[#74C69D] rounded-2xl flex items-start gap-2.5 text-xs text-[#1B4332] font-semibold" id="auth-success-banner">
              <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
              <div>{successMsg}</div>
            </div>
          )}

          {/* Sandbox helper badge in development mode */}
          {sandboxCode && (
            <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
              <span>Demo 2FA / OTP Code: <strong className="font-mono text-sm tracking-widest text-amber-900">{sandboxCode}</strong></span>
              <button 
                type="button" 
                onClick={() => setOtpCode(sandboxCode)}
                className="px-2 py-0.5 bg-amber-200 hover:bg-amber-300 rounded-lg font-bold text-[11px] cursor-pointer"
              >
                Auto Fill
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. LOGIN FORM */}
          {/* ========================================================================= */}
          {mode === 'login' && !is2FAStage && (
            <form onSubmit={handleLogin} className="space-y-4" id="form-login">
              {/* Method Toggle: Password vs OTP */}
              <div className="flex items-center justify-center gap-2 p-1 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAuthMethod('password')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    authMethod === 'password' ? 'bg-[#2D6A4F] text-white shadow-xs' : 'text-[#1B4332] hover:bg-[#E8F5E9]'
                  }`}
                >
                  {translate('password', language) || 'Password Login'}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('otp')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    authMethod === 'otp' ? 'bg-[#2D6A4F] text-white shadow-xs' : 'text-[#1B4332] hover:bg-[#E8F5E9]'
                  }`}
                >
                  {language === 'ar' ? 'رمز SMS / واتساب' : 'SMS / OTP'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1.5">
                  {authMethod === 'password' ? (translate('emailAddress', language) + ' / ' + translate('phoneNumber', language)) : translate('phoneNumber', language)}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-[#2D6A4F]">
                    {authMethod === 'password' ? <Mail className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                  </div>
                  <input
                    type={authMethod === 'password' ? 'text' : 'tel'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={authMethod === 'password' ? 'grace@example.com or +254 700 000 000' : '+254 712 345 678'}
                    className="w-full ps-10 pe-4 py-2.5 sm:py-3 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-sm font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                    required
                    id="login-identifier-input"
                  />
                </div>
              </div>

              {authMethod === 'password' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#1B4332]">
                      {translate('password', language) || 'Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot_password')}
                      className="text-xs text-[#2D6A4F] hover:underline font-semibold cursor-pointer"
                      id="login-forgot-pwd-btn"
                    >
                      {translate('forgotPassword', language) || 'Forgot Password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-[#2D6A4F]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full ps-10 pe-10 py-2.5 sm:py-3 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-sm font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                      required
                      id="login-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#2D6A4F] hover:bg-[#1B4332] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-[#2D6A4F]/20 flex items-center justify-center gap-2 cursor-pointer"
                id="login-submit-btn"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{authMethod === 'password' ? (translate('login', language) || 'Sign In') : (translate('login', language) || 'Request Code')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-xs text-gray-600">
                <span>{translate('noAccount', language) || "Don't have an account?"} </span>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-[#2D6A4F] hover:underline cursor-pointer"
                >
                  {translate('register', language) || 'Register Now'}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 1.1 OTP VERIFICATION STAGE */}
          {/* ========================================================================= */}
          {mode === 'login' && is2FAStage && (
            <form onSubmit={handleVerifyOtpLogin} className="space-y-4" id="form-verify-otp">
              <div className="bg-[#F0F7F4] p-3.5 rounded-2xl border border-[#D8E2DC] text-xs text-[#1B4332]">
                <p className="font-semibold">Verification code sent to <strong className="text-[#2D6A4F]">{identifier}</strong></p>
                <p className="text-[11px] text-gray-500 mt-1">Enter the 6-digit code or test code <span className="font-bold font-mono text-[#1B4332]">123456</span></p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1.5 text-center">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center tracking-[0.4em] text-2xl font-black py-3 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                  required
                  id="login-otp-code-input"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIs2FAStage(false)}
                  className="px-4 py-3 bg-[#F8FAF9] hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  {translate('back', language) || 'Back'}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>{translate('verifyAndProceed', language) || 'Verify & Sign In'}</span>}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 2. CUSTOMER REGISTRATION FORM */}
          {/* ========================================================================= */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5" id="form-register">
              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1">
                  {translate('fullName', language) || 'Full Name'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-[#2D6A4F]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Grace Muthoni"
                    className="w-full ps-10 pe-4 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs sm:text-sm font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                    required
                    id="reg-name-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#1B4332] mb-1">
                    {translate('emailAddress', language) || 'Email Address'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-[#2D6A4F]">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="grace@example.com"
                      className="w-full ps-9 pe-3 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                      required
                      id="reg-email-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B4332] mb-1">
                    {translate('phoneNumber', language) || 'Phone Number'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-[#2D6A4F]">
                      <Smartphone className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254 712 345 678"
                      className="w-full ps-9 pe-3 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                      required
                      id="reg-phone-input"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#1B4332] mb-1">
                    {translate('password', language) || 'Password'}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full px-3 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                    required
                    id="reg-password-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B4332] mb-1">
                    {translate('confirmPassword', language) || 'Confirm Password'}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                    required
                    id="reg-confirm-password-input"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#1B4332]">
                    {translate('deliveryLocation', language) || 'Delivery Address'}
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2D6A4F] hover:underline cursor-pointer"
                  >
                    <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>Auto GPS Detect</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-[#2D6A4F]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="House 14B, Ole Odume Road, Kilimani"
                    className="w-full ps-10 pe-4 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs sm:text-sm font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                    required
                    id="reg-address-input"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-[#F0F7F4] rounded-xl text-[11px] text-[#1B4332] flex items-start gap-2 border border-[#D8E2DC]">
                <Shield className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
                <span>{translate('termsAgreementNotice', language)}</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#2D6A4F] hover:bg-[#1B4332] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-[#2D6A4F]/20 flex items-center justify-center gap-2 cursor-pointer"
                id="reg-submit-btn"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>{translate('register', language) || 'Create Account'}</span>}
              </button>

              <div className="text-center pt-1 text-xs text-gray-600">
                <span>{translate('haveAccount', language) || 'Already have an account?'} </span>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-[#2D6A4F] hover:underline cursor-pointer"
                >
                  {translate('login', language) || 'Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 3. PHARMACY PARTNER REGISTRATION */}
          {/* ========================================================================= */}
          {mode === 'pharmacy_register' && (
            <form onSubmit={handlePharmacyRegister} className="space-y-3.5" id="form-pharmacy-register">
              <div className="p-3 bg-[#D8F3DC]/40 border border-[#74C69D] rounded-2xl text-xs text-[#1B4332]">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Licensed Pharmacy Partner Application</span>
                </div>
                <p className="text-[11px] text-[#1B4332]/80">
                  {translate('pharmacyPendingNotice', language)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1">
                  Pharmacy Business Name
                </label>
                <input
                  type="text"
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                  placeholder="Apex Care Pharmaceuticals Ltd"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs sm:text-sm font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                  required
                  id="pharm-name-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#1B4332] mb-1">
                    {translate('superintendentPharmacist', language) || 'Superintendent Pharmacist'}
                  </label>
                  <input
                    type="text"
                    value={pharmacistName}
                    onChange={(e) => setPharmacistName(e.target.value)}
                    placeholder="Pharm. Dr. David Ochieng"
                    className="w-full px-3 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                    required
                    id="pharm-pharmacist-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B4332] mb-1">
                    {translate('pharmacyLicenseNumber', language) || 'License Number'}
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="PPB/RET/2026/0491"
                    className="w-full px-3 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none font-mono"
                    required
                    id="pharm-license-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#1B4332] mb-1">
                    {translate('emailAddress', language) || 'Business Email'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dispensing@apexcare.com"
                    className="w-full px-3 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                    required
                    id="pharm-email-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B4332] mb-1">
                    {translate('phoneNumber', language) || 'Phone / WhatsApp'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 700 111 222"
                    className="w-full px-3 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                    required
                    id="pharm-phone-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#1B4332] mb-1">
                    {translate('password', language) || 'Account Password'}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full px-3 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                    required
                    id="pharm-password-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B4332] mb-1">
                    {translate('confirmPassword', language) || 'Confirm Password'}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                    required
                    id="pharm-confirm-password-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#1B4332] hover:bg-[#081C15] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                id="pharm-submit-btn"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Submit Application for Audit</span>}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 4. ADMIN & OPERATIONS PORTAL (2FA ENFORCED) */}
          {/* ========================================================================= */}
          {mode === 'admin' && !is2FAStage && (
            <form onSubmit={handleAdminLogin} className="space-y-4" id="form-admin-login">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Restricted Administrative Gate</p>
                  <p className="text-[11px] text-amber-700/90">{translate('adminGateNotice', language)}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1.5">
                  Administrative Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-[#2D6A4F]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin@dawamed.com"
                    className="w-full ps-10 pe-4 py-2.5 sm:py-3 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-sm font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#1B4332] focus:outline-none"
                    required
                    id="admin-email-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1.5">
                  Administrative Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-[#2D6A4F]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full ps-10 pe-10 py-2.5 sm:py-3 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-sm font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#1B4332] focus:outline-none"
                    required
                    id="admin-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#081C15] hover:bg-[#1B4332] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                id="admin-login-submit-btn"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-[#74C69D]" />
                    <span>Authenticate & Request 2FA</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 4.1 ADMIN 2FA VERIFICATION STAGE */}
          {/* ========================================================================= */}
          {mode === 'admin' && is2FAStage && (
            <form onSubmit={handleVerifyAdmin2FA} className="space-y-4" id="form-verify-admin-2fa">
              <div className="bg-[#D8F3DC]/50 p-3.5 rounded-2xl border border-[#74C69D] text-xs text-[#1B4332]">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <KeyRound className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Two-Factor Authentication Challenge</span>
                </div>
                <p className="text-[11px] text-[#1B4332]/80">
                  {translate('twoFactorPrompt', language)}
                </p>
                <p className="text-[11px] text-[#2D6A4F] font-bold mt-1">Recipient: {maskedEmail}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1.5 text-center">
                  6-Digit Admin Security Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center tracking-[0.4em] text-2xl font-black py-3 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-[#1B4332] focus:ring-2 focus:ring-[#1B4332] focus:outline-none"
                  required
                  id="admin-2fa-code-input"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIs2FAStage(false)}
                  className="px-4 py-3 bg-[#F8FAF9] hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  {translate('back', language) || 'Back'}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-[#081C15] hover:bg-[#1B4332] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  id="admin-2fa-submit-btn"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>{translate('verifyAndProceed', language) || 'Verify & Open Portal'}</span>}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 5. FORGOT PASSWORD */}
          {/* ========================================================================= */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4" id="form-forgot-password">
              <div className="bg-[#F0F7F4] p-3.5 rounded-2xl border border-[#D8E2DC] text-xs text-[#1B4332]">
                <p className="font-semibold">Cryptographic Password Reset</p>
                <p className="text-[11px] text-gray-600 mt-1">
                  Enter your registered account email. A secure, single-use, 30-minute expiring reset link will be dispatched.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1.5">
                  {translate('emailAddress', language) || 'Registered Email'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-[#2D6A4F]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your-name@dawamed.com"
                    className="w-full ps-10 pe-4 py-3 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-sm font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                    required
                    id="forgot-email-input"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="px-4 py-3 bg-[#F8FAF9] hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  {translate('back', language) || 'Back'}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Dispatch Reset Link</span>}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* QUICK ROLE SWITCHER FOR DEMO / RBAC TESTING */}
          {/* ========================================================================= */}
          <div className="mt-6 pt-4 border-t border-[#D8E2DC]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#52B788]" />
                <span>{translate('switchRolePrompt', language) || 'Quick Demo Switch'}</span>
              </span>
              {profile?.isRegistered && onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('dawa_auth_token');
                    localStorage.removeItem('dawa_user_id');
                    localStorage.removeItem('dawa_user_role');
                    onLogout();
                    onClose();
                  }}
                  className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                  id="auth-signout-btn"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{translate('logout', language) || 'Sign Out'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleQuickDemoSwitch('customer')}
                className="py-1.5 px-2 bg-[#F0F7F4] hover:bg-[#D8F3DC] text-[#1B4332] rounded-xl text-center border border-[#D8E2DC] transition-colors cursor-pointer"
              >
                👤 Customer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoSwitch('pharmacy')}
                className="py-1.5 px-2 bg-[#F0F7F4] hover:bg-[#D8F3DC] text-[#1B4332] rounded-xl text-center border border-[#D8E2DC] transition-colors cursor-pointer"
              >
                🏥 Pharmacy
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoSwitch('driver')}
                className="py-1.5 px-2 bg-[#F0F7F4] hover:bg-[#D8F3DC] text-[#1B4332] rounded-xl text-center border border-[#D8E2DC] transition-colors cursor-pointer"
              >
                🛵 Driver
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoSwitch('admin')}
                className="py-1.5 px-2 bg-[#1B4332] hover:bg-[#081C15] text-white rounded-xl text-center transition-colors cursor-pointer"
              >
                🛡️ Admin Gate
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
