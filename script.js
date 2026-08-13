// ======================================================
// CONFIGURACIÓN
// ======================================================

const URL_DATOS =
  "https://script.google.com/macros/s/AKfycbydQfKHv-TvsvW8aHc4Vl3ZxAakQRLNRVZRx0q1NEQl2wQlxwnKhlc1f3pLGvuFqWP1/exec";


let datosOriginales = [];

let datosFiltrados = [];

let graficoMensual = null;


// ======================================================
// MESES 2026
// ======================================================

const MESES_2026 = [

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
// CONFIGURAR EVENTOS
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


  const botonLimpiar =
    document.getElementById(
      "btnLimpiar"
    );


  if (botonLimpiar) {

    botonLimpiar.addEventListener(
      "click",
      limpiarFiltros
    );

  }


  const botonActualizar =
    document.getElementById(
      "btnActualizar"
    );


  if (botonActualizar) {

    botonActualizar.addEventListener(
      "click",
      cargarDatos
    );

  }

}


// ======================================================
// CARGAR DATOS
// ======================================================

async function cargarDatos() {


  const textoConexion =
    document.getElementById(
      "textoConexion"
    );


  const indicador =
    document.getElementById(
      "indicadorConexion"
    );


  try {


    if (textoConexion) {

      textoConexion.textContent =
        "Conectando con Google Sheets...";

    }


    if (indicador) {

      indicador.style.background =
        "#f2b84b";

    }


    const respuesta =
      await fetch(
        URL_DATOS +
        "?t=" +
        Date.now()
      );


    if (!respuesta.ok) {

      throw new Error(
        "Error HTTP " +
        respuesta.status
      );

    }


    const datos =
      await respuesta.json();


    if (
      !Array.isArray(datos)
    ) {

      throw new Error(
        "La API no devolvió un arreglo de datos."
      );

    }


    datosOriginales =
      datos;


    datosFiltrados =
      [...datosOriginales];


    if (textoConexion) {

      textoConexion.textContent =
        "Google Sheets conectado";

    }


    if (indicador) {

      indicador.style.background =
        "#45a878";

    }


    llenarFiltros();

    actualizarDashboard();


  } catch (error) {


    console.error(
      "Error cargando datos:",
      error
    );


    if (textoConexion) {

      textoConexion.textContent =
        "Error de conexión";

    }


    if (indicador) {

      indicador.style.background =
        "#e46a6a";

    }

  }

}


