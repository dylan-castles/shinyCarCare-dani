// ============================================================
//  CONFIGURACIÓN Y CONSTANTES
// ============================================================

const PRECIOS_DEFAULT = {
  "pack básico": 30,
  "pack premium": 50,
  "pack full": 80,
  "pulido faros": 25,
  "protección hidrofóbica": 20,
  "limpieza tapicerías": 30,
};
const DESCUENTO_DEFAULT = 0;


const API_PRECIOS =
  "https://script.google.com/macros/s/AKfycbzKbrHdjmGKwL42o-GfndjHsrNOT0LR_eST00c5jM9v4TISRonEiP3CRa9asdIt17YoZA/exec";
const API_GALERIAS =
  "https://script.google.com/macros/s/AKfycby8YuzletFhba2HcsMnrDxCuCzrN5S8_V_liAyE2JrIA6hJsD4-DSzirkWGvZZuEs8j/exec";

const GALERIA_MAP = {
  "limpieza exterior": "galeriaLimpiezaExteriorContainer",
  "limpieza interior": "galeriaLimpiezaInteriorContainer",
  detailing: "galeriaDetailingContainer",
};

// ============================================================
//  UTILIDADES
// ============================================================

/** Formatea un número como precio: "29,99€" */
function formatearPrecio(precio) {
  return `${precio.toFixed(2).replace(".", ",")}€`;
}

/** Muestra u oculta el loader global */
function setLoader(visible) {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = visible ? "flex" : "none";
}

// ============================================================
//  LOADER — mostrar al iniciar
// ============================================================

setLoader(true);

// Promesas de carga para ocultar el loader solo cuando TODO esté listo
let resolverPrecios, resolverGalerias;
const promesaPrecios = new Promise((res) => (resolverPrecios = res));
const promesaGalerias = new Promise((res) => (resolverGalerias = res));

promesaPrecios.then(() => setLoader(false));

// ============================================================
//  ANIMACIÓN DE FRAMES (scroll) — sin modificar
// ============================================================

const frameCount = 151;
const img = document.getElementById("fotoAnimacion");
let currentFrame = 1;

const scrollSpeed = 4;

const textoContenedor = document.getElementById("textoPrincipal");

const frames = [];
for (let i = 1; i <= frameCount; i++) {
    const frame = new Image();
    const num = String(i).padStart(4, '0');
    frame.src = `./img/frames/frame${num}.webp`;
    frames.push(frame);
}

function updateFrame() {
    img.src = frames[currentFrame - 1].src;

    if (textoContenedor) {
        const progress = currentFrame / frameCount;
        const maxScroll = textoContenedor.scrollHeight - textoContenedor.clientHeight;
        textoContenedor.scrollTop = progress * maxScroll;
    }
}

window.addEventListener("load", () => {
    window.scrollTo(0, 0);
    currentFrame = 1;
    updateFrame();
});

window.addEventListener("beforeunload", () => {
    window.scrollTo(0, 0);
});

window.addEventListener("wheel", (e) => {
    const hero = document.getElementById("hero-container");
    const heroRect = hero.getBoundingClientRect();

    if (e.deltaY > 0) {
        if (currentFrame < frameCount && heroRect.bottom > 0) {
            e.preventDefault();
            currentFrame += scrollSpeed;
            if (currentFrame > frameCount) currentFrame = frameCount;
            updateFrame();
        }
    } else if (e.deltaY < 0) {
        if (currentFrame > 1 && heroRect.top >= 0) {
            e.preventDefault();
            currentFrame -= scrollSpeed;
            if (currentFrame < 1) currentFrame = 1;
            updateFrame();
        }
    }
}, { passive: false });

let lastTouchY = 0;
let touchAccumulator = 0;

const touchSensitivity = 0.2;

const hero = document.getElementById("hero-container");

hero.addEventListener("touchstart", (e) => {
    lastTouchY = e.touches[0].clientY;
    touchAccumulator = 0;
});

