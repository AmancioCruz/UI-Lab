const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

let modo = "dibujar";
const lineas = [];
let dibujandoLinea = false;
let ultimoPunto = { x: 0, y: 0 };

const jugador = {
    x: 80,
    y: 80,
    vx: 0,
    vy: 0,
    radio: 8,
    enSuelo: false
};

const gravedad = 0.25;
const friccion = 0.99;

let nivelActual = 1;
const meta = {
    x: 800,
    y: 450,
    radio: 22,
    alcanzada: false
};

function cargarNivel(numNivel) {
    nivelActual = numNivel;
    const pos = posicionesMetas[nivelActual] || { x: 800, y: 400 };

    meta.x = pos.x;
    meta.y = pos.y;
    meta.alcanzada = false;

    // Actualizar texto en HTML si lo agregaste
    const textoNivel = document.querySelector("#nivel-texto");
    if (textoNivel) textoNivel.textContent = nivelActual;

    // Reiniciar posición de la bola y limpiar líneas
    lineas.length = 0;
    reiniciarJugador();
    modo = "dibujar";

    // Activar botón dibujar visualmente
    document.querySelector("#btn-dibujar").classList.add("activo");
    document.querySelector("#btn-play").classList.remove("activo");
}

function reiniciarJugador() {
    jugador.x = 80;
    jugador.y = 80;
    jugador.vx = 0;
    jugador.vy = 0;
}

// Coordenadas de la meta según el nivel
const posicionesMetas = {
    1: { x: 850, y: 400 }, // Nivel 1: Abajo a la derecha (fácil)
    2: { x: 850, y: 150 }, // Nivel 2: Arriba (exige crear rampas altas)
    3: { x: 200, y: 500 }  // Nivel 3: Al lado izquierdo cruzando un abismo
};

// --- 1. AJUSTE RESPONSIVO DEL PIZARRON ---
function ajustarTamanoPizarron() {
    const marco = canvas.parentElement;
    // Sincronizamos la resolución interna del canvas con el tamaño real del marco
    canvas.width = marco.clientWidth;
    canvas.height = marco.clientHeight;
    redibujarTodo();
}

// Escuchamos cambios de tamaño de ventana o rotación de celular
window.addEventListener("resize", ajustarTamanoPizarron);

