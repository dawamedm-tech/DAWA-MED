import React, { useState } from 'react';
import { 
  MedicineReminder, 
  Language, 
  Medicine, 
  ReminderFrequency 
} from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  X, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  Pill, 
  ShieldCheck, 
  Users, 
  EyeOff, 
  Bell, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMedicine: (reminder: MedicineReminder) => void;
  language: Language;
  availableMedicines?: Medicine[];
  existingReminder?: MedicineReminder | null;
}

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  onSaveMedicine,
  language,
  availableMedicines = [],
  existingReminder,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [medicineName, setMedicineName] = useState(existingReminder?.medicineName || '');
  const [genericName, setGenericName] = useState(existingReminder?.genericName || '');
  const [dosageInstructions, setDosageInstructions] = useState(
    existingReminder?.dosageInstructions || '1 tablet after breakfast with a full glass of water'
  );
  const [frequency, setFrequency] = useState<ReminderFrequency>(existingReminder?.frequency || 'daily');
  const [startDate, setStartDate] = useState(
    existingReminder?.startDate || new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(existingReminder?.endDate || '');
  const [isOngoing, setIsOngoing] = useState(existingReminder ? existingReminder.isOngoing : true);
  const [reminderTimes, setReminderTimes] = useState<string[]>(
    existingReminder?.reminderTimes || ['08:00 AM', '08:00 PM']
  );
  const [newTimeInput, setNewTimeInput] = useState('12:00 PM');
  const [totalQuantity, setTotalQuantity] = useState(existingReminder?.totalQuantity || 30);
  const [remainingQuantity, setRemainingQuantity] = useState(
    existingReminder?.remainingQuantity || 30
  );
  const [refillReminderDaysBefore, setRefillReminderDaysBefore] = useState(
    existingReminder?.refillReminderDaysBefore || 5
  );
  const [familyMember, setFamilyMember] = useState(
    existingReminder?.familyMember || 'Myself'
  );
  const [customFamilyMember, setCustomFamilyMember] = useState('');
  const [notes, setNotes] = useState(existingReminder?.notes || 'Prescribed by doctor. Store in dry place below 25°C.');
  const [privacyHideName, setPrivacyHideName] = useState(existingReminder?.privacyHideName || false);

  if (!isOpen) return null;

  const handleAddReminderTime = () => {
    if (newTimeInput && !reminderTimes.includes(newTimeInput)) {
      setReminderTimes([...reminderTimes, newTimeInput]);
    }
  };

  const handleRemoveReminderTime = (timeToRemove: string) => {
    if (reminderTimes.length > 1) {
      setReminderTimes(reminderTimes.filter((t) => t !== timeToRemove));
    }
  };

  const handleQuickSelectMedicine = (med: Medicine) => {
    setMedicineName(med.name);
    setGenericName(med.genericName);
    setDosageInstructions(`${med.dosage} (${med.form}) - as prescribed`);
    setTotalQuantity(30);
    setRemainingQuantity(30);
    setNotes(`Storage: ${med.storageCondition || 'Room temperature'}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const expectedRefillDate = new Date();
    expectedRefillDate.setDate(expectedRefillDate.getDate() + remainingQuantity);

    const reminder: MedicineReminder = {
      id: existingReminder?.id || `rem-${Date.now().toString().slice(-4)}`,
      medicineName: medicineName.trim(),
      genericName: genericName.trim() || undefined,
      dosageInstructions: dosageInstructions.trim(),
      frequency,
      frequencyLabel: frequency === 'daily' 
        ? 'Every Day' 
        : frequency === 'twice_daily' 
        ? 'Twice Daily' 
        : frequency === 'three_times_daily'
        ? 'Three Times Daily'
        : frequency === 'weekly'
        ? 'Weekly'
        : frequency === 'monthly'
        ? 'Monthly'
        : 'Specific Days / As Needed',
      startDate,
      endDate: isOngoing ? undefined : endDate,
      isOngoing,
      reminderTimes,
      totalQuantity: Number(totalQuantity),
      remainingQuantity: Number(remainingQuantity),
      refillDate: expectedRefillDate.toISOString().split('T')[0],
      refillReminderDaysBefore: Number(refillReminderDaysBefore),
      familyMember: familyMember === 'Other' ? customFamilyMember || 'Family Member' : familyMember,
      notes: notes.trim(),
      privacyHideName,
      history: existingReminder?.history || [],
      createdAt: existingReminder?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSaveMedicine(reminder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto" id="add-medicine-modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#D8E2DC] my-6"
        id="add-medicine-modal-container"
      >
        {/* Header */}
        <div className="bg-[#1B4332] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            id="add-medicine-close-btn"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#74C69D] text-[11px] font-bold border border-white/15 mb-2">
            <Pill className="w-3.5 h-3.5" />
            <span>Smart Schedule</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {existingReminder ? 'Edit Medicine Schedule' : t.addMedicine}
          </h2>
          <p className="text-xs text-[#D8F3DC]/90 mt-1">
            Configure custom dosage reminder times and automatic refill threshold alerts.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* Medical Disclaimer Banner */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 flex items-start gap-2.5 leading-relaxed text-[11px]">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Medical Disclaimer:</strong> {t.subDisclaimer}
            </span>
          </div>

          {/* Quick Select Prescribed Medicines */}
          {availableMedicines.length > 0 && !existingReminder && (
            <div>
              <label className="block font-bold text-[#1B4332] mb-1">
                Quick Select from Catalog (Optional)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1.5 bg-[#F8FAF9] rounded-2xl border border-[#D8E2DC]">
                {availableMedicines.slice(0, 8).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleQuickSelectMedicine(m)}
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#E9F5EE] border border-[#D8E2DC] text-[11px] font-bold text-[#1B4332] transition-colors"
                  >
                    + {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Medicine Name */}
          <div>
            <label className="block font-bold text-[#1B4332] mb-1">
              {t.medicineName} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E2DC] bg-white text-xs font-bold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
              placeholder="e.g. Metformin Hydrochloride 500mg"
            />
          </div>

          {/* Dosage instructions */}
          <div>
            <label className="block font-bold text-[#1B4332] mb-1">
              {t.dosageInstructions} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={dosageInstructions}
              onChange={(e) => setDosageInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E2DC] bg-white text-xs text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
              placeholder="e.g. 1 tablet after breakfast with water"
            />
          </div>

          {/* Frequency & Family Member */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#1B4332] mb-1">
                {t.frequency}
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as ReminderFrequency)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E2DC] bg-white text-xs font-bold text-[#1B4332]"
              >
                <option value="daily">Every Day (Daily)</option>
                <option value="twice_daily">Twice Daily</option>
                <option value="three_times_daily">Three Times Daily</option>
                <option value="specific_days">Specific Days of Week</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">As Needed / Custom</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#1B4332] mb-1">
                Family Profile
              </label>
              <select
                value={familyMember}
                onChange={(e) => setFamilyMember(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E2DC] bg-white text-xs font-bold text-[#1B4332]"
              >
                <option value="Myself">Myself (Grace)</option>
                <option value="Mother">Mother (Mary Muthoni)</option>
                <option value="Father">Father (Peter Muthoni)</option>
                <option value="Child">Child (Brian)</option>
                <option value="Spouse">Spouse</option>
                <option value="Other">Custom Family Member...</option>
              </select>
            </div>
          </div>

          {familyMember === 'Other' && (
            <div>
              <label className="block font-bold text-[#1B4332] mb-1">Custom Name / Relationship</label>
              <input
                type="text"
                value={customFamilyMember}
                onChange={(e) => setCustomFamilyMember(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E2DC] bg-white text-xs"
                placeholder="e.g. Grandmother Lucy"
              />
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#1B4332] mb-1">
                {t.startDate}
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E2DC] bg-white text-xs font-mono text-[#1B4332]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1B4332] mb-1">
                {t.endDate}
              </label>
              <div className="space-y-1.5">
                <input
                  type="date"
                  disabled={isOngoing}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border border-[#D8E2DC] bg-white text-xs font-mono text-[#1B4332] ${
                    isOngoing ? 'opacity-40 bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#1B4332] font-bold">
                  <input
                    type="checkbox"
                    checked={isOngoing}
                    onChange={(e) => setIsOngoing(e.target.checked)}
                    className="accent-[#2D6A4F] rounded-sm"
                  />
                  <span>Ongoing Treatment / Chronic Plan</span>
                </label>
              </div>
            </div>
          </div>

          {/* Reminder Times Builder */}
          <div className="space-y-2 p-3.5 bg-[#F8FAF9] rounded-2xl border border-[#D8E2DC]">
            <label className="block font-bold text-[#1B4332] text-xs">
              {t.reminderTimes} (Multiple times per day supported)
            </label>

            <div className="flex flex-wrap gap-2 mb-2">
              {reminderTimes.map((time) => (
                <span
                  key={time}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D8E2DC] shadow-xs text-xs font-black text-[#1B4332]"
                >
                  <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>{time}</span>
                  {reminderTimes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveReminderTime(time)}
                      className="hover:text-red-500 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTimeInput}
                onChange={(e) => setNewTimeInput(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#D8E2DC] bg-white text-xs font-mono w-28"
                placeholder="02:00 PM"
              />
              <button
                type="button"
                onClick={handleAddReminderTime}
                className="px-3 py-1.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Time</span>
              </button>
            </div>
          </div>

          {/* Quantity & Refill Threshold */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#1B4332] mb-1">
                Total Pill Pack
              </label>
              <input
                type="number"
                min="1"
                required
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E2DC] bg-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1B4332] mb-1">
                Remaining Pills
              </label>
              <input
                type="number"
                min="0"
                required
                value={remainingQuantity}
                onChange={(e) => setRemainingQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E2DC] bg-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1B4332] mb-1">
                Refill Alert
              </label>
              <select
                value={refillReminderDaysBefore}
                onChange={(e) => setRefillReminderDaysBefore(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E2DC] bg-white text-xs font-bold text-[#1B4332]"
              >
                <option value={3}>3 Days Before</option>
                <option value={5}>5 Days Before</option>
                <option value={7}>7 Days Before</option>
                <option value={10}>10 Days Before</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-[#1B4332] mb-1">
              {t.notes} (Storage advice, with meals, etc.)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#D8E2DC] bg-white text-xs text-[#1B4332]"
              placeholder="e.g. Keep in cool dry place away from children. Take after breakfast."
            />
          </div>

          {/* Privacy Shield Toggle */}
          <div className="p-3 bg-[#F8FAF9] rounded-2xl border border-[#D8E2DC] flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <div className="flex items-center gap-1.5 font-bold text-[#1B4332]">
                <EyeOff className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Privacy Shield on Lock Screen</span>
              </div>
              <p className="text-[10px] text-gray-500">
                Hides drug name on push alerts and shows &quot;Scheduled Medication&quot; for medical discretion.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacyHideName}
                onChange={(e) => setPrivacyHideName(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2D6A4F]"></div>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E9F5EE]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#F8FAF9] hover:bg-[#E9F5EE] text-[#1B4332] rounded-2xl font-bold border border-[#D8E2DC] cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-2xl font-bold cursor-pointer transition-colors shadow-xs"
              id="save-medicine-btn"
            >
              {existingReminder ? 'Update Medicine Schedule' : 'Save Medicine Schedule'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
