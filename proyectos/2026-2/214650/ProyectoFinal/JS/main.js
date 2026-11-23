// Buscamos el elemento canvas del HTML usando su ID.
const canvas = document.querySelector("#canvas");
// Obtener el contexto 2D del canvas
// Este contexto contiene las herramientas para dibujar figuras, líneas, colores y degradados
const ctx = canvas.getContext("2d");
// Obtenemos los botones del HTML para poder detectar cuándo se hace clic en ellos
const btnDia = document.querySelector("#btn-dia");
const btnNoche = document.querySelector("#btn-noche");
const btnEclipse = document.querySelector("#btn-eclipse");
const btnNublado = document.querySelector("#btn-nublado");

// VARIABLES PARA CONTROLAR LAS ANIMACIONES

// Guarda el progreso de la transición entre el día y la noche (0 representa el día y 1 noche)
let progresoNoche = 0;

// Guarda el identificador de la animación que se está ejecutando
let animacionActual = null;

// FUNCIONES PARA TRABAJAR CON COLORES
// Convierte un color hexadecimal a sus valores RGB
function obtenerRGB(color) {
    return {
        // Extraemos los dos primeros car del color y los convertimos a número.
        r: parseInt(color.substring(1, 3), 16),
        g: parseInt(color.substring(3, 5), 16),
        b: parseInt(color.substring(5, 7), 16)
    };
}

// Mezcla dos colores dependiendo del progreso de una transición
function mezclarColor(color1, color2, progreso) {
    // Convertimos ambos colores a valores RGB para poder mezclarlos.
    const c1 = obtenerRGB(color1);
    const c2 = obtenerRGB(color2);

    // Calculamos cuánto debe cambiar cada componente de color
    // Math.round redondea el resultado para obtener números enteros
    const r = Math.round(c1.r + (c2.r - c1.r) * progreso);
    const g = Math.round(c1.g + (c2.g - c1.g) * progreso);
    const b = Math.round(c1.b + (c2.b - c1.b) * progreso);

    // Devolvemos el nuevo color en formato RGB.
    return `rgb(${r}, ${g}, ${b})`;
}

// DIBUJO DEL SOL
function dibujarSol(x, y) {

    // Guarda los estilos y configuraciones actuales del canvas
    ctx.save();
    // Resplandor exterior. Los valores indican el centro y el radio inicial y final del degradado.
    const resplandor = ctx.createRadialGradient(x, y, 60, x, y, 145);
    // Color y la transparencia en el centro del resplandor.
    resplandor.addColorStop(0, "rgba(255, 221, 87, 0.45)");
    // Resplandor termine siendo transparente
    resplandor.addColorStop(1, "rgba(255, 221, 87, 0)");
    // Aplicamos el degradado como relleno.
    ctx.fillStyle = resplandor;
    // Comenzamos a dibujar una figura
    ctx.beginPath();
    // Dibuja círculo que representa el resplandor
    ctx.arc(x, y, 145, 0, Math.PI * 2);
    // Rellenamos el círculo con el degradado
    ctx.fill();

    // Rayos del sol

    // Repetimos el dibujo 16 veces para crear los rayos alrededor del sol
    for (let i = 0; i < 16; i++) {

        // ángulo de cada rayo para distribuirlos uniformemente
        const angulo = (Math.PI * 2 / 16) * i;

        // Distancia desde el centro del sol hasta donde comienza cada rayo
        const inicio = 88;

        // Alternamos longitud de los rayos 
        // El operador % obtiene el residuo de una división. Si i es par, el rayo será más largo, si es impar es más corto
        const final = i % 2 === 0 ? 125 : 116;

        // Calculamos la posición inicial del rayo usando el ángulo
        // Math.cos calcula posición horizontal
        // Math.sin calcula vertical
        const x1 = x + Math.cos(angulo) * inicio;
        const y1 = y + Math.sin(angulo) * inicio;
        // Calcula posición final del rayo
        const x2 = x + Math.cos(angulo) * final;
        const y2 = y + Math.sin(angulo) * final;
        // Inicia el trazado de una nueva línea
        ctx.beginPath();
        // Indica el unto donde comienza la línea
        ctx.moveTo(x1, y1);
        // Indica el punto donde termina la línea
        ctx.lineTo(x2, y2);
        // Alterna 2 tonos de naranja y amarillo
        ctx.strokeStyle = i % 2 === 0 ? "#FFB52E" : "#FFD45C";
        // Alterna grosor de los rayos
        ctx.lineWidth = i % 2 === 0 ? 12 : 9;
        // Redondeamos los bordes
        ctx.lineCap = "round";
        // Dibujamos los rayos
        ctx.stroke();
    }

    // Base del sol
    // círculo exterior del sol
    ctx.beginPath();
    // Dibujamos un círculo de radio 78
    ctx.arc(x, y, 78, 0, Math.PI * 2);
    // color naranja de la base
    ctx.fillStyle = "#FFB52E";
    // Rellenamos el círculo.
    ctx.fill();

    // Degradado interior

    // Creamos un degradado radial
    // El "punto de luz" está arriba y a la izquierda
    const sol = ctx.createRadialGradient(x - 25, y - 30, 5, x, y, 75);
    // Colores del degradado
    sol.addColorStop(0, "#FFF7B0");
    sol.addColorStop(0.5, "#FFE45E");
    sol.addColorStop(1, "#FFB92E");
    // Círculo interior del sol
    ctx.beginPath();
    ctx.arc(x, y, 70, 0, Math.PI * 2);
    // Aplicamos el degradado
    ctx.fillStyle = sol;
    ctx.fill();

    // Pequeños reflejos
    // Establecemos un color blanco semitransparente para los reflejos
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    // Primer reflejo
    ctx.beginPath();
    ctx.arc(x - 25, y - 25, 7, 0, Math.PI * 2);
    ctx.fill();
    // Sgundo reflejo más pequeño
    ctx.beginPath();
    ctx.arc(x - 10, y - 42, 3, 0, Math.PI * 2);
    ctx.fill();
    // Restauramos los estilos y configuraciones anteriores del canvas
    ctx.restore();
}

