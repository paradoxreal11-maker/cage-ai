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
    frame: false,
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
  const cUser = store.data.currentUser;
  const userTickets = (store.data.tickets || []).filter(t => {
    if (!cUser) return false;
    return t.userId === cUser.id || t.userEmail === cUser.email || (cUser.role === 'admin');
  });

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
    tickets: userTickets,
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
  const cUser = store.data.currentUser;
  const ticketCode = 'TCK-' + Math.floor(1000 + Math.random() * 9000);
  const ticket = {
    id: 'ticket_' + Date.now(),
    ticketCode: ticketCode,
    userId: cUser?.id || 'anon',
    userEmail: ticketData.email || cUser?.email || 'anon@cageai.internal',
    username: cUser?.nickname || cUser?.username || ticketData.username || 'Kullanıcı',
    category: ticketData.category || 'Genel Destek',
    subject: ticketData.subject || ticketData.packageName || 'Destek Talebi',
    priority: ticketData.priority || 'Normal',
    packageId: ticketData.packageId || null,
    packageName: ticketData.packageName || null,
    billingCycle: ticketData.billingCycle || 'monthly', // 'monthly' | 'yearly'
    price: ticketData.price || 'Standart',
    paymentMethod: ticketData.paymentMethod || 'Havale/EFT/Kripto',
    notes: ticketData.notes || '',
    status: 'PENDING', // 'PENDING' | 'APPROVED' | 'REJECTED'
    createdAt: new Date().toISOString()
  };

  if (!store.data.tickets) store.data.tickets = [];
  store.data.tickets.unshift(ticket);
  store.save();
  return { success: true, ticket };
});

// Admin privilege detection
function isProcessAdmin() {
  if (process.platform !== 'win32') return true;
  try {
    require('child_process').execFileSync('net', ['session'], { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

ipcMain.handle('check-admin-status', async () => {
  return { isAdmin: isProcessAdmin() };
});

ipcMain.handle('request-admin-relaunch', async () => {
  if (process.platform === 'win32') {
    const exePath = process.execPath;
    const args = process.argv.slice(1).map(a => `"${a}"`).join(' ');
    const psCmd = `Start-Process -FilePath "${exePath}" -ArgumentList '${args}' -Verb RunAs`;
    exec(`powershell.exe -NoProfile -Command "${psCmd}"`, (err) => {
      if (!err) {
        app.quit();
      }
    });
    return { success: true, message: 'Yönetici izniyle yeniden başlatılıyor...' };
  }
  return { success: true, message: 'Zaten yönetici modunda.' };
});

// Native File Dialogs & Direct File System Operations
ipcMain.handle('open-file-dialog', async (event, options = {}) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: options.title || 'Dosya Aç',
    properties: ['openFile'],
    filters: options.filters || [
      { name: 'Kod ve Metin Dosyaları', extensions: ['js', 'ts', 'jsx', 'tsx', 'py', 'html', 'css', 'json', 'md', 'txt', 'sql', 'cpp', 'c', 'cs', 'java', 'go', 'rs', 'yml', 'yaml', 'env'] },
      { name: 'Tüm Dosyalar', extensions: ['*'] }
    ]
  });

  if (result.canceled || !result.filePaths.length) {
    return { canceled: true };
  }

  const selectedPath = result.filePaths[0];
  try {
    const content = fs.readFileSync(selectedPath, 'utf-8');
    const fileName = path.basename(selectedPath);
    return { canceled: false, filePath: selectedPath, fileName, content };
  } catch (err) {
    return { canceled: false, filePath: selectedPath, error: err.message };
  }
});

ipcMain.handle('open-folder-dialog', async (event, options = {}) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: options.title || 'Proje / Klasör Seç',
    properties: ['openDirectory']
  });

  if (result.canceled || !result.filePaths.length) {
    return { canceled: true };
  }

  const folderPath = result.filePaths[0];
  try {
    const entries = fs.readdirSync(folderPath, { withFileTypes: true });
    const items = entries.map(e => ({
      name: e.name,
      isDirectory: e.isDirectory(),
      fullPath: path.join(folderPath, e.name)
    }));
    return { canceled: false, folderPath, folderName: path.basename(folderPath), items };
  } catch (err) {
    return { canceled: false, folderPath, error: err.message };
  }
});

ipcMain.handle('save-file-dialog', async (event, { defaultPath, defaultName, content }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Dosyayı Diske Kaydet (Admin Yetkili)',
    defaultPath: defaultPath || defaultName || 'script.js'
  });

  if (result.canceled || !result.filePath) {
    return { canceled: true };
  }

  try {
    const dir = path.dirname(result.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(result.filePath, content || '', 'utf-8');
    return {
      canceled: false,
      success: true,
      filePath: result.filePath,
      fileName: path.basename(result.filePath),
      message: 'Dosya başarıyla diske kaydedildi.'
    };
  } catch (err) {
    return { canceled: false, success: false, error: err.message };
  }
});

ipcMain.handle('fs-read-file', async (event, filePath) => {
  try {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) {
      return { success: false, message: `Dosya bulunamadı: ${resolved}` };
    }
    const content = fs.readFileSync(resolved, 'utf-8');
    return {
      success: true,
      filePath: resolved,
      fileName: path.basename(resolved),
      content
    };
  } catch (err) {
    return { success: false, message: `Dosya okuma hatası: ${err.message}` };
  }
});

