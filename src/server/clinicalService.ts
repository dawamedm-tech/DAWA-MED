/**
 * DAWA MED — Clinical Pharmacy & Patient Safety Engine
 * Handles Drug-Drug Interaction screening, Duplicate Active Ingredient detection,
 * Allergy Cross-Reactivity checks, Approved Generic Alternatives, Symptom-to-OTC Triage,
 * and Cryptographically Signed e-Prescriptions.
 */

import crypto from 'crypto';
import { 
  DrugInteractionWarning, 
  GenericAlternative, 
  SymptomGuidanceItem, 
  Medicine 
} from '../types';

export class ClinicalService {
  private static instance: ClinicalService;
  private readonly secretKey: string;

  constructor() {
    this.secretKey = process.env.JWT_SECRET || 'dawa_clinical_safety_master_key_2026';
  }

  public static getInstance(): ClinicalService {
    if (!ClinicalService.instance) {
      ClinicalService.instance = new ClinicalService();
    }
    return ClinicalService.instance;
  }

  // =========================================================================
  // 1. DRUG-DRUG INTERACTIONS & DUPLICATE ACTIVE INGREDIENTS
  // =========================================================================

  public checkDrugInteractions(medicines: { name: string; genericName?: string }[]): DrugInteractionWarning[] {
    const warnings: DrugInteractionWarning[] = [];
    const normalizedList = medicines.map(m => ({
      name: m.name.toLowerCase(),
      generic: (m.genericName || m.name).toLowerCase()
    }));

    // Check for Duplicate Active Ingredients
    const genericCounts = new Map<string, string[]>();
    normalizedList.forEach(m => {
      const g = m.generic.trim();
      if (!genericCounts.has(g)) {
        genericCounts.set(g, []);
      }
      genericCounts.get(g)!.push(m.name);
    });

    genericCounts.forEach((drugNames, generic) => {
      if (drugNames.length > 1) {
        warnings.push({
          severity: 'high',
          drugsInvolved: drugNames,
          titleEn: `Duplicate Active Ingredient Detected: ${generic.toUpperCase()}`,
          titleAr: `تحذير: تكرار المادة الفعالة (${generic}) في أكثر من دواء`,
          descriptionEn: `You have added multiple medicines containing '${generic}'. Consuming multiple products with the same active compound significantly increases the risk of toxic overdose.`,
          descriptionAr: `لقد قمت بإضافة أكثر من دواء يحتوي على المادة الفعالة '${generic}'. تناول أدوية متعددة بنفس المادة الفعالة يعرضك لخطر التسمم الدوائي وتجاوز الجرعة الآمنة.`,
          clinicalAdviceEn: 'Consult the dispensing pharmacist to select only ONE product and avoid accidental double-dosing.',
          clinicalAdviceAr: 'يرجى مراجعة الصيدلي المعتمد لاختيار منتج واحد فقط لتجنب مضاعفة الجرعة دون قصد.',
          isDuplicateActiveIngredient: true,
          duplicateIngredientName: generic,
          pharmacistReviewRequired: true
        });
      }
    });

    // Known Major Clinical Interactions Database
    const knownInteractions = [
      {
        matchA: ['warfarin', 'coumadin'],
        matchB: ['ibuprofen', 'aspirin', 'diclofenac', 'naproxen', 'advil', 'brufen'],
        severity: 'high' as const,
        titleEn: 'Severe Bleeding Risk (Anticoagulant + NSAID)',
        titleAr: 'خطر نزيف حاد (مضاد تخثر + مسكن مضاد للالتهاب)',
        descEn: 'Concurrent use of Warfarin with NSAIDs dramatically elevates the risk of severe gastrointestinal bleeding and hemorrhagic complications.',
        descAr: 'الاستخدام المتزامن للوارفارين مع مضادات الالتهاب غير الستيرويدية يرفع خطر الإصابة بنزيف معوي حاد ومضاعفات نزفية خطيرة.',
        adviceEn: 'Do not combine without direct clinical prescriber supervision. Paracetamol is generally preferred for pain under doctor approval.',
        adviceAr: 'لا تجمع بين هذه الأدوية إلا بتوجيه طبي مباشر. يُفضل عمومًا الباراسيتامول لتسكين الألم بعد موافقة الطبيب.'
      },
      {
        matchA: ['metformin', 'glucophage'],
        matchB: ['alcohol', 'radiocontrast'],
        severity: 'high' as const,
        titleEn: 'Lactic Acidosis Risk (Metformin + Contrast/Alcohol)',
        titleAr: 'خطر الحماض اللبني (ميتفورمين)',
        descEn: 'Metformin combined with iodine contrast media or heavy alcohol intake increases risk of fatal lactic acidosis.',
        descAr: 'تناول الميتفورمين مع الصبغات الطبية الإشعاعية يزيد من خطر حدوث حماض لبني خطير.',
        adviceEn: 'Temporarily withhold Metformin before planned contrast imaging as instructed by physician.',
        adviceAr: 'يجب إيقاف الميتفورمين مؤقتًا قبل إجراء الفحوصات الإشعاعية بالصبغة وفق إرشادات الطبيب.'
      },
      {
        matchA: ['enalapril', 'lisinopril', 'losartan', 'valsartan'],
        matchB: ['spironolactone', 'potassium', 'aldactone'],
        severity: 'moderate' as const,
        titleEn: 'Hyperkalemia Risk (ACEi/ARB + Potassium-sparing agent)',
        titleAr: 'خطر ارتفاع بوتاسيوم الدم (أدوية الضغط ومكملات البوتاسيوم)',
        descEn: 'Co-administration can cause dangerously elevated potassium levels in the blood, leading to cardiac arrhythmias.',
        descAr: 'الجمع بين هذه الأدوية قد يؤدي لارتفاع حاد وخطير في مستوى البوتاسيوم مما يؤثر على انتظام ضربات القلب.',
        adviceEn: 'Requires serum potassium and creatinine monitoring by treating physician.',
        adviceAr: 'يتطلب فحصًا دوريًا لمستوى البوتاسيوم ووظائف الكلى بإشراف الطبيب المعالج.'
      },
      {
        matchA: ['amoxicillin', 'ampicillin', 'augmentin'],
        matchB: ['methotrexate'],
        severity: 'high' as const,
        titleEn: 'Methotrexate Toxicity Warning',
        titleAr: 'تحذير سمية الميثوتريكسات مع البنسلينات',
        descEn: 'Penicillins reduce kidney clearance of Methotrexate, potentially causing acute bone marrow suppression and severe toxicity.',
        descAr: 'تقلل البنسلينات من إفراز الميثوتريكسات عبر الكلى مما قد يؤدي إلى تسمم حاد في نخاع العظم.',
        adviceEn: 'Immediate pharmacist intervention required before dispensing.',
        adviceAr: 'يتطلب تدخلاً صيدلانياً فورياً وتعديل الخطة العلاجية قبل الصرف.'
      },
      {
        matchA: ['simvastatin', 'atorvastatin', 'lipitor', 'zocor'],
        matchB: ['clarithromycin', 'erythromycin', 'itraconazole', 'ketoconazole'],
        severity: 'moderate' as const,
        titleEn: 'Myopathy & Rhabdomyolysis Risk (Statin + CYP3A4 Inhibitor)',
        titleAr: 'خطر تلف العضلات (الستاتينات مع بعض المضادات الحيوية)',
        descEn: 'Macrolide antibiotics markedly increase blood levels of statins, risking muscle pain, weakness, and kidney injury.',
        descAr: 'المضادات الحيوية الماكروليدية ترفع تركيز أدوية الكوليسترول بالدم وتزيد من احتمالية تضرر العضلات والكلى.',
        adviceEn: 'Temporarily pause statin during antibiotic course under medical direction.',
        adviceAr: 'يُنصح بإيقاف الستاتين مؤقتًا طوال فترة تناول المضاد الحيوي بموافقة الطبيب.'
      },
      {
        matchA: ['sildenafil', 'viagra', 'tadalafil', 'cialis'],
        matchB: ['nitroglycerin', 'isosorbide', 'angised'],
        severity: 'high' as const,
        titleEn: 'Fatal Hypotension Hazard (PDE5 Inhibitor + Nitrates)',
        titleAr: 'خطر انخفاض ضغط الدم القاتل (منشطات الدورة الدموية + النترات)',
        descEn: 'Dangerous, potentially fatal precipitous drop in blood pressure when combined.',
        descAr: 'يحدث هبوط حاد وشديد في ضغط الدم قد يهدد الحياة عند تناولهما معًا.',
        adviceEn: 'ABSOLUTE CONTRAINDICATION. Never combine under any circumstances.',
        adviceAr: 'ممنوع تمامًا الجمع بينهما تحت أي ظرف لما يشكله من خطر مميت.'
      }
    ];

    // Evaluate combinations
    for (let i = 0; i < normalizedList.length; i++) {
      for (let j = i + 1; j < normalizedList.length; j++) {
        const itemA = normalizedList[i];
        const itemB = normalizedList[j];

        knownInteractions.forEach(rule => {
          const aMatchesA = rule.matchA.some(k => itemA.generic.includes(k) || itemA.name.includes(k));
          const bMatchesB = rule.matchB.some(k => itemB.generic.includes(k) || itemB.name.includes(k));

          const aMatchesB = rule.matchB.some(k => itemA.generic.includes(k) || itemA.name.includes(k));
          const bMatchesA = rule.matchA.some(k => itemB.generic.includes(k) || itemB.name.includes(k));

          if ((aMatchesA && bMatchesB) || (aMatchesB && bMatchesA)) {
            warnings.push({
              severity: rule.severity,
              drugsInvolved: [medicines[i].name, medicines[j].name],
              titleEn: rule.titleEn,
              titleAr: rule.titleAr,
              descriptionEn: rule.descEn,
              descriptionAr: rule.descAr,
              clinicalAdviceEn: rule.adviceEn,
              clinicalAdviceAr: rule.adviceAr,
              isDuplicateActiveIngredient: false,
              pharmacistReviewRequired: true
            });
          }
        });
      }
    }

    return warnings;
  }

