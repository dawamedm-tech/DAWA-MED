import React, { useState } from 'react';
import { 
  UserReferralStats, 
  ReferralSystemConfig, 
  Language, 
  CountryConfig 
} from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  X, 
  Gift, 
  Share2, 
  Copy, 
  Check, 
  Users, 
  Sparkles, 
  Award, 
  ShieldCheck,
  MessageCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userReferral: UserReferralStats;
  referralConfig: ReferralSystemConfig;
  language: Language;
  selectedCountry: CountryConfig;
}

export const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  isOpen,
  onClose,
  userReferral,
  referralConfig,
  language,
  selectedCountry,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(userReferral.inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Join me on DAWA MED for safe medicine delivery and monthly smart reminders! Use my referral code ${userReferral.referralCode} to get started: ${userReferral.inviteLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto" id="invite-friends-modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#E8F5EE] my-6"
        id="invite-friends-modal-container"
      >
        {/* Header */}
        <div className="bg-[#0E7A4B] text-white p-6 relative text-center space-y-2">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-[#0E7A4B] text-white flex items-center justify-center mx-auto shadow-md">
            <Gift className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-black tracking-tight text-white">
            {t.inviteFriends}
          </h2>
          <p className="text-xs text-white/80/90 max-w-xs mx-auto">
            Share the gift of punctual medicine reminders and safe delivery with your family and friends across Africa.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Status Alert if feature is preview or enabled */}
          {!referralConfig.isEnabledByAdmin ? (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Referral Rewards Architecture:</strong> The referral system is pre-configured and ready. Track your invites below. Admin activates promotional reward months dynamically.
              </span>
            </div>
          ) : (
            <div className="p-3.5 bg-[#F1FAF4] rounded-2xl border border-[#D0EADB] text-[#111827] text-[11px] leading-relaxed flex items-start gap-2">
              <Award className="w-4 h-4 text-[#0E7A4B] shrink-0 mt-0.5" />
              <span>
                <strong>Active Reward:</strong> Earn <strong>{referralConfig.freeMonthsPerInvite} Free Month</strong> of DAWA MED MONTHLY for every friend who subscribes!
              </span>
            </div>
          )}

          {/* Referral Code Box */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#111827]">Your Unique Referral Code</label>
            <div className="flex items-center justify-between p-3.5 bg-[#F1FAF4] rounded-2xl border border-[#E8F5EE]">
              <span className="text-base font-black text-[#111827] tracking-wider font-mono">
                {userReferral.referralCode}
              </span>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="py-3 px-4 rounded-2xl bg-[#F1FAF4] hover:bg-[#E8F5EE] text-[#111827] font-bold text-xs border border-[#E8F5EE] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-[#0E7A4B]" />
              <span>Copy Direct Link</span>
            </button>
          </div>

          {/* Referral Statistics */}
          <div className="grid grid-cols-3 gap-2 text-center pt-2">
            <div className="p-3 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE]">
              <p className="text-[10px] text-gray-500 font-bold uppercase">Invited</p>
              <p className="text-base font-black text-[#111827]">{userReferral.totalInvited}</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE]">
              <p className="text-[10px] text-gray-500 font-bold uppercase">Subscribed</p>
              <p className="text-base font-black text-[#0E7A4B]">{userReferral.activeSubscribers}</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE]">
              <p className="text-[10px] text-gray-500 font-bold uppercase">Free Months</p>
              <p className="text-base font-black text-amber-600">{userReferral.freeMonthsEarned}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
