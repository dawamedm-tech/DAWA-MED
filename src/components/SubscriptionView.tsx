import React, { useState } from 'react';
import { 
  ChronicSubscription, 
  MedicineReminder, 
  DawaMonthlySubscription, 
  Language, 
  CountryConfig, 
  Medicine, 
  UserProfile,
  UserReferralStats,
  ReferralSystemConfig
} from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  CalendarCheck, 
  Bell, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  Heart, 
  Award,
  Zap,
  Activity,
  AlertCircle,
  Pill,
  RotateCcw,
  CreditCard,
  Smartphone,
  EyeOff,
  Users,
  Gift,
  Check,
  AlertTriangle,
  FileText,
  Repeat,
  History,
  Trash2,
  Edit3,
  Flame,
  ChevronRight,
  Shield
} from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { DawaMonthlySubscribeModal } from './DawaMonthlySubscribeModal';
import { AddMedicineModal } from './AddMedicineModal';
import { InviteFriendsModal } from './InviteFriendsModal';

interface SubscriptionViewProps {
  subscriptions: ChronicSubscription[];
  dawaSubscription?: DawaMonthlySubscription;
  medicineReminders: MedicineReminder[];
  onUpdateDawaSubscription: (sub: DawaMonthlySubscription) => void;
  onAddReminder: (reminder: MedicineReminder) => void;
  onUpdateReminder: (reminder: MedicineReminder) => void;
  onDeleteReminder: (reminderId: string) => void;
  onMarkTaken: (reminderId: string) => void;
  onSnooze: (reminderId: string, minutes: number) => void;
  onSkip: (reminderId: string, reason?: string) => void;
  onRequestRefill: (reminder: MedicineReminder) => void;
  language: Language;
  selectedCountry: CountryConfig;
  availableMedicines?: Medicine[];
  userProfile?: UserProfile;
  userReferral?: UserReferralStats;
  referralConfig?: ReferralSystemConfig;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({
  subscriptions,
  dawaSubscription,
  medicineReminders,
  onUpdateDawaSubscription,
  onAddReminder,
  onUpdateReminder,
  onDeleteReminder,
  onMarkTaken,
  onSnooze,
  onSkip,
  onRequestRefill,
  language,
  selectedCountry,
  availableMedicines = [],
  userProfile,
  userReferral,
  referralConfig,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [activeTab, setActiveTab] = useState<'reminders' | 'my_subscription' | 'adherence_history' | 'features'>('reminders');
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState<string>('all');
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<MedicineReminder | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);

  const localPrice = Math.round(5.0 * selectedCountry.exchangeRateToUSD);
  const isSubscribed = dawaSubscription && (dawaSubscription.status === 'active' || dawaSubscription.status === 'trial');

  // Filter reminders by family member
  const filteredReminders = medicineReminders.filter((rem) => {
    if (selectedFamilyFilter === 'all') return true;
    return rem.familyMember.toLowerCase().includes(selectedFamilyFilter.toLowerCase());
  });

  // Calculate adherence rate
  const totalLogs = medicineReminders.reduce((acc, r) => acc + r.history.length, 0);
  const takenLogs = medicineReminders.reduce(
    (acc, r) => acc + r.history.filter((h) => h.action === 'taken').length,
    0
  );
  const adherencePercent = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 96;

  // Family profile distinct list
  const familyProfilesList = Array.from(new Set(medicineReminders.map((r) => r.familyMember)));

  const handleToggleCancelSubscription = () => {
    if (!dawaSubscription) return;
    const updated: DawaMonthlySubscription = {
      ...dawaSubscription,
      status: dawaSubscription.status === 'active' ? 'cancelled' : 'active',
      autoRenew: dawaSubscription.status !== 'active',
    };
    onUpdateDawaSubscription(updated);
    setShowCancelConfirmModal(false);
  };

  const getStatusBadge = (status: DawaMonthlySubscription['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-[#E8F5EE] text-[#0E7A4B] border border-[#D0EADB] inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0E7A4B] animate-pulse" />
            Active Subscription
          </span>
        );
      case 'trial':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-300 inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            14-Day Free Trial
          </span>
        );
      case 'payment_failed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300 inline-flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Payment Failed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-gray-100 text-gray-700 border border-gray-300 inline-flex items-center gap-1.5">
            Cancelled (Grace Period Active)
          </span>
        );
      case 'expired':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1.5">
            Expired
          </span>
        );
    }
  };

  return (
    <div className="space-y-6" id="subscription-view-root">
      {/* 1. Hero Header Banner */}
      <div className="bg-[#0E7A4B] text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#0B6B43] relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-black border border-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DAWA MED MONTHLY</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-white/80 text-xs font-bold border border-emerald-400/30">
              $5 USD / month (≈ {localPrice.toLocaleString()} {selectedCountry.currencySymbol})
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {t.subHeroTitle}
          </h1>

          <p className="text-xs sm:text-sm text-white/80/90 leading-relaxed max-w-2xl">
            {t.subHeroSubtitle}
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {!isSubscribed ? (
              <button
                onClick={() => setShowSubscribeModal(true)}
                className="px-6 py-3 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-[#111827] font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                id="hero-subscribe-now-btn"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.subscribeNow} ($5 / month)</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('my_subscription')}
                className="px-5 py-2.5 rounded-2xl bg-white text-[#111827] font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4 text-[#0E7A4B]" />
                <span>{t.mySubscription} ({dawaSubscription?.status.toUpperCase()})</span>
              </button>
            )}

            <button
              onClick={() => {
                setEditingReminder(null);
                setShowAddMedicineModal(true);
              }}
              className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/20 transition-colors flex items-center gap-2 cursor-pointer"
              id="hero-add-medicine-btn"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addMedicine}</span>
            </button>

            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 font-bold text-xs border border-white/15 transition-colors flex items-center gap-2 cursor-pointer"
              id="hero-invite-friends-btn"
            >
              <Gift className="w-4 h-4 text-emerald-400" />
              <span>{t.inviteFriends}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Medical Clarification & Legal Disclaimer */}
      <div className="p-4 rounded-3xl bg-[#F1FAF4] border border-[#D0EADB] text-[#111827] flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-[#0E7A4B] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-[#111827]">
            Medical Responsibility & Dosage Notice
          </h4>
          <p className="text-[#111827]/80 leading-relaxed">
            {t.subDisclaimer}
          </p>
        </div>
      </div>

      {/* 3. Section Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8F5EE] pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'reminders'
                ? 'bg-[#0E7A4B] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-[#F1FAF4] border border-[#E8F5EE]'
            }`}
            id="tab-reminders"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Medication Schedules ({medicineReminders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('my_subscription')}
            className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'my_subscription'
                ? 'bg-[#0E7A4B] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-[#F1FAF4] border border-[#E8F5EE]'
            }`}
            id="tab-my-subscription"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{t.mySubscription}</span>
          </button>

          <button
            onClick={() => setActiveTab('adherence_history')}
            className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'adherence_history'
                ? 'bg-[#0E7A4B] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-[#F1FAF4] border border-[#E8F5EE]'
            }`}
            id="tab-adherence-history"
          >
            <History className="w-3.5 h-3.5" />
            <span>{t.medicationHistory}</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'features'
                ? 'bg-[#0E7A4B] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-[#F1FAF4] border border-[#E8F5EE]'
            }`}
            id="tab-features"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Included Features (14)</span>
          </button>
        </div>

        <button
          onClick={() => {
            setEditingReminder(null);
            setShowAddMedicineModal(true);
          }}
          className="px-4 py-2 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addMedicine}</span>
        </button>
      </div>

      {/* 4. Tab 1: Medication Schedules & Reminders */}
      {activeTab === 'reminders' && (
        <div className="space-y-6">
          {/* Family Profiles Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5 shrink-0">
              <Users className="w-3.5 h-3.5 text-[#0E7A4B]" />
              <span>Profiles:</span>
            </span>

            <button
              onClick={() => setSelectedFamilyFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedFamilyFilter === 'all'
                  ? 'bg-[#0E7A4B] text-white'
                  : 'bg-white text-gray-600 border border-[#E8F5EE] hover:bg-gray-50'
              }`}
            >
              All Family ({medicineReminders.length})
            </button>

            {familyProfilesList.map((member) => (
              <button
                key={member}
                onClick={() => setSelectedFamilyFilter(member)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedFamilyFilter === member
                    ? 'bg-[#0E7A4B] text-white'
                    : 'bg-white text-gray-600 border border-[#E8F5EE] hover:bg-gray-50'
                }`}
              >
                {member}
              </button>
            ))}
          </div>

          {/* Grid Layout: Reminders List & Adherence Dashboard Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Reminders List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredReminders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#E8F5EE] p-10 text-center space-y-3">
                  <Pill className="w-10 h-10 text-[#0E7A4B] mx-auto opacity-40" />
                  <h3 className="text-sm font-black text-[#111827]">No medicines scheduled</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Add your prescribed medication schedules to receive daily dose alerts and refill reminders.
                  </p>
                  <button
                    onClick={() => setShowAddMedicineModal(true)}
                    className="px-5 py-2.5 rounded-2xl bg-[#0E7A4B] text-white font-bold text-xs"
                  >
                    + Add Prescribed Medicine
                  </button>
                </div>
              ) : (
                filteredReminders.map((reminder) => {
                  const isLow = reminder.remainingQuantity <= reminder.refillReminderDaysBefore || reminder.remainingQuantity <= 6;
                  const lastLog = reminder.history[0];

                  return (
                    <div
                      key={reminder.id}
                      className="bg-white rounded-3xl border border-[#E8F5EE] p-5 sm:p-6 shadow-xs space-y-4 hover:border-[#D0EADB] transition-all relative overflow-hidden"
                      id={`reminder-card-${reminder.id}`}
                    >
                      {/* Top Row */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-[#E8F5EE] pb-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#E8F5EE] text-[#0E7A4B] border border-[#E8F5EE]">
                              {reminder.frequencyLabel}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              👤 {reminder.familyMember}
                            </span>
                            {reminder.privacyHideName && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <EyeOff className="w-3 h-3" />
                                Privacy Shield
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-black text-[#111827] mt-1">
                            {reminder.medicineName}
                          </h3>

                          {reminder.genericName && (
                            <p className="text-xs text-gray-500">
                              Generic: <strong>{reminder.genericName}</strong>
                            </p>
                          )}
                        </div>

                        {/* Actions (Edit / Delete) */}
                        <div className="flex items-center gap-1.5 self-end sm:self-start">
                          <button
                            onClick={() => {
                              setEditingReminder(reminder);
                              setShowAddMedicineModal(true);
                            }}
                            className="p-2 rounded-xl text-gray-500 hover:bg-[#E8F5EE] hover:text-[#0E7A4B] transition-colors"
                            title="Edit schedule"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteReminder(reminder.id)}
                            className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete reminder"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Dosage Instructions & Reminder Times */}
                      <div className="space-y-2 text-xs">
                        <div className="p-3 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] space-y-1">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">
                            Prescribed Dosage Instructions
                          </span>
                          <p className="font-bold text-[#111827]">
                            {reminder.dosageInstructions}
                          </p>
                          {reminder.notes && (
                            <p className="text-[11px] text-gray-500 italic">
                              Note: {reminder.notes}
                            </p>
                          )}
                        </div>

                        {/* Reminder Times Badges */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-[11px] font-bold text-gray-500">Dose Times:</span>
                          {reminder.reminderTimes.map((time) => (
                            <span
                              key={time}
                              className="px-2.5 py-1 rounded-xl bg-white border border-[#E8F5EE] shadow-2xs font-bold text-[#111827] flex items-center gap-1"
                            >
                              <Clock className="w-3 h-3 text-[#0E7A4B]" />
                              <span>{time}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Quantity & Refill Status */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                        <div className="p-3 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">
                              Remaining Pill Count
                            </span>
                            <span className="text-sm font-black text-[#111827]">
                              {reminder.remainingQuantity} / {reminder.totalQuantity} doses
                            </span>
                          </div>
                          <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isLow ? 'bg-amber-100 text-amber-800' : 'bg-[#E8F5EE] text-[#0E7A4B]'
                          }`}>
                            <Pill className="w-4 h-4" />
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">
                              Expected Refill Date
                            </span>
                            <span className="text-sm font-black text-[#111827]">
                              {reminder.refillDate || 'Approx. in 2 weeks'}
                            </span>
                          </div>
                          <RotateCcw className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      {/* Low Pill Warning & One-Tap Reorder Action */}
                      {isLow && (
                        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 text-xs">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>
                              <strong>{t.refillDueSoon}</strong> Only {reminder.remainingQuantity} doses remaining.
                            </span>
                          </div>
                          <button
                            onClick={() => onRequestRefill(reminder)}
                            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                            id={`request-refill-btn-${reminder.id}`}
                          >
                            <Repeat className="w-3.5 h-3.5" />
                            <span>{t.requestRefill}</span>
                          </button>
                        </div>
                      )}

                      {/* Interactive Dose Actions: Taken, Snooze, Skip */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#E8F5EE]">
                        <div className="text-[11px] text-gray-500">
                          {lastLog ? (
                            <span>
                              Last Logged: <strong>{lastLog.action.toUpperCase()}</strong> ({lastLog.timestamp})
                            </span>
                          ) : (
                            <span>Awaiting next scheduled dose</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSkip(reminder.id)}
                            className="px-3 py-1.5 rounded-xl text-gray-500 hover:bg-gray-100 font-bold text-xs transition-colors cursor-pointer"
                          >
                            {t.skip}
                          </button>
                          <button
                            onClick={() => onSnooze(reminder.id, 15)}
                            className="px-3 py-1.5 rounded-xl bg-white border border-[#E8F5EE] hover:bg-[#F1FAF4] text-[#111827] font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5 text-[#0E7A4B]" />
                            <span>{t.snooze}</span>
                          </button>
                          <button
                            onClick={() => onMarkTaken(reminder.id)}
                            className="px-4 py-1.5 rounded-xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-transform active:scale-95"
                            id={`card-mark-taken-${reminder.id}`}
                          >
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>{t.taken}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Col: Adherence Streak, Quick Stats, & Referral Widget */}
            <div className="space-y-4">
              {/* Adherence Streak Card */}
              <div className="bg-[#0E7A4B] text-white rounded-3xl p-6 border border-[#0B6B43] space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Treatment Adherence
                  </span>
                  <Flame className="w-5 h-5 text-amber-400" />
                </div>

                <div className="space-y-1">
                  <p className="text-4xl font-black text-emerald-400">{adherencePercent}%</p>
                  <p className="text-xs text-white/80">
                    Based on your logged daily doses this month.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-xs space-y-1.5">
                  <div className="flex justify-between text-white/80">
                    <span>Active Streak:</span>
                    <strong className="text-white">28 Days On Track</strong>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Punctuality:</span>
                    <strong className="text-white">98.2% on time</strong>
                  </div>
                </div>
              </div>

              {/* DAWA Monthly Status Widget */}
              <div className="bg-white rounded-3xl border border-[#E8F5EE] p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E8F5EE] pb-3">
                  <h4 className="text-xs font-black text-[#111827] uppercase">
                    Plan Status
                  </h4>
                  {dawaSubscription ? getStatusBadge(dawaSubscription.status) : (
                    <span className="text-xs text-gray-500 font-bold">Unsubscribed</span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Current Plan:</span>
                    <strong className="text-[#111827]">DAWA MED MONTHLY</strong>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Monthly Cost:</span>
                    <strong className="text-[#0E7A4B]">$5.00 USD / month</strong>
                  </div>
                  {dawaSubscription && (
                    <div className="flex justify-between text-gray-600">
                      <span>Next Billing:</span>
                      <strong className="text-[#111827]">{dawaSubscription.renewalDate}</strong>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (isSubscribed) {
                      setActiveTab('my_subscription');
                    } else {
                      setShowSubscribeModal(true);
                    }
                  }}
                  className="w-full py-2.5 rounded-2xl bg-[#F1FAF4] hover:bg-[#E8F5EE] text-[#0E7A4B] font-bold text-xs border border-[#E8F5EE] transition-colors cursor-pointer text-center block mt-2"
                >
                  {isSubscribed ? 'Manage Subscription →' : 'Upgrade to Monthly ($5/mo)'}
                </button>
              </div>

              {/* Referral Invite Widget */}
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-3xl p-6 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black">Invite Friends & Family</h4>
                  <p className="text-xs text-white/90">
                    Help your loved ones stay on track with their treatment schedule.
                  </p>
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="w-full py-2 rounded-xl bg-white text-amber-900 font-bold text-xs shadow-xs hover:bg-amber-50 transition-colors cursor-pointer"
                >
                  Get Referral Code & Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: My Subscription Management */}
      {activeTab === 'my_subscription' && (
        <div className="space-y-6">
          {dawaSubscription ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Subscription Card */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E8F5EE] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8F5EE] pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8F5EE] text-[#0E7A4B] border border-[#E8F5EE]">
                      {t.currentPlan}
                    </span>
                    <h2 className="text-xl font-black text-[#111827] mt-1">
                      {dawaSubscription.planName}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Subscribed for Patient: <strong className="text-[#111827]">{dawaSubscription.userName}</strong>
                    </p>
                  </div>

                  <div>
                    {getStatusBadge(dawaSubscription.status)}
                  </div>
                </div>

                {/* Plan Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      Subscription Price
                    </span>
                    <p className="text-base font-black text-[#111827]">
                      $5.00 USD / mo
                    </p>
                    <p className="text-[10px] text-gray-500">
                      ≈ {localPrice.toLocaleString()} {selectedCountry.currencySymbol}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {t.nextBillingDate}
                    </span>
                    <p className="text-base font-black text-[#111827]">
                      {dawaSubscription.renewalDate}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Auto-renews monthly
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {t.paymentMethod}
                    </span>
                    <p className="text-xs font-black text-[#111827] truncate">
                      {dawaSubscription.paymentMethod.title}
                    </p>
                    <p className="text-[10px] text-[#0E7A4B] font-mono">
                      Token: {dawaSubscription.paymentMethod.tokenizedId.slice(0, 14)}...
                    </p>
                  </div>
                </div>

                {/* Subscription Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E8F5EE]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSubscribeModal(true)}
                      className="px-4 py-2.5 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Update Payment Method</span>
                    </button>

                    {dawaSubscription.status === 'cancelled' && (
                      <button
                        onClick={handleToggleCancelSubscription}
                        className="px-4 py-2.5 rounded-2xl bg-[#0E7A4B] text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        {t.renewSubscription}
                      </button>
                    )}
                  </div>

                  {dawaSubscription.status === 'active' && (
                    <button
                      onClick={() => setShowCancelConfirmModal(true)}
                      className="px-4 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition-colors cursor-pointer"
                      id="cancel-subscription-btn"
                    >
                      {t.cancelSubscription}
                    </button>
                  )}
                </div>
              </div>

              {/* Billing History Card */}
              <div className="bg-white rounded-3xl border border-[#E8F5EE] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8F5EE] pb-3">
                  <h3 className="font-black text-sm text-[#111827] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#0E7A4B]" />
                    <span>Billing History</span>
                  </h3>
                  <span className="text-[10px] font-bold text-gray-500">PCI-DSS Tokenized</span>
                </div>

                <div className="space-y-2 max-h-[350px] overflow-y-auto text-xs">
                  {dawaSubscription.billingHistory.length === 0 ? (
                    <p className="text-gray-400 text-center py-6">No previous invoices found.</p>
                  ) : (
                    dawaSubscription.billingHistory.map((bill) => (
                      <div
                        key={bill.id}
                        className="p-3 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] space-y-1"
                      >
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-[#111827]">{bill.receiptNumber}</span>
                          <span className="text-[#0E7A4B]">${bill.amountUSD.toFixed(2)} USD</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-gray-500">
                          <span>{bill.date}</span>
                          <span className="px-2 py-0.5 rounded-md bg-[#E8F5EE] text-[#0E7A4B] font-bold">
                            {bill.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E8F5EE] p-10 text-center space-y-4 max-w-md mx-auto">
              <Sparkles className="w-12 h-12 text-[#0E7A4B] mx-auto opacity-80" />
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#111827]">No Active Subscription</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Subscribe to DAWA MED MONTHLY for $5 USD / month to unlock unlimited medicine schedules, refill warnings, and family medication profiles.
                </p>
              </div>
              <button
                onClick={() => setShowSubscribeModal(true)}
                className="px-6 py-3 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold text-xs"
              >
                {t.subscribeNow} ($5 / month)
              </button>
            </div>
          )}
        </div>
      )}

      {/* 6. Tab 3: Medication Adherence History */}
      {activeTab === 'adherence_history' && (
        <div className="bg-white rounded-3xl border border-[#E8F5EE] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8F5EE] pb-4">
            <div>
              <h2 className="text-lg font-black text-[#111827]">
                {t.medicationHistory}
              </h2>
              <p className="text-xs text-gray-500">
                Audit trail of doses taken, snoozed, or skipped across all family schedules.
              </p>
            </div>
            <span className="text-xs font-black text-[#0E7A4B] px-3 py-1 bg-[#E8F5EE] rounded-full">
              {adherencePercent}% Adherence Rate
            </span>
          </div>

          <div className="divide-y divide-[#E8F5EE] text-xs">
            {medicineReminders.flatMap((r) =>
              r.history.map((h) => ({
                ...h,
                medicineName: r.medicineName,
                familyMember: r.familyMember,
              }))
            ).length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No dose history logged yet. Mark doses as taken to build your history.</p>
              </div>
            ) : (
              medicineReminders
                .flatMap((r) =>
                  r.history.map((h) => ({
                    ...h,
                    medicineName: r.medicineName,
                    familyMember: r.familyMember,
                  }))
                )
                .map((log) => (
                  <div key={log.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold ${
                        log.action === 'taken'
                          ? 'bg-[#E8F5EE] text-[#0E7A4B]'
                          : log.action === 'snoozed'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {log.action === 'taken' ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-[#111827]">{log.medicineName}</p>
                        <p className="text-[11px] text-gray-500">
                          {log.familyMember} • Scheduled for {log.scheduledTime}
                          {log.skipReason && ` • Reason: ${log.skipReason}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        log.action === 'taken'
                          ? 'bg-[#E8F5EE] text-[#0E7A4B]'
                          : log.action === 'snoozed'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{log.timestamp}</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* 7. Tab 4: Included 14 Features Breakdown */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#E8F5EE] text-[#0E7A4B] text-xs font-black">
              Comprehensive Chronic Care
            </span>
            <h2 className="text-2xl font-black text-[#111827]">
              Everything in DAWA MED MONTHLY
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Designed specifically for patients taking regular medications to simplify adherence, refill logistics, and family health management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {[
              { title: 'Medicine Reminders', desc: 'Precise reminder notifications at your exact prescription times.' },
              { title: 'Multiple Medicine Schedules', desc: 'Organize unlimited daily, weekly, and custom dosing schedules.' },
              { title: 'Daily Reminders', desc: 'Morning, afternoon, evening, and bedtime dose alerts.' },
              { title: 'Weekly Reminders', desc: 'Support for weekly and bi-weekly specialized therapies.' },
              { title: 'Monthly Reminders', desc: 'Monthly injection, inhaler, or supplement replenishment alerts.' },
              { title: 'Refill Reminders', desc: 'Smart warnings when only 3-5 days of medication remain.' },
              { title: 'Prescription Expiry Reminders', desc: 'Automatic tracking of doctor prescription validity dates.' },
              { title: 'Medication History', desc: 'Full log of taken, snoozed, and skipped doses for clinician review.' },
              { title: 'Family Medication Profiles', desc: 'Manage regimens for yourself, parents, spouse, and children.' },
              { title: 'Reminder Notifications', desc: 'Interactive sound and banner alerts with one-tap Taken button.' },
              { title: 'Push Notifications', desc: 'Reliable device notifications on mobile and desktop.' },
              { title: 'SMS & WhatsApp Support', desc: 'Low-connectivity fallback reminders via SMS and WhatsApp.' },
              { title: 'One-Tap Reorder', desc: 'Instant refill request routing to licensed partner pharmacies.' },
              { title: 'Subscription Management', desc: 'Transparent $5/mo billing, cancellation freedom, and receipts.' },
            ].map((feat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-[#E8F5EE] p-5 shadow-2xs space-y-2 hover:border-[#D0EADB] transition-all"
              >
                <div className="flex items-center gap-2 text-[#0E7A4B]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <h4 className="font-black text-[#111827] text-sm">{feat.title}</h4>
                </div>
                <p className="text-gray-600 leading-relaxed text-[11px]">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Modals */}
      <DawaMonthlySubscribeModal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
        selectedCountry={selectedCountry}
        language={language}
        userProfile={userProfile}
        currentSubscription={dawaSubscription}
        onSubscribeSuccess={(newSub) => {
          onUpdateDawaSubscription(newSub);
          setShowSubscribeModal(false);
        }}
      />

      <AddMedicineModal
        isOpen={showAddMedicineModal}
        onClose={() => {
          setShowAddMedicineModal(false);
          setEditingReminder(null);
        }}
        onSaveMedicine={(reminder) => {
          if (editingReminder) {
            onUpdateReminder(reminder);
          } else {
            onAddReminder(reminder);
          }
        }}
        language={language}
        availableMedicines={availableMedicines}
        existingReminder={editingReminder}
      />

      {userReferral && referralConfig && (
        <InviteFriendsModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          userReferral={userReferral}
          referralConfig={referralConfig}
          language={language}
          selectedCountry={selectedCountry}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#E8F5EE] space-y-4 text-xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-[#111827]">Cancel Subscription?</h3>
              <p className="text-gray-600 text-[11px] leading-relaxed">
                You will still retain access to your smart reminders until the end of the current billing cycle on <strong>{dawaSubscription?.renewalDate}</strong>.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#E8F5EE] bg-gray-50 hover:bg-gray-100 font-bold"
              >
                Keep Active
              </button>
              <button
                type="button"
                onClick={handleToggleCancelSubscription}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Confirm Cancellation
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
