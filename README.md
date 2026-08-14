INDEX.HTML
│
├── ENCABEZADO
│   ├── Título
│   ├── Descripción
│   └── Estado de conexión
│
├── BARRA DE ACCIONES
│   ├── Contador de registros
│   └── Botón Actualizar datos
│
├── FILTROS
│   ├── SALA
│   ├── MES
│   ├── MODELO DE MÁQUINA
│   ├── NRO. MÁQUINA
│   ├── JUEGO
│   └── Limpiar filtros
│
├── GRÁFICOS
│   ├── COIN PROM
│   ├── VENTA PROM
│   ├── COIN TOTAL
│   ├── VENTA TOTAL
│   ├── NETWIN
│   └── T.C.
│
├── PORCENTAJE DE PAGO
│   ├── Gráfico circular
│   └── Porcentaje
│
├── TABLA RESUMEN
│   ├── MES
│   ├── COIN PROM
│   ├── COIN TOTAL
│   ├── VENTA PROM
│   ├── VENTA TOTAL
│   ├── NETWIN
│   ├── T.C.
│   └── % PAGO
│
└── script.js


SCRIPT.JS
│
├── CONFIGURACIÓN GOOGLE SHEETS
│   ├── SHEET_ID
│   ├── SHEET_GID
│   └── URL_DATOS
│
├── VARIABLES
│   ├── datosOriginales
│   ├── datosFiltrados
│   └── graficos
│
├── MESES
│
├── COLORES
│
├── COLUMNAS DE DATA
│   ├── Marca / Tipo / Version
│   ├── Nro.
│   ├── Maquina
│   ├── Fecha Ini.
│   ├── Fecha Fin
│   ├── Juego
│   ├── Dias
│   ├── COIN
│   ├── COIN PROM
│   ├── VENTA
│   ├── VENTA PROM
│   ├── NETWIN
│   ├── G.PLAYED
│   ├── % PAGO
│   ├── Modelo Com.
│   ├── LOCAL
│   ├── MES
│   ├── AÑO
│   ├── TIPO MAQUINA
│   └── T.C.
│
├── INICIO
│
├── EVENTOS
│   ├── Cambio SALA
│   ├── Cambio MES
│   ├── Cambio MODELO
│   ├── Cambio NRO.
│   ├── Cambio JUEGO
│   ├── Limpiar filtros
│   └── Actualizar datos
│
├── CARGAR DATOS
│
├── CONVERTIR GVIZ
│
├── OBTENER CELDA
│
├── ESTADO DE CONEXIÓN
│
├── LLENAR FILTROS
│   ├── Sala
│   ├── Modelo
│   ├── Número
│   ├── Juego
│   └── Mes
│
├── APLICAR FILTROS
│   │
│   ├── Sala
│   ├── Mes
│   ├── Modelo
│   ├── Número
│   └── Juego
│   │
│   └── datosFiltrados
│
├── LIMPIAR FILTROS
│
├── ACTUALIZAR DASHBOARD
│   │
│   ├── Contador
│   ├── Gráficos
│   ├── % Pago
│   └── Tabla
│
├── RESUMEN MENSUAL
│
├── 6 GRÁFICOS
│   ├── COIN PROM
│   ├── VENTA PROM
│   ├── COIN TOTAL
│   ├── VENTA TOTAL
│   ├── NETWIN
│   └── T.C.
│
├── GRÁFICO % PAGO
│
├── TABLA
│
├── FUNCIONES AUXILIARES
│   ├── obtenerValor()
│   ├── limpiarTexto()
│   ├── normalizarMes()
│   ├── obtenerNumero()
│   ├── promedioArray()
│   ├── formatearNumero()
│   └── establecerTexto()
│
└── ACTUALIZACIÓN AUTOMÁTICA
    └── Cada 5 minutos


STYLE.CSS
│
├── CONFIGURACIÓN GENERAL
│
├── ENCABEZADO
│
├── ESTADO DE CONEXIÓN
│
├── CONTENEDOR PRINCIPAL
│
├── BARRA DE ACCIONES
│
├── FILTROS
│   ├── Select Sala
│   ├── Select Mes
│   ├── Select Modelo
│   ├── Select Número
│   ├── Select Juego
│   └── Botón Limpiar
│
├── GRÁFICOS
│
├── TARJETAS DE GRÁFICOS
│
├── ENCABEZADOS DE GRÁFICOS
│
├── CANVAS
│
├── PANEL % PAGO
│
├── PANEL TABLA
│
├── TABLA
│
├── SCROLLBAR
│
├── RESPONSIVE TABLET
│
├── RESPONSIVE MÓVIL
│
└── MÓVIL PEQUEÑO



                    GOOGLE SHEETS
                         │
                         ▼
                    script.js
                         │
                 datosOriginales
                         │
                         ▼
                    FILTROS
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
        SALA            MES           MODELO
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                     NÚMERO
                         │
                         ▼
                      JUEGO
                         │
                         ▼
                  datosFiltrados
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       GRÁFICOS       % PAGO          TABLA
                         │
                         ▼
                    index.html
                         │
                         ▼
                    style.css
    



