/*Con esto referenciamos al DOM y configuradion del canvas */
// Obtiene el elemento <canvas>, su contexto de dibujo 2D y sus dimensiones
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;

// Obtenemos las referencia de los botones y etiqueta con el id que se dio en el HTML
var btnPause = document.getElementById("btn-pause");
var btnPlay = document.getElementById("btn-play");
var btnSlower = document.getElementById("btn-slower");
var btnFaster = document.getElementById("btn-faster");
var speedLabel = document.getElementById("speed-label");


// Aqui los colores cargados desde CSS
var fondoCanvas = "#000000";
var dvdColors = [];

// Damos las dimensiones del cuadrado en píxeles
var sizeX = 50;
var sizeY = 50;


// Aqui damos los limites del multiplicador de velocidad y control del temporizador
var intervalId = null;
var speedMultiplier = 1;
var minSpeed = 0.25;
var maxSpeed = 4;
var speedStep = 0.25;

/* Tenemos lo qu eson funciones auxiliares tipo aleatoridad y paleta de colores */

// Generamos una posición inicial X/Y aleatoria dentro de los límites del canvas
// ACUERDATE MUY BIEN DE ESTO YA QUE SI ES ALGO COMPLICADO Y ESTA BIEN QUE LO EXPLIQUES
//Generan una coordenada aleatoria entre 0 y el tamaño del canvas menos el tamaño del cuadrado, 
// para que nazca siempre dentro de los límites sin salirse por la derecha o por abajo; 
// y Math.max evita errores si el canvas llegara a ser más pequeño que el cuadrado.
var getRandomX = function() { return getRandomNum(0, Math.max(0, width - sizeX)); };
var getRandomY = function() { return getRandomNum(0, Math.max(0, height - sizeY)); };


// Genera velocidades iniciales aleatorias entre -8 y 8, evitando que sea 0
//en pocas palabras hace que siempre vaya en diagonal
var speedX = function() {
    var s = getRandomNum(-8, 8);
    return s === 0 ? 5 : s;
};
var speedY = function() {
    var s = getRandomNum(-8, 8);
    return s === 0 ? -5 : s;
};
// Selecciona un color aleatorio de la paleta distinto al actual
var getPaletteColor = function(currentColor) {
    // Evita un bucle infinito si hay 1 o menos colores unicos disponibles
    if (new Set(dvdColors).size <= 1) return dvdColors[0] || "#ffffff";
    var nextColor = currentColor;
    while (nextColor === currentColor) {
        nextColor = dvdColors[getRandomNum(0, dvdColors.length - 1)];
    }
    return nextColor;
};


// Instancia global del cuadrado animado
var dvdBlock;

/* Modelo del bloque y la fisica de rebote en las orillas */
// Constructor que define las propiedades del cuadrado

var Block = function(x, y, sizeX, sizeY, speedX, speedY, color) {
    this.x = x;
    this.y = y;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.speedX = speedX;
    this.speedY = speedY;
    this.color = color;
};
// Actualiza posicion, detecta colisiones con los bordes, cambia color y dibuja
Block.prototype.move = function() {
    var hit = false;

    // Rebote horizxontal (borde derecha e izquiereda)
    //Detecta que el cuadrado haya chocado con el borde del canva e invierte el signo de speed y cambia de direccion tambien cambiandolo de color
    // aplica para el de rebote vertical tambien
    if (this.x <= 0) {
        this.x = 0;
        this.speedX = -this.speedX;
        hit = true;
    } else if (this.x + this.sizeX >= width) {
        this.x = width - this.sizeX;
        this.speedX = -this.speedX;
        hit = true;
    }

    // Rebote vertical (borde arriba e abajo)
    if (this.y <= 0) {
        this.y = 0;
        this.speedY = -this.speedY;
        hit = true;
    } else if (this.y + this.sizeY >= height) {
        this.y = height - this.sizeY;
        this.speedY = -this.speedY;
        hit = true;
    }
// Si choco con cualquier borde, asigna un nuevo color de la paleta
    if (hit) {
        this.color = getPaletteColor(this.color);
    }
// Dibuja el cuadrado en su posición actual
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.sizeX, this.sizeY);

// Avanza la posición aplicando el multiplicador de velocidad activo
//Tipo el que hace que multiplique la velocidad cuando le das al boton de multiplicar velocidad
    this.x += this.speedX * speedMultiplier;
    this.y += this.speedY * speedMultiplier;
};


// Retorna un número entero aleatorio entre min y max (ambos incluidos)
function getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


/* El ciclo de renderizado */
// Lo que hace es que limpia el canva pintandolo completamente con el color de fondo
var clear = function() {
    ctx.fillStyle = fondoCanvas;
    ctx.fillRect(0, 0, width, height);
};
// Y este ejecuta un fotograma completo, limpiando el fondo y actualizado/dibujando el bloque
var draw = function() {
    clear();
    dvdBlock.move();
};


/* Los controles de reproduccion y velocidad del cuadro*/
// Actualiza el texto del indicador de velocidad en el HTML
var updateSpeedLabel = function() {
    speedLabel.textContent = "Velocidad: " + speedMultiplier + "x";
};
// Inicia o reanuda la animacion (evita crear intervalos duplicados)
var play = function() {
    if (intervalId !== null) return;
    intervalId = setInterval(draw, 60);
};
// Pausa la animacion deteniendo el intervalo activo
var pause = function() {
    if (intervalId === null) return;
    clearInterval(intervalId);
    intervalId = null;
};
// Disminuye la velocidad en 0.25x hasta el limite minimo (0.25x)
var slower = function() {
    if (speedMultiplier > minSpeed) {
        speedMultiplier -= speedStep;
        updateSpeedLabel();
    }
};
// Aumenta la velocidad en 0.25x hasta el limite máximo (4x)
var faster = function() {
    if (speedMultiplier < maxSpeed) {
        speedMultiplier += speedStep;
        updateSpeedLabel();
    }
};
/* Inicializacion de la pagina/aplicacion */
// Lee estilos CSS, crea el bloque, enlaza eventos y empieza la animacion
var init = function() {
    // Esto aqui lee las variables definidas en :root dentro de estilo.css
    var rootStyles = getComputedStyle(document.documentElement);
    fondoCanvas = rootStyles.getPropertyValue("--fondo-canvas").trim() || "#000000";


    dvdColors = [
        rootStyles.getPropertyValue("--lima").trim(),
        rootStyles.getPropertyValue("--turquesa").trim(),
        rootStyles.getPropertyValue("--coral").trim(),
        rootStyles.getPropertyValue("--lavanda").trim(),
        rootStyles.getPropertyValue("--blanco").trim()
    ].filter(Boolean);
    // Paleta de respaldo en caso de que no carguen las variables que estan en el CSS
    if (dvdColors.length === 0) {
        dvdColors = ["#b8ff3b", "#2de2e6", "#ff5e78", "#b388ff", "#ffffff"];
    }
// Crea el cuadrado con posicion, direccion y color aleatorios
    dvdBlock = new Block(
        getRandomX(),
        getRandomY(),
        sizeX,
        sizeY,
        speedX(),
        speedY(),
        getPaletteColor(null)
    );
// Asocia cada botón del DOM con su función de control ya asignados desde un principio
    btnPause.addEventListener("click", pause);
    btnPlay.addEventListener("click", play);
    btnSlower.addEventListener("click", slower);
    btnFaster.addEventListener("click", faster);


    // Muestra la velocidad de inicio y hace que empiece el bucle de animacion
    updateSpeedLabel();
    play();
};

// Espera a que la página y los estilos terminen de cargar para ejecutar init()
window.addEventListener("load", init);