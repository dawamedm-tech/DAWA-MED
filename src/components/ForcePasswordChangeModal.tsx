import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, AlertTriangle, CheckCircle2, KeyRound, Loader2 } from 'lucide-react';
import { AuthUser, Language } from '../types';

interface ForcePasswordChangeModalProps {
  isOpen: boolean;
  currentUser?: AuthUser;
  language: Language;
  onSuccess: (updatedUser: AuthUser) => void;
}

export const ForcePasswordChangeModal: React.FC<ForcePasswordChangeModalProps> = ({
  isOpen,
  currentUser,
  language,
  onSuccess,
}) => {
  const isRtl = language === 'ar';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasLetters = /[a-zA-Z]/.test(newPassword);
  const hasNumbers = /[0-9]/.test(newPassword);
  const notAdmin = newPassword.trim().toLowerCase() !== 'admin';
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid = hasMinLength && hasLetters && hasNumbers && notAdmin && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!hasMinLength) {
      setErrorMsg(isRtl ? 'كلمة المرور يجب أن لا تقل عن 8 أحرف.' : 'Password must be at least 8 characters long.');
      return;
    }

    if (!notAdmin) {
      setErrorMsg(isRtl ? 'لا يمكن استخدام كلمة المرور الأولية القديمة. يرجى اختيار كلمة مرور قوية.' : 'Cannot use the initial temporary password. Please choose a strong password.');
      return;
    }

    if (!hasLetters || !hasNumbers) {
      setErrorMsg(isRtl ? 'كلمة المرور يجب أن تحتوي على أحرف وأرقام معًا.' : 'Password must contain both letters and numbers.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMsg(isRtl ? 'كلمة المرور وتأكيدها غير متطابقين.' : 'New password and confirmation do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('dawa_auth_token');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          currentPassword: '',
          newPassword,
          confirmPassword
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || (isRtl ? 'فشل تحديث كلمة المرور.' : 'Failed to update password.'));
      }

      // Update stored session if provided
      const updatedUser: AuthUser = data.user || {
        ...(currentUser || {} as AuthUser),
        mustChangePassword: false
      };

      onSuccess(updatedUser);
    } catch (err: any) {
      setErrorMsg(err.message || (isRtl ? 'حدث خطأ أثناء تحديث كلمة المرور.' : 'An error occurred while updating password.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="force-password-change-overlay"
      className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        id="force-password-change-card"
        className="w-full max-w-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        {/* Top Header Badge */}
        <div className="bg-[#1B4332] px-6 py-5 text-white flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
            <KeyRound className="w-5 h-5 text-[#E8F5EE]" />
          </div>
          <div>
            <h2 className="text-[17px] font-bold tracking-tight text-white">
              {isRtl ? 'تحديث أمني إلزامي للحساب' : 'Mandatory Security Update'}
            </h2>
            <p className="text-xs text-[#E8F5EE]/80 mt-0.5">
              {isRtl ? 'نظام الحماية والمصادقة الإدارية — DAWA MED' : 'Administrative Protection & Auth — DAWA MED'}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Explicit User Prompt Message */}
          <div
            id="force-password-required-notice"
            className="p-3.5 rounded-xl bg-[#E8F5EE] border border-[#0E7A4B]/20 text-[#1B4332] text-[13px] leading-relaxed flex items-start gap-2.5 font-medium"
          >
            <ShieldCheck className="w-5 h-5 text-[#0E7A4B] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#0E7A4B]">
                {isRtl ? 'لأمان حسابك، يجب تغيير كلمة المرور قبل متابعة استخدام لوحة الإدارة.' : 'For your account security, you must change your password before continuing to use the Admin Dashboard.'}
              </p>
              <p className="text-[11px] text-[#1B4332]/80 mt-1">
                {isRtl
                  ? 'تم تسجيل الدخول بكلمة المرور الأولية المؤقتة. يجب إنشاء كلمة مرور قوية خاصة بك لإلغاء قفل لوحة الإدارة.'
                  : 'You have logged in with the initial temporary password. You must establish a strong private password to unlock the Admin Dashboard.'}
              </p>
            </div>
          </div>

          {/* Account Indicator */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#EAF1FC] border border-[#DFE8F6] text-xs">
            <span className="text-[#6B7280]">
              {isRtl ? 'الحساب الإداري:' : 'Admin Account:'}
            </span>
            <span className="font-semibold text-[#111827] font-mono">
              {currentUser?.email || 'dawa.med.m@gmail.com'}
            </span>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div
              id="password-change-error"
              className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#E91E4D] text-xs flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* New Password Input */}
          <div>
            <label
              htmlFor="new-admin-password"
              className="block text-[12px] font-semibold text-[#111827] mb-1.5"
            >
              {isRtl ? 'كلمة المرور الجديدة' : 'New Password'}
            </label>
            <div className="relative w-full h-[42px]">
              <div className="absolute start-3.5 top-1/2 -translate-y-1/2 text-[#8FA3BF] pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="new-admin-password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="••••••••••••"
                className="w-full h-[42px] bg-[#EAF1FC] rounded-xl border border-[#DFE8F6] focus:border-[#0E7A4B] focus:ring-1 focus:ring-[#0E7A4B] outline-none ps-10 pe-10 text-[13px] text-[#111827] placeholder:text-[#94A3B8] transition-all"
                dir="ltr"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute end-3.5 top-1/2 -translate-y-1/2 text-[#8FA3BF] hover:text-[#475569] p-0.5 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label
              htmlFor="confirm-admin-password"
              className="block text-[12px] font-semibold text-[#111827] mb-1.5"
            >
              {isRtl ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
            </label>
            <div className="relative w-full h-[42px]">
              <div className="absolute start-3.5 top-1/2 -translate-y-1/2 text-[#8FA3BF] pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirm-admin-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="••••••••••••"
                className="w-full h-[42px] bg-[#EAF1FC] rounded-xl border border-[#DFE8F6] focus:border-[#0E7A4B] focus:ring-1 focus:ring-[#0E7A4B] outline-none ps-10 pe-10 text-[13px] text-[#111827] placeholder:text-[#94A3B8] transition-all"
                dir="ltr"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute end-3.5 top-1/2 -translate-y-1/2 text-[#8FA3BF] hover:text-[#475569] p-0.5 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Security Rules Checklist */}
          <div className="bg-[#F8FAFC] rounded-xl p-3 border border-gray-200 text-xs space-y-1.5">
            <p className="font-semibold text-[#475569] text-[11px] mb-1">
              {isRtl ? 'معايير أمان كلمة المرور:' : 'Password Security Requirements:'}
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-[#0E7A4B] font-medium' : 'text-[#64748B]'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${hasMinLength ? 'text-[#0E7A4B]' : 'text-gray-300'}`} />
                <span>{isRtl ? '8 أحرف على الأقل' : 'At least 8 chars'}</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasLetters && hasNumbers ? 'text-[#0E7A4B] font-medium' : 'text-[#64748B]'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${hasLetters && hasNumbers ? 'text-[#0E7A4B]' : 'text-gray-300'}`} />
                <span>{isRtl ? 'أحرف وأرقام معًا' : 'Letters & numbers'}</span>
              </div>
              <div className={`flex items-center gap-1.5 ${notAdmin ? 'text-[#0E7A4B] font-medium' : 'text-[#E91E4D]'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${notAdmin && newPassword ? 'text-[#0E7A4B]' : 'text-gray-300'}`} />
                <span>{isRtl ? 'ليست كلمة admin' : 'Not temporary "admin"'}</span>
              </div>
              <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-[#0E7A4B] font-medium' : 'text-[#64748B]'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${passwordsMatch ? 'text-[#0E7A4B]' : 'text-gray-300'}`} />
                <span>{isRtl ? 'تطابق كلمتي المرور' : 'Passwords match'}</span>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            id="submit-force-password-change-btn"
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full h-[44px] bg-[#0E7A4B] hover:bg-[#0B6840] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isRtl ? 'جارٍ الحفظ وتأمين الحساب...' : 'Saving & securing account...'}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{isRtl ? 'حفظ كلمة المرور ومتابعة الدخول' : 'Save Password & Continue'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
