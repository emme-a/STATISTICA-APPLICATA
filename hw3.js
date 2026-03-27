let randomWalkChart = null;

document.getElementById('btn-generate-rw').addEventListener('click', () => {
    const steps = 1000;
    let currentValue = 1000; // Valore x(0) di partenza
    
    // Array per contenere i dati del grafico
    const dataPoints = [currentValue];
    const labels = [0];

    // Ciclo di generazione del Random Walk
    for (let i = 1; i <= steps; i++) {
        // Genera un salto pseudo-casuale: -1 o +1 (con probabilità 50%)
        const step = Math.random() < 0.5 ? -1 : 1;
        
        // Aggiorna il valore corrente: x(i) = x(i-1) + step
        currentValue += step;
        
        // Salva i valori per il grafico
        dataPoints.push(currentValue);
        labels.push(i);
    }

    // Disegno o aggiornamento del grafico con Chart.js
    const ctx = document.getElementById('randomWalkChart').getContext('2d');
    
    // Distruggiamo il grafico vecchio se esiste per non sovrapporli
    if (randomWalkChart) {
        randomWalkChart.destroy();
    }

    randomWalkChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Simulazione Prezzo Asset',
                data: dataPoints,
                borderColor: '#2980b9',
                borderWidth: 1.5,
                pointRadius: 0, // Rimuoviamo i pallini per rendere la linea continua e fluida
                fill: false,
                tension: 0.1 // Leggera smussatura
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 500 // Animazione rapida al click
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
            scales: {
                x: {
                    title: { display: true, text: 'Step temporale (i)' },
                    ticks: { maxTicksLimit: 10 }
                },
                y: {
                    title: { display: true, text: 'Prezzo (Valore)' }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Prezzo: ' + context.parsed.y;
                        }
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
