/**
 * DAWA MED — Paystack African Payment Gateway Service
 * Real Integration for Pan-African Multi-Currency Payments
 */

export interface PaystackInitOptions {
  email: string;
  amount: number; // in minor units (cents/kobo/pesewas) or USD
  currency: string;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaystackInitResponse {
  success: boolean;
  status: 'INITIATED' | 'NOT_CONFIGURED' | 'FAILED';
  authorizationUrl?: string;
  accessCode?: string;
  reference?: string;
  error?: string;
}

export class PaystackService {
  private static instance: PaystackService;

  public static getInstance(): PaystackService {
    if (!PaystackService.instance) {
      PaystackService.instance = new PaystackService();
    }
    return PaystackService.instance;
  }

  public getStatus() {
    const hasKey = !!process.env.PAYSTACK_SECRET_KEY;
    return {
      configured: hasKey,
      publicKey: process.env.PAYSTACK_PUBLIC_KEY ? `${process.env.PAYSTACK_PUBLIC_KEY.substring(0, 8)}...` : undefined,
      readyForProduction: hasKey
    };
  }

  /**
   * Initialize Paystack Transaction
   */
  public async initializeTransaction(options: PaystackInitOptions): Promise<PaystackInitResponse> {
    const { email, amount, currency, reference, callbackUrl, metadata } = options;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return {
        success: false,
        status: 'NOT_CONFIGURED',
        error: 'PAYSTACK_SECRET_KEY environment variable is not configured.'
      };
    }

    // Paystack expects amount in minor units (e.g. 1000 KES = 100000, $10 USD = 1000 cents)
    const amountInSubunits = Math.round(amount * 100);

    try {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          amount: amountInSubunits,
          currency: currency.toUpperCase(),
          reference,
          callback_url: callbackUrl || 'https://dawamed.com/payment/callback',
          metadata
        })
      });

      const data = await response.json();

      if (data.status && data.data?.authorization_url) {
        return {
          success: true,
          status: 'INITIATED',
          authorizationUrl: data.data.authorization_url,
          accessCode: data.data.access_code,
          reference: data.data.reference
        };
      }

      return {
        success: false,
        status: 'FAILED',
        error: data.message || 'Paystack initialization failed'
      };
    } catch (err: any) {
      console.error('[Paystack Init Error]', err);
      return {
        success: false,
        status: 'FAILED',
        error: err?.message || 'Network error communicating with Paystack API'
      };
    }
  }

  /**
   * Verify Paystack Transaction Status Server-Side
   */
  public async verifyTransaction(reference: string): Promise<{ success: boolean; paid: boolean; data?: any; error?: string }> {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return { success: false, paid: false, error: 'PAYSTACK_SECRET_KEY not configured' };
    }

    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`
        }
      });

      const data = await response.json();
      if (data.status && data.data?.status === 'success') {
        return {
          success: true,
          paid: true,
          data: data.data
        };
      }

      return {
        success: true,
        paid: false,
        data: data.data,
        error: data.data?.gateway_response || 'Transaction not in success state'
      };
    } catch (err: any) {
      return { success: false, paid: false, error: err?.message };
    }
  }
}

export const paystackService = PaystackService.getInstance();
