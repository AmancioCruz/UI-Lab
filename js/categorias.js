const listaCategorias = document.querySelector('.pestanas-categorias');
const pestanas = [...listaCategorias.querySelectorAll('[role="tab"]')];

function seleccionarCategoria(pestanaActiva) {
    pestanas.forEach(pestana => {
        const seleccionada = pestana === pestanaActiva;
        pestana.setAttribute('aria-selected', String(seleccionada));
        pestana.tabIndex = seleccionada ? 0 : -1;
        document.getElementById(pestana.getAttribute('aria-controls')).hidden = !seleccionada;
    });
}

pestanas.forEach((pestana, indice) => {
    const panel = document.getElementById(pestana.getAttribute('aria-controls'));
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', pestana.id);
    panel.tabIndex = 0;
    panel.querySelector('h3').hidden = true;

    pestana.addEventListener('click', () => seleccionarCategoria(pestana));
    pestana.addEventListener('keydown', evento => {
        const destinos = {
            ArrowRight: (indice + 1) % pestanas.length,
            ArrowLeft: (indice - 1 + pestanas.length) % pestanas.length,
            Home: 0,
            End: pestanas.length - 1
        };
        if (!(evento.key in destinos)) return;
        evento.preventDefault();
        const siguiente = pestanas[destinos[evento.key]];
        seleccionarCategoria(siguiente);
        siguiente.focus();
    });
});

seleccionarCategoria(pestanas[0]);
listaCategorias.hidden = false;
