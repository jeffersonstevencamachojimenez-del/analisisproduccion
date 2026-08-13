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
// 04. CONFIGURACIÓN INDICADORES
// ======================================================

const INDICADORES = {

  "COIN": {
    campo: "COIN",
    tipo: "total"
  },

  "COIN PROM": {
    campo: "COIN PROM",
    tipo: "promedio"
  },

  "VENTA": {
    campo: "VENTA",
    tipo: "total"
  },

  "VENTA PROM": {
    campo: "VENTA PROM",
    tipo: "promedio"
  },

  "NETWIN ($)": {
    campo: "NETWIN ($)",
    tipo: "total"
  },

  "T.C": {
    campo: "T.C",
    tipo: "promedio"
  },

  "% PAGO": {
    campo: "% PAGO",
    tipo: "promedio"
  }

};


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
    "filtroModelo",
    "filtroNumero",
    "filtroJuego",
    "filtroMes",
    "filtroIndicador"

  ];


  filtros.forEach(
    id => {

      const elemento =
        document.getElementById(id);


      if (!elemento) return;


      elemento.addEventListener(
        "change",
        manejarCambioFiltro
      );

    }
  );


  document
    .getElementById("btnLimpiar")
    ?.addEventListener(
      "click",
      limpiarFiltros
    );


  document
    .getElementById("btnActualizar")
    ?.addEventListener(
      "click",
      cargarDatos
    );

}


// ======================================================
// 07. CAMBIO DE FILTRO
// ======================================================

function manejarCambioFiltro(evento) {

  const id =
    evento.target.id;


  if (
    id === "filtroIndicador"
  ) {

    aplicarFiltros();

    return;

  }


  aplicarFiltros();

}


// ======================================================
// 08. CARGAR DATOS
// ======================================================

