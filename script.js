// ======================================================
// CONFIGURACIÓN GOOGLE SHEETS
// ======================================================

const SHEET_ID =
  "1kR5qsAetOMi2Szb4c-gVo3vVhZhwJUC_AgSNI13eluY";

const SHEET_GID =
  "683959855";


// URL DIRECTA DE GOOGLE VISUALIZATION

const URL_DATOS =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`;


// ======================================================
// VARIABLES
// ======================================================

let datosOriginales = [];

let datosFiltrados = [];

let graficos = {};


// ======================================================
// MESES
// ======================================================

const ORDEN_MESES = [

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
// COLORES PASTEL
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
// INICIO
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    configurarEventos();

    cargarDatos();

  }
);


// ======================================================
// EVENTOS
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
    id => {

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
// CARGAR GOOGLE SHEETS
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


    const datos =
      convertirRespuestaGViz(
        texto
      );


    if (
      !Array.isArray(datos) ||
      datos.length === 0
    ) {

      throw new Error(
        "Google Sheets no devolvió registros."
      );

    }


    datosOriginales =
      datos;


    datosFiltrados =
      [...datosOriginales];


    cambiarEstadoConexion(
      "Google Sheets conectado",
      "#45a878"
    );


    llenarFiltros();

    actualizarDashboard();


  } catch (error) {


    console.error(
      "Error:",
      error
    );


    cambiarEstadoConexion(
      "Error al conectar con Google Sheets",
      "#e46a6a"
    );

  }

}


// ======================================================
// CONVERTIR RESPUESTA GVIZ
// ======================================================

function convertirRespuestaGViz(
  texto
) {


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


  const tabla =
    json.table;


  if (!tabla) {

    throw new Error(
      "No se encontró la tabla de Google Sheets."
    );

  }


  const columnas =
    tabla.cols.map(
      columna =>
        columna.label ||
        columna.id
    );


  return tabla.rows.map(
    fila => {

      const registro = {};


      columnas.forEach(
        (
          columna,
          indice
        ) => {

          const celda =
            fila.c[
              indice
            ];


          registro[columna] =
            celda
              ? (
                  celda.f ??
                  celda.v ??
                  ""
                )
              : "";

        }
      );


      return registro;

    }
  );

}


// ======================================================
// ESTADO CONEXIÓN
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
// FILTROS
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
// SELECT
// ======================================================

function llenarSelect(
  id,
  campo,
  textoInicial
) {


  const select =
    document.getElementById(id);


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
    textoInicial;


  select.appendChild(
    inicial
  );


  const valores =
    [
      ...new Set(

        datosOriginales
          .map(
            registro =>
              String(
                registro[campo] ??
                ""
              ).trim()
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


  valores.forEach(
    valor => {

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
      valorActual
    )
  ) {

    select.value =
      valorActual;

  }

}


// ======================================================
// FILTRO MES
// ======================================================

function llenarFiltroMes() {


  const select =
    document.getElementById(
      "filtroMes"
    );


  if (!select) return;


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


  ORDEN_MESES.forEach(
    mes => {

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
// APLICAR FILTROS
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
// LIMPIAR
// ======================================================

function limpiarFiltros() {


  [

    "filtroSala",

    "filtroMes",

    "filtroModelo",

    "filtroNumero",

    "filtroJuego"

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


  actualizarDashboard();

}


// ======================================================
// DASHBOARD
// ======================================================

function actualizarDashboard() {


  actualizarContador();

  construirGraficos();

  construirTabla();

  construirGraficoPago();

}


// ======================================================
// CONTADOR
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
// RESUMEN MENSUAL
// ======================================================

function construirResumenMensual() {


  const grupos = {};


  datosFiltrados.forEach(
    registro => {


      const año =
        obtenerNumero(
          registro["AÑO"]
        );


      if (
        año &&
        año !== 2026
      ) {

        return;

      }


      const mes =
        normalizarMes(
          registro["MES"]
        );


      if (
        !ORDEN_MESES.includes(
          mes
        )
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


  /*
    IMPORTANTE:

    Solo se incluyen meses que
    realmente tienen registros.
  */

  const meses =
    ORDEN_MESES.filter(
      mes =>
        grupos[mes]
    );


  return {

    labels: meses,

    coinProm:
      meses.map(
        mes =>
          promedioArray(
            grupos[mes].coinProm
          )
      ),

    ventaProm:
      meses.map(
        mes =>
          promedioArray(
            grupos[mes].ventaProm
          )
      ),

    coinTotal:
      meses.map(
        mes =>
          grupos[mes].coinTotal
      ),

    ventaTotal:
      meses.map(
        mes =>
          grupos[mes].ventaTotal
      ),

    netwin:
      meses.map(
        mes =>
          grupos[mes].netwin
      ),

    tc:
      meses.map(
        mes =>
          promedioArray(
            grupos[mes].tc
          )
      ),

    pago:
      meses.map(
        mes =>
          promedioArray(
            grupos[mes].pago
          )
      )

  };

}


// ======================================================
// CREAR GRÁFICOS
// ======================================================

function construirGraficos() {


  const resumen =
    construirResumenMensual();


  crearGraficoLinea(
    "graficoCoinProm",
    "COIN PROM",
    resumen.labels,
    resumen.coinProm,
    COLORES.coinProm
  );


  crearGraficoLinea(
    "graficoVentaProm",
    "VENTA PROM",
    resumen.labels,
    resumen.ventaProm,
    COLORES.ventaProm
  );


  crearGraficoLinea(
    "graficoCoinTotal",
    "COIN TOTAL",
    resumen.labels,
    resumen.coinTotal,
    COLORES.coinTotal
  );


  crearGraficoLinea(
    "graficoVentaTotal",
    "VENTA TOTAL",
    resumen.labels,
    resumen.ventaTotal,
    COLORES.ventaTotal
  );


  crearGraficoLinea(
    "graficoNetwin",
    "NETWIN ($)",
    resumen.labels,
    resumen.netwin,
    COLORES.netwin
  );


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
// GRÁFICO DE LÍNEA
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


  if (!canvas) return;


  if (graficos[id]) {

    graficos[id].destroy();

  }


  graficos[id] =
    new Chart(
      canvas,
      {

        type: "line",


        data: {

          labels: labels,

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

          responsive: true,

          maintainAspectRatio: false,


          interaction: {

            mode: "index",

            intersect: false

          },


          plugins: {

            legend: {

              display: true,

              position: "bottom",

              labels: {

                usePointStyle: true,

                padding: 16,

                color: "#667085",

                font: {

                  size: 11

                }

              }

            },


            datalabels: {

              display: true,

              align: "top",

              anchor: "end",

              color: "#667085",

              font: {

                size: 10,

                weight: "600"

              },

              formatter:
                valor => {

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

              padding: 10

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

              beginAtZero: true,

              grid: {

                color:
                  "#eef1f4"

              },

              ticks: {

                color:
                  "#667085",

                callback:
                  valor => {

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
// GRÁFICO CIRCULAR % PAGO
// ======================================================

function construirGraficoPago() {


  const canvas =
    document.getElementById(
      "graficoPago"
    );


  if (!canvas) return;


  if (graficos.graficoPago) {

    graficos.graficoPago.destroy();

  }


  const valores =
    datosFiltrados
      .map(
        registro =>
          obtenerNumero(
            registro["% PAGO"]
          )
      )
      .filter(
        valor =>
          valor !== null
      );


  let pago =
    promedioArray(
      valores
    );


  /*
    Por seguridad mantenemos
    el porcentaje entre 0 y 100.
  */

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
    pago.toFixed(2) + "%"
  );


  graficos.graficoPago =
    new Chart(
      canvas,
      {

        type: "doughnut",


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


              borderWidth: 3

            }

          ]

        },


        plugins: [
          ChartDataLabels
        ],


        options: {

          responsive: true,

          maintainAspectRatio: false,


          cutout: "58%",


          plugins: {

            legend: {

              position: "bottom",

              labels: {

                usePointStyle: true,

                padding: 18,

                color: "#667085"

              }

            },


            datalabels: {

              color: "#475467",

              font: {

                size: 14,

                weight: "700"

              },

              formatter:
                valor =>
                  valor.toFixed(1) +
                  "%"

            }

          }

        }

      }
    );

}


// ======================================================
// TABLA
// ======================================================

function construirTabla() {


  const cuerpo =
    document.getElementById(
      "tablaCuerpo"
    );


  if (!cuerpo) return;


  const resumen =
    construirResumenMensual();


  cuerpo.innerHTML = "";


  resumen.labels.forEach(
    (
      mes,
      indice
    ) => {


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
// OBTENER VALOR SELECT
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
// NORMALIZAR TEXTO
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
// NORMALIZAR MES
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

    return ORDEN_MESES[
      numero - 1
    ];

  }


  return mes;

}


// ======================================================
// OBTENER NÚMERO
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


  /*
    Manejo de números:

    1,234.56
    1234.56
    1.234,56
  */

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
      partes[1] &&
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
// PROMEDIO
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
      valor =>
        valor !== null &&
        Number.isFinite(
          Number(valor)
        )
    );


  if (
    validos.length === 0
  ) {

    return 0;

  }


  const suma =
    validos.reduce(
      (
        total,
        valor
      ) =>
        total +
        Number(valor),
      0
    );


  return suma /
    validos.length;

}


// ======================================================
// FORMATEAR NÚMERO
// ======================================================

function formatearNumero(
  valor
) {


  const numero =
    Number(valor) || 0;


  return numero.toLocaleString(
    "es-PE",
    {

      maximumFractionDigits: 2

    }
  );

}


// ======================================================
// ESTABLECER TEXTO
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
// ACTUALIZACIÓN AUTOMÁTICA
// ======================================================

setInterval(
  cargarDatos,
  5 * 60 * 1000
);
