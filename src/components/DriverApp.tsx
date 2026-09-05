import React, { useState } from 'react';
import { 
  Order, 
  Language, 
  CountryConfig,
  DriverProfile,
  OrderStatus
} from '../types';
import { TRANSLATIONS } from '../data/translations';
import { translate, formatCurrency, formatNumber } from '../utils/i18n';
import { SAMPLE_DRIVERS } from '../data/mockData';
import { 
  Bike, 
  MapPin, 
  Thermometer, 
  Phone, 
  CheckCircle2, 
  ShieldCheck, 
  Navigation, 
  QrCode, 
  Lock,
  Clock,
  ArrowRight,
  AlertCircle,
  Activity,
  Check,
  User,
  Plus,
  Compass,
  DollarSign,
  Package,
  Layers,
  ChevronDown,
  XCircle,
  Truck,
  Sparkles,
  PhoneCall,
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

interface DriverAppProps {
  orders: Order[];
  onCompleteDelivery: (orderId: string, otp: string) => boolean;
  onAdvanceStatus?: (orderId: string, status: OrderStatus) => void;
  language: Language;
  selectedCountry: CountryConfig;
}

export const DriverApp: React.FC<DriverAppProps> = ({
  orders,
  onCompleteDelivery,
  onAdvanceStatus,
  language,
  selectedCountry,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isRtl = language === 'ar';

  // Drivers List & Selected Driver
  const [drivers, setDrivers] = useState<DriverProfile[]>(SAMPLE_DRIVERS);
  const [selectedDriverId, setSelectedDriverId] = useState<string>(SAMPLE_DRIVERS[0].id);

  const currentDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];

  // Active Trip State
  const activeTrip = orders.find((o) => o.status === 'out_for_delivery' || o.status === 'in_transit' || o.status === 'picked_up' || o.status === 'ready_for_pickup' || o.status === 'driver_assigned') || orders[0];

  // Driver Status
  const [driverStatus, setDriverStatus] = useState<'online' | 'offline' | 'busy' | 'on_delivery'>(currentDriver.status);

  // Delivery Handover Form
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [tempReading, setTempReading] = useState(currentDriver.temperatureReading || 4.2);
  const [isVerifying, setIsVerifying] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [handoverMode, setHandoverMode] = useState<'pin' | 'qr' | 'signature'>('pin');
  const [deliveredSuccess, setDeliveredSuccess] = useState(false);

  // New Driver Registration Modal
  const [isRegisterDriverOpen, setIsRegisterDriverOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regIdNum, setRegIdNum] = useState('');
  const [regVehicleType, setRegVehicleType] = useState<'motorcycle' | 'bicycle' | 'electric_scooter' | 'refrigerated_van'>('motorcycle');
  const [regPlate, setRegPlate] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  const toLocal = (usdAmount: number) => {
    return formatCurrency(usdAmount, selectedCountry, language);
  };

  const getVehicleLabel = (type: string) => {
    switch (type) {
      case 'motorcycle': return translate('motorcycleStandard', language);
      case 'electric_scooter': return translate('electricScooterEv', language);
      case 'refrigerated_van': return translate('refrigeratedVan', language);
      case 'bicycle': return translate('bicycleMedical', language);
      default: return type;
    }
  };

  const handleStatusChange = (newStatus: 'online' | 'offline' | 'busy' | 'on_delivery') => {
    setDriverStatus(newStatus);
    setDrivers((prev) =>
      prev.map((d) => (d.id === currentDriver.id ? { ...d, status: newStatus } : d))
    );
  };

  const handleDeliveryConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return;

    setIsVerifying(true);
    setTimeout(() => {
      // In QR or Signature mode, auto-use the correct OTP
      const otpToTest = handoverMode === 'pin' ? enteredOtp : activeTrip.deliveryOtp;
      const success = onCompleteDelivery(activeTrip.id, otpToTest);
      setIsVerifying(false);

      if (success) {
        setOtpError(false);
        setEnteredOtp('');
        setDeliveredSuccess(true);
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
        setTimeout(() => {
          setDeliveredSuccess(false);
        }, 3000);
      } else {
        setOtpError(true);
      }
    }, 700);
  };

  const handleRegisterDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const newDriver: DriverProfile = {
      id: `drv-${Date.now()}`,
      name: regName,
      phone: regPhone,
      idNumber: regIdNum,
      vehicleType: regVehicleType,
      vehiclePlate: regPlate,
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'online',
      verificationStatus: 'verified',
      rating: 5.0,
      totalDeliveries: 0,
      onTimeRate: 100,
      currentLocation: { lat: -1.286389, lng: 36.817223, area: 'Nairobi Central' },
      temperatureReading: 4.0,
    };

    setDrivers((prev) => [newDriver, ...prev]);
    setSelectedDriverId(newDriver.id);
    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setIsRegisterDriverOpen(false);
      setRegName('');
      setRegPhone('');
      setRegPlate('');
    }, 1200);
  };

  return (
    <div className="space-y-6 w-full max-w-full box-border" id="driver-app-root" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Driver Header with Profile, Status Toggle, and Switcher */}
      <div className="bg-[#084F30] text-white rounded-3xl p-4 sm:p-6 lg:p-7 shadow-sm border border-[#0E7A4B]/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 box-border">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="relative shrink-0">
            <img
              src={currentDriver.photoUrl}
              alt={currentDriver.name}
              referrerPolicy="no-referrer"
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl object-cover border-2 border-[#E8F5EE] shadow-md"
            />
            <span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border-2 border-[#084F30] ${
              driverStatus === 'online' ? 'bg-[#0E7A4B]' : driverStatus === 'on_delivery' ? 'bg-blue-400' : driverStatus === 'busy' ? 'bg-amber-400' : 'bg-neutral-400'
            }`} />
          </div>

          <div className="min-w-0 text-start">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-white truncate">{currentDriver.name}</h1>
              <span className="text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/15 text-[#E8F5EE] border border-white/20 whitespace-nowrap">
                ★ {currentDriver.rating} ({formatNumber(currentDriver.totalDeliveries, language)} {translate('trips', language)})
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-[#E8F5EE]/90 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>{currentDriver.vehiclePlate}</span>
              <span>•</span>
              <span>{getVehicleLabel(currentDriver.vehicleType)}</span>
              <span>•</span>
              <span className="text-[#0E7A4B] font-bold">{translate('onTime', language)}: {currentDriver.onTimeRate}%</span>
            </p>
          </div>
        </div>

        {/* Status Switcher & Driver Selector */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          {/* Real-time Status Toggle (Online / Offline / Busy / On Delivery) */}
          <div className="bg-white/10 p-1 rounded-2xl border border-white/20 flex items-center gap-1">
            <button
              onClick={() => handleStatusChange('online')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                driverStatus === 'online' ? 'bg-[#0E7A4B] text-white shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              {translate('online', language)}
            </button>
            <button
              onClick={() => handleStatusChange('busy')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                driverStatus === 'busy' ? 'bg-amber-400 text-amber-950 shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              {translate('busy', language)}
            </button>
            <button
              onClick={() => handleStatusChange('offline')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                driverStatus === 'offline' ? 'bg-neutral-600 text-white shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              {translate('offline', language)}
            </button>
          </div>

          {/* Driver Switcher & Register */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={selectedDriverId}
              onChange={(e) => {
                setSelectedDriverId(e.target.value);
                const found = drivers.find((d) => d.id === e.target.value);
                if (found) setDriverStatus(found.status);
              }}
              className="w-full sm:w-auto bg-white/10 text-white text-xs font-bold px-3 py-2 pe-8 rounded-2xl border border-white/20 hover:bg-white/15 focus:outline-none appearance-none cursor-pointer"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id} className="text-neutral-900 bg-white">
                  {d.name} ({getVehicleLabel(d.vehicleType)})
                </option>
              ))}
            </select>
            <ChevronDown className={`w-4 h-4 text-white/70 absolute top-1/2 -translate-y-1/2 pointer-events-none ${isRtl ? 'left-2.5' : 'right-2.5'}`} />
          </div>

          <button
            onClick={() => setIsRegisterDriverOpen(true)}
            className="p-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 cursor-pointer shadow-xs"
            title={translate('registerCourierModalTitle', language)}
          >
            <Plus className="w-4 h-4 text-[#0E7A4B]" />
          </button>
        </div>
      </div>

      {/* Driver Daily Metrics (Responsive: 1 col on XS, 2 on SM, 4 on LG) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 box-border">
        <div className="bg-white rounded-2xl p-4 border border-[#E8F5EE] shadow-xs text-start">
          <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">{translate('todaysEarnings', language)}</p>
          <p className="text-lg font-black text-[#111827] mt-0.5">
            {toLocal(42.50)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E8F5EE] shadow-xs text-start">
          <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">{translate('completedDeliveries', language)}</p>
          <p className="text-lg font-black text-[#111827] mt-0.5">{formatNumber(6, language)} {translate('ordersUnit', language)}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E8F5EE] shadow-xs text-start">
          <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">{translate('coldChainSensor', language)}</p>
          <p className="text-lg font-black text-blue-700 mt-0.5 flex items-center gap-1">
            <Thermometer className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{tempReading}°C ({translate('safeReading', language)})</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E8F5EE] shadow-xs text-start">
          <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">{translate('safetyRating', language)}</p>
          <p className="text-lg font-black text-[#0E7A4B] mt-0.5">{translate('tamperFree100', language)}</p>
        </div>
      </div>

      {/* Active Trip Dispatch Card */}
      {activeTrip ? (
        <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-7 border border-[#E8F5EE] shadow-xs space-y-6 box-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4 text-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#E8F5EE] text-[#0E7A4B] border border-[#D0EADB] uppercase tracking-wider">
                  {translate('activeDispatchMission', language)}
                </span>
                <span className="text-xs font-bold text-neutral-400">#{activeTrip.orderNumber}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#111827] mt-1.5">
                {translate('deliverToPatient', language)} {activeTrip.customerName}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${activeTrip.customerPhone}`}
                className="px-4 py-2 rounded-2xl bg-[#E8F5EE] hover:bg-[#D0EADB] text-[#0E7A4B] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-[#0E7A4B]" />
                <span>{translate('callPatient', language)}</span>
              </a>
            </div>
          </div>

          {/* Turn-by-Turn Route Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 box-border text-start">
            {/* Step 1: Pharmacy Pick up */}
            <div className="p-4 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] space-y-3 box-border">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-[#0E7A4B] shrink-0" />
                  <span>{translate('step1OriginPharmacy', language)}</span>
                </span>
                <span className="text-xs font-bold text-[#0E7A4B]">{translate('pickupReady', language)}</span>
              </div>

              <div>
                <h4 className="font-black text-sm text-[#111827]">{activeTrip.pharmacyName}</h4>
                <p className="text-xs text-[#6B7280] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0E7A4B] shrink-0" />
                  <span>{activeTrip.pharmacyAddress || 'Central Medical Hub'}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E8F5EE] text-xs text-neutral-700 flex items-center justify-between">
                <span>{translate('tamperEvidentSealBox', language)}</span>
                <span className="font-mono font-bold text-[#0E7A4B]">#DAWA-SEC-{selectedCountry.code}-8492</span>
              </div>
            </div>

            {/* Step 2: Customer Destination */}
            <div className="p-4 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] space-y-3 box-border">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{translate('step2DestinationDropoff', language)}</span>
                </span>
                <span className="text-xs font-bold text-blue-700">{activeTrip.distanceKm} {translate('kmAway', language)}</span>
              </div>

              <div>
                <h4 className="font-black text-sm text-[#111827]">{activeTrip.customerName}</h4>
                <p className="text-xs text-[#6B7280] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{activeTrip.deliveryAddress}, {activeTrip.city}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E8F5EE] text-xs text-neutral-700 flex items-center justify-between">
                <span>{translate('estimatedDriveTime', language)}</span>
                <span className="font-bold text-[#111827]">{activeTrip.estimatedDeliveryMinutes || 20} {translate('minutes', language)}</span>
              </div>
            </div>
          </div>

          {/* Real-time Cold-Chain Health Guard */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 box-border text-start">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-blue-950">{translate('activeThermalMonitoring', language)}</h4>
                <p className="text-xs text-blue-700 mt-0.5">
                  IoT Box Sensor: <strong>{tempReading}°C</strong> ({translate('iotSensorCompliant', language)})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setTempReading((prev) => Math.max(2.1, parseFloat((prev - 0.2).toFixed(1))))}
                className="px-2.5 py-1 rounded-lg bg-blue-200 hover:bg-blue-300 text-blue-900 text-xs font-bold cursor-pointer transition-colors"
                title="Simulate chiller cooling"
              >
                {translate('coolerBtn', language)}
              </button>
              <button
                onClick={() => setTempReading((prev) => Math.min(7.8, parseFloat((prev + 0.2).toFixed(1))))}
                className="px-2.5 py-1 rounded-lg bg-blue-200 hover:bg-blue-300 text-blue-900 text-xs font-bold cursor-pointer transition-colors"
                title="Simulate ambient warm"
              >
                {translate('warmerBtn', language)}
              </button>
            </div>
          </div>

          {/* Delivery Handover Verification Section */}
          <div className="p-4 sm:p-6 rounded-3xl bg-[#F1FAF4] border border-[#E8F5EE] space-y-4 box-border text-start">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8F5EE] pb-3">
              <div>
                <h3 className="text-base font-black text-[#111827] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0E7A4B] shrink-0" />
                  <span>{translate('secureHandoverVerification', language)}</span>
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {translate('secureHandoverDesc', language)}
                </p>
              </div>

              {/* Handover Mode Tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E8F5EE] shrink-0">
                <button
                  type="button"
                  onClick={() => setHandoverMode('pin')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    handoverMode === 'pin' ? 'bg-[#0E7A4B] text-white shadow-xs' : 'text-[#111827] hover:text-[#0E7A4B]'
                  }`}
                >
                  {translate('pinOtpTab', language)}
                </button>
                <button
                  type="button"
                  onClick={() => setHandoverMode('qr')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    handoverMode === 'qr' ? 'bg-[#0E7A4B] text-white shadow-xs' : 'text-[#111827] hover:text-[#0E7A4B]'
                  }`}
                >
                  {translate('scanQrTab', language)}
                </button>
                <button
                  type="button"
                  onClick={() => setHandoverMode('signature')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    handoverMode === 'signature' ? 'bg-[#0E7A4B] text-white shadow-xs' : 'text-[#111827] hover:text-[#0E7A4B]'
                  }`}
                >
                  {translate('patientSignTab', language)}
                </button>
              </div>
            </div>

            {deliveredSuccess ? (
              <div className="py-6 text-center text-xs">
                <CheckCircle2 className="w-12 h-12 text-[#0E7A4B] mx-auto mb-2" />
                <h4 className="text-base font-black text-[#111827]">{translate('deliveryConfirmedFinalized', language)}</h4>
                <p className="text-[#6B7280] mt-1">
                  {translate('paymentSettledArchive', language)}
                </p>
              </div>
            ) : (
              <form onSubmit={handleDeliveryConfirm} className="space-y-4 text-xs">
                {handoverMode === 'pin' && (
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1.5">
                      {translate('enterCustomerPin', language)}
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="relative w-full sm:max-w-xs">
                        <Lock className={`w-4 h-4 text-neutral-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                        <input
                          type="text"
                          maxLength={4}
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 6621"
                          className={`w-full py-2.5 rounded-2xl bg-white font-mono text-base font-black tracking-widest text-[#111827] border border-[#E8F5EE] focus:ring-2 focus:ring-[#0E7A4B] focus:outline-none ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                        />
                      </div>
                      <span className="text-[11px] text-neutral-500">
                        ({translate('demoHintCustomerPin', language)} <strong>{activeTrip.deliveryOtp}</strong>)
                      </span>
                    </div>
                  </div>
                )}

                {handoverMode === 'qr' && (
                  <div className="p-4 rounded-2xl bg-white border border-[#E8F5EE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                        <QrCode className="w-6 h-6 text-[#0E7A4B]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#111827]">{translate('scanRecipientAppCode', language)}</h4>
                        <p className="text-[11px] text-neutral-500">{translate('cameraReaderReady', language)}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-[#E8F5EE] text-[#0E7A4B] font-bold text-xs">
                      {translate('readyToScanBadge', language)}
                    </span>
                  </div>
                )}

                {handoverMode === 'signature' && (
                  <div className="space-y-2">
                    <label className="block font-bold text-neutral-700">
                      {translate('patientAuthorizedSign', language)}
                    </label>
                    <div className="p-4 rounded-2xl bg-white border-2 border-dashed border-[#E8F5EE] h-24 flex flex-col items-center justify-center text-neutral-400 text-xs cursor-crosshair">
                      <Edit3 className="w-5 h-5 mb-1 text-[#0E7A4B]" />
                      <span>{signatureName ? `${translate('signedByPrefix', language)} ${signatureName}` : translate('signTouchscreenHint', language)}</span>
                    </div>
                    <input
                      type="text"
                      placeholder={translate('typeRecipientName', language)}
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8F5EE] text-xs focus:ring-2 focus:ring-[#0E7A4B] focus:outline-none"
                    />
                  </div>
                )}

                {otpError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{translate('incorrectPinError', language)}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <span>{translate('verifyingHandshake', language)}</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#E8F5EE]" />
                        <span>{translate('completeHandoverCollect', language)}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#E8F5EE] box-border">
          <Truck className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#111827]">{translate('noAssignedTripsTitle', language)}</h3>
          <p className="text-xs text-[#6B7280] mt-1">{translate('noAssignedTripsSubtitle', language)}</p>
        </div>
      )}

      {/* MODAL: REGISTER NEW DRIVER */}
      <AnimatePresence>
        {isRegisterDriverOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-[#E8F5EE] my-8 box-border"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Bike className="w-5 h-5 text-[#0E7A4B]" />
                  <h3 className="text-base font-black text-[#111827]">{translate('registerCourierModalTitle', language)}</h3>
                </div>
                <button onClick={() => setIsRegisterDriverOpen(false)} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {regSuccess ? (
                <div className="py-6 text-center text-xs">
                  <CheckCircle2 className="w-10 h-10 text-[#0E7A4B] mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-[#111827]">{translate('driverProfileRegistered', language)}</h4>
                  <p className="text-[#6B7280] mt-1">{translate('driverActiveInFleet', language)}</p>
                </div>
              ) : (
                <form onSubmit={handleRegisterDriver} className="space-y-3.5 text-xs text-start">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">{translate('fullName', language) || 'Full Name'} *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amani Mwangi"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] focus:ring-2 focus:ring-[#0E7A4B] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">{translate('phoneNumber', language) || 'Phone Number'} *</label>
                      <input
                        type="text"
                        required
                        placeholder="+254 700 ..."
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] focus:ring-2 focus:ring-[#0E7A4B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">{translate('nationalIdPassport', language)}</label>
                      <input
                        type="text"
                        required
                        placeholder="ID-KE-..."
                        value={regIdNum}
                        onChange={(e) => setRegIdNum(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] font-mono focus:ring-2 focus:ring-[#0E7A4B] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">{translate('vehicleType', language)}</label>
                      <select
                        value={regVehicleType}
                        onChange={(e) => setRegVehicleType(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] focus:ring-2 focus:ring-[#0E7A4B] focus:outline-none"
                      >
                        <option value="motorcycle">{translate('motorcycleStandard', language)}</option>
                        <option value="electric_scooter">{translate('electricScooterEv', language)}</option>
                        <option value="refrigerated_van">{translate('refrigeratedVan', language)}</option>
                        <option value="bicycle">{translate('bicycleMedical', language)}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">{translate('plateRegistration', language)}</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. KMD 842E"
                        value={regPlate}
                        onChange={(e) => setRegPlate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F1FAF4] border border-[#E8F5EE] focus:ring-2 focus:ring-[#0E7A4B] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => setIsRegisterDriverOpen(false)}
                      className="px-4 py-2.5 rounded-2xl text-neutral-600 hover:bg-neutral-100 font-bold cursor-pointer"
                    >
                      {translate('cancel', language)}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-2xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold shadow-sm cursor-pointer"
                    >
                      {translate('addToFleet', language)}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
