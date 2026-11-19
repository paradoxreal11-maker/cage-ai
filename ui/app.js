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
  const menuItemApiKey = document.getElementById('menuItemApiKey');
  const menuItemAuthAction = document.getElementById('menuItemAuthAction');
  const popoverAuthIcon = document.getElementById('popoverAuthIcon');
  const popoverAuthText = document.getElementById('popoverAuthText');

  // Chat Mode View Elements
  const welcomeContainerChat = document.getElementById('welcomeContainerChat');
  const messagesContainerChat = document.getElementById('messagesContainerChat');
  const promptInputChat = document.getElementById('promptInputChat');
  const btnSendChat = document.getElementById('btnSendChat');
  const btnAttachmentChat = document.getElementById('btnAttachmentChat');
  const btnModelSelectChat = document.getElementById('btnModelSelectChat');
  const modelDropdownChat = document.getElementById('modelDropdownChat');
  const selectedModelLabelChat = document.getElementById('selectedModelLabelChat');

  // Code Studio View Elements
  const messagesContainerCode = document.getElementById('messagesContainerCode');
  const promptInputCode = document.getElementById('promptInputCode');
  const btnSendCode = document.getElementById('btnSendCode');
  const btnAttachmentCode = document.getElementById('btnAttachmentCode');
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
  const lblActiveFullPath = document.getElementById('lblActiveFullPath');
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
  const txtTicketPackage = document.getElementById('txtTicketPackage');
  const txtTicketPrice = document.getElementById('txtTicketPrice');
  const selPaymentMethod = document.getElementById('selPaymentMethod');
  const txtTicketEmail = document.getElementById('txtTicketEmail');
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

    // User Profile Display (Always "Kullanıcı" as default, never PARADOX)
    const u = storeData.currentUser || {};
    const displayName = (u.username && u.username !== 'PARADOX') ? u.username : 'Kullanıcı';
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

  // SEND MESSAGE: CHAT MODE
  async function handleSendChatMessage() {
    const text = promptInputChat.value.trim();
    if (!text) return;

    promptInputChat.value = '';
    promptInputChat.style.height = 'auto';

    welcomeContainerChat.classList.add('hidden');
    messagesContainerChat.classList.remove('hidden');

    const userMsg = { role: 'user', content: text };
    currentChat.messages.push(userMsg);
    if (currentChat.title === 'Yeni Sohbet') {
      currentChat.title = text.length > 28 ? text.substring(0, 28) + '...' : text;
    }
    renderChatMessageBubble('user', text);

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
        userPrompt: text,
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

      if (reply.fileAction && reply.fileAction.requiresPermission) {
        showFilePermissionDialog(reply.fileAction);
      }
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
    bubble.innerHTML = role === 'user' ? escapeHtml(content) : (content.includes('thinking-container') ? content : formatMarkdown(content));
    row.appendChild(bubble);

    messagesContainerChat.appendChild(row);
    return bubble;
  }

  // SEND MESSAGE: CODE STUDIO MODE
  async function handleSendCodeMessage() {
    const text = promptInputCode.value.trim();
    if (!text) return;

    promptInputCode.value = '';
    promptInputCode.style.height = 'auto';

    const userMsg = { role: 'user', content: text };
    currentCodeChat.messages.push(userMsg);
    if (currentCodeChat.title === 'Yeni Kodlama Projesi') {
      currentCodeChat.title = text.length > 28 ? text.substring(0, 28) + '...' : text;
    }
    renderCodeMessageBubble('user', text);

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
        userPrompt: text,
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
        if (extracted.lang) {
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

      if (reply.fileAction && reply.fileAction.requiresPermission) {
        showFilePermissionDialog(reply.fileAction);
      }
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
    bubble.innerHTML = role === 'user' ? escapeHtml(content) : (content.includes('thinking-container') ? content : formatMarkdown(content));
    row.appendChild(bubble);

    messagesContainerCode.appendChild(row);
    return bubble;
  }

  // Code Block Extractor
  function extractCodeBlock(text) {
    const match = text.match(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/);
    if (match) {
      return {
        lang: match[1] || 'javascript',
        code: match[2].trim()
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

  // Markdown Formatter (Pure CAGE AI - No external dependencies)
  function formatMarkdown(text) {
    let html = escapeHtml(text);

    // Code blocks ```code```
    html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `
        <div class="code-block-wrapper">
          <div class="code-header">
            <span>${lang || 'code'}</span>
            <button class="btn-copy-code" onclick="navigator.clipboard.writeText(this.closest('.code-block-wrapper').querySelector('code').innerText); alert('Kod panoya kopyalandı!');">Kopyala</button>
          </div>
          <pre><code>${code}</code></pre>
        </div>
      `;
    });

    // Inline code `...`
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Bullet lists
    html = html.replace(/^\* (.*$)/gim, '• $1');

    // Newlines to <br>
    html = html.replace(/\n/g, '<br>');

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

  // AGENT FILE PERMISSION WORKFLOW (Explicit User Risk Acceptance)
  function showFilePermissionDialog(action) {
    pendingFilePerm = action;
    permActionType.textContent = action.action || 'YAZMA / DÜZENLEME';
    permFilePath.textContent = action.filePath || 'Bilinmeyen Dosya';
    permFileContent.textContent = action.content || '(İçerik boş veya okunuyor)';
    filePermissionModal.classList.remove('hidden');
  }

  btnApproveFilePerm.addEventListener('click', async () => {
    if (!pendingFilePerm || !window.cageAI) return;
    filePermissionModal.classList.add('hidden');

    const result = await window.cageAI.submitFilePermissionDecision({
      action: pendingFilePerm.action,
      filePath: pendingFilePerm.filePath,
      content: pendingFilePerm.content,
      approved: true
    });

    const successMsg = `✅ **Agent Dosya İşlemi Onaylandı:**\n${result.message || 'Dosya başarıyla yazıldı/güncellendi.'}`;
    if (activeMode === 'code') {
      renderCodeMessageBubble('ai', successMsg);
    } else {
      renderChatMessageBubble('ai', successMsg);
    }
    pendingFilePerm = null;
  });

  btnRejectFilePerm.addEventListener('click', async () => {
    if (!pendingFilePerm || !window.cageAI) return;
    filePermissionModal.classList.add('hidden');

    await window.cageAI.submitFilePermissionDecision({
      action: pendingFilePerm.action,
      filePath: pendingFilePerm.filePath,
      content: pendingFilePerm.content,
      approved: false
    });

    const rejectMsg = `🚫 **Dosya İşlemi Reddedildi:** Kullanıcı dosya değişikliğini onaylamadı.`;
    if (activeMode === 'code') {
      renderCodeMessageBubble('ai', rejectMsg);
    } else {
      renderChatMessageBubble('ai', rejectMsg);
    }
    pendingFilePerm = null;
  });

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

  // Buy Buttons -> Open Ticket Modal
  document.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', () => {
      marketModal.classList.add('hidden');
      const pkgId = btn.getAttribute('data-pkg');
      const pkgName = btn.getAttribute('data-name');
      const basePrice = btn.getAttribute('data-price');
      const finalPrice = isYearlyBilling ? (basePrice * 0.75).toFixed(2) + ' USD / Ay (Yıllık %25 İndirimli)' : basePrice + ' USD / Ay';

      txtTicketPackage.value = pkgName;
      txtTicketPackage.setAttribute('data-pkg-id', pkgId);
      txtTicketPrice.value = finalPrice;
      txtTicketEmail.value = storeData?.currentUser?.email || '';

      ticketModal.classList.remove('hidden');
    });
  });

  // Ticket Modal Handlers
  navTickets.addEventListener('click', () => {
    txtTicketPackage.value = 'Genel Destek / Satın Alım';
    txtTicketPackage.setAttribute('data-pkg-id', 'support_general');
    txtTicketPrice.value = 'Standart';
    txtTicketEmail.value = storeData?.currentUser?.email || '';
    ticketModal.classList.remove('hidden');
  });

  btnCloseTicket.addEventListener('click', () => ticketModal.classList.add('hidden'));

  btnSubmitTicket.addEventListener('click', async () => {
    if (!window.cageAI) return;
    const ticketData = {
      packageId: txtTicketPackage.getAttribute('data-pkg-id'),
      packageName: txtTicketPackage.value,
      price: txtTicketPrice.value,
      paymentMethod: selPaymentMethod.value,
      email: txtTicketEmail.value,
      notes: txtTicketNotes.value,
      billingCycle: isYearlyBilling ? 'yearly' : 'monthly'
    };

    const res = await window.cageAI.createTicket(ticketData);
    if (res.success) {
      showToast('Talebiniz alındı! Yönetici onayladığında paketiniz tanımlanacaktır.');
      ticketModal.classList.add('hidden');
      focusActiveInput();
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
    const dName = (u.username && u.username !== 'PARADOX') ? u.username : 'Kullanıcı';
    
    if (accountLargeAvatar) accountLargeAvatar.textContent = dName.charAt(0).toUpperCase();
    if (accountDisplayUsername) accountDisplayUsername.textContent = dName;
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

    if (txtUpdateUsername) txtUpdateUsername.value = dName;
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
      showToast('CAGE AI v1.0.1 • Windows Yönetici Yetkili Masaüstü Sürümü');
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

  if (menuItemApiKey) {
    menuItemApiKey.addEventListener('click', () => {
      closeUserPopover();
      showToast('CAGE AI Yerel Codium Motoru ve Otonom Ajan API aktif.');
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

  if (btnSaveUsername) {
    btnSaveUsername.addEventListener('click', async () => {
      const newName = txtUpdateUsername.value.trim();
      if (!newName) {
        showToast('Lütfen geçerli bir kullanıcı adı girin.', true);
        return;
      }
      if (!window.cageAI) return;
      const res = await window.cageAI.updateUserProfile({ username: newName });
      if (res.success) {
        showToast(res.message || 'Kullanıcı adınız güncellendi!');
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

  // STARTUP ANIMATED SPLASH SCREEN (10-15s with percentage & status texts)
  function runStartupSplashScreen() {
    if (!splashScreen) return;
    
    const totalDurationMs = 12000; // ~12 seconds
    const intervalMs = 100;
    const totalSteps = totalDurationMs / intervalMs;
    let step = 0;

    const stages = [
      { maxPct: 18, text: 'Ortam oluşturuluyor, lütfen bekleyiniz...' },
      { maxPct: 38, text: 'Sistem çekirdeği ve yapay zeka modülleri doğrulanıyor...' },
      { maxPct: 62, text: 'Codium kodlama ajan mimarisi hazırlanıyor...' },
      { maxPct: 84, text: 'Kullanıcı ortamı ve yerel dosya izinleri senkronize ediliyor...' },
      { maxPct: 98, text: 'Son kontroller tamamlanıyor...' },
      { maxPct: 100, text: 'Hazır! CAGE AI çalışma alanı açılıyor...' }
    ];

    const timer = setInterval(() => {
      step++;
      const pct = Math.min(100, Math.floor((step / totalSteps) * 100));
      
      if (splashProgressBar) splashProgressBar.style.width = pct + '%';
      if (splashPercentage) splashPercentage.textContent = pct + '%';

      const currentStage = stages.find(s => pct <= s.maxPct) || stages[stages.length - 1];
      if (splashStatusText && splashStatusText.textContent !== currentStage.text) {
        splashStatusText.textContent = currentStage.text;
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
