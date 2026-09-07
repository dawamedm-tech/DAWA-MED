import React, { useState, useEffect } from 'react';
import { Phone, ChevronDown } from 'lucide-react';
import { COUNTRY_DIAL_CODES, getSafeDialCode, DialCodeConfig } from './authConstants';

interface AuthPhoneInputProps {
  label?: string;
  value: string;
  onChange: (fullPhone: string, dialCode: string, localNumber: string) => void;
  selectedCountryCode?: string;
  error?: string;
  id?: string;
  labelId?: string;
  placeholder?: string;
  containerClassName?: string;
}

export const AuthPhoneInput: React.FC<AuthPhoneInputProps> = ({
  label = 'رقم الهاتف',
  value = '',
  onChange,
  selectedCountryCode = 'KE',
  error,
  id = 'auth-phone-input',
  labelId = 'auth-phone-label',
  placeholder,
  containerClassName = ''
}) => {
  const initialDial = getSafeDialCode(selectedCountryCode);
  const [selectedDial, setSelectedDial] = useState<DialCodeConfig>(initialDial);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [localNumber, setLocalNumber] = useState('');

  // Synchronize country if prop changes
  useEffect(() => {
    const config = getSafeDialCode(selectedCountryCode);
    setSelectedDial(config);
  }, [selectedCountryCode]);

  // Extract initial local number if value already contains dial code or digits
  useEffect(() => {
    if (!value || typeof value !== 'string') {
      setLocalNumber('');
      return;
    }
    // Clean string from undefined artifacts
    const cleanVal = value.replace(/undefined/gi, '').trim();
    if (cleanVal.startsWith(selectedDial.dialCode)) {
      setLocalNumber(cleanVal.slice(selectedDial.dialCode.length).trim());
    } else {
      setLocalNumber(cleanVal.replace(/^[+0-9]+\s*/, ''));
    }
  }, [value, selectedDial.dialCode]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9\s]/g, '');
    setLocalNumber(raw);
    const combined = raw.trim() ? `${selectedDial.dialCode} ${raw.trim()}` : '';
    onChange(combined, selectedDial.dialCode, raw.trim());
  };

  const handleSelectCountry = (config: DialCodeConfig) => {
    setSelectedDial(config);
    setIsSelectorOpen(false);
    const combined = localNumber.trim() ? `${config.dialCode} ${localNumber.trim()}` : '';
    onChange(combined, config.dialCode, localNumber.trim());
  };

  // Safe fallback placeholder
  const safePlaceholder = placeholder || `${selectedDial.dialCode} 700 000 000`;

  return (
    <div className={`w-full relative ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={id} 
          id={labelId}
          className="block text-[11px] font-medium text-[#8FA3BF] text-start mb-1 select-none"
        >
          {label}
        </label>
      )}

      <div className="relative w-full h-[38px] flex items-center bg-[#EAF1FC] rounded-[12px] border border-[#DFE8F6] focus-within:border-[#0E7A4B] transition-colors">
        {/* Country Code Selector Toggle */}
        <button
          type="button"
          onClick={() => setIsSelectorOpen(!isSelectorOpen)}
          className="h-full px-2.5 flex items-center gap-1 text-[12px] font-medium text-[#111827] border-e border-[#DFE8F6] hover:bg-white/60 transition-colors shrink-0 cursor-pointer rounded-s-[12px]"
          id="phone-country-selector-btn"
        >
          <span className="text-sm select-none">{selectedDial.flag}</span>
          <span className="text-[11.5px] font-mono font-bold text-[#475569]" dir="ltr">{selectedDial.dialCode}</span>
          <ChevronDown className="w-3 h-3 text-[#8FA3BF]" />
        </button>

        {/* Input Phone */}
        <div className="relative flex-1 h-full flex items-center">
          <Phone className="w-3.5 h-3.5 text-[#8FA3BF] absolute start-2.5 pointer-events-none" />
          <input
            type="tel"
            id={id}
            value={localNumber}
            onChange={handleNumberChange}
            placeholder={safePlaceholder}
            className="w-full h-full bg-transparent outline-none ps-8 pe-3 text-[13px] text-[#111827] placeholder:text-[#94A3B8]"
            dir="ltr"
            autoComplete="tel"
          />
        </div>
      </div>

      {/* Country Dropdown Menu */}
      {isSelectorOpen && (
        <div className="absolute z-50 mt-1 start-0 w-[240px] max-h-[190px] overflow-y-auto bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-1 text-xs">
          {Object.values(COUNTRY_DIAL_CODES).map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => handleSelectCountry(c)}
              className={`w-full px-2.5 py-1.5 flex items-center justify-between rounded-lg hover:bg-[#EAF1FC] transition-colors text-start cursor-pointer ${
                c.code === selectedDial.code ? 'bg-[#EAF1FC] font-bold' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{c.flag}</span>
                <span className="text-[#111827]">{c.nameAr}</span>
              </div>
              <span className="text-[11px] font-mono text-[#8FA3BF]" dir="ltr">{c.dialCode}</span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-[11px] text-[#E91E4D] font-medium text-start mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
