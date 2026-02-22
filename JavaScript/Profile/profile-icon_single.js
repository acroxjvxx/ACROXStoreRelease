(function() {
    document.addEventListener("DOMContentLoaded", () => {
        const badge = document.getElementById('badge');
        if (!badge) return;

        // 1. Recupera l'immagine dal localStorage
        const savedImage = localStorage.getItem('profileImage');
        if (savedImage) {
            badge.innerHTML = `<img src="${savedImage}" alt="Profile" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            badge.style.padding = "0";
            badge.style.overflow = "hidden";
        }

        // 2. Crea l'HTML del Dropdown
        const dropdown = document.createElement('div');
        dropdown.id = 'badge-dropdown';
        dropdown.innerHTML = `
            <div onclick="window.location.href = '../../profile.html';">👤 Profilo</div>
            <div onclick="window.location.href = '../../A18/Settings/Impostazioni.html';">⚙️ Impostazioni</div>
            <div class="menu-separator"></div>
            <div onclick="window.location.href = '../../index.html';">🎮 Giochi Multiplayer</div>
            <div onclick="window.location.href = '../../index SinglePlayer.html';">🎮 Giochi SinglePlayer</div> 
            <div onclick="window.location.href = '../../Software.html';">💻 Software</div>
            <div class="menu-separator"></div>
            <div onclick="window.open('https://discord.gg/CmAEm9YZNH', '_blank');">🗄️ Server Discord</div>
            <div class="menu-separator"></div>
            <div onclick="console.log('Logout');" style="color:#e74c3c;">❌ Esci</div>
        `;

        // 3. Aggiungi lo stile CSS per il Dropdown (se non già presente)
        const style = document.createElement('style');
        style.innerHTML = `
            #badge-container, #badge { position: relative; }
            #badge-dropdown {
                position: absolute;
                top: 55px;
                right: 0;
                background: #1e1e1e;
                border: 2px solid var(--accent-color, #9b59b6);
                border-radius: 8px;
                width: 220px;
                display: none;
                flex-direction: column;
                z-index: 2000;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                overflow: hidden;
            }
            #badge-dropdown div {
                padding: 12px 15px;
                cursor: pointer;
                font-size: 14px;
                color: #eee;
                transition: 0.2s;
                text-align: left;
            }
            #badge-dropdown div:hover { background: rgba(255,255,255,0.1); }
            .menu-separator { height: 1px; background: rgba(255,255,255,0.1); padding: 0 !important; margin: 5px 0; }
            #badge-dropdown.show { display: flex; }
        `;
        document.head.appendChild(style);
        badge.parentElement.appendChild(dropdown); // Inserisce il menu nell'header

        // 4. Logica Apertura/Chiusura al Click
        badge.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });
    });
})();