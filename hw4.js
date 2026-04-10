let abmChart = null;

// Random Walk scalata (Donsker)
function simulateScaledRandomWalk(n) {
    const data = [0];
    let sum = 0;
    const scale = Math.sqrt(n);

    for (let k = 1; k <= n; k++) {
        const step = Math.random() < 0.5 ? -1 : 1;
        sum += step;
        data.push(sum / scale);
    }

    return data;
}

// Inviluppo teorico ±1.96√t
function generateEnvelope(n, sign) {
    const data = [0];
    const multiplier = sign * 1.96;

    for (let k = 1; k <= n; k++) {
        const t = k / n;
        data.push(multiplier * Math.sqrt(t));
    }

    return data;
}

function updateChart() {
    const n = parseInt(document.getElementById("step-select").value);

    const labels = Array.from({ length: n + 1 }, (_, i) => i / n);

    const paths = [
        simulateScaledRandomWalk(n),
        simulateScaledRandomWalk(n),
        simulateScaledRandomWalk(n)
    ];

    const upper = generateEnvelope(n, 1);
    const lower = generateEnvelope(n, -1);

    const ctx = document.getElementById("abmChart").getContext("2d");

    if (abmChart) abmChart.destroy();

    const heavy = n > 5000;

    abmChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                ...paths.map((p, i) => ({
                    label: `Simulazione ${i + 1}`,
                    data: p,
                    borderWidth: 1.5,
                    pointRadius: 0
                })),
                {
                    label: "+1.96√t",
                    data: upper,
                    borderDash: [6,6],
                    borderWidth: 2,
                    pointRadius: 0
                },
                {
                    label: "-1.96√t",
                    data: lower,
                    borderDash: [6,6],
                    borderWidth: 2,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: heavy ? false : true,
            normalized: true,
            parsing: false,
            scales: {
                x: {
                    title: { display: true, text: "Tempo t" },
                    ticks: { maxTicksLimit: 10 }
                },
                y: {
                    title: { display: true, text: "Valore scalato" },
                    suggestedMin: -3,
                    suggestedMax: 3
                }
            },
            plugins: {
                legend: { position: "top" },
                tooltip: { enabled: !heavy }
            }
        }
    });
}

// FIX IMPORTANTE: DOM pronto
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-simulate")
        .addEventListener("click", updateChart);

    updateChart();
});
