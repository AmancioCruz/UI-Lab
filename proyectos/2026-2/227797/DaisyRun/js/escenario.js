// VARIABLES DEL ESCENARIO
//obtenemos los elementos del escenario del html
const paisaje = document.getElementById("paisaje");
const nubes = document.getElementById("nubes");

//posicion del paisaje y las nubes
let posicionPaisaje = 0;
let posicionNubes = 0;

//velocidad de movimiento de los dos
let velocidadPaisaje = 1;
let velocidadNubes = 0.5;

//funcion para ir actualizando el escenario
function actualizarEscenario(){
    //actualizamos la posicion del paisaje
    posicionPaisaje -= velocidadPaisaje;

    //actualizamos la posicion de las nubes
    posicionNubes -= velocidadNubes;

    //aplicamos el movimiento
    paisaje.style.backgroundPositionX = posicionPaisaje + "px";
    nubes.style.backgroundPositionX = posicionNubes + "px";
}
console.log("probando si carga escenario");