// ======================================================
// DASHBOARD DE PRODUCCIÓN
// GOOGLE SHEETS + RANKING + GRÁFICOS + TABLA FINAL
// ======================================================


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
// COLUMNAS UTILIZADAS
//
// A = 0  Marca / Tipo / Version
// C = 2  Maquina
// F = 5  Juego
//
// H = 7  COIN
// I = 8  COIN PROM
// J = 9  VENTA
// K = 10 VENTA PROM
// L = 11 NETWIN
// M = 12 G.PLAYED
// N = 13 % PAGO
//
// P = 15 LOCAL
// Q = 16 MES
// R = 17 AÑO
// T = 19 T.C.
//
// B NO SE UTILIZA
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


const INDICADORES = [
  "COIN",
  "COIN PROM",
  "VENTA",
  "VENTA PROM",
  "NETWIN ($)",
  "G.PLAYED",
  "% PAGO",
  "T.C"
];


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
    "filtroAnio",
    "filtroMes",
    "filtroMarca",
    "filtroSerie",
    "filtroJuego",
    "filtroIndicador"
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
// CARGAR DATOS
// ======================================================

async function cargarDatos() {

  cambiarConexion(
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
      convertirGViz(texto);


    if (
      !datos.length
    ) {

      throw new Error(
        "No se encontraron registros."
      );

    }


    datosOriginales =
      datos;


    datosFiltrados =
      [...datosOriginales];


    cambiarConexion(
      "Google Sheets conectado",
      "#25a55f"
    );


    llenarTodosLosFiltros();

    actualizarDashboard();

  }

  catch (error) {

    console.error(error);

    cambiarConexion(
      "Error al conectar con Google Sheets",
      "#d92d20"
    );

  }

}


