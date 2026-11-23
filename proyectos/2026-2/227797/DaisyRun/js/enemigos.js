//arreglo de imagenes de los enemigos
let imagenesEnemigos = {
    cactus: "recursos/enemigos/cactus.png",
    kopla1: "recursos/enemigos/kopla1.png",
    kopla2: "recursos/enemigos/kopla2.png"
}

//arreglos donde se almacenan los enemigos que van aparecer
//cada enemigo guarda su elemento html y su posicion para poder actualizarlo uno por uno
let cactusEnemigos = []
let koplasEnemigos = []

//cantidad maxima de enemigos en pantalla
let maximoCactus = 1;
let maximoKoplas = 1;

//las alturas que usare donde aparece el kopla
let alturasKopla = [65, 110, 155];

//funcion para crear nuevos cactus
function crearCactus() {
    let nuevoCactus = document.createElement("img");
    nuevoCactus.src = imagenesEnemigos.cactus;
    nuevoCactus.alt = "Cactus";
    nuevoCactus.classList.add("cactus");
    nuevoCactus.style.position = "absolute";
    nuevoCactus.style.width = "50px";
    nuevoCactus.style.bottom = "0px";
    nuevoCactus.style.right = "0px";

    //agregamos el cactus al escenario y lo guardamos en el arreglo
    //su posicion inicial es 0 porque comienza desde la derecha
    document.getElementById("juego").appendChild(nuevoCactus);
    cactusEnemigos.push({
        elemento: nuevoCactus,
        posicion: 0
    });
}

//funcion para crear nuevos koplas
function crearKopla() {
    let nuevoKopla = document.createElement("img");
    nuevoKopla.src = imagenesEnemigos.kopla1;
    nuevoKopla.alt = "Enemigo volador";
    nuevoKopla.classList.add("kopla");
    nuevoKopla.style.position = "absolute";
    nuevoKopla.style.width = "55px";
    nuevoKopla.style.right = "0px";

    //definimos variables para escoger una altura aleatoria
    let numeroAltura = Math.floor(Math.random() * alturasKopla.length);
    let nuevaAltura = alturasKopla[numeroAltura];
    nuevoKopla.style.bottom = nuevaAltura + "px";

    //agregamos el kopla al escenario y guardamos sus datos para poder controlar su movimiento y animacion
    document.getElementById("juego").appendChild(nuevoKopla);
    koplasEnemigos.push({
        elemento: nuevoKopla,
        posicion: 0,
        contadorAlas: 0,
        cambiarAlas: false,
        altura: nuevaAltura
    });
}

//funcion para actualizar el movimiento de los cactus
function actualizarCactusMultiples() {
    //recorremos el arreglo para mover  los cactus que se encuentren en pantalla
    cactusEnemigos.forEach(function(cactus) {
        cactus.posicion += velocidadCactus;
        cactus.elemento.style.right = cactus.posicion + "px";

        //si el cactus sale del rectangulo
        if (cactus.posicion > 850) {
            //eliminamos el elemento del html cuando ya no se ve
            cactus.elemento.remove();
        }
    });

    //eliminamos los cactus que ya salieron
    //filter: crea un nuevo arreglo conservando los enemigos que siguen en pantalla
    cactusEnemigos = cactusEnemigos.filter(function(cactus) {
        return cactus.posicion <= 850;
    });
}

//funcion para controlar la aparicion de cactus
function generarCactus() {
    //comprobamos que no se haya alcanzado el limite de cactus que apareceny que el tiempo de espera haya terminado
    if (cactusEnemigos.length < maximoCactus && esperaCactus <= 0 && esperaEntreApariciones <= 0) {
        crearCactus();

        //calculamos la espera segun la distancia que queremos y la velocidad actual
        esperaCactus = Math.ceil(distanciaMinima / velocidadCactus);
        esperaEntreApariciones = Math.ceil(distanciaMinima / velocidadCactus);
    }
}

