const { app, BrowserWindow, ipcMain, shell, globalShortcut } = require('electron'); // Aggiunto globalShortcut
const path = require('path');
const { autoUpdater } = require('electron-updater');
const { exec } = require('child_process');
const fs = require('fs');
const https = require('https');
const os = require('os');

let mainWindow;
let splash;
let audioWindow; // 🎵 Finestra invisibile di background per l'effetto Spotify continuo

// 🟢 Splash Screen
function createSplash() {
    splash = new BrowserWindow({
        width: 250, height: 250, frame: false, transparent: true, 
        alwaysOnTop: true, center: true, resizable: false,
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: { nodeIntegration: true, contextIsolation: false }
    });
    splash.loadFile('splash.html');
    splash.setMenu(null);
}

// 🟢 Finestra principale
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1000, height: 700, minWidth: 900, minHeight: 600, 
        frame: true, show: false, backgroundColor: '#000000',
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: { nodeIntegration: true, contextIsolation: false }
    });
    mainWindow.loadFile('login.html');
    mainWindow.setMenu(null);
    mainWindow.once('ready-to-show', () => { mainWindow.show(); });

    // --- NUOVA LOGICA FULLSCREEN F11 ---
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F11' && input.type === 'keyDown') {
            const isFullScreen = mainWindow.isFullScreen();
            mainWindow.setFullScreen(!isFullScreen);
            // Opzionale: nasconde la barra dei menu se presente
            mainWindow.setMenuBarVisibility(isFullScreen); 
        }
    });
    // -----------------------------------

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http')) shell.openExternal(url);
        return { action: 'deny' };
    });

    // Quando la finestra principale viene chiusa, chiudi anche il player musicale di background
    mainWindow.on('closed', () => {
        if (audioWindow && !audioWindow.isDestroyed()) {
            audioWindow.close();
        }
        mainWindow = null;
    });
}

// 🎵 Creazione della Finestra Audio Nascosta (Risolto blocco Autoplay)
function createAudioWindow() {
    audioWindow = new BrowserWindow({
        show: false, // Completamente invisibile all'utente
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            // ❗ SBLOCCA L'AUTOPLAY: Dice a Chromium di ignorare le restrizioni sui file audio in background
            autoplayPolicy: 'no-user-gesture-required' 
        }
    });
    
    audioWindow.loadFile('audio-player.html');
}

// 🟢 Aggiornamenti automatici
function checkUpdates() {
    autoUpdater.checkForUpdatesAndNotify();
    autoUpdater.on('update-available', () => {
        if (mainWindow) mainWindow.loadFile('updating.html');
    });
    autoUpdater.on('download-progress', (progress) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('download-progress', Math.floor(progress.percent));
        }
    });
    autoUpdater.on('update-downloaded', () => {
        autoUpdater.quitAndInstall(false, true);
    });
}

// 🟢 Navigazione IPC
ipcMain.on('open-home', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
        setTimeout(() => { mainWindow.loadFile('index.html'); }, 400);
    }
});

ipcMain.on('maximize-window', () => {
    if (mainWindow) mainWindow.maximize();
});

// 🎵 PONTE IPC PER LA MUSICA (Invia i comandi dalle pagine visibili alla finestra audio di background)
ipcMain.on('music-command', (event, data) => {
    if (audioWindow && !audioWindow.isDestroyed()) {
        audioWindow.webContents.send('execute-music-command', data);
    }
});

// 🎵 SINCRONIZZAZIONE STATO AUDIO (Passa i dati di avanzamento e brano corrente dalla finestra nascosta alla UI visibile)
ipcMain.on('audio-status-update', (event, data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('sync-ui-status', data);
    }
});

// 🟢 Avvio app
app.whenReady().then(() => {
    createSplash();
    
    // Inizializziamo prima la finestra audio in background così ha il tempo di caricare il database dei brani
    createAudioWindow(); 

    setTimeout(() => {
        if (splash) splash.close();
        createMainWindow();
        checkUpdates();
    }, 3000);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});