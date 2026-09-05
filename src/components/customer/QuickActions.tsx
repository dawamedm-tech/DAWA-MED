import React from 'react';
import { Truck, Building2, Bell, Pill } from 'lucide-react';
import { Language } from '../../types';

interface QuickActionsProps {
  language: Language;
  onOrderMedicine: () => void;
  onTrackOrder: () => void;
  onOpenPharmacies: () => void;
  onMedicineReminder: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  language,
  onOrderMedicine,
  onTrackOrder,
  onOpenPharmacies,
  onMedicineReminder
}) => {
  const isRtl = language === 'ar';

  const actions = [
    {
      id: 'order',
      title: isRtl ? 'طلب دواء' : language === 'sw' ? 'Agiza Dawa' : 'Order Medicine',
      icon: <Pill className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#0E7A4B]" strokeWidth={2.2} />,
      onClick: onOrderMedicine,
    },
    {
      id: 'track',
      title: isRtl ? 'تتبع الطلب' : language === 'sw' ? 'Fuatilia' : 'Track Order',
      icon: <Truck className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#0E7A4B]" strokeWidth={2.2} />,
      onClick: onTrackOrder,
    },
    {
      id: 'pharmacies',
      title: isRtl ? 'صيدليات' : language === 'sw' ? 'Maduka' : 'Pharmacies',
      icon: <Building2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#0E7A4B]" strokeWidth={2.2} />,
      onClick: onOpenPharmacies,
    },
    {
      id: 'reminder',
      title: isRtl ? 'تذكير الدواء' : language === 'sw' ? 'Kumbusho' : 'Reminder',
      icon: <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#0E7A4B]" strokeWidth={2.2} />,
      onClick: onMedicineReminder,
    },
  ];

  return (
    <div className="w-full select-none pt-1 sm:pt-1.5" id="customer-quick-actions">
      {/* Strictly 1 row with 4 columns on all mobile screens (320px - 414px+) */}
      <div className="grid grid-cols-4 gap-1 sm:gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            type="button"
            className="group flex flex-col items-center justify-center p-0.5 sm:p-1.5 rounded-xl hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer focus:outline-none min-w-0"
            id={`quick-action-${action.id}`}
          >
            {/* Mint Circle with Green Icon: 44px on 320px mobile to 52px on larger screens */}
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#E8F5EE] border border-[#D0EADB] flex items-center justify-center transition-all group-hover:bg-[#D4EEDF] group-hover:scale-105 shadow-2xs shrink-0">
              {action.icon}
            </div>

            {/* Label Underneath: Single non-breaking line with overflow protection */}
            <span className="text-[10px] sm:text-[11.5px] font-bold text-neutral-800 text-center mt-1.5 tracking-tight leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-full px-0.5">
              {action.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
