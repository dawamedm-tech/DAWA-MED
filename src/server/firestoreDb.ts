import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  AuthUser, 
  Medicine, 
  PharmacyPartner, 
  SupportTicket, 
  AuditLog, 
  Order, 
  FamilyProfile, 
  ChronicRefillRecord, 
  PrescriptionAiOcrExtraction 
} from '../types';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const serverDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);

/**
 * Server-side Firestore Data Service
 * Provides durable cloud persistence for users, medicines, pharmacies, orders, audit logs, etc.
 */
export class FirestoreDataService {
  private static isConnected = false;

  static async init() {
    try {
      this.isConnected = true;
      console.log('✅ FirestoreDataService initialized for database:', firebaseConfig.firestoreDatabaseId);
    } catch (err) {
      console.warn('⚠️ Firestore initialization warning:', err);
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      const pingRef = doc(serverDb, 'system_health', 'ping');
      await getDoc(pingRef);
      return true;
    } catch (e) {
      console.warn('Firestore ping warning:', e);
      return false;
    }
  }

  // --- USERS & AUTH ---
  static async getUser(userId: string): Promise<AuthUser | null> {
    try {
      const snap = await getDoc(doc(serverDb, 'users', userId));
      return snap.exists() ? (snap.data() as AuthUser) : null;
    } catch (e) {
      console.error('Error fetching user:', e);
      return null;
    }
  }

  static async getUserByEmail(email: string): Promise<AuthUser | null> {
    try {
      const q = query(collection(serverDb, 'users'), where('email', '==', email.toLowerCase().trim()), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as AuthUser;
      }
      return null;
    } catch (e) {
      console.error('Error fetching user by email:', e);
      return null;
    }
  }

  static async getUserByFirebaseUid(firebaseUid: string): Promise<AuthUser | null> {
    try {
      const q = query(collection(serverDb, 'users'), where('firebaseUid', '==', firebaseUid), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as AuthUser;
      }
      return null;
    } catch (e) {
      console.error('Error fetching user by firebaseUid:', e);
      return null;
    }
  }

