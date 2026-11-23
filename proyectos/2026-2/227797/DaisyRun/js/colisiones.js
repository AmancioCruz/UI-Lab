//funcion para las colisiones
function detectarColision(daisy, enemigo) {
    //obtenemos los limites de daisy y el enemigo
    //metodo de js que obtiene las dimensiones y la posición del elemento dentro del navegador
    let limitesDaisy = daisy.getBoundingClientRect();
    let limitesEnemigo = enemigo.getBoundingClientRect();

    //areas de colision
    let margenDaisy = 12;
    let margenEnemigo = 14;

    //comprobamos si los elementos se estan tocando
    return (
        limitesDaisy.left + margenDaisy < limitesEnemigo.right - margenEnemigo &&
        limitesDaisy.right - margenDaisy > limitesEnemigo.left + margenEnemigo &&
        limitesDaisy.top + margenDaisy < limitesEnemigo.bottom - margenEnemigo &&
        limitesDaisy.bottom - margenDaisy > limitesEnemigo.top + margenEnemigo
    );
}

//verificamos las colisiones
function verificarColisiones() {
    //revisamos todos los cactus
    cactusEnemigos.forEach(function(cactus) {
        if (detectarColision(daisy, cactus.elemento)) {
            terminarJuego();
        }
    });

    //revisamos todos los koplas
    koplasEnemigos.forEach(function(kopla) {
        if (detectarColision(daisy, kopla.elemento)) {
            terminarJuego();
        }
    });
}

//funcion para game over si daisy choca
function terminarJuego() {
    //si el juego ya termino, no hacemos nada
    if (!juegoActivo) {
        return;
    }
    //desactivamos el jeugo
    juegoActivo = false;

    //detenemos la musica si el jugador pierde
    //con current time la regresamos al inicio
    musicaFondo.pause();
    musicaFondo.currentTime = 0;

    sonidoGameOver.currentTime = 0;
    sonidoGameOver.play();

    //mostramos el mensaje de gameover
    document.getElementById("mensajegameover").hidden = false;

    //mostramos el boton para reiniciar
    document.getElementById("btnReiniciar").hidden = false;
    console.log("¡GAME OVER!");
}