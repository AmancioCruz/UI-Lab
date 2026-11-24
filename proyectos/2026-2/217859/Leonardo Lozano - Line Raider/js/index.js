const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

let modo = "dibujar"; // "dibujar"
const lineas = [];
let dibujando = false;
let ultimoPunto = { x: 0, y: 0 };

const jugador = { x: 80, y: 120, vx: 0, vy: 0, radio: 18, tamano: 52, angulo: 0 };
const gravedad = 0.25;
const friccion = 0.99;

let nivel = 1;
let estrellas = []; // Lista de estrellas del nivel actual

const niveles = {
    1: [
        { rx: 0.85, ry: 0.78 }  // Estrella 2: Abajo (bajada de la montaña)
    ],
    2: [
        { rx: 0.35, ry: 0.75 }, // Estrella 1: Valle izquierdo para tomar impulso
        { rx: 0.82, ry: 0.45 }  // Estrella 2: Cima alta a la derecha
    ],
    3: [
        { rx: 0.65, ry: 0.22 }, // Estrella 1: Montaña alta a la derecha
        { rx: 0.20, ry: 0.82 }  // Estrella 2: Retorno abajo a la izquierda
    ]
};

// --- ASSETS 
const fondo = new Image();
fondo.src = "recursos/fondo.jpg";

const esquiadorImg = new Image();
esquiadorImg.src = "recursos/equiador.jpg";
let spriteEsquiador = null;

esquiadorImg.addEventListener("load", () => {
    const aux = document.createElement("canvas");
    aux.width = esquiadorImg.width;
    aux.height = esquiadorImg.height;
    const auxCtx = aux.getContext("2d");
    auxCtx.drawImage(esquiadorImg, 0, 0);

    const data = auxCtx.getImageData(0, 0, aux.width, aux.height);
    for (let i = 0; i < data.data.length; i += 4) {
        if (data.data[i] > 240 && data.data[i + 1] > 240 && data.data[i + 2] > 240) {
            data.data[i + 3] = 0;
        }
    }
    auxCtx.putImageData(data, 0, 0);
    spriteEsquiador = aux;
    redibujar();
});

fondo.addEventListener("load", redibujar);

// --- ESTADO Y NIVELES ---
function resetearJugador() {
    jugador.x = 80;
    jugador.y = 120;
    jugador.vx = 0;
    jugador.vy = 0;
    jugador.angulo = 0;
}

function cambiarModo(nuevoModo) {
    modo = nuevoModo;
    document.querySelector("#btn-dibujar")?.classList.toggle("activo", modo === "dibujar");
    document.querySelector("#btn-play")?.classList.toggle("activo", modo === "play");
}

function ubicarEstrellas() {
    for (const est of estrellas) {
        est.x = canvas.width * est.rx;
        est.y = canvas.height * est.ry;
    }
}

function cargarNivel(num) {
    nivel = num;
    lineas.length = 0;
    dibujando = false;
    resetearJugador();
    cambiarModo("dibujar");

    // Crear las estrellas del nivel
    const config = niveles[nivel] || niveles[1];
    estrellas = config.map(pos => ({
        rx: pos.rx,
        ry: pos.ry,
        x: 0,
        y: 0,
        radio: 22,
        recogida: false
    }));

    ubicarEstrellas();

    const txtNivel = document.querySelector("#nivel-texto");
    if (txtNivel) txtNivel.textContent = nivel;
    redibujar();
}

function ajustarTamano() {
    const marco = canvas.parentElement;
    if (!marco) return;
    canvas.width = marco.clientWidth;
    canvas.height = marco.clientHeight;
    ubicarEstrellas();
    redibujar();
}

window.addEventListener("resize", ajustarTamano);

// --- ENTRADA (MOUSE Y TÁCTIL) ---
function coords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: Math.max(0, Math.min(canvas.width, e.clientX - rect.left)),
        y: Math.max(0, Math.min(canvas.height, e.clientY - rect.top))
    };
}

canvas.addEventListener("pointerdown", (e) => {
    if (modo !== "dibujar" || (e.pointerType === "mouse" && e.button !== 0)) return;
    canvas.setPointerCapture(e.pointerId);
    dibujando = true;
    ultimoPunto = coords(e);
});

canvas.addEventListener("pointermove", (e) => {
    if (modo !== "dibujar" || !dibujando) return;
    const actual = coords(e);
    if (Math.hypot(actual.x - ultimoPunto.x, actual.y - ultimoPunto.y) >= 8) {
        lineas.push({ x1: ultimoPunto.x, y1: ultimoPunto.y, x2: actual.x, y2: actual.y });
        ultimoPunto = actual;
        redibujar();
    }
});

canvas.addEventListener("pointerup", (e) => {
    if (!dibujando) return;
    dibujando = false;
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
});

// --- BOTONES
document.querySelector("#btn-dibujar")?.addEventListener("click", () => cambiarModo("dibujar"));
document.querySelector("#btn-play")?.addEventListener("click", () => cambiarModo("play"));

