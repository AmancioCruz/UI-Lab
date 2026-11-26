// Variables globales para almacenar las imágenes cargadas en memoria
let imgFondo, imgPersonaje, imgObstaculo;

// Obtiene el elemento canvas del HTML y su contexto 2D para poder dibujar
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Referencias a los elementos de texto, menús y botones de la interfaz
const scoreDisplay = document.getElementById('score-display');
const startMenu = document.getElementById('start-menu');
const gameoverMenu = document.getElementById('gameover-menu');
const finalScoreEl = document.getElementById('final-score');
const bestScoreEl = document.getElementById('best-score');
const btnPlay = document.getElementById('btn-play');
const btnRestart = document.getElementById('btn-restart');

// Variables que controlan el estado actual del juego ('START', 'PLAYING', 'GAMEOVER')
let state = 'START';
// Puntaje de la partida actual
let score = 0;
// Recupera el récord guardado en el navegador o inicia en 0 si no existe
let bestScore = parseInt(localStorage.getItem('flappy_carton_best') || '0', 10);
// Guarda la marca de tiempo del fotograma anterior para calcular el Delta Time
let lastTime = 0;

// Factor de escala proporcional que adapta tamaños y física a cualquier pantalla
let scale = 1;

// Arreglo que almacena todos los pares de tubos activos en pantalla
const pipes = [];
// Ancho base de cada tubo en píxeles
let pipeWidth = 76;
// Espacio vertical entre el tubo superior e inferior por donde pasa el pájaro
let pipeGap = 175;
// Velocidad horizontal a la que avanzan los tubos hacia la izquierda
let pipeSpeed = 3.4;
// Distancia horizontal entre un par de tubos y el siguiente
let pipeSpacing = 360;

