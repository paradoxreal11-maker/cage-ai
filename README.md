# ✦ CAGE AI Desktop & Ecosystem

CAGE AI; Claude zarafetinde karanlık arayüze sahip, otonom dosya yetkilendirmeli Codium kodlama ajanlarını, oturum sayaçlarını, şeffaf market mimarisini ve kurumsal güvenlik denetim katmanını bir araya getiren yeni nesil bir masaüstü yapay zeka ekosistemidir.

---

## 🚀 Hızlı Başlangıç

### 1. Kurulum Sihirbazını (Installer) Çalıştırma
Kullanıcı sözleşmesi, upuzun sorumluluk reddi maddeleri, kabul adımı ve kurulum ilerlemesini içeren sihirbazı başlatmak için:
```bash
# Doğrudan çift tıklayarak:
CAGE_AI_Kurucu.bat

# Veya terminalden:
npm run installer
```

### 2. CAGE AI Ana Uygulamasını Başlatma
```bash
# Doğrudan çift tıklayarak:
CAGE_AI_Baslat.bat

# Veya terminalden:
npm start
```

### 3. Resmi Web Sitesi & İndirme Portalını Açma
`cage-ai/website/index.html` dosyasını herhangi bir tarayıcıda açabilir veya çift tıklayabilirsiniz.
Modern hero alanı, model özellikleri, canlı yıllık %25 indirim hesaplayıcısı ve Windows `.exe` indirme butonunu içerir.

---

## 🤖 Yapay Zeka Modelleri ve Limit Kuralları

| Model Adı | Tür | Limit / Süre | Yetkiler & Kurallar |
| :--- | :--- | :--- | :--- |
| **Cage AI Free** | Sohbet | Sınırsız genel sohbet | Sadece sohbet içindir, kodlama yapamaz. Kod istendiğinde Codium'a yönlendirir. |
| **Cage Codium Free** | Kodlama | Günlük 10 Dakika | Kod yazabilir, dosya düzenleyebilir. Günde 2 defa (2 saat arayla) limit sıfırlanabilir. |
| **Cage AI Premium & Ultra** | Birleşik Paket | Sohbet: Sınırsız / Codium: 3x30 dk | Sohbet botu sınırsızdır (kod yazmaz). Codium ise günde 3 oturum (30'ar dk sayaçlı) sunar. |
| **Cage Codium 5.1 Ultra** | En Gelişmiş Ajan | Günde 5 Oturum x 60 Dakika | En üst seviye akıl yürütme, çoklu dosya refactoring ve otonom proje geliştirme. |

---

## 🛡️ Agent Dosya Erişim İzni Mimarisi
* Codium ajanları dosyaları okuyabilir, sıfırdan oluşturabilir veya üzerine yazabilir.
* Ancak herhangi bir işlem gerçekleştirilmeden önce kullanıcıya bir **Onay Penceresi** sunulur.
* Kullanıcı değişiklik içeriğini ve dosya yolunu görerek *"İzin Ver & Çalıştır (Sorumluluğu Kabul Ediyorum)"* veya *"Reddet"* kararı verir.
* Kullanıcı sözleşmesi gereğince tüm risk ve sorumluluk kullanıcıya aittir.

---

## 🛒 Market & Destek Talebiyle Satın Alma
* **Cage AI Premium & Cage Codium Ultra**: Aylık **$30 USD** (Yıllık alındığında %25 indirimle **$22.50 USD / Ay**)
* **Cage Codium 5.1 Ultra**: Aylık **$50 USD** (Yıllık alındığında %25 indirimle **$37.50 USD / Ay**)
* Satın alma işlemi uygulama içindeki **Destek Talebi (Ticket)** formu üzerinden iletilir.
* Admin panelinden tek tıkla onaylandığında paket kullanıcı hesabına anında tanımlanır.
* **Promosyon Kodları**: Admin tarafından tanımlanan kuponlar (Örn: `CAGEVIP`) Market ekranından girilerek anında aktive edilebilir.

---

## 🔑 Gizli Admin Bilgileri
* **Kullanıcı Adı:** `cage_admin`
* **Şifre:** `CageAdmin#2026!SecuredVault`
* *(Ayrıntılar için `ADMIN_KILAVUZU.md` dosyasına bakınız)*

---

## 📧 E-Posta OTP Girişi
* E-posta adresine 6 haneli güvenlik kodu gönderilir.
* Test modunda kod anında ekranda görüntülenir.
* Canlı SMTP bağlamak için `EMAIL_SMTP_REHBERI.md` dosyasındaki adımları takip edebilirsiniz.
