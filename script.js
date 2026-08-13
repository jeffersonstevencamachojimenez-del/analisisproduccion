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
  "#9333ea",
  "#ea580c",
  "#0891b2",
  "#dc2626",
  "#ca8a04",
  "#4f46e5",
  "#059669",
  "#db2777"

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
    "filtroSerie",
    "filtroJuego",
    "filtroMes",
    "filtroAnio",
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
// 07. CARGAR GOOGLE SHEETS
// ======================================================

async function cargarDatos() {

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
      datos.length === 0
    ) {

      throw new Error(
        "No se encontraron datos."
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

  }

}


// ======================================================
// 08. CONVERTIR GVIZ
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
      "No se encontraron filas."
    );

  }


  return json.table.rows.map(
    fila => {

      const c =
        fila.c || [];


      return {

        // A
        marca:
          obtenerCelda(c, 0),

        // C
        serie:
          obtenerCelda(c, 2),

        // F
        juego:
          obtenerCelda(c, 5),

        // G
        dias:
          obtenerCelda(c, 6),

        // H
        coin:
          obtenerCelda(c, 7),

        // I
        coinProm:
          obtenerCelda(c, 8),

        // J
        venta:
          obtenerCelda(c, 9),

        // K
        ventaProm:
          obtenerCelda(c, 10),

        // L
        netwin:
          obtenerCelda(c, 11),

        // M
        gPlayed:
          obtenerCelda(c, 12),

        // N
        pago:
          obtenerCelda(c, 13),

        // O
        modelo:
          obtenerCelda(c, 14),

        // P
        sala:
          obtenerCelda(c, 15),

        // Q
        mes:
          obtenerCelda(c, 16),

        // R
        anio:
          obtenerCelda(c, 17),

        // T
        tc:
          obtenerCelda(c, 19)

      };

    }
  );

}


// ======================================================
// 09. OBTENER CELDA
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
// 10. ESTADO
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
// 11. LLENAR FILTROS INICIALES
// ======================================================

function llenarTodosLosFiltros() {

  actualizarFiltrosDependientes();

}


// ======================================================
// 12. APLICAR FILTROS
// ======================================================

function aplicarFiltros() {

  datosFiltrados =
    obtenerDatosSegunFiltros();


  actualizarFiltrosDependientes();


  datosFiltrados =
    obtenerDatosSegunFiltros();


  actualizarDashboard();

}


// ======================================================
// 13. OBTENER DATOS SEGÚN FILTROS
// ======================================================

function obtenerDatosSegunFiltros() {

  const sala =
    obtenerValor("filtroSala");

  const marca =
    obtenerValor("filtroMarca");

  const serie =
    obtenerValor("filtroSerie");

  const juego =
    obtenerValor("filtroJuego");

  const mes =
    obtenerValor("filtroMes");

  const anio =
    obtenerValor("filtroAnio");


  return datosOriginales.filter(
    registro => {

      if (
        sala &&
        limpiarTexto(registro.sala) !==
        limpiarTexto(sala)
      ) {

        return false;

      }


      if (
        marca &&
        limpiarTexto(registro.marca) !==
        limpiarTexto(marca)
      ) {

        return false;

      }


      if (
        serie &&
        limpiarTexto(registro.serie) !==
        limpiarTexto(serie)
      ) {

        return false;

      }


      if (
        juego &&
        limpiarTexto(registro.juego) !==
        limpiarTexto(juego)
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
        limpiarTexto(registro.anio) !==
        limpiarTexto(anio)
      ) {

        return false;

      }


      return true;

    }
  );

}


// ======================================================
// 14. FILTROS DEPENDIENTES
// ======================================================

function actualizarFiltrosDependientes() {

  const filtrosActuales = {

    sala:
      obtenerValor("filtroSala"),

    marca:
      obtenerValor("filtroMarca"),

    serie:
      obtenerValor("filtroSerie"),

    juego:
      obtenerValor("filtroJuego"),

    mes:
      obtenerValor("filtroMes"),

    anio:
      obtenerValor("filtroAnio")

  };


  const datosParaSala =
    datosOriginales;


  const datosParaMarca =
    filtrarExcepto(
      "marca",
      filtrosActuales
    );


  const datosParaSerie =
    filtrarExcepto(
      "serie",
      filtrosActuales
    );


  const datosParaJuego =
    filtrarExcepto(
      "juego",
      filtrosActuales
    );


  const datosParaMes =
    filtrarExcepto(
      "mes",
      filtrosActuales
    );


  const datosParaAnio =
    filtrarExcepto(
      "anio",
      filtrosActuales
    );


  llenarSelectDesdeDatos(
    "filtroSala",
    datosParaSala,
    "sala",
    "Todas las salas",
    filtrosActuales.sala
  );


  llenarSelectDesdeDatos(
    "filtroMarca",
    datosParaMarca,
    "marca",
    "Todas las marcas",
    filtrosActuales.marca
  );


  llenarSelectDesdeDatos(
    "filtroSerie",
    datosParaSerie,
    "serie",
    "Todas las series",
    filtrosActuales.serie
  );


  llenarSelectDesdeDatos(
    "filtroJuego",
    datosParaJuego,
    "juego",
    "Todos los juegos",
    filtrosActuales.juego
  );


  llenarSelectDesdeDatos(
    "filtroMes",
    datosParaMes,
    "mes",
    "Todos los meses",
    filtrosActuales.mes,
    true
  );


  llenarSelectDesdeDatos(
    "filtroAnio",
    datosParaAnio,
    "anio",
    "Todos los años",
    filtrosActuales.anio
  );

}


