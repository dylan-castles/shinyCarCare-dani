const loader = document.getElementById("loader");
if (loader) loader.style.display = "flex"; // mostrar al iniciar

// ------- Precios predefinidos (antes de fetch) -------
const PRECIOS_DEFAULT = {
  "pack básico": 30,
  "pack premium": 50,
  "pack full": 80,
  "pulido faros": 25,
  "protección hidrofóbica": 20,
  "limpieza tapicerías": 30
};
const DESCUENTO_DEFAULT = 0;
// -------------------------------------


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
let touchAccumulator = 0; // acumula el movimiento

const touchSensitivity = 0.2; // factor de sensibilidad: 0.2 = 5x más suave

window.addEventListener("touchstart", (e) => {
    lastTouchY = e.touches[0].clientY;
    touchAccumulator = 0;
});

window.addEventListener("touchmove", (e) => {
    const touchY = e.touches[0].clientY;
    let delta = lastTouchY - touchY;

    // Reducir la sensibilidad
    touchAccumulator += delta * touchSensitivity;

    const hero = document.getElementById("hero-container");
    const heroRect = hero.getBoundingClientRect();

    // Avanzar o retroceder frames solo si se supera un umbral
    const frameThreshold = 1; // 1 pixel acumulado = 1 frame (ajustable)
    while (touchAccumulator >= frameThreshold && currentFrame < frameCount && heroRect.bottom > 0) {
        e.preventDefault();
        currentFrame++;
        updateFrame();
        touchAccumulator -= frameThreshold;
    }

    while (touchAccumulator <= -frameThreshold && currentFrame > 1 && heroRect.top >= 0) {
        e.preventDefault();
        currentFrame--;
        updateFrame();
        touchAccumulator += frameThreshold;
    }

    lastTouchY = touchY;
}, { passive: false });

// ----- 6️⃣ Cambiar imágenes de servicios cada 2s -----

const imgExterior = document.getElementById("servicioImgExterior");
const imgInterior = document.getElementById("servicioImgInterior");
const imgDetailing = document.getElementById("servicioImgDetailing");

let estadoServicios = false;

function fadeChange(img, nuevaSrc){
    img.style.opacity = 0;

    setTimeout(() => {
        img.src = nuevaSrc;

        setTimeout(() => {
            img.style.opacity = 1;
        }, 50); // pequeño delay para que el navegador registre el cambio

    }, 1000); // mismo tiempo que el transition
}

setInterval(() => {

    if (estadoServicios) {
        fadeChange(imgExterior, "./img/capoAvsD.png");
        fadeChange(imgInterior, "./img/asientosAvsD.png");
        fadeChange(imgDetailing, "./img/polishAvsD.png");
    } else {
        fadeChange(imgExterior, "./img/llantasAvsD.png");
        fadeChange(imgInterior, "./img/moquetaAvsD.png");
        fadeChange(imgDetailing, "./img/detailAvsD.png");
    }

    estadoServicios = !estadoServicios;

}, 5000);

const URL = "https://script.google.com/macros/s/AKfycbzKbrHdjmGKwL42o-GfndjHsrNOT0LR_eST00c5jM9v4TISRonEiP3CRa9asdIt17YoZA/exec";

fetch(URL)
  .then(response => response.json())
  .then(data => {
    if (!Array.isArray(data)) {
      throw new Error("Formato inválido");
    }
    mostrarPrecios(data);
    if (loader) loader.style.display = "none"; // ocultar loader al cargar
  })
  .catch(error => {
    console.error("Error API, usando fallback:", error);
    const dataFallback = Object.entries(PRECIOS_DEFAULT).map(([tipo, precio]) => ({
      Tipo: tipo,
      Precios: precio
    }));
    dataFallback.push({
      Tipo: "Descuento",
      Precios: DESCUENTO_DEFAULT
    });
    mostrarPrecios(dataFallback);
    if (loader) loader.style.display = "none"; // ocultar loader aunque falle
  });

function mostrarPrecios(data) {
  let precios = {};
  let descuento = 0;

  // 🔹 1. Guardamos todo en un objeto limpio
  data.forEach(item => {
    const tipo = item.Tipo.trim().toLowerCase(); 
    const precio = item.Precios;

    if (tipo === "descuento") {
      // Si la API devuelve 15 en lugar de 0.15, convertir a decimal
      descuento = precio > 1 ? precio / 100 : precio;
    } else {
      precios[tipo] = precio;
    }
  });

  // 🔹 2. Actualizar badge de oferta
  const badge = document.getElementById("textoOferta");
  if (badge) {
    if (descuento > 0) {
      const porcentaje = Math.round(descuento * 100);
      badge.textContent = `-${porcentaje}%`;
    } else {
      badge.textContent = "OFERTA";
    }
  }

  // 🔹 3. Función para aplicar descuento
  function aplicarDescuento(precio) {
    return parseFloat((precio - precio * descuento).toFixed(2));
  }

  // 🔹 4. Función para actualizar precio con antiguo
  function actualizarPrecio(id, precioOriginal) {
    if (precioOriginal == null) return;
    const contenedor = document.getElementById(id);
    if (!contenedor) return;

    const precioFinal = aplicarDescuento(precioOriginal);

    const antiguo = contenedor.parentElement.querySelector(".precioAntiguo");
    if (contenedor) contenedor.textContent = formatearPrecio(precioFinal);
    if (antiguo) antiguo.textContent = formatearPrecio(precioOriginal);
  }

  // 🔹 5. Extras sin descuento
  function actualizarSoloPrecio(id, precio) {
    const el = document.getElementById(id);
    if (el && precio != null) el.textContent = formatearPrecio(precio);
  }

  // 🔹 6. Pintar precios de packs
  actualizarPrecio("precioBasico", precios["pack básico"]);
  actualizarPrecio("precioPremium", precios["pack premium"]);
  actualizarPrecio("precioFull", precios["pack full"]);

  // 🔹 7. Extras
  actualizarSoloPrecio("precioFaros", precios["pulido faros"]);
  actualizarSoloPrecio("precioHidrofobico", precios["protección hidrofóbica"]);
  actualizarSoloPrecio("precioTapiceria", precios["limpieza tapicerías"]);

  // 🔹 8. Formatear precio
  function formatearPrecio(precio) {
    return `${precio.toFixed(2).replace(".", ",")}€`;
  }
}

function formatearPrecio(precio) {
  return `${precio.toFixed(2).replace(".", ",")}€`;
}

function irAPrecios() {
  const seccion = document.getElementById("seccionPrecios");
  if (seccion) {
    seccion.scrollIntoView({ behavior: "smooth" });
  }
}