  static async saveUser(user: AuthUser): Promise<void> {
    try {
      await setDoc(doc(serverDb, 'users', user.id), {
        ...user,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error('Error saving user to Firestore:', e);
      throw e;
    }
  }

  static async getAllUsers(): Promise<AuthUser[]> {
    try {
      const snap = await getDocs(collection(serverDb, 'users'));
      return snap.docs.map(d => d.data() as AuthUser);
    } catch (e) {
      console.error('Error getting all users:', e);
      return [];
    }
  }

  // --- MEDICINES ---
  static async getAllMedicines(): Promise<Medicine[]> {
    try {
      const snap = await getDocs(collection(serverDb, 'medicines'));
      return snap.docs.map(d => d.data() as Medicine);
    } catch (e) {
      console.error('Error fetching medicines:', e);
      return [];
    }
  }

  static async getApprovedMedicines(): Promise<Medicine[]> {
    try {
      const q = query(collection(serverDb, 'medicines'), where('approvalStatus', '==', 'approved'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as Medicine);
    } catch (e) {
      console.error('Error fetching approved medicines:', e);
      return [];
    }
  }

  static async saveMedicine(med: Medicine): Promise<void> {
    try {
      await setDoc(doc(serverDb, 'medicines', med.id), {
        ...med,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error('Error saving medicine:', e);
      throw e;
    }
  }

  // --- PHARMACIES ---
  static async getAllPharmacies(): Promise<PharmacyPartner[]> {
    try {
      const snap = await getDocs(collection(serverDb, 'pharmacies'));
      return snap.docs.map(d => d.data() as PharmacyPartner);
    } catch (e) {
      console.error('Error fetching pharmacies:', e);
      return [];
    }
  }

  static async savePharmacy(pharmacy: PharmacyPartner): Promise<void> {
    try {
      await setDoc(doc(serverDb, 'pharmacies', pharmacy.id), {
        ...pharmacy,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error('Error saving pharmacy:', e);
      throw e;
    }
  }

  // --- ORDERS ---
  static async getOrder(orderId: string): Promise<Order | null> {
    try {
      const snap = await getDoc(doc(serverDb, 'orders', orderId));
      return snap.exists() ? (snap.data() as Order) : null;
    } catch (e) {
      console.error('Error fetching order:', e);
      return null;
    }
  }

  static async saveOrder(order: any): Promise<void> {
    try {
      await setDoc(doc(serverDb, 'orders', order.id), {
        ...order,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error('Error saving order:', e);
      throw e;
    }
  }

  static async getAllOrders(): Promise<Order[]> {
    try {
      const snap = await getDocs(collection(serverDb, 'orders'));
      return snap.docs.map(d => d.data() as Order);
    } catch (e) {
      console.error('Error fetching orders:', e);
      return [];
    }
  }

  // --- PRESCRIPTIONS ---
  static async getAllPrescriptions(): Promise<any[]> {
    try {
      const snap = await getDocs(collection(serverDb, 'prescriptions'));
      return snap.docs.map(d => d.data());
    } catch (e) {
      console.error('Error fetching prescriptions:', e);
      return [];
    }
  }

  static async savePrescription(prescription: any): Promise<void> {
    try {
      await setDoc(doc(serverDb, 'prescriptions', prescription.id), {
        ...prescription,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error('Error saving prescription:', e);
      throw e;
    }
  }

  // --- SUPPORT TICKETS ---
  static async getAllSupportTickets(): Promise<SupportTicket[]> {
    try {
      const snap = await getDocs(collection(serverDb, 'support_tickets'));
      return snap.docs.map(d => d.data() as SupportTicket);
    } catch (e) {
      console.error('Error fetching support tickets:', e);
      return [];
    }
  }

  static async saveSupportTicket(ticket: SupportTicket): Promise<void> {
    try {
      await setDoc(doc(serverDb, 'support_tickets', ticket.id), {
        ...ticket,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error('Error saving support ticket:', e);
      throw e;
    }
  }

  // --- PAYMENTS ---
  static async savePayment(payment: any): Promise<void> {
    try {
      await setDoc(doc(serverDb, 'payments', payment.referenceId), {
        ...payment,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error('Error saving payment:', e);
      throw e;
    }
  }

  static async getAllPayments(): Promise<any[]> {
    try {
      const snap = await getDocs(collection(serverDb, 'payments'));
      return snap.docs.map(d => d.data());
    } catch (e) {
      console.error('Error fetching payments:', e);
      return [];
    }
  }

  // --- SETTINGS ---
  static async getSiteSettings(): Promise<any | null> {
    try {
      const snap = await getDoc(doc(serverDb, 'settings', 'site_settings'));
      return snap.exists() ? snap.data() : null;
    } catch (e) {
      console.error('Error fetching site settings:', e);
      return null;
    }
  }

  static async saveSiteSettings(settings: any): Promise<void> {
    try {
      await setDoc(doc(serverDb, 'settings', 'site_settings'), {
        ...settings,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error('Error saving site settings:', e);
      throw e;
    }
  }

  // --- AUDIT LOGS ---
  static async logAudit(entry: Omit<AuditLog, 'id'>): Promise<void> {
    try {
      const id = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await setDoc(doc(serverDb, 'audit_logs', id), {
        id,
        ...entry,
        timestamp: entry.timestamp || new Date().toISOString()
      });
    } catch (e) {
      console.warn('Audit log write warning:', e);
    }
  }

  static async getAuditLogs(limitCount = 100): Promise<AuditLog[]> {
    try {
      const snap = await getDocs(query(collection(serverDb, 'audit_logs'), limit(limitCount)));
      return snap.docs.map(d => d.data() as AuditLog);
    } catch (e) {
      console.error('Error getting audit logs:', e);
      return [];
    }
  }

  // --- TELEMETRY ---
  static async logTelemetry(telemetry: any): Promise<void> {
    try {
      const id = telemetry.id || `tel_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await setDoc(doc(serverDb, 'telemetry', id), {
        id,
        ...telemetry,
        timestamp: telemetry.timestamp || new Date().toISOString()
      });
    } catch (e) {
      console.warn('Telemetry write warning:', e);
    }
  }

  static async getLatestTelemetryForOrder(orderId: string): Promise<any | null> {
    try {
      const q = query(
        collection(serverDb, 'telemetry'),
        where('orderId', '==', orderId),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data();
      }
      return null;
    } catch (e) {
      console.error('Error fetching telemetry for order:', e);
      return null;
    }
  }

  // --- FAMILY HEALTH PROFILES ---
  static async getFamilyProfiles(userId: string): Promise<FamilyProfile[]> {
    try {
      const q = query(collection(serverDb, 'family_profiles'), where('userId', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as FamilyProfile);
    } catch (e) {
      console.warn('Error fetching family profiles from Firestore:', e);
      return [];
    }
  }

  static async saveFamilyProfile(profile: FamilyProfile): Promise<void> {
    try {
      await setDoc(doc(serverDb, 'family_profiles', profile.id), {
        ...profile,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Error saving family profile to Firestore:', e);
    }
  }

  static async deleteFamilyProfile(profileId: string): Promise<void> {
    try {
      await deleteDoc(doc(serverDb, 'family_profiles', profileId));
    } catch (e) {
      console.warn('Error deleting family profile from Firestore:', e);
    }
  }

  // --- CHRONIC REFILLS ---
  static async getChronicRefills(userId: string): Promise<ChronicRefillRecord[]> {
    try {
      const q = query(collection(serverDb, 'chronic_refills'), where('userId', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as ChronicRefillRecord);
    } catch (e) {
      console.warn('Error fetching chronic refills from Firestore:', e);
      return [];
    }
  }

  static async saveChronicRefill(refill: ChronicRefillRecord): Promise<void> {
    try {
      await setDoc(doc(serverDb, 'chronic_refills', refill.id), {
        ...refill
      }, { merge: true });
    } catch (e) {
      console.warn('Error saving chronic refill to Firestore:', e);
    }
  }

  // --- AI PRESCRIPTION OCR ---
  static async savePrescriptionAiOcr(ocr: PrescriptionAiOcrExtraction): Promise<void> {
    try {
      await setDoc(doc(serverDb, 'prescription_ai_ocr', ocr.id), {
        ...ocr
      }, { merge: true });
    } catch (e) {
      console.warn('Error saving prescription AI OCR to Firestore:', e);
    }
  }

  // --- PLATFORM BRANDING & SETTINGS (settings/platform) ---
  static async getPlatformBranding(): Promise<any | null> {
    try {
      const snap = await getDoc(doc(serverDb, 'settings', 'platform'));
      if (snap.exists()) {
        return snap.data();
      }
      return null;
    } catch (e) {
      console.warn('Error fetching platform branding from Firestore:', e);
      return null;
    }
  }

  static async savePlatformBranding(brandingData: Record<string, any>): Promise<void> {
    try {
      await setDoc(doc(serverDb, 'settings', 'platform'), {
        ...brandingData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Error saving platform branding to Firestore:', e);
    }
  }
}