// ======================================================
// 15. FILTRAR EXCEPTO UN CAMPO
// ======================================================

function filtrarExcepto(
  campoExcluir,
  filtros
) {

  return datosOriginales.filter(
    registro => {

      if (
        campoExcluir !== "sala" &&
        filtros.sala &&
        limpiarTexto(registro.sala) !==
        limpiarTexto(filtros.sala)
      ) {

        return false;

      }


      if (
        campoExcluir !== "marca" &&
        filtros.marca &&
        limpiarTexto(registro.marca) !==
        limpiarTexto(filtros.marca)
      ) {

        return false;

      }


      if (
        campoExcluir !== "serie" &&
        filtros.serie &&
        limpiarTexto(registro.serie) !==
        limpiarTexto(filtros.serie)
      ) {

        return false;

      }


      if (
        campoExcluir !== "juego" &&
        filtros.juego &&
        limpiarTexto(registro.juego) !==
        limpiarTexto(filtros.juego)
      ) {

        return false;

      }


      if (
        campoExcluir !== "mes" &&
        filtros.mes &&
        normalizarMes(registro.mes) !==
        normalizarMes(filtros.mes)
      ) {

        return false;

      }


      if (
        campoExcluir !== "anio" &&
        filtros.anio &&
        limpiarTexto(registro.anio) !==
        limpiarTexto(filtros.anio)
      ) {

        return false;

      }


      return true;

    }
  );

}


// ======================================================
// 16. LLENAR SELECT
// ======================================================

function llenarSelectDesdeDatos(
  id,
  datos,
  campo,
  textoInicial,
  valorSeleccionado,
  ordenarMes = false
) {

  const select =
    document.getElementById(id);


  if (!select) {

    return;

  }


  select.innerHTML = "";


  const inicial =
    document.createElement("option");


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
            registro => {

              if (campo === "mes") {

                return normalizarMes(
                  registro[campo]
                );

              }

              return limpiarTexto(
                registro[campo]
              );

            }
          )
          .filter(
            valor =>
              valor !== ""
          )
      )
    ];


  if (ordenarMes) {

    valores.sort(
      (a, b) =>
        MESES.indexOf(a) -
        MESES.indexOf(b)
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
      valorSeleccionado
    )
  ) {

    select.value =
      valorSeleccionado;

  }

}


// ======================================================
// 17. ACTUALIZAR DASHBOARD
// ======================================================

function actualizarDashboard() {

  actualizarContador();

  actualizarResumen();

  actualizarTextoSeleccion();

  construirRanking();

  construirGraficoIndicador();

  construirGraficoComparacion();

  construirGraficoMarcas();

  construirGraficoPago();

  construirTabla();

}


// ======================================================
// 18. CONTADOR
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
// 19. RESUMEN
// ======================================================

function actualizarResumen() {

  const coin =
    sumarCampo(
      datosFiltrados,
      "coin"
    );


  const venta =
    sumarCampo(
      datosFiltrados,
      "venta"
    );


  const netwin =
    sumarCampo(
      datosFiltrados,
      "netwin"
    );


  const pagos =
    datosFiltrados
      .map(
        r =>
          obtenerNumero(r.pago)
      )
      .filter(
        n =>
          n !== null
      );


  const pago =
    promedioArray(
      pagos
    );


  const maquinas =
    new Set(
      datosFiltrados
        .map(
          r =>
            limpiarTexto(r.serie)
        )
        .filter(
          x =>
            x !== ""
        )
    ).size;


  establecerTexto(
    "resumenCoin",
    formatearNumero(coin)
  );


  establecerTexto(
    "resumenVenta",
    formatearNumero(venta)
  );


  establecerTexto(
    "resumenNetwin",
    formatearNumero(netwin)
  );


  establecerTexto(
    "resumenPago",
    pago.toFixed(2) +
    "%"
  );


  establecerTexto(
    "resumenMaquinas",
    formatearNumero(maquinas)
  );

}