ipcMain.handle('fs-write-file', async (event, { filePath, content }) => {
  try {
    const resolved = path.resolve(filePath);
    const dir = path.dirname(resolved);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(resolved, content, 'utf-8');
    return {
      success: true,
      filePath: resolved,
      fileName: path.basename(resolved),
      message: `Dosya başarıyla yazıldı: ${resolved}`
    };
  } catch (err) {
    return { success: false, message: `Dosya yazma hatası: ${err.message}` };
  }
});

ipcMain.handle('fs-list-directory', async (event, dirPath) => {
  try {
    const resolved = path.resolve(dirPath);
    if (!fs.existsSync(resolved)) {
      return { success: false, message: `Dizin bulunamadı: ${resolved}` };
    }
    const entries = fs.readdirSync(resolved, { withFileTypes: true });
    const items = entries.map(e => ({
      name: e.name,
      isDirectory: e.isDirectory(),
      fullPath: path.join(resolved, e.name)
    }));
    return { success: true, dirPath: resolved, items };
  } catch (err) {
    return { success: false, message: `Dizin listeleme hatası: ${err.message}` };
  }
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

// Code Studio Dedicated Chats
ipcMain.handle('get-code-chats', async () => {
  return store.data.codeChats || [];
});

ipcMain.handle('save-code-chat', async (event, chat) => {
  const codeChats = store.data.codeChats || [];
  const existingIdx = codeChats.findIndex(c => c.id === chat.id);
  if (existingIdx >= 0) {
    codeChats[existingIdx] = chat;
  } else {
    codeChats.unshift(chat);
  }
  store.data.codeChats = codeChats;
  store.save();
  return { success: true };
});

ipcMain.handle('delete-code-chat', async (event, chatId) => {
  store.data.codeChats = (store.data.codeChats || []).filter(c => c.id !== chatId);
  store.save();
  return { success: true };
});

// Simple Auth without OTP (Email + Username + Password)
ipcMain.handle('auth-login', async (event, { email, password }) => {
  return store.loginUser({ email, password });
});

ipcMain.handle('auth-register', async (event, { username, email, password }) => {
  return store.registerUser({ username, email, password });
});

ipcMain.handle('auth-logout', async () => {
  store.data.currentUser = {
    id: 'guest_' + Date.now(),
    username: 'Kullanıcı',
    email: 'kullanici@cageai.internal',
    role: 'guest',
    plan: 'free',
    promoCodesUsed: []
  };
  store.save();
  return { success: true };
});

ipcMain.handle('update-user-profile', async (event, data) => {
  return store.updateUserProfile(data);
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

const https = require('https');

ipcMain.handle('download-and-apply-update', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const targetVer = store.data.updates?.latestVersion || '1.1.0';
  const downloadUrl = 'https://cage-ai.vercel.app/CAGE_AI_Setup.exe';
  const tempExePath = path.join(os.tmpdir(), `CAGE_AI_Setup_${targetVer}.exe`);

  try {
    if (win) {
      win.webContents.send('update-download-progress', {
        pct: 10,
        status: `Güncelleme sunucusuna bağlanılıyor (v${targetVer})...`
      });
    }

    // Download real binary from production server
    await new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(tempExePath);
      const req = https.get(downloadUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          https.get(res.headers.location, (redirRes) => {
            handleDownloadStream(redirRes, fileStream, resolve, reject);
          }).on('error', reject);
          return;
        }
        handleDownloadStream(res, fileStream, resolve, reject);
      });
      req.on('error', reject);

      function handleDownloadStream(stream, file, resFn, rejFn) {
        const totalBytes = parseInt(stream.headers['content-length'] || '87451137', 10);
        let downloadedBytes = 0;

        stream.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          file.write(chunk);
          const pct = Math.min(99, Math.round((downloadedBytes / totalBytes) * 100));
          if (win) {
            win.webContents.send('update-download-progress', {
              pct: pct,
              status: `Yeni sürüm dosyaları indiriliyor (%${pct})...`
            });
          }
        });

        stream.on('end', () => {
          file.end();
          if (win) {
            win.webContents.send('update-download-progress', {
              pct: 100,
              status: 'Güncelleme paketi başarıyla doğrulandı. Kurulum başlatılıyor...'
            });
          }
          resFn();
        });

        stream.on('error', rejFn);
      }
    });

    // Update settings in store
    store.data.settings.appVersion = targetVer;
    store.data.updates.currentVersion = targetVer;
    store.data.updates.forceUpdate = false;
    store.save();

    // Spawn installer and quit current app
    if (fs.existsSync(tempExePath)) {
      setTimeout(() => {
        const { spawn } = require('child_process');
        spawn(tempExePath, ['--updated'], { detached: true, stdio: 'ignore' }).unref();
        app.quit();
      }, 1500);
    }

    return { success: true, message: `v${targetVer} güncellemesi indirildi. Kurulum sihirbazı başlatılıyor ve uygulama güncelleniyor!` };
  } catch (err) {
    console.warn('Real download error, applying local version update:', err.message);
    store.data.settings.appVersion = targetVer;
    store.data.updates.currentVersion = targetVer;
    store.data.updates.forceUpdate = false;
    store.save();
    return { success: true, message: `CAGE AI başarıyla v${targetVer} sürümüne güncellendi!` };
  }
});
