let sdeChart = null;

// Algoritmo di Box-Muller per generare Z ~ N(0,1)
// Questo sostituisce i salti discreti (Rademacher) per avere una simulazione SDE rigorosa
function randomNormal() {
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = Math.random(); // Evita il log(0)
    while (u2 === 0) u2 = Math.random();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

// Generatore SDE basato su Metodo Euler-Maruyama
function simulateProcess(type, mu, sigma, theta, n, T, S0) {
    const dataPoints = [];
    const dt = T / n;
    const sqrtDt = Math.sqrt(dt);
    
    let currentX = S0;
    dataPoints.push(currentX);

    for (let k = 1; k <= n; k++) {
        // Incremento standard Browniano: dW = sqrt(dt) * Z
        const dW = sqrtDt * randomNormal();
        let dX = 0;

        if (type === 'abm') {
            // Arithmetic Brownian Motion: dX = mu*dt + sigma*dW
            dX = (mu * dt) + (sigma * dW);
        } 
        else if (type === 'gbm') {
            // Geometric Brownian Motion: dS = mu*S*dt + sigma*S*dW
            dX = (mu * currentX * dt) + (sigma * currentX * dW);
        } 
        else if (type === 'ou') {
            // Ornstein-Uhlenbeck: dX = theta*(mean - X)*dt + sigma*dW
            // Assumiamo che la media di lungo termine sia uguale a S0
            dX = (theta * (S0 - currentX) * dt) + (sigma * dW);
        }

        currentX += dX;
        
        // Evitiamo valori negativi nel GBM per via dell'approssimazione discreta
        if (type === 'gbm' && currentX < 0) currentX = 0; 
        
        dataPoints.push(currentX);
    }
    return dataPoints;
}

function updateChart() {
    // Lettura dei parametri
    const type = document.getElementById('process-select').value;
    const mu = parseFloat(document.getElementById('input-mu').value);
    const sigma = parseFloat(document.getElementById('input-sigma').value);
    const theta = parseFloat(document.getElementById('input-theta').value);
    
    const n = 1000; // Numero di step discreti
    const T = 1;    // Orizzonte temporale (es. 1 anno)
    const S0 = 100; // Valore di partenza

    // Disabilitazione campo Theta se non siamo in OU
    document.getElementById('input-theta').disabled = (type !== 'ou');

    // Generazione asse temporale
    const labels = [];
    for (let k = 0; k <= n; k++) {
        labels.push((k * (T / n)).toFixed(3));
    }

    // Palette di colori
    const lineColors = [
        'rgba(41, 128, 185, 0.8)', // Blu
        'rgba(39, 174, 96, 0.8)',  // Verde
        'rgba(230, 126, 34, 0.8)', // Arancio
        'rgba(142, 68, 173, 0.8)', // Viola
        'rgba(231, 76, 60, 0.8)'   // Rosso
    ];

    const datasets = [];
    
    // Generiamo 5 percorsi casuali
    for (let i = 0; i < 5; i++) {
        const pathData = simulateProcess(type, mu, sigma, theta, n, T, S0);
        datasets.push({
            label: `Traiettoria ${i + 1}`,
            data: pathData,
            borderColor: lineColors[i],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
            tension: 0
        });
    }

    const ctx = document.getElementById('sdeChart').getContext('2d');
    
    if (sdeChart) {
        sdeChart.destroy();
    }

    sdeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels, 
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            normalized: true, 
            parsing: true, 
            interaction: {
                mode: 'nearest',
                intersect: false
            },
            elements: {
                line: { borderJoinStyle: 'round' }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Tempo (t)', font: { size: 14, weight: 'bold' } },
                    ticks: {
                        maxTicksLimit: 10,
                        callback: function(value, index, values) {
                            return (index / n).toFixed(2);
                        }
                    }
                },
                y: {
                    title: { display: true, text: 'Valore Asset (X_t)', font: { size: 14, weight: 'bold' } }
                    // Non fissiamo min/max in modo che si adatti dinamicamente ai vari processi
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { font: { size: 13 } }
                }
            }
        }
    });
}

// Listeners
document.getElementById('btn-simulate').addEventListener('click', updateChart);
// Aggiorna in tempo reale se l'utente cambia tipo di processo dal menu a tendina
document.getElementById('process-select').addEventListener('change', updateChart);

// Avvio Sicuro
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateChart);
} else {
    updateChart();
}