async function cargarDatos() {

  if (cargando) return;

  cargando = true;


  cambiarEstadoConexion(
    "Conectando con Google Sheets...",
    "#f59e0b"
  );


  try {

    const respuesta =
      await fetch(
        URL_DATOS +
        "&t=" +
        Date.now()
      );


    if (!respuesta.ok) {

      throw new Error(
        "HTTP " +
        respuesta.status
      );

    }


    const texto =
      await respuesta.text();


    const datos =
      convertirGViz(texto);


    if (
      !Array.isArray(datos) ||
      datos.length === 0
    ) {

      throw new Error(
        "No se encontraron registros."
      );

    }


    datosOriginales =
      datos;


    datosFiltrados =
      [...datosOriginales];


    cambiarEstadoConexion(
      "Google Sheets conectado",
      "#16a34a"
    );


    llenarTodosLosFiltros();


    actualizarDashboard();


  } catch (error) {

    console.error(error);


    cambiarEstadoConexion(
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
      "Respuesta GViz inválida."
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
      "No se encontraron filas."
    );

  }


  return json.table.rows.map(
    fila => {

      const c =
        fila.c || [];


      return {

        "Marca / Tipo / Version":
          obtenerCelda(c, 0),

        "Maquina":
          obtenerCelda(c, 2),

        "Juego":
          obtenerCelda(c, 5),

        "COIN":
          obtenerCelda(c, 7),

        "COIN PROM":
          obtenerCelda(c, 8),

        "VENTA":
          obtenerCelda(c, 9),

        "VENTA PROM":
          obtenerCelda(c, 10),

        "NETWIN ($)":
          obtenerCelda(c, 11),

        "G.PLAYED":
          obtenerCelda(c, 12),

        "% PAGO":
          obtenerCelda(c, 13),

        "LOCAL":
          obtenerCelda(c, 15),

        "MES":
          obtenerCelda(c, 16),

        "AÑO":
          obtenerCelda(c, 17),

        "T.C":
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


  if (!celda) {

    return "";

  }


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
// 11. ESTADO
// ======================================================

function cambiarEstadoConexion(
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

function llenarTodosLosFiltros() {

  actualizarFiltrosDependientes();

  llenarFiltroMes();

}


// ======================================================
// 13. FILTROS DEPENDIENTES
// ======================================================

function actualizarFiltrosDependientes() {

  const sala =
    obtenerValor("filtroSala");


  const modelo =
    obtenerValor("filtroModelo");


  const serie =
    obtenerValor("filtroNumero");


  const juego =
    obtenerValor("filtroJuego");


  const baseSala =
    datosOriginales.filter(
      r =>
        !sala ||
        limpiarTexto(r["LOCAL"]) ===
        limpiarTexto(sala)
    );


  llenarSelectDesdeDatos(
    "filtroSala",
    baseSala,
    "LOCAL",
    "Todas las salas"
  );


  const baseModelo =
    datosOriginales.filter(
      r =>
        (!sala ||
          limpiarTexto(r["LOCAL"]) ===
          limpiarTexto(sala))
    );


  llenarSelectDesdeDatos(
    "filtroModelo",
    baseModelo,
    "Marca / Tipo / Version",
    "Todas las marcas"
  );


  const baseSerie =
    datosOriginales.filter(
      r =>
        (!sala ||
          limpiarTexto(r["LOCAL"]) ===
          limpiarTexto(sala)) &&

        (!modelo ||
          limpiarTexto(
            r["Marca / Tipo / Version"]
          ) ===
          limpiarTexto(modelo))
    );


  llenarSelectDesdeDatos(
    "filtroNumero",
    baseSerie,
    "Maquina",
    "Todas las series"
  );


  const baseJuego =
    datosOriginales.filter(
      r =>
        (!sala ||
          limpiarTexto(r["LOCAL"]) ===
          limpiarTexto(sala)) &&

        (!modelo ||
          limpiarTexto(
            r["Marca / Tipo / Version"]
          ) ===
          limpiarTexto(modelo)) &&

        (!serie ||
          limpiarTexto(r["Maquina"]) ===
          limpiarTexto(serie))
    );


  llenarSelectDesdeDatos(
    "filtroJuego",
    baseJuego,
    "Juego",
    "Todos los juegos"
  );


  restaurarValoresFiltros();

}


// ======================================================
// 14. LLENAR SELECT
// ======================================================

function llenarSelectDesdeDatos(
  id,
  datos,
  campo,
  textoInicial
) {

  const select =
    document.getElementById(id);


  if (!select) return;


  const valorActual =
    select.value;


  const valores =
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


  valores.forEach(
    valor => {

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

    }
  );


  if (
    valores.includes(
      limpiarTexto(valorActual)
    )
  ) {

    select.value =
      limpiarTexto(valorActual);

  }

}


// ======================================================
// 15. RESTAURAR FILTROS
// ======================================================

function restaurarValoresFiltros() {

  [
    "filtroSala",
    "filtroModelo",
    "filtroNumero",
    "filtroJuego"
  ].forEach(
    id => {

      const elemento =
        document.getElementById(id);


      if (!elemento) return;


      const valor =
        elemento.dataset.valor;


      if (valor) {

        elemento.value =
          valor;

      }

    }
  );

}


// ======================================================
// 16. MES
// ======================================================

function llenarFiltroMes() {

  const select =
    document.getElementById(
      "filtroMes"
    );


  if (!select) return;


  const valorActual =
    select.value;


  select.innerHTML = "";


  const inicial =
    document.createElement(
      "option"
    );


  inicial.value = "";

  inicial.textContent =
    "Todos los meses";


  select.appendChild(
    inicial
  );


  MESES.forEach(
    mes => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        mes;

      option.textContent =
        mes;


      select.appendChild(
        option
      );

    }
  );


  if (
    MESES.includes(
      valorActual
    )
  ) {

    select.value =
      valorActual;

  }

}


// ======================================================
// 17. APLICAR FILTROS
// ======================================================

function aplicarFiltros() {

  const sala =
    obtenerValor(
      "filtroSala"
    );


  const modelo =
    obtenerValor(
      "filtroModelo"
    );


  const serie =
    obtenerValor(
      "filtroNumero"
    );


  const juego =
    obtenerValor(
      "filtroJuego"
    );


  const mes =
    obtenerValor(
      "filtroMes"
    );


  datosFiltrados =
    datosOriginales.filter(
      registro => {

        if (
          sala &&
          limpiarTexto(
            registro["LOCAL"]
          ) !==
          limpiarTexto(sala)
        ) {

          return false;

        }


        if (
          modelo &&
          limpiarTexto(
            registro[
              "Marca / Tipo / Version"
            ]
          ) !==
          limpiarTexto(modelo)
        ) {

          return false;

        }


        if (
          serie &&
          limpiarTexto(
            registro["Maquina"]
          ) !==
          limpiarTexto(serie)
        ) {

          return false;

        }


        if (
          juego &&
          limpiarTexto(
            registro["Juego"]
          ) !==
          limpiarTexto(juego)
        ) {

          return false;

        }


        if (
          mes &&
          normalizarMes(
            registro["MES"]
          ) !==
          normalizarMes(mes)
        ) {

          return false;

        }


        return true;

      }
    );


  actualizarFiltrosDependientes();

  actualizarDashboard();

}


// ======================================================
// 18. LIMPIAR
// ======================================================

function limpiarFiltros() {

  [
    "filtroSala",
    "filtroModelo",
    "filtroNumero",
    "filtroJuego",
    "filtroMes"
  ].forEach(
    id => {

      const elemento =
        document.getElementById(id);


      if (elemento) {

        elemento.value = "";

      }

    }
  );


  datosFiltrados =
    [...datosOriginales];


  actualizarFiltrosDependientes();

  actualizarDashboard();

}


// ======================================================
// 19. DASHBOARD
// ======================================================

function actualizarDashboard() {

  actualizarResumen();

  actualizarTextoSeleccion();

  construirGraficos();

  construirTabla();

}


// ======================================================
// 20. RESUMEN
// ======================================================

function actualizarResumen() {

  establecerTexto(
    "contadorResultados",
    formatearNumero(
      datosFiltrados.length,
      0
    )
  );


  establecerTexto(
    "resumenSalas",
    contarUnicos(
      datosFiltrados,
      "LOCAL"
    )
  );


  establecerTexto(
    "resumenMarcas",
    contarUnicos(
      datosFiltrados,
      "Marca / Tipo / Version"
    )
  );


  establecerTexto(
    "resumenJuegos",
    contarUnicos(
      datosFiltrados,
      "Juego"
    )
  );


  const indicador =
    obtenerIndicador();


  establecerTexto(
    "resumenIndicador",
    indicador
  );


  establecerTexto(
    "indicadorSeleccionado",
    indicador
  );

}


// ======================================================
// 21. TEXTO DE SELECCIÓN
// ======================================================

function actualizarTextoSeleccion() {

  const indicador =
    obtenerIndicador();


  const partes = [];


  const sala =
    obtenerValor("filtroSala");


  const modelo =
    obtenerValor("filtroModelo");


  const serie =
    obtenerValor("filtroNumero");


  const juego =
    obtenerValor("filtroJuego");


  const mes =
    obtenerValor("filtroMes");


  if (sala)
    partes.push(
      "Sala: " + sala
    );


  if (modelo)
    partes.push(
      "Marca: " + modelo
    );


  if (serie)
    partes.push(
      "Serie: " + serie
    );


  if (juego)
    partes.push(
      "Juego: " + juego
    );


  if (mes)
    partes.push(
      "Mes: " + mes
    );


  establecerTexto(
    "tituloAnalisis",
    indicador
  );


  establecerTexto(
    "detalleSeleccion",
    partes.length
      ? partes.join("  •  ")
      : "Todos los registros"
  );

}


// ======================================================
// 22. GRÁFICOS
// ======================================================

function construirGraficos() {

  const indicador =
    obtenerIndicador();


  construirEvolutivo(
    indicador
  );


  construirRanking(
    "graficoSalas",
    "LOCAL",
    indicador,
    "#2563eb"
  );


  construirRanking(
    "graficoJuegos",
    "Juego",
    indicador,
    "#7c3aed"
  );


  construirRanking(
    "graficoMarcas",
    "Marca / Tipo / Version",
    indicador,
    "#059669"
  );

}


// ======================================================
// 23. EVOLUTIVO
// ======================================================

function construirEvolutivo(
  indicador
) {

  const resumen =
    agruparPorMes(
      datosFiltrados,
      indicador
    );


  const labels =
    resumen.map(
      x => x.nombre
    );


  const valores =
    resumen.map(
      x => x.valor
    );


  crearOActualizarGrafico(
    "graficoEvolutivo",
    "line",
    labels,
    valores,
    "#2563eb",
    indicador,
    true
  );

}


// ======================================================
// 24. RANKING
// ======================================================

function construirRanking(
  id,
  campo,
  indicador,
  color
) {

  const grupos =
    {};


  datosFiltrados.forEach(
    registro => {

      const nombre =
        limpiarTexto(
          registro[campo]
        );


      if (!nombre) return;


      if (!grupos[nombre]) {

        grupos[nombre] = [];

      }


      const valor =
        obtenerNumero(
          registro[
            INDICADORES[indicador].campo
          ]
        );


      if (
        valor !== null
      ) {

        grupos[nombre].push(
          valor
        );

      }

    }
  );


  const datos =
    Object.keys(grupos)
      .map(
        nombre => {

          return {

            nombre,

            valor:
              INDICADORES[indicador].tipo ===
              "promedio"

                ? promedioArray(
                    grupos[nombre]
                  )

                : grupos[nombre].reduce(
                    (
                      a,
                      b
                    ) =>
                      a + b,
                    0
                  )

          };

        }
      )
      .sort(
        (
          a,
          b
        ) =>
          b.valor -
          a.valor
      );


  const maximo =
    30;


  const visibles =
    datos.slice(
      0,
      maximo
    );


  const labels =
    visibles.map(
      x =>
        abreviarEtiqueta(
          x.nombre
        )
    );


  const valores =
    visibles.map(
      x =>
        x.valor
    );


  crearOActualizarGrafico(
    id,
    "bar",
    labels,
    valores,
    color,
    indicador,
    false,
    visibles
  );

}


// ======================================================
// 25. CREAR / ACTUALIZAR GRÁFICO
// ======================================================

function crearOActualizarGrafico(
  id,
  tipo,
  labels,
  valores,
  color,
  indicador,
  mostrarPuntos,
  metadata = []
) {

  const canvas =
    document.getElementById(id);


  if (!canvas) return;


  if (
    graficos[id]
  ) {

    graficos[id].destroy();

  }


  graficos[id] =
    new Chart(
      canvas,
      {

        type: tipo,


        data: {

          labels,

          datasets: [

            {

              label:
                indicador,

              data:
                valores,

              borderColor:
                color,

              backgroundColor:
                tipo === "bar"
                  ? color
                  : color,

              borderWidth:
                2,

              borderRadius:
                tipo === "bar"
                  ? 5
                  : 0,

              pointRadius:
                mostrarPuntos
                  ? 4
                  : 0,

              pointHoverRadius:
                7,

              tension:
                0.28,

              fill:
                false

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

            mode:
              "nearest",

            intersect:
              true

          },


          plugins: {

            legend: {

              display: false

            },


            tooltip: {

              displayColors:
                false,

              callbacks: {

                title:
                  function (
                    elementos
                  ) {

                    if (
                      !elementos.length
                    ) return "";


                    const indice =
                      elementos[0].dataIndex;


                    if (
                      metadata[indice]
                    ) {

                      return metadata[
                        indice
                      ].nombre;

                    }


                    return labels[indice];

                  },


                label:
                  function (
                    contexto
                  ) {

                    return (
                      indicador +
                      ": " +
                      formatearIndicador(
                        contexto.parsed.y,
                        indicador
                      )
                    );

                  }

              }

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

                maxRotation:
                  45,

                minRotation:
                  0,

                autoSkip:
                  true,

                maxTicksLimit:
                  15,

                font: {

                  size: 10

                }

              }

            },


            y: {

              beginAtZero:
                true,

              grid: {

                color:
                  "#edf0f4"

              },

              ticks: {

                color:
                  "#667085",

                font: {

                  size: 10

                },

                callback:
                  function (
                    valor
                  ) {

                    return formatearNumero(
                      valor
                    );

                  }

              }

            }

          },


          onClick:
            function (
              evento,
              elementos
            ) {

              if (
                !elementos.length
              ) return;


              const indice =
                elementos[0].index;


              const elemento =
                metadata[indice]
                ? metadata[indice].nombre
                : labels[indice];


              const valor =
                valores[indice];


              mostrarDetalleClick(
                elemento,
                valor,
                indicador
              );

            }

        }

      }
    );

}


// ======================================================
// 26. AGRUPAR POR MES
// ======================================================

function agruparPorMes(
  datos,
  indicador
) {

  const grupos =
    {};


  datos.forEach(
    registro => {

      const mes =
        normalizarMes(
          registro["MES"]
        );


      if (
        !MESES.includes(mes)
      ) return;


      if (!grupos[mes]) {

        grupos[mes] = [];

      }


      const valor =
        obtenerNumero(
          registro[
            INDICADORES[indicador].campo
          ]
        );


      if (
        valor !== null
      ) {

        grupos[mes].push(
          valor
        );

      }

    }
  );


  return MESES

    .filter(
      mes =>
        grupos[mes] &&
        grupos[mes].length
    )

    .map(
      mes => {

        return {

          nombre: mes,

          valor:
            INDICADORES[indicador].tipo ===
            "promedio"

              ? promedioArray(
                  grupos[mes]
                )

              : grupos[mes].reduce(
                  (
                    a,
                    b
                  ) =>
                    a + b,
                  0
                )

        };

      }
    );

}


// ======================================================
// 27. TABLA COMPLETA
// ======================================================

function construirTabla() {

  const cuerpo =
    document.getElementById(
      "tablaCompletaCuerpo"
    );


  if (!cuerpo) return;


  const fragmento =
    document.createDocumentFragment();


  datosFiltrados.forEach(
    registro => {

      const fila =
        document.createElement(
          "tr"
        );


      const columnas = [

        registro[
          "Marca / Tipo / Version"
        ],

        registro[
          "Maquina"
        ],

        registro[
          "Juego"
        ],

        registro[
          "COIN"
        ],

        registro[
          "COIN PROM"
        ],

        registro[
          "VENTA"
        ],

        registro[
          "VENTA PROM"
        ],

        registro[
          "NETWIN ($)"
        ],

        registro[
          "G.PLAYED"
        ],

        registro[
          "% PAGO"
        ],

        registro[
          "LOCAL"
        ],

        registro[
          "MES"
        ],

        registro[
          "AÑO"
        ],

        registro[
          "T.C"
        ]

      ];


      columnas.forEach(
        (
          valor,
          indice
        ) => {

          const td =
            document.createElement(
              "td"
            );


          if (
            indice >= 3 &&
            indice <= 9 ||
            indice === 13
          ) {

            const numero =
              obtenerNumero(
                valor
              );


            td.textContent =
              numero === null
                ? ""
                : formatearIndicador(
                    numero,
                    [
                      "COIN",
                      "COIN PROM",
                      "VENTA",
                      "VENTA PROM",
                      "NETWIN ($)",
                      "G.PLAYED",
                      "% PAGO",
                      "T.C"
                    ][
                      indice - 3
                    ] || ""
                  );

          } else {

            td.textContent =
              valor ?? "";

          }


          fila.appendChild(
            td
          );

        }
      );


      fragmento.appendChild(
        fila
      );

    }
  );


  cuerpo.innerHTML = "";

  cuerpo.appendChild(
    fragmento
  );

}


// ======================================================
// 28. CLICK EN GRÁFICO
// ======================================================

function mostrarDetalleClick(
  elemento,
  valor,
  indicador
) {

  establecerTexto(
    "elementoSeleccionado",
    elemento
  );


  establecerTexto(
    "valorSeleccionado",
    formatearIndicador(
      valor,
      indicador
    )
  );


  establecerTexto(
    "indicadorSeleccionado",
    indicador
  );

}


// ======================================================
// 29. INDICADOR
// ======================================================

function obtenerIndicador() {

  const select =
    document.getElementById(
      "filtroIndicador"
    );


  return (
    select?.value ||
    "COIN"
  );

}


// ======================================================
// 30. VALOR SELECT
// ======================================================

function obtenerValor(id) {

  return String(
    document.getElementById(
      id
    )?.value || ""
  ).trim();

}


// ======================================================
// 31. TEXTO
// ======================================================

function limpiarTexto(valor) {

  if (
    valor === null ||
    valor === undefined
  ) {

    return "";

  }


  return String(valor)
    .trim()
    .toUpperCase();

}


// ======================================================
// 32. MES
// ======================================================

function normalizarMes(valor) {

  if (
    valor === null ||
    valor === undefined
  ) {

    return "";

  }


  let texto =
    String(valor)
      .trim()
      .toUpperCase();


  texto =
    texto
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      );


  const numero =
    Number(texto);


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
    equivalencias[texto] ||
    texto
  );

}


// ======================================================
// 33. NÚMERO
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
// 34. PROMEDIO
// ======================================================

function promedioArray(
  valores
) {

  if (
    !valores ||
    !valores.length
  ) {

    return 0;

  }


  return valores.reduce(
    (
      total,
      valor
    ) =>
      total +
      Number(valor),
    0
  ) /
  valores.length;

}


// ======================================================
// 35. FORMATO
// ======================================================

function formatearNumero(
  valor,
  decimales = 2
) {

  const numero =
    Number(valor) || 0;


  return numero.toLocaleString(
    "es-PE",
    {

      minimumFractionDigits:
        decimales,

      maximumFractionDigits:
        decimales

    }
  );

}


// ======================================================
// 36. FORMATO INDICADOR
// ======================================================

function formatearIndicador(
  valor,
  indicador
) {

  const numero =
    Number(valor) || 0;


  if (
    indicador === "% PAGO"
  ) {

    return (
      numero.toLocaleString(
        "es-PE",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      ) +
      "%"
    );

  }


  if (
    indicador === "T.C"
  ) {

    return numero.toLocaleString(
      "es-PE",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );

  }


  return formatearNumero(
    numero
  );

}


// ======================================================
// 37. CONTAR ÚNICOS
// ======================================================

function contarUnicos(
  datos,
  campo
) {

  return new Set(

    datos

      .map(
        registro =>
          limpiarTexto(
            registro[campo]
          )
      )

      .filter(Boolean)

  ).size;

}


// ======================================================
// 38. ABREVIAR EJE X
// ======================================================

function abreviarEtiqueta(
  texto
) {

  const valor =
    String(texto || "")
      .trim();


  if (
    valor.length <= 16
  ) {

    return valor;

  }


  return (
    valor.substring(
      0,
      14
    ) +
    "…"
  );

}


// ======================================================
// 39. ESTABLECER TEXTO
// ======================================================

function establecerTexto(
  id,
  texto
) {

  const elemento =
    document.getElementById(
      id
    );


  if (elemento) {

    elemento.textContent =
      texto;

  }

}


// ======================================================
// 40. ACTUALIZACIÓN AUTOMÁTICA
// ======================================================

setInterval(
  function () {

    cargarDatos();

  },
  5 * 60 * 1000
);
