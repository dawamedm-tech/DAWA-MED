import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  Bike, 
  Building2, 
  ThermometerSnowflake, 
  Clock, 
  Phone, 
  ShieldCheck, 
  Layers, 
  Compass, 
  Maximize2,
  RefreshCw,
  MessageCircle,
  Key
} from 'lucide-react';
import { Order, CountryConfig, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface InteractiveMapProps {
  order: Order;
  selectedCountry: CountryConfig;
  language: Language;
  onCallDriver?: (phone: string) => void;
  onOpenQrVerification?: (order: Order) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  order,
  selectedCountry,
  language,
  onCallDriver,
  onOpenQrVerification,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isAr = language === 'ar';

  // Driver simulated progress (0% = at pharmacy, 100% = arrived at customer)
  const [progress, setProgress] = useState<number>(45);
  const [activeZoneLayer, setActiveZoneLayer] = useState<boolean>(true);
  const [driverSpeed, setDriverSpeed] = useState<number>(32);
  const [currentTemp, setCurrentTemp] = useState<number>(order.driverTemperature || 4.2);
  const [etaMinutes, setEtaMinutes] = useState<number>(order.estimatedDeliveryMinutes || 16);

  // Animate courier movement smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        const next = prev + 1.2;
        return Number(next.toFixed(1));
      });

      // Small jitter in speed & temperature for authentic live telemetry
      setDriverSpeed((prev) => Math.min(48, Math.max(18, Math.round(prev + (Math.random() * 4 - 2)))));
      setCurrentTemp((prev) => {
        const val = prev + (Math.random() * 0.1 - 0.05);
        return Number(Math.min(5.2, Math.max(3.8, val)).toFixed(1));
      });
      setEtaMinutes((prev) => Math.max(2, Math.round((1 - progress / 100) * (order.estimatedDeliveryMinutes || 20))));
    }, 2500);

    return () => clearInterval(interval);
  }, [progress, order.estimatedDeliveryMinutes]);

  // Coordinate interpolation on SVG 800x400 canvas
  // Pharmacy at (120, 280), Customer at (680, 110)
  // Bezier curve points: P0(120, 280) -> C1(320, 310) -> C2(480, 90) -> P1(680, 110)
  const tNorm = progress / 100;
  const p0 = { x: 120, y: 280 };
  const c1 = { x: 340, y: 290 };
  const c2 = { x: 460, y: 120 };
  const p1 = { x: 680, y: 110 };

  // Cubic Bezier interpolation
  const u = 1 - tNorm;
  const driverX = u * u * u * p0.x + 3 * u * u * tNorm * c1.x + 3 * u * tNorm * tNorm * c2.x + tNorm * tNorm * tNorm * p1.x;
  const driverY = u * u * u * p0.y + 3 * u * u * tNorm * c1.y + 3 * u * tNorm * tNorm * c2.y + tNorm * tNorm * tNorm * p1.y;

  return (
    <div className="bg-white rounded-3xl border border-[#E8F5EE] shadow-xs overflow-hidden" id="interactive-gps-map">
      {/* Map Header & Controls */}
      <div className="p-4 bg-[#F1FAF4] border-b border-[#E8F5EE] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] text-[#0E7A4B] flex items-center justify-center">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-[#111827]">
                {isAr ? 'تتبع مسار التوصيل المباشر GPS' : 'Live GPS Delivery Tracking & Route'}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                LIVE
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {order.pharmacyName} → {order.deliveryAddress}
            </p>
          </div>
        </div>

        {/* Action badges & Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveZoneLayer(!activeZoneLayer)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeZoneLayer 
                ? 'bg-[#0E7A4B] text-white' 
                : 'bg-white text-[#0E7A4B] border border-[#E8F5EE] hover:bg-[#E8F5EE]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? 'نطاقات التوصيل' : 'Delivery Zones'}</span>
          </button>

          {onOpenQrVerification && (
            <button
              onClick={() => onOpenQrVerification(order)}
              className="px-3 py-1.5 rounded-xl bg-[#E8F5EE] hover:bg-[#E8F5EE] text-[#111827] border border-[#D0EADB] text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#0E7A4B]" />
              <span>{isAr ? 'رمز QR الآمن' : 'Safe QR Code'}</span>
            </button>
          )}
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full h-80 sm:h-96 bg-[#EBF3ED] overflow-hidden select-none">
        {/* City Streets & Buildings Grid Pattern */}
        <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
          <defs>
            {/* Grid Pattern */}
            <pattern id="streetGrid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#D3E5DA" strokeWidth="2" />
              <rect x="10" y="10" width="25" height="25" fill="#DEEDE3" rx="4" />
              <rect x="45" y="10" width="25" height="25" fill="#DEEDE3" rx="4" />
              <rect x="10" y="45" width="25" height="25" fill="#DEEDE3" rx="4" />
              <rect x="45" y="45" width="25" height="25" fill="#DEEDE3" rx="4" />
            </pattern>

            {/* Zone Fill Gradients */}
            <radialGradient id="zoneA" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0E7A4B" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0E7A4B" stopOpacity="0.02" />
            </radialGradient>
            <radialGradient id="zoneB" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F4A261" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#F4A261" stopOpacity="0.02" />
            </radialGradient>
          </defs>

          {/* Background Street Grid */}
          <rect width="100%" height="100%" fill="url(#streetGrid)" />

          {/* Major Roads */}
          <path d="M 0 150 Q 400 130 800 180" fill="none" stroke="#FFFFFF" strokeWidth="16" />
          <path d="M 0 150 Q 400 130 800 180" fill="none" stroke="#C2DCD0" strokeWidth="12" />
          
          <path d="M 250 0 Q 320 200 400 400" fill="none" stroke="#FFFFFF" strokeWidth="14" />
          <path d="M 250 0 Q 320 200 400 400" fill="none" stroke="#C2DCD0" strokeWidth="10" />

          {/* Delivery Zones Overlay */}
          {activeZoneLayer && (
            <g className="transition-opacity duration-300">
              <circle cx="120" cy="280" r="180" fill="url(#zoneA)" stroke="#0E7A4B" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="70" y="380" fill="#0E7A4B" fontSize="10" fontWeight="bold">Zone A (Express &lt; 45m)</text>

              <circle cx="120" cy="280" r="320" fill="url(#zoneB)" stroke="#F4A261" strokeWidth="1.5" strokeDasharray="6 6" />
              <text x="350" y="385" fill="#B26A28" fontSize="10" fontWeight="bold">Zone B (Metro Wide &lt; 90m)</text>
            </g>
          )}

          {/* Planned Delivery Route Polyline */}
          <path
            d="M 120 280 C 340 290, 460 120, 680 110"
            fill="none"
            stroke="#0E7A4B"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="6 4"
            className="animate-pulse"
          />

          {/* Covered Route (Solid Green) */}
          <path
            d={`M 120 280 Q ${c1.x} ${c1.y} ${driverX} ${driverY}`}
            fill="none"
            stroke="#0E7A4B"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* 1. Origin: Licensed Pharmacy Marker */}
          <g transform="translate(120, 280)">
            <circle r="22" fill="#0E7A4B" opacity="0.15" />
            <circle r="14" fill="#0E7A4B" />
            <path d="M -5 -5 L 5 -5 L 5 5 L -5 5 Z" fill="#FFFFFF" />
            <path d="M 0 -7 L 0 7 M -7 0 L 7 0" stroke="#0E7A4B" strokeWidth="2.5" />
            <text x="20" y="5" fill="#0E7A4B" fontSize="11" fontWeight="bold">
              {order.pharmacyName}
            </text>
          </g>

          {/* 2. Destination: Customer Delivery Address */}
          <g transform="translate(680, 110)">
            <circle r="24" fill="#E63946" opacity="0.18" />
            <circle r="15" fill="#E63946" />
            <circle r="5" fill="#FFFFFF" />
            <text x="-120" y="-12" fill="#0E7A4B" fontSize="11" fontWeight="bold">
              {order.deliveryAddress}
            </text>
          </g>

          {/* 3. Live Driver Position Icon */}
          <g transform={`translate(${driverX}, ${driverY})`}>
            <circle r="20" fill="#0E7A4B" opacity="0.25" className="animate-ping" />
            <circle r="16" fill="#0E7A4B" stroke="#FFFFFF" strokeWidth="3" />
            <circle r="5" fill="#10B981" />
          </g>
        </svg>

        {/* Live Driver Telemetry Card Floating Overlay */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#E8F5EE] shadow-md max-w-[260px] sm:max-w-xs space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0E7A4B] text-white flex items-center justify-center font-bold text-xs">
                🏍️
              </div>
              <div>
                <p className="text-xs font-black text-[#111827]">{order.driverName || 'Musa Kato'}</p>
                <p className="text-[10px] text-gray-500">{order.driverVehicle || 'Yamaha YBR125'}</p>
              </div>
            </div>
            <span className="text-xs font-black text-[#0E7A4B] font-mono">{driverSpeed} km/h</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E8F5EE] text-[11px]">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Clock className="w-3.5 h-3.5 text-[#0E7A4B]" />
              <span>ETA: <strong>{etaMinutes} mins</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
              <ThermometerSnowflake className="w-3.5 h-3.5 text-blue-600" />
              <span>{currentTemp}°C Safe</span>
            </div>
          </div>
        </div>

        {/* PIN Security Code Card Floating Overlay */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-[#E8F5EE] shadow-md flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase">{isAr ? 'رمز تسليم الطلب' : 'Delivery PIN'}</p>
            <p className="text-base font-black text-[#111827] tracking-widest font-mono">
              {order.deliveryOtp || '4921'}
            </p>
          </div>
        </div>
      </div>

      {/* Driver Contact & Delivery Status Bar */}
      <div className="p-4 bg-white border-t border-[#E8F5EE] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-gray-600">
            <ShieldCheck className="w-4 h-4 text-[#0E7A4B]" />
            <span>
              {isAr 
                ? 'الحقيبة المعزولة مختومة ومراقبة حرارياً (2°C - 8°C)' 
                : 'Insulated cold-chain bag sealed & thermal-monitored (2°C - 8°C)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onCallDriver && order.driverPhone && (
            <button
              onClick={() => onCallDriver(order.driverPhone!)}
              className="px-3.5 py-1.5 rounded-xl bg-[#0E7A4B] hover:bg-[#0B6B43] text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{isAr ? 'اتصال بالسائق' : 'Call Courier'}</span>
            </button>
          )}

          <a
            href={`https://wa.me/${(selectedCountry.whatsappSupportNumber || '+256700000000').replace(/\D/g, '')}?text=Help%20with%20Order%20${order.orderNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#111827] border border-[#D0EADB] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isAr ? 'دعم واتساب' : 'WhatsApp Support'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