hero.addEventListener("touchmove", (e) => {
    const heroRect = hero.getBoundingClientRect();

    const touchY = e.touches[0].clientY;
    let delta = lastTouchY - touchY;

    touchAccumulator += delta * touchSensitivity;

    const frameThreshold = 1;

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

// ============================================================
//  IMÁGENES DE SERVICIOS (rotación cada 5s)
// ============================================================

const imgExterior = document.getElementById("servicioImgExterior");
const imgInterior = document.getElementById("servicioImgInterior");
const imgDetailing = document.getElementById("servicioImgDetailing");

let estadoServicios = false;

function fadeChange(img, nuevaSrc) {
  if (!img) return;
  img.style.opacity = 0;
  setTimeout(() => {
    img.src = nuevaSrc;
    setTimeout(() => {
      img.style.opacity = 1;
    }, 50);
  }, 1000);
}

// Guardamos la referencia para poder limpiarla si fuera necesario
const intervaloServicios = setInterval(() => {
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

// ============================================================
//  PRECIOS
// ============================================================

function mostrarPrecios(data) {
  const precios = {};
  let descuento = 0;
 
  data.forEach((item) => {
    const tipo = item.Tipo.trim().toLowerCase();
    const precio = item.Precios;
    if (tipo === "descuento") {
      descuento = precio > 1 ? precio / 100 : precio;
    } else {
      precios[tipo] = precio;
    }
  });
 
  // Badge de oferta y precios antiguos
  const badge = document.getElementById("badgeOferta");
  if (badge) badge.style.display = descuento > 0 ? "block" : "none";
 
  const textoOferta = document.getElementById("textoOferta");
  if (textoOferta) textoOferta.textContent = `-${Math.round(descuento * 100)}%`;
 
  // Mostrar u ocultar precios antiguos según haya descuento
  document.querySelectorAll(".precioAntiguo").forEach(el => {
    el.style.display = descuento > 0 ? "block" : "none";
  });
 
  function aplicarDescuento(precio) {
    return parseFloat((precio - precio * descuento).toFixed(2));
  }
 
  function actualizarPrecio(id, precioOriginal) {
    if (precioOriginal == null) return;
    const contenedor = document.getElementById(id);
    if (!contenedor) return;
    const precioFinal = aplicarDescuento(precioOriginal);
    const antiguo = contenedor.parentElement?.querySelector(".precioAntiguo");
    contenedor.textContent = formatearPrecio(precioFinal);
    if (antiguo) antiguo.textContent = formatearPrecio(precioOriginal);
  }
 
  function actualizarSoloPrecio(id, precio) {
    const el = document.getElementById(id);
    if (el && precio != null) el.textContent = formatearPrecio(precio);
  }
 
  actualizarPrecio("precioBasico", precios["pack básico"]);
  actualizarPrecio("precioPremium", precios["pack premium"]);
  actualizarPrecio("precioFull", precios["pack full"]);
 
  actualizarSoloPrecio("precioFaros", precios["pulido faros"]);
  actualizarSoloPrecio("precioHidrofobico", precios["protección hidrofóbica"]);
  actualizarSoloPrecio("precioTapiceria", precios["limpieza tapicerías"]);
}

fetch(API_PRECIOS)
  .then((res) => res.json())
  .then((data) => {
    if (!Array.isArray(data)) throw new Error("Formato inválido");
    mostrarPrecios(data);
  })
  .catch((err) => {
    console.warn("Error API precios, usando fallback:", err);
    const fallback = Object.entries(PRECIOS_DEFAULT).map(([Tipo, Precios]) => ({ Tipo, Precios }));
    fallback.push({ Tipo: "Descuento", Precios: DESCUENTO_DEFAULT });
    mostrarPrecios(fallback);
  })
  .finally(() => resolverPrecios());

// ============================================================
//  GALERÍAS + MODAL
// ============================================================

const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const cerrar = document.querySelector(".cerrar");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

let currentIndex = 0;

function crearMedia(item, onReady) {
  const div = document.createElement("div");
  div.className = "img img-loading";

  if (item.type === "video") {
    const iframe = document.createElement("iframe");
    iframe.src = item.url;
    iframe.allow = "autoplay";
    iframe.allowFullscreen = true;
    iframe.onload = () => {
      div.classList.remove("img-loading");
      if (onReady) onReady();
    };

    div.appendChild(iframe);
  } else {
    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = "";

    img.onload = () => {
      div.classList.remove("img-loading");
      if (onReady) onReady();
    };

    img.onerror = () => {
      div.classList.remove("img-loading");
      div.classList.add("img-error");
      if (onReady) onReady();
    };

    img.src = item.url;
    div.appendChild(img);
  }

  return div;
}

async function cargarGalerias(data) {
  const promises = [];

  for (const [categoria, urls] of Object.entries(data)) {
    // Normalizar clave para comparar sin importar mayúsculas/espacios
    const clave = categoria.trim().toLowerCase();
    const containerId = GALERIA_MAP[clave];

    if (!containerId) {
      console.warn(`Categoría no reconocida en GALERIA_MAP: "${categoria}"`);
      continue;
    }

    const container = document.getElementById(containerId);
    if (!container) continue;

    container.innerHTML = "";

    if (!urls || urls.length === 0) {
      const p = document.createElement("p");
      p.textContent = "No hay imágenes disponibles.";
      container.appendChild(p);
      continue;
    }

    urls.forEach((item) => {
      if (!item || !item.url) return;

      promises.push(new Promise((resolve) => {
        const divImg = crearMedia(item, resolve);
        container.appendChild(divImg);
      }));
    });
  }

  await Promise.all(promises);
  actualizarArrayModal();
}

let mediaArray = [];

function actualizarArrayModal() {
  const items = document.querySelectorAll(".galeriaContainer .img");

  mediaArray = [];

  items.forEach((div) => {
    const img = div.querySelector("img");
    const iframe = div.querySelector("iframe");

    if (img) {
      const index = mediaArray.length; // ✅ índice real
      mediaArray.push({ type: "image", src: img.src });

      img.onclick = () => abrirModal(index);
    } else if (iframe) {
      const index = mediaArray.length; // ✅ índice real
      mediaArray.push({ type: "video", src: iframe.src });

      div.onclick = () => abrirModal(index);
    }
  });
}

function abrirModal(index) {
  modal.style.display = "block";
  currentIndex = index;
  updateModal();
}

function updateModal() {
  if (!modal || mediaArray.length === 0) return;

  const item = mediaArray[currentIndex];

  // Limpiar contenido anterior (clave para parar vídeos)
  modalImg.style.display = "none";

  let existingIframe = modal.querySelector("iframe");
  if (existingIframe) existingIframe.remove();

  if (item.type === "image") {
    modalImg.src = item.src;
    modalImg.style.display = "block";
  } else {
    const iframe = document.createElement("iframe");
    iframe.src = item.src;
    iframe.allow = "autoplay";
    iframe.allowFullscreen = true;

    iframe.style.maxWidth = "80%";
    iframe.style.maxHeight = "80%";
    iframe.style.display = "block";
    iframe.style.margin = "auto";

    modal.appendChild(iframe);
  }

  prevBtn.style.visibility = currentIndex === 0 ? "hidden" : "visible";
  nextBtn.style.visibility =
    currentIndex === mediaArray.length - 1 ? "hidden" : "visible";
}

if (cerrar) cerrar.addEventListener("click", () => { if (modal) modal.style.display = "none"; });
if (prevBtn) prevBtn.addEventListener("click", () => { if (currentIndex > 0) { currentIndex--; updateModal(); } });
if (nextBtn) nextBtn.addEventListener("click", () => { if (currentIndex < mediaArray.length - 1) { currentIndex++; updateModal(); } });
if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

fetch(API_GALERIAS)
  .then((res) => res.json())
  .then((data) => cargarGalerias(data))
  .catch((err) => console.error("Error al cargar imágenes:", err))
  .finally(() => resolverGalerias());

// ============================================================
//  NAVEGACIÓN
// ============================================================

function irAPrecios() {
  const seccion = document.getElementById("seccionPrecios");
  if (seccion) seccion.scrollIntoView({ behavior: "smooth" });
}