const SHEET_ID = "1kR5qsAetOMi2Szb4c-gVo3vVhZhwJUC_AgSNI13eluY";
const SHEET_GID = "683959855";

const NOMBRE_ARCHIVO_CACHE =
  "dashboard_produccion_cache.json";


/* ======================================================
   API
====================================================== */

function doGet(e){

  try{

    const actualizar =
      e &&
      e.parameter &&
      e.parameter.actualizar === "1";


    let datos;


    if(actualizar){

      datos =
        actualizarDatos();

    }else{

      datos =
        obtenerDatos();

    }


    return ContentService
      .createTextOutput(
        JSON.stringify(datos)
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );


  }catch(error){

    return ContentService
      .createTextOutput(
        JSON.stringify({

          error:true,

          message:
            error.message

        })
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );

  }

}


/* ======================================================
   OBTENER DATOS
====================================================== */

function obtenerDatos(){

  const datosCache =
    obtenerCacheDrive();


  if(datosCache){

    return datosCache;

  }


  return actualizarDatos();

}


/* ======================================================
   ACTUALIZAR DATOS
====================================================== */

function actualizarDatos(){

  const ss =
    SpreadsheetApp.openById(
      SHEET_ID
    );


  const hoja =
    ss
      .getSheets()
      .find(
        h =>
          String(
            h.getSheetId()
          ) ===
          String(
            SHEET_GID
          )
      );


  if(!hoja){

    throw new Error(
      "No se encontró la pestaña DATA."
    );

  }


  const datos =
    hoja
      .getDataRange()
      .getValues();


  if(
    datos.length < 2
  ){

    guardarCacheDrive([]);

    return [];

  }


  const resultado =
    datos
      .slice(1)
      .map(
        fila => ({

          marca:
            fila[0],

          serie:
            fila[2],

          juego:
            fila[5],

          coin:
            numero(
              fila[7]
            ),

          coinProm:
            numero(
              fila[8]
            ),

          venta:
            numero(
              fila[9]
            ),

          ventaProm:
            numero(
              fila[10]
            ),

          netwin:
            numero(
              fila[11]
            ),

          pago:
            numero(
              fila[13]
            ),

          sala:
            fila[15],

          mes:
            fila[16],

          anio:
            fila[17],

          tc:
            numero(
              fila[19]
            )

        })
      )

      .filter(
        f =>
          f.sala ||
          f.marca ||
          f.serie ||
          f.juego
      );


  guardarCacheDrive(
    resultado
  );


  return resultado;

}


/* ======================================================
   GUARDAR CACHE DRIVE
====================================================== */

function guardarCacheDrive(
  datos
){

  const archivos =
    DriveApp
      .getFilesByName(
        NOMBRE_ARCHIVO_CACHE
      );


  const contenido =
    JSON.stringify(
      datos
    );


  if(
    archivos.hasNext()
  ){

    const archivo =
      archivos.next();


    archivo.setContent(
      contenido
    );

  }else{

    DriveApp.createFile(
      NOMBRE_ARCHIVO_CACHE,
      contenido,
      MimeType.PLAIN_TEXT
    );

  }

}


/* ======================================================
   LEER CACHE DRIVE
====================================================== */

function obtenerCacheDrive(){

  const archivos =
    DriveApp
      .getFilesByName(
        NOMBRE_ARCHIVO_CACHE
      );


  if(
    !archivos.hasNext()
  ){

    return null;

  }


  const archivo =
    archivos.next();


  try{

    const contenido =
      archivo
        .getBlob()
        .getDataAsString();


    if(
      !contenido
    ){

      return null;

    }


    return JSON.parse(
      contenido
    );


  }catch(error){

    console.error(
      "Error leyendo cache:",
      error
    );


    return null;

  }

}


/* ======================================================
   NÚMERO
====================================================== */

function numero(
  valor
){

  if(

    valor === "" ||

    valor === null ||

    valor === undefined

  ){

    return null;

  }


  if(
    typeof valor === "number"
  ){

    return isFinite(valor)
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


  if(

    texto.includes(",") &&

    texto.includes(".")

  ){

    if(

      texto.lastIndexOf(",") >

      texto.lastIndexOf(".")

    ){

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

    }else{

      texto =
        texto.replace(
          /,/g,
          ""
        );

    }

  }else if(
    texto.includes(",")
  ){

    texto =
      texto.replace(
        ",",
        "."
      );

  }


  texto =
    texto.replace(
      /[^0-9.-]/g,
      ""
    );


  const n =
    Number(
      texto
    );


  return isFinite(n)
    ? n
    : null;

}
