const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setIgnoreMouseEvents: (ignore, options) => {
    ipcRenderer.send('set-ignore-mouse-events', ignore, options);
  },
  onGlobalCursorPos: (callback) => {
    ipcRenderer.on('global-cursor-pos', (_event, value) => callback(value));
  },
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (_event, action, data) => callback(action, data));
  },
  selectCustomImage: () => ipcRenderer.invoke('select-custom-image'),
  closeApp: () => ipcRenderer.send('close-app')
});
