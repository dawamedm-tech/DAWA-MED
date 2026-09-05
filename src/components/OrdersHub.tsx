import React, { useState } from 'react';
import { Order, Language, CountryConfig, OrderStatus, OrderReview } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { translate, formatCurrency } from '../utils/i18n';
import { OrderTimeline } from './OrderTimeline';
import { OrderHandoverCard } from './OrderHandoverCard';
import { InteractiveMap } from './InteractiveMap';
import { 
  Package, 
  RotateCcw, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  QrCode, 
  Star 
} from 'lucide-react';

interface OrdersHubProps {
  orders: Order[];
  onReorder: (order: Order) => void;
  onViewReceipt: (order: Order) => void;
  onAdvanceStatus?: (orderId: string, nextStatus: OrderStatus) => void;
  onUpdateReview?: (orderId: string, review: OrderReview) => void;
  onReportProblem?: (orderId: string, issue: string) => void;
  onOpenQrVerification?: (order: Order) => void;
  onOpenReviewModal?: (order: Order) => void;
  language: Language;
  selectedCountry: CountryConfig;
}

export const OrdersHub: React.FC<OrdersHubProps> = ({
  orders,
  onReorder,
  onViewReceipt,
  onAdvanceStatus,
  onUpdateReview,
  onReportProblem,
  onOpenQrVerification,
  onOpenReviewModal,
  language,
  selectedCountry,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [activeSubTab, setActiveSubTab] = useState<'active' | 'previous' | 'cancelled'>('active');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(orders[0]?.id || null);

  const activeOrders = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'rejected'
  );
  const previousOrders = orders.filter((o) => o.status === 'delivered');
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled' || o.status === 'rejected');

  const currentList = 
    activeSubTab === 'active' 
      ? activeOrders 
      : activeSubTab === 'previous' 
      ? previousOrders 
      : cancelledOrders;

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="w-full space-y-4" id="orders-hub-container">
      {/* Header & Tabs */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8F5EE] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#111827]">
              {t.myOrdersTitle}
            </h2>
            <p className="text-xs text-[#6B7280]">{translate('myOrdersSubtitle', language)}</p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F1FAF4] rounded-2xl border border-[#D0EADB] overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveSubTab('active')}
              className={`shrink-0 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'active'
                  ? 'bg-[#0E7A4B] text-white shadow-xs'
                  : 'text-[#111827] hover:bg-white/60'
              }`}
              id="orders-tab-active"
            >
              <span>{t.tabActiveOrders}</span>
              {activeOrders.length > 0 && (
                <span className="ms-1.5 px-1.5 py-0.2 bg-[#E8F5EE] text-[#0E7A4B] text-[10px] font-black rounded-full">
                  {activeOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('previous')}
              className={`shrink-0 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'previous'
                  ? 'bg-[#0E7A4B] text-white shadow-xs'
                  : 'text-[#111827] hover:bg-white/60'
              }`}
              id="orders-tab-previous"
            >
              <span>{t.tabPreviousOrders}</span>
              {previousOrders.length > 0 && (
                <span className="ms-1.5 px-1.5 py-0.2 bg-neutral-200 text-neutral-700 text-[10px] font-black rounded-full">
                  {previousOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('cancelled')}
              className={`shrink-0 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'cancelled'
                  ? 'bg-[#0E7A4B] text-white shadow-xs'
                  : 'text-[#111827] hover:bg-white/60'
              }`}
              id="orders-tab-cancelled"
            >
              <span>{t.tabCancelledOrders}</span>
            </button>
          </div>
        </div>

        {/* Order List */}
        {currentList.length === 0 ? (
          <div className="py-12 sm:py-16 text-center text-neutral-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#0E7A4B]" />
            <p className="text-xs font-semibold">
              {activeSubTab === 'active' ? t.noActiveOrders : t.noPreviousOrders}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentList.map((order) => {
              const isExpanded = expandedOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className="border border-[#E8F5EE] rounded-3xl overflow-hidden bg-[#F1FAF4] transition-all hover:border-[#0E7A4B]/40"
                  id={`order-hub-item-${order.id}`}
                >
                  {/* Summary Header */}
                  <div
                    onClick={() => toggleExpand(order.id)}
                    className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer bg-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-[#E8F5EE] text-[#0E7A4B] flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-black text-[#111827] truncate">
                            {order.orderNumber}
                          </h3>
                          <span className="text-[11px] text-[#6B7280] font-medium">
                            • {order.createdAt}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B7280] flex items-center gap-1.5 mt-0.5 truncate">
                          <Building2 className="w-3 h-3 text-[#0E7A4B] shrink-0" />
                          <span className="truncate">{order.pharmacyName}</span>
                          <span>•</span>
                          <span>{order.items.length} {translate('medicationsSelected', language)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-end">
                        <span className="text-xs sm:text-sm font-black text-[#111827]">
                          {formatCurrency(order.totalAmount, selectedCountry, language)}
                        </span>
                        <span className="block text-[10px] font-bold text-[#0E7A4B] capitalize">
                          {order.paymentMethod} • {order.paymentStatus}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 cursor-pointer"
                        aria-label="Toggle details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Actions & Expanded Detailed Section */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-[#E8F5EE] bg-[#F1FAF4] space-y-4">
                      {/* Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => onReorder(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0E7A4B] hover:bg-[#0B6B43] text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                            id={`reorder-btn-${order.id}`}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{translate('reorderBtn', language)}</span>
                          </button>

                          <button
                            onClick={() => onViewReceipt(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#E8F5EE] text-[#111827] border border-[#D0EADB] text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                            id={`view-receipt-btn-${order.id}`}
                          >
                            <FileText className="w-3.5 h-3.5 text-[#0E7A4B]" />
                            <span>{translate('viewReceiptBtn', language)}</span>
                          </button>

                          {onOpenQrVerification && (
                            <button
                              onClick={() => onOpenQrVerification(order)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F5EE] hover:bg-[#D0EADB] text-[#0E7A4B] border border-[#B7E4C7] text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                              id={`verify-qr-btn-${order.id}`}
                            >
                              <QrCode className="w-3.5 h-3.5 text-[#0E7A4B]" />
                              <span>{translate('verifyQrBtn', language)}</span>
                            </button>
                          )}

                          {onOpenReviewModal && (
                            <button
                              onClick={() => onOpenReviewModal(order)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                              id={`rate-order-btn-${order.id}`}
                            >
                              <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
                              <span>{order.review?.pharmacyRating ? `★ ${order.review.pharmacyRating}` : translate('rateDeliveryBtn', language)}</span>
                            </button>
                          )}
                        </div>

                        <span className="text-[11px] font-bold text-[#0E7A4B] bg-[#E8F5EE] px-2.5 py-1 rounded-xl border border-[#D0EADB]">
                          {translate('securityPinLabel', language)} <strong>{order.deliveryOtp || '7492'}</strong>
                        </span>
                      </div>

                      {/* Live Interactive GPS Map for Orders in Delivery Pipeline */}
                      {(order.status === 'out_for_delivery' || order.status === 'in_transit' || order.status === 'picked_up' || order.status === 'driver_assigned') && (
                        <div className="space-y-2">
                          <InteractiveMap
                            order={order}
                            selectedCountry={selectedCountry}
                            language={language}
                            onCallDriver={() => {}}
                            onOpenQrVerification={onOpenQrVerification}
                          />
                        </div>
                      )}

                      {/* Items Summary */}
                      <div className="bg-white p-4 rounded-2xl border border-[#E8F5EE]">
                        <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">
                          {translate('orderedMedicines', language)}
                        </h4>
                        <div className="divide-y divide-gray-100">
                          {order.items.map((item, i) => (
                            <div key={i} className="py-2 flex items-center justify-between text-xs gap-2">
                              <div className="min-w-0">
                                <span className="font-bold text-[#111827] block truncate">{item.medicine.name}</span>
                                <span className="text-[11px] text-[#6B7280] block truncate">{item.medicine.packageSize}</span>
                              </div>
                              <span className="font-semibold text-neutral-700 shrink-0">
                                {translate('qtyPrefix', language)} {item.quantity} × {formatCurrency(item.unitPrice, selectedCountry, language)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 10 Step Interactive Pipeline */}
                      <OrderTimeline
                        order={order}
                        language={language}
                        onAdvanceStatus={onAdvanceStatus}
                      />

                      {/* Handover & Proof of Delivery Card */}
                      <OrderHandoverCard
                        order={order}
                        language={language}
                        onUpdateReview={onUpdateReview}
                        onReportProblem={onReportProblem}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
