// script.js

// 0. Descripciones de piezas
const descripcionesPiezas = {
  "Aelion.png":
    "Nombre: Aelion, Bretwalda del Sol\n" +
    "Tipo: Pieza Real\n" +
    "Habilidad: Piezas enemigas de Nivel 2 o mayor no pueden moverse a la fila que esta pieza ocupa.",
  "Astrid.png":
    "Nombre: Astrid, Saeta de la Guardia Real\n" +
    "Nivel: 1\n" +
    "Habilidad 1: Si esta pieza es amenazada por una única pieza de Nivel 1, puedes hacer el movimiento consecutivo: mueve esta pieza.\n" +
    "Habilidad 2: Si esta pieza avanza 4 filas, se promociona en Destello Nocturno.",
  "Caidadelcastillo.png":
    "Nombre: Caída del Castillo\n" +
    "Nivel: 2\n" +
    "Habilidad 1: Piezas de Nivel 1 no pueden amenazar a la pieza real defendida.\n" +
    "Habilidad 2: Mueve esta pieza 1 casilla en la dirección de la pieza real, y traslada la pieza real a la posición inicial de esta pieza.",
  "Arwulf.png":
    "Nombre: Arwulf, Honor de la Legión\n" +
    "Nivel: 1\n" +
    "Habilidad 1: Piezas de Nivel 1 que defiendan esta pieza, ganan el movimiento [corredor de dos casillas hacia adelante, movimiento inicial].\n" +
    "Habilidad 2: Si esta pieza avanza 4 filas, se promociona en Huargo Liberado.",
  "Caronus.png":
    "Nombre: Caronus, bibliotecario de Babel\n" +
    "Nivel: 2\n" +
    "Habilidad: Traslada pacíficamente una de tus piezas de Nivel 1 desde tu medio tablero a la casilla defendida.",
   "Destellonocturno.png":
    "Nombre: Destello Nocturno\n" +
    "Nivel: 3\n" +
    "Habilidad: Si esta pieza se desplaza, puedes hacer el movimiento doble: desplaza esta pieza.",
  "Emrys.png":
    "Nombre: Emrys, Druida de los espíritus\n" +
    "Nivel: 2\n" +
    "Habilidad: Coloca la pieza defendida que fue capturada en el turno anterior, en una casilla de inicio apropiada.",
  "Huargoliberado.png":
    "Nombre: Huargo Liberado\n" +
    "Nivel: 3\n" +
    "Habilidad: Si esta pieza cambia de fila, rota 90° en sentido horario.",
   "Ishaco.png":
    "Nombre: Ishaco, Hacha del Caudillo\n" +
    "Nivel: 1\n" +
    "Habilidad 1: Piezas de Nivel 1 que defiendan esta pieza, ganan el movimiento [corredor de dos casillas hacia ambas diagonales delanteras, movimiento inicial].\n" +
    "Habilidad 2: Si esta pieza avanza 4 filas, se promociona en Ishaco, Sombra del Tigre.",
   "Sombradeltigre.png":
    "Nombre: Ishaco, Sombra del Tigre\n" +
    "Nivel: 3\n" +
    "Habilidad: Si esta pieza cambia de fila, rota 90° en sentido antihorario.",
   "Krowain.png":
    "Nombre: Krowain, Fauces de la Horda\n" +
    "Nivel: 1\n" +
    "Habilidad 1: Puedes capturar la pieza amenazada avanzando esta pieza una casilla en diagonal hacia su misma columna.\n" +
    "Habilidad 2: Si esta pieza avanza 3 filas, se promociona en Mandíbula Infernal.",
   "Mandibulainfernal.png":
    "Nombre: Mandíbula Infernal\n" +
    "Nivel: 3\n" +
    "Habilidad: Piezas de Nivel en la fila que esta pieza ocupa, no pueden cambiar de fila.",
   "Pandaria.png":
    "Nombre: Pandaria, Esplendor del Imperio\n" +
    "Tipo: Pieza imperial\n" +
    "Nivel: 3\n" +
    "Habilidad: Piezas de Nivel 3 amenazadas no pueden desplazarse",
   "Quiron.png":
    "Nombre: Quirón, Vigilante del Desierto\n" +
    "Nivel: 2\n" +
    "Habilidad: La pieza amenazada de Nivel 2 debe mover en su próximo turno válido"

};

