/* ACROX SEARCH ENGINE - STABLE NEON EDITION 
   Sincronizzato con theme.js - Centratura perfetta e larghezza bloccata
*/

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const searchResults = document.getElementById('search-results');
    const searchContainer = document.querySelector('.search-bar');

    if (!searchInput || !searchResults || !searchContainer) return;

    const style = document.createElement('style');
    style.innerHTML = `
        .search-bar {
            transition: width 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            width: 280px;
            position: relative;
            display: flex;
            justify-content: center;
        }

        /* Classe aggiunta via JS per mantenere la lunghezza */
        .search-bar.active {
            width: 480px;
        }

        #search {
            width: 100%;
            padding: 10px 16px;
            background: rgba(10, 10, 10, 0.8);
            border: 1px solid var(--accent-color) !important;
            border-radius: 30px;
            color: #fff;
            font-size: 13px;
            font-family: 'Poppins', sans-serif;
            transition: all 0.3s ease;
            outline: none;
            backdrop-filter: blur(5px);
            box-shadow: 0 0 8px var(--accent-color);
        }

        #search:focus {
            background: rgba(0, 0, 0, 0.95);
            box-shadow: 0 0 18px var(--accent-color);
        }

        /* RISULTATI: Centratura assoluta rispetto alla barra */
        #search-results {
            position: absolute;
            top: 55px;
            left: 50%;
            transform: translateX(-50%); /* Centratura perfetta */
            width: 92%; 
            background: rgba(10, 10, 10, 0.98);
            border: 1px solid var(--accent-color);
            border-radius: 12px;
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.8), 0 0 10px var(--accent-color);
            overflow: hidden;
            display: none;
            z-index: 9999;
            backdrop-filter: blur(20px);
        }

        #search-results div {
            display: flex;
            align-items: center;
            padding: 10px 15px;
            cursor: pointer;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);
            transition: all 0.2s ease;
        }

        #search-results div:hover {
            background: var(--accent-color);
            padding-left: 20px;
        }

        #search-results div:hover span {
            color: #111;
            font-weight: 600;
        }

        #search-results img { 
            width: 42px !important;
            height: 26px !important; 
            object-fit: cover; 
            border-radius: 4px; 
            margin-right: 12px;
        }

        #search-results span {
            font-size: 13px;
            color: #ddd;
        }
    `;
    document.head.appendChild(style);

    // Gestione Focus: Allunga la barra e la blocca
    searchInput.addEventListener('focus', () => {
        searchContainer.classList.add('active');
    });

    searchInput.addEventListener('input', () => {
        const val = searchInput.value.toLowerCase().trim();
        searchResults.innerHTML = '';

        if (val === '') { 
            searchResults.style.display = 'none'; 
            return; 
        }

        if (typeof games !== 'undefined') {
            const filtered = games.filter(g => g.name.toLowerCase().startsWith(val)).slice(0, 5);

            filtered.forEach(g => {
                const div = document.createElement('div');
                div.innerHTML = `<img src="${g.img}"><span>${g.name}</span>`;
                
                div.addEventListener('mousedown', (e) => { 
                    e.preventDefault();
                    window.location.href = g.link; 
                });

                searchResults.appendChild(div);
            });

            searchResults.style.display = filtered.length ? 'block' : 'none';
        }
    });

    // Chiusura: Solo se clicchi fuori dall'intero contenitore
    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) {
            searchContainer.classList.remove('active');
            searchResults.style.display = 'none';
        }
    });
});