// ======================================================
// LLENAR FILTROS
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
// SELECT NORMAL
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


  const opcionInicial =
    document.createElement(
      "option"
    );


  opcionInicial.value =
    "";


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


  inicial.value =
    "";


  inicial.textContent =
    "Todos los meses";


  select.appendChild(
    inicial
  );


  MESES_2026.forEach(
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
// APLICAR FILTROS
// ======================================================

function aplicarFiltros() {


  const sala =
    obtenerValorSelect(
      "filtroSala"
    );


  const mes =
    obtenerValorSelect(
      "filtroMes"
    );


  const modelo =
    obtenerValorSelect(
      "filtroModelo"
    );


  const numero =
    obtenerValorSelect(
      "filtroNumero"
    );


  const juego =
    obtenerValorSelect(
      "filtroJuego"
    );


  datosFiltrados =
    datosOriginales.filter(
      function (registro) {


        // LOCAL

        if (
          sala &&
          String(
            registro["LOCAL"] ?? ""
          ).trim() !== sala
        ) {

          return false;

        }


        // MES

        if (
          mes &&
          normalizarMes(
            registro["MES"]
          ) !==
          normalizarMes(mes)
        ) {

          return false;

        }


        // MODELO

        if (
          modelo &&
          String(
            registro["Modelo Com."] ?? ""
          ).trim() !== modelo
        ) {

          return false;

        }


        // NUMERO

        if (
          numero &&
          String(
            registro["Nro."] ?? ""
          ).trim() !== numero
        ) {

          return false;

        }


        // JUEGO

        if (
          juego &&
          String(
            registro["Juego"] ?? ""
          ).trim() !== juego
        ) {

          return false;

        }


        return true;

      }
    );


  actualizarDashboard();

}


// ======================================================
// OBTENER VALOR SELECT
// ======================================================

function obtenerValorSelect(id) {


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
// LIMPIAR FILTROS
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

        elemento.value =
          "";

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

  actualizarKPI();

  crearGraficoMensual();

  actualizarTabla();

}


// ======================================================
// CONTADOR
// ======================================================

function actualizarContador() {


  const elemento =
    document.getElementById(
      "contadorResultados"
    );


  if (!elemento) return;


  elemento.textContent =
    formatearNumero(
      datosFiltrados.length
    );

}


// ======================================================
// KPI
// ======================================================

function actualizarKPI() {


  const coin =
    sumarCampo(
      datosFiltrados,
      "COIN"
    );


  const venta =
    sumarCampo(
      datosFiltrados,
      "VENTA"
    );


  const netwin =
    sumarCampo(
      datosFiltrados,
      "NETWIN ($)"
    );


  const pago =
    promedioCampo(
      datosFiltrados,
      "% PAGO"
    );


  const maquinas =
    new Set(

      datosFiltrados

        .map(
          function (registro) {

            return String(
              registro["Nro."] ?? ""
            ).trim();

          }
        )

        .filter(Boolean)

    ).size;


  const locales =
    new Set(

      datosFiltrados

        .map(
          function (registro) {

            return String(
              registro["LOCAL"] ?? ""
            ).trim();

          }
        )

        .filter(Boolean)

    ).size;


  establecerTexto(
    "kpiCoin",
    formatearNumero(coin)
  );


  establecerTexto(
    "kpiVenta",
    formatearNumero(venta)
  );


  establecerTexto(
    "kpiNetwin",
    formatearNumero(netwin)
  );


  establecerTexto(
    "kpiPago",
    formatearDecimal(pago) +
    " %"
  );


  establecerTexto(
    "kpiMaquinas",
    formatearNumero(maquinas)
  );


  establecerTexto(
    "kpiLocales",
    formatearNumero(locales)
  );

}


// ======================================================
// GRÁFICO MENSUAL
// ======================================================

function crearGraficoMensual() {


  const canvas =
    document.getElementById(
      "graficoMensual"
    );


  if (!canvas) return;


  if (graficoMensual) {

    graficoMensual.destroy();

  }


  const resumen =
    construirResumenMensual();


  graficoMensual =
    new Chart(
      canvas,
      {

        type: "line",


        data: {

          labels:
            resumen.labels,


          datasets: [


            // =========================================
            // COIN PROM
            // =========================================

            {

              label:
                "COIN PROM",

              data:
                resumen.coinProm,

              borderColor:
                "#8ecae6",

              backgroundColor:
                "#8ecae6",

              pointBackgroundColor:
                "#8ecae6",

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
                0.3,

              yAxisID:
                "y"

            },


            // =========================================
            // COIN TOTAL
            // =========================================

            {

              label:
                "COIN TOTAL",

              data:
                resumen.coinTotal,

              borderColor:
                "#a8dadc",

              backgroundColor:
                "#a8dadc",

              pointBackgroundColor:
                "#a8dadc",

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
                0.3,

              yAxisID:
                "y"

            },


            // =========================================
            // VENTA PROM
            // =========================================

            {

              label:
                "VENTA PROM",

              data:
                resumen.ventaProm,

              borderColor:
                "#95d5b2",

              backgroundColor:
                "#95d5b2",

              pointBackgroundColor:
                "#95d5b2",

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
                0.3,

              yAxisID:
                "y"

            },


            // =========================================
            // VENTA TOTAL
            // =========================================

            {

              label:
                "VENTA TOTAL",

              data:
                resumen.ventaTotal,

              borderColor:
                "#f9d88c",

              backgroundColor:
                "#f9d88c",

              pointBackgroundColor:
                "#f9d88c",

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
                0.3,

              yAxisID:
                "y"

            },


            // =========================================
            // NETWIN
            // =========================================

            {

              label:
                "NETWIN ($)",

              data:
                resumen.netwin,

              borderColor:
                "#cdb4db",

              backgroundColor:
                "#cdb4db",

              pointBackgroundColor:
                "#cdb4db",

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
                0.3,

              yAxisID:
                "y"

            },


            // =========================================
            // T.C
            // =========================================

            {

              label:
                "T.C",

              data:
                resumen.tc,

              borderColor:
                "#f4b183",

              backgroundColor:
                "#f4b183",

              pointBackgroundColor:
                "#f4b183",

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
                0.3,

              yAxisID:
                "tc"

            },


            // =========================================
            // % PAGO
            // =========================================

            {

              label:
                "% PAGO",

              data:
                resumen.pago,

              borderColor:
                "#f3a6b8",

              backgroundColor:
                "#f3a6b8",

              pointBackgroundColor:
                "#f3a6b8",

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
                0.3,

              yAxisID:
                "pago"

            }

          ]

        },


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

              position:
                "bottom",

              labels: {

                usePointStyle:
                  true,

                padding:
                  18,

                color:
                  "#5f6b7d",

                font: {

                  size:
                    11

                }

              }

            },


            tooltip: {

              backgroundColor:
                "#263248",

              titleColor:
                "#ffffff",

              bodyColor:
                "#ffffff",

              padding:
                12,

              displayColors:
                true

            }

          },


          scales: {


            // =======================================
            // ESCALA PRINCIPAL
            // =======================================

            y: {

              type:
                "linear",

              position:
                "left",

              beginAtZero:
                true,

              grid: {

                color:
                  "#edf0f4"

              },

              ticks: {

                color:
                  "#7b8498",

                callback:
                  function (valor) {

                    return formatearNumero(
                      valor
                    );

                  }

              }

            },


            // =======================================
            // T.C
            // =======================================

            tc: {

              type:
                "linear",

              position:
                "right",

              beginAtZero:
                false,

              grid: {

                drawOnChartArea:
                  false

              },

              ticks: {

                color:
                  "#c38a58",

                callback:
                  function (valor) {

                    return Number(
                      valor
                    ).toFixed(2);

                  }

              }

            },


            // =======================================
            // % PAGO
            // =======================================

            pago: {

              type:
                "linear",

              position:
                "right",

              beginAtZero:
                true,

              min:
                0,

              max:
                100,

              grid: {

                drawOnChartArea:
                  false

              },

              ticks: {

                color:
                  "#c47788",

                callback:
                  function (valor) {

                    return valor +
                      " %";

                  }

              }

            },


            x: {

              grid: {

                color:
                  "#f0f2f5"

              },

              ticks: {

                color:
                  "#6f7b8f"

              }

            }

          }

        }

      }
    );

}


