import React, { useState } from 'react';
import { 
  CountryConfig, 
  Language, 
  DawaMonthlySubscription, 
  UserProfile 
} from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard, 
  Smartphone, 
  Lock, 
  CalendarCheck, 
  BellRing, 
  RotateCcw, 
  Users, 
  Flame, 
  Receipt,
  HeartHandshake,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface DawaMonthlySubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry: CountryConfig;
  language: Language;
  userProfile?: UserProfile;
  currentSubscription?: DawaMonthlySubscription;
  onSubscribeSuccess: (subscription: DawaMonthlySubscription) => void;
}

export const DawaMonthlySubscribeModal: React.FC<DawaMonthlySubscribeModalProps> = ({
  isOpen,
  onClose,
  selectedCountry,
  language,
  userProfile,
  currentSubscription,
  onSubscribeSuccess,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [paymentType, setPaymentType] = useState<'mobile_money' | 'card' | 'apple_pay' | 'google_pay'>('mobile_money');
  const [mobileNumber, setMobileNumber] = useState(userProfile?.phone || '+254 712 345678');
  const [selectedMomoProvider, setSelectedMomoProvider] = useState(selectedCountry.mobileMoneyProviders[0] || 'M-Pesa');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(userProfile?.name || 'Grace Muthoni');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('892');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<string>('');

  if (!isOpen) return null;

  const priceUSD = 5.0;
  const localPrice = Math.round(priceUSD * selectedCountry.exchangeRateToUSD);

  const handleProcessCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      const receiptNo = `REC-DM-${Math.floor(100000 + Math.random() * 900000)}`;
      setGeneratedReceipt(receiptNo);

      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.5 }
        });
      } catch (e) {
        // ignore
      }

      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);

      const paymentTitle = paymentType === 'mobile_money'
        ? `${selectedMomoProvider} (${mobileNumber})`
        : paymentType === 'card'
        ? `Visa •••• ${cardNumber.slice(-4) || '4242'} (Tokenized)`
        : paymentType === 'apple_pay'
        ? 'Apple Pay (Tokenized Device Account)'
        : 'Google Pay (Tokenized Account)';

      const token = `tok_${paymentType}_${Math.random().toString(36).substring(2, 11)}`;

      const newSubscription: DawaMonthlySubscription = {
        id: `sub-dawa-${Date.now().toString().slice(-4)}`,
        userId: userProfile?.id || 'usr-grace-muthoni',
        userName: userProfile?.name || cardHolder || 'Grace Muthoni',
        userPhone: mobileNumber,
        planName: 'DAWA MED MONTHLY',
        priceUSD: 5.0,
        status: 'active',
        startDate: today.toISOString().split('T')[0],
        renewalDate: nextMonth.toISOString().split('T')[0],
        paymentMethod: {
          type: paymentType,
          title: paymentTitle,
          tokenizedId: token,
          gateway: `${selectedCountry.name} PCI-DSS Tokenized Switch`,
        },
        autoRenew: true,
        trialDaysLeft: 0,
        billingHistory: [
          {
            id: `bill-${Date.now()}`,
            date: today.toISOString().split('T')[0],
            amountUSD: 5.0,
            currency: 'USD',
            paymentMethod: paymentTitle,
            status: 'paid',
            receiptNumber: receiptNo,
          },
          ...(currentSubscription?.billingHistory || []),
        ],
      };

      onSubscribeSuccess(newSubscription);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto" id="subscribe-modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#D8E2DC] my-6"
        id="subscribe-modal-container"
      >
        {/* Modal Top Header */}
        <div className="bg-[#1B4332] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            id="subscribe-modal-close-btn"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#74C69D] text-[11px] font-bold border border-white/15 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DAWA MED MONTHLY</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {t.subHeroTitle}
          </h2>
          <p className="text-xs text-[#D8F3DC]/90 mt-1 leading-relaxed">
            {t.subHeroSubtitle}
          </p>

          <div className="mt-4 flex items-baseline gap-2 bg-[#2D6A4F]/60 p-3 rounded-2xl border border-[#52B788]/30">
            <span className="text-2xl font-black text-white">$5 USD</span>
            <span className="text-xs text-[#D8F3DC]">/ month</span>
            <span className="text-xs font-bold text-[#74C69D] ml-auto">
              ≈ {localPrice.toLocaleString()} {selectedCountry.currencySymbol} / mo
            </span>
          </div>
        </div>

        {/* Modal Body */}
        {!isSuccess ? (
          <form onSubmit={handleProcessCheckout} className="p-5 sm:p-6 space-y-5 text-xs">
            {/* Features Highlight */}
            <div className="grid grid-cols-2 gap-2 bg-[#F8FAF9] p-3 rounded-2xl border border-[#D8E2DC]">
              <div className="flex items-center gap-2 text-[#1B4332]">
                <BellRing className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span className="text-[11px] font-bold">Smart Medicine Reminders</span>
              </div>
              <div className="flex items-center gap-2 text-[#1B4332]">
                <RotateCcw className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span className="text-[11px] font-bold">Refill Expiry Warnings</span>
              </div>
              <div className="flex items-center gap-2 text-[#1B4332]">
                <Users className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span className="text-[11px] font-bold">Family Profiles</span>
              </div>
              <div className="flex items-center gap-2 text-[#1B4332]">
                <Flame className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span className="text-[11px] font-bold">Adherence Tracking</span>
              </div>
            </div>

            {/* Medical Disclaimer Rule */}
            <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-amber-900 flex items-start gap-2.5 leading-relaxed text-[11px]">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Important Notice:</strong> {t.subDisclaimer}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block font-bold text-[#1B4332] text-xs">
                {t.selectPayment} ($5.00 USD / {localPrice.toLocaleString()} {selectedCountry.currencySymbol})
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType('mobile_money')}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentType === 'mobile_money'
                      ? 'bg-[#E9F5EE] border-[#2D6A4F] text-[#1B4332] font-black ring-1 ring-[#2D6A4F]'
                      : 'bg-white border-[#D8E2DC] text-gray-600 hover:bg-[#F8FAF9]'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-[#2D6A4F]" />
                  <span className="text-[11px]">Mobile Money</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('card')}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentType === 'card'
                      ? 'bg-[#E9F5EE] border-[#2D6A4F] text-[#1B4332] font-black ring-1 ring-[#2D6A4F]'
                      : 'bg-white border-[#D8E2DC] text-gray-600 hover:bg-[#F8FAF9]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#2D6A4F]" />
                  <span className="text-[11px]">Bank Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('apple_pay')}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentType === 'apple_pay'
                      ? 'bg-[#E9F5EE] border-[#2D6A4F] text-[#1B4332] font-black ring-1 ring-[#2D6A4F]'
                      : 'bg-white border-[#D8E2DC] text-gray-600 hover:bg-[#F8FAF9]'
                  }`}
                >
                  <span className="text-xs font-black"> Pay</span>
                  <span className="text-[10px]">Apple Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('google_pay')}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentType === 'google_pay'
                      ? 'bg-[#E9F5EE] border-[#2D6A4F] text-[#1B4332] font-black ring-1 ring-[#2D6A4F]'
                      : 'bg-white border-[#D8E2DC] text-gray-600 hover:bg-[#F8FAF9]'
                  }`}
                >
                  <span className="text-xs font-black text-blue-600">G Pay</span>
                  <span className="text-[10px]">Google Pay</span>
                </button>
              </div>
            </div>

            {/* Method Details Input */}
            {paymentType === 'mobile_money' && (
              <div className="space-y-3 p-4 bg-[#F8FAF9] rounded-2xl border border-[#D8E2DC]">
                <div>
                  <label className="block font-bold text-[#1B4332] mb-1">Select Network Provider</label>
                  <select
                    value={selectedMomoProvider}
                    onChange={(e) => setSelectedMomoProvider(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E2DC] bg-white text-xs font-bold text-[#1B4332]"
                  >
                    {selectedCountry.mobileMoneyProviders.map((provider) => (
                      <option key={provider} value={provider}>{provider}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1B4332] mb-1">Mobile Money Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E2DC] bg-white text-xs text-[#1B4332] font-mono"
                    placeholder="+254 7XX XXX XXX"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">An instant push STK prompt will be triggered for monthly renewal approval.</p>
                </div>
              </div>
            )}

            {paymentType === 'card' && (
              <div className="space-y-3 p-4 bg-[#F8FAF9] rounded-2xl border border-[#D8E2DC]">
                <div>
                  <label className="block font-bold text-[#1B4332] mb-1">Cardholder Full Name</label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E2DC] bg-white text-xs"
                    placeholder="Grace Muthoni"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1B4332] mb-1">Card Number (Tokenized Simulation)</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E2DC] bg-white text-xs font-mono"
                    placeholder="4242 •••• •••• 4242"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-[#1B4332] mb-1">Expires (MM/YY)</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E2DC] bg-white text-xs font-mono"
                      placeholder="12/28"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1B4332] mb-1">CVV / CVC</label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E2DC] bg-white text-xs font-mono"
                      placeholder="•••"
                    />
                  </div>
                </div>

                {/* PCI Compliance Tokenization Note */}
                <div className="flex items-center gap-2 text-[10px] text-gray-500 pt-1">
                  <Lock className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                  <span>Card data is never stored locally; tokenized via PCI-DSS Vault.</span>
                </div>
              </div>
            )}

            {(paymentType === 'apple_pay' || paymentType === 'google_pay') && (
              <div className="p-4 bg-[#F8FAF9] rounded-2xl border border-[#D8E2DC] text-center space-y-2">
                <p className="text-xs text-[#1B4332] font-bold">
                  {paymentType === 'apple_pay' ? ' Apple Pay One-Touch' : 'Google Pay Fast Checkout'}
                </p>
                <p className="text-[11px] text-gray-600">
                  Authenticate securely using device biometrics (Face ID / Touch ID / Fingerprint).
                </p>
              </div>
            )}

            {/* Bottom Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                id="confirm-subscribe-btn"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing Tokenized Payment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#74C69D]" />
                    <span>{t.subscribeNow} ($5 USD / Month)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Success Screen */
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#1B4332]">Subscription Active!</h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                Welcome to <strong>DAWA MED MONTHLY</strong>. Your smart medicine reminders and chronic refill schedules are now active.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#D8E2DC] text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-gray-500">
                <span>Receipt Number:</span>
                <strong className="text-[#1B4332]">{generatedReceipt}</strong>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Plan:</span>
                <strong className="text-[#1B4332]">DAWA MED MONTHLY ($5.00/mo)</strong>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tokenized ID:</span>
                <strong className="text-[#2D6A4F]">tok_secure_{generatedReceipt.slice(-4)}</strong>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Renewal Date:</span>
                <strong className="text-[#1B4332]">
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Go to My Medication Reminders
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
