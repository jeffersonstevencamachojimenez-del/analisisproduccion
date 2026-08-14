/* ======================================================
   CONFIGURACIÓN API
====================================================== */

/*
  REEMPLAZA ESTA URL por la URL DE IMPLEMENTACIÓN
  de tu Google Apps Script.

  Ejemplo:

  https://script.google.com/macros/s/XXXXXXXXXXXX/exec
*/

const API_URL =
  "PEGAR_AQUI_URL_DE_TU_APPS_SCRIPT";


/* ======================================================
   VARIABLES
====================================================== */

let datos = [];
let filtrados = [];
let charts = {};
let mapaGeoJSON = null;
let mapaBounds = null;


/* ======================================================
   MESES
====================================================== */

const meses = [
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
   SALAS POR DEPARTAMENTO
====================================================== */

const salasPorDepartamento = {

  "AMAZONAS":[
    "BAGUA GRANDE"
  ],

  "ANCASH":[
    "CHIMBOTE 1",
    "CHIMBOTE 3",
    "HUARAZ 1",
    "HUARAZ 2",
    "HUARAZ 4",
    "HUARAZ 5",
    "HUARMEY 2"
  ],

  "APURIMAC":[
    "ABANCAY 1",
    "ABANCAY 2",
    "ANDAHUAYLAS 1",
    "ANDAHUAYLAS 2"
  ],

  "AREQUIPA":[
    "AREQUIPA 1"
  ],

  "AYACUCHO":[
    "AYACUCHO"
  ],

  "CAJAMARCA":[
    "CAJAMARCA 1",
    "CAJAMARCA 2",
    "CAJAMARCA 3",
    "CAJAMARCA 4",
    "JAEN"
  ],

  "CUSCO":[
    "CUSCO 1",
    "CUSCO 2"
  ],

  "ICA":[
    "CHINCHA 1",
    "CHINCHA 3",
    "CHINCHA 4",
    "ICA 1",
    "ICA 2"
  ],

  "JUNIN":[
    "HUANCAYO"
  ],

  "LA LIBERTAD":[
    "TRUJILLO 1",
    "TRUJILLO 2"
  ],

  "LAMBAYEQUE":[
    "CHICLAYO 1",
    "CHICLAYO 2",
    "LAMBAYEQUE 1",
    "LAMBAYEQUE 2"
  ],

  "LIMA":[
    "2 DE MAYO",
    "BARRANCA 1",
    "BARRANCA 2",
    "BARRANCA 3",
    "BOLIVAR",
    "BARRANCO 1",
    "CHORRILLOS",
    "CHOSICA 1",
    "CHOSICA 2",
    "COMAS 1",
    "COMAS 3",
    "COMAS 4",
    "COMAS 5",
    "ELIO",
    "GAMARRA",
    "HUACHO 1",
    "HUACHO 2",
    "HUACHO 3",
    "HUARAL 1",
    "LOS OLIVOS 2",
    "LOS OLIVOS 3",
    "LURIN",
    "MANCO CAPAC",
    "SAN JUAN 1",
    "SAN JUAN 3",
    "SAN JUAN 4",
    "SAN JUAN 6",
    "SAN MARTIN 2",
    "SAN MARTIN 3",
    "SAN MARTIN 4",
    "SAN MARTIN 5",
    "SANTA ANITA",
    "VILLA 2",
    "ZARATE 1",
    "ZARATE 3"
  ],

  "LORETO":[
    "IQUITOS 1",
    "IQUITOS 2",
    "IQUITOS 3",
    "IQUITOS 4",
    "IQUITOS 6"
  ],

  "MOQUEGUA":[
    "ILO",
    "MOQUEGUA"
  ],

  "PIURA":[
    "PIURA 1",
    "PIURA 2",
    "SULLANA 1",
    "SULLANA 3"
  ],

  "PUNO":[
    "JULIACA 1",
    "JULIACA 2",
    "JULIACA 3",
    "PUNO 2"
  ],

  "SAN MARTIN":[
    "MOYOBAMBA 1",
    "TARAPOTO 1",
    "TARAPOTO 3",
    "TARAPOTO 4",
    "TARAPOTO 5"
  ],

  "TACNA":[
    "TACNA"
  ],

  "TUMBES":[
    "TUMBES 2",
    "TUMBES 3"
  ],

  "UCAYALI":[
    "PUCALLPA 1",
    "PUCALLPA 2",
    "PUCALLPA 3"
  ],

  "CALLAO":[
    "COLONIAL",
    "VENTANILLA 2",
    "VENTANILLA 3"
  ]

};


/* ======================================================
   INICIO
====================================================== */

document.addEventListener(
  "DOMContentLoaded",
  iniciarDashboard
);


async function iniciarDashboard(){

  try {

    await cargarDatos();

    configurarEventos();

    cargarMapa();

  } catch(error){

    console.error(error);

    mostrarError(
      error.message ||
      "No se pudo cargar la información."
    );

  }

}


/* ======================================================
   CARGAR DATOS
====================================================== */

async function cargarDatos(
  forzarActualizacion = false
){

  mostrarCargando(
    forzarActualizacion
      ? "Actualizando información..."
      : "Cargando información..."
  );


  try {

    let url = API_URL;


    if(forzarActualizacion){

      url +=
        "?actualizar=1&t=" +
        Date.now();

    }else{

      url +=
        "?t=" +
        Date.now();

    }


    const respuesta =
      await fetch(
        url,
        {
          method:"GET",
          cache:"no-store"
        }
      );


    if(!respuesta.ok){

      throw new Error(
        "Error HTTP: " +
        respuesta.status
      );

    }


    const data =
      await respuesta.json();


    if(
      !Array.isArray(data)
    ){

      throw new Error(
        "La API no devolvió una lista de datos."
      );

    }


    datos = data;

    filtrados = [...datos];


    llenarSelect(
      "sala",
      datos.map(x=>x.sala),
      "TODOS LOS LOCALES"
    );


    llenarSelect(
      "mes",
      datos.map(x=>x.mes),
      "TODOS"
    );


    llenarSelect(
      "anio",
      datos.map(x=>x.anio),
      "TODOS"
    );


    actualizarFiltrosDependientes();

    aplicarFiltros();


    ocultarCargando();


  }catch(error){

    console.error(
      "Error cargando datos:",
      error
    );

    mostrarError(
      "No se pudo cargar la información. " +
      error.message
    );

    throw error;

  }

}


/* ======================================================
   EVENTOS
====================================================== */

function configurarEventos(){

  document
    .getElementById("sala")
    .addEventListener(
      "change",
      ()=>{
        actualizarFiltrosDependientes();
        aplicarFiltros();
      }
    );


  document
    .getElementById("marca")
    .addEventListener(
      "change",
      ()=>{
        actualizarFiltrosDependientes();
        aplicarFiltros();
      }
    );


  document
    .getElementById("serie")
    .addEventListener(
      "change",
      ()=>{
        actualizarFiltrosDependientes();
        aplicarFiltros();
      }
    );


  document
    .getElementById("juego")
    .addEventListener(
      "change",
      aplicarFiltros
    );


  document
    .getElementById("mes")
    .addEventListener(
      "change",
      aplicarFiltros
    );


  document
    .getElementById("anio")
    .addEventListener(
      "change",
      aplicarFiltros
    );


  document
    .getElementById("indicador")
    .addEventListener(
      "change",
      actualizar
    );


  let temporizadorBusqueda = null;


  document
    .getElementById("busqueda")
    .addEventListener(
      "input",
      function(){

        clearTimeout(
          temporizadorBusqueda
        );


        temporizadorBusqueda =
          setTimeout(
            ()=>{
              actualizarFiltrosDependientes();
              aplicarFiltros();
            },
            250
          );

      }
    );


  document
    .getElementById("btnLimpiar")
    .addEventListener(
      "click",
      limpiarFiltros
    );


  document
    .getElementById("btnActualizarDatos")
    .addEventListener(
      "click",
      ()=>{
        cargarDatos(true);
      }
    );


  document
    .getElementById("cerrarModal")
    .addEventListener(
      "click",
      cerrarModal
    );


  document
    .getElementById("cerrarModalDepartamento")
    .addEventListener(
      "click",
      cerrarModalDepartamento
    );


  document
    .getElementById("modalDetalle")
    .addEventListener(
      "click",
      function(e){

        if(e.target===this){

          cerrarModal();

        }

      }
    );


  document
    .getElementById("modalDepartamento")
    .addEventListener(
      "click",
      function(e){

        if(e.target===this){

          cerrarModalDepartamento();

        }

      }
    );


  document.addEventListener(
    "keydown",
    function(e){

      if(e.key==="Escape"){

        cerrarModal();
        cerrarModalDepartamento();

      }

    }
  );

}


/* ======================================================
   TEXTO GENERAL
====================================================== */

function obtenerTextoGeneral(x){

  return [

    x.marca,
    x.serie,
    x.juego,
    x.sala,
    x.mes,
    x.anio,
    x.coin,
    x.coinProm,
    x.venta,
    x.ventaProm,
    x.netwin,
    x.pago,
    x.tc

  ]

  .map(
    v =>
      String(v ?? "")
        .toLowerCase()
  )

  .join(" ");

}


/* ======================================================
   FILTROS DEPENDIENTES
====================================================== */

function actualizarFiltrosDependientes(){

  const busqueda =
    document
      .getElementById("busqueda")
      .value
      .trim()
      .toLowerCase();


  const salaActual =
    document.getElementById("sala").value;

  const marcaActual =
    document.getElementById("marca").value;

  const serieActual =
    document.getElementById("serie").value;

  const juegoActual =
    document.getElementById("juego").value;

  const mesActual =
    document.getElementById("mes").value;

  const anioActual =
    document.getElementById("anio").value;


  let base =
    busqueda

      ? datos.filter(
          x =>
            obtenerTextoGeneral(x)
              .includes(busqueda)
        )

      : [...datos];


  llenarSelect(
    "sala",
    base.map(x=>x.sala),
    "TODOS LOS LOCALES",
    salaActual
  );


  const sala =
    document.getElementById("sala").value;


  let baseSala =
    base.filter(
      x =>
        !sala ||
        String(x.sala).trim()===sala
    );


  llenarSelect(
    "marca",
    baseSala.map(x=>x.marca),
    "TODOS LOS MODELOS",
    marcaActual
  );


  const marca =
    document.getElementById("marca").value;


  let baseMarca =
    baseSala.filter(
      x =>
        !marca ||
        String(x.marca).trim()===marca
    );


  llenarSelect(
    "serie",
    baseMarca.map(x=>x.serie),
    "TODAS LAS SERIES",
    serieActual
  );


  const serie =
    document.getElementById("serie").value;


  let baseSerie =
    baseMarca.filter(
      x =>
        !serie ||
        String(x.serie).trim()===serie
    );


  llenarSelect(
    "juego",
    baseSerie.map(x=>x.juego),
    "TODOS LOS JUEGOS",
    juegoActual
  );


  llenarSelect(
    "mes",
    base.map(x=>x.mes),
    "TODOS",
    mesActual
  );


  llenarSelect(
    "anio",
    base.map(x=>x.anio),
    "TODOS",
    anioActual
  );

}


/* ======================================================
   LLENAR SELECT
====================================================== */

function llenarSelect(
  id,
  valores,
  textoInicial,
  valorMantener=""
){

  const select =
    document.getElementById(id);


  const valorAnterior =
    valorMantener ||
    select.value ||
    "";


  select.innerHTML = "";


  const primera =
    document.createElement("option");


  primera.value = "";

  primera.textContent =
    textoInicial;


  select.appendChild(
    primera
  );


  const unicos = [

    ...new Set(

      valores

        .filter(
          v =>
            v!==null &&
            v!==undefined &&
            String(v).trim()!==""
        )

        .map(
          v =>
            String(v).trim()
        )

    )

  ];


  unicos.sort(
    (a,b)=>
      a.localeCompare(
        b,
        "es",
        {
          numeric:true
        }
      )
  );


  unicos.forEach(
    valor=>{

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


  if(
    valorAnterior &&
    unicos.includes(
      valorAnterior
    )
  ){

    select.value =
      valorAnterior;

  }else{

    select.value = "";

  }

}


/* ======================================================
   APLICAR FILTROS
====================================================== */

function aplicarFiltros(){

  const sala =
    document.getElementById("sala").value;

  const marca =
    document.getElementById("marca").value;

  const serie =
    document.getElementById("serie").value;

  const juego =
    document.getElementById("juego").value;

  const mes =
    document.getElementById("mes").value;

  const anio =
    document.getElementById("anio").value;


  const busqueda =
    document
      .getElementById("busqueda")
      .value
      .trim()
      .toLowerCase();


  filtrados =
    datos.filter(
      x=>{

        const textoGeneral =
          obtenerTextoGeneral(x);


        return (

          (
            !busqueda ||
            textoGeneral.includes(
              busqueda
            )
          ) &&

          (
            !sala ||
            String(x.sala).trim()===sala
          ) &&

          (
            !marca ||
            String(x.marca).trim()===marca
          ) &&

          (
            !serie ||
            String(x.serie).trim()===serie
          ) &&

          (
            !juego ||
            String(x.juego).trim()===juego
          ) &&

          (
            !mes ||
            String(x.mes).trim()===mes
          ) &&

          (
            !anio ||
            String(x.anio).trim()===anio
          )

        );

      }
    );


  actualizar();

}


/* ======================================================
   LIMPIAR FILTROS
====================================================== */

function limpiarFiltros(){

  [
    "sala",
    "marca",
    "serie",
    "juego",
    "mes",
    "anio",
    "busqueda"
  ]

  .forEach(
    id =>
      document.getElementById(id).value=""
  );


  actualizarFiltrosDependientes();

  aplicarFiltros();

}


/* ======================================================
   ACTUALIZAR TODO
====================================================== */

function actualizar(){

  actualizarCards();

  actualizarGraficos();

  actualizarTabla();

  actualizarMapa();

}


/* ======================================================
   CARDS
====================================================== */

function actualizarCards(){

  document.getElementById(
    "totalCoin"
  ).textContent =
    formato(
      suma("coin")
    );


  document.getElementById(
    "totalVenta"
  ).textContent =
    formato(
      suma("venta")
    );


  document.getElementById(
    "totalNetwin"
  ).textContent =
    formato(
      suma("netwin")
    );


  const pagos =
    filtrados

      .map(
        x=>Number(x.pago)
      )

      .filter(
        x=>!isNaN(x)
      );


  const promedio =
    pagos.length

      ? pagos.reduce(
          (a,b)=>a+b,
          0
        ) / pagos.length

      : 0;


  document.getElementById(
    "totalPago"
  ).textContent =
    promedio.toFixed(1) + "%";

}


/* ======================================================
   SUMA
====================================================== */

function suma(campo){

  return filtrados.reduce(
    (total,x)=>
      total +
      (
        Number(
          x[campo]
        ) || 0
      ),
    0
  );

}


/* ======================================================
   INDICADOR
====================================================== */

function indicadorActual(){

  return document
    .getElementById("indicador")
    .value;

}


function nombreIndicador(){

  const nombres = {

    coin:"COIN",

    venta:"VENTA",

    netwin:"NETWIN",

    pago:"% PAGO",

    coinProm:"COIN PROM",

    ventaProm:"VENTA PROM"

  };


  return nombres[
    indicadorActual()
  ];

}


function valorIndicador(x){

  return Number(
    x[
      indicadorActual()
    ]
  ) || 0;

}


/* ======================================================
   SEMÁFORO
====================================================== */

function coloresSemaforo(valores){

  if(!valores.length){

    return [];

  }


  const max =
    Math.max(
      ...valores
    );


  const min =
    Math.min(
      ...valores
    );


  const rango =
    max-min || 1;


  return valores.map(
    valor=>{

      const porcentaje =
        (valor-min)/rango;


      if(
        porcentaje<=.5
      ){

        const t =
          porcentaje/.5;


        const r =
          Math.round(
            220+
            (245-220)*t
          );


        const g =
          Math.round(
            38+
            (158-38)*t
          );


        const b =
          Math.round(
            38+
            (11-38)*t
          );


        return `rgb(${r},${g},${b})`;

      }


      const t =
        (porcentaje-.5)/.5;


      const r =
        Math.round(
          245-
          (245-22)*t
        );


      const g =
        Math.round(
          158+
          (163-158)*t
        );


      const b =
        Math.round(
          11+
          (74-11)*t
        );


      return `rgb(${r},${g},${b})`;

    }
  );

}


/* ======================================================
   GRÁFICOS
====================================================== */

function actualizarGraficos(){

  const indicador =
    nombreIndicador();


  const mesesData = {};


  filtrados.forEach(
    x=>{

      const mes =
        String(
          x.mes || ""
        ).toUpperCase();


      if(!mes)return;


      if(
        !mesesData[mes]
      ){

        mesesData[mes]=[];

      }


      mesesData[mes].push(
        valorIndicador(x)
      );

    }
  );


  const labelsMes =
    meses.filter(
      m=>mesesData[m]
    );


  const valoresMes =
    labelsMes.map(
      m=>{

        const a =
          mesesData[m];


        return (
          a.reduce(
            (x,y)=>x+y,
            0
          ) / a.length
        );

      }
    );


  crearGrafico(
    "evolucion",
    "line",
    labelsMes,
    valoresMes,
    indicador,
    true
  );


  ranking(
    "rankingSala",
    "sala"
  );


  ranking(
    "rankingMarca",
    "marca"
  );


  ranking(
    "rankingJuego",
    "juego"
  );


  ranking(
    "rankingSerie",
    "serie"
  );

}


/* ======================================================
   RANKING
====================================================== */

function ranking(
  canvasId,
  campo
){

  const grupos = {};


  filtrados.forEach(
    x=>{

      const nombre =
        String(
          x[campo] || ""
        ).trim();


      if(!nombre)return;


      if(
        !grupos[nombre]
      ){

        grupos[nombre]=[];

      }


      grupos[nombre].push(
        valorIndicador(x)
      );

    }
  );


  const lista =
    Object.entries(
      grupos
    )

    .map(
      ([nombre,valores])=>({

        nombre,

        valor:
          valores.reduce(
            (a,b)=>a+b,
            0
          ) / valores.length

      })
    )

    .sort(
      (a,b)=>
        b.valor-a.valor
    );


  crearGraficoRanking(
    canvasId,
    lista.map(x=>x.nombre),
    lista.map(x=>x.valor),
    nombreIndicador(),
    campo
  );

}


/* ======================================================
   GRÁFICO RANKING
====================================================== */

function crearGraficoRanking(
  id,
  labels,
  valores,
  titulo,
  campo
){

  if(
    charts[id]
  ){

    charts[id].destroy();

  }


  const canvas =
    document.getElementById(id);


  const anchoPorBarra = 65;

  const anchoMinimo = 700;


  const anchoNecesario =
    Math.max(
      anchoMinimo,
      labels.length *
      anchoPorBarra
    );


  canvas.parentElement.style.width =
    anchoNecesario +
    "px";


  charts[id] =
    new Chart(
      canvas,
      {

        type:"bar",


        data:{

          labels,

          datasets:[{

            label:titulo,

            data:valores,

            backgroundColor:
              coloresSemaforo(
                valores
              ),

            borderColor:
              coloresSemaforo(
                valores
              ),

            borderWidth:2,

            borderRadius:5,

            borderSkipped:false

          }]

        },


        options:{

          responsive:true,

          maintainAspectRatio:false,

          animation:false,


          onClick:function(
            event,
            elements
          ){

            if(
              !elements ||
              !elements.length
            ){

              return;

            }


            const indice =
              elements[0].index;


            mostrarDetalleBarra(
              labels[indice],
              campo,
              valores[indice]
            );

          },


          plugins:{

            legend:{
              display:false
            },


            tooltip:{

              callbacks:{

                label:function(
                  context
                ){

                  return (
                    titulo +
                    ": " +
                    formato(
                      context.raw
                    )
                  );

                }

              }

            }

          },


          scales:{

            x:{

              ticks:{

                autoSkip:false,

                maxRotation:45,

                minRotation:45,

                font:{
                  size:10
                },


                callback:function(
                  value
                ){

                  const texto =
                    this.getLabelForValue(
                      value
                    );


                  return texto.length>15

                    ? texto.substring(
                        0,
                        15
                      ) + "…"

                    : texto;

                }

              }

            },


            y:{
              beginAtZero:true
            }

          }

        }

      }
    );

}


/* ======================================================
   MAPA
====================================================== */

const URL_MAPA_PERU =
  "https://raw.githubusercontent.com/juaneladio/peru-geojson/master/peru_departamental_simple.geojson";


function cargarMapa(){

  fetch(
    URL_MAPA_PERU
  )

  .then(
    res=>{

      if(!res.ok){

        throw new Error(
          "No se pudo cargar el mapa"
        );

      }


      return res.json();

    }
  )

  .then(
    geo=>{

      mapaGeoJSON =
        geo;


      document
        .getElementById(
          "mapaCargando"
        )
        .style.display =
          "none";


      dibujarMapaBase();

      actualizarMapa();

    }
  )

  .catch(
    error=>{

      console.error(
        "Mapa:",
        error
      );


      document
        .getElementById(
          "mapaCargando"
        )
        .textContent =
          "No se pudo cargar el mapa.";

    }
  );

}


/* ======================================================
   PUNTOS MAPA
====================================================== */

function obtenerTodosLosPuntos(
  geo
){

  const puntos=[];


  geo.features.forEach(
    feature=>{

      const geometry =
        feature.geometry;


      if(!geometry)return;


      if(
        geometry.type ===
        "Polygon"
      ){

        geometry.coordinates
          .forEach(
            poligono=>{

              poligono.forEach(
                punto=>
                  puntos.push(
                    punto
                  )
              );

            }
          );

      }


      if(
        geometry.type ===
        "MultiPolygon"
      ){

        geometry.coordinates
          .forEach(
            multi=>{

              multi.forEach(
                poligono=>{

                  poligono.forEach(
                    punto=>
                      puntos.push(
                        punto
                      )
                  );

                }
              );

            }
          );

      }

    }
  );


  return puntos;

}


/* ======================================================
   PROYECCIÓN
====================================================== */

function prepararProyeccion(){

  if(!mapaGeoJSON)return;


  const puntos =
    obtenerTodosLosPuntos(
      mapaGeoJSON
    );


  const xs =
    puntos.map(
      p=>p[0]
    );


  const ys =
    puntos.map(
      p=>p[1]
    );


  mapaBounds={

    minX:
      Math.min(...xs),

    maxX:
      Math.max(...xs),

    minY:
      Math.min(...ys),

    maxY:
      Math.max(...ys)

  };

}


function proyectar(
  lon,
  lat
){

  if(!mapaBounds){

    return {
      x:0,
      y:0
    };

  }


  const ancho=500;

  const alto=700;

  const margenX=50;

  const margenY=30;


  const escalaX =
    (ancho-margenX*2) /
    (
      mapaBounds.maxX -
      mapaBounds.minX
    );


  const escalaY =
    (alto-margenY*2) /
    (
      mapaBounds.maxY -
      mapaBounds.minY
    );


  const escala =
    Math.min(
      escalaX,
      escalaY
    );


  const anchoMapa =
    (
      mapaBounds.maxX -
      mapaBounds.minX
    ) * escala;


  const altoMapa =
    (
      mapaBounds.maxY -
      mapaBounds.minY
    ) * escala;


  const offsetX =
    (600-anchoMapa)/2;


  const offsetY =
    (760-altoMapa)/2;


  return {

    x:
      offsetX +
      (
        lon -
        mapaBounds.minX
      ) * escala,

    y:
      offsetY +
      (
        mapaBounds.maxY -
        lat
      ) * escala

  };

}


/* ======================================================
   NORMALIZAR
====================================================== */

function normalizarTexto(
  texto
){

  return String(
    texto || ""
  )

  .normalize("NFD")

  .replace(
    /[\u0300-\u036f]/g,
    ""
  )

  .toUpperCase()

  .trim();

}


/* ======================================================
   DEPARTAMENTO
====================================================== */

function obtenerDepartamentoSala(
  local
){

  const texto =
    normalizarTexto(
      local
    );


  for(
    const departamento
    in salasPorDepartamento
  ){

    const salas =
      salasPorDepartamento[
        departamento
      ];


    for(
      const sala
      of salas
    ){

      const salaNormalizada =
        normalizarTexto(
          sala
        );


      if(
        texto === salaNormalizada ||
        texto.includes(
          salaNormalizada
        )
      ){

        return departamento;

      }

    }

  }


  return null;

}


/* ======================================================
   NOMBRE DEPARTAMENTO
====================================================== */

function obtenerNombreDepartamento(
  feature
){

  return normalizarTexto(

    feature.properties?.NOMBDEP ||

    feature.properties?.NOMBDEPA ||

    feature.properties?.DEPARTAMENTO ||

    feature.properties?.NAME_1 ||

    feature.properties?.name ||

    ""

  );

}


/* ======================================================
   DIBUJAR MAPA
====================================================== */

function dibujarMapaBase(){

  if(!mapaGeoJSON)return;


  prepararProyeccion();


  const svg =
    document.getElementById(
      "mapaPeru"
    );


  svg.innerHTML="";


  mapaGeoJSON.features.forEach(
    feature=>{

      const geometry =
        feature.geometry;


      if(!geometry)return;


      const path =
        document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );


      let d="";


      function agregarPoligono(
        poligono
      ){

        poligono.forEach(
          (coord,index)=>{

            const p =
              proyectar(
                coord[0],
                coord[1]
              );


            d +=
              index===0

                ? `M ${p.x} ${p.y}`

                : ` L ${p.x} ${p.y}`;

          }
        );


        d += " Z ";

      }


      if(
        geometry.type ===
        "Polygon"
      ){

        geometry.coordinates
          .forEach(
            agregarPoligono
          );

      }


      if(
        geometry.type ===
        "MultiPolygon"
      ){

        geometry.coordinates
          .forEach(
            multi=>{

              multi.forEach(
                agregarPoligono
              );

            }
          );

      }


      path.setAttribute(
        "d",
        d
      );


      path.classList.add(
        "departamento"
      );


      const nombre =
        obtenerNombreDepartamento(
          feature
        );


      path.setAttribute(
        "data-departamento",
        nombre
      );


      path.addEventListener(
        "click",
        ()=>{
          abrirDepartamento(
            nombre
          );
        }
      );


      svg.appendChild(
        path
      );

    }
  );

}


/* ======================================================
   REGISTROS DEPARTAMENTO
====================================================== */

function registrosDepartamento(
  departamento
){

  return filtrados.filter(
    registro=>
      obtenerDepartamentoSala(
        registro.sala
      ) === departamento
  );

}


/* ======================================================
   ACTUALIZAR MAPA
====================================================== */

function actualizarMapa(){

  if(!mapaGeoJSON)return;


  document
    .querySelectorAll(
      "#mapaPeru .departamento"
    )

    .forEach(
      elemento=>{

        delete elemento.dataset.valor;

        elemento.style.fill =
          "#f1f5f9";

        elemento.classList.add(
          "departamento-sin-datos"
        );

      }
    );


  const departamentosConDatos=[];


  document
    .querySelectorAll(
      "#mapaPeru .departamento"
    )

    .forEach(
      elemento=>{

        const departamento =
          normalizarTexto(
            elemento.getAttribute(
              "data-departamento"
            )
          );


        const registros =
          registrosDepartamento(
            departamento
          );


        if(
          !registros.length
        ){

          return;

        }


        const valores =
          registros.map(
            registro=>
              valorIndicador(
                registro
              )
          );


        const promedio =
          valores.reduce(
            (a,b)=>a+b,
            0
          ) /
          valores.length;


        elemento.dataset.valor =
          promedio;


        departamentosConDatos.push(
          promedio
        );

      }
    );


  const colores =
    coloresSemaforo(
      departamentosConDatos
    );


  let indice=0;


  document
    .querySelectorAll(
      "#mapaPeru .departamento"
    )

    .forEach(
      elemento=>{

        if(
          elemento.dataset.valor !==
          undefined
        ){

          elemento.style.fill =
            colores[indice];


          elemento.classList.remove(
            "departamento-sin-datos"
          );


          indice++;

        }

      }
    );

}


/* ======================================================
   ABRIR DEPARTAMENTO
====================================================== */

function abrirDepartamento(
  departamento
){

  if(!departamento)return;


  const registros =
    registrosDepartamento(
      departamento
    );


  const lista =
    document.getElementById(
      "listaSalasDepartamento"
    );


  document.getElementById(
    "modalDepartamentoTitulo"
  ).textContent =
    capitalizarDepartamento(
      departamento
    );


  document.getElementById(
    "departamentoCantidad"
  ).textContent =
    contarSalasUnicas(
      registros
    );


  const valores =
    registros.map(
      x=>valorIndicador(x)
    );


  const promedio =
    valores.length

      ? valores.reduce(
          (a,b)=>a+b,
          0
        ) / valores.length

      : 0;


  document.getElementById(
    "departamentoIndicador"
  ).textContent =
    nombreIndicador();


  document.getElementById(
    "departamentoPromedio"
  ).textContent =
    formato(
      promedio
    );


  lista.innerHTML="";


  if(!registros.length){

    lista.innerHTML = `

      <div class="sin-salas">

        No hay salas disponibles
        para este departamento
        con los filtros actuales.

      </div>

    `;

  }else{

    const grupos={};


    registros.forEach(
      registro=>{

        const nombre =
          String(
            registro.sala || ""
          ).trim();


        if(!nombre)return;


        if(
          !grupos[nombre]
        ){

          grupos[nombre]=[];

        }


        grupos[nombre].push(
          registro
        );

      }
    );


    const salas =
      Object.entries(
        grupos
      )

      .map(
        ([nombre,registrosSala])=>{

          const valoresSala =
            registrosSala.map(
              registro=>
                valorIndicador(
                  registro
                )
            );


          return {

            nombre,

            registros:
              registrosSala,

            valor:
              valoresSala.reduce(
                (a,b)=>a+b,
                0
              ) /
              valoresSala.length

          };

        }
      )

      .sort(
        (a,b)=>
          b.valor-a.valor
      );


    const colores =
      coloresSemaforo(
        salas.map(
          x=>x.valor
        )
      );


    salas.forEach(
      (sala,indice)=>{

        const item =
          document.createElement(
            "div"
          );


        item.className =
          "sala-item";


        const nombre =
          document.createElement(
            "div"
          );


        nombre.className =
          "sala-nombre";


        const punto =
          document.createElement(
            "span"
          );


        punto.className =
          "sala-punto";


        punto.style.background =
          colores[indice];


        const texto =
          document.createElement(
            "strong"
          );


        texto.textContent =
          sala.nombre;


        nombre.appendChild(
          punto
        );


        nombre.appendChild(
          texto
        );


        const valor =
          document.createElement(
            "span"
          );


        valor.className =
          "sala-valor";


        valor.textContent =
          formato(
            sala.valor
          );


        item.appendChild(
          nombre
        );


        item.appendChild(
          valor
        );


        item.style.cursor =
          "pointer";


        item.addEventListener(
          "click",
          ()=>{
            mostrarDetalleMapa(
              sala.registros[0]
            );
          }
        );


        lista.appendChild(
          item
        );

      }
    );

  }


  document
    .getElementById(
      "modalDepartamento"
    )
    .classList.add(
      "activo"
    );

}


/* ======================================================
   CONTAR SALAS
====================================================== */

function contarSalasUnicas(
  registros
){

  return new Set(

    registros.map(
      x=>
        String(
          x.sala || ""
        ).trim()
    )

  ).size;

}


/* ======================================================
   CAPITALIZAR
====================================================== */

function capitalizarDepartamento(
  texto
){

  const especiales = {

    "ANCASH":"ÁNCASH",

    "APURIMAC":"APURÍMAC",

    "AREQUIPA":"AREQUIPA",

    "AYACUCHO":"AYACUCHO",

    "CAJAMARCA":"CAJAMARCA",

    "CUSCO":"CUSCO",

    "ICA":"ICA",

    "JUNIN":"JUNÍN",

    "LA LIBERTAD":"LA LIBERTAD",

    "LAMBAYEQUE":"LAMBAYEQUE",

    "LIMA":"LIMA",

    "LORETO":"LORETO",

    "MOQUEGUA":"MOQUEGUA",

    "PIURA":"PIURA",

    "PUNO":"PUNO",

    "SAN MARTIN":"SAN MARTÍN",

    "TACNA":"TACNA",

    "TUMBES":"TUMBES",

    "UCAYALI":"UCAYALI",

    "CALLAO":"CALLAO",

    "AMAZONAS":"AMAZONAS"

  };


  return especiales[
    texto
  ] || texto;

}


/* ======================================================
   DETALLE MAPA
====================================================== */

function mostrarDetalleMapa(
  registro
){

  document.getElementById(
    "modalTitulo"
  ).textContent =
    "Detalle del local";


  document.getElementById(
    "detalleSala"
  ).textContent =
    valorTexto(
      registro.sala
    );


  document.getElementById(
    "detalleMarca"
  ).textContent =
    valorTexto(
      registro.marca
    );


  document.getElementById(
    "detalleSerie"
  ).textContent =
    valorTexto(
      registro.serie
    );


  document.getElementById(
    "detalleJuego"
  ).textContent =
    valorTexto(
      registro.juego
    );


  document.getElementById(
    "detalleMes"
  ).textContent =
    valorTexto(
      registro.mes
    );


  document.getElementById(
    "detalleAnio"
  ).textContent =
    valorTexto(
      registro.anio
    );


  document.getElementById(
    "detalleIndicadorNombre"
  ).textContent =
    nombreIndicador();


  document.getElementById(
    "detalleIndicadorValor"
  ).textContent =
    formato(
      valorIndicador(
        registro
      )
    );


  cerrarModalDepartamento();


  document.getElementById(
    "modalDetalle"
  ).classList.add(
    "activo"
  );

}


/* ======================================================
   DETALLE RANKING
====================================================== */

function mostrarDetalleBarra(
  nombre,
  campo,
  valor
){

  const registros =
    filtrados.filter(
      x =>
        String(
          x[campo] || ""
        ).trim() ===
        String(
          nombre
        ).trim()
    );


  if(
    !registros.length
  ){

    return;

  }


  const registro =
    registros[0];


  let titulo =
    "Detalle del ranking";


  if(
    campo==="sala"
  ){

    titulo =
      "Detalle del local";

  }


  if(
    campo==="marca"
  ){

    titulo =
      "Detalle del modelo";

  }


  if(
    campo==="juego"
  ){

    titulo =
      "Detalle del juego";

  }


  if(
    campo==="serie"
  ){

    titulo =
      "Detalle de la serie";

  }


  document.getElementById(
    "modalTitulo"
  ).textContent =
    titulo;


  document.getElementById(
    "detalleSala"
  ).textContent =
    valorTexto(
      registro.sala
    );


  document.getElementById(
    "detalleMarca"
  ).textContent =
    valorTexto(
      registro.marca
    );


  document.getElementById(
    "detalleSerie"
  ).textContent =
    valorTexto(
      registro.serie
    );


  document.getElementById(
    "detalleJuego"
  ).textContent =
    valorTexto(
      registro.juego
    );


  document.getElementById(
    "detalleMes"
  ).textContent =
    valorTexto(
      registro.mes
    );


  document.getElementById(
    "detalleAnio"
  ).textContent =
    valorTexto(
      registro.anio
    );


  document.getElementById(
    "detalleIndicadorNombre"
  ).textContent =
    nombreIndicador();


  document.getElementById(
    "detalleIndicadorValor"
  ).textContent =
    formato(
      valor
    );


  document.getElementById(
    "modalDetalle"
  ).classList.add(
    "activo"
  );

}


/* ======================================================
   CERRAR MODALES
====================================================== */

function cerrarModal(){

  document
    .getElementById(
      "modalDetalle"
    )
    .classList.remove(
      "activo"
    );

}


function cerrarModalDepartamento(){

  document
    .getElementById(
      "modalDepartamento"
    )
    .classList.remove(
      "activo"
    );

}


/* ======================================================
   GRÁFICO EVOLUCIÓN
====================================================== */

function crearGrafico(
  id,
  tipo,
  labels,
  valores,
  titulo,
  mostrarLeyenda
){

  if(
    charts[id]
  ){

    charts[id].destroy();

  }


  const canvas =
    document.getElementById(id);


  canvas.parentElement.style.width =
    "100%";


  charts[id] =
    new Chart(
      canvas,
      {

        type:tipo,


        data:{

          labels,


          datasets:[{

            label:titulo,

            data:valores,


            backgroundColor:

              tipo==="line"

                ? "rgba(37,99,235,.15)"

                : "rgba(220,38,38,.75)",


            borderColor:

              tipo==="line"

                ? "#2563eb"

                : "#dc2626",


            borderWidth:2,


            fill:
              tipo==="line",


            tension:.25,


            pointRadius:4,


            pointHoverRadius:6

          }]

        },


        options:{

          responsive:true,

          maintainAspectRatio:false,

          animation:false,


          plugins:{

            legend:{
              display:
                mostrarLeyenda
            },


            tooltip:{

              callbacks:{

                label:function(
                  context
                ){

                  return (
                    titulo +
                    ": " +
                    formato(
                      context.raw
                    )
                  );

                }

              }

            }

          },


          scales:{

            x:{

              ticks:{

                maxRotation:0,

                minRotation:0,

                autoSkip:true,

                maxTicksLimit:8,


                callback:function(
                  value
                ){

                  const texto =
                    this.getLabelForValue(
                      value
                    );


                  return texto.length>12

                    ? texto.substring(
                        0,
                        12
                      ) + "…"

                    : texto;

                }

              }

            },


            y:{

              beginAtZero:true,

              grace:"15%"

            }

          }

        }

      }
    );

}


/* ======================================================
   TABLA
====================================================== */

function actualizarTabla(){

  const cuerpo =
    document.getElementById(
      "tabla"
    );


  const fragmento =
    document.createDocumentFragment();


  const limite =
    Math.min(
      filtrados.length,
      1000
    );


  for(
    let i=0;
    i<limite;
    i++
  ){

    const x =
      filtrados[i];


    const tr =
      document.createElement(
        "tr"
      );


    tr.innerHTML = `

      <td>${escapeHTML(x.marca)}</td>

      <td>${escapeHTML(x.serie)}</td>

      <td>${escapeHTML(x.juego)}</td>

      <td>${formato(x.coin)}</td>

      <td>${formato(x.coinProm)}</td>

      <td>${formato(x.venta)}</td>

      <td>${formato(x.ventaProm)}</td>

      <td>${formato(x.netwin)}</td>

      <td>${formato(x.pago)}%</td>

      <td>${escapeHTML(x.sala)}</td>

      <td>${escapeHTML(x.mes)}</td>

      <td>${escapeHTML(x.anio)}</td>

      <td>${formato(x.tc)}</td>

    `;


    fragmento.appendChild(
      tr
    );

  }


  cuerpo.innerHTML="";


  cuerpo.appendChild(
    fragmento
  );

}


/* ======================================================
   ESCAPAR HTML
====================================================== */

function escapeHTML(valor){

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


/* ======================================================
   VALOR TEXTO
====================================================== */

function valorTexto(
  valor
){

  if(

    valor===null ||

    valor===undefined ||

    String(valor).trim()===""

  ){

    return "-";

  }


  return String(valor);

}


/* ======================================================
   FORMATO
====================================================== */

function formato(
  numero
){

  return Number(
    numero || 0
  ).toLocaleString(
    "es-PE",
    {
      maximumFractionDigits:2
    }
  );

}


/* ======================================================
   CARGANDO
====================================================== */

function mostrarCargando(
  texto
){

  const elemento =
    document.getElementById(
      "cargando"
    );


  elemento.textContent =
    texto;


  elemento.style.display =
    "flex";

}


function ocultarCargando(){

  document
    .getElementById(
      "cargando"
    )
    .style.display =
      "none";

}


function mostrarError(
  mensaje
){

  const elemento =
    document.getElementById(
      "cargando"
    );


  elemento.textContent =
    mensaje;


  elemento.style.display =
    "flex";

}
