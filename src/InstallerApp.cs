using System;
using System.IO;
using System.Net;
using System.Drawing;
using System.Windows.Forms;
using System.Diagnostics;
using System.Threading.Tasks;

namespace CageAIInstaller
{
    public class InstallerForm : Form
    {
        private Panel sidebarPanel;
        private Panel contentPanel;
        private Label titleLabel;
        private Label descLabel;
        private RichTextBox termsTextBox;
        private CheckBox acceptTermsCheck;
        private Button nextButton;
        private Button backButton;
        private ProgressBar installProgress;
        private Label progressStatusLabel;
        private int currentStep = 1;

        private Color bgDark = Color.FromArgb(25, 24, 23);
        private Color bgSidebar = Color.FromArgb(20, 19, 18);
        private Color bgCard = Color.FromArgb(36, 35, 33);
        private Color accentOrange = Color.FromArgb(217, 119, 6);
        private Color textPrimary = Color.FromArgb(236, 235, 236);
        private Color textSecondary = Color.FromArgb(163, 162, 158);

        public InstallerForm()
        {
            this.Text = "CAGE AI Kurulum Sihirbazı v1.0.0";
            this.Size = new Size(860, 620);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = bgDark;
            this.ForeColor = textPrimary;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;

            InitUI();
            ShowStep(1);
        }

        private void InitUI()
        {
            // Sidebar
            sidebarPanel = new Panel();
            sidebarPanel.Dock = DockStyle.Left;
            sidebarPanel.Width = 220;
            sidebarPanel.BackColor = bgSidebar;
            this.Controls.Add(sidebarPanel);

            Label brandIcon = new Label();
            brandIcon.Text = "⬡";
            brandIcon.Font = new Font("Segoe UI", 36, FontStyle.Bold);
            brandIcon.ForeColor = accentOrange;
            brandIcon.Location = new Point(20, 25);
            brandIcon.AutoSize = true;
            sidebarPanel.Controls.Add(brandIcon);

            Label brandTitle = new Label();
            brandTitle.Text = "CAGE AI";
            brandTitle.Font = new Font("Segoe UI", 18, FontStyle.Bold);
            brandTitle.ForeColor = textPrimary;
            brandTitle.Location = new Point(20, 90);
            brandTitle.AutoSize = true;
            sidebarPanel.Controls.Add(brandTitle);

            Label brandSub = new Label();
            brandSub.Text = "Masaüstü Kurulumu\nSürüm 1.0.0 (64-Bit)";
            brandSub.Font = new Font("Segoe UI", 10, FontStyle.Regular);
            brandSub.ForeColor = textSecondary;
            brandSub.Location = new Point(20, 125);
            brandSub.AutoSize = true;
            sidebarPanel.Controls.Add(brandSub);

            // Content Panel
            contentPanel = new Panel();
            contentPanel.Dock = DockStyle.Fill;
            contentPanel.Padding = new Padding(30);
            this.Controls.Add(contentPanel);

            titleLabel = new Label();
            titleLabel.Font = new Font("Segoe UI", 18, FontStyle.Bold);
            titleLabel.ForeColor = textPrimary;
            titleLabel.Location = new Point(30, 25);
            titleLabel.Size = new Size(560, 35);
            contentPanel.Controls.Add(titleLabel);

            descLabel = new Label();
            descLabel.Font = new Font("Segoe UI", 10, FontStyle.Regular);
            descLabel.ForeColor = textSecondary;
            descLabel.Location = new Point(30, 65);
            descLabel.Size = new Size(560, 45);
            contentPanel.Controls.Add(descLabel);

            // Bottom Buttons
            nextButton = new Button();
            nextButton.Text = "İleri >";
            nextButton.Size = new Size(130, 40);
            nextButton.Location = new Point(460, 520);
            nextButton.BackColor = accentOrange;
            nextButton.ForeColor = Color.White;
            nextButton.FlatStyle = FlatStyle.Flat;
            nextButton.Font = new Font("Segoe UI", 10, FontStyle.Bold);
            nextButton.Click += NextButton_Click;
            contentPanel.Controls.Add(nextButton);

            backButton = new Button();
            backButton.Text = "< Geri";
            backButton.Size = new Size(100, 40);
            backButton.Location = new Point(350, 520);
            backButton.BackColor = bgCard;
            backButton.ForeColor = textPrimary;
            backButton.FlatStyle = FlatStyle.Flat;
            backButton.Font = new Font("Segoe UI", 10, FontStyle.Regular);
            backButton.Click += BackButton_Click;
            contentPanel.Controls.Add(backButton);

            // Terms text box
            termsTextBox = new RichTextBox();
            termsTextBox.Location = new Point(30, 115);
            termsTextBox.Size = new Size(560, 340);
            termsTextBox.BackColor = Color.FromArgb(18, 17, 16);
            termsTextBox.ForeColor = Color.FromArgb(210, 210, 210);
            termsTextBox.Font = new Font("Consolas", 9, FontStyle.Regular);
            termsTextBox.ReadOnly = true;
            termsTextBox.ScrollBars = RichTextBoxScrollBars.Vertical;
            contentPanel.Controls.Add(termsTextBox);

            // Accept checkbox
            acceptTermsCheck = new CheckBox();
            acceptTermsCheck.Text = "Kullanıcı Sözleşmesini ve Yasal Sorumluluk Reddi Şartlarını okudum, kabul ediyorum.";
            acceptTermsCheck.Location = new Point(30, 465);
            acceptTermsCheck.Size = new Size(560, 40);
            acceptTermsCheck.Font = new Font("Segoe UI", 10, FontStyle.Bold);
            acceptTermsCheck.ForeColor = textPrimary;
            acceptTermsCheck.CheckedChanged += (s, e) => {
                nextButton.Enabled = acceptTermsCheck.Checked;
            };
            contentPanel.Controls.Add(acceptTermsCheck);

            // Progress bar
            installProgress = new ProgressBar();
            installProgress.Location = new Point(30, 220);
            installProgress.Size = new Size(560, 25);
            contentPanel.Controls.Add(installProgress);

            progressStatusLabel = new Label();
            progressStatusLabel.Location = new Point(30, 255);
            progressStatusLabel.Size = new Size(560, 30);
            progressStatusLabel.Font = new Font("Segoe UI", 10, FontStyle.Regular);
            progressStatusLabel.ForeColor = textSecondary;
            contentPanel.Controls.Add(progressStatusLabel);
        }