// DIBUJO DE LA LUNA

// Dibuja la luna en las coordenadas X y Y 
function dibujarLuna(x, y) {
    // Guarda la configuración actual del canvas
    ctx.save();

    // Resplandor de la luna
    // Degradado radial para simular la luz que rodea la luna
    const resplandor = ctx.createRadialGradient(x, y, 55, x, y, 115);
    // Tono azul claro con transparencia
    resplandor.addColorStop(0, "rgba(221, 231, 255, 0.25)");
    // Resplandor desaparece gradualmente
    resplandor.addColorStop(1, "rgba(221, 231, 255, 0)");
    // Dibuja el círculo del resplandor
    ctx.fillStyle = resplandor;
    ctx.beginPath();
    ctx.arc(x, y, 115, 0, Math.PI * 2);
    ctx.fill();

    // Cuerpo principal de la luna

    // Creamos un degradado radial
    const luna = ctx.createRadialGradient(x - 25, y - 30, 5, x, y, 75);
    // Definimos los tonos de la luna
    luna.addColorStop(0, "#FFFFFF");
    luna.addColorStop(0.6, "#E4E9F5");
    luna.addColorStop(1, "#AAB7D1");
    // Dibujamos el círculo principal
    ctx.beginPath();
    ctx.arc(x, y, 70, 0, Math.PI * 2);

    // Aplicamos el degradado
    ctx.fillStyle = luna;
    ctx.fill();

    // Sombra interior
    // Creamos un degradado lineal que va de izquierda a derecha
    const sombra = ctx.createLinearGradient(x - 15, y, x + 70, y);
    // La sombra comienza transparente
    sombra.addColorStop(0, "rgba(80, 97, 135, 0)");
    // La sombra se vuelve más oscura hacia el lado derecho
    sombra.addColorStop(1, "rgba(80, 97, 135, 0.38)");
    // Aplicamos la sombra dentro de otro círculo
    ctx.beginPath();
    ctx.arc(x, y, 68, 0, Math.PI * 2);
    ctx.fillStyle = sombra;
    ctx.fill();

    // Cráteres de la superficie

    // Establecemos tono gris 
    ctx.fillStyle = "rgba(139, 153, 184, 0.35)";
    // Dibujamos el primer cráter
    ctx.beginPath();
    ctx.arc(x - 27, y - 20, 10, 0, Math.PI * 2);
    ctx.fill();
    // segundo cráter
    ctx.beginPath();
    ctx.arc(x + 25, y - 32, 7, 0, Math.PI * 2);
    ctx.fill();
    // tercer cráter
    ctx.beginPath();
    ctx.arc(x + 20, y + 24, 13, 0, Math.PI * 2);
    ctx.fill();
    // cuarto cráter
    ctx.beginPath();
    ctx.arc(x - 30, y + 30, 5, 0, Math.PI * 2);
    ctx.fill();

    // Reflejos de los cráteres
    // Color blanco semitransparente para iluminación
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    // Definimos el grosor de las líneas
    ctx.lineWidth = 2;
    // arco de luz en el primer cráter
    ctx.beginPath();
    ctx.arc(x - 27, y - 20, 10, Math.PI, Math.PI * 1.8);
    ctx.stroke();
    // arco de luz en el tercer cráter
    ctx.beginPath();
    ctx.arc(x + 20, y + 24, 13, Math.PI, Math.PI * 1.8);
    ctx.stroke();

    // Restauramos la configuración anterior del canvas
    ctx.restore();
}

