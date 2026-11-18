# CAGE AI — E-Posta ile Doğrulama (OTP) Kurulum ve Yapılandırma Rehberi

Bu rehber, CAGE AI uygulamasında kullanıcıların e-posta ile kayıt olurken ve giriş yaparken 6 haneli doğrulama kodlarını (OTP) e-postalarına nasıl alacaklarını adım adım açıklar.

---

## 1. Hazır Geliştirici / Test Modu (Hiçbir Ayar Yapmadan Hemen Test Edin)

CAGE AI içinde **akıllı bir test modu** yerleşiktir:
* Eğer henüz bir e-posta sunucusu (SMTP) bağlamadıysanız, sistem e-posta göndermeyi denemek yerine 6 haneli güvenlik kodunu **doğrudan giriş ekranındaki test kutucuğunda** ve uygulama loglarında gösterir.
* Bu sayede e-posta servisi bağlamadan anında kullanıcı hesabı açabilir ve giriş yapabilirsiniz.

---

## 2. Gerçek E-Posta Gönderimi Nasıl Bağlanır? (2 Dakikada Kurulum)

Kullanıcıların gerçek e-posta adreslerine şık HTML formatında doğrulama kodu göndermek için `.env` dosyasındaki SMTP alanlarını doldurmanız yeterlidir.

### Seçenek A: Gmail ile Ücretsiz Gönderim (En Kolay Yöntem)

Kendi Gmail hesabınızı kullanarak ayda binlerce e-posta doğrulama kodunu ücretsiz gönderebilirsiniz:

1. **Google Hesabınıza gidin**: [myaccount.google.com](https://myaccount.google.com/)
2. Sol menüden **Güvenlik** sekmesine tıklayın.
3. **2 Adımlı Doğrulama**'nın açık olduğundan emin olun.
4. Arama çubuğuna **Uygulama Şifreleri** (App Passwords) yazın veya [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) adresine gidin.
5. Bir ad verin (Örn: `Cage AI Mailer`) ve **Oluştur**'a basın.
6. Size verilen **16 haneli özel şifreyi** kopyalayın (Örn: `abcd efgh ijkl mnop`).
7. `cage-ai/.env` dosyasını açın ve şu şekilde doldurun:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=senin.epostan@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM="CAGE AI Güvenlik" <senin.epostan@gmail.com>
```

---

### Seçenek B: Brevo (Sendinblue) veya Resend (Profesyonel & Ücretsiz)

1. [Brevo.com](https://www.brevo.com) veya [Resend.com](https://resend.com)'a ücretsiz kaydolun (Günde 300 ücretsiz e-posta hakkı verir).
2. **SMTP & API** sekmesinden SMTP sunucu adresini, portunu ve şifrenizi kopyalayın.
3. `.env` dosyanıza yapıştırın:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=hesap-mailiniz@domain.com
SMTP_PASS=xsmtpsib-xxxxxxxxxxxxxxxxxxxx
SMTP_FROM="CAGE AI Auth" <noreply@cageai.internal>
```

---

## 3. Kodların Geçerlilik Kuralları

* **Süre**: Üretilen kodlar güvenlik sebebiyle **10 dakika** boyunca geçerlidir.
* **Deneme Limiti**: Art arda 5 hatalı deneme yapıldığında kod iptal edilir ve kullanıcının yeni kod istemesi gerekir.
* Kod onaylandığında kullanıcı otomatik olarak oturum açar ve kullanıcı veritabanına (`data.json`) kaydedilir.
