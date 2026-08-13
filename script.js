/* ======================================================
   CONFIGURACIÓN
====================================================== */


/*
  Google Sheets

  Archivo:
  1kR5qsAetOMi2Szb4c-gVo3vVhZhwJUC_AgSNI13eluY

  Hoja:
  DATA

  GID:
  683959855
*/

const URL_DATOS =
  "https://docs.google.com/spreadsheets/d/1kR5qsAetOMi2Szb4c-gVo3vVhZhwJUC_AgSNI13eluY/export?format=csv&gid=683959855";


let datosOriginales = [];

let datosFiltrados = [];

let graficoMensual = null;


/* ======================================================
   MESES
====================================================== */

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


/* ======================================================
   INICIO
====================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    configurarEventos();

    cargarDatos();

  }
);


/* ======================================================
   EVENTOS
====================================================== */

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


/* ======================================================
   CARGAR DATOS DIRECTAMENTE DESDE GOOGLE SHEETS
====================================================== */

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


    const url =
      URL_DATOS +
      "&t=" +
      Date.now();


    const respuesta =
      await fetch(url);


    if (!respuesta.ok) {

      throw new Error(
        "Error HTTP: " +
        respuesta.status
      );

    }


    const texto =
      await respuesta.text();


    if (!texto) {

      throw new Error(
        "Google Sheets devolvió datos vacíos."
      );

    }


    const resultado =
      Papa.parse(
        texto,
        {

          header: true,

          skipEmptyLines: true,

          transformHeader:
            function (header) {

              return header
                .trim();

            }

        }
      );


    if (
      resultado.errors &&
      resultado.errors.length > 0
    ) {

      console.warn(
        "Advertencias CSV:",
        resultado.errors
      );

    }


    datosOriginales =
      resultado.data
        .filter(
          function (fila) {

            return Object.values(fila)
              .some(
                function (valor) {

                  return String(
                    valor ?? ""
                  ).trim() !== "";

                }
              );

          }
        );


    if (
      datosOriginales.length === 0
    ) {

      throw new Error(
        "No se encontraron registros en DATA."
      );

    }


    console.log(
      "Datos cargados:",
      datosOriginales
    );


    console.log(
      "Columnas:",
      Object.keys(
        datosOriginales[0]
      )
    );


    datosFiltrados =
      [
        ...datosOriginales
      ];


    if (textoConexion) {

      textoConexion.textContent =
        "Google Sheets conectado";

    }


    if (indicador) {

      indicador.style.background =
        "#5ca77d";

    }


    llenarFiltros();

    actualizarDashboard();


  }
  catch (error) {

    console.error(
      "ERROR:",
      error
    );


    if (textoConexion) {

      textoConexion.textContent =
        "Error de conexión";

    }


    if (indicador) {

      indicador.style.background =
        "#dc7777";

    }


    mostrarErrorConexion(
      error.message
    );

  }

}


/* ======================================================
   ERROR
====================================================== */

function mostrarErrorConexion(
  mensaje
) {

  const cuerpo =
    document.getElementById(
      "tablaCuerpo"
    );


  if (!cuerpo) return;


  cuerpo.innerHTML = `

    <tr>

      <td
        colspan="8"
        style="
          text-align:center;
          padding:35px;
          color:#c56f6f;
        "
      >

        No se pudieron cargar los datos.

        <br><br>

        <small>
          ${mensaje}
        </small>

      </td>

    </tr>

  `;

}


/* ======================================================
   FILTROS
====================================================== */

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


/* ======================================================
   SELECT
====================================================== */

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


/* ======================================================
   FILTRO MES
====================================================== */

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


/* ======================================================
   APLICAR FILTROS
====================================================== */

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


        if (
          sala &&
          normalizarTexto(
            registro["LOCAL"]
          ) !==
          normalizarTexto(sala)
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
          normalizarTexto(
            registro["Modelo Com."]
          ) !==
          normalizarTexto(modelo)
        ) {

          return false;

        }


        if (
          numero &&
          normalizarTexto(
            registro["Nro."]
          ) !==
          normalizarTexto(numero)
        ) {

          return false;

        }


        if (
          juego &&
          normalizarTexto(
            registro["Juego"]
          ) !==
          normalizarTexto(juego)
        ) {

          return false;

        }


        return true;

      }
    );


  actualizarDashboard();

}


/* ======================================================
   OBTENER SELECT
====================================================== */

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


/* ======================================================
   LIMPIAR FILTROS
====================================================== */

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
    [
      ...datosOriginales
    ];


  actualizarDashboard();

}


/* ======================================================
   DASHBOARD
====================================================== */

function actualizarDashboard() {

  actualizarContador();

  actualizarKPI();

  crearGraficoMensual();

  actualizarTabla();

}


