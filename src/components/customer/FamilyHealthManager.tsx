import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Heart, 
  AlertTriangle, 
  Pill, 
  Trash2, 
  X, 
  Check, 
  Shield, 
  Calendar,
  UserCheck
} from 'lucide-react';
import { FamilyProfile, Language } from '../../types';

interface FamilyHealthManagerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  activeProfileId?: string;
  onSelectProfile: (profile: FamilyProfile) => void;
}

export const FamilyHealthManager: React.FC<FamilyHealthManagerProps> = ({
  isOpen,
  onClose,
  language,
  activeProfileId,
  onSelectProfile
}) => {
  const isRtl = language === 'ar';
  const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state for adding new family member
  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState<FamilyProfile['relationship']>('child');
  const [newDob, setNewDob] = useState('');
  const [newGender, setNewGender] = useState<'male' | 'female' | 'other'>('male');
  const [newBloodGroup, setNewBloodGroup] = useState('O+');
  const [newAllergies, setNewAllergies] = useState('');
  const [newChronicConditions, setNewChronicConditions] = useState('');
  const [newActiveMeds, setNewActiveMeds] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/family-profiles');
      const data = await res.json();
      if (data.success && Array.isArray(data.profiles)) {
        setProfiles(data.profiles);
      }
    } catch (e) {
      console.error('Error fetching family profiles:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfiles();
    }
  }, [isOpen]);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setErrorMessage(isRtl ? 'يرجى كتابة الاسم الكامل' : 'Please enter full name');
      return;
    }

    try {
      setErrorMessage(null);
      const res = await fetch('/api/family-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          relationship: newRelationship,
          dob: newDob || '2000-01-01',
          gender: newGender,
          bloodGroup: newBloodGroup,
          allergies: newAllergies ? newAllergies.split(',').map(s => s.trim()).filter(Boolean) : [],
          chronicConditions: newChronicConditions ? newChronicConditions.split(',').map(s => s.trim()).filter(Boolean) : [],
          activeMedications: newActiveMeds ? newActiveMeds.split(',').map(s => s.trim()).filter(Boolean) : [],
          notes: newNotes
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsAddingNew(false);
        setNewName('');
        setNewAllergies('');
        setNewChronicConditions('');
        setNewActiveMeds('');
        setNewNotes('');
        await fetchProfiles();
        if (data.profile) {
          onSelectProfile(data.profile);
        }
      } else {
        setErrorMessage(data.error || 'Failed to create profile');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error');
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (profileId === 'fam-me') {
      alert(isRtl ? 'لا يمكن حذف الملف الشخصي الأساسي' : 'Cannot delete primary user profile');
      return;
    }

    if (!confirm(isRtl ? 'هل أنت متأكد من حذف هذا الملف الصحي؟' : 'Are you sure you want to remove this family health profile?')) {
      return;
    }

    try {
      const res = await fetch(`/api/family-profiles/${profileId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProfiles(prev => prev.filter(p => p.id !== profileId));
      }
    } catch (err) {
      console.error('Error deleting profile:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      id="family-health-modal"
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {isRtl ? 'إدارة الملفات الصحية العائلية' : 'Family Health Profiles'}
              </h2>
              <p className="text-xs text-emerald-200">
                {isRtl 
                  ? 'سجلات طبية مخصصة وفحص تعارض الحساسية لكل فرد من العائلة' 
                  : 'Independent medical profiles, allergies & medication records'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            id="close-family-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Active Profile Info Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isRtl 
                  ? 'يتم تطبيق فحص الحساسية والجرعات تلقائيًا وفقًا للملف الصحي المختار عند الطلب'
                  : 'Allergy screening & dosage verification apply to the selected profile at checkout.'}
              </span>
            </div>
            {!isAddingNew && (
              <button
                onClick={() => setIsAddingNew(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition-colors shrink-0 shadow-xs"
                id="btn-add-family-member"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRtl ? 'إضافة فرد جديد' : 'Add Member'}</span>
              </button>
            )}
          </div>

          {/* Add New Profile Form */}
          {isAddingNew ? (
            <form onSubmit={handleCreateProfile} className="bg-neutral-50 border border-neutral-300 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <h3 className="text-sm font-bold text-neutral-800">
                  {isRtl ? 'تسجيل فرد جديد بالعائلة' : 'Add New Family Member'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-neutral-500 hover:text-neutral-700"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {isRtl ? 'الاسم الكامل *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={isRtl ? 'مثال: سارة محمد' : 'e.g. Sarah Muthoni'}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {isRtl ? 'صلة القرابة' : 'Relationship'}
                  </label>
                  <select
                    value={newRelationship}
                    onChange={(e) => setNewRelationship(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="child">{isRtl ? 'ابن / ابنة (Child)' : 'Child'}</option>
                    <option value="parent">{isRtl ? 'والد / والدة (Parent)' : 'Parent'}</option>
                    <option value="spouse">{isRtl ? 'زوج / زوجة (Spouse)' : 'Spouse'}</option>
                    <option value="dependent">{isRtl ? 'شخص معال (Dependent)' : 'Dependent'}</option>
                    <option value="other">{isRtl ? 'أخرى (Other)' : 'Other'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {isRtl ? 'تاريخ الميلاد' : 'Date of Birth'}
                  </label>
                  <input
                    type="date"
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {isRtl ? 'الجنس' : 'Gender'}
                    </label>
                    <select
                      value={newGender}
                      onChange={(e) => setNewGender(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                    >
                      <option value="male">{isRtl ? 'ذكر' : 'Male'}</option>
                      <option value="female">{isRtl ? 'أنثى' : 'Female'}</option>
                      <option value="other">{isRtl ? 'آخر' : 'Other'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {isRtl ? 'فصيلة الدم' : 'Blood Group'}
                    </label>
                    <select
                      value={newBloodGroup}
                      onChange={(e) => setNewBloodGroup(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {isRtl ? 'الحساسية الدوائية والغذائية (مفصولة بفاصلة)' : 'Known Allergies (comma separated)'}
                </label>
                <input
                  type="text"
                  value={newAllergies}
                  onChange={(e) => setNewAllergies(e.target.value)}
                  placeholder={isRtl ? 'مثال: بنسلين، سلفا، فول سوداني' : 'e.g. Penicillin, Sulfa, Peanuts'}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {isRtl ? 'الأمراض المزمنة' : 'Chronic Conditions'}
                  </label>
                  <input
                    type="text"
                    value={newChronicConditions}
                    onChange={(e) => setNewChronicConditions(e.target.value)}
                    placeholder={isRtl ? 'مثال: ربو، ضغط دم مرتفع' : 'e.g. Asthma, Hypertension'}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {isRtl ? 'الأدوية الحالية المستمرة' : 'Active Medications'}
                  </label>
                  <input
                    type="text"
                    value={newActiveMeds}
                    onChange={(e) => setNewActiveMeds(e.target.value)}
                    placeholder={isRtl ? 'مثال: بخاخ فنتولين' : 'e.g. Salbutamol Inhaler'}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {isRtl ? 'ملاحظات الصيدلي والطبيب' : 'Clinical Notes'}
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder={isRtl ? 'تعليمات خاصة للجرعات أو الحفظ' : 'Special clinical instructions'}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                />
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
                  {isRtl ? 'حفظ الملف الصحي' : 'Save Health Profile'}
                </button>
              </div>
            </form>
          ) : null}

          {/* Profile Cards List */}
          {isLoading ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              {isRtl ? 'جاري تحميل الملفات الصحية...' : 'Loading family profiles...'}
            </div>
          ) : profiles.length === 0 ? (
            <div className="py-8 text-center text-neutral-500 space-y-2">
              <Users className="w-8 h-8 mx-auto text-neutral-400" />
              <p className="text-xs">{isRtl ? 'لم يتم تسجيل أفراد بعد' : 'No family profiles found'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profiles.map((p) => {
                const isSelected = p.id === activeProfileId;
                const relationshipBadge = {
                  me: isRtl ? 'أنا (الأساسي)' : 'Self (Primary)',
                  child: isRtl ? 'طفل' : 'Child',
                  parent: isRtl ? 'والد / والدة' : 'Parent',
                  spouse: isRtl ? 'زوج / زوجة' : 'Spouse',
                  dependent: isRtl ? 'معال' : 'Dependent',
                  other: isRtl ? 'آخر' : 'Other'
                }[p.relationship] || p.relationship;

                return (
                  <div
                    key={p.id}
                    className={`border rounded-xl p-3.5 transition-all relative flex flex-col justify-between ${
                      isSelected 
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 shadow-xs' 
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-neutral-900">{p.name}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {relationshipBadge}
                            </span>
                            {p.bloodGroup && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-red-100 text-red-800 border border-red-200">
                                {p.bloodGroup}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>{p.dob}</span>
                            <span>•</span>
                            <span className="capitalize">{p.gender}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          {p.relationship !== 'me' && (
                            <button
                              onClick={() => handleDeleteProfile(p.id)}
                              className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                              title={isRtl ? 'حذف الملف' : 'Delete profile'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Allergies and Warnings */}
                      <div className="space-y-1.5 my-2">
                        {p.allergies && p.allergies.length > 0 ? (
                          <div className="flex items-center gap-1 flex-wrap text-[11px]">
                            <span className="text-red-700 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                              {isRtl ? 'حساسية:' : 'Allergies:'}
                            </span>
                            {p.allergies.map((a, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[10px] font-medium">
                                {a}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                            <Shield className="w-3 h-3 text-emerald-500" />
                            <span>{isRtl ? 'لا توجد حساسية دوائية مسجلة' : 'No known drug allergies'}</span>
                          </div>
                        )}

                        {p.chronicConditions && p.chronicConditions.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap text-[11px]">
                            <span className="text-amber-800 font-semibold flex items-center gap-1">
                              <Heart className="w-3 h-3 text-amber-600" />
                              {isRtl ? 'حالات مزمنة:' : 'Chronic:'}
                            </span>
                            {p.chronicConditions.map((c, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px]">
                                {c}
                              </span>
                            ))}
                          </div>
                        )}

                        {p.activeMedications && p.activeMedications.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap text-[11px]">
                            <span className="text-blue-800 font-semibold flex items-center gap-1">
                              <Pill className="w-3 h-3 text-blue-600" />
                              {isRtl ? 'أدوية حالية:' : 'Meds:'}
                            </span>
                            {p.activeMedications.map((m, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[10px]">
                                {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between mt-2">
                      <button
                        onClick={() => {
                          onSelectProfile(p);
                          onClose();
                        }}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                          isSelected 
                            ? 'bg-emerald-700 text-white shadow-xs' 
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{isRtl ? 'الملف النشط حالياً' : 'Active Profile Selected'}</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{isRtl ? 'تفعيل هذا الملف للطلب' : 'Select For Ordering'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-neutral-100 border-t border-neutral-200 flex justify-end shrink-0">
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