// DIBUJO DE LA ESCENA DE DÍA Y NOCHE

// Dibuja el cielo, el sol y la luna
// El parámetro progreso determina cuánto ha avanzado la transición
function dibujarEscena(progreso) {
    // Creamos un degradado vertical que cubre todo el canvas
    const cielo = ctx.createLinearGradient(0, 0, 0, canvas.height);
    // Mezclamos los colores del cielo de dia y de noche
    // Conforme aumenta progreso, el cielo se vuelve más oscuro
    const colorSuperior = mezclarColor("#83D4F5", "#101C49", progreso);
    const colorInferior = mezclarColor("#C8EEFF", "#344B80", progreso);
    // Establecemos los colores en los extremos del degradado
    cielo.addColorStop(0, colorSuperior);
    cielo.addColorStop(1, colorInferior);
    // Aplicamos el degradado y pintamos todo el fondo
    ctx.fillStyle = cielo;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Aparición y desaparición del sol
    // Guardamos la configuración del canvas
    ctx.save();

    // Modifica la transparencia del dibujo
    // Cuando progreso es 0, el sol es completamente visible. 1, el sol es completamente transparente
    ctx.globalAlpha = 1 - progreso;
    // Dibuja el sol en el centro de la escena
    dibujarSol(300, 260);
    // Restaura la transparencia 
    ctx.restore();

    // Aparición de la luna
    ctx.save();

    // La transparencia de la luna aumenta conforme avanza la transición
    // 0 no se ve, 1 se ve completamente
    ctx.globalAlpha = progreso;
    // Dibuja la luna en la misma posición que el sol
    dibujarLuna(300, 260);

    ctx.restore();
}

// ANIMACIÓN ENTRE EL DÍA Y LA NOCHE

// Esta función inicia la transición entre el día y la noche.
// Recibe true para mostrar la noche y false para mostrar el día
function cambiarMomento(noche) {
    // Guardamos el progreso actual para que la transición comience desde donde quedó
    const inicio = progresoNoche;
    // Determina el destino de la transición
    // Si noche es true, el destino es 1. si es false, es 0
    const destino = noche ? 1 : 0;
    // Duración de la animación
    const duracion = 1500;
    // Registra el momento en el que comienza la animación
    const tiempoInicio = performance.now();

    // Si ya existe una animación en ejecución la detenemos
    if (animacionActual) {
        cancelAnimationFrame(animacionActual);
    }

    // Función que se ejecuta para actualizar cada fotograma
    function animar(tiempoActual) {

        // Calcula cuánto tiempo ha transcurrido desde que comenzó la animación
        // Divid entre la duración para tener un valor entre 0 y 1.
        // Math.min evita que el resultado supere 1

        const tiempo = Math.min((tiempoActual - tiempoInicio) / duracion, 1);
        // Fórmula para suavizar el avance de la animación
        const suavizado = tiempo * tiempo * (3 - 2 * tiempo);
        // Actualiza el progreso de la transición
        progresoNoche = inicio + (destino - inicio) * suavizado;
        // Dibuja la escena con el progreso actualizado
        dibujarEscena(progresoNoche);

        // Mientras la animación no haya terminado, solicitamos otro fotograma
        if (tiempo < 1) {
            // requestAnimationFrame vuelve a ejecutar la función animar
            // cuando el navegador esté listo para dibujar el siguiente fotograma
            animacionActual = requestAnimationFrame(animar);
        } else {
            // Cuando termina la animación, establecemos el valor final
            progresoNoche = destino;
            // Indica que ya no hay una animación activa
            animacionActual = null;
            // Dibuja la escena final para asegurar que quede en su estado correcto
            dibujarEscena(progresoNoche);
        }
    }
    // Iniciamos la animación solicitando el primer fotograma
    animacionActual = requestAnimationFrame(animar);
}

