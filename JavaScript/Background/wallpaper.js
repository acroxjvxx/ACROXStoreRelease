// Funzione per applicare lo sfondo al body
function applySavedBackground() {
    const savedBg = localStorage.getItem('userBg');
    if (savedBg) {
        document.body.style.backgroundImage = savedBg;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";
    }
}

// Funzione per salvare un nuovo sfondo nella lista della memoria
function addWallpaperToList(url) {
    let list = JSON.parse(localStorage.getItem('acrox_wallpaper_list')) || [];
    // Evita duplicati
    if (!list.includes(url)) {
        list.push(url);
        localStorage.setItem('acrox_wallpaper_list', JSON.stringify(list));
    }
}

// Esegui all'avvio su ogni pagina che include questo script
document.addEventListener('DOMContentLoaded', applySavedBackground);