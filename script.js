// ======================================================
// DASHBOARD DE PRODUCCIÓN
// GOOGLE SHEETS + FILTROS + RANKING + GRÁFICOS
// ======================================================


const SHEET_ID =
  "1kR5qsAetOMi2Szb4c-gVo3vVhZhwJUC_AgSNI13eluY";

const SHEET_GID =
  "683959855";


const URL_DATOS =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`;


let datosOriginales = [];
let datosFiltrados = [];

let graficos = {};


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


const CONFIG_INDICADORES = {

  "COIN": {
    campo: "COIN",
    tipo: "suma"
  },

  "COIN PROM": {
    campo: "COIN PROM",
    tipo: "promedio"
  },

  "VENTA": {
    campo: "VENTA",
    tipo: "suma"
  },

  "VENTA PROM": {
    campo: "VENTA PROM",
    tipo: "promedio"
  },

  "NETWIN ($)": {
    campo: "NETWIN ($)",
    tipo: "suma"
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


/* ======================================================
   INICIO
====================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

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
          manejarCambioFiltro
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


/* ======================================================
   CAMBIO DE FILTROS
====================================================== */

function manejarCambioFiltro(evento) {

  const id =
    evento.target.id;


  if (
    id === "filtroSala" ||
    id === "filtroMes" ||
    id === "filtroModelo" ||
    id === "filtroSerie" ||
    id === "filtroJuego"
  ) {

    aplicarFiltros();

  } else {

    actualizarDashboard();

  }

}


/* ======================================================
   CARGAR GOOGLE SHEETS
====================================================== */

async function cargarDatos() {

  cambiarEstado(
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
        "No existen registros."
      );

    }


    datosOriginales =
      datos;


    datosFiltrados =
      [...datosOriginales];


    llenarFiltros();


    cambiarEstado(
      "Google Sheets conectado",
      "#12b76a"
    );


    actualizarDashboard();

  }


  catch (error) {

    console.error(error);


    cambiarEstado(
      "Error al conectar con Google Sheets",
      "#f04438"
    );

  }

}


/* ======================================================
   CONVERTIR GVIZ
====================================================== */

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
      "Respuesta inválida."
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

        "Marca / Tipo / Version":
          obtenerCelda(c, 0),

        // Nro. NO SE UTILIZA

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


/* ======================================================
   CELDA
====================================================== */

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


  return celda.f || "";

}


/* ======================================================
   ESTADO
====================================================== */

function cambiarEstado(
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
    "filtroSerie",
    "Maquina",
    "Todas las series"
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
            registro =>
              limpiarTexto(
                registro[campo]
              )
          )

          .filter(
            valor =>
              valor !== ""
          )

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
   MESES
====================================================== */

function llenarFiltroMes() {

  const select =
    document.getElementById(
      "filtroMes"
    );


  if (!select) {

    return;

  }


  select.innerHTML = `

    <option value="">
      Todos los meses
    </option>

  `;


  MESES.forEach(
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


/* ======================================================
   APLICAR FILTROS
====================================================== */

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

  const serie =
    obtenerValor(
      "filtroSerie"
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


        return true;

      }
    );


  actualizarDashboard();

}


/* ======================================================
   LIMPIAR
====================================================== */

function limpiarFiltros() {

  [
    "filtroSala",
    "filtroMes",
    "filtroModelo",
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


/* ======================================================
   DASHBOARD
====================================================== */

function actualizarDashboard() {

  actualizarContador();

  actualizarKPIs();

  construirRanking();

  construirGraficos();

  construirTopBottom();

  construirDetalle();

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
   KPIs
====================================================== */

function actualizarKPIs() {

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

  const coinProm =
    promedioCampo(
      datosFiltrados,
      "COIN PROM"
    );

  const ventaProm =
    promedioCampo(
      datosFiltrados,
      "VENTA PROM"
    );

  const pago =
    promedioCampo(
      datosFiltrados,
      "% PAGO"
    );


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
    "kpiCoinProm",
    formatearNumero(coinProm)
  );

  establecerTexto(
    "kpiVentaProm",
    formatearNumero(ventaProm)
  );

  establecerTexto(
    "kpiPago",
    pago.toFixed(2) + "%"
  );

}


/* ======================================================
   RANKING
====================================================== */

function construirRanking() {

  const cuerpo =
    document.getElementById(
      "rankingCuerpo"
    );


  if (!cuerpo) return;


  const indicador =
    obtenerValor(
      "filtroIndicador"
    ) || "COIN";


  const config =
    CONFIG_INDICADORES[indicador];


  const grupos =
    agruparPor(
      datosFiltrados,
      "Modelo Com."
    );


  const ranking =
    Object.entries(grupos)
      .map(
        ([modelo, registros]) => {

          let valor;


          if (
            config.tipo === "suma"
          ) {

            valor =
              registros.reduce(
                (total, registro) =>
                  total +
                  (obtenerNumero(
                    registro[
                      config.campo
                    ]
                  ) || 0),
                0
              );

          } else {

            valor =
              promedioCampo(
                registros,
                config.campo
              );

          }


          const maquinas =
            new Set(
              registros
                .map(
                  r =>
                    limpiarTexto(
                      r["Maquina"]
                    )
                )
                .filter(Boolean)
            ).size;


          return {
            modelo,
            maquinas,
            valor
          };

        }
      )
      .filter(
        item =>
          item.modelo
      )
      .sort(
        (a, b) =>
          b.valor - a.valor
      );


  cuerpo.innerHTML = "";


  ranking.forEach(
    (item, indice) => {

      const fila =
        document.createElement(
          "tr"
        );


      fila.innerHTML = `

        <td class="posicion">
          ${indice + 1}
        </td>

        <td>
          <strong>
            ${escapeHTML(item.modelo)}
          </strong>
        </td>

        <td>
          ${item.maquinas}
        </td>

        <td>
          ${formatearIndicador(
            item.valor,
            indicador
          )}
        </td>

      `;


      cuerpo.appendChild(
        fila
      );

    }
  );

}


/* ======================================================
   GRÁFICOS
====================================================== */

function construirGraficos() {

  const indicador =
    obtenerValor(
      "filtroIndicador"
    ) || "COIN";


  construirGraficoRanking(
    indicador
  );


  construirGraficoCoinVenta();


  construirGraficoNetwin();


  construirGraficoPagoModelo();


  construirGraficoMensual();


  establecerTexto(
    "indicadorActual",
    indicador === "NETWIN ($)"
      ? "NETWIN"
      : indicador
  );

}


/* ======================================================
   GRÁFICO RANKING
====================================================== */

function construirGraficoRanking(
  indicador
) {

  const canvas =
    document.getElementById(
      "graficoRanking"
    );


  if (!canvas) return;


  destruirGrafico(
    "graficoRanking"
  );


  const config =
    CONFIG_INDICADORES[indicador];


  const grupos =
    agruparPor(
      datosFiltrados,
      "Modelo Com."
    );


  const datos =
    Object.entries(grupos)
      .map(
        ([modelo, registros]) => {

          const valor =
            config.tipo === "suma"

              ? registros.reduce(
                  (total, registro) =>
                    total +
                    (
                      obtenerNumero(
                        registro[
                          config.campo
                        ]
                      ) || 0
                    ),
                  0
                )

              : promedioCampo(
                  registros,
                  config.campo
                );


          return {
            modelo,
            valor
          };

        }
      )
      .sort(
        (a, b) =>
          b.valor - a.valor
      )
      .slice(0, 10);


  establecerTexto(
    "tituloGraficoPrincipal",
    `Top 10 modelos - ${indicador}`
  );


  graficos.graficoRanking =
    new Chart(
      canvas,
      {

        type: "bar",

        data: {

          labels:
            datos.map(
              item =>
                item.modelo
            ),

          datasets: [

            {

              label:
                indicador,

              data:
                datos.map(
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

          indexAxis:
            "y",

          responsive:
            true,

          maintainAspectRatio:
            false,

          plugins: {

            legend: {
              display: false
            }

          },

          scales: {

            x: {

              beginAtZero:
                true,

              ticks: {

                color:
                  "#667085",

                callback:
                  valor =>
                    formatearNumero(
                      valor
                    )

              }

            },

            y: {

              ticks: {
                color:
                  "#475467"
              }

            }

          }

        }

      }
    );

}


/* ======================================================
   COIN VS VENTA
====================================================== */

function construirGraficoCoinVenta() {

  const canvas =
    document.getElementById(
      "graficoCoinVenta"
    );


  if (!canvas) return;


  destruirGrafico(
    "graficoCoinVenta"
  );


  const grupos =
    agruparPor(
      datosFiltrados,
      "Modelo Com."
    );


  const datos =
    Object.entries(grupos)
      .map(
        ([modelo, registros]) => {

          return {

            modelo,

            coin:
              sumarCampo(
                registros,
                "COIN"
              ),

            venta:
              sumarCampo(
                registros,
                "VENTA"
              )

          };

        }
      )
      .sort(
        (a, b) =>
          b.coin - a.coin
      )
      .slice(0, 10);


  graficos.graficoCoinVenta =
    new Chart(
      canvas,
      {

        type: "bar",

        data: {

          labels:
            datos.map(
              d =>
                d.modelo
            ),

          datasets: [

            {
              label:
                "COIN",

              data:
                datos.map(
                  d =>
                    d.coin
                ),

              backgroundColor:
                "#8ecae6"

            },

            {
              label:
                "VENTA",

              data:
                datos.map(
                  d =>
                    d.venta
                ),

              backgroundColor:
                "#95d5b2"

            }

          ]

        },

        options: opcionesBarra()

      }
    );

}


/* ======================================================
   NETWIN
====================================================== */

function construirGraficoNetwin() {

  const canvas =
    document.getElementById(
      "graficoNetwin"
    );


  if (!canvas) return;


  destruirGrafico(
    "graficoNetwin"
  );


  const grupos =
    agruparPor(
      datosFiltrados,
      "Modelo Com."
    );


  const datos =
    Object.entries(grupos)
      .map(
        ([modelo, registros]) => {

          return {

            modelo,

            valor:
              sumarCampo(
                registros,
                "NETWIN ($)"
              )

          };

        }
      )
      .sort(
        (a, b) =>
          b.valor - a.valor
      )
      .slice(0, 10);


  graficos.graficoNetwin =
    new Chart(
      canvas,
      {

        type: "bar",

        data: {

          labels:
            datos.map(
              d =>
                d.modelo
            ),

          datasets: [

            {

              label:
                "NETWIN",

              data:
                datos.map(
                  d =>
                    d.valor
                ),

              backgroundColor:
                "#cdb4db",

              borderRadius:
                5

            }

          ]

        },

        options: opcionesBarra()

      }
    );

}


/* ======================================================
   % PAGO
====================================================== */

function construirGraficoPagoModelo() {

  const canvas =
    document.getElementById(
      "graficoPagoModelo"
    );


  if (!canvas) return;


  destruirGrafico(
    "graficoPagoModelo"
  );


  const grupos =
    agruparPor(
      datosFiltrados,
      "Modelo Com."
    );


  const datos =
    Object.entries(grupos)
      .map(
        ([modelo, registros]) => {

          return {

            modelo,

            valor:
              promedioCampo(
                registros,
                "% PAGO"
              )

          };

        }
      )
      .sort(
        (a, b) =>
          b.valor - a.valor
      )
      .slice(0, 10);


  graficos.graficoPagoModelo =
    new Chart(
      canvas,
      {

        type: "bar",

        data: {

          labels:
            datos.map(
              d =>
                d.modelo
            ),

          datasets: [

            {

              label:
                "% PAGO",

              data:
                datos.map(
                  d =>
                    d.valor
                ),

              backgroundColor:
                "#f3a6b8",

              borderRadius:
                5

            }

          ]

        },

        options: {

          ...opcionesBarra(),

          scales: {

            y: {

              beginAtZero:
                true,

              max:
                100,

              ticks: {

                callback:
                  valor =>
                    valor + "%"

              }

            }

          }

        }

      }

    );

}


/* ======================================================
   EVOLUCIÓN MENSUAL
====================================================== */

function construirGraficoMensual() {

  const canvas =
    document.getElementById(
      "graficoMensual"
    );


  if (!canvas) return;


  destruirGrafico(
    "graficoMensual"
  );


  const indicador =
    obtenerValor(
      "filtroIndicador"
    ) || "COIN";


  const config =
    CONFIG_INDICADORES[indicador];


  const grupos = {};


  MESES.forEach(
    mes => {

      grupos[mes] = [];

    }
  );


  datosFiltrados.forEach(
    registro => {

      const mes =
        normalizarMes(
          registro["MES"]
        );


      if (
        !grupos[mes]
      ) return;


      const valor =
        obtenerNumero(
          registro[
            config.campo
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


  const labels =
    MESES.filter(
      mes =>
        grupos[mes].length
    );


  const valores =
    labels.map(
      mes =>
        config.tipo === "suma"

          ? grupos[mes].reduce(
              (a, b) =>
                a + b,
              0
            )

          : promedioArray(
              grupos[mes]
            )
    );


  establecerTexto(
    "tituloMensual",
    indicador
  );


  graficos.graficoMensual =
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

              borderWidth:
                3,

              pointRadius:
                4,

              tension:
                .3,

              fill:
                true

            }

          ]

        },

        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,

          plugins: {

            legend: {
              display: false
            }

          }

        }

      }
    );

}


/* ======================================================
   TOP / BOTTOM MÁQUINAS
====================================================== */

function construirTopBottom() {

  const indicador =
    obtenerValor(
      "filtroIndicador"
    ) || "COIN";


  const config =
    CONFIG_INDICADORES[indicador];


  const grupos =
    agruparPor(
      datosFiltrados,
      "Maquina"
    );


  const maquinas =
    Object.entries(grupos)
      .map(
        ([serie, registros]) => {

          const valor =
            config.tipo === "suma"

              ? sumarCampo(
                  registros,
                  config.campo
                )

              : promedioCampo(
                  registros,
                  config.campo
                );


          const primero =
            registros[0] || {};


          return {

            serie,

            modelo:
              primero["Modelo Com."] || "",

            juego:
              primero["Juego"] || "",

            valor

          };

        }
      )
      .filter(
        item =>
          item.serie
      )
      .sort(
        (a, b) =>
          b.valor - a.valor
      );


  construirTablaMaquinas(
    "topMaquinasCuerpo",
    maquinas.slice(0, 10),
    indicador
  );


  construirTablaMaquinas(
    "bottomMaquinasCuerpo",
    maquinas
      .slice(-10)
      .reverse(),
    indicador
  );

}


/* ======================================================
   TABLA TOP/BOTTOM
====================================================== */

function construirTablaMaquinas(
  id,
  datos,
  indicador
) {

  const cuerpo =
    document.getElementById(id);


  if (!cuerpo) return;


  cuerpo.innerHTML = "";


  datos.forEach(
    (item, indice) => {

      const fila =
        document.createElement(
          "tr"
        );


      fila.innerHTML = `

        <td class="posicion">
          ${indice + 1}
        </td>

        <td>
          ${escapeHTML(item.serie)}
        </td>

        <td>
          ${escapeHTML(item.modelo)}
        </td>

        <td>
          ${escapeHTML(item.juego)}
        </td>

        <td>
          ${formatearIndicador(
            item.valor,
            indicador
          )}
        </td>

      `;


      cuerpo.appendChild(
        fila
      );

    }
  );

}


/* ======================================================
   DETALLE
====================================================== */

function construirDetalle() {

  const cuerpo =
    document.getElementById(
      "detalleCuerpo"
    );


  if (!cuerpo) return;


  cuerpo.innerHTML = "";


  const grupos =
    agruparPor(
      datosFiltrados,
      "Maquina"
    );


  Object.entries(grupos)
    .forEach(
      ([serie, registros]) => {

        const primero =
          registros[0] || {};


        const fila =
          document.createElement(
            "tr"
          );


        fila.innerHTML = `

          <td>
            ${escapeHTML(
              primero["LOCAL"] || ""
            )}
          </td>

          <td>
            ${escapeHTML(
              primero["Modelo Com."] || ""
            )}
          </td>

          <td>
            <strong>
              ${escapeHTML(serie)}
            </strong>
          </td>

          <td>
            ${escapeHTML(
              primero["Juego"] || ""
            )}
          </td>

          <td>
            ${formatearNumero(
              sumarCampo(
                registros,
                "COIN"
              )
            )}
          </td>

          <td>
            ${formatearNumero(
              sumarCampo(
                registros,
                "VENTA"
              )
            )}
          </td>

          <td>
            ${formatearNumero(
              sumarCampo(
                registros,
                "NETWIN ($)"
              )
            )}
          </td>

          <td>
            ${promedioCampo(
              registros,
              "% PAGO"
            ).toFixed(2)}%
          </td>

        `;


        cuerpo.appendChild(
          fila
        );

      }
    );

}


/* ======================================================
   UTILIDADES
====================================================== */

function obtenerValor(id) {

  const elemento =
    document.getElementById(id);


  return elemento
    ? String(
        elemento.value || ""
      ).trim()
    : "";

}


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


  return equivalencias[mes] || mes;

}


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
      .trim()
      .replace(/%/g, "");


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

    } else {

      texto =
        texto.replace(/,/g, "");

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
        texto.replace(",", ".");

    } else {

      texto =
        texto.replace(/,/g, "");

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


function sumarCampo(
  registros,
  campo
) {

  return registros.reduce(
    (total, registro) => {

      const valor =
        obtenerNumero(
          registro[campo]
        );


      return total +
        (valor === null
          ? 0
          : valor);

    },
    0
  );

}


function promedioCampo(
  registros,
  campo
) {

  const valores =
    registros
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

}


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
    (a, b) =>
      a + Number(b),
    0
  ) /
  valores.length;

}


function agruparPor(
  registros,
  campo
) {

  return registros.reduce(
    (grupos, registro) => {

      const clave =
        limpiarTexto(
          registro[campo]
        );


      if (!clave) {

        return grupos;

      }


      if (!grupos[clave]) {

        grupos[clave] = [];

      }


      grupos[clave].push(
        registro
      );


      return grupos;

    },
    {}
  );

}


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


function formatearIndicador(
  valor,
  indicador
) {

  if (
    indicador === "% PAGO"
  ) {

    return (
      Number(valor || 0)
        .toFixed(2) +
      "%"
    );

  }


  if (
    indicador === "T.C"
  ) {

    return Number(
      valor || 0
    ).toFixed(2);

  }


  return formatearNumero(
    valor
  );

}


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


function destruirGrafico(
  id
) {

  if (graficos[id]) {

    graficos[id].destroy();

    delete graficos[id];

  }

}


function opcionesBarra() {

  return {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {

        position:
          "bottom",

        labels: {

          color:
            "#667085",

          usePointStyle:
            true

        }

      }

    },

    scales: {

      x: {

        ticks: {

          color:
            "#667085"

        }

      },

      y: {

        beginAtZero:
          true,

        ticks: {

          color:
            "#667085",

          callback:
            valor =>
              formatearNumero(
                valor
              )

        }

      }

    }

  };

}


function escapeHTML(valor) {

  return String(valor)
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


/* ======================================================
   ACTUALIZACIÓN AUTOMÁTICA
====================================================== */

setInterval(
  cargarDatos,
  5 * 60 * 1000
);