// ======================================================
// CONSTRUIR RESUMEN MENSUAL
// ======================================================

function construirResumenMensual() {


  const grupos = {};


  MESES_2026.forEach(
    function (mes) {

      grupos[mes] = {

        coinProm: [],

        coinTotal: 0,

        ventaProm: [],

        ventaTotal: 0,

        netwin: 0,

        tc: [],

        pago: []

      };

    }
  );


  datosFiltrados.forEach(
    function (registro) {


      const año =
        Number(
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
        !grupos[mes]
      ) {

        return;

      }


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


      grupos[mes]
        .coinProm
        .push(
          coinProm
        );


      grupos[mes]
        .coinTotal +=
        coin;


      grupos[mes]
        .ventaProm
        .push(
          ventaProm
        );


      grupos[mes]
        .ventaTotal +=
        venta;


      grupos[mes]
        .netwin +=
        netwin;


      if (
        tc !== null
      ) {

        grupos[mes]
          .tc
          .push(tc);

      }


      if (
        pago !== null
      ) {

        grupos[mes]
          .pago
          .push(pago);

      }

    }
  );


  return {

    labels:
      MESES_2026,

    coinProm:
      MESES_2026.map(
        function (mes) {

          return promedioArray(
            grupos[mes].coinProm
          );

        }
      ),

    coinTotal:
      MESES_2026.map(
        function (mes) {

          return grupos[mes]
            .coinTotal;

        }
      ),

    ventaProm:
      MESES_2026.map(
        function (mes) {

          return promedioArray(
            grupos[mes].ventaProm
          );

        }
      ),

    ventaTotal:
      MESES_2026.map(
        function (mes) {

          return grupos[mes]
            .ventaTotal;

        }
      ),

    netwin:
      MESES_2026.map(
        function (mes) {

          return grupos[mes]
            .netwin;

        }
      ),

    tc:
      MESES_2026.map(
        function (mes) {

          return promedioArray(
            grupos[mes].tc
          );

        }
      ),

    pago:
      MESES_2026.map(
        function (mes) {

          return promedioArray(
            grupos[mes].pago
          );

        }
      )

  };

}


