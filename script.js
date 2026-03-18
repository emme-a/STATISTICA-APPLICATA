// Liste di colori professionali e testi per le manipolazioni
const colors = ["#e74c3c", "#3498db", "#2ecc71", "#9b59b6", "#f1c40f", "#e67e22", "#34495e"];
const texts = ["Hello World!", "Ciao dal file esterno!", "Testo cambiato con JavaScript!"];

// Indici per tracciare lo stato attuale
let currentTextIndex = 0;
let visible = true;
let currentFontSize = 24; // Dimensione iniziale del testo (corrisponde al CSS)

// Selezioniamo gli elementi DOM che ci servono
const helloWorldElement = document.getElementById("hello-world");
const statusElement = document.getElementById("status");

// 1. Tasto Cambia testo: Cicla tra i testi predefiniti
document.getElementById("btn-text").addEventListener("click", function () {
  currentTextIndex = (currentTextIndex + 1) % texts.length;
  helloWorldElement.textContent = texts[currentTextIndex];
  statusElement.textContent = "Il testo è stato modificato.";
});

// 2. Tasto Cambia colore: Sceglie un colore CASUALE dalla lista
document.getElementById("btn-color").addEventListener("click", function () {
  // Generiamo un indice casuale
  const randomColorIndex = Math.floor(Math.random() * colors.length);
  const newColor = colors[randomColorIndex];
  helloWorldElement.style.color = newColor;
  statusElement.textContent = `Colore cambiato in casuale (${newColor}).`;
});

// 3. Tasto Dimensione +: Aumenta la grandezza del testo
document.getElementById("btn-size-plus").addEventListener("click", function () {
  currentFontSize += 2; // Aumenta di 2px
  helloWorldElement.style.fontSize = currentFontSize + "px";
  statusElement.textContent = `Testo ingrandito a ${currentFontSize}px.`;
});

// 4. Tasto Dimensione -: Diminuisce la grandezza del testo (con un minimo)
document.getElementById("btn-size-minus").addEventListener("click", function () {
  if (currentFontSize > 10) { // Limite minimo per leggibilità
    currentFontSize -= 2; // Diminuisce di 2px
    helloWorldElement.style.fontSize = currentFontSize + "px";
    statusElement.textContent = `Testo rimpicciolito a ${currentFontSize}px.`;
  } else {
    statusElement.textContent = "Testo già alla dimensione minima.";
  }
});

// 5. Tasto Nascondi / Mostra: Alterna la visibilità dell'elemento
document.getElementById("btn-hide").addEventListener("click", function () {
  if (visible) {
    helloWorldElement.style.display = "none";
    statusElement.textContent = "L'elemento è stato nascosto.";
  } else {
    helloWorldElement.style.display = "block";
    statusElement.textContent = "L'elemento è stato mostrato di nuovo.";
  }
  visible = !visible;
});

// 6. Tasto Reset: Riporta tutto allo stato iniziale
document.getElementById("btn-reset").addEventListener("click", function () {
  // Ripristiniamo i valori di testo e stile
  helloWorldElement.textContent = texts[0]; // "Hello World!"
  helloWorldElement.style.color = "black";
  currentFontSize = 24;
  helloWorldElement.style.fontSize = currentFontSize + "px";
  helloWorldElement.style.display = "block";
  statusElement.textContent = "Pagina riportata allo stato iniziale.";

  // Resettiamo gli indici interni
  currentTextIndex = 0;
  visible = true;
});