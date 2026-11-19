// CAGE AI Desktop Application - Core Controller
// Full Code Studio Dual-Workspace, Mode Switcher & Streamlined Authentication

document.addEventListener('DOMContentLoaded', async () => {
  // Global Application State
  let storeData = null;
  let activeMode = 'chat'; // 'chat' | 'code'

  let currentChat = {
    id: 'chat_' + Date.now(),
    title: 'Yeni Sohbet',
    model: 'cage-ai-free',
    messages: []
  };

  let currentCodeChat = {
    id: 'code_' + Date.now(),
    title: 'Yeni Kodlama Projesi',
    model: 'cage-codium-free',
    messages: [],
    activeFile: 'script.js',
    codeContent: '// CAGE Codium Kodlama Çalışma Alanı\n\nfunction welcomeToCageCodium() {\n  console.log("CAGE Codium 5.1 Ultra Hazır.");\n}'
  };

  let currentChatModel = 'cage-ai-free';
  let currentCodeModel = 'cage-codium-free';
  let activeTimerInterval = null;
  let pendingFilePerm = null;
  let isYearlyBilling = false;

  // Header Elements
  const headerPlanPill = document.getElementById('headerPlanPill');
  const headerPlanName = document.getElementById('headerPlanName');
  const btnHeaderUpgrade = document.getElementById('btnHeaderUpgrade');
  const headerTimerPill = document.getElementById('headerTimerPill');
  const headerTimerText = document.getElementById('headerTimerText');
  const headerTimerInfo = document.getElementById('headerTimerInfo');
  const btnResetTimer = document.getElementById('btnResetTimer');

  const btnWinMinimize = document.getElementById('btnWinMinimize');
  const btnWinMaximize = document.getElementById('btnWinMaximize');
  const btnWinClose = document.getElementById('btnWinClose');

  // Mode Switcher Elements
  const btnModeChat = document.getElementById('btnModeChat');
  const btnModeCode = document.getElementById('btnModeCode');
  const navChatView = document.getElementById('navChatView');
  const navCodeView = document.getElementById('navCodeView');

  // Views
  const viewChat = document.getElementById('viewChat');
  const viewCodeStudio = document.getElementById('viewCodeStudio');

  // Sidebar Elements
  const btnToggleSidebar = document.getElementById('btnToggleSidebar');
  const appSidebar = document.getElementById('appSidebar');
  const btnNewChat = document.getElementById('btnNewChat');
  const btnNewChatText = document.getElementById('btnNewChatText');
  const historyLabel = document.getElementById('historyLabel');
  const chatHistoryList = document.getElementById('chatHistoryList');

  const navMarket = document.getElementById('navMarket');
  const navTickets = document.getElementById('navTickets');
  const btnUserProfile = document.getElementById('btnUserProfile');
  const userNameLabel = document.getElementById('userNameLabel');
  const userPlanTag = document.getElementById('userPlanTag');
  const userAvatar = document.getElementById('userAvatar');

  // Floating Popover Menu Elements (Örnek Panel Birebir Entegrasyon)
  const userPopoverMenu = document.getElementById('userPopoverMenu');
  const popoverUserEmail = document.getElementById('popoverUserEmail');
  const popoverPlanBadge = document.getElementById('popoverPlanBadge');
  const menuItemSettings = document.getElementById('menuItemSettings');
  const menuItemLanguage = document.getElementById('menuItemLanguage');
  const menuItemHelp = document.getElementById('menuItemHelp');
  const menuItemAbout = document.getElementById('menuItemAbout');
  const menuItemUpgrade = document.getElementById('menuItemUpgrade');
  const menuItemExtensions = document.getElementById('menuItemExtensions');
  const menuItemAuthAction = document.getElementById('menuItemAuthAction');
  const popoverAuthIcon = document.getElementById('popoverAuthIcon');
  const popoverAuthText = document.getElementById('popoverAuthText');

  // Hukuk & Şeffaflık Modalı Elemanları
  const aboutLegalModal = document.getElementById('aboutLegalModal');
  const btnCloseAboutLegal = document.getElementById('btnCloseAboutLegal');
  const txtStaticUsername = document.getElementById('txtStaticUsername');
  const txtUpdateNickname = document.getElementById('txtUpdateNickname');
  const btnSaveNickname = document.getElementById('btnSaveNickname');

  // Chat Mode View Elements
  const welcomeContainerChat = document.getElementById('welcomeContainerChat');
  const messagesContainerChat = document.getElementById('messagesContainerChat');
  const promptInputChat = document.getElementById('promptInputChat');
  const btnSendChat = document.getElementById('btnSendChat');
  const btnAttachmentChat = document.getElementById('btnAttachmentChat');
  const chatAttachmentArea = document.getElementById('chatAttachmentArea');
  const inputChatFile = document.getElementById('inputChatFile');
  const btnModelSelectChat = document.getElementById('btnModelSelectChat');
  const modelDropdownChat = document.getElementById('modelDropdownChat');
  const selectedModelLabelChat = document.getElementById('selectedModelLabelChat');

  // Code Studio View Elements
  const messagesContainerCode = document.getElementById('messagesContainerCode');
  const promptInputCode = document.getElementById('promptInputCode');
  const btnSendCode = document.getElementById('btnSendCode');
  const btnAttachmentCode = document.getElementById('btnAttachmentCode');
  const codeAttachmentArea = document.getElementById('codeAttachmentArea');
  const inputCodeFile = document.getElementById('inputCodeFile');
  const btnModelSelectCode = document.getElementById('btnModelSelectCode');
  const modelDropdownCode = document.getElementById('modelDropdownCode');
  const selectedModelLabelCode = document.getElementById('selectedModelLabelCode');

  // Code Studio Right Panel (Live Editor / Preview & Admin File Operations)
  const activeFileTitle = document.getElementById('activeFileTitle');
  const codeStudioView = document.getElementById('codeStudioView');
  const btnOpenFile = document.getElementById('btnOpenFile');
  const btnOpenFolder = document.getElementById('btnOpenFolder');
  const btnCopyCodeStudio = document.getElementById('btnCopyCodeStudio');
  const btnSaveToFile = document.getElementById('btnSaveToFile');
  const btnRunCodeOnPC = document.getElementById('btnRunCodeOnPC');
  const lblActiveFullPath = document.getElementById('lblActiveFullPath');

  // Attachments State (Görsel ve Dosya Yüklemeleri / Yapıştırmaları)
  let chatAttachments = [];
  let codeAttachments = [];
  const headerAdminPill = document.getElementById('headerAdminPill');
  const headerAdminDot = document.getElementById('headerAdminDot');
  const headerAdminText = document.getElementById('headerAdminText');

  // Modals
  const marketModal = document.getElementById('marketModal');
  const btnCloseMarket = document.getElementById('btnCloseMarket');
  const billingCycleToggle = document.getElementById('billingCycleToggle');
  const pricePkg1 = document.getElementById('pricePkg1');
  const pricePkg2 = document.getElementById('pricePkg2');
  const annualNote1 = document.getElementById('annualNote1');
  const annualNote2 = document.getElementById('annualNote2');
  const txtPromoCode = document.getElementById('txtPromoCode');
  const btnApplyPromo = document.getElementById('btnApplyPromo');
  const promoResultMsg = document.getElementById('promoResultMsg');

  const ticketModal = document.getElementById('ticketModal');
  const btnCloseTicket = document.getElementById('btnCloseTicket');
  const tabCreateTicket = document.getElementById('tabCreateTicket');
  const tabMyTickets = document.getElementById('tabMyTickets');
  const ticketCreateView = document.getElementById('ticketCreateView');
  const ticketHistoryView = document.getElementById('ticketHistoryView');
  const lblMyTicketsCount = document.getElementById('lblMyTicketsCount');
  const lblHistoryTotalBadge = document.getElementById('lblHistoryTotalBadge');
  const myTicketsList = document.getElementById('myTicketsList');
  const ticketCategoriesGrid = document.getElementById('ticketCategoriesGrid');
  const txtSelectedCategory = document.getElementById('txtSelectedCategory');
  const ticketPackageBox = document.getElementById('ticketPackageBox');
  const txtTicketPackage = document.getElementById('txtTicketPackage');
  const txtTicketPrice = document.getElementById('txtTicketPrice');
  const selPaymentMethod = document.getElementById('selPaymentMethod');
  const txtTicketEmail = document.getElementById('txtTicketEmail');
  const txtSelectedPriority = document.getElementById('txtSelectedPriority');
  const txtTicketSubject = document.getElementById('txtTicketSubject');
  const txtTicketNotes = document.getElementById('txtTicketNotes');
  const btnSubmitTicket = document.getElementById('btnSubmitTicket');

  const filePermissionModal = document.getElementById('filePermissionModal');
  const permActionType = document.getElementById('permActionType');
  const permFilePath = document.getElementById('permFilePath');
  const permFileContent = document.getElementById('permFileContent');
  const btnApproveFilePerm = document.getElementById('btnApproveFilePerm');
  const btnRejectFilePerm = document.getElementById('btnRejectFilePerm');

  // Auth Modal Elements (No OTP - Email + Username + Password)
  const authModal = document.getElementById('authModal');
  const btnCloseAuth = document.getElementById('btnCloseAuth');
  const btnAuthTrigger = document.getElementById('btnAuthTrigger');
  const tabAuthLogin = document.getElementById('tabAuthLogin');
  const tabAuthRegister = document.getElementById('tabAuthRegister');
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');
  const txtLoginEmail = document.getElementById('txtLoginEmail');
  const txtLoginPassword = document.getElementById('txtLoginPassword');
  const btnDoLogin = document.getElementById('btnDoLogin');
  const txtRegUsername = document.getElementById('txtRegUsername');
  const txtRegEmail = document.getElementById('txtRegEmail');
  const txtRegPassword = document.getElementById('txtRegPassword');
  const btnDoRegister = document.getElementById('btnDoRegister');

  // Force Update Modal Elements
  const forceUpdateModal = document.getElementById('forceUpdateModal');
  const lblUpdateNewVersion = document.getElementById('lblUpdateNewVersion');
  const lblUpdateCurrentVersion = document.getElementById('lblUpdateCurrentVersion');
  const lblUpdateChangelog = document.getElementById('lblUpdateChangelog');
  const btnStartAutoUpdate = document.getElementById('btnStartAutoUpdate');
  const updateProgressArea = document.getElementById('updateProgressArea');
  const updateDownloadBar = document.getElementById('updateDownloadBar');
  const lblUpdateDownloadStatus = document.getElementById('lblUpdateDownloadStatus');
  const lblUpdateDownloadPct = document.getElementById('lblUpdateDownloadPct');

  // Splash & Toast Elements
  const splashScreen = document.getElementById('splashScreen');
  const splashStatusText = document.getElementById('splashStatusText');
  const splashProgressBar = document.getElementById('splashProgressBar');
  const splashPercentage = document.getElementById('splashPercentage');

  const appToast = document.getElementById('appToast');
  const toastIcon = document.getElementById('toastIcon');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimer = null;

  function showToast(message, isError = false) {
    if (!appToast || !toastMsg) return;
    toastMsg.textContent = message;
    if (toastIcon) {
      toastIcon.textContent = isError ? '⚠️' : '✓';
      toastIcon.style.color = isError ? '#ef4444' : '#10b981';
    }
    appToast.style.borderColor = isError ? '#ef4444' : '#d97706';
    appToast.classList.remove('hidden');
    
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      appToast.classList.add('hidden');
    }, 3200);
  }

  // Account Settings Modal Elements
  const accountSettingsModal = document.getElementById('accountSettingsModal');
  const btnCloseAccountSettings = document.getElementById('btnCloseAccountSettings');
  const accountLargeAvatar = document.getElementById('accountLargeAvatar');
  const accountDisplayUsername = document.getElementById('accountDisplayUsername');
  const accountDisplayEmail = document.getElementById('accountDisplayEmail');
  const accountDisplayRole = document.getElementById('accountDisplayRole');
  const accountPlanLabel = document.getElementById('accountPlanLabel');
  const accountCodiumQuota = document.getElementById('accountCodiumQuota');
  const btnSettingsUpgradePlan = document.getElementById('btnSettingsUpgradePlan');
  const txtUpdateUsername = document.getElementById('txtUpdateUsername');
  const btnSaveUsername = document.getElementById('btnSaveUsername');
  const txtUpdatePassword = document.getElementById('txtUpdatePassword');
  const btnSavePassword = document.getElementById('btnSavePassword');
  const btnLogoutUser = document.getElementById('btnLogoutUser');

  function focusActiveInput() {
    setTimeout(() => {
      if (activeMode === 'chat') {
        promptInputChat?.focus();
      } else {
        promptInputCode?.focus();
      }
    }, 60);
  }

  // Window Controls
  btnWinMinimize.addEventListener('click', () => window.cageAI?.minimize());
  btnWinMaximize.addEventListener('click', () => window.cageAI?.maximize());
  btnWinClose.addEventListener('click', () => window.cageAI?.close());

  // Toggle Sidebar
  btnToggleSidebar.addEventListener('click', () => {
    appSidebar.classList.toggle('collapsed');
  });

  // Switch Active Mode (💬 Sohbet vs ⚡ Kod Stüdyosu)
  function switchMode(mode) {
    activeMode = mode;
    if (mode === 'chat') {
      btnModeChat.classList.add('active');
      btnModeCode.classList.remove('active');
      navChatView.classList.add('active');
      navCodeView.classList.remove('active');

      viewChat.classList.remove('hidden');
      viewCodeStudio.classList.add('hidden');

      historyLabel.textContent = 'Geçmiş Sohbetler';
      btnNewChatText.textContent = 'Yeni Sohbet';

      loadChatHistory();
      updateTimerDisplay();
    } else {
      btnModeCode.classList.add('active');
      btnModeChat.classList.remove('active');
      navCodeView.classList.add('active');
      navChatView.classList.remove('active');

      viewCodeStudio.classList.remove('hidden');
      viewChat.classList.add('hidden');

      historyLabel.textContent = 'Kodlama Projeleri';
      btnNewChatText.textContent = 'Yeni Kodlama Projesi';

      loadCodeChatHistory();
      updateTimerDisplay();
    }
  }

  btnModeChat.addEventListener('click', () => switchMode('chat'));
  btnModeCode.addEventListener('click', () => switchMode('code'));
  navChatView.addEventListener('click', () => switchMode('chat'));
  navCodeView.addEventListener('click', () => switchMode('code'));

  // Load Initial Store Data & User Info
  async function refreshStoreData() {
    if (!window.cageAI) return;
    storeData = await window.cageAI.getStoreData();

    // User Profile Display (Nickname öncelikli, yoksa Kullanıcı adı)
    const u = storeData.currentUser || {};
    const displayName = u.nickname || ((u.username && u.username !== 'PARADOX') ? u.username : 'Kullanıcı');
    userNameLabel.textContent = displayName;
    userAvatar.textContent = displayName.charAt(0).toUpperCase();

    // Plan Title Display
    let planTitle = 'Free plan';
    if (u.plan === 'premium_ultra') planTitle = 'Premium & Ultra';
    else if (u.plan === 'codium_5_1_ultra') planTitle = 'Codium 5.1 Ultra';

    headerPlanName.textContent = planTitle;
    userPlanTag.textContent = `• ${planTitle}`;

    updateTimerDisplay();
  }

  // Timer & Session Logic
  function updateTimerDisplay() {
    if (!storeData) return;

    const targetModel = activeMode === 'code' ? currentCodeModel : currentChatModel;

    if (targetModel === 'cage-codium-free') {
      headerTimerPill.classList.remove('hidden');
      btnResetTimer.classList.remove('hidden');
      const freeSession = storeData.sessions?.codium_free || {};
      const remainingSec = Math.max(0, 600 - (freeSession.dailySecondsUsed || 0));
      headerTimerText.textContent = formatTime(remainingSec);
      headerTimerInfo.textContent = `(Kalan Günlük Süre / Sıfırlama: ${2 - (freeSession.resetCountToday || 0)}/2)`;
      startTimerTick('codium_free');
    } else if (targetModel === 'cage-codium-ultra') {
      headerTimerPill.classList.remove('hidden');
      btnResetTimer.classList.add('hidden');
      const ultraSession = storeData.sessions?.codium_ultra || {};
      headerTimerText.textContent = formatTime(ultraSession.remainingSeconds || 1800);
      headerTimerInfo.textContent = `(Oturum: ${(ultraSession.sessionsUsed || 0)}/3)`;
      startTimerTick('codium_ultra');
    } else if (targetModel === 'cage-codium-5-1-ultra') {
      headerTimerPill.classList.remove('hidden');
      btnResetTimer.classList.add('hidden');
      const s51 = storeData.sessions?.codium_5_1 || {};
      headerTimerText.textContent = formatTime(s51.remainingSeconds || 3600);
      headerTimerInfo.textContent = `(Oturum: ${(s51.sessionsUsed || 0)}/5)`;
      startTimerTick('codium_5_1');
    } else {
      headerTimerPill.classList.add('hidden');
      if (activeTimerInterval) {
        clearInterval(activeTimerInterval);
        activeTimerInterval = null;
      }
    }
  }

  function startTimerTick(modelKey) {
    if (activeTimerInterval) clearInterval(activeTimerInterval);
    activeTimerInterval = setInterval(async () => {
      if (!window.cageAI) return;
      const tickRes = await window.cageAI.tickSession(modelKey, 1);
      if (tickRes && tickRes.remainingSeconds !== undefined) {
        headerTimerText.textContent = formatTime(tickRes.remainingSeconds);
        if (tickRes.remainingSeconds <= 0) {
          clearInterval(activeTimerInterval);
          alert('Codium oturum süreniz sona erdi! Kota yenilemek veya yükseltmek için Market sekmesini ziyaret edin.');
        }
      }
    }, 1000);
  }

  function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Reset Codium Free Quota
  btnResetTimer.addEventListener('click', async () => {
    if (!window.cageAI) return;
    const res = await window.cageAI.resetCodiumFreeQuota();
    alert(res.message);
    await refreshStoreData();
  });

  // Model Selector: Chat Mode
  btnModelSelectChat.addEventListener('click', (e) => {
    e.stopPropagation();
    modelDropdownChat.classList.toggle('hidden');
  });

  modelDropdownChat.querySelectorAll('.model-option').forEach(opt => {
    opt.addEventListener('click', () => {
      modelDropdownChat.querySelectorAll('.model-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');

      currentChatModel = opt.getAttribute('data-model');
      const label = opt.getAttribute('data-label');
      const badge = opt.getAttribute('data-badge');

      selectedModelLabelChat.textContent = label;
      btnModelSelectChat.querySelector('.model-badge').textContent = badge;
      modelDropdownChat.classList.add('hidden');
      updateTimerDisplay();
    });
  });

  // Model Selector: Code Mode
  btnModelSelectCode.addEventListener('click', (e) => {
    e.stopPropagation();
    modelDropdownCode.classList.toggle('hidden');
  });

  modelDropdownCode.querySelectorAll('.model-option').forEach(opt => {
    opt.addEventListener('click', () => {
      modelDropdownCode.querySelectorAll('.model-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');

      currentCodeModel = opt.getAttribute('data-model');
      const label = opt.getAttribute('data-label');
      const badge = opt.getAttribute('data-badge');

      selectedModelLabelCode.textContent = label;
      btnModelSelectCode.querySelector('.model-badge').textContent = badge;
      modelDropdownCode.classList.add('hidden');
      updateTimerDisplay();
    });
  });

  document.addEventListener('click', () => {
    modelDropdownChat.classList.add('hidden');
    modelDropdownCode.classList.add('hidden');
  });

  // CHAT HISTORY & PERSISTENCE (Chat Mode)
  async function loadChatHistory() {
    if (!window.cageAI) return;
    const chats = await window.cageAI.getChats();
    chatHistoryList.innerHTML = '';

    chats.forEach(chat => {
      const item = document.createElement('div');
      item.className = 'history-item' + (chat.id === currentChat.id ? ' active' : '');
      item.innerHTML = `
        <span class="chat-title-text">${escapeHtml(chat.title || 'Sohbet')}</span>
        <button class="history-del-btn" title="Sil">✕</button>
      `;

      item.querySelector('.chat-title-text').addEventListener('click', () => {
        loadChatSession(chat);
      });

      item.querySelector('.history-del-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        await window.cageAI.deleteChat(chat.id);
        await loadChatHistory();
        if (currentChat.id === chat.id) {
          startNewChat();
        }
      });

      chatHistoryList.appendChild(item);
    });
  }

  function loadChatSession(chat) {
    currentChat = chat;
    currentChatModel = chat.model || 'cage-ai-free';
    welcomeContainerChat.classList.add('hidden');
    messagesContainerChat.classList.remove('hidden');
    messagesContainerChat.innerHTML = '';

    chat.messages.forEach(msg => {
      renderChatMessageBubble(msg.role, msg.content, msg.flagged);
    });

    messagesContainerChat.scrollTop = messagesContainerChat.scrollHeight;
    loadChatHistory();
  }

  function startNewChat() {
    currentChat = {
      id: 'chat_' + Date.now(),
      title: 'Yeni Sohbet',
      model: currentChatModel,
      messages: []
    };
    welcomeContainerChat.classList.remove('hidden');
    messagesContainerChat.classList.add('hidden');
    messagesContainerChat.innerHTML = '';
    promptInputChat.value = '';
    loadChatHistory();
  }

  // CODE CHAT HISTORY & PERSISTENCE (Code Studio Mode)
  async function loadCodeChatHistory() {
    if (!window.cageAI) return;
    const codeChats = await window.cageAI.getCodeChats();
    chatHistoryList.innerHTML = '';

    codeChats.forEach(chat => {
      const item = document.createElement('div');
      item.className = 'history-item' + (chat.id === currentCodeChat.id ? ' active' : '');
      item.innerHTML = `
        <span class="chat-title-text">⚡ ${escapeHtml(chat.title || 'Kodlama Projesi')}</span>
        <button class="history-del-btn" title="Sil">✕</button>
      `;

      item.querySelector('.chat-title-text').addEventListener('click', () => {
        loadCodeChatSession(chat);
      });

      item.querySelector('.history-del-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        await window.cageAI.deleteCodeChat(chat.id);
        await loadCodeChatHistory();
        if (currentCodeChat.id === chat.id) {
          startNewCodeChat();
        }
      });

      chatHistoryList.appendChild(item);
    });
  }

  function loadCodeChatSession(chat) {
    currentCodeChat = chat;
    currentCodeModel = chat.model || 'cage-codium-free';
    messagesContainerCode.innerHTML = '';

    chat.messages.forEach(msg => {
      renderCodeMessageBubble(msg.role, msg.content, msg.flagged);
    });

    if (chat.codeContent !== undefined) {
      codeStudioView.value = chat.codeContent;
      activeFileTitle.textContent = chat.activeFile || 'script.js';
      if (lblActiveFullPath) {
        lblActiveFullPath.textContent = chat.activePath || 'Yerel Bellek / ' + (chat.activeFile || 'script.js');
      }
    }

    messagesContainerCode.scrollTop = messagesContainerCode.scrollHeight;
    loadCodeChatHistory();
  }

  function startNewCodeChat() {
    currentCodeChat = {
      id: 'code_' + Date.now(),
      title: 'Yeni Kodlama Projesi',
      model: currentCodeModel,
      messages: [],
      activeFile: 'script.js',
      activePath: null,
      codeContent: '// CAGE Codium Kodlama Çalışma Alanı\n\nfunction welcomeToCageCodium() {\n  console.log("CAGE Codium 5.1 Ultra Hazır.");\n}'
    };

    messagesContainerCode.innerHTML = `
      <div class="code-welcome-banner">
        <span class="banner-icon">⚡</span>
        <h3>Codium Kodlama Çalışma Alanı</h3>
        <p>Ajanlara dosya oluşturma, refactoring, hata ayıklama ve mimari kod yazma görevleri verin.</p>
      </div>
    `;

    codeStudioView.value = currentCodeChat.codeContent;
    activeFileTitle.textContent = currentCodeChat.activeFile;
    if (lblActiveFullPath) {
      lblActiveFullPath.textContent = 'Yerel Bellek / Yeni Dosya';
    }
    promptInputCode.value = '';
    loadCodeChatHistory();
  }

  // Sidebar "Yeni Sohbet / Yeni Proje" Button Action
  btnNewChat.addEventListener('click', () => {
    if (activeMode === 'chat') {
      startNewChat();
    } else {
      startNewCodeChat();
    }
  });

  // ATTACHMENT HANDLING FUNCTIONS (Görsel ve Dosya Yükleme / Yapıştırma / Önizleme)
  function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function renderAttachmentsUI(mode = 'chat') {
    const list = mode === 'chat' ? chatAttachments : codeAttachments;
    const container = mode === 'chat' ? chatAttachmentArea : codeAttachmentArea;
    if (!container) return;

    if (list.length === 0) {
      container.classList.add('hidden');
      container.innerHTML = '';
      return;
    }

    container.classList.remove('hidden');
    container.innerHTML = list.map((item, idx) => {
      if (item.type === 'image') {
        return `
          <div class="attached-item-card">
            <img src="${item.dataUrl}" class="attached-img-thumb" alt="${escapeHtml(item.name)}" />
            <div class="attached-info">
              <strong title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</strong>
              <small>${item.size} • Görsel</small>
            </div>
            <button class="btn-remove-attachment" data-idx="${idx}" data-mode="${mode}">✕</button>
          </div>
        `;
      } else {
        return `
          <div class="attached-item-card">
            <span style="font-size: 22px;">📁</span>
            <div class="attached-info">
              <strong title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</strong>
              <small>${item.size} • Dosya</small>
            </div>
            <button class="btn-remove-attachment" data-idx="${idx}" data-mode="${mode}">✕</button>
          </div>
        `;
      }
    }).join('');

    container.querySelectorAll('.btn-remove-attachment').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.getAttribute('data-idx'));
        const m = btn.getAttribute('data-mode');
        if (m === 'chat') {
          chatAttachments.splice(i, 1);
          renderAttachmentsUI('chat');
        } else {
          codeAttachments.splice(i, 1);
          renderAttachmentsUI('code');
        }
      });
    });
  }

  function handleFilesSelected(files, mode = 'chat') {
    if (!files || !files.length) return;
    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();
      if (isImage) {
        reader.onload = (e) => {
          const item = {
            name: file.name || 'görsel.png',
            size: formatFileSize(file.size),
            type: 'image',
            dataUrl: e.target.result
          };
          if (mode === 'chat') {
            chatAttachments.push(item);
            renderAttachmentsUI('chat');
          } else {
            codeAttachments.push(item);
            renderAttachmentsUI('code');
          }
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (e) => {
          const item = {
            name: file.name || 'dosya.txt',
            size: formatFileSize(file.size),
            type: 'file',
            content: e.target.result
          };
          if (mode === 'chat') {
            chatAttachments.push(item);
            renderAttachmentsUI('chat');
          } else {
            codeAttachments.push(item);
            renderAttachmentsUI('code');
          }
        };
        reader.readAsText(file);
      }
    });
  }

  function handlePasteEvent(e, mode = 'chat') {
    if (!e.clipboardData || !e.clipboardData.items) return;
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleFilesSelected([file], mode);
          showToast('📷 Fotoğraf panodan yapıştırıldı ve eklendi!');
          return;
        }
      }
    }
  }

  if (inputChatFile) {
    inputChatFile.addEventListener('change', (e) => {
      handleFilesSelected(e.target.files, 'chat');
      inputChatFile.value = '';
    });
  }

  if (inputCodeFile) {
    inputCodeFile.addEventListener('change', (e) => {
      handleFilesSelected(e.target.files, 'code');
      inputCodeFile.value = '';
    });
  }

  if (btnAttachmentChat && inputChatFile) {
    btnAttachmentChat.addEventListener('click', () => inputChatFile.click());
  }

  if (btnAttachmentCode && inputCodeFile) {
    btnAttachmentCode.addEventListener('click', () => inputCodeFile.click());
  }

  if (promptInputChat) {
    promptInputChat.addEventListener('paste', (e) => handlePasteEvent(e, 'chat'));
  }

  if (promptInputCode) {
    promptInputCode.addEventListener('paste', (e) => handlePasteEvent(e, 'code'));
  }

  // SEND MESSAGE: CHAT MODE
  async function handleSendChatMessage() {
    const text = promptInputChat.value.trim();
    const attachmentsToSend = [...chatAttachments];
    if (!text && attachmentsToSend.length === 0) return;

    promptInputChat.value = '';
    promptInputChat.style.height = 'auto';
    chatAttachments = [];
    renderAttachmentsUI('chat');

    welcomeContainerChat.classList.add('hidden');
    messagesContainerChat.classList.remove('hidden');

    let fullPrompt = text;
    let bubbleHtml = escapeHtml(text);

    if (attachmentsToSend.length > 0) {
      const attachNotes = attachmentsToSend.map(a => `[Ekli ${a.type === 'image' ? 'Fotoğraf/Görsel' : 'Dosya'}: ${a.name} (${a.size})]`).join('\n');
      fullPrompt = `${text ? text + '\n\n' : ''}${attachNotes}`;
      
      const thumbs = attachmentsToSend.map(a => {
        if (a.type === 'image') {
          return `<img src="${a.dataUrl}" class="message-attached-img" alt="${escapeHtml(a.name)}" />`;
        } else {
          return `<div class="message-attached-file">📁 <strong>${escapeHtml(a.name)}</strong> (${a.size})</div>`;
        }
      }).join('');
      bubbleHtml = `${bubbleHtml ? bubbleHtml + '<br/>' : ''}${thumbs}`;
    }

    const userMsg = { role: 'user', content: fullPrompt };
    currentChat.messages.push(userMsg);
    if (currentChat.title === 'Yeni Sohbet') {
      currentChat.title = text ? (text.length > 28 ? text.substring(0, 28) + '...' : text) : (attachmentsToSend[0].name);
    }
    renderChatMessageBubble('user', bubbleHtml);

    const thinkingHtml = `
      <div class="thinking-container">
        <span class="thinking-label">CAGE AI Düşünüyor</span>
        <span class="thinking-dots">
          <span class="dot-bounce"></span>
          <span class="dot-bounce"></span>
          <span class="dot-bounce"></span>
        </span>
      </div>
    `;
    const aiBubble = renderChatMessageBubble('ai', thinkingHtml);
    messagesContainerChat.scrollTop = messagesContainerChat.scrollHeight;

    try {
      const res = await window.cageAI.sendChatMessage({
        modelKey: currentChatModel,
        userPrompt: fullPrompt,
        history: currentChat.messages.slice(0, -1)
      });

      if (!res.success) {
        aiBubble.innerHTML = `<span style="color: #ef4444;">Hata: ${escapeHtml(res.error || 'Bilinmeyen hata')}</span>`;
        return;
      }

      const reply = res.data;
      aiBubble.innerHTML = formatMarkdown(reply.text);

      const aiMsg = {
        role: 'model',
        content: reply.text,
        flagged: !!reply.flaggedIncident
      };
      currentChat.messages.push(aiMsg);
      await window.cageAI.saveChat(currentChat);
      await loadChatHistory();

      const actions = (reply.fileActions && reply.fileActions.length > 0) 
        ? reply.fileActions 
        : (reply.fileAction ? [reply.fileAction] : []);

      actions.forEach(act => {
        if (act && act.requiresPermission) {
          renderInlineActionCard(act, 'chat');
        }
      });
    } catch (err) {
      aiBubble.innerHTML = `<span style="color: #ef4444;">Bağlantı hatası: ${escapeHtml(err.message)}</span>`;
    }

    messagesContainerChat.scrollTop = messagesContainerChat.scrollHeight;
  }

  function renderChatMessageBubble(role, content, isFlagged = false) {
    const row = document.createElement('div');
    row.className = `message-row ${role === 'user' ? 'user' : 'ai'}`;

    if (role === 'ai') {
      const header = document.createElement('div');
      header.className = 'message-header';
      header.innerHTML = `
        <span class="ai-avatar">⬡</span>
        <strong>CAGE AI</strong>
        <span style="font-size: 11px; color: #777;">• ${selectedModelLabelChat.textContent}</span>
        ${isFlagged ? '<span style="color: #ef4444; font-weight: bold; margin-left: 8px;">[GÜVENLİK BİLDİRİMLİ]</span>' : ''}
      `;
      row.appendChild(header);
    }

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = role === 'user' 
      ? (content.includes('<img') || content.includes('<div') ? content : escapeHtml(content))
      : (content.includes('thinking-container') ? content : formatMarkdown(content));
    row.appendChild(bubble);

    messagesContainerChat.appendChild(row);
    return bubble;
  }

  // SEND MESSAGE: CODE STUDIO MODE
  async function handleSendCodeMessage() {
    const text = promptInputCode.value.trim();
    const attachmentsToSend = [...codeAttachments];
    if (!text && attachmentsToSend.length === 0) return;

    promptInputCode.value = '';
    promptInputCode.style.height = 'auto';
    codeAttachments = [];
    renderAttachmentsUI('code');

    let fullPrompt = text;
    let bubbleHtml = escapeHtml(text);

    if (attachmentsToSend.length > 0) {
      const attachNotes = attachmentsToSend.map(a => `[Ekli ${a.type === 'image' ? 'Fotoğraf/Görsel' : 'Dosya'}: ${a.name} (${a.size})]`).join('\n');
      fullPrompt = `${text ? text + '\n\n' : ''}${attachNotes}`;
      
      const thumbs = attachmentsToSend.map(a => {
        if (a.type === 'image') {
          return `<img src="${a.dataUrl}" class="message-attached-img" alt="${escapeHtml(a.name)}" />`;
        } else {
          return `<div class="message-attached-file">📁 <strong>${escapeHtml(a.name)}</strong> (${a.size})</div>`;
        }
      }).join('');
      bubbleHtml = `${bubbleHtml ? bubbleHtml + '<br/>' : ''}${thumbs}`;
    }

    const userMsg = { role: 'user', content: fullPrompt };
    currentCodeChat.messages.push(userMsg);
    if (currentCodeChat.title === 'Yeni Kodlama Projesi') {
      currentCodeChat.title = text ? (text.length > 28 ? text.substring(0, 28) + '...' : text) : (attachmentsToSend[0].name);
    }
    renderCodeMessageBubble('user', bubbleHtml);

    const thinkingCodeHtml = `
      <div class="thinking-container">
        <span class="thinking-label">Codium Ajanı Düşünüyor</span>
        <span class="thinking-dots">
          <span class="dot-bounce"></span>
          <span class="dot-bounce"></span>
          <span class="dot-bounce"></span>
        </span>
      </div>
    `;
    const aiBubble = renderCodeMessageBubble('ai', thinkingCodeHtml);
    messagesContainerCode.scrollTop = messagesContainerCode.scrollHeight;

    try {
      const res = await window.cageAI.sendChatMessage({
        modelKey: currentCodeModel,
        userPrompt: fullPrompt,
        history: currentCodeChat.messages.slice(0, -1)
      });

      if (!res.success) {
        aiBubble.innerHTML = `<span style="color: #ef4444;">Hata: ${escapeHtml(res.error || 'Bilinmeyen hata')}</span>`;
        return;
      }

      const reply = res.data;
      aiBubble.innerHTML = formatMarkdown(reply.text);

      const aiMsg = {
        role: 'model',
        content: reply.text,
        flagged: !!reply.flaggedIncident
      };
      currentCodeChat.messages.push(aiMsg);

      // Extract generated code and update Live Code Studio Editor Panel
      const extracted = extractCodeBlock(reply.text);
      if (extracted) {
        codeStudioView.value = extracted.code;
        currentCodeChat.codeContent = extracted.code;
        if (extracted.filePath) {
          const fname = extracted.filePath.split(/[\\/]/).pop() || 'main.py';
          activeFileTitle.textContent = fname;
          currentCodeChat.activeFile = fname;
          currentCodeChat.activePath = extracted.filePath;
          if (lblActiveFullPath) {
            lblActiveFullPath.textContent = extracted.filePath;
          }
        } else if (extracted.lang) {
          const extension = getExtensionFromLang(extracted.lang);
          const fname = `solution.${extension}`;
          activeFileTitle.textContent = fname;
          currentCodeChat.activeFile = fname;
          if (lblActiveFullPath) {
            lblActiveFullPath.textContent = currentCodeChat.activePath || ('Yerel Bellek / ' + fname);
          }
        }

        // Visual flash indication on the editor panel
        const editorPanel = document.querySelector('.code-editor-panel');
        if (editorPanel) {
          editorPanel.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.4)';
          setTimeout(() => { editorPanel.style.boxShadow = 'none'; }, 1200);
        }
      }

      await window.cageAI.saveCodeChat(currentCodeChat);
      await loadCodeChatHistory();

      const actions = (reply.fileActions && reply.fileActions.length > 0) 
        ? reply.fileActions 
        : (reply.fileAction ? [reply.fileAction] : []);

      actions.forEach(act => {
        if (act && act.requiresPermission) {
          renderInlineActionCard(act, 'code');
        }
      });
    } catch (err) {
      aiBubble.innerHTML = `<span style="color: #ef4444;">Bağlantı hatası: ${escapeHtml(err.message)}</span>`;
    }

    messagesContainerCode.scrollTop = messagesContainerCode.scrollHeight;
  }

  function renderCodeMessageBubble(role, content, isFlagged = false) {
    const row = document.createElement('div');
    row.className = `message-row ${role === 'user' ? 'user' : 'ai'}`;

    if (role === 'ai') {
      const header = document.createElement('div');
      header.className = 'message-header';
      header.innerHTML = `
        <span class="ai-avatar" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa;">⚡</span>
        <strong>Codium Agent</strong>
        <span style="font-size: 11px; color: #777;">• ${selectedModelLabelCode.textContent}</span>
        ${isFlagged ? '<span style="color: #ef4444; font-weight: bold; margin-left: 8px;">[GÜVENLİK BİLDİRİMLİ]</span>' : ''}
      `;
      row.appendChild(header);
    }

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = role === 'user' 
      ? (content.includes('<img') || content.includes('<div') ? content : escapeHtml(content))
      : (content.includes('thinking-container') ? content : formatMarkdown(content));
    row.appendChild(bubble);

    messagesContainerCode.appendChild(row);
    return bubble;
  }

  // Code Block Extractor
  function extractCodeBlock(text) {
    if (!text) return null;
    const match = text.match(/```([^\r\n]*)[\r\n]+([\s\S]*?)(?:```[^\S\r\n]*|$)/);
    if (match && match[2].trim().length > 0) {
      const header = (match[1] || '').trim();
      let lang = 'javascript';
      let filePath = '';

      if (header.startsWith('file:') || header.startsWith('write:') || header.startsWith('create:')) {
        filePath = header.substring(header.indexOf(':') + 1).trim();
        const ext = filePath.split('.').pop() || 'py';
        lang = ext.toLowerCase();
      } else if (header.startsWith('command:')) {
        lang = 'bash';
      } else if (header) {
        lang = header.toLowerCase();
      }

      return {
        lang: lang,
        code: match[2].trim(),
        filePath: filePath,
        rawHeader: header
      };
    }
    return null;
  }

  function getExtensionFromLang(lang) {
    const l = (lang || '').toLowerCase();
    if (l === 'python' || l === 'py') return 'py';
    if (l === 'html') return 'html';
    if (l === 'css') return 'css';
    if (l === 'json') return 'json';
    if (l === 'typescript' || l === 'ts') return 'ts';
    if (l === 'csharp' || l === 'cs') return 'cs';
    if (l === 'cpp' || l === 'c') return 'cpp';
    if (l === 'bash' || l === 'sh') return 'sh';
    return 'js';
  }

  // Live Editor Direct Text Input Sync
  if (codeStudioView) {
    codeStudioView.addEventListener('input', () => {
      currentCodeChat.codeContent = codeStudioView.value;
    });
  }

  // Live Editor: Open File from Disk (Admin Enabled)
  if (btnOpenFile) {
    btnOpenFile.addEventListener('click', async () => {
      if (!window.cageAI) return;
      const res = await window.cageAI.openFileDialog();
      if (res && !res.canceled && res.content !== undefined) {
        codeStudioView.value = res.content;
        activeFileTitle.textContent = res.fileName;
        if (lblActiveFullPath) {
          lblActiveFullPath.textContent = res.filePath;
        }
        currentCodeChat.activeFile = res.fileName;
        currentCodeChat.activePath = res.filePath;
        currentCodeChat.codeContent = res.content;
        
        renderCodeMessageBubble('ai', `📂 **Dosya Başarıyla Açıldı:** \`${res.filePath}\`\nDosyayı inceleyebilir, sağ panelden doğrudan düzenleyebilir veya Codium ajanı ile refactor ettirebilirsiniz.`);
        messagesContainerCode.scrollTop = messagesContainerCode.scrollHeight;
      }
    });
  }

  // Live Editor: Open Project Folder
  if (btnOpenFolder) {
    btnOpenFolder.addEventListener('click', async () => {
      if (!window.cageAI) return;
      const res = await window.cageAI.openFolderDialog();
      if (res && !res.canceled) {
        if (lblActiveFullPath) {
          lblActiveFullPath.textContent = res.folderPath;
        }
        currentCodeChat.folderPath = res.folderPath;
        const fileCount = res.items ? res.items.length : 0;
        renderCodeMessageBubble('ai', `📁 **Proje Klasörü Seçildi:** \`${res.folderPath}\` (${fileCount} dosya/klasör)\nCodium ajanı bu çalışma alanındaki dosyaları doğrudan okuyabilir ve yeni kodlar üretebilir.`);
        messagesContainerCode.scrollTop = messagesContainerCode.scrollHeight;
      }
    });
  }

  // Live Editor: Copy Button
  if (btnCopyCodeStudio) {
    btnCopyCodeStudio.addEventListener('click', () => {
      const code = codeStudioView.value;
      navigator.clipboard.writeText(code);
      const originalText = btnCopyCodeStudio.innerHTML;
      btnCopyCodeStudio.innerHTML = '✓ Kopyalandı!';
      setTimeout(() => {
        btnCopyCodeStudio.innerHTML = originalText;
      }, 2000);
    });
  }

  // Live Editor: Save Directly to Disk (Admin Privileged)
  if (btnSaveToFile) {
    btnSaveToFile.addEventListener('click', async () => {
      const code = codeStudioView.value;
      const targetPath = currentCodeChat.activePath;
      const fileName = activeFileTitle.textContent || 'script.js';

      if (targetPath) {
        // Direct overwrite with Admin privilege
        const writeRes = await window.cageAI.fsWriteFile({ filePath: targetPath, content: code });
        if (writeRes && writeRes.success) {
          const orig = btnSaveToFile.innerHTML;
          btnSaveToFile.innerHTML = '✓ Diske Yazıldı!';
          setTimeout(() => { btnSaveToFile.innerHTML = orig; }, 2000);
          renderCodeMessageBubble('ai', `💾 **Dosya Diske Kaydedildi (Admin):** \`${targetPath}\``);
          messagesContainerCode.scrollTop = messagesContainerCode.scrollHeight;
        } else {
          alert('Dosya yazma hatası: ' + (writeRes?.message || 'Bilinmeyen hata'));
        }
      } else {
        // Show save file dialog
        const saveRes = await window.cageAI.saveFileDialog({ defaultName: fileName, content: code });
        if (saveRes && !saveRes.canceled && saveRes.success) {
          currentCodeChat.activePath = saveRes.filePath;
          currentCodeChat.activeFile = saveRes.fileName;
          activeFileTitle.textContent = saveRes.fileName;
          if (lblActiveFullPath) {
            lblActiveFullPath.textContent = saveRes.filePath;
          }
          const orig = btnSaveToFile.innerHTML;
          btnSaveToFile.innerHTML = '✓ Diske Yazıldı!';
          setTimeout(() => { btnSaveToFile.innerHTML = orig; }, 2000);
          renderCodeMessageBubble('ai', `💾 **Yeni Dosya Oluşturuldu ve Diske Yazıldı:** \`${saveRes.filePath}\``);
          messagesContainerCode.scrollTop = messagesContainerCode.scrollHeight;
        }
      }
    });
  }

  // Live Editor: Run Code Directly on PC / Terminal
  if (btnRunCodeOnPC) {
    btnRunCodeOnPC.addEventListener('click', async () => {
      const code = codeStudioView ? codeStudioView.value.trim() : '';
      if (!code) {
        showToast('Çalıştırılacak kod bulunamadı.', true);
        return;
      }
      showToast('⚡ Kod bilgisayarınızda çalıştırılıyor...');

      const fileName = activeFileTitle ? activeFileTitle.textContent : 'script.js';
      const isPython = fileName.endsWith('.py') || code.includes('import ') || code.includes('def ') || code.includes('print(');

      // Escape code safely for powershell one-liner or run via node/python
      let cmd = '';
      if (isPython) {
        cmd = `python -c "${code.replace(/"/g, '`"').replace(/\n/g, '; ')}"`;
      } else {
        cmd = `node -e "${code.replace(/"/g, '`"').replace(/\n/g, '; ')}"`;
      }

      if (window.cageAI && window.cageAI.runSystemCommand) {
        const orig = btnRunCodeOnPC.innerHTML;
        btnRunCodeOnPC.innerHTML = '⏳ Çalışıyor...';
        const res = await window.cageAI.runSystemCommand(cmd);
        btnRunCodeOnPC.innerHTML = orig;

        if (res.success && !res.stderr) {
          showToast('Kod başarıyla çalıştırıldı!');
          renderTerminalCard(res.stdout || '(Kod başarıyla tamamlandı, çıktı üretilmedi)', 'code');
        } else {
          showToast('Çalıştırma hatası oluştu', true);
          const errorOutput = res.stderr || res.error || res.stdout || 'Hata oluştu';
          renderErrorGuiCard({
            error: errorOutput,
            code,
            isPython
          }, 'code');
        }
        messagesContainerCode.scrollTop = messagesContainerCode.scrollHeight;
      }
    });
  }

  // Markdown Formatter (Pure CAGE AI - No external dependencies)
  function formatMarkdown(text) {
    if (!text) return '';
    const codeBlocks = [];

    // 1. Extract and replace code blocks with tokens
    // Matches ```header\n...``` across CRLF and LF, supporting paths, spaces, colons, etc.
    let processed = text.replace(/```([^\r\n]*)[\r\n]+([\s\S]*?)(?:```[^\S\r\n]*|$)/g, (match, rawHeader, codeContent) => {
      const header = (rawHeader || '').trim();
      let badge = 'Kod';
      let displayCode = codeContent ? codeContent.replace(/\r\n/g, '\n') : '';
      let detectedLang = 'javascript';
      let filePath = '';
      let runActionAllowed = true;

      if (header.startsWith('file:') || header.startsWith('write:') || header.startsWith('create:')) {
        const colonIdx = header.indexOf(':');
        filePath = header.substring(colonIdx + 1).trim();
        const basename = filePath.split(/[\\/]/).pop() || filePath;
        const ext = basename.split('.').pop() || 'py';
        badge = `📄 ${basename}`;
        detectedLang = ext.toLowerCase();
      } else if (header.startsWith('folder:') || header.startsWith('mkdir:')) {
        const colonIdx = header.indexOf(':');
        const folderPath = header.substring(colonIdx + 1).trim();
        badge = `📁 ${folderPath || 'Yeni Klasör'}`;
        detectedLang = 'folder';
        runActionAllowed = false;
        if (!displayCode.trim()) displayCode = folderPath;
      } else if (header.startsWith('command:') || header.startsWith('run:') || header.startsWith('setup:') || header.startsWith('install:')) {
        const colonIdx = header.indexOf(':');
        const headerCmd = header.substring(colonIdx + 1).trim();
        badge = `⚡ Terminal Komutu`;
        detectedLang = 'powershell';
        if (!displayCode.trim()) {
          displayCode = headerCmd;
        } else if (headerCmd) {
          displayCode = `${headerCmd}\n${displayCode.trim()}`;
        }
      } else if (header === 'command' || header === 'cmd' || header === 'powershell' || header === 'bash' || header === 'sh') {
        badge = `⚡ Terminal Komutu`;
        detectedLang = 'powershell';
      } else if (header.startsWith('read:') || header.startsWith('view:')) {
        const colonIdx = header.indexOf(':');
        const rPath = header.substring(colonIdx + 1).trim();
        badge = `🔍 ${rPath}`;
        detectedLang = 'text';
        runActionAllowed = false;
      } else if (header) {
        badge = header;
        detectedLang = header.toLowerCase();
      }

      displayCode = displayCode.trim();
      const lines = displayCode ? displayCode.split('\n').length : 1;
      const linesLabel = detectedLang === 'powershell' ? `${lines} komut` : `${lines} satır`;
      const placeholder = `__CAGE_CODE_BLOCK_${codeBlocks.length}__`;

      const blockHtml = `
        <div class="chat-gui-code-card" data-code="${encodeURIComponent(displayCode)}" data-lang="${escapeHtml(detectedLang)}" data-filepath="${escapeHtml(filePath)}">
          <div class="code-card-header">
            <div class="code-card-tags">
              <span class="code-lang-badge">${escapeHtml(badge)}</span>
              <span class="code-lines-badge">${linesLabel}</span>
            </div>
            <div class="code-card-actions">
              <button class="btn-code-action btn-copy-chat-code" title="Kodu Kopyala">
                <span>📋</span> Kopyala
              </button>
              <button class="btn-code-action btn-apply-file" title="Stüdyo Editörüne Aktar">
                <span>📥</span> Editöre Aktar
              </button>
              ${runActionAllowed ? `
              <button class="btn-code-action btn-run-chat-code" title="Bilgisayarda Çalıştır">
                <span>▶</span> Çalıştır
              </button>
              ` : ''}
            </div>
          </div>
          <pre class="code-card-body"><code>${escapeHtml(displayCode)}</code></pre>
        </div>
      `;

      codeBlocks.push(blockHtml);
      return placeholder;
    });

    // 2. Escape HTML for the rest of text
    let html = escapeHtml(processed);

    // 3. Inline code `...`
    html = html.replace(/`([^`\r\n]+)`/g, '<code>$1</code>');

    // 4. Bold **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 5. Bullet lists
    html = html.replace(/^\* (.*$)/gim, '• $1');

    // 6. Newlines to <br>
    html = html.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');

    // 7. Restore code blocks
    codeBlocks.forEach((block, idx) => {
      const placeholder = `__CAGE_CODE_BLOCK_${idx}__`;
      html = html.replace(placeholder, block);
    });

    return html;
  }

  function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return (text || '').replace(/[&<>"']/g, m => map[m]);
  }

  // Keydown / Auto-resize for Chat Input
  promptInputChat.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  });

  btnSendChat.addEventListener('click', handleSendChatMessage);

  promptInputChat.addEventListener('input', () => {
    promptInputChat.style.height = 'auto';
    promptInputChat.style.height = Math.min(200, promptInputChat.scrollHeight) + 'px';
    if (promptInputChat.value.trim().length > 0) {
      btnSendChat.classList.add('active');
    } else {
      btnSendChat.classList.remove('active');
    }
  });

  // Keydown / Auto-resize for Code Input
  promptInputCode.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendCodeMessage();
    }
  });

  btnSendCode.addEventListener('click', handleSendCodeMessage);

  promptInputCode.addEventListener('input', () => {
    promptInputCode.style.height = 'auto';
    promptInputCode.style.height = Math.min(200, promptInputCode.scrollHeight) + 'px';
  });

  // CHAT-NATIVE TERMINAL OUTPUT CARD
  function renderTerminalCard(output, mode = 'code') {
    const container = mode === 'code' ? messagesContainerCode : messagesContainerChat;
    if (!container || !output) return;

    const card = document.createElement('div');
    card.className = 'chat-gui-terminal-card';
    card.innerHTML = `
      <div class="terminal-card-header">
        <span>🖥️ PowerShell / Terminal Konsol Çıktısı</span>
        <span style="color: #10b981; font-size: 11px; font-weight: 600;">✓ Tamamlandı</span>
      </div>
      <pre class="terminal-card-body"><code>${escapeHtml(output)}</code></pre>
    `;
    container.appendChild(card);
    container.scrollTop = container.scrollHeight;
  }

  // ERROR DIAGNOSIS IN TURKISH (Sıradan textbox yerine zengin Türkçe hata açıklaması)
  function diagnoseErrorInTurkish(rawError) {
    const err = (rawError || '').toLowerCase();
    if (err.includes('no module named')) {
      const modMatch = rawError.match(/no module named ['"]([^'"]+)['"]/i);
      const mod = modMatch ? modMatch[1] : 'gerekli';
      return `Sisteminizde '${mod}' kütüphanesi eksik veya kurulu değil. Codium bu paketi otomatik olarak pip ile kurarak projeyi ayağa kaldıracak.`;
    }
    if (err.includes('cannot find module')) {
      const modMatch = rawError.match(/cannot find module ['"]([^'"]+)['"]/i);
      const mod = modMatch ? modMatch[1] : 'gerekli';
      return `Node.js projesinde '${mod}' modülü bulunamadı. Codium eksik paketi npm ile kurmak için hazırlanıyor.`;
    }
    if (err.includes('syntaxerror')) {
      return `Kod sözdiziminde (SyntaxError) bir karakter veya blok hatası tespit edildi. Codium kod yapısını analiz edip otomatik olarak düzeltiyor.`;
    }
    if (err.includes('is not recognized') || err.includes('bulunamadı') || err.includes('command not found')) {
      return `Çalıştırılmak istenen program veya komut sistem PATH ortamında bulunamadı. Codium sistem ortamına uygun alternatif yolu devreye sokuyor.`;
    }
    if (err.includes('permission denied') || err.includes('erişim engellendi')) {
      return `Dosya veya dizine erişim izni kısıtlı. Codium yönetici izinleri eşliğinde dosya erişimini yeniden yapılandırıyor.`;
    }
    if (err.includes('filenotfounderror') || err.includes('no such file or directory')) {
      return `İlgili dosya veya hedef klasör mevcut değil. Codium gerekli dizin yapısını ve dosyayı oluşturuyor.`;
    }
    return `Kod veya komut çalıştırılırken bir hata ile karşılaşıldı. Codium otonom analiz sistemi hatanın nedenini tespit edip otomatik olarak çözüyor.`;
  }

  // CHAT-NATIVE ERROR GUI CARD & AUTONOMOUS HEALING TRIGGER
  function renderErrorGuiCard(errorData, mode = 'code') {
    const container = mode === 'code' ? messagesContainerCode : messagesContainerChat;
    if (!container) return;

    const rawError = typeof errorData === 'string' ? errorData : (errorData.error || errorData.output || 'Bilinmeyen hata');
    const turkishExplanation = diagnoseErrorInTurkish(rawError);

    const card = document.createElement('div');
    card.className = 'chat-gui-error-card';
    card.innerHTML = `
      <div class="error-card-header">
        <div class="error-card-title">
          <span>⚠️</span>
          <span>Hata Tespit Edildi</span>
        </div>
        <div class="healing-status-tag">
          <span class="dot-bounce" style="background:#fbbf24; width:6px; height:6px; display:inline-block; border-radius:50%;"></span>
          <span class="status-healing-text">Codium Kendi Kendine Çözüyor...</span>
        </div>
      </div>
      <div class="error-card-explain">
        ${escapeHtml(turkishExplanation)}
      </div>
      <div class="error-card-trace-wrapper">
        <span class="error-trace-toggle">▼ Hata Logunu Göster</span>
        <pre class="error-trace-pre hidden"><code>${escapeHtml(rawError)}</code></pre>
      </div>
      <div class="error-card-actions">
        <span style="font-size: 11.5px; color: #9ca3af;">Otonom hata giderme döngüsü başlatıldı.</span>
        <button class="btn-heal-error">
          <span>⚡</span> Yeniden Çözmeyi Tetikle
        </button>
      </div>
    `;

    container.appendChild(card);
    container.scrollTop = container.scrollHeight;

    // Automatically trigger autonomous healing after a brief moment
    setTimeout(() => {
      triggerAutonomousSelfHealing(rawError, mode);
    }, 700);
  }

  // AUTONOMOUS SELF-HEALING LOOP
  let isHealingInProgress = false;
  async function triggerAutonomousSelfHealing(rawError, mode = 'code') {
    if (isHealingInProgress) return;
    isHealingInProgress = true;

    const healingPrompt = `[SİSTEM HATA DÜZELTME BİLDİRİMİ]: Az önce çalıştırılan işlemde şu hata oluştu:\n${rawError}\n\nLütfen hatanın nedenini net bir Türkçe ile açıkla, sorunu gidermek için gereken dosya düzenlemesini veya kurulum/çalıştırma komutunu (örn: pip install, npm install, klasör oluşturma veya kod düzeltmesi) derhal başlat ve projeyi kendi kendine çalışır duruma getir.`;

    const chatObj = mode === 'code' ? currentCodeChat : currentChat;
    const modelKey = mode === 'code' ? currentCodeModel : currentChatModel;
    const container = mode === 'code' ? messagesContainerCode : messagesContainerChat;

    const thinkingHtml = `
      <div class="thinking-container">
        <span class="thinking-label">⚡ Codium Hatayı Otonom Çözüyor</span>
        <span class="thinking-dots">
          <span class="dot-bounce"></span>
          <span class="dot-bounce"></span>
          <span class="dot-bounce"></span>
        </span>
      </div>
    `;

    const aiBubble = mode === 'code' 
      ? renderCodeMessageBubble('ai', thinkingHtml)
      : renderChatMessageBubble('ai', thinkingHtml);

    container.scrollTop = container.scrollHeight;

    try {
      const res = await window.cageAI.sendChatMessage({
        modelKey: modelKey,
        userPrompt: healingPrompt,
        history: chatObj.messages
      });

      if (!res.success) {
        aiBubble.innerHTML = `<span style="color: #ef4444;">Otomatik çözümleme hatası: ${escapeHtml(res.error || 'Bilinmeyen hata')}</span>`;
        isHealingInProgress = false;
        return;
      }

      const reply = res.data;
      aiBubble.innerHTML = formatMarkdown(reply.text);

      chatObj.messages.push({
        role: 'model',
        content: reply.text,
        flagged: !!reply.flaggedIncident
      });

      if (mode === 'code') {
        await window.cageAI.saveCodeChat(currentCodeChat);
      } else {
        await window.cageAI.saveChat(currentChat);
      }

      const actions = (reply.fileActions && reply.fileActions.length > 0) 
        ? reply.fileActions 
        : (reply.fileAction ? [reply.fileAction] : []);

      actions.forEach(act => {
        if (act && act.requiresPermission) {
          renderInlineActionCard(act, mode);
        }
      });
    } catch (err) {
      aiBubble.innerHTML = `<span style="color: #ef4444;">Otonom çözüm bağlantı hatası: ${escapeHtml(err.message)}</span>`;
    } finally {
      isHealingInProgress = false;
      container.scrollTop = container.scrollHeight;
    }
  }

  // INLINE AGENT ACTION CARD (AYRI PENCERE YERİNE CHAT İÇİ ONAY BARI)
  function renderInlineActionCard(action, mode = 'code') {
    const container = mode === 'code' ? messagesContainerCode : messagesContainerChat;
    if (!container || !action) return;

    const isCmd = action.action === 'COMMAND' || action.action === 'INSTALL';
    const isFolder = action.action === 'MKDIR' || action.action === 'FOLDER';
    const isRead = action.action === 'READ';
    const isWrite = !isCmd && !isFolder && !isRead;

    let icon = '⚡';
    let actionSentence = '';
    let targetLabel = '';
    let previewText = '';

    if (isCmd) {
      icon = '⚡';
      const cmd = action.command || action.content || '';
      actionSentence = `'${cmd.length > 52 ? cmd.substring(0, 52) + '...' : cmd}' terminal komutu ve kurulumu çalıştırılacak.`;
      targetLabel = 'Çalıştırılacak Komut:';
      previewText = cmd;
    } else if (isFolder) {
      icon = '📁';
      const folderPath = action.filePath || 'Yeni Klasör';
      actionSentence = `'${folderPath}' klasörü oluşturulacak.`;
      targetLabel = 'Oluşturulacak Klasör Yolu:';
      previewText = folderPath;
    } else if (isRead) {
      icon = '🔍';
      const filePath = action.filePath || 'Dosya';
      actionSentence = `'${filePath}' dosyasının içeriği okunacak.`;
      targetLabel = 'Okunacak Dosya:';
      previewText = filePath;
    } else {
      icon = '📄';
      const filePath = action.filePath || 'dosya.txt';
      actionSentence = `'${filePath}' dosyası oluşturulacak / düzenlenecek.`;
      targetLabel = 'Hedef Dosya Yolu:';
      previewText = action.content || '(İçerik boş)';
    }

    const card = document.createElement('div');
    card.className = 'inline-action-banner';
    card.innerHTML = `
      <div class="inline-action-header">
        <div class="inline-action-summary" title="Detayları görmek veya gizlemek için tıklayın">
          <span class="action-icon">${icon}</span>
          <span class="action-text">${escapeHtml(actionSentence)}</span>
          <span class="action-chevron">▼</span>
        </div>
        <div class="inline-action-btns">
          <button class="btn-inline-approve" title="Eylemi Onayla ve Uygula">
            <span>✓</span> Onayla
          </button>
          <button class="btn-inline-reject" title="Eylemi Reddet">
            <span>✕</span> Reddet
          </button>
        </div>
      </div>
      <div class="inline-action-details hidden">
        <div class="details-target-tag">
          <strong>${targetLabel}</strong> <code>${escapeHtml(action.filePath || action.command || '')}</code>
        </div>
        <pre class="details-code-preview"><code>${escapeHtml(previewText)}</code></pre>
      </div>
    `;

    // Toggle details on sentence click
    const summaryEl = card.querySelector('.inline-action-summary');
    const detailsEl = card.querySelector('.inline-action-details');
    summaryEl.addEventListener('click', () => {
      const isHidden = detailsEl.classList.contains('hidden');
      if (isHidden) {
        detailsEl.classList.remove('hidden');
        summaryEl.classList.add('expanded');
      } else {
        detailsEl.classList.add('hidden');
        summaryEl.classList.remove('expanded');
      }
    });

    // Approve button handler
    const btnApprove = card.querySelector('.btn-inline-approve');
    const btnReject = card.querySelector('.btn-inline-reject');
    const btnsContainer = card.querySelector('.inline-action-btns');

    btnApprove.addEventListener('click', async () => {
      btnsContainer.innerHTML = `<span style="font-size: 11.5px; color: #fbbf24; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;"><span class="dot-bounce" style="background:#fbbf24; width:5px; height:5px; display:inline-block; border-radius:50%;"></span> Uygulanıyor...</span>`;

      try {
        const result = await window.cageAI.submitFilePermissionDecision({
          action: action.action,
          filePath: action.filePath,
          content: action.content,
          command: action.command,
          approved: true
        });

        if (result && result.success && !result.hasError) {
          card.innerHTML = `
            <div class="action-status-banner" style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #34d399; padding: 10px 14px; border-radius: 8px; font-size: 12.5px; display: flex; align-items: center; gap: 8px;">
              <span>✅</span>
              <span><strong>Başarılı:</strong> ${escapeHtml(result.message || 'İşlem uygulandı.')}</span>
            </div>
          `;

          if (result.output && result.output.trim().length > 0) {
            renderTerminalCard(result.output, mode);
          }

          if (isWrite && action.content && codeStudioView) {
            codeStudioView.value = action.content;
            currentCodeChat.codeContent = action.content;
            if (activeFileTitle && action.filePath) {
              activeFileTitle.textContent = action.filePath.split(/[\\/]/).pop();
            }
          }
          showToast('Sistem işlemi başarıyla uygulandı!');
        } else {
          // Execution failed or error returned
          const errMsg = (result && (result.error || result.output || result.message)) || 'Komut çalıştırılırken hata oluştu';
          card.innerHTML = `
            <div class="action-status-banner" style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #f87171; padding: 10px 14px; border-radius: 8px; font-size: 12.5px; display: flex; align-items: center; gap: 8px;">
              <span>❌</span>
              <span><strong>İşlem Başarısız:</strong> ${escapeHtml(result ? result.message : 'Komut hata ile sonlandı.')}</span>
            </div>
          `;
          renderErrorGuiCard({
            error: errMsg,
            action: action,
            mode: mode
          }, mode);
        }
      } catch (err) {
        renderErrorGuiCard({
          error: err.message,
          action: action,
          mode: mode
        }, mode);
      }
    });

    btnReject.addEventListener('click', async () => {
      btnsContainer.innerHTML = `<span style="font-size: 11.5px; color: #ef4444; font-weight: 600;">Reddedildi</span>`;
      await window.cageAI.submitFilePermissionDecision({
        action: action.action,
        filePath: action.filePath,
        content: action.content,
        command: action.command,
        approved: false
      });
      setTimeout(() => {
        card.innerHTML = `
          <div class="action-status-banner" style="background: rgba(239, 68, 68, 0.12); border: 1px solid #7f1d1d; color: #fca5a5; padding: 8px 12px; border-radius: 6px; font-size: 12px;">
            🚫 <strong>Eylem Reddedildi:</strong> Kullanıcı bu sistem işlemini iptal etti.
          </div>
        `;
      }, 400);
    });

    container.appendChild(card);
    container.scrollTop = container.scrollHeight;
  }

  // Deprecated modal wrapper maintained for backward compatibility
  function showFilePermissionDialog(action) {
    renderInlineActionCard(action, activeMode);
  }

  // CODE CARD DELEGATED INTERACTIONS (KOPYALA, EDİTÖRE AKTAR, ÇALIŞTIR)
  function setupCodeCardActions(container) {
    if (!container) return;
    container.addEventListener('click', async (e) => {
      // 1. Copy button
      const copyBtn = e.target.closest('.btn-copy-chat-code');
      if (copyBtn) {
        const card = copyBtn.closest('.chat-gui-code-card');
        if (!card) return;
        const code = decodeURIComponent(card.dataset.code || '');
        await navigator.clipboard.writeText(code);
        const origText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span>✓</span> Kopyalandı!';
        setTimeout(() => { copyBtn.innerHTML = origText; }, 1600);
        showToast('Kod panoya kopyalandı!');
        return;
      }

      // 2. Apply to Editor button
      const applyBtn = e.target.closest('.btn-apply-file');
      if (applyBtn) {
        const card = applyBtn.closest('.chat-gui-code-card');
        if (!card) return;
        const code = decodeURIComponent(card.dataset.code || '');
        const fPath = card.dataset.filepath || '';
        
        if (codeStudioView) {
          codeStudioView.value = code;
          currentCodeChat.codeContent = code;
        }

        if (fPath && activeFileTitle) {
          const fname = fPath.split(/[\\/]/).pop();
          activeFileTitle.textContent = fname;
          currentCodeChat.activeFile = fname;
          currentCodeChat.activePath = fPath;
          if (lblActiveFullPath) {
            lblActiveFullPath.textContent = fPath;
          }
        }

        if (activeMode !== 'code') {
          switchMode('code');
        }

        showToast('Kod Stüdyo editörüne aktarıldı!');
        return;
      }

      // 3. Run on PC button
      const runBtn = e.target.closest('.btn-run-chat-code');
      if (runBtn) {
        const card = runBtn.closest('.chat-gui-code-card');
        if (!card) return;
        const code = decodeURIComponent(card.dataset.code || '');
        const lang = (card.dataset.lang || '').toLowerCase();
        const fPath = card.dataset.filepath || '';

        showToast('⚡ Kod bilgisayarınızda çalıştırılıyor...');

        const isPython = lang.includes('python') || lang === 'py' || code.includes('import ') || code.includes('def ') || code.includes('print(');
        const isCmd = lang.includes('powershell') || lang.startsWith('command') || lang === 'bash' || lang === 'sh';

        let cmd = '';
        if (isCmd) {
          cmd = code.trim();
        } else if (isPython) {
          if (fPath) {
            if (window.cageAI && window.cageAI.fsWriteFile) {
              await window.cageAI.fsWriteFile({ filePath: fPath, content: code });
            }
            cmd = `python "${fPath}"`;
          } else {
            const tempScript = `${process.env.TEMP || 'C:\\Windows\\Temp'}\\cage_run_${Date.now()}.py`;
            if (window.cageAI && window.cageAI.fsWriteFile) {
              await window.cageAI.fsWriteFile({ filePath: tempScript, content: code });
            }
            cmd = `python "${tempScript}"`;
          }
        } else {
          cmd = `node -e "${code.replace(/"/g, '`"').replace(/\n/g, '; ')}"`;
        }

        if (window.cageAI && window.cageAI.runSystemCommand) {
          const orig = runBtn.innerHTML;
          runBtn.innerHTML = '<span>⏳</span>';
          const res = await window.cageAI.runSystemCommand(cmd);
          runBtn.innerHTML = orig;

          if (res.success && !res.stderr) {
            showToast('Kod başarıyla çalıştırıldı!');
            renderTerminalCard(res.stdout || '(Kod başarıyla tamamlandı, çıktı üretilmedi)', activeMode);
          } else {
            showToast('Çalıştırma hatası oluştu', true);
            const errorOutput = res.stderr || res.error || res.stdout || 'Hata oluştu';
            renderErrorGuiCard({
              error: errorOutput,
              code: code,
              isPython: isPython
            }, activeMode);
          }
        }
        return;
      }
    });
  }

  // ERROR CARD DELEGATED INTERACTIONS (LOG GÖSTER / GİZLE & YENİDEN ÇÖZ)
  function setupErrorCardActions(container) {
    if (!container) return;
    container.addEventListener('click', (e) => {
      const toggle = e.target.closest('.error-trace-toggle');
      if (toggle) {
        const wrapper = toggle.closest('.error-card-trace-wrapper');
        const pre = wrapper ? wrapper.querySelector('.error-trace-pre') : null;
        if (pre) {
          pre.classList.toggle('hidden');
          toggle.textContent = pre.classList.contains('hidden') ? '▼ Hata Logunu Göster' : '▲ Hata Logunu Gizle';
        }
        return;
      }

      const healBtn = e.target.closest('.btn-heal-error');
      if (healBtn) {
        const card = healBtn.closest('.chat-gui-error-card');
        const errText = card ? card.querySelector('.error-trace-pre')?.textContent : '';
        triggerAutonomousSelfHealing(errText || 'Bilinmeyen çalıştırma hatası', activeMode);
        healBtn.innerHTML = '<span>✓</span> Çözüm Başlatıldı';
        healBtn.disabled = true;
        return;
      }
    });
  }

  // Setup Delegated Listeners for both chat and code containers
  setupCodeCardActions(messagesContainerChat);
  setupCodeCardActions(messagesContainerCode);
  setupErrorCardActions(messagesContainerChat);
  setupErrorCardActions(messagesContainerCode);

  if (window.cageAI && window.cageAI.onFilePermissionRequest) {
    window.cageAI.onFilePermissionRequest((action) => {
      renderInlineActionCard(action, activeMode);
    });
  }

  // MARKET & BILLING
  btnHeaderUpgrade.addEventListener('click', () => marketModal.classList.remove('hidden'));
  navMarket.addEventListener('click', () => marketModal.classList.remove('hidden'));
  btnCloseMarket.addEventListener('click', () => marketModal.classList.add('hidden'));

  billingCycleToggle.addEventListener('change', () => {
    isYearlyBilling = billingCycleToggle.checked;
    if (isYearlyBilling) {
      document.getElementById('lblMonthly').classList.remove('active');
      document.getElementById('lblYearly').classList.add('active');
      pricePkg1.textContent = '22.50';
      pricePkg2.textContent = '37.50';
      annualNote1.textContent = 'Yıllık $270 olarak tek seferde faturalandırılır (%25 İndirimli)';
      annualNote2.textContent = 'Yıllık $450 olarak tek seferde faturalandırılır (%25 İndirimli)';
    } else {
      document.getElementById('lblMonthly').classList.add('active');
      document.getElementById('lblYearly').classList.remove('active');
      pricePkg1.textContent = '30';
      pricePkg2.textContent = '50';
      annualNote1.textContent = 'Aylık faturalandırılır';
      annualNote2.textContent = 'Aylık faturalandırılır';
    }
  });

  // Promo Code Apply
  btnApplyPromo.addEventListener('click', async () => {
    const code = txtPromoCode.value.trim();
    if (!code || !window.cageAI) return;

    const res = await window.cageAI.redeemPromoCode(code);
    promoResultMsg.textContent = res.message;
    promoResultMsg.className = 'promo-result ' + (res.success ? 'success' : 'error');

    if (res.success) {
      await refreshStoreData();
    }
  });

  // Render My Tickets List
  function renderMyTickets() {
    if (!myTicketsList) return;
    const tickets = storeData?.tickets || [];
    if (lblMyTicketsCount) lblMyTicketsCount.textContent = tickets.length;
    if (lblHistoryTotalBadge) lblHistoryTotalBadge.textContent = tickets.length + ' Talep';

    if (tickets.length === 0) {
      myTicketsList.innerHTML = `
        <div class="empty-tickets-notice">
          <span class="empty-icon">📭</span>
          <p style="font-size: 14px; color: #fff; margin-bottom: 6px; font-weight: 600;">Henüz Destek Talebiniz Bulunmuyor</p>
          <p style="font-size: 12px; color: #888; margin-bottom: 16px;">Bir sorunuz, ödeme dekontunuz veya öneriniz olduğunda talep oluşturabilirsiniz.</p>
          <button class="btn btn-secondary btn-sm" id="btnGoCreateTicket">✍️ Yeni Destek Talebi Aç</button>
        </div>
      `;
      const btnGo = document.getElementById('btnGoCreateTicket');
      if (btnGo) {
        btnGo.addEventListener('click', () => {
          if (tabCreateTicket) tabCreateTicket.click();
        });
      }
      return;
    }

    myTicketsList.innerHTML = tickets.map(t => {
      const code = t.ticketCode || ('TCK-' + (t.id ? t.id.slice(-4) : '0000'));
      const cat = t.category || t.packageName || 'Destek';
      const statusText = t.status === 'APPROVED' ? '✅ Çözümlendi / Onaylandı' : (t.status === 'REJECTED' ? '❌ Kapatıldı' : '⏳ İnceleniyor (Sırada)');
      const statusClass = t.status === 'APPROVED' ? 'status-approved' : 'status-pending';
      const dateStr = t.createdAt ? new Date(t.createdAt).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : 'Bugün';
      const priority = t.priority || 'Normal';
      const subject = t.subject || t.packageName || 'Destek Talebi';
      const notes = t.notes || 'Detay girilmedi.';

      return `
        <div class="ticket-item-card">
          <div class="ticket-item-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="ticket-code-tag">${code}</span>
              <span style="font-size: 12px; color: #d97706; font-weight: 600;">${escapeHtml(cat)}</span>
            </div>
            <div class="ticket-badges-group">
              <span class="ticket-status-pill ${statusClass}">${statusText}</span>
            </div>
          </div>
          <h4 class="ticket-subject-text">${escapeHtml(subject)}</h4>
          <p class="ticket-notes-snippet">${escapeHtml(notes)}</p>
          <div class="ticket-meta-footer">
            <span>Öncelik: <strong style="color: #fbbf24;">${escapeHtml(priority)}</strong></span>
            <span>Tarih: ${dateStr}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function selectTicketCategory(catName) {
    if (txtSelectedCategory) txtSelectedCategory.value = catName;
    document.querySelectorAll('.ticket-cat-card').forEach(c => {
      if (c.getAttribute('data-cat') === catName) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    if (ticketPackageBox) {
      if (catName.includes('Satın Alım') || catName.includes('Ödeme')) {
        ticketPackageBox.style.display = 'block';
      } else {
        ticketPackageBox.style.display = 'none';
      }
    }
  }

  document.querySelectorAll('.ticket-cat-card').forEach(c => {
    c.addEventListener('click', () => {
      const cat = c.getAttribute('data-cat');
      selectTicketCategory(cat);
    });
  });

  document.querySelectorAll('.priority-chip').forEach(p => {
    p.addEventListener('click', () => {
      document.querySelectorAll('.priority-chip').forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      if (txtSelectedPriority) txtSelectedPriority.value = p.getAttribute('data-priority');
    });
  });

  if (tabCreateTicket) {
    tabCreateTicket.addEventListener('click', () => {
      tabCreateTicket.classList.add('active');
      if (tabMyTickets) tabMyTickets.classList.remove('active');
      if (ticketCreateView) ticketCreateView.classList.remove('hidden');
      if (ticketHistoryView) ticketHistoryView.classList.add('hidden');
    });
  }

  if (tabMyTickets) {
    tabMyTickets.addEventListener('click', () => {
      tabMyTickets.classList.add('active');
      if (tabCreateTicket) tabCreateTicket.classList.remove('active');
      if (ticketHistoryView) ticketHistoryView.classList.remove('hidden');
      if (ticketCreateView) ticketCreateView.classList.add('hidden');
      renderMyTickets();
    });
  }

  // Buy Buttons -> Open Ticket Modal
  document.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', () => {
      marketModal.classList.add('hidden');
      const pkgId = btn.getAttribute('data-pkg');
      const pkgName = btn.getAttribute('data-name');
      const basePrice = btn.getAttribute('data-price');
      const finalPrice = isYearlyBilling ? (basePrice * 0.75).toFixed(2) + ' USD / Ay (Yıllık %25 İndirimli)' : basePrice + ' USD / Ay';

      selectTicketCategory('Satın Alım & Ödeme');
      if (txtTicketPackage) {
        txtTicketPackage.value = pkgName;
        txtTicketPackage.setAttribute('data-pkg-id', pkgId);
      }
      if (txtTicketPrice) txtTicketPrice.value = finalPrice;
      if (txtTicketSubject) txtTicketSubject.value = pkgName + ' Satın Alım Onayı';
      
      const cUser = storeData?.currentUser;
      if (txtTicketEmail) {
        txtTicketEmail.value = (cUser && cUser.email && !cUser.email.endsWith('@cageai.internal')) ? cUser.email : '';
      }

      if (tabCreateTicket) tabCreateTicket.click();
      ticketModal.classList.remove('hidden');
      renderMyTickets();
    });
  });

  // Ticket Modal Handlers
  navTickets.addEventListener('click', () => {
    selectTicketCategory('Satın Alım & Ödeme');
    if (txtTicketPackage) {
      txtTicketPackage.value = 'Genel Destek / Danışmanlık';
      txtTicketPackage.setAttribute('data-pkg-id', 'support_general');
    }
    if (txtTicketPrice) txtTicketPrice.value = 'Ücretsiz Destek';
    if (txtTicketSubject) txtTicketSubject.value = '';
    if (txtTicketNotes) txtTicketNotes.value = '';
    
    const cUser = storeData?.currentUser;
    if (txtTicketEmail) {
      txtTicketEmail.value = (cUser && cUser.email && !cUser.email.endsWith('@cageai.internal')) ? cUser.email : '';
    }

    if (tabCreateTicket) tabCreateTicket.click();
    ticketModal.classList.remove('hidden');
    renderMyTickets();
  });

  btnCloseTicket.addEventListener('click', () => ticketModal.classList.add('hidden'));

  btnSubmitTicket.addEventListener('click', async () => {
    if (!window.cageAI) return;
    const cat = txtSelectedCategory ? txtSelectedCategory.value : 'Genel Destek';
    const email = txtTicketEmail ? txtTicketEmail.value.trim() : '';
    const subject = txtTicketSubject ? txtTicketSubject.value.trim() : (cat + ' Talebi');
    const notes = txtTicketNotes ? txtTicketNotes.value.trim() : '';
    const priority = txtSelectedPriority ? txtSelectedPriority.value : 'Normal';

    if (!email || !email.includes('@')) {
      showToast('Lütfen geçerli bir yanıt e-posta adresi giriniz.', true);
      if (txtTicketEmail) txtTicketEmail.focus();
      return;
    }

    if (!notes && !subject) {
      showToast('Lütfen talebinizle ilgili bir konu veya açıklama giriniz.', true);
      if (txtTicketNotes) txtTicketNotes.focus();
      return;
    }

    const ticketData = {
      category: cat,
      subject: subject || cat,
      packageId: txtTicketPackage ? txtTicketPackage.getAttribute('data-pkg-id') : null,
      packageName: txtTicketPackage ? txtTicketPackage.value : null,
      price: txtTicketPrice ? txtTicketPrice.value : 'Standart',
      paymentMethod: selPaymentMethod ? selPaymentMethod.value : 'Banka Havale / EFT / Fast',
      email: email,
      priority: priority,
      notes: notes,
      billingCycle: isYearlyBilling ? 'yearly' : 'monthly'
    };

    const res = await window.cageAI.createTicket(ticketData);
    if (res.success) {
      showToast('Destek talebiniz başarıyla iletildi! Taleplerim sekmesinden takip edebilirsiniz.');
      await refreshStoreData();
      if (txtTicketNotes) txtTicketNotes.value = '';
      if (txtTicketSubject) txtTicketSubject.value = '';
      if (tabMyTickets) tabMyTickets.click();
    } else {
      showToast('Talep iletilemedi: ' + (res.error || 'Bilinmeyen hata'), true);
    }
  });

  // USER AUTHENTICATION & ACCOUNT PROFILE LOGIC
  function isUserLoggedIn() {
    const u = storeData?.currentUser;
    if (!u) return false;
    if (u.id === 'user_default' || u.role === 'guest') return false;
    if (u.email === 'kullanici@cageai.internal' && u.username === 'Kullanıcı') return false;
    return true;
  }

  function openAccountSettings() {
    const u = storeData?.currentUser || {};
    const rawUsername = (u.username && u.username !== 'PARADOX') ? u.username : 'Kullanıcı';
    const displayNick = u.nickname || rawUsername;
    
    if (accountLargeAvatar) accountLargeAvatar.textContent = displayNick.charAt(0).toUpperCase();
    if (accountDisplayUsername) accountDisplayUsername.textContent = displayNick;
    if (accountDisplayEmail) accountDisplayEmail.textContent = u.email || 'Giriş yapılmadı';
    if (accountDisplayRole) accountDisplayRole.textContent = u.role === 'admin' ? 'Yetkili Hesap' : 'Kullanıcı';
    
    let planTitle = 'Cage AI Free';
    let codiumInfo = 'Günlük 10 Dk (Sayaçlı)';
    if (u.plan === 'premium_ultra') {
      planTitle = 'Cage AI Premium & Ultra';
      codiumInfo = 'Günde 3x30 Dk (Ultra)';
    } else if (u.plan === 'codium_5_1_ultra') {
      planTitle = 'Cage Codium 5.1 Ultra';
      codiumInfo = 'Günde 5x60 Dk (Zirve Ajan)';
    }
    if (accountPlanLabel) accountPlanLabel.textContent = planTitle;
    if (accountCodiumQuota) accountCodiumQuota.textContent = codiumInfo;

    if (txtStaticUsername) txtStaticUsername.value = rawUsername;
    if (txtUpdateNickname) txtUpdateNickname.value = u.nickname || '';
    if (txtUpdatePassword) txtUpdatePassword.value = '';

    accountSettingsModal.classList.remove('hidden');
  }

  // 1. Popover Kullanıcı Bilgisi Güncelleme
  function updatePopoverUserUI() {
    const u = storeData?.currentUser || {};
    const loggedIn = isUserLoggedIn();

    if (popoverUserEmail) {
      if (loggedIn && u.email && !u.email.endsWith('@cageai.internal')) {
        popoverUserEmail.textContent = u.email;
      } else if (loggedIn && u.username) {
        popoverUserEmail.textContent = u.username;
      } else {
        popoverUserEmail.textContent = 'Kullanıcı (Giriş Yapılmadı)';
      }
    }

    if (popoverPlanBadge) {
      let pName = 'Free plan';
      if (u.plan === 'premium_ultra') pName = 'Premium & Ultra';
      else if (u.plan === 'codium_5_1_ultra') pName = 'Codium 5.1 Ultra';
      popoverPlanBadge.textContent = pName;
    }

    if (popoverAuthIcon && popoverAuthText && menuItemAuthAction) {
      if (loggedIn) {
        popoverAuthIcon.textContent = '🚪';
        popoverAuthText.textContent = 'Çıkış Yap';
        menuItemAuthAction.className = 'popover-item danger-item';
      } else {
        popoverAuthIcon.textContent = '🔑';
        popoverAuthText.textContent = 'Giriş Yap / Kayıt Ol';
        menuItemAuthAction.className = 'popover-item';
      }
    }
  }

  function toggleUserPopover() {
    if (!userPopoverMenu) return;
    const isHidden = userPopoverMenu.classList.contains('hidden');
    if (isHidden) {
      updatePopoverUserUI();
      userPopoverMenu.classList.remove('hidden');
      btnUserProfile.classList.add('active');
    } else {
      userPopoverMenu.classList.add('hidden');
      btnUserProfile.classList.remove('active');
    }
  }

  function closeUserPopover() {
    if (userPopoverMenu && !userPopoverMenu.classList.contains('hidden')) {
      userPopoverMenu.classList.add('hidden');
      btnUserProfile.classList.remove('active');
    }
  }

  // Kullanıcı profiline basıldığında ASLA giriş modalı açılmaz, yalnızca Popover Menü açılır!
  btnUserProfile.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleUserPopover();
  });

  // Menü dışına tıklandığında menüyü kapat
  document.addEventListener('click', (e) => {
    if (userPopoverMenu && !userPopoverMenu.classList.contains('hidden')) {
      if (!userPopoverMenu.contains(e.target) && !btnUserProfile.contains(e.target)) {
        closeUserPopover();
      }
    }
  });

  // Escape ile kapat, Ctrl+, ile Ayarlar Modalını aç
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeUserPopover();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === ',') {
      e.preventDefault();
      closeUserPopover();
      openAccountSettings();
    }
  });

  // Popover Menü İşlemleri
  if (menuItemSettings) {
    menuItemSettings.addEventListener('click', () => {
      closeUserPopover();
      openAccountSettings();
    });
  }

  if (menuItemLanguage) {
    menuItemLanguage.addEventListener('click', () => {
      closeUserPopover();
      showToast('CAGE AI varsayılan olarak Türkçe diline ayarlanmıştır.');
    });
  }

  if (menuItemHelp) {
    menuItemHelp.addEventListener('click', () => {
      closeUserPopover();
      if (navTickets) navTickets.click();
    });
  }

  if (menuItemAbout) {
    menuItemAbout.addEventListener('click', () => {
      closeUserPopover();
      if (aboutLegalModal) {
        aboutLegalModal.classList.remove('hidden');
      }
    });
  }

  if (btnCloseAboutLegal) {
    btnCloseAboutLegal.addEventListener('click', () => {
      if (aboutLegalModal) aboutLegalModal.classList.add('hidden');
      focusActiveInput();
    });
  }

  if (menuItemUpgrade) {
    menuItemUpgrade.addEventListener('click', () => {
      closeUserPopover();
      marketModal.classList.remove('hidden');
    });
  }

  if (menuItemExtensions) {
    menuItemExtensions.addEventListener('click', () => {
      closeUserPopover();
      if (tabModeCode) tabModeCode.click();
    });
  }

  if (menuItemAuthAction) {
    menuItemAuthAction.addEventListener('click', async () => {
      closeUserPopover();
      if (isUserLoggedIn()) {
        if (window.cageAI) {
          await window.cageAI.authLogout();
          showToast('Hesabınızdan güvenle çıkış yapıldı.');
          await refreshStoreData();
          focusActiveInput();
        }
      } else {
        // Yalnızca kullanıcı bilinçli olarak bu menü butonuna basarsa giriş modalı açılır
        authModal.classList.remove('hidden');
      }
    });
  }

  btnAuthTrigger.addEventListener('click', () => authModal.classList.remove('hidden'));

  btnCloseAuth.addEventListener('click', () => {
    authModal.classList.add('hidden');
    focusActiveInput();
  });

  if (btnCloseAccountSettings) {
    btnCloseAccountSettings.addEventListener('click', () => {
      accountSettingsModal.classList.add('hidden');
      focusActiveInput();
    });
  }

  if (btnSettingsUpgradePlan) {
    btnSettingsUpgradePlan.addEventListener('click', () => {
      accountSettingsModal.classList.add('hidden');
      marketModal.classList.remove('hidden');
    });
  }

  if (btnSaveNickname) {
    btnSaveNickname.addEventListener('click', async () => {
      const newNick = txtUpdateNickname ? txtUpdateNickname.value.trim() : '';
      if (!newNick) {
        showToast('Lütfen geçerli bir takma ad (nickname) giriniz.', true);
        return;
      }
      if (!window.cageAI) return;
      const res = await window.cageAI.updateUserProfile({ nickname: newNick });
      if (res.success) {
        showToast(res.message || 'Nickname başarıyla güncellendi!');
        await refreshStoreData();
        openAccountSettings();
      } else {
        showToast(res.message || 'Hata oluştu', true);
      }
    });
  }

  if (btnSavePassword) {
    btnSavePassword.addEventListener('click', async () => {
      const newPass = txtUpdatePassword.value.trim();
      if (!newPass || newPass.length < 3) {
        showToast('Şifre en az 3 karakter olmalıdır.', true);
        return;
      }
      if (!window.cageAI) return;
      const res = await window.cageAI.updateUserProfile({ newPassword: newPass });
      if (res.success) {
        showToast(res.message || 'Şifreniz başarıyla güncellendi!');
        txtUpdatePassword.value = '';
        await refreshStoreData();
      } else {
        showToast(res.message || 'Hata oluştu', true);
      }
    });
  }

  if (btnLogoutUser) {
    btnLogoutUser.addEventListener('click', async () => {
      if (!window.cageAI) return;
      await window.cageAI.authLogout();
      accountSettingsModal.classList.add('hidden');
      showToast('Hesabınızdan güvenle çıkış yapıldı.');
      await refreshStoreData();
      focusActiveInput();
    });
  }

  // Auth Tabs Toggle
  tabAuthLogin.addEventListener('click', () => {
    tabAuthLogin.classList.add('active');
    tabAuthRegister.classList.remove('active');
    formLogin.classList.remove('hidden');
    formRegister.classList.add('hidden');
  });

  tabAuthRegister.addEventListener('click', () => {
    tabAuthRegister.classList.add('active');
    tabAuthLogin.classList.remove('active');
    formRegister.classList.remove('hidden');
    formLogin.classList.add('hidden');
  });

  // Do Login
  btnDoLogin.addEventListener('click', async () => {
    const email = txtLoginEmail.value.trim();
    const password = txtLoginPassword.value.trim();

    if (!email || !password) {
      showToast('Lütfen e-posta ve şifrenizi girin.', true);
      return;
    }

    if (!window.cageAI) return;
    const res = await window.cageAI.authLogin({ email, password });
    if (res.success) {
      showToast(res.message || 'Başarıyla giriş yapıldı!');
      authModal.classList.add('hidden');
      txtLoginPassword.value = '';
      await refreshStoreData();
      focusActiveInput();
    } else {
      showToast(res.message || 'Giriş yapılamadı.', true);
    }
  });

  // Do Register
  btnDoRegister.addEventListener('click', async () => {
    const username = txtRegUsername.value.trim() || 'Kullanıcı';
    const email = txtRegEmail.value.trim();
    const password = txtRegPassword.value.trim();

    if (!email || !password) {
      showToast('Lütfen geçerli bir e-posta ve şifre girin.', true);
      return;
    }

    if (!window.cageAI) return;
    const res = await window.cageAI.authRegister({ username, email, password });
    if (res.success) {
      showToast(res.message || 'Hesabınız oluşturuldu ve giriş yapıldı!');
      authModal.classList.add('hidden');
      txtRegPassword.value = '';
      await refreshStoreData();
      focusActiveInput();
    } else {
      showToast(res.message || 'Kayıt yapılamadı.', true);
    }
  });



  // AUTO-UPDATE & LOCK SYSTEM
  async function checkAppUpdates() {
    if (!window.cageAI) return;
    try {
      const updateRes = await window.cageAI.checkForUpdates();
      if (updateRes && updateRes.hasUpdate) {
        lblUpdateNewVersion.textContent = updateRes.latestVersion;
        lblUpdateCurrentVersion.textContent = updateRes.currentVersion;
        lblUpdateChangelog.textContent = updateRes.releaseNotes || 'Yeni CAGE AI sürümü yayınlandı.';

        if (updateRes.forceUpdate) {
          // Mandatory update lock!
          forceUpdateModal.classList.remove('hidden');
        }
      }
    } catch (e) {
      console.warn('Update check error:', e);
    }
  }

  btnStartAutoUpdate.addEventListener('click', async () => {
    btnStartAutoUpdate.disabled = true;
    updateProgressArea.classList.remove('hidden');

    if (window.cageAI && window.cageAI.onUpdateProgress) {
      window.cageAI.onUpdateProgress((data) => {
        updateDownloadBar.style.width = `${data.pct}%`;
        lblUpdateDownloadPct.textContent = `${data.pct}%`;
        lblUpdateDownloadStatus.textContent = data.status || 'İndiriliyor...';
      });
    }

    try {
      const applyRes = await window.cageAI.downloadAndApplyUpdate();
      alert(applyRes.message || 'Güncelleme başarıyla tamamlandı!');
      forceUpdateModal.classList.add('hidden');
      await refreshStoreData();
    } catch (err) {
      alert('Güncelleme yüklenirken bir hata oluştu: ' + err.message);
      btnStartAutoUpdate.disabled = false;
    }
  });

  // Windows Process Privilege Detection & Elevation Action
  async function checkAdminElevation() {
    if (!window.cageAI || !headerAdminPill) return;
    try {
      const res = await window.cageAI.checkAdminStatus();
      if (res && res.isAdmin) {
        headerAdminPill.classList.remove('not-admin');
        if (headerAdminText) headerAdminText.textContent = 'Sistem İzni (Aktif)';
        headerAdminPill.title = 'Uygulama tam dosya sistemi erişim yetkileriyle çalışmaktadır.';
      } else {
        headerAdminPill.classList.add('not-admin');
        if (headerAdminText) headerAdminText.textContent = 'Dosya İzni İste';
        headerAdminPill.title = 'Tıklayarak Windows Yönetici izniyle yeniden başlatın.';
      }
    } catch (e) {
      console.warn('Admin status check error:', e);
    }
  }

  if (headerAdminPill) {
    headerAdminPill.addEventListener('click', async () => {
      if (!window.cageAI) return;
      const res = await window.cageAI.checkAdminStatus();
      if (!res?.isAdmin) {
        const confirmRelaunch = confirm('CAGE AI dosya sistemine tam okuma/yazma/düzenleme erişimi sağlamak için Windows Yönetici izniyle yeniden başlatılsın mı?');
        if (confirmRelaunch) {
          await window.cageAI.requestAdminRelaunch();
        }
      } else {
        showToast('CAGE AI tam dosya erişim yetkisiyle çalışmaktadır.');
      }
    });
  }

  // Auto-focus prompt input when clicking anywhere on prompt box
  document.querySelectorAll('.prompt-box').forEach(box => {
    box.addEventListener('click', (e) => {
      if (!e.target.closest('button') && !e.target.closest('.model-dropdown') && !e.target.closest('input')) {
        const ta = box.querySelector('textarea');
        if (ta) ta.focus();
      }
    });
  });

  // STARTUP ANIMATED CYBER SPLASH SCREEN (10-15s with dynamic stages, logs & speed counter)
  function runStartupSplashScreen() {
    if (!splashScreen) return;
    
    const splashStepPill = document.getElementById('splashStepPill');
    const splashSpeedLabel = document.getElementById('splashSpeedLabel');
    const splashTerminalLog = document.getElementById('splashTerminalLog');

    const totalDurationMs = 12000; // ~12 seconds
    const intervalMs = 100;
    const totalSteps = totalDurationMs / intervalMs;
    let step = 0;

    const stages = [
      { 
        maxPct: 16, 
        stepName: 'ADIM 1 / 6', 
        text: 'Ortam hazırlanıyor, sistem çekirdeği başlatılıyor...', 
        speed: '⚡ 420 MB/s • Çekirdek Aktif',
        log: '• [SİSTEM] Windows Yönetici Yetkileri Doğrulandı'
      },
      { 
        maxPct: 34, 
        stepName: 'ADIM 2 / 6', 
        text: 'CAGE AI model motoru ve bellek alanı tahsis ediliyor...', 
        speed: '⚡ 580 MB/s • Model Belleği Hazırlanıyor',
        log: '• [AI MOTORU] CAGE Doğal Dil & Akıl Yürütme Katmanı Aktif'
      },
      { 
        maxPct: 54, 
        stepName: 'ADIM 3 / 6', 
        text: 'Codium 5.1 Ultra otonom kodlama ajanı ve alet setleri ısıtılıyor...', 
        speed: '⚡ 710 MB/s • Otonom Ajan Başlatıldı',
        log: '• [CODIUM] Otonom Kod Düzenleme ve Analiz Modülü Hazır'
      },
      { 
        maxPct: 75, 
        stepName: 'ADIM 4 / 6', 
        text: 'Yerel dosya koruma kalkanı ve onay mekanizması senkronize ediliyor...', 
        speed: '⚡ 850 MB/s • İzin Protokolü Doğrulandı',
        log: '• [GÜVENLİK] Kullanıcı Onayı Korumalı Dosya Erişim Kalkanı Aktif'
      },
      { 
        maxPct: 92, 
        stepName: 'ADIM 5 / 6', 
        text: 'Geliştirici çalışma alanı ve çift panelli kod stüdyosu derleniyor...', 
        speed: '⚡ 920 MB/s • Çalışma Alanı Optimize Ediliyor',
        log: '• [STÜDYO] Kod Editörü, Ajan Paneli ve Arayüz Senkronize'
      },
      { 
        maxPct: 100, 
        stepName: 'ADIM 6 / 6', 
        text: 'Sistem hazır! CAGE AI geliştirici ortamı açılıyor...', 
        speed: '⚡ 1.2 GB/s • Tüm Servisler Çevrimiçi',
        log: '• [BAŞLATILDI] CAGE AI v1.0.1 Başarıyla Yüklendi!'
      }
    ];

    const timer = setInterval(() => {
      step++;
      const pct = Math.min(100, Math.floor((step / totalSteps) * 100));
      
      if (splashProgressBar) splashProgressBar.style.width = pct + '%';
      if (splashPercentage) splashPercentage.textContent = pct + '%';

      const currentStage = stages.find(s => pct <= s.maxPct) || stages[stages.length - 1];
      if (splashStepPill && splashStepPill.textContent !== currentStage.stepName) {
        splashStepPill.textContent = currentStage.stepName;
      }
      if (splashStatusText && splashStatusText.textContent !== currentStage.text) {
        splashStatusText.textContent = currentStage.text;
      }
      if (splashSpeedLabel && splashSpeedLabel.textContent !== currentStage.speed) {
        splashSpeedLabel.textContent = currentStage.speed;
      }
      if (splashTerminalLog) {
        const expectedHtml = `<span class="log-line-item">${currentStage.log}</span>`;
        if (splashTerminalLog.innerHTML !== expectedHtml) {
          splashTerminalLog.innerHTML = expectedHtml;
        }
      }

      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          splashScreen.classList.add('fade-out');
          setTimeout(() => {
            splashScreen.style.display = 'none';
            focusActiveInput();
          }, 600);
        }, 300);
      }
    }, intervalMs);
  }

  // Start Splash Screen Immediately
  runStartupSplashScreen();

  // Initialize Application
  await refreshStoreData();
  await loadChatHistory();
  await checkAdminElevation();
  await checkAppUpdates();
});
