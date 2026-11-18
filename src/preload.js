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

  // Code Studio Dedicated Chats
  getCodeChats: () => ipcRenderer.invoke('get-code-chats'),
  saveCodeChat: (chat) => ipcRenderer.invoke('save-code-chat', chat),
  deleteCodeChat: (chatId) => ipcRenderer.invoke('delete-code-chat', chatId),

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

  // Simple Auth (No OTP, Email + Username + Password)
  authLogin: (credentials) => ipcRenderer.invoke('auth-login', credentials),
  authRegister: (userData) => ipcRenderer.invoke('auth-register', userData),
  authLogout: () => ipcRenderer.invoke('auth-logout'),

  // Admin
  adminLogin: (credentials) => ipcRenderer.invoke('admin-login', credentials),
  adminGetData: () => ipcRenderer.invoke('admin-get-data'),
  adminCreatePromoCode: (promo) => ipcRenderer.invoke('admin-create-promo-code', promo),
  adminDeletePromoCode: (codeId) => ipcRenderer.invoke('admin-delete-promo-code', codeId),
  adminUpdateTicketStatus: (ticketId, status, newPlan) => ipcRenderer.invoke('admin-update-ticket-status', { ticketId, status, newPlan }),
  adminResolveIncident: (incidentId, notes) => ipcRenderer.invoke('admin-resolve-incident', { incidentId, notes }),
  adminPublishUpdate: (updateData) => ipcRenderer.invoke('admin-publish-update', updateData),

  // Administrator Privileges & Elevation
  checkAdminStatus: () => ipcRenderer.invoke('check-admin-status'),
  requestAdminRelaunch: () => ipcRenderer.invoke('request-admin-relaunch'),

  // Direct File Access & Editing Operations
  openFileDialog: (options) => ipcRenderer.invoke('open-file-dialog', options),
  openFolderDialog: (options) => ipcRenderer.invoke('open-folder-dialog', options),
  saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options),
  fsReadFile: (filePath) => ipcRenderer.invoke('fs-read-file', filePath),
  fsWriteFile: (payload) => ipcRenderer.invoke('fs-write-file', payload),
  fsListDirectory: (dirPath) => ipcRenderer.invoke('fs-list-directory', dirPath),

  // Auto-Update & Lock System
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadAndApplyUpdate: () => ipcRenderer.invoke('download-and-apply-update'),
  onUpdateProgress: (callback) => {
    ipcRenderer.on('update-download-progress', (event, data) => callback(data));
  }
});
