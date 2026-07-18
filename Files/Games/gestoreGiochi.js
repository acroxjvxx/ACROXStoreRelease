const fs = require('fs');
const path = require('path');

// Percorso assoluto al file JSON dove salveremo i dati
const percorsoFileJson = path.join(__dirname, 'Files', 'Games', 'giochi-salvati.json');

/**
 * Funzione per salvare un nuovo gioco nel file JSON
 */
function salvaNuovoGioco(datiGioco) {
    try {
        let giochi = [];
        
        // Se il file esiste già, leggiamo i giochi precedentemente salvati
        if (fs.existsSync(percorsoFileJson)) {
            const contenuto = fs.readFileSync(percorsoFileJson, 'utf8');
            giochi = JSON.parse(contenuto || '[]');
        }
        
        // Aggiungiamo il nuovo gioco all'array
        giochi.push(datiGioco);
        
        // Sovrascriviamo il file con la lista aggiornata
        fs.writeFileSync(percorsoFileJson, JSON.stringify(giochi, null, 2), 'utf8');
        console.log("Gioco salvato con successo nel file!");
        
        // Ricarica la griglia dei giochi per mostrare le modifiche
        caricaGiochiSalvati();
    } catch (errore) {
        console.error("Errore durante il salvataggio del gioco:", errore);
    }
}

/**
 * Funzione che legge il file JSON e genera i contenitori HTML
 */
function caricaGiochiSalvati() {
    try {
        if (!fs.existsSync(percorsoFileJson)) return;

        const contenuto = fs.readFileSync(percorsoFileJson, 'utf8');
        const giochi = JSON.parse(contenuto || '[]');
        
        // Collega la griglia principale del file games.txt
        const grigliaGiochi = document.getElementById('main-games-grid'); 
        if (!grigliaGiochi) return;
        
        giochi.forEach(gioco => {
            // Se la card esiste già saltiamo per evitare duplicati stantii
            if (document.querySelector(`[data-id="${gioco.id}"]`)) return;

            const tagsArray = gioco.category.split(' ');
            let tagsHTML = '';
            tagsArray.forEach(tag => {
                if(tag.trim()) {
                    tagsHTML += `<span class="game-tag">${tag.charAt(0).toUpperCase() + tag.slice(1)}</span> `;
                }
            });

            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            gameCard.setAttribute('data-name', gioco.title);
            // CORRETTO: gioco.id anziché juego.id
            gameCard.setAttribute('data-id', gioco.id || `game_${gioco.title.toLowerCase().replace(/\s+/g, '_')}`);
            gameCard.setAttribute('data-category', gioco.category.toLowerCase());

            gameCard.innerHTML = `
                <button class="favorite-heart-btn" title="Aggiungi ai preferiti" onclick="toggleFavorite('${gioco.id}', '${gioco.title}', event)">❤</button>
                <div class="game-cover-wrapper">
                    <div class="game-cover" style="background-image: url('${gioco.cover}');"></div>
                </div>
                <div class="game-info-block">
                    <div class="game-title">${gioco.title}</div>
                    <div class="game-tags-list">
                        ${tagsHTML}
                    </div>
                    <div class="game-description">${gioco.desc}</div>
                    <button onclick="if(typeof switchView === 'function') { switchView('games', 'Files/Games/${gioco.filename || '#'}'); } else { console.error('switchView non trovata'); }" class="btn-install" style="width: 100%; cursor: pointer; border: 1px solid rgba(99, 102, 241, 0.2);">Installa</button>
                </div>
            `;
            grigliaGiochi.appendChild(gameCard);
        });
    } catch (errore) {
        console.error("Errore durante il caricamento dei giochi dal file JSON:", errore);
    }
}

// Esportiamo le funzioni in modo da poterle usare nei tuoi file HTML/JS
module.exports = { salvaNuovoGioco, caricaGiochiSalvati };