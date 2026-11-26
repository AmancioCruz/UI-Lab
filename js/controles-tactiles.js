document.querySelectorAll('[data-tecla]').forEach(boton => {
    let pulsado = false;
    let liberacion = null;
    const emitir = tipo => document.dispatchEvent(new KeyboardEvent(tipo, {
        key: boton.dataset.tecla,
        bubbles: true,
        cancelable: true
    }));

    const presionar = () => {
        if (pulsado) return;
        pulsado = true;
        emitir('keydown');
    };
    const soltar = () => {
        clearTimeout(liberacion);
        if (!pulsado) return;
        pulsado = false;
        emitir('keyup');
    };

    boton.addEventListener('pointerdown', evento => {
        if (evento.button !== 0) return;
        evento.preventDefault();
        boton.setPointerCapture(evento.pointerId);
        presionar();
    });
    boton.addEventListener('pointerup', soltar);
    boton.addEventListener('pointercancel', soltar);
    boton.addEventListener('lostpointercapture', soltar);
    boton.addEventListener('blur', soltar);
    window.addEventListener('blur', soltar);

    boton.addEventListener('keydown', evento => {
        if (!['Enter', ' '].includes(evento.key)) return;
        evento.preventDefault();
        presionar();
    });
    boton.addEventListener('keyup', evento => {
        if (!['Enter', ' '].includes(evento.key)) return;
        evento.preventDefault();
        soltar();
    });
    boton.addEventListener('click', evento => {
        if (evento.detail !== 0 || pulsado) return;
        presionar();
        liberacion = setTimeout(soltar, 200);
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) soltar();
    });
});
