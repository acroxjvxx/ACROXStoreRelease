(function() {
    const savedColor = localStorage.getItem('themeAccent') || '#525252';
    
    const style = document.createElement('style');
    style.id = 'dynamic-theme-style';
    style.innerHTML = `
        /* FONT GENERALE */
        * { 
            font-family: 'Poppins', sans-serif !important; 
        }

        :root { 
            --accent-color: ${savedColor} !important; 
        }

        /* --- FIX SCRITTURA NELLA SEARCH BAR --- */
        /* Questo permette di cliccare e scrivere nonostante il user-select:none generale */
        input, textarea, [contenteditable="true"] {
            user-select: text !important;
            -webkit-user-select: text !important;
            cursor: text !important;
        }

        /* --- FIX SCROLL E LAYER (Z-INDEX) --- */
        header {
            z-index: 9999 !important; /* Molto alto per stare sopra i contenuti */
            position: fixed !important;
            width: 100%;
            top: 0;
            background: rgba(0,0,0,0.9) !important;
            backdrop-filter: blur(10px);
        }

        /* Impedisce ai contenuti di passare sopra l'header */
        main {
            position: relative;
            z-index: 1;
        }

        /* FIX DISSOLVENZA E SFONDO */
        body {
            animation: fadeIn 1.2s ease-in-out forwards;
            background-color: #0f0f0f;
        }

        body::before { 
            filter: brightness(0.4) grayscale(0.2); 
            z-index: -1;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .bg-overlay { 
            background: rgba(0, 0, 0, 0.7) !important; 
        }

        /* COLORAZIONE TESTI DINAMICA */
        header h1, #logo, .left-panel h2, .system-requirements h3, 
        .system-requirements strong, .info-section strong, #footer-credit,
        .arrow:hover, main strong, .game-card h3, .category-title, 
        h2, h3, .sidebar-item:hover, .status-text { 
            color: var(--accent-color) !important; 
        }

        /* ELEMENTI PIENI (Badge, Progress Bar, Bottoni) */
        #badge, 
        #badge-container, 
        #categories-menu button, 
        #tutorialBtn, 
        .game-card .button, 
        .right-panel .button, 
        .pagination a.active,
        .sidebar-item.active, 
        .badge-consigliato,
        #progress-bar,
        .game-card [data-categories],
        .game-card span,
        .game-card div[class*="tag"] {
            background-color: var(--accent-color) !important;
            color: #111 !important; /* Testo scuro su fondo colorato per leggibilità */
            border: none !important;
        }

        /* BORDURE (Solo per i bottoni trasparenti di Geometry Dash/Granny) */
        #install-btn, #dots-btn, .dropdown-content {
            border: 2px solid var(--accent-color) !important;
        }

        ::-webkit-scrollbar-thumb { 
            background: var(--accent-color) !important; 
            border-radius: 10px; 
        }
    `;
    document.head.appendChild(style);

    window.addEventListener('storage', (e) => {
        if (e.key === 'themeAccent') {
            document.documentElement.style.setProperty('--accent-color', e.newValue);
        }
    });
})();