// Carga una imagen de forma asíncrona mediante una Promesa antes de usarla
function loadImage(src) {
  return new Promise((resolve, reject) => {
    // Crea un nuevo objeto de imagen en memoria
    const img = new Image();
    // Resuelve la promesa cuando la imagen termina de cargar correctamente
    img.onload = () => resolve(img);
    // Rechaza la promesa si ocurre un error al buscar la ruta de la imagen
    img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${src}`));
    // Asigna la ruta del archivo para iniciar la descarga
    img.src = src;
  });
}

// Objeto que contiene las propiedades, física y métodos del personaje principal
const bird = {
  // Posición horizontal fija en pantalla
  x: 150,
  // Posición vertical actual
  y: 300,
  // Ancho del sprite del pájaro
  w: 48,
  // Alto del sprite del pájaro
  h: 41,
  // Velocidad vertical actual (positiva cae, negativa sube)
  vy: 0,
  // Fuerza de gravedad que acelera la caída en cada fotograma
  gravity: 0.42,
  // Fuerza del impulso vertical al saltar
  jump: -8.2,
  // Ángulo de inclinación visual en radianes
  rot: 0,

  // Restablece la posición y velocidad inicial del pájaro al comenzar partida
  reset() {
    this.x = Math.min(Math.round(canvas.width * 0.2), 260);
    this.y = canvas.height / 2;
    this.vy = 0;
    this.rot = 0;
  },

  // Actualiza la caída, posición vertical y rotación según el tiempo transcurrido (dt)
  update(dt) {
    // Aumenta la velocidad de caída por efecto de la gravedad
    this.vy += this.gravity * dt;
    // Mueve el pájaro verticalmente según su velocidad actual
    this.y += this.vy * dt;
    // Calcula la inclinación del sprite entre -36° al subir y +45° al caer
    this.rot = Math.min(Math.PI / 4, Math.max(-Math.PI / 5, (this.vy * 3.5 / scale) * (Math.PI / 180)));

    // Evita que el pájaro salga por el borde superior de la pantalla
    if (this.y < 0) {
      this.y = 0;
      this.vy = 0;
    }
  },

  // Aplica el impulso de salto hacia arriba y reproduce el sonido correspondiente
  flap() {
    this.vy = this.jump;
    if (typeof Sonido !== 'undefined') Sonido.saltar();
  },

  // Dibuja el sprite del pájaro rotado desde su punto central en el canvas
  draw() {
    // Guarda el estado actual del contexto antes de rotar
    ctx.save();
    // Mueve el punto de origen al centro exacto del personaje
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    // Rota el lienzo según el ángulo del pájaro
    ctx.rotate(this.rot);
    // Dibuja la imagen centrada respecto al nuevo origen
    ctx.drawImage(imgPersonaje, -this.w / 2, -this.h / 2, this.w, this.h);
    // Restaura el contexto para no afectar los siguientes dibujos
    ctx.restore();
  }
};

// Ajusta el tamaño del canvas y escala proporcionalmente todos los elementos al tamaño de ventana
function resizeCanvas() {
  // Iguala la resolución interna del canvas al tamaño real de la ventana
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;

  // Calcula el factor de escala tomando como referencia una altura base de 680px
  scale = Math.max(0.85, canvas.height / 680);

  // Recalcula dimensiones y física del pájaro según la escala
  bird.w = Math.round(48 * scale);
  bird.h = Math.round(41 * scale);
  bird.gravity = 0.42 * scale;
  bird.jump = -8.2 * scale;

  // Recalcula dimensiones y velocidad de los tubos según la escala
  pipeWidth = Math.round(76 * scale);
  pipeGap = Math.round(175 * scale);
  pipeSpeed = 3.4 * scale;
  pipeSpacing = Math.round(360 * scale);

  // Si aún no empieza la partida, mantiene al pájaro centrado
  if (state === 'START') {
    bird.reset();
  }
}
// Escucha cambios de tamaño en la ventana (o giro de pantalla en celular)
window.addEventListener('resize', resizeCanvas);
new ResizeObserver(resizeCanvas).observe(canvas.parentElement);
// Ejecuta el ajuste inicial al cargar la página
resizeCanvas();

// Genera un nuevo par de tubos (superior e inferior) con altura aleatoria
function createPipe() {
  // Margen mínimo arriba y abajo para que el hueco siempre sea alcanzable
  const margin = Math.round(90 * scale);
  // Altura máxima permitida para el tubo superior
  const maxTop = Math.max(margin + 40, canvas.height - pipeGap - margin);
  // Calcula una altura aleatoria para el tubo superior
  const topH = Math.floor(Math.random() * (maxTop - margin)) + margin;

  // Agrega el nuevo obstáculo al final del arreglo de tubos
  pipes.push({
    x: canvas.width,
    top: topH,
    bottom: topH + pipeGap,
    passed: false
  });
}

// Mueve los tubos, suma puntos al superarlos y detecta colisiones
function updatePipes(dt) {
  // Crea un nuevo tubo si no hay ninguno o si el último ya avanzó la distancia requerida
  if (pipes.length === 0 || (canvas.width - pipes[pipes.length - 1].x) >= pipeSpacing) {
    createPipe();
  }

  // Recorre los tubos de atrás hacia adelante para poder eliminarlos sin errores de índice
  for (let i = pipes.length - 1; i >= 0; i--) {
    const p = pipes[i];
    // Desplaza el tubo hacia la izquierda
    p.x -= pipeSpeed * dt;

    // Verifica si el pájaro ya cruzó completamente el tubo para sumar 1 punto
    if (!p.passed && p.x + pipeWidth < bird.x) {
      p.passed = true;
      score++;
      scoreDisplay.innerText = score;
      if (typeof Sonido !== 'undefined') Sonido.punto();
    }

    // Margen interno de tolerancia para hacer la caja de colisión más justa
    const hitBox = Math.round(6 * scale); // por que el png lo ajuste mal jajajaja
    // Comprueba si el pájaro está dentro del rango horizontal del tubo
    const hitX = bird.x + hitBox < p.x + pipeWidth && bird.x + bird.w - hitBox > p.x;
    // Comprueba si choca con el tubo de arriba
    const hitTop = bird.y + hitBox < p.top;
    // Comprueba si choca con el tubo de abajo
    const hitBottom = bird.y + bird.h - hitBox > p.bottom;

    // Si hay choque horizontal y vertical, termina la partida
    if (hitX && (hitTop || hitBottom)) {
      gameOver();
    }

    // Elimina el tubo de la memoria una vez que sale por el borde izquierdo
    if (p.x + pipeWidth < -pipeWidth) {
      pipes.splice(i, 1);
    }
  }
}

// Dibuja todos los tubos activos en el canvas
function drawPipes() {
  // Altura fija del sprite para evitar que la boquilla del tubo se estire o deforme
  const pipeSpriteHeight = Math.max(canvas.height, 1000);

  pipes.forEach(p => {
    ctx.save();

    // Dibuja el tubo superior invirtiendo el eje vertical mediante escala negativa
    ctx.save();
    ctx.translate(p.x + pipeWidth / 2, p.top);
    ctx.scale(1, -1);
    ctx.drawImage(imgObstaculo, -pipeWidth / 2, 0, pipeWidth, pipeSpriteHeight);
    ctx.restore();

    // Dibuja el tubo inferior en su orientación normal
    ctx.drawImage(imgObstaculo, p.x, p.bottom, pipeWidth, pipeSpriteHeight);

    ctx.restore();
  });
}

//textura de cartón cubriendo toda la pantalla(cover)
function drawBackground() {
  // Calcula la relación de aspecto de la imagen y del canvas
  const imgRatio = imgFondo.width / imgFondo.height;
  const canvasRatio = canvas.width / canvas.height;
  let drawW, drawH, offsetX, offsetY;

  // Ajusta ancho, alto y centrado según qué lado sea más ancho
  if (canvasRatio > imgRatio) {
    drawW = canvas.width;
    drawH = canvas.width / imgRatio;
    offsetX = 0;
    offsetY = (canvas.height - drawH) / 2;
  } else {
    drawH = canvas.height;
    drawW = canvas.height * imgRatio;
    offsetX = (canvas.width - drawW) / 2;
    offsetY = 0;
  }

  // Pinta el fondo centrado en el lienzo
  ctx.drawImage(imgFondo, offsetX, offsetY, drawW, drawH);
}

// Reinicia variables, limpia obstáculos y comienza una nueva partida
function startGame() {
  state = 'PLAYING';
  score = 0;
  pipes.length = 0;
  scoreDisplay.innerText = '0';

  bird.reset();
  bird.flap();

  // Oculta los paneles de inicio y fin de juego
  startMenu.classList.add('hidden');
  gameoverMenu.classList.add('hidden');
}

// Detiene la partida, guarda el récord si fue superado y muestra el panel de derrota
function gameOver() {
  // Evita ejecutar esta función más de una vez por choque
  if (state === 'GAMEOVER') return;
  state = 'GAMEOVER';

  // Reproduce el sonido de colisión
  if (typeof Sonido !== 'undefined') Sonido.chocar();

  // Actualiza el récord en localStorage si el puntaje actual es mayor
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('flappy_carton_best', bestScore);
  }

  // Muestra los puntajes finales en pantalla y despliega el menú de reinicio
  finalScoreEl.innerText = score;
  bestScoreEl.innerText = bestScore;
  gameoverMenu.classList.remove('hidden');
}

// Bucle principal de animación que actualiza y dibuja cada fotograma
function loop(timestamp) {
  // Inicializa el tiempo en el primer fotograma
  if (!lastTime) lastTime = timestamp;
  // Calcula el Delta Time normalizado a 60 FPS (evita saltos bruscos si se cambia de pestaña)
  const dt = Math.min((timestamp - lastTime) / (1000 / 60), 3);
  lastTime = timestamp;

  // Limpia el lienzo y dibuja el fondo en cada cuadro
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  // Solo actualiza física y obstáculos mientras la partida está en curso
  if (state === 'PLAYING') {
    bird.update(dt);
    updatePipes(dt);

    // Termina la partida si el personaje cae hasta el borde inferior
    if (bird.y + bird.h >= canvas.height) {
      gameOver();
    }
  }

  // Dibuja siempre los tubos y el personaje por encima del fondo
  drawPipes();
  bird.draw();

  // Solicita al navegador el siguiente fotograma
  requestAnimationFrame(loop);
}

// Gestiona el salto del personaje o el inicio del juego desde la pantalla inicial
function handleJump(e) {
  if (e && e.cancelable) e.preventDefault();

  if (state === 'PLAYING') {
    bird.flap();
  } else if (state === 'START') {
    startGame();
  }
}

// Detecta pulsación de la barra espaciadora o flecha arriba para saltar
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    handleJump();
  }
});

// Detecta clics de ratón o toques en pantalla táctil sobre el canvas
canvas.addEventListener('pointerdown', (e) => {
  handleJump(e);
});

// Inicia la partida al pulsar el botón JUGAR
btnPlay.addEventListener('click', (e) => {
  e.stopPropagation();
  startGame();
});

// Reinicia la partida al pulsar el botón REINTENTAR
btnRestart.addEventListener('click', (e) => {
  e.stopPropagation();
  startGame();
});

// Precarga todas las imágenes necesarias antes de arrancar el bucle del juego
Promise.all([
  loadImage('Recursos/Carton.avif'),
  loadImage('Recursos/Pajaro.png'),
  loadImage('Recursos/Tubo.png')
])
  .then(([fondo, personaje, obstaculo]) => {
    // Asigna las imágenes ya cargadas a sus variables globales
    imgFondo = fondo;
    imgPersonaje = personaje;
    imgObstaculo = obstaculo;
    // Ajusta el tamaño inicial del lienzo y comienza el ciclo de animación
    resizeCanvas();
    requestAnimationFrame(loop);
  })
  .catch((err) => {
    // Muestra en consola si alguna imagen no se encontró
    console.error(err);
  });
