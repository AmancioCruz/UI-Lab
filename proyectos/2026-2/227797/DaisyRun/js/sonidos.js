//SONIDOS DEL JUEGO
let sonidoSalto = new Audio("recursos/sonidos/salto.wav");
let sonidoGameOver = new Audio("recursos/sonidos/gameover.wav");
let musicaFondo = new Audio("recursos/sonidos/musica.wav");
console.log(sonidoSalto);
console.log("Ruta del sonido:", sonidoSalto.src);
console.log("Duración:", sonidoSalto.duration);

//la musica se reproduce en loop
musicaFondo.loop = true;

//funcion para iniciar la musica
function iniciarMusica() {
    musicaFondo.play();
}
//licencias / creditos de los sonidos
//gameover.wav - deleted_user_877451 - https://freesound.org/people/deleted_user_877451/sounds/76376/
//jump2.wav - Edimar_Ramide - https://freesound.org/people/Edimar_Ramide/sounds/805690/
//temple music.wav - vibritherabjit123 - https://freesound.org/people/vibritherabjit123/sounds/721327/