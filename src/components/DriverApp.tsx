import React, { useState } from 'react';
import { 
  Order, 
  Language, 
  CountryConfig,
  DriverProfile,
  OrderStatus
} from '../types';
import { TRANSLATIONS } from '../data/translations';
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
    return (usdAmount * selectedCountry.exchangeRateToUSD).toFixed(0);
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
    <div className="space-y-6" id="driver-app-root">
      {/* Top Driver Header with Profile, Status Toggle, and Switcher */}
      <div className="bg-[#1B4332] text-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#2D6A4F]/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentDriver.photoUrl}
              alt={currentDriver.name}
              referrerPolicy="no-referrer"
              className="h-16 w-16 rounded-2xl object-cover border-2 border-[#74C69D] shadow-md"
            />
            <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#1B4332] ${
              driverStatus === 'online' ? 'bg-[#52B788]' : driverStatus === 'on_delivery' ? 'bg-blue-400' : driverStatus === 'busy' ? 'bg-amber-400' : 'bg-neutral-400'
            }`} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{currentDriver.name}</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/15 text-[#D8F3DC] border border-white/20">
                ★ {currentDriver.rating} ({currentDriver.totalDeliveries} trips)
              </span>
            </div>

            <p className="text-xs text-[#D8F3DC]/90 mt-1 flex flex-wrap items-center gap-x-2">
              <span>{currentDriver.vehiclePlate}</span>
              <span>•</span>
              <span className="capitalize">{currentDriver.vehicleType.replace('_', ' ')}</span>
              <span>•</span>
              <span className="text-[#74C69D] font-bold">On-time: {currentDriver.onTimeRate}%</span>
            </p>
          </div>
        </div>

        {/* Status Switcher & Driver Selector */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Real-time Status Toggle (Online / Offline / Busy / On Delivery) */}
          <div className="bg-white/10 p-1 rounded-2xl border border-white/20 flex items-center gap-1">
            <button
              onClick={() => handleStatusChange('online')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                driverStatus === 'online' ? 'bg-[#52B788] text-[#1B4332] shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              Online
            </button>
            <button
              onClick={() => handleStatusChange('busy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                driverStatus === 'busy' ? 'bg-amber-400 text-amber-950 shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              Busy
            </button>
            <button
              onClick={() => handleStatusChange('offline')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                driverStatus === 'offline' ? 'bg-neutral-600 text-white shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              Offline
            </button>
          </div>

          {/* Driver Switcher & Register */}
          <div className="relative">
            <select
              value={selectedDriverId}
              onChange={(e) => {
                setSelectedDriverId(e.target.value);
                const found = drivers.find((d) => d.id === e.target.value);
                if (found) setDriverStatus(found.status);
              }}
              className="bg-white/10 text-white text-xs font-bold px-3.5 py-2 rounded-2xl border border-white/20 hover:bg-white/15 focus:outline-none appearance-none pr-8 cursor-pointer"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id} className="text-neutral-900 bg-white">
                  {d.name} ({d.vehicleType})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-white/70 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => setIsRegisterDriverOpen(true)}
            className="p-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 cursor-pointer shadow-xs"
            title="Register New Driver"
          >
            <Plus className="w-4 h-4 text-[#74C69D]" />
          </button>
        </div>
      </div>

      {/* Driver Daily Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-[#D8E2DC] shadow-xs">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Today's Earnings</p>
          <p className="text-lg font-black text-[#1B4332] mt-0.5">
            {selectedCountry.currencySymbol} {toLocal(42.50)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#D8E2DC] shadow-xs">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Completed Deliveries</p>
          <p className="text-lg font-black text-[#1B4332] mt-0.5">6 Orders</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#D8E2DC] shadow-xs">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Cold-Chain Sensor</p>
          <p className="text-lg font-black text-blue-700 mt-0.5 flex items-center gap-1">
            <Thermometer className="w-4 h-4" />
            <span>{tempReading}°C (Safe)</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#D8E2DC] shadow-xs">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Safety Rating</p>
          <p className="text-lg font-black text-[#2D6A4F] mt-0.5">100% Tamper Free</p>
        </div>
      </div>

      {/* Active Trip Dispatch Card */}
      {activeTrip ? (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D8E2DC] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#52B788]/20 text-[#1B4332] border border-[#52B788]/40 uppercase tracking-wider">
                  Active Dispatch Mission
                </span>
                <span className="text-xs font-bold text-neutral-400">Order #{activeTrip.orderNumber}</span>
              </div>
              <h2 className="text-xl font-black text-[#1B4332] mt-1.5">
                Deliver to {activeTrip.customerName}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${activeTrip.customerPhone}`}
                className="px-4 py-2 rounded-2xl bg-[#E8F5E9] hover:bg-[#C7E9D0] text-[#1B4332] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-[#2D6A4F]" />
                <span>Call Patient</span>
              </a>
            </div>
          </div>

          {/* Turn-by-Turn Route Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1: Pharmacy Pick up */}
            <div className="p-4 rounded-2xl bg-[#F4F7F5] border border-[#D8E2DC] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>Step 1: Origin Pharmacy</span>
                </span>
                <span className="text-xs font-bold text-[#2D6A4F]">Pickup Ready ✓</span>
              </div>

              <div>
                <h4 className="font-black text-sm text-[#1B4332]">{activeTrip.pharmacyName}</h4>
                <p className="text-xs text-neutral-600 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                  <span>{activeTrip.pharmacyAddress || 'Sarit Centre Ground Fl, Westlands'}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#D8E2DC] text-xs text-neutral-700 flex items-center justify-between">
                <span>Tamper-Evident Box Seal:</span>
                <span className="font-mono font-bold text-[#1B4332]">#DAWA-SEC-KE-8492</span>
              </div>
            </div>

            {/* Step 2: Customer Destination */}
            <div className="p-4 rounded-2xl bg-[#F4F7F5] border border-[#D8E2DC] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Step 2: Destination Drop-off</span>
                </span>
                <span className="text-xs font-bold text-blue-700">{activeTrip.distanceKm} km away</span>
              </div>

              <div>
                <h4 className="font-black text-sm text-[#1B4332]">{activeTrip.customerName}</h4>
                <p className="text-xs text-neutral-600 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{activeTrip.deliveryAddress}, {activeTrip.city}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#D8E2DC] text-xs text-neutral-700 flex items-center justify-between">
                <span>Estimated Drive Time:</span>
                <span className="font-bold text-[#1B4332]">{activeTrip.estimatedDeliveryMin} minutes</span>
              </div>
            </div>
          </div>

          {/* Real-time Cold-Chain Health Guard */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-blue-950">Active Thermal Cold-Chain Monitoring</h4>
                <p className="text-xs text-blue-700 mt-0.5">
                  IoT Box Sensor: <strong>{tempReading}°C</strong> (Compliant: 2°C – 8°C range)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTempReading((prev) => Math.max(2.1, parseFloat((prev - 0.2).toFixed(1))))}
                className="px-2.5 py-1 rounded-lg bg-blue-200 text-blue-900 text-xs font-bold cursor-pointer"
                title="Simulate chiller cooling"
              >
                Cooler (-0.2°)
              </button>
              <button
                onClick={() => setTempReading((prev) => Math.min(7.8, parseFloat((prev + 0.2).toFixed(1))))}
                className="px-2.5 py-1 rounded-lg bg-blue-200 text-blue-900 text-xs font-bold cursor-pointer"
                title="Simulate ambient warm"
              >
                Warmer (+0.2°)
              </button>
            </div>
          </div>

          {/* Delivery Handover Verification Section */}
          <div className="p-6 rounded-3xl bg-[#F4F7F5] border border-[#D8E2DC] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8E2DC] pb-3">
              <div>
                <h3 className="text-base font-black text-[#1B4332] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#2D6A4F]" />
                  <span>Secure Patient Handover Verification</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Confirm genuine patient recipient via 4-Digit Security PIN, QR Code, or Digital Signature.
                </p>
              </div>

              {/* Handover Mode Tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#D8E2DC]">
                <button
                  type="button"
                  onClick={() => setHandoverMode('pin')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    handoverMode === 'pin' ? 'bg-[#1B4332] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  4-Digit PIN (OTP)
                </button>
                <button
                  type="button"
                  onClick={() => setHandoverMode('qr')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    handoverMode === 'qr' ? 'bg-[#1B4332] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Scan QR
                </button>
                <button
                  type="button"
                  onClick={() => setHandoverMode('signature')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    handoverMode === 'signature' ? 'bg-[#1B4332] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Patient Sign
                </button>
              </div>
            </div>

            {deliveredSuccess ? (
              <div className="py-6 text-center text-xs">
                <CheckCircle2 className="w-12 h-12 text-[#2D6A4F] mx-auto mb-2" />
                <h4 className="text-base font-black text-[#1B4332]">Delivery Confirmed & Finalized!</h4>
                <p className="text-neutral-600 mt-1">
                  Payment settled and cold-chain audit log securely archived with timestamp.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDeliveryConfirm} className="space-y-4 text-xs">
                {handoverMode === 'pin' && (
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1.5">
                      Enter Customer's 4-Digit Delivery PIN *
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1 max-w-xs">
                        <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          maxLength={4}
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 6621"
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white font-mono text-base font-black tracking-widest text-[#1B4332] border border-[#D8E2DC] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                        />
                      </div>
                      <span className="text-[11px] text-neutral-500">
                        (Demo Hint: Customer PIN is <strong>{activeTrip.deliveryOtp}</strong>)
                      </span>
                    </div>
                  </div>
                )}

                {handoverMode === 'qr' && (
                  <div className="p-4 rounded-2xl bg-white border border-[#D8E2DC] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-neutral-100 flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-[#1B4332]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1B4332]">Scan Recipient App Code</h4>
                        <p className="text-[11px] text-neutral-500">Camera reader ready for instant cryptographic verification.</p>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-[#52B788]/20 text-[#1B4332] font-bold text-xs">
                      Ready to Scan
                    </span>
                  </div>
                )}

                {handoverMode === 'signature' && (
                  <div className="space-y-2">
                    <label className="block font-bold text-neutral-700">
                      Patient / Authorized Recipient Signature
                    </label>
                    <div className="p-4 rounded-2xl bg-white border-2 border-dashed border-[#D8E2DC] h-24 flex flex-col items-center justify-center text-neutral-400 text-xs cursor-crosshair">
                      <Edit3 className="w-5 h-5 mb-1 text-[#2D6A4F]" />
                      <span>{signatureName ? `Signed: ${signatureName}` : 'Sign with finger or stylus on recipient touchscreen'}</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Type Recipient Full Name (e.g. Grace Muthoni)"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D8E2DC] text-xs"
                    />
                  </div>
                )}

                {otpError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>Incorrect PIN. Please ask customer to read the 4-digit code from their DAWA MED app.</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="px-6 py-3 rounded-2xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <span>Verifying Handshake...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#74C69D]" />
                        <span>Complete Handover & Collect Payment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#D8E2DC]">
          <Truck className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1B4332]">No Assigned Trips Right Now</h3>
          <p className="text-xs text-neutral-500 mt-1">Keep your status Online to receive incoming nearby medicine dispatches.</p>
        </div>
      )}

      {/* MODAL: REGISTER NEW DRIVER */}
      <AnimatePresence>
        {isRegisterDriverOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#D8E2DC] my-8"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Bike className="w-5 h-5 text-[#2D6A4F]" />
                  <h3 className="text-base font-black text-[#1B4332]">Register New Medical Courier</h3>
                </div>
                <button onClick={() => setIsRegisterDriverOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {regSuccess ? (
                <div className="py-6 text-center text-xs">
                  <CheckCircle2 className="w-10 h-10 text-[#2D6A4F] mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-[#1B4332]">Driver Profile Registered</h4>
                  <p className="text-neutral-500 mt-1">Driver is now verified and active in dispatch fleet.</p>
                </div>
              ) : (
                <form onSubmit={handleRegisterDriver} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amani Mwangi"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F4F7F5] border border-[#D8E2DC]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Phone Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="+254 700 ..."
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F4F7F5] border border-[#D8E2DC]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">National ID / Passport *</label>
                      <input
                        type="text"
                        required
                        placeholder="ID-KE-..."
                        value={regIdNum}
                        onChange={(e) => setRegIdNum(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F4F7F5] border border-[#D8E2DC] font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Vehicle Type</label>
                      <select
                        value={regVehicleType}
                        onChange={(e) => setRegVehicleType(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F4F7F5] border border-[#D8E2DC]"
                      >
                        <option value="motorcycle">Motorcycle (Standard)</option>
                        <option value="electric_scooter">Electric Scooter (EV)</option>
                        <option value="refrigerated_van">Cold-Box Refrigerated Van</option>
                        <option value="bicycle">Medical Bicycle Courier</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Plate / Registration *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. KMD 842E"
                        value={regPlate}
                        onChange={(e) => setRegPlate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F4F7F5] border border-[#D8E2DC]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => setIsRegisterDriverOpen(false)}
                      className="px-4 py-2.5 rounded-2xl text-neutral-600 hover:bg-neutral-100 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-2xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold shadow-sm"
                    >
                      Add to Fleet
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