// 8. DIBUJO DE LA ESCENA DEL ECLIPSE

// Dibuja un eclipse utilizando el progreso para controlar el oscurecimiento del cielo y la posición de la luna
function dibujarEclipse(progreso) {

    // Degradado para el cielo
    const cielo = ctx.createLinearGradient(0, 0, 0, canvas.height);

    // Mezclamos los colores del cielo de día y de noche
    const colorSuperior = mezclarColor("#83D4F5", "#101C49", progreso);
    const colorInferior = mezclarColor("#C8EEFF", "#344B80", progreso);
    // Aplica los colores al degradado
    cielo.addColorStop(0, colorSuperior);
    cielo.addColorStop(1, colorInferior);
    // Pinta el fondo del canvas
    ctx.fillStyle = cielo;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujamos el sol en el centro
    dibujarSol(300, 260);

    // Calcula la posición horizontal de la luna
    // Comienza en x = 180 y avanza hasta x = 300
    const lunaX = 180 + (120 * progreso);
    // Dibuja la luna utilizando la posición
    // Al llegar al centro cubre al sol
    dibujarLuna(lunaX, 260);
}

// ANIMACIÓN DEL ECLIPSE
// =====================================================
// Esta función controla el movimiento de la luna hasta que llega al centro y cubre el sol
function iniciarEclipse() {
    // Duración de la animación: 2.5 segundos
    const duracion = 2500;
    // Guarda el tiempo en el que comienza
    const tiempoInicio = performance.now();
    // Si hay otra animación en ejecución, la detenemos
    if (animacionActual) {
        cancelAnimationFrame(animacionActual);
    }
    // Función que actualiza el eclipse en cada fotograma
    function animar(tiempoActual) {
        // Calculamos el progreso de la animación entre 0 y 1
        const tiempo = Math.min((tiempoActual - tiempoInicio) / duracion, 1);
        // Suavizamos el movimiento
        const suavizado = tiempo * tiempo * (3 - 2 * tiempo);
        // Dibuja el eclipse con el progreso actualizado
        dibujarEclipse(suavizado);

        // Si todavía no termina, solicita el siguiente fotograma
        if (tiempo < 1) {
            animacionActual = requestAnimationFrame(animar);
        } else {
            // Al terminar, indica que ya no existe una animación activa
            animacionActual = null;
        }
    }
    // Iniciamos la animación
    animacionActual = requestAnimationFrame(animar);
}

// DIBUJO DE UNA NUBE

// Dibuja una nube en las coordenadas X y Y
// El parámetro escala permite aumentar o reducir su tamaño. Si no se indica una escala, se utiliza el valor 1
function dibujarNube(x, y, escala = 1) {
    // Guardamos los estilos y transformaciones actuales del canvas
    ctx.save();
    // Movemos el punto de origen del dibujo a las coordenadas recibidas
    ctx.translate(x, y);
    // Modificamos el tamaño de todos los elementos que se dibujen después
    ctx.scale(escala, escala);

    // Sombra de la nube

    // nueva figura
    ctx.beginPath();
    // Dibuja elipsepara crear la sombra debajo de la nube
    ctx.ellipse(0, 12, 85, 25, 0, 0, Math.PI * 2);
    // color de la sombra
    ctx.fillStyle = "#AEBBC9";
    // Rellenamos
    ctx.fill();

    // Cuerpo de la nube
    // Silueta de la nube
    ctx.beginPath();
    // Dibuja arcos circulares que forman sus partes superiores
    ctx.arc(-45, 0, 30, Math.PI, 0);
    ctx.arc(-15, -20, 38, Math.PI, 0);
    ctx.arc(25, -8, 32, Math.PI, 0);
    ctx.arc(50, 5, 25, Math.PI, 0);
    // Cerramos la parte inferior de la silueta usando líneas
    ctx.lineTo(75, 15);
    ctx.lineTo(-75, 15);
    ctx.closePath();
    // Aplicamos color 
    ctx.fillStyle = "#F3F6F8";
    // Rellenamos la figura
    ctx.fill();
    // Parte inferior de la nube
    // Dibujamos una elipse para agregar un tono gris clarito en la parte inferior
    ctx.beginPath();
    ctx.ellipse(0, 12, 70, 12, 0, 0, Math.PI);
    // color 
    ctx.fillStyle = "#D6DEE7";
    // Rellenamos la elipse
    ctx.fill();

    // Restauramos la configuración anterior del canvas
    ctx.restore();
}

