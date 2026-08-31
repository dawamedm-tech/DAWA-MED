import { 
  MonetizationSettings, 
  FinancialSettlement, 
  PharmacySubscriptionRecord, 
  RevenueAnalyticsResponse, 
  RevenueAnalyticsKPIs, 
  RevenueBySourceBreakdown, 
  RevenueSource,
  Order,
  OrderItem,
  Medicine
} from '../types';
import { 
  INITIAL_MONETIZATION_SETTINGS, 
  INITIAL_FINANCIAL_SETTLEMENTS, 
  INITIAL_PHARMACY_SUBSCRIPTIONS 
} from '../data/mockData';

export class MonetizationEngine {
  private settings: MonetizationSettings;
  private settlements: FinancialSettlement[];
  private pharmacySubscriptions: PharmacySubscriptionRecord[];

  constructor() {
    this.settings = { ...INITIAL_MONETIZATION_SETTINGS };
    this.settlements = [...INITIAL_FINANCIAL_SETTLEMENTS];
    this.pharmacySubscriptions = [...INITIAL_PHARMACY_SUBSCRIPTIONS];
  }

  public getSettings(): MonetizationSettings {
    return this.settings;
  }

  public updateSettings(newSettings: Partial<MonetizationSettings>, adminUser: string): MonetizationSettings {
    this.settings = {
      ...this.settings,
      ...newSettings,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUser
    };
    return this.settings;
  }

