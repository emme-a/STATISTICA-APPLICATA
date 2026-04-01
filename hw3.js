let randomWalkChart = null;

// Palette di colori professionali per simulazioni finanziarie
const colorPalette = {
    primary: 'rgba(41, 128, 185, 1)',   // Blu scuro solido per il percorso principale
    shadows: [
        'rgba(52, 152, 219, 0.3)',      // Blu chiaro semi-trasparente
        'rgba(155, 89, 182, 0.3)',      // Viola semi-trasparente
        'rgba(230, 126, 34, 0.3)',      // Arancione semi-trasparente
        'rgba(46, 204, 113, 0.3)'       // Verde semi-trasparente
    ]
};

// Funzione helper per generare un singolo percorso casuale (1000 step)
function generateSinglePath(startValue, steps) {
    let currentValue = startValue;
    const path = [currentValue];
    for (let i = 1; i <= steps; i++) {
        const step = Math.random() < 0.5 ? -1 : 1;
        currentValue += step;
        path.push(currentValue);
    }
    return path;
}

// Funzione helper per calcolare statistiche di base per un percorso
function calculatePathStats(path, startValue) {
    let minPrice = path[0];
    let maxPrice = path[0];
    let sum = 0;
    
    // Usiamo Welford per la media finale per coerenza e precisione
    let welfordMean = 0;
    for (let i = 0; i < path.length; i++) {
        let x = path[i];
        
        // Min/Max
        if (x < minPrice) minPrice = x;
        if (x > maxPrice) maxPrice = x;
        
        // Welford Mean (i+1 per evitare divisione per 0)
        let delta = x - welfordMean;
        welfordMean += delta / (i + 1);
    }
    
    const finalPrice = path[path.length - 1];
    const absoluteChange = finalPrice - startValue;

    return {
        finalPrice,
        absoluteChange,
        maxPrice,
        minPrice,
        welfordMean
    };
}

// Funzione per aggiornare il pannello delle statistiche HTML
function updateStatsUI(stats) {
    document.getElementById('final-price').textContent = stats.finalPrice;
    document.getElementById('price-change').textContent = stats.absoluteChange > 0 ? `+${stats.absoluteChange}` : stats.absoluteChange;
    document.getElementById('max-price').textContent = stats.maxPrice;
    document.getElementById('min-price').textContent = stats.minPrice;
    document.getElementById('mean-price').textContent = stats.welfordMean.toFixed(2);
}

// Funzione principale al click del bottone
document.getElementById('btn-generate-rw').addEventListener('click', () => {
    const steps = 1000;
    const startValue = 1000;
    
    // 1. Generiamo i cammini casuali
    // Il cammino principale (quello da analizzare)
    const primaryPath = generateSinglePath(startValue, steps);
    
    // Altri 4 cammini di "ombra"
    const shadowPaths = [
        generateSinglePath(startValue, steps),
        generateSinglePath(startValue, steps),
        generateSinglePath(startValue, steps),
        generateSinglePath(startValue, steps)
    ];

    // 2. Calcoliamo le statistiche misurabili per il cammino principale
    const primaryStats = calculatePathStats(primaryPath, startValue);
    updateStatsUI(primaryStats);

    // 3. Prepariamo i dataset per Chart.js
    const labels = Array.from({length: steps + 1}, (_, i) => i);
    
    const datasets = [];

    // Aggiungiamo il cammino principale (primo per visualizzazione sopra gli altri)
    datasets.push({
        label: 'Percorso Principale Analizzato',
        data: primaryPath,
        borderColor: colorPalette.primary,
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.1,
        z: 10 // Forza la linea principale a stare sopra
    });

    // Aggiungiamo i cammini ombra
    shadowPaths.forEach((path, index) => {
        datasets.push({
            label: `Ombra ${index + 1}`,
            data: path,
            borderColor: colorPalette.shadows[index],
            borderWidth: 1,
            pointRadius: 0,
            fill: false,
            tension: 0.1,
            z: 1 // Linee sotto la principale
        });
    });

    // 4. Disegno o aggiornamento del grafico con Chart.js
    const ctx = document.getElementById('randomWalkChart').getContext('2d');
    
    if (randomWalkChart) {
        randomWalkChart.destroy();
    }

    randomWalkChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            animation: { duration: 600 },
            maintainAspectRatio: false, // Per adattarsi meglio al contenitore CSS
            interaction: { intersect: false, mode: 'nearest' },
            scales: {
                x: {
                    title: { display: true, text: 'Step temporale (i)', font: { size: 14 } },
                    ticks: { maxTicksLimit: 12 },
                    grid: { color: 'rgba(0,0,0,0.03)' }
                },
                y: {
                    title: { display: true, text: 'Prezzo (Valore)', font: { size: 14 } },
                    grid: { color: 'rgba(0,0,0,0.03)' }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        // Mostriamo solo il percorso principale nella legenda per pulizia
                        filter: function(item, chart) {
                            return item.text.indexOf('Ombra') === -1;
                        }
                    }
                },
                tooltip: {
                    // Mostriamo solo il valore del percorso principale nel tooltip
                    filter: function(item) {
                        return item.datasetIndex === 0;
                    }
                }
            }
        }
    });
});

// Generiamo il grafico automaticamente non appena si apre la pagina
window.onload = () => {
    document.getElementById('btn-generate-rw').click();
};
