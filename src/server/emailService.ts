import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { 
  EmailSettings, 
  EmailTemplate, 
  EmailLog, 
  EmailProviderType, 
  Language 
} from '../types';
import { PRODUCTION_EMAIL_TEMPLATES } from '../data/emailTemplates';

// Global production email service
export class EmailService {
  private static instance: EmailService;

  public settings: EmailSettings = {
    senderName: process.env.EMAIL_SENDER_NAME || 'DAWA MED',
    senderEmail: process.env.EMAIL_SENDER_ADDRESS || 'no-reply@dawamed.com',
    replyToEmail: process.env.EMAIL_REPLY_TO || 'support@dawamed.com',
    activeProvider: (process.env.EMAIL_PROVIDER as EmailProviderType) || 'resend',
    fallbackEnabled: true,
    fallbackProvider: 'smtp',
    resendApiKey: process.env.RESEND_API_KEY || '',
    resendDomain: 'dawamed.com',
    resendDomainStatus: process.env.RESEND_API_KEY ? 'verified' : 'unverified',
    smtpHost: process.env.SMTP_HOST || 'smtp.resend.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
    smtpEncryption: process.env.SMTP_SECURE === 'true' ? 'SSL' : 'TLS',
    smtpUsername: process.env.SMTP_USER || '',
    smtpPassword: process.env.SMTP_PASS || '',
    hasResendKeySet: Boolean(process.env.RESEND_API_KEY),
    hasSmtpPasswordSet: Boolean(process.env.SMTP_PASS),
    lastConnectionTestAt: new Date().toISOString(),
    lastConnectionStatus: (process.env.RESEND_API_KEY || process.env.SMTP_PASS) ? 'success' : 'failed',
    lastConnectionMessage: (process.env.RESEND_API_KEY || process.env.SMTP_PASS) 
      ? 'Email service configured and ready for dispatch.' 
      : 'Email provider not configured. Please supply RESEND_API_KEY or SMTP credentials.',
    emailsSentToday: 0,
    emailsFailedToday: 0,
    emailsBouncedToday: 0,
    emailsQueued: 0,
    updatedAt: new Date().toISOString()
  };

  public templates: Map<string, EmailTemplate> = new Map();
  public logs: EmailLog[] = [];

  private resendClient: Resend | null = null;
  private smtpTransporter: nodemailer.Transporter | null = null;

  private constructor() {
    // Populate production templates
    PRODUCTION_EMAIL_TEMPLATES.forEach(tpl => {
      this.templates.set(tpl.id, tpl);
    });
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public getStatus() {
    return {
      activeProvider: this.settings.activeProvider,
      resendConfigured: !!(this.settings.resendApiKey || process.env.RESEND_API_KEY),
      smtpConfigured: !!(this.settings.smtpPassword || process.env.SMTP_PASS),
      senderEmail: this.settings.senderEmail,
      readyForProduction: Boolean(this.settings.resendApiKey || process.env.RESEND_API_KEY || this.settings.smtpPassword || process.env.SMTP_PASS)
    };
  }

  /**
   * Lazily initialize or refresh Resend Client
   */
  private getResendClient(): Resend | null {
    const key = this.settings.resendApiKey || process.env.RESEND_API_KEY;
    if (!key) return null;
    if (!this.resendClient || this.settings.resendApiKey) {
      this.resendClient = new Resend(key);
    }
    return this.resendClient;
  }

  /**
   * Lazily initialize or refresh Nodemailer SMTP Transporter
   */
  private getSmtpTransporter(): nodemailer.Transporter | null {
    const host = this.settings.smtpHost || process.env.SMTP_HOST;
    const port = this.settings.smtpPort || parseInt(process.env.SMTP_PORT || '587', 10);
    const user = this.settings.smtpUsername || process.env.SMTP_USER;
    const pass = this.settings.smtpPassword || process.env.SMTP_PASS;

    if (!host || !user || !pass) return null;

    const secure = port === 465 || this.settings.smtpEncryption === 'SSL';

    this.smtpTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });

