const { ipcRenderer } = require('electron');

const dbName = "AcroxMusicDB";
const dbVersion = 1;
let db;
let playlist = [];
let currentTrackIndex = -1;
const audioPlayer = new Audio();
const MAX_TRACKS = 10;
let isSeeking = false;
let isRepeatActive = false; // 🔁 Stato della ripetizione del brano singolo (false = Grigio, true = Azzurro)

// 1. Inizializza IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);
        request.onsuccess = (e) => { 
            db = e.target.result; 
            resolve(db); 
        };
        request.onerror = (e) => {
            console.error("Errore IndexedDB nel Player:", e);
            reject(e);
        };
        request.onupgradeneeded = (e) => {
            let database = e.target.result;
            if (!database.objectStoreNames.contains("tracks")) {
                database.createObjectStore("tracks", { keyPath: "id", autoIncrement: true });
            }
        };
    });
}

// 2. Estrae i brani dal Database convertendoli in URL utilizzabili dall'oggetto Audio
function loadPlaylist() {
    return new Promise((resolve, reject) => {
        if (!db) return reject("Database non inizializzato");
        
        const transaction = db.transaction(["tracks"], "readonly");
        const store = transaction.objectStore("tracks");
        const request = store.getAll();

        request.onsuccess = (e) => {
            const rawTracks = e.target.result;
            
            // Rilascia i vecchi ObjectURL per evitare sprechi di memoria RAM
            playlist.forEach(track => {
                if (track.audioSrc) URL.revokeObjectURL(track.audioSrc);
                if (track.coverSrc && !track.coverSrc.startsWith('http')) URL.revokeObjectURL(track.coverSrc);
            });

            playlist = rawTracks.map(track => ({
                title: track.title,
                audioSrc: URL.createObjectURL(track.audioBlob),
                coverSrc: track.coverBlob ? URL.createObjectURL(track.coverBlob) : 'https://placehold.co/150x150/ffffff/000000?text=Audio'
            }));
            
            resolve();
        };

        request.onerror = () => reject("Errore nel recupero dei brani");
    });
}

// 3. Carica una traccia specifica nell'oggetto Audio
function loadTrack(index, forcePlay = false) {
    if (playlist.length === 0 || index < 0 || index >= playlist.length) return;
    
    // 🔁 RESETTA IL REPEAT AD ODNI CAMBIO BRANO (RITORNA IN GRIGIO)
    isRepeatActive = false;
    
    currentTrackIndex = index;
    audioPlayer.src = playlist[currentTrackIndex].audioSrc;
    
    // 💾 SALVA IL TITOLO DEL BRANO ATTUALE PER IL PROSSIMO RIAVVIO
    localStorage.setItem('saved_music_track_title', playlist[currentTrackIndex].title);
    
    if (forcePlay) {
        audioPlayer.play().catch(e => console.log("Riproduzione bloccata o interrotta:", e));
    }
    
    sendTrackStatusToUI();
}

// 4. Passa alla traccia successiva (Loop Continuo a 10 brani)
function playNext() {
    if (playlist.length === 0) return;
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= playlist.length) nextIndex = 0; 
    loadTrack(nextIndex, true);
}

// Eventi nativi del player HTML5 aggiornati per gestire il Repeat
audioPlayer.onended = () => { 
    if (isRepeatActive) {
        audioPlayer.currentTime = 0; // Riparte dall'inizio
        audioPlayer.play().catch(e => console.log(e));
    } else {
        playNext(); 
    }
};

audioPlayer.ontimeupdate = () => {
    // Invia l'avanzamento dei secondi alla UI visibile (es. Settings.html o la nuova pagina Musica.html)
    ipcRenderer.send('audio-status-update', {
        type: 'timeupdate',
        currentTime: audioPlayer.currentTime,
        duration: audioPlayer.duration || 0
    });
};

// Sincronizza i testi, le copertine e lo stato del repeat inviando i dati al Main Process
function sendTrackStatusToUI() {
    if (currentTrackIndex === -1 || playlist.length === 0) return;
    
    ipcRenderer.send('audio-status-update', {
        type: 'trackchange',
        title: playlist[currentTrackIndex].title,
        coverSrc: playlist[currentTrackIndex].coverSrc,
        paused: audioPlayer.paused,
        repeatActive: isRepeatActive // 🔁 INVIA LO STATO DEL REPEAT AGGIORNATO ALLA UI
    });
}

