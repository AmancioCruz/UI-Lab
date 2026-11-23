// Obtenemos el elemento Daisy desde HTML
const daisy = document.getElementById("daisy");
let imagenes = {
    daisycorriendo: "recursos/daisy/daisycorriendo.png",
    daisycorriendo2: "recursos/daisy/daisycorriendo2.png",
    daisyagachando: "recursos/daisy/daisyagacha.png",
    daisyflota: "recursos/daisy/daisysalta.png"
}

//variable de la puntuacion
let puntuacion = 0;
let contadorPuntuacion = 0;
const textoPuntuacion = document.getElementById("puntuacion");

let contadorAnimacion = 0;
let cambiarImagen = false;
let agachada = false;

console.log(daisy);

//para detectar si presiona una tecla
document.addEventListener("keydown", function(event) {
    //cuando el jugador presione una tecla comprobaremos si la musica esta pausada y, si si, inicia
    if(musicaFondo.paused && juegoActivo){
        iniciarMusica();
    }
    //si presionamos flecha arriba daisy comenzara a levitar
    if(event.key == "ArrowUp" && !agachada && !enElAire && !event.repeat){
        daisy.src=imagenes.daisyflota;
        volando = true;
        enElAire = true;

        //current time reinicia el sonido desde el principio
        //play lo reproduce
        sonidoSalto.currentTime = 0;
        sonidoSalto.play();
    }
    //si presionamos flecha abajo daisy agachada
    if(event.key == "ArrowDown" && !volando){
        daisy.src = imagenes.daisyagachando;
        agachada = true;
    }
});

//para detectar cuando suelta la tecla
document.addEventListener("keyup", function(event) {
    //detectamos cuando se suelta una tecla
    if(event.key == "ArrowUp"){
        daisy.src = imagenes.daisycorriendo;
        volando = false;
    }
    //si soltamos daisy vuelve a correr
    if(event.key == "ArrowDown"){
        daisy.src = imagenes.daisycorriendo;
        agachada = false;
    }
});


//FUNCION PARA ACTUALIZAR LA POSICION DE DAISY
function actualizarDaisy() {

    //si daisy vuela = altura incrementa
    if (volando) {
        velocidadSalto = 5;
    }

    //si daisy deja de volar = altura desciende
    else {
        velocidadSalto = -6;
    }

    //actualizamos la altura de daisy
    posicionDaisy += velocidadSalto;

    //ponemos el limite de altura
    if (posicionDaisy > alturaMaxima) {
        posicionDaisy = alturaMaxima;
    }

    //evitamos que daisy atraviese el suelo
    if (posicionDaisy < 0) {
        posicionDaisy = 0;
        enElAire = false;
    }

    //aplicamos la nueva posicion de daisy
    daisy.style.bottom = posicionDaisy + "px";

    if (!volando && !agachada && posicionDaisy == 0) {

        contadorAnimacion++;

        //cambiamos la imagen cada 10 actualizaciones
        if (contadorAnimacion >= 10) {

            cambiarImagen = !cambiarImagen;
            if (cambiarImagen) {
                daisy.src = imagenes.daisycorriendo2;
            }
            else {
                daisy.src = imagenes.daisycorriendo;
            }
            contadorAnimacion = 0;
        }
    }
}


// VARIABLES DE DAISY
//indica si esta levitando
let volando = false;

//indica si esta en al aire
let enElAire = false;

//velocidad del salto
let velocidadSalto = 0;

//ponemos un limite para que daisy no se salga del rectangulo
let alturaMaxima = 120;

//altura inicial de daisy
let posicionDaisy = 0;
//para indiciar si el juego sigue corriendo
let juegoActivo = true;


//funcion para ejecutar los movimientos de daisy
function juego() {
    //si el juego termina detenemos todas las funciones
    if(!juegoActivo){
        return;
    }

    actualizarDaisy();
    actualizarEscenario();
    actualizarEsperas();
    generarCactus();
    generarKopla();
    actualizarCactusMultiples();
    actualizarKoplaMultiples();
    verificarColisiones();
    aumentarDificultad();

    if(juegoActivo){
        contadorPuntuacion++;
        if(contadorPuntuacion >= 6){
            puntuacion++;
            textoPuntuacion.textContent = puntuacion;
            contadorPuntuacion = 0;
        }
    }
    //si no el juego sigue corriendo
    if(juegoActivo){
        requestAnimationFrame(juego);
    }
}

//funcion para reiniciar la partida
function reiniciarJuego() {
    //PUNTUACION
    //reiniciamos el puntuaje a 0
    puntuacion = 0;
    contadorPuntuacion = 0;

    //actualizamos el marcador de la pantalla
    textoPuntuacion.textContent = puntuacion;

    //DAISY
    //restablecemos el estado de daisy tambien
    posicionDaisy = 0;
    volando = false;
    enElAire = false;
    agachada = false;

    //restablecemos su velocidad y altura
    velocidadSalto = 0;

    //regresamos a daisy a su posicion inicial
    daisy.style.bottom = "0px";
    daisy.src = imagenes.daisycorriendo;

    //reiniciamos su animacion
    contadorAnimacion = 0;
    cambiarImagen = false;

    //ENEMIGOS
    //eliminamos los enemigos con la funcion limpiarenemigos
    limpiarEnemigos();
    //restablecemos la velocidad de los enemigos inicial
    velocidadCactus = 3;
    velocidadKopla = 3;
    //restablecemos la distancia entre enemigos
    distanciaMinima = 180;
    //restablecemos los tiempos de espera
    esperaCactus = 60;
    esperaKopla = 60;
    esperaEntreApariciones = 0;
    reduccionEspera = 0;
    //restablecemos la cantidad maxima de enemigos
    maximoCactus = 1;
    maximoKoplas = 1;

    //PAISAJE
    //restablecemos la posicion del escenario
    posicionPaisaje = 0;
    posicionNubes = 0;
    //regresamos el fondo a su posicion inicial
    paisaje.style.backgroundPositionX = "0px";
    nubes.style.backgroundPositionX = "0px";

    //BOTONES
    //ocultamos el mensaje de gameover y el boton de jugar otra vez
    document.getElementById("mensajegameover").hidden = true;
    document.getElementById("btnReiniciar").hidden = true;

    //el jeugo vuelve a empezar
    juegoActivo = true;
    juego();
}

//evento click reiniciar juego
document.getElementById("btnReiniciar").addEventListener("click", function() {
    reiniciarJuego();
});

//iniciar el juego
juego();