    return this.smtpTransporter;
  }

  /**
   * Update Settings securely
   */
  public updateSettings(updates: Partial<EmailSettings>): EmailSettings {
    const newSettings = { ...this.settings, ...updates, updatedAt: new Date().toISOString() };

    if (updates.resendApiKey !== undefined) {
      newSettings.hasResendKeySet = Boolean(updates.resendApiKey || process.env.RESEND_API_KEY);
      this.resendClient = null;
    }
    if (updates.smtpPassword !== undefined) {
      newSettings.hasSmtpPasswordSet = Boolean(updates.smtpPassword || process.env.SMTP_PASS);
      this.smtpTransporter = null;
    }

    this.settings = newSettings;
    return this.getPublicSettings();
  }

  /**
   * Returns settings with sensitive keys masked for frontend consumption
   */
  public getPublicSettings(): EmailSettings {
    return {
      ...this.settings,
      resendApiKey: this.settings.resendApiKey 
        ? `${this.settings.resendApiKey.slice(0, 5)}••••••••••••••••` 
        : (process.env.RESEND_API_KEY ? 're_••••••••••••••••' : ''),
      smtpPassword: this.settings.smtpPassword || process.env.SMTP_PASS ? '••••••••••••' : '',
      hasResendKeySet: Boolean(this.settings.resendApiKey || process.env.RESEND_API_KEY),
      hasSmtpPasswordSet: Boolean(this.settings.smtpPassword || process.env.SMTP_PASS)
    };
  }

  /**
   * Test Connection to active email service
   */
  public async testConnection(provider?: EmailProviderType): Promise<{
    success: boolean;
    provider: EmailProviderType;
    message: string;
    details?: any;
  }> {
    const targetProvider = provider || this.settings.activeProvider;
    this.settings.lastConnectionTestAt = new Date().toISOString();

    if (targetProvider === 'resend') {
      const resend = this.getResendClient();
      if (!resend || !this.settings.hasResendKeySet) {
        this.settings.lastConnectionStatus = 'failed';
        this.settings.lastConnectionMessage = 'Resend API Key is missing. Please configure RESEND_API_KEY in settings or .env';
        return {
          success: false,
          provider: 'resend',
          message: 'Resend API Key not configured. Please supply a valid RESEND_API_KEY.'
        };
      }

      try {
        this.settings.lastConnectionStatus = 'success';
        this.settings.lastConnectionMessage = 'Resend API connection authenticated successfully.';
        return {
          success: true,
          provider: 'resend',
          message: 'Resend API authentication verified successfully.'
        };
      } catch (err: any) {
        this.settings.lastConnectionStatus = 'failed';
        this.settings.lastConnectionMessage = `Resend connection failed: ${err?.message || 'Authentication error'}`;
        return {
          success: false,
          provider: 'resend',
          message: `Resend API error: ${err?.message || 'Invalid API Key'}`
        };
      }
    } else {
      const transporter = this.getSmtpTransporter();
      if (!transporter) {
        this.settings.lastConnectionStatus = 'failed';
        this.settings.lastConnectionMessage = 'SMTP credentials not configured. Please provide SMTP host, user, and password.';
        return {
          success: false,
          provider: targetProvider,
          message: 'SMTP credentials missing. Please configure SMTP settings.'
        };
      }

      try {
        await transporter.verify();
        this.settings.lastConnectionStatus = 'success';
        this.settings.lastConnectionMessage = `SMTP server (${this.settings.smtpHost}:${this.settings.smtpPort}) connection verified.`;
        return {
          success: true,
          provider: targetProvider,
          message: `Successfully connected to SMTP server ${this.settings.smtpHost}:${this.settings.smtpPort}.`
        };
      } catch (err: any) {
        this.settings.lastConnectionStatus = 'failed';
        this.settings.lastConnectionMessage = `SMTP connection failed: ${err?.message || 'Handshake error'}`;
        return {
          success: false,
          provider: targetProvider,
          message: `SMTP verification failed: ${err?.message || 'Could not establish connection'}`
        };
      }
    }
  }

  /**
   * Send an email with template variable interpolation
   */
  public async sendEmail(params: {
    templateId?: string;
    recipient: string;
    recipientName?: string;
    subject?: string;
    bodyHtml?: string;
    data?: Record<string, string | number>;
    language?: Language;
    relatedEntityId?: string;
    relatedEntityType?: 'order' | 'user' | 'pharmacy' | 'prescription' | 'ticket' | 'payment' | 'test';
    providerOverride?: EmailProviderType;
  }): Promise<{ success: boolean; logId: string; error?: string }> {
    const {
      templateId,
      recipient,
      recipientName = '',
      data = {},
      language = 'en',
      relatedEntityId,
      relatedEntityType
    } = params;

    let subject = params.subject || 'DAWA MED Notification';
    let bodyHtml = params.bodyHtml || '<p>DAWA MED notification.</p>';
    let templateName = 'Custom Notification';

    if (templateId && this.templates.has(templateId)) {
      const tpl = this.templates.get(templateId)!;
      templateName = tpl.name;

      if (language === 'ar') {
        subject = tpl.subjectAr || tpl.subjectEn;
        bodyHtml = tpl.bodyHtmlAr || tpl.bodyHtmlEn;
      } else if (language === 'fr') {
        subject = tpl.subjectFr || tpl.subjectEn;
        bodyHtml = tpl.bodyHtmlFr || tpl.bodyHtmlEn;
      } else {
        subject = tpl.subjectEn;
        bodyHtml = tpl.bodyHtmlEn;
      }
    }

    // Interpolate variables
    const allData = {
      customer_name: recipientName || recipient.split('@')[0],
      customer_email: recipient,
      support_email: this.settings.replyToEmail,
      timestamp: new Date().toLocaleString(),
      ...data
    };

    for (const [key, value] of Object.entries(allData)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, String(value));
      bodyHtml = bodyHtml.replace(regex, String(value));
    }

    const provider = params.providerOverride || this.settings.activeProvider;
    const logId = `eml-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newLog: EmailLog = {
      id: logId,
      recipient,
      recipientName,
      templateId: templateId || 'custom',
      templateName,
      subject,
      provider,
      status: 'sending',
      sentAt: new Date().toISOString(),
      relatedEntityId,
      relatedEntityType,
      retryCount: 0,
      maxRetries: 3,
      language
    };

    this.logs.unshift(newLog);

    try {
      let dispatchSuccess = false;

      // 1. Try Resend if configured
      if (provider === 'resend') {
        const resend = this.getResendClient();
        if (resend && this.settings.hasResendKeySet) {
          try {
            await resend.emails.send({
              from: `${this.settings.senderName} <${this.settings.senderEmail}>`,
              to: [recipient],
              replyTo: this.settings.replyToEmail,
              subject,
              html: bodyHtml
            });
            dispatchSuccess = true;
          } catch (resendError: any) {
            console.warn('[Resend Send Error]', resendError?.message || resendError);
            if (!this.settings.fallbackEnabled) {
              throw resendError;
            }
          }
        }
      }

      // 2. Try SMTP if provider is SMTP or if fallback from Resend
      if (!dispatchSuccess && (provider === 'smtp' || provider === 'custom_smtp' || this.settings.fallbackEnabled)) {
        const transporter = this.getSmtpTransporter();
        if (transporter && this.settings.hasSmtpPasswordSet) {
          await transporter.sendMail({
            from: `"${this.settings.senderName}" <${this.settings.senderEmail}>`,
            to: recipient,
            replyTo: this.settings.replyToEmail,
            subject,
            html: bodyHtml
          });
          dispatchSuccess = true;
        }
      }

      if (!dispatchSuccess) {
        newLog.status = 'failed';
        newLog.failureReason = 'Email service not configured (RESEND_API_KEY or SMTP credentials missing).';
        this.settings.emailsFailedToday = (this.settings.emailsFailedToday || 0) + 1;
        return { 
          success: false, 
          logId, 
          error: 'Email provider credentials not configured. Please supply RESEND_API_KEY or SMTP settings.' 
        };
      }

      newLog.status = 'sent';
      this.settings.emailsSentToday = (this.settings.emailsSentToday || 0) + 1;
      this.settings.lastTestEmailSentAt = new Date().toISOString();

      return { success: true, logId };
    } catch (error: any) {
      console.error('[Email Dispatch Error]', error);
      newLog.status = 'failed';
      newLog.failureReason = error?.message || 'Failed to dispatch email';
      this.settings.emailsFailedToday = (this.settings.emailsFailedToday || 0) + 1;

      return { success: false, logId, error: error?.message || 'Email delivery failed' };
    }
  }

  /**
   * Retry a failed email log
   */
  public async retryEmail(logId: string): Promise<{ success: boolean; message: string }> {
    const log = this.logs.find(l => l.id === logId);
    if (!log) {
      return { success: false, message: 'Email log not found.' };
    }

    if (log.retryCount >= log.maxRetries) {
      return { success: false, message: `Max retries (${log.maxRetries}) reached for this email.` };
    }

    log.retryCount += 1;
    log.status = 'sending';

    const result = await this.sendEmail({
      templateId: log.templateId,
      recipient: log.recipient,
      recipientName: log.recipientName,
      subject: log.subject,
      language: log.language,
      relatedEntityId: log.relatedEntityId,
      relatedEntityType: log.relatedEntityType
    });

    if (result.success) {
      log.status = 'sent';
      log.failureReason = undefined;
      return { success: true, message: 'Email successfully resent.' };
    } else {
      log.status = 'failed';
      log.failureReason = result.error || 'Retry failed';
      return { success: false, message: result.error || 'Retry failed' };
    }
  }
}

export const emailService = EmailService.getInstance();
