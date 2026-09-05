import React, { useState } from 'react';
import { 
  NotificationItem, 
  Language, 
  NotificationCategory,
  NotificationPreferences,
  CountryConfig
} from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Bike, 
  FileText, 
  Thermometer, 
  Clock, 
  AlertCircle,
  Pill,
  RotateCcw,
  Sparkles,
  Settings,
  ShieldCheck,
  Check,
  Repeat,
  CreditCard,
  EyeOff,
  Volume2,
  MessageCircle,
  Smartphone
} from 'lucide-react';
import { motion } from 'motion/react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  notificationPreferences: NotificationPreferences;
  onUpdateNotificationPreferences: (prefs: NotificationPreferences) => void;
  onMarkAllRead: () => void;
  onSelectOrderNotification?: (orderId: string) => void;
  onTakePillFromNotification?: (reminderId?: string) => void;
  onRequestRefillFromNotification?: (medicineName?: string) => void;
  onOpenSubscription?: () => void;
  language: Language;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  notificationPreferences,
  onUpdateNotificationPreferences,
  onMarkAllRead,
  onSelectOrderNotification,
  onTakePillFromNotification,
  onRequestRefillFromNotification,
  onOpenSubscription,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences'>('notifications');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((item) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'orders') return item.type === 'order' || item.type === 'rx';
    if (selectedCategory === 'delivery') return item.type === 'delivery' || item.type === 'cold_chain';
    if (selectedCategory === 'reminders') return item.type === 'medicine_reminder';
    if (selectedCategory === 'refills') return item.type === 'refill_reminder';
    if (selectedCategory === 'subscriptions') return item.type === 'subscription';
    if (selectedCategory === 'promotional') return item.type === 'promotional';
    return true;
  });

  const getCategoryIcon = (type: NotificationCategory) => {
    switch (type) {
      case 'order':
      case 'rx':
        return <FileText className="w-4 h-4 text-[#0E7A4B]" />;
      case 'delivery':
        return <Bike className="w-4 h-4 text-[#0E7A4B]" />;
      case 'cold_chain':
        return <Thermometer className="w-4 h-4 text-blue-600" />;
      case 'medicine_reminder':
        return <Pill className="w-4 h-4 text-[#0E7A4B]" />;
      case 'refill_reminder':
        return <RotateCcw className="w-4 h-4 text-amber-600" />;
      case 'subscription':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'promotional':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleTogglePreference = (key: keyof NotificationPreferences) => {
    onUpdateNotificationPreferences({
      ...notificationPreferences,
      [key]: !notificationPreferences[key],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto" id="notifications-modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E8F5EE] my-6"
        id="notifications-modal-container"
      >
        {/* Top Header */}
        <div className="p-5 border-b border-[#E8F5EE] flex items-center justify-between bg-[#F1FAF4]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#E8F5EE] flex items-center justify-center text-[#0E7A4B]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#111827]">{t.notificationsTitle}</h2>
              <p className="text-[11px] text-gray-500">
                {notifications.filter((n) => !n.read).length} unread updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'notifications' ? 'preferences' : 'notifications')}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'preferences' ? 'bg-[#0E7A4B] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title="Notification Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
              id="notifications-close-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {activeTab === 'notifications' ? (
          <>
            {/* Category Filter Pills */}
            <div className="px-4 py-2 bg-[#F1FAF4]/60 border-b border-[#E8F5EE] flex items-center gap-1.5 overflow-x-auto text-[11px]">
              {[
                { id: 'all', label: 'All' },
                { id: 'reminders', label: 'Dose Reminders' },
                { id: 'refills', label: 'Refill Alerts' },
                { id: 'orders', label: 'Orders & Rx' },
                { id: 'delivery', label: 'Delivery Tracking' },
                { id: 'subscriptions', label: 'Subscription' },
                { id: 'promotional', label: 'Offers' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-full font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#0E7A4B] text-white shadow-xs'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-[#E8F5EE]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="max-h-[420px] overflow-y-auto divide-y divide-[#E8F5EE] p-2 text-xs">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>{t.noNotifications}</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-2xl transition-colors flex gap-3 ${
                      notif.read ? 'bg-white hover:bg-gray-50' : 'bg-[#F1FAF4]/70 hover:bg-[#F1FAF4]'
                    }`}
                  >
                    <div className="mt-0.5 p-2 rounded-xl bg-white border border-[#E8F5EE] shadow-xs shrink-0 h-fit">
                      {getCategoryIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-xs font-bold text-[#111827] truncate">
                          {notificationPreferences.privacyShieldMode && notif.type === 'medicine_reminder'
                            ? 'DAWA MED Reminder (Privacy Protected)'
                            : notif.title}
                        </h3>
                        <span className="text-[10px] text-gray-400 shrink-0 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {notif.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed">
                        {notificationPreferences.privacyShieldMode && notif.type === 'medicine_reminder'
                          ? 'It is time to take your scheduled dose as prescribed.'
                          : notif.message}
                      </p>

                      {/* Interactive Notification Action Buttons */}
                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        {notif.type === 'medicine_reminder' && (
                          <button
                            onClick={() => {
                              if (onTakePillFromNotification) {
                                onTakePillFromNotification(notif.reminderId);
                              }
                              onClose();
                            }}
                            className="px-3 py-1 rounded-lg bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Mark Taken</span>
                          </button>
                        )}

                        {notif.type === 'refill_reminder' && (
                          <button
                            onClick={() => {
                              if (onRequestRefillFromNotification) {
                                onRequestRefillFromNotification(notif.medicineName);
                              }
                              onClose();
                            }}
                            className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <Repeat className="w-3 h-3" />
                            <span>Request Refill Now</span>
                          </button>
                        )}

                        {notif.type === 'subscription' && (
                          <button
                            onClick={() => {
                              if (onOpenSubscription) onOpenSubscription();
                              onClose();
                            }}
                            className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <span>Manage Plan</span>
                          </button>
                        )}

                        {notif.orderId && (
                          <button
                            onClick={() => {
                              if (onSelectOrderNotification) onSelectOrderNotification(notif.orderId);
                              onClose();
                            }}
                            className="px-3 py-1 rounded-lg bg-[#E8F5EE] hover:bg-[#B7E4C7] text-[#0E7A4B] font-bold text-[10px] cursor-pointer"
                          >
                            View Order Tracking →
                          </button>
                        )}
                      </div>
                    </div>

                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#0E7A4B] shrink-0 self-center" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Bottom Bar */}
            <div className="p-3 bg-[#F1FAF4] border-t border-[#E8F5EE] flex items-center justify-between">
              <button
                onClick={onMarkAllRead}
                className="text-xs font-bold text-[#0E7A4B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{t.markAllAsRead}</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-white hover:bg-gray-100 border border-[#E8F5EE] rounded-xl text-xs font-bold text-[#111827]"
              >
                {t.close}
              </button>
            </div>
          </>
        ) : (
          /* Preferences Tab */
          <div className="p-5 space-y-4 text-xs max-h-[460px] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8F5EE] pb-2">
              <h3 className="font-black text-[#111827] text-sm">Notification Channels & Privacy</h3>
              <button
                onClick={() => setActiveTab('notifications')}
                className="text-xs font-bold text-[#0E7A4B] hover:underline cursor-pointer"
              >
                ← Back to Alerts
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: 'medicineReminders' as keyof NotificationPreferences,
                  title: 'Daily Medicine Reminders',
                  desc: 'Punctual sound and banner reminders at scheduled dose hours.',
                  icon: <Pill className="w-4 h-4 text-[#0E7A4B]" />,
                },
                {
                  key: 'refillReminders' as keyof NotificationPreferences,
                  title: 'Refill & Low Pill Warnings',
                  desc: 'Alerts when pills run down to 5 days remaining.',
                  icon: <RotateCcw className="w-4 h-4 text-amber-600" />,
                },
                {
                  key: 'orderUpdates' as keyof NotificationPreferences,
                  title: 'Order Status & Prescription Verification',
                  desc: 'Notifications when pharmacy confirms or prepares medications.',
                  icon: <FileText className="w-4 h-4 text-[#0E7A4B]" />,
                },
                {
                  key: 'deliveryTracking' as keyof NotificationPreferences,
                  title: 'Rider GPS Tracking & Handover PIN',
                  desc: 'Live ETA updates and security handover OTP codes.',
                  icon: <Bike className="w-4 h-4 text-[#0E7A4B]" />,
                },
                {
                  key: 'subscriptionBilling' as keyof NotificationPreferences,
                  title: 'DAWA Monthly Invoices & Billing',
                  desc: 'Monthly renewal notifications and tokenized payment receipts.',
                  icon: <CreditCard className="w-4 h-4 text-emerald-600" />,
                },
                {
                  key: 'smsWhatsAppAlerts' as keyof NotificationPreferences,
                  title: 'WhatsApp & SMS Fallback',
                  desc: 'Delivers notifications via WhatsApp when data connection is low.',
                  icon: <MessageCircle className="w-4 h-4 text-[#25D366]" />,
                },
                {
                  key: 'privacyShieldMode' as keyof NotificationPreferences,
                  title: 'Privacy Shield (Hide Drug Names)',
                  desc: 'Masks medication brand names on lock screens for medical privacy.',
                  icon: <EyeOff className="w-4 h-4 text-purple-600" />,
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3.5 bg-[#F1FAF4] rounded-2xl border border-[#E8F5EE] flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-xl border border-[#E8F5EE] shadow-2xs">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111827]">{item.title}</h4>
                      <p className="text-[11px] text-gray-500">{item.desc}</p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={Boolean(notificationPreferences[item.key])}
                      onChange={() => handleTogglePreference(item.key)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0E7A4B]"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveTab('notifications')}
                className="w-full py-2.5 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold text-xs"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
