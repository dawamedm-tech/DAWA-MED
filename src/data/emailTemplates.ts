import { EmailTemplate } from '../types';

export const PRODUCTION_EMAIL_TEMPLATES: EmailTemplate[] = [
  // 1. Auth & Accounts
  {
    id: 'tpl_welcome',
    category: 'auth',
    name: 'Welcome to DAWA MED',
    description: 'Sent immediately when a patient, pharmacy, or driver registers an account.',
    subjectEn: 'Welcome to DAWA MED — Your Certified African Healthcare Network',
    subjectAr: 'مرحبًا بك في دواء ميد — شبكتك الصحية المعتمدة',
    subjectFr: 'Bienvenue sur DAWA MED — Votre réseau de santé certifié',
    variables: ['{{customer_name}}', '{{customer_email}}', '{{login_url}}', '{{support_email}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: #0E7A4B; padding: 28px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">DAWA MED</h1>
        <p style="margin: 6px 0 0; color: #10B981; font-size: 13px;">Ministry-Certified Pharmacy & Telemedicine Network</p>
      </div>
      <div style="padding: 32px; color: #1e293b; line-height: 1.6;">
        <h2 style="color: #0E7A4B; font-size: 20px; margin-top: 0;">Welcome, {{customer_name}}!</h2>
        <p>Your account on DAWA MED has been successfully created. You now have direct access to verified pharmacies, certified cold-chain prescription delivery, and 24/7 licensed clinical support across Africa.</p>
        <div style="background: #F1FAF4; border-left: 4px solid #0E7A4B; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 0; font-weight: bold; color: #0E7A4B;">Registered Email: {{customer_email}}</p>
        </div>
        <p style="text-align: center; margin: 32px 0;">
          <a href="{{login_url}}" style="background: #0E7A4B; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Access Your Account</a>
        </p>
        <p style="font-size: 13px; color: #64748b;">If you did not create this account, please contact our security team immediately at {{support_email}}.</p>
      </div>
      <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
        <p style="margin: 0;">© 2026 DAWA MED Limited. All clinical data protected under regional healthcare security protocols.</p>
      </div>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; text-align: right;">
      <div style="background: #0E7A4B; padding: 28px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800;">دواء ميد — DAWA MED</h1>
        <p style="margin: 6px 0 0; color: #10B981; font-size: 13px;">المنظومة الدوائية المعتمدة للرعاية الصحية وتوصيل الأدوية</p>
      </div>
      <div style="padding: 32px; color: #1e293b; line-height: 1.8;">
        <h2 style="color: #0E7A4B; font-size: 20px; margin-top: 0;">أهلاً بك، {{customer_name}}!</h2>
        <p>تم إنشاء حسابك في دواء ميد بنجاح. يمكنك الآن الوصول المباشر إلى الصيدليات المرخصة، وطلب الأدوية المعتمدة مع ضمان سلسلة التبريد الدوائي، ومتابعة وصفاتك الطبية بكل أمان وخصوصية.</p>
        <div style="background: #F1FAF4; border-right: 4px solid #0E7A4B; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 0; font-weight: bold; color: #0E7A4B;">البريد الإلكتروني المسجل: {{customer_email}}</p>
        </div>
        <p style="text-align: center; margin: 32px 0;">
          <a href="{{login_url}}" style="background: #0E7A4B; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">الدخول إلى حسابك</a>
        </p>
        <p style="font-size: 13px; color: #64748b;">إذا لم تقم بإنشاء هذا الحساب، يرجى التواصل فوراً مع الدعم الفني على {{support_email}}.</p>
      </div>
      <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
        <p style="margin: 0;">© 2026 دواء ميد DAWA MED. جميع الحقوق محفوظة وضوابط الخصوصية والأمان مفعلة.</p>
      </div>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: #0E7A4B; padding: 28px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800;">DAWA MED</h1>
        <p style="margin: 6px 0 0; color: #10B981; font-size: 13px;">Réseau Pharmaceutique et Télémédecine Certifié</p>
      </div>
      <div style="padding: 32px; color: #1e293b; line-height: 1.6;">
        <h2 style="color: #0E7A4B; font-size: 20px; margin-top: 0;">Bienvenue, {{customer_name}}!</h2>
        <p>Votre compte sur DAWA MED a été créé avec succès. Vous bénéficiez désormais d'un accès direct aux pharmacies agréées et à la livraison sécurisée sous chaîne du froid.</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="{{login_url}}" style="background: #0E7A4B; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Accéder à votre compte</a>
        </p>
      </div>
      <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
        <p style="margin: 0;">© 2026 DAWA MED. Contrôles de sécurité et de confidentialité appliqués.</p>
      </div>
    </div>`
  },

  // 2. Account Verification
  {
    id: 'tpl_account_verify',
    category: 'auth',
    name: 'Account Email Verification',
    description: 'Sent with verification link/token to activate new user accounts.',
    subjectEn: 'Verify Your DAWA MED Email Address',
    subjectAr: 'تأكيد بريدك الإلكتروني في دواء ميد',
    subjectFr: 'Vérifiez votre adresse e-mail DAWA MED',
    variables: ['{{customer_name}}', '{{verification_link}}', '{{expires_in_minutes}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px;">
      <h2 style="color: #0E7A4B;">Verify Your Email Address</h2>
      <p>Hello {{customer_name}}, please confirm your email address to unlock full healthcare and dispensing access.</p>
      <p style="text-align: center; margin: 28px 0;">
        <a href="{{verification_link}}" style="background: #0E7A4B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email Now</a>
      </p>
      <p style="font-size: 12px; color: #64748b;">This secure link expires in {{expires_in_minutes}} minutes.</p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; text-align: right;">
      <h2 style="color: #0E7A4B;">تأكيد عنوان بريدك الإلكتروني</h2>
      <p>مرحباً {{customer_name}}، يرجى تأكيد بريدك الإلكتروني لتفعيل حسابك والوصول الكامل لكافة خدمات الصرف الدوائي.</p>
      <p style="text-align: center; margin: 28px 0;">
        <a href="{{verification_link}}" style="background: #0E7A4B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">تأكيد البريد الآن</a>
      </p>
      <p style="font-size: 12px; color: #64748b;">هذا الرابط الآمن صالح لمدة {{expires_in_minutes}} دقيقة فقط.</p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px;">
      <h2 style="color: #0E7A4B;">Vérifiez votre adresse e-mail</h2>
      <p>Bonjour {{customer_name}}, veuillez confirmer votre e-mail pour activer votre compte.</p>
      <p style="text-align: center; margin: 28px 0;">
        <a href="{{verification_link}}" style="background: #0E7A4B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Confirmer l'e-mail</a>
      </p>
      <p style="font-size: 12px; color: #64748b;">Ce lien expire dans {{expires_in_minutes}} minutes.</p>
    </div>`
  },

  // 3. OTP Email
  {
    id: 'tpl_otp_code',
    category: 'auth',
    name: 'One-Time Password (OTP) Code',
    description: 'High-security time-limited OTP for login, prescription access, or order confirmation.',
    subjectEn: '{{verification_code}} is your DAWA MED Security Code',
    subjectAr: '{{verification_code}} هو رمز التحقق الخاص بك في دواء ميد',
    subjectFr: '{{verification_code}} est votre code de sécurité DAWA MED',
    variables: ['{{customer_name}}', '{{verification_code}}', '{{expires_in_minutes}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; text-align: center;">
      <h2 style="color: #0E7A4B; margin-top: 0;">DAWA MED Authentication Code</h2>
      <p style="color: #475569;">Use the following one-time code to complete your secure verification:</p>
      <div style="background: #F1FAF4; border: 2px dashed #0E7A4B; padding: 18px; margin: 24px auto; max-width: 240px; border-radius: 12px;">
        <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #0E7A4B;">{{verification_code}}</span>
      </div>
      <p style="font-size: 13px; color: #64748b;">This code will expire in {{expires_in_minutes}} minutes. Do not share this code with anyone, including DAWA MED staff.</p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; text-align: center;">
      <h2 style="color: #0E7A4B; margin-top: 0;">رمز التحقق الآمن — دواء ميد</h2>
      <p style="color: #475569;">استخدم رمز التحقق لمرة واحدة التالي لإتمام عملية الدخول الآمن:</p>
      <div style="background: #F1FAF4; border: 2px dashed #0E7A4B; padding: 18px; margin: 24px auto; max-width: 240px; border-radius: 12px;">
        <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #0E7A4B;">{{verification_code}}</span>
      </div>
      <p style="font-size: 13px; color: #64748b;">تنتهي صلاحية هذا الرمز خلال {{expires_in_minutes}} دقائق. لا تشارك هذا الرمز مع أي شخص حفاظاً على أمان بياناتك.</p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; text-align: center;">
      <h2 style="color: #0E7A4B;">Code de sécurité DAWA MED</h2>
      <p>Utilisez le code suivant pour votre vérification sécurisée :</p>
      <div style="background: #F1FAF4; border: 2px dashed #0E7A4B; padding: 18px; margin: 24px auto; max-width: 240px; border-radius: 12px;">
        <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #0E7A4B;">{{verification_code}}</span>
      </div>
      <p style="font-size: 13px; color: #64748b;">Ce code expire dans {{expires_in_minutes}} minutes. Ne le partagez avec personne.</p>
    </div>`
  },

  // 4. Password Reset
  {
    id: 'tpl_password_reset',
    category: 'auth',
    name: 'Password Reset Request',
    description: 'Sent with a secure, single-use token link when password reset is initiated.',
    subjectEn: 'Reset Your DAWA MED Password',
    subjectAr: 'إعادة تعيين كلمة المرور في دواء ميد',
    subjectFr: 'Réinitialisez votre mot de passe DAWA MED',
    variables: ['{{customer_name}}', '{{reset_link}}', '{{expires_in_minutes}}', '{{support_email}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px;">
      <h2 style="color: #0E7A4B;">Password Reset Instructions</h2>
      <p>Hello {{customer_name}}, a request was received to reset your password. Click the secure button below to set a new password:</p>
      <p style="text-align: center; margin: 28px 0;">
        <a href="{{reset_link}}" style="background: #0E7A4B; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
      </p>
      <p style="font-size: 12px; color: #64748b;">This link will expire in {{expires_in_minutes}} minutes. If you did not request this change, please ignore this email or notify {{support_email}}.</p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; text-align: right;">
      <h2 style="color: #0E7A4B;">إعادة تعيين كلمة المرور</h2>
      <p>مرحباً {{customer_name}}، لقد استلمنا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. اضغط على الزر أدناه لاختيار كلمة مرور جديدة:</p>
      <p style="text-align: center; margin: 28px 0;">
        <a href="{{reset_link}}" style="background: #0E7A4B; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">إعادة تعيين كلمة المرور</a>
      </p>
      <p style="font-size: 12px; color: #64748b;">هذا الرابط الآمن صالح لمدة {{expires_in_minutes}} دقيقة فقط. إذا لم تطلب هذا التغيير، يرجى تجاهل الرسالة والتواصل مع الدعم {{support_email}}.</p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px;">
      <h2 style="color: #0E7A4B;">Réinitialisation du mot de passe</h2>
      <p>Bonjour {{customer_name}}, cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
      <p style="text-align: center; margin: 28px 0;">
        <a href="{{reset_link}}" style="background: #0E7A4B; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Réinitialiser</a>
      </p>
      <p style="font-size: 12px; color: #64748b;">Ce lien expire dans {{expires_in_minutes}} minutes.</p>
    </div>`
  },

  // 5. Password Changed
  {
    id: 'tpl_password_changed',
    category: 'auth',
    name: 'Password Changed Confirmation',
    description: 'Security notice confirming password update.',
    subjectEn: 'Security Alert: Your DAWA MED Password Has Changed',
    subjectAr: 'تنبيه أمان: تم تغيير كلمة المرور في دواء ميد',
    subjectFr: 'Alerte sécurité : Votre mot de passe DAWA MED a été modifié',
    variables: ['{{customer_name}}', '{{timestamp}}', '{{support_email}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px;">
      <h2 style="color: #0E7A4B;">Password Successfully Changed</h2>
      <p>Hello {{customer_name}}, this is confirmation that your DAWA MED account password was changed at {{timestamp}}.</p>
      <p>If you did not authorize this change, please contact support immediately at {{support_email}} to secure your account.</p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; text-align: right;">
      <h2 style="color: #0E7A4B;">تم تغيير كلمة المرور بنجاح</h2>
      <p>مرحباً {{customer_name}}، نؤكد لك أن كلمة المرور لحسابك في دواء ميد قد تم تغييرها في {{timestamp}}.</p>
      <p>إذا لم تقم بهذا الإجراء بنفسك، يرجى التواصل فوراً مع فريق الدعم على {{support_email}} لتأمين حسابك.</p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px;">
      <h2 style="color: #0E7A4B;">Mot de passe modifié avec succès</h2>
      <p>Bonjour {{customer_name}}, votre mot de passe a été modifié le {{timestamp}}.</p>
      <p>En cas de doute, contactez {{support_email}}.</p>
    </div>`
  },

  // 6. Orders: New Order Created
  {
    id: 'tpl_order_created',
    category: 'orders',
    name: 'Order Placed & Received',
    description: 'Sent when an order is created by the patient.',
    subjectEn: 'Order Received — #{{order_id}} (DAWA MED)',
    subjectAr: 'تم استلام طلبك رقم #{{order_id}} — دواء ميد',
    subjectFr: 'Commande reçue — #{{order_id}} (DAWA MED)',
    variables: ['{{customer_name}}', '{{order_id}}', '{{order_total}}', '{{pharmacy_name}}', '{{delivery_address}}', '{{tracking_url}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: #0E7A4B; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 22px;">Order Placed Successfully</h1>
        <p style="margin: 4px 0 0; color: #10B981;">Order Reference: #{{order_id}}</p>
      </div>
      <div style="padding: 28px; color: #1e293b; line-height: 1.6;">
        <p>Dear {{customer_name}}, thank you for your order. Your prescription and medicine items have been forwarded to <strong>{{pharmacy_name}}</strong> for pharmacist verification and preparation.</p>
        <div style="background: #F1FAF4; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 8px;"><strong>Total Amount:</strong> {{order_total}}</p>
          <p style="margin: 0;"><strong>Delivery Destination:</strong> {{delivery_address}}</p>
        </div>
        <p style="text-align: center; margin: 24px 0;">
          <a href="{{tracking_url}}" style="background: #0E7A4B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Track Your Order</a>
        </p>
      </div>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; text-align: right;">
      <div style="background: #0E7A4B; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 22px;">تم استلام طلبك بنجاح</h1>
        <p style="margin: 4px 0 0; color: #10B981;">رقم الطلب: #{{order_id}}</p>
      </div>
      <div style="padding: 28px; color: #1e293b; line-height: 1.8;">
        <p>عزيزي {{customer_name}}، شكراً لطلبك. تم إرسال الأدوية والوصفة إلى صيدلية <strong>{{pharmacy_name}}</strong> للبدء في المراجعة الدوائية والتجهيز.</p>
        <div style="background: #F1FAF4; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 8px;"><strong>إجمالي المبلغ:</strong> {{order_total}}</p>
          <p style="margin: 0;"><strong>عنوان التوصيل:</strong> {{delivery_address}}</p>
        </div>
        <p style="text-align: center; margin: 24px 0;">
          <a href="{{tracking_url}}" style="background: #0E7A4B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">تتبع مسار الطلب</a>
        </p>
      </div>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: #0E7A4B; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 22px;">Commande confirmée</h1>
        <p style="margin: 4px 0 0; color: #10B981;">Réf : #{{order_id}}</p>
      </div>
      <div style="padding: 28px; color: #1e293b;">
        <p>Bonjour {{customer_name}}, votre commande a été transmise à <strong>{{pharmacy_name}}</strong>.</p>
        <p><strong>Total :</strong> {{order_total}}</p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="{{tracking_url}}" style="background: #0E7A4B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Suivre la commande</a>
        </p>
      </div>
    </div>`
  },

  // 7. Order Confirmed
  {
    id: 'tpl_order_confirmed',
    category: 'orders',
    name: 'Order Confirmed by Pharmacist',
    description: 'Sent when the licensed pharmacist reviews and approves the prescription order.',
    subjectEn: 'Order Confirmed by Licensed Pharmacist — #{{order_id}}',
    subjectAr: 'تم اعتماد وتجهيز طلبك من الصيدلي — #{{order_id}}',
    subjectFr: 'Commande validée par le pharmacien — #{{order_id}}',
    variables: ['{{customer_name}}', '{{order_id}}', '{{pharmacy_name}}', '{{pharmacist_name}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px;">
      <h2 style="color: #0E7A4B;">Order Confirmed & Prepared</h2>
      <p>Hello {{customer_name}}, your order #{{order_id}} has been reviewed and approved by pharmacist <strong>{{pharmacist_name}}</strong> at {{pharmacy_name}}.</p>
      <p>It is now being sealed in a tamper-proof package for driver dispatch.</p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; text-align: right;">
      <h2 style="color: #0E7A4B;">تم اعتماد الطلب وتجهيزه صيدلانياً</h2>
      <p>مرحباً {{customer_name}}، تم فحص وتأكيد طلبك رقم #{{order_id}} بواسطة الصيدلي المرخص <strong>{{pharmacist_name}}</strong> في {{pharmacy_name}}.</p>
      <p>يجري الآن تغليف الشحنة بغلاف محكم ومقاوم للعبث تمهيداً لتسليمها لمندوب التوصيل.</p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px;">
      <h2 style="color: #0E7A4B;">Commande validée</h2>
      <p>Bonjour {{customer_name}}, votre commande #{{order_id}} a été validée par le pharmacien {{pharmacist_name}}.</p>
    </div>`
  },

  // 8. Order Processing
  {
    id: 'tpl_order_processing',
    category: 'orders',
    name: 'Order in Preparation / Packaging',
    description: 'Notifies customer that packaging and cold chain preparation is underway.',
    subjectEn: 'Order Processing & Packaging — #{{order_id}}',
    subjectAr: 'طلبك قيد التجهيز والتغليف الدوائي — #{{order_id}}',
    subjectFr: 'Commande en cours de préparation — #{{order_id}}',
    variables: ['{{customer_name}}', '{{order_id}}', '{{pharmacy_name}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Order Processing</h2>
      <p>Hello {{customer_name}}, your order #{{order_id}} is currently being safely packed at {{pharmacy_name}}.</p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: right;">
      <h2 style="color: #0E7A4B;">الطلب قيد التجهيز</h2>
      <p>مرحباً {{customer_name}}، يجري حالياً تغليف وتجهيز طلبك #{{order_id}} في {{pharmacy_name}} وفق أعلى معايير السلامة الدوائية.</p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Commande en préparation</h2>
      <p>Bonjour {{customer_name}}, votre commande #{{order_id}} est en cours de conditionnement sécurisé.</p>
    </div>`
  },

  // 9. Order Ready
  {
    id: 'tpl_order_ready',
    category: 'orders',
    name: 'Order Ready for Pickup / Dispatch',
    description: 'Sent when pharmacy completes dispensing and order awaits driver.',
    subjectEn: 'Order Ready for Courier Pickup — #{{order_id}}',
    subjectAr: 'الطلب جاهز للاستلام والتوصيل — #{{order_id}}',
    subjectFr: 'Commande prête pour expédition — #{{order_id}}',
    variables: ['{{customer_name}}', '{{order_id}}', '{{pharmacy_name}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Your Order is Ready</h2>
      <p>Hello {{customer_name}}, order #{{order_id}} is ready and awaiting courier dispatch at {{pharmacy_name}}.</p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: right;">
      <h2 style="color: #0E7A4B;">طلبك جاهز للتوصيل</h2>
      <p>مرحباً {{customer_name}}، تم الانتهاء من تجهيز طلبك #{{order_id}} في {{pharmacy_name}} وهو بانتظار استلام السائق.</p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Votre commande est prête</h2>
      <p>Bonjour {{customer_name}}, votre commande #{{order_id}} est prête pour le coursier.</p>
    </div>`
  },

  // 10. Order Out for Delivery
  {
    id: 'tpl_order_out_for_delivery',
    category: 'orders',
    name: 'Order Out for Delivery',
    description: 'Sent when driver picks up package with OTP code for delivery confirmation.',
    subjectEn: 'Out for Delivery — Order #{{order_id}} is on the way',
    subjectAr: 'طلبك في الطريق إليك — رقم #{{order_id}}',
    subjectFr: 'En cours de livraison — Commande #{{order_id}}',
    variables: ['{{customer_name}}', '{{order_id}}', '{{driver_name}}', '{{delivery_otp}}', '{{tracking_url}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: #0E7A4B; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 22px;">Out for Delivery</h1>
        <p style="margin: 4px 0 0; color: #10B981;">Courier: {{driver_name}}</p>
      </div>
      <div style="padding: 28px; color: #1e293b; line-height: 1.6;">
        <p>Hello {{customer_name}}, your medication package is now on the road with verified courier <strong>{{driver_name}}</strong>.</p>
        <div style="background: #FFFBEB; border: 2px dashed #D97706; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 6px; font-size: 13px; color: #92400E;">Your Secure Delivery Confirmation Code:</p>
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #B45309;">{{delivery_otp}}</span>
          <p style="margin: 6px 0 0; font-size: 11px; color: #B45309;">Provide this 4-digit code to the courier upon physical receipt.</p>
        </div>
        <p style="text-align: center; margin: 24px 0;">
          <a href="{{tracking_url}}" style="background: #0E7A4B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Live Delivery Tracking</a>
        </p>
      </div>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; text-align: right;">
      <div style="background: #0E7A4B; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 22px;">طلبك في الطريق إليك</h1>
        <p style="margin: 4px 0 0; color: #10B981;">مندوب التوصيل: {{driver_name}}</p>
      </div>
      <div style="padding: 28px; color: #1e293b; line-height: 1.8;">
        <p>مرحباً {{customer_name}}، شحنتك الدوائية في الطريق إليك مع السائق المعتمد <strong>{{driver_name}}</strong> مع الحفاظ التام على سلسلة التبريد.</p>
        <div style="background: #FFFBEB; border: 2px dashed #D97706; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 6px; font-size: 13px; color: #92400E;">رمز الاستلام والتأكيد السري:</p>
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #B45309;">{{delivery_otp}}</span>
          <p style="margin: 6px 0 0; font-size: 11px; color: #B45309;">أعطِ هذا الرمز للمندوب عند استلامك الفعلي للطرد.</p>
        </div>
        <p style="text-align: center; margin: 24px 0;">
          <a href="{{tracking_url}}" style="background: #0E7A4B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">تتبع موقع السائق مباشرة</a>
        </p>
      </div>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: #0E7A4B; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 22px;">Commande en cours de livraison</h1>
        <p style="margin: 4px 0 0; color: #10B981;">Coursier : {{driver_name}}</p>
      </div>
      <div style="padding: 28px; color: #1e293b;">
        <p>Bonjour {{customer_name}}, votre coursier est en route.</p>
        <p><strong>Code de confirmation :</strong> {{delivery_otp}}</p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="{{tracking_url}}" style="background: #0E7A4B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Suivre le coursier</a>
        </p>
      </div>
    </div>`
  },

  // 11. Order Delivered
  {
    id: 'tpl_order_delivered',
    category: 'orders',
    name: 'Order Successfully Delivered',
    description: 'Sent upon completed delivery confirmation with receipt link.',
    subjectEn: 'Delivered — Order #{{order_id}} Complete',
    subjectAr: 'تم التوصيل بنجاح — الطلب رقم #{{order_id}}',
    subjectFr: 'Livraison effectuée — Commande #{{order_id}}',
    variables: ['{{customer_name}}', '{{order_id}}', '{{receipt_url}}', '{{support_email}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px;">
      <h2 style="color: #0E7A4B;">Order Delivered Successfully</h2>
      <p>Hello {{customer_name}}, your order #{{order_id}} has been successfully delivered and confirmed.</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="{{receipt_url}}" style="background: #0E7A4B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Download Official Receipt</a>
      </p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; text-align: right;">
      <h2 style="color: #0E7A4B;">تم تسليم الطلب بنجاح</h2>
      <p>مرحباً {{customer_name}}، تم تسليم طلبك رقم #{{order_id}} وتأكيده بنجاح. نتمنى لك دوام الصحة والعافية.</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="{{receipt_url}}" style="background: #0E7A4B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">تحميل الإيصال الرسمي</a>
      </p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px;">
      <h2 style="color: #0E7A4B;">Commande livrée avec succès</h2>
      <p>Bonjour {{customer_name}}, votre commande #{{order_id}} est bien livrée.</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="{{receipt_url}}" style="background: #0E7A4B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Télécharger le reçu</a>
      </p>
    </div>`
  },

  // 12. Order Cancelled
  {
    id: 'tpl_order_cancelled',
    category: 'orders',
    name: 'Order Cancelled',
    description: 'Sent when an order is cancelled by user or pharmacist with reason.',
    subjectEn: 'Order Cancelled — #{{order_id}}',
    subjectAr: 'تم إلغاء الطلب رقم #{{order_id}}',
    subjectFr: 'Commande annulée — #{{order_id}}',
    variables: ['{{customer_name}}', '{{order_id}}', '{{cancellation_reason}}', '{{refund_status}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #991b1b;">Order Cancelled</h2>
      <p>Hello {{customer_name}}, order #{{order_id}} has been cancelled.</p>
      <p><strong>Reason:</strong> {{cancellation_reason}}</p>
      <p><strong>Refund Status:</strong> {{refund_status}}</p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: right;">
      <h2 style="color: #991b1b;">تم إلغاء الطلب</h2>
      <p>مرحباً {{customer_name}}، تم إلغاء الطلب رقم #{{order_id}}.</p>
      <p><strong>سبب الإلغاء:</strong> {{cancellation_reason}}</p>
      <p><strong>حالة الاسترداد المالي:</strong> {{refund_status}}</p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #991b1b;">Commande annulée</h2>
      <p>Bonjour {{customer_name}}, la commande #{{order_id}} a été annulée. Motif : {{cancellation_reason}}.</p>
    </div>`
  },

  // 13. Payments: Payment Successful
  {
    id: 'tpl_payment_success',
    category: 'payments',
    name: 'Payment Successful Receipt',
    description: 'Sent upon successful payment settlement via M-Pesa, Card, or MTN MoMo.',
    subjectEn: 'Payment Receipt: {{order_total}} for Order #{{order_id}}',
    subjectAr: 'إيصال دفع: {{order_total}} للطلب رقم #{{order_id}}',
    subjectFr: 'Reçu de paiement : {{order_total}} pour commande #{{order_id}}',
    variables: ['{{customer_name}}', '{{order_id}}', '{{order_total}}', '{{payment_method}}', '{{transaction_id}}', '{{receipt_url}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px;">
      <div style="text-align: center; color: #166534;">
        <h2 style="margin: 0;">Payment Confirmed</h2>
        <p style="margin: 4px 0 0; font-size: 14px;">Transaction ID: {{transaction_id}}</p>
      </div>
      <div style="background: #F1FAF4; padding: 20px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0 0 8px;"><strong>Amount Paid:</strong> {{order_total}}</p>
        <p style="margin: 0 0 8px;"><strong>Payment Method:</strong> {{payment_method}}</p>
        <p style="margin: 0;"><strong>Order Reference:</strong> #{{order_id}}</p>
      </div>
      <p style="text-align: center;">
        <a href="{{receipt_url}}" style="background: #0E7A4B; color: white; padding: 10px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Full Receipt</a>
      </p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; text-align: right;">
      <div style="text-align: center; color: #166534;">
        <h2 style="margin: 0;">تم تأكيد الدفع بنجاح</h2>
        <p style="margin: 4px 0 0; font-size: 14px;">رقم المعاملة: {{transaction_id}}</p>
      </div>
      <div style="background: #F1FAF4; padding: 20px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0 0 8px;"><strong>المبلغ المدفوع:</strong> {{order_total}}</p>
        <p style="margin: 0 0 8px;"><strong>طريقة الدفع:</strong> {{payment_method}}</p>
        <p style="margin: 0;"><strong>رقم الطلب:</strong> #{{order_id}}</p>
      </div>
      <p style="text-align: center;">
        <a href="{{receipt_url}}" style="background: #0E7A4B; color: white; padding: 10px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">عرض الإيصال الكامل</a>
      </p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px;">
      <h2 style="color: #166534;">Paiement confirmé</h2>
      <p><strong>Montant :</strong> {{order_total}}</p>
      <p><strong>Méthode :</strong> {{payment_method}}</p>
      <p><strong>Transaction :</strong> {{transaction_id}}</p>
    </div>`
  },

  // 14. Payment Failed
  {
    id: 'tpl_payment_failed',
    category: 'payments',
    name: 'Payment Failed Alert',
    description: 'Sent when payment attempt encounters an error or cancellation.',
    subjectEn: 'Payment Failed for Order #{{order_id}}',
    subjectAr: 'فشل عملية الدفع للطلب رقم #{{order_id}}',
    subjectFr: 'Échec du paiement pour la commande #{{order_id}}',
    variables: ['{{customer_name}}', '{{order_id}}', '{{retry_payment_url}}', '{{failure_reason}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #b91c1c;">Payment Could Not Be Processed</h2>
      <p>Hello {{customer_name}}, the payment for order #{{order_id}} failed. Reason: {{failure_reason}}.</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="{{retry_payment_url}}" style="background: #b91c1c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Retry Payment</a>
      </p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: right;">
      <h2 style="color: #b91c1c;">تعذر إتمام عملية الدفع</h2>
      <p>مرحباً {{customer_name}}، لم نتمكن من معالجة الدفع للطلب رقم #{{order_id}}. السبب: {{failure_reason}}.</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="{{retry_payment_url}}" style="background: #b91c1c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">إعادة المحاولة والدفع</a>
      </p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #b91c1c;">Échec du paiement</h2>
      <p>Bonjour {{customer_name}}, le paiement a échoué. Motif : {{failure_reason}}.</p>
      <p style="text-align: center;">
        <a href="{{retry_payment_url}}" style="background: #b91c1c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Réessayer</a>
      </p>
    </div>`
  },

  // 15. Prescription Received
  {
    id: 'tpl_rx_received',
    category: 'prescriptions',
    name: 'Prescription Upload Received',
    description: 'Sent when patient uploads prescription for pharmacist clinical review.',
    subjectEn: 'Prescription Upload Received — Verification in Progress',
    subjectAr: 'تم استلام وصفتك الطبية — جاري التدقيق الصيدلاني',
    subjectFr: 'Ordonnance reçue — Vérification en cours',
    variables: ['{{customer_name}}', '{{prescription_id}}', '{{pharmacy_name}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Prescription Received</h2>
      <p>Hello {{customer_name}}, your prescription (ID: {{prescription_id}}) has been received securely and assigned to {{pharmacy_name}} for clinical validation.</p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: right;">
      <h2 style="color: #0E7A4B;">تم استلام وصفتك الطبية</h2>
      <p>مرحباً {{customer_name}}، تم استلام الوصفة الطبية (رقم: {{prescription_id}}) بأمان ونقلها إلى {{pharmacy_name}} للمراجعة والاعتماد الصيدلاني.</p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Ordonnance reçue</h2>
      <p>Bonjour {{customer_name}}, votre ordonnance (ID : {{prescription_id}}) est en cours d'examen par {{pharmacy_name}}.</p>
    </div>`
  },

  // 16. Prescription Approved
  {
    id: 'tpl_rx_approved',
    category: 'prescriptions',
    name: 'Prescription Approved by Pharmacist',
    description: 'Sent when prescription is validated and ready for dispensing.',
    subjectEn: 'Prescription Approved — Ready for Dispensing',
    subjectAr: 'تم اعتماد وصفتك الطبية من الصيدلي المرخص',
    subjectFr: 'Ordonnance approuvée — Prête pour délivrance',
    variables: ['{{customer_name}}', '{{prescription_id}}', '{{pharmacist_name}}', '{{checkout_url}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Prescription Approved</h2>
      <p>Hello {{customer_name}}, your prescription (ID: {{prescription_id}}) was approved by pharmacist {{pharmacist_name}}.</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="{{checkout_url}}" style="background: #0E7A4B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Proceed to Checkout</a>
      </p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: right;">
      <h2 style="color: #0E7A4B;">تم اعتماد وصفتك الطبية</h2>
      <p>مرحباً {{customer_name}}، قام الصيدلي المرخص {{pharmacist_name}} بفحص واعتماد وصفتك الطبية (رقم: {{prescription_id}}).</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="{{checkout_url}}" style="background: #0E7A4B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">المتابعة للدفع والاستلام</a>
      </p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Ordonnance approuvée</h2>
      <p>Bonjour {{customer_name}}, votre ordonnance a été validée par le pharmacien {{pharmacist_name}}.</p>
    </div>`
  },

  // 17. Prescription Rejected
  {
    id: 'tpl_rx_rejected',
    category: 'prescriptions',
    name: 'Prescription Rejected / Clarification Needed',
    description: 'Sent when prescription requires doctor clarification or is invalid.',
    subjectEn: 'Prescription Review Notice — Action Required',
    subjectAr: 'ملاحظة حول الوصفة الطبية — يلزم اتخاذ إجراء',
    subjectFr: 'Avis sur votre ordonnance — Action requise',
    variables: ['{{customer_name}}', '{{prescription_id}}', '{{rejection_reason}}', '{{reupload_url}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #b91c1c;">Prescription Clarification Required</h2>
      <p>Hello {{customer_name}}, our pharmacist was unable to validate prescription {{prescription_id}}.</p>
      <p><strong>Clinical Reason:</strong> {{rejection_reason}}</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="{{reupload_url}}" style="background: #0E7A4B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Upload Clear Prescription</a>
      </p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: right;">
      <h2 style="color: #b91c1c;">ملاحظة وتوضيح بشأن الوصفة الطبية</h2>
      <p>مرحباً {{customer_name}}، تعذر اعتماد الوصفة الطبية رقم {{prescription_id}} من قبل الصيدلي المشرف.</p>
      <p><strong>السبب الطبي:</strong> {{rejection_reason}}</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="{{reupload_url}}" style="background: #0E7A4B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">إعادة رفع صورة واضحة</a>
      </p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #b91c1c;">Ordonnance non validée</h2>
      <p>Bonjour {{customer_name}}, motif : {{rejection_reason}}.</p>
    </div>`
  },

  // 18. Pharmacy Registration Received
  {
    id: 'tpl_pharmacy_registered',
    category: 'pharmacy',
    name: 'Pharmacy Application Received',
    description: 'Sent to pharmacy owner when license is submitted for admin review.',
    subjectEn: 'Pharmacy Application Under Review — DAWA MED',
    subjectAr: 'تم استلام طلب تسجيل الصيدلية — قيد المراجعة التنظيمية',
    subjectFr: 'Demande de pharmacie en cours d’examen — DAWA MED',
    variables: ['{{pharmacy_name}}', '{{license_number}}', '{{regulatory_body}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Pharmacy Application Received</h2>
      <p>Thank you for registering <strong>{{pharmacy_name}}</strong> (License: {{license_number}}). Our compliance officers are verifying your credentials with {{regulatory_body}}.</p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: right;">
      <h2 style="color: #0E7A4B;">تم استلام طلب انضمام الصيدلية</h2>
      <p>شكراً لتسجيل صيدلية <strong>{{pharmacy_name}}</strong> (ترخيص رقم: {{license_number}}). يقوم مسؤولو الامتثال بمراجعة وتدقيق المستندات مع {{regulatory_body}}.</p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Demande de pharmacie reçue</h2>
      <p>Votre demande pour {{pharmacy_name}} (Licence : {{license_number}}) est en cours de vérification.</p>
    </div>`
  },

  // 19. Pharmacy Approved
  {
    id: 'tpl_pharmacy_approved',
    category: 'pharmacy',
    name: 'Pharmacy Approved & Activated',
    description: 'Sent when admin approves a pharmacy partner for active dispensing.',
    subjectEn: 'Congratulations! {{pharmacy_name}} is Approved on DAWA MED',
    subjectAr: 'تهانينا! تم اعتماد صيدلية {{pharmacy_name}} رسمياً في دواء ميد',
    subjectFr: 'Félicitations ! {{pharmacy_name}} est agréée sur DAWA MED',
    variables: ['{{pharmacy_name}}', '{{portal_url}}', '{{support_email}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #166534;">Pharmacy Verified & Active</h2>
      <p>We are delighted to confirm that <strong>{{pharmacy_name}}</strong> has passed regulatory verification and is now active on the DAWA MED network.</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="{{portal_url}}" style="background: #0E7A4B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Open Pharmacy Portal</a>
      </p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: right;">
      <h2 style="color: #166534;">تم اعتماد الصيدلية وتفعيلها بنجاح</h2>
      <p>يسعدنا إبلاغكم بأن صيدلية <strong>{{pharmacy_name}}</strong> قد اجتازت الفحص التنظيمي وأصبحت الآن مفعلة في شبكة دواء ميد لاستقبال وصرف الطلبات.</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="{{portal_url}}" style="background: #0E7A4B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">الدخول إلى لوحة الصيدلية</a>
      </p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #166534;">Pharmacie agréée et active</h2>
      <p>Félicitations, {{pharmacy_name}} est maintenant active sur le réseau DAWA MED.</p>
    </div>`
  },

  // 20. Pharmacy Rejected
  {
    id: 'tpl_pharmacy_rejected',
    category: 'pharmacy',
    name: 'Pharmacy Application Rejected',
    description: 'Sent when pharmacy application cannot be approved.',
    subjectEn: 'Update on Your DAWA MED Pharmacy Application',
    subjectAr: 'إشعار حول طلب انضمام الصيدلية — دواء ميد',
    subjectFr: 'Notification concernant votre demande de pharmacie',
    variables: ['{{pharmacy_name}}', '{{rejection_reason}}', '{{support_email}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #b91c1c;">Pharmacy Application Decision</h2>
      <p>Following review, we regret to inform you that {{pharmacy_name}} could not be approved at this time.</p>
      <p><strong>Reason:</strong> {{rejection_reason}}</p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: right;">
      <h2 style="color: #b91c1c;">قرار مراجعة طلب الصيدلية</h2>
      <p>بعد المراجعة والتدقيق، نعتذر عن عدم إمكانية اعتماد صيدلية {{pharmacy_name}} في الوقت الحالي.</p>
      <p><strong>السبب:</strong> {{rejection_reason}}</p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #b91c1c;">Décision concernant votre demande</h2>
      <p>La demande pour {{pharmacy_name}} n'a pas pu être approuvée. Motif : {{rejection_reason}}.</p>
    </div>`
  },

  // 21. Medicine Submitted
  {
    id: 'tpl_medicine_submitted',
    category: 'medicines',
    name: 'Medicine Submitted for Approval',
    description: 'Sent when pharmacy submits a new pharmaceutical product for regulatory approval.',
    subjectEn: 'Product Submitted: {{medicine_name}} — Pending Review',
    subjectAr: 'تم تقديم الدواء: {{medicine_name}} — قيد مراجعة الاعتماد',
    subjectFr: 'Produit soumis : {{medicine_name}} — En attente d’examen',
    variables: ['{{pharmacy_name}}', '{{medicine_name}}', '{{generic_name}}', '{{dosage}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Medicine Submitted for Review</h2>
      <p>Product <strong>{{medicine_name}}</strong> ({{generic_name}}, {{dosage}}) has been submitted by {{pharmacy_name}} and is currently under review by our Chief Medical Officer.</p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: right;">
      <h2 style="color: #0E7A4B;">تم تقديم الدواء للمراجعة والاعتماد</h2>
      <p>تم استلام بيانات المستحضر <strong>{{medicine_name}}</strong> ({{generic_name}}, {{dosage}}) من صيدلية {{pharmacy_name}} وهو قيد التدقيق لدى الإدارة الطبية.</p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Médicament soumis</h2>
      <p>Le produit {{medicine_name}} est en cours d’examen médical.</p>
    </div>`
  },

  // 22. Medicine Approved
  {
    id: 'tpl_medicine_approved',
    category: 'medicines',
    name: 'Medicine Approved & Live in Catalog',
    description: 'Sent when admin approves medicine product for public listing.',
    subjectEn: 'Approved: {{medicine_name}} is Live in DAWA MED Catalog',
    subjectAr: 'تم الاعتماد: دواء {{medicine_name}} متاح الآن في الكتالوج',
    subjectFr: 'Approuvé : {{medicine_name}} est disponible au catalogue',
    variables: ['{{pharmacy_name}}', '{{medicine_name}}', '{{reviewer_name}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #166534;">Medicine Approved for Public Listing</h2>
      <p>Product <strong>{{medicine_name}}</strong> submitted by {{pharmacy_name}} was approved by {{reviewer_name}} and is now active for patient ordering.</p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: right;">
      <h2 style="color: #166534;">تم اعتماد الدواء وإدراجه للجمهور</h2>
      <p>تم اعتماد المستحضر الدوائي <strong>{{medicine_name}}</strong> المقدم من {{pharmacy_name}} بواسطة {{reviewer_name}} وأصبح متاحاً للطلب الفوري في الكتالوج.</p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #166534;">Médicament approuvé</h2>
      <p>Le produit {{medicine_name}} est désormais disponible à la commande.</p>
    </div>`
  },

  // 23. Medicine Rejected
  {
    id: 'tpl_medicine_rejected',
    category: 'medicines',
    name: 'Medicine Rejected / Gating Decision',
    description: 'Sent when medicine product fails clinical or regulatory approval.',
    subjectEn: 'Notice: Product {{medicine_name}} Not Approved',
    subjectAr: 'إشعار: تعذر اعتماد المستحضر الدوائي {{medicine_name}}',
    subjectFr: 'Avis : Produit {{medicine_name}} non approuvé',
    variables: ['{{pharmacy_name}}', '{{medicine_name}}', '{{rejection_reason}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #b91c1c;">Medicine Approval Decision</h2>
      <p>Product <strong>{{medicine_name}}</strong> could not be approved for public listing. Reason: {{rejection_reason}}.</p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: right;">
      <h2 style="color: #b91c1c;">قرار رفض اعتماد الدواء</h2>
      <p>تعذر اعتماد المستحضر الدوائي <strong>{{medicine_name}}</strong> للنشر العام. السبب: {{rejection_reason}}.</p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #b91c1c;">Décision concernant le médicament</h2>
      <p>Le produit {{medicine_name}} n'a pas été approuvé. Motif : {{rejection_reason}}.</p>
    </div>`
  },

  // 24. Driver Assignment
  {
    id: 'tpl_driver_assignment',
    category: 'fleet',
    name: 'New Delivery Assigned to Driver',
    description: 'Sent to driver with order dispatch and pickup details.',
    subjectEn: 'New Delivery Dispatch: Order #{{order_id}}',
    subjectAr: 'مهمة توصيل جديدة: الطلب رقم #{{order_id}}',
    subjectFr: 'Nouvelle livraison assignée : Commande #{{order_id}}',
    variables: ['{{driver_name}}', '{{order_id}}', '{{pharmacy_name}}', '{{delivery_zone}}', '{{driver_app_url}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">New Delivery Dispatch</h2>
      <p>Hello {{driver_name}}, order #{{order_id}} is ready for pickup at <strong>{{pharmacy_name}}</strong> in {{delivery_zone}}.</p>
      <p style="text-align: center;">
        <a href="{{driver_app_url}}" style="background: #0E7A4B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Accept & Navigate</a>
      </p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: right;">
      <h2 style="color: #0E7A4B;">مهمة توصيل دوائي جديدة</h2>
      <p>مرحباً {{driver_name}}، الطلب رقم #{{order_id}} جاهز للاستلام من صيدلية <strong>{{pharmacy_name}}</strong> في منطقة {{delivery_zone}}.</p>
      <p style="text-align: center;">
        <a href="{{driver_app_url}}" style="background: #0E7A4B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">قبول وبدء التوصيل</a>
      </p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Nouvelle course assignée</h2>
      <p>Bonjour {{driver_name}}, commande #{{order_id}} à récupérer chez {{pharmacy_name}}.</p>
    </div>`
  },

  // 25. Support Ticket Created
  {
    id: 'tpl_support_ticket_created',
    category: 'support',
    name: 'Support Ticket Created',
    description: 'Sent to user confirming support inquiry reception.',
    subjectEn: 'Support Ticket Received — #{{support_ticket_id}}',
    subjectAr: 'تم استلام تذكرة الدعم رقم #{{support_ticket_id}}',
    subjectFr: 'Ticket de support créé — #{{support_ticket_id}}',
    variables: ['{{customer_name}}', '{{support_ticket_id}}', '{{ticket_title}}', '{{support_portal_url}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Support Ticket Received</h2>
      <p>Hello {{customer_name}}, your support ticket #{{support_ticket_id}} ("{{ticket_title}}") has been logged with our medical support desk.</p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: right;">
      <h2 style="color: #0E7A4B;">تم استلام تذكرة الدعم الفني</h2>
      <p>مرحباً {{customer_name}}، تم تسجيل تذكرتك رقم #{{support_ticket_id}} ("{{ticket_title}}") وسيقوم فريق الدعم بالرد عليك في أقرب وقت.</p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Ticket de support ouvert</h2>
      <p>Bonjour {{customer_name}}, votre ticket #{{support_ticket_id}} a bien été pris en compte.</p>
    </div>`
  },

  // 26. Support Ticket Updated
  {
    id: 'tpl_support_ticket_updated',
    category: 'support',
    name: 'Support Ticket Reply / Update',
    description: 'Sent when support agent replies or resolves ticket.',
    subjectEn: 'Update on Support Ticket #{{support_ticket_id}}',
    subjectAr: 'تحديث جديد على تذكرة الدعم رقم #{{support_ticket_id}}',
    subjectFr: 'Mise à jour sur votre ticket #{{support_ticket_id}}',
    variables: ['{{customer_name}}', '{{support_ticket_id}}', '{{reply_message}}', '{{ticket_status}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Support Ticket Update</h2>
      <p>Hello {{customer_name}}, new update on ticket #{{support_ticket_id}} (Status: {{ticket_status}}):</p>
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; font-style: italic;">"{{reply_message}}"</p>
      </div>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: right;">
      <h2 style="color: #0E7A4B;">تحديث على تذكرة الدعم</h2>
      <p>مرحباً {{customer_name}}، هناك رد جديد على التذكرة رقم #{{support_ticket_id}} (الحالة: {{ticket_status}}):</p>
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; font-style: italic;">"{{reply_message}}"</p>
      </div>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Réponse du support</h2>
      <p>Bonjour {{customer_name}}, réponse pour le ticket #{{support_ticket_id}} : {{reply_message}}.</p>
    </div>`
  },

  // 27. Subscription Activated
  {
    id: 'tpl_subscription_activated',
    category: 'subscriptions',
    name: 'Chronic Care Subscription Activated',
    description: 'Sent when patient subscribes to monthly automated medication refill program.',
    subjectEn: 'DAWA Monthly Refill Subscription Activated — {{subscription_plan}}',
    subjectAr: 'تم تفعيل اشتراك إعادة الصرف الشهري للأدوية المزمنة — {{subscription_plan}}',
    subjectFr: 'Abonnement renouvellement automatique activé — {{subscription_plan}}',
    variables: ['{{customer_name}}', '{{subscription_plan}}', '{{next_billing_date}}', '{{monthly_price}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Subscription Active</h2>
      <p>Hello {{customer_name}}, your <strong>{{subscription_plan}}</strong> is now active. Your chronic medications will be refilled automatically on {{next_billing_date}}.</p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: right;">
      <h2 style="color: #0E7A4B;">تم تفعيل اشتراك الصرف التلقائي</h2>
      <p>مرحباً {{customer_name}}، اشتراكك في <strong>{{subscription_plan}}</strong> نشط الآن. سيتم تجهيز وإعادة صرف أدويتك المزمنة تلقائياً في {{next_billing_date}}.</p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Abonnement activé</h2>
      <p>Bonjour {{customer_name}}, votre formule {{subscription_plan}} est active. Prochain renouvellement : {{next_billing_date}}.</p>
    </div>`
  },

  // 28. Subscription Renewed
  {
    id: 'tpl_subscription_renewed',
    category: 'subscriptions',
    name: 'Subscription Renewed & Refill Dispatched',
    description: 'Sent on monthly renewal billing and prescription dispatch.',
    subjectEn: 'Monthly Medication Refill Renewed — DAWA MED',
    subjectAr: 'تم تجديد الصرف الشهري للأدوية — دواء ميد',
    subjectFr: 'Renouvellement mensuel de médicaments effectué',
    variables: ['{{customer_name}}', '{{subscription_plan}}', '{{order_id}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Monthly Refill In Progress</h2>
      <p>Hello {{customer_name}}, your subscription order #{{order_id}} for {{subscription_plan}} has been generated and queued for pharmacy preparation.</p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: right;">
      <h2 style="color: #0E7A4B;">جاري تجهيز الصرف الشهري التلقائي</h2>
      <p>مرحباً {{customer_name}}، تم إنشاء طلب الصرف الشهري رقم #{{order_id}} لباقة {{subscription_plan}} وجاري تجهيزه صيدلانياً.</p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0E7A4B;">Renouvellement mensuel</h2>
      <p>Bonjour {{customer_name}}, votre commande périodique #{{order_id}} est en cours de préparation.</p>
    </div>`
  },

  // 29. Subscription Cancelled
  {
    id: 'tpl_subscription_cancelled',
    category: 'subscriptions',
    name: 'Subscription Cancelled',
    description: 'Sent when automated monthly refill subscription is paused or cancelled.',
    subjectEn: 'DAWA Monthly Refill Subscription Cancelled',
    subjectAr: 'تم إيقاف اشتراك الصرف التلقائي — دواء ميد',
    subjectFr: 'Abonnement renouvellement résilié — DAWA MED',
    variables: ['{{customer_name}}', '{{subscription_plan}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #475569;">Subscription Cancelled</h2>
      <p>Hello {{customer_name}}, your automated subscription {{subscription_plan}} has been cancelled. You can reactivate anytime from your dashboard.</p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: right;">
      <h2 style="color: #475569;">تم إلغاء الاشتراك الشهري</h2>
      <p>مرحباً {{customer_name}}، تم إيقاف خدمة الصرف التلقائي لباقة {{subscription_plan}}. يمكنك إعادة التفعيل في أي وقت من لوحة التحكم.</p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #475569;">Abonnement résilié</h2>
      <p>Bonjour {{customer_name}}, votre formule {{subscription_plan}} a été annulée.</p>
    </div>`
  },

  // 30. Security Alert
  {
    id: 'tpl_security_alert',
    category: 'security',
    name: 'Security & New Device Login Alert',
    description: 'Sent upon new device login, sensitive action, or suspicious attempt.',
    subjectEn: 'Security Notice: New Login to Your DAWA MED Account',
    subjectAr: 'تنبيه أمان: تسجيل دخول جديد إلى حسابك في دواء ميد',
    subjectFr: 'Alerte sécurité : Nouvelle connexion à votre compte DAWA MED',
    variables: ['{{customer_name}}', '{{login_time}}', '{{ip_address}}', '{{device_info}}', '{{secure_account_url}}'],
    isActive: true,
    updatedAt: '2026-08-25T08:00:00Z',
    bodyHtmlEn: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px;">
      <h2 style="color: #991b1b;">New Sign-In Detected</h2>
      <p>Hello {{customer_name}}, a new sign-in was detected on your DAWA MED account:</p>
      <div style="background: #FFFBEB; padding: 16px; border-radius: 8px; margin: 16px 0; font-size: 13px;">
        <p style="margin: 0 0 6px;"><strong>Time:</strong> {{login_time}}</p>
        <p style="margin: 0 0 6px;"><strong>IP Address:</strong> {{ip_address}}</p>
        <p style="margin: 0;"><strong>Device / Browser:</strong> {{device_info}}</p>
      </div>
      <p style="font-size: 13px;">If this was not you, please secure your account immediately:</p>
      <p style="text-align: center;">
        <a href="{{secure_account_url}}" style="background: #991b1b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Lock & Secure Account</a>
      </p>
    </div>`,
    bodyHtmlAr: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; text-align: right;">
      <h2 style="color: #991b1b;">تم رصد تسجيل دخول جديد</h2>
      <p>مرحباً {{customer_name}}، تم رصد عملية تسجيل دخول جديدة إلى حسابك في دواء ميد:</p>
      <div style="background: #FFFBEB; padding: 16px; border-radius: 8px; margin: 16px 0; font-size: 13px;">
        <p style="margin: 0 0 6px;"><strong>الوقت:</strong> {{login_time}}</p>
        <p style="margin: 0 0 6px;"><strong>عنوان IP:</strong> {{ip_address}}</p>
        <p style="margin: 0;"><strong>الجهاز / المتصفح:</strong> {{device_info}}</p>
      </div>
      <p style="font-size: 13px;">إذا لم تكن أنت من قام بالدخول، يرجى تأمين حسابك فوراً بالضغط أدناه:</p>
      <p style="text-align: center;">
        <a href="{{secure_account_url}}" style="background: #991b1b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">تأمين الحساب فوراً</a>
      </p>
    </div>`,
    bodyHtmlFr: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px;">
      <h2 style="color: #991b1b;">Nouvelle connexion détectée</h2>
      <p>Bonjour {{customer_name}}, connexion le {{login_time}} depuis {{ip_address}}.</p>
    </div>`
  }
];

export const INITIAL_EMAIL_LOGS = [
  {
    id: 'eml-log-901',
    recipient: 'patient.omar@gmail.com',
    recipientName: 'Omar Al-Hassan',
    templateId: 'tpl_order_created',
    templateName: 'Order Placed & Received',
    subject: 'Order Received — #ORD-KE-9921 (DAWA MED)',
    provider: 'resend' as const,
    status: 'sent' as const,
    sentAt: '2026-08-25T06:15:00Z',
    relatedEntityId: 'ORD-KE-9921',
    relatedEntityType: 'order' as const,
    retryCount: 0,
    maxRetries: 3,
    language: 'ar' as const
  },
  {
    id: 'eml-log-902',
    recipient: 'dr.wanjiku@goodlife.co.ke',
    recipientName: 'Dr. Sarah Wanjiku',
    templateId: 'tpl_pharmacy_approved',
    templateName: 'Pharmacy Approved & Activated',
    subject: 'Congratulations! GoodLife Pharmacy is Approved on DAWA MED',
    provider: 'resend' as const,
    status: 'sent' as const,
    sentAt: '2026-08-25T05:30:00Z',
    relatedEntityId: 'pharma-01',
    relatedEntityType: 'pharmacy' as const,
    retryCount: 0,
    maxRetries: 3,
    language: 'en' as const
  },
  {
    id: 'eml-log-903',
    recipient: 'marie.k@healthnet.cd',
    recipientName: 'Marie Kabila',
    templateId: 'tpl_otp_code',
    templateName: 'One-Time Password (OTP) Code',
    subject: '8492 is your DAWA MED Security Code',
    provider: 'smtp' as const,
    status: 'sent' as const,
    sentAt: '2026-08-25T07:10:00Z',
    relatedEntityId: 'usr-customer-2',
    relatedEntityType: 'user' as const,
    retryCount: 0,
    maxRetries: 3,
    language: 'fr' as const
  },
  {
    id: 'eml-log-904',
    recipient: 'test.driver@dawafleet.com',
    recipientName: 'Kiprono Courier',
    templateId: 'tpl_driver_assignment',
    templateName: 'New Delivery Assigned to Driver',
    subject: 'New Delivery Dispatch: Order #ORD-KE-8841',
    provider: 'smtp' as const,
    status: 'sent' as const,
    sentAt: '2026-08-25T07:45:00Z',
    relatedEntityId: 'ORD-KE-8841',
    relatedEntityType: 'order' as const,
    retryCount: 0,
    maxRetries: 3,
    language: 'en' as const
  }
];
