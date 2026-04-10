let abmChart = null;

// Funzione matematica per generare il Random Walk Scalato
function simulateScaledRandomWalk(n) {
    const dataPoints = [];
    let currentSum = 0;
    const scaleFactor = Math.sqrt(n);

    // Partenza al tempo 0, valore 0
    dataPoints.push(0);

    for (let k = 1; k <= n; k++) {
        // Rademacher: -1 o +1
        const step = Math.random() < 0.5 ? -1 : 1;
        currentSum += step;
        
        // Applichiamo la formula di Donsker: S_k / sqrt(n)
        const scaledValue = currentSum / scaleFactor;
        dataPoints.push(scaledValue);
    }
    return dataPoints;
}

// Funzione per generare le Bande di Confidenza Teoriche (Inviluppo)
// Il Moto Browniano ha varianza t, quindi deviazione standard sqrt(t).
// Il limite al 95% è circa 1.96 * sqrt(t).
function generateTheoreticalEnvelope(n, isUpper) {
    const dataPoints = [];
    dataPoints.push(0);
    const multiplier = isUpper ? 1.96 : -1.96;

    for (let k = 1; k <= n; k++) {
        const t = k / n;
        dataPoints.push(multiplier * Math.sqrt(t));
    }
    return dataPoints;
}

function updateChart() {
    const selectEl = document.getElementById('step-select');
    const n = parseInt(selectEl.value);

    // Asse temporale t (da 0 a 1)
    const labels = [];
    for (let k = 0; k <= n; k++) {
        labels.push((k / n).toFixed(3));
    }

    // Generiamo 3 percorsi simulati
    const path1 = simulateScaledRandomWalk(n);
    const path2 = simulateScaledRandomWalk(n);
    const path3 = simulateScaledRandomWalk(n);

    // Generiamo l'inviluppo teorico
    const upperEnvelope = generateTheoreticalEnvelope(n, true);
    const lowerEnvelope = generateTheoreticalEnvelope(n, false);

    const ctx = document.getElementById('abmChart').getContext('2d');
    
    if (abmChart) {
        abmChart.destroy();
    }

    // Ottimizzazioni per Chart.js se n è molto grande
    const disableAnimations = n > 5000;

    abmChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels, 
            datasets: [
                // I 3 percorsi simulati
                {
                    label: 'Simulazione 1',
                    data: path1,
                    borderColor: 'rgba(41, 128, 185, 0.8)', // Blu
                    borderWidth: 1.5,
                    pointRadius: 0,
                    fill: false,
                    tension: 0
                },
                {
                    label: 'Simulazione 2',
                    data: path2,
                    borderColor: 'rgba(39, 174, 96, 0.8)', // Verde
                    borderWidth: 1.5,
                    pointRadius: 0,
                    fill: false,
                    tension: 0
                },
                {
                    label: 'Simulazione 3',
                    data: path3,
                    borderColor: 'rgba(230, 126, 34, 0.8)', // Arancio
                    borderWidth: 1.5,
                    pointRadius: 0,
                    fill: false,
                    tension: 0
                },
                // Le 2 Bande di Confidenza (Inviluppo)
                {
                    label: 'Confidenza Teorica (+1.96σ)',
                    data: upperEnvelope,
                    borderColor: 'rgba(231, 76, 60, 1)', // Rosso
                    borderWidth: 2,
                    borderDash: [5, 5], // Linea tratteggiata
                    pointRadius: 0,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Confidenza Teorica (-1.96σ)',
                    data: lowerEnvelope,
                    borderColor: 'rgba(231, 76, 60, 1)', // Rosso
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            // Disabilitiamo le animazioni e i tooltip per evitare blocchi del browser con 20000 punti
            animation: disableAnimations ? false : undefined,
            normalized: true, // Aumenta drasticamente le performance
            parsing: false,   // Salta il parsing automatico dei dati per aumentare la velocità
            interaction: {
                mode: 'nearest',
                intersect: false
            },
            elements: {
                line: {
                    borderJoinStyle: 'round'
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Tempo (t)', font: { size: 14, weight: 'bold' } },
                    ticks: {
                        maxTicksLimit: 10,
                        callback: function(value, index, values) {
                            // Rende più pulite le etichette dell'asse X
                            return (index / n).toFixed(1);
                        }
                    }
                },
                y: {
                    title: { display: true, text: 'Valore Scalato (S_k / √n)', font: { size: 14, weight: 'bold' } },
                    suggestedMin: -3,
                    suggestedMax: 3
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { font: { size: 13 } }
                },
                tooltip: {
                    enabled: !disableAnimations // Attivi solo se n <= 5000
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const btnSimulate = document.getElementById('btn-simulate');

    if (btnSimulate) {
        btnSimulate.addEventListener('click', updateChart);
    }

    updateChart(); // primo rendering
});
