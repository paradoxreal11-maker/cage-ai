// Vercel Serverless Function: /api/download
const GIST_ID = "4edc7a70b46bd596d2782412311b44e2";

export default async function handler(req, res) {
  let downloadsEnabled = true;
  let notice = "CAGE AI indirmeleri şu anda bakım ve sürüm güncellemesi nedeniyle geçici olarak durdurulmuştur.";

  try {
    const response = await fetch(`https://gist.githubusercontent.com/paradoxreal11-maker/${GIST_ID}/raw/site-config.json?_t=${Date.now()}`);
    if (response.ok) {
      const config = await response.json();
      if (typeof config.downloadsEnabled === "boolean") {
        downloadsEnabled = config.downloadsEnabled;
      }
      if (config.downloadsDisabledNotice) {
        notice = config.downloadsDisabledNotice;
      }
    }
  } catch (err) {
    console.warn("Gist check error in download handler:", err);
  }

  // İndirmeler kapatıldıysa dosya indirmesini sunucu düzeyinde 403 Forbidden ile engelle
  if (!downloadsEnabled) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(403).send(`
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>İndirmeler Kapatıldı — CAGE AI</title>
        <style>
          body { background: #07090e; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
          .card { max-width: 440px; width: 100%; background: #0f141f; border: 1px solid rgba(244,63,94,0.4); border-radius: 16px; padding: 32px 24px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.7); }
          .icon { font-size: 36px; margin-bottom: 12px; }
          h2 { color: #fff; margin: 0 0 12px; font-size: 20px; }
          p { color: #cbd5e1; font-size: 14px; line-height: 1.5; margin: 0 0 24px; }
          a { display: inline-block; padding: 10px 24px; background: #f59e0b; color: #000; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">🔒</div>
          <h2>İndirmeler Geçici Olarak Kapalı</h2>
          <p>${notice}</p>
          <a href="/">Ana Sayfaya Dön</a>
        </div>
      </body>
      </html>
    `);
  }

  // İndirmeler açıksa dosyaya yönlendir
  res.writeHead(302, {
    Location: "/CAGE_AI_Setup.exe"
  });
  res.end();
}