  // =========================================================================
  // 2. PATIENT ALLERGY CROSS-REACTIVITY SCREENING
  // =========================================================================

  public checkAllergyConflicts(allergies: string[], medicines: { name: string; genericName?: string }[]): DrugInteractionWarning[] {
    const warnings: DrugInteractionWarning[] = [];
    if (!allergies || allergies.length === 0) return warnings;

    const normalizedAllergies = allergies.map(a => a.toLowerCase().trim());

    medicines.forEach(med => {
      const medName = med.name.toLowerCase();
      const generic = (med.genericName || med.name).toLowerCase();

      // Penicillin cross-reactivity
      if (normalizedAllergies.some(a => a.includes('penicillin') || a.includes('بنسلين'))) {
        if (generic.includes('cillin') || medName.includes('augmentin') || medName.includes('amoxil') || medName.includes('amoxicillin')) {
          warnings.push({
            severity: 'high',
            drugsInvolved: [med.name],
            titleEn: `Allergy Conflict: Penicillin Cross-Reactivity (${med.name})`,
            titleAr: `تعارض حساسية خطير: حساسية البنسلين (${med.name})`,
            descriptionEn: `Patient profile lists a known Penicillin allergy. '${med.name}' is a beta-lactam penicillin and may trigger severe anaphylactic reactions.`,
            descriptionAr: `الملف الصحي للمريض يسجل حساسية تجاه البنسلين. دواء '${med.name}' مشتق بنسليني وقد يؤدي لصدمة حساسية مهددة للحياة.`,
            clinicalAdviceEn: 'Do not dispense. Select non-penicillin alternative (e.g. Azithromycin) after consulting physician.',
            clinicalAdviceAr: 'يمنع الصرف. يجب استبداله بمضاد حيوي غير بنسليني (مثل أزيثرومايسين) بتوصية الطبيب.',
            isDuplicateActiveIngredient: false,
            pharmacistReviewRequired: true
          });
        }
      }

      // Sulfa / Sulfonamide cross-reactivity
      if (normalizedAllergies.some(a => a.includes('sulfa') || a.includes('سلفا'))) {
        if (generic.includes('sulfa') || generic.includes('cotrimoxazole') || medName.includes('bactrim') || medName.includes('septrin')) {
          warnings.push({
            severity: 'high',
            drugsInvolved: [med.name],
            titleEn: `Allergy Conflict: Sulfa Drug (${med.name})`,
            titleAr: `تعارض حساسية: حساسية مركبات السلفا (${med.name})`,
            descriptionEn: `Patient has documented Sulfa allergy. '${med.name}' contains sulfonamide compounds.`,
            descriptionAr: `المريض لديه حساسية موثقة تجاه السلفا. دواء '${med.name}' يحتوي على مركبات السلفوناميد.`,
            clinicalAdviceEn: 'Pharmacist must halt order and verify suitable substitute with prescriber.',
            clinicalAdviceAr: 'يجب على الصيدلي إيقاف الطلب والتشاور مع الطبيب لتحديد بديل آمن.',
            isDuplicateActiveIngredient: false,
            pharmacistReviewRequired: true
          });
        }
      }

      // NSAID / Aspirin allergy
      if (normalizedAllergies.some(a => a.includes('aspirin') || a.includes('nsaid') || a.includes('أسبرين') || a.includes('مسكنات'))) {
        if (generic.includes('ibuprofen') || generic.includes('aspirin') || generic.includes('diclofenac') || generic.includes('naproxen')) {
          warnings.push({
            severity: 'high',
            drugsInvolved: [med.name],
            titleEn: `Allergy Conflict: NSAID Cross-Sensitivity (${med.name})`,
            titleAr: `تعارض حساسية: حساسية مضادات الالتهاب غير الستيرويدية (${med.name})`,
            descriptionEn: `Patient is allergic to Aspirin or NSAIDs. '${med.name}' may induce bronchospasm or severe urticaria.`,
            descriptionAr: `المريض يعاني من حساسية تجاه الأسبرين أو المسكنات. دواء '${med.name}' قد يسبب نوبة ضيق تنفس حادة أو طفحًا تحسسيًا.`,
            clinicalAdviceEn: 'Use Paracetamol if tolerated, with physician oversight.',
            clinicalAdviceAr: 'استخدم الباراسيتامول كبديل آمن بإشراف الطبيب.',
            isDuplicateActiveIngredient: false,
            pharmacistReviewRequired: true
          });
        }
      }
    });

    return warnings;
  }

