//Elementos HTML
const gameBoard = document.getElementById("gameBoard");
const btn_iniciar = document.getElementById("startBtn");
const btn_reiniciar = document.getElementById("restartBtn");
const scoreDisplay = document.getElementById("score");
const mineDisplay = document.getElementById("mineCount");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");

//Configuracion del juego
const filas = 15;
const columnas = 15;
//Cantidad inicial de minas
const cantidad_minas = 10;
//Cantidad máxima de minas
const maximoMinas = 20;
//Cada cuántos puntos aumentan las minas
const puntosParaAumentar = 50;
//Cuántas minas se agregan por aumento
const aumentoMinas = 2;
const velocidad = 200;

//variables a utilizar
let serpiente = [];
let minas = [];
let comida = null;
let direccion = { fila: 0, columna: 1 };
let nuevaDireccion = { fila: 0, columna: 1 };
let puntaje = 0;
let juegoActivo = false;
let intervalo = null;
let explosion = null;

//Funciones

//Distancia entre dos casillas, contando también diagonales
function distanciaEntreCasillas(pos1, pos2) {
    //Calcula la diferencia entre las filas y las columnas
    //Math.abs convierte las diferencias en valores positivos
    //Math.max devuelve la diferencia mayor
    return Math.max(
        Math.abs(pos1.fila - pos2.fila),
        Math.abs(pos1.columna - pos2.columna)
    );
}

//Mezclar aleatoriamente las posiciones para evitar patrones
function mezclarArreglo(arreglo) {
    //Recorre el arreglo desde el último elemento hasta el segundo
    for (let i = arreglo.length - 1; i > 0; i--) {
        //Selecciona una posición aleatoria entre 0 e i
        const j = Math.floor(Math.random() * (i + 1));
        //Intercambia los elementos de las posiciones i y j
        [arreglo[i], arreglo[j]] = [arreglo[j], arreglo[i]];
    }
    //Devuelve el arreglo con sus elementos mezclados
    return arreglo;
}

//Comprobar si dos coordenadas representan la misma casilla
function mismaPosicion(pos1, pos2) {
    //Compara las filas y las columnas de ambas posiciones
    //Devuelve true solamente si las dos coordenadas coinciden
    return pos1.fila === pos2.fila &&
        pos1.columna === pos2.columna;
}

//Crear tablero
function crearTablero() {
    //Elimina todas las casillas anteriores para evitar duplicarlas
    gameBoard.innerHTML = "";
    //Recorre todas las filas del tablero
    for (let fila = 0; fila < filas; fila++) {
        //Recorre todas las columnas de cada fila
        for (let columna = 0; columna < columnas; columna++) {
            //Crea un elemento div que representa una casilla
            const celda = document.createElement("div");
            //Agrega la clase css
            celda.classList.add("cell");
            //Guarda el número de fila como atributo personalizado
            celda.dataset.fila = fila;
            //Guarda el número de columna como atributo personalizado
            celda.dataset.columna = columna;
            //Agrega la casilla al tablero html
            gameBoard.appendChild(celda);
        }
    }
}

//obtener casilla usando las coordenadas
function obtenerCelda(fila, columna) {
    //Convierte las coordenadas de fila y columna en 
    //una posición dentro de la lista de elementos HTML
    const posicion = fila * columnas + columna;
    //Devuelve el elemento HTML correspondiente a esa posición
    return gameBoard.children[posicion];
}

