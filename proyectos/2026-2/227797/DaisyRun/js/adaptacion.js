const contenedorEscenario = document.querySelector('.escenario-adaptable');
const escenarioOriginal = document.getElementById('juego');

function adaptarEscenario() {
    const escala = contenedorEscenario.clientWidth / 800;
    escenarioOriginal.style.transform = `scale(${escala})`;
    contenedorEscenario.style.height = `${300 * escala}px`;
}

new ResizeObserver(adaptarEscenario).observe(contenedorEscenario);
adaptarEscenario();
