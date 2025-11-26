const { ipcRenderer } = require('electron');

const downloadBtn = document.getElementById("downloadBtn");
const gameName = document.body.dataset.game; // prende MISERY o altro

downloadBtn.addEventListener("click", async () => {
    const gameData = gamesData[gameName];
    if (!gameData) return alert("Dati gioco non trovati!");

    downloadBtn.innerText = "Controllo file...";
    downloadBtn.style.opacity = "0.7";

    const result = await ipcRenderer.invoke("game-action", {
        gameName,
        exeName: gameData.exeName,
        password: gameData.password,
        parts: gameData.parts
    });

    if (result.status === "missing_files") {
        downloadBtn.innerText = `⚠️ Manca: ${result.missing}`;
        downloadBtn.classList.add('error-feedback');
    } else if (result.status === "installed_and_running") {
        downloadBtn.innerText = "Gioco Avviato!";
        downloadBtn.style.background = "#00ff00";
        downloadBtn.style.color = "#111";
    } else if (result.status === "running") {
        downloadBtn.innerText = "In Esecuzione...";
    } else {
        downloadBtn.innerText = "Errore!";
        alert(result.message);
    }
});