//Iniciar juego
function iniciarJuego() {
    //No permite iniciar otra partida mientras esta siga activa
    if (juegoActivo) return;
    //Detiene cualquier temporizador anterior
    clearInterval(intervalo);
    //Intervalo empieza en null
    intervalo = null;
    //Reinicia puntuación
    puntaje = 0;
    //Posición inicial en el centro del tablero
    serpiente = [
        { fila: 7, columna: 7 },
        { fila: 7, columna: 6 },
        { fila: 7, columna: 5 }
    ];
    //Establece el movimiento inicial hacia la derecha
    direccion = { fila: 0, columna: 1 };
    //Establece también la nueva dirección hacia la derecha
    nuevaDireccion = { fila: 0, columna: 1 };
    //Elimina la explosion de una partida anterior
    explosion = null;
    //Crea el tablero
    crearTablero();
    //Activa el juego antes de generar los elementos
    juegoActivo = true;
    //Genera minas y comida
    generarMinas();
    generarComida();
    //Actualiza puntos y minas
    scoreDisplay.textContent = puntaje;
    mineDisplay.textContent = minas.length;
    messageTitle.textContent = "";
    messageText.textContent = "";
    //Dibuja los elementos
    dibujarJuego();
    //Activa el intervalo cada 200 milisegundos
    intervalo = setInterval(moverSerpiente, velocidad);
}

//Generar las minas
function generarMinas() {
    //Arreglo empieza vacío
    minas = [];
    //Prepara todas las casillas posibles y las mezcla
    const posiciones = [];
    //Recorre filas y columnas del tablero
    for (let fila = 0; fila < filas; fila++) {
        for (let columna = 0; columna < columnas; columna++) {
            //Guarda cada coordenada como posición disponible
            posiciones.push({ fila, columna });
        }
    }
    //Mezcla las posiciones para agregar una mina
    mezclarArreglo(posiciones);
    //Recorre posiciones aleatorias
    for (const posicion of posiciones) {
        //Si alcanza la cantidad inicial de minas, termina
        if (minas.length >= cantidad_minas) break;
        //Comprueba si la posición está demasiado cerca de la serpiente
        //Se utiliza some() para revisar todos sus segmentos
        const cercaSerpiente = serpiente.some(parte =>
            distanciaEntreCasillas(parte, posicion) <= 2
        );
        //Si está cerca, descarta la posición
        if (cercaSerpiente) continue;
        //Comprueba si la posición está junto a otra mina
        //Y considera posiciones diagonales
        const cercaMina = minas.some(mina =>
            distanciaEntreCasillas(mina, posicion) < 2
        );
        //Si está cerca de una mina, continúa
        if (cercaMina) continue;
        //Agrega la mina si cumple todas las condiciones
        minas.push(posicion);
    }
}

