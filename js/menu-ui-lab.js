(() => {
    const archivoComponente = document.currentScript.src;
    const raiz = new URL("../", archivoComponente);

    class MenuUiLab extends HTMLElement {
        constructor() {
            super();

            const contenido = this.attachShadow({ mode: "open" });
            const estilos = document.createElement("link");
            estilos.rel = "stylesheet";
            estilos.href = new URL("css/menu-ui-lab.css", raiz).href;

            const menu = document.createElement("nav");
            menu.setAttribute("aria-label", "Navegación de UI Lab");

            const inicio = document.createElement("a");
            inicio.href = new URL("index.html", raiz).href;
            inicio.setAttribute("aria-label", "Volver al inicio de UI Lab");
            inicio.title = "Volver al inicio de UI Lab";
            inicio.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7"/><path d="M5 9v12h5v-7h4v7h5V9"/></svg>';

            menu.append(inicio);
            contenido.append(estilos, menu);
        }

    }

    if (!customElements.get("menu-ui-lab")) {
        customElements.define("menu-ui-lab", MenuUiLab);
    }

    if (!document.querySelector("menu-ui-lab")) {
        document.body.prepend(document.createElement("menu-ui-lab"));
    }
})();
