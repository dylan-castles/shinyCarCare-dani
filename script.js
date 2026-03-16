const frameCount = 151; // total de frames
const img = document.getElementById("fotoAnimacion");
let currentFrame = 1;

// Velocidad de la animación: cuántos frames avanzan/retroceden por scroll
const scrollSpeed = 4; // ajusta a tu gusto

// Contenedor de texto
const textoContenedor = document.getElementById("textoPrincipal");

function updateFrame() {
    const frameNumber = String(currentFrame).padStart(4, '0');
    img.src = `./img/frames/frame${frameNumber}.webp`;

    // Sincronizar scroll interno del contenedor de texto
    if(textoContenedor){
        const progress = currentFrame / frameCount;
        const maxScroll = textoContenedor.scrollHeight - textoContenedor.clientHeight;
        textoContenedor.scrollTop = progress * maxScroll;
    }
}

// Al cargar la página, empezamos arriba y frame inicial
window.addEventListener("load", () => {
    window.scrollTo(0, 0);
    currentFrame = 1;
    updateFrame();
});

// Forzar scroll arriba al recargar
window.addEventListener("beforeunload", () => {
    window.scrollTo(0, 0);
});

// Evento de scroll
window.addEventListener("wheel", (e) => {
    const hero = document.getElementById("hero-container");
    const heroRect = hero.getBoundingClientRect();

    // Scroll hacia abajo
    if (e.deltaY > 0) {
        if (currentFrame < frameCount && heroRect.bottom > 0) {
            e.preventDefault();
            currentFrame += scrollSpeed;
            if (currentFrame > frameCount) currentFrame = frameCount;
            updateFrame();
        }
    }

    // Scroll hacia arriba
    else if (e.deltaY < 0) {
        if (currentFrame > 1 && heroRect.top >= 0) {
            e.preventDefault();
            currentFrame -= scrollSpeed;
            if (currentFrame < 1) currentFrame = 1;
            updateFrame();
        }
    }
}, { passive: false });