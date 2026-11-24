const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

// --- ESTADO Y CONFIGURACIÓN ---
let modo = "dibujar"; // "dibujar" o "play"
const lineas = [];     // Segmentos de pista: { x1, y1, x2, y2 }
let dibujandoLinea = false;
let ultimoPunto = { x: 0, y: 0 };

const jugador = {
    x: 80,
    y: 80,
    vx: 0,
    vy: 0,
    radio: 18,      // Radio de colisión del esquiador
    tamanoVisual: 52, // Tamaño en píxeles al dibujar el sprite
    angulo: 0,
    enSuelo: false
};

const gravedad = 0.25;
const friccion = 0.99;
const distanciaMinimaSegmento = 8;

// --- NIVELES Y META ---
let nivelActual = 1;
const meta = {
    x: 800,
    y: 400,
    radio: 22,
    alcanzada: false
};

const posicionesMetasRelativas = {
    1: { rx: 0.85, ry: 0.72 },
    2: { rx: 0.85, ry: 0.28 },
    3: { rx: 0.22, ry: 0.82 }
};

function actualizarPosicionMetaSegunCanvas() {
    const rel = posicionesMetasRelativas[nivelActual] || { rx: 0.85, ry: 0.72 };
    meta.x = canvas.width * rel.rx;
    meta.y = canvas.height * rel.ry;
}

function reiniciarJugador() {
    jugador.x = 80;
    jugador.y = 80;
    jugador.vx = 0;
    jugador.vy = 0;
    jugador.angulo = 0;
    jugador.enSuelo = false;
}

function establecerModo(nuevoModo) {
    modo = nuevoModo;
    const btnDibujar = document.querySelector("#btn-dibujar");
    const btnPlay = document.querySelector("#btn-play");

    if (btnDibujar && btnPlay) {
        btnDibujar.classList.toggle("activo", modo === "dibujar");
        btnPlay.classList.toggle("activo", modo === "play");
    }
}

function cargarNivel(numNivel) {
    nivelActual = numNivel;
    meta.alcanzada = false;
    actualizarPosicionMetaSegunCanvas();

    const textoNivel = document.querySelector("#nivel-texto");
    if (textoNivel) {
        textoNivel.textContent = nivelActual;
    }

    lineas.length = 0;
    dibujandoLinea = false;
    reiniciarJugador();
    establecerModo("dibujar");
    redibujarTodo();
}

// --- FONDO DEL PIZARRON ---
const imagenFondo = new Image();
imagenFondo.src = "recursos/fondo.jpg";
let fondoCargado = false;

imagenFondo.addEventListener("load", () => {
    fondoCargado = true;
    redibujarTodo();
});

function dibujarFondoCover() {
    if (!fondoCargado || canvas.width === 0 || canvas.height === 0) return;

    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = imagenFondo.width / imagenFondo.height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
    } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
    }

    ctx.drawImage(imagenFondo, offsetX, offsetY, drawWidth, drawHeight);
}

// --- PERSONAJE ESQUIADOR---
const imagenEsquiadorOriginal = new Image();
imagenEsquiadorOriginal.src = "recursos/equiador.jpg";
let spriteEsquiadorListo = null;

imagenEsquiadorOriginal.addEventListener("load", () => {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = imagenEsquiadorOriginal.width;
    tempCanvas.height = imagenEsquiadorOriginal.height;
    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.drawImage(imagenEsquiadorOriginal, 0, 0);
    const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0;
        }
    }

    tempCtx.putImageData(imgData, 0, 0);
    spriteEsquiadorListo = tempCanvas;
    redibujarTodo();
});