// ======================================================
// 20. TEXTO SELECCIÓN
// ======================================================

function actualizarTextoSeleccion() {

  const partes = [];


  const sala =
    obtenerValor("filtroSala");

  const marca =
    obtenerValor("filtroMarca");

  const serie =
    obtenerValor("filtroSerie");

  const juego =
    obtenerValor("filtroJuego");

  const mes =
    obtenerValor("filtroMes");

  const anio =
    obtenerValor("filtroAnio");


  if (sala) {

    partes.push(
      "Sala: " + sala
    );

  }


  if (marca) {

    partes.push(
      "Marca: " + marca
    );

  }


  if (serie) {

    partes.push(
      "Serie: " + serie
    );

  }


  if (juego) {

    partes.push(
      "Juego: " + juego
    );

  }


  if (mes) {

    partes.push(
      mes
    );

  }


  if (anio) {

    partes.push(
      anio
    );

  }


  establecerTexto(
    "textoSeleccion",
    partes.length
      ? partes.join(" | ")
      : "Todas las máquinas"
  );


  const indicador =
    obtenerValor(
      "filtroIndicador"
    ) ||
    "COIN";


  establecerTexto(
    "textoIndicador",
    indicador
  );

}


// ======================================================
// 21. RANKING POR MARCA
// ======================================================

function construirRanking() {

  const datos =
    agruparPorMarca(
      datosFiltrados
    );


  const labels =
    Object.keys(datos);


  const indicador =
    obtenerValor(
      "filtroIndicador"
    ) ||
    "COIN";


  const valores =
    labels.map(
      marca =>
        calcularIndicador(
          datos[marca],
          indicador
        )
    );


  crearGrafico(
    "graficoRanking",
    "bar",
    labels,
    valores,
    indicador,
    "ranking"
  );

}


// ======================================================
// 22. AGRUPAR MARCAS
// ======================================================

function agruparPorMarca(
  datos
) {

  const grupos = {};


  datos.forEach(
    registro => {

      const marca =
        limpiarTexto(
          registro.marca
        );


      if (!marca) {

        return;

      }


      if (!grupos[marca]) {

        grupos[marca] = [];

      }


      grupos[marca].push(
        registro
      );

    }
  );


  return grupos;

}


// ======================================================
// 23. GRÁFICO INDICADOR
// ======================================================

