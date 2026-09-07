import React, { useState, useEffect } from 'react';
import { 
  Repeat, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Check, 
  Pill, 
  X, 
  Truck,
  Sparkles
} from 'lucide-react';
import { ChronicRefillRecord, Language } from '../../types';

interface ChronicRefillManagerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onOrderPlaced?: (order: any) => void;
}

export const ChronicRefillManager: React.FC<ChronicRefillManagerProps> = ({
  isOpen,
  onClose,
  language,
  onOrderPlaced
}) => {
  const isRtl = language === 'ar';
  const [refills, setRefills] = useState<ChronicRefillRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingRefillId, setProcessingRefillId] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New Refill Form
  const [newMedicineName, setNewMedicineName] = useState('');
  const [newProfileName, setNewProfileName] = useState('Grace Muthoni (Self)');
  const [newDosage, setNewDosage] = useState('');
  const [newQuantity, setNewQuantity] = useState(30);
  const [newFrequencyDays, setNewFrequencyDays] = useState(30);
  const [newUnitPriceUSD, setNewUnitPriceUSD] = useState(8.5);

  const fetchRefills = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/refills');
      const data = await res.json();
      if (data.success && Array.isArray(data.refills)) {
        setRefills(data.refills);
      }
    } catch (e) {
      console.error('Error fetching refills:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRefills();
      setSuccessOrder(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handle1ClickRefill = async (refill: ChronicRefillRecord) => {
    try {
      setProcessingRefillId(refill.id);
      setErrorMessage(null);

      const res = await fetch('/api/refills/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refillId: refill.id,
          paymentMethod: 'family_wallet'
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessOrder(data.order);
        if (onOrderPlaced) {
          onOrderPlaced(data.order);
        }
        await fetchRefills();
      } else {
        setErrorMessage(data.error || 'Failed to place 1-click refill');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network connection failed');
    } finally {
      setProcessingRefillId(null);
    }
  };

  const handleToggleAutoRefill = async (refillId: string) => {
    try {
      const res = await fetch(`/api/refills/${refillId}/toggle-auto`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        setRefills(prev => prev.map(r => r.id === refillId ? { ...r, autoRefillEnabled: data.autoRefillEnabled } : r));
      }
    } catch (e) {
      console.error('Error toggling auto refill:', e);
    }
  };

  const handleCreateRefill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedicineName.trim()) return;

    try {
      setErrorMessage(null);
      const res = await fetch('/api/refills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineName: newMedicineName.trim(),
          profileName: newProfileName,
          dosage: newDosage || 'Standard prescription dosage',
          quantity: newQuantity,
          frequencyDays: newFrequencyDays,
          unitPriceUSD: newUnitPriceUSD
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsAddingNew(false);
        setNewMedicineName('');
        setNewDosage('');
        await fetchRefills();
      } else {
        setErrorMessage(data.error || 'Failed to add refill tracker');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      id="chronic-refill-modal"
    >
      <div 
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-800 to-emerald-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Repeat className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  {isRtl ? 'إعادة التعبئة بضغطة واحدة للأدوية المزمنة' : '1-Click Chronic Prescription Refills'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {isRtl ? 'توصيل مجاني' : 'Free Delivery'}
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                {isRtl 
                  ? 'متابعة الجرعات المتبقية والطلب الفوري دون إعادة رفع الوصفة في كل مرة' 
                  : 'Zero-friction repeat refills, automatic stock reservations & prescription validity tracking'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            id="close-refill-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Success Banner */}
          {successOrder && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 flex items-start gap-3 shadow-xs animate-in fade-in">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs space-y-1">
                <h4 className="font-bold text-sm text-emerald-950">
                  {isRtl ? 'تم تقديم طلب إعادة التعبئة بنجاح!' : '1-Click Refill Dispatched Successfully!'}
                </h4>
                <p>
                  {isRtl 
                    ? `تم تأكيد الطلب رقم #${successOrder.id} وتوجيهه لصيدلية الشريك المعتمدة للتجهيز الفوري.`
                    : `Order #${successOrder.id} has been accepted and dispatched to the approved partner pharmacy for priority dispensing.`}
                </p>
                <div className="pt-1 flex items-center gap-2 text-emerald-800 font-semibold">
                  <Truck className="w-4 h-4" />
                  <span>
                    {isRtl ? 'التوصيل مجاني للأدوية المزمنة • عنوان التوصيل: نيروبي' : 'Free Chronic Patient Delivery • Dispatched to registered home address'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sub-header Bar */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-600">
              <span className="font-bold text-neutral-900">{refills.length}</span> {isRtl ? 'أدوية مزمنة نشطة' : 'active chronic regimens registered'}
            </div>
            {!isAddingNew && (
              <button
                onClick={() => setIsAddingNew(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
                id="btn-add-refill-tracker"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRtl ? 'إضافة دواء مزمن' : 'Add Medication'}</span>
              </button>
            )}
          </div>

          {/* New Refill Form */}
          {isAddingNew && (
            <form onSubmit={handleCreateRefill} className="bg-neutral-50 border border-neutral-300 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <h3 className="text-sm font-bold text-neutral-800">
                  {isRtl ? 'تسجيل دواء مزمن جديد للمتابعة' : 'Register Chronic Medication for Refill Tracking'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-neutral-500 hover:text-neutral-700"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {isRtl ? 'اسم الدواء *' : 'Medicine Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newMedicineName}
                    onChange={(e) => setNewMedicineName(e.target.value)}
                    placeholder={isRtl ? 'مثال: جلوكوفاج 500 ملغ' : 'e.g. Glucophage / Metformin 500mg'}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {isRtl ? 'المريض المستفيد' : 'Patient / Family Member'}
                  </label>
                  <input
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {isRtl ? 'الجرعة اليومية' : 'Dosage Instructions'}
                  </label>
                  <input
                    type="text"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    placeholder={isRtl ? 'مثال: حبة واحدة مرتين يومياً مع الطعام' : 'e.g. 1 tablet twice daily with food'}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {isRtl ? 'دورة الإعادة (أيام)' : 'Cycle (Days)'}
                    </label>
                    <input
                      type="number"
                      min={7}
                      max={180}
                      value={newFrequencyDays}
                      onChange={(e) => setNewFrequencyDays(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {isRtl ? 'السعر التقديري ($)' : 'Est. Price ($)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newUnitPriceUSD}
                      onChange={(e) => setNewUnitPriceUSD(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 shadow-xs"
                >
                  {isRtl ? 'حفظ الدواء' : 'Save Medication'}
                </button>
              </div>
            </form>
          )}

          {/* Refill Cards */}
          {isLoading ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              {isRtl ? 'جاري تحميل سجلات إعادة التعبئة...' : 'Loading chronic refill schedules...'}
            </div>
          ) : refills.length === 0 ? (
            <div className="py-8 text-center text-neutral-500 space-y-2">
              <Repeat className="w-8 h-8 mx-auto text-neutral-400" />
              <p className="text-xs">{isRtl ? 'لا توجد أدوية مجدولة حالياً' : 'No chronic refill records found'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {refills.map((refill) => {
                const daysLeft = refill.remainingDays;
                const isUrgent = daysLeft <= 5;
                const isWarning = daysLeft > 5 && daysLeft <= 10;
                const progressPct = Math.max(0, Math.min(100, Math.round((daysLeft / refill.frequencyDays) * 100)));

                return (
                  <div
                    key={refill.id}
                    className={`border rounded-xl p-4 transition-all bg-white ${
                      isUrgent 
                        ? 'border-amber-400 ring-1 ring-amber-400/50 shadow-xs' 
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left Details */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                            <Pill className="w-4 h-4 text-emerald-700" />
                            {refill.medicineName}
                          </h4>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-medium">
                            {refill.profileName}
                          </span>
                          {refill.prescriptionValid ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              {isRtl ? 'الوصفة سارية' : 'Valid Prescription on File'}
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {isRtl ? 'يلزم تجديد الوصفة' : 'Prescription Renewal Required'}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-neutral-600">
                          <span className="font-semibold">{refill.dosage}</span> • {isRtl ? 'الكمية:' : 'Qty:'} {refill.quantity}
                        </p>

                        {/* Progress Bar for Remaining Days */}
                        <div className="pt-1.5 max-w-md">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className={`font-bold flex items-center gap-1 ${
                              isUrgent ? 'text-amber-700' : isWarning ? 'text-amber-600' : 'text-emerald-700'
                            }`}>
                              <Clock className="w-3 h-3" />
                              {isRtl 
                                ? `متبقي ${daysLeft} يوم (${refill.remainingDoses} جرعة)` 
                                : `${daysLeft} days remaining (${refill.remainingDoses} doses left)`}
                            </span>
                            <span className="text-neutral-400 text-[10px] flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {isRtl ? 'الموعد القادم:' : 'Next:'} {refill.nextRefillDate.split('T')[0]}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                            <div 
                              className={`h-full transition-all rounded-full ${
                                isUrgent ? 'bg-amber-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-600'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right Actions & 1-Click Order */}
                      <div className="flex flex-col sm:items-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-neutral-900">
                            ${refill.unitPriceUSD.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-emerald-700 block font-semibold">
                            {isRtl ? 'توصيل مجاني' : 'Free Delivery'}
                          </span>
                        </div>

                        {/* 1-Click Refill Button */}
                        <button
                          onClick={() => handle1ClickRefill(refill)}
                          disabled={processingRefillId === refill.id || !refill.prescriptionValid}
                          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                            !refill.prescriptionValid
                              ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                              : isUrgent
                              ? 'bg-gradient-to-r from-amber-600 to-emerald-700 text-white hover:opacity-95 active:scale-95 ring-2 ring-amber-400/40'
                              : 'bg-emerald-700 text-white hover:bg-emerald-800 active:scale-95'
                          }`}
                          id={`btn-refill-${refill.id}`}
                        >
                          {processingRefillId === refill.id ? (
                            <span>{isRtl ? 'جاري تجهيز الطلب...' : 'Processing 1-Click Refill...'}</span>
                          ) : (
                            <>
                              <Repeat className="w-3.5 h-3.5" />
                              <span>{isRtl ? 'إعادة طلب بضغطة واحدة' : '1-Click Refill Now'}</span>
                            </>
                          )}
                        </button>

                        {/* Auto-Refill Toggle Switch */}
                        <div className="flex items-center gap-2 text-[11px] text-neutral-600">
                          <button
                            type="button"
                            onClick={() => handleToggleAutoRefill(refill.id)}
                            className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              refill.autoRefillEnabled ? 'bg-emerald-600' : 'bg-neutral-300'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                refill.autoRefillEnabled ? 'translate-x-3.5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className="text-[10.5px]">
                            {isRtl ? 'تعبئة تلقائية مجدولة' : 'Auto-Refill'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-neutral-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {isRtl 
                ? 'جميع الأدوية المزمنة تخضع لإشراف الصيدلي القانوني المعتمد في نيروبي'
                : 'Supervised by licensed clinical pharmacists with automated tamper-evident audit logs'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 text-white rounded-xl text-xs font-semibold hover:bg-neutral-900 transition-colors"
          >
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
