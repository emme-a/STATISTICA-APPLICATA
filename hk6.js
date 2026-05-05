let tradingChart = null;

// Generatore Box-Muller per i numeri casuali normali
function boxMuller() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Calcolo della Simple Moving Average (SMA)
function calculateSMA(data, period) {
    const sma = new Array(data.length).fill(null); // Riempe i primi giorni (non calcolabili) con null
    for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j];
        }
        sma[i] = sum / period;
    }
    return sma;
}

function runBacktest() {
    // 1. Lettura dei Parametri
    const mu = parseFloat(document.getElementById('input-mu').value);
    const sigma = parseFloat(document.getElementById('input-sigma').value);
    const fastPeriod = parseInt(document.getElementById('input-fast').value);
    const slowPeriod = parseInt(document.getElementById('input-slow').value);
    
    const n = 500; // Giorni di trading
    const dt = 1 / 252; // Anno di trading tipico (252 giorni lavorativi)
    const sqrtDt = Math.sqrt(dt);
    const S0 = 100; // Prezzo di partenza

    // 2. Generazione Prezzo (GBM - Euler-Maruyama)
    const prices = [S0];
    let currentS = S0;
    for (let i = 1; i <= n; i++) {
        const dW = boxMuller() * sqrtDt;
        const dS = mu * currentS * dt + sigma * currentS * dW;
        currentS += dS;
        if (currentS < 0.01) currentS = 0.01; // Floor di sicurezza
        prices.push(currentS);
    }

    // 3. Calcolo Indicatori (Medie Mobili)
    const fastSMA = calculateSMA(prices, fastPeriod);
    const slowSMA = calculateSMA(prices, slowPeriod);

    // 4. Esecuzione Backtest (PnL e MDD)
    let pnl = 0;
    let peak = 0;
    let maxDrawdown = 0;
    let position = 0; // 0=Flat, 1=Long, -1=Short
    const pnlCurve = [0]; // Traccia del PnL per grafico (se necessario)

    for (let i = 1; i <= n; i++) {
        // A. Calcolo del profitto basato sulla posizione tenuta IERI
        const priceChange = prices[i] - prices[i-1];
        pnl += position * priceChange;
        pnlCurve.push(pnl);

        // B. Calcolo Drawdown
        if (pnl > peak) {
            peak = pnl;
        }
        const currentDrawdown = peak - pnl;
        if (currentDrawdown > maxDrawdown) {
            maxDrawdown = currentDrawdown;
        }

        // C. Generazione Segnale di Trading (per DOMANI)
        // Possiamo tradare solo se abbiamo entrambe le medie mobili (giorno >= slowPeriod)
        if (fastSMA[i] !== null && slowSMA[i] !== null) {
            if (fastSMA[i] > slowSMA[i]) {
                position = 1; // Long
            } else if (fastSMA[i] < slowSMA[i]) {
                position = -1; // Short
            }
        }
    }

    // 5. Aggiornamento KPI UI
    const elPnl = document.getElementById('val-pnl');
    elPnl.textContent = `€ ${pnl.toFixed(2)}`;
    // Colora il box del PnL in base al risultato (verde/grigio)
    elPnl.parentElement.style.background = pnl >= 0 ? "linear-gradient(135deg, #2ecc71, #27ae60)" : "linear-gradient(135deg, #95a5a6, #7f8c8d)";
    
    document.getElementById('val-mdd').textContent = `€ ${maxDrawdown.toFixed(2)}`;

    // 6. Costruzione Grafico Chart.js
    const labels = Array.from({length: n + 1}, (_, i) => i);
    const ctx = document.getElementById('tradingChart').getContext('2d');
    
    if (tradingChart) tradingChart.destroy();

    tradingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Prezzo Asset (GBM)',
                    data: prices,
                    borderColor: '#2c3e50',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.1
                },
                {
                    label: `SMA Veloce (${fastPeriod})`,
                    data: fastSMA,
                    borderColor: '#f1c40f',
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    tension: 0.1
                },
                {
                    label: `SMA Lenta (${slowPeriod})`,
                    data: slowSMA,
                    borderColor: '#e74c3c',
                    borderWidth: 1.5,
                    borderDash: [2, 2],
                    pointRadius: 0,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: { title: { display: true, text: 'Giorni di Trading (t)', font: { weight: 'bold' } }, ticks: { maxTicksLimit: 15 } },
                y: { title: { display: true, text: 'Valore', font: { weight: 'bold' } } }
            },
            plugins: {
                legend: { position: 'top' },
                tooltip: { mode: 'index', intersect: false }
            }
        }
    });
}

// Event Listeners
document.getElementById('btn-simulate').addEventListener('click', runBacktest);
window.onload = runBacktest;