  // =========================================================================
  // 3. GENERIC MEDICINE ALTERNATIVES ENGINE
  // =========================================================================

  public findGenericAlternatives(targetMedicine: Medicine, catalog: Medicine[]): GenericAlternative[] {
    const activeGeneric = (targetMedicine.genericName || '').toLowerCase().trim();
    if (!activeGeneric) return [];

    const alternatives: GenericAlternative[] = [];

    catalog.forEach(med => {
      if (med.id === targetMedicine.id) return;
      const otherGeneric = (med.genericName || '').toLowerCase().trim();

      // Check if active ingredient matches
      if (otherGeneric === activeGeneric || (activeGeneric.length > 4 && otherGeneric.includes(activeGeneric))) {
        const savings = Math.max(0, targetMedicine.priceUSD - med.priceUSD);
        const savingsPercent = targetMedicine.priceUSD > 0 ? Math.round((savings / targetMedicine.priceUSD) * 100) : 0;

        alternatives.push({
          id: `gen-alt-${med.id}`,
          originalMedicineId: targetMedicine.id,
          name: med.name,
          genericName: med.genericName,
          activeIngredient: med.genericName,
          strength: med.dosage || 'Standard',
          dosageForm: med.dosage || 'Tablet / Capsule',
          manufacturer: med.manufacturer || 'Approved Generic Lab',
          priceUSD: med.priceUSD,
          savingsUSD: parseFloat(savings.toFixed(2)),
          savingsPercentage: savingsPercent,
          isBioequivalentApproved: true,
          inStock: (med.stockCount || 0) > 0,
          pharmacyId: med.submittedByPharmacyId || med.availablePharmacyIds?.[0] || 'pharma-01',
          pharmacyName: med.submittedByPharmacyName || 'Network Partner Chemist',
          requiresPharmacistReview: targetMedicine.requiresPrescription
        });
      }
    });

    // Sort by largest savings first
    return alternatives.sort((a, b) => b.savingsPercentage - a.savingsPercentage);
  }

