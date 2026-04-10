let abmChart = null;

function simulateScaledRandomWalk(n) {
    const dataPoints = [];
    const labels = [];
    let currentSum = 0;
    
    // Il fattore di scala radice quadrata di n
    const scaleFactor = Math.sqrt(n);

    // Inizializzazione al tempo t=0
    dataPoints.push(0);
    labels.push(0);

    for (let k = 1; k <= n; k++) {
        // Variabile di Rademacher: -1 o +1 con probabilità 50%
        const step = Math.random() < 0.5 ? -1 : 1;
        
        // Somma cumulativa S_k
        currentSum += step;
        
        // Scalatura per far convergere la varianza: W_n(t) = S_k / sqrt(n)
        const scaledValue = currentSum / scaleFactor;
        
        // Tempo normalizzato t in [0, 1]
        const t = k / n;
        
        dataPoints.push(scaledValue);
        
        // Per non appesantire il rendering del browser con le etichette dell'asse X,
        // ne stampiamo solo alcune formattate, oppure usiamo direttamente t
        labels.push(t.toFixed(3));
    }

    return { labels, dataPoints };
}

function updateChart() {
    const selectEl = document.getElementById('step-select');
    const n = parseInt(selectEl.value);

    // Generiamo 3 percorsi simultanei per far vedere l'invarianza della dispersione
    const path1 = simulateScaledRandomWalk(n);
    const path2 = simulateScaledRandomWalk(n);
    const path3 = simulateScaledRandomWalk(n);

    const ctx = document.getElementById('abmChart').getContext('2d');
    
    if (abmChart) {
        abmChart.destroy();
    }

    abmChart = new Chart(ctx, {
        type: 'line',
        data: {
            // L'asse temporale è lo stesso per tutti e va da 0 a 1
            labels: path1.labels, 
            datasets: [
                {
                    label: 'Percorso Browniano 1',
                    data: path1.dataPoints,
                    borderColor: 'rgba(142, 68, 173, 0.9)', // Viola scuro
                    borderWidth: 1.5,
                    pointRadius: 0,
                    fill: false,
                    tension: 0
                },
                {
                    label: 'Percorso Browniano 2',
                    data: path2.dataPoints,
                    borderColor: 'rgba(41, 128, 185, 0.6)', // Blu trasparente
                    borderWidth: 1,
                    pointRadius: 0,
                    fill: false,
                    tension: 0
                },
                {
                    label: 'Percorso Browniano 3',
                    data: path3.dataPoints,
                    borderColor: 'rgba(39, 174, 96, 0.6)', // Verde trasparente
                    borderWidth: 1,
                    pointRadius: 0,
                    fill: false,
                    tension: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                // Riduciamo il tempo di animazione se n è molto grande per non far laggare il browser
                duration: n > 5000 ? 0 : 500
            },
            interaction: {
                mode: 'nearest',
                intersect: false
            },
            scales: {
                x: {
                    title: { display: true, text: 'Tempo normalizzato t ∈ [0, 1]', font: { weight: 'bold' } },
                    // Mostriamo al massimo 10 etichette sull'asse X per evitare sovrapposizioni
                    ticks: { maxTicksLimit: 10 }
                },
                y: {
                    title: { display: true, text: 'Valore Scalato S_k / √n', font: { weight: 'bold' } },
                    // Fissiamo arbitrariamente una scala Y per far notare visivamente 
                    // che al crescere di n il range verticale RIMANE STABILE tra ~ -3 e +3
                    suggestedMin: -3,
                    suggestedMax: 3
                }
            },
            plugins: {
                tooltip: {
                    enabled: n <= 5000 // Disabilita i tooltip per i rendering troppo pesanti
                }
            }
        }
    });
}

// Event Listeners
document.getElementById('btn-simulate').addEventListener('click', updateChart);

// Rendering iniziale quando il DOM è caricato
document.addEventListener('DOMContentLoaded', updateChart);