document.querySelector("#btn-reiniciar")?.addEventListener("click", () => {
    resetearJugador();
    for (const est of estrellas) est.recogida = false;
    cambiarModo("dibujar");
    redibujar();
});

document.querySelector("#btn-borrar")?.addEventListener("click", () => {
    cargarNivel(nivel);
});

// --- FiSICAS ---
function actualizarFisicas() {
    if (modo !== "play") return;

    jugador.vy += gravedad;
    jugador.x += jugador.vx;
    jugador.y += jugador.vy;
    jugador.vx *= friccion;
    jugador.vy *= friccion;

    for (const est of estrellas) {
        if (!est.recogida && Math.hypot(jugador.x - est.x, jugador.y - est.y) < jugador.radio + est.radio) {
            est.recogida = true;
        }
    }

    // Si ya recogió TODAS las estrellas del nivel
    if (estrellas.every(est => est.recogida)) {
        cambiarModo("dibujar");
        redibujar();
        setTimeout(() => {
            alert(`¡Nivel ${nivel} completado! Recogiste las ${estrellas.length} estrellas.`);
            cargarNivel(nivel < 3 ? nivel + 1 : 1);
        }, 100);
        return;
    }

    let enSuelo = false;

    for (const l of lineas) {
        const dx = l.x2 - l.x1;
        const dy = l.y2 - l.y1;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) continue;

        const t = Math.max(0, Math.min(1, ((jugador.x - l.x1) * dx + (jugador.y - l.y1) * dy) / lenSq));
        const cx = l.x1 + t * dx;
        const cy = l.y1 + t * dy;
        const distX = jugador.x - cx;
        const distY = jugador.y - cy;
        const dist = Math.hypot(distX, distY);

        if (dist < jugador.radio && dist > 0) {
            enSuelo = true;
            jugador.x = cx + (distX / dist) * jugador.radio;
            jugador.y = cy + (distY / dist) * jugador.radio;

            const len = Math.sqrt(lenSq);
            const tx = dx / len;
            const ty = dy / len;
            const vTangente = jugador.vx * tx + jugador.vy * ty;
            jugador.vx = vTangente * tx;
            jugador.vy = vTangente * ty;
            jugador.angulo = Math.atan2(ty, tx) * 0.6;
        }
    }

    if (!enSuelo) {
        const aire = Math.max(-0.5, Math.min(0.6, jugador.vy * 0.04));
        jugador.angulo += (aire - jugador.angulo) * 0.15;
    }

    // Bordes del pizarrón
    if (jugador.y > canvas.height - jugador.radio) {
        jugador.y = canvas.height - jugador.radio;
        jugador.vy = 0;
        jugador.vx *= 0.9;
        jugador.angulo = 0;
    }
    if (jugador.x > canvas.width - jugador.radio) {
        jugador.x = canvas.width - jugador.radio;
        jugador.vx *= -0.5;
    }
    if (jugador.x < jugador.radio) {
        jugador.x = jugador.radio;
        jugador.vx *= -0.5;
    }
}

// --- TRAZO ---
function dibujarCirculo(x, y, r, relleno, borde, grosor = 2) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (relleno) {
        ctx.fillStyle = relleno;
        ctx.fill();
    }
    if (borde) {
        ctx.lineWidth = grosor;
        ctx.strokeStyle = borde;
        ctx.stroke();
    }
}

function redibujar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (fondo.complete && fondo.naturalWidth > 0) {
        const scale = Math.max(canvas.width / fondo.width, canvas.height / fondo.height);
        const w = fondo.width * scale;
        const h = fondo.height * scale;
        ctx.drawImage(fondo, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    }

    // Dibujar las 2 estrellas
    for (const est of estrellas) {
        dibujarCirculo(
            est.x,
            est.y,
            est.radio,
            est.recogida ? "#4CAF50" : "#FFD700",
            est.recogida ? "#2E7D32" : "#DAA520",
            3
        );
        ctx.fillStyle = est.recogida ? "#FFF" : "#000";
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(est.recogida ? "✓" : "★", est.x, est.y);
    }

    // Lineas
    ctx.strokeStyle = "#111116";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    for (const l of lineas) {
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
    }

    // Esquiador
    ctx.save();
    ctx.translate(jugador.x, jugador.y);
    ctx.rotate(jugador.angulo);
    if (jugador.vx < -0.3) ctx.scale(-1, 1);

    if (spriteEsquiador) {
        ctx.drawImage(spriteEsquiador, -jugador.tamano / 2, -jugador.tamano / 2, jugador.tamano, jugador.tamano);
    } else {
        dibujarCirculo(0, 0, jugador.radio, "#ff4d6d", "#000", 2);
    }
    ctx.restore();
}

function bucle() {
    actualizarFisicas();
    if (modo === "play") redibujar();
    requestAnimationFrame(bucle);
}

ajustarTamano();
cargarNivel(1);
bucle();