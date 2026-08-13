// ======================================================
// DASHBOARD DE PRODUCCIÓN
// ======================================================


// ======================================================
// 01. GOOGLE SHEETS
// ======================================================

const SHEET_ID =
  "1kR5qsAetOMi2Szb4c-gVo3vVhZhwJUC_AgSNI13eluY";

const SHEET_GID =
  "683959855";

const URL_DATOS =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`;


// ======================================================
// 02. VARIABLES
// ======================================================

let datosOriginales = [];

let datosFiltrados = [];

let graficos = {};

let cargando = false;


// ======================================================
// 03. MESES
// ======================================================

const MESES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE"
];


// ======================================================
// 04. COLORES
// ======================================================

const COLORES = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#65a30d",
  "#ea580c",
  "#4f46e5"
];


// ======================================================
// 05. INICIO
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    configurarEventos();

    cargarDatos();

  }
);


// ======================================================
// 06. EVENTOS
// ======================================================

function configurarEventos() {

  const filtros = [
    "filtroSala",
    "filtroMarca",
    "filtroMaquina",
    "filtroJuego",
    "filtroMes",
    "filtroAnio",
    "filtroIndicador"
  ];


  filtros.forEach(id => {

    const elemento =
      document.getElementById(id);

    if (!elemento) return;


    elemento.addEventListener(
      "change",
      manejarCambioFiltro
    );

  });


  const limpiar =
    document.getElementById(
      "btnLimpiar"
    );


  if (limpiar) {

    limpiar.addEventListener(
      "click",
      limpiarFiltros
    );

  }

}


// ======================================================
// 07. CAMBIO DE FILTRO
// ======================================================

function manejarCambioFiltro(evento) {

  const id =
    evento.target.id;


  /*
   * Los filtros principales son dependientes.
   *
   * SALA
   *   ↓
   * MARCA
   *   ↓
   * SERIE
   *   ↓
   * JUEGO
   */


  if (id === "filtroSala") {

    actualizarFiltrosDependientes();

  }


  if (id === "filtroMarca") {

    actualizarFiltrosDependientes();

  }


  if (id === "filtroMaquina") {

    actualizarFiltrosDependientes();

  }


  aplicarFiltros();

}


// ======================================================
// 08. CARGAR DATOS
// ======================================================

async function cargarDatos() {

  if (cargando) return;

  cargando = true;


  cambiarConexion(
    "Conectando con Google Sheets...",
    "#f59e0b"
  );


  try {

    const respuesta =
      await fetch(
        URL_DATOS +
        "&t=" +
        Date.now(),
        {
          cache: "no-store"
        }
      );


    if (!respuesta.ok) {

      throw new Error(
        "Error HTTP " +
        respuesta.status
      );

    }


    const texto =
      await respuesta.text();


    const datos =
      convertirGViz(texto);


    if (
      !Array.isArray(datos) ||
      !datos.length
    ) {

      throw new Error(
        "No se encontraron registros."
      );

    }


    datosOriginales =
      datos;


    datosFiltrados =
      [...datos];


    cambiarConexion(
      "Google Sheets conectado",
      "#16a34a"
    );


    cargarFiltrosIniciales();

    actualizarDashboard();


  } catch (error) {

    console.error(error);


    cambiarConexion(
      "Error al conectar con Google Sheets",
      "#dc2626"
    );

  } finally {

    cargando = false;

  }

}


// ======================================================
// 09. CONVERTIR GVIZ
// ======================================================

function convertirGViz(texto) {

  const inicio =
    texto.indexOf("{");

  const fin =
    texto.lastIndexOf("}");


  if (
    inicio === -1 ||
    fin === -1
  ) {

    throw new Error(
      "Respuesta inválida de Google Sheets."
    );

  }


  const json =
    JSON.parse(
      texto.substring(
        inicio,
        fin + 1
      )
    );


  if (
    !json.table ||
    !json.table.rows
  ) {

    throw new Error(
      "No existe información en la hoja."
    );

  }


  return json.table.rows.map(
    fila => {

      const c =
        fila.c || [];


      return {

        marca:
          obtenerCelda(c, 0),

        maquina:
          obtenerCelda(c, 2),

        juego:
          obtenerCelda(c, 5),

        coin:
          obtenerCelda(c, 7),

        coinProm:
          obtenerCelda(c, 8),

        venta:
          obtenerCelda(c, 9),

        ventaProm:
          obtenerCelda(c, 10),

        netwin:
          obtenerCelda(c, 11),

        pago:
          obtenerCelda(c, 13),

        local:
          obtenerCelda(c, 15),

        mes:
          obtenerCelda(c, 16),

        anio:
          obtenerCelda(c, 17),

        tc:
          obtenerCelda(c, 19)

      };

    }
  );

}


// ======================================================
// 10. OBTENER CELDA
// ======================================================

function obtenerCelda(
  columnas,
  indice
) {

  const celda =
    columnas[indice];


  if (!celda) return "";


  if (
    celda.v !== undefined &&
    celda.v !== null
  ) {

    return celda.v;

  }


  if (
    celda.f !== undefined &&
    celda.f !== null
  ) {

    return celda.f;

  }


  return "";

}


// ======================================================
// 11. CONEXIÓN
// ======================================================

function cambiarConexion(
  texto,
  color
) {

  const textoElemento =
    document.getElementById(
      "textoConexion"
    );

  const punto =
    document.getElementById(
      "indicadorConexion"
    );


  if (textoElemento) {

    textoElemento.textContent =
      texto;

  }


  if (punto) {

    punto.style.background =
      color;

  }

}


// ======================================================
// 12. FILTROS INICIALES
// ======================================================

function cargarFiltrosIniciales() {

  llenarSelect(
    "filtroSala",
    datosOriginales,
    "local",
    "Todas las salas"
  );


  llenarSelect(
    "filtroMarca",
    datosOriginales,
    "marca",
    "Todas las marcas"
  );


  llenarSelect(
    "filtroMaquina",
    datosOriginales,
    "maquina",
    "Todas las series"
  );


  llenarSelect(
    "filtroJuego",
    datosOriginales,
    "juego",
    "Todos los juegos"
  );


  llenarSelect(
    "filtroMes",
    datosOriginales,
    "mes",
    "Todos los meses",
    true
  );


  llenarSelect(
    "filtroAnio",
    datosOriginales,
    "anio",
    "Todos los años",
    false,
    true
  );

}


// ======================================================
// 13. FILTROS DEPENDIENTES
// ======================================================

function actualizarFiltrosDependientes() {

  const sala =
    obtenerValor("filtroSala");

  const marca =
    obtenerValor("filtroMarca");

  const maquina =
    obtenerValor("filtroMaquina");


  let datos =
    [...datosOriginales];


  /*
   * SALA
   */

  if (sala) {

    datos =
      datos.filter(
        r =>
          normalizar(r.local) ===
          normalizar(sala)
      );

  }


  /*
   * MARCA
   */

  llenarSelect(
    "filtroMarca",
    datos,
    "marca",
    "Todas las marcas"
  );


  /*
   * Recuperamos marca seleccionada.
   */

  const marcaActual =
    valorExiste(
      "filtroMarca",
      marca
    )
      ? marca
      : "";


  document.getElementById(
    "filtroMarca"
  ).value =
    marcaActual;


  /*
   * FILTRAR POR MARCA
   */

  if (marcaActual) {

    datos =
      datos.filter(
        r =>
          normalizar(r.marca) ===
          normalizar(marcaActual)
      );

  }


  /*
   * SERIES DISPONIBLES
   */

  llenarSelect(
    "filtroMaquina",
    datos,
    "maquina",
    "Todas las series"
  );


  const maquinaActual =
    valorExiste(
      "filtroMaquina",
      maquina
    )
      ? maquina
      : "";


  document.getElementById(
    "filtroMaquina"
  ).value =
    maquinaActual;


  /*
   * FILTRAR POR SERIE
   */

  if (maquinaActual) {

    datos =
      datos.filter(
        r =>
          normalizar(r.maquina) ===
          normalizar(maquinaActual)
      );

  }


  /*
   * JUEGOS DISPONIBLES
   */

  llenarSelect(
    "filtroJuego",
    datos,
    "juego",
    "Todos los juegos"
  );

}


// ======================================================
// 14. LLENAR SELECT
// ======================================================

function llenarSelect(
  id,
  datos,
  campo,
  textoInicial,
  ordenarMes = false,
  ordenarNumerico = false
) {

  const select =
    document.getElementById(id);


  if (!select) return;


  const valorAnterior =
    select.value;


  select.innerHTML = "";


  const inicial =
    document.createElement(
      "option"
    );


  inicial.value = "";

  inicial.textContent =
    textoInicial;


  select.appendChild(
    inicial
  );


  let valores =
    [
      ...new Set(
        datos
          .map(
            r =>
              limpiarTexto(
                r[campo]
              )
          )
          .filter(Boolean)
      )
    ];


  if (ordenarMes) {

    valores.sort(
      (a, b) =>
        MESES.indexOf(
          normalizarMes(a)
        ) -
        MESES.indexOf(
          normalizarMes(b)
        )
    );

  } else if (ordenarNumerico) {

    valores.sort(
      (a, b) =>
        Number(a) - Number(b)
    );

  } else {

    valores.sort(
      (a, b) =>
        a.localeCompare(
          b,
          "es",
          {
            numeric: true,
            sensitivity: "base"
          }
        )
    );

  }


  valores.forEach(valor => {

    const option =
      document.createElement(
        "option"
      );


    option.value =
      valor;

    option.textContent =
      valor;


    select.appendChild(
      option
    );

  });


  if (
    valores.includes(
      valorAnterior
    )
  ) {

    select.value =
      valorAnterior;

  }

}


// ======================================================
// 15. APLICAR FILTROS
// ======================================================

function aplicarFiltros() {

  const sala =
    obtenerValor("filtroSala");

  const marca =
    obtenerValor("filtroMarca");

  const maquina =
    obtenerValor("filtroMaquina");

  const juego =
    obtenerValor("filtroJuego");

  const mes =
    obtenerValor("filtroMes");

  const anio =
    obtenerValor("filtroAnio");


  datosFiltrados =
    datosOriginales.filter(
      registro => {

        if (
          sala &&
          normalizar(registro.local) !==
          normalizar(sala)
        ) {

          return false;

        }


        if (
          marca &&
          normalizar(registro.marca) !==
          normalizar(marca)
        ) {

          return false;

        }


        if (
          maquina &&
          normalizar(registro.maquina) !==
          normalizar(maquina)
        ) {

          return false;

        }


        if (
          juego &&
          normalizar(registro.juego) !==
          normalizar(juego)
        ) {

          return false;

        }


        if (
          mes &&
          normalizarMes(registro.mes) !==
          normalizarMes(mes)
        ) {

          return false;

        }


        if (
          anio &&
          normalizar(registro.anio) !==
          normalizar(anio)
        ) {

          return false;

        }


        return true;

      }
    );


  actualizarDashboard();

}


// ======================================================
// 16. LIMPIAR
// ======================================================

function limpiarFiltros() {

  [
    "filtroSala",
    "filtroMarca",
    "filtroMaquina",
    "filtroJuego",
    "filtroMes",
    "filtroAnio"
  ].forEach(id => {

    const elemento =
      document.getElementById(id);

    if (elemento) {

      elemento.value = "";

    }

  });


  datosFiltrados =
    [...datosOriginales];


  cargarFiltrosIniciales();

  actualizarDashboard();

}


// ======================================================
// 17. DASHBOARD
// ======================================================

function actualizarDashboard() {

  actualizarKPIs();

  construirGraficos();

  construirTabla();

}


// ======================================================
// 18. KPIs
// ======================================================

function actualizarKPIs() {

  establecerTexto(
    "kpiRegistros",
    formatearEntero(
      datosFiltrados.length
    )
  );


  establecerTexto(
    "kpiSalas",
    cantidadUnica(
      datosFiltrados,
      "local"
    )
  );


  establecerTexto(
    "kpiMarcas",
    cantidadUnica(
      datosFiltrados,
      "marca"
    )
  );


  establecerTexto(
    "kpiMaquinas",
    cantidadUnica(
      datosFiltrados,
      "maquina"
    )
  );


  establecerTexto(
    "kpiJuegos",
    cantidadUnica(
      datosFiltrados,
      "juego"
    )
  );


  establecerTexto(
    "contadorTabla",
    formatearEntero(
      datosFiltrados.length
    )
  );

}


// ======================================================
// 19. INDICADOR
// ======================================================

function obtenerIndicador() {

  const valor =
    obtenerValor(
      "filtroIndicador"
    );


  const mapa = {

    "COIN":
      "coin",

    "COIN PROM":
      "coinProm",

    "VENTA":
      "venta",

    "VENTA PROM":
      "ventaProm",

    "NETWIN ($)":
      "netwin",

    "T.C":
      "tc",

    "% PAGO":
      "pago"

  };


  return mapa[valor] ||
    "coin";

}


// ======================================================
// 20. CONSTRUIR GRÁFICOS
// ======================================================

function construirGraficos() {

  const indicador =
    obtenerIndicador();


  crearRankingSalaMarca(
    indicador
  );


  crearRankingSalaJuego(
    indicador
  );


  crearRankingJuegoMarca(
    indicador
  );


  crearRankingMarcaJuego(
    indicador
  );


  crearEvolucion(
    indicador
  );


  crearRankingMarca(
    indicador
  );

}


// ======================================================
// 21. SALA SEGÚN MARCA
// ======================================================

function crearRankingSalaMarca(
  indicador
) {

  const grupos = {};


  datosFiltrados.forEach(r => {

    const marca =
      texto(r.marca);

    const sala =
      texto(r.local);

    const valor =
      obtenerNumero(
        r[indicador]
      );


    if (
      !marca ||
      !sala ||
      valor === null
    ) return;


    if (!grupos[marca]) {

      grupos[marca] = {};

    }


    grupos[marca][sala] =
      (grupos[marca][sala] || 0) +
      valor;

  });


  const labels = [];

  const valores = [];

  const detalles = [];


  Object.keys(grupos).forEach(
    marca => {

      let mejorSala = "";

      let mejorValor = -Infinity;


      Object.entries(
        grupos[marca]
      ).forEach(
        ([sala, valor]) => {

          if (
            valor > mejorValor
          ) {

            mejorValor = valor;

            mejorSala = sala;

          }

        }
      );


      if (mejorSala) {

        labels.push(
          marca
        );

        valores.push(
          mejorValor
        );

        detalles.push(
          mejorSala
        );

      }

    }
  );


  crearGraficoBarras(
    "graficoSalaMarca",
    labels,
    valores,
    "Mejor sala",
    COLORES[0],
    detalles,
    true
  );

}


// ======================================================
// 22. SALA SEGÚN JUEGO
// ======================================================

function crearRankingSalaJuego(
  indicador
) {

  const grupos = {};


  datosFiltrados.forEach(r => {

    const juego =
      texto(r.juego);

    const sala =
      texto(r.local);

    const valor =
      obtenerNumero(
        r[indicador]
      );


    if (
      !juego ||
      !sala ||
      valor === null
    ) return;


    if (!grupos[juego]) {

      grupos[juego] = {};

    }


    grupos[juego][sala] =
      (grupos[juego][sala] || 0) +
      valor;

  });


  const labels = [];

  const valores = [];

  const detalles = [];


  Object.entries(
    grupos
  ).forEach(
    ([juego, salas]) => {

      let mejorSala = "";

      let mejorValor = -Infinity;


      Object.entries(
        salas
      ).forEach(
        ([sala, valor]) => {

          if (
            valor > mejorValor
          ) {

            mejorValor = valor;

            mejorSala = sala;

          }

        }
      );


      if (mejorSala) {

        labels.push(juego);

        valores.push(
          mejorValor
        );

        detalles.push(
          mejorSala
        );

      }

    }
  );


  ordenarRanking(
    labels,
    valores,
    detalles
  );


  limitarRanking(
    labels,
    valores,
    detalles,
    15
  );


  crearGraficoBarras(
    "graficoSalaJuego",
    labels,
    valores,
    "Mejor sala",
    COLORES[1],
    detalles,
    true
  );

}


// ======================================================
// 23. JUEGO SEGÚN MARCA
// ======================================================

function crearRankingJuegoMarca(
  indicador
) {

  const grupos = {};


  datosFiltrados.forEach(r => {

    const marca =
      texto(r.marca);

    const juego =
      texto(r.juego);

    const valor =
      obtenerNumero(
        r[indicador]
      );


    if (
      !marca ||
      !juego ||
      valor === null
    ) return;


    if (!grupos[marca]) {

      grupos[marca] = {};

    }


    grupos[marca][juego] =
      (grupos[marca][juego] || 0) +
      valor;

  });


  const labels = [];

  const valores = [];

  const detalles = [];


  Object.entries(
    grupos
  ).forEach(
    ([marca, juegos]) => {

      let mejorJuego = "";

      let mejorValor = -Infinity;


      Object.entries(
        juegos
      ).forEach(
        ([juego, valor]) => {

          if (
            valor > mejorValor
          ) {

            mejorValor = valor;

            mejorJuego = juego;

          }

        }
      );


      if (mejorJuego) {

        labels.push(marca);

        valores.push(
          mejorValor
        );

        detalles.push(
          mejorJuego
        );

      }

    }
  );


  crearGraficoBarras(
    "graficoJuegoMarca",
    labels,
    valores,
    "Mejor juego",
    COLORES[2],
    detalles,
    true
  );

}


// ======================================================
// 24. MARCA SEGÚN JUEGO
// ======================================================

function crearRankingMarcaJuego(
  indicador
) {

  const grupos = {};


  datosFiltrados.forEach(r => {

    const juego =
      texto(r.juego);

    const marca =
      texto(r.marca);

    const valor =
      obtenerNumero(
        r[indicador]
      );


    if (
      !juego ||
      !marca ||
      valor === null
    ) return;


    if (!grupos[juego]) {

      grupos[juego] = {};

    }


    grupos[juego][marca] =
      (grupos[juego][marca] || 0) +
      valor;

  });


  const labels = [];

  const valores = [];

  const detalles = [];


  Object.entries(
    grupos
  ).forEach(
    ([juego, marcas]) => {

      let mejorMarca = "";

      let mejorValor = -Infinity;


      Object.entries(
        marcas
      ).forEach(
        ([marca, valor]) => {

          if (
            valor > mejorValor
          ) {

            mejorValor = valor;

            mejorMarca = marca;

          }

        }
      );


      if (mejorMarca) {

        labels.push(juego);

        valores.push(
          mejorValor
        );

        detalles.push(
          mejorMarca
        );

      }

    }
  );


  ordenarRanking(
    labels,
    valores,
    detalles
  );


  limitarRanking(
    labels,
    valores,
    detalles,
    15
  );


  crearGraficoBarras(
    "graficoMarcaJuego",
    labels,
    valores,
    "Mejor marca",
    COLORES[3],
    detalles,
    true
  );

}


// ======================================================
// 25. RANKING GENERAL POR MARCA
// ======================================================

function crearRankingMarca(
  indicador
) {

  const grupos = {};


  datosFiltrados.forEach(r => {

    const marca =
      texto(r.marca);

    const valor =
      obtenerNumero(
        r[indicador]
      );


    if (
      !marca ||
      valor === null
    ) return;


    grupos[marca] =
      (grupos[marca] || 0) +
      valor;

  });


  const datos =
    Object.entries(
      grupos
    )
    .sort(
      (a, b) =>
        b[1] - a[1]
    )
    .slice(0, 15);


  crearGraficoBarras(
    "graficoRankingMarca",
    datos.map(
      x => x[0]
    ),
    datos.map(
      x => x[1]
    ),
    "Rendimiento",
    COLORES[4],
    [],
    false
  );

}


// ======================================================
// 26. EVOLUCIÓN
// ======================================================

function crearEvolucion(
  indicador
) {

  const grupos = {};


  datosFiltrados.forEach(r => {

    const mes =
      normalizarMes(
        r.mes
      );

    const valor =
      obtenerNumero(
        r[indicador]
      );


    if (
      !MESES.includes(mes) ||
      valor === null
    ) return;


    if (!grupos[mes]) {

      grupos[mes] = [];

    }


    grupos[mes].push(
      valor
    );

  });


  const labels =
    MESES.filter(
      mes =>
        grupos[mes] &&
        grupos[mes].length
    );


  const valores =
    labels.map(
      mes =>
        promedio(
          grupos[mes]
        )
    );


  crearGraficoLinea(
    "graficoEvolucion",
    labels,
    valores,
    indicador,
    COLORES[5]
  );

}


// ======================================================
// 27. GRÁFICO DE BARRAS
// ======================================================

function crearGraficoBarras(
  id,
  labels,
  valores,
  etiqueta,
  color,
  detalles = [],
  mostrarDetalle = false
) {

  destruirGrafico(id);


  const canvas =
    document.getElementById(id);


  if (!canvas) return;


  if (!labels.length) {

    mostrarSinDatos(
      canvas
    );

    return;

  }


  graficos[id] =
    new Chart(
      canvas,
      {

        type: "bar",

        data: {

          labels,

          datasets: [

            {

              label:
                etiqueta,

              data:
                valores,

              backgroundColor:
                labels.map(
                  (_, i) =>
                    COLORES[
                      i %
                      COLORES.length
                    ]
                ),

              borderRadius:
                5,

              borderSkipped:
                false,

              maxBarThickness:
                34

            }

          ]

        },


        options: {

          responsive: true,

          maintainAspectRatio: false,

          animation: {
            duration: 350
          },


          interaction: {

            mode: "nearest",

            intersect: true

          },


          onClick: (
            evento,
            elementos
          ) => {

            if (
              !elementos.length
            ) return;


            const indice =
              elementos[0].index;


            if (
              mostrarDetalle &&
              detalles[indice]
            ) {

              seleccionarDesdeGrafico(
                detalles[indice]
              );

            }

          },


          plugins: {

            legend: {
              display: false
            },


            tooltip: {

              callbacks: {

                title: items => {

                  return items[0]
                    .label;

                },


                label: item => {

                  return
                    " " +
                    formatearNumero(
                      item.raw
                    );

                },


                afterTitle: items => {

                  const indice =
                    items[0].dataIndex;


                  if (
                    mostrarDetalle &&
                    detalles[indice]
                  ) {

                    return
                      "Mejor: " +
                      detalles[indice];

                  }

                  return "";

                }

              }

            },


            datalabels: {

              display: true,

              anchor: "end",

              align: "top",

              offset: 3,

              color: "#344054",

              font: {

                size: 9,

                weight: "700"

              },

              formatter:
                valor =>
                  formatearNumero(
                    valor
                  )

            }

          },


          scales: {

            x: {

              grid: {
                display: false
              },

              ticks: {

                color:
                  "#667085",

                font: {
                  size: 9
                },

                autoSkip: false,

                maxRotation: 35,

                minRotation: 0

              }

            },


            y: {

              beginAtZero: true,

              grid: {

                color:
                  "#edf0f4"

              },

              ticks: {

                color:
                  "#667085",

                font: {
                  size: 9
                },

                callback:
                  valor =>
                    formatearNumero(
                      valor
                    )

              }

            }

          }

        },


        plugins: [
          ChartDataLabels
        ]

      }
    );

}


// ======================================================
// 28. GRÁFICO DE LÍNEA
// ======================================================

function crearGraficoLinea(
  id,
  labels,
  valores,
  etiqueta,
  color
) {

  destruirGrafico(id);


  const canvas =
    document.getElementById(id);


  if (!canvas) return;


  if (!labels.length) {

    mostrarSinDatos(
      canvas
    );

    return;

  }


  graficos[id] =
    new Chart(
      canvas,
      {

        type: "line",

        data: {

          labels,

          datasets: [

            {

              label:
                etiqueta,

              data:
                valores,

              borderColor:
                color,

              backgroundColor:
                color,

              pointBackgroundColor:
                "#ffffff",

              pointBorderColor:
                color,

              pointBorderWidth:
                3,

              pointRadius:
                5,

              pointHoverRadius:
                7,

              borderWidth:
                3,

              tension:
                .3,

              fill:
                false

            }

          ]

        },


        options: {

          responsive: true,

          maintainAspectRatio: false,

          animation: {
            duration: 400
          },


          plugins: {

            legend: {

              display: true,

              labels: {

                usePointStyle: true,

                color:
                  "#667085",

                font: {
                  size: 10
                }

              }

            },


            tooltip: {

              callbacks: {

                label:
                  item =>
                    " " +
                    formatearNumero(
                      item.raw
                    )

              }

            },


            datalabels: {

              display: true,

              color:
                "#344054",

              align:
                "top",

              offset: 4,

              font: {

                size: 9,

                weight: "700"

              },

              formatter:
                valor =>
                  formatearNumero(
                    valor
                  )

            }

          },


          scales: {

            x: {

              grid: {
                display: false
              },

              ticks: {

                color:
                  "#667085",

                font: {
                  size: 10
                }

              }

            },


            y: {

              beginAtZero: false,

              grace: "15%",

              grid: {

                color:
                  "#edf0f4"

              },

              ticks: {

                color:
                  "#667085",

                font: {
                  size: 9
                },

                callback:
                  valor =>
                    formatearNumero(
                      valor
                    )

              }

            }

          }

        },


        plugins: [
          ChartDataLabels
        ]

      }
    );

}


// ======================================================
// 29. CLICK EN GRÁFICOS
// ======================================================

function seleccionarDesdeGrafico(
  valor
) {

  const filtros = [
    "filtroSala",
    "filtroMarca",
    "filtroMaquina",
    "filtroJuego"
  ];


  /*
   * Buscamos automáticamente
   * dónde existe el valor.
   */

  for (
    const id of filtros
  ) {

    const select =
      document.getElementById(id);


    if (!select) continue;


    const existe =
      Array.from(
        select.options
      ).some(
        option =>
          normalizar(
            option.value
          ) ===
          normalizar(
            valor
          )
      );


    if (existe) {

      select.value =
        valor;


      if (
        id ===
        "filtroSala"
      ) {

        actualizarFiltrosDependientes();

      }


      if (
        id ===
        "filtroMarca"
      ) {

        actualizarFiltrosDependientes();

      }


      aplicarFiltros();

      break;

    }

  }

}


// ======================================================
// 30. DESTRUIR GRÁFICO
// ======================================================

function destruirGrafico(
  id
) {

  if (graficos[id]) {

    graficos[id].destroy();

    graficos[id] =
      null;

  }

}


// ======================================================
// 31. TABLA
// ======================================================

function construirTabla() {

  const cuerpo =
    document.getElementById(
      "tablaCuerpo"
    );


  if (!cuerpo) return;


  cuerpo.innerHTML = "";


  /*
   * Fragment evita crear
   * repaints innecesarios.
   */

  const fragment =
    document.createDocumentFragment();


  /*
   * Mostramos como máximo
   * todos los registros,
   * pero de manera ligera.
   */

  datosFiltrados.forEach(
    registro => {

      const fila =
        document.createElement(
          "tr"
        );


      fila.innerHTML = `

        <td>${escapar(
          registro.marca
        )}</td>

        <td>${escapar(
          registro.maquina
        )}</td>

        <td>${escapar(
          registro.juego
        )}</td>

        <td>${formatearCelda(
          registro.coin
        )}</td>

        <td>${formatearCelda(
          registro.coinProm
        )}</td>

        <td>${formatearCelda(
          registro.venta
        )}</td>

        <td>${formatearCelda(
          registro.ventaProm
        )}</td>

        <td>${formatearCelda(
          registro.netwin
        )}</td>

        <td>${formatearCelda(
          registro.pago
        )}%</td>

        <td>${escapar(
          registro.local
        )}</td>

        <td>${escapar(
          normalizarMes(
            registro.mes
          )
        )}</td>

        <td>${escapar(
          registro.anio
        )}</td>

        <td>${formatearTC(
          registro.tc
        )}</td>

      `;


      fragment.appendChild(
        fila
      );

    }
  );


  cuerpo.appendChild(
    fragment
  );

}


// ======================================================
// 32. MOSTRAR SIN DATOS
// ======================================================

function mostrarSinDatos(
  canvas
) {

  const contexto =
    canvas.getContext(
      "2d"
    );


  contexto.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  contexto.font =
    "13px Arial";


  contexto.fillStyle =
    "#98a2b3";


  contexto.textAlign =
    "center";


  contexto.fillText(
    "No hay datos para los filtros seleccionados",
    canvas.width / 2,
    canvas.height / 2
  );

}


// ======================================================
// 33. UTILIDADES
// ======================================================

function obtenerValor(id) {

  const elemento =
    document.getElementById(id);


  return elemento
    ? String(
        elemento.value || ""
      ).trim()
    : "";

}


function normalizar(valor) {

  return String(
    valor ?? ""
  )
  .trim()
  .toUpperCase()
  .normalize("NFD")
  .replace(
    /[\u0300-\u036f]/g,
    ""
  );

}


function limpiarTexto(valor) {

  return String(
    valor ?? ""
  ).trim();

}


function texto(valor) {

  return limpiarTexto(
    valor
  );

}


function normalizarMes(valor) {

  const limpio =
    normalizar(valor);


  const numero =
    Number(limpio);


  if (
    Number.isInteger(numero) &&
    numero >= 1 &&
    numero <= 12
  ) {

    return MESES[
      numero - 1
    ];

  }


  const equivalencias = {

    ENE: "ENERO",

    FEB: "FEBRERO",

    MAR: "MARZO",

    ABR: "ABRIL",

    MAY: "MAYO",

    JUN: "JUNIO",

    JUL: "JULIO",

    AGO: "AGOSTO",

    SEP: "SEPTIEMBRE",

    SET: "SEPTIEMBRE",

    OCT: "OCTUBRE",

    NOV: "NOVIEMBRE",

    DIC: "DICIEMBRE"

  };


  return (
    equivalencias[limpio] ||
    limpio
  );

}


// ======================================================
// 34. NÚMEROS
// ======================================================

function obtenerNumero(valor) {

  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {

    return null;

  }


  if (
    typeof valor === "number"
  ) {

    return Number.isFinite(
      valor
    )
      ? valor
      : null;

  }


  let texto =
    String(valor)
      .trim()
      .replace(
        /%/g,
        ""
      );


  if (
    texto.includes(",") &&
    texto.includes(".")
  ) {

    if (
      texto.lastIndexOf(",") >
      texto.lastIndexOf(".")
    ) {

      texto =
        texto
          .replace(
            /\./g,
            ""
          )
          .replace(
            ",",
            "."
          );

    } else {

      texto =
        texto.replace(
          /,/g,
          ""
        );

    }

  } else if (
    texto.includes(",")
  ) {

    const partes =
      texto.split(",");


    if (
      partes.length === 2 &&
      partes[1].length <= 2
    ) {

      texto =
        texto.replace(
          ",",
          "."
        );

    } else {

      texto =
        texto.replace(
          /,/g,
          ""
        );

    }

  }


  texto =
    texto.replace(
      /[^0-9.-]/g,
      ""
    );


  const numero =
    Number(texto);


  return Number.isFinite(
    numero
  )
    ? numero
    : null;

}


// ======================================================
// 35. PROMEDIO
// ======================================================

function promedio(
  valores
) {

  const validos =
    valores.filter(
      valor =>
        Number.isFinite(
          Number(valor)
        )
    );


  if (!validos.length) {

    return 0;

  }


  return validos.reduce(
    (
      total,
      valor
    ) =>
      total +
      Number(valor),
    0
  ) /
  validos.length;

}


// ======================================================
// 36. FORMATEO
// ======================================================

function formatearNumero(
  valor
) {

  return Number(
    valor || 0
  ).toLocaleString(
    "es-PE",
    {
      maximumFractionDigits: 2
    }
  );

}


function formatearCelda(
  valor
) {

  const numero =
    obtenerNumero(
      valor
    );


  if (numero === null) {

    return "-";

  }


  return formatearNumero(
    numero
  );

}


function formatearTC(
  valor
) {

  const numero =
    obtenerNumero(
      valor
    );


  if (numero === null) {

    return "-";

  }


  return numero.toFixed(
    2
  );

}


function formatearEntero(
  valor
) {

  return Number(
    valor || 0
  ).toLocaleString(
    "es-PE"
  );

}


// ======================================================
// 37. CANTIDAD ÚNICA
// ======================================================

function cantidadUnica(
  datos,
  campo
) {

  return new Set(
    datos
      .map(
        r =>
          normalizar(
            r[campo]
          )
      )
      .filter(Boolean)
  ).size;

}


// ======================================================
// 38. COMPROBAR VALOR DE SELECT
// ======================================================

function valorExiste(
  id,
  valor
) {

  if (!valor) return false;


  const select =
    document.getElementById(id);


  if (!select) return false;


  return Array.from(
    select.options
  ).some(
    option =>
      normalizar(
        option.value
      ) ===
      normalizar(
        valor
      )
  );

}


// ======================================================
// 39. ORDENAR RANKING
// ======================================================

function ordenarRanking(
  labels,
  valores,
  detalles
) {

  const combinado =
    labels.map(
      (
        label,
        indice
      ) => ({

        label,

        valor:
          valores[indice],

        detalle:
          detalles[indice]

      })
    );


  combinado.sort(
    (a, b) =>
      b.valor - a.valor
  );


  labels.length = 0;

  valores.length = 0;

  detalles.length = 0;


  combinado.forEach(
    elemento => {

      labels.push(
        elemento.label
      );

      valores.push(
        elemento.valor
      );

      detalles.push(
        elemento.detalle
      );

    }
  );

}


// ======================================================
// 40. LIMITAR RANKING
// ======================================================

function limitarRanking(
  labels,
  valores,
  detalles,
  limite
) {

  labels.splice(
    limite
  );

  valores.splice(
    limite
  );

  detalles.splice(
    limite
  );

}


// ======================================================
// 41. ESCAPAR HTML
// ======================================================

function escapar(
  valor
) {

  return String(
    valor ?? ""
  )
  .replace(
    /&/g,
    "&amp;"
  )
  .replace(
    /</g,
    "&lt;"
  )
  .replace(
    />/g,
    "&gt;"
  )
  .replace(
    /"/g,
    "&quot;"
  )
  .replace(
    /'/g,
    "&#039;"
  );

}


// ======================================================
// 42. ESTABLECER TEXTO
// ======================================================

function establecerTexto(
  id,
  valor
) {

  const elemento =
    document.getElementById(id);


  if (elemento) {

    elemento.textContent =
      valor;

  }

}


// ======================================================
// 43. ACTUALIZACIÓN AUTOMÁTICA
// ======================================================

setInterval(
  () => {

    cargarDatos();

  },
  5 * 60 * 1000
);