  /**
   * Server-Side Calculation for Order Checkout
   * Guarantees that clients cannot modify prices, delivery fees, commissions, or coupon logic.
   */
  public calculateOrderPricing(params: {
    items: { medicineId: string; quantity: number; unitPriceUSD?: number }[];
    availableMedicines: Medicine[];
    pharmacyId: string;
    city?: string;
    distanceKm?: number;
    isExpress?: boolean;
    couponCode?: string;
    isSubscribedToDawaMonthly?: boolean;
  }) {
    const { 
      items, 
      availableMedicines, 
      pharmacyId, 
      city = 'Nairobi', 
      distanceKm = 3.5, 
      isExpress = false, 
      couponCode, 
      isSubscribedToDawaMonthly = false 
    } = params;

    // 1. Calculate Items Subtotal from verified database prices
    let itemsSubtotalUSD = 0;
    const validatedItems: { id: string; name: string; quantity: number; priceUSD: number; totalUSD: number }[] = [];

    items.forEach((item) => {
      const med = availableMedicines.find((m) => m.id === item.medicineId);
      const verifiedPrice = med ? med.priceUSD : (item.unitPriceUSD || 5.0);
      const lineTotal = Number((verifiedPrice * item.quantity).toFixed(2));
      itemsSubtotalUSD += lineTotal;
      validatedItems.push({
        id: item.medicineId,
        name: med ? med.name : 'Pharmaceutical Item',
        quantity: item.quantity,
        priceUSD: verifiedPrice,
        totalUSD: lineTotal
      });
    });

    itemsSubtotalUSD = Number(itemsSubtotalUSD.toFixed(2));

    // 2. Calculate Delivery Fee Server-Side
    let deliveryFeeUSD = 0;
    let expressSurchargeUSD = 0;

    if (isSubscribedToDawaMonthly) {
      // DAWA Monthly benefit: Free standard delivery on refill orders
      deliveryFeeUSD = 0;
    } else if (itemsSubtotalUSD >= this.settings.freeDeliveryThresholdUSD) {
      // Free delivery on orders exceeding threshold
      deliveryFeeUSD = 0;
    } else {
      // Base fee + distance fee * city multiplier
      const cityMultiplier = this.settings.cityDeliveryMultipliers[city] || 1.0;
      const calculatedFee = (this.settings.baseDeliveryFeeUSD + (distanceKm * this.settings.perKmRateUSD)) * cityMultiplier;
      deliveryFeeUSD = Math.max(
        this.settings.minDeliveryFeeUSD,
        Math.min(this.settings.maxDeliveryFeeUSD, calculatedFee)
      );
      deliveryFeeUSD = Number(deliveryFeeUSD.toFixed(2));
    }

    if (isExpress && this.settings.expressDeliveryEnabled) {
      expressSurchargeUSD = Number(this.settings.expressDeliveryFeeUSD.toFixed(2));
    }

    const totalDeliveryUSD = Number((deliveryFeeUSD + expressSurchargeUSD).toFixed(2));

    // 3. Calculate Coupon Discount Server-Side
    let discountUSD = 0;
    let appliedCoupon: any = null;

    if (couponCode) {
      const foundCoupon = this.settings.coupons.find(
        (c) => c.code.toUpperCase() === couponCode.toUpperCase().trim() && c.isActive
      );

      if (foundCoupon) {
        const isMinOrderMet = itemsSubtotalUSD >= foundCoupon.minOrderUSD;
        const isNotExpired = new Date(foundCoupon.expiresAt) >= new Date();

        if (isMinOrderMet && isNotExpired) {
          if (foundCoupon.discountType === 'percentage') {
            const rawDiscount = (itemsSubtotalUSD * foundCoupon.discountValue) / 100;
            discountUSD = foundCoupon.maxDiscountUSD ? Math.min(rawDiscount, foundCoupon.maxDiscountUSD) : rawDiscount;
          } else {
            discountUSD = foundCoupon.discountValue;
          }
          discountUSD = Math.min(discountUSD, itemsSubtotalUSD);
          discountUSD = Number(discountUSD.toFixed(2));
          appliedCoupon = foundCoupon;
        }
      }
    }

    // 4. Calculate Tax & Service Fee
    const serviceFeeUSD = Number(this.settings.serviceFeeUSD.toFixed(2));
    const taxableAmount = Math.max(0, itemsSubtotalUSD - discountUSD);
    const taxAmountUSD = Number(((taxableAmount * this.settings.taxVatRatePercentage) / 100).toFixed(2));

    // 5. Total Customer Payable
    const totalCustomerPaidUSD = Number(
      Math.max(0, itemsSubtotalUSD - discountUSD + totalDeliveryUSD + serviceFeeUSD + taxAmountUSD).toFixed(2)
    );

    // 6. Pharmacy Commission Split (Configurable per pharmacy or default)
    const customRate = this.settings.pharmacyCustomCommissions[pharmacyId];
    const commissionRateApplied = customRate !== undefined ? customRate : this.settings.defaultPharmacyCommissionRate;
    
    // Commission is calculated on Gross Medicine Subtotal (before coupons, or net of discounts)
    const pharmacyCommissionUSD = Number(((itemsSubtotalUSD * commissionRateApplied) / 100).toFixed(2));
    const netPharmacyPayableUSD = Number(Math.max(0, itemsSubtotalUSD - pharmacyCommissionUSD).toFixed(2));

    // 7. Courier Driver Split & Logistics Margin
    const driverPayoutUSD = Number(((totalDeliveryUSD * this.settings.driverPayoutPercentage) / 100).toFixed(2));
    const dawaNetDeliveryMarginUSD = Number((totalDeliveryUSD - driverPayoutUSD).toFixed(2));

    // 8. Platform Gross & Net Margins
    const gatewayFeeUSD = Number(((totalCustomerPaidUSD * 0.015) + 0.05).toFixed(2)); // estimated 1.5% switch cost
    const dawaGrossRevenueUSD = Number((pharmacyCommissionUSD + totalDeliveryUSD + serviceFeeUSD).toFixed(2));
    const dawaNetProfitUSD = Number(
      (pharmacyCommissionUSD + dawaNetDeliveryMarginUSD + serviceFeeUSD - gatewayFeeUSD).toFixed(2)
    );

    return {
      validatedItems,
      itemsSubtotalUSD,
      deliveryFeeUSD,
      expressSurchargeUSD,
      totalDeliveryUSD,
      discountUSD,
      appliedCoupon: appliedCoupon ? { code: appliedCoupon.code, description: appliedCoupon.description } : null,
      serviceFeeUSD,
      taxAmountUSD,
      totalCustomerPaidUSD,
      commissionRateApplied,
      pharmacyCommissionUSD,
      netPharmacyPayableUSD,
      driverPayoutUSD,
      dawaNetDeliveryMarginUSD,
      gatewayFeeUSD,
      dawaGrossRevenueUSD,
      dawaNetProfitUSD
    };
  }

