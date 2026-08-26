/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
  Language, 
  CountryConfig, 
  Medicine, 
  OrderItem, 
  Order, 
  ChronicSubscription, 
  PrescriptionData,
  OrderStatus,
  OrderReview,
  UserProfile,
  NotificationItem,
  DawaMonthlySubscription,
  MedicineReminder,
  NotificationPreferences,
  UserReferralStats,
  ReferralSystemConfig
} from './types';
import { 
  COUNTRIES, 
  SAMPLE_MEDICINES, 
  INITIAL_ORDERS, 
  SAMPLE_CHRONIC_SUBSCRIPTIONS,
  SAMPLE_PHARMACIES,
  INITIAL_NOTIFICATIONS,
  SAMPLE_USER_PROFILE,
  INITIAL_DAWA_MONTHLY_SUB,
  INITIAL_MEDICINE_REMINDERS,
  INITIAL_NOTIFICATION_PREFERENCES,
  INITIAL_USER_REFERRAL_STATS,
  INITIAL_REFERRAL_CONFIG
} from './data/mockData';
import { TRANSLATIONS } from './data/translations';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { Header } from './components/Header';
import { CustomerView } from './components/CustomerView';
import { PharmacyDashboard } from './components/PharmacyDashboard';
import { DriverApp } from './components/DriverApp';
import { SubscriptionView } from './components/SubscriptionView';
import { AdminDashboard } from './components/AdminDashboard';
import { SplashScreen } from './components/SplashScreen';
import { PrescriptionUploadModal } from './components/PrescriptionUploadModal';
import { ReceiptModal } from './components/ReceiptModal';
import { AuthModal, AuthMode } from './components/AuthModal';
import { NotificationsModal } from './components/NotificationsModal';
import { LiveReminderBanner } from './components/LiveReminderBanner';
import { DawaMonthlySubscribeModal } from './components/DawaMonthlySubscribeModal';
import { AddMedicineModal } from './components/AddMedicineModal';
import { InviteFriendsModal } from './components/InviteFriendsModal';
import { PublicWebsite } from './components/PublicWebsite';
import { QrVerificationModal } from './components/QrVerificationModal';
import { OrderReviewModal } from './components/OrderReviewModal';
import { LegalPagesModal } from './components/LegalPagesModal';
import { SystemHealthTestsModal } from './components/SystemHealthTestsModal';
import { SupportDashboard } from './components/SupportDashboard';
import { Footer } from './components/Footer';