// DIBUJO NUBLADO

// Dibuja el cielo gris, el sol y dos nubes. El parámetro progreso controla cuánto se han desplazado las nubes
function dibujarNublado(progreso) {
    // Creamos degradado para elcielo nublado
    const cielo = ctx.createLinearGradient(0, 0, 0, canvas.height);
    // Gris en la parte superior
    cielo.addColorStop(0, "#9EADBA");
    // Gris clarito en la parte inferior
    cielo.addColorStop(1, "#D4DCE3");
    // Aplicamos el degradado al fondo
    ctx.fillStyle = cielo;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujamos el sol antes que las nubes para que las nubes aparezcan delante de él
    dibujarSol(300, 260);

    // Primera nube

    // Calculamos su posición horizontal
    // Comienza fuera del canvas, a la izquierda (-100),y se desplaza hasta llegar a x = 150
    const nube1X = -100 + (250 * progreso);
    // Dibujamos la primera nube con un tamaño de 1.1 veces el original.
    dibujarNube(nube1X, 260, 1.1);

    // Segunda nube
    // Comienza fuera del canvas, a la derecha (700), y se desplaza hacia la izquierda hasta llegar a x = 450
    const nube2X = 700 - (250 * progreso);
    // Dibujamos la segunda nube con un tamaño de 1.2 veces el original
    dibujarNube(nube2X, 300, 1.2);
}

// ANIMACIÓN DE LA ESCENA NUBLADA

// Controla la entrada de las dos nubes hasta cubrir parcialmente el sol
function iniciarNublado() {
    // Duración de la animación: 2.5 segundos
    const duracion = 2500;
    // Registra el momento en que comienza la animación
    const tiempoInicio = performance.now();

    // Si otra animación está activa, la detenemos
    if (animacionActual) {
        cancelAnimationFrame(animacionActual);
    }

    // Función que actualiza las posiciones de las nubes en cada fotograma
    function animar(tiempoActual) {
        // Calculamos el progreso de la animación entre 0 y 1.
        const tiempo = Math.min((tiempoActual - tiempoInicio) / duracion, 1);
        // Suavizam el desplazamiento de las nubes
        const suavizado = tiempo * tiempo * (3 - 2 * tiempo);
        // Vuelve a dibujar la escena con las nuevas posiciones
        dibujarNublado(suavizado);

        // Mientras no termine la animación, solicitamos otro fotograma
        if (tiempo < 1) {
            animacionActual = requestAnimationFrame(animar);
        } else {
            // Cuando las nubes llegan a su posición final, detenemos la animación
            animacionActual = null;
        }
    }
    // Iniciamos la animación.
    animacionActual = requestAnimationFrame(animar);
}

// EVENTOS DE LOS BOTONES

// addEventListener permite detectar acciones realizadas por el usuario
// Cuando se hace clic en el botón Día, se ejecuta cambiarMomento(false)
// El valor false indica que queremos regresar al estado de día
btnDia.addEventListener("click", () => {
    cambiarMomento(false);
});

// Cuando se hace clic en el botón Noche, se ejecuta cambiarMomento(true)
// El valor true indica que queremos mostrar el estado nocturno
btnNoche.addEventListener("click", () => {
    cambiarMomento(true);
});

// Al hacer clic en Eclipse, iniciamos la animación del eclipse
btnEclipse.addEventListener("click", () => {
    iniciarEclipse();
});

// Al hacer clic en Nublado, iniciamos la animación de las nubes
btnNublado.addEventListener("click", () => {
    iniciarNublado();
});

// ESTADO INICIAL
// Dibujamos la escena al cargar la página
// El valor 0 indica que el progreso de la noche es cero, por lo tanto, la escena inicial muestra el día.
dibujarEscena(0);