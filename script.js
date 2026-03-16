const frameCount = 151; // total de frames
const img = document.getElementById("fotoAnimacion");
let currentFrame = 1;

// Velocidad de la animación: cuántos frames avanzan/retroceden por scroll
const scrollSpeed = 4; // ajusta a tu gusto

// Contenedor de texto
const textoContenedor = document.getElementById("textoPrincipal");

// ----- 1️⃣ Preload de frames -----
const frames = [];
for (let i = 1; i <= frameCount; i++) {
    const frame = new Image();
    const num = String(i).padStart(4, '0');
    frame.src = `./img/frames/frame${num}.webp`;
    frames.push(frame);
}

// ----- 2️⃣ Función para actualizar el frame y texto -----
function updateFrame() {
    img.src = frames[currentFrame - 1].src;

    // Sincronizar scroll interno del contenedor de texto
    if (textoContenedor) {
        const progress = currentFrame / frameCount;
        const maxScroll = textoContenedor.scrollHeight - textoContenedor.clientHeight;
        textoContenedor.scrollTop = progress * maxScroll;
    }
}

// ----- 3️⃣ Iniciar página -----
window.addEventListener("load", () => {
    window.scrollTo(0, 0);
    currentFrame = 1;
    updateFrame();
});

// Forzar scroll arriba al recargar
window.addEventListener("beforeunload", () => {
    window.scrollTo(0, 0);
});

// ----- 4️⃣ Scroll con ratón -----
window.addEventListener("wheel", (e) => {
    const hero = document.getElementById("hero-container");
    const heroRect = hero.getBoundingClientRect();

    if (e.deltaY > 0) { // Scroll hacia abajo
        if (currentFrame < frameCount && heroRect.bottom > 0) {
            e.preventDefault();
            currentFrame += scrollSpeed;
            if (currentFrame > frameCount) currentFrame = frameCount;
            updateFrame();
        }
    } else if (e.deltaY < 0) { // Scroll hacia arriba
        if (currentFrame > 1 && heroRect.top >= 0) {
            e.preventDefault();
            currentFrame -= scrollSpeed;
            if (currentFrame < 1) currentFrame = 1;
            updateFrame();
        }
    }
}, { passive: false });

// ----- 5️⃣ Scroll táctil en móvil -----
let lastTouchY = 0;

window.addEventListener("touchstart", (e) => {
    lastTouchY = e.touches[0].clientY;
});

window.addEventListener("touchmove", (e) => {
    const touchY = e.touches[0].clientY;
    const delta = lastTouchY - touchY;

    const hero = document.getElementById("hero-container");
    const heroRect = hero.getBoundingClientRect();

    if (delta > 0) { // Scroll hacia abajo
        if (currentFrame < frameCount && heroRect.bottom > 0) {
            e.preventDefault();
            currentFrame += scrollSpeed;
            if (currentFrame > frameCount) currentFrame = frameCount;
            updateFrame();
        }
    } else if (delta < 0) { // Scroll hacia arriba
        if (currentFrame > 1 && heroRect.top >= 0) {
            e.preventDefault();
            currentFrame -= scrollSpeed;
            if (currentFrame < 1) currentFrame = 1;
            updateFrame();
        }
    }

    lastTouchY = touchY;
}, { passive: false });