// 1. Contador global para IDs únicos de piezas
let contadorPiezas = 0;
let piezaSeleccionada = null;
let piezasSeleccionadas = [];
let seleccionando = false;
let rectInicio = null;
let rectDiv = null;

// 2. DOMContentLoaded: inicialización
document.addEventListener("DOMContentLoaded", () => {
  // 2.1 Construir tablero 8x8
  const tablero = document.getElementById("tablero");
  for (let i = 0; i < 64; i++) {
    const celda = document.createElement("div");
    celda.classList.add("celda");
    celda.dataset.index = i;
    celda.addEventListener("dragover", permitirSoltar);
    celda.addEventListener("drop", soltarPieza);
    tablero.appendChild(celda);
  }

  // 2.2 Inicializar piezas del menú
  document.querySelectorAll(".pieza-menu").forEach(pieza => {
    // Asignar tooltip desde descripciones
    const nombreArchivo = pieza.src.split('/').pop();
    pieza.title = descripcionesPiezas[nombreArchivo] || '';
    pieza.addEventListener("dragstart", arrastrarNuevaPieza);
  });

  // 2.3 Abrir y cerrar menú modal
  const abrirMenu = document.getElementById("abrir-menu");
  const cerrarMenu = document.getElementById("cerrar-menu");
  const modal = document.getElementById("menu-modal");

  abrirMenu.addEventListener("click", () => modal.classList.remove("oculto"));
  cerrarMenu.addEventListener("click", () => modal.classList.add("oculto"));
  modal.addEventListener("click", e => {
    if (e.target === modal) modal.classList.add("oculto");
  });

  // 2.4 Paneles de capturas J1 y J2
  [
    { btn: "abrir-capturas-j1", panel: "panel-j1" },
    { btn: "abrir-capturas-j2", panel: "panel-j2" }
  ].forEach(({ btn, panel }) => {
    const botonAbrir = document.getElementById(btn);
    const panelEl = document.getElementById(panel);
    botonAbrir.addEventListener("click", () => panelEl.classList.toggle("oculto"));
    panelEl.querySelector(".cerrar-capturas").addEventListener("click", () => panelEl.classList.add("oculto"));

    const contenedor = panelEl.querySelector(".contenedor-capturas");
    contenedor.addEventListener("dragover", permitirSoltar);
    contenedor.addEventListener("drop", soltarPieza);
  });
});

// Permitir que un elemento reciba drop
function permitirSoltar(e) {
  e.preventDefault();
}

// Arrastrar una pieza nueva desde el menú
function arrastrarNuevaPieza(e) {
  e.dataTransfer.setData("src", e.target.src);

  // Crear clon temporal con ID único y tooltip
  const clon = document.createElement("img");
  clon.src = e.target.src;
  clon.id = `pieza_${contadorPiezas++}`;
  clon.classList.add("pieza");
  const nombreArchivo = clon.src.split('/').pop();
  clon.title = descripcionesPiezas[nombreArchivo] || '';
  hacerArrastrable(clon);
  document.body.appendChild(clon);

  // Reiniciar evento dragstart en el clon
  const dragEvent = new DragEvent('dragstart', { dataTransfer: e.dataTransfer });
  clon.dispatchEvent(dragEvent);
}

// Arrastrar una pieza existente (tablero o capturas)
function arrastrarExistente(e) {
  e.dataTransfer.setData("src", e.target.src);
  e.dataTransfer.setData("id", e.target.id);
}

// Soltar una pieza en celda o zona de capturas
function soltarPieza(e) {
  e.preventDefault();
  const src = e.dataTransfer.getData("src");
  const id = e.dataTransfer.getData("id");
  let pieza;

  if (id) {
    // Mover existente
    pieza = document.getElementById(id);
  } else if (src) {
    // Crear nueva y asignar tooltip
    pieza = document.createElement("img");
    pieza.src = src;
    pieza.id = `pieza_${contadorPiezas++}`;
    pieza.classList.add("pieza");
    const nombreArchivo = src.split('/').pop();
    pieza.title = descripcionesPiezas[nombreArchivo] || '';
  }
  if (!pieza) return;

  if (e.currentTarget.classList.contains("celda")) {
    if (e.currentTarget.children.length === 0) {
      hacerArrastrable(pieza);
      e.currentTarget.appendChild(pieza);
    }
    return;
  }

  if (e.currentTarget.classList.contains("contenedor-capturas")) {
    hacerArrastrable(pieza);
    e.currentTarget.appendChild(pieza);
  }
}

