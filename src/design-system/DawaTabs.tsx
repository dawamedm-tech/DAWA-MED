import React from 'react';

export interface DawaTabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface DawaTabsProps<T extends string = string> {
  tabs: DawaTabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  variant?: 'pill' | 'underline';
  className?: string;
}

export function DawaTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  variant = 'pill',
  className = '',
}: DawaTabsProps<T>) {
  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (variant === 'underline') {
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'border-[#0E7A4B] text-[#0E7A4B]'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
              }`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? 'bg-[#0E7A4B] text-white' : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        }

        // Pill variant
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer select-none ${
              isActive
                ? 'bg-[#0E7A4B] text-white shadow-xs'
                : 'bg-white text-neutral-700 hover:bg-[#E8F5EE] hover:text-[#0E7A4B] border border-[#E5E7EB]'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive ? 'bg-white text-[#0E7A4B]' : 'bg-[#E8F5EE] text-[#0E7A4B]'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
