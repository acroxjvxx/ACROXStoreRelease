// hide-scroll.js

// Blocca lo scroll e nasconde subito il contenuto
document.documentElement.style.overflow = 'hidden';
document.body.style.visibility = 'hidden';

// Dopo 5 secondi, mostra il contenuto e mantiene lo scroll bloccato
setTimeout(() => {
    document.body.style.visibility = 'visible';
    document.documentElement.style.overflow = 'hidden'; // scroll verticale rimane bloccato
}, 5000); // 5000ms = 5 secondi