//Agregar minas segun el puntaje
function actualizarMinasPorPuntaje() {
    //Calcula cuántos aumentos corresponden según la puntuación
    //Math.floor elimina los decimales
    const aumentos = Math.floor(puntaje / puntosParaAumentar);
    //Calcula la cantidad total de minas que debería existir
    //Math.min impide superar el máximo establecido
    const cantidadObjetivo = Math.min(
        cantidad_minas + (aumentos * aumentoMinas),
        maximoMinas
    );
    //Agregar minas hasta alcanzar la cantidad objetivo
    while (minas.length < cantidadObjetivo) {
        //Guarda temporalmente las posiciones donde podría haber una mina
        let posicionesDisponibles = [];
        //Recorre todo el tablero para buscar casillas adecuadas
        for (let fila = 0; fila < filas; fila++) {
            for (let columna = 0; columna < columnas; columna++) {
                //Crea un objeto con las coordenadas actuales
                const posicion = { fila, columna };
                //Comprobar si esta cerca de la serpiente
                const cercaSerpiente = serpiente.some(parte =>
                    distanciaEntreCasillas(parte, posicion) <= 2
                );
                //Comprobar si está cercade otra mina
                const cercaMina = minas.some(mina =>
                    distanciaEntreCasillas(mina, posicion) < 2
                );
                //Comprobar si está cerca de la comida
                const cercaComida = comida !== null &&
                    distanciaEntreCasillas(comida, posicion) < 2;
                //Si no está cerca de ningún elemento, es una posición válida
                if (
                    !cercaSerpiente &&
                    !cercaMina &&
                    !cercaComida
                ) {
                    posicionesDisponibles.push(posicion);
                }
            }
        }

        //Mezclar posiciones disponibles
        mezclarArreglo(posicionesDisponibles);
        //Indica si se consiguió agregar una mina
        let minaAgregada = false;
        //Comprobar que la nueva mina no bloquee el camino a la comida
        for (const posicion of posicionesDisponibles) {
            //Agrega temporalmente la mina
            minas.push(posicion);
            //Comprueba que la nueva mina no bloquee el camino hacia la comida
            if (comida === null || existeCamino(comida)) {
                //Confirma que la mina pudo agregarse correctamente
                minaAgregada = true;
                break;
            }
            //Si bloquea el camino, retirar la mina
            minas.pop();
        }
        //Evitar un ciclo infinito si no hay posiciones adecuadas
        if (!minaAgregada) {
            break;
        }
    }
    //Actualizar contador visual
    mineDisplay.textContent = minas.length;
}
//Comprobar si existe camino
function existeCamino(destino) {
    //Obtiene la posición actual de la cabeza de la serpiente
    const inicio = serpiente[0];
    //Set almacena posiciones que ya fueron visitadas
    const visitadas = new Set();
    //Cola que almacena las posiciones que deben revisarse
    const cola = [inicio];
    //Guarda las posiciones que no se pueden atravesar
    const bloqueadas = new Set();
    //Agrega todas las minas a las posiciones bloqueadas
    minas.forEach(mina => {
        bloqueadas.add(`${mina.fila},${mina.columna}`);
    });
    //Agrega el cuerpo de la serpiente como obstáculo
    //slice(1) excluye la cabeza
    serpiente.slice(1).forEach(parte => {
        bloqueadas.add(`${parte.fila},${parte.columna}`);
    });
    //Marca la posición inicial como visitada
    visitadas.add(`${inicio.fila},${inicio.columna}`);
    //Define los cuatro movimientos permitidos: arriba, abajo, izquierda y derecha.
    const movimientos = [
        { fila: -1, columna: 0 },
        { fila: 1, columna: 0 },
        { fila: 0, columna: -1 },
        { fila: 0, columna: 1 }
    ];
    //Continúa mientras existan posiciones pendientes por revisar
    while (cola.length > 0) {
        //Extrae la primera posición de la cola
        const actual = cola.shift();
        //Comprueba si llegó al destino
        if (mismaPosicion(actual, destino)) {
            return true;
        }
        //Prueba los cuatro movimientos posibles desde la posición actual
        for (const movimiento of movimientos) {
            //Calcula las coordenadas de la siguiente casilla
            const siguiente = {
                fila: actual.fila + movimiento.fila,
                columna: actual.columna + movimiento.columna
            };
            //Comprueba que la siguiente casilla permanezca dentro del tablero
            if (
                siguiente.fila < 0 ||
                siguiente.fila >= filas ||
                siguiente.columna < 0 ||
                siguiente.columna >= columnas
            ) {
                //Si está fuera del tablero, pasa a otro movimiento
                continue;
            }
            //Convierte las coordenadas en una cadena para utilizarla en Set
            const clave = `${siguiente.fila},${siguiente.columna}`;
             //Si la posición está bloqueada o ya fue visitada, la descarta
            if (bloqueadas.has(clave) || visitadas.has(clave)) {
                continue;
            }
            //Marca la posición como visitada
            visitadas.add(clave);
            //Agrega la posición a la cola para revisarla después
            cola.push(siguiente);
        }
    }
    //Si se terminaron las posiciones por revisar sin encontrar el destino,
    //significa que no existe un camino disponible
    return false;
}