// 5. FUNZIONE DI GESTIONE DEI COMANDI IPC
const handleMusicCommand = (event, command) => {
    switch(command.action) {
        case 'play-pause':
            if (playlist.length === 0) return;
            if (currentTrackIndex === -1) {
                loadTrack(0, true);
            } else {
                if (audioPlayer.paused) {
                    audioPlayer.play().catch(e => console.log(e));
                } else {
                    audioPlayer.pause();
                }
                sendTrackStatusToUI();
            }
            break;

        case 'next': 
            playNext(); 
            break;

        case 'prev':
            if (playlist.length === 0) return;
            let prevIndex = currentTrackIndex - 1;
            if (prevIndex < 0) prevIndex = playlist.length - 1;
            loadTrack(prevIndex, true);
            break;

        case 'volume':
            audioPlayer.volume = command.value;
            // Salva il volume modificato
            localStorage.setItem('saved_music_volume', command.value);
            break;

        case 'seek':
            audioPlayer.currentTime = command.value;
            break;

        case 'seek-index': // Gestisce il click diretto sulla riga del brano dalla lista
            if (command.index >= 0 && command.index < playlist.length) {
                loadTrack(command.index, true);
            }
            break;

        case 'toggle-repeat': // 🔁 Gestione dell'azione inviata dall'interfaccia HTML
            isRepeatActive = !isRepeatActive;
            sendTrackStatusToUI(); // Aggiorna immediatamente la UI per accendere/spegnere l'azzurro
            break;

        case 'request-sync': // Quando l'utente ricarica la pagina, invia subito i dati attivi
            if (currentTrackIndex !== -1) {
                sendTrackStatusToUI();
            }
            break;

        case 'reload-db': // Richiamato quando si aggiunge o si elimina un brano
            // 1. Memorizziamo il titolo della traccia attualmente in riproduzione
            const trackBeforeReload = playlist[currentTrackIndex];
            
            loadPlaylist().then(() => { 
                // 2. Se la playlist ora è vuota (hai eliminato l'ultimo brano rimasto)
                if (playlist.length === 0) {
                    audioPlayer.pause();
                    audioPlayer.src = "";
                    currentTrackIndex = -1;
                    
                    // Forza l'aggiornamento grafico inviando lo stato vuoto alla UI
                    ipcRenderer.send('audio-status-update', {
                        type: 'trackchange',
                        title: 'Nessun brano',
                        coverSrc: 'https://placehold.co/150x150/ffffff/000000?text=Audio',
                        paused: true,
                        repeatActive: false
                    });
                } 
                // 3. Se c'era una canzone in riproduzione, controlliamo se esiste ancora
                else if (trackBeforeReload) {
                    const ancoraPresenteIndex = playlist.findIndex(t => t.title === trackBeforeReload.title);
                    
                    if (ancoraPresenteIndex !== -1) {
                        // La canzone esiste ancora, aggiorna solo la sua nuova posizione nell'indice
                        currentTrackIndex = ancoraPresenteIndex;
                        sendTrackStatusToUI();
                    } else {
                        // LA CANZONE È STATA ELIMINATA! Interrompi l'audio all'istante
                        audioPlayer.pause();
                        audioPlayer.src = "";
                        
                        // Resetta l'indice al primo brano della lista senza farlo partire in automatico
                        currentTrackIndex = 0; 
                        loadTrack(currentTrackIndex, false);
                    }
                } else {
                    sendTrackStatusToUI();
                }
            });
            break;
    }
};

// Ascolta su entrambi i canali per evitare problemi di sincronizzazione tra Main e Renderer
ipcRenderer.on('execute-music-command', handleMusicCommand);
ipcRenderer.on('music-command', handleMusicCommand);

// 6. Avvio e caricamento iniziale asincrono all'apertura dell'applicazione
window.addEventListener('DOMContentLoaded', async () => {
    try {
        await initDB();
        await loadPlaylist();
        
        // 🟢 RECUPERA IL VOLUME SALVATO ALL'AVVIO
        const savedVolume = localStorage.getItem('saved_music_volume');
        if (savedVolume !== null) {
            audioPlayer.volume = parseFloat(savedVolume);
        } else {
            audioPlayer.volume = 0.5; // Default se non esiste
        }
        
        if (playlist.length > 0) {
            // 🟢 RECUPERA L'ULTIMO BRANO ASCOLTATO
            const savedTrackTitle = localStorage.getItem('saved_music_track_title');
            let trackIndexToLoad = 0; // Di base parte dalla prima se non trova riscontri

            if (savedTrackTitle) {
                // Cerca la traccia nella playlist attuale che ha lo stesso titolo salvato
                const foundIndex = playlist.findIndex(t => t.title === savedTrackTitle);
                if (foundIndex !== -1) {
                    trackIndexToLoad = foundIndex;
                }
            }

            // Predispone la canzone salvata (carica il buffer) ma non forzare il .play() 
            // per evitare che Chromium generi un errore di violazione dell'Autoplay prima del login.
            loadTrack(trackIndexToLoad, false); 
        }
    } catch (error) {
        console.error("Errore nell'avvio del player audio di background:", error);
    }
});