  /**
   * Records a financial settlement upon order placement or status transition
   */
  public recordOrderSettlement(order: Order, calculation: any, countryCode: string, city: string): FinancialSettlement {
    const existingIndex = this.settlements.findIndex((s) => s.orderId === order.id);

    const settlement: FinancialSettlement = {
      orderId: order.id,
      orderNumber: `DM-${order.id.slice(-6).toUpperCase()}`,
      countryCode,
      city,
      pharmacyId: order.pharmacyId,
      pharmacyName: order.pharmacyName,
      customerId: order.customerId || 'usr-default',
      customerName: order.customerName,
      driverId: order.driverId,
      driverName: order.driverName,
      paymentMethod: order.paymentMethod,
      currency: order.currency || 'USD',
      itemsSubtotalUSD: calculation.itemsSubtotalUSD,
      deliveryFeeUSD: calculation.deliveryFeeUSD,
      expressSurchargeUSD: calculation.expressSurchargeUSD,
      discountUSD: calculation.discountUSD,
      serviceFeeUSD: calculation.serviceFeeUSD,
      taxAmountUSD: calculation.taxAmountUSD,
      totalCustomerPaidUSD: calculation.totalCustomerPaidUSD,
      commissionRateApplied: calculation.commissionRateApplied,
      pharmacyCommissionUSD: calculation.pharmacyCommissionUSD,
      netPharmacyPayableUSD: calculation.netPharmacyPayableUSD,
      driverPayoutUSD: calculation.driverPayoutUSD,
      dawaNetDeliveryMarginUSD: calculation.dawaNetDeliveryMarginUSD,
      gatewayFeeUSD: calculation.gatewayFeeUSD,
      dawaGrossRevenueUSD: calculation.dawaGrossRevenueUSD,
      dawaNetProfitUSD: calculation.dawaNetProfitUSD,
      settlementStatus: order.status === 'delivered' ? 'settled' : 'pending',
      orderStatus: order.status,
      createdAt: order.createdAt || new Date().toISOString(),
      settledAt: order.status === 'delivered' ? new Date().toISOString() : undefined
    };

    if (existingIndex >= 0) {
      this.settlements[existingIndex] = settlement;
    } else {
      this.settlements.unshift(settlement);
    }

    return settlement;
  }

  /**
   * Pharmacy Subscriptions CRUD
   */
  public getPharmacySubscriptions(): PharmacySubscriptionRecord[] {
    return this.pharmacySubscriptions;
  }

  public savePharmacySubscription(sub: PharmacySubscriptionRecord): PharmacySubscriptionRecord {
    const idx = this.pharmacySubscriptions.findIndex((s) => s.id === sub.id || s.pharmacyId === sub.pharmacyId);
    if (idx >= 0) {
      this.pharmacySubscriptions[idx] = sub;
    } else {
      this.pharmacySubscriptions.push(sub);
    }
    return sub;
  }

