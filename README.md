# 🚀 M.A.R.T.E — Interplanetary Survival Guide: Martian Map
### NASA Space Apps Challenge 2026 // Challenge 1.1

> **"Real Data. Safer Journeys. Bigger Discoveries."**

![Status](https://img.shields.io/badge/MISSION%20STATUS-NOMINAL%20%2F%20ACTIVE-brightgreen)
![Challenge](https://img.shields.io/badge/NASA%20Space%20Apps-2026-ff6b2b)
![Build](https://img.shields.io/badge/Bundler-Vite%206-646cff)
![License](https://img.shields.io/badge/License-MIT-blue)

Plataforma web interactiva de planificación de travesías extravehiculares (**EVA**) y supervivencia humana en Marte. Diseñada como una consola **HUD aeroespacial** (modo oscuro con acentos `#FF6B2B` y `#00E5FF`), combina **cartografía orbital multiespectral 2D**, simulación biofísica de soporte vital y un visor inmersivo **Martian Street View 360°** alimentado con mosaicos reales e imágenes en vivo de la NASA.

---

## 🛰️ Módulos Principales

- **Consola HUD Espacial Adaptativa:** Sala de control sin superposiciones con paneles laterales retráctiles, modo **Pantalla Dividida (`2D + 360°`)**, reloj marciano en vivo (**MTC — Coordinated Mars Time**), retroalimentación sonora sintetizada por *Web Audio API* e interfaz móvil adaptable estilo navegador táctico (*bottom sheets*).
- **Cartografía Orbital 2D Multiespectral:** Mapa interactivo sobre proyección planetaria con **6 capas base** (*Viking MDIM 2.1*, *MOLA Hypsometric Relief*, *Celestia 16K Shaded Relief*, *THEMIS Day IR* y servicios WMS de *USGS Astrogeology*), malla táctica procedural a alto zoom y **5 capas científicas dinámicas**:
  1. **Topografía (MOLA):** Curvas de nivel y cotas altimétricas regionales.
  2. **Geología (THEMIS IR):** Unidades litoestratigráficas y zonas de riesgo.
  3. **Recursos H₂O (ISRU / SHARAD):** Reservas de hielo subterráneo para extracción de agua y oxígeno.
  4. **Clima y Atmósfera:** Frentes regionales de tormentas de polvo y vientos catabáticos.
  5. **Sitios de Misión NASA:** Ubicaciones históricas y activas de *landers*, *rovers* y helicóptero *Ingenuity*.
- **Planificador de Rutas EVA y Motor de Supervivencia:**
  - **4 travesías científicas preconfiguradas** (*Jezero-Alpha*, *Jezero-Beta*, *Gale Crater — Mount Sharp*, *Valles Marineris — Coprates Chasma*) y **trazado manual personalizado** directamente sobre el mapa (`+ TRAZAR EN MAPA`).
  - Cálculo geodésico mediante la fórmula de **Haversine** ajustada al radio ecuatorial marciano (`3,396.2 km`).
  - **Perfil de elevación SVG interactivo** y simulador de recorrido en tiempo real que estima consumo metabólico de **O₂**, descarga de **batería del rover** (MMRTG + paneles solares penalizados por opacidad atmosférica `τ`), distancia y tiempo estimado de misión.
- **Martian Street View 360° (Motor Propio en Canvas 2D):**
  - Exploración esférica/cilíndrica a 60 FPS con paneo inercial, zoom de campo visual (FOV), mini-mapa de orientación, **hotspots científicos 3D** y cono de visión radar sincronizado en tiempo real con el mapa 2D.
  - Conmutación instantánea entre **Foto Real NASA** (panoramas de *Perseverance Mastcam-Z* y *Curiosity Mastcam*) y **Simulación Topográfica DEM**.
  - **Buscador fotográfico integrado en vivo** con la API oficial `images-api.nasa.gov` para cargar nuevos panoramas marcianos bajo demanda.
- **Dossier de Misiones y Exportación Táctica (`.json`):**
  - Fichas técnicas detalladas de 6 misiones emblemáticas de la NASA en un modal nativo `<dialog>` y generación/descarga del **Manifiesto Táctico EVA** en formato JSON.

---

## 🛠️ Stack Tecnológico Real

- **Frontend Core:** HTML5 Semántico (`<dialog>`, gráficos SVG dinámicos), CSS3 Puro (CSS Grid, Custom Properties, diseño responsivo móvil/escritorio), Vanilla JavaScript (ES6+).
- **Empaquetado y Entorno de Desarrollo:** [Vite 6](https://vite.dev/).
- **Cartografía 2D & Renderizado 360°:**
  - [Leaflet.js 1.9.4](https://leafletjs.com/) — Motor GIS 2D, capas de teselas planetarias y superposiciones WMS.
  - **HTML5 Canvas 2D API** — Motor propio de proyección panorámica 360° y capa táctica procedural.
  - **Web Audio API** — Sintetizador de audio sci-fi para alertas e interacciones del HUD (sin archivos de audio externos).
- **Tipografía e Iconografía:** Google Fonts (`Orbitron`, `Rajdhani`, `Share Tech Mono`) y Font Awesome `6.5.1`.

---

## 📡 Fuentes de Datos Científicos y Créditos

- **NASA Image and Video Library API (`images-api.nasa.gov`):** Búsqueda y carga en tiempo real de mosaicos y fotografías de misiones marcianas.
- **USGS Astrogeology Science Center & OpenPlanetaryMap:** Mosaicos globales *Mars Viking MDIM 2.1*, altimetría láser *MGS MOLA* e infrarrojo térmico *Mars Odyssey THEMIS*.
- **NASA / JPL-Caltech / MSSS / ASU Photojournal:** Panorámicas de superficie integradas localmente (`PIA24921`, `PIA24264`, `PIA26369`, `PIA26474`, `PIA22545`, `PIA26363`, `PIA13077`) y parámetros ambientales de referencia basados en las estaciones *MEDA* (Mars 2020) y *REMS* (MSL).

---

## 📂 Estructura del Proyecto

```text
M.A.R.T.E/
├── public/
│   └── panoramas/        # Mosaicos panorámicos 360° locales de NASA/JPL
├── index.html            # Estructura semántica del HUD, paneles, visores y modal <dialog>
├── styles.css            # Sistema de diseño sci-fi, layout Grid y modo móvil responsivo
├── app.js                # Lógica GIS (Leaflet), telemetría EVA, motor 360° y conexión API NASA
├── vite.config.js        # Configuración de Vite con base relativa ('./') para despliegue estático
└── package.json          # Scripts de desarrollo y construcción
```

---

## ⚡ Instalación y Ejecución Local

### Requisitos previos
- **Node.js** `>= 18` y **npm**.

### Pasos

```bash
# 1. Entrar al directorio del proyecto
cd M.A.R.T.E

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo (abre automáticamente en el navegador)
npm run dev
```