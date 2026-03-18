// 1. Selezioniamo tutti gli elementi necessari dalla pagina
const divBersaglio = document.getElementById('div-bersaglio');
const titoloBersaglio = document.getElementById('titolo-bersaglio');
const paragrafoBersaglio = document.getElementById('paragrafo-bersaglio');

const btnTesto = document.getElementById('btnTesto');
const btnColore = document.getElementById('btnColore');
const btnDimensione = document.getElementById('btnDimensione');
const btnReset = document.getElementById('btnReset');

// Salviamo il contenuto originale in modo da poterlo ripristinare col tasto Reset
const titoloOriginale = titoloBersaglio.innerHTML;
const testoOriginale = paragrafoBersaglio.innerHTML;

// MANIPOLAZIONE 1: Modifica del contenuto testuale
btnTesto.addEventListener('click', function() {
    titoloBersaglio.innerHTML = "Algoritmo di Welford-Knuth";
    paragrafoBersaglio.innerHTML = "L'algoritmo di Welford è un metodo per il calcolo della varianza in un singolo passaggio (online algorithm).<br><br>È particolarmente utile nell'analisi statistica applicata quando si elaborano flussi continui di dati, poiché previene l'instabilità numerica (catastrophic cancellation) tipica della formula standard.";
});

// MANIPOLAZIONE 2: Modifica degli stili e dei colori (CSS via JS)
btnColore.addEventListener('click', function() {
    divBersaglio.style.backgroundColor = "#e8f4f8"; // Sfondo azzurro chiaro
    divBersaglio.style.borderLeftColor = "#2980b9"; // Cambia il colore del bordo laterale
    titoloBersaglio.style.color = "#2980b9";        // Cambia il colore del titolo
});

// MANIPOLAZIONE 3: Modifica delle dimensioni
btnDimensione.addEventListener('click', function() {
    paragrafoBersaglio.style.fontSize = "18px";
    paragrafoBersaglio.style.lineHeight = "1.8";
});

// MANIPOLAZIONE 4: Reset (Rimuove tutte le modifiche)
btnReset.addEventListener('click', function() {
    // Ripristiniamo il testo
    titoloBersaglio.innerHTML = titoloOriginale;
    paragrafoBersaglio.innerHTML = testoOriginale;
    
    // Ripristiniamo gli stili rimuovendo le modifiche inline fatte dal JS
    divBersaglio.removeAttribute("style");
    titoloBersaglio.removeAttribute("style");
    paragrafoBersaglio.removeAttribute("style");
});