// --- 2. EVENTOS UNIFICADOS (MOUSE + CELULAR / TOUCH) ---
function obtenerCoordenadas(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

canvas.addEventListener("pointerdown", (e) => {
    if (modo === "dibujar") {
        // Captura el puntero para que el trazo no se corte aunque salgas del borde
        canvas.setPointerCapture(e.pointerId);
        dibujandoLinea = true;
        ultimoPunto = obtenerCoordenadas(e);
    }
});

canvas.addEventListener("pointermove", (e) => {
    if (modo === "dibujar" && dibujandoLinea) {
        const puntoActual = obtenerCoordenadas(e);

        // 👇 RESTRICCIÓN: Impide que el trazo rebase los límites del pizarrón negro
        puntoActual.x = Math.max(0, Math.min(canvas.width, puntoActual.x));
        puntoActual.y = Math.max(0, Math.min(canvas.height, puntoActual.y));

        const distancia = Math.hypot(
            puntoActual.x - ultimoPunto.x,
            puntoActual.y - ultimoPunto.y
        );

        if (distancia >= 8) {
            lineas.push({
                x1: ultimoPunto.x,
                y1: ultimoPunto.y,
                x2: puntoActual.x,
                y2: puntoActual.y
            });
            ultimoPunto = puntoActual;
            redibujarTodo();
        }
    }
});

canvas.addEventListener("pointerup", (e) => {
    if (dibujandoLinea) {
        dibujandoLinea = false;
        canvas.releasePointerCapture(e.pointerId);
        redibujarTodo();
    }
});

// --- 3. CONTROLES ---
const btnDibujar = document.querySelector("#btn-dibujar");
const btnPlay = document.querySelector("#btn-play");

btnDibujar.addEventListener("click", () => {
    modo = "dibujar";
    btnDibujar.classList.add("activo");
    btnPlay.classList.remove("activo");
});

btnPlay.addEventListener("click", () => {
    modo = "play";
    btnPlay.classList.add("activo");
    btnDibujar.classList.remove("activo");
});

document.querySelector("#btn-reiniciar").addEventListener("click", () => {
    jugador.x = 80;
    jugador.y = 80;
    jugador.vx = 0;
    jugador.vy = 0;
    redibujarTodo();
});

document.querySelector("#btn-borrar").addEventListener("click", () => {
    // 1. Vaciamos el arreglo de líneas
    lineas.length = 0;

    // 2. Regresamos al jugador a su posición inicial y anulamos sus velocidades
    jugador.x = 80;
    jugador.y = 80;
    jugador.vx = 0;
    jugador.vy = 0;

    // 3. Cambiamos el modo de juego de vuelta a "dibujar" para que la bola se quede flotando
    modo = "dibujar";

    // 4. Actualizamos el diseño de los botones en la barra (activa "Dibujar" y desactiva "Jugar")
    const btnDibujar = document.querySelector("#btn-dibujar");
    const btnPlay = document.querySelector("#btn-play");
    if (btnDibujar && btnPlay) {
        btnDibujar.classList.add("activo");
        btnPlay.classList.remove("activo");
    }

    // 5. Limpiamos y redibujamos el pizarrón
    redibujarTodo();
});

// --- 4. FÍSICAS Y COLISIONES ---
function actualizarFisicas() {
    if (modo !== "play") return;

    jugador.vy += gravedad;
    jugador.x += jugador.vx;
    jugador.y += jugador.vy;

    jugador.vx *= friccion;
    jugador.vy *= friccion;

    if (!meta.alcanzada) {
        const distMeta = Math.hypot(jugador.x - meta.x, jugador.y - meta.y);
        if (distMeta < jugador.radio + meta.radio) {
            meta.alcanzada = true;
            modo = "dibujar"; // Pausar simulación

            setTimeout(() => {
                alert(`¡Nivel ${nivelActual} Superado! Prepárate para el siguiente.`);

                // Pasar al siguiente nivel (o reiniciar al 1 si se acaban)
                if (nivelActual < 3) {
                    cargarNivel(nivelActual + 1);
                } else {
                    alert("¡Increíble! Has completado todos los niveles del juego.");
                    cargarNivel(1);
                }
            }, 100);
        }
    }

    for (let l of lineas) {
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
        }
    }

    // Límites del pizarrón (suelo y paredes)
    if (jugador.y > canvas.height - jugador.radio) {
        jugador.y = canvas.height - jugador.radio;
        jugador.vy = 0;
        jugador.vx *= 0.9;
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

// --- 5. RENDERIZADO ---
function redibujarTodo() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = meta.alcanzada ? "#4CAF50" : "#FFD700"; // Dorado o verde si se ganó
    ctx.beginPath();
    ctx.arc(meta.x, meta.y, meta.radio, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#DAA520";
    ctx.stroke();

    // Icono o texto dentro de la meta
    ctx.fillStyle = "#000";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("★", meta.x, meta.y);

    // 2. Dibujar todas las líneas de la pista
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";

    for (let l of lineas) {
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
    }

    ctx.fillStyle = "#ff4d6d";
    ctx.beginPath();
    ctx.arc(jugador.x, jugador.y, jugador.radio, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";
    ctx.stroke();

    ctx.strokeStyle = "#222";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";

    for (let l of lineas) {
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
    }

    // Jugador
    ctx.fillStyle = "#ff4d6d";
    ctx.beginPath();
    ctx.arc(jugador.x, jugador.y, jugador.radio, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";
    ctx.stroke();
}

function bucle() {
    actualizarFisicas();
    if (modo === "play") {
        redibujarTodo();
    }
    requestAnimationFrame(bucle);
}

// Arrancar ajustando el pizarrón por primera vez
ajustarTamanoPizarron();
cargarNivel(1);
bucle();