//Generar la comida
function generarComida() {
    //Arreglo que almacenará las posiciones donde puede aparecer comida
    const posicionesDisponibles = [];
    //Recorre todas las casillas del tablero
    for (let fila = 0; fila < filas; fila++) {
        for (let columna = 0; columna < columnas; columna++) {
            //Guarda las coordenadas actuales
            const posicion = { fila, columna };
            //Comprueba si la casilla está ocupada por la serpiente
            const ocupadaSerpiente = serpiente.some(parte =>
                mismaPosicion(parte, posicion)
            );
            //Comprueba si la casilla está ocupada por una mina
            const ocupadaMina = minas.some(mina =>
                mismaPosicion(mina, posicion)
            );
            //Comprueba si hay una mina en una casilla adyacente
            const cercaMina = minas.some(mina =>
                distanciaEntreCasillas(mina, posicion) < 2
            );
            //Agrega la posición únicamente si:
            //No está ocupada por la serpiente
            //No está ocupada por una mina
            //No está junto a una mina
            if (
                !ocupadaSerpiente &&
                !ocupadaMina &&
                !cercaMina
            ) {
                posicionesDisponibles.push(posicion);
            }
        }
    }
    //Mezcla las posiciones para elegir una aleatoriamente
    mezclarArreglo(posicionesDisponibles);
    // Comprueba cada posición disponible
    for (const posicion of posicionesDisponibles) {
        // Verifica que la serpiente pueda llegar hasta esa posición
        if (existeCamino(posicion)) {
            //Guarda la posición seleccionada como comida
            comida = posicion;
            //Termina la función indicando que se generó correctamente
            return true;
        }
    }
    //Si no hay posiciones seguras, crea un segundo arreglo de alternativas
    const alternativas = [];
    //Recorre nuevamente todo el tablero
    for (let fila = 0; fila < filas; fila++) {
        for (let columna = 0; columna < columnas; columna++) {
            //Crea las coordenadas de la casilla actual
            const posicion = { fila, columna };
            //Comprueba si la serpiente ocupa esa posición
            const ocupadaSerpiente = serpiente.some(parte =>
                mismaPosicion(parte, posicion)
            );
            //Comprueba si existe una mina en esa posición
            const ocupadaMina = minas.some(mina =>
                mismaPosicion(mina, posicion)
            );
            //Si no está ocupada por ninguno de los dos elementos,
            //se agrega como una posición alternativa
            if (!ocupadaSerpiente && !ocupadaMina) {
                alternativas.push(posicion);
            }
        }
    }
    //Mezcla las posiciones alternativas
    mezclarArreglo(alternativas);
    //Busca una posición alternativa que todavía sea alcanzable
    for (const posicion of alternativas) {
        if (existeCamino(posicion)) {
            //Coloca la comida en la posición encontrada
            comida = posicion;
            //Indica que la generación fue exitosa
            return true;
        }
    }
    //Si no existe ninguna posición libre y alcanzable,
    //elimina la comida y devuelve false
    comida = null;
    return false;
}

//Dibujar elementos
function dibujarJuego() {
    //Recorre cada segmento de la serpiente
    serpiente.forEach((parte, indice) => {
        //Obtiene la casilla correspondiente a las coordenadas del segmento
        const celda = obtenerCelda(parte.fila, parte.columna);
        //Comprueba si el segmento actual es la cabeza
        if (indice === 0) {
            //Agrega la clase CSS correspondiente a la cabeza
            celda.classList.add("snake-head");
        } else {
            //Los demás segmentos reciben la clase del cuerpo
            celda.classList.add("snake");
        }
    });
    //Recorre todas las minas
    minas.forEach(mina => {
        //Obtiene la casilla donde está ubicada cada mina
        const celda = obtenerCelda(mina.fila, mina.columna);
        //Agrega la clase CSS para representar visualmente la mina
        celda.classList.add("mine");
        //Coloca un asterisco como símbolo de la mina
        celda.textContent = "*";
    });
    //Comprueba que exista comida antes de dibujarla
    if (comida !== null) {
        //Obtiene la casilla donde se encuentra la comida
        const celdaComida = obtenerCelda(
            comida.fila,
            comida.columna
        );
        //Agrega la clase CSS que representa la comida
        celdaComida.classList.add("food");
    }
    //Comprueba si ocurrió una explosión
    if (explosion !== null) {
        //Obtiene la casilla donde ocurrió la colisión
        const celdaExplosion = obtenerCelda(
            explosion.fila,
            explosion.columna
        );
        //Agrega la clase CSS para mostrar la explosión
        celdaExplosion.classList.add("explosion");
    }
}

