// ======================================================
// SCRIPT.JS
// ANÁLISIS DE PRODUCCIÓN
// CONEXIÓN CON GOOGLE SHEETS + FILTROS + GRÁFICOS + TABLA
// ======================================================


// ======================================================
// 01. CONFIGURACIÓN GOOGLE SHEETS
// ======================================================

const SHEET_ID =
  "1kR5qsAetOMi2Szb4c-gVo3vVhZhwJUC_AgSNI13eluY";

const SHEET_GID =
  "683959855";

// Google Visualization
const URL_DATOS =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`;


// ======================================================
// 02. VARIABLES PRINCIPALES
// ======================================================

let datosOriginales = [];
let datosFiltrados = [];
let graficos = {};


// ======================================================
// 03. ORDEN DE MESES
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
// 04. COLORES DE LOS GRÁFICOS
// ======================================================

const COLORES = {

  coinProm: "#8ecae6",

  ventaProm: "#95d5b2",

  coinTotal: "#a8dadc",

  ventaTotal: "#f9d88c",

  netwin: "#cdb4db",

  tc: "#f4b183",

  pago: "#f3a6b8",

  restante: "#e9edf2"

};


// ======================================================
// 05. ESTRUCTURA DE COLUMNAS DE GOOGLE SHEETS
// ======================================================
//
// 0  = Marca / Tipo / Version
// 1  = Nro.
// 2  = Maquina
// 3  = Fecha Ini.
// 4  = Fecha Fin
// 5  = Juego
// 6  = Dias
// 7  = COIN
// 8  = COIN PROM
// 9  = VENTA
// 10 = VENTA PROM
// 11 = NETWIN ($)
// 12 = G.PLAYED
// 13 = % PAGO
// 14 = Modelo Com.
// 15 = LOCAL
// 16 = MES
// 17 = AÑO
// 18 = TIPO MAQUINA
// 19 = T.C.
//
// ======================================================


// ======================================================
// 06. INICIO DEL SISTEMA
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    configurarEventos();

    cargarDatos();

  }
);


// ======================================================
// 07. CONFIGURACIÓN DE EVENTOS
// ======================================================

function configurarEventos() {

  const filtros = [
    "filtroSala",
    "filtroMes",
    "filtroModelo",
    "filtroNumero",
    "filtroJuego"
  ];


  filtros.forEach(
    function (id) {

      const elemento =
        document.getElementById(id);

      if (elemento) {

        elemento.addEventListener(
          "change",
          aplicarFiltros
        );

      }

    }
  );


  const btnLimpiar =
    document.getElementById(
      "btnLimpiar"
    );


  if (btnLimpiar) {

    btnLimpiar.addEventListener(
      "click",
      limpiarFiltros
    );

  }


  const btnActualizar =
    document.getElementById(
      "btnActualizar"
    );


  if (btnActualizar) {

    btnActualizar.addEventListener(
      "click",
      cargarDatos
    );

  }

}


// ======================================================
// 08. CARGAR DATOS DESDE GOOGLE SHEETS
// ======================================================

async function cargarDatos() {

  cambiarEstadoConexion(
    "Conectando con Google Sheets...",
    "#f2b84b"
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
        "Error HTTP " +
        respuesta.status
      );

    }


    const texto =
      await respuesta.text();


    console.log(
      "Respuesta Google Sheets:",
      texto.substring(0, 500)
    );


    const datos =
      convertirGViz(
        texto
      );


    if (
      !Array.isArray(datos) ||
      datos.length === 0
    ) {

      throw new Error(
        "No se encontraron registros en la pestaña DATA."
      );

    }


    datosOriginales =
      datos;


    datosFiltrados =
      [...datosOriginales];


    console.log(
      "Registros cargados:",
      datosOriginales.length
    );


    cambiarEstadoConexion(
      "Google Sheets conectado",
      "#45a878"
    );


    llenarFiltros();

    actualizarDashboard();


  } catch (error) {

    console.error(
      "Error cargando Google Sheets:",
      error
    );


    cambiarEstadoConexion(
      "Error al conectar con Google Sheets",
      "#e46a6a"
    );

  }

}


// ======================================================
// 09. CONVERTIR RESPUESTA GVIZ A DATOS
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
      "Google Sheets no devolvió JSON válido."
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
      "No se encontró información de la hoja."
    );

  }


  const filas =
    json.table.rows;


  return filas.map(
    function (fila) {

      const c =
        fila.c || [];


      return {

        "Marca / Tipo / Version":
          obtenerCelda(c, 0),

        "Nro.":
          obtenerCelda(c, 1),

        "Maquina":
          obtenerCelda(c, 2),

        "Fecha Ini.":
          obtenerCelda(c, 3),

        "Fecha Fin":
          obtenerCelda(c, 4),

        "Juego":
          obtenerCelda(c, 5),

        "Dias":
          obtenerCelda(c, 6),

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

        "Modelo Com.":
          obtenerCelda(c, 14),

        "LOCAL":
          obtenerCelda(c, 15),

        "MES":
          obtenerCelda(c, 16),

        "AÑO":
          obtenerCelda(c, 17),

        "TIPO MAQUINA":
          obtenerCelda(c, 18),

        "T.C":
          obtenerCelda(c, 19)

      };

    }
  );

}


// ======================================================
// 10. OBTENER CELDA DE GOOGLE SHEETS
// ======================================================

function obtenerCelda(
  columnas,
  indice
) {

  const celda =
    columnas[indice];


  if (
    !celda
  ) {

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
// 11. ESTADO DE CONEXIÓN
// ======================================================

function cambiarEstadoConexion(
  texto,
  color
) {

  const textoConexion =
    document.getElementById(
      "textoConexion"
    );


  const indicador =
    document.getElementById(
      "indicadorConexion"
    );


  if (textoConexion) {

    textoConexion.textContent =
      texto;

  }


  if (indicador) {

    indicador.style.background =
      color;

  }

}


// ======================================================
// 12. CARGAR OPCIONES DE LOS FILTROS
// ======================================================

function llenarFiltros() {

  llenarSelect(
    "filtroSala",
    "LOCAL",
    "Todas las salas"
  );


  llenarSelect(
    "filtroModelo",
    "Modelo Com.",
    "Todos los modelos"
  );


  llenarSelect(
    "filtroNumero",
    "Nro.",
    "Todas las máquinas"
  );


  llenarSelect(
    "filtroJuego",
    "Juego",
    "Todos los juegos"
  );


  llenarFiltroMes();

}


// ======================================================
// 13. LLENAR SELECT INDIVIDUAL
// ======================================================

function llenarSelect(
  id,
  campo,
  textoInicial
) {

  const select =
    document.getElementById(id);


  if (!select) {

    return;

  }


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


  const valores =
    [
      ...new Set(

        datosOriginales

          .map(
            function (registro) {

              return limpiarTexto(
                registro[campo]
              );

            }
          )

          .filter(
            function (valor) {

              return valor !== "";

            }
          )

      )
    ];


  valores.sort(
    function (a, b) {

      return a.localeCompare(
        b,
        "es",
        {
          numeric: true,
          sensitivity: "base"
        }
      );

    }
  );


  valores.forEach(
    function (valor) {

      const opcion =
        document.createElement(
          "option"
        );


      opcion.value =
        valor;


      opcion.textContent =
        valor;


      select.appendChild(
        opcion
      );

    }
  );


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
// 14. LLENAR FILTRO DE MES
// ======================================================

function llenarFiltroMes() {

  const select =
    document.getElementById(
      "filtroMes"
    );


  if (!select) {

    return;

  }


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
    function (mes) {

      const opcion =
        document.createElement(
          "option"
        );


      opcion.value =
        mes;


      opcion.textContent =
        mes;


      select.appendChild(
        opcion
      );

    }
  );

}


// ======================================================
// 15. APLICAR FILTROS
// ======================================================

function aplicarFiltros() {

  const sala =
    obtenerValor(
      "filtroSala"
    );


  const mes =
    obtenerValor(
      "filtroMes"
    );


  const modelo =
    obtenerValor(
      "filtroModelo"
    );


  const numero =
    obtenerValor(
      "filtroNumero"
    );


  const juego =
    obtenerValor(
      "filtroJuego"
    );


  datosFiltrados =
    datosOriginales.filter(
      function (registro) {


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
          mes &&
          normalizarMes(
            registro["MES"]
          ) !==
          normalizarMes(mes)
        ) {

          return false;

        }


        if (
          modelo &&
          limpiarTexto(
            registro["Modelo Com."]
          ) !==
          limpiarTexto(modelo)
        ) {

          return false;

        }


        if (
          numero &&
          limpiarTexto(
            registro["Nro."]
          ) !==
          limpiarTexto(numero)
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


        return true;

      }
    );


  actualizarDashboard();

}


// ======================================================
// 16. LIMPIAR TODOS LOS FILTROS
// ======================================================

function limpiarFiltros() {

  const ids = [

    "filtroSala",
    "filtroMes",
    "filtroModelo",
    "filtroNumero",
    "filtroJuego"

  ];


  ids.forEach(
    function (id) {

      const elemento =
        document.getElementById(id);


      if (elemento) {

        elemento.value = "";

      }

    }
  );


  datosFiltrados =
    [...datosOriginales];


  actualizarDashboard();

}


// ======================================================
// 17. ACTUALIZAR TODO EL DASHBOARD
// ======================================================

function actualizarDashboard() {

  actualizarContador();

  construirGraficos();

  construirGraficoPago();

  construirTabla();

}


// ======================================================
// 18. ACTUALIZAR CONTADOR DE REGISTROS
// ======================================================

function actualizarContador() {

  establecerTexto(
    "contadorResultados",
    formatearNumero(
      datosFiltrados.length
    )
  );

}


// ======================================================
// 19. CONSTRUIR RESUMEN MENSUAL
// ======================================================

function construirResumenMensual() {

  const grupos = {};


  datosFiltrados.forEach(
    function (registro) {

      const año =
        obtenerNumero(
          registro["AÑO"]
        );


      if (
        año !== null &&
        año !== 0 &&
        año !== 2026
      ) {

        return;

      }


      const mes =
        normalizarMes(
          registro["MES"]
        );


      if (
        !MESES.includes(mes)
      ) {

        return;

      }


      if (
        !grupos[mes]
      ) {

        grupos[mes] = {

          coinProm: [],

          ventaProm: [],

          coinTotal: 0,

          ventaTotal: 0,

          netwin: 0,

          tc: [],

          pago: []

        };

      }


      const grupo =
        grupos[mes];


      const coin =
        obtenerNumero(
          registro["COIN"]
        );


      const coinProm =
        obtenerNumero(
          registro["COIN PROM"]
        );


      const venta =
        obtenerNumero(
          registro["VENTA"]
        );


      const ventaProm =
        obtenerNumero(
          registro["VENTA PROM"]
        );


      const netwin =
        obtenerNumero(
          registro["NETWIN ($)"]
        );


      const tc =
        obtenerNumero(
          registro["T.C"]
        );


      const pago =
        obtenerNumero(
          registro["% PAGO"]
        );


      if (
        coinProm !== null
      ) {

        grupo.coinProm.push(
          coinProm
        );

      }


      if (
        ventaProm !== null
      ) {

        grupo.ventaProm.push(
          ventaProm
        );

      }


      if (
        coin !== null
      ) {

        grupo.coinTotal +=
          coin;

      }


      if (
        venta !== null
      ) {

        grupo.ventaTotal +=
          venta;

      }


      if (
        netwin !== null
      ) {

        grupo.netwin +=
          netwin;

      }


      if (
        tc !== null
      ) {

        grupo.tc.push(
          tc
        );

      }


      if (
        pago !== null
      ) {

        grupo.pago.push(
          pago
        );

      }

    }
  );


  const meses =
    MESES.filter(
      function (mes) {

        return (
          grupos[mes] &&
          (
            grupos[mes].coinProm.length > 0 ||
            grupos[mes].ventaProm.length > 0 ||
            grupos[mes].coinTotal !== 0 ||
            grupos[mes].ventaTotal !== 0 ||
            grupos[mes].netwin !== 0 ||
            grupos[mes].tc.length > 0 ||
            grupos[mes].pago.length > 0
          )
        );

      }
    );


  return {

    labels:
      meses,


    coinProm:
      meses.map(
        function (mes) {

          return promedioArray(
            grupos[mes].coinProm
          );

        }
      ),


    ventaProm:
      meses.map(
        function (mes) {

          return promedioArray(
            grupos[mes].ventaProm
          );

        }
      ),


    coinTotal:
      meses.map(
        function (mes) {

          return grupos[mes]
            .coinTotal;

        }
      ),


    ventaTotal:
      meses.map(
        function (mes) {

          return grupos[mes]
            .ventaTotal;

        }
      ),


    netwin:
      meses.map(
        function (mes) {

          return grupos[mes]
            .netwin;

        }
      ),


    tc:
      meses.map(
        function (mes) {

          return promedioArray(
            grupos[mes].tc
          );

        }
      ),


    pago:
      meses.map(
        function (mes) {

          return promedioArray(
            grupos[mes].pago
          );

        }
      )

  };

}


// ======================================================
// 20. CONSTRUIR LOS 6 GRÁFICOS
// ======================================================

function construirGraficos() {

  const resumen =
    construirResumenMensual();


  // GRÁFICO 1 - COIN PROM

  crearGraficoLinea(
    "graficoCoinProm",
    "COIN PROM",
    resumen.labels,
    resumen.coinProm,
    COLORES.coinProm
  );


  // GRÁFICO 2 - VENTA PROM

  crearGraficoLinea(
    "graficoVentaProm",
    "VENTA PROM",
    resumen.labels,
    resumen.ventaProm,
    COLORES.ventaProm
  );


  // GRÁFICO 3 - COIN TOTAL

  crearGraficoLinea(
    "graficoCoinTotal",
    "COIN TOTAL",
    resumen.labels,
    resumen.coinTotal,
    COLORES.coinTotal
  );


  // GRÁFICO 4 - VENTA TOTAL

  crearGraficoLinea(
    "graficoVentaTotal",
    "VENTA TOTAL",
    resumen.labels,
    resumen.ventaTotal,
    COLORES.ventaTotal
  );


  // GRÁFICO 5 - NETWIN

  crearGraficoLinea(
    "graficoNetwin",
    "NETWIN ($)",
    resumen.labels,
    resumen.netwin,
    COLORES.netwin
  );


  // GRÁFICO 6 - T.C.

  crearGraficoLinea(
    "graficoTC",
    "T.C.",
    resumen.labels,
    resumen.tc,
    COLORES.tc,
    true
  );

}


// ======================================================
// 21. CONFIGURACIÓN DE GRÁFICOS DE LÍNEA
// ======================================================

function crearGraficoLinea(
  id,
  etiqueta,
  labels,
  datos,
  color,
  esTC = false
) {

  const canvas =
    document.getElementById(id);


  if (!canvas) {

    console.warn(
      "No existe canvas:",
      id
    );

    return;

  }


  if (graficos[id]) {

    graficos[id].destroy();

  }


  graficos[id] =
    new Chart(
      canvas,
      {

        type: "line",


        data: {

          labels:
            labels,


          datasets: [

            {

              label:
                etiqueta,

              data:
                datos,

              borderColor:
                color,

              backgroundColor:
                color,

              pointBackgroundColor:
                color,

              pointBorderColor:
                "#ffffff",

              pointBorderWidth:
                2,

              pointRadius:
                5,

              pointHoverRadius:
                7,

              borderWidth:
                3,

              tension:
                0.25,

              fill:
                false

            }

          ]

        },


        plugins: [
          ChartDataLabels
        ],


        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,


          interaction: {

            mode:
              "index",

            intersect:
              false

          },


          plugins: {

            legend: {

              display:
                true,

              position:
                "bottom",

              labels: {

                usePointStyle:
                  true,

                padding:
                  16,

                color:
                  "#667085",

                font: {

                  size:
                    11

                }

              }

            },


            datalabels: {

              display:
                true,

              align:
                "top",

              anchor:
                "end",

              color:
                "#667085",

              font: {

                size:
                  10,

                weight:
                  "600"

              },


              formatter:
                function (valor) {

                  if (
                    esTC
                  ) {

                    return Number(
                      valor
                    ).toFixed(2);

                  }


                  return formatearNumero(
                    valor
                  );

                }

            },


            tooltip: {

              backgroundColor:
                "#344054",

              titleColor:
                "#ffffff",

              bodyColor:
                "#ffffff",

              padding:
                10

            }

          },


          scales: {

            x: {

              grid: {

                color:
                  "#eef1f4"

              },

              ticks: {

                color:
                  "#667085"

              }

            },


            y: {

              beginAtZero:
                true,

              grid: {

                color:
                  "#eef1f4"

              },

              ticks: {

                color:
                  "#667085",

                callback:
                  function (valor) {

                    if (
                      esTC
                    ) {

                      return Number(
                        valor
                      ).toFixed(2);

                    }


                    return formatearNumero(
                      valor
                    );

                  }

              }

            }

          }

        }

      }
    );

}


// ======================================================
// 22. GRÁFICO CIRCULAR - % PAGO
// ======================================================

function construirGraficoPago() {

  const canvas =
    document.getElementById(
      "graficoPago"
    );


  if (!canvas) {

    return;

  }


  if (
    graficos.graficoPago
  ) {

    graficos.graficoPago.destroy();

  }


  const valores =
    datosFiltrados

      .map(
        function (registro) {

          return obtenerNumero(
            registro["% PAGO"]
          );

        }
      )

      .filter(
        function (valor) {

          return valor !== null;

        }
      );


  let pago =
    promedioArray(
      valores
    );


  pago =
    Math.max(
      0,
      Math.min(
        100,
        pago
      )
    );


  const restante =
    100 - pago;


  establecerTexto(
    "valorPago",
    pago.toFixed(2) +
    "%"
  );


  graficos.graficoPago =
    new Chart(
      canvas,
      {

        type:
          "doughnut",


        data: {

          labels: [

            "PAGO",

            "RESTANTE"

          ],


          datasets: [

            {

              data: [

                pago,

                restante

              ],


              backgroundColor: [

                COLORES.pago,

                COLORES.restante

              ],


              borderColor: [

                "#ffffff",

                "#ffffff"

              ],


              borderWidth:
                3

            }

          ]

        },


        plugins: [
          ChartDataLabels
        ],


        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,

          cutout:
            "58%",


          plugins: {

            legend: {

              position:
                "bottom",

              labels: {

                usePointStyle:
                  true,

                padding:
                  18,

                color:
                  "#667085"

              }

            },


            datalabels: {

              color:
                "#475467",

              font: {

                size:
                  14,

                weight:
                  "700"

              },

              formatter:
                function (valor) {

                  return valor.toFixed(1) +
                    "%";

                }

            }

          }

        }

      }
    );

}


// ======================================================
// 23. CONSTRUIR TABLA RESUMEN
// ======================================================

function construirTabla() {

  const cuerpo =
    document.getElementById(
      "tablaCuerpo"
    );


  if (!cuerpo) {

    return;

  }


  const resumen =
    construirResumenMensual();


  cuerpo.innerHTML = "";


  resumen.labels.forEach(
    function (
      mes,
      indice
    ) {

      const fila =
        document.createElement(
          "tr"
        );


      fila.innerHTML = `

        <td>
          <strong>
            ${mes}
          </strong>
        </td>

        <td>
          ${formatearNumero(
            resumen.coinProm[indice]
          )}
        </td>

        <td>
          ${formatearNumero(
            resumen.coinTotal[indice]
          )}
        </td>

        <td>
          ${formatearNumero(
            resumen.ventaProm[indice]
          )}
        </td>

        <td>
          ${formatearNumero(
            resumen.ventaTotal[indice]
          )}
        </td>

        <td>
          ${formatearNumero(
            resumen.netwin[indice]
          )}
        </td>

        <td>
          ${Number(
            resumen.tc[indice] || 0
          ).toFixed(2)}
        </td>

        <td>
          ${Number(
            resumen.pago[indice] || 0
          ).toFixed(2)}
          %
        </td>

      `;


      cuerpo.appendChild(
        fila
      );

    }
  );

}


// ======================================================
// 24. OBTENER VALOR DE UN SELECT
// ======================================================

function obtenerValor(id) {

  const elemento =
    document.getElementById(id);


  if (!elemento) {

    return "";

  }


  return String(
    elemento.value || ""
  ).trim();

}


// ======================================================
// 25. NORMALIZAR TEXTO
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
// 26. NORMALIZAR MES
// ======================================================

function normalizarMes(valor) {

  if (
    valor === null ||
    valor === undefined
  ) {

    return "";

  }


  let mes =
    String(valor)
      .trim()
      .toUpperCase();


  mes =
    mes
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      );


  const numero =
    Number(mes);


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


  if (
    equivalencias[mes]
  ) {

    return equivalencias[
      mes
    ];

  }


  return mes;

}


// ======================================================
// 27. CONVERTIR VALOR A NÚMERO
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

    return Number.isFinite(valor)
      ? valor
      : null;

  }


  let texto =
    String(valor)
      .trim();


  if (!texto) {

    return null;

  }


  texto =
    texto.replace(
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


  return Number.isFinite(numero)
    ? numero
    : null;

}


// ======================================================
// 28. CALCULAR PROMEDIO
// ======================================================

function promedioArray(
  valores
) {

  if (
    !valores ||
    valores.length === 0
  ) {

    return 0;

  }


  const validos =
    valores.filter(
      function (valor) {

        return (
          valor !== null &&
          Number.isFinite(
            Number(valor)
          )
        );

      }
    );


  if (
    validos.length === 0
  ) {

    return 0;

  }


  const suma =
    validos.reduce(
      function (
        total,
        valor
      ) {

        return total +
          Number(valor);

      },
      0
    );


  return suma /
    validos.length;

}


// ======================================================
// 29. FORMATEAR NÚMEROS
// ======================================================

function formatearNumero(
  valor
) {

  const numero =
    Number(valor) || 0;


  return numero.toLocaleString(
    "es-PE",
    {

      maximumFractionDigits:
        2

    }
  );

}


// ======================================================
// 30. ESTABLECER TEXTO EN HTML
// ======================================================

function establecerTexto(
  id,
  texto
) {

  const elemento =
    document.getElementById(id);


  if (elemento) {

    elemento.textContent =
      texto;

  }

}


// ======================================================
// 31. ACTUALIZACIÓN AUTOMÁTICA
// ======================================================
//
// Cada 5 minutos vuelve a consultar Google Sheets.
//
// ======================================================

setInterval(
  function () {

    cargarDatos();

  },
  5 * 60 * 1000
);
