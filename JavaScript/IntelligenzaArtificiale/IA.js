// --- CENTRALIZZAZIONE INTERFACCIA E LOGICA IA (ACROX AI) ---

(function() {
    const ipc = window.require ? window.require('electron').ipcRenderer : (typeof ipcRenderer !== 'undefined' ? ipcRenderer : null);
    const nomePaginaCorrente = window.location.pathname.split('/').slice(-3).join('/'); 

    function renderizzaLinkCliccabili(testo) {
        const regexUrl = /(https?:\/\/[^\s]+)/g;
        return testo.replace(regexUrl, function(url) {
            return `<a href="${url}" target="_blank" style="color: #6366f1; text-decoration: underline; font-weight: 600;">${url}</a>`;
        });
    }

    function inviaMessaggioIA() {
        const currentInputField = document.getElementById('ai-user-input');
        const currentMsgsBox = document.getElementById('ai-chat-messages');
        if (!currentInputField || !currentMsgsBox) return;

        const testo = currentInputField.value.trim();
        if (testo === "") return;

        if (currentMsgsBox.children.length === 1 && currentMsgsBox.children[0].textContent.includes("Benvenuto.")) {
            currentMsgsBox.innerHTML = '';
        }

        const divUtente = document.createElement('div');
        divUtente.className = 'ai-bubble user';
        divUtente.textContent = testo;
        currentMsgsBox.appendChild(divUtente);

        currentInputField.value = "";
        currentMsgsBox.scrollTop = currentMsgsBox.scrollHeight;

        const divLoader = document.createElement('div');
        divLoader.className = 'ai-bubble bot';
        divLoader.id = 'ai-loader-msg';
        divLoader.textContent = "Sto pensando...";
        currentMsgsBox.appendChild(divLoader);
        currentMsgsBox.scrollTop = currentMsgsBox.scrollHeight;

        if (ipc) {
            ipc.send('richiesta-ia', testo);
        } else {
            setTimeout(() => {
                document.getElementById('ai-loader-msg')?.remove();
                const divErrore = document.createElement('div');
                divErrore.className = 'ai-bubble bot';
                divErrore.textContent = "Errore: Connessione IPC ad Electron non rilevata.";
                currentMsgsBox.appendChild(divErrore);
                currentMsgsBox.scrollTop = currentMsgsBox.scrollHeight;
            }, 1000);
        }
    }

    // Esponiamo comunque la funzione a livello window per games.txt e altre pagine standard
    window.iaClickAction = function(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const activeChatBox = document.getElementById('ai-chat-box');
        const activeMsgsBox = document.getElementById('ai-chat-messages');
        if (!activeChatBox) return;

        if (activeChatBox.style.display === 'flex') {
            activeChatBox.style.display = 'none';
            activeChatBox.classList.remove('maximized');
        } else {
            activeChatBox.style.display = 'flex';
            if (activeMsgsBox) activeMsgsBox.scrollTop = activeMsgsBox.scrollHeight;
        }
    };

    function toggleMaximizeIA(event) {
        if (event) event.stopPropagation();
        const activeChatBox = document.getElementById('ai-chat-box');
        const activeMsgsBox = document.getElementById('ai-chat-messages');
        if (activeChatBox) {
            activeChatBox.classList.toggle('maximized');
            if (activeMsgsBox) setTimeout(() => { activeMsgsBox.scrollTop = activeMsgsBox.scrollHeight; }, 100);
        }
    }

    // Se l'HTML della chat esiste già, aggiorna la pagina su Electron ed esci
    if (document.getElementById('ai-chat-box')) {
        if (ipc) {
            ipc.send('cambio-pagina-chat', nomePaginaCorrente || 'Files/Games/games.txt');
        }
        return;
    }

    // Iniezione dinamica del CSS
    const stileIA = document.createElement('style');
    stileIA.textContent = `
        .ai-chat-container {
            position: fixed; bottom: 24px; right: 24px;
            width: 360px; height: 500px;
            background: rgba(15, 15, 18, 0.96);
            border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);
            z-index: 99999; display: none; flex-direction: column;
            overflow: hidden; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ai-chat-container.maximized {
            bottom: auto; right: auto;
            top: 50%; left: 50%; 
            transform: translate(-50%, -50%) !important;
            width: 70%; height: 75%; max-width: 900px; max-height: 700px;
        }
        .ai-chat-header {
            background: rgba(255, 255, 255, 0.02); padding: 14px 18px;
            display: flex; align-items: center; justify-content: space-between;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .ai-chat-controls { display: flex; align-items: center; gap: 12px; }
        .ai-header-btn {
            background: transparent; border: none; color: rgba(228, 228, 231, 0.5);
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: all 0.2s ease; padding: 4px; border-radius: 6px;
        }
        .ai-header-btn:hover { background: rgba(255, 255, 255, 0.05); color: #ffffff; }
        .ai-chat-close-btn:hover { color: #f43f5e; background: rgba(244, 63, 94, 0.1); }
        .ai-chat-messages { flex-grow: 1; padding: 18px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
        .ai-bubble { max-width: 82%; padding: 11px 15px; border-radius: 12px; font-size: 13px; line-height: 1.45; word-wrap: break-word; }
        .ai-bubble.bot { background: rgba(255, 255, 255, 0.04); color: #e4e4e7; align-self: flex-start; border-bottom-left-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.02); }
        .ai-bubble.user { background: #5154ed; color: #ffffff; align-self: flex-end; border-bottom-right-radius: 4px; box-shadow: 0 4px 12px rgba(81, 84, 237, 0.25); }
        .ai-chat-input-wrapper { padding: 14px; background: rgba(0, 0, 0, 0.25); border-top: 1px solid rgba(255, 255, 255, 0.05); display: flex; gap: 10px; }
        .ai-chat-input-wrapper input { flex-grow: 1; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); padding: 11px 14px; border-radius: 10px; color: #ffffff; font-size: 13px; outline: none; }
        .ai-chat-input-wrapper input:focus { border-color: #6366f1; }
        .ai-chat-send-btn { background: #5154ed; color: #ffffff; border: none; padding: 0 16px; border-radius: 10px; font-weight: 600; font-size: 13px; cursor: pointer; transition: background 0.2s; }
        .ai-chat-send-btn:hover { background: #6366f1; }
    `;
    document.head.appendChild(stileIA);

    // Iniezione dinamica dell'HTML della Chat nel Body
    const divChatContainer = document.createElement('div');
    divChatContainer.className = 'ai-chat-container';
    divChatContainer.id = 'ai-chat-box';
    divChatContainer.innerHTML = `
        <div class="ai-chat-header">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 24px; height: 24px; border-radius: 50%; background: url('Images/IA.gif') no-repeat center; background-size: cover; border: 1px solid rgba(255,255,255,0.15)"></div>
                <span style="font-weight: 700; font-size: 14px; color: #ffffff; letter-spacing: 0.3px;">AISOS IA</span>
            </div>
            <div class="ai-chat-controls">
                <button class="ai-header-btn" title="Svuota chat" id="ai-btn-clear" style="font-size: 14px;">🗑️</button>
                <button class="ai-header-btn" title="Ingrandisci al centro" id="ai-btn-maximize" style="font-size: 13px;">↕</button>
                <button class="ai-header-btn ai-chat-close-btn" id="ai-btn-close" style="font-size: 20px; line-height: 1;">&times;</button>
            </div>
        </div>
        <div class="ai-chat-messages" id="ai-chat-messages">
            <div class="ai-bubble bot">Benvenuto. Sono la tua intelligenza artificiale personale. Come posso assisterti quest'oggi?</div>
        </div>
        <div class="ai-chat-input-wrapper">
            <input type="text" id="ai-user-input" placeholder="Chiedi qualcosa all'IA...">
            <button class="ai-chat-send-btn" id="ai-btn-send">Invia</button>
        </div>
    `;
    document.body.appendChild(divChatContainer);

    // Aggancio dei listener fissi tramite proprietà dirette (immuni ai reset di Electron)
    document.getElementById('ai-btn-maximize').onclick = toggleMaximizeIA;
    document.getElementById('ai-btn-clear').onclick = function(e) {
        if (e) e.stopPropagation();
        const activeMsgsBox = document.getElementById('ai-chat-messages');
        if (activeMsgsBox) activeMsgsBox.innerHTML = '<div class="ai-bubble bot">Benvenuto. Sono la tua intelligenza artificiale personale. Come posso assisterti quest\'oggi?</div>';
        if (ipc) ipc.send('svuota-cronologia-ia');
    };
    document.getElementById('ai-btn-close').onclick = window.iaClickAction;
    document.getElementById('ai-btn-send').onclick = (e) => { e.stopPropagation(); inviaMessaggioIA(); };
    
    const inputEl = document.getElementById('ai-user-input');
    inputEl.onkeydown = (e) => { 
        e.stopPropagation(); 
        if (e.key === 'Enter') inviaMessaggioIA(); 
    };
    inputEl.onclick = (e) => e.stopPropagation();

    // Gestione flussi IPC
    if (ipc) {
        ipc.removeAllListeners('risposta-ia');
        ipc.removeAllListeners('cronologia-ia-caricata');

        ipc.on('risposta-ia', (event, risposta) => {
            document.getElementById('ai-loader-msg')?.remove();
            const divBot = document.createElement('div');
            divBot.className = 'ai-bubble bot';
            divBot.innerHTML = renderizzaLinkCliccabili(risposta);
            const activeMsgsBox = document.getElementById('ai-chat-messages');
            if (activeMsgsBox) {
                activeMsgsBox.appendChild(divBot);
                activeMsgsBox.scrollTop = activeMsgsBox.scrollHeight;
            }
        });

        ipc.on('cronologia-ia-caricata', (event, history) => {
            const activeMsgsBox = document.getElementById('ai-chat-messages');
            if (!activeMsgsBox || !history || history.length === 0) return;
            activeMsgsBox.innerHTML = '';
            history.forEach(msg => {
                const divBubble = document.createElement('div');
                divBubble.className = msg.role === 'user' ? 'ai-bubble user' : 'ai-bubble bot';
                
                const testoMessaggio = (msg.parts && msg.parts[0]) ? msg.parts[0].text : (msg.text || "");
                if (msg.role === 'user') {
                    divBubble.textContent = testoMessaggio;
                } else {
                    divBubble.innerHTML = renderizzaLinkCliccabili(testoMessaggio);
                }
                activeMsgsBox.appendChild(divBubble);
            });
            activeMsgsBox.scrollTop = activeMsgsBox.scrollHeight;
        });

        ipc.send('cambio-pagina-chat', nomePaginaCorrente || 'Files/Games/games.txt');
        ipc.send('richiedi-cronologia-ia');
    }
})();