//funcion para actualizar el movimiento de los koplas
function actualizarKoplaMultiples() {
    //recorremos todos los koplas para actualizar su movimiento y animacion
    koplasEnemigos.forEach(function(kopla) {
        //iremos actualizando la posicion del kopla
        kopla.posicion += velocidadKopla;
        kopla.elemento.style.right = kopla.posicion + "px";

        //animamos el aleteo 
        kopla.contadorAlas++;

        //cambiamos de imagen cada 10 ciclos para el aleteo
        if (kopla.contadorAlas >= 10) {
            kopla.cambiarAlas = !kopla.cambiarAlas;
            if (kopla.cambiarAlas) {
                kopla.elemento.src = imagenesEnemigos.kopla2;
            }
            else {
                kopla.elemento.src = imagenesEnemigos.kopla1;
            }
            kopla.contadorAlas = 0;
        }

        //si kopla sale del rectangulo
        if (kopla.posicion > 855) {
            //quitamos el elemento del html
            kopla.elemento.remove();
        }
    });

    //eliminamos los koplas que ya salieron de pantalla
    //actualizamos el arreglo para conservar solamente los enemigos que siguen dentro de la pantalla
    koplasEnemigos = koplasEnemigos.filter(function(kopla) {
        return kopla.posicion <= 855;
    });
}

//funcion para controlar la aparicion de koplas
function generarKopla() {
    //verificamos el limite de koplas y los tiempos de espera
    if (koplasEnemigos.length < maximoKoplas && esperaKopla <= 0 && esperaEntreApariciones <= 0) {
        crearKopla();

        //la espera se calcula tomando en cuenta la distancia minima y la velocidad del enemigo
        //math.ceil para redondear el resultado hacia arriba para obtener un numero entero de ciclos de espera
        esperaKopla = Math.ceil(distanciaMinima / velocidadKopla);
        esperaEntreApariciones = Math.ceil(distanciaMinima / velocidadKopla);
    }
}

//controlar la distancia entre aparicion y aparicion de enemigos
let distanciaMinima = 180;
let esperaCactus = 60;
let esperaKopla = 60;
let reduccionEspera = 0;
let esperaEntreApariciones = 0;

//funcion para actualizar los tiempos de espera
function actualizarEsperas() {
    //disminuimos los contadores en cada ciclo del juego hasta que lleguen a cero
    if (esperaCactus > 0) {
        esperaCactus--;
    }
    if (esperaKopla > 0) {
        esperaKopla--;
    }
    if (esperaEntreApariciones > 0) {
        esperaEntreApariciones--;
    }
}

//variables de velocidad de los enemigos
let velocidadCactus = 3;
let velocidadKopla = 3;

//funcion para aumentar la dificultad con la puntuacion
function aumentarDificultad() {
    //calculamos la velocidad segun la puntuacion
    //la dificultad aumenta cada 100 puntos
    //establecemos el limite de velocidad a 7 (maxima dificultad)
    //con math.min compara los valores y nos devuelve el menor nunca permitiendo que supere 7
    //el aumento es gradual y tiene un limite para evitar que los enemigos se vuelvan demasiado rapidos
    let nuevaVelocidad = Math.min(7, 4.5 + Math.floor(puntuacion / 100) * 0.5);

    //y actualizamos la velocidad de los enemigos
    //ambos tipos de enemigos utilizan la misma velocidad para mantener un movimiento equilibrado
    velocidadCactus = nuevaVelocidad;
    velocidadKopla = nuevaVelocidad;

    //reducimos la distancia entre enemigos cada 50 puntos
    //Math.max evita que la distancia sea menor a 140
    distanciaMinima = Math.max(140, 180 - Math.floor(puntuacion / 50) * 5);

    //reducimos el tiempo de spwaneo cada 50 puntuaje
    //este valor calcula una reduccion progresiva en los tiempos de espera
    reduccionEspera = Math.min(100, Math.floor(puntuacion / 50) * 10);

    //aumentamos la cantidad de enemigos segun la puntuacion
    //iniciamos con un enemigo de cada tipo y aumentamos el limite conforme avanza la partida
    maximoCactus = 1;
    maximoKoplas = 1;

    if (puntuacion >= 50) {
        maximoCactus = 2;
        maximoKoplas = 2;
    }
    if (puntuacion >= 150) {
        maximoCactus = 3;
        maximoKoplas = 3;
    }
}

//funcion para eliminar todos los enemigos al reiniciar
//como los enemigos se crean en js los eliminamos del documento y vaciamos sus arreglos
function limpiarEnemigos() {
    //eliminamos los cactus del html
    cactusEnemigos.forEach(function(cactus) {
        cactus.elemento.remove();
    });

    //y eliminamos los koplas del html
    koplasEnemigos.forEach(function(kopla) {
        kopla.elemento.remove();
    });

    //vaciamos los arreglos que tenemos
    cactusEnemigos = [];
    koplasEnemigos = [];
}