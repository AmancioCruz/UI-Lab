// Módulo encargado de generar los efectos de sonido del juego mediante Web Audio API
const Sonido = (() => {
  // Contexto de audio del navegador (se inicializa al primer toque o clic por políticas del navegador)
  let ctx = null;

  // Crea o reactiva el contexto de audio cuando el usuario interactúa con la página
  function init() {
    if (!ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioContext();
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  // Genera el sonido ascendente al pulsar para saltar/aletear
  function saltar() {
    init();
    // Crea un oscilador (generador de onda) y un nodo de ganancia (volumen)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Usa una onda triangular para un tono suave tipo retro
    osc.type = 'triangle';
    // Sube la frecuencia rápidamente de 260 Hz a 520 Hz en 0.12 segundos
    osc.frequency.setValueAtTime(260, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.12);

    // Controla el volumen inicial y lo desvanece hasta casi cero para evitar chasquidos
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    // Conecta oscilador -> volumen -> altavoces
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Inicia y detiene el sonido tras 0.12 segundos
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  // Genera un doble tono agudo cada vez que el jugador supera un tubo y suma un punto
  function punto() {
    init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Usa onda senoidal limpia para un timbre tipo moneda arcade
    osc.type = 'sine';
    // Primera nota (B5) y cambio rápido a una nota más aguda (E6)
    osc.frequency.setValueAtTime(987.77, ctx.currentTime);
    osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.07);

    // Ajusta el volumen y su desvanecimiento en 0.22 segundos
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  }

  // Genera un sonido grave descendente cuando el personaje choca o cae
  function chocar() {
    init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Usa onda diente de sierra para darle un timbre áspero de golpe
    osc.type = 'sawtooth';
    // Baja la frecuencia bruscamente de 180 Hz a 45 Hz en 0.25 segundos
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.25);

    // Ajusta el volumen del impacto y lo desvanece
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }

  // Expone únicamente las tres funciones públicas para ser llamadas desde script.js
  return {
    saltar,
    punto,
    chocar
  };
})();