function construirGraficoIndicador() {

  const indicador =
    obtenerValor(
      "filtroIndicador"
    ) ||
    "COIN";


  const grupos = {};


  datosFiltrados.forEach(
    registro => {

      const mes =
        normalizarMes(
          registro.mes
        );


      if (!MESES.includes(mes)) {

        return;

      }


      if (!grupos[mes]) {

        grupos[mes] = [];

      }


      grupos[mes].push(
        registro
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
        calcularIndicador(
          grupos[mes],
          indicador
        )
    );


  crearGrafico(
    "graficoIndicador",
    "line",
    labels,
    valores,
    indicador,
    "mes"
  );

}


// ======================================================
// 24. COMPARACIÓN DE INDICADORES
// ======================================================

function construirGraficoComparacion() {

  const labels = [

    "COIN",

    "VENTA",

    "NETWIN",

    "COIN PROM",

    "VENTA PROM"

  ];


  const valores = [

    sumarCampo(
      datosFiltrados,
      "coin"
    ),

    sumarCampo(
      datosFiltrados,
      "venta"
    ),

    sumarCampo(
      datosFiltrados,
      "netwin"
    ),

    promedioCampo(
      datosFiltrados,
      "coinProm"
    ),

    promedioCampo(
      datosFiltrados,
      "ventaProm"
    )

  ];


  crearGrafico(
    "graficoComparacion",
    "bar",
    labels,
    valores,
    "Indicadores",
    "comparacion"
  );

}


// ======================================================
// 25. DISTRIBUCIÓN POR MARCA
// ======================================================

function construirGraficoMarcas() {

  const grupos =
    agruparPorMarca(
      datosFiltrados
    );


  const labels =
    Object.keys(grupos);


  const valores =
    labels.map(
      marca =>
        new Set(
          grupos[marca]
            .map(
              r =>
                limpiarTexto(
                  r.serie
                )
            )
            .filter(
              x =>
                x !== ""
            )
        ).size
    );


  crearGrafico(
    "graficoMarcas",
    "bar",
    labels,
    valores,
    "Cantidad de máquinas",
    "marcas"
  );

}


// ======================================================
// 26. CREAR GRÁFICO
// ======================================================

function crearGrafico(
  id,
  tipo,
  labels,
  valores,
  titulo,
  modo
) {

  const canvas =
    document.getElementById(id);


  if (!canvas) {

    return;

  }


  if (graficos[id]) {

    graficos[id].destroy();

  }


  const colores =
    labels.map(
      (_, i) =>
        COLORES[
          i %
          COLORES.length
        ]
    );


  graficos[id] =
    new Chart(
      canvas,
      {

        type: tipo,


        data: {

          labels: labels,

          datasets: [

            {

              label: titulo,

              data: valores,

              backgroundColor:
                tipo === "line"
                  ? COLORES[0]
                  : colores,

              borderColor:
                tipo === "line"
                  ? COLORES[0]
                  : colores,

              borderWidth: 2,

              borderRadius:
                tipo === "bar"
                  ? 5
                  : 0,

              tension:
                .3,

              pointRadius:
                tipo === "line"
                  ? 4
                  : 0,

              pointHoverRadius:
                tipo === "line"
                  ? 7
                  : 0,

              fill: false

            }

          ]

        },


        options: {

          responsive: true,

          maintainAspectRatio: false,


          interaction: {

            mode:
              "nearest",

            intersect:
              true

          },


          plugins: {

            legend: {

              display:
                false

            },


            tooltip: {

              backgroundColor:
                "#111827",

              padding:
                11,

              callbacks: {

                label:
                  context => {

                    return (
                      " " +
                      formatearNumero(
                        context.raw
                      )
                    );

                  }

              }

            }

          },


          scales: {

            x: {

              grid: {

                display:
                  false

              },

              ticks: {

                color:
                  "#6b7280",

                font: {

                  size:
                    10

                }

              }

            },


            y: {

              beginAtZero:
                true,

              grid: {

                color:
                  "#eef2f7"

              },

              ticks: {

                color:
                  "#6b7280",

                font: {

                  size:
                    10

                },

                callback:
                  valor =>
                    formatearNumero(
                      valor
                    )

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
              ) {

                return;

              }


              const indice =
                elementos[0].index;


              const valor =
                labels[indice];


              manejarClickGrafico(
                modo,
                valor
              );

            }

        }

      }
    );

}


// ======================================================
// 27. CLICK EN GRÁFICOS
// ======================================================

function manejarClickGrafico(
  modo,
  valor
) {

  if (modo === "ranking") {

    seleccionarFiltro(
      "filtroMarca",
      valor
    );

  }


  if (modo === "mes") {

    seleccionarFiltro(
      "filtroMes",
      valor
    );

  }


  if (modo === "marcas") {

    seleccionarFiltro(
      "filtroMarca",
      valor
    );

  }


  if (modo === "comparacion") {

    const mapa = {

      "COIN":
        "COIN",

      "VENTA":
        "VENTA",

      "NETWIN":
        "NETWIN ($)",

      "COIN PROM":
        "COIN PROM",

      "VENTA PROM":
        "VENTA PROM"

    };


    if (mapa[valor]) {

      const select =
        document.getElementById(
          "filtroIndicador"
        );


      if (select) {

        select.value =
          mapa[valor];

      }

    }

  }


  aplicarFiltros();

}


// ======================================================
// 28. SELECCIONAR FILTRO
// ======================================================

function seleccionarFiltro(
  id,
  valor
) {

  const select =
    document.getElementById(id);


  if (!select) {

    return;

  }


  const opcion =
    [...select.options]
      .find(
        option =>
          limpiarTexto(
            option.value
          ) ===
          limpiarTexto(valor)
      );


  if (opcion) {

    select.value =
      opcion.value;

  }

}


// ======================================================
// 29. GRÁFICO PAGO
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
        r =>
          obtenerNumero(
            r.pago
          )
      )
      .filter(
        n =>
          n !== null
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
    "pagoCentro",
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

                "#16a34a",

                "#e5e7eb"

              ],

              borderWidth:
                0

            }

          ]

        },


        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,

          cutout:
            "72%",


          plugins: {

            legend: {

              position:
                "bottom",

              labels: {

                usePointStyle:
                  true,

                color:
                  "#6b7280",

                font: {

                  size:
                    10

                }

              }

            }

          }

        }

      }
    );

}


// ======================================================
// 30. CONSTRUIR TABLA
// ======================================================

