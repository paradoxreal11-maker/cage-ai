require('dotenv').config();
const store = require('./store');

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.primaryModel = 'gemini-3.5-flash';
    this.fallbackModel = 'gemini-3.1-flash-lite';
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  // Safety inspection: detects cyber attacks, malware, dangerous exploits, illegal activities
  inspectSafety(prompt) {
    const dangerousPatterns = [
      { regex: /(ransomware|keylogger|ddos attack|botnet saldırı|trojan virüs|rat virüsü|exploit payload|sql injection saldırı kodu|tersine mühendislik bypass|kimlik avı scripti|phishing klonlama|bomba yapımı|silah yapımı|kredi kartı çalma|cc dolandırıcılık)/i, reason: 'Yasadışı siber saldırı aracı, zararlı yazılım (malware) veya dolandırıcılık teşebbüsü', severity: 'CRITICAL' },
      { regex: /(hackleme|sistemi çökertme|şifre kırma scripti|brute force script|rat yapımı|darkweb uyuşturucu)/i, reason: 'Güvenlik ilkelerini ihlal eden saldırı ve zararlı komut isteği', severity: 'HIGH' }
    ];

    for (const item of dangerousPatterns) {
      if (item.regex.test(prompt)) {
        return { isDangerous: true, reason: item.reason, severity: item.severity };
      }
    }
    return { isDangerous: false };
  }

  isCodingRequest(prompt) {
    const codeKeywords = [
      'kod yaz', 'kodunu ver', 'script yaz', 'fonksiyon oluştur', 'function', 'def ', 'class ', 
      'html yaz', 'css yaz', 'javascript', 'python kodu', 'c# kodu', 'react kodu', 'sql query yaz',
      'hata ayıkla', 'debug et', 'dosya oluştur', 'dosyaya kaydet', 'dosyayı düzenle', 'algoritma yaz'
    ];
    const lower = prompt.toLowerCase();
    return codeKeywords.some(kw => lower.includes(kw));
  }

  detectAgentFileAction(prompt, responseText) {
    // Check if the prompt or response proposes creating/modifying a file
    const fileMatch = responseText.match(/```(?:file|write|create):([^\n\r]+)[\r\n]+([\s\S]*?)```/i) ||
                      responseText.match(/\[FILE_ACTION:\s*(READ|WRITE|MODIFY)\s*\|\s*PATH:\s*([^\s\|]+)(?:\s*\|\s*CONTENT:\s*([\s\S]*?))?\]/i);

    if (fileMatch) {
      if (fileMatch[1] && fileMatch[2] && !fileMatch[3]) {
        // Format 1: ```file:path ... ```
        return {
          requiresPermission: true,
          action: 'WRITE',
          filePath: fileMatch[1].trim(),
          content: fileMatch[2].trim()
        };
      } else {
        return {
          requiresPermission: true,
          action: fileMatch[1].toUpperCase(),
          filePath: fileMatch[2].trim(),
          content: fileMatch[3] ? fileMatch[3].trim() : ''
        };
      }
    }

    return null;
  }

  async generateResponse({ modelKey, userPrompt, history = [], userTier = 'free' }) {
    // 1. Safety Audit Check
    const safetyCheck = this.inspectSafety(userPrompt);
    let flaggedIncident = null;

    if (safetyCheck.isDangerous) {
      flaggedIncident = store.logSafetyIncident({
        prompt: userPrompt,
        model: modelKey,
        reason: safetyCheck.reason,
        severity: safetyCheck.severity
      });
      console.warn(`[GÜVENLİK ALARMI] Tehlikeli komut algılandı ve Admin'e bildirildi! ID: ${flaggedIncident.id}`);
    }

    // 2. Model Policy Enforcement
    if (modelKey === 'cage-ai-free') {
      if (this.isCodingRequest(userPrompt)) {
        return {
          text: `⚠️ **Model Kısıtlaması (Cage AI Free)**\n\nCage AI Free sürümü yalnızca genel sohbet, fikir üretimi ve metin danışmanlığı için tasarlanmıştır. **Bu model kodlama yapamaz ve kod üretemez.**\n\n* Kod yazmak, hata ayıklamak veya proje geliştirmek için lütfen aşağıdaki seçenekleri kullanın:\n  - **Cage Codium Free** (Her gün 10 dakika ücretsiz erişim, 2 saat arayla günde 2 kez sıfırlanabilir)\n  - **Cage Codium Ultra** veya **Cage Codium 5.1 Ultra** (Market sekmesinden hemen yükseltebilirsiniz).\n\nSohbet konusunu değiştirebilir veya başka bir genel soru sorabilirsiniz!`,
          isCodingRestricted: true,
          flaggedIncident
        };
      }
    }

    if (modelKey === 'cage-premium-ultra') {
      if (this.isCodingRequest(userPrompt)) {
        return {
          text: `ℹ️ **Cage AI Premium Bilgilendirmesi**\n\nCage AI Premium paketi ile sohbet botunuz sınırsızdır; ancak bu model sohbet odaklıdır ve kod yazmaz.\n\nKodlama yapmak için paketinizde yer alan **Cage Codium Ultra** (günde 3 adet 30 dakikalık tam donanımlı kodlama oturumu) modelini seçebilirsiniz!`,
          isCodingRestricted: true,
          flaggedIncident
        };
      }
    }

    // 3. Quota & Session Validation for Codium models
    if (modelKey === 'cage-codium-free') {
      const quotaCheck = store.startSession('codium_free');
      if (!quotaCheck.success) {
        return {
          text: `⏳ **Günlük Limit Doldu (Cage Codium Free)**\n\n${quotaCheck.message}\n\n💡 *İpucu:* Sol menüdeki Limit butonundan günde 2 defa (2 saat arayla) sürenizi sıfırlayabilir veya Market üzerinden Cage Codium Ultra paketine geçebilirsiniz.`,
          quotaExceeded: true,
          flaggedIncident
        };
      }
    }

    if (modelKey === 'cage-codium-ultra') {
      const quotaCheck = store.startSession('codium_ultra');
      if (!quotaCheck.success) {
        return {
          text: `🚫 **Günlük Oturum Limiti Doldu (Cage Codium Ultra)**\n\n${quotaCheck.message}\n\nDaha fazla oturum ve 60 dakikalık seanslar için **Cage Codium 5.1 Ultra** paketini inceleyebilirsiniz.`,
          quotaExceeded: true,
          flaggedIncident
        };
      }
    }

    if (modelKey === 'cage-codium-5-1-ultra') {
      const quotaCheck = store.startSession('codium_5_1');
      if (!quotaCheck.success) {
        return {
          text: `🚫 **Günlük Oturum Limiti Doldu (Cage Codium 5.1 Ultra)**\n\n${quotaCheck.message}`,
          quotaExceeded: true,
          flaggedIncident
        };
      }
    }

    // 4. System prompt according to model
    let systemInstruction = '';
    if (modelKey === 'cage-ai-free') {
      systemInstruction = `Sen CAGE AI Free yapay zeka asistanısın. Kullanıcıyla nazik, akıllı, yardımsever ve doğal bir Türkçe ile sohbet et. KESİNLİKLE kodlama yapma, kod blokları üretme. Kodlama istendiğinde Cage Codium modellerine yönlendir.`;
    } else if (modelKey === 'cage-premium-ultra') {
      systemInstruction = `Sen CAGE AI Premium asistanısın. Zeki, kapsamlı ve derin sohbet yeteneklerine sahipsin. Kod yazma; kod isteklerinde kullanıcının paketindeki Cage Codium Ultra modelini hatırlat.`;
    } else if (modelKey === 'cage-codium-free') {
      systemInstruction = `Sen CAGE Codium Free yapay zeka ve kodlama asistanısın. Kullanıcının kodlama, mimari ve yazılım sorularını titizlikle çöz. Eğer bir dosya oluşturmak veya değiştirmek istersen şu formatı kullan:\n\`\`\`file:DOSYA_YOLU\nDOSYA_ICERIGI\n\`\`\`\nKullanıcıdan önce onay isteneceğini unutma.`;
    } else if (modelKey === 'cage-codium-ultra') {
      systemInstruction = `Sen CAGE Codium Ultra profesyonel yazılım mühendisisin. Temiz mimari, performanslı kod, refactoring ve tam teşekküllü dosya operasyonları sunarsın. Dosya yazmak istediğinde:\n\`\`\`file:DOSYA_YOLU\nDOSYA_ICERIGI\n\`\`\` formatını kullan.`;
    } else if (modelKey === 'cage-codium-5-1-ultra') {
      systemInstruction = `Sen en gelişmiş otonom kodlama ajanı olan CAGE Codium 5.1 Ultra'sın. Karmaşık algoritmalar, hata ayıklama, uçtan uca dosya okuma/yazma/düzenleme operasyonları yapabilirsin. Dosya oluşturmak veya değiştirmek istediğinde:\n\`\`\`file:DOSYA_YOLU\nDOSYA_ICERIGI\n\`\`\` formatını kullan.`;
    }

    // Prepare contents
    const contents = [];
    // Convert history
    for (const msg of history.slice(-8)) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }

    // Add current user prompt with system instruction
    const fullUserText = `${systemInstruction ? `[SİSTEM TALİMATI: ${systemInstruction}]\n\n` : ''}${userPrompt}`;
    contents.push({
      role: 'user',
      parts: [{ text: fullUserText }]
    });

    // 5. Call API
    let rawText = '';
    try {
      rawText = await this.callGeminiAPI(this.primaryModel, contents);
    } catch (err) {
      console.warn(`Primary model ${this.primaryModel} failed: ${err.message}. Trying fallback ${this.fallbackModel}...`);
      try {
        rawText = await this.callGeminiAPI(this.fallbackModel, contents);
      } catch (err2) {
        throw new Error(`CAGE AI Bağlantı Hatası: ${err2.message}`);
      }
    }

    // 6. Check for Agent File Action
    const fileAction = this.detectAgentFileAction(userPrompt, rawText);

    let outputText = rawText;
    if (flaggedIncident) {
      outputText = `⚠️ **[GÜVENLİK BİLDİRİMİ]** *Bu sohbet girdisi güvenlik filtreleri tarafından denetim gerektiren durum olarak algılandı ve sistem yöneticisine (Admin) otomatik olarak raporlandı. (Referans No: ${flaggedIncident.id})*\n\n---\n\n` + outputText;
    }

    return {
      text: outputText,
      fileAction,
      flaggedIncident
    };
  }

  async callGeminiAPI(modelName, contents) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096
        }
      })
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || `HTTP ${response.status}`);
    }

    const candidate = data.candidates?.[0];
    if (!candidate || !candidate.content?.parts?.[0]?.text) {
      throw new Error('Yapay zeka yanıt üretemedi veya güvenlik filtresine takıldı.');
    }

    return candidate.content.parts[0].text;
  }
}

module.exports = new AIService();
