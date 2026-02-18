(function() {
    const DEFAULT_BG = "url('https://4kwallpapers.com/images/walls/thumbs_3t/1034.jpg')";
    const savedBg = localStorage.getItem('userBg') || DEFAULT_BG;

    const style = document.createElement('style');
    style.innerHTML = `
        /* Lo sfondo deve stare al livello più basso possibile */
        body::before {
            content: '';
            position: fixed;
            inset: 0;
            background-image: ${savedBg} !important;
            background-position: center;
            background-size: cover;
            background-attachment: fixed;
            z-index: -9999 !important; /* Molto basso */
            opacity: 0;
            animation: fadeInBg 0.8s ease-in-out forwards;
        }

        /* L'oscuramento deve stare sopra lo sfondo ma sotto il contenuto */
        .bg-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.7) !important;
            z-index: -9998 !important; /* Appena sopra lo sfondo */
            pointer-events: none;
        }

        /* Protezione per il contenuto: assicuriamoci che main e header siano sopra */
        main, header {
            position: relative;
            z-index: 10;
        }

        @keyframes fadeInBg {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    document.addEventListener("DOMContentLoaded", () => {
        // Rimuoviamo eventuali vecchi overlay per evitare duplicati
        const existingOverlay = document.querySelector('.bg-overlay');
        if (existingOverlay) existingOverlay.remove();

        const overlay = document.createElement('div');
        overlay.className = 'bg-overlay';
        document.body.prepend(overlay);
    });
})();