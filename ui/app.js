document.addEventListener('DOMContentLoaded', async () => {
  // Global State
  let storeData = null;
  let currentChat = {
    id: 'chat_' + Date.now(),
    title: 'Yeni Sohbet',
    model: 'cage-ai-free',
    messages: []
  };
  let currentModel = 'cage-ai-free';
  let activeTimerInterval = null;
  let pendingFilePerm = null;
  let isYearlyBilling = false;

  // DOM Elements
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

  const btnToggleSidebar = document.getElementById('btnToggleSidebar');
  const appSidebar = document.getElementById('appSidebar');
  const btnNewChat = document.getElementById('btnNewChat');
  const chatHistoryList = document.getElementById('chatHistoryList');

  const navMarket = document.getElementById('navMarket');
  const navTickets = document.getElementById('navTickets');
  const navAdmin = document.getElementById('navAdmin');
  const btnUserProfile = document.getElementById('btnUserProfile');
  const userNameLabel = document.getElementById('userNameLabel');
  const userPlanTag = document.getElementById('userPlanTag');
  const userAvatar = document.getElementById('userAvatar');

  const welcomeContainer = document.getElementById('welcomeContainer');
  const messagesContainer = document.getElementById('messagesContainer');
  const promptInput = document.getElementById('promptInput');
  const btnSend = document.getElementById('btnSend');
  const btnModelSelect = document.getElementById('btnModelSelect');
  const modelDropdown = document.getElementById('modelDropdown');
  const selectedModelLabel = document.getElementById('selectedModelLabel');

  const artifactsPane = document.getElementById('artifactsPane');
  const btnViewArtifacts = document.getElementById('btnViewArtifacts');
  const btnCloseArtifacts = document.getElementById('btnCloseArtifacts');
  const btnCopyArtifact = document.getElementById('btnCopyArtifact');
  const artifactCodeText = document.getElementById('artifactCodeText');
  const artifactFileName = document.getElementById('artifactFileName');

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

  const authModal = document.getElementById('authModal');
  const btnCloseAuth = document.getElementById('btnCloseAuth');
  const btnAuthTrigger = document.getElementById('btnAuthTrigger');
  const authStepEmail = document.getElementById('authStepEmail');
  const authStepCode = document.getElementById('authStepCode');
  const txtAuthEmail = document.getElementById('txtAuthEmail');
  const txtAuthUsername = document.getElementById('txtAuthUsername');
  const btnSendOtp = document.getElementById('btnSendOtp');
  const lblSentEmail = document.getElementById('lblSentEmail');
  const txtAuthOtp = document.getElementById('txtAuthOtp');
  const btnVerifyOtp = document.getElementById('btnVerifyOtp');
  const btnAuthBack = document.getElementById('btnAuthBack');
  const devOtpToast = document.getElementById('devOtpToast');
  const devOtpCode = document.getElementById('devOtpCode');
  const btnOpenAdminAuth = document.getElementById('btnOpenAdminAuth');

  const adminModal = document.getElementById('adminModal');
  const btnCloseAdmin = document.getElementById('btnCloseAdmin');
  const adminLoginScreen = document.getElementById('adminLoginScreen');
  const adminDashboardScreen = document.getElementById('adminDashboardScreen');
  const txtAdminUser = document.getElementById('txtAdminUser');
  const txtAdminPass = document.getElementById('txtAdminPass');
  const btnAdminDoLogin = document.getElementById('btnAdminDoLogin');

  // Window Controls
  btnWinMinimize.addEventListener('click', () => window.cageAI?.minimize());
  btnWinMaximize.addEventListener('click', () => window.cageAI?.maximize());
  btnWinClose.addEventListener('click', () => window.cageAI?.close());

  // Toggle Sidebar
  btnToggleSidebar.addEventListener('click', () => {
    appSidebar.classList.toggle('collapsed');
  });

  // Load Initial Store Data
  async function refreshStoreData() {
    if (!window.cageAI) return;
    storeData = await window.cageAI.getStoreData();

    // User Badge
    const u = storeData.currentUser;
    userNameLabel.textContent = u.username || 'PARADOX';
    userAvatar.textContent = (u.username || 'P').charAt(0).toUpperCase();

    // Plan Display
    let planTitle = 'Free plan';
    if (u.plan === 'premium_ultra') planTitle = 'Premium & Ultra';
    else if (u.plan === 'codium_5_1_ultra') planTitle = 'Codium 5.1 Ultra';
    
    headerPlanName.textContent = planTitle;
    userPlanTag.textContent = `• ${planTitle}`;

    // Admin Access Button
    if (u.role === 'admin') {
      navAdmin.classList.remove('hidden');
    }

    updateTimerDisplay();
  }

  // Timer & Session Logic
  function updateTimerDisplay() {
    if (!storeData) return;

    if (currentModel === 'cage-codium-free') {
      headerTimerPill.classList.remove('hidden');
      btnResetTimer.classList.remove('hidden');
      const freeSession = storeData.sessions.codium_free;
      const remainingSec = Math.max(0, 600 - (freeSession.dailySecondsUsed || 0));
      headerTimerText.textContent = formatTime(remainingSec);
      headerTimerInfo.textContent = `(Kalan Günlük Süre / Sıfırlama: ${2 - (freeSession.resetCountToday || 0)}/2)`;
      startTimerTick('codium_free');
    } else if (currentModel === 'cage-premium-ultra') {
      headerTimerPill.classList.remove('hidden');
      btnResetTimer.classList.add('hidden');
      const ultraSession = storeData.sessions.codium_ultra;
      headerTimerText.textContent = formatTime(ultraSession.remainingSeconds || 1800);
      headerTimerInfo.textContent = `(Oturum: ${(ultraSession.sessionsUsed || 0)}/3)`;
      startTimerTick('codium_ultra');
    } else if (currentModel === 'cage-codium-5-1-ultra') {
      headerTimerPill.classList.remove('hidden');
      btnResetTimer.classList.add('hidden');
      const s51 = storeData.sessions.codium_5_1;
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
          alert('Oturum süreniz sona erdi!');
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

  // Model Selector
  btnModelSelect.addEventListener('click', (e) => {
    e.stopPropagation();
    modelDropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    modelDropdown.classList.add('hidden');
  });

  document.querySelectorAll('.model-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.model-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');

      currentModel = opt.getAttribute('data-model');
      const label = opt.getAttribute('data-label');
      const badge = opt.getAttribute('data-badge');

      selectedModelLabel.textContent = label;
      document.querySelector('.model-badge').textContent = badge;
      modelDropdown.classList.add('hidden');

      updateTimerDisplay();
    });
  });

  // Chat History & Persistence
  async function loadChats() {
    if (!window.cageAI) return;
    const chats = await window.cageAI.getChats();
    chatHistoryList.innerHTML = '';

    chats.forEach(chat => {
      const item = document.createElement('div');
      item.className = 'history-item' + (chat.id === currentChat.id ? ' active' : '');
      item.innerHTML = `
        <span class="chat-title-text">${chat.title || 'Sohbet'}</span>
        <button class="history-del-btn" title="Sil">✕</button>
      `;

      item.querySelector('.chat-title-text').addEventListener('click', () => {
        loadChatSession(chat);
      });

      item.querySelector('.history-del-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        await window.cageAI.deleteChat(chat.id);
        await loadChats();
        if (currentChat.id === chat.id) {
          startNewChat();
        }
      });

      chatHistoryList.appendChild(item);
    });
  }

  function loadChatSession(chat) {
    currentChat = chat;
    currentModel = chat.model || 'cage-ai-free';
    welcomeContainer.classList.add('hidden');
    messagesContainer.classList.remove('hidden');
    messagesContainer.innerHTML = '';

    chat.messages.forEach(msg => {
      renderMessageBubble(msg.role, msg.content, msg.flagged);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    loadChats();
  }

  function startNewChat() {
    currentChat = {
      id: 'chat_' + Date.now(),
      title: 'Yeni Sohbet',
      model: currentModel,
      messages: []
    };
    welcomeContainer.classList.remove('hidden');
    messagesContainer.classList.add('hidden');
    messagesContainer.innerHTML = '';
    promptInput.value = '';
    loadChats();
  }

  btnNewChat.addEventListener('click', startNewChat);

  // Send Message Flow
  async function handleSendMessage() {
    const text = promptInput.value.trim();
    if (!text) return;

    // Reset prompt box
    promptInput.value = '';
    promptInput.style.height = 'auto';

    // Show message container
    welcomeContainer.classList.add('hidden');
    messagesContainer.classList.remove('hidden');

    // Add user message
    const userMsg = { role: 'user', content: text };
    currentChat.messages.push(userMsg);
    if (currentChat.title === 'Yeni Sohbet') {
      currentChat.title = text.length > 28 ? text.substring(0, 28) + '...' : text;
    }
    renderMessageBubble('user', text);

    // AI Placeholder bubble
    const aiBubble = renderMessageBubble('ai', '✦ CAGE AI düşünüyor...');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Call API
    try {
      const res = await window.cageAI.sendChatMessage({
        modelKey: currentModel,
        userPrompt: text,
        history: currentChat.messages.slice(0, -1)
      });

      if (!res.success) {
        aiBubble.innerHTML = `<span style="color: #ef4444;">Hata: ${res.error}</span>`;
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
      await loadChats();

      // Check if Agent wants to perform a file operation (requires explicit user consent)
      if (reply.fileAction && reply.fileAction.requiresPermission) {
        showFilePermissionDialog(reply.fileAction);
      }

      // Check if code was in the response to populate Artifacts pane
      extractAndPreviewArtifact(reply.text);

    } catch (err) {
      aiBubble.innerHTML = `<span style="color: #ef4444;">Bağlantı hatası: ${err.message}</span>`;
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function renderMessageBubble(role, content, isFlagged = false) {
    const row = document.createElement('div');
    row.className = `message-row ${role === 'user' ? 'user' : 'ai'}`;

    if (role === 'ai') {
      const header = document.createElement('div');
      header.className = 'message-header';
      header.innerHTML = `
        <span class="ai-avatar">✳</span>
        <strong>CAGE AI</strong>
        <span style="font-size: 11px; color: #777;">• ${selectedModelLabel.textContent}</span>
        ${isFlagged ? '<span style="color: #ef4444; font-weight: bold; margin-left: 8px;">[GÜVENLİK BİLDİRİMLİ]</span>' : ''}
      `;
      row.appendChild(header);
    }

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = role === 'user' ? escapeHtml(content) : formatMarkdown(content);
    row.appendChild(bubble);

    messagesContainer.appendChild(row);
    return bubble;
  }

  function formatMarkdown(text) {
    let html = escapeHtml(text);

    // Code blocks ```code```
    html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `
        <div class="code-block-wrapper">
          <div class="code-header">
            <span>${lang || 'code'}</span>
            <button class="btn-copy-code" onclick="navigator.clipboard.writeText(this.closest('.code-block-wrapper').querySelector('code').innerText); alert('Kod kopyalandı!');">Kopyala</button>
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

  // Keypress and send listener
  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  btnSend.addEventListener('click', handleSendMessage);

  // Auto-resize textarea
  promptInput.addEventListener('input', () => {
    promptInput.style.height = 'auto';
    promptInput.style.height = Math.min(200, promptInput.scrollHeight) + 'px';
    if (promptInput.value.trim().length > 0) {
      btnSend.classList.add('active');
    } else {
      btnSend.classList.remove('active');
    }
  });

  // Agent File Permission Flow
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

    renderMessageBubble('ai', `✅ **Agent Dosya İşlemi Onaylandı:**\n${result.message || 'Dosya başarıyla güncellendi.'}`);
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

    renderMessageBubble('ai', `🚫 **Dosya İşlemi Reddedildi:** Kullanıcı dosya değişikliğini onaylamadı.`);
    pendingFilePerm = null;
  });

  // Artifacts Viewer
  function extractAndPreviewArtifact(text) {
    const codeMatch = text.match(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/);
    if (codeMatch) {
      artifactCodeText.textContent = codeMatch[2];
      artifactFileName.textContent = codeMatch[1] ? `Code (${codeMatch[1]})` : 'Generated Code';
    }
  }

  btnViewArtifacts.addEventListener('click', () => {
    artifactsPane.classList.toggle('hidden');
  });

  btnCloseArtifacts.addEventListener('click', () => {
    artifactsPane.classList.add('hidden');
  });

  btnCopyArtifact.addEventListener('click', () => {
    navigator.clipboard.writeText(artifactCodeText.textContent);
    alert('Artifact panosuna kopyalandı!');
  });

  // Market Modal & Pricing Toggle
  btnHeaderUpgrade.addEventListener('click', () => marketModal.classList.remove('hidden'));
  navMarket.addEventListener('click', () => marketModal.classList.remove('hidden'));
  btnCloseMarket.addEventListener('click', () => marketModal.classList.add('hidden'));

  billingCycleToggle.addEventListener('change', () => {
    isYearlyBilling = billingCycleToggle.checked;
    if (isYearlyBilling) {
      document.getElementById('lblMonthly').classList.remove('active');
      document.getElementById('lblYearly').classList.add('active');
      // 25% discount
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

  // Buy buttons -> Opens Ticket form
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

  // Submit Ticket
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
      alert('Talebiniz başarıyla oluşturuldu! Yöneticimiz en kısa sürede talebinizi onaylayacak ve paketiniz hesabınıza tanımlanacaktır.');
      ticketModal.classList.add('hidden');
    }
  });

  // Auth / OTP Modal
  btnAuthTrigger.addEventListener('click', () => authModal.classList.remove('hidden'));
  btnUserProfile.addEventListener('click', () => authModal.classList.remove('hidden'));
  btnCloseAuth.addEventListener('click', () => authModal.classList.add('hidden'));

  btnSendOtp.addEventListener('click', async () => {
    const email = txtAuthEmail.value.trim();
    if (!email || !window.cageAI) return;

    const res = await window.cageAI.authSendCode(email);
    if (res.success) {
      authStepEmail.classList.add('hidden');
      authStepCode.classList.remove('hidden');
      lblSentEmail.textContent = email;

      if (res.mode === 'dev_preview') {
        devOtpToast.classList.remove('hidden');
        devOtpCode.textContent = res.code;
      } else {
        devOtpToast.classList.add('hidden');
      }
    } else {
      alert(res.message);
    }
  });

  btnAuthBack.addEventListener('click', () => {
    authStepCode.classList.add('hidden');
    authStepEmail.classList.remove('hidden');
  });

  btnVerifyOtp.addEventListener('click', async () => {
    const email = txtAuthEmail.value.trim();
    const code = txtAuthOtp.value.trim();
    const username = txtAuthUsername.value.trim();

    if (!code || !window.cageAI) return;

    const res = await window.cageAI.authVerifyCode(email, code, username);
    if (res.success) {
      alert('Başarıyla giriş yapıldı!');
      authModal.classList.add('hidden');
      await refreshStoreData();
    } else {
      alert(res.message);
    }
  });

  // Admin Shortcut inside Auth Modal
  btnOpenAdminAuth.addEventListener('click', () => {
    authModal.classList.add('hidden');
    adminModal.classList.remove('hidden');
  });

  // Admin Modal & Dashboard
  navAdmin.addEventListener('click', () => {
    adminModal.classList.remove('hidden');
    if (storeData?.currentUser?.role === 'admin') {
      showAdminDashboard();
    } else {
      adminLoginScreen.classList.remove('hidden');
      adminDashboardScreen.classList.add('hidden');
    }
  });

  btnCloseAdmin.addEventListener('click', () => adminModal.classList.add('hidden'));

  btnAdminDoLogin.addEventListener('click', async () => {
    const u = txtAdminUser.value.trim();
    const p = txtAdminPass.value.trim();

    if (!window.cageAI) return;
    const res = await window.cageAI.adminLogin({ username: u, password: p });
    if (res.success) {
      alert(res.message);
      showAdminDashboard();
      await refreshStoreData();
    } else {
      alert(res.message);
    }
  });

  async function showAdminDashboard() {
    adminLoginScreen.classList.add('hidden');
    adminDashboardScreen.classList.remove('hidden');

    const data = await window.cageAI.adminGetData();

    // Counts
    document.getElementById('countIncidents').textContent = (data.safetyIncidents || []).length;
    document.getElementById('countTickets').textContent = (data.tickets || []).length;
    document.getElementById('countPromos').textContent = (data.promoCodes || []).length;
    document.getElementById('countUsers').textContent = (data.users || []).length;

    renderAdminIncidents(data.safetyIncidents || []);
    renderAdminTickets(data.tickets || []);
    renderAdminPromos(data.promoCodes || []);
    renderAdminUsers(data.users || []);
  }

  // Admin Tabs
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const tabName = tab.getAttribute('data-tab');
      const targetContent = document.getElementById('tabContent' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
      if (targetContent) targetContent.classList.add('active');
    });
  });

  function renderAdminIncidents(incidents) {
    const list = document.getElementById('incidentsList');
    if (incidents.length === 0) {
      list.innerHTML = '<div style="color: #888; font-size: 13px;">Henüz kaydedilmiş güvenlik ihlali veya tehlikeli sohbet bulunmuyor.</div>';
      return;
    }

    list.innerHTML = '';
    incidents.forEach(inc => {
      const card = document.createElement('div');
      card.className = 'incident-card';
      card.innerHTML = `
        <div class="incident-header">
          <strong>Kullanıcı: ${escapeHtml(inc.userEmail)}</strong>
          <span class="incident-badge-crit">${inc.severity} (${inc.status})</span>
        </div>
        <div style="font-size: 12px; color: #ffedd5; margin-bottom: 4px;"><strong>Tespit Nedeni:</strong> ${escapeHtml(inc.reason)}</div>
        <div class="incident-prompt-box">${escapeHtml(inc.prompt)}</div>
        <div class="incident-footer">
          <span>Tarih: ${new Date(inc.timestamp).toLocaleString()} | Model: ${inc.model}</span>
          ${inc.status === 'PENDING_REVIEW' ? `<button class="btn btn-secondary btn-sm" onclick="resolveIncident('${inc.id}')">İncelemeyi Kapat</button>` : '<span style="color: #10b981;">✓ Çözümlendi</span>'}
        </div>
      `;
      list.appendChild(card);
    });
  }

  window.resolveIncident = async (id) => {
    if (!window.cageAI) return;
    await window.cageAI.adminResolveIncident(id, 'Admin tarafından incelendi.');
    showAdminDashboard();
  };

  function renderAdminTickets(tickets) {
    const list = document.getElementById('ticketsList');
    if (tickets.length === 0) {
      list.innerHTML = '<div style="color: #888; font-size: 13px;">Bekleyen satın alma veya destek talebi bulunmuyor.</div>';
      return;
    }

    list.innerHTML = '';
    tickets.forEach(t => {
      const row = document.createElement('div');
      row.className = 'feature-box';
      row.style.marginBottom = '12px';
      row.innerHTML = `
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <strong>${escapeHtml(t.packageName)} (${t.price})</strong>
            <span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background: #333;">${t.status}</span>
          </div>
          <div style="font-size: 12px; color: #aaa;">Kullanıcı: ${escapeHtml(t.userEmail)} | Ödeme: ${t.paymentMethod}</div>
          ${t.notes ? `<div style="font-size: 12px; color: #fbbf24; margin-top: 4px;">Not: ${escapeHtml(t.notes)}</div>` : ''}
          <div style="margin-top: 10px; display: flex; gap: 8px;">
            ${t.status === 'PENDING' ? `
              <button class="btn btn-primary btn-sm" onclick="approveTicket('${t.id}', '${t.packageId}')">Onayla & Paketi Yükselt</button>
              <button class="btn btn-secondary btn-sm" onclick="rejectTicket('${t.id}')">Reddet</button>
            ` : '<span style="color: #10b981; font-size: 12px;">İşlem tamamlandı</span>'}
          </div>
        </div>
      `;
      list.appendChild(row);
    });
  }

  window.approveTicket = async (ticketId, pkgId) => {
    if (!window.cageAI) return;
    await window.cageAI.adminUpdateTicketStatus(ticketId, 'APPROVED', pkgId);
    alert('Talep onaylandı ve kullanıcının paketi anında aktifleştirildi!');
    showAdminDashboard();
    await refreshStoreData();
  };

  window.rejectTicket = async (ticketId) => {
    if (!window.cageAI) return;
    await window.cageAI.adminUpdateTicketStatus(ticketId, 'REJECTED');
    showAdminDashboard();
  };

  function renderAdminPromos(promos) {
    const list = document.getElementById('adminPromosList');
    list.innerHTML = '';
    promos.forEach(p => {
      const div = document.createElement('div');
      div.className = 'feature-box';
      div.style.marginBottom = '8px';
      div.innerHTML = `
        <div style="flex: 1;">
          <strong>KOD: ${p.code} (%${p.discountPct} İndirim - ${p.plan})</strong>
          <div style="font-size: 12px; color: #aaa;">Kullanım: ${p.currentUses}/${p.maxUses} | Geçerlilik: ${p.validUntil}</div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="deletePromo('${p.id}')">Sil</button>
      `;
      list.appendChild(div);
    });
  }

  window.deletePromo = async (id) => {
    if (!window.cageAI) return;
    await window.cageAI.adminDeletePromoCode(id);
    showAdminDashboard();
  };

  document.getElementById('btnAdminCreatePromo').addEventListener('click', async () => {
    const code = document.getElementById('txtNewPromoCode').value.trim();
    const plan = document.getElementById('selNewPromoPlan').value;
    const days = document.getElementById('txtNewPromoDays').value;

    if (!code || !window.cageAI) return;
    await window.cageAI.adminCreatePromoCode({ code, plan, durationDays: days });
    alert('Promosyon kodu oluşturuldu!');
    document.getElementById('txtNewPromoCode').value = '';
    showAdminDashboard();
  });

  function renderAdminUsers(users) {
    const list = document.getElementById('adminUsersList');
    list.innerHTML = '';
    users.forEach(u => {
      const div = document.createElement('div');
      div.className = 'feature-box';
      div.style.marginBottom = '8px';
      div.innerHTML = `
        <div style="flex: 1;">
          <strong>${escapeHtml(u.username)} (${escapeHtml(u.email)})</strong>
          <div style="font-size: 12px; color: #aaa;">Rol: ${u.role} | Paket: <span style="color: #f59e0b;">${u.plan}</span></div>
        </div>
      `;
      list.appendChild(div);
    });
  }

  // Auto-Update & Lock Logic
  const forceUpdateModal = document.getElementById('forceUpdateModal');
  const lblUpdateNewVersion = document.getElementById('lblUpdateNewVersion');
  const lblUpdateCurrentVersion = document.getElementById('lblUpdateCurrentVersion');
  const lblUpdateChangelog = document.getElementById('lblUpdateChangelog');
  const btnStartAutoUpdate = document.getElementById('btnStartAutoUpdate');
  const updateProgressArea = document.getElementById('updateProgressArea');
  const updateDownloadBar = document.getElementById('updateDownloadBar');
  const lblUpdateDownloadStatus = document.getElementById('lblUpdateDownloadStatus');
  const lblUpdateDownloadPct = document.getElementById('lblUpdateDownloadPct');

  async function checkAppUpdates() {
    if (!window.cageAI) return;
    try {
      const updateRes = await window.cageAI.checkForUpdates();
      if (updateRes && updateRes.hasUpdate) {
        lblUpdateNewVersion.textContent = updateRes.latestVersion;
        lblUpdateCurrentVersion.textContent = updateRes.currentVersion;
        lblUpdateChangelog.textContent = updateRes.releaseNotes || 'Yeni CAGE AI sürümü yayınlandı.';

        if (updateRes.forceUpdate) {
          // Force Lock App!
          forceUpdateModal.classList.remove('hidden');
        }
      }
    } catch (e) {
      console.warn('Update check error:', e);
    }
  }

  // Handle Download and Apply Update
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

  // Admin Publish Update Handler
  const btnAdminDoPublishUpdate = document.getElementById('btnAdminDoPublishUpdate');
  if (btnAdminDoPublishUpdate) {
    btnAdminDoPublishUpdate.addEventListener('click', async () => {
      const ver = document.getElementById('txtAdminNewVersion').value.trim();
      const notes = document.getElementById('txtAdminUpdateNotes').value.trim();
      const force = document.getElementById('chkAdminForceUpdate').checked;

      if (!ver || !window.cageAI) return;
      btnAdminDoPublishUpdate.disabled = true;

      const res = await window.cageAI.adminPublishUpdate({
        version: ver,
        releaseNotes: notes,
        forceUpdate: force
      });

      alert(res.message);
      btnAdminDoPublishUpdate.disabled = false;
      showAdminDashboard();
    });
  }

  // Initialize
  await refreshStoreData();
  await loadChats();
  await checkAppUpdates();
});