//Controles de movimiento
document.addEventListener("keydown", evento => {
    //Si la partida no está activa, ignora las teclas
    if (!juegoActivo) return;
    //Obtiene la tecla presionada y la convierte a minúsculas
    const tecla = evento.key.toLowerCase();
    //Evita que las teclas de movimiento desplacen la página
    if ([
        "arrowup", "arrowdown", "arrowleft", "arrowright",
        "w", "a", "s", "d"
    ].includes(tecla)) {
        evento.preventDefault();
    }
    //Identifica qué tecla presionó el jugador
    switch (tecla) {
        //Movimiento hacia arriba
        case "arrowup":
        case "w":
            // Evita que la serpiente cambie directamente de abajo hacia arriba
            if (nuevaDireccion.fila !== 1) {
                nuevaDireccion = { fila: -1, columna: 0 };
            }
            break;
        //Movimiento hacia abajo
        case "arrowdown":
        case "s":
            //Evita que la serpiente cambie directamente de arriba hacia abajo
            if (nuevaDireccion.fila !== -1) {
                nuevaDireccion = { fila: 1, columna: 0 };
            }
            break;
        //Movimiento hacia la izquierda
        case "arrowleft":
        case "a":
            //Evita que la serpiente cambie directamente de derecha hacia izquierda.
            if (nuevaDireccion.columna !== 1) {
                nuevaDireccion = { fila: 0, columna: -1 };
            }
            break;
        //Movimiento hacia la derecha
        case "arrowright":
        case "d":
            //Evita que la serpiente cambie directamente de izquierda hacia derecha.
            if (nuevaDireccion.columna !== -1) {
                nuevaDireccion = { fila: 0, columna: 1 };
            }
            break;
    }
});

//Mover serpiente
function moverSerpiente() {
    //Comprueba que la partida siga activa
    if (!juegoActivo) return;
    //Actualiza la dirección con el último movimiento solicitado
    direccion = { ...nuevaDireccion };
    //Obtiene la posición actual de la cabeza
    const cabeza = serpiente[0];
    //Calcula la posición que tendrá la cabeza después de moverse
    const nuevaCabeza = {
        fila: cabeza.fila + direccion.fila,
        columna: cabeza.columna + direccion.columna
    };
    //Comprueba si la nueva posición está fuera de los límites del tablero
    if (
        nuevaCabeza.fila < 0 ||
        nuevaCabeza.fila >= filas ||
        nuevaCabeza.columna < 0 ||
        nuevaCabeza.columna >= columnas
    ) {
        //Finaliza el juego porque la serpiente chocó contra una pared
        terminarJuego("CHOCASTE CONTRA UNA PARED");
        return;
    }
    //Comprueba si la nueva cabeza coincide con alguna mina
    const chocoMina = minas.some(mina =>
        mismaPosicion(mina, nuevaCabeza)
    );
    //Si existe una colisión con una mina
    if (chocoMina) {
        //Guarda la posición de la explosión
        explosion = nuevaCabeza;
        //Finaliza el juego mostrando el mensaje correspondiente
        terminarJuego("PISASTE UNA MINA, HAS PERDIDO");
        return;
    }
    //Comprueba si la nueva cabeza coincide con la comida
    const encontroComida = comida !== null &&
        mismaPosicion(nuevaCabeza, comida);

    //Determina qué partes del cuerpo deben considerarse obstáculos
    //Si come, se mantiene toda la serpiente porque crecerá
    //Si no come, se excluye la cola porque se moverá
    const cuerpo = encontroComida ? serpiente : serpiente.slice(0, -1);
    //Comprueba si la cabeza chocaría contra su propio cuerpo
    const chocoSerpiente = cuerpo.some(parte =>
        mismaPosicion(parte, nuevaCabeza)
    );
    //Si existe una colisión con el cuerpo, termina la partida
    if (chocoSerpiente) {
        terminarJuego("CHOCASTE CONTRA TI MISMO, HAS PERDIDO");
        return;
    }
    //Agrega la nueva cabeza al inicio del arreglo
    //unshift() desplaza los demás segmentos una posición
    serpiente.unshift(nuevaCabeza);
    //Comprueba si la serpiente encontró comida
    if (encontroComida) {
        //Aumenta la puntuación, actualiza las minas y genera otra comida
        comerComida();
    } else {
        //Si no comió, elimina el último segmento
        //Esto permite que la serpiente mantenga su longitud
        serpiente.pop();
    }
    //Actualiza visualmente el tablero con las nuevas posiciones
    actualizarTablero();
}

