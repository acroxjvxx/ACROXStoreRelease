// 1. Aggiunti 'Tray' e 'Menu' ai moduli importati
const { app, BrowserWindow, ipcMain, shell, globalShortcut, dialog, Notification, Tray, Menu } = require('electron'); 
const path = require('path');
const { autoUpdater } = require('electron-updater');
const { exec } = require('child_process');
const fs = require('fs');
const https = require('https');
const os = require('os');

// ⌨️ IMPORTA IL MODULO PER L'ASCOLTO GLOBALE DI TASTIERA E MOUSE (CORRETTO: uIOhook con IO maiuscole)
const { uIOhook } = require('uiohook-napi');

let mainWindow;
let splash;
let audioWindow; // 🎵 Finestra invisibile di background per l'effetto Spotify continuo
let mechSoundWindow; // ⌨️ NUOVA FINESTRA INVISIBILE PER I SUONI DELLA TASTIERA E MOUSE
let tray;        // 📥 Variabile per la Tray Icon
let isQuitting = false; // 🔒 Flag per capire se l'utente vuole chiudere davvero l'app dalla Tray

// 🔒 GESTIONE ISTANZA SINGOLA
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.setAppUserModelId('AISOS');

    app.whenReady().then(() => {
        const notification = new Notification({
            title: 'AISOS',
            body: 'Il launcher è già in esecuzione in background.',
            icon: path.join(__dirname, 'icon.ico'),
            silent: false 
        });
        notification.show();
        
        setTimeout(() => { app.quit(); }, 500);
    });
} else {
    app.setAppUserModelId('AISOS');

    // Se l'utente avvia una seconda istanza, mostriamo e diamo il focus alla finestra esistente
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (mainWindow) {
            if (!mainWindow.isVisible()) mainWindow.show(); // Mostra se era nascosta nella Tray
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    // 📥 FUNZIONE PER CREARE L'ICONA NELLA SYSTEM TRAY
    function createTray() {
        tray = new Tray(path.join(__dirname, 'icon.ico'));
        
        const contextMenu = Menu.buildFromTemplate([
            { 
                label: 'Mostra Launcher', 
                click: () => {
                    if (mainWindow) mainWindow.show();
                } 
            },
            { type: 'separator' },
            { 
                label: 'Esci dal Launcher', 
                click: () => {
                    isQuitting = true; // Impostiamo a true per consentire la chiusura reale
                    app.quit();
                } 
            }
        ]);

        tray.setToolTip('AISOS Launcher');
        tray.setContextMenu(contextMenu);

        // Se l'utente fa doppio clic sull'icona della Tray, riapre la finestra
        tray.on('double-click', () => {
            if (mainWindow) mainWindow.show();
        });
    }

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

    function createMainWindow() {
        mainWindow = new BrowserWindow({
            width: 1000, height: 700, minWidth: 900, minHeight: 600, 
            frame: false, 
            show: false, backgroundColor: '#000000',
            icon: path.join(__dirname, 'icon.ico'),
            webPreferences: { 
                nodeIntegration: true, 
                contextIsolation: false,
                devTools: true // Ti permette di fare ispeziona elemento se necessario
            }
        });
        mainWindow.loadFile('login.html');
        mainWindow.setMenu(null);
        mainWindow.once('ready-to-show', () => { 
            mainWindow.show(); 
            startPingMonitor(); 
        });

        // 🎨 INIEZIONE BARRA PROFESSIONALE E GESTIONE TASTIERA FISICA
        mainWindow.webContents.on('did-finish-load', () => {
            mainWindow.webContents.executeJavaScript(`
                (function() {
                    if (document.getElementById('acrox-custom-bar')) return;

                    document.body.style.marginTop = '18px';

                    const bar = document.createElement('div');
                    bar.id = 'acrox-custom-bar';
                    bar.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 18px; background: #121212; display: flex; justify-content: flex-end; align-items: center; z-index: 999999; -webkit-app-region: drag; border-bottom: 1px solid #1a1a1a; transition: transform 0.2s ease;';

                    const btnContainer = document.createElement('div');
                    btnContainer.style.cssText = 'display: flex; height: 100%; -webkit-app-region: no-drag;';

                    const btnStyle = 'background: transparent !important; border: none !important; color: #cc2424 !important; width: 45px !important; height: 100% !important; cursor: pointer !important; display: flex !important; align-items: center !important; justify-content: center !important; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; font-size: 11px !important; font-weight: normal !important; transition: background 0.15s ease !important; padding: 0 !important; margin: 0 !important; border-radius: 0 !important; box-sizing: border-box !important; box-shadow: none !important; transform: none !important; line-height: 1 !important;';

                    const minBtn = document.createElement('button');
                    minBtn.id = 'btn-minimize'; // ID per richiamo da tastiera
                    minBtn.innerHTML = '—';
                    minBtn.style.cssText = btnStyle;
                    minBtn.onmouseover = () => minBtn.style.background = '#222222';
                    minBtn.onmouseout = () => minBtn.style.background = 'transparent';
                    minBtn.onclick = () => require('electron').ipcRenderer.send('minimize-window');

                    const maxBtn = document.createElement('button');
                    maxBtn.id = 'btn-maximize'; // ID per richiamo da tastiera
                    maxBtn.style.cssText = btnStyle;
                    
                    const squareIcon = document.createElement('div');
                    squareIcon.style.cssText = 'width: 10px; height: 10px; border: 1px solid #cc2424; transition: border-color 0.15s ease; box-sizing: border-box;';
                    maxBtn.appendChild(squareIcon);

                    maxBtn.onmouseover = () => {
                        maxBtn.style.background = '#222222';
                        squareIcon.style.borderColor = '#ff4d4d'; 
                    };
                    maxBtn.onmouseout = () => {
                        maxBtn.style.background = 'transparent';
                        squareIcon.style.borderColor = '#cc2424'; 
                    };
                    maxBtn.onclick = () => require('electron').ipcRenderer.send('maximize-window');

                    const closeBtn = document.createElement('button');
                    closeBtn.id = 'btn-close'; // ID per richiamo da tastiera
                    closeBtn.innerHTML = '✕';
                    closeBtn.style.cssText = btnStyle;
                    closeBtn.style.fontSize = '12px';      
                    closeBtn.style.fontWeight = 'bold';     
                    closeBtn.style.webkitFontSmoothing = 'antialiased';

                    closeBtn.onmouseover = () => {
                        closeBtn.style.background = '#222222';
                        closeBtn.style.color = '#ff4d4d'; 
                    };
                    closeBtn.onmouseout = () => {
                        closeBtn.style.background = 'transparent';
                        closeBtn.style.color = '#cc2424';
                    };
                    closeBtn.onclick = () => require('electron').ipcRenderer.send('close-window');

                    btnContainer.appendChild(minBtn);
                    btnContainer.appendChild(maxBtn);
                    btnContainer.appendChild(closeBtn);
                    bar.appendChild(btnContainer);
                    document.body.appendChild(bar);

                    require('electron').ipcRenderer.on('toggle-fullscreen-ui', (event, isFullScreen) => {
                        if (isFullScreen) {
                            bar.style.display = 'none';
                            document.body.style.marginTop = '0px';
                        } else {
                            bar.style.display = 'flex';
                            document.body.style.marginTop = '19px';
                        }
                    });

                    // ⌨️ ASCOLTATORE TASTIERA INTERNO DENTRO IL DOCUMENTO (Simula il click del mouse sui tasti fisici per la UI)
                    document.addEventListener('keydown', (e) => {
                        // Impediamo il click automatico se l'utente sta scrivendo in un campo di testo
                        const activeEl = document.activeElement;
                        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
                            return; 
                        }

                        // Mappiamo i tasti della tastiera fisica ai pulsanti visibili a schermo
                        if (e.key === 'Escape') {
                            const btn = document.getElementById('btn-close');
                            if (btn) btn.click();
                        } else if (e.key === '-') {
                            const btn = document.getElementById('btn-minimize');
                            if (btn) btn.click();
                        } else if (e.key === '+' || e.key === '*') {
                            const btn = document.getElementById('btn-maximize');
                            if (btn) btn.click();
                        }
                    });
                })();
            `);
        });

        // ⌨️ GESTIONE EVENTI INPUT (Risolve il problema della tastiera bloccata)
        mainWindow.webContents.on('before-input-event', (event, input) => {
            // Gestione esclusiva di F11 per lo schermo intero
            if (input.key === 'F11' && input.type === 'keyDown') {
                const currentFullScreen = mainWindow.isFullScreen();
                mainWindow.setFullScreen(!currentFullScreen);
                mainWindow.setMenuBarVisibility(currentFullScreen); 
                mainWindow.webContents.send('toggle-fullscreen-ui', !currentFullScreen);
                event.preventDefault(); 
            }
            // Non eseguiamo MAI "event.preventDefault()" al di fuori del tasto F11,
            // garantendo che la tastiera invii regolarmente i caratteri a Chromium.
        });

        mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            if (url.startsWith('http')) shell.openExternal(url);
            return { action: 'deny' };
        });

        // 🔒 INTERCETTAZIONE TASTO CHIUDI (X)
        mainWindow.on('close', (event) => {
            if (!isQuitting) {
                event.preventDefault(); // Impedisce la chiusura reale dell'applicazione
                mainWindow.hide();      // Nasconde semplicemente la finestra
            }
        });

        mainWindow.on('closed', () => {
            if (audioWindow && !audioWindow.isDestroyed()) {
                audioWindow.close();
            }
            if (mechSoundWindow && !mechSoundWindow.isDestroyed()) {
                mechSoundWindow.close();
            }
            mainWindow = null;
        });
    }

    // 🎵 Finestra Audio Nascosta (Spotify)
    function createAudioWindow() {
        audioWindow = new BrowserWindow({
            show: false, 
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                autoplayPolicy: 'no-user-gesture-required' 
            }
        });
        
        audioWindow.loadFile('audio-player.html');
    }

    // ⌨️ Finestra Audio Nascosta per MechSounds e MouseSounds
    function createMechSoundWindow() {
        mechSoundWindow = new BrowserWindow({
            show: false, 
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                autoplayPolicy: 'no-user-gesture-required' 
            }
        });
        
        mechSoundWindow.loadFile('mech-sound-player.html');
    }

    // ⌨️ FUNZIONE PER AVVIARE L'ASCOLTO GLOBALE DI TASTIERA E MOUSE DI SISTEMA
    function startGlobalInputListener() {
        // Set per memorizzare i tasti attualmente premuti ed evitare lo spam
        const activeKeys = new Set();

        // 1. Intercettazione tastiera globale
        uIOhook.on('keydown', (event) => {
            const keyId = event.keycode;

            // Evita la ripetizione del suono tenendo premuto il tasto
            if (activeKeys.has(keyId)) return;
            activeKeys.add(keyId);

            if (mechSoundWindow && !mechSoundWindow.isDestroyed()) {
                mechSoundWindow.webContents.send('play-mech-sound-bg');
            }
        });

        uIOhook.on('keyup', (event) => {
            activeKeys.delete(event.keycode);
        });

        // 2. Intercettazione mouse globale (Riproduzione dei suoni click - SCROLL RIMOSSO)
        uIOhook.on('mousedown', (event) => {
            let clickType = 'left';
            if (event.button === 2) {
                clickType = 'right';
            } else if (event.button === 3 || event.button === 1) { 
                clickType = 'wheel'; // Questo riproduce solo il click fisico premendo la rotella, non lo scroll
            }

            if (mechSoundWindow && !mechSoundWindow.isDestroyed()) {
                mechSoundWindow.webContents.send('play-mouse-sound-bg', clickType);
            }
        });

        // Avvia fisicamente l'hook globale per tutto il sistema
        uIOhook.start();
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
            isQuitting = true; // Permettiamo la chiusura per fare l'aggiornamento
            autoUpdater.quitAndInstall(false, true);
        });
    }

    // 🟢 Navigazione IPC
    function openHome() {
        if (mainWindow && !mainWindow.isDestroyed()) {
            setTimeout(() => { mainWindow.loadFile('index.html'); }, 400);
        }
    }

    ipcMain.on('open-home', openHome);

    ipcMain.on('minimize-window', () => {
        if (mainWindow) mainWindow.minimize();
    });

    ipcMain.on('maximize-window', () => {
        if (mainWindow) {
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            } else {
                mainWindow.maximize();
            }
        }
    });

    // Modificato per attivare il trigger di chiusura intercettato da mainWindow.on('close')
    ipcMain.on('close-window', () => {
        if (mainWindow) mainWindow.close(); 
    });

    ipcMain.on('music-command', (event, data) => {
        if (audioWindow && !audioWindow.isDestroyed()) {
            audioWindow.webContents.send('execute-music-command', data);
        }
    });

    ipcMain.on('audio-status-update', (event, data) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('sync-ui-status', data);
        }
    });

    // ⌨️ NUOVI CANALI IPC PER MECH-SOUNDS (Ponte tra la UI e la finestra invisibile della tastiera/mouse)
    ipcMain.on('trigger-mech-sound', () => {
        if (mechSoundWindow && !mechSoundWindow.isDestroyed()) {
            mechSoundWindow.webContents.send('play-mech-sound-bg');
        }
    });

    ipcMain.on('trigger-mouse-sound', (event, type) => {
        // Ignora totalmente qualsiasi richiesta di riproduzione per lo scroll rotella ('wheel')
        if (type === 'wheel') return;

        if (mechSoundWindow && !mechSoundWindow.isDestroyed()) {
            mechSoundWindow.webContents.send('play-mouse-sound-bg', type);
        }
    });

    ipcMain.on('update-mech-profile', (event, profile) => {
        if (mechSoundWindow && !mechSoundWindow.isDestroyed()) {
            mechSoundWindow.webContents.send('change-mech-profile-bg', profile);
        }
    });

    // =================================================================
    // 🤖 ASCOLTATORE IPC PER L'INTELLIGENZA ARTIFICIALE (CON GEMINI API)
    // =================================================================
    const GEMINI_API_KEY = "AQ.Ab8RN6J41J83kUVUHsNOf-EptvIklDQM8N-zueQv7Mr3zp-Bzw";
    let chatHistory = [];
    const pagineConChat = [
        'Files/Games/games.txt',
        'Files/Games/MECCHA CHAMELEON.html'
    ];

    const informazioniPermesse = `
    - Questo launcher è la versione ufficiale di ACROX.
    - Se l'utente riscontra un bug, deve contattare Acrox Dev.
    - Per mettere il gioco a schermo intero bisogna premere F11.
    - COME TROVARE UN GIOCO: Si può cercare nella barra di ricerca. Se non c'è, significa che il gioco non è ancora stato aggiunto. Un ottimo consiglio per cercare effettivamente un gioco è usare le categorie in alto a sinistra della pagina iniziale selezionando il genere corretto del gioco.
    - PREFERITI: Si può aggiungere un gioco ai preferiti cliccando sull'icona del cuore in alto a destra nella scheda del gioco. Per trovarli tutti, basta cliccare sulle 3 lineette in alto a destra e andare nella sezione "Preferiti".
    - GUIDA ALL'INSTALLAZIONE: I giochi si possono scaricare SOLO per PC. Cerca il gioco desiderato e clicca su "Installa". Ti troverai nella pagina ufficiale del gioco all'interno del launcher, dove c'è il pulsante che apre il sito web esterno contenente una o più parti da scaricare. È fondamentale scaricare tutte le parti, altrimenti il gioco non funzionerà.
    - ESTRAZIONE DEI FILE: After aver scaricato tutte le parti, andare nella cartella in cui si trovano i file scaricati (di solito in "Download"). Si consiglia vivamente di creare una nuova cartella in Documenti chiamata "Games" (o come si preferisce). Bisogna estrarre sempre e soltanto il file con la "Parte 1" (anche se ci sono più parti) nella cartella desiderata. Se il gioco ha una sola parte, estrarre semplicemente quell'unico file.
    - AVVIO E COLLEGAMENTO SUL DESKTOP: Entrare nella cartella creata automaticamente o in quella creata dall'utente e individuare il file ".exe" del gioco. Per comodità, si può ridurre a icona/rimpicciolire la finestra della cartella e trascinare il file ".exe" sul Desktop tenendo premuto il tasto destro del mouse per creare in automatico un collegamento. Si consiglia poi di rinominare il collegamento per renderlo più pulito prima di aprire il gioco.
    - PASSWORD DEGLI ARCHIVI: Se l'archivio richiede una password, questa si trova nella pagina ufficiale del gioco sul launcher, precisamente posizionata subito sopra il tasto di installazione.
    - RISOLUZIONE DEI PROBLEMI: Se il gioco non si apre, provare ad aprire l'applicazione di Steam in background oppure disattivare momentaneamente l'antivirus. Se si toglie l'antivirus, eliminare la vecchia cartella del gioco estratta male, effettuare nuovamente l'estrazione della Parte 1 e riaprire il gioco.
    - SUPPORTO E TUTORIAL: Se non si riesce a risolvere, consiglia di guardare il video tutorial "tutorial_games.mp4". Per qualsiasi altro problema o se non si trova un gioco, l'utente può contattare acrox via email all'indirizzo "acroxlauncher@gmail.com" oppure entrare nel server Discord ufficiale al link "https://discord.gg/eCNDfNqw9".
    `;

    const systemPrompt = `
    Tu sei l'assistente virtuale ufficiale di ACROX Launcher.
    Il tuo scopo è aiutare l'utente in modo super amichevole, caloroso e informale. Dagli sempre del "tu"!

    REGOLA DELLA BREVITÀ ASSOLUTA (FONDAMENTALE):
    Non scrivere mai risposte lunghe, liste infinite o papiri di testo. Sii estremamente sintetico! 
    Rispondi in massimo 1 o 2 frasi brevi, andando dritto al punto senza perdersi in chiacchiere. 

    REGOLA DELLO STILE:
    Sii super alla mano, usa un tono giovanile e simpatico. Usa pochissime emoji mirate per rendere la chat viva (es. 👋, 🚀, 🎮).

    REGOLA DELLA CRONOLOGIA:
    Guarda sempre i messaggi precedenti. Se l'utente ti dice "fatto", "ok" o "andiamo avanti", capisci al volo a che punto eravate rimasti e spiegagli il passaggio successivo senza ripetere i saluti o ricominciare da capo.

    REGOLA DELLE RISPOSTE STEP-BY-STEP:
    Spiega SOLTANTO UN SINGOLO PICCOLO PASSAGGIO alla volta. Non dare troppe informazioni insieme per non confonderlo.
    Alla fine di ogni singolo step, chiupi sempre invitandolo al passo successivo, ad esempio: "Fatto? Fammi sapere! 😉" o simili.

    DIVIETO ASSOLUTO DI GRASSETTI:
    Non usare MAI i doppi asterischi (**) o altri symbols per fare il testo in grassetto. Scrivi in testo semplice e pulito.

    REGOLA DELLO STATUS DEI GIOCHI:
    Se ti viene chiesta qualsiasi informazione su un gioco (como installarlo, problemi, requisiti), e ti trovi nella sua pagina, usa esclusivamente i dettagli sintetici del launcher.

    REGOLA DI SICUREZZA:
    Puoi rispondere SOLO usando le informazioni contenute qui sotto:
    """
    ${informazioniPermesse}
    """

    Se ti chiede cose che non c'entrano nulla con il launcher o con i giochi presenti, rifiuta con simpatia usando questa esatta frase:
    "Ops, non posso aiutarti con questo... 🙈 Cos'altro posso fare di bello per te oggi? 🎮"
    `;

    ipcMain.on('cambio-pagina-chat', (event, percorsoPagina) => {
        if (!pagineConChat.includes(percorsoPagina)) {
            chatHistory = [];
        }
    });

    ipcMain.on('richiedi-cronologia-ia', (event) => {
        event.reply('cronologia-ia-caricata', chatHistory);
    });

    ipcMain.removeAllListeners('richiesta-ia');

    ipcMain.on('richiesta-ia', async (event, testoUtente) => {
        try {
            const promptDefinitivo = testoUtente.trim();
            chatHistory.push({ role: 'user', parts: [{ text: promptDefinitivo }] });
            const rispostaIA = await chiamaGeminiAPI(systemPrompt, chatHistory);
            chatHistory.push({ role: 'model', parts: [{ text: rispostaIA }] });
            event.reply('risposta-ia', rispostaIA);
        } catch (error) {
            console.error("Errore IA nel Main Process:", error);
            event.reply('risposta-ia', "Scusami, si è verificato un errore nel processare la richiesta.");
        }
    });

    function chiamaGeminiAPI(systemInstruction, historyContents) {
        return new Promise((resolve, reject) => {
            if (GEMINI_API_KEY === "LA_TUA_GEMINI_API_KEY_QUI" || !GEMINI_API_KEY || GEMINI_API_KEY === "INSERISCI_QUI_LA_TUA_CHIAVE") {
                resolve("Errore: Configura la tua API Key di Gemini nel file main.js.");
                return;
            }

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
            const data = JSON.stringify({
                contents: historyContents,
                systemInstruction: { parts: [{ text: systemInstruction }] },
                generationConfig: { temperature: 0.2 }
            });

            const req = https.request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            }, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(body);
                        if (json.candidates && json.candidates[0].content.parts[0].text) {
                            resolve(json.candidates[0].content.parts[0].text.trim());
                        } else {
                            resolve("Scusami ma non posso aiutarti con questo... cos'altro posso fare per te oggi?");
                        }
                    } catch (e) { reject(e); }
                });
            });
            req.on('error', (e) => reject(e));
            req.write(data);
            req.end();
        });
    }
    // =================================================================
    // =================================================================
    // 🌐 SISTEMA DI CONTROLLO NOMI UTENTE ONLINE (JSONBin.io)
    // =================================================================
    const JSONBIN_API_KEY = "$2a$10$As.RexIaRAJPty3bNUJ/6ez3uqjzmagDfcJ5SZt2Azqh1osdkeEPu"; 
    const JSONBIN_BIN_ID = "6a59678ff5f4af5e2999fbd7"; 

    // Funzione helper per fare richieste HTTPS a JSONBin
    function queryJsonBin(method, payload = null) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.jsonbin.io',
                path: `/v3/b/${JSONBIN_BIN_ID}`,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_API_KEY
                }
            };

            // Se aggiorniamo il file, non usiamo i metadati di risposta di JSONBin
            if (method === 'PUT') {
                options.headers['X-Bin-Private'] = 'true';
            }

            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(body);
                        resolve(json);
                    } catch (e) {
                        reject(e);
                    }
                });
            });

            req.on('error', (e) => reject(e));
            if (payload) {
                req.write(JSON.stringify(payload));
            }
            req.end();
        });
    }

    // Canale 1: Verifica se il nome è già registrato online
    ipcMain.handle('check-username-online', async (event, username) => {
        try {
            const response = await queryJsonBin('GET');
            // I dati effettivi restituiti da JSONBin v3 si trovano dentro .record
            const registeredUsers = response.record.usernames || [];
            
            // Verifica case-insensitive (evita che "Acrox" e "acrox" vengano considerati diversi)
            const nameExists = registeredUsers.some(u => u.toLowerCase() === username.toLowerCase());
            return { success: true, exists: nameExists };
        } catch (error) {
            console.error("Errore verifica database online:", error);
            return { success: false, error: "Impossibile contattare il server per la verifica." };
        }
    });

    // Canale 2: Registra il nuovo nome online
    ipcMain.handle('register-username-online', async (event, username) => {
        try {
            // Scarica la lista attuale
            const response = await queryJsonBin('GET');
            const registeredUsers = response.record.usernames || [];

            // Doppia sicurezza: se per caso esiste già nel mentre, blocca l'operazione
            if (registeredUsers.some(u => u.toLowerCase() === username.toLowerCase())) {
                return { success: false, error: "Nome già occupato." };
            }

            // Aggiungi il nuovo nome e carica la lista aggiornata
            registeredUsers.push(username);
            await queryJsonBin('PUT', { usernames: registeredUsers });

            return { success: true };
        } catch (error) {
            console.error("Errore registrazione database online:", error);
            return { success: false, error: "Errore durante il salvataggio online." };
        }
    });

    // ✏️ Canale 3: Modifica il vecchio nome utente nel database con quello nuovo
    ipcMain.handle('change-username-database', async (event, { oldUsername, newUsername }) => {
        try {
            // Scarica l'attuale lista dei nomi utente online
            const response = await queryJsonBin('GET');
            let registeredUsers = response.record.usernames || [];

            // Verifica se il nuovo nome è già occupato da qualcun altro
            const nameExists = registeredUsers.some(u => u.toLowerCase() === newUsername.toLowerCase());
            if (nameExists) {
                return { success: false, error: "Il nuovo nome utente è già occupato!" };
            }

            // Trova l'indice del vecchio nome (case-insensitive)
            const index = registeredUsers.findIndex(u => u.toLowerCase() === oldUsername.toLowerCase());

            if (index !== -1) {
                // Se esiste il vecchio nome nel database, lo sostituisce direttamente
                registeredUsers[index] = newUsername;
            } else {
                // Se non esiste, aggiunge il nuovo nome come nuova stringa
                registeredUsers.push(newUsername);
            }

            // Aggiorna il database online con la lista modificata
            await queryJsonBin('PUT', { usernames: registeredUsers });

            return { success: true };
        } catch (error) {
            console.error("Errore durante l'aggiornamento del nome nel database online:", error);
            return { success: false, error: "Impossibile comunicare con il database." };
        }
    });

    // =================================================================
    // 🟢 Avvio app
    // =================================================================
    app.whenReady().then(() => {
        createSplash();
        createAudioWindow(); 
        createMechSoundWindow(); // ⌨️ AVVIA LA FINESTRA AUDIO MECH SOUNDS IN BACKGROUND
        createTray(); // 📥 Creiamo la Tray Icon all'avvio dell'app
        
        // ⌨️ AVVIA L'ASCOLTO GLOBALE DI TASTIERA E MOUSE
        startGlobalInputListener();

        setTimeout(() => {
            if (splash) splash.close();
            createMainWindow();
            checkUpdates();
        }, 3000);
    });

    // Modifica il punto di uscita dell'app per fermare l'ascolto globale (CORRETTO: uIOhook)
    app.on('will-quit', () => {
        uIOhook.stop();
    });

    app.on('window-all-closed', () => {
        // Evita che l'applicazione si spenga quando tutte le finestre sono "chiuse" (nascoste)
        if (process.platform !== 'darwin' && isQuitting) {
            app.quit();
        }
    });
}

const net = require('net'); 

// =================================================================
// 🌐 SISTEMA DI RILEVAMENTO PING E STATO RETE (OTTIMIZZATO TCP)
// =================================================================
function startPingMonitor() {
    setInterval(() => {
        if (!mainWindow || mainWindow.isDestroyed()) return;

        const startTime = Date.now();
        
        const socket = net.createConnection(53, '8.8.8.8');
        
        socket.setTimeout(2000);

        socket.on('connect', () => {
            const ping = Date.now() - startTime;
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('update-network-status', { online: true, ping: ping });
            }
            socket.destroy(); 
        });

        socket.on('error', () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('update-network-status', { online: false, ping: 0 });
            }
            socket.destroy();
        });

        socket.on('timeout', () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('update-network-status', { online: false, ping: 0 });
            }
            socket.destroy();
        });
    }, 3000);
}