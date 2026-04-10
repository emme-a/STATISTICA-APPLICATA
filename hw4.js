// Variabili globali che inizializzeremo in modo sicuro
let canvas, ctx, width, height, padding, graphWidth, graphHeight;

// Confini di visualizzazione
const yMax = 3.5;  // Asse Y da -3.5 a +3.5
const yMin = -3.5;

// Palette di colori vibranti per sfondi scuri
const colors = [
    'rgba(52, 152, 219, 0.9)', // Blu
    'rgba(46, 204, 113, 0.9)', // Verde smeraldo
    'rgba(241, 196, 15, 0.9)', // Giallo sole
    'rgba(155, 89, 182, 0.9)', // Ametista
    'rgba(230, 126, 34, 0.9)', // Arancio
    'rgba(236, 240, 241, 0.9)', // Bianco
    'rgba(26, 188, 156, 0.9)', // Turchese
    'rgba(231, 76, 60, 0.9)',  // Rosso
    'rgba(52, 73, 94, 0.9)',   // Blu notte
    'rgba(211, 84, 0, 0.9)'    // Zucca
];

// Funzioni di utilità per mappare i valori [t, W(t)] nei pixel del canvas
function mapX(t) {
    return padding + t * graphWidth;
}

function mapY(val) {
    // Invertiamo l'asse Y perché il canvas ha lo 0 in alto
    const normalized = (val - yMin) / (yMax - yMin);
    return height - padding - (normalized * graphHeight);
}

// Disegna la griglia e gli assi
function drawGridAndAxes() {
    ctx.clearRect(0, 0, width, height);

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px Arial';

    // Griglia Orizzontale e Labels Asse Y
    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
        const yPos = mapY(y);
        ctx.beginPath();
        ctx.moveTo(padding, yPos);
        ctx.lineTo(width - padding, yPos);
        ctx.stroke();
        
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(y.toFixed(1), padding - 10, yPos);
    }

    // Griglia Verticale e Labels Asse X (Tempo t)
    for (let t = 0; t <= 1; t += 0.2) {
        const xPos = mapX(t);
        ctx.beginPath();
        ctx.moveTo(xPos, padding);
        ctx.lineTo(xPos, height - padding);
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText("t=" + t.toFixed(1), xPos, height - padding + 10);
    }

    // Asse centrale (y=0)
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(padding, mapY(0));
    ctx.lineTo(width - padding, mapY(0));
    ctx.stroke();
}

// Disegna l'inviluppo teorico (Limiti di confidenza al 95%: +/- 1.96*sqrt(t))
function drawEnvelope() {
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(231, 76, 60, 0.8)'; // Rosso acceso
    ctx.setLineDash([5, 5]); // Linea tratteggiata

    // Curva superiore (+1.96 sqrt(t))
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        const val = 1.96 * Math.sqrt(t);
        i === 0 ? ctx.moveTo(mapX(t), mapY(val)) : ctx.lineTo(mapX(t), mapY(val));
    }
    ctx.stroke();

    // Curva inferiore (-1.96 sqrt(t))
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        const val = -1.96 * Math.sqrt(t);
        i === 0 ? ctx.moveTo(mapX(t), mapY(val)) : ctx.lineTo(mapX(t), mapY(val));
    }
    ctx.stroke();

    ctx.setLineDash([]); // Resetta il tratto per le linee normali
}

// Variabili per l'animazione globale
let animationId;
let pathsData = [];
let currentStep = 0;
let totalSteps = 0;

// Logica per simulare e animare i percorsi
function startSimulation() {
    if (!ctx) return; // Sicurezza extra

    // Ferma eventuali animazioni precedenti
    if (animationId) cancelAnimationFrame(animationId);

    const n = parseInt(document.getElementById('step-select').value);
    const numPaths = parseInt(document.getElementById('paths-select').value);
    totalSteps = n;
    currentStep = 0;
    const scaleFactor = Math.sqrt(n);

    // Pre-calcoliamo tutti i percorsi matematicamente
    pathsData = [];
    for (let p = 0; p < numPaths; p++) {
        const path = new Float32Array(n + 1);
        path[0] = 0;
        let currentSum = 0;
        for (let k = 1; k <= n; k++) {
            const step = Math.random() < 0.5 ? -1 : 1;
            currentSum += step;
            path[k] = currentSum / scaleFactor;
        }
        pathsData.push({ data: path, color: colors[p % colors.length] });
    }

    // Pulisce e prepara lo sfondo
    drawGridAndAxes();
    drawEnvelope();

    // Avvia il loop di rendering
    animate();
}

function animate() {
    // Quanti step disegnare per ogni frame? 
    // Vogliamo che l'animazione duri circa 1.5 secondi (a 60fps sono ~90 frame).
    const stepsPerFrame = Math.max(1, Math.floor(totalSteps / 90));
    
    const endStep = Math.min(currentStep + stepsPerFrame, totalSteps);

    // Disegna il segmento per ciascun percorso
    for (let p = 0; p < pathsData.length; p++) {
        const path = pathsData[p].data;
        
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        // Effetto bagliore leggero
        ctx.shadowBlur = 5;
        ctx.shadowColor = pathsData[p].color;
        ctx.strokeStyle = pathsData[p].color;

        // Inizia dall'ultimo punto disegnato
        const startX = mapX(currentStep / totalSteps);
        const startY = mapY(path[currentStep]);
        ctx.moveTo(startX, startY);

        for (let k = currentStep + 1; k <= endStep; k++) {
            const t = k / totalSteps;
            ctx.lineTo(mapX(t), mapY(path[k]));
        }
        ctx.stroke();
    }
    
    // Resetta l'ombra per non appesantire
    ctx.shadowBlur = 0;

    currentStep = endStep;

    // Se non abbiamo finito, richiedi il prossimo frame
    if (currentStep < totalSteps) {
        animationId = requestAnimationFrame(animate);
    }
}

// ==========================================
// INIZIALIZZAZIONE SICURA (Avvia tutto SOLO quando l'HTML è pronto)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('abmCanvas');
    
    // Se non trova il canvas, ferma tutto senza far crashare il sito
    if (!canvas) {
        console.error("Errore: Canvas 'abmCanvas' non trovato nella pagina.");
        return; 
    }

    ctx = canvas.getContext('2d');

    // Imposta le dimensioni in base al canvas HTML
    width = canvas.width;
    height = canvas.height;
    padding = 40;
    graphWidth = width - 2 * padding;
    graphHeight = height - 2 * padding;

    // Collega il bottone
    document.getElementById('btn-simulate').addEventListener('click', startSimulation);

    // Avvia la prima simulazione in automatico
    startSimulation();
});
