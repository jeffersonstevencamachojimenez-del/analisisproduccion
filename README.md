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
    
