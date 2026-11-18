const nodemailer = require('nodemailer');

class MailService {
  constructor() {
    this.otpStore = new Map(); // email -> { code, expiresAt, attempts }
  }

  isSmtpConfigured() {
    return !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );
  }

  createTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  generateOTP(email) {
    // 6-digit numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity
    this.otpStore.set(email.toLowerCase().trim(), {
      code,
      expiresAt,
      attempts: 0
    });
    return code;
  }

  async sendVerificationCode(email) {
    const cleanEmail = email.toLowerCase().trim();
    const code = this.generateOTP(cleanEmail);

    if (!this.isSmtpConfigured()) {
      console.log(`[CAGE AI OTP DEV MODE] ${cleanEmail} için Doğrulama Kodu: ${code}`);
      return {
        success: true,
        mode: 'dev_preview',
        code: code,
        message: 'Doğrulama kodu oluşturuldu (Geliştirici Test Modu). Gerçek e-posta için SMTP ayarlarını yapabilirsiniz.'
      };
    }

    try {
      const transporter = this.createTransporter();
      const mailOptions = {
        from: process.env.SMTP_FROM || `"CAGE AI Güvenlik" <${process.env.SMTP_USER}>`,
        to: cleanEmail,
        subject: `🔑 CAGE AI Giriş Doğrulama Kodunuz: ${code}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #141413; color: #ecebec; padding: 40px 20px; text-align: center;">
            <div style="max-width: 500px; margin: 0 auto; background: #1f1e1d; border: 1px solid #333230; border-radius: 12px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              <div style="font-size: 28px; font-weight: 700; color: #d97706; margin-bottom: 8px;">✦ CAGE AI</div>
              <p style="font-size: 14px; color: #a3a29e; margin-bottom: 24px;">Gelişmiş Yapay Zeka & Codium Agent Ekosistemi</p>
              
              <div style="margin: 28px 0; padding: 20px; background: #262524; border-radius: 8px; border: 1px dashed #d97706;">
                <span style="font-size: 13px; color: #a3a29e; display: block; margin-bottom: 8px;">GİRİŞ DOĞRULAMA KODUNUZ</span>
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #f59e0b; font-family: monospace;">${code}</span>
              </div>
              
              <p style="font-size: 13px; color: #a3a29e; line-height: 1.6;">
                Bu kod <strong>10 dakika</strong> boyunca geçerlidir. Kodunuzu kimseyle paylaşmayınız. Bu işlemi siz yapmadıysanız bu e-postayı dikkate almayınız.
              </p>
              
              <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #333230; font-size: 11px; color: #6b6a66;">
                © 2026 CAGE AI Technologies. Tüm Hakları Saklıdır.
              </div>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      return {
        success: true,
        mode: 'smtp_sent',
        message: 'Doğrulama kodu e-posta adresinize gönderildi.'
      };
    } catch (err) {
      console.error('SMTP Mail send error:', err);
      return {
        success: false,
        fallbackCode: code,
        message: `E-posta gönderilemedi (${err.message}). Test modunda kodunuz: ${code}`
      };
    }
  }

  verifyCode(email, inputCode) {
    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = (inputCode || '').trim();
    const entry = this.otpStore.get(cleanEmail);

    if (!entry) {
      return { success: false, message: 'Doğrulama kodu bulunamadı. Lütfen yeni bir kod talep edin.' };
    }

    if (Date.now() > entry.expiresAt) {
      this.otpStore.delete(cleanEmail);
      return { success: false, message: 'Doğrulama kodunun süresi dolmuş (10 dakika).' };
    }

    if (entry.attempts >= 5) {
      this.otpStore.delete(cleanEmail);
      return { success: false, message: 'Çok fazla hatalı deneme yapıldı. Lütfen yeni bir kod isteyin.' };
    }

    if (entry.code !== cleanCode) {
      entry.attempts += 1;
      return { success: false, message: `Hatalı doğrulama kodu. (Kalan deneme hakkı: ${5 - entry.attempts})` };
    }

    // Success!
    this.otpStore.delete(cleanEmail);
    return { success: true, message: 'Doğrulama başarılı!' };
  }
}

module.exports = new MailService();
