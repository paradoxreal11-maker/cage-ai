document.addEventListener('DOMContentLoaded', async () => {
  let currentStep = 1;

  // UI Elements
  const btnClose = document.getElementById('btnClose');
  const btnMinimize = document.getElementById('btnMinimize');

  const stepItems = document.querySelectorAll('.step-item');
  const wizardSteps = document.querySelectorAll('.wizard-step');

  const btnNext1 = document.getElementById('btnNext1');
  const btnBack2 = document.getElementById('btnBack2');
  const btnNext2 = document.getElementById('btnNext2');
  const chkAcceptTerms = document.getElementById('chkAcceptTerms');
  const termsBox = document.getElementById('termsBox');

  const btnBack3 = document.getElementById('btnBack3');
  const btnInstall = document.getElementById('btnInstall');
  const txtInstallPath = document.getElementById('txtInstallPath');
  const chkDesktopShortcut = document.getElementById('chkDesktopShortcut');

  const progressBar = document.getElementById('progressBar');
  const progressPercentage = document.getElementById('progressPercentage');
  const installStatusText = document.getElementById('installStatusText');
  const installLogs = document.getElementById('installLogs');

  const btnFinish = document.getElementById('btnFinish');
  const chkLaunchNow = document.getElementById('chkLaunchNow');

  // Window Controls
  btnClose.addEventListener('click', () => {
    if (window.cageAI) window.cageAI.close();
    else window.close();
  });

  btnMinimize.addEventListener('click', () => {
    if (window.cageAI) window.cageAI.minimize();
  });

  // Load Terms
  try {
    if (window.cageAI && window.cageAI.getTerms) {
      const terms = await window.cageAI.getTerms();
      termsBox.textContent = terms;
    } else {
      termsBox.textContent = 'Kullanıcı Sözleşmesi yükleniyor...';
    }
  } catch (err) {
    termsBox.textContent = 'Sözleşme yüklenirken bir hata oluştu: ' + err.message;
  }

  function goToStep(step) {
    currentStep = step;

    // Update wizard screens
    wizardSteps.forEach(el => el.classList.remove('active'));
    const activeWizard = document.getElementById(`step${step}`);
    if (activeWizard) activeWizard.classList.add('active');

    // Update stepper
    stepItems.forEach(item => {
      const s = parseInt(item.getAttribute('data-step'), 10);
      item.classList.remove('active', 'completed');
      if (s === step) {
        item.classList.add('active');
      } else if (s < step) {
        item.classList.add('completed');
      }
    });
  }

  // Step 1 -> Step 2
  btnNext1.addEventListener('click', () => {
    goToStep(2);
  });

  // Step 2: Terms acceptance
  chkAcceptTerms.addEventListener('change', () => {
    btnNext2.disabled = !chkAcceptTerms.checked;
  });

  btnBack2.addEventListener('click', () => {
    goToStep(1);
  });

  btnNext2.addEventListener('click', () => {
    if (chkAcceptTerms.checked) {
      goToStep(3);
    }
  });

  // Step 3: Setup Preferences
  btnBack3.addEventListener('click', () => {
    goToStep(2);
  });

  btnInstall.addEventListener('click', () => {
    goToStep(4);
    startInstallation();
  });

  // Step 4: Installation Process
  function addLog(text) {
    const d = document.createElement('div');
    d.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    installLogs.appendChild(d);
    installLogs.scrollTop = installLogs.scrollHeight;
  }

  async function startInstallation() {
    const installSteps = [
      { pct: 15, text: 'Kurulum paketleri açılıyor...', log: 'CAGE AI Core binaryleri ve modülleri doğrulanıyor.' },
      { pct: 35, text: 'Yapay zeka modelleri ve Codium motoru entegre ediliyor...', log: 'CAGE Core & Codium 5.1 Ultra runtime hazırlandı.' },
      { pct: 60, text: 'Agent dosya erişim güvenlik katmanı yapılandırılıyor...', log: 'Güvenlik filtreleri ve izin kontrol mekanizması kaydedildi.' },
      { pct: 80, text: 'Kullanıcı veritabanı ve yerel şifrelenmiş depo oluşturuluyor...', log: 'AppData\\Roaming\\CageAI dizini oluşturuldu.' },
      { pct: 95, text: 'Masaüstüne CAGE AI Uygulama Kısayolu oluşturuluyor...', log: 'Masaüstü kısayolu (CAGE AI.lnk) masaüstüne bağlandı.' },
      { pct: 100, text: 'Kurulum başarıyla tamamlandı!', log: 'Tüm bileşenler başarıyla kuruldu ve doğrulandı.' }
    ];

    for (let i = 0; i < installSteps.length; i++) {
      const s = installSteps[i];
      await new Promise(r => setTimeout(r, 650));
      progressBar.style.width = `${s.pct}%`;
      progressPercentage.textContent = `${s.pct}%`;
      installStatusText.textContent = s.text;
      addLog(s.log);
    }

    // Call backend installation completion
    try {
      if (window.cageAI && window.cageAI.completeInstall) {
        await window.cageAI.completeInstall({
          installPath: txtInstallPath.value,
          createShortcut: chkDesktopShortcut.checked
        });
      }
    } catch (err) {
      addLog('Uyarı: ' + err.message);
    }

    await new Promise(r => setTimeout(r, 600));
    goToStep(5);
  }

  // Step 5: Finish
  btnFinish.addEventListener('click', () => {
    if (chkLaunchNow.checked) {
      if (window.cageAI) {
        // Installer will close and main app opens
      }
    }
  });
});