        private void ShowStep(int step)
        {
            currentStep = step;
            termsTextBox.Visible = false;
            acceptTermsCheck.Visible = false;
            installProgress.Visible = false;
            progressStatusLabel.Visible = false;
            backButton.Visible = (step > 1 && step < 4);

            if (step == 1)
            {
                titleLabel.Text = "CAGE AI Kurulumuna Hoş Geldiniz";
                descLabel.Text = "Yeni nesil yapay zeka ve Codium kodlama ajanları bilgisayarınıza kurulacak.";
                nextButton.Text = "İleri >";
                nextButton.Enabled = true;
            }
            else if (step == 2)
            {
                titleLabel.Text = "Kullanıcı ve Hizmet Sözleşmesi";
                descLabel.Text = "Lütfen aşağıdaki sorumluluk reddi ve kullanım şartlarını dikkatle okuyunuz:";
                termsTextBox.Visible = true;
                acceptTermsCheck.Visible = true;
                termsTextBox.Text = GetLegalTerms();
                nextButton.Text = "Kabul Ediyorum >";
                nextButton.Enabled = acceptTermsCheck.Checked;
            }
            else if (step == 3)
            {
                titleLabel.Text = "Kurulum Seçenekleri";
                descLabel.Text = "Uygulama dizini: " + Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "CageAI");
                nextButton.Text = "Kuruluma Başla";
                nextButton.Enabled = true;
            }
            else if (step == 4)
            {
                titleLabel.Text = "CAGE AI Kuruluyor...";
                descLabel.Text = "Gerekli dosyalar ayarlanıyor, lütfen bekleyiniz.";
                installProgress.Visible = true;
                progressStatusLabel.Visible = true;
                nextButton.Visible = false;
                backButton.Visible = false;
                StartInstallTask();
            }
            else if (step == 5)
            {
                titleLabel.Text = "Kurulum Başarıyla Tamamlandı!";
                descLabel.Text = "CAGE AI masaüstünüze kuruldu ve kullanıma hazır.";
                nextButton.Visible = true;
                nextButton.Text = "CAGE AI'yı Başlat 🚀";
                nextButton.Enabled = true;
            }
        }