  // =========================================================================
  // 4. SYMPTOM-TO-OTC CLINICAL GUIDANCE (Strict Non-Diagnostic Boundaries)
  // =========================================================================

  public getSymptomGuidance(query: string): SymptomGuidanceItem[] {
    const q = query.toLowerCase().trim();

    const guidanceDatabase: SymptomGuidanceItem[] = [
      {
        id: 'sym-chest-pain',
        symptomEn: 'Severe Chest Pain / Pressure',
        symptomAr: 'ألم أو ضغط شديد في الصدر',
        category: 'Cardiovascular Emergency',
        isEmergencyRedFlag: true,
        redFlagWarningEn: 'EMERGENCY RED FLAG: Sudden chest pressure, pain radiating to left arm or jaw, sweating, or difficulty breathing may indicate acute myocardial infarction (heart attack). DO NOT TAKE OTC MEDICINES. CALL EMERGENCY SERVICES IMMEDIATELY.',
        redFlagWarningAr: 'حالة طوارئ قصوى: ألم أو ضغط الصدر الممتد للذراع أو الفك مع تعرق أو ضيق تنفس قد يشير لأزمة قلبية حادة. يمنع أخذ مسكنات أو أدوية بدون وصفة. اتصل بالإسعاف فوراً وتوجه لأقرب طوارئ.',
        recommendedOtcs: [],
        lifestyleAdviceEn: ['Rest in seated position', 'Keep airway open', 'Do not drive yourself'],
        lifestyleAdviceAr: ['الجلوس والراحة التامة', 'إبقاء مجرى التنفس مفتوحاً', 'عدم قيادة السيارة بنفسك'],
        whenToSeeDoctorEn: 'IMMEDIATE EMERGENCY CARE REQUIRED. Call national emergency hotline.',
        whenToSeeDoctorAr: 'رعاية طبية طارئة وفورية. اتصل برقم الطوارئ المحلي الآن.'
      },
      {
        id: 'sym-headache-mild',
        symptomEn: 'Mild to Moderate Tension Headache',
        symptomAr: 'صداع التوتر البسيط إلى المتوسط',
        category: 'Neurological / Pain',
        isEmergencyRedFlag: false,
        recommendedOtcs: [
          {
            genericName: 'Paracetamol / Acetaminophen 500mg',
            brandExamples: ['Panadol', 'Tylenol', 'Dafalgan'],
            purposeEn: 'First-line analgesic for mild tension headaches',
            purposeAr: 'الخيار الأول لتسكين آلام الصداع البسيط',
            maxDurationDays: 3
          },
          {
            genericName: 'Ibuprofen 400mg',
            brandExamples: ['Advil', 'Brufen', 'Nurofen'],
            purposeEn: 'Anti-inflammatory relief if no stomach ulcer or kidney disease',
            purposeAr: 'مسكن مضاد للالتهاب لمن لا يعانون من قرحة معدية أو اعتلال كلوي',
            maxDurationDays: 3
          }
        ],
        lifestyleAdviceEn: ['Hydrate with 500ml water', 'Rest in dim quiet room', 'Avoid screen glare'],
        lifestyleAdviceAr: ['شرب الماء بكمية كافية', 'الراحة في غرفة مظلمة وهادئة', 'الابتعاد عن شاشات الأجهزة'],
        whenToSeeDoctorEn: 'If headache is sudden and explosive ("thunderclap"), accompanied by high fever, stiff neck, vision loss, or confusion.',
        whenToSeeDoctorAr: 'إذا كان الصداع شديداً ومفاجئاً، أو مصحوباً بارتفاع حرارة، تيبس بالرقبة، أو تشوش في الرؤية.'
      },
      {
        id: 'sym-heartburn',
        symptomEn: 'Acid Reflux / Heartburn',
        symptomAr: 'حموضة وحرقة المعدة (ارتجاع المريء)',
        category: 'Gastrointestinal',
        isEmergencyRedFlag: false,
        recommendedOtcs: [
          {
            genericName: 'Antacid (Aluminum/Magnesium Hydroxide)',
            brandExamples: ['Maalox', 'Gaviscon', 'Mylanta'],
            purposeEn: 'Rapid neutralization of excess stomach acid',
            purposeAr: 'معادلة سريعة لحموضة المعدة الزائدة',
            maxDurationDays: 7
          },
          {
            genericName: 'Famotidine 20mg',
            brandExamples: ['Pepcid', 'Famotin'],
            purposeEn: 'H2-receptor blocker for acid reduction',
            purposeAr: 'تقليل إفراز الحمض المعدي',
            maxDurationDays: 14
          }
        ],
        lifestyleAdviceEn: ['Avoid eating within 3 hours of sleep', 'Elevate head of bed', 'Limit spicy and fatty foods'],
        lifestyleAdviceAr: ['تجنب الأكل قبل النوم بثلاث ساعات', 'رفع الرأس أثناء النوم', 'تقليل الأطعمة الدسمة والحارة'],
        whenToSeeDoctorEn: 'If accompanied by difficulty swallowing, unintentional weight loss, or vomiting blood.',
        whenToSeeDoctorAr: 'في حال وجود صعوبة في البلع، فقدان غير مبرر للوزن، أو قيء دموي.'
      },
      {
        id: 'sym-seasonal-allergies',
        symptomEn: 'Seasonal Allergy & Sneezing',
        symptomAr: 'حساسية الأنف الموسمية والعطاس',
        category: 'Respiratory / Allergy',
        isEmergencyRedFlag: false,
        recommendedOtcs: [
          {
            genericName: 'Cetirizine 10mg',
            brandExamples: ['Zyrtec', 'Cetrine'],
            purposeEn: 'Non-sedating antihistamine for sneezing and runny nose',
            purposeAr: 'مضاد هيستامين لتخفيف العطاس وسيلان الأنف',
            maxDurationDays: 14
          },
          {
            genericName: 'Loratadine 10mg',
            brandExamples: ['Claritin', 'Loratin'],
            purposeEn: '24-hour allergy relief without drowsiness',
            purposeAr: 'راحة 24 ساعة من أعراض الحساسية دون نعاس',
            maxDurationDays: 14
          }
        ],
        lifestyleAdviceEn: ['Rinse nose with saline spray', 'Keep windows closed during high pollen', 'Wash face after being outdoors'],
        lifestyleAdviceAr: ['غسيل الأنف بمحلول ملحي معقم', 'إغلاق النوافذ عند زيادة الغبار', 'غسل الوجه بعد التواجد بالخارج'],
        whenToSeeDoctorEn: 'If wheezing, asthma exacerbation, or facial swelling occurs.',
        whenToSeeDoctorAr: 'إذا ظهر صفير بالصدر، أو ضيق تنفس حاد، أو تورم في الوجه والشفتين.'
      },
      {
        id: 'sym-fever-infant',
        symptomEn: 'High Fever in Infant (< 3 months)',
        symptomAr: 'حمى وارتفاع حرارة الرضيع (أقل من 3 أشهر)',
        category: 'Pediatric Emergency',
        isEmergencyRedFlag: true,
        redFlagWarningEn: 'EMERGENCY RED FLAG: Rectal temperature ≥ 38.0°C (100.4°F) in an infant under 3 months is a medical emergency requiring urgent pediatric evaluation to rule out serious bacterial infection. DO NOT SELF-MEDICATE WITH OTC DRUGS.',
        redFlagWarningAr: 'حالة طوارئ للأطفال: أي ارتفاع حرارة (≥ 38°C) في طفل رضيع أقل من 3 أشهر يعتبر طارئاً طبياً يستوجب فحص طبيب أطفال فوراً. يمنع إعطاء أدوية خافضة للحرارة دون تقييم طبي عاجل.',
        recommendedOtcs: [],
        lifestyleAdviceEn: ['Keep infant comfortable', 'Do not bundle with heavy blankets', 'Transport immediately to hospital'],
        lifestyleAdviceAr: ['الحفاظ على راحة الطفل', 'عدم لفه بأغطية ثقيلة', 'التوجه الفوري لأقرب مستشفى أطفال'],
        whenToSeeDoctorEn: 'IMMEDIATE EMERGENCY HOSPITAL ADMISSION REQUIRED.',
        whenToSeeDoctorAr: 'مراجعة طوارئ الأطفال بالمستشفى فوراً دون أي تأخير.'
      }
    ];

    if (!q) return guidanceDatabase;

    return guidanceDatabase.filter(item => 
      item.symptomEn.toLowerCase().includes(q) ||
      item.symptomAr.includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.recommendedOtcs.some(o => o.genericName.toLowerCase().includes(q))
    );
  }

