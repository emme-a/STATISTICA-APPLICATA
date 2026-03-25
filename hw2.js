// ==========================================
// PARTE A: CASO PATOLOGICO (NAIVE VS WELFORD)
// ==========================================
document.getElementById('btn-pathological').addEventListener('click', () => {
    const n = 10000;
    const OFFSET = 1e9; // 1 miliardo
    const data = [];
    
    // Generiamo dati: 1 miliardo + un numero uniforme [0,1)
    for (let i = 0; i < n; i++) {
        data.push(OFFSET + Math.random());
    }

    // 1. Calcolo Naive (Somma e Somma dei Quadrati)
    let sum = 0;
    let sumSq = 0;
    for (let i = 0; i < n; i++) {
        sum += data[i];
        sumSq += data[i] * data[i];
    }
    // Formula Naive: (Somma Quadrati - (Somma^2 / n)) / (n - 1)
    const naiveVar = (sumSq - (sum * sum) / n) / (n - 1);

    // 2. Calcolo Welford
    let mean = 0;
    let M2 = 0;
    for (let i = 0; i < n; i++) {
        let x = data[i];
        let delta = x - mean;
        mean += delta / (i + 1);
        let delta2 = x - mean;
        M2 += delta * delta2;
    }
    const welfordVar = M2 / (n - 1);

    // Varianza teorica dell'Uniforme [0,1) è 1/12 ≈ 0.083333
    const expectedVar = 1 / 12;

    const outputA = document.getElementById('output-part-a');
    outputA.innerHTML = `Analisi su ${n} campioni patologici (Offset: 10^9)
Varianza teorica attesa : ~0.083333

Varianza Formula Naive  : ${naiveVar}  <-- Errore numerico!
Varianza Formula Welford: ${welfordVar}  <-- Stabile e corretta!`;
});


// ==========================================
// PARTE B: GENERAZIONE DISTRIBUZIONI
// ==========================================

// Variabile globale per il grafico (per poterlo distruggere e ricreare)
let myChart = null;

// Funzioni Generatrici partendo da U[0,1)
function genUniform(min, max) {
    return min + Math.random() * (max - min);
}

function genNormal(mu, sigma) {
    // Metodo di Box-Muller
    let u1 = Math.random();
    let u2 = Math.random();
    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * sigma + mu;
}

function genExponential(lambda) {
    // Metodo della Trasformata Inversa
    let u = Math.random();
    return -Math.log(1 - u) / lambda;
}

function genPoisson(lambda) {
    // Algoritmo di Knuth (Inversione per variabili discrete)
    let L = Math.exp(-lambda);
    let k = 0;
    let p = 1.0;
    do {
        k++;
        p *= Math.random();
    } while (p > L);
    return k - 1;
}

// Funzione per calcolare i "bin" dell'istogramma
function calculateHistogram(data, isDiscrete) {
    const numBins = isDiscrete ? Math.max(...data) - Math.min(...data) + 1 : 50;
    let min = Math.min(...data);
    let max = Math.max(...data);
    
    let bins = new Array(numBins).fill(0);
    let labels = new Array(numBins);
    let binWidth = isDiscrete ? 1 : (max - min) / numBins;

    for (let i = 0; i < numBins; i++) {
        labels[i] = isDiscrete ? (min + i).toString() : (min + (i + 0.5) * binWidth).toFixed(2);
    }

    for (let val of data) {
        let binIndex = isDiscrete ? Math.floor(val - min) : Math.floor((val - min) / binWidth);
        if (binIndex >= numBins) binIndex = numBins - 1; // Sicurezza per il max
        bins[binIndex]++;
    }

    return { labels, bins };
}

// Gestione del click sul pulsante genera
document.getElementById('btn-generate').addEventListener('click', () => {
    const distType = document.getElementById('dist-select').value;
    const n = 10000;
    let data = [];
    let isDiscrete = false;
    let expectedMean, expectedVar;

    // Generazione in base alla scelta
    switch (distType) {
        case 'uniform':
            data = Array.from({length: n}, () => genUniform(0, 10));
            expectedMean = 5; expectedVar = 100 / 12;
            break;
        case 'normal':
            data = Array.from({length: n}, () => genNormal(0, 1));
            expectedMean = 0; expectedVar = 1;
            break;
        case 'exponential':
            data = Array.from({length: n}, () => genExponential(1));
            expectedMean = 1; expectedVar = 1;
            break;
        case 'poisson':
            data = Array.from({length: n}, () => genPoisson(4));
            expectedMean = 4; expectedVar = 4;
            isDiscrete = true;
            break;
    }

    // Calcolo statistiche empiriche (usando Welford!)
    let mean = 0, M2 = 0;
    for (let i = 0; i < n; i++) {
        let delta = data[i] - mean;
        mean += delta / (i + 1);
        M2 += delta * (data[i] - mean);
    }
    let empVar = M2 / (n - 1);

    // Mostriamo le statistiche
    document.getElementById('output-part-b').innerHTML = `Campioni generati : ${n}
Media Teorica     : ${expectedMean.toFixed(4)} | Media Empirica   : ${mean.toFixed(4)}
Varianza Teorica  : ${expectedVar.toFixed(4)} | Varianza Empirica: ${empVar.toFixed(4)}`;

    // Prepariamo i dati per il grafico
    const histData = calculateHistogram(data, isDiscrete);

    // Disegniamo il grafico con Chart.js
    const ctx = document.getElementById('distChart').getContext('2d');
    
    // Distruggiamo il grafico precedente se esiste
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: histData.labels,
            datasets: [{
                label: 'Frequenza',
                data: histData.bins,
                backgroundColor: 'rgba(52, 152, 219, 0.7)',
                borderColor: 'rgba(41, 128, 185, 1)',
                borderWidth: 1,
                barPercentage: isDiscrete ? 0.8 : 1.0,
                categoryPercentage: 1.0
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            },
            plugins: {
                title: {
                    display: true,
                    text: `Istogramma della Distribuzione: ${distType.toUpperCase()}`
                }
            }
        }
    });
});
