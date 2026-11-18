# 🛡️ CAGE AI — Gizli Admin (Yönetici) Kılavuzu ve Giriş Bilgileri

Bu belge ve içerisindeki giriş bilgileri **yalnızca sistem sahibine (size)** özeldir.

---

## 1. Gizli Admin Giriş Bilgileri

* **Yönetici Kullanıcı Adı:** `cage_admin`
* **Yönetici Şifresi:** `CageAdmin#2026!SecuredVault`

> **Güvenlik Notu:** Bu şifreyi değiştirmek isterseniz `cage-ai/.env` dosyasındaki `ADMIN_USERNAME` ve `ADMIN_PASSWORD` alanlarını dilediğiniz gibi güncelleyebilirsiniz.

---

## 2. Admin Paneline Nasıl Giriş Yapılır?

1. CAGE AI uygulamasını açın.
2. Sağ üstteki **Kullanıcı İkonuna** veya sol alttaki profil alanına tıklayın.
3. Açılan pencerenin en altındaki **"🛡️ Yönetici (Admin) Girişi"** bağlantısına tıklayın. (Veya sol menüdeki Admin rozetini kullanın).
4. Yukarıdaki kullanıcı adı ve şifreyi girip **"Yönetici Paneline Gir"** butonuna basın.

---

## 3. Admin Paneli Özellikleri

### 🚨 1. Tehlikeli Durumlar & Güvenlik Denetimi (Safety Incidents)
* Sistem; zararlı yazılım (malware, ransomware), siber saldırı kodları, yasadışı komutlar veya tehlikeli eylemler tespit ettiğinde otomatik bir **[GÜVENLİK BİLDİRİMİ]** oluşturur.
* Bu sohbetler doğrudan admin paneline düşer.
* Kullanıcı sözleşmesinde (Madde 6) bu durum peşinen kabul ettirilmiştir.
* Admin panelinden tehlikeli sohbetin **tam istemini, kullanıcısını, tarihini ve tespit nedenini** görebilir, denetleyebilir ve incelemeyi kapatabilirsiniz.

### 🎫 2. Satın Alım ve Destek Talepleri (Tickets)
* Kullanıcılar Market üzerinden paket seçip satın alma talebi açtıklarında talep buraya düşer.
* Ödeme yöntemi (Kripto, Havale vb.) ve kullanıcının notu listelenir.
* Admin tek tıkla **"Onayla & Paketi Yükselt"** butonuna bastığında kullanıcının hesabı anında seçilen pakete (`premium_ultra` veya `codium_5_1_ultra`) otomatik yükseltilir!

### 🎁 3. Promosyon Kodları Yönetimi
* Kullanıcılarınıza özel indirim veya ücretsiz VIP deneme kodları tanımlayabilirsiniz:
  * Kod adını yazın (Örn: `VIP2026`, `CAGE50`).
  * Paketi ve geçerlilik gün sayısını seçin.
  * **"Promosyon Kodunu Kaydet"** butonuna basın.
* Kullanıcılar bu kodu uygulamanın Market ekranında girerek anında paketlerini aktive edebilirler.

### 👥 4. Kullanıcı Veritabanı
* Kayıt olan tüm kullanıcıları, e-postalarını, rollerini ve mevcut abonelik paketlerini listeleyebilirsiniz.
