// js/theme.js
const themes = {
    // Predefiniti
    "white": "#5a5e65",                                              
    "gray": "#202225",                                              
    "black": "#111214",                                              
    
    // Temi Standard (Tonalità Notturne Desaturate)
    "brownwhite": "linear-gradient(135deg, #1f1712 0%, #0d0a08 100%)", 
    "redblack": "linear-gradient(135deg, #3b1313 0%, #110505 100%)",   
    "blue": "linear-gradient(135deg, #0f2027 0%, #203a43 100%)",       
    "green": "linear-gradient(135deg, #0d2012 0%, #050d06 100%)",      
    
    // Temi Premium AISOS (Gradienti Cyber-Dark)
    "purple-dark": "linear-gradient(135deg, #1a0033 0%, #0a0014 100%)", 
    "cyberpunk": "linear-gradient(135deg, #2b2100 0%, #290800 100%)",   
    "ocean-deep": "linear-gradient(135deg, #001f3f 0%, #000b18 100%)",  
    "aurora": "linear-gradient(135deg, #051c18 0%, #010a07 100%)"       
};

function applyTheme(themeName) {
    if (themes[themeName]) {
        document.body.style.background = themes[themeName];
        localStorage.setItem('selectedTheme', themeName);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('selectedTheme') || 'black';
    if(themes[saved]) {
        document.body.style.background = themes[saved];
    }
});