// ======================================================
// CONVERTIR GVIZ
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
      "Respuesta JSON inválida."
    );

  }


  const json =
    JSON.parse(
      texto.substring(
        inicio,
        fin + 1
      )
    );


  const filas =
    json.table?.rows || [];


  return filas.map(
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

        gPlayed:
          obtenerCelda(c, 12),

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
// OBTENER CELDA
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
// FILTROS
// ======================================================

function llenarTodosLosFiltros() {

  llenarSelect(
    "filtroSala",
    "local",
    "TODOS"
  );


  llenarSelect(
    "filtroMarca",
    "marca",
    "TODOS"
  );


  llenarSelect(
    "filtroSerie",
    "maquina",
    "TODAS"
  );


  llenarSelect(
    "filtroJuego",
    "juego",
    "TODOS"
  );


  llenarSelect(
    "filtroAnio",
    "anio",
    "TODOS"
  );


  llenarMes();

}


// ======================================================
// SELECT
// ======================================================

function llenarSelect(
  id,
  campo,
  texto
) {

  const select =
    document.getElementById(id);


  if (!select) return;


  const anterior =
    select.value;


  select.innerHTML = "";


  const inicial =
    document.createElement("option");


  inicial.value = "";
  inicial.textContent = texto;


  select.appendChild(
    inicial
  );


  const valores =
    [
      ...new Set(

        datosOriginales

          .map(
            registro =>
              limpiarTexto(
                registro[campo]
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
          numeric: true
        }
      )
  );


  valores.forEach(
    valor => {

      const opcion =
        document.createElement("option");


      opcion.value = valor;

      opcion.textContent = valor;


      select.appendChild(
        opcion
      );

    }
  );


  if (
    valores.includes(
      anterior
    )
  ) {

    select.value =
      anterior;

  }

}


// ======================================================
// MES
// ======================================================

function llenarMes() {

  const select =
    document.getElementById(
      "filtroMes"
    );


  if (!select) return;


  select.innerHTML =
    `<option value="">TODOS</option>`;


  MESES.forEach(
    mes => {

      const opcion =
        document.createElement(
          "option"
        );


      opcion.value = mes;

      opcion.textContent = mes;


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
    valorFiltro("filtroSala");

  const anio =
    valorFiltro("filtroAnio");

  const mes =
    valorFiltro("filtroMes");

  const marca =
    valorFiltro("filtroMarca");

  const serie =
    valorFiltro("filtroSerie");

  const juego =
    valorFiltro("filtroJuego");


  datosFiltrados =
    datosOriginales.filter(
      registro => {

        if (
          sala &&
          limpiarTexto(registro.local)
          !== sala
        ) return false;


        if (
          anio &&
          limpiarTexto(registro.anio)
          !== anio
        ) return false;


        if (
          mes &&
          normalizarMes(registro.mes)
          !== normalizarMes(mes)
        ) return false;


        if (
          marca &&
          limpiarTexto(registro.marca)
          !== marca
        ) return false;


        if (
          serie &&
          limpiarTexto(registro.maquina)
          !== serie
        ) return false;


        if (
          juego &&
          limpiarTexto(registro.juego)
          !== juego
        ) return false;


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
    "filtroAnio",
    "filtroMes",
    "filtroMarca",
    "filtroSerie",
    "filtroJuego"
  ]
  .forEach(
    id => {

      const elemento =
        document.getElementById(id);

      if (elemento) {

        elemento.value = "";

      }

    }
  );


  document.getElementById(
    "filtroIndicador"
  ).value = "COIN";


  datosFiltrados =
    [...datosOriginales];


  actualizarDashboard();

}


// ======================================================
// ACTUALIZAR DASHBOARD
// ======================================================

function actualizarDashboard() {

  actualizarKPIs();

  actualizarIndicadores();

  construirRanking();

  construirGraficoRanking();

  construirGraficoEvolucion();

  construirGraficoDistribucion();

  construirTabla();

}


// ======================================================
// INDICADOR SELECCIONADO
// ======================================================

function indicadorSeleccionado() {

  return document.getElementById(
    "filtroIndicador"
  )?.value || "COIN";

}


// ======================================================
// OBTENER CAMPO INDICADOR
// ======================================================

function obtenerValorIndicador(
  registro,
  indicador
) {

  const campos = {

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

    "G.PLAYED":
      "gPlayed",

    "% PAGO":
      "pago",

    "T.C":
      "tc"

  };


  return obtenerNumero(
    registro[
      campos[indicador]
    ]
  );

}


// ======================================================
// KPI
// ======================================================

function actualizarKPIs() {

  const indicador =
    indicadorSeleccionado();


  const valores =
    datosFiltrados

      .map(
        registro =>
          obtenerValorIndicador(
            registro,
            indicador
          )
      )

      .filter(
        valor =>
          valor !== null
      );


  const promedio =
    promedioArray(valores);


  const total =
    valores.reduce(
      (suma, valor) =>
        suma + valor,
      0
    );


  const ranking =
    obtenerRanking();


  const mejor =
    ranking[0];


  establecerTexto(
    "kpiRegistros",
    formatearNumero(
      datosFiltrados.length
    )
  );


  establecerTexto(
    "kpiIndicador",
    indicador
  );


  establecerTexto(
    "kpiPromedio",
    formatearNumero(
      promedio
    )
  );


  establecerTexto(
    "kpiTotal",
    formatearNumero(
      total
    )
  );


  establecerTexto(
    "kpiMejorSerie",
    mejor
      ? mejor.serie
      : "-"
  );

}


// ======================================================
// INDICADORES RESUMEN
// ======================================================

function actualizarIndicadores() {

  const calcular =
    campo => {

      const valores =
        datosFiltrados

          .map(
            registro =>
              obtenerNumero(
                registro[campo]
              )
          )

          .filter(
            valor =>
              valor !== null
          );


      return promedioArray(
        valores
      );

    };


  const total =
    campo => {

      const valores =
        datosFiltrados

          .map(
            registro =>
              obtenerNumero(
                registro[campo]
              )
          )

          .filter(
            valor =>
              valor !== null
          );


      return valores.reduce(
        (a, b) =>
          a + b,
        0
      );

    };


  establecerTexto(
    "detalleCoin",
    formatearNumero(
      total("coin")
    )
  );


  establecerTexto(
    "detalleCoinProm",
    formatearNumero(
      calcular("coinProm")
    )
  );


  establecerTexto(
    "detalleVenta",
    formatearNumero(
      total("venta")
    )
  );


  establecerTexto(
    "detalleVentaProm",
    formatearNumero(
      calcular("ventaProm")
    )
  );


  establecerTexto(
    "detalleNetwin",
    formatearNumero(
      total("netwin")
    )
  );


  establecerTexto(
    "detalleGPlayed",
    formatearNumero(
      total("gPlayed")
    )
  );


  establecerTexto(
    "detallePago",
    promedioArray(
      datosFiltrados
        .map(
          r =>
            obtenerNumero(r.pago)
        )
        .filter(
          v => v !== null
        )
    ).toFixed(2) + "%"
  );


  establecerTexto(
    "detalleTC",
    promedioArray(
      datosFiltrados
        .map(
          r =>
            obtenerNumero(r.tc)
        )
        .filter(
          v => v !== null
        )
    ).toFixed(2)
  );

}


// ======================================================
// RANKING
// ======================================================

function obtenerRanking() {

  const indicador =
    indicadorSeleccionado();


  const grupos = {};


  datosFiltrados.forEach(
    registro => {

      const serie =
        limpiarTexto(
          registro.maquina
        );


      if (!serie) return;


      const valor =
        obtenerValorIndicador(
          registro,
          indicador
        );


      if (valor === null) return;


      if (!grupos[serie]) {

        grupos[serie] = {

          serie: serie,

          valor: 0,

          registros: 0,

          juego:
            registro.juego

        };

      }


      grupos[serie].valor += valor;

      grupos[serie].registros++;

    }
  );


  return Object.values(grupos)

    .sort(
      (a, b) =>
        b.valor - a.valor
    )

    .slice(0, 10);

}


// ======================================================
// LISTA RANKING
// ======================================================

function construirRanking() {

  const contenedor =
    document.getElementById(
      "rankingLista"
    );


  if (!contenedor) return;


  const ranking =
    obtenerRanking();


  contenedor.innerHTML = "";


  if (!ranking.length) {

    contenedor.innerHTML =
      `<div class="ranking-item">
        Sin datos para mostrar
       </div>`;

    return;

  }


  ranking.forEach(
    (item, indice) => {

      const fila =
        document.createElement(
          "div"
        );


      fila.className =
        "ranking-item";


      fila.innerHTML = `

        <div class="ranking-posicion">
          ${indice + 1}
        </div>

        <div class="ranking-info">

          <span class="ranking-serie">
            ${escaparHTML(item.serie)}
          </span>

          <span class="ranking-juego">
            ${escaparHTML(item.juego || "-")}
          </span>

        </div>

        <div class="ranking-valor">
          ${formatearNumero(item.valor)}
        </div>

      `;


      contenedor.appendChild(
        fila
      );

    }
  );


  establecerTexto(
    "rankingSubtitulo",
    "Top 10 por " +
    indicadorSeleccionado()
  );


  establecerTexto(
    "indicadorActivo",
    indicadorSeleccionado()
  );

}


// ======================================================
// GRÁFICO RANKING
// ======================================================

function construirGraficoRanking() {

  const canvas =
    document.getElementById(
      "graficoRanking"
    );


  if (!canvas) return;


  destruirGrafico(
    "graficoRanking"
  );


  const ranking =
    obtenerRanking();


  graficos.graficoRanking =
    new Chart(
      canvas,
      {

        type: "bar",

        data: {

          labels:
            ranking.map(
              item =>
                item.serie
            ),

          datasets: [

            {

              label:
                indicadorSeleccionado(),

              data:
                ranking.map(
                  item =>
                    item.valor
                ),

              backgroundColor:
                "#b91c1c",

              borderRadius:
                5

            }

          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio:
            false,

          indexAxis:
            "y",

          plugins: {

            legend: {
              display: false
            }

          },

          scales: {

            x: {

              beginAtZero: true,

              grid: {
                color: "#edf0f3"
              },

              ticks: {
                color: "#667085"
              }

            },

            y: {

              grid: {
                display: false
              },

              ticks: {
                color: "#475467",
                font: {
                  size: 10
                }
              }

            }

          }

        }

      }
    );

}


// ======================================================
// GRÁFICO EVOLUCIÓN
// ======================================================

function construirGraficoEvolucion() {

  const canvas =
    document.getElementById(
      "graficoEvolucion"
    );


  if (!canvas) return;


  destruirGrafico(
    "graficoEvolucion"
  );


  const indicador =
    indicadorSeleccionado();


  const grupos = {};


  datosFiltrados.forEach(
    registro => {

      const mes =
        normalizarMes(
          registro.mes
        );


      if (
        !MESES.includes(mes)
      ) return;


      const valor =
        obtenerValorIndicador(
          registro,
          indicador
        );


      if (
        valor === null
      ) return;


      if (
        !grupos[mes]
      ) {

        grupos[mes] = [];

      }


      grupos[mes].push(
        valor
      );

    }
  );


  const labels =
    MESES.filter(
      mes =>
        grupos[mes]
    );


  const valores =
    labels.map(
      mes =>
        promedioArray(
          grupos[mes]
        )
    );


  graficos.graficoEvolucion =
    new Chart(
      canvas,
      {

        type: "line",

        data: {

          labels,

          datasets: [

            {

              label:
                indicador,

              data:
                valores,

              borderColor:
                "#b91c1c",

              backgroundColor:
                "rgba(185,28,28,.08)",

              pointBackgroundColor:
                "#b91c1c",

              pointRadius:
                4,

              borderWidth:
                2.5,

              tension:
                .3,

              fill:
                true

            }

          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio:
            false,

          interaction: {

            mode: "index",

            intersect: false

          },

          plugins: {

            legend: {
              display: false
            }

          },

          scales: {

            x: {

              grid: {
                display: false
              },

              ticks: {
                color: "#667085"
              }

            },

            y: {

              beginAtZero: false,

              grid: {
                color: "#edf0f3"
              },

              ticks: {
                color: "#667085"
              }

            }

          }

        }

      }
    );

}


// ======================================================
// GRÁFICO DISTRIBUCIÓN
// ======================================================

function construirGraficoDistribucion() {

  const canvas =
    document.getElementById(
      "graficoDistribucion"
    );


  if (!canvas) return;


  destruirGrafico(
    "graficoDistribucion"
  );


  const ranking =
    obtenerRanking()
      .slice(0, 6);


  if (!ranking.length) return;


  graficos.graficoDistribucion =
    new Chart(
      canvas,
      {

        type: "doughnut",

        data: {

          labels:
            ranking.map(
              item =>
                item.serie
            ),

          datasets: [

            {

              data:
                ranking.map(
                  item =>
                    Math.abs(item.valor)
                ),

              backgroundColor: [

                "#b91c1c",
                "#d64545",
                "#e36b6b",
                "#ed9292",
                "#f3b3b3",
                "#f8d2d2"

              ],

              borderWidth:
                2,

              borderColor:
                "#ffffff"

            }

          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio:
            false,

          cutout:
            "58%",

          plugins: {

            legend: {

              position:
                "bottom",

              labels: {

                color:
                  "#667085",

                font: {
                  size: 10
                },

                usePointStyle:
                  true

              }

            }

          }

        }

      }
    );

}


// ======================================================
// TABLA FINAL
// ======================================================

function construirTabla() {

  const cuerpo =
    document.getElementById(
      "tablaCuerpo"
    );


  if (!cuerpo) return;


  cuerpo.innerHTML = "";


  datosFiltrados.forEach(
    registro => {

      const fila =
        document.createElement(
          "tr"
        );


      fila.innerHTML = `

        <td>
          ${escaparHTML(registro.marca)}
        </td>

        <td>
          ${escaparHTML(registro.maquina)}
        </td>

        <td>
          ${escaparHTML(registro.juego)}
        </td>

        <td>
          ${formatearNumero(
            obtenerNumero(registro.coin)
          )}
        </td>

        <td>
          ${formatearNumero(
            obtenerNumero(registro.coinProm)
          )}
        </td>

        <td>
          ${formatearNumero(
            obtenerNumero(registro.venta)
          )}
        </td>

        <td>
          ${formatearNumero(
            obtenerNumero(registro.ventaProm)
          )}
        </td>

        <td>
          ${formatearNumero(
            obtenerNumero(registro.netwin)
          )}
        </td>

        <td>
          ${formatearNumero(
            obtenerNumero(registro.gPlayed)
          )}
        </td>

        <td>
          ${formatearNumero(
            obtenerNumero(registro.pago)
          )}%
        </td>

        <td>
          ${Number(
            obtenerNumero(registro.tc) || 0
          ).toFixed(2)}
        </td>

        <td>
          ${escaparHTML(registro.local)}
        </td>

        <td>
          ${escaparHTML(
            normalizarMes(registro.mes)
          )}
        </td>

        <td>
          ${escaparHTML(registro.anio)}
        </td>

      `;


      cuerpo.appendChild(
        fila
      );

    }
  );


  establecerTexto(
    "contadorTabla",
    datosFiltrados.length +
    " registros"
  );

}


// ======================================================
// DESTRUIR GRÁFICO
// ======================================================

function destruirGrafico(id) {

  if (graficos[id]) {

    graficos[id].destroy();

    graficos[id] =
      null;

  }

}


// ======================================================
// CONEXIÓN
// ======================================================

function cambiarConexion(
  texto,
  color
) {

  establecerTexto(
    "textoConexion",
    texto
  );


  const punto =
    document.getElementById(
      "indicadorConexion"
    );


  if (punto) {

    punto.style.background =
      color;

  }

}


// ======================================================
// VALOR FILTRO
// ======================================================

function valorFiltro(id) {

  return limpiarTexto(
    document.getElementById(id)
      ?.value || ""
  );

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
// MES
// ======================================================

function normalizarMes(valor) {

  let mes =
    limpiarTexto(valor);


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


  return equivalencias[mes]
    || mes;

}


// ======================================================
// NÚMERO
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
          .replace(/\./g, "")
          .replace(",", ".");

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
      partes.length === 2 &&
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

function promedioArray(valores) {

  if (
    !valores ||
    !valores.length
  ) {

    return 0;

  }


  return valores.reduce(
    (total, valor) =>
      total + Number(valor),
    0
  ) / valores.length;

}


// ======================================================
// FORMATO NÚMERO
// ======================================================

function formatearNumero(valor) {

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
// TEXTO HTML
// ======================================================

function escaparHTML(valor) {

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
