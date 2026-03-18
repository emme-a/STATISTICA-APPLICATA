// Selezioniamo gli elementi
const displayArea = document.getElementById('display-area');
const titolo = document.getElementById('titolo');
const paragrafo = document.getElementById('paragrafo');

const btnColore = document.getElementById('btnColore');
const btnDimensione = document.getElementById('btnDimensione');
const btnTeoria = document.getElementById('btnTeoria');
const btnReset = document.getElementById('btnReset');

// Salviamo il Welcome state
const titoloWelcome = titolo.innerHTML;
const testoWelcome = paragrafo.innerHTML;

// 1. Tasto Colore: Cambia radicalmente i colori (Testo e Sfondo)
btnColore.addEventListener('click', function() {
    displayArea.style.backgroundColor = "#2c3e50"; // Sfondo scuro elegante
    titolo.style.color = "#f1c40f";                // Titolo giallo oro
    paragrafo.style.color = "#ecf0f1";             // Testo bianco chiaro
});

// 2. Tasto Dimensione: Ingrandisce il testo
btnDimensione.addEventListener('click', function() {
    paragrafo.style.fontSize = "22px";
    paragrafo.style.lineHeight = "1.8";
});

// 3. Tasto Teoria: Inserisce la dimostrazione di Welford/Knuth
btnTeoria.addEventListener('click', function() {
    // Togliamo la centratura per rendere la teoria leggibile come un libro
    paragrafo.classList.remove('testo-centrato');
    
    titolo.innerHTML = "Relazione di ricorrenza di Welford";
    paragrafo.innerHTML = `
        L'algoritmo permette di calcolare la varianza online, aggiornando la Somma dei Quadrati degli Scarti (S<sub>n</sub>).<br><br>
        <b>Formula:</b><br>
        S<sub>n</sub> = S<sub>n-1</sub> + (x<sub>n</sub> - x̄<sub>n-1</sub>)(x<sub>n</sub> - x̄<sub>n</sub>)<br><br>
        <b>Dimostrazione semplificata:</b><br>
        1. Si parte da S<sub>n</sub> = Σ(x<sub>i</sub> - x̄<sub>n</sub>)<sup>2</sup>.<br>
        2. Si aggiunge e si sottrae la media precedente x̄<sub>n-1</sub> dentro la parentesi.<br>
        3. Si sviluppa il quadrato del binomio. Poiché la somma degli scarti dalla media è zero, il termine centrale si annulla.<br>
        4. Rimane S<sub>n-1</sub> e una coda finale che, applicando la regola di aggiornamento della media, si semplifica algebricamente in (x<sub>n</sub> - x̄<sub>n-1</sub>)(x<sub>n</sub> - x̄<sub>n</sub>).
    `;
});

// 4. Tasto Reset: Torna alla schermata di Welcome
btnReset.addEventListener('click', function() {
    // Ripristiniamo testi
    titolo.innerHTML = titoloWelcome;
    paragrafo.innerHTML = testoWelcome;
    paragrafo.classList.add('testo-centrato');
    
    // Ripristiniamo colori e dimensioni pulendo gli stili applicati
    displayArea.removeAttribute("style");
    titolo.removeAttribute("style");
    paragrafo.removeAttribute("style");
});