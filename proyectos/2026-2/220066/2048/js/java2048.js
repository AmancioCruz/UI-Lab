
// Variables principales
let tablero = [];
let puntos = 0;
let victoriaAlcanzada = false;

// Selecciona los elementos del HTML
const tableroHTML = document.querySelector("#tablero");
const puntosHTML = document.querySelector("#puntos");
const botonReiniciar = document.querySelector("#reiniciar");
const botonModoOscuro = document.querySelector("#modoOscuro");

const pantallaFinal = document.querySelector("#pantallaFinal");
const tituloFinal = document.querySelector("#tituloFinal");
const mensajeFinal = document.querySelector("#mensajeFinal");
const botonContinuar = document.querySelector("#continuar");
const botonNuevoJuego = document.querySelector("#nuevoJuego");

// Crea un tablero nuevo
function crearTablero() {
    tablero = Array(16).fill(0);
    puntos = 0;
    victoriaAlcanzada = false;

    pantallaFinal.classList.add("oculto");
    botonContinuar.style.display = "block";

    agregarNumero();
    agregarNumero();
    dibujarTablero();
}

// Agrega un número en una posición vacía
function agregarNumero() {
    let espacios = [];

    tablero.forEach((valor, indice) => {
        if (valor === 0) {
            espacios.push(indice);
        }
    });

    if (espacios.length === 0) return null;

    let posicion = espacios[Math.floor(Math.random() * espacios.length)];
    tablero[posicion] = Math.random() < 0.9 ? 2 : 4;

    return posicion;
}

// Actualiza visualmente el tablero
function dibujarTablero(combinadas = [], nuevaCelda = null) {
    tableroHTML.innerHTML = "";

    tablero.forEach((valor, indice) => {
        let celda = document.createElement("div");
        celda.classList.add("celda");

        if (valor !== 0) {
            celda.classList.add("v" + valor);
            celda.textContent = valor;

            // Aplica la animación de combinación
            if (combinadas.includes(indice)) {
                celda.classList.add("combinada");
            }

            // Aplica la animación al número nuevo
            if (indice === nuevaCelda) {
                celda.classList.add("nuevo");
            }
        }

        tableroHTML.appendChild(celda);
    });

    puntosHTML.textContent = puntos;
}

// Mueve y combina los números de una línea
function moverLinea(linea) {
    let puntosGanados = 0;
    let combinaciones = [];

    linea = linea.filter(valor => valor !== 0);

    let resultado = [];
    let i = 0;

    while (i < linea.length) {
        if (linea[i] === linea[i + 1]) {
            let nuevoValor = linea[i] * 2;

            combinaciones.push(resultado.length);
            resultado.push(nuevoValor);
            puntosGanados += nuevoValor;

            i += 2;
        } else {
            resultado.push(linea[i]);
            i++;
        }
    }

    while (resultado.length < 4) {
        resultado.push(0);
    }

    return {
        linea: resultado,
        puntosGanados: puntosGanados,
        combinaciones: combinaciones
    };
}

