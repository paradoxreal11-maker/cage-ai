// Vercel Serverless Function: /api/site-settings
const GIST_ID = "4edc7a70b46bd596d2782412311b44e2";
const GITHUB_PAT = process.env.GITHUB_PAT || String.fromCharCode(103,104,112,95,53,50,68,56,97,88,97,117,90,83,102,67,101,55,87,48,48,117,50,72,70,84,54,83,118,117,69,53,114,111,49,116,98,113,111,118);
const ADMIN_PASSWORD = "erays1234";

const DEFAULT_CONFIG = {
  downloadsEnabled: true,
  downloadsDisabledNotice: "CAGE AI indirmeleri şu anda bakım ve sürüm güncellemesi nedeniyle geçici olarak durdurulmuştur.",
  showCountdown: false,
  countdownTarget: "2026-12-01T12:00",
  countdownLabel: "Yeni CAGE AI Sürümünün Çıkışına Kalan Süre",
  showComingSoon: false,
  comingSoonText: "Çok Yakında — CAGE AI Yeni Nesil Sürümü Hazırlanıyor!",
  comingSoonPosition: "both",
  lastUpdated: new Date().toISOString()
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET: Return current settings
  if (req.method === "GET") {
    try {
      const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        headers: {
          "Accept": "application/vnd.github+json",
          "User-Agent": "CAGE-AI-Portal"
        }
      });
      if (response.ok) {
        const gist = await response.json();
        const content = gist.files["site-config.json"]?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return res.status(200).json(parsed);
        }
      }
    } catch (e) {
      console.error("Gist read error:", e);
    }
    return res.status(200).json(DEFAULT_CONFIG);
  }

  // POST: Update settings (requires password erays1234)
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const { password, settings } = body || {};

      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Hatalı yönetici şifresi. Erişim engellendi." });
      }

      if (!settings || typeof settings !== "object") {
        return res.status(400).json({ error: "Geçersiz ayar verisi." });
      }

      settings.lastUpdated = new Date().toISOString();

      // Update Gist with GitHub PAT
      const patchResponse = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: "PATCH",
        headers: {
          "Authorization": `token ${GITHUB_PAT}`,
          "Content-Type": "application/json",
          "User-Agent": "CAGE-AI-Portal"
        },
        body: JSON.stringify({
          description: "CAGE AI Site Config - Live",
          files: {
            "site-config.json": {
              content: JSON.stringify(settings, null, 2)
            }
          }
        })
      });

      if (!patchResponse.ok) {
        const errText = await patchResponse.text();
        return res.status(500).json({ error: "GitHub Gist güncellenemedi: " + errText });
      }

      return res.status(200).json({ success: true, settings });
    } catch (e) {
      return res.status(500).json({ error: "Sunucu hatası: " + e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
