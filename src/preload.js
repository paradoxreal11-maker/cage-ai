const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cageAI', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // Terms & Install
  getTerms: () => ipcRenderer.invoke('get-terms'),
  completeInstall: (options) => ipcRenderer.invoke('complete-install', options),
  isInstalled: () => ipcRenderer.invoke('is-installed'),

  // State & Data
  getStoreData: () => ipcRenderer.invoke('get-store-data'),
  
  // AI & Chat
  sendChatMessage: (payload) => ipcRenderer.invoke('send-chat-message', payload),
  getChats: () => ipcRenderer.invoke('get-chats'),
  saveChat: (chat) => ipcRenderer.invoke('save-chat', chat),
  deleteChat: (chatId) => ipcRenderer.invoke('delete-chat', chatId),

  // Codium Session & Quota
  startSession: (modelKey) => ipcRenderer.invoke('start-session', modelKey),
  tickSession: (modelKey, seconds) => ipcRenderer.invoke('tick-session', modelKey, seconds),
  resetCodiumFreeQuota: () => ipcRenderer.invoke('reset-codium-free-quota'),

  // Agent File Access
  onFilePermissionRequest: (callback) => {
    ipcRenderer.on('agent-file-permission-request', (event, data) => callback(data));
  },
  submitFilePermissionDecision: (decision) => ipcRenderer.invoke('submit-file-permission-decision', decision),

  // Market & Promo & Support
  redeemPromoCode: (code) => ipcRenderer.invoke('redeem-promo-code', code),
  createTicket: (ticket) => ipcRenderer.invoke('create-ticket', ticket),

  // Auth & OTP
  authSendCode: (email) => ipcRenderer.invoke('auth-send-code', email),
  authVerifyCode: (email, code, username) => ipcRenderer.invoke('auth-verify-code', { email, code, username }),
  authLogout: () => ipcRenderer.invoke('auth-logout'),

  // Admin
  adminLogin: (credentials) => ipcRenderer.invoke('admin-login', credentials),
  adminGetData: () => ipcRenderer.invoke('admin-get-data'),
  adminCreatePromoCode: (promo) => ipcRenderer.invoke('admin-create-promo-code', promo),
  adminDeletePromoCode: (codeId) => ipcRenderer.invoke('admin-delete-promo-code', codeId),
  adminUpdateTicketStatus: (ticketId, status, newPlan) => ipcRenderer.invoke('admin-update-ticket-status', { ticketId, status, newPlan }),
  adminResolveIncident: (incidentId, notes) => ipcRenderer.invoke('admin-resolve-incident', { incidentId, notes }),
  adminPublishUpdate: (updateData) => ipcRenderer.invoke('admin-publish-update', updateData),

  // Auto-Update & Lock System
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadAndApplyUpdate: () => ipcRenderer.invoke('download-and-apply-update'),
  onUpdateProgress: (callback) => {
    ipcRenderer.on('update-download-progress', (event, data) => callback(data));
  }
});
