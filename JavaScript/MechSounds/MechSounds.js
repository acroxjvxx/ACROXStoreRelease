const { ipcRenderer } = require('electron');

let hasInit = false;

function initMechKeyboardListeners() {
    if (hasInit) return;
    hasInit = true;
    
    // ==========================================
    // 1. GESTIONE TASTIERA FISICA GLOBAL/LOCAL
    // ==========================================
    window.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
            return;
        }

        let code = e.code;
        const keyEl = document.querySelector(`.key[data-key="${code}"]`);
        
        if (keyEl) {
            e.preventDefault(); 
            if (!keyEl.classList.contains('active')) {
                keyEl.classList.add('active');
                ipcRenderer.send('trigger-mech-sound');
            }
        } else {
            ipcRenderer.send('trigger-mech-sound');
        }
    });

    window.addEventListener('keyup', (e) => {
        let code = e.code;
        const keyEl = document.querySelector(`.key[data-key="${code}"]`);
        if (keyEl) {
            keyEl.classList.remove('active');
        }
    });

    document.querySelectorAll('.key').forEach(keyEl => {
        keyEl.addEventListener('mousedown', () => {
            keyEl.classList.add('active');
            ipcRenderer.send('trigger-mech-sound');
        });
        keyEl.addEventListener('mouseup', () => {
            keyEl.classList.remove('active');
        });
        keyEl.addEventListener('mouseleave', () => {
            keyEl.classList.remove('active');
        });
    });

    // ==========================================
    // 2. SELEZIONE SWITCH E PROFILI
    // ==========================================
    window.selectSwitch = function(profile, element) {
        ipcRenderer.send('update-mech-profile', profile);
        
        document.querySelectorAll('.switch-card').forEach(card => card.classList.remove('active'));
        if (element) element.classList.add('active');
        
        ipcRenderer.send('trigger-mech-sound');
    };

    // ==========================================
    // 3. GESTIONE INTERATTIVITÀ MOUSE
    // ==========================================
    const mouseLeft = document.getElementById('mouse-left');
    const mouseRight = document.getElementById('mouse-right');
    const mouseWheel = document.getElementById('mouse-wheel');

    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    document.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            if (mouseLeft) mouseLeft.classList.add('active');
            ipcRenderer.send('trigger-mouse-sound', 'left');
        } else if (e.button === 2) {
            if (mouseRight) mouseRight.classList.add('active');
            ipcRenderer.send('trigger-mouse-sound', 'right');
        } else if (e.button === 1) {
            if (mouseWheel) mouseWheel.classList.add('scrolling');
            ipcRenderer.send('trigger-mouse-sound', 'wheel');
        }
    });

    document.addEventListener('mouseup', (e) => {
        if (e.button === 0) {
            if (mouseLeft) mouseLeft.classList.remove('active');
        } else if (e.button === 2) {
            if (mouseRight) mouseRight.classList.remove('active');
        } else if (e.button === 1) {
            if (mouseWheel) mouseWheel.classList.remove('scrolling');
        }
    });

    document.addEventListener('wheel', () => {
        if (mouseWheel) {
            mouseWheel.classList.add('scrolling');
            ipcRenderer.send('trigger-mouse-sound', 'wheel');
            
            clearTimeout(window.wheelTimeout);
            window.wheelTimeout = setTimeout(() => {
                mouseWheel.classList.remove('scrolling');
            }, 120);
        }
    }, { passive: true });

    // ==========================================
    // 4. NUOVA: GESTIONE AGGIORNAMENTO VOLUME (Risolve il bug)
    // ==========================================
    const keyboardSlider = document.getElementById('keyboard-volume');
    const mouseSlider = document.getElementById('mouse-volume');

    // Se usi due slider separati
    if (keyboardSlider) {
        keyboardSlider.addEventListener('input', (e) => {
            const vol = parseFloat(e.target.value);
            // Invia l'oggetto al canale globale configurato nel main
            ipcRenderer.send('update-mech-volume', { type: 'keyboard', value: vol });
        });
    }

    if (mouseSlider) {
        mouseSlider.addEventListener('input', (e) => {
            const vol = parseFloat(e.target.value);
            ipcRenderer.send('update-mech-volume', { type: 'mouse', value: vol });
        });
    }
    
    // NOTA: Se nella tua UI hai un solo slider generale per entrambi, usa questo blocco:
    /*
    const generalSlider = document.getElementById('general-volume'); // Cambia con l'ID reale
    if (generalSlider) {
        generalSlider.addEventListener('input', (e) => {
            const vol = parseFloat(e.target.value);
            ipcRenderer.send('update-mech-volume', { type: 'keyboard', value: vol });
            ipcRenderer.send('update-mech-volume', { type: 'mouse', value: vol });
        });
    }
    */
}

// Avvia gli ascoltatori appena il file viene caricato nella pagina
document.addEventListener('DOMContentLoaded', initMechKeyboardListeners);
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initMechKeyboardListeners();
}