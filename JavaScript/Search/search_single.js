// Lista centralizzata dei giochi SINGLE PLAYER
const games = [
    {
        name: "Granny", 
        img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/962400/header.jpg?t=1687541775", 
        link: "../../Games/Single/Granny.html"
    },
    {
        name: "Granny 3", 
        img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1707550/header.jpg?t=1707487045", 
        link: "../../Games/Single/Granny_3.html"
    },
    {
        name: "Geometry Dash", 
        img: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/322170/header.jpg?t=1703006148", 
        link: "../../Games/Single/GeometryDash.html"
    },
    {
        name: "The Last of Us Part I", 
        img: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1888930/header.jpg?t=1750959031", 
        link: "../../Games/Single/The Last of Us Part I.html"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const searchResults = document.getElementById('search-results');

    if (!searchInput || !searchResults) return;

    // Stile CSS per i risultati (Immagini fisse, No Scrollbar, Hover Viola)
    const style = document.createElement('style');
    style.innerHTML = `
        #search-results {
            overflow: hidden !important;
            scrollbar-width: none;
            border: 1px solid #9b59b6;
            background: #1e1e1e;
            border-radius: 6px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }
        #search-results::-webkit-scrollbar { display: none; }
        
        #search-results div {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            cursor: pointer;
            transition: 0.2s;
        }
        
        #search-results div:hover { 
            background: rgba(155, 89, 182, 0.2); 
        }
        
        #search-results img { 
            width: 35px !important; 
            height: 35px !important; 
            min-width: 35px;
            object-fit: cover; 
            border-radius: 4px; 
            margin-right: 12px; 
        }
        
        #search-results span {
            font-size: 14px;
            color: #eee;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `;
    document.head.appendChild(style);

    // Logica di ricerca
    searchInput.addEventListener('input', () => {
        const val = searchInput.value.toLowerCase().trim();
        searchResults.innerHTML = '';

        if (val === '') { 
            searchResults.style.display = 'none'; 
            return; 
        }

        // FILTRO: Solo nomi che INIZIANO con la lettera digitata
        // LIMIT: Massimo 4 risultati (.slice)
        const filtered = games.filter(g => g.name.toLowerCase().startsWith(val)).slice(0, 4);

        filtered.forEach(g => {
            const div = document.createElement('div');
            div.innerHTML = `
                <img src="${g.img}" alt="${g.name}">
                <span>${g.name}</span>
            `;
            div.addEventListener('click', () => { 
                window.location.href = g.link; 
            });
            searchResults.appendChild(div);
        });

        // Mostra il box solo se ci sono risultati
        searchResults.style.display = filtered.length ? 'block' : 'none';
    });

    // Chiudi il menu se clicchi fuori dalla search-bar
    window.addEventListener('click', (e) => {
        if (!e.target.closest('.search-bar')) {
            searchResults.style.display = 'none';
        }
    });
});