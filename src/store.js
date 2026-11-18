const fs = require('fs');
const path = require('path');
const os = require('os');

class Store {
  constructor() {
    this.dir = path.join(process.env.APPDATA || path.join(os.homedir(), '.config'), 'CageAI');
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
    this.filePath = path.join(this.dir, 'data.json');
    this.data = this.load();
  }

  getTodayString() {
    return new Date().toISOString().split('T')[0];
  }

  getDefaultData() {
    return {
      settings: {
        installed: false,
        installDate: null,
        termsAccepted: false,
        theme: 'dark',
        appVersion: '1.0.0'
      },
      updates: {
        currentVersion: '1.0.0',
        latestVersion: '1.0.0',
        minRequiredVersion: '1.0.0',
        forceUpdate: true,
        releaseNotes: 'CAGE AI 1.0.0 ilk kararlı sürüm.',
        downloadUrl: 'https://cage-ai.vercel.app',
        lastPublishedAt: new Date().toISOString()
      },
      currentUser: {
        id: 'user_default',
        username: 'PARADOX',
        email: 'paradox@cageai.internal',
        role: 'user',
        plan: 'free', // 'free', 'premium_ultra', 'codium_5_1_ultra'
        planExpireDate: null,
        promoCodesUsed: []
      },
      users: [
        {
          id: 'admin_root',
          username: 'cage_admin',
          email: 'admin@cageai.internal',
          role: 'admin',
          plan: 'codium_5_1_ultra',
          planExpireDate: '2099-12-31',
          createdAt: new Date().toISOString()
        },
        {
          id: 'user_default',
          username: 'PARADOX',
          email: 'paradox@cageai.internal',
          role: 'user',
          plan: 'free',
          planExpireDate: null,
          createdAt: new Date().toISOString()
        }
      ],
      promoCodes: [
        {
          id: 'promo_1',
          code: 'CAGEVIP',
          plan: 'codium_5_1_ultra',
          discountPct: 100,
          durationDays: 30,
          maxUses: 100,
          currentUses: 0,
          validUntil: '2028-12-31',
          description: '30 Günlük Cage Codium 5.1 Ultra Ücretsiz VIP Deneyimi'
        },
        {
          id: 'promo_2',
          code: 'PROMO2026',
          plan: 'premium_ultra',
          discountPct: 50,
          durationDays: 30,
          maxUses: 500,
          currentUses: 0,
          validUntil: '2027-12-31',
          description: '%50 İndirimli Premium & Codium Ultra Paketi'
        }
      ],
      tickets: [],
      safetyIncidents: [],
      sessions: {
        codium_free: {
          date: this.getTodayString(),
          dailySecondsUsed: 0, // Max 600s (10 min)
          active: false,
          activeStartTime: null,
          resetCountToday: 0, // Max 2
          lastResetTime: null
        },
        codium_ultra: {
          date: this.getTodayString(),
          sessionsUsed: 0, // Max 3
          active: false,
          sessionStartTime: null,
          remainingSeconds: 1800 // 30 min per session
        },
        codium_5_1: {
          date: this.getTodayString(),
          sessionsUsed: 0, // Max 5
          active: false,
          sessionStartTime: null,
          remainingSeconds: 3600 // 60 min per session
        }
      },
      chats: []
    };
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        const merged = { ...this.getDefaultData(), ...parsed };
        if (!merged.settings.appVersion) merged.settings.appVersion = '1.0.0';
        if (!merged.updates) merged.updates = this.getDefaultData().updates;
        return merged;
      }
    } catch (err) {
      console.error('Store load error:', err);
    }
    const def = this.getDefaultData();
    this.saveData(def);
    return def;
  }

  save() {
    this.saveData(this.data);
  }

  saveData(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Store save error:', err);
    }
  }

  // Session timer management & limits
  checkAndResetDailyQuotas() {
    const today = this.getTodayString();
    let changed = false;

    if (this.data.sessions.codium_free.date !== today) {
      this.data.sessions.codium_free = {
        date: today,
        dailySecondsUsed: 0,
        active: false,
        activeStartTime: null,
        resetCountToday: 0,
        lastResetTime: null
      };
      changed = true;
    }

    if (this.data.sessions.codium_ultra.date !== today) {
      this.data.sessions.codium_ultra = {
        date: today,
        sessionsUsed: 0,
        active: false,
        sessionStartTime: null,
        remainingSeconds: 1800
      };
      changed = true;
    }

    if (this.data.sessions.codium_5_1.date !== today) {
      this.data.sessions.codium_5_1 = {
        date: today,
        sessionsUsed: 0,
        active: false,
        sessionStartTime: null,
        remainingSeconds: 3600
      };
      changed = true;
    }

    if (changed) {
      this.save();
    }
  }

  // Reset Codium Free quota (Allowed 2 times a day with 2 hours between each reset)
  resetCodiumFreeQuota() {
    this.checkAndResetDailyQuotas();
    const session = this.data.sessions.codium_free;

    if (session.resetCountToday >= 2) {
      return { success: false, message: 'Günde en fazla 2 defa limit sıfırlayabilirsiniz. Bugün hakkınız doldu.' };
    }

    const now = Date.now();
    if (session.lastResetTime) {
      const elapsedHours = (now - session.lastResetTime) / (1000 * 60 * 60);
      if (elapsedHours < 2) {
        const remainingMinutes = Math.ceil((2 - elapsedHours) * 60);
        return {
          success: false,
          message: `Limit sıfırlamaları arasında en az 2 saat olmalıdır. Kalan süre: ${remainingMinutes} dakika.`
        };
      }
    }

    session.dailySecondsUsed = 0;
    session.active = false;
    session.resetCountToday += 1;
    session.lastResetTime = now;
    this.save();

    return {
      success: true,
      message: `Limit başarıyla sıfırlandı! Kalan sıfırlama hakkınız: ${2 - session.resetCountToday}`,
      session
    };
  }

  startSession(modelKey) {
    this.checkAndResetDailyQuotas();

    if (modelKey === 'codium_free') {
      const s = this.data.sessions.codium_free;
      if (s.dailySecondsUsed >= 600) {
        return { success: false, reason: 'QUOTA_EXCEEDED', message: 'Günlük 10 dakikalık Cage Codium Free süreniz doldu! 2 saatte bir sıfırlayabilir veya Codium Ultra paketine geçebilirsiniz.' };
      }
      s.active = true;
      s.activeStartTime = Date.now();
      this.save();
      return { success: true, remainingSeconds: 600 - s.dailySecondsUsed, session: s };
    }

    if (modelKey === 'codium_ultra') {
      const s = this.data.sessions.codium_ultra;
      if (!s.active) {
        if (s.sessionsUsed >= 3) {
          return { success: false, reason: 'SESSIONS_EXCEEDED', message: 'Günlük 3 oturum hakkınız doldu! Yarın tekrar kullanabilir veya Codium 5.1 Ultra modelini deneyebilirsiniz.' };
        }
        s.active = true;
        s.sessionsUsed += 1;
        s.sessionStartTime = Date.now();
        s.remainingSeconds = 1800; // 30 mins
      }
      this.save();
      return { success: true, remainingSeconds: s.remainingSeconds, session: s };
    }

    if (modelKey === 'codium_5_1') {
      const s = this.data.sessions.codium_5_1;
      if (!s.active) {
        if (s.sessionsUsed >= 5) {
          return { success: false, reason: 'SESSIONS_EXCEEDED', message: 'Günlük 5 oturum hakkınız doldu! Yarın 00:00 da oturumlarınız yenilenecektir.' };
        }
        s.active = true;
        s.sessionsUsed += 1;
        s.sessionStartTime = Date.now();
        s.remainingSeconds = 3600; // 60 mins
      }
      this.save();
      return { success: true, remainingSeconds: s.remainingSeconds, session: s };
    }

    return { success: true };
  }

  tickSession(modelKey, elapsedSeconds = 1) {
    this.checkAndResetDailyQuotas();

    if (modelKey === 'codium_free') {
      const s = this.data.sessions.codium_free;
      if (s.active) {
        s.dailySecondsUsed = Math.min(600, s.dailySecondsUsed + elapsedSeconds);
        if (s.dailySecondsUsed >= 600) {
          s.active = false;
        }
        this.save();
        return { active: s.active, remainingSeconds: Math.max(0, 600 - s.dailySecondsUsed), session: s };
      }
    }

    if (modelKey === 'codium_ultra') {
      const s = this.data.sessions.codium_ultra;
      if (s.active) {
        s.remainingSeconds = Math.max(0, s.remainingSeconds - elapsedSeconds);
        if (s.remainingSeconds <= 0) {
          s.active = false;
        }
        this.save();
        return { active: s.active, remainingSeconds: s.remainingSeconds, session: s };
      }
    }

    if (modelKey === 'codium_5_1') {
      const s = this.data.sessions.codium_5_1;
      if (s.active) {
        s.remainingSeconds = Math.max(0, s.remainingSeconds - elapsedSeconds);
        if (s.remainingSeconds <= 0) {
          s.active = false;
        }
        this.save();
        return { active: s.active, remainingSeconds: s.remainingSeconds, session: s };
      }
    }

    return null;
  }

  // Promo code redemption
  redeemPromoCode(code, userEmail) {
    const cleanCode = (code || '').trim().toUpperCase();
    const promo = this.data.promoCodes.find(p => p.code.toUpperCase() === cleanCode);

    if (!promo) {
      return { success: false, message: 'Geçersiz promosyon kodu.' };
    }

    if (promo.validUntil && new Date(promo.validUntil) < new Date()) {
      return { success: false, message: 'Bu promosyon kodunun süresi dolmuş.' };
    }

    if (promo.currentUses >= promo.maxUses) {
      return { success: false, message: 'Bu promosyon kodu maksimum kullanım limitine ulaşmış.' };
    }

    const user = this.data.currentUser;
    if (user.promoCodesUsed && user.promoCodesUsed.includes(cleanCode)) {
      return { success: false, message: 'Bu promosyon kodunu daha önce kullandınız.' };
    }

    promo.currentUses += 1;
    user.promoCodesUsed = user.promoCodesUsed || [];
    user.promoCodesUsed.push(cleanCode);

    // Apply plan upgrade
    if (promo.plan) {
      user.plan = promo.plan;
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + (promo.durationDays || 30));
      user.planExpireDate = expireDate.toISOString();
    }

    this.save();

    return {
      success: true,
      message: `Tebrikler! ${promo.description || promo.code} başarıyla hesabınıza uygulandı!`,
      user
    };
  }

  // Safety Incident logging
  logSafetyIncident(incident) {
    const item = {
      id: 'incident_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      userId: this.data.currentUser?.id || 'anon',
      userEmail: this.data.currentUser?.email || 'anon@cageai.internal',
      prompt: incident.prompt,
      model: incident.model,
      reason: incident.reason || 'Kritik zararlı/tehlikeli içerik veya siber saldırı tespiti',
      severity: incident.severity || 'HIGH',
      status: 'PENDING_REVIEW', // PENDING_REVIEW, RESOLVED, DISMISSED
      adminNotes: ''
    };

    this.data.safetyIncidents.unshift(item);
    // Keep max 200 incidents
    if (this.data.safetyIncidents.length > 200) {
      this.data.safetyIncidents.pop();
    }
    this.save();
    return item;
  }
}

module.exports = new Store();
