import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Activity, 
  Database, 
  Key, 
  CreditCard, 
  Mail, 
  MessageSquare, 
  Thermometer, 
  ShieldCheck, 
  Zap,
  ExternalLink,
  Server
} from 'lucide-react';
import { Language } from '../types';

interface ServiceStatus {
  serviceName: string;
  category: string;
  provider: string;
  status: 'ONLINE' | 'STANDBY_CONFIGURED' | 'NOT_CONFIGURED' | 'DEGRADED';
  latencyMs: number;
  environmentKeyPresent: boolean;
  message: string;
  lastChecked: string;
}

interface ProductionHealthReport {
  overallStatus: 'PRODUCTION_READY' | 'REQUIRES_ENV_SECRETS';
  timestamp: string;
  environment: string;
  services: ServiceStatus[];
  summary: {
    totalServices: number;
    onlineCount: number;
    configuredCount: number;
    unconfiguredCount: number;
  };
}

interface ProductionReadinessManagerProps {
  language: Language;
}

export const ProductionReadinessManager: React.FC<ProductionReadinessManagerProps> = ({ language }) => {
  const [report, setReport] = useState<ProductionHealthReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [testingService, setTestingService] = useState<string | null>(null);

  const fetchHealthAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/production-health');
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (e) {
      console.error('Failed to fetch production health report:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthAudit();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database': return <Database className="w-5 h-5 text-emerald-600" />;
      case 'auth': return <Key className="w-5 h-5 text-blue-600" />;
      case 'payments': return <CreditCard className="w-5 h-5 text-purple-600" />;
      case 'communications': return <Mail className="w-5 h-5 text-amber-600" />;
      case 'iot': return <Thermometer className="w-5 h-5 text-cyan-600" />;
      case 'security': return <ShieldCheck className="w-5 h-5 text-emerald-700" />;
      default: return <Server className="w-5 h-5 text-neutral-600" />;
    }
  };

  const getStatusBadge = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'ONLINE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ONLINE & CONNECTED
          </span>
        );
      case 'STANDBY_CONFIGURED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            STANDBY / READY
          </span>
        );
      case 'NOT_CONFIGURED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            ENV KEY REQUIRED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            DEGRADED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0E7A4B] text-white p-6 rounded-3xl shadow-xs border border-[#0B6B43]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <ShieldCheck className="w-8 h-8 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {language === 'ar' ? 'لوحة جاهزية الإنتاج والاتصال الحي' : language === 'fr' ? 'État de Préparation & Connectivité Production' : 'Production Readiness & Connectivity Health'}
              </h2>
              <p className="text-sm text-white/80 mt-0.5">
                {language === 'ar' 
                  ? 'مصفوفة الفحص المباشر لقواعد البيانات، بوابات الدفع الأفريقية، الرسائل القصيرة، أجهزة إنترنت الأشياء والبريد' 
                  : 'Live connectivity audit for Cloud Firestore, Pan-African Payments, SMS, IoT Cold Chain & Resend/SMTP'}
              </p>
            </div>
          </div>

          <button
            onClick={fetchHealthAudit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#0E7A4B] text-sm font-bold rounded-2xl hover:bg-[#E8F5EE] transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{language === 'ar' ? 'إعادة فحص الاتصالات الحية' : 'Run Live Diagnostics'}</span>
          </button>
        </div>

        {/* Summary Metrics */}
        {report && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/15">
            <div className="bg-white/10 p-3.5 rounded-2xl">
              <span className="text-xs text-emerald-200 block">Overall Status</span>
              <span className="text-base font-bold text-white mt-1 block">
                {report.summary.unconfiguredCount === 0 ? '✅ 100% PRODUCTION READY' : '⚠️ LIVE WITH ENV KEYS'}
              </span>
            </div>
            <div className="bg-white/10 p-3.5 rounded-2xl">
              <span className="text-xs text-emerald-200 block">Online Subsystems</span>
              <span className="text-base font-bold text-emerald-200 mt-1 block">
                {report.summary.onlineCount} / {report.summary.totalServices} Connected
              </span>
            </div>
            <div className="bg-white/10 p-3.5 rounded-2xl">
              <span className="text-xs text-emerald-200 block">Database Architecture</span>
              <span className="text-base font-bold text-white mt-1 block">Cloud Firestore (Multi-Region)</span>
            </div>
            <div className="bg-white/10 p-3.5 rounded-2xl">
              <span className="text-xs text-emerald-200 block">Runtime Environment</span>
              <span className="text-base font-bold text-emerald-200 mt-1 block">
                {report.environment.toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Services List Table */}
      <div className="bg-white rounded-3xl border border-[#E8F5EE] overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#E8F5EE] flex items-center justify-between bg-[#F1FAF4]">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#0E7A4B]" />
            <h3 className="font-bold text-[#111827] text-base">Infrastructure Services & Gateways</h3>
          </div>
          <span className="text-xs text-[#6B7280] font-medium">
            Zero Mock / Live Service Verification Matrix
          </span>
        </div>

        <div className="divide-y divide-[#E8F5EE]">
          {report?.services.map((srv, idx) => (
            <div key={idx} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50/80 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-neutral-100 shrink-0 mt-0.5">
                  {getCategoryIcon(srv.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-neutral-900 text-sm">{srv.serviceName}</h4>
                    <span className="text-xs text-neutral-500 font-medium">({srv.provider})</span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1">{srv.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                <div className="text-right hidden sm:block">
                  <span className="text-[11px] text-neutral-400 block font-mono">
                    Latency: {srv.latencyMs}ms
                  </span>
                </div>
                <div>
                  {getStatusBadge(srv.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
