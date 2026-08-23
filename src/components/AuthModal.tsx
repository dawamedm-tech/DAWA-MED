import React, { useState } from 'react';
import { UserProfile, CountryConfig, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
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
  LocateFixed
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
  currentProfile?: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  selectedCountry: CountryConfig;
  language: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  currentProfile,
  onSaveProfile,
  selectedCountry,
  language,
}) => {
  const profile = userProfile || currentProfile || {
    id: 'user-default',
    name: 'Grace Muthoni',
    phone: '+254 712 345 678',
    countryCode: selectedCountry.code,
    city: selectedCountry.sampleCity,
    streetAddress: 'House 14B, Ole Odume Road, Kilimani',
    isRegistered: false,
    preferredLanguage: language,
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [step, setStep] = useState<'phone' | 'otp' | 'details'>(
    profile.isRegistered ? 'details' : 'phone'
  );
  const [phone, setPhone] = useState(profile.phone || '+254 712 345 678');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState(profile.name || 'Grace Muthoni');
  const [city, setCity] = useState(profile.city || selectedCountry.sampleCity);
  const [streetAddress, setStreetAddress] = useState(profile.streetAddress || 'House 14B, Ole Odume Road, Kilimani');
  const [isLocating, setIsLocating] = useState(false);
  const [gpsData, setGpsData] = useState(profile.gpsLocation);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 7) {
      setErrorMsg('Please enter a valid mobile number');
      return;
    }
    setErrorMsg('');
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4 && otp !== '1234') {
      setErrorMsg('Please enter the 4-digit code (Use demo code: 1234)');
      return;
    }
    setErrorMsg('');
    setStep('details');
  };

  const handleDetectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            areaName: `${selectedCountry.sampleCity} Center (Live GPS)`,
          };
          setGpsData(coords);
        },
        () => {
          setIsLocating(false);
          // Fallback simulation
          setGpsData({
            lat: -1.2981,
            lng: 36.7825,
            areaName: `${selectedCountry.sampleCity} (GPS Fixed)`,
          });
        }
      );
    } else {
      setIsLocating(false);
      setGpsData({
        lat: -1.2981,
        lng: 36.7825,
        areaName: `${selectedCountry.sampleCity} (Simulated GPS)`,
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      id: profile.id || `usr-${Date.now()}`,
      name,
      phone,
      countryCode: selectedCountry.code,
      city,
      streetAddress,
      isRegistered: true,
      gpsLocation: gpsData,
      preferredLanguage: language,
    };
    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="auth-modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#D8E2DC]"
        id="auth-modal-container"
      >
        {/* Header */}
        <div className="bg-[#1B4332] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 end-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            id="auth-modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-[#74C69D] text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>DAWA Secure Patient ID</span>
          </div>
          <h2 className="text-xl font-black text-white">{t.authModalTitle}</h2>
          <p className="text-xs text-[#D8F3DC] mt-1">{t.authSubtitle}</p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'phone' && (
              <motion.form
                key="step-phone"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSendOtp}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-[#1B4332] mb-1.5">
                    {t.phoneNumberLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-gray-400">
                      <Smartphone className="w-4 h-4 text-[#2D6A4F]" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254 712 345 678"
                      className="w-full ps-10 pe-4 py-3 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-sm font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                      required
                      id="auth-phone-input"
                    />
                  </div>
                  <p className="text-[11px] text-[#2D6A4F] mt-1.5 flex items-center gap-1 font-medium">
                    <Lock className="w-3 h-3" />
                    <span>Instant SMS code for passwordless sign-in</span>
                  </p>
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                  id="auth-send-otp-btn"
                >
                  <span>{t.loginBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            )}

            {step === 'otp' && (
              <motion.form
                key="step-otp"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleVerifyOtp}
                className="space-y-4"
              >
                <div className="bg-[#F0F7F4] p-3.5 rounded-xl border border-[#D8E2DC] text-xs text-[#1B4332]">
                  <p className="font-semibold">{t.otpSentNotice} <strong className="text-[#2D6A4F]">{phone}</strong></p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Enter code <span className="font-bold text-[#1B4332]">1234</span> or your SMS pin</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B4332] mb-1.5">
                    {t.otpLabel}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="1234"
                    className="w-full text-center tracking-[0.5em] text-2xl font-black py-3 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                    required
                    id="auth-otp-input"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="px-4 py-3 bg-[#F8FAF9] hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
                  >
                    {t.back}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                    id="auth-verify-otp-btn"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.verifyOtp || 'Verify & Continue'}</span>
                  </button>
                </div>
              </motion.form>
            )}

            {step === 'details' && (
              <motion.form
                key="step-details"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSave}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-xs font-bold text-[#1B4332] mb-1">
                    {t.fullNameLabel}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Grace Muthoni"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                    required
                    id="auth-name-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#1B4332] mb-1">
                      {t.countryLabel}
                    </label>
                    <input
                      type="text"
                      value={`${selectedCountry.flag} ${selectedCountry.name}`}
                      disabled
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1B4332] mb-1">
                      {t.cityLabel}
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Nairobi"
                      className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B4332] mb-1">
                    {t.streetAddress}
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="e.g. House 14B, Ole Odume Road"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D8E2DC] rounded-xl text-xs font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                    required
                  />
                </div>

                {/* GPS Location (Optional) */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#1B4332] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>{t.gpsLocationLabel}</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      className="text-[11px] font-bold text-[#2D6A4F] hover:text-[#1B4332] inline-flex items-center gap-1 cursor-pointer"
                      id="auth-detect-gps-btn"
                    >
                      {isLocating ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <LocateFixed className="w-3 h-3" />
                      )}
                      <span>{isLocating ? 'Locating...' : t.detectGpsBtn}</span>
                    </button>
                  </div>
                  {gpsData ? (
                    <div className="p-2 bg-[#F0F7F4] border border-[#D8E2DC] rounded-xl text-[11px] text-[#2D6A4F] flex items-center justify-between">
                      <span className="truncate font-medium">{gpsData.areaName || `${gpsData.lat.toFixed(4)}, ${gpsData.lng.toFixed(4)}`}</span>
                      <span className="px-1.5 py-0.5 bg-[#74C69D]/30 text-[#1B4332] font-black rounded-md text-[9px]">GPS PINNED</span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-500">Auto-detect coordinates for exact rider dispatch.</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
                    id="auth-save-profile-btn"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{profile.isRegistered ? 'Update Patient Profile' : t.registerBtn}</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
