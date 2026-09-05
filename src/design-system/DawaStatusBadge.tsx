import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  PackageCheck, 
  XCircle, 
  Truck, 
  Check, 
  AlertCircle, 
  ShieldCheck,
  RotateCw
} from 'lucide-react';
import { DawaBadge, DawaBadgeVariant } from './DawaBadge';
import { Language } from '../types';

export type DawaStatusType =
  | 'pending'
  | 'order_received'
  | 'paid'
  | 'processing'
  | 'preparing'
  | 'accepted'
  | 'ready_for_pickup'
  | 'rejected'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'expired'
  | 'verified'
  | 'active'
  | 'suspended';

interface StatusConfig {
  labelAr: string;
  labelEn: string;
  labelSw: string;
  variant: DawaBadgeVariant;
  icon: React.ReactNode;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  pending: {
    labelAr: 'قيد الانتظار',
    labelEn: 'Pending',
    labelSw: 'Inasubiri',
    variant: 'warning',
    icon: <Clock className="w-3 h-3" />,
  },
  order_received: {
    labelAr: 'قيد الانتظار',
    labelEn: 'Pending Receipt',
    labelSw: 'Agizo Limepokelewa',
    variant: 'warning',
    icon: <Clock className="w-3 h-3" />,
  },
  paid: {
    labelAr: 'تم الدفع',
    labelEn: 'Paid',
    labelSw: 'Imelipwa',
    variant: 'success',
    icon: <Check className="w-3 h-3" />,
  },
  processing: {
    labelAr: 'قيد المعالجة',
    labelEn: 'Processing',
    labelSw: 'Inashughulikiwa',
    variant: 'mint',
    icon: <RotateCw className="w-3 h-3 animate-spin" />,
  },
  preparing: {
    labelAr: 'قيد المعالجة',
    labelEn: 'Preparing',
    labelSw: 'Inaandaliwa',
    variant: 'mint',
    icon: <RotateCw className="w-3 h-3" />,
  },
  accepted: {
    labelAr: 'تم القبول',
    labelEn: 'Accepted',
    labelSw: 'Imekubaliwa',
    variant: 'mint',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  ready_for_pickup: {
    labelAr: 'جاهز للاستلام',
    labelEn: 'Ready for Pickup',
    labelSw: 'Tayari Kuchukuliwa',
    variant: 'info',
    icon: <PackageCheck className="w-3 h-3" />,
  },
  rejected: {
    labelAr: 'مرفوض',
    labelEn: 'Rejected',
    labelSw: 'Imekataliwa',
    variant: 'error',
    icon: <XCircle className="w-3 h-3" />,
  },
  picked_up: {
    labelAr: 'تم الاستلام',
    labelEn: 'Picked Up',
    labelSw: 'Imechukuliwa',
    variant: 'info',
    icon: <PackageCheck className="w-3 h-3" />,
  },
  in_transit: {
    labelAr: 'في الطريق',
    labelEn: 'In Transit',
    labelSw: 'Iko Safarini',
    variant: 'mint',
    icon: <Truck className="w-3 h-3" />,
  },
  out_for_delivery: {
    labelAr: 'في الطريق',
    labelEn: 'Out for Delivery',
    labelSw: 'Iko Safarini',
    variant: 'mint',
    icon: <Truck className="w-3 h-3" />,
  },
  delivered: {
    labelAr: 'تم التسليم',
    labelEn: 'Delivered',
    labelSw: 'Imewasilishwa',
    variant: 'success',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  cancelled: {
    labelAr: 'ملغي',
    labelEn: 'Cancelled',
    labelSw: 'Imeghairiwa',
    variant: 'error',
    icon: <XCircle className="w-3 h-3" />,
  },
  expired: {
    labelAr: 'منتهي',
    labelEn: 'Expired',
    labelSw: 'Imeisha Muda',
    variant: 'neutral',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  verified: {
    labelAr: 'تم التحقق',
    labelEn: 'Verified',
    labelSw: 'Imethibitishwa',
    variant: 'success',
    icon: <ShieldCheck className="w-3 h-3" />,
  },
  active: {
    labelAr: 'نشط',
    labelEn: 'Active',
    labelSw: 'Inatumika',
    variant: 'success',
    icon: <Check className="w-3 h-3" />,
  },
  suspended: {
    labelAr: 'معلق',
    labelEn: 'Suspended',
    labelSw: 'Imesimamishwa',
    variant: 'error',
    icon: <XCircle className="w-3 h-3" />,
  }
};

export interface DawaStatusBadgeProps {
  status: string;
  language?: Language;
  size?: 'sm' | 'md';
  className?: string;
}

export const DawaStatusBadge: React.FC<DawaStatusBadgeProps> = ({
  status,
  language = 'ar',
  size = 'md',
  className = '',
}) => {
  const normKey = status?.toLowerCase() || 'pending';
  const config = STATUS_CONFIGS[normKey] || {
    labelAr: status,
    labelEn: status,
    labelSw: status,
    variant: 'neutral' as DawaBadgeVariant,
    icon: null,
  };

  const label = language === 'ar' 
    ? config.labelAr 
    : language === 'sw' 
    ? config.labelSw 
    : config.labelEn;

  return (
    <DawaBadge variant={config.variant} size={size} icon={config.icon} className={className}>
      {label}
    </DawaBadge>
  );
};