function construirTabla() {

  const cuerpo =
    document.getElementById(
      "tablaCuerpo"
    );


  if (!cuerpo) {

    return;

  }


  cuerpo.innerHTML = "";


  datosFiltrados.forEach(
    registro => {

      const fila =
        document.createElement(
          "tr"
        );


      fila.innerHTML = `

        <td>
          ${escaparHTML(
            registro.marca
          )}
        </td>

        <td>
          ${escaparHTML(
            registro.serie
          )}
        </td>

        <td>
          ${escaparHTML(
            registro.juego
          )}
        </td>

        <td>
          ${formatearNumero(
            obtenerNumero(
              registro.coin
            )
          )}
        </td>

        <td>
          ${formatearNumero(
            obtenerNumero(
              registro.coinProm
            )
          )}
        </td>

        <td>
          ${formatearNumero(
            obtenerNumero(
              registro.venta
            )
          )}
        </td>

        <td>
          ${formatearNumero(
            obtenerNumero(
              registro.ventaProm
            )
          )}
        </td>

        <td>
          ${formatearNumero(
            obtenerNumero(
              registro.netwin
            )
          )}
        </td>

        <td>
          ${formatearNumero(
            obtenerNumero(
              registro.gPlayed
            )
          )}
        </td>

        <td>
          ${obtenerNumero(
            registro.pago
          ) === null
            ? "0.00%"
            : obtenerNumero(
                registro.pago
              ).toFixed(2) + "%"
          }
        </td>

        <td>
          ${escaparHTML(
            registro.modelo
          )}
        </td>

        <td>
          ${escaparHTML(
            registro.sala
          )}
        </td>

        <td>
          ${escaparHTML(
            normalizarMes(
              registro.mes
            )
          )}
        </td>

        <td>
          ${escaparHTML(
            registro.anio
          )}
        </td>

        <td>
          ${obtenerNumero(
            registro.tc
          ) === null
            ? "0.00"
            : obtenerNumero(
                registro.tc
              ).toFixed(2)
          }
        </td>

      `;


      cuerpo.appendChild(
        fila
      );

    }
  );

}


// ======================================================
// 31. CALCULAR INDICADOR
// ======================================================

function calcularIndicador(
  datos,
  indicador
) {

  switch (
    indicador
  ) {

    case "COIN":

      return sumarCampo(
        datos,
        "coin"
      );


    case "COIN PROM":

      return promedioCampo(
        datos,
        "coinProm"
      );


    case "VENTA":

      return sumarCampo(
        datos,
        "venta"
      );


    case "VENTA PROM":

      return promedioCampo(
        datos,
        "ventaProm"
      );


    case "NETWIN ($)":

      return sumarCampo(
        datos,
        "netwin"
      );


    case "G.PLAYED":

      return sumarCampo(
        datos,
        "gPlayed"
      );


    case "% PAGO":

      return promedioCampo(
        datos,
        "pago"
      );


    case "T.C":

      return promedioCampo(
        datos,
        "tc"
      );


    default:

      return 0;

  }

}


// ======================================================
// 32. SUMAR CAMPO
// ======================================================

function sumarCampo(
  datos,
  campo
) {

  return datos.reduce(
    (
      total,
      registro
    ) => {

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
// 33. PROMEDIO CAMPO
// ======================================================

function promedioCampo(
  datos,
  campo
) {

  const valores =
    datos
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


// ======================================================
// 34. PROMEDIO
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
// 35. OBTENER VALOR SELECT
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
// 36. LIMPIAR TEXTO
// ======================================================

function limpiarTexto(
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


// ======================================================
// 37. NORMALIZAR MES
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


  return equivalencias[mes] ||
    mes;

}


// ======================================================
// 38. CONVERTIR A NÚMERO
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
// 39. FORMATEAR NÚMERO
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
// 40. TEXTO HTML SEGURO
// ======================================================

function escaparHTML(
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
// 41. ESTABLECER TEXTO
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
// 42. LIMPIAR FILTROS
// ======================================================

function limpiarFiltros() {

  const ids = [

    "filtroSala",

    "filtroMarca",

    "filtroSerie",

    "filtroJuego",

    "filtroMes",

    "filtroAnio"

  ];


  ids.forEach(
    id => {

      const elemento =
        document.getElementById(id);


      if (elemento) {

        elemento.value = "";

      }

    }
  );


  const indicador =
    document.getElementById(
      "filtroIndicador"
    );


  if (indicador) {

    indicador.value =
      "COIN";

  }


  datosFiltrados =
    [...datosOriginales];


  actualizarFiltrosDependientes();

  actualizarDashboard();

}


// ======================================================
// 43. ACTUALIZACIÓN AUTOMÁTICA
// ======================================================

setInterval(
  cargarDatos,
  5 * 60 * 1000
);
