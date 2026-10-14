const { app, BrowserWindow, screen, ipcMain, Tray, Menu, dialog, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let tray = null;
let cursorInterval = null;

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.exit(0);
} else {
  app.on('second-instance', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height, x, y } = primaryDisplay.bounds;

  mainWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Ensure it floats above regular windows and desktop
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // Initially ignore all mouse events so background windows can be clicked
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Start polling cursor coordinates for Windows hit-testing
  startCursorPolling();

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (cursorInterval) clearInterval(cursorInterval);
  });
}

function startCursorPolling() {
  if (cursorInterval) clearInterval(cursorInterval);

  cursorInterval = setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) return;

    try {
      const cursor = screen.getCursorScreenPoint();
      const bounds = mainWindow.getBounds();
      const relX = cursor.x - bounds.x;
      const relY = cursor.y - bounds.y;

      // Only broadcast if cursor is on screen
      if (relX >= 0 && relX <= bounds.width && relY >= 0 && relY <= bounds.height) {
        mainWindow.webContents.send('global-cursor-pos', { x: relX, y: relY });
      }
    } catch (e) {
      // Screen/window might be changing
    }
  }, 16); // ~60fps cursor polling
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  let icon;

  if (fs.existsSync(iconPath)) {
    icon = nativeImage.createFromPath(iconPath);
  } else {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  tray.setToolTip('LuckyDangle - Desktop Charm');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '✨ LuckyDangle for Windows',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Charms',
      submenu: [
        {
          label: '🧿 Evil Eye (Nazar)',
          click: () => sendMenuAction('set-charm', 'nazar')
        },
        {
          label: '🌶️ Nimbu Mirchi',
          click: () => sendMenuAction('set-charm', 'nimbuMirchi')
        },
        {
          label: '🎎 Japanese Daruma',
          click: () => sendMenuAction('set-charm', 'daruma')
        },
        {
          label: '🪙 Feng Shui Lucky Coin',
          click: () => sendMenuAction('set-charm', 'luckyCoin')
        },
        {
          label: '🎐 Temple Wind Chime',
          click: () => sendMenuAction('set-charm', 'windChime')
        },
        {
          label: '🖼️ Custom Image Charm',
          click: () => sendMenuAction('set-charm', 'custom')
        }
      ]
    },
    {
      label: '⚙️ Settings',
      click: () => sendMenuAction('toggle-settings')
    },
    {
      label: '🎯 Reset Position',
      click: () => sendMenuAction('reset-pos')
    },
    {
      label: '🔔 Toggle Sound',
      click: () => sendMenuAction('toggle-sound')
    },
    { type: 'separator' },
    {
      label: '❌ Quit LuckyDangle',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    sendMenuAction('toggle-settings');
  });
}

function sendMenuAction(action, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('menu-action', action, data);
  }
}

// IPC Handlers
ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win && !win.isDestroyed()) {
    win.setIgnoreMouseEvents(ignore, options);
  }
});

ipcMain.handle('select-custom-image', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Custom Charm Image',
    filters: [
      { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'svg'] }
    ],
    properties: ['openFile']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1) || 'png';
    const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
    return `data:${mime};base64,${data.toString('base64')}`;
  }
  return null;
});

ipcMain.on('close-app', () => {
  app.quit();
});

// App Lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