// Función para hacer piezas arrastrables
function hacerArrastrable(pieza) {
  pieza.draggable = true;
  pieza.addEventListener("dragstart", arrastrarExistente);
}

// Menú contextual y selección múltiple
const menu = document.getElementById("context-menu");

document.addEventListener("contextmenu", e => {
  // Selección múltiple sobre celdas
  if (e.button === 2 && e.target.classList.contains("celda")) {
    e.preventDefault(); seleccionando = true; rectInicio = { x: e.pageX, y: e.pageY };
    rectDiv = document.createElement("div"); rectDiv.id = "selector-rect";
    rectDiv.style.left = `${rectInicio.x}px`; rectDiv.style.top = `${rectInicio.y}px`;
    document.body.appendChild(rectDiv); return;
  }
  // Menú para pieza individual
  if (e.target.classList.contains("pieza")) {
    e.preventDefault(); piezaSeleccionada = e.target;
    menu.style.top = `${e.pageY}px`; menu.style.left = `${e.pageX}px`;
    menu.classList.remove("oculto");
  } else cerrarMenuContextual();
});

document.addEventListener("mousemove", e => {
  if (!seleccionando || !rectDiv) return;
  const x1 = Math.min(rectInicio.x, e.pageX), y1 = Math.min(rectInicio.y, e.pageY);
  const x2 = Math.max(rectInicio.x, e.pageX), y2 = Math.max(rectInicio.y, e.pageY);
  rectDiv.style.left = `${x1}px`; rectDiv.style.top = `${y1}px`;
  rectDiv.style.width = `${x2 - x1}px`; rectDiv.style.height = `${y2 - y1}px`;
});

document.addEventListener("mouseup", e => {
  if (seleccionando && e.button === 2) {
    seleccionando = false; piezasSeleccionadas = [];
    document.querySelectorAll(".pieza").forEach(p => {
      const rP = p.getBoundingClientRect(), r = rectDiv.getBoundingClientRect();
      if (rP.right > r.left && rP.left < r.right && rP.bottom > r.top && rP.top < r.bottom) piezasSeleccionadas.push(p);
    });
    rectDiv.remove(); rectDiv = null;
    if (piezasSeleccionadas.length) {
      menu.style.top = `${e.pageY}px`; menu.style.left = `${e.pageX}px`;
      menu.classList.remove("oculto");
    }
  }
});

// Manejar acciones del menú (varias o única)
menu.addEventListener("click", e => {
  e.stopPropagation(); const li = e.target.closest("li"); if (!li) return;
  const action = li.dataset.action;
  const targets = piezasSeleccionadas.length ? piezasSeleccionadas : (piezaSeleccionada ? [piezaSeleccionada] : []);
  targets.forEach(p => {
    switch(action) {
      case "rotar-sh": let r1 = (parseInt(p.dataset.rotation)||0)+90; p.dataset.rotation = r1%360; p.style.transform=`rotate(${r1}deg)`; break;
      case "rotar-sa": let r2 = (parseInt(p.dataset.rotation)||0)-90; p.dataset.rotation=(r2+360)%360; p.style.transform=`rotate(${r2}deg)`; break;
      case "eliminar": p.remove(); break;
    }
  }); cerrarMenuContextual();
});

// Submenu colores
document.querySelectorAll(".submenu-opciones li").forEach(li=>{
  li.addEventListener("click", e=>{ e.stopPropagation(); const color=li.dataset.color;
    const targets = piezasSeleccionadas.length ? piezasSeleccionadas : (piezaSeleccionada?[piezaSeleccionada]:[]);
    targets.forEach(p=>{ p.classList.remove("borde-negro","borde-rojo","borde-azul"); if(color!="ninguno") p.classList.add(`borde-${color}`); });
    cerrarMenuContextual();
  });
});

document.addEventListener("click", cerrarMenuContextual);
function cerrarMenuContextual(){ menu.classList.add("oculto"); piezaSeleccionada=null; piezasSeleccionadas=[]; }