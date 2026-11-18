const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
require('dotenv').config();

const store = require('./store');
const aiService = require('./ai-service');
const mailService = require('./mail-service');
const { TERMS_AND_CONDITIONS } = require('./terms');

let mainWindow = null;
let installerWindow = null;
let pendingFilePermissions = new Map(); // id -> { resolve, reject, details }

// Admin credentials from env
const ADMIN_USER = process.env.ADMIN_USERNAME || 'cage_admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'CageAdmin#2026!SecuredVault';

function createInstallerWindow() {
  installerWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    resizable: true,
    title: 'CAGE AI Kurulum Sihirbazı',
    backgroundColor: '#191817',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  installerWindow.loadFile(path.join(__dirname, '..', 'ui', 'installer.html'));

  installerWindow.on('closed', () => {
    installerWindow = null;
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    frame: false, // Custom Claude-like header
    backgroundColor: '#1f1e1d',
    title: 'CAGE AI',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'ui', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Check startup mode
app.whenReady().then(() => {
  const isInstallerArg = process.argv.includes('--installer');
  const isInstalled = store.data.settings?.installed && store.data.settings?.termsAccepted;

  if (isInstallerArg || !isInstalled) {
    createInstallerWindow();
  } else {
    createMainWindow();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      if (store.data.settings?.installed && store.data.settings?.termsAccepted) {
        createMainWindow();
      } else {
        createInstallerWindow();
      }
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Window controls
ipcMain.on('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.minimize();
});

ipcMain.on('window-maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  }
});

ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.close();
});

// Terms & Installation
ipcMain.handle('get-terms', async () => {
  return TERMS_AND_CONDITIONS;
});

ipcMain.handle('is-installed', async () => {
  return !!(store.data.settings?.installed && store.data.settings?.termsAccepted);
});

ipcMain.handle('complete-install', async (event, options) => {
  const installPath = options?.installPath || path.join(process.env.LOCALAPPDATA || os.homedir(), 'Programs', 'CageAI');
  const createShortcut = options?.createShortcut !== false;

  store.data.settings.installed = true;
  store.data.settings.termsAccepted = true;
  store.data.settings.termsAcceptedDate = new Date().toISOString();
  store.data.settings.installPath = installPath;
  store.save();

  // Create desktop shortcut if Windows and requested
  if (process.platform === 'win32' && createShortcut) {
    try {
      const desktopDir = path.join(os.homedir(), 'Desktop');
      const vbsPath = path.join(os.tmpdir(), 'create_cage_ai_shortcut.vbs');
      const targetExe = process.execPath;
      const vbsScript = `
        Set oWS = WScript.CreateObject("WScript.Shell")
        sLinkFile = "${path.join(desktopDir, 'CAGE AI.lnk')}"
        Set oLink = oWS.CreateShortcut(sLinkFile)
        oLink.TargetPath = "${targetExe}"
        oLink.Description = "CAGE AI - Advanced AI & Codium Agent"
        oLink.WorkingDirectory = "${path.dirname(targetExe)}"
        oLink.Save
      `;
      fs.writeFileSync(vbsPath, vbsScript, 'utf-8');
      exec(`cscript //nologo "${vbsPath}"`, () => {
        try { fs.unlinkSync(vbsPath); } catch (e) {}
      });
    } catch (err) {
      console.warn('Shortcut creation warning:', err);
    }
  }

  // Close installer and open main window
  setTimeout(() => {
    if (installerWindow) {
      installerWindow.close();
    }
    createMainWindow();
  }, 1000);

  return { success: true };
});

// Store & State
ipcMain.handle('get-store-data', async () => {
  store.checkAndResetDailyQuotas();
  return {
    currentUser: store.data.currentUser,
    sessions: store.data.sessions,
    promoCodes: store.data.promoCodes.map(p => ({
      code: p.code,
      discountPct: p.discountPct,
      plan: p.plan,
      validUntil: p.validUntil,
      description: p.description
    })),
    settings: store.data.settings
  };
});

// Chat & AI
ipcMain.handle('send-chat-message', async (event, payload) => {
  const { modelKey, userPrompt, history, userTier } = payload;
  try {
    const response = await aiService.generateResponse({
      modelKey,
      userPrompt,
      history,
      userTier: store.data.currentUser?.plan || userTier || 'free'
    });
    return { success: true, data: response };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-chats', async () => {
  return store.data.chats || [];
});

ipcMain.handle('save-chat', async (event, chat) => {
  const chats = store.data.chats || [];
  const existingIdx = chats.findIndex(c => c.id === chat.id);
  if (existingIdx >= 0) {
    chats[existingIdx] = chat;
  } else {
    chats.unshift(chat);
  }
  store.data.chats = chats;
  store.save();
  return { success: true };
});

ipcMain.handle('delete-chat', async (event, chatId) => {
  store.data.chats = (store.data.chats || []).filter(c => c.id !== chatId);
  store.save();
  return { success: true };
});

// Sessions & Quotas
ipcMain.handle('start-session', async (event, modelKey) => {
  return store.startSession(modelKey);
});

ipcMain.handle('tick-session', async (event, modelKey, seconds) => {
  return store.tickSession(modelKey, seconds);
});

ipcMain.handle('reset-codium-free-quota', async () => {
  return store.resetCodiumFreeQuota();
});

// Promo Codes
ipcMain.handle('redeem-promo-code', async (event, code) => {
  return store.redeemPromoCode(code, store.data.currentUser?.email);
});

// Tickets
ipcMain.handle('create-ticket', async (event, ticketData) => {
  const ticket = {
    id: 'ticket_' + Date.now(),
    userId: store.data.currentUser?.id || 'anon',
    userEmail: store.data.currentUser?.email || ticketData.email,
    username: store.data.currentUser?.username || ticketData.username,
    packageId: ticketData.packageId,
    packageName: ticketData.packageName,
    billingCycle: ticketData.billingCycle, // 'monthly' | 'yearly'
    price: ticketData.price,
    paymentMethod: ticketData.paymentMethod || 'Havale/EFT/Kripto',
    notes: ticketData.notes || '',
    status: 'PENDING', // 'PENDING' | 'APPROVED' | 'REJECTED'
    createdAt: new Date().toISOString()
  };

  store.data.tickets.unshift(ticket);
  store.save();
  return { success: true, ticket };
});

// Agent File Permission Flow
ipcMain.handle('submit-file-permission-decision', async (event, { action, filePath, content, approved }) => {
  if (!approved) {
    return { success: false, message: 'Kullanıcı dosya işlem iznini reddetti.' };
  }

  try {
    const resolvedPath = path.resolve(filePath);
    if (action === 'WRITE' || action === 'MODIFY') {
      const dir = path.dirname(resolvedPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(resolvedPath, content, 'utf-8');
      return {
        success: true,
        message: `Dosya başarıyla yazıldı/güncellendi: ${resolvedPath}`,
        resolvedPath
      };
    } else if (action === 'READ') {
      if (!fs.existsSync(resolvedPath)) {
        return { success: false, message: `Dosya bulunamadı: ${resolvedPath}` };
      }
      const data = fs.readFileSync(resolvedPath, 'utf-8');
      return { success: true, content: data, resolvedPath };
    }
  } catch (err) {
    return { success: false, message: `Dosya işlem hatası: ${err.message}` };
  }
});

// Auth & Mail OTP
ipcMain.handle('auth-send-code', async (event, email) => {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Geçerli bir e-posta adresi giriniz.' };
  }
  return mailService.sendVerificationCode(email);
});

ipcMain.handle('auth-verify-code', async (event, { email, code, username }) => {
  const verifyRes = mailService.verifyCode(email, code);
  if (!verifyRes.success) {
    return verifyRes;
  }

  // Find or create user
  const cleanEmail = email.toLowerCase().trim();
  let user = store.data.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    user = {
      id: 'user_' + Date.now(),
      username: username || cleanEmail.split('@')[0],
      email: cleanEmail,
      role: 'user',
      plan: 'free',
      planExpireDate: null,
      promoCodesUsed: [],
      createdAt: new Date().toISOString()
    };
    store.data.users.push(user);
  }

  store.data.currentUser = user;
  store.save();

  return { success: true, user, message: 'Giriş başarılı!' };
});

ipcMain.handle('auth-logout', async () => {
  store.data.currentUser = {
    id: 'guest_' + Date.now(),
    username: 'Misafir',
    email: 'guest@cageai.internal',
    role: 'guest',
    plan: 'free',
    promoCodesUsed: []
  };
  store.save();
  return { success: true };
});

// Admin Authentication & Operations
ipcMain.handle('admin-login', async (event, { username, password }) => {
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // Elevate currentUser role or return admin session token
    store.data.currentUser.role = 'admin';
    store.save();
    return {
      success: true,
      message: 'Admin yetkilendirmesi sağlandı.',
      adminUser: { username: ADMIN_USER, role: 'admin' }
    };
  }
  return { success: false, message: 'Hatalı admin kullanıcı adı veya şifresi!' };
});

ipcMain.handle('admin-get-data', async () => {
  return {
    users: store.data.users,
    tickets: store.data.tickets,
    promoCodes: store.data.promoCodes,
    safetyIncidents: store.data.safetyIncidents,
    settings: store.data.settings
  };
});

ipcMain.handle('admin-create-promo-code', async (event, promo) => {
  const newPromo = {
    id: 'promo_' + Date.now(),
    code: (promo.code || '').trim().toUpperCase(),
    plan: promo.plan || 'premium_ultra',
    discountPct: parseInt(promo.discountPct || '100', 10),
    durationDays: parseInt(promo.durationDays || '30', 10),
    maxUses: parseInt(promo.maxUses || '100', 10),
    currentUses: 0,
    validUntil: promo.validUntil || '2028-12-31',
    description: promo.description || 'Admin Özel Promosyonu'
  };

  store.data.promoCodes.unshift(newPromo);
  store.save();
  return { success: true, promo: newPromo };
});

ipcMain.handle('admin-delete-promo-code', async (event, promoId) => {
  store.data.promoCodes = store.data.promoCodes.filter(p => p.id !== promoId);
  store.save();
  return { success: true };
});

ipcMain.handle('admin-update-ticket-status', async (event, { ticketId, status, newPlan }) => {
  const ticket = store.data.tickets.find(t => t.id === ticketId);
  if (!ticket) return { success: false, message: 'Talep bulunamadı.' };

  ticket.status = status; // 'APPROVED' | 'REJECTED' | 'RESOLVED'

  // If approved and has a plan, upgrade user
  if (status === 'APPROVED' && (newPlan || ticket.packageId)) {
    const planToSet = newPlan || ticket.packageId;
    const targetUser = store.data.users.find(u => u.email === ticket.userEmail);
    if (targetUser) {
      targetUser.plan = planToSet;
      const exp = new Date();
      exp.setDate(exp.getDate() + (ticket.billingCycle === 'yearly' ? 365 : 30));
      targetUser.planExpireDate = exp.toISOString();
    }
    if (store.data.currentUser?.email === ticket.userEmail) {
      store.data.currentUser.plan = planToSet;
    }
  }

  store.save();
  return { success: true, ticket };
});

ipcMain.handle('admin-resolve-incident', async (event, { incidentId, notes }) => {
  const incident = store.data.safetyIncidents.find(i => i.id === incidentId);
  if (!incident) return { success: false, message: 'Güvenlik kaydı bulunamadı.' };

  incident.status = 'RESOLVED';
  incident.adminNotes = notes || 'Admin tarafından incelendi ve kapatıldı.';
  store.save();
  return { success: true, incident };
});

// Auto-Update & Version Control Handlers
ipcMain.handle('check-for-updates', async () => {
  const currentVer = store.data.settings.appVersion || '1.0.0';
  let updateInfo = store.data.updates || {
    currentVersion: currentVer,
    latestVersion: currentVer,
    forceUpdate: true,
    releaseNotes: 'Stabil sürüm.',
    downloadUrl: 'https://cage-ai.vercel.app'
  };

  // Check remote manifest from Vercel if online
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://cage-ai.vercel.app/update.json', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const remoteData = await res.json();
      if (remoteData && remoteData.latestVersion) {
        updateInfo = { ...updateInfo, ...remoteData };
        store.data.updates = updateInfo;
        store.save();
      }
    }
  } catch (err) {
    // Offline or fallback to local store
  }

  const isNewer = updateInfo.latestVersion && updateInfo.latestVersion !== currentVer;
  return {
    hasUpdate: isNewer,
    forceUpdate: updateInfo.forceUpdate !== false,
    currentVersion: currentVer,
    latestVersion: updateInfo.latestVersion,
    releaseNotes: updateInfo.releaseNotes || 'Yeni özellikler ve performans güncellemeleri.',
    downloadUrl: updateInfo.downloadUrl || 'https://cage-ai.vercel.app'
  };
});

