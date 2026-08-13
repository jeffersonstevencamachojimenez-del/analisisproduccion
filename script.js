// ======================================================
// CONFIGURACIÓN GOOGLE SHEETS
// ======================================================

const SHEET_ID =
  "1kR5qsAetOMi2Szb4c-gVo3vVhZhwJUC_AgSNI13eluY";

const SHEET_GID =
  "683959855";

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
  function () {

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
// CARGAR DATOS DE GOOGLE SHEETS
// ======================================================

async function cargarDatos() {

  cambiarEstadoConexion(
    "Conectando con Google Sheets...",
    "#f2b84b"
  );

  try {

    const url =
      URL_DATOS +
      "&t=" +
      Date.now();


    console.log(
      "URL GOOGLE SHEETS:",
      url
    );


    const respuesta =
      await fetch(url);


    console.log(
      "STATUS GOOGLE:",
      respuesta.status
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
      "RESPUESTA GOOGLE:",
      texto.substring(0, 500)
    );


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


    console.log(
      "JSON GOOGLE:",
      json
    );


    if (
      !json.table ||
      !json.table.cols
    ) {

      throw new Error(
        "No se encontró la tabla Google Sheets."
      );

    }


    const columnas =
      json.table.cols.map(
        function (columna) {

          return (
            columna.label ||
            columna.id
          );

        }
      );


    console.log(
      "COLUMNAS DETECTADAS:",
      columnas
    );


    const datos =
      json.table.rows.map(
        function (fila) {

          const registro = {};


          columnas.forEach(
            function (
              columna,
              indice
            ) {

              const celda =
                fila.c
                  ? fila.c[indice]
                  : null;


              registro[columna] =
                celda
                  ? (
                      celda.v ??
                      celda.f ??
                      ""
                    )
                  : "";

            }
          );


          return registro;

        }
      );


    console.log(
      "TOTAL REGISTROS:",
      datos.length
    );


    console.log(
      "PRIMER REGISTRO:",
      datos[0]
    );


    if (
      datos.length === 0
    ) {

      throw new Error(
        "El Sheet no devolvió registros."
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


  }

  catch (error) {

    console.error(
      "ERROR GOOGLE SHEETS:",
      error
    );


    cambiarEstadoConexion(
      "Error al conectar con Google Sheets",
      "#e46a6a"
    );

  }

}


// ======================================================
// ESTADO DE CONEXIÓN
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
// CREAR SELECT
// ======================================================

function llenarSelect(
  id,
  campo,
  textoInicial
) {

  const select =
    document.getElementById(id);


  if (!select) return;


  const valorAnterior =
    select.value;


  select.innerHTML = "";


  const opcionInicial =
    document.createElement(
      "option"
    );


  opcionInicial.value = "";


  opcionInicial.textContent =
    textoInicial;


  select.appendChild(
    opcionInicial
  );


  const valores =
    [
      ...new Set(

        datosOriginales

          .map(
            function (registro) {

              return String(
                registro[campo] ?? ""
              ).trim();

            }
          )

          .filter(Boolean)

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
// FILTRO MES
// ======================================================

function llenarFiltroMes() {

  const select =
    document.getElementById(
      "filtroMes"
    );


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
    "Todos los meses";


  select.appendChild(
    inicial
  );


  ORDEN_MESES.forEach(
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


  if (
    ORDEN_MESES.includes(
      valorAnterior
    )
  ) {

    select.value =
      valorAnterior;

  }

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
// LIMPIAR FILTROS
// ======================================================

function limpiarFiltros() {

  [
    "filtroSala",
    "filtroMes",
    "filtroModelo",
    "filtroNumero",
    "filtroJuego"
  ].forEach(
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
// ACTUALIZAR DASHBOARD
// ======================================================

function actualizarDashboard() {

  actualizarContador();

  construirGraficos();

  construirGraficoPago();

  construirTabla();

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
    function (registro) {


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
   * IMPORTANTE:
   * Solo aparecen meses que
   * realmente tienen información.
   */

  const meses =
    ORDEN_MESES.filter(
      function (mes) {

        return grupos[mes];

      }
    );


  return {

    labels: meses,


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

          return grupos[mes].coinTotal;

        }
      ),


    ventaTotal:
      meses.map(
        function (mes) {

          return grupos[mes].ventaTotal;

        }
      ),


    netwin:
      meses.map(
        function (mes) {

          return grupos[mes].netwin;

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
// CREAR TODOS LOS GRÁFICOS
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


        options: {

          responsive: true,

          maintainAspectRatio: false,


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
// GRÁFICO CIRCULAR % PAGO
// ======================================================

function construirGraficoPago() {

  const canvas =
    document.getElementById(
      "graficoPago"
    );


  if (!canvas) return;


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
          <strong>${mes}</strong>
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
          ).toFixed(2)} %
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
// LIMPIAR TEXTO
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
   * 1,234.56
   * 1234.56
   * 1.234,56
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

    }

    else {

      texto =
        texto.replace(
          /,/g,
          ""
        );

    }

  }

  else if (
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

    }

    else {

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
  function () {

    cargarDatos();

  },
  5 * 60 * 1000
);
