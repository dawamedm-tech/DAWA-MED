import React, { useState } from 'react';
import { 
  MedicineReminder, 
  Language, 
  CountryConfig 
} from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  Bell, 
  Check, 
  Clock, 
  AlertCircle, 
  RotateCcw, 
  ShieldAlert, 
  ChevronRight, 
  Sparkles,
  Pill,
  X,
  Repeat
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface LiveReminderBannerProps {
  activeReminder: MedicineReminder | null;
  onMarkTaken: (reminderId: string) => void;
  onSnooze: (reminderId: string, minutes: number) => void;
  onSkip: (reminderId: string, reason?: string) => void;
  onRequestRefill: (reminder: MedicineReminder) => void;
  language: Language;
  selectedCountry: CountryConfig;
}

export const LiveReminderBanner: React.FC<LiveReminderBannerProps> = ({
  activeReminder,
  onMarkTaken,
  onSnooze,
  onSkip,
  onRequestRefill,
  language,
  selectedCountry,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [showSkipModal, setShowSkipModal] = useState(false);
  const [skipReason, setSkipReason] = useState('Feeling unwell / Doctor advice');
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!activeReminder || isDismissed) return null;

  const isLowPills = activeReminder.remainingQuantity <= activeReminder.refillReminderDaysBefore || activeReminder.remainingQuantity <= 6;

  const handleTaken = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.2 }
      });
    } catch (e) {
      // ignore
    }
    onMarkTaken(activeReminder.id);
  };

  const handleConfirmSkip = () => {
    onSkip(activeReminder.id, skipReason);
    setShowSkipModal(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full bg-[#1B4332] text-white border-b-2 border-[#52B788] shadow-lg sticky top-[57px] z-30 px-3 sm:px-6 py-3"
        id="dawa-live-reminder-banner"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Dose Announcement & Medicine Details */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#52B788] text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
              <Bell className="w-5 h-5" />
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/20 text-[#D8F3DC]">
                  {t.dawaReminderTitle}
                </span>
                <span className="text-[11px] font-bold text-[#74C69D]">
                  {activeReminder.reminderTimes[0] || 'Scheduled Time'}
                </span>
                <span className="text-[10px] text-white/70 px-2 py-0.5 rounded-full bg-white/10">
                  {activeReminder.familyMember}
                </span>
              </div>

              <div className="flex flex-wrap items-baseline gap-2">
                <h4 className="text-sm font-black text-white truncate">
                  {activeReminder.privacyHideName ? 'Scheduled Medication (Privacy Shield)' : activeReminder.medicineName}
                </h4>
                <span className="text-xs text-[#D8F3DC]/80 hidden sm:inline">
                  — {activeReminder.dosageInstructions}
                </span>
              </div>

              <p className="text-[11px] text-[#D8F3DC]/90 sm:hidden">
                {activeReminder.dosageInstructions}
              </p>
            </div>
          </div>

          {/* Right: Interactive Action Buttons (Taken, Snooze, Skip, Request Refill) */}
          <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
            {/* Low Pill Warning & One-Tap Reorder */}
            {isLowPills && (
              <button
                onClick={() => onRequestRefill(activeReminder)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                title="Only a few doses remaining. Request verified pharmacy refill."
                id="reminder-request-refill-btn"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>{t.requestRefill} ({activeReminder.remainingQuantity} pills left)</span>
              </button>
            )}

            {/* Taken Button */}
            <button
              onClick={handleTaken}
              className="px-4 py-1.5 rounded-xl bg-[#52B788] hover:bg-[#74C69D] text-white font-black text-xs shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              id="reminder-mark-taken-btn"
            >
              <Check className="w-4 h-4" />
              <span>{t.taken}</span>
            </button>

            {/* Snooze Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setSnoozeOpen(!snoozeOpen)}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
                id="reminder-snooze-btn"
              >
                <Clock className="w-3.5 h-3.5 text-[#74C69D]" />
                <span>{t.snooze}</span>
              </button>

              {snoozeOpen && (
                <div className="absolute right-0 bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-2 w-36 bg-white text-[#1B4332] rounded-2xl shadow-xl border border-[#D8E2DC] p-1.5 z-40 text-xs font-bold space-y-1">
                  <button
                    onClick={() => {
                      onSnooze(activeReminder.id, 15);
                      setSnoozeOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#F0F7F4] flex items-center justify-between cursor-pointer"
                  >
                    <span>15 Minutes</span>
                    <span className="text-[10px] text-gray-400">15m</span>
                  </button>
                  <button
                    onClick={() => {
                      onSnooze(activeReminder.id, 30);
                      setSnoozeOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#F0F7F4] flex items-center justify-between cursor-pointer"
                  >
                    <span>30 Minutes</span>
                    <span className="text-[10px] text-gray-400">30m</span>
                  </button>
                  <button
                    onClick={() => {
                      onSnooze(activeReminder.id, 60);
                      setSnoozeOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#F0F7F4] flex items-center justify-between cursor-pointer"
                  >
                    <span>1 Hour</span>
                    <span className="text-[10px] text-gray-400">1h</span>
                  </button>
                </div>
              )}
            </div>

            {/* Skip Button */}
            <button
              onClick={() => setShowSkipModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white font-bold text-xs transition-colors cursor-pointer"
              id="reminder-skip-btn"
            >
              <span>{t.skip}</span>
            </button>

            {/* Dismiss banner */}
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-white/60 hover:text-white"
              title="Hide banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Skip Reason Modal */}
        {showSkipModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs text-[#1B4332]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#D8E2DC] space-y-4 text-xs"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-[#1B4332]">Log Skipped Dose</h4>
                <button onClick={() => setShowSkipModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-gray-600 text-[11px] leading-relaxed">
                Skipping this dose will be logged in your adherence history for your healthcare review.
              </p>

              <div>
                <label className="block font-bold text-[#1B4332] mb-1">Reason for skipping</label>
                <select
                  value={skipReason}
                  onChange={(e) => setSkipReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D8E2DC] bg-white font-bold text-xs text-[#1B4332]"
                >
                  <option value="Doctor/Pharmacist advised pause">Doctor/Pharmacist advised pause</option>
                  <option value="Fasting / Medical test">Fasting / Medical test</option>
                  <option value="Medicine temporarily unavailable">Medicine temporarily unavailable</option>
                  <option value="Experiencing side effect">Experiencing side effect</option>
                  <option value="Other personal reason">Other personal reason</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSkipModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-[#D8E2DC] bg-gray-50 hover:bg-gray-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSkip}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Confirm Skip
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
