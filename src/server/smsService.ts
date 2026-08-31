/**
 * DAWA MED — Africa's Talking & Twilio SMS / Phone OTP Gateway
 * Production Dispatcher with Environment Key Validation and Fallback
 */

export interface SmsSendOptions {
  to: string;
  message: string;
  senderId?: string;
}

export interface SmsResult {
  success: boolean;
  provider: 'africas_talking' | 'twilio' | 'unconfigured';
  messageId?: string;
  status: 'DELIVERED' | 'FAILED' | 'GATEWAY_NOT_CONFIGURED';
  cost?: string;
  error?: string;
}

export class SmsGatewayService {
  private static instance: SmsGatewayService;

  public static getInstance(): SmsGatewayService {
    if (!SmsGatewayService.instance) {
      SmsGatewayService.instance = new SmsGatewayService();
    }
    return SmsGatewayService.instance;
  }

  public getStatus() {
    const hasAfricasTalking = !!(process.env.AFRICAS_TALKING_API_KEY && process.env.AFRICAS_TALKING_USERNAME);
    const hasTwilio = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);

    return {
      africasTalkingConfigured: hasAfricasTalking,
      africasTalkingUsername: process.env.AFRICAS_TALKING_USERNAME || undefined,
      twilioConfigured: hasTwilio,
      activeProvider: hasAfricasTalking ? 'africas_talking' : hasTwilio ? 'twilio' : 'unconfigured',
      readyForProduction: hasAfricasTalking || hasTwilio
    };
  }

  /**
   * Send SMS via Africa's Talking API
   */
  public async sendSms(options: SmsSendOptions): Promise<SmsResult> {
    const { to, message, senderId = 'DAWAMED' } = options;
    const cleanPhone = to.replace(/[\s-]/g, '');

    // 1. Try Africa's Talking
    const atApiKey = process.env.AFRICAS_TALKING_API_KEY;
    const atUsername = process.env.AFRICAS_TALKING_USERNAME;

    if (atApiKey && atUsername) {
      try {
        const params = new URLSearchParams();
        params.append('username', atUsername);
        params.append('to', cleanPhone);
        params.append('message', message);
        if (senderId) params.append('from', senderId);

        const response = await fetch('https://api.africastalking.com/version1/messaging', {
          method: 'POST',
          headers: {
            'apiKey': atApiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: params.toString()
        });

        const data = await response.json();
        const recipientData = data?.SMSMessageData?.Recipients?.[0];

        if (recipientData && (recipientData.status === 'Success' || recipientData.statusCode === 101)) {
          return {
            success: true,
            provider: 'africas_talking',
            messageId: recipientData.messageId,
            status: 'DELIVERED',
            cost: recipientData.cost
          };
        }

        return {
          success: false,
          provider: 'africas_talking',
          status: 'FAILED',
          error: recipientData?.status || data?.SMSMessageData?.Message || 'Africa\'s Talking API error'
        };
      } catch (err: any) {
        console.error('[Africa\'s Talking SMS Error]', err);
        return {
          success: false,
          provider: 'africas_talking',
          status: 'FAILED',
          error: err?.message || 'Network error reaching Africa\'s Talking'
        };
      }
    }

    // 2. Try Twilio
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (twilioSid && twilioAuth && twilioPhone) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', cleanPhone);
        params.append('From', twilioPhone);
        params.append('Body', message);

        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });

        const data = await response.json();
        if (response.ok && data.sid) {
          return {
            success: true,
            provider: 'twilio',
            messageId: data.sid,
            status: 'DELIVERED'
          };
        }

        return {
          success: false,
          provider: 'twilio',
          status: 'FAILED',
          error: data.message || 'Twilio dispatch failed'
        };
      } catch (err: any) {
        console.error('[Twilio SMS Error]', err);
        return {
          success: false,
          provider: 'twilio',
          status: 'FAILED',
          error: err?.message || 'Network error reaching Twilio'
        };
      }
    }

    // Explicitly unconfigured - No fake success!
    console.warn(`[SMS Gateway] Neither AFRICAS_TALKING_API_KEY nor TWILIO_ACCOUNT_SID configured in environment.`);
    return {
      success: false,
      provider: 'unconfigured',
      status: 'GATEWAY_NOT_CONFIGURED',
      error: 'SMS Gateway credentials (AFRICAS_TALKING_API_KEY or TWILIO_ACCOUNT_SID) are not configured.'
    };
  }

  /**
   * Dispatch Cryptographic One-Time Password for Verification
   */
  public async sendOtp(phone: string, otpCode: string, recipientName?: string): Promise<SmsResult> {
    const text = `DAWA MED Verification: Your secure verification code is ${otpCode}. Valid for 5 minutes. Do not share this code with anyone.`;
    return this.sendSms({
      to: phone,
      message: text
    });
  }
}

export const smsGateway = SmsGatewayService.getInstance();
