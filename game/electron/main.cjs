// Desktop app window (Windows / Mac / Linux) for Bloom Merge
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 540,
    height: 900,
    useContentSize: true,
    minWidth: 360,
    minHeight: 600,
    title: 'Bloom Merge',
    backgroundColor: '#7cc46a',
    icon: path.join(__dirname, '..', 'public', 'icons', 'icon-512.png'),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