function dibujarJugador() {
    ctx.save();
    ctx.translate(jugador.x, jugador.y);
    ctx.rotate(jugador.angulo);

    // Voltear horizontalmente si va hacia la izquierda
    if (jugador.vx < -0.3) {
        ctx.scale(-1, 1);
    }

    if (spriteEsquiadorListo) {
        const mitad = jugador.tamanoVisual / 2;
        ctx.drawImage(
            spriteEsquiadorListo,
            -mitad,
            -mitad,
            jugador.tamanoVisual,
            jugador.tamanoVisual
        );
    } else {
        // Respaldo mientras carga la imagen
        ctx.fillStyle = "#ff4d6d";
        ctx.beginPath();
        ctx.arc(0, 0, jugador.radio, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// --- TAMAÑO DEL PIZARRON ---
function ajustarTamanoPizarron() {
    const marco = canvas.parentElement;
    if (!marco) return;

    const nuevoAncho = marco.clientWidth;
    const nuevoAlto = marco.clientHeight;

    if (canvas.width > 0 && canvas.height > 0 && (nuevoAncho !== canvas.width || nuevoAlto !== canvas.height)) {
        const escalaX = nuevoAncho / canvas.width;
        const escalaY = nuevoAlto / canvas.height;

        for (const l of lineas) {
            l.x1 *= escalaX;
            l.y1 *= escalaY;
            l.x2 *= escalaX;
            l.y2 *= escalaY;
        }

        jugador.x *= escalaX;
        jugador.y *= escalaY;
        jugador.vx *= escalaX;
        jugador.vy *= escalaY;
    }

    canvas.width = nuevoAncho;
    canvas.height = nuevoAlto;

    actualizarPosicionMetaSegunCanvas();
    redibujarTodo();
}

window.addEventListener("resize", ajustarTamanoPizarron);

// --- EVENTOS DE PUNTERO (MOUSE + TÁCTIL) ---
function obtenerCoordenadas(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvas.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(canvas.height, e.clientY - rect.top));
    return { x, y };
}

canvas.addEventListener("pointerdown", (e) => {
    if (modo !== "dibujar") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    canvas.setPointerCapture(e.pointerId);
    dibujandoLinea = true;
    ultimoPunto = obtenerCoordenadas(e);
});

canvas.addEventListener("pointermove", (e) => {
    if (modo !== "dibujar" || !dibujandoLinea) return;

    const puntoActual = obtenerCoordenadas(e);
    const distancia = Math.hypot(
        puntoActual.x - ultimoPunto.x,
        puntoActual.y - ultimoPunto.y
    );

    if (distancia >= distanciaMinimaSegmento) {
        lineas.push({
            x1: ultimoPunto.x,
            y1: ultimoPunto.y,
            x2: puntoActual.x,
            y2: puntoActual.y
        });
        ultimoPunto = puntoActual;
        redibujarTodo();
    }
});

canvas.addEventListener("pointerup", (e) => {
    if (!dibujandoLinea) return;

    dibujandoLinea = false;
    if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
    }
    redibujarTodo();
});

canvas.addEventListener("pointercancel", () => {
    dibujandoLinea = false;
    redibujarTodo();
});

// --- CONTROLES DE LA BARRA ---
document.querySelector("#btn-dibujar")?.addEventListener("click", () => {
    establecerModo("dibujar");
});

document.querySelector("#btn-play")?.addEventListener("click", () => {
    establecerModo("play");
});

document.querySelector("#btn-reiniciar")?.addEventListener("click", () => {
    reiniciarJugador();
    establecerModo("dibujar");
    redibujarTodo();
});

document.querySelector("#btn-borrar")?.addEventListener("click", () => {
    lineas.length = 0;
    dibujandoLinea = false;
    meta.alcanzada = false;
    reiniciarJugador();
    establecerModo("dibujar");
    redibujarTodo();
});

// --- FÍSICAS Y COLISIONES ---
function actualizarFisicas() {
    if (modo !== "play") return;

    jugador.vy += gravedad;
    jugador.x += jugador.vx;
    jugador.y += jugador.vy;

    jugador.vx *= friccion;
    jugador.vy *= friccion;

    // Comprobar meta
    if (!meta.alcanzada) {
        const distMeta = Math.hypot(jugador.x - meta.x, jugador.y - meta.y);
        if (distMeta < jugador.radio + meta.radio) {
            meta.alcanzada = true;
            establecerModo("dibujar");
            redibujarTodo();

            setTimeout(() => {
                if (nivelActual < 3) {
                    alert(`¡Nivel ${nivelActual} superado! Pasando al nivel ${nivelActual + 1}.`);
                    cargarNivel(nivelActual + 1);
                } else {
                    alert("¡Completaste todos los niveles! Volviendo al nivel 1.");
                    cargarNivel(1);
                }
            }, 80);
            return;
        }
    }

    let enSuelo = false;

    // Colisiones contra segmentos de línea
    for (const l of lineas) {
        const dx = l.x2 - l.x1;
        const dy = l.y2 - l.y1;
        const longitudSq = dx * dx + dy * dy;

        if (longitudSq === 0) continue;

        let t = ((jugador.x - l.x1) * dx + (jugador.y - l.y1) * dy) / longitudSq;
        t = Math.max(0, Math.min(1, t));

        const cx = l.x1 + t * dx;
        const cy = l.y1 + t * dy;

        const distX = jugador.x - cx;
        const distY = jugador.y - cy;
        const distancia = Math.hypot(distX, distY);

        if (distancia < jugador.radio && distancia > 0) {
            enSuelo = true;

            const nx = distX / distancia;
            const ny = distY / distancia;

            jugador.x = cx + nx * jugador.radio;
            jugador.y = cy + ny * jugador.radio;

            const len = Math.hypot(dx, dy);
            const tx = dx / len;
            const ty = dy / len;

            const vTangente = jugador.vx * tx + jugador.vy * ty;
            jugador.vx = vTangente * tx;
            jugador.vy = vTangente * ty;

            // Alinear inclinación con la pendiente de la línea
            const anguloPendiente = Math.atan2(ty, tx);
            jugador.angulo = anguloPendiente * 0.6;
        }
    }

    jugador.enSuelo = enSuelo;

    // Si está en el aire, inclinar suavemente según velocidad vertical
    if (!jugador.enSuelo) {
        const inclinacionAire = Math.max(-0.5, Math.min(0.6, jugador.vy * 0.04));
        jugador.angulo += (inclinacionAire - jugador.angulo) * 0.15;
    }

    // Límites del pizarrón
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

// --- RENDERIZADO ---
function redibujarTodo() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Fondo invernal
    dibujarFondoCover();

    // 2. Meta
    ctx.fillStyle = meta.alcanzada ? "#4CAF50" : "#FFD700";
    ctx.beginPath();
    ctx.arc(meta.x, meta.y, meta.radio, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#DAA520";
    ctx.stroke();

    ctx.fillStyle = "#000";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("★", meta.x, meta.y);

    // 3. Pista dibujada
    ctx.strokeStyle = "#111116";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";

    for (const l of lineas) {
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
    }

    // 4. Jugador (esquiador)
    dibujarJugador();
}

// --- BUCLE PRINCIPAL ---
function bucle() {
    actualizarFisicas();
    if (modo === "play") {
        redibujarTodo();
    }
    requestAnimationFrame(bucle);
}

ajustarTamanoPizarron();
cargarNivel(1);
bucle();