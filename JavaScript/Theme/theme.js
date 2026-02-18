(function() {
    const savedColor = localStorage.getItem('themeAccent') || '#525252';
    
    const style = document.createElement('style');
    style.innerHTML = `
        * { font-family: 'Poppins', sans-serif !important; }

        :root { --accent-color: ${savedColor} !important; }

        /* FIX DISSOLVENZA E OPACITÀ */
        body::before { 
            /* Rimuoviamo opacity 1 !important per permettere il fadeIn del body */
            filter: brightness(0.4) grayscale(0.2); 
            z-index: -1;
        }
        
        /* Assicuriamoci che l'animazione fadeIn sia attiva */
        body {
            animation: fadeIn 1.2s ease-in-out forwards;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .bg-overlay { 
            background: rgba(0, 0, 0, 0.7) !important; 
        }

        /* HEADER FIX */
        header {
            z-index: 999 !important;
            position: fixed !important;
            width: 100%;
            top: 0;
            background: rgba(0,0,0,0.9) !important;
            backdrop-filter: blur(10px);
        }

        /* COLORAZIONE TESTI */
        header h1, #logo, .left-panel h2, .system-requirements h3, 
        .system-requirements strong, .info-section strong, #footer-credit,
        .arrow:hover, main strong, .game-card h3, .category-title, 
        h2, h3, .sidebar-item:hover { 
            color: var(--accent-color) !important; 
        }

        /* ELEMENTI PIENI */
        #badge, 
        #badge-container, 
        #categories-menu button, 
        #tutorialBtn, 
        .game-card .button, 
        .right-panel .button, 
        .pagination a.active,
        .sidebar-item.active, 
        .badge-consigliato,
        .game-card [data-categories],
        .game-card span,
        .game-card div[class*="tag"] {
            background-color: var(--accent-color) !important;
            color: #fff !important;
            border: none !important;
        }

        ::-webkit-scrollbar-thumb { background: var(--accent-color) !important; border-radius: 10px; }
    `;
    document.head.appendChild(style);

    window.addEventListener('storage', (e) => {
        if (e.key === 'themeAccent') {
            document.documentElement.style.setProperty('--accent-color', e.newValue);
        }
    });
})();