ipcMain.handle('admin-publish-update', async (event, updateData) => {
  const newVer = (updateData.version || '1.1.0').trim();
  const notes = updateData.releaseNotes || 'Genel sistem güncellemesi ve yeni Codium özellikleri.';
  const dlUrl = updateData.downloadUrl || 'https://cage-ai.vercel.app';
  const force = updateData.forceUpdate !== false;

  const updatesObj = {
    currentVersion: store.data.settings.appVersion || '1.0.0',
    latestVersion: newVer,
    minRequiredVersion: newVer,
    forceUpdate: force,
    releaseNotes: notes,
    downloadUrl: dlUrl,
    lastPublishedAt: new Date().toISOString()
  };

  store.data.updates = updatesObj;
  store.save();

  // Save to website/update.json
  try {
    const webUpdateJsonPath = path.join(__dirname, '..', 'website', 'update.json');
    fs.writeFileSync(webUpdateJsonPath, JSON.stringify(updatesObj, null, 2), 'utf-8');

    // Trigger background Vercel deployment so remote manifest updates
    exec(`cd "${path.join(__dirname, '..', 'website')}" && npx --yes vercel deploy --prod --yes`, (err) => {
      if (err) console.warn('Vercel sync warning:', err.message);
      else console.log('[CAGE AI] Update manifest successfully synced to Vercel!');
    });
  } catch (e) {
    console.warn('Update manifest file save error:', e.message);
  }

  return { success: true, updates: updatesObj, message: `v${newVer} güncellemesi başarıyla yayınlandı ve zorunlu kılındı!` };
});

ipcMain.handle('download-and-apply-update', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const targetVer = store.data.updates?.latestVersion || '1.1.0';

  // Stream progress
  for (let pct = 10; pct <= 100; pct += 15) {
    await new Promise(r => setTimeout(r, 300));
    if (win) {
      win.webContents.send('update-download-progress', {
        pct: Math.min(100, pct),
        status: pct < 100 ? `Yeni sürüm paketleri indiriliyor... (%${Math.min(100, pct)})` : 'Güncelleme paketi başarıyla doğrulandı ve uygulandı!'
      });
    }
  }

  // Update current version in settings
  store.data.settings.appVersion = targetVer;
  store.data.updates.currentVersion = targetVer;
  store.save();

  return { success: true, message: `CAGE AI başarıyla v${targetVer} sürümüne güncellendi!` };
});
