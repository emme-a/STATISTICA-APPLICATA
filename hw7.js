let payoffChart = null;

// Funzioni base del Payoff delle Opzioni al netto del premio
function callPayoff(ST, K, premium, position = 1) {
    // position = 1 (Long/Acquisto), position = -1 (Short/Vendita)
    return position * (Math.max(ST - K, 0) - premium);
}

function putPayoff(ST, K, premium, position = 1) {
    return position * (Math.max(K - ST, 0) - premium);
}

function calculateStrategyPayoff(strategy, ST) {
    // Assumiamo che il prezzo corrente sia circa 100 per strutturare le strategie classiche
    switch(strategy) {
        case 'call':
            // Acquisto Call Strike 100, costo 5
            return callPayoff(ST, 100, 5, 1);
            
        case 'put':
            // Acquisto Put Strike 100, costo 5
            return putPayoff(ST, 100, 5, 1);
            
        case 'straddle':
            // Acquista Call (K=100, costo=5) + Acquista Put (K=100, costo=5)
            // Scommessa: Forte esplosione della volatilità in qualunque direzione
            return callPayoff(ST, 100, 5, 1) + putPayoff(ST, 100, 5, 1);
            
        case 'bullspread':
            // Acquista Call (K=90, costo=12) + Vendi Call (K=110, incasso=3)
            // Profitto limitato, ma rischio ridotto grazie alla call venduta
            return callPayoff(ST, 90, 12, 1) + callPayoff(ST, 110, 3, -1);
            
        case 'ironcondor':
            // Vendi Put (K=90, p=3), Acquista Put (K=80, p=1)
            // Vendi Call (K=110, p=3), Acquista Call (K=120, p=1)
            // Scommessa: Mercato laterale, la volatilità crollerà e il prezzo resterà tra 90 e 110.
            const putSpread = putPayoff(ST, 90, 3, -1) + putPayoff(ST, 80, 1, 1);
            const callSpread = callPayoff(ST, 110, 3, -1) + callPayoff(ST, 120, 1, 1);
            return putSpread + callSpread;
            
        default:
            return 0;
    }
}

function updateChart() {
    const strategy = document.getElementById('strategy-select').value;
    
    // Generiamo i prezzi del sottostante a scadenza S_T (asse X da 50 a 150)
    const labels = [];
    const dataPoints = [];
    const zeroLine = []; // Linea di Break-Even

    for (let ST = 50; ST <= 150; ST++) {
        labels.push(ST);
        dataPoints.push(calculateStrategyPayoff(strategy, ST));
        zeroLine.push(0);
    }

    const ctx = document.getElementById('payoffChart').getContext('2d');
    
    if (payoffChart) payoffChart.destroy();

    // Chart.js per disegnare il profilo di rischio
    payoffChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Net Payoff (PnL)',
                    data: dataPoints,
                    borderColor: '#2c3e50',
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0, // Linee spigolose tipiche dei payoff delle opzioni
                    fill: {
                        target: 'origin', // Riempe l'area fino allo zero
                        above: 'rgba(46, 204, 113, 0.4)', // Verde per profitto
                        below: 'rgba(231, 76, 60, 0.4)'   // Rosso per perdita
                    }
                },
                {
                    label: 'Break-Even (0)',
                    data: zeroLine,
                    borderColor: '#95a5a6',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    title: { display: true, text: 'Prezzo del Sottostante a Scadenza (S_T)', font: { weight: 'bold' } },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                y: {
                    title: { display: true, text: 'Profitto / Perdita Netta (€)', font: { weight: 'bold' } },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                }
            },
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                let val = context.parsed.y;
                                return ' PnL: € ' + val.toFixed(2);
                            }
                            return '';
                        }
                    }
                }
            }
        }
    });
}

// Event Listeners
document.getElementById('strategy-select').addEventListener('change', updateChart);

// Avvio Sicuro
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateChart);
} else {
    updateChart();
}
