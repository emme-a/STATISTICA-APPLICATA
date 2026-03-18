// 1. Diciamo al programma di trovare l'elemento HTML che ha l'ID "bersaglio"
const mioDiv = document.getElementById('bersaglio');

// 2. Manipolazione A: Cambiamo il testo contenuto nel DIV
mioDiv.innerHTML = "Evviva! Il testo è stato modificato da JavaScript!";

// 3. Manipolazione B: Cambiamo lo stile (CSS) del DIV
mioDiv.style.backgroundColor = "yellow"; // Mette lo sfondo giallo
mioDiv.style.padding = "20px";           // Aggiunge un po' di spazio interno
mioDiv.style.fontWeight = "bold";        // Rende il testo in grassetto

// 4. Manipolazione C: Creiamo un elemento HTML completamente nuovo e aggiungiamolo
const nuovaRiga = document.createElement('p'); // Creiamo un nuovo paragrafo <p>
nuovaRiga.textContent = "Questa riga è stata creata dal nulla dal nostro file script.js.";

// Appiccichiamo la nuova riga dentro al nostro DIV bersaglio
mioDiv.appendChild(nuovaRiga);