//comer comida
//Ejecuta las acciones que ocurren cuando la serpiente come
function comerComida() {
    //Aumenta la puntuación en 10 puntos
    puntaje += 10;
    //Actualiza el marcador HTML para mostrar los nuevos puntos
    scoreDisplay.textContent = puntaje;
    //Comprueba si la puntuación alcanzó un múltiplo de 50
    //Si corresponde, agrega nuevas minas
    actualizarMinasPorPuntaje();
    //Genera una nueva comida en otra posición del tablero
    const comidaGenerada = generarComida();
    //Comprueba si fue posible generar otra comida
    if (!comidaGenerada) {
        //Si no existen posiciones disponibles y alcanzables, termina la partida
        terminarJuego("¡No quedan posiciones disponibles para la comida!");
    }
}

//actualizacion de tablero
function actualizarTablero() {
    //Obtiene todas las casillas HTML del tablero
    const celdas = gameBoard.children;
    //Recorre cada casilla para eliminar su apariencia anterior
    for (let i = 0; i < celdas.length; i++) {
        //Elimina las clases CSS de los elementos del juego
        celdas[i].classList.remove(
            "snake",
            "snake-head",
            "food",
            "mine",
            "explosion"
        );
        //Elimina los símbolos anteriores, como el asterisco de las minas
        celdas[i].textContent = "";
    }
    //Vuelve a dibujar los elementos utilizando sus posiciones actuales
    dibujarJuego();
}

//terminar juego
function terminarJuego(mensaje) {
    //Comprueba que el juego todavía esté activo
    //Evita ejecutar la finalización varias veces
    if (!juegoActivo) return;
    //Desactiva la partida para impedir nuevos movimientos
    juegoActivo = false;
    //Detiene el temporizador que controla el movimiento
    clearInterval(intervalo);
    //Elimina la referencia al temporizador
    intervalo = null;
    //Actualiza el tablero para mostrar el estado final
    actualizarTablero();
    //Muestra el título de Game Over
    messageTitle.textContent = "GAME OVER";
    //Muestra el motivo por el que terminó la partida
    messageText.textContent = mensaje;
}

//Reiniciar juego
function reiniciarJuego() {
    //Detiene el temporizador por si todavía está ejecutándose
    clearInterval(intervalo);
    //Limpia la referencia del temporizador
    intervalo = null;
    //Desactiva el juego
    juegoActivo = false;
    //Elimina todas las casillas actuales del tablero
    gameBoard.innerHTML = "";
    //Vacía el arreglo de la serpiente
    serpiente = [];
    //Elimina todas las minas
    minas = [];
    //Elimina la comida actual
    comida = null;
    //Reinicia la puntuación
    puntaje = 0;
    //Actualiza los marcadores HTML
    scoreDisplay.textContent = puntaje;
    mineDisplay.textContent = 0;
    //Elimina cualquier explosión anterior
    explosion = null;
    //Limpia los mensajes de la partida anterior
    messageTitle.textContent = "";
    messageText.textContent = "";
    //Restablece la dirección inicial hacia la derecha
    direccion = { fila: 0, columna: 1 };
    nuevaDireccion = { fila: 0, columna: 1 };
    //Construye un tablero vacío
    //El jugador tendrá que presionar Iniciar para comenzar otra partida
    crearTablero();
}

//Detecta cuando el jugador presiona el botón de iniciar
btn_iniciar.addEventListener("click", iniciarJuego);
//Detecta cuando el jugador presiona el botón de reiniciar
btn_reiniciar.addEventListener("click", reiniciarJuego);
//Construye el tablero vacío automáticamente cuando se carga la página.
crearTablero();