  // =========================================================================
  // 5. CRYPTOGRAPHICALLY SIGNED E-PRESCRIPTION ENGINE
  // =========================================================================

  public signDigitalPrescription(payload: {
    prescriptionId: string;
    patientId: string;
    doctorLicense: string;
    medicines: string[];
    expiresAt: string;
  }): { digitalSignature: string; qrPayload: string; isTamperProof: boolean } {
    const raw = `${payload.prescriptionId}|${payload.patientId}|${payload.doctorLicense}|${payload.medicines.sort().join(',')}|${payload.expiresAt}`;
    const digitalSignature = crypto.createHmac('sha256', this.secretKey).update(raw).digest('hex');
    const qrPayload = `DAWA_E_RX_V1:${Buffer.from(JSON.stringify({ ...payload, sig: digitalSignature })).toString('base64url')}`;

    return {
      digitalSignature,
      qrPayload,
      isTamperProof: true
    };
  }

  public verifyDigitalPrescription(qrPayload: string): {
    valid: boolean;
    expired: boolean;
    payload?: any;
    error?: string;
  } {
    try {
      if (!qrPayload.startsWith('DAWA_E_RX_V1:')) {
        return { valid: false, expired: false, error: 'Unrecognized e-prescription format' };
      }

      const encoded = qrPayload.replace('DAWA_E_RX_V1:', '');
      const jsonStr = Buffer.from(encoded, 'base64url').toString('utf8');
      const data = JSON.parse(jsonStr);

      const raw = `${data.prescriptionId}|${data.patientId}|${data.doctorLicense}|${data.medicines.sort().join(',')}|${data.expiresAt}`;
      const expectedSig = crypto.createHmac('sha256', this.secretKey).update(raw).digest('hex');

      if (expectedSig !== data.sig) {
        return { valid: false, expired: false, error: 'Cryptographic signature mismatch — prescription was altered' };
      }

      const isExpired = new Date(data.expiresAt).getTime() < Date.now();
      return {
        valid: true,
        expired: isExpired,
        payload: data
      };
    } catch (e: any) {
      return { valid: false, expired: false, error: e.message || 'Verification failed' };
    }
  }
}

export const clinicalService = ClinicalService.getInstance();