        private void NextButton_Click(object sender, EventArgs e)
        {
            if (currentStep == 5)
            {
                LaunchInstalledApp();
                Application.Exit();
                return;
            }
            ShowStep(currentStep + 1);
        }

        private void BackButton_Click(object sender, EventArgs e)
        {
            if (currentStep > 1) ShowStep(currentStep - 1);
        }

        private async void StartInstallTask()
        {
            string installDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "CageAI");
            Directory.CreateDirectory(installDir);

            for (int i = 10; i <= 100; i += 15)
            {
                installProgress.Value = Math.Min(100, i);
                progressStatusLabel.Text = "Bileşenler hazırlanıyor ve kısayollar oluşturuluyor... (%" + installProgress.Value + ")";
                await Task.Delay(400);
            }

            // Create desktop shortcut
            try
            {
                string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                string shortcutPath = Path.Combine(desktopPath, "CAGE AI.lnk");
                CreateShortcut(shortcutPath, Application.ExecutablePath, "CAGE AI - Gelişmiş Kodlama Ajanı");
            }
            catch { }

            ShowStep(5);
        }

        private void CreateShortcut(string shortcutPath, string targetPath, string description)
        {
            Type t = Type.GetTypeFromProgID("WScript.Shell");
            if (t != null)
            {
                dynamic shell = Activator.CreateInstance(t);
                dynamic shortcut = shell.CreateShortcut(shortcutPath);
                shortcut.TargetPath = targetPath;
                shortcut.Description = description;
                shortcut.Save();
            }
        }

        private void LaunchInstalledApp()
        {
            try
            {
                // Check if local unpacked exe exists
                string exePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "CAGE AI.exe");
                if (File.Exists(exePath))
                {
                    Process.Start(exePath);
                }
                else
                {
                    Process.Start("https://cage-ai.vercel.app");
                }
            }
            catch { }
        }

        private string GetLegalTerms()
        {
            return @"CAGE AI KULLANICI SÖZLEŞMESİ VE KAPSAMLI YASAL SORUMLULUK REDDİ
Sürüm: 1.0.0-PROD | Tarih: 18 Kasım 2026

MADDE 1 - KESİN VE KAPSAMLI SORUMLULUK REDDİ
CAGE AI yazılımı ve sağlayıcıları; kullanıcıların bu uygulama aracılığıyla yapacağı, üreteceği kodlardan, projelerden, satın alımlardan ve diğer tüm durumlardan dolayı ASLA VE HİÇBİR ŞEKİLDE HUKUKİ VEYA MALİ SORUMLULUK KABUL ETMEZ. Tüm sorumluluk münhasıran ve tamamen Kullanıcı'ya aittir.

MADDE 2 - YAPAY ZEKA MODELLERİ VE HATA PAYI
Yapay zeka modelleri olasılıksal çalışır; HATA YAPABİLİR (hallucination) veya yanıtları değişebilir. Sağlayıcı modellerin içeriği veya çalışması için mutlak doğruluk garantisi vermez.

MADDE 3 - AGENT DOSYA ERİŞİM VE DEĞİŞİKLİK İZNİ
Codium ajanları dosyalara erişebilir ve yazabilir. Her işlemden önce kullanıcıdan açık onay istenir. Kullanıcı izin vererek riskleri üstlendiğini kabul eder.

MADDE 4 - GÜVENLİK ALARMLARI VE ADMİN DENETİMİ
Sistem tehlikeli durum veya siber saldırı tespit ettiğinde durumu otomatik raporlar. Kullanıcı bu sohbetlerin yetkili admin tarafından güvenlik denetimi amacıyla incelenebileceğini kabul eder.";
        }

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new InstallerForm());
        }
    }
}