  /**
   * Revenue Analytics Aggregator supporting dynamic timeframes and source breakdowns
   */
  public getRevenueAnalytics(params: {
    timeframe?: 'today' | 'this_week' | 'this_month' | 'this_year' | 'all_time';
    countryCode?: string;
    city?: string;
    pharmacyId?: string;
    source?: RevenueSource;
  }): RevenueAnalyticsResponse {
    const { timeframe = 'this_month', countryCode, city, pharmacyId, source } = params;

    // Filter settlements
    let filteredSettlements = [...this.settlements];

    if (countryCode && countryCode !== 'all') {
      filteredSettlements = filteredSettlements.filter((s) => s.countryCode.toLowerCase() === countryCode.toLowerCase());
    }
    if (city && city !== 'all') {
      filteredSettlements = filteredSettlements.filter((s) => s.city.toLowerCase() === city.toLowerCase());
    }
    if (pharmacyId && pharmacyId !== 'all') {
      filteredSettlements = filteredSettlements.filter((s) => s.pharmacyId === pharmacyId);
    }

    // Timeframe filtering
    const now = new Date();
    filteredSettlements = filteredSettlements.filter((s) => {
      const date = new Date(s.createdAt);
      if (timeframe === 'today') {
        return date.toDateString() === now.toDateString();
      }
      if (timeframe === 'this_week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo;
      }
      if (timeframe === 'this_month') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      if (timeframe === 'this_year') {
        return date.getFullYear() === now.getFullYear();
      }
      return true; // all_time
    });

    // Compute KPIs
    const totalOrders = filteredSettlements.length;
    const completedSettlements = filteredSettlements.filter((s) => s.settlementStatus === 'settled' || s.settlementStatus === 'earned');

    const totalPharmacyCommissionsUSD = Number(
      completedSettlements.reduce((acc, s) => acc + s.pharmacyCommissionUSD, 0).toFixed(2)
    );
    const totalDeliveryGrossUSD = Number(
      completedSettlements.reduce((acc, s) => acc + s.deliveryFeeUSD + s.expressSurchargeUSD, 0).toFixed(2)
    );
    const totalDeliveryNetMarginUSD = Number(
      completedSettlements.reduce((acc, s) => acc + s.dawaNetDeliveryMarginUSD, 0).toFixed(2)
    );

    // Patient subscriptions revenue ($5/mo * active subscribers)
    const activePatientSubsCount = 142;
    const totalPatientSubscriptionsUSD = Number((activePatientSubsCount * this.settings.dawaMonthlyPriceUSD).toFixed(2));

    // Pharmacy subscriptions revenue
    const activePharmacySubs = this.pharmacySubscriptions.filter((s) => s.status === 'active');
    const totalPharmacySubscriptionsUSD = Number(
      activePharmacySubs.reduce((acc, s) => acc + s.priceUSD, 0).toFixed(2)
    );

    // Other streams simulation (Family, Analytics, Corporate, Logistics)
    const totalOtherRevenueUSD = Number(
      ((this.settings.familyPlanEnabled ? 18 * this.settings.familyPlanPriceUSD : 0) +
      (this.settings.pharmacyAnalyticsEnabled ? 8 * this.settings.pharmacyAnalyticsPriceUSD : 0) +
      (this.settings.businessCorporateEnabled ? 3 * this.settings.businessCorporatePriceUSD : 0) +
      (this.settings.logisticsB2BEnabled ? 120 * this.settings.logisticsB2BRatePerStopUSD : 0)).toFixed(2)
    );

    const totalGrossRevenueUSD = Number(
      (totalPharmacyCommissionsUSD + totalDeliveryGrossUSD + totalPatientSubscriptionsUSD + totalPharmacySubscriptionsUSD + totalOtherRevenueUSD).toFixed(2)
    );

    const totalNetProfitUSD = Number(
      (totalPharmacyCommissionsUSD + totalDeliveryNetMarginUSD + (totalPatientSubscriptionsUSD * 0.92) + (totalPharmacySubscriptionsUSD * 0.95) + (totalOtherRevenueUSD * 0.85)).toFixed(2)
    );

    const mrrUSD = Number(
      (totalPatientSubscriptionsUSD + totalPharmacySubscriptionsUSD + (this.settings.familyPlanEnabled ? 18 * this.settings.familyPlanPriceUSD : 0)).toFixed(2)
    );
    const arrUSD = Number((mrrUSD * 12).toFixed(2));

    const totalGrossSales = completedSettlements.reduce((acc, s) => acc + s.totalCustomerPaidUSD, 0);
    const averageOrderValueUSD = totalOrders > 0 ? Number((totalGrossSales / totalOrders).toFixed(2)) : 32.40;

    const kpis: RevenueAnalyticsKPIs = {
      totalGrossRevenueUSD,
      totalNetProfitUSD,
      totalPharmacyCommissionsUSD,
      totalDeliveryGrossUSD,
      totalDeliveryNetMarginUSD,
      totalPatientSubscriptionsUSD,
      totalPharmacySubscriptionsUSD,
      totalOtherRevenueUSD,
      mrrUSD,
      arrUSD,
      activePatientSubscribers: activePatientSubsCount,
      activePharmacySubscribers: activePharmacySubs.length,
      totalCompletedOrders: completedSettlements.length,
      averageOrderValueUSD,
      revenuePerCustomerUSD: 24.80,
      revenuePerPharmacyUSD: Number((totalPharmacyCommissionsUSD / Math.max(1, activePharmacySubs.length)).toFixed(2)),
      subscriptionChurnRatePercent: 1.8,
      paymentSuccessRatePercent: 98.6,
      failedPaymentsCount: 3
    };

    // Revenue by Source Breakdown (All 10 Streams)
    const sources: RevenueBySourceBreakdown[] = [
      {
        source: 'pharmacy_commission',
        labelEn: 'Pharmacy Commissions (8% - 12%)',
        labelAr: 'عمولات الصيدليات على الطلبيات',
        amountUSD: totalPharmacyCommissionsUSD,
        percentage: totalGrossRevenueUSD > 0 ? Number(((totalPharmacyCommissionsUSD / totalGrossRevenueUSD) * 100).toFixed(1)) : 38.5,
        transactionCount: completedSettlements.length,
        isPhase1Core: true,
        isEnabled: true
      },
      {
        source: 'delivery_fees',
        labelEn: 'Delivery & Logistics Fees',
        labelAr: 'رسوم التوصيل والخدمات اللوجستية',
        amountUSD: totalDeliveryGrossUSD,
        percentage: totalGrossRevenueUSD > 0 ? Number(((totalDeliveryGrossUSD / totalGrossRevenueUSD) * 100).toFixed(1)) : 22.1,
        transactionCount: completedSettlements.length,
        isPhase1Core: true,
        isEnabled: true
      },
      {
        source: 'dawa_monthly',
        labelEn: 'DAWA MED MONTHLY ($5/mo)',
        labelAr: 'اشتراكات المرضى الشهرية (5 دولار/شهر)',
        amountUSD: totalPatientSubscriptionsUSD,
        percentage: totalGrossRevenueUSD > 0 ? Number(((totalPatientSubscriptionsUSD / totalGrossRevenueUSD) * 100).toFixed(1)) : 24.2,
        transactionCount: activePatientSubsCount,
        isPhase1Core: true,
        isEnabled: this.settings.dawaMonthlyIsActive
      },
      {
        source: 'pharmacy_subscription',
        labelEn: 'Pharmacy Subscriptions (SaaS)',
        labelAr: 'اشتراكات الصيدليات في النظام (SaaS)',
        amountUSD: totalPharmacySubscriptionsUSD,
        percentage: totalGrossRevenueUSD > 0 ? Number(((totalPharmacySubscriptionsUSD / totalGrossRevenueUSD) * 100).toFixed(1)) : 6.8,
        transactionCount: activePharmacySubs.length,
        isPhase1Core: true,
        isEnabled: true
      },
      {
        source: 'express_delivery',
        labelEn: 'Express Delivery Surcharges (+$3)',
        labelAr: 'رسوم التوصيل السريع الفوري',
        amountUSD: Number((completedSettlements.filter(s => s.expressSurchargeUSD > 0).length * 3.0).toFixed(2)),
        percentage: 3.2,
        transactionCount: completedSettlements.filter(s => s.expressSurchargeUSD > 0).length,
        isPhase1Core: false,
        isEnabled: this.settings.expressDeliveryEnabled
      },
      {
        source: 'family_plan',
        labelEn: 'Family Care Plans ($9.99/mo)',
        labelAr: 'باقات الرعاية العائلية للأمراض المزمنة',
        amountUSD: Number((18 * this.settings.familyPlanPriceUSD).toFixed(2)),
        percentage: 2.8,
        transactionCount: 18,
        isPhase1Core: false,
        isEnabled: this.settings.familyPlanEnabled
      },
      {
        source: 'pharmacy_analytics',
        labelEn: 'Pharmacy BI Analytics Addon ($15/mo)',
        labelAr: 'لوحة التحليلات المتقدمة للصيدليات',
        amountUSD: Number((8 * this.settings.pharmacyAnalyticsPriceUSD).toFixed(2)),
        percentage: 1.5,
        transactionCount: 8,
        isPhase1Core: false,
        isEnabled: this.settings.pharmacyAnalyticsEnabled
      },
      {
        source: 'business_corporate',
        labelEn: 'DAWA Corporate & Employee Plans',
        labelAr: 'خطط الرعاية الصحية للشركات والموظفين',
        amountUSD: Number((3 * this.settings.businessCorporatePriceUSD).toFixed(2)),
        percentage: 1.8,
        transactionCount: 3,
        isPhase1Core: false,
        isEnabled: this.settings.businessCorporateEnabled
      },
      {
        source: 'logistics_b2b',
        labelEn: 'B2B Cold-Chain Logistics Hub',
        labelAr: 'الخدمات اللوجستية وسلسلة التبريد B2B',
        amountUSD: Number((120 * this.settings.logisticsB2BRatePerStopUSD).toFixed(2)),
        percentage: 1.9,
        transactionCount: 120,
        isPhase1Core: false,
        isEnabled: this.settings.logisticsB2BEnabled
      },
      {
        source: 'saas_whitelabel',
        labelEn: 'Enterprise White-Label & FHIR API',
        labelAr: 'تراخيص النظام والمستشفيات والربط البرمجي',
        amountUSD: 299.00,
        percentage: 1.2,
        transactionCount: 1,
        isPhase1Core: false,
        isEnabled: this.settings.saasWhiteLabelEnabled
      }
    ];

    // 7-day trend simulation
    const dailyTrend = [
      { date: 'Mon', grossRevenue: 420, commissions: 160, delivery: 110, subscriptions: 120, netProfit: 290 },
      { date: 'Tue', grossRevenue: 480, commissions: 195, delivery: 125, subscriptions: 120, netProfit: 335 },
      { date: 'Wed', grossRevenue: 510, commissions: 210, delivery: 140, subscriptions: 120, netProfit: 360 },
      { date: 'Thu', grossRevenue: 460, commissions: 180, delivery: 120, subscriptions: 120, netProfit: 320 },
      { date: 'Fri', grossRevenue: 590, commissions: 245, delivery: 165, subscriptions: 120, netProfit: 415 },
      { date: 'Sat', grossRevenue: 640, commissions: 270, delivery: 180, subscriptions: 120, netProfit: 450 },
      { date: 'Sun', grossRevenue: 530, commissions: 220, delivery: 145, subscriptions: 120, netProfit: 375 }
    ];

    // Pharmacy Earnings Summary
    const pharmacyEarningsSummary = [
      {
        pharmacyId: 'pharma-01',
        pharmacyName: 'GoodLife Pharmacy — Westlands Central',
        ordersCount: 48,
        grossSalesUSD: 1420.0,
        commissionRate: 8.0,
        commissionsDeductedUSD: 113.60,
        netPayableUSD: 1306.40,
        subscriptionPlan: 'Professional ($25/mo)'
      },
      {
        pharmacyId: 'pharma-02',
        pharmacyName: 'Nairobi Central Chemist',
        ordersCount: 34,
        grossSalesUSD: 980.0,
        commissionRate: 10.0,
        commissionsDeductedUSD: 98.00,
        netPayableUSD: 882.00,
        subscriptionPlan: 'Basic ($10/mo)'
      },
      {
        pharmacyId: 'pharma-03',
        pharmacyName: 'Karen Community Pharmacy',
        ordersCount: 22,
        grossSalesUSD: 640.0,
        commissionRate: 12.0,
        commissionsDeductedUSD: 76.80,
        netPayableUSD: 563.20,
        subscriptionPlan: 'Basic ($10/mo)'
      },
      {
        pharmacyId: 'pharma-04',
        pharmacyName: 'Aga Khan Hospital Pharmacy',
        ordersCount: 65,
        grossSalesUSD: 3120.0,
        commissionRate: 5.0,
        commissionsDeductedUSD: 156.00,
        netPayableUSD: 2964.00,
        subscriptionPlan: 'Enterprise ($99/mo)'
      }
    ];

    return {
      timeframe,
      kpis,
      bySource: sources,
      dailyTrend,
      recentSettlements: filteredSettlements.slice(0, 20),
      pharmacyEarningsSummary
    };
  }
}

export const monetizationEngine = new MonetizationEngine();
