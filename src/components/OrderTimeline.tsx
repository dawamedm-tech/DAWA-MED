import React from 'react';
import { Order, OrderStatus, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { translate } from '../utils/i18n';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Building2, 
  PackageCheck, 
  Bike, 
  ShieldCheck, 
  MapPin,
  Sparkles,
  Inbox,
  UserCheck,
  Check
} from 'lucide-react';

interface OrderTimelineProps {
  order: Order;
  language: Language;
  onAdvanceStatus?: (orderId: string, nextStatus: OrderStatus) => void;
}

interface StepDefinition {
  status: OrderStatus;
  key: string;
  labelEn: string;
  icon: React.ReactNode;
  descEn: string;
  descAr: string;
  descFr: string;
  descSw: string;
}

export const ORDER_PIPELINE_STEPS: StepDefinition[] = [
  {
    status: 'order_received',
    key: 'status_order_received',
    labelEn: '1. Order Received',
    icon: <Inbox className="w-4 h-4" />,
    descEn: 'Order transmitted securely to DAWA dispatch queue',
    descAr: 'تم استلام الطلب ونقله إلى نظام التوزيع الآمن',
    descFr: 'Commande transmise en toute sécurité à la file d’attente',
    descSw: 'Agizo limepokelewa na kuwekwa kwenye mfumo salama',
  },
  {
    status: 'waiting_pharmacy',
    key: 'status_waiting_pharmacy',
    labelEn: '2. Waiting for Pharmacy',
    icon: <Building2 className="w-4 h-4" />,
    descEn: 'Locating closest certified pharmacy partner with verified stock',
    descAr: 'جاري مطابقة وتوجيه الطلب لأقرب صيدلية مرخصة يتوفر بها المخزون',
    descFr: 'Attribution à la pharmacie partenaire agréée la plus proche',
    descSw: 'Inatafuta duka la dawa lililoidhinishwa lililo karibu na lenye akiba',
  },
  {
    status: 'prescription_under_review',
    key: 'status_prescription_under_review',
    labelEn: '3. Prescription Under Review',
    icon: <FileText className="w-4 h-4" />,
    descEn: 'Licensed pharmacist inspecting prescription and dosage validity',
    descAr: 'الصيدلي المرخص يقوم بتدقيق الروشتة والتأكد من ملاءمة الجرعات',
    descFr: 'Examen attentif de l’ordonnance et des posologies par le pharmacien',
    descSw: 'Mfamasia aliyesajiliwa anakagua cheti na usahihi wa dozi',
  },
  {
    status: 'pharmacy_accepted',
    key: 'status_pharmacy_accepted',
    labelEn: '4. Pharmacy Accepted',
    icon: <ShieldCheck className="w-4 h-4" />,
    descEn: 'Prescription approved & medication dispensed from licensed inventory',
    descAr: 'تمت الموافقة على الوصفة واعتماد صرف الدواء رسمياً',
    descFr: 'Ordonnance validée et dispensation autorisée depuis le stock agréé',
    descSw: 'Cheti kimeidhinishwa na dawa imetolewa dukani',
  },
  {
    status: 'medicine_being_prepared',
    key: 'status_medicine_being_prepared',
    labelEn: '5. Medicine Being Prepared',
    icon: <PackageCheck className="w-4 h-4" />,
    descEn: 'Packaged in tamper-proof seal & insulated cold-chain box',
    descAr: 'جاري تغليف الدواء بالختم الأمني والحفظ في العبوة المبردة',
    descFr: 'Conditionnement sous scellé inviolable et boîte isotherme 2-8°C',
    descSw: 'Inafungashwa kwa muhuri wa usalama na ubaridi',
  },
  {
    status: 'ready_for_pickup',
    key: 'status_ready_for_pickup',
    labelEn: '6. Ready for Pickup',
    icon: <Clock className="w-4 h-4" />,
    descEn: 'Batch verified. Awaiting rider arrival at pharmacy',
    descAr: 'تم التحقق من رقم التشغيلة وبانتظار وصول المندوب للصيدلية',
    descFr: 'Numéro de lot certifié. En attente de l’arrivée du coursier',
    descSw: 'Kundi limethibitishwa. Inasubiri dereva kufika dukani',
  },
  {
    status: 'driver_assigned',
    key: 'status_driver_assigned',
    labelEn: '7. Driver Assigned',
    icon: <UserCheck className="w-4 h-4" />,
    descEn: 'DAWA Express courier assigned to route',
    descAr: 'تم تعيين مندوب التوصيل وتحديد خط السير المباشر',
    descFr: 'Livreur coursier DAWA Express assigné à l’itinéraire',
    descSw: 'Dereva wa DAWA Express ameteuliwa kwa safari',
  },
  {
    status: 'picked_up',
    key: 'status_picked_up',
    labelEn: '8. Picked Up',
    icon: <Bike className="w-4 h-4" />,
    descEn: 'Rider scanned package seal and departed pharmacy',
    descAr: 'استلم المندوب الشحنة من الصيدلية وبدأ التحرك',
    descFr: 'Le coursier a scanné le scellé et a quitté l’officine',
    descSw: 'Dereva ameskani muhuri na kuondoka dukani',
  },
  {
    status: 'out_for_delivery',
    key: 'status_out_for_delivery',
    labelEn: '9. Out for Delivery',
    icon: <MapPin className="w-4 h-4" />,
    descEn: 'Courier on final approach to patient delivery location',
    descAr: 'المندوب في طريقه إلى عنوانك، يرجى تجهيز رمز الاستلام',
    descFr: 'Livreur en approche finale vers l’adresse de livraison',
    descSw: 'Dereva yuko njiani kuelekea eneo lako la kupokelea',
  },
  {
    status: 'delivered',
    key: 'status_delivered',
    labelEn: '10. Delivered',
    icon: <CheckCircle2 className="w-4 h-4" />,
    descEn: 'Package handed over with verified OTP PIN confirmation',
    descAr: 'تم تسليم الدواء وتأكيد الرمز بنجاح',
    descFr: 'Colis remis en main propre avec validation du code PIN OTP',
    descSw: 'Kifurushi kimekabidhiwa kwa uthibitisho wa nambari ya PIN',
  },
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  order,
  language,
  onAdvanceStatus,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const getStatusIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'order_received':
      case 'submitted':
        return 0;
      case 'waiting_pharmacy':
        return 1;
      case 'prescription_under_review':
      case 'pharmacist_reviewing':
        return 2;
      case 'pharmacy_accepted':
      case 'approved':
        return 3;
      case 'medicine_being_prepared':
      case 'preparing':
        return 4;
      case 'ready_for_pickup':
        return 5;
      case 'driver_assigned':
        return 6;
      case 'picked_up':
        return 7;
      case 'out_for_delivery':
      case 'in_transit':
        return 8;
      case 'delivered':
        return 9;
      case 'cancelled':
      case 'rejected':
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getStatusIndex(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'rejected';

  const getNextStatus = (): OrderStatus | null => {
    if (currentIndex >= 0 && currentIndex < ORDER_PIPELINE_STEPS.length - 1) {
      return ORDER_PIPELINE_STEPS[currentIndex + 1].status;
    }
    return null;
  };

  const nextStatus = getNextStatus();

  const getStepDescription = (step: StepDefinition) => {
    if (language === 'ar') return step.descAr;
    if (language === 'fr') return step.descFr;
    if (language === 'sw') return step.descSw;
    return step.descEn;
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-7 border border-[#D8E2DC] shadow-xs" id={`order-timeline-${order.id}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#D8E2DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#2D6A4F] text-white">
              {order.orderNumber}
            </span>
            <span className="text-xs text-gray-500 font-semibold">{order.createdAt}</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-[#1B4332]">
            {t.orderStatusTitle}
          </h3>
        </div>

        {/* Action button to simulate next step */}
        {onAdvanceStatus && nextStatus && !isCancelled && (
          <button
            onClick={() => onAdvanceStatus(order.id, nextStatus)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0F7F4] hover:bg-[#D8F3DC] text-[#2D6A4F] border border-[#2D6A4F]/30 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            id="simulate-next-step-btn"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#52B788]" />
            <span>{translate('simulateNextStep', language)} ({currentIndex + 2}) →</span>
          </button>
        )}
      </div>

      {/* Cancelled Alert if applicable */}
      {isCancelled && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <p className="font-bold">
              {order.status === 'rejected' ? t.status_rejected : t.status_cancelled}
            </p>
            <p className="text-[11px] mt-0.5 text-red-700">
              {order.prescription?.pharmacistNotes || (language === 'ar' ? 'يرجى مراجعة الطبيب أو الصيدلي المسؤول لتوضيح أي استفسارات طبية.' : 'Please contact our clinical pharmacist team or doctor for clarification.')}
            </p>
          </div>
        </div>
      )}

      {/* Interactive 10-Step Timeline */}
      <div className="relative space-y-4">
        {ORDER_PIPELINE_STEPS.map((step, idx) => {
          const isDone = currentIndex > idx;
          const isCurrent = currentIndex === idx;

          return (
            <div
              key={step.status}
              className={`flex items-start gap-3 sm:gap-4 p-3 rounded-2xl transition-all ${
                isCurrent 
                  ? 'bg-[#F0F7F4] border border-[#74C69D] shadow-xs' 
                  : isDone
                  ? 'bg-white/50 opacity-90'
                  : 'bg-gray-50/60 opacity-50'
              }`}
            >
              {/* Step indicator node */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    isDone
                      ? 'bg-[#2D6A4F] text-white'
                      : isCurrent
                      ? 'bg-[#52B788] text-white ring-4 ring-[#74C69D]/30 animate-pulse'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : step.icon}
                </div>
              </div>

              {/* Step text info */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs sm:text-sm font-black ${
                    isCurrent ? 'text-[#1B4332]' : isDone ? 'text-[#2D6A4F]' : 'text-gray-500'
                  }`}>
                    {t[step.key] || step.labelEn}
                  </h4>
                  {isCurrent && (
                    <span className="px-2 py-0.5 bg-[#2D6A4F] text-white text-[10px] font-black rounded-full uppercase tracking-wider shrink-0">
                      {translate('activeBadge', language)}
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-bold text-[#52B788] shrink-0">
                      {translate('completedBadge', language)}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                  {getStepDescription(step)}
                </p>

                {/* Additional context based on active step */}
                {isCurrent && step.status === 'prescription_under_review' && order.prescription && (
                  <div className="mt-2 p-2.5 rounded-xl bg-white border border-[#D8E2DC] text-[11px]">
                    <span className="font-bold text-[#1B4332]">{translate('assignedReviewer', language)}</span>{' '}
                    <span className="text-gray-700">{order.prescription.verifiedByPharmacist || order.pharmacyName}</span>
                  </div>
                )}

                {isCurrent && (step.status === 'out_for_delivery' || step.status === 'picked_up') && order.driverName && (
                  <div className="mt-2 p-2.5 rounded-xl bg-white border border-[#D8E2DC] text-[11px] flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-[#1B4332]">
                      {translate('courierInfo', language)} {order.driverName} ({order.driverVehicle})
                    </span>
                    <span className="text-[#2D6A4F] font-bold">
                      {translate('etaInfo', language)} ~{order.estimatedDeliveryMinutes || 15} min
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