// ======================================================
// TABLA
// ======================================================

function actualizarTabla() {


  const cuerpo =
    document.getElementById(
      "tablaCuerpo"
    );


  if (!cuerpo) return;


  const resumen =
    construirResumenMensual();


  cuerpo.innerHTML = "";


  resumen.labels.forEach(
    function (mes, indice) {


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
          ${formatearDecimal(
            resumen.pago[indice]
          )} %
        </td>

      `;


      cuerpo.appendChild(
        fila
      );

    }
  );

}


// ======================================================
// SUMAR CAMPO
// ======================================================

function sumarCampo(
  datos,
  campo
) {


  return datos.reduce(
    function (
      total,
      registro
    ) {


      const numero =
        obtenerNumero(
          registro[campo]
        );


      return total +
        (
          numero === null
            ? 0
            : numero
        );

    },
    0
  );

}


// ======================================================
// PROMEDIO
// ======================================================

function promedioCampo(
  datos,
  campo
) {


  const valores =
    datos

      .map(
        function (registro) {

          return obtenerNumero(
            registro[campo]
          );

        }
      )

      .filter(
        function (valor) {

          return valor !== null;

        }
      );


  return promedioArray(
    valores
  );

}


// ======================================================
// PROMEDIO ARRAY
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


  const suma =
    valores.reduce(
      function (
        total,
        valor
      ) {

        return total +
          Number(valor || 0);

      },
      0
    );


  return suma /
    valores.length;

}


// ======================================================
// OBTENER NÚMERO
// ======================================================

function obtenerNumero(
  valor
) {


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


  // Quitar símbolos de porcentaje
  texto =
    texto.replace(
      /%/g,
      ""
    );


  // Quitar separadores de miles
  // conservando decimal

  texto =
    texto.replace(
      /,/g,
      ""
    );


  const numero =
    Number(texto);


  return Number.isFinite(numero)
    ? numero
    : null;

}


// ======================================================
// NORMALIZAR MES
// ======================================================

function normalizarMes(
  valor
) {


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


  // Quitar acentos

  mes =
    mes.normalize(
      "NFD"
    ).replace(
      /[\u0300-\u036f]/g,
      ""
    );


  // Si viene como número

  const numero =
    Number(mes);


  if (
    Number.isInteger(numero) &&
    numero >= 1 &&
    numero <= 12
  ) {

    return MESES_2026[
      numero - 1
    ];

  }


  return mes;

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
// FORMATEAR DECIMAL
// ======================================================

function formatearDecimal(
  valor
) {


  const numero =
    Number(valor) || 0;


  return numero.toLocaleString(
    "es-PE",
    {
      minimumFractionDigits: 2,
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