function AppInner() {
  const { language, setLanguage, isRtl } = useLanguage();
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [selectedCountry, setSelectedCountry] = useState<CountryConfig>(COUNTRIES[0]);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [subscriptions, setSubscriptions] = useState<ChronicSubscription[]>(SAMPLE_CHRONIC_SUBSCRIPTIONS);
  const [medicines, setMedicines] = useState<Medicine[]>(SAMPLE_MEDICINES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [userProfile, setUserProfile] = useState<UserProfile>(SAMPLE_USER_PROFILE);

  // DAWA MED MONTHLY Subscription & Reminders State
  const [dawaMonthlySub, setDawaMonthlySub] = useState<DawaMonthlySubscription>(INITIAL_DAWA_MONTHLY_SUB);
  const [medicineReminders, setMedicineReminders] = useState<MedicineReminder[]>(INITIAL_MEDICINE_REMINDERS);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(INITIAL_NOTIFICATION_PREFERENCES);
  const [referralStats, setReferralStats] = useState<UserReferralStats>(INITIAL_USER_REFERRAL_STATS);
  const [referralConfig, setReferralConfig] = useState<ReferralSystemConfig>(INITIAL_REFERRAL_CONFIG);

  // Modals & Overlays
  const [isSplashOpen, setIsSplashOpen] = useState<boolean>(false);
  const [isUploadRxOpen, setIsUploadRxOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('login');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isMonthlySubscribeOpen, setIsMonthlySubscribeOpen] = useState<boolean>(false);
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState<boolean>(false);
  const [isInviteFriendsOpen, setIsInviteFriendsOpen] = useState<boolean>(false);
  const [editingReminder, setEditingReminder] = useState<MedicineReminder | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [isLiteMode, setIsLiteMode] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [activeQrOrder, setActiveQrOrder] = useState<Order | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [activeReviewOrder, setActiveReviewOrder] = useState<Order | null>(null);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [isHealthTestsModalOpen, setIsHealthTestsModalOpen] = useState<boolean>(false);

  // RTL & Arabic typography support
  useEffect(() => {
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
      document.body.style.fontFamily = "'Tajawal', sans-serif";
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language;
      document.body.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
    }
  }, [language]);

  // Session Verification on Mount
  useEffect(() => {
    const token = localStorage.getItem('dawa_auth_token');
    const savedRole = localStorage.getItem('dawa_user_role') as UserRole;
    if (token) {
      fetch('/api/auth/verify-session', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.authenticated && data.user) {
            setUserProfile(prev => ({
              ...prev,
              id: data.user.id,
              username: data.user.username,
              name: data.user.name,
              email: data.user.email,
              phone: data.user.phone || prev.phone,
              isRegistered: true,
              preferredLanguage: data.user.preferredLanguage || prev.preferredLanguage
            }));
            if (data.user.role) {
              localStorage.setItem('dawa_user_role', data.user.role);
            }
          }
        })
        .catch(() => {
          // Keep local state on network interruption
        });
    }
  }, []);

  // Cart operations
  const handleAddToCart = (med: Medicine) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.medicine.id === med.id);
      if (existing) {
        return prev.map((item) =>
          item.medicine.id === med.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { medicine: med, quantity: 1, unitPrice: med.priceUSD }];
    });
  };

  const handleUpdateQuantity = (medId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.medicine.id === medId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[];
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Order Placement
  const handlePlaceOrder = (newOrderData: Partial<Order>) => {
    const fullOrder: Order = {
      id: newOrderData.id || `ord-${Date.now()}`,
      orderNumber: newOrderData.orderNumber || `DM-${selectedCountry.code}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: 'Just now',
      customerName: newOrderData.customerName || userProfile.name || 'Patient',
      customerPhone: newOrderData.customerPhone || userProfile.phone || '+254 700 000 000',
      deliveryAddress: newOrderData.deliveryAddress || userProfile.streetAddress || 'Central Street',
      city: newOrderData.city || selectedCountry.sampleCity,
      countryCode: selectedCountry.code,
      items: newOrderData.items || [],
      subtotalAmount: newOrderData.subtotalAmount || 10,
      deliveryFee: newOrderData.deliveryFee || 1.8,
      serviceFee: newOrderData.serviceFee || 0.5,
      discountAmount: newOrderData.discountAmount || 0,
      totalAmount: newOrderData.totalAmount || 12.3,
      currency: selectedCountry.currency,
      paymentMethod: newOrderData.paymentMethod || selectedCountry.mobileMoneyProviders[0],
      paymentStatus: 'paid',
      status: newOrderData.status || 'order_received',
      pharmacyId: newOrderData.pharmacyId || 'pharma-01',
      pharmacyName: newOrderData.pharmacyName || 'GoodLife Pharmacy — Westlands Central',
      pharmacistLicense: 'PPB/RET/2024/09812',
      driverName: newOrderData.driverName || 'Kofi Mensah',
      driverPhone: newOrderData.driverPhone || '+254 700 882 192',
      driverVehicle: newOrderData.driverVehicle || 'Yamaha YBR 125 (Reg: KMD 842E)',
      driverTemperature: newOrderData.driverTemperature,
      estimatedDeliveryMinutes: 20,
      distanceKm: newOrderData.distanceKm || 2.4,
      deliveryOtp: newOrderData.deliveryOtp || '7492',
      qrCodeSignature: newOrderData.qrCodeSignature || `DAWA-${Date.now()}`,
      prescription: newOrderData.prescription,
    };

    setOrders((prev) => [fullOrder, ...prev]);

    // Push notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Order Confirmed',
      message: `Your order ${fullOrder.orderNumber} is received and routed to ${fullOrder.pharmacyName}.`,
      timestamp: 'Just now',
      type: 'order',
      orderId: fullOrder.id,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Status transitions
  const handleAdvanceStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated: Order = { ...o, status: nextStatus };
          if (nextStatus === 'delivered') {
            updated.deliveredAt = 'Just now';
          }
          return updated;
        }
        return o;
      })
    );

    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Order Update: ${nextStatus.replace(/_/g, ' ').toUpperCase()}`,
        message: `Order ${targetOrder.orderNumber} status changed to ${nextStatus.replace(/_/g, ' ')}.`,
        timestamp: 'Just now',
        type: 'order',
        orderId,
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  // Review submission
  const handleUpdateReview = (orderId: string, review: OrderReview) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, review } : o))
    );
  };

  // Problem reporting
  const handleReportProblem = (orderId: string, issue: string) => {
    const newNotif: NotificationItem = {
      id: `notif-issue-${Date.now()}`,
      title: 'Support Ticket Created',
      message: `Ticket registered for Order #${orderId}: ${issue}. Our clinical team will contact you shortly.`,
      timestamp: 'Just now',
      type: 'system',
      orderId,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Notification handlers
  const handleMarkNotifAsRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const handleClearNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Prescription Upload & Pharmacist assignment
  const handlePrescriptionSubmitted = (prescription: PrescriptionData) => {
    const rxOrder: Order = {
      id: `ord-rx-${Date.now().toString().slice(-4)}`,
      orderNumber: `DM-${selectedCountry.code}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: 'Just now',
      customerName: prescription.patientName,
      customerPhone: prescription.patientPhone,
      deliveryAddress: 'Kilimani / Delivery Address Confirmed on Approval',
      city: selectedCountry.sampleCity,
      countryCode: selectedCountry.code,
      items: [
        {
          medicine: {
            id: 'med-prescribed-01',
            name: prescription.isChronicCondition ? 'Prescribed Metformin + Amlodipine Combo' : 'Prescribed Antibiotic / Clinical Formulation',
            genericName: 'Pharmacist Dispensed Compound',
            category: prescription.isChronicCondition ? 'chronic' : 'antibiotics',
            dosage: 'As Directed by Prescriber',
            form: 'tablets',
            packageSize: '1 Month Supply (Verified)',
            priceUSD: 14.50,
            requiresPrescription: true,
            requiresColdChain: false,
            descriptionEn: prescription.notes || 'Awaiting licensed pharmacist line-by-line dosage verification.',
            descriptionAr: 'بانتظار تدقيق الوصفة والجرعات بواسطة الصيدلي المرخص.',
            descriptionSw: 'Inasubiri uthibitisho wa daktari wa dawa na dozi sahihi.',
            manufacturer: 'Verified Pharma Partner',
            stockCount: 50,
            storageCondition: 'Room temperature below 25°C',
            availablePharmacyIds: ['pharma-01', 'pharma-02'],
            indications: ['Prescription Verified'],
            approvalStatus: 'approved',
          },
          quantity: 1,
          unitPrice: 14.50,
        },
      ],
      subtotalAmount: 14.50,
      deliveryFee: 1.80,
      serviceFee: 0.50,
      discountAmount: 0.0,
      totalAmount: 16.80,
      currency: selectedCountry.currency,
      paymentMethod: selectedCountry.mobileMoneyProviders[0],
      paymentStatus: 'paid',
      status: 'prescription_under_review',
      pharmacyId: 'pharma-01',
      pharmacyName: 'GoodLife Pharmacy — Westlands Central',
      pharmacistLicense: 'PPB/RET/2024/09812',
      estimatedDeliveryMinutes: 35,
      distanceKm: 3.1,
      deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      qrCodeSignature: `DAWA-RX-${Date.now()}`,
      prescription: {
        ...prescription,
        verifiedByPharmacist: 'Dr. Amina Mohamed, PharmD (PPB/9812)',
        pharmacistNotes: 'Prescription valid. Dosage checked for renal safety.',
      },
    };

    setOrders((prev) => [rxOrder, ...prev]);

    // If chronic condition was checked, automatically suggest/enroll in chronic monthly subscription
    if (prescription.isChronicCondition) {
      const newSub: ChronicSubscription = {
        id: `sub-${Date.now()}`,
        patientName: prescription.patientName,
        condition: 'Hypertension & Diabetes Care',
        planName: 'DAWA Monthly Chronic Refill',
        monthlyMedicines: [
          {
            medicine: rxOrder.items[0].medicine,
            quantity: 2,
          },
        ],
        deliveryDayOfMonth: 1,
        nextDeliveryDate: '1st of Next Month',
        status: 'active',
        pillReminders: [
          {
            time: '08:00 AM',
            medicineName: 'Prescribed Medicine',
            dosage: '1 Tablet morning',
            period: 'morning',
          },
        ],
        autoRefillDaysBefore: 3,
        discountPercentage: 15,
      };
      setSubscriptions((prev) => [newSub, ...prev]);
    }
  };

  // Pharmacy actions
  const handleApproveOrder = (orderId: string, pharmacistNotes?: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'pharmacy_accepted',
              prescription: o.prescription
                ? {
                    ...o.prescription,
                    verifiedByPharmacist: 'Dr. Amina Mohamed, PharmD',
                    pharmacistNotes: pharmacistNotes || 'Dosage and safety approved.',
                  }
                : undefined,
            }
          : o
      )
    );
  };

  const handleRejectOrder = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'rejected',
              prescription: o.prescription
                ? { ...o.prescription, pharmacistNotes: `Order Rejected: ${reason}` }
                : undefined,
            }
          : o
      )
    );
  };

  const handleDispatchOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'out_for_delivery',
              driverName: 'Kofi Mensah',
              driverPhone: '+254 700 882 192',
              driverVehicle: 'Yamaha YBR 125',
              estimatedDeliveryMinutes: 18,
            }
          : o
      )
    );
  };

  // Driver actions
  const handleCompleteDelivery = (orderId: string, otp: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'delivered',
              deliveredAt: 'Today at 11:20 AM',
            }
          : o
      )
    );
  };

  // Subscription additions
  const handleAddSubscription = (newSub: ChronicSubscription) => {
    setSubscriptions((prev) => [newSub, ...prev]);
  };

  // DAWA MED MONTHLY Subscription Handlers
  const handleUpdateDawaSubscription = (updatedSub: DawaMonthlySubscription) => {
    setDawaMonthlySub(updatedSub);
    const notif: NotificationItem = {
      id: `notif-sub-${Date.now()}`,
      title: 'DAWA MED MONTHLY Updated',
      message: `Your smart medication adherence subscription status is now: ${updatedSub.status.toUpperCase()}.`,
      timestamp: 'Just now',
      type: 'subscription',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleAddReminder = (newRem: MedicineReminder) => {
    setMedicineReminders((prev) => [newRem, ...prev]);
    const notif: NotificationItem = {
      id: `notif-rem-${Date.now()}`,
      title: 'New Medicine Reminder Set',
      message: `Schedule created for ${newRem.medicineName} (${newRem.dosageInstructions}) at ${newRem.reminderTimes.join(', ')}.`,
      timestamp: 'Just now',
      type: 'medicine_reminder',
      reminderId: newRem.id,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleUpdateReminder = (updatedRem: MedicineReminder) => {
    setMedicineReminders((prev) =>
      prev.map((r) => (r.id === updatedRem.id ? updatedRem : r))
    );
  };

  const handleDeleteReminder = (reminderId: string) => {
    setMedicineReminders((prev) => prev.filter((r) => r.id !== reminderId));
  };

  const handleMarkTaken = (reminderId: string) => {
    setMedicineReminders((prev) =>
      prev.map((r) => {
        if (r.id === reminderId) {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newRemaining = Math.max(0, r.remainingQuantity - 1);
          return {
            ...r,
            remainingQuantity: newRemaining,
            history: [
              {
                id: `hist-${Date.now()}`,
                scheduledTime: r.reminderTimes[0] || '08:00 AM',
                timestamp: `Today at ${nowStr}`,
                action: 'taken',
              },
              ...r.history,
            ],
          };
        }
        return r;
      })
    );

    const target = medicineReminders.find((r) => r.id === reminderId);
    if (target) {
      const notif: NotificationItem = {
        id: `notif-dose-${Date.now()}`,
        title: 'Dose Logged Successfully',
        message: `Great job! You recorded taking ${target.medicineName}.`,
        timestamp: 'Just now',
        type: 'medicine_reminder',
        reminderId,
        read: false,
      };
      setNotifications((prev) => [notif, ...prev]);

      // Check if low pill count reached
      if (target.remainingQuantity - 1 <= target.refillReminderDaysBefore) {
        const refillNotif: NotificationItem = {
          id: `notif-refill-${Date.now()}`,
          title: 'Refill Warning',
          message: `${target.medicineName} is running low (${target.remainingQuantity - 1} doses remaining). Tap to reorder instantly.`,
          timestamp: 'Just now',
          type: 'refill_reminder',
          medicineName: target.medicineName,
          read: false,
        };
        setNotifications((prev) => [refillNotif, ...prev]);
      }
    }
  };

  const handleSnooze = (reminderId: string, minutes: number) => {
    const target = medicineReminders.find((r) => r.id === reminderId);
    const notif: NotificationItem = {
      id: `notif-snooze-${Date.now()}`,
      title: 'Reminder Snoozed',
      message: `${target?.medicineName || 'Medicine'} snoozed for ${minutes} minutes. We will ring you again.`,
      timestamp: 'Just now',
      type: 'medicine_reminder',
      reminderId,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleSkip = (reminderId: string, reason?: string) => {
    setMedicineReminders((prev) =>
      prev.map((r) => {
        if (r.id === reminderId) {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...r,
            history: [
              {
                id: `hist-${Date.now()}`,
                scheduledTime: r.reminderTimes[0] || '08:00 AM',
                timestamp: `Today at ${nowStr}`,
                action: 'skipped',
                skipReason: reason || 'Patient deferred dose',
              },
              ...r.history,
            ],
          };
        }
        return r;
      })
    );
  };

  const handleRequestRefill = (reminder: MedicineReminder) => {
    const medMatch = medicines.find((m) =>
      m.name.toLowerCase().includes(reminder.medicineName.toLowerCase()) ||
      reminder.medicineName.toLowerCase().includes(m.name.toLowerCase())
    ) || medicines[0];

    handlePlaceOrder({
      customerName: userProfile.name,
      customerPhone: userProfile.phone,
      deliveryAddress: userProfile.streetAddress || 'Residential Address',
      items: [{ medicine: medMatch, quantity: 1, unitPrice: medMatch.priceUSD }],
      subtotalAmount: medMatch.priceUSD,
      deliveryFee: 1.5,
      serviceFee: 0.5,
      totalAmount: medMatch.priceUSD + 2.0,
      paymentMethod: selectedCountry.mobileMoneyProviders[0],
    });

    const notif: NotificationItem = {
      id: `notif-refill-ordered-${Date.now()}`,
      title: 'Refill Order Dispatched to Pharmacy',
      message: `Automatic monthly refill created for ${reminder.medicineName}. GoodLife Pharmacy is preparing it.`,
      timestamp: 'Just now',
      type: 'order',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Open Auth Modal with specific mode (login, register, admin, pharmacy)
  const handleOpenAuth = (mode: AuthMode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthOpen(true);
  };

  // Sign out
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('dawa_auth_token');
    localStorage.removeItem('dawa_user_id');
    localStorage.removeItem('dawa_user_role');
    setUserProfile((prev) => ({
      ...prev,
      isRegistered: false,
    }));
  };

  // Find active reminder for top banner (first active reminder)
  const activeReminderForBanner = medicineReminders.find((r) => r.isOngoing && r.remainingQuantity > 0) || null;

  return (
    <div 
      className="min-h-screen flex flex-col bg-[#F4F7F5] text-[#1B4332] w-full max-w-full min-w-0 box-border overflow-x-hidden"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Brand Splash Screen Modal */}
      <SplashScreen
        isOpen={isSplashOpen}
        onDismiss={() => setIsSplashOpen(false)}
        language={language}
        selectedCountry={selectedCountry}
      />

      {/* Main Global Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={(role) => {
          if ((role === 'admin' || role === 'super_admin') && (!userProfile?.isRegistered || (localStorage.getItem('dawa_user_role') !== 'admin' && localStorage.getItem('dawa_user_role') !== 'super_admin'))) {
            handleOpenAuth('admin');
          } else {
            setCurrentRole(role);
          }
        }}
        language={language}
        onLanguageChange={setLanguage}
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
        cartItems={cartItems}
        onOpenCart={() => setCurrentRole('customer')}
        onOpenUploadRx={() => setIsUploadRxOpen(true)}
        onOpenSplash={() => setIsSplashOpen(true)}
        onOpenAuth={(mode) => handleOpenAuth(mode || 'login')}
        onLogout={handleLogout}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenLegal={() => setIsLegalModalOpen(true)}
        onOpenHealthTests={() => setIsHealthTestsModalOpen(true)}
        userProfile={userProfile}
        notifications={notifications}
        isLiteMode={isLiteMode}
        onToggleLiteMode={() => setIsLiteMode(!isLiteMode)}
        activeOrderCount={orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length}
      />

      {/* Active Adherence Reminder Banner (Shown on Patient/Customer or Subscription View) */}
      {(currentRole === 'customer' || currentRole === 'subscription') && activeReminderForBanner && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4">
          <LiveReminderBanner
            activeReminder={activeReminderForBanner}
            onMarkTaken={handleMarkTaken}
            onSnooze={handleSnooze}
            onSkip={handleSkip}
            onRequestRefill={handleRequestRefill}
            language={language}
            selectedCountry={selectedCountry}
          />
        </div>
      )}

      {/* Main Content View based on Active Role */}
      <main className={`flex-1 w-full ${currentRole === 'website' ? 'p-0' : 'max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8'}`}>
        {currentRole === 'website' && (
          <PublicWebsite
            language={language}
            selectedCountry={selectedCountry}
            onOpenCustomerApp={() => setCurrentRole('customer')}
            onOpenUploadRx={() => setIsUploadRxOpen(true)}
            onOpenMonthlySub={() => setIsMonthlySubscribeOpen(true)}
            onSwitchRole={(role) => setCurrentRole(role)}
          />
        )}

        {currentRole === 'customer' && (
          <CustomerView
            medicines={medicines}
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onClearCart={handleClearCart}
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
            onOpenUploadRx={() => setIsUploadRxOpen(true)}
            onViewReceipt={(order) => setReceiptOrder(order)}
            onAdvanceStatus={handleAdvanceStatus}
            onUpdateReview={handleUpdateReview}
            onReportProblem={handleReportProblem}
            onOpenQrVerification={(order) => {
              setActiveQrOrder(order);
              setIsQrModalOpen(true);
            }}
            onOpenReviewModal={(order) => {
              setActiveReviewOrder(order);
              setIsReviewModalOpen(true);
            }}
            userProfile={userProfile}
            language={language}
            selectedCountry={selectedCountry}
            isLiteMode={isLiteMode}
            onToggleLiteMode={() => setIsLiteMode(!isLiteMode)}
          />
        )}

        {currentRole === 'pharmacy' && (
          <PharmacyDashboard
            pharmacy={SAMPLE_PHARMACIES[0]}
            orders={orders}
            onApproveOrder={handleApproveOrder}
            onRejectOrder={handleRejectOrder}
            onDispatchOrder={handleDispatchOrder}
            onAdvanceStatus={handleAdvanceStatus}
            language={language}
            selectedCountry={selectedCountry}
            medicines={medicines}
            onSubmitNewMedicine={(newMedData) => {
              const newMed: Medicine = {
                id: `med-custom-${Date.now()}`,
                name: newMedData.name || 'New Product',
                genericName: newMedData.genericName || '',
                category: newMedData.category || 'chronic',
                dosage: newMedData.dosage || 'Standard',
                form: newMedData.form || 'tablets',
                packageSize: newMedData.packageSize || '1 Pack',
                priceUSD: newMedData.priceUSD || 10,
                requiresPrescription: newMedData.requiresPrescription ?? true,
                requiresColdChain: newMedData.requiresColdChain ?? false,
                descriptionEn: newMedData.descriptionEn || '',
                descriptionAr: newMedData.descriptionAr || '',
                descriptionSw: newMedData.descriptionSw || '',
                manufacturer: newMedData.manufacturer || 'Approved Manufacturer',
                stockCount: newMedData.stockCount || 50,
                indications: newMedData.indications || [],
                storageCondition: newMedData.storageCondition || 'Room temperature',
                availablePharmacyIds: ['pharma-01'],
                submittedByPharmacyId: 'pharma-01',
                submittedByPharmacyName: 'GoodLife Pharmacy — Westlands Central',
                submittedAt: new Date().toISOString(),
                approvalStatus: 'pending_approval',
                batchNumber: newMedData.batchNumber,
                expiryDate: newMedData.expiryDate,
              };
              setMedicines((prev) => [newMed, ...prev]);
            }}
          />
        )}

        {currentRole === 'driver' && (
          <DriverApp
            orders={orders}
            onCompleteDelivery={handleCompleteDelivery}
            onAdvanceStatus={handleAdvanceStatus}
            language={language}
            selectedCountry={selectedCountry}
          />
        )}

        {currentRole === 'subscription' && (
          <SubscriptionView
            subscriptions={subscriptions}
            dawaSubscription={dawaMonthlySub}
            medicineReminders={medicineReminders}
            onUpdateDawaSubscription={handleUpdateDawaSubscription}
            onAddReminder={handleAddReminder}
            onUpdateReminder={handleUpdateReminder}
            onDeleteReminder={handleDeleteReminder}
            onMarkTaken={handleMarkTaken}
            onSnooze={handleSnooze}
            onSkip={handleSkip}
            onRequestRefill={handleRequestRefill}
            language={language}
            selectedCountry={selectedCountry}
            availableMedicines={medicines}
            userProfile={userProfile}
            userReferral={referralStats}
            referralConfig={referralConfig}
          />
        )}

        {currentRole === 'support' && (
          <SupportDashboard
            language={language}
            selectedCountry={selectedCountry}
          />
        )}

        {(currentRole === 'admin' || currentRole === 'super_admin') && (
          <AdminDashboard
            orders={orders}
            selectedCountry={selectedCountry}
            onCountryChange={setSelectedCountry}
            language={language}
            medicines={medicines}
            currentUser={{
              id: userProfile.id,
              username: userProfile.username,
              name: userProfile.name,
              email: userProfile.email || 'mosa@dawamed.com',
              role: (localStorage.getItem('dawa_user_role') as UserRole) || 'admin',
              permissions: ['users.view', 'users.edit', 'pharmacies.view', 'pharmacies.approve', 'medicines.view', 'medicines.approve', 'audit.view', 'settings.manage'],
              status: 'active',
              isVerified: true,
              countryCode: userProfile.countryCode,
              city: userProfile.city,
              streetAddress: userProfile.streetAddress,
              preferredLanguage: userProfile.preferredLanguage,
              lastLoginAt: new Date().toISOString()
            }}
            onUpdateMedicineStatus={(medicineId, status, notes, reason) => {
              setMedicines((prev) =>
                prev.map((m) =>
                  m.id === medicineId
                    ? {
                        ...m,
                        approvalStatus: status,
                        changeRequestNotes: notes,
                        rejectionReason: reason,
                        reviewedAt: new Date().toISOString(),
                        reviewedBy: userProfile.name || 'Chief Medical Officer',
                      }
                    : m
                )
              );
            }}
          />
        )}
      </main>

      {/* Auth & Registration Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authModalMode}
        onSaveProfile={(profile) => {
          setUserProfile(profile);
          setIsAuthOpen(false);
        }}
        onLogout={handleLogout}
        userProfile={userProfile}
        currentProfile={userProfile}
        language={language}
        selectedCountry={selectedCountry}
        onSwitchRole={(role) => setCurrentRole(role)}
      />

      {/* Notifications Drawer Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        notificationPreferences={notificationPreferences}
        onUpdateNotificationPreferences={setNotificationPreferences}
        onMarkAllRead={handleClearNotifications}
        onSelectOrderNotification={(orderId) => {
          setIsNotificationsOpen(false);
          const o = orders.find((ord) => ord.id === orderId);
          if (o) setReceiptOrder(o);
        }}
        onTakePillFromNotification={(remId) => {
          if (remId) handleMarkTaken(remId);
          else if (medicineReminders.length > 0) handleMarkTaken(medicineReminders[0].id);
        }}
        onRequestRefillFromNotification={(medName) => {
          const match = medicineReminders.find((r) =>
            medName ? r.medicineName.toLowerCase().includes(medName.toLowerCase()) : false
          ) || medicineReminders[0];
          if (match) handleRequestRefill(match);
        }}
        onOpenSubscription={() => {
          setIsNotificationsOpen(false);
          setCurrentRole('subscription');
        }}
        language={language}
      />

      {/* DAWA MED MONTHLY Subscription Checkout Modal */}
      <DawaMonthlySubscribeModal
        isOpen={isMonthlySubscribeOpen}
        onClose={() => setIsMonthlySubscribeOpen(false)}
        onSubscribeSuccess={(newSub) => {
          handleUpdateDawaSubscription(newSub);
          setIsMonthlySubscribeOpen(false);
        }}
        currentSubscription={dawaMonthlySub}
        userProfile={userProfile}
        language={language}
        selectedCountry={selectedCountry}
      />

      {/* Add / Edit Medicine Reminder Modal */}
      <AddMedicineModal
        isOpen={isAddMedicineOpen}
        onClose={() => {
          setIsAddMedicineOpen(false);
          setEditingReminder(null);
        }}
        onSaveReminder={(savedRem) => {
          if (editingReminder) {
            handleUpdateReminder(savedRem);
          } else {
            handleAddReminder(savedRem);
          }
          setIsAddMedicineOpen(false);
          setEditingReminder(null);
        }}
        initialReminder={editingReminder || undefined}
        availableMedicines={medicines}
        language={language}
        selectedCountry={selectedCountry}
      />

      {/* Viral Referral & Free Month Sharing Modal */}
      <InviteFriendsModal
        isOpen={isInviteFriendsOpen}
        onClose={() => setIsInviteFriendsOpen(false)}
        userReferral={referralStats}
        referralConfig={referralConfig}
        language={language}
      />

      {/* Prescription Upload Modal */}
      <PrescriptionUploadModal
        isOpen={isUploadRxOpen}
        onClose={() => setIsUploadRxOpen(false)}
        onPrescriptionSubmitted={handlePrescriptionSubmitted}
        language={language}
        selectedCountry={selectedCountry}
      />

      {/* Official Verified Medical Receipt Modal */}
      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          isOpen={!!receiptOrder}
          onClose={() => setReceiptOrder(null)}
          language={language}
          selectedCountry={selectedCountry}
        />
      )}

      {/* Privacy-Safe Package Integrity QR Verification Modal */}
      {activeQrOrder && (
        <QrVerificationModal
          order={activeQrOrder}
          isOpen={isQrModalOpen}
          onClose={() => {
            setIsQrModalOpen(false);
            setActiveQrOrder(null);
          }}
          onVerificationSuccess={(result) => {
            // Update order status if advanced
            if (result.verified && (activeQrOrder.status === 'out_for_delivery' || activeQrOrder.status === 'in_transit' || activeQrOrder.status === 'picked_up')) {
              handleAdvanceStatus(activeQrOrder.id, 'delivered');
            }
          }}
          language={language}
        />
      )}

      {/* Post-Delivery Experience & Cold-Chain Rating Modal */}
      {activeReviewOrder && (
        <OrderReviewModal
          order={activeReviewOrder}
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setActiveReviewOrder(null);
          }}
          onSubmitReview={(review) => {
            handleUpdateReview(activeReviewOrder.id, review);
          }}
          language={language}
        />
      )}

      {/* Regulatory, Compliance & Patient Data Privacy Center Modal */}
      <LegalPagesModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        language={language}
        user={userProfile}
      />

      {/* Automated Platform Architecture & Health Audit Modal */}
      <SystemHealthTestsModal
        isOpen={isHealthTestsModalOpen}
        onClose={() => setIsHealthTestsModalOpen(false)}
        language={language}
      />

      {/* Global Footer with Brand Story & African Footprint */}
      <Footer
        language={language}
        selectedCountry={selectedCountry}
        onOpenSplash={() => setIsSplashOpen(true)}
        onOpenUploadRx={() => setIsUploadRxOpen(true)}
        onOpenLegal={() => setIsLegalModalOpen(true)}
        onOpenHealthTests={() => setIsHealthTestsModalOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <SiteSettingsProvider>
        <AppInner />
      </SiteSettingsProvider>
    </LanguageProvider>
  );
}
