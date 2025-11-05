const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow;

// 🟢 Creazione finestra principale
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: { nodeIntegration: true, contextIsolation: false }
    });

    mainWindow.setMenu(null);
    mainWindow.loadFile('login.html');

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http')) shell.openExternal(url);
        return { action: 'deny' };
    });
}

// 🟢 Controllo aggiornamenti
function checkUpdates() {
    autoUpdater.checkForUpdates();

    autoUpdater.on('update-available', () => console.log('Aggiornamento disponibile'));
    autoUpdater.on('update-not-available', () => console.log('Nessun aggiornamento disponibile'));
    autoUpdater.on('download-progress', (progress) => {
        if (mainWindow) mainWindow.webContents.send('download-progress', Math.round(progress.percent));
    });
    autoUpdater.on('update-downloaded', () => {
        console.log('Aggiornamento scaricato, riavvio...');
        setTimeout(() => autoUpdater.quitAndInstall(false, true), 500);
    });
    autoUpdater.on('error', (err) => console.error('Errore aggiornamento:', err));
}

// 🟢 Avvio app
app.whenReady().then(() => {
    createMainWindow();
    checkUpdates();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
