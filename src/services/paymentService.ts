import { CountryConfig } from '../types';

export interface PaymentInitiateParams {
  amount: number;
  currency: string;
  orderId?: string;
  subscriptionPlan?: string;
  country: CountryConfig;
  provider: string; // 'mtn_momo' | 'airtel_money' | 'mpesa' | 'card' | 'chipper' | 'cash_on_delivery'
  phoneNumber: string;
  cardDetails?: {
    cardNumber: string;
    expiry: string;
    cvv: string;
    cardHolder: string;
  };
}

export interface PaymentResult {
  success: boolean;
  status: 'SUCCESS' | 'PENDING' | 'NOT_CONFIGURED' | 'FAILED';
  referenceId: string;
  transactionId?: string;
  checkoutUrl?: string;
  message: string;
  ussdPrompt?: string;
  requiresOtp?: boolean;
}

export class PaymentService {
  /**
   * Initiates payment routing according to country-specific provider rules.
   * Real production execution: Calls backend API which verifies credentials against M-Pesa Daraja or Paystack.
   * If credentials are not configured, returns NOT_CONFIGURED status.
   */
  static async initiatePayment(params: PaymentInitiateParams): Promise<PaymentResult> {
    const { amount, currency, country, provider, phoneNumber, orderId } = params;
    const ref = `REF-${country.code}-${Date.now().toString().slice(-6)}`;

    // Cash on delivery is naturally valid offline/in-person
    if (provider === 'cash_on_delivery') {
      return {
        success: true,
        status: 'PENDING',
        referenceId: ref,
        message: 'Cash on delivery selected. Payment will be collected in-person upon cold-chain inspection.',
      };
    }

    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          countryCode: country.code,
          paymentMethod: provider,
          phoneNumber,
          orderId,
          isSubscription: Boolean(params.subscriptionPlan),
          cardDetails: params.cardDetails
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        return {
          success: true,
          status: 'PENDING',
          referenceId: data.referenceId || ref,
          transactionId: data.transactionId,
          checkoutUrl: data.checkoutUrl,
          message: data.instructions || `Payment initiated for ${amount} ${currency}. Please authorize on your device.`,
          ussdPrompt: country.ussdCode ? `${country.ussdCode}#` : undefined,
        };
      } else {
        return {
          success: false,
          status: data.status === 'NOT_CONFIGURED' ? 'NOT_CONFIGURED' : 'FAILED',
          referenceId: ref,
          message: data.error || data.message || `${provider.toUpperCase()} Gateway is pending configuration in Admin settings.`,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        referenceId: ref,
        message: `Payment request could not be processed: ${err?.message || 'Network error'}`,
      };
    }
  }

  /**
   * Verifies recurring subscription payment status.
   */
  static async verifySubscriptionPayment(subscriptionId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}`);
      if (res.ok) {
        const data = await res.json();
        return data.status === 'active';
      }
    } catch {
      // ignore
    }
    return false;
  }
}