/* ======================================================
   CONTADOR
====================================================== */

function actualizarContador() {

  establecerTexto(
    "contadorResultados",
    formatearNumero(
      datosFiltrados.length
    )
  );

}


/* ======================================================
   KPI
====================================================== */

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


/* ======================================================
   GRÁFICO
====================================================== */

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

            crearSerie(
              "COIN PROM",
              resumen.coinProm,
              "#9ecae1",
              "y"
            ),


            crearSerie(
              "COIN TOTAL",
              resumen.coinTotal,
              "#a8d5ba",
              "y"
            ),


            crearSerie(
              "VENTA PROM",
              resumen.ventaProm,
              "#f5d98b",
              "y"
            ),


            crearSerie(
              "VENTA TOTAL",
              resumen.ventaTotal,
              "#c9b6dc",
              "y"
            ),


            crearSerie(
              "NETWIN ($)",
              resumen.netwin,
              "#e8b4c3",
              "y"
            ),


            crearSerie(
              "T.C",
              resumen.tc,
              "#efc39b",
              "tc"
            ),


            crearSerie(
              "% PAGO",
              resumen.pago,
              "#b7c9e2",
              "pago"
            )

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
                  16,

                color:
                  "#667386",

                font: {

                  size:
                    11

                }

              }

            },


            tooltip: {

              backgroundColor:
                "#334155",

              titleColor:
                "#ffffff",

              bodyColor:
                "#ffffff",

              padding:
                11,

              displayColors:
                true

            }

          },


          scales: {

            y: {

              beginAtZero:
                true,

              grid: {

                color:
                  "#edf0f4"

              },

              ticks: {

                color:
                  "#7c8797",

                callback:
                  function (valor) {

                    return formatearNumero(
                      valor
                    );

                  }

              }

            },


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
                  "#b5835d",

                callback:
                  function (valor) {

                    return Number(
                      valor
                    ).toFixed(2);

                  }

              }

            },


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
                  "#a46f80",

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


/* ======================================================
   CREAR SERIE
====================================================== */

function crearSerie(
  nombre,
  datos,
  color,
  eje
) {

  return {

    label:
      nombre,

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
      0.3,

    yAxisID:
      eje,

    spanGaps:
      true

  };

}


/* ======================================================
   RESUMEN MENSUAL
====================================================== */

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
        obtenerNumero(
          registro["AÑO"]
        );


      if (
        año !== null &&
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


      if (
        coinProm !== null
      ) {

        grupos[mes]
          .coinProm
          .push(coinProm);

      }


      if (
        coin !== null
      ) {

        grupos[mes]
          .coinTotal += coin;

      }


      if (
        ventaProm !== null
      ) {

        grupos[mes]
          .ventaProm
          .push(ventaProm);

      }


      if (
        venta !== null
      ) {

        grupos[mes]
          .ventaTotal += venta;

      }


      if (
        netwin !== null
      ) {

        grupos[mes]
          .netwin += netwin;

      }


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


/* ======================================================
   TABLA
====================================================== */

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


/* ======================================================
   SUMAR
====================================================== */

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


/* ======================================================
   PROMEDIO CAMPO
====================================================== */

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


/* ======================================================
   PROMEDIO ARRAY
====================================================== */

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


/* ======================================================
   OBTENER NÚMERO
====================================================== */

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


  texto =
    texto.replace(
      /%/g,
      ""
    );


  /*
    Manejo de números:

    1,234.56
    1234.56
    1234,56
  */

  if (
    texto.includes(",") &&
    texto.includes(".")
  ) {

    texto =
      texto.replace(
        /,/g,
        ""
      );

  }
  else if (
    texto.includes(",")
  ) {

    texto =
      texto.replace(
        ",",
        "."
      );

  }


  texto =
    texto.replace(
      /[^\d.-]/g,
      ""
    );


  const numero =
    Number(texto);


  return Number.isFinite(numero)
    ? numero
    : null;

}


/* ======================================================
   NORMALIZAR TEXTO
====================================================== */

function normalizarTexto(
  valor
) {

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


/* ======================================================
   NORMALIZAR MES
====================================================== */

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

    return MESES_2026[
      numero - 1
    ];

  }


  return mes;

}


/* ======================================================
   FORMATEAR NÚMERO
====================================================== */

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


/* ======================================================
   FORMATEAR DECIMAL
====================================================== */

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


/* ======================================================
   ESTABLECER TEXTO
====================================================== */

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


/* ======================================================
   ACTUALIZACIÓN AUTOMÁTICA
====================================================== */

setInterval(
  function () {

    cargarDatos();

  },
  5 * 60 * 1000
);
