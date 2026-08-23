import React, { useState } from 'react';
import { Order, Language, CountryConfig, OrderStatus, OrderReview } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { OrderTimeline } from './OrderTimeline';
import { OrderHandoverCard } from './OrderHandoverCard';
import { InteractiveMap } from './InteractiveMap';
import { 
  Package, 
  RotateCcw, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Building2,
  Bike,
  QrCode,
  Sparkles,
  Star,
  ShieldCheck
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
    <div className="space-y-6" id="orders-hub-container">
      {/* Header & Tabs */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D8E2DC] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#1B4332]">
              {t.myOrdersTitle}
            </h2>
            <p className="text-xs text-gray-500">Track and manage your verified pharmacy shipments</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#F0F7F4] rounded-2xl border border-[#D8E2DC]">
            <button
              onClick={() => setActiveSubTab('active')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'active'
                  ? 'bg-[#2D6A4F] text-white shadow-xs'
                  : 'text-[#1B4332] hover:bg-white/60'
              }`}
              id="orders-tab-active"
            >
              <span>{t.tabActiveOrders}</span>
              {activeOrders.length > 0 && (
                <span className="ms-1.5 px-1.5 py-0.2 bg-[#D8F3DC] text-[#1B4332] text-[10px] font-black rounded-full">
                  {activeOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('previous')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'previous'
                  ? 'bg-[#2D6A4F] text-white shadow-xs'
                  : 'text-[#1B4332] hover:bg-white/60'
              }`}
              id="orders-tab-previous"
            >
              <span>{t.tabPreviousOrders}</span>
              {previousOrders.length > 0 && (
                <span className="ms-1.5 px-1.5 py-0.2 bg-gray-200 text-gray-700 text-[10px] font-black rounded-full">
                  {previousOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('cancelled')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'cancelled'
                  ? 'bg-[#2D6A4F] text-white shadow-xs'
                  : 'text-[#1B4332] hover:bg-white/60'
              }`}
              id="orders-tab-cancelled"
            >
              <span>{t.tabCancelledOrders}</span>
            </button>
          </div>
        </div>

        {/* Order List */}
        {currentList.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#2D6A4F]" />
            <p className="text-xs font-semibold">
              {activeSubTab === 'active' ? t.noActiveOrders : t.noPreviousOrders}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentList.map((order) => {
              const isExpanded = expandedOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className="border border-[#D8E2DC] rounded-3xl overflow-hidden bg-[#F8FAF9] transition-all hover:border-[#74C69D]"
                  id={`order-hub-item-${order.id}`}
                >
                  {/* Summary Header */}
                  <div
                    onClick={() => toggleExpand(order.id)}
                    className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-black text-[#1B4332]">
                            {order.orderNumber}
                          </h3>
                          <span className="text-[11px] text-gray-500 font-medium">
                            • {order.createdAt}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3 h-3 text-[#2D6A4F]" />
                          <span>{order.pharmacyName}</span>
                          <span>•</span>
                          <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-end">
                        <span className="text-xs sm:text-sm font-black text-[#1B4332]">
                          {selectedCountry.currencySymbol} {(order.totalAmount * selectedCountry.exchangeRateToUSD).toFixed(0)}
                        </span>
                        <span className="block text-[10px] font-bold text-[#2D6A4F] capitalize">
                          {order.paymentMethod} • {order.paymentStatus}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
                        aria-label="Toggle details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Actions & Expanded Detailed Section */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 border-t border-[#D8E2DC] bg-[#F8FAF9] space-y-6">
                      {/* Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => onReorder(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                            id={`reorder-btn-${order.id}`}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{t.reorder}</span>
                          </button>

                          <button
                            onClick={() => onViewReceipt(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 text-[#1B4332] border border-[#D8E2DC] text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                            id={`view-receipt-btn-${order.id}`}
                          >
                            <FileText className="w-3.5 h-3.5 text-[#2D6A4F]" />
                            <span>{t.viewReceipt}</span>
                          </button>

                          {onOpenQrVerification && (
                            <button
                              onClick={() => onOpenQrVerification(order)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E9F5EE] hover:bg-[#D8F3DC] text-[#1B4332] border border-[#52B788] text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                              id={`verify-qr-btn-${order.id}`}
                            >
                              <QrCode className="w-3.5 h-3.5 text-[#2D6A4F]" />
                              <span>Verify QR</span>
                            </button>
                          )}

                          {onOpenReviewModal && (
                            <button
                              onClick={() => onOpenReviewModal(order)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                              id={`rate-order-btn-${order.id}`}
                            >
                              <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
                              <span>{order.review?.pharmacyRating ? `Rated (${order.review.pharmacyRating}★)` : 'Rate Delivery'}</span>
                            </button>
                          )}
                        </div>

                        <span className="text-[11px] font-bold text-[#2D6A4F] bg-[#D8F3DC] px-2.5 py-1 rounded-xl">
                          Security PIN: <strong>{order.deliveryOtp || '7492'}</strong>
                        </span>
                      </div>

                      {/* Live Interactive GPS Map for Orders in Delivery Pipeline */}
                      {(order.status === 'out_for_delivery' || order.status === 'in_transit' || order.status === 'picked_up' || order.status === 'driver_assigned') && (
                        <div className="space-y-2">
                          <InteractiveMap
                            order={order}
                            selectedCountry={selectedCountry}
                            language={language}
                            onCallDriver={(phone) => alert(`Connecting securely to driver at ${phone}...`)}
                            onOpenQrVerification={onOpenQrVerification}
                          />
                        </div>
                      )}

                      {/* Items Summary */}
                      <div className="bg-white p-4 rounded-2xl border border-[#D8E2DC]">
                        <h4 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider mb-2">
                          Ordered Medicines
                        </h4>
                        <div className="divide-y divide-gray-100">
                          {order.items.map((item, i) => (
                            <div key={i} className="py-2 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-[#1B4332]">{item.medicine.name}</span>
                                <span className="text-[11px] text-gray-500 block">{item.medicine.packageSize}</span>
                              </div>
                              <span className="font-semibold text-gray-700">
                                Qty: {item.quantity} × {selectedCountry.currencySymbol} {(item.unitPrice * selectedCountry.exchangeRateToUSD).toFixed(0)}
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