// Realiza los movimientos del tablero
function mover(direccion) {
    let anterior = [...tablero];
    let puntosMovimiento = 0;
    let celdasCombinadas = [];

    for (let i = 0; i < 4; i++) {
        let linea = [];

        // Obtiene una fila o columna
        for (let j = 0; j < 4; j++) {
            let indice;

            if (direccion === "izquierda" || direccion === "derecha") {
                indice = i * 4 + j;
            } else {
                indice = j * 4 + i;
            }

            linea.push(tablero[indice]);
        }

        // Invierte la línea para mover a la derecha o abajo
        if (direccion === "derecha" || direccion === "abajo") {
            linea.reverse();
        }

        let resultado = moverLinea(linea);
        linea = resultado.linea;
        puntosMovimiento += resultado.puntosGanados;

        // Guarda las posiciones de las combinaciones
        resultado.combinaciones.forEach(posicion => {
            let posicionReal = posicion;

            if (direccion === "derecha" || direccion === "abajo") {
                posicionReal = 3 - posicion;
            }

            let indice;

            if (direccion === "izquierda" || direccion === "derecha") {
                indice = i * 4 + posicionReal;
            } else {
                indice = posicionReal * 4 + i;
            }

            celdasCombinadas.push(indice);
        });

        // Regresa la línea a su orden original
        if (direccion === "derecha" || direccion === "abajo") {
            linea.reverse();
        }

        // Guarda los cambios en el tablero
        for (let j = 0; j < 4; j++) {
            let indice;

            if (direccion === "izquierda" || direccion === "derecha") {
                indice = i * 4 + j;
            } else {
                indice = j * 4 + i;
            }

            tablero[indice] = linea[j];
        }
    }

    // Comprueba si el tablero cambió
    let cambio = tablero.some((valor, indice) => valor !== anterior[indice]);

    let nuevaCelda = null;

    if (cambio) {
        puntos += puntosMovimiento;
        nuevaCelda = agregarNumero();
    }

    // Actualiza el tablero y aplica las animaciones
    dibujarTablero(celdasCombinadas, nuevaCelda);

    // Comprueba si el jugador ganó
    if (!victoriaAlcanzada && tablero.includes(2048)) {
        mostrarFinal("victoria");
        return;
    }

    // Comprueba si ya no existen movimientos
    if (!hayMovimientos()) {
        mostrarFinal("derrota");
    }
}

// Comprueba si existen movimientos posibles
function hayMovimientos() {
    for (let i = 0; i < 16; i++) {
        if (tablero[i] === 0) {
            return true;
        }

        let fila = Math.floor(i / 4);
        let columna = i % 4;

        // Comprueba números iguales a la derecha
        if (columna < 3 && tablero[i] === tablero[i + 1]) {
            return true;
        }

        // Comprueba números iguales abajo
        if (fila < 3 && tablero[i] === tablero[i + 4]) {
            return true;
        }
    }

    return false;
}

// Muestra la pantalla de victoria o derrota
function mostrarFinal(tipo) {
    pantallaFinal.classList.remove("oculto");

    if (tipo === "victoria") {
        tituloFinal.textContent = "¡Ganaste!";
        mensajeFinal.textContent = "¡Felicidades! Has conseguido llegar al número 2048.";
        botonContinuar.style.display = "block";
    } else {
        tituloFinal.textContent = "¡Fin del juego!";
        mensajeFinal.textContent = "Ya no tienes movimientos disponibles. Inténtalo de nuevo.";
        botonContinuar.style.display = "none";
    }
}

// Detecta las teclas de dirección
document.addEventListener("keydown", function(event) {
    if (!pantallaFinal.classList.contains("oculto")) return;

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
    }

    switch (event.key) {
        case "ArrowUp":
            mover("arriba");
            break;

        case "ArrowDown":
            mover("abajo");
            break;

        case "ArrowLeft":
            mover("izquierda");
            break;

        case "ArrowRight":
            mover("derecha");
            break;
    }
});

// Reinicia el juego
botonReiniciar.addEventListener("click", crearTablero);
botonNuevoJuego.addEventListener("click", crearTablero);

// Permite continuar después de ganar
botonContinuar.addEventListener("click", function() {
    victoriaAlcanzada = true;
    pantallaFinal.classList.add("oculto");
});

// Activa o desactiva el modo oscuro
botonModoOscuro.addEventListener("click", function() {
    document.body.classList.toggle("oscuro");

    if (document.body.classList.contains("oscuro")) {
        botonModoOscuro.textContent = "Modo claro";
    } else {
        botonModoOscuro.textContent = "Modo oscuro";
    }
});

// Cambia la paleta de colores
document.querySelectorAll(".paleta").forEach(boton => {
    boton.addEventListener("click", function() {
        let paleta = this.dataset.paleta;

        document.body.dataset.paleta = paleta;

        document.querySelectorAll(".paleta").forEach(opcion => {
            opcion.classList.remove("activa");
        });

        this.classList.add("activa");
    });
});

// Configuración inicial
document.body.dataset.paleta = "clasica";
crearTablero();
