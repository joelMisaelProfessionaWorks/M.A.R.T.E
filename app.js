/**
 * ============================================================================
 * NASA SPACE APPS CHALLENGE 2026
 * PROYECTO: Interplanetary Survival Guide: Martian Map (M.A.R.T.E)
 * ETAPA 2 & ETAPA 3:
 *  - Mapa Orbital 2D Interactivo con Leaflet.js y 5 Capas de la NASA
 *  - Planificador de Rutas y Motor de Telemetría de Supervivencia en Tiempo Real
 * ============================================================================
 */

function initMarsDashboard() {
  // Referencias del DOM principales
  const viewportStage = document.getElementById('viewport-stage');
  const mapContainer = document.getElementById('map-container');
  const streetContainer = document.getElementById('streetview-container');
  const btnToggleStreet = document.getElementById('btn-toggle-streetview');
  const btnSplitView = document.getElementById('btn-split-view');
  const btnCloseStreet = document.getElementById('btn-close-streetview');
  const btnQuick360 = document.getElementById('btn-quick-360');
  const streetBtnLabel = document.getElementById('streetview-btn-label');
  const cursorReadout = document.getElementById('map-cursor-readout');
  const headerCoords = document.getElementById('hud-header-coords');
  const activeLayersCounter = document.getElementById('active-layers-counter');

  // Referencias del DOM Etapa 3 (Planificador de Rutas y Telemetría)
  const routeSelector = document.getElementById('route-selector');
  const routeDifficultyEl = document.getElementById('route-difficulty');
  const routeMaxSlopeEl = document.getElementById('route-max-slope');
  const btnCustomDraw = document.getElementById('btn-custom-draw');
  const btnResetRoute = document.getElementById('btn-reset-route');
  const roverSlider = document.getElementById('rover-progress-slider');
  const roverProgressPct = document.getElementById('rover-progress-pct');
  const btnPlaySim = document.getElementById('btn-play-sim');

  const missionTitleEl = document.getElementById('mission-title-text');
  const missionSectorEl = document.getElementById('mission-sector-text');
  const missionDescEl = document.getElementById('mission-desc-text');
  const waypointsListEl = document.getElementById('waypoints-list');
  const directiveBoxEl = document.getElementById('survival-directive-box');
  const directiveTitleEl = document.getElementById('survival-directive-title');
  const directiveTextEl = document.getElementById('survival-directive-text');

  // Referencias del Perfil de Elevación SVG
  const elevTitleEl = document.getElementById('elev-title-text');
  const elevMetaEl = document.getElementById('elev-meta-text');
  const elevSvg = document.getElementById('elevation-svg');
  const elevPolygon = document.getElementById('elev-polygon');
  const elevPath = document.getElementById('elev-path');
  const elevRoverLine = document.getElementById('elev-rover-line');
  const elevRoverDot = document.getElementById('elev-rover-dot');
  const elevRoverLabel = document.getElementById('elev-rover-label');

  // Referencias de las 4 Tarjetas de Supervivencia
  const cardOxygen = document.getElementById('card-oxygen');
  const metricOxygen = document.getElementById('metric-oxygen');
  const metricOxygenReserve = document.getElementById('metric-oxygen-reserve');
  const metricOxygenRate = document.getElementById('metric-oxygen-rate');
  const barOxygen = document.getElementById('bar-oxygen');

  const cardBattery = document.getElementById('card-battery');
  const metricBattery = document.getElementById('metric-battery');
  const metricBatteryTag = document.getElementById('metric-battery-tag');
  const metricBatteryRange = document.getElementById('metric-battery-range');
  const barBattery = document.getElementById('bar-battery');

  const metricDistance = document.getElementById('metric-distance');
  const metricDistanceTraveled = document.getElementById('metric-distance-traveled');
  const metricDistanceRemaining = document.getElementById('metric-distance-remaining');
  const barDistance = document.getElementById('bar-distance');

  const metricTime = document.getElementById('metric-time');
  const metricSpeedTag = document.getElementById('metric-speed-tag');
  const metricTimeSub = document.getElementById('metric-time-sub');
  const barTime = document.getElementById('bar-time');

  // Constantes Planetarias Marcianas (Zoom calibrado a resolución nativa orbital para nitidez total)
  const MARS_RADIUS_KM = 3396.2; // Radio ecuatorial de Marte en km
  const JEZERO_CENTER = [18.45, 77.42];
  const DEFAULT_ZOOM = 6; // Nivel de zoom óptimo nativo (evita pixelado y sobre-zoom)

  // ==========================================================================
  // 1. CATÁLOGO CIENTÍFICO DE RUTAS MARCIANAS (ETAPA 3 — ESCALA TÁCTICA NÍTIDA)
  // ==========================================================================
  const ROUTES_CATALOG = {
    'jezero-alpha': {
      id: 'jezero-alpha',
      code: 'JEZERO-ALPHA',
      title: 'Exploradores Humanos: Destino Jezero Crater',
      sector: 'Sector: Abanico Aluvial Occidental • Cuadrángulo Syrtis Major',
      desc: 'Travesía planificada para astronautas y rover presurizado desde el sitio de descenso hasta el antiguo delta lacustre. Prioridad: extracción de regolito hidratado y establecimiento del Campamento Base.',
      difficulty: 'INTERMEDIA',
      maxSlopeDeg: 14.2,
      slopeStatus: 'SEGURA',
      avgSpeedKmh: 3.1,
      totalDistKm: 14.6,
      baseO2RatePerKm: 3.15, // % de tanque EVA por km
      baseBatteryPerKm: 1.65, // % de batería por km
      center: [18.45, 77.42],
      zoom: 8,
      pathCoords: [
        [18.28, 77.68, -2540],
        [18.33, 77.59, -2518],
        [18.38, 77.49, -2490],
        [18.45, 77.41, -2465],
        [18.52, 77.33, -2435],
        [18.58, 77.24, -2405],
        [18.64, 77.15, -2380]
      ],
      waypoints: [
        {
          name: 'Punto de Inicio (Start)',
          sub: 'Octavia E. Butler Landing',
          km: 0.0,
          coords: [18.28, 77.68],
          elev: -2540
        },
        {
          name: 'Parada Científica: Kodiak',
          sub: 'Análisis estratigráfico fluvial',
          km: 4.8,
          coords: [18.38, 77.49],
          elev: -2490
        },
        {
          name: 'Depósito de Hielo Subterráneo',
          sub: 'Extracción ISRU de H₂O',
          km: 9.4,
          coords: [18.52, 77.33],
          elev: -2435
        },
        {
          name: 'Campamento Base (Base Camp)',
          sub: 'Hábitat Delta Prime',
          km: 14.6,
          coords: [18.64, 77.15],
          elev: -2380
        }
      ]
    },

    'jezero-beta': {
      id: 'jezero-beta',
      code: 'JEZERO-BETA',
      title: 'Expedición Geológica: Cráter Belva y Neretva Vallis',
      sector: 'Sector: Meseta Superior del Delta • Canal de Entrada Occidental',
      desc: 'Ruta de ascenso pronunciado bordeando el cráter de impacto Belva hacia el cañón alimentador Neretva Vallis. Mayor gasto energético a cambio de muestras de corteza profunda.',
      difficulty: 'ALTA',
      maxSlopeDeg: 19.8,
      slopeStatus: 'PRECAUCIÓN',
      avgSpeedKmh: 2.6,
      totalDistKm: 19.2,
      baseO2RatePerKm: 3.45,
      baseBatteryPerKm: 2.15,
      center: [18.52, 77.32],
      zoom: 8,
      pathCoords: [
        [18.28, 77.68, -2540],
        [18.39, 77.55, -2495],
        [18.49, 77.42, -2420],
        [18.58, 77.28, -2365],
        [18.66, 77.14, -2325],
        [18.74, 76.98, -2295]
      ],
      waypoints: [
        {
          name: 'Octavia E. Butler Landing',
          sub: 'Base de partida en llanura',
          km: 0.0,
          coords: [18.28, 77.68],
          elev: -2540
        },
        {
          name: 'Frente del Delta Norte',
          sub: 'Ascenso por talud sedimentario',
          km: 6.1,
          coords: [18.49, 77.42],
          elev: -2420
        },
        {
          name: 'Mirador Cráter Belva',
          sub: 'Impacto expone estratos antiguos',
          km: 12.8,
          coords: [18.58, 77.28],
          elev: -2365
        },
        {
          name: 'Boca de Neretva Vallis',
          sub: 'Estación Hidrológica Avanzada',
          km: 19.2,
          coords: [18.74, 76.98],
          elev: -2295
        }
      ]
    },

    'gale-sharp': {
      id: 'gale-sharp',
      code: 'GALE-SHARP',
      title: 'Travesía Histórica: Cráter Gale hacia Aeolis Mons',
      sector: 'Sector: Aeolis Palus • Faldas del Monte Sharp (5.5 km altitud)',
      desc: 'Siguiendo la huella histórica del rover Curiosity a través de dunas basálticas oscuras (Bagnold Dunes) y crestas ricas en hematita y sulfatos.',
      difficulty: 'ALTA',
      maxSlopeDeg: 23.4,
      slopeStatus: 'EXIGENTE',
      avgSpeedKmh: 2.4,
      totalDistKm: 24.8,
      baseO2RatePerKm: 3.30,
      baseBatteryPerKm: 2.35,
      center: [-4.68, 137.38],
      zoom: 8,
      pathCoords: [
        [-4.42, 137.62, -4501],
        [-4.54, 137.50, -4440],
        [-4.68, 137.38, -4310],
        [-4.81, 137.26, -4185],
        [-4.95, 137.14, -4011]
      ],
      waypoints: [
        {
          name: 'Bradbury Landing (Inicio)',
          sub: 'Sitio de descenso MSL Curiosity',
          km: 0.0,
          coords: [-4.42, 137.62],
          elev: -4501
        },
        {
          name: 'Campo de Dunas Bagnold',
          sub: 'Arena basáltica eólica activa',
          km: 7.4,
          coords: [-4.54, 137.50],
          elev: -4440
        },
        {
          name: 'Cresta Vera Rubin',
          sub: 'Depósitos de óxido férrico (Hematita)',
          km: 16.2,
          coords: [-4.68, 137.38],
          elev: -4310
        },
        {
          name: 'Unidad de Sulfatos Monte Sharp',
          sub: 'Campamento de Altura Gale',
          km: 24.8,
          coords: [-4.95, 137.14],
          elev: -4011
        }
      ]
    },

    'valles-marineris': {
      id: 'valles-marineris',
      code: 'VALLES-SUR',
      title: 'Misión Extrema: Cañón Coprates (Valles Marineris)',
      sector: 'Sector: Coprates Chasma • Sistema de Cañones Ecuatoriales',
      desc: 'Exploración de alto riesgo en el cañón tectónico más grande del Sistema Solar. Fuertes vientos catabáticos y pendientes cercanas al límite de vuelco del rover (28°).',
      difficulty: 'EXTREMA',
      maxSlopeDeg: 27.6,
      slopeStatus: 'CRÍTICA',
      avgSpeedKmh: 2.1,
      totalDistKm: 31.5,
      baseO2RatePerKm: 3.65,
      baseBatteryPerKm: 2.65,
      center: [-13.88, -59.18],
      zoom: 8,
      pathCoords: [
        [-13.62, -59.52, -4120],
        [-13.75, -59.35, -3960],
        [-13.88, -59.18, -3790],
        [-14.01, -59.01, -3610],
        [-14.14, -58.84, -3440]
      ],
      waypoints: [
        {
          name: 'Plataforma Coprates Floor',
          sub: 'Fondo del cañón abisal',
          km: 0.0,
          coords: [-13.62, -59.52],
          elev: -4120
        },
        {
          name: 'Escarpe de Falla Normal 01',
          sub: 'Pendiente rocosa de 27.6°',
          km: 10.5,
          coords: [-13.75, -59.35],
          elev: -3960
        },
        {
          name: 'Terraza de Sulfatos Hídricos',
          sub: 'Vetas minerales expuestas',
          km: 21.0,
          coords: [-13.88, -59.18],
          elev: -3790
        },
        {
          name: 'Refugio Subterráneo de Pared',
          sub: 'Tubo de lava / Caverna protegida',
          km: 31.5,
          coords: [-14.14, -58.84],
          elev: -3440
        }
      ]
    }
  };

  // Estado reactivo de la misión (Etapa 3)
  let currentRouteKey = 'jezero-alpha';
  let activeRouteData = structuredClone(ROUTES_CATALOG['jezero-alpha']);
  let roverProgress = 33; // % (0 a 100)
  let isCustomDrawing = false;
  let simIntervalId = null;

  // ==========================================================================
  // 2. INICIALIZACIÓN DEL MOTOR CARTOGRÁFICO LEAFLET.JS (ETAPA 2 — ALTA NITIDEZ)
  // ==========================================================================
  const marsMap = L.map('mars-leaflet-map', {
    center: JEZERO_CENTER,
    zoom: DEFAULT_ZOOM,
    minZoom: 2,
    maxZoom: 10,
    zoomControl: false,
    attributionControl: true
  });

  marsMap.attributionControl.setPrefix(
    '<span class="hud-attr-tag">NASA / JPL-Caltech / USGS Astrogeology / OpenPlanetaryMap</span>'
  );

  const USGS_MARS_WMS_URL =
    'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map';

  const baseTiles = {
    opmMars: L.tileLayer(
      'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-2/all/{z}/{x}/{y}.png',
      {
        maxZoom: 10,
        maxNativeZoom: 6,
        keepBuffer: 6,
        updateWhenIdle: false,
        zIndex: 1,
        attribution: 'OpenPlanetaryMap / Viking MDIM 2.1'
      }
    ),
    molaBase: L.tileLayer(
      'https://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/mola-color/{z}/{x}/{y}.png',
      {
        tms: true,
        maxZoom: 10,
        maxNativeZoom: 6,
        keepBuffer: 6,
        updateWhenIdle: false,
        zIndex: 2,
        attribution: 'NASA MGS MOLA Altimetry Color'
      }
    ),
    shadedRelief: L.tileLayer(
      'https://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/celestia_mars-shaded-16k_global/{z}/{x}/{y}.png',
      {
        tms: true,
        maxZoom: 10,
        maxNativeZoom: 5,
        keepBuffer: 6,
        updateWhenIdle: false,
        opacity: 0.35,
        zIndex: 2,
        attribution: 'Celestia 16K Shaded Relief'
      }
    ),
    usgsBlend: L.tileLayer.wms(USGS_MARS_WMS_URL, {
      layers: 'MOLA_THEMIS_blend',
      format: 'image/jpeg',
      maxZoom: 10,
      zIndex: 3,
      attribution: 'USGS Astrogeology / NASA MGS MOLA + Odyssey THEMIS IR (100m)'
    }),
    usgsHrsc: L.tileLayer.wms(USGS_MARS_WMS_URL, {
      layers: 'HRSC_MOLA_Blend_Hillshade',
      format: 'image/jpeg',
      maxZoom: 10,
      zIndex: 3,
      attribution: 'ESA Mars Express HRSC + NASA MGS MOLA Blended Hillshade'
    })
  };

  // Capa independiente para el switch "Topography (MOLA)" para que NUNCA se borre al cambiar el modelo de mapa
  const molaTopoOverlay = L.tileLayer(
    'https://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/mola-color/{z}/{x}/{y}.png',
    {
      tms: true,
      maxZoom: 10,
      maxNativeZoom: 6,
      opacity: 0.42,
      zIndex: 5,
      attribution: 'NASA MGS MOLA Altimetry Overlay'
    }
  );

  // Capa Procedural Táctica de Alta Definición (HiRISE/CTX Detail Grid) para evitar pixelado en zoom de Rover
  const TacticalDetailGridLayer = L.GridLayer.extend({
    createTile: function (coords) {
      const tile = document.createElement('canvas');
      tile.width = 256;
      tile.height = 256;
      if (coords.z < 6) return tile;

      const ctx = tile.getContext('2d');
      const seedBase = ((coords.x * 73856093) ^ (coords.y * 19349663) ^ (coords.z * 83492791)) >>> 0;
      const rand = (n) => {
        const x = Math.sin(seedBase + n * 127.1) * 43758.5453;
        return x - Math.floor(x);
      };

      // Retícula telemétrica fina de sub-sector orbital
      ctx.strokeStyle = 'rgba(255, 107, 43, 0.14)';
      ctx.lineWidth = 0.75;
      ctx.strokeRect(0.5, 0.5, 255, 255);

      ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
      ctx.beginPath();
      ctx.moveTo(128, 0);
      ctx.lineTo(128, 256);
      ctx.moveTo(0, 128);
      ctx.lineTo(256, 128);
      ctx.stroke();

      // Micro-cráteres y anillos de relieve HiRISE nítidos a alto zoom
      const craterCount = 5 + (seedBase % 6);
      for (let i = 0; i < craterCount; i++) {
        const cx = 24 + rand(i * 3 + 1) * 208;
        const cy = 24 + rand(i * 3 + 2) * 208;
        const r = 4 + rand(i * 3 + 3) * 18;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 180, 130, 0.22)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx - 1, cy - 1, r * 0.85, Math.PI * 0.8, Math.PI * 1.75);
        ctx.strokeStyle = 'rgba(15, 8, 4, 0.32)';
        ctx.stroke();
      }

      // Etiqueta telemétrica de cuadrícula MRO CTX
      ctx.fillStyle = 'rgba(255, 158, 102, 0.34)';
      ctx.font = '9px "Share Tech Mono", monospace';
      ctx.fillText(`CTX-${coords.z}:${coords.x}:${coords.y}`, 6, 14);

      return tile;
    }
  });

  const tacticalDetailGrid = new TacticalDetailGridLayer({
    maxZoom: 10,
    zIndex: 6,
    opacity: 0.85
  });

  // Iniciar con el modelo híbrido CDN instantáneo (Viking OPM + Relieve + Detalle Táctico HiRISE)
  baseTiles.opmMars.addTo(marsMap);
  baseTiles.shadedRelief.addTo(marsMap);
  tacticalDetailGrid.addTo(marsMap);

  // ==========================================================================
  // 3. CONSTRUCCIÓN DINÁMICA DE LAS 5 CAPAS CIENTÍFICAS DE LA NASA POR REGIÓN
  // ==========================================================================
  const nasaLayers = {
    topo: L.layerGroup(),
    geol: L.layerGroup(),
    res: L.layerGroup(),
    weather: L.layerGroup(),
    sites: L.layerGroup()
  };

  // Sub-grupo dinámico para la ruta activa y marcadores de waypoints
  const dynamicRouteLayerGroup = L.layerGroup();
  nasaLayers.sites.addLayer(dynamicRouteLayerGroup);

  // Sub-grupo dinámico para las curvas de nivel MOLA de la región activa
  const regionalContoursGroup = L.layerGroup();
  nasaLayers.topo.addLayer(molaTopoOverlay);
  nasaLayers.topo.addLayer(regionalContoursGroup);

  // Base de datos cartográfica regional para que las capas (Topography, Geology, Resources, Weather)
  // se actualicen automáticamente con el mapa al cambiar de ruta o sector marciano
  const REGIONAL_LAYERS_DB = {
    'jezero-alpha': {
      contours: [
        {
          elev: '-2,560m (Piso Lacustre Jezero)',
          color: '#ff9e66',
          dash: '6, 6',
          coords: [[18.18, 77.52], [18.25, 77.74], [18.46, 77.78], [18.65, 77.62], [18.68, 77.38]]
        },
        {
          elev: '-2,460m (Talud Frontal del Delta)',
          color: '#FF6B2B',
          dash: null,
          coords: [[18.24, 77.38], [18.38, 77.52], [18.54, 77.48], [18.66, 77.30], [18.72, 77.12]]
        },
        {
          elev: '-2,340m (Meseta Delta Prime & Borde Cráter)',
          color: '#ff3d00',
          dash: '10, 5',
          coords: [[18.32, 77.10], [18.48, 77.26], [18.62, 77.22], [18.75, 77.05]]
        }
      ],
      geology: [
        {
          name: 'Unidad Deltaica Aluvial (Filosilicatos y Carbonatos)',
          code: 'Nh-d1 // Alta Prioridad Astrobiológica',
          desc: 'Sedimentos fluviales ricos en arcillas esmectitas y carbonatos depositados por el antiguo río Neretva Vallis hace ~3.700 millones de años.',
          color: '#ce93d8',
          fillColor: '#ab47bc',
          coords: [[18.44, 77.12], [18.68, 77.14], [18.64, 77.42], [18.40, 77.38]]
        },
        {
          name: 'Unidad Máaz (Piso Volcánico Basáltico / Olivino)',
          code: 'Ah-v2 // Regolito Ígneo Fracturado',
          desc: 'Rocas ígneas ricas en piroxeno y olivino alteradas por agua subterránea. Terreno firme óptimo para tracción de rovers.',
          color: '#ffb74d',
          fillColor: '#f57c00',
          coords: [[18.20, 77.46], [18.44, 77.48], [18.42, 77.76], [18.18, 77.72]]
        },
        {
          name: 'Unidad Séítah (Cumulados de Olivino y Carbonato Magnésico)',
          code: 'Nh-s3 // Zona de Dunas Eólicas',
          desc: 'Afloramiento geológico más antiguo del piso del cráter con presencia de ondas eólicas (megaripples). Precaución: riesgo de atasco en ruedas.',
          color: '#ef5350',
          fillColor: '#d32f2f',
          coords: [[18.30, 77.32], [18.48, 77.35], [18.46, 77.54], [18.28, 77.50]]
        }
      ],
      resources: [
        {
          name: 'Reserva de Hielo Subsuperficial: Delta Norte (ISRU-01)',
          coords: [18.52, 77.33],
          radius: 5800,
          purity: '84% H₂O Cristalino + Sílice Hidratada',
          depth: '1.2m bajo regolito',
          yield: 'Estimado: 42,000 Litros procesables'
        },
        {
          name: 'Bolsón de Permafrost Protegido: Neretva Rim (ISRU-02)',
          coords: [18.64, 77.15],
          radius: 4800,
          purity: '91% Hielo de Agua Subterráneo',
          depth: '0.8m (Sombra térmica permanente)',
          yield: 'Estimado: 68,500 Litros (Soporte Vital Campamento Base)'
        },
        {
          name: 'Depósito de Sulfatos Polihidratados: Kodiak Este',
          coords: [18.35, 77.56],
          radius: 4200,
          purity: '38% Agua ligada a minerales',
          depth: 'Superficial (0.2m)',
          yield: 'Requiere horno de pirólisis a 450°C'
        }
      ],
      weather: {
        coords: [18.24, 77.22],
        outerRadius: 11500,
        innerRadius: 5500,
        tag: 'TORMENTA DE POLVO (&tau; 1.45 | 24.5 KM/H)',
        title: 'Frente de Tormenta de Polvo Regional (Jezero SO)',
        desc: 'Avance hacia el ENE a 24.5 km/h. Opacidad atmosférica Tau (&tau;) subiendo a 1.45. Se recomienda completar travesía antes de las 17:30 MTC.'
      }
    },
    'jezero-beta': {
      contours: [
        {
          elev: '-2,420m (Rampa de Ascenso Belva)',
          color: '#ff9e66',
          dash: '6, 6',
          coords: [[18.34, 77.45], [18.48, 77.56], [18.64, 77.46], [18.74, 77.28]]
        },
        {
          elev: '-2,350m (Anillo de Eyección Cráter Belva)',
          color: '#FF6B2B',
          dash: null,
          coords: [[18.48, 77.18], [18.58, 77.34], [18.68, 77.26], [18.76, 77.08]]
        },
        {
          elev: '-2,280m (Garganta de Neretva Vallis)',
          color: '#ff3d00',
          dash: '10, 5',
          coords: [[18.60, 76.88], [18.72, 77.04], [18.82, 76.96]]
        }
      ],
      geology: [
        {
          name: 'Brecha de Impacto Cráter Belva (Estratigrafía Expuesta)',
          code: 'Hc-b1 // Ventana Cortical Profunda',
          desc: 'Cráter de impacto de 900m que expone secuencias deltaicas profundas y megabloques transportados por inundaciones.',
          color: '#ce93d8',
          fillColor: '#8e24aa',
          coords: [[18.50, 77.18], [18.66, 77.20], [18.64, 77.38], [18.48, 77.35]]
        },
        {
          name: 'Canal Fluvial Neretva Vallis (Arcillas Fe/Mg)',
          code: 'Nh-nv // Antiguo Cañón Alimentador',
          desc: 'Lecho rocoso tallado por el río que alimentó el lago Jezero. Abundantes filosilicatos hidratados.',
          color: '#4dd0e1',
          fillColor: '#0097a7',
          coords: [[18.64, 76.88], [18.80, 76.90], [18.78, 77.16], [18.62, 77.12]]
        }
      ],
      resources: [
        {
          name: 'Acuífero Congelado Neretva Gorge (ISRU-NV1)',
          coords: [18.74, 76.98],
          radius: 6200,
          purity: '93% Hielo Subsuperficial en Pared de Cañón',
          depth: '0.7m bajo talud norte',
          yield: 'Estimado: 74,000 Litros procesables'
        },
        {
          name: 'Lente de Hielo Cráter Belva Sur (ISRU-BV2)',
          coords: [18.58, 77.28],
          radius: 4800,
          purity: '81% H₂O en brecha porosa',
          depth: '1.4m bajo piso del cráter',
          yield: 'Estimado: 39,000 Litros procesables'
        }
      ],
      weather: {
        coords: [18.62, 77.18],
        outerRadius: 10500,
        innerRadius: 4800,
        tag: 'TURBULENCIA BELVA (&tau; 0.81 | 29.2 KM/H)',
        title: 'Enjambre de Remolinos (Dust Devils) en Borde Belva',
        desc: 'Vórtices convectivos detectados por el sensor MEDA-Norte con ráfagas de 29.2 km/h.'
      }
    },
    'gale-sharp': {
      contours: [
        {
          elev: '-4,500m (Llanura Aeolis Palus / Bradbury)',
          color: '#ff9e66',
          dash: '6, 6',
          coords: [[-4.35, 137.45], [-4.42, 137.70], [-4.60, 137.68], [-4.68, 137.52]]
        },
        {
          elev: '-4,310m (Cresta de Hematita Vera Rubin)',
          color: '#FF6B2B',
          dash: null,
          coords: [[-4.55, 137.28], [-4.68, 137.45], [-4.82, 137.38], [-4.88, 137.22]]
        },
        {
          elev: '-4,010m (Faldas de Sulfatos Aeolis Mons / Monte Sharp)',
          color: '#ff3d00',
          dash: '10, 5',
          coords: [[-4.78, 137.05], [-4.92, 137.22], [-5.05, 137.12]]
        }
      ],
      geology: [
        {
          name: 'Campo de Dunas Eólicas Bagnold (Basalto y Olivino)',
          code: 'Am-bd // Dunas Activas Oscuras',
          desc: 'Cinturón de dunas de arena basáltica moldeadas por vientos del Monte Sharp. Baja tracción para ruedas metálicas.',
          color: '#ef5350',
          fillColor: '#c62828',
          coords: [[-4.48, 137.38], [-4.62, 137.40], [-4.60, 137.58], [-4.46, 137.55]]
        },
        {
          name: 'Formación Murray & Cresta Vera Rubin (Lutitas Lacustres)',
          code: 'Hm-vr // Hematita y Arcillas Esmectitas',
          desc: 'Sedimentos lacustres finamente laminados que prueban la existencia de un lago habitable de larga duración en Gale.',
          color: '#ce93d8',
          fillColor: '#9c27b0',
          coords: [[-4.62, 137.24], [-4.80, 137.26], [-4.78, 137.46], [-4.60, 137.42]]
        },
        {
          name: 'Unidad Portadora de Sulfatos (Monte Sharp / Gediz Vallis)',
          code: 'Hs-ms // Kieserita y Sulfatos de Magnesio',
          desc: 'Estratos depositados durante la transición climática de Marte hacia una era más árida.',
          color: '#ffb74d',
          fillColor: '#ef6c00',
          coords: [[-4.82, 137.04], [-5.02, 137.06], [-4.98, 137.28], [-4.80, 137.24]]
        }
      ],
      resources: [
        {
          name: 'Arcillas Hidratadas Glen Torridon (ISRU-GALE-01)',
          coords: [-4.68, 137.38],
          radius: 6400,
          purity: '62% Agua Estructural en Filosilicatos',
          depth: '0.4m bajo superficie',
          yield: 'Estimado: 51,000 Litros mediante extracción térmica'
        },
        {
          name: 'Canal Aluvial Gediz Vallis (ISRU-GALE-02)',
          coords: [-4.95, 137.14],
          radius: 5600,
          purity: '78% Sulfatos Polihidratados + H₂O Subsuperficial',
          depth: '1.1m en abanico de escombros',
          yield: 'Estimado: 63,000 Litros procesables'
        }
      ],
      weather: {
        coords: [-4.76, 137.52],
        outerRadius: 12000,
        innerRadius: 5200,
        tag: 'VIENTO DE LADERA GALE (&tau; 0.58 | 18.4 KM/H)',
        title: 'Corriente Descendente de Aeolis Mons (Monte Sharp)',
        desc: 'Flujo térmico NNO a 18.4 km/h registrado por la estación REMS del rover Curiosity.'
      }
    },
    'valles-marineris': {
      contours: [
        {
          elev: '-4,120m (Piso Abisal Coprates Chasma)',
          color: '#ff9e66',
          dash: '6, 6',
          coords: [[-13.52, -59.62], [-13.68, -59.40], [-13.84, -59.48]]
        },
        {
          elev: '-3,790m (Terraza Tectónica de Falla Normal)',
          color: '#FF6B2B',
          dash: null,
          coords: [[-13.70, -59.38], [-13.88, -59.18], [-14.04, -59.25]]
        },
        {
          elev: '-3,440m (Escarpe Superior y Pared del Cañón)',
          color: '#ff3d00',
          dash: '10, 5',
          coords: [[-13.92, -59.02], [-14.12, -58.82], [-14.24, -58.95]]
        }
      ],
      geology: [
        {
          name: 'Depósitos Estratificados Interiores (Sulfatos Hídricos)',
          code: 'Hvi-s1 // Mesetas Sedimentarias del Cañón',
          desc: 'Secuencias kilométricas de sulfatos hidratados y óxidos férricos expuestos por el colapso tectónico de Valles Marineris.',
          color: '#ce93d8',
          fillColor: '#8e24aa',
          coords: [[-13.76, -59.32], [-13.98, -59.30], [-13.96, -59.05], [-13.74, -59.08]]
        },
        {
          name: 'Escarpe Basáltico y Deslizamientos de Roca (Landslides)',
          code: 'Av-ls // Pendiente Crítica 27.6°',
          desc: 'Taludes de fragmentación volcánica con líneas de pendiente recurrentes (RSL).',
          color: '#ef5350',
          fillColor: '#d32f2f',
          coords: [[-13.96, -59.04], [-14.20, -59.02], [-14.18, -58.76], [-13.94, -58.78]]
        }
      ],
      resources: [
        {
          name: 'Acuífero Salino y Niebla H₂O Coprates (ISRU-VM-01)',
          coords: [-13.88, -59.18],
          radius: 7500,
          purity: '89% Salmueras Hidratadas + Condensación Atmosférica',
          depth: '0.9m en terraza fracturada',
          yield: 'Estimado: 92,000 Litros procesables'
        },
        {
          name: 'Caverna / Tubo Subterráneo con Glaciar Enterrado (ISRU-VM-02)',
          coords: [-14.14, -58.84],
          radius: 6200,
          purity: '95% Hielo Protegido de Radiación UV',
          depth: 'Interior de caverna de pared',
          yield: 'Estimado: 120,000 Litros (Base Permanente)'
        }
      ],
      weather: {
        coords: [-13.78, -59.02],
        outerRadius: 14500,
        innerRadius: 6800,
        tag: '⚠ VIENTO CATABÁTICO CAÑÓN (&tau; 1.32 | 64.8 KM/H)',
        title: 'Corriente de Chorro Canalizada en Coprates Chasma',
        desc: 'Ráfagas severas de 64.8 km/h a lo largo del eje del cañón con niebla de polvo en suspensión (&tau; 1.32).'
      }
    }
  };

  function buildProceduralSectorLayers(centerLat, centerLng) {
    return {
      contours: [
        {
          elev: `${estimateNumericAltitude(centerLat, centerLng)}m (Contorno Regional Primario)`,
          color: '#FF6B2B',
          dash: '6, 6',
          coords: [
            [centerLat - 0.18, centerLng - 0.22],
            [centerLat - 0.06, centerLng + 0.18],
            [centerLat + 0.16, centerLng + 0.24],
            [centerLat + 0.22, centerLng - 0.12]
          ]
        }
      ],
      geology: [
        {
          name: 'Unidad Litoestratigráfica Regional Cartografiada (THEMIS IR)',
          code: 'Nh-custom // Sector de Exploración EVA',
          desc: 'Regolito basáltico y sedimentos minerales analizados por espectrometría orbital.',
          color: '#ce93d8',
          fillColor: '#ab47bc',
          coords: [
            [centerLat - 0.14, centerLng - 0.16],
            [centerLat + 0.14, centerLng - 0.14],
            [centerLat + 0.12, centerLng + 0.16],
            [centerLat - 0.12, centerLng + 0.14]
          ]
        }
      ],
      resources: [
        {
          name: 'Depósito Subsuperficial de H₂O Detectado por Radar SHARAD',
          coords: [centerLat + 0.06, centerLng - 0.05],
          radius: 5500,
          purity: '82% Hielo de Agua + Regolito Hidratado',
          depth: '1.3m bajo superficie',
          yield: 'Estimado: 45,000 Litros procesables'
        }
      ],
      weather: {
        coords: [centerLat - 0.10, centerLng + 0.12],
        outerRadius: 11000,
        innerRadius: 5000,
        tag: 'FRENTE EÓLICO REGIONAL (&tau; 0.95 | 26.0 KM/H)',
        title: 'Actividad Eólica Regional Detectada',
        desc: 'Corrientes superficiales monitoreadas por sensores orbitales de la NASA en el sector activo.'
      }
    };
  }

  // Reconstruye y sincroniza las capas NASA (Topography, Geology, Resources, Weather) para la región activa
  function rebuildRegionalNasaLayers(routeKey) {
    const center = activeRouteData?.center || JEZERO_CENTER;
    const regionData =
      REGIONAL_LAYERS_DB[routeKey] || buildProceduralSectorLayers(center[0], center[1]);

    // 1. Actualizar Curvas de Nivel MOLA (Capa Topography)
    regionalContoursGroup.clearLayers();
    regionData.contours.forEach((contour) => {
      const polyline = L.polyline(contour.coords, {
        color: contour.color,
        weight: 2.2,
        opacity: 0.9,
        dashArray: contour.dash
      }).bindTooltip(`MOLA ALTITUD: ${contour.elev}`, {
        sticky: true,
        className: 'cyber-leaflet-tooltip'
      });
      regionalContoursGroup.addLayer(polyline);
    });

    // 2. Actualizar Polígonos Litológicos (Capa Geology)
    nasaLayers.geol.clearLayers();
    regionData.geology.forEach((unit) => {
      const polygon = L.polygon(unit.coords, {
        color: unit.color,
        fillColor: unit.fillColor,
        fillOpacity: 0.25,
        weight: 2,
        dashArray: '5, 5'
      }).bindPopup(`
        <div class="hud-popup-card">
          <div class="hp-kicker">${unit.code}</div>
          <h4 class="hp-title">${unit.name}</h4>
          <p class="hp-desc">${unit.desc}</p>
          <div class="hp-meta">
            <span><i class="fa-solid fa-satellite"></i> Sensor: CRISM / THEMIS</span>
            <span><i class="fa-solid fa-microscope"></i> PIXL / SHERLOC</span>
          </div>
        </div>
      `);
      nasaLayers.geol.addLayer(polygon);
    });

    // 3. Actualizar Reservas de Hielo Subterráneo (Capa Resources)
    nasaLayers.res.clearLayers();
    regionData.resources.forEach((res) => {
      const outerCircle = L.circle(res.coords, {
        radius: res.radius,
        color: '#00e5ff',
        weight: 2,
        dashArray: '6, 4',
        fillColor: '#00e5ff',
        fillOpacity: 0.2
      }).bindPopup(`
        <div class="hud-popup-card cyan-theme">
          <div class="hp-kicker">RADAR SUBSUPERFICIAL SHARAD / RIMFAX</div>
          <h4 class="hp-title"><i class="fa-solid fa-snowflake"></i> ${res.name}</h4>
          <ul class="hp-list">
            <li><strong>Pureza Detectada:</strong> ${res.purity}</li>
            <li><strong>Profundidad de Extracción:</strong> ${res.depth}</li>
            <li><strong>Potencial ISRU (O₂ / Agua):</strong> ${res.yield}</li>
          </ul>
        </div>
      `);

      const resIcon = L.divIcon({
        className: 'hud-custom-div-icon',
        html: `
          <div class="hud-map-pin pin-cyan">
            <i class="fa-solid fa-droplet"></i>
            <span class="pin-pulse"></span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const centerMarker = L.marker(res.coords, { icon: resIcon }).bindTooltip(
        `RECURSO H₂O: ${res.name}`,
        { className: 'cyber-leaflet-tooltip cyan' }
      );

      nasaLayers.res.addLayer(outerCircle);
      nasaLayers.res.addLayer(centerMarker);
    });

    // 4. Actualizar Frente Meteorológico Regional (Capa Weather)
    nasaLayers.weather.clearLayers();
    const w = regionData.weather;
    const dustStormZone = L.circle(w.coords, {
      radius: w.outerRadius,
      color: '#ffab00',
      weight: 2.5,
      dashArray: '10, 6',
      fillColor: '#ff6b2b',
      fillOpacity: 0.24
    }).bindPopup(`
      <div class="hud-popup-card warning-theme">
        <div class="hp-kicker">ALERTA METEOROLÓGICA ACTIVA // SOL 1420</div>
        <h4 class="hp-title"><i class="fa-solid fa-triangle-exclamation"></i> ${w.title}</h4>
        <p class="hp-desc">${w.desc}</p>
      </div>
    `);

    const dustStormCore = L.circle(w.coords, {
      radius: w.innerRadius,
      color: '#ff3d00',
      weight: 1.2,
      fillColor: '#ffab00',
      fillOpacity: 0.3
    });

    const stormAlertBadge = L.marker(w.coords, {
      icon: L.divIcon({
        className: 'hud-custom-div-icon',
        html: `
          <div class="weather-map-tag">
            <i class="fa-solid fa-wind"></i> ${w.tag}
          </div>
        `,
        iconSize: [240, 28],
        iconAnchor: [120, 14]
      })
    });

    nasaLayers.weather.addLayer(dustStormZone);
    nasaLayers.weather.addLayer(dustStormCore);
    nasaLayers.weather.addLayer(stormAlertBadge);
  }

  // Inicializar las capas regionales en Jezero al arrancar
  rebuildRegionalNasaLayers('jezero-alpha');

  // CAPA 5: SITIOS HISTÓRICOS GLOBALES DE LA NASA
  const historicGlobalSites = [
    {
      id: 'ingenuity-field',
      name: 'Campo de Vuelo Wright Brothers (Ingenuity)',
      mission: 'Helicóptero Marciano Ingenuity (72 Vuelos)',
      coords: [18.4486, 77.4509],
      elev: '-2,538m',
      icon: 'fa-helicopter',
      desc: 'Primer aeródromo extraterrestre de la historia humana.'
    },
    {
      id: 'global-curiosity',
      name: 'Misión Curiosity (MSL) — Cráter Gale',
      mission: 'NASA Mars Science Laboratory (2012 - Presente)',
      coords: [-4.5895, 137.4417],
      elev: '-4,501m',
      icon: 'fa-robot',
      desc: 'Ascenso por Aeolis Mons (Monte Sharp). Evidencia confirmada de antiguos ambientes habitables ricos en compuestos orgánicos.'
    },
    {
      id: 'global-insight',
      name: 'Sonda InSight — Elysium Planitia',
      mission: 'NASA Discovery Program (Estudio Sísmico)',
      coords: [4.5024, 135.6234],
      elev: '-2,613m',
      icon: 'fa-wave-square',
      desc: 'Estación geofísica que registró más de 1,300 martemotos y midió el núcleo líquido de Marte.'
    },
    {
      id: 'global-viking1',
      name: 'Viking 1 Lander — Chryse Planitia',
      mission: 'NASA Viking Program (1976)',
      coords: [22.4800, -47.9500],
      elev: '-3,627m',
      icon: 'fa-flag-usa',
      desc: 'Primera nave espacial en operar exitosamente a largo plazo sobre la superficie de Marte.'
    },
    {
      id: 'global-olympus',
      name: 'Cumbre de Olympus Mons',
      mission: 'Volcán Escudo Más Grande del Sistema Solar',
      coords: [18.6500, -133.8000],
      elev: '+21,229m',
      icon: 'fa-mountain',
      desc: 'Caldera volcánica de 21.2 km de altitud sobre el datum marciano, casi tres veces la altura del Monte Everest.'
    }
  ];

  historicGlobalSites.forEach((site) => {
    const marker = L.marker(site.coords, {
      icon: L.divIcon({
        className: 'hud-custom-div-icon',
        html: `
          <div class="hud-site-marker marker-historic">
            <div class="hsm-ring"></div>
            <div class="hsm-core"><i class="fa-solid ${site.icon}"></i></div>
            <span class="hsm-label">${site.name.split('—')[0].trim()}</span>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      })
    }).bindPopup(`
      <div class="hud-popup-card">
        <div class="hp-kicker">${site.mission}</div>
        <h4 class="hp-title">${site.name}</h4>
        <p class="hp-desc">${site.desc}</p>
        <div class="hp-meta">
          <span>LAT: ${site.coords[0].toFixed(4)}°</span>
          <span>LON: ${site.coords[1].toFixed(4)}°</span>
          <span>ALT: ${site.elev}</span>
        </div>
        <button type="button" class="hp-action-btn secondary" data-open-dossier="${site.id}">
          <i class="fa-solid fa-book-journal-whills"></i> VER EXPEDIENTE TÉCNICO NASA
        </button>
      </div>
    `);
    nasaLayers.sites.addLayer(marker);
  });

  // Añadimos las 5 capas al mapa inicialmente
  Object.values(nasaLayers).forEach((lg) => lg.addTo(marsMap));

  // ==========================================================================
  // 4. GEODESIA MARCIANA, TELEMETRÍA Y RENDERIZADO DE RUTA (ETAPA 3)
  // ==========================================================================
  let liveRoverMarker = null;
  let routeTraveledLine = null;

  // Distancia Haversine ajustada al radio planetario de Marte (3,396.2 km)
  function computeMarsDistanceKm(coordA, coordB) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(coordB[0] - coordA[0]);
    const dLon = toRad(coordB[1] - coordA[1]);
    const lat1 = toRad(coordA[0]);
    const lat2 = toRad(coordB[0]);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return MARS_RADIUS_KM * c;
  }

  // Estima la altitud MOLA numérica (en metros) para cualquier coordenada marciana
  function estimateNumericAltitude(lat, lng) {
    const distFromJezero = Math.hypot(lat - 18.448, lng - 77.432);
    if (distFromJezero < 0.35) {
      const deltaSlope = (77.48 - lng) * 1900;
      return Math.round(-2560 + deltaSlope);
    }
    return Math.round(-1800 + Math.sin(lat * 0.1) * 1400 - Math.cos(lng * 0.08) * 1200);
  }

  // Interpola la posición (lat, lng, elev) del Rover según el % de avance (0 a 100)
  function interpolateRoverPosition(pathCoords, pct) {
    if (!pathCoords || pathCoords.length === 0) {
      return { lat: JEZERO_CENTER[0], lng: JEZERO_CENTER[1], elev: -2490 };
    }
    if (pathCoords.length === 1 || pct <= 0) {
      return { lat: pathCoords[0][0], lng: pathCoords[0][1], elev: pathCoords[0][2] };
    }
    if (pct >= 100) {
      const last = pathCoords[pathCoords.length - 1];
      return { lat: last[0], lng: last[1], elev: last[2] };
    }

    const totalSegments = pathCoords.length - 1;
    const exactIndex = (pct / 100) * totalSegments;
    const idx = Math.min(Math.floor(exactIndex), totalSegments - 1);
    const t = exactIndex - idx;

    const p1 = pathCoords[idx];
    const p2 = pathCoords[idx + 1];

    return {
      lat: p1[0] + (p2[0] - p1[0]) * t,
      lng: p1[1] + (p2[1] - p1[1]) * t,
      elev: Math.round(p1[2] + (p2[2] - p1[2]) * t)
    };
  }

  // Dibuja la ruta activa y sus waypoints en el mapa de Leaflet
  function renderRouteOnMap(flyToRoute = false) {
    dynamicRouteLayerGroup.clearLayers();

    const latLngs = activeRouteData.pathCoords.map((p) => [p[0], p[1]]);

    if (latLngs.length >= 2) {
      // Halo exterior naranja
      L.polyline(latLngs, {
        color: '#FF6B2B',
        weight: 9,
        opacity: 0.25,
        lineCap: 'round'
      }).addTo(dynamicRouteLayerGroup);

      // Línea principal punteada (Ruta completa)
      L.polyline(latLngs, {
        color: '#FF6B2B',
        weight: 3.5,
        opacity: 0.9,
        dashArray: '10, 8'
      })
        .bindTooltip(`RUTA ACTIVA: ${activeRouteData.code} (${activeRouteData.totalDistKm.toFixed(1)} km)`, {
          sticky: true,
          className: 'cyber-leaflet-tooltip'
        })
        .addTo(dynamicRouteLayerGroup);

      // Línea de progreso ya recorrido en color cian
      routeTraveledLine = L.polyline([], {
        color: '#00e5ff',
        weight: 4,
        opacity: 0.95
      }).addTo(dynamicRouteLayerGroup);
    }

    // Marcadores de Waypoints de la ruta
    activeRouteData.waypoints.forEach((wp, index) => {
      const isStart = index === 0;
      const isEnd = index === activeRouteData.waypoints.length - 1 && activeRouteData.waypoints.length > 1;
      const markerType = isStart ? 'start' : isEnd ? 'base' : 'waypoint';
      const iconClass = isStart ? 'fa-rocket' : isEnd ? 'fa-campground' : 'fa-flask';

      const wpMarker = L.marker(wp.coords, {
        icon: L.divIcon({
          className: 'hud-custom-div-icon',
          html: `
            <div class="hud-site-marker marker-${markerType}">
              <div class="hsm-ring"></div>
              <div class="hsm-core"><i class="fa-solid ${iconClass}"></i></div>
              <span class="hsm-label">${wp.name}</span>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        })
      }).bindPopup(`
        <div class="hud-popup-card">
          <div class="hp-kicker">WAYPOINT 0${index + 1} // RUTA ${activeRouteData.code}</div>
          <h4 class="hp-title">${wp.name}</h4>
          <p class="hp-desc">${wp.sub}</p>
          <div class="hp-meta">
            <span>KM: ${wp.km.toFixed(1)}</span>
            <span>ALT: ${wp.elev.toLocaleString('en-US')}m</span>
          </div>
          <button type="button" class="hp-action-btn" data-open-360="wp-${index}">
            <i class="fa-solid fa-vr-cardboard"></i> EXPLORAR EN 360° STREET VIEW
          </button>
        </div>
      `);

      dynamicRouteLayerGroup.addLayer(wpMarker);
    });

    // Marcador móvil en tiempo real del Rover
    const roverPos = interpolateRoverPosition(activeRouteData.pathCoords, roverProgress);
    liveRoverMarker = L.marker([roverPos.lat, roverPos.lng], {
      zIndexOffset: 1000,
      icon: L.divIcon({
        className: 'hud-custom-div-icon',
        html: `
          <div class="hud-site-marker marker-rover">
            <div class="hsm-ring"></div>
            <div class="hsm-core"><i class="fa-solid fa-truck-monster"></i></div>
            <span class="hsm-label">ROVER (${roverProgress}%)</span>
          </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 21]
      })
    }).bindPopup(`
      <div class="hud-popup-card cyan-theme">
        <div class="hp-kicker">TELEMETRÍA DE UNIDAD MÓVIL EN VIVO</div>
        <h4 class="hp-title">Rover Presurizado M.A.R.T.E 01</h4>
        <p class="hp-desc">Avance actual: ${roverProgress}% de la ruta ${activeRouteData.code}. Todos los sistemas de soporte vital operando dentro de parámetros.</p>
        <button type="button" class="hp-action-btn" data-open-360="rover-live">
          <i class="fa-solid fa-vr-cardboard"></i> ABRIR CÁMARA 360° DEL ROVER
        </button>
      </div>
    `);

    dynamicRouteLayerGroup.addLayer(liveRoverMarker);

    if (flyToRoute && activeRouteData.center) {
      marsMap.flyTo(activeRouteData.center, activeRouteData.zoom || 8, { duration: 1.1 });
    }
  }

  // Renderiza la lista de Waypoints en la barra lateral izquierda y su estado según el progreso del Rover
  function renderWaypointsTimeline() {
    if (!waypointsListEl) return;
    const traveledKm = (roverProgress / 100) * activeRouteData.totalDistKm;

    waypointsListEl.innerHTML = '';

    activeRouteData.waypoints.forEach((wp, idx) => {
      const isLast = idx === activeRouteData.waypoints.length - 1;
      let nodeStatus = 'status-pending';
      let badgeClass = isLast ? 'target' : 'next';
      let badgeText = isLast ? 'DESTINO' : 'PENDIENTE';

      if (traveledKm >= wp.km + 0.4 || (roverProgress === 100 && isLast)) {
        nodeStatus = 'status-completed';
        badgeClass = 'done';
        badgeText = 'COMPLETADO';
      } else if (Math.abs(traveledKm - wp.km) <= 2.2) {
        nodeStatus = 'status-active';
        badgeClass = 'current';
        badgeText = 'POSICIÓN ACTUAL';
      }

      const li = document.createElement('li');
      li.className = `waypoint-node ${nodeStatus}`;
      li.style.cursor = 'pointer';
      li.innerHTML = `
        <div class="wp-marker">0${idx + 1}</div>
        <div class="wp-content">
          <div class="wp-row">
            <strong>${wp.name}</strong>
            <span class="wp-badge ${badgeClass}">${badgeText}</span>
          </div>
          <span class="wp-sub">${wp.sub} &bull; KM ${wp.km.toFixed(1)} (${wp.elev}m)</span>
        </div>
      `;

      // Al hacer clic en un waypoint, movemos el Rover y la cámara hacia ese punto con zoom nítido (8-9)
      li.addEventListener('click', () => {
        stopRoverSimulation();
        const targetPct =
          activeRouteData.totalDistKm > 0
            ? Math.round((wp.km / activeRouteData.totalDistKm) * 100)
            : 0;
        updateRoverProgress(targetPct);
        marsMap.flyTo(wp.coords, 6, { duration: 0.85 });
      });

      waypointsListEl.appendChild(li);
    });
  }

  // Renderiza el Gráfico SVG del Perfil de Elevación Topográfica y posiciona al Rover
  function renderElevationProfileSVG() {
    const coords = activeRouteData.pathCoords;
    if (!coords || coords.length === 0) return;

    const elevations = coords.map((c) => c[2]);
    const minElev = Math.min(...elevations);
    const maxElev = Math.max(...elevations);
    const deltaElev = Math.max(maxElev - minElev, 40);

    if (elevTitleEl) {
      elevTitleEl.innerHTML = `<i class="fa-solid fa-chart-area text-orange"></i> PERFIL DE ELEVACIÓN TOPOGRÁFICA // RUTA: ${activeRouteData.code}`;
    }
    if (elevMetaEl) {
      const sign = maxElev >= minElev ? '+' : '';
      elevMetaEl.innerHTML = `ALTITUD: ${minElev.toLocaleString('en-US')}m a ${maxElev.toLocaleString('en-US')}m (&Delta; ${sign}${maxElev - minElev}m)`;
    }

    // Mapeamos los puntos al viewBox 600x82
    const svgWidth = 600;
    const topY = 12;
    const bottomY = 66;
    const bottomBase = 78;

    const svgPoints = coords.map((c, idx) => {
      const x = coords.length === 1 ? 0 : Math.round((idx / (coords.length - 1)) * svgWidth);
      const norm = (c[2] - minElev) / deltaElev;
      const y = Math.round(bottomY - norm * (bottomY - topY));
      return { x, y, elev: c[2] };
    });

    if (svgPoints.length >= 2) {
      const pathD = svgPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`).join(' ');
      const polyPts = `0,${bottomBase} ` + svgPoints.map((pt) => `${pt.x},${pt.y}`).join(' ') + ` ${svgWidth},${bottomBase}`;

      if (elevPath) elevPath.setAttribute('d', pathD);
      if (elevPolygon) elevPolygon.setAttribute('points', polyPts);
    }

    // Posición del indicador cian del Rover en el SVG (0 a 600)
    const roverX = Math.round((roverProgress / 100) * svgWidth);
    const roverPos = interpolateRoverPosition(coords, roverProgress);
    const roverNorm = (roverPos.elev - minElev) / deltaElev;
    const roverY = Math.round(bottomY - roverNorm * (bottomY - topY));

    if (elevRoverLine) {
      elevRoverLine.setAttribute('x1', roverX);
      elevRoverLine.setAttribute('x2', roverX);
    }
    if (elevRoverDot) {
      elevRoverDot.setAttribute('cx', roverX);
      elevRoverDot.setAttribute('cy', roverY);
    }
    if (elevRoverLabel) {
      const traveledKm = ((roverProgress / 100) * activeRouteData.totalDistKm).toFixed(1);
      const labelX = roverX > 390 ? roverX - 185 : roverX + 8;
      elevRoverLabel.setAttribute('x', Math.max(8, labelX));
      elevRoverLabel.textContent = `ROVER ACTUAL (KM ${traveledKm} | ${roverPos.elev.toLocaleString('en-US')}m)`;
    }
  }

  // ==========================================================================
  // 5. MOTOR DE CÁLCULO DE TELEMETRÍA DE SUPERVIVENCIA (OXÍGENO, BATERÍA, TIEMPO)
  // ==========================================================================
  function updateSurvivalTelemetry() {
    const totalKm = activeRouteData.totalDistKm;
    const traveledKm = (roverProgress / 100) * totalKm;
    const remainingKm = Math.max(0, totalKm - traveledKm);

    // Penalización climática si la capa de tormenta de polvo está activa
    const weatherCheckbox = document.getElementById('toggle-weather');
    const isStormActive = weatherCheckbox ? weatherCheckbox.checked : true;
    const stormSolarPenalty = isStormActive ? 1.18 : 1.0;

    // 1. Cálculo de Oxígeno Consumido (%)
    // Base metabólica + esfuerzo por distancia recorrida y pendiente
    const slopeFactor = 1 + Math.max(0, activeRouteData.maxSlopeDeg - 10) * 0.025;
    const rawO2Consumed = 4 + traveledKm * activeRouteData.baseO2RatePerKm * slopeFactor;
    const o2ConsumedPct = Math.min(98, Math.round(rawO2Consumed));
    const o2ReservePct = Math.max(2, 100 - o2ConsumedPct);
    const o2KgRate = (0.78 * slopeFactor).toFixed(2);

    if (metricOxygen) metricOxygen.textContent = o2ConsumedPct;
    if (metricOxygenReserve) metricOxygenReserve.textContent = `RESERVA: ${o2ReservePct}%`;
    if (metricOxygenRate) {
      metricOxygenRate.textContent =
        o2ConsumedPct > 70 ? `¡Consumo Alto! (${o2KgRate} kg/h)` : `Nominal (${o2KgRate} kg/h)`;
    }
    if (barOxygen) barOxygen.style.width = `${o2ConsumedPct}%`;
    if (cardOxygen) cardOxygen.classList.toggle('alert-critical', o2ConsumedPct >= 75);

    // 2. Cálculo de Batería del Rover (%)
    const batteryDrain = traveledKm * activeRouteData.baseBatteryPerKm * stormSolarPenalty;
    const batteryRemainingPct = Math.max(5, Math.round(100 - batteryDrain));
    const remainingAutonomyKm = ((batteryRemainingPct / (activeRouteData.baseBatteryPerKm * stormSolarPenalty))).toFixed(1);

    if (metricBattery) metricBattery.textContent = batteryRemainingPct;
    if (metricBatteryTag) {
      metricBatteryTag.textContent = isStormActive ? 'SOLAR -18% (POLVO)' : 'MMRTG + SOLAR 100%';
    }
    if (metricBatteryRange) metricBatteryRange.textContent = `Autonomía: ${remainingAutonomyKm} km`;
    if (barBattery) barBattery.style.width = `${batteryRemainingPct}%`;
    if (cardBattery) cardBattery.classList.toggle('alert-critical', batteryRemainingPct <= 25);

    // 3. Distancia de la Ruta (km)
    if (metricDistance) metricDistance.textContent = totalKm.toFixed(1);
    if (metricDistanceTraveled) metricDistanceTraveled.textContent = `RECORRIDO: ${traveledKm.toFixed(1)} KM`;
    if (metricDistanceRemaining) metricDistanceRemaining.textContent = `Restante: ${remainingKm.toFixed(1)} km`;
    if (barDistance) barDistance.style.width = `${roverProgress}%`;

    // 4. Tiempo Estimado de Viaje Total y Restante
    const totalHours = totalKm / activeRouteData.avgSpeedKmh;
    const hrs = Math.floor(totalHours);
    const mins = Math.round((totalHours - hrs) * 60);
    const formattedTime = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

    const remHours = remainingKm / activeRouteData.avgSpeedKmh;
    const remH = Math.floor(remHours);
    const remM = Math.round((remHours - remH) * 60);

    if (metricTime) metricTime.textContent = formattedTime;
    if (metricSpeedTag) metricSpeedTag.textContent = `VEL. MEDIA: ${activeRouteData.avgSpeedKmh.toFixed(1)} KM/H`;
    if (metricTimeSub) {
      metricTimeSub.textContent =
        roverProgress >= 100
          ? '¡Destino alcanzado con éxito!'
          : totalHours > 8.5
          ? `⚠ Restan ${remH}h ${remM}m (Travesía nocturna)`
          : `Restan ${remH}h ${remM}m (Antes del ocaso)`;
    }
    if (barTime) {
      const timeLoadPct = Math.min(100, Math.round((totalHours / 12) * 100));
      barTime.style.width = `${timeLoadPct}%`;
    }

    // 5. Directriz Dinámica de Supervivencia en la Barra Izquierda
    if (directiveBoxEl && directiveTitleEl && directiveTextEl) {
      if (o2ConsumedPct >= 75 || batteryRemainingPct <= 25 || activeRouteData.maxSlopeDeg >= 25) {
        directiveBoxEl.classList.add('alert-mode');
        directiveTitleEl.textContent = '⚠ ALERTA CRÍTICA DE SUPERVIVENCIA:';
        directiveTextEl.textContent =
          `Consumo de O₂ al ${o2ConsumedPct}% | Batería al ${batteryRemainingPct}% | Pendiente máx ${activeRouteData.maxSlopeDeg.toFixed(1)}°. ` +
          `Se recomienda parada inmediata en estación ISRU para recarga criogénica.`;
      } else {
        directiveBoxEl.classList.remove('alert-mode');
        directiveTitleEl.textContent = 'DIRECTRIZ DE SUPERVIVENCIA:';
        directiveTextEl.textContent =
          `Parámetros vitales nominales. Reserva de O₂ al ${o2ReservePct}%. Mantener distancia de seguridad de 50m respecto a escarpes >25°.`;
      }
    }
  }

  // Sincroniza el valor del slider nativo con las variables CSS del estándar Modern Web
  function syncSliderCSSVariables() {
    if (!roverSlider) return;
    roverSlider.style.setProperty('--attr-min', roverSlider.min || 0);
    roverSlider.style.setProperty('--attr-max', roverSlider.max || 100);
    roverSlider.style.setProperty('--control-value', roverSlider.value);
    roverSlider.setAttribute(
      'aria-valuetext',
      `${roverSlider.value} por ciento del recorrido completado`
    );
  }

  // Actualiza toda la posición del Rover en el mapa, la polilínea recorrida, el perfil SVG y la telemetría
  function updateRoverProgress(newPct) {
    roverProgress = Math.max(0, Math.min(100, Math.round(newPct)));

    if (roverSlider) {
      roverSlider.value = roverProgress;
      syncSliderCSSVariables();
    }
    if (roverProgressPct) {
      roverProgressPct.textContent = `${roverProgress}%`;
    }

    const pos = interpolateRoverPosition(activeRouteData.pathCoords, roverProgress);

    // Mover el marcador en vivo del Rover en Leaflet
    if (liveRoverMarker) {
      liveRoverMarker.setLatLng([pos.lat, pos.lng]);
      const labelSpan = liveRoverMarker.getElement()?.querySelector('.hsm-label');
      if (labelSpan) {
        labelSpan.textContent = `ROVER (${roverProgress}%)`;
      }
    }

    // Actualizar la línea cian de tramo recorrido
    if (routeTraveledLine && activeRouteData.pathCoords.length >= 2) {
      const totalSegments = activeRouteData.pathCoords.length - 1;
      const exactIdx = (roverProgress / 100) * totalSegments;
      const fullPointsCount = Math.floor(exactIdx) + 1;
      const traveledLatLngs = activeRouteData.pathCoords
        .slice(0, fullPointsCount)
        .map((c) => [c[0], c[1]]);
      traveledLatLngs.push([pos.lat, pos.lng]);
      routeTraveledLine.setLatLngs(traveledLatLngs);
    }

    renderWaypointsTimeline();
    renderElevationProfileSVG();
    updateSurvivalTelemetry();
    if (typeof updateRoverVisionConeOnMap === 'function') {
      updateRoverVisionConeOnMap();
    }
    if (typeof syncStreetViewToRoverProgress === 'function') {
      syncStreetViewToRoverProgress();
    }
  }

  // Carga una ruta del catálogo o inicializa la ruta personalizada, actualizando todas las capas de la NASA
  function loadRoute(routeKey, flyTo = true) {
    stopRoverSimulation();
    currentRouteKey = routeKey;

    if (routeKey === 'custom') {
      if (!isCustomDrawing) {
        toggleCustomDrawingMode(true);
      }
      return;
    }

    if (isCustomDrawing) {
      toggleCustomDrawingMode(false);
    }

    activeRouteData = structuredClone(ROUTES_CATALOG[routeKey]);

    if (routeDifficultyEl) {
      routeDifficultyEl.textContent = activeRouteData.difficulty;
    }
    if (routeMaxSlopeEl) {
      routeMaxSlopeEl.textContent = `${activeRouteData.maxSlopeDeg.toFixed(1)}° (${activeRouteData.slopeStatus})`;
    }
    if (missionTitleEl) missionTitleEl.textContent = activeRouteData.title;
    if (missionSectorEl) missionSectorEl.textContent = activeRouteData.sector;
    if (missionDescEl) missionDescEl.textContent = activeRouteData.desc;

    // Actualizar las 4 capas regionales de la NASA (Topography, Geology, Resources, Weather) junto con la ruta
    rebuildRegionalNasaLayers(routeKey);
    renderRouteOnMap(flyTo);
    syncLayersWithCheckboxes();
    updateRoverProgress(33);
    if (typeof updateRegionalWeatherPanel === 'function') {
      updateRegionalWeatherPanel(routeKey);
    }
    if (typeof playHudTone === 'function') {
      playHudTone(580, 0.08, 'sine');
    }
  }

  // ==========================================================================
  // 6. EVENTOS DE CONTROL DE RUTAS, SIMULACIÓN Y TRAZADO EN EL MAPA
  // ==========================================================================
  if (routeSelector) {
    routeSelector.addEventListener('change', (e) => {
      loadRoute(e.target.value, true);
    });
  }

  if (roverSlider) {
    roverSlider.addEventListener('input', (e) => {
      stopRoverSimulation();
      updateRoverProgress(Number(e.target.value));
    });
  }

  // Interacción directa haciendo clic o arrastrando sobre el gráfico de elevación SVG en el footer
  if (elevSvg) {
    let isScrubbingElev = false;

    const scrubFromPointer = (clientX) => {
      const rect = elevSvg.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      stopRoverSimulation();
      updateRoverProgress(Math.round(ratio * 100));
    };

    elevSvg.addEventListener('pointerdown', (e) => {
      isScrubbingElev = true;
      scrubFromPointer(e.clientX);
    });

    window.addEventListener('pointermove', (e) => {
      if (isScrubbingElev) {
        scrubFromPointer(e.clientX);
      }
    });

    window.addEventListener('pointerup', () => {
      isScrubbingElev = false;
    });
  }

  // Simulador automático de recorrido del Rover
  function stopRoverSimulation() {
    if (simIntervalId) {
      clearInterval(simIntervalId);
      simIntervalId = null;
    }
    if (btnPlaySim) {
      btnPlaySim.classList.remove('is-playing');
      btnPlaySim.innerHTML = '<i class="fa-solid fa-play"></i> <span>SIMULAR</span>';
    }
  }

  if (btnPlaySim) {
    btnPlaySim.addEventListener('click', () => {
      if (simIntervalId) {
        stopRoverSimulation();
        return;
      }

      if (roverProgress >= 100) {
        updateRoverProgress(0);
      }

      btnPlaySim.classList.add('is-playing');
      btnPlaySim.innerHTML = '<i class="fa-solid fa-pause"></i> <span>PAUSAR</span>';

      simIntervalId = setInterval(() => {
        if (roverProgress >= 100) {
          stopRoverSimulation();
          return;
        }
        updateRoverProgress(roverProgress + 1);
      }, 95);
    });
  }

  // Modo de Trazado Táctico Personalizado en el Mapa ("+ TRAZAR EN MAPA")
  function toggleCustomDrawingMode(forceState) {
    isCustomDrawing = typeof forceState === 'boolean' ? forceState : !isCustomDrawing;

    if (btnCustomDraw) {
      btnCustomDraw.classList.toggle('is-drawing', isCustomDrawing);
      btnCustomDraw.innerHTML = isCustomDrawing
        ? '<i class="fa-solid fa-check"></i> <span>TRAZANDO (CLIC EN MAPA)</span>'
        : '<i class="fa-solid fa-pen-ruler"></i> <span>+ TRAZAR EN MAPA</span>';
    }

    if (isCustomDrawing) {
      if (routeSelector) routeSelector.value = 'custom';
      marsMap.getContainer().style.cursor = 'crosshair';
    } else {
      marsMap.getContainer().style.cursor = '';
    }
  }

  if (btnCustomDraw) {
    btnCustomDraw.addEventListener('click', () => {
      toggleCustomDrawingMode();
    });
  }

  if (btnResetRoute) {
    btnResetRoute.addEventListener('click', () => {
      toggleCustomDrawingMode(false);
      const restoreKey = currentRouteKey === 'custom' ? 'jezero-alpha' : currentRouteKey;
      if (routeSelector) routeSelector.value = restoreKey;
      loadRoute(restoreKey, true);
    });
  }

  // Añadir nuevo Waypoint personalizado al hacer clic en el mapa cuando el modo de trazado está activo
  marsMap.on('click', (e) => {
    if (!isCustomDrawing) return;

    const { lat, lng } = e.latlng;
    const elev = estimateNumericAltitude(lat, lng);

    if (activeRouteData.id !== 'custom') {
      const startPt = activeRouteData.pathCoords[0];
      activeRouteData = {
        id: 'custom',
        code: 'CUSTOM-EVA',
        title: 'Exploración Táctica Personalizada',
        sector: 'Sector: Trazado Manual por Comandante de Misión',
        desc: 'Ruta definida manualmente sobre la cartografía orbital de la NASA. Telemetría recalculada dinámicamente mediante geodesia marciana.',
        difficulty: 'PERSONALIZADA',
        maxSlopeDeg: 12.5,
        slopeStatus: 'CALCULADA',
        avgSpeedKmh: 2.9,
        totalDistKm: 0,
        baseO2RatePerKm: 3.25,
        baseBatteryPerKm: 1.85,
        center: [lat, lng],
        zoom: marsMap.getZoom(),
        pathCoords: [startPt],
        waypoints: [
          {
            name: 'Punto de Partida EVA',
            sub: `LAT ${startPt[0].toFixed(3)}° LON ${startPt[1].toFixed(3)}°`,
            km: 0.0,
            coords: [startPt[0], startPt[1]],
            elev: startPt[2]
          }
        ]
      };
    } else {
      activeRouteData.center = [lat, lng];
    }

    const prevCoord = activeRouteData.pathCoords[activeRouteData.pathCoords.length - 1];
    const segDistKm = computeMarsDistanceKm([prevCoord[0], prevCoord[1]], [lat, lng]);
    const newTotalDist = activeRouteData.totalDistKm + segDistKm;

    // Cálculo de pendiente del nuevo tramo
    const elevDiffMeters = Math.abs(elev - prevCoord[2]);
    const segDistMeters = Math.max(segDistKm * 1000, 1);
    const segSlopeDeg = Math.min(34, (Math.atan(elevDiffMeters / segDistMeters) * 180) / Math.PI * 4.5);
    activeRouteData.maxSlopeDeg = Math.max(activeRouteData.maxSlopeDeg, Number(segSlopeDeg.toFixed(1)));
    activeRouteData.slopeStatus =
      activeRouteData.maxSlopeDeg > 24 ? 'CRÍTICA' : activeRouteData.maxSlopeDeg > 16 ? 'PRECAUCIÓN' : 'SEGURA';

    activeRouteData.totalDistKm = newTotalDist;
    activeRouteData.pathCoords.push([lat, lng, elev]);

    const wpNumber = activeRouteData.waypoints.length + 1;
    activeRouteData.waypoints.push({
      name: `Punto Táctico EVA 0${wpNumber}`,
      sub: `LAT ${lat.toFixed(3)}° LON ${lng.toFixed(3)}°`,
      km: newTotalDist,
      coords: [lat, lng],
      elev
    });

    if (routeDifficultyEl) routeDifficultyEl.textContent = activeRouteData.difficulty;
    if (routeMaxSlopeEl) {
      routeMaxSlopeEl.textContent = `${activeRouteData.maxSlopeDeg.toFixed(1)}° (${activeRouteData.slopeStatus})`;
    }
    if (missionTitleEl) missionTitleEl.textContent = activeRouteData.title;
    if (missionSectorEl) missionSectorEl.textContent = activeRouteData.sector;
    if (missionDescEl) missionDescEl.textContent = activeRouteData.desc;

    rebuildRegionalNasaLayers('custom');
    renderRouteOnMap(false);
    updateRoverProgress(roverProgress);
  });

  // ==========================================================================
  // 7. INTERACTIVIDAD DE INTERRUPTORES (TOGGLES) DE CAPAS DE LA NASA
  // ==========================================================================
  const layerMapping = {
    'toggle-topo': nasaLayers.topo,
    'toggle-geol': nasaLayers.geol,
    'toggle-res': nasaLayers.res,
    'toggle-weather': nasaLayers.weather,
    'toggle-sites': nasaLayers.sites
  };

  function syncLayersWithCheckboxes() {
    let activeCount = 0;
    Object.entries(layerMapping).forEach(([checkboxId, layerGroup]) => {
      const checkbox = document.getElementById(checkboxId);
      if (!checkbox) return;
      if (checkbox.checked) {
        activeCount++;
        if (!marsMap.hasLayer(layerGroup)) {
          marsMap.addLayer(layerGroup);
        }
      } else {
        if (marsMap.hasLayer(layerGroup)) {
          marsMap.removeLayer(layerGroup);
        }
      }
    });

    if (activeLayersCounter) {
      activeLayersCounter.textContent = `${activeCount} ACTIVA${activeCount === 1 ? '' : 'S'}`;
    }

    // Recalcular telemetría (ej. impacto de la tormenta de polvo en la batería solar)
    updateSurvivalTelemetry();
  }

  Object.keys(layerMapping).forEach((checkboxId) => {
    const cb = document.getElementById(checkboxId);
    if (cb) {
      cb.addEventListener('change', () => {
        syncLayersWithCheckboxes();
        if (typeof playHudTone === 'function') playHudTone(620, 0.04, 'sine');
      });
    }
  });

  // ==========================================================================
  // 8. TELEMETRÍA DEL CURSOR EN VIVO Y BOTONES DE CÁMARA DEL MAPA
  // ==========================================================================
  marsMap.on('mousemove', (e) => {
    const { lat, lng } = e.latlng;
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'O';
    const numAlt = estimateNumericAltitude(lat, lng);
    const altStr = `${numAlt > 0 ? '+' : ''}${numAlt.toLocaleString('en-US')}m`;

    if (cursorReadout) {
      cursorReadout.textContent = `LAT: ${Math.abs(lat).toFixed(4)}° ${latDir} | LON: ${Math.abs(lng).toFixed(4)}° ${lngDir} | ALT: ${altStr}`;
    }
  });

  marsMap.on('moveend', () => {
    const center = marsMap.getCenter();
    const latDir = center.lat >= 0 ? 'N' : 'S';
    const lngDir = center.lng >= 0 ? 'E' : 'O';
    if (headerCoords) {
      headerCoords.textContent = `${Math.abs(center.lat).toFixed(2)}°${latDir} • ${Math.abs(center.lng).toFixed(2)}°${lngDir}`;
    }
  });

  const btnZoomIn = document.getElementById('btn-map-zoom-in');
  const btnZoomOut = document.getElementById('btn-map-zoom-out');
  const btnCenterRover = document.getElementById('btn-map-center-rover');
  const btnGlobalMars = document.getElementById('btn-map-global');
  const baseLayerSelect = document.getElementById('map-baselayer-select');

  if (btnZoomIn) btnZoomIn.addEventListener('click', () => marsMap.zoomIn());
  if (btnZoomOut) btnZoomOut.addEventListener('click', () => marsMap.zoomOut());

  if (btnCenterRover) {
    btnCenterRover.addEventListener('click', () => {
      if (liveRoverMarker) {
        marsMap.flyTo(liveRoverMarker.getLatLng(), 6, { duration: 1.0 });
        setTimeout(() => liveRoverMarker.openPopup(), 1050);
      } else {
        marsMap.flyTo(JEZERO_CENTER, DEFAULT_ZOOM, { duration: 1.0 });
      }
    });
  }

  if (btnGlobalMars) {
    btnGlobalMars.addEventListener('click', () => {
      marsMap.flyTo([12.0, 45.0], 3, { duration: 1.4 });
    });
  }

  // Cambio instantáneo de modelo de mapa sin borrar molaTopoOverlay ni dejar pantalla en blanco
  if (baseLayerSelect) {
    baseLayerSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      const mapEl = marsMap.getContainer();
      if (mapEl) mapEl.setAttribute('data-map-model', val);

      // Siempre mantenemos opmMars como base CDN ultrarrápida (zIndex 1) para evitar parpadeos
      if (!marsMap.hasLayer(baseTiles.opmMars)) {
        baseTiles.opmMars.addTo(marsMap);
      }

      [baseTiles.molaBase, baseTiles.shadedRelief, baseTiles.usgsBlend, baseTiles.usgsHrsc].forEach((layer) => {
        if (marsMap.hasLayer(layer)) marsMap.removeLayer(layer);
      });

      if (val === 'mola-color') {
        baseTiles.molaBase.setOpacity(0.92);
        baseTiles.molaBase.addTo(marsMap);
      } else if (val === 'shaded') {
        baseTiles.shadedRelief.setOpacity(0.92);
        baseTiles.shadedRelief.addTo(marsMap);
      } else if (val === 'themis-ir') {
        baseTiles.shadedRelief.setOpacity(0.65);
        baseTiles.shadedRelief.addTo(marsMap);
      } else if (val === 'usgs-blend') {
        baseTiles.usgsBlend.addTo(marsMap);
      } else if (val === 'usgs-hrsc') {
        baseTiles.usgsHrsc.addTo(marsMap);
      } else {
        // 'opm-hybrid': Viking OPM + Relieve Celestia (Carga instantánea CDN)
        baseTiles.shadedRelief.setOpacity(0.35);
        baseTiles.shadedRelief.addTo(marsMap);
      }

      // Re-sincronizar capas NASA activas para que queden siempre visibles encima del mapa base
      syncLayersWithCheckboxes();
      if (typeof playHudTone === 'function') playHudTone(640, 0.05, 'sine');
    });
  }

  // ==========================================================================
  // 9. ETAPA 4: MÓDULO "MARTIAN STREET VIEW 360°" (FOTOGRAFÍA REAL NASA + SIMULACIÓN 2D)
  // ==========================================================================
  const svStationTitleEl = document.getElementById('sv-station-title');
  const svCompassHeadingEl = document.getElementById('sv-compass-heading');
  const svCameraAnglesEl = document.getElementById('sv-camera-angles');
  const btnSvAutoRotate = document.getElementById('btn-sv-autorotate');
  const svInspectorCard = document.getElementById('sv-inspector-card');
  const btnCloseInspector = document.getElementById('btn-close-inspector');
  const sviKickerEl = document.getElementById('svi-kicker');
  const sviTitleEl = document.getElementById('svi-title');
  const sviDescEl = document.getElementById('svi-desc');
  const sviDistEl = document.getElementById('svi-dist');
  const sviCompEl = document.getElementById('svi-comp');
  const svStepsPillsEl = document.getElementById('sv-steps-pills');
  const btnSvPrev = document.getElementById('btn-sv-prev');
  const btnSvNext = document.getElementById('btn-sv-next');

  // Referencias DOM para Conmutador de Modo Óptico 360° (Fusión Real+2D / Foto Real NASA / Simulada 2D) y API NASA
  const svRenderModeGroup = document.getElementById('sv-render-mode-group');
  const svBlendControl = document.getElementById('sv-blend-control');
  const svBlendSlider = document.getElementById('sv-blend-slider');
  const svBlendPctEl = document.getElementById('sv-blend-pct');
  const srpbPiaIdEl = document.getElementById('srpb-pia-id');
  const srpbSolTagEl = document.getElementById('srpb-sol-tag');
  const srpbStatusTagEl = document.getElementById('srpb-status-tag');
  const srpbCreditTextEl = document.getElementById('srpb-credit-text');
  const srpbJplLinkEl = document.getElementById('srpb-jpl-link');
  const btnSvNasaApi = document.getElementById('btn-sv-nasa-api');
  const svNasaApiDrawer = document.getElementById('sv-nasa-api-drawer');
  const btnCloseNasaDrawer = document.getElementById('btn-close-nasa-drawer');
  const nasaApiSearchInput = document.getElementById('nasa-api-search-input');
  const btnNasaApiSearch = document.getElementById('btn-nasa-api-search');
  const nasaApiResultsGrid = document.getElementById('nasa-api-results-grid');

  // Definición de las 6 Estaciones Panorámicas 360° Paso a Paso en Marte (con Fotografía Real NASA JPL-Caltech + Geometría 2D)
  const STREETVIEW_STATIONS = [
    {
      id: 'scene-landing',
      stepNum: '01',
      shortLabel: '01 INICIO (LANDING)',
      title: 'ESTACIÓN 01: SITIO DE AMARTIZAJE OCTAVIA E. BUTLER (KM 0.0)',
      sensor: 'NAVCAM + MASTCAM-Z (PERSEVERANCE)',
      routeKey: 'jezero-alpha',
      progressPct: 0,
      coords: [18.28, 77.68],
      elev: -2540,
      initialYaw: 18,
      initialPitch: 0,
      realPano: {
        piaId: 'PIA24264',
        sol: 'SOL 3 (MARS 2020)',
        localUrl: 'panoramas/PIA24264-landing.jpg',
        remoteUrl: 'https://images-assets.nasa.gov/image/PIA24264/PIA24264~large.jpg',
        jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA24264',
        credit: 'NASA/JPL-Caltech/ASU/MSSS — Primer Panorama 360° Mastcam-Z en Octavia E. Butler Landing (142 imágenes cosidas)'
      },
      palette: {
        skyZenith: '#182232',
        skyMid: '#6e422c',
        skyHorizon: '#d98a56',
        groundFar: '#7c381c',
        groundMid: '#5a2410',
        groundNear: '#331308',
        ridgeColor: '#4d2212',
        accentFeature: 'landing'
      },
      defaultInspect: {
        kicker: 'BALIZA DE DESCENSO MARS 2020 // TELEMETRÍA UHF',
        title: 'Punto de Inicio: Octavia E. Butler Landing',
        desc: 'Zona de toque inicial en la Unidad Volcánica Máaz. Marcas de erosión por retrocohetes Skycrane visibles en el regolito circundante.',
        dist: 'DIST: 6.2 m',
        comp: 'Basalto / Piroxeno'
      },
      hotspots: [
        {
          pitch: 0,
          yaw: 22,
          kind: 'nav',
          icon: 'fa-circle-arrow-up',
          label: 'AVANZAR PASO 02: MESA KODIAK (KM 4.8)',
          targetScene: 'scene-kodiak'
        },
        {
          pitch: 2,
          yaw: -42,
          kind: 'science',
          icon: 'fa-helicopter',
          label: 'Aeródromo Wright Brothers (Ingenuity)',
          kicker: 'REGISTRO DE AVIACIÓN PLANETARIA // INGENUITY',
          desc: 'Pista llana de regolito compactado desde donde despegó el primer helicóptero propulsado en otro planeta (72 vuelos completados).',
          dist: 'DIST: 48.0 m',
          comp: 'Regolito Firme (0% Riesgo)'
        },
        {
          pitch: -2,
          yaw: 78,
          kind: 'science',
          icon: 'fa-microscope',
          label: 'Afloramiento Ígneo "Máaz"',
          kicker: 'ESPECTRÓMETRO PIXL // RAYOS X',
          desc: 'Roca basáltica vesicular con recubrimiento de polvo férrico y sales de perclorato. Indica actividad volcánica antigua seguida de alteración acuosa.',
          dist: 'DIST: 3.4 m',
          comp: 'FeO / MgO / Olivino'
        }
      ]
    },
    {
      id: 'scene-kodiak',
      stepNum: '02',
      shortLabel: '02 MESA KODIAK',
      title: 'ESTACIÓN 02: PARADA CIENTÍFICA MESA KODIAK (KM 4.8)',
      sensor: 'MASTCAM-Z SUPER-RESOLUCIÓN 110MM',
      routeKey: 'jezero-alpha',
      progressPct: 33,
      coords: [18.38, 77.49],
      elev: -2490,
      initialYaw: 10,
      initialPitch: 0,
      realPano: {
        piaId: 'PIA24921',
        sol: 'SOL 466 (MARS 2020)',
        localUrl: 'panoramas/PIA24921-kodiak-delta.jpg',
        remoteUrl: 'https://images-assets.nasa.gov/image/PIA24921/PIA24921~large.jpg',
        jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA24921',
        credit: 'NASA/JPL-Caltech/ASU/MSSS — Mosaico Real 2.5-Gigapíxeles del Frente Deltaico de Jezero y Butte Kodiak (1,118 cuadros)'
      },
      palette: {
        skyZenith: '#1a202c',
        skyMid: '#7c482b',
        skyHorizon: '#e39660',
        groundFar: '#853d1e',
        groundMid: '#612811',
        groundNear: '#381508',
        ridgeColor: '#592613',
        accentFeature: 'kodiak'
      },
      defaultInspect: {
        kicker: 'ESPECTRÓMETRO PIXL / SUPERCAM LÁSER',
        title: 'Estratigrafía Fluvial: Mesa Kodiak',
        desc: 'Capas sedimentarias inclinadas (foresets) que demuestran el avance de un antiguo delta fluvial sobre el lago del Cráter Jezero hace 3.700 millones de años.',
        dist: 'DIST: 18.4 m',
        comp: 'SiO₂ / Filosilicatos'
      },
      hotspots: [
        {
          pitch: 0,
          yaw: 35,
          kind: 'nav',
          icon: 'fa-circle-arrow-up',
          label: 'AVANZAR PASO 03: DEPÓSITO HIELO ISRU (KM 9.4)',
          targetScene: 'scene-ice'
        },
        {
          pitch: -1,
          yaw: -155,
          kind: 'nav',
          icon: 'fa-circle-arrow-left',
          label: 'RETROCEDER PASO 01: SITIO DE INICIO (KM 0.0)',
          targetScene: 'scene-landing'
        },
        {
          pitch: 4,
          yaw: -8,
          kind: 'science',
          icon: 'fa-layer-group',
          label: 'Estratos Deltaicos de Kodiak',
          kicker: 'ASTROBIOLOGÍA // NIVEL PALEO-LACUSTRE',
          desc: 'Secuencia de conglomerados y areniscas finas depositadas por corrientes de baja energía. Excelente potencial de preservación de biosignaturas.',
          dist: 'DIST: 24.5 m',
          comp: 'Arcillas Esmectitas / Carbonatos'
        },
        {
          pitch: -2,
          yaw: 65,
          kind: 'science',
          icon: 'fa-vial',
          label: 'Tubo de Muestra de Titanio #14',
          kicker: 'PROGRAMA MARS SAMPLE RETURN // NASA-ESA',
          desc: 'Núcleo cilíndrico de roca sedimentaria sellado herméticamente para recolección por la tripulación humana.',
          dist: 'DIST: 2.1 m',
          comp: 'Sellado Hermético Nominal'
        }
      ]
    },
    {
      id: 'scene-ice',
      stepNum: '03',
      shortLabel: '03 HIELO ISRU',
      title: 'ESTACIÓN 03: DEPÓSITO DE HIELO SUBSUPERFICIAL ISRU (KM 9.4)',
      sensor: 'MASTCAM-Z + RADAR RIMFAX OVERLAY',
      routeKey: 'jezero-alpha',
      progressPct: 65,
      coords: [18.52, 77.33],
      elev: -2435,
      initialYaw: 0,
      initialPitch: 0,
      realPano: {
        piaId: 'PIA26369',
        sol: 'SOL 1178 (NERETVA VALLIS)',
        localUrl: 'panoramas/PIA26369-bright-angel.jpg',
        remoteUrl: 'https://images-assets.nasa.gov/image/PIA26369/PIA26369~large.jpg',
        jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA26369',
        credit: 'NASA/JPL-Caltech/ASU/MSSS — Panorama 360° de "Bright Angel" y Canal Fluvial Neretva Vallis (Cheyava Falls)'
      },
      palette: {
        skyZenith: '#111d2e',
        skyMid: '#593d38',
        skyHorizon: '#c88c6c',
        groundFar: '#6b3622',
        groundMid: '#4c2416',
        groundNear: '#29120b',
        ridgeColor: '#422015',
        accentFeature: 'ice'
      },
      defaultInspect: {
        kicker: 'RADAR SUBSUPERFICIAL RIMFAX // EXTRACCIÓN ISRU',
        title: 'Veta de Hielo de Agua Subterráneo (ISRU-01)',
        desc: 'Lente de hielo cristalino expuesta a 1.2m de profundidad en el talud protegido del norte del delta. Recurso crítico para agua potable y combustible LOX/CH₄.',
        dist: 'DIST: 7.8 m',
        comp: '84% H₂O + Sílice Hidratada'
      },
      hotspots: [
        {
          pitch: 0,
          yaw: 28,
          kind: 'nav',
          icon: 'fa-circle-arrow-up',
          label: 'AVANZAR PASO 04: CAMPAMENTO BASE (KM 14.6)',
          targetScene: 'scene-base'
        },
        {
          pitch: -1,
          yaw: -160,
          kind: 'nav',
          icon: 'fa-circle-arrow-left',
          label: 'RETROCEDER PASO 02: MESA KODIAK (KM 4.8)',
          targetScene: 'scene-kodiak'
        },
        {
          pitch: -1,
          yaw: -15,
          kind: 'ice',
          icon: 'fa-snowflake',
          label: 'Trinchera de Hielo Cristalino H₂O (84%)',
          kicker: 'SOPORTE VITAL // RESERVA HÍDRICA CONFIRMADA',
          desc: 'Capacidad estimada de 42,000 litros tras sublimación térmica y filtrado de percloratos. Permite recargar el 100% de las mochilas PLSS.',
          dist: 'DIST: 5.4 m',
          comp: 'H₂O Sólido (-64°C)'
        },
        {
          pitch: 3,
          yaw: 55,
          kind: 'ice',
          icon: 'fa-lungs',
          label: 'Planta Procesadora MOXIE-XL',
          kicker: 'ELECTRÓLISIS DE ÓXIDO SÓLIDO // O₂',
          desc: 'Generador de oxígeno en superficie produciendo 2.4 kg de O₂ respirable por hora a partir del CO₂ atmosférico marciano.',
          dist: 'DIST: 11.2 m',
          comp: 'Pureza O₂: 99.6%'
        }
      ]
    },
    {
      id: 'scene-base',
      stepNum: '04',
      shortLabel: '04 CAMPAMENTO BASE',
      title: 'ESTACIÓN 04: CAMPAMENTO BASE HÁBITAT DELTA PRIME (KM 14.6)',
      sensor: 'CÁMARA EXTERIOR DE TORRE METEOROLÓGICA',
      routeKey: 'jezero-alpha',
      progressPct: 100,
      coords: [18.64, 77.15],
      elev: -2380,
      initialYaw: -10,
      initialPitch: 0,
      realPano: {
        piaId: 'PIA26474',
        sol: 'SOL 1337 (CUMBRE BORDE JEZERO)',
        localUrl: 'panoramas/PIA26474-rio-chiquito.jpg',
        remoteUrl: 'https://images-assets.nasa.gov/image/PIA26474/PIA26474~large.jpg',
        jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA26474',
        credit: 'NASA/JPL-Caltech/ASU/MSSS — Panorama 360° en "Rio Chiquito" (Mirador de la Cumbre del Borde Occidental de Jezero)'
      },
      palette: {
        skyZenith: '#171f2e',
        skyMid: '#784126',
        skyHorizon: '#e0884b',
        groundFar: '#7d371a',
        groundMid: '#57230e',
        groundNear: '#2e1106',
        ridgeColor: '#4c1e0e',
        accentFeature: 'base'
      },
      defaultInspect: {
        kicker: 'DESTINO ALCANZADO // REFUGIO PRESURIZADO CLASE IV',
        title: 'Campamento Base: Hábitat Delta Prime',
        desc: 'Complejo presurizado con blindaje de regolito sinterizado contra radiación cósmica y solar. Esclusas EVA listas para acoplamiento del rover.',
        dist: 'DIST: 14.0 m',
        comp: 'Presión Int: 101.3 kPa (Nominal)'
      },
      hotspots: [
        {
          pitch: -1,
          yaw: -145,
          kind: 'nav',
          icon: 'fa-circle-arrow-left',
          label: 'RETROCEDER PASO 03: ESTACIÓN HIELO ISRU',
          targetScene: 'scene-ice'
        },
        {
          pitch: 1,
          yaw: 95,
          kind: 'nav',
          icon: 'fa-rocket',
          label: 'SALTO PLANETARIO: CRÁTER GALE (CURIOSITY)',
          targetScene: 'scene-gale'
        },
        {
          pitch: 3,
          yaw: -18,
          kind: 'science',
          icon: 'fa-campground',
          label: 'Domo Habitacional Principal "Ares Prime"',
          kicker: 'INFRAESTRUCTURA HUMANA EN MARTE // NASA ARTEMIS-MARS',
          desc: 'Capacidad para 6 astronautas durante 500 Soles. Cuenta con invernadero hidropónico presurizado, laboratorio médico y reactor Kilopower.',
          dist: 'DIST: 16.0 m',
          comp: 'Blindaje: 0.02 mSv/h'
        },
        {
          pitch: 6,
          yaw: -85,
          kind: 'science',
          icon: 'fa-triangle-exclamation',
          label: 'Frente de Tormenta de Polvo al Suroeste',
          kicker: 'RADAR METEOROLÓGICO MEDA // ALERTA ACTIVA',
          desc: 'Columna de polvo en suspensión elevándose a 12 km de altitud. Los exploradores deben permanecer dentro del hábitat durante el paso del frente.',
          dist: 'DIST: 42.0 km',
          comp: 'Opacidad Tau: 1.45'
        }
      ]
    },
    {
      id: 'scene-gale',
      stepNum: '05',
      shortLabel: '05 CRÁTER GALE',
      title: 'ESTACIÓN 05: CRÁTER GALE — MONTE SHARP (CURIOSITY MSL)',
      sensor: 'MASTCAM 100MM // ROVER CURIOSITY',
      routeKey: 'gale-sharp',
      progressPct: 65,
      coords: [-4.68, 137.38],
      elev: -4310,
      initialYaw: 5,
      initialPitch: 1,
      realPano: {
        piaId: 'PIA22545',
        sol: 'SOL 2137 / 4220 (CURIOSITY MSL)',
        localUrl: 'panoramas/PIA22545-gale-curiosity.jpg',
        remoteUrl: 'https://images-assets.nasa.gov/image/PIA22545/PIA22545~large.jpg',
        jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA22545',
        credit: 'NASA/JPL-Caltech/MSSS — Panorama 360° Real de Curiosity Mastcam en Cresta Vera Rubin y Aeolis Mons (Monte Sharp)'
      },
      palette: {
        skyZenith: '#211c19',
        skyMid: '#8a5232',
        skyHorizon: '#e5a472',
        groundFar: '#6e3a1f',
        groundMid: '#452616',
        groundNear: '#21140e',
        ridgeColor: '#542c18',
        accentFeature: 'gale'
      },
      defaultInspect: {
        kicker: 'MISIÓN MARS SCIENCE LABORATORY // SOL 3840',
        title: 'Faldas de Aeolis Mons (Monte Sharp)',
        desc: 'Montaña central de 5.5 km de altura cuyos estratos registran la transición climática de Marte desde una era húmeda de arcillas hacia una era árida de sulfatos.',
        dist: 'DIST: 32.0 m',
        comp: 'Hematita / Sulfato de Calcio'
      },
      hotspots: [
        {
          pitch: 0,
          yaw: 50,
          kind: 'nav',
          icon: 'fa-circle-arrow-up',
          label: 'SALTO PLANETARIO: VALLES MARINERIS SUR',
          targetScene: 'scene-valles'
        },
        {
          pitch: -1,
          yaw: -130,
          kind: 'nav',
          icon: 'fa-circle-arrow-left',
          label: 'VOLVER A CRÁTER JEZERO: CAMPAMENTO BASE',
          targetScene: 'scene-base'
        },
        {
          pitch: 6,
          yaw: 4,
          kind: 'science',
          icon: 'fa-mountain',
          label: 'Cumbre Estratificada de Aeolis Mons',
          kicker: 'GEOLOGÍA PLANETARIA // CURIOSITY CHEM-CAM',
          desc: 'Afloramientos ricos en hematita en la Cresta Vera Rubin y vetas blancas de yeso formadas por circulación hidrotermal.',
          dist: 'DIST: 4.2 km',
          comp: 'Fe₂O₃ / CaSO₄·2H₂O'
        }
      ]
    },
    {
      id: 'scene-valles',
      stepNum: '06',
      shortLabel: '06 VALLES MARINERIS',
      title: 'ESTACIÓN 06: CAÑÓN ABISAL COPRATES CHASMA (VALLES MARINERIS)',
      sensor: 'SONDA ÓPTICA DE RECONOCIMIENTO EXTREMO',
      routeKey: 'valles-marineris',
      progressPct: 68,
      coords: [-13.8900, -59.1800],
      elev: -3790,
      initialYaw: 0,
      initialPitch: 1,
      realPano: {
        piaId: 'PIA13077',
        sol: 'MRO HiRISE + GEDIZ VALLIS',
        localUrl: 'panoramas/PIA26363-gediz-vallis.jpg',
        remoteUrl: 'https://images-assets.nasa.gov/image/PIA26363/PIA26363~large.jpg',
        jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA26363',
        credit: 'NASA/JPL-Caltech/MSSS/UArizona — Garganta Tectónica y Canal de Escombros Sulfatados (Mosaico 360° Real)'
      },
      palette: {
        skyZenith: '#121521',
        skyMid: '#6b3222',
        skyHorizon: '#d47448',
        groundFar: '#5e2314',
        groundMid: '#3d150b',
        groundNear: '#1f0a05',
        ridgeColor: '#3b140a',
        accentFeature: 'valles'
      },
      defaultInspect: {
        kicker: 'SISTEMA DE CAÑONES ECUATORIALES // PROFUNDIDAD 7 KM',
        title: 'Escarpe Tectónico Coprates Chasma',
        desc: 'Las paredes expuestas del cañón muestran más de 6 km de corteza marciana primordial y depósitos masivos de sulfatos hidratados.',
        dist: 'DIST: 120 m',
        comp: 'Basalto / Kieserita Hidratada'
      },
      hotspots: [
        {
          pitch: 0,
          yaw: 0,
          kind: 'nav',
          icon: 'fa-circle-arrow-up',
          label: 'VOLVER AL INICIO: CRÁTER JEZERO (KM 0.0)',
          targetScene: 'scene-landing'
        },
        {
          pitch: 5,
          yaw: -32,
          kind: 'science',
          icon: 'fa-person-falling-burst',
          label: 'Muralla Norte de Coprates (Pendiente 27.6°)',
          kicker: 'ALERTA GEOTÉCNICA // RIESGO DE AVALANCHA DE REGOLITO',
          desc: 'Abanicos de derrubios recurrentes y líneas de pendiente oscura (RSL). Prohibido acercar el rover a menos de 50 metros de la base del talud.',
          dist: 'DIST: 85.0 m',
          comp: 'Pendiente Crítica: 27.6°'
        }
      ]
    }
  ];

  const panoCanvasCache = {};
  const realPanoCanvasCache = {};
  let currentStationId = 'scene-kodiak';
  let isAutoRotating = true;
  let render360Mode = 'real'; // 'real' (VISTA REAL) | 'sim2d' (VISTA 2D) — sin superposición
  let needs360Redraw = true;

  // Estado de cámara del Motor Esférico 360° Nativo (<canvas id="mars-360-canvas">)
  const mars360Canvas = document.getElementById('mars-360-canvas');
  const mars360HotspotsEl = document.getElementById('mars-360-hotspots');
  const pannellumMountEl = document.getElementById('pannellum-viewer');
  const btnMinimizeInspector = document.getElementById('btn-minimize-inspector');
  const btnReopenInspector = document.getElementById('btn-sv-reopen-inspector');
  const btn360ZoomIn = document.getElementById('btn-360-zoom-in');
  const btn360ZoomOut = document.getElementById('btn-360-zoom-out');
  const btn360Fit = document.getElementById('btn-360-fit');
  const btn360ResetCam = document.getElementById('btn-360-reset-cam');
  const svOverviewCanvas = document.getElementById('sv-overview-canvas');
  let svOverviewCtx = svOverviewCanvas ? svOverviewCanvas.getContext('2d') : null;

  let camYaw = 10;       // 0° a 360°
  let camPitch = 2;      // -42° a +42°
  let camFov = 90;       // 45° a 115°
  let targetYaw = null;
  let targetPitch = null;
  let targetFov = null;
  let isDragging360 = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartYaw = 0;
  let dragStartPitch = 0;
  let activeHotspotNodes = [];

  // Generador procedural equirectangular 2:1 (sin costuras en 0°/360°) de alta resolución para cada estación de Marte
  function getOrGeneratePanoramaCanvas(station) {
    if (panoCanvasCache[station.id]) {
      return panoCanvasCache[station.id];
    }

    const width = 2400;
    const height = 1200;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const pal = station.palette;

    // 1. Cielo marciano atmosférico (Cénit a Horizonte)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.53);
    skyGrad.addColorStop(0, pal.skyZenith);
    skyGrad.addColorStop(0.5, pal.skyMid);
    skyGrad.addColorStop(1, pal.skyHorizon);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height * 0.55);

    // 1b. Estrellas tenues en el cénit y lunas Fobos / Deimos
    ctx.fillStyle = 'rgba(255, 245, 235, 0.45)';
    for (let st = 0; st < 90; st++) {
      const sx = ((st * 197) % width);
      const sy = ((st * 73) % Math.floor(height * 0.22));
      ctx.fillRect(sx, sy, 1.6, 1.6);
    }

    // 2. Disco solar en el cielo marciano con halo azulado de dispersión de Mie
    const sunX = width * 0.58;
    const sunY = height * 0.23;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 210);
    sunGlow.addColorStop(0, 'rgba(255, 252, 245, 1)');
    sunGlow.addColorStop(0.14, 'rgba(185, 228, 255, 0.72)');
    sunGlow.addColorStop(0.45, 'rgba(255, 165, 110, 0.32)');
    sunGlow.addColorStop(1, 'rgba(255, 130, 80, 0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(sunX - 220, sunY - 220, 440, 440);

    // 3. Cordilleras y bordes de cráter 360° continuos (Funciones periódicas en 2*PI para costura cero)
    const drawPeriodicMountainLayer = (baseY, amp, freqMult, fillStyle, detailBoost = 1, strokeTop = null) => {
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 4) {
        const theta = (x / width) * Math.PI * 2;
        let offset =
          Math.sin(theta * 2 + freqMult) * amp * 0.48 +
          Math.cos(theta * 5 - freqMult) * amp * 0.28 +
          Math.sin(theta * 9 + freqMult * 2) * amp * 0.15 * detailBoost +
          Math.cos(theta * 17) * amp * 0.08 * detailBoost;

        if (pal.accentFeature === 'kodiak' && Math.abs(theta - Math.PI) < 0.45) {
          offset = Math.max(offset, amp * 0.95);
        } else if (pal.accentFeature === 'gale' && Math.abs(theta - Math.PI) < 0.65) {
          offset += Math.cos((theta - Math.PI) * 2.3) * amp * 1.65;
        } else if (pal.accentFeature === 'valles') {
          offset *= 1.85;
        }

        ctx.lineTo(x, baseY - offset);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = fillStyle;
      ctx.fill();

      if (strokeTop) {
        ctx.strokeStyle = strokeTop;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }
    };

    // Cordillera lejana del borde del cráter
    drawPeriodicMountainLayer(height * 0.50, 74, 1.1, pal.groundFar, 1.0, 'rgba(255, 195, 145, 0.22)');
    // Mesetas intermedias y escarpes deltaicos
    drawPeriodicMountainLayer(height * 0.535, 48, 2.4, pal.ridgeColor, 1.35, 'rgba(255, 150, 95, 0.28)');

    // 4. Suelo marciano (Gradiente desde el horizonte hasta el nadir bajo el Rover)
    const groundGrad = ctx.createLinearGradient(0, height * 0.52, 0, height);
    groundGrad.addColorStop(0, pal.groundFar);
    groundGrad.addColorStop(0.28, pal.groundMid);
    groundGrad.addColorStop(0.76, pal.groundNear);
    groundGrad.addColorStop(1, '#120804');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, height * 0.53, width, height * 0.47);

    // 5. Estratos sedimentarios horizontales y dunas eólicas en el terreno
    ctx.strokeStyle = 'rgba(255, 175, 120, 0.18)';
    ctx.lineWidth = 2.2;
    for (let s = 0; s < 16; s++) {
      const yLine = height * 0.53 + s * s * 2.15;
      if (yLine > height * 0.91) break;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 14) {
        const theta = (x / width) * Math.PI * 2;
        const wave = Math.sin(theta * 6 + s) * (3.5 + s * 0.65);
        if (x === 0) ctx.moveTo(x, yLine + wave);
        else ctx.lineTo(x, yLine + wave);
      }
      ctx.stroke();
    }

    // 6. Rasgos visuales distintivos según la estación (Mesa Kodiak, Hielo ISRU, Domos de Base, Rocas)
    let seed = station.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const pseudoRand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    // Si es Mesa Kodiak (scene-kodiak), dibujamos la gran meseta estratificada frontal con capas geológicas visibles
    if (pal.accentFeature === 'kodiak') {
      ctx.save();
      const mesaX = width * 0.48;
      const mesaY = height * 0.49;
      ctx.fillStyle = '#6c2d14';
      ctx.beginPath();
      ctx.moveTo(mesaX - 240, mesaY + 55);
      ctx.lineTo(mesaX - 165, mesaY - 48);
      ctx.lineTo(mesaX + 175, mesaY - 44);
      ctx.lineTo(mesaX + 255, mesaY + 55);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 185, 130, 0.55)';
      ctx.lineWidth = 2;
      for (let l = -32; l <= 40; l += 12) {
        ctx.beginPath();
        ctx.moveTo(mesaX - 190, mesaY + l);
        ctx.lineTo(mesaX + 200, mesaY + l + 4);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Rocas basálticas y afloramientos distribuidos en 360°
    for (let r = 0; r < 220; r++) {
      const rx = pseudoRand() * width;
      const ry = height * 0.545 + Math.pow(pseudoRand(), 1.45) * (height * 0.365);
      const scale = ((ry - height * 0.52) / (height * 0.45)) * 32 + 4;
      const rw = scale * (0.85 + pseudoRand() * 1.3);
      const rh = scale * (0.48 + pseudoRand() * 0.62);

      // Sombra proyectada
      ctx.fillStyle = 'rgba(8, 3, 1, 0.6)';
      ctx.beginPath();
      ctx.ellipse(rx + rw * 0.28, ry + rh * 0.35, rw * 0.68, rh * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();

      // Polígono facetado de roca marciana
      ctx.fillStyle = pseudoRand() > 0.35 ? '#522211' : '#73341c';
      ctx.beginPath();
      ctx.moveTo(rx - rw * 0.52, ry + rh * 0.32);
      ctx.lineTo(rx - rw * 0.34, ry - rh * 0.52);
      ctx.lineTo(rx + rw * 0.26, ry - rh * 0.42);
      ctx.lineTo(rx + rw * 0.56, ry + rh * 0.32);
      ctx.closePath();
      ctx.fill();

      // Borde iluminado por el sol
      ctx.strokeStyle = 'rgba(255, 190, 140, 0.42)';
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }

    // Si es la estación de Hielo Subterráneo (scene-ice), dibujamos la trinchera de hielo cristalino H2O y planta MOXIE
    if (pal.accentFeature === 'ice') {
      ctx.save();
      const iceX = width * 0.46;
      const iceY = height * 0.67;
      const iceGlow = ctx.createRadialGradient(iceX, iceY, 12, iceX, iceY, 220);
      iceGlow.addColorStop(0, 'rgba(200, 252, 255, 0.92)');
      iceGlow.addColorStop(0.45, 'rgba(0, 229, 255, 0.48)');
      iceGlow.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = iceGlow;
      ctx.beginPath();
      ctx.ellipse(iceX, iceY, 210, 64, -0.08, 0, Math.PI * 2);
      ctx.fill();

      // Cristales poligonales de hielo expuestos
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(iceX - 70, iceY - 15, 140, 30);
      ctx.restore();
    }

    // Si es el Campamento Base (scene-base), dibujamos el complejo de domos presurizados "Ares Prime"
    if (pal.accentFeature === 'base') {
      ctx.save();
      const domeX = width * 0.45;
      const domeY = height * 0.535;
      // Domo Principal
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(domeX, domeY, 58, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#FF6B2B';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Módulo Esclusa EVA y Paneles Solares
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(domeX + 55, domeY - 26, 65, 26);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(domeX - 140, domeY - 18, 68, 16);
      ctx.restore();
    }

    // 7. Huellas de las ruedas de titanio del Rover convergiendo hacia el horizonte
    ctx.strokeStyle = 'rgba(22, 9, 4, 0.72)';
    ctx.lineWidth = 7;
    ctx.setLineDash([14, 7]);
    ctx.beginPath();
    ctx.moveTo(width * 0.43, height * 0.91);
    ctx.lineTo(width * 0.53, height * 0.55);
    ctx.moveTo(width * 0.59, height * 0.91);
    ctx.lineTo(width * 0.56, height * 0.55);
    ctx.stroke();
    ctx.setLineDash([]);

    // 8. Cubierta técnica del Rover Perseverance en el Nadir (parte inferior de la esfera)
    ctx.fillStyle = '#141923';
    ctx.fillRect(0, height * 0.90, width, height * 0.10);
    ctx.strokeStyle = '#FF6B2B';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.90);
    ctx.lineTo(width, height * 0.90);
    ctx.stroke();

    // Detalles técnicos de chasis del Rover en el nadir
    ctx.fillStyle = 'rgba(0, 229, 255, 0.25)';
    for (let c = 80; c < width; c += 240) {
      ctx.fillRect(c, height * 0.92, 110, 36);
    }

    panoCanvasCache[station.id] = canvas;
    return canvas;
  }

  // Resuelve rutas de panoramas locales de forma universal (Vite root, relative, public o remote)
  function resolvePanoPath(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    const fileName = path.split('/').pop();
    return `panoramas/${fileName}`;
  }

  // Compone un lienzo equirectangular 360° (2048x1024) a partir de fotografía real de NASA JPL-Caltech (Mastcam-Z / Mastcam / HiRISE)
  function getOrComposeRealPanoramaCanvas(station) {
    if (!station || !station.realPano) return null;
    const fileName = (station.realPano.localUrl || '').split('/').pop();
    const cacheKey = `${station.id}::${station.realPano.piaId || fileName || station.realPano.remoteUrl}`;
    if (realPanoCanvasCache[cacheKey]) {
      return realPanoCanvasCache[cacheKey];
    }

    const width = 2048;
    const height = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const entry = {
      canvas,
      loaded: false,
      error: false,
      sourceUsed: 'CARGANDO TELEMETRÍA ÓPTICA NASA...'
    };
    realPanoCanvasCache[cacheKey] = entry;

    const buildFromImage = (img, sourceLabel) => {
      const ctx = canvas.getContext('2d', { alpha: false });
      const p = station.palette;

      // 1. Proyección equirectangular a escala angular natural (sin estiramiento vertical forzado)
      const imgAspect = img.naturalWidth / Math.max(1, img.naturalHeight);

      // Fondo ambiental de Marte en el cénit y el suelo
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.5);
      skyGrad.addColorStop(0.0, p.skyZenith);
      skyGrad.addColorStop(0.55, p.skyMid);
      skyGrad.addColorStop(1.0, p.skyHorizon);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height / 2);

      const groundGrad = ctx.createLinearGradient(0, height * 0.5, 0, height);
      groundGrad.addColorStop(0.0, p.groundFar);
      groundGrad.addColorStop(0.45, p.groundMid);
      groundGrad.addColorStop(1.0, p.groundNear);
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, height / 2, width, height / 2);

      let topY = 0;
      let bandH = height;

      if (imgAspect >= 1.8) {
        // Panorama continuo de rover: altura angular proporcional al aspect ratio real
        bandH = Math.min(height, Math.round(width / Math.max(1.8, Math.min(5.2, imgAspect))));
        topY = Math.max(0, Math.min(height - bandH, Math.round(height * 0.5 - bandH * 0.42)));
        ctx.drawImage(img, 0, topY, width, bandH);
      } else {
        // Mosaico para imágenes de aspecto estrecho
        const tileW = width / 2;
        bandH = Math.min(height, Math.round(tileW / Math.max(0.6, imgAspect)));
        topY = Math.max(0, Math.round(height * 0.5 - bandH * 0.45));
        ctx.drawImage(img, 0, topY, tileW, bandH);
        ctx.save();
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, topY, tileW, bandH);
        ctx.restore();
      }

      // Transición suave en el horizonte superior e inferior para máxima inmersión
      const topEdgeH = Math.min(36, Math.round(bandH * 0.08));
      if (topEdgeH > 2 && topY > 0) {
        const topGrad = ctx.createLinearGradient(0, topY - 2, 0, topY + topEdgeH);
        topGrad.addColorStop(0.0, p.skyHorizon);
        topGrad.addColorStop(1.0, 'rgba(0,0,0,0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, topY - 2, width, topEdgeH + 2);
      }

      const botEdgeH = Math.min(40, Math.round(bandH * 0.08));
      const botY = topY + bandH;
      if (botEdgeH > 2 && botY < height) {
        const botGrad = ctx.createLinearGradient(0, botY - botEdgeH, 0, botY + 2);
        botGrad.addColorStop(0.0, 'rgba(0,0,0,0)');
        botGrad.addColorStop(1.0, p.groundFar);
        ctx.fillStyle = botGrad;
        ctx.fillRect(0, botY - botEdgeH, width, botEdgeH + 2);
      }

      entry.loaded = true;
      entry.sourceUsed = sourceLabel;
      needs360Redraw = true;
      if (station.id === currentStationId) {
        updateRealPhotoBadge(station, entry);
      }
    };

    // Lista de candidatos ordenada para que SIEMPRE cargue sin importar el entorno
    const candidateUrls = [
      fileName ? `panoramas/${fileName}` : null,
      fileName ? `./panoramas/${fileName}` : null,
      fileName ? `/panoramas/${fileName}` : null,
      fileName ? `public/panoramas/${fileName}` : null,
      station.realPano.localUrl,
      station.realPano.remoteUrl
    ].filter(Boolean);
    const uniqueCandidates = [...new Set(candidateUrls)];

    let attemptIndex = 0;
    const tryNext = () => {
      if (attemptIndex >= uniqueCandidates.length) {
        entry.error = true;
        needs360Redraw = true;
        if (station.id === currentStationId) updateRealPhotoBadge(station, entry);
        return;
      }
      const url = uniqueCandidates[attemptIndex++];
      const isRemote = url.startsWith('http://') || url.startsWith('https://');
      const img = new Image();
      img.decoding = 'async';
      if (isRemote) img.crossOrigin = 'anonymous';

      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        tryNext();
      }, 5000);

      img.onload = () => {
        if (timedOut) return;
        clearTimeout(timer);
        const label = isRemote ? 'SERVIDOR REMOTO NASA IMAGES API' : 'ARCHIVO OFICIAL NASA JPL (ALTA VELOCIDAD)';
        if (typeof img.decode === 'function') {
          img.decode().then(() => buildFromImage(img, label)).catch(() => buildFromImage(img, label));
        } else {
          buildFromImage(img, label);
        }
      };

      img.onerror = () => {
        if (timedOut) return;
        clearTimeout(timer);
        tryNext();
      };

      img.src = url;
    };

    tryNext();
    return entry;
  }

  // Precargar en segundo plano las 6 fotografías panorámicas reales de la NASA para cambio instantáneo sin tirones
  setTimeout(() => {
    STREETVIEW_STATIONS.forEach((st) => {
      getOrComposeRealPanoramaCanvas(st);
    });
  }, 120);

  // Actualiza la insignia inferior izquierda con los metadatos reales del catálogo NASA Photojournal (PIA)
  function updateRealPhotoBadge(station, realEntry) {
    if (!station || !station.realPano) return;
    if (srpbPiaIdEl) srpbPiaIdEl.textContent = `NASA ID: ${station.realPano.piaId || 'NASA-RAW'}`;
    if (srpbSolTagEl) srpbSolTagEl.textContent = station.realPano.sol || 'MARS ARCHIVE';
    if (srpbCreditTextEl) srpbCreditTextEl.textContent = station.realPano.credit || '';
    if (srpbJplLinkEl && station.realPano.jplUrl) {
      srpbJplLinkEl.href = station.realPano.jplUrl;
    }
    if (srpbStatusTagEl) {
      if (render360Mode === 'sim2d') {
        srpbStatusTagEl.innerHTML = '<i class="fa-solid fa-vector-square"></i> VISTA 2D SIMULADA ACTIVA';
        srpbStatusTagEl.style.color = '#00E5FF';
      } else if (realEntry && realEntry.loaded) {
        srpbStatusTagEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> VISTA REAL NASA 360° ACTIVA';
        srpbStatusTagEl.style.color = '#38F28D';
      } else if (realEntry && realEntry.error) {
        srpbStatusTagEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> RESPALDO VISTA 2D';
        srpbStatusTagEl.style.color = '#FFB020';
      } else {
        srpbStatusTagEl.innerHTML = '<i class="fa-solid fa-satellite-dish fa-spin"></i> CARGANDO VISTA REAL NASA...';
        srpbStatusTagEl.style.color = '#00E5FF';
      }
    }
  }

  // Crea los elementos DOM interactivos para los Hotspots 3D de la estación activa
  function buildStationHotspotElements(station) {
    if (!mars360HotspotsEl) return;
    mars360HotspotsEl.innerHTML = '';
    activeHotspotNodes = [];

    station.hotspots.forEach((hs) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'hud-360-hotspot';
      const pinTypeClass =
        hs.kind === 'nav' ? 'type-nav' : hs.kind === 'ice' ? 'type-ice' : 'type-science';

      wrapper.innerHTML = `
        <div class="hs360-pin ${pinTypeClass}">
          <div class="hs360-icon"><i class="fa-solid ${hs.icon}"></i></div>
          <span class="hs360-label">${hs.label}</span>
        </div>
      `;

      wrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        if (hs.kind === 'nav' && hs.targetScene) {
          loadStreetViewStation(hs.targetScene, true);
        } else {
          isAutoRotating = false;
          if (btnSvAutoRotate) btnSvAutoRotate.classList.remove('is-active');
          animateCameraTo(hs.yaw, hs.pitch, 72);
          if (svInspectorCard) {
            svInspectorCard.classList.remove('is-closed', 'is-minimized');
          }
          updateInspectorCard({
            kicker: hs.kicker,
            title: hs.label,
            desc: hs.desc,
            dist: hs.dist,
            comp: hs.comp
          });
          if (typeof playHudTone === 'function') playHudTone(860, 0.07, 'sine');
        }
      });

      mars360HotspotsEl.appendChild(wrapper);
      activeHotspotNodes.push({ data: hs, el: wrapper, visible: null });
    });
    needs360Redraw = true;
  }

  // Animación suave de la cámara esférica 360° hacia un objetivo (yaw, pitch, fov)
  function animateCameraTo(yaw, pitch, fov = camFov) {
    targetYaw = ((yaw % 360) + 360) % 360;
    targetPitch = Math.max(-80, Math.min(80, pitch));
    targetFov = Math.max(30, Math.min(125, fov));
    needs360Redraw = true;
  }

  // Caché de dimensiones del viewport 360° mediante ResizeObserver (evita getBoundingClientRect() en cada frame)
  let cached360Width = 960;
  let cached360Height = 540;
  let mars360Ctx = null;

  function sync360ViewportSize() {
    if (!mars360Canvas || !mars360Canvas.parentElement) return;
    const rect = mars360Canvas.parentElement.getBoundingClientRect();
    if (rect.width > 50 && rect.height > 50) {
      cached360Width = Math.floor(rect.width);
      cached360Height = Math.floor(rect.height);
      if (mars360Canvas.width !== cached360Width || mars360Canvas.height !== cached360Height) {
        mars360Canvas.width = cached360Width;
        mars360Canvas.height = cached360Height;
        mars360Ctx = mars360Canvas.getContext('2d', { alpha: false });
        if (mars360Ctx) mars360Ctx.imageSmoothingQuality = 'medium';
        needs360Redraw = true;
      }
    }
  }

  if (typeof ResizeObserver !== 'undefined' && pannellumMountEl) {
    const ro360 = new ResizeObserver(() => {
      sync360ViewportSize();
    });
    ro360.observe(pannellumMountEl);
  }
  window.addEventListener('resize', sync360ViewportSize, { passive: true });

  // Dibuja una única textura equirectangular 360° con envoltura horizontal continua (sin superposición)
  function drawEquirectangularLayer(ctx, texCanvas, sx, sy, cropW, cropH, sw, cw, ch) {
    if (!texCanvas) return;
    if (sx + cropW <= sw) {
      ctx.drawImage(texCanvas, sx, sy, cropW, cropH, 0, 0, cw, ch);
    } else {
      const firstPartW = sw - sx;
      const secondPartW = cropW - firstPartW;
      const destSplitX = Math.floor((firstPartW / cropW) * cw);

      ctx.drawImage(texCanvas, sx, sy, firstPartW, cropH, 0, 0, destSplitX + 1, ch);
      ctx.drawImage(
        texCanvas,
        0,
        sy,
        secondPartW,
        cropH,
        destSplitX,
        0,
        cw - destSplitX,
        ch
      );
    }
  }

  // Renderiza en tiempo real (60FPS ultra fluido) la proyección esférica 360° (VISTA REAL o VISTA 2D por separado)
  function renderMars360Frame() {
    requestAnimationFrame(renderMars360Frame);
    if (!mars360Canvas || streetContainer.classList.contains('is-hidden')) return;

    // Interpolación suave hacia objetivo o giro orbital automático
    if (targetYaw !== null) {
      let diffY = targetYaw - camYaw;
      if (diffY > 180) diffY -= 360;
      if (diffY < -180) diffY += 360;
      camYaw = ((camYaw + diffY * 0.14) % 360 + 360) % 360;
      camPitch += (targetPitch - camPitch) * 0.14;
      camFov += (targetFov - camFov) * 0.14;
      needs360Redraw = true;
      if (Math.abs(diffY) < 0.2 && Math.abs(targetPitch - camPitch) < 0.2) {
        targetYaw = null;
        targetPitch = null;
        targetFov = null;
      }
    } else if (isAutoRotating && !isDragging360) {
      camYaw = (camYaw + 0.09) % 360;
      needs360Redraw = true;
    }

    if (!needs360Redraw) return;
    needs360Redraw = false;

    if (!mars360Ctx || mars360Canvas.width < 100) {
      sync360ViewportSize();
      if (!mars360Ctx) mars360Ctx = mars360Canvas.getContext('2d', { alpha: false });
    }

    const station =
      STREETVIEW_STATIONS.find((s) => s.id === currentStationId) || STREETVIEW_STATIONS[1];

    // Seleccionar EXCLUSIVAMENTE la vista activa (sin sobreponer una con la otra):
    // - 'real'  -> Fotografía Real 360° de la NASA a cuadro completo
    // - 'sim2d' -> Vista 360° Simulada en 2D Táctica
    let activeSourceCanvas = null;
    if (render360Mode === 'real') {
      const realEntry = getOrComposeRealPanoramaCanvas(station);
      if (realEntry && realEntry.loaded) {
        activeSourceCanvas = realEntry.canvas;
      } else {
        activeSourceCanvas = getOrGeneratePanoramaCanvas(station);
      }
    } else {
      activeSourceCanvas = getOrGeneratePanoramaCanvas(station);
    }

    const cw = cached360Width;
    const ch = cached360Height;
    const sw = activeSourceCanvas.width;
    const sh = activeSourceCanvas.height;

    const vFov = Math.max(28, Math.min(88, camFov * (ch / cw)));
    const cropW = (camFov / 360) * sw;
    const cropH = (vFov / 180) * sh;

    // Coordenada central en la textura equirectangular (yaw=0 corresponde al centro sw*0.5)
    const normYaw = ((camYaw % 360) + 360) % 360;
    const centerX = ((normYaw / 360) * sw + sw * 0.5) % sw;
    const centerY = ((90 - camPitch) / 180) * sh;

    const sy = Math.max(0, Math.min(sh - cropH, centerY - cropH / 2));
    let sx = centerX - cropW / 2;
    if (sx < 0) sx += sw;

    // Dibujar únicamente la capa seleccionada (0% superposición, máxima fluidez GPU)
    drawEquirectangularLayer(mars360Ctx, activeSourceCanvas, sx, sy, cropW, cropH, sw, cw, ch);

    // Dibujar miniatura de todo el panorama en el overview strip para que el usuario pueda ver todo
    if (svOverviewCanvas && svOverviewCtx) {
      const ovW = svOverviewCanvas.width;
      const ovH = svOverviewCanvas.height;
      svOverviewCtx.drawImage(activeSourceCanvas, 0, 0, ovW, ovH);

      // Franja de horizonte
      svOverviewCtx.strokeStyle = 'rgba(255, 107, 43, 0.4)';
      svOverviewCtx.lineWidth = 1;
      svOverviewCtx.beginPath();
      svOverviewCtx.moveTo(0, ovH * 0.5);
      svOverviewCtx.lineTo(ovW, ovH * 0.5);
      svOverviewCtx.stroke();

      // Recuadro del cono de visión actual (FOV x Pitch)
      const boxW = Math.max(28, (camFov / 360) * ovW);
      const boxH = Math.max(16, (vFov / 180) * ovH);
      const boxX = ((normYaw / 360) * ovW - boxW * 0.5 + ovW) % ovW;
      const boxY = Math.max(2, Math.min(ovH - boxH - 2, ((90 - camPitch) / 180) * ovH - boxH * 0.5));

      svOverviewCtx.strokeStyle = '#00e5ff';
      svOverviewCtx.lineWidth = 2;
      svOverviewCtx.fillStyle = 'rgba(0, 229, 255, 0.18)';
      svOverviewCtx.fillRect(boxX, boxY, boxW, boxH);
      svOverviewCtx.strokeRect(boxX, boxY, boxW, boxH);

      if (boxX + boxW > ovW) {
        const wrapW = boxX + boxW - ovW;
        svOverviewCtx.fillRect(0, boxY, wrapW, boxH);
        svOverviewCtx.strokeRect(0, boxY, wrapW, boxH);
      }
    }

    // En modo VISTA 2D, mostrar la línea de horizonte artificial táctica
    if (render360Mode === 'sim2d') {
      const horizonScreenY = (0.5 - (0 - camPitch) / vFov) * ch;
      if (horizonScreenY > 20 && horizonScreenY < ch - 20) {
        mars360Ctx.save();
        mars360Ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
        mars360Ctx.lineWidth = 1;
        mars360Ctx.setLineDash([6, 8]);
        mars360Ctx.beginPath();
        mars360Ctx.moveTo(40, horizonScreenY);
        mars360Ctx.lineTo(cw - 40, horizonScreenY);
        mars360Ctx.stroke();
        mars360Ctx.restore();
      }
    }

    // Proyectar cada Hotspot 3D usando transformaciones GPU (translate3d) sin recalcular layout DOM
    const maxYawVis = camFov * 0.58;
    const maxPitchVis = vFov * 0.65;
    for (let i = 0; i < activeHotspotNodes.length; i++) {
      const node = activeHotspotNodes[i];
      const data = node.data;
      const el = node.el;

      let deltaYaw = data.yaw - normYaw;
      if (deltaYaw > 180) deltaYaw -= 360;
      else if (deltaYaw < -180) deltaYaw += 360;

      const deltaPitch = data.pitch - camPitch;

      if (Math.abs(deltaYaw) <= maxYawVis && Math.abs(deltaPitch) <= maxPitchVis) {
        const screenX = (0.5 + deltaYaw / camFov) * cw;
        const screenY = (0.5 - deltaPitch / vFov) * ch;
        if (node.visible !== true) {
          el.style.visibility = 'visible';
          el.style.pointerEvents = 'auto';
          node.visible = true;
        }
        el.style.transform = `translate3d(${screenX.toFixed(1)}px, ${screenY.toFixed(1)}px, 0) translate(-50%, -50%)`;
      } else if (node.visible !== false) {
        el.style.visibility = 'hidden';
        el.style.pointerEvents = 'none';
        node.visible = false;
      }
    }
  }

  // Eventos del Selector de Modo 360° (VISTA REAL / VISTA 2D — completamente separadas)
  if (svRenderModeGroup) {
    svRenderModeGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-360-mode]');
      if (!btn) return;
      const mode = btn.getAttribute('data-360-mode');
      if (!mode) return;

      render360Mode = mode;
      needs360Redraw = true;
      svRenderModeGroup.querySelectorAll('[data-360-mode]').forEach((b) => {
        b.classList.toggle('is-active', b === btn);
      });

      const st =
        STREETVIEW_STATIONS.find((s) => s.id === currentStationId) || STREETVIEW_STATIONS[1];
      const cacheKey = `${st.id}::${st.realPano?.localUrl || st.realPano?.remoteUrl}`;
      updateRealPhotoBadge(st, realPanoCanvasCache[cacheKey]);
      if (typeof playHudTone === 'function') playHudTone(680, 0.05, 'sine');
    });
  }

  // ==========================================================================
  // ARCHIVO FOTOGRÁFICO REAL DE LA NASA (CATÁLOGO LOCAL INSTANTÁNEO + API EN VIVO)
  // ==========================================================================
  const LOCAL_CURATED_PANORAMAS = [
    {
      nasaId: 'PIA24264',
      title: 'Perseverance 360° — Octavia E. Butler Landing (Sol 3)',
      dateStr: 'MARS 2020',
      thumbUrl: 'panoramas/PIA24264-landing.jpg',
      hiResUrl: 'panoramas/PIA24264-landing.jpg',
      jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA24264',
      credit: 'NASA/JPL-Caltech/ASU/MSSS — Panorama 360° Mastcam-Z en Octavia E. Butler Landing'
    },
    {
      nasaId: 'PIA24921',
      title: 'Perseverance 360° — Frente del Delta Jezero y Mesa Kodiak',
      dateStr: 'SOL 466',
      thumbUrl: 'panoramas/PIA24921-kodiak-delta.jpg',
      hiResUrl: 'panoramas/PIA24921-kodiak-delta.jpg',
      jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA24921',
      credit: 'NASA/JPL-Caltech/ASU/MSSS — Mosaico Real 2.5-Gigapíxeles del Frente Deltaico y Mesa Kodiak'
    },
    {
      nasaId: 'PIA26369',
      title: 'Perseverance 360° — Bright Angel y Canal Neretva Vallis',
      dateStr: 'SOL 1178',
      thumbUrl: 'panoramas/PIA26369-bright-angel.jpg',
      hiResUrl: 'panoramas/PIA26369-bright-angel.jpg',
      jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA26369',
      credit: 'NASA/JPL-Caltech/ASU/MSSS — Panorama 360° en Bright Angel (Neretva Vallis)'
    },
    {
      nasaId: 'PIA26474',
      title: 'Perseverance 360° — Cumbre del Borde Occidental (Rio Chiquito)',
      dateStr: 'SOL 1337',
      thumbUrl: 'panoramas/PIA26474-rio-chiquito.jpg',
      hiResUrl: 'panoramas/PIA26474-rio-chiquito.jpg',
      jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA26474',
      credit: 'NASA/JPL-Caltech/ASU/MSSS — Panorama 360° en Mirador Rio Chiquito (Cumbre de Jezero)'
    },
    {
      nasaId: 'PIA22545',
      title: 'Curiosity 360° — Cresta Vera Rubin y Monte Sharp (Cráter Gale)',
      dateStr: 'MSL CURIOSITY',
      thumbUrl: 'panoramas/PIA22545-gale-curiosity.jpg',
      hiResUrl: 'panoramas/PIA22545-gale-curiosity.jpg',
      jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA22545',
      credit: 'NASA/JPL-Caltech/MSSS — Panorama 360° Mastcam en Cresta Vera Rubin (Cráter Gale)'
    },
    {
      nasaId: 'PIA26363',
      title: 'Curiosity 360° — Canal Gediz Vallis y Rocas de Azufre Elemental',
      dateStr: 'SOL 4208',
      thumbUrl: 'panoramas/PIA26363-gediz-vallis.jpg',
      hiResUrl: 'panoramas/PIA26363-gediz-vallis.jpg',
      jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA26363',
      credit: 'NASA/JPL-Caltech/MSSS — Panorama 360° Mastcam en Canal Gediz Vallis (Monte Sharp)'
    },
    {
      nasaId: 'PIA13077',
      title: 'MRO HiRISE + Viking — Cañón Coprates (Valles Marineris)',
      dateStr: 'MRO / VIKING',
      thumbUrl: 'panoramas/PIA13077-valles-marineris.jpg',
      hiResUrl: 'panoramas/PIA13077-valles-marineris.jpg',
      jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA13077',
      credit: 'NASA/JPL-Caltech/Univ. of Arizona — Mosaico Real de Valles Marineris'
    }
  ];

  function closeNasaPhotoDrawer() {
    if (svNasaApiDrawer) svNasaApiDrawer.classList.add('is-hidden');
    if (btnSvNasaApi) btnSvNasaApi.classList.remove('is-active');
  }

  // Cerrar gaveta de fotos con Escape o haciendo clic fuera
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && svNasaApiDrawer && !svNasaApiDrawer.classList.contains('is-hidden')) {
      closeNasaPhotoDrawer();
    }
  });

  document.addEventListener('pointerdown', (e) => {
    if (svNasaApiDrawer && !svNasaApiDrawer.classList.contains('is-hidden')) {
      if (!svNasaApiDrawer.contains(e.target) && !btnSvNasaApi?.contains(e.target)) {
        closeNasaPhotoDrawer();
      }
    }
  });

  function applySelectedPanoramaToViewer(panoItem) {
    const st =
      STREETVIEW_STATIONS.find((s) => s.id === currentStationId) || STREETVIEW_STATIONS[1];
    st.realPano = {
      piaId: panoItem.nasaId,
      sol: panoItem.dateStr || 'ARCHIVO NASA',
      localUrl: panoItem.thumbUrl,
      remoteUrl: panoItem.hiResUrl,
      jplUrl: panoItem.jplUrl,
      credit: panoItem.credit
    };

    // Activar VISTA REAL (LIFE) sin superposición y cerrar el cajón fotográfico inmediatamente
    render360Mode = 'real';
    needs360Redraw = true;
    if (svRenderModeGroup) {
      svRenderModeGroup.querySelectorAll('[data-360-mode]').forEach((b) => {
        b.classList.toggle('is-active', b.getAttribute('data-360-mode') === 'real');
      });
    }

    const newEntry = getOrComposeRealPanoramaCanvas(st);
    updateRealPhotoBadge(st, newEntry);
    closeNasaPhotoDrawer();
    if (typeof playHudTone === 'function') playHudTone(920, 0.08, 'sine');
  }

  function renderPanoramaCardsInDrawer(list) {
    if (!nasaApiResultsGrid) return;
    nasaApiResultsGrid.innerHTML = '';

    list.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'snad-card';
      const imgSrc = resolvePanoPath(item.thumbUrl);
      const fallbackSrc = item.thumbUrl?.startsWith('http')
        ? item.thumbUrl
        : `public/panoramas/${(item.thumbUrl || '').split('/').pop()}`;
      card.innerHTML = `
        <img class="snad-thumb" src="${imgSrc}" alt="${item.title.replace(/"/g, '&quot;')}" loading="lazy" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='${fallbackSrc}';}">
        <div class="snad-body">
          <div class="snad-id-row">
            <span class="snad-id">${item.nasaId}</span>
            <span class="snad-date">${item.dateStr || ''}</span>
          </div>
          <div class="snad-title">${item.title}</div>
          <button type="button" class="snad-load-btn">
            <i class="fa-solid fa-vr-cardboard"></i> CARGAR EN 360°
          </button>
        </div>
      `;

      card.addEventListener('click', () => {
        applySelectedPanoramaToViewer(item);
      });

      nasaApiResultsGrid.appendChild(card);
    });
  }

  async function fetchNasaLivePanoramas(queryText) {
    if (!nasaApiResultsGrid) return;
    const rawQuery = (queryText || '__LOCAL__').trim();

    if (rawQuery === '__LOCAL__') {
      renderPanoramaCardsInDrawer(LOCAL_CURATED_PANORAMAS);
      return;
    }

    const cleanQuery = rawQuery.toLowerCase().includes('mars')
      ? rawQuery
      : `${rawQuery} Mars`;

    nasaApiResultsGrid.innerHTML = `
      <div class="snad-loading">
        <i class="fa-solid fa-satellite-dish fa-spin"></i>
        <span>BUSCANDO EN NASA: "${cleanQuery.toUpperCase()}"...</span>
      </div>
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const endpoint = `https://images-api.nasa.gov/search?q=${encodeURIComponent(cleanQuery)}&media_type=image`;
      const res = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const items = (json?.collection?.items || []).slice(0, 12);

      if (!items.length) {
        renderPanoramaCardsInDrawer(LOCAL_CURATED_PANORAMAS);
        return;
      }

      const mapped = [];
      items.forEach((item) => {
        const meta = item.data?.[0];
        const thumbLink = item.links?.find((l) => l.render === 'image')?.href;
        if (!meta || !thumbLink) return;

        const nasaId = meta.nasa_id || 'NASA-IMG';
        const title = meta.title || 'Fotografía Planetaria NASA';
        const dateStr = (meta.date_created || '').slice(0, 10);
        // Usamos ~medium.jpg para carga ultrarrápida sin congelar el navegador
        const fastHiResUrl = thumbLink.replace('~thumb.jpg', '~medium.jpg');

        mapped.push({
          nasaId,
          title,
          dateStr,
          thumbUrl: thumbLink,
          hiResUrl: fastHiResUrl,
          jplUrl: `https://images.nasa.gov/details/${encodeURIComponent(nasaId)}`,
          credit: `NASA/JPL-Caltech — ${title}`
        });
      });

      renderPanoramaCardsInDrawer(mapped.length ? mapped : LOCAL_CURATED_PANORAMAS);
    } catch {
      clearTimeout(timeoutId);
      renderPanoramaCardsInDrawer(LOCAL_CURATED_PANORAMAS);
    }
  }

  if (btnSvNasaApi && svNasaApiDrawer) {
    btnSvNasaApi.addEventListener('click', () => {
      const isHidden = svNasaApiDrawer.classList.toggle('is-hidden');
      btnSvNasaApi.classList.toggle('is-active', !isHidden);
      if (!isHidden && nasaApiResultsGrid && nasaApiResultsGrid.children.length === 0) {
        renderPanoramaCardsInDrawer(LOCAL_CURATED_PANORAMAS);
      }
    });
  }

  // Soporte tanto para #btn-close-nasa-drawer como #btn-close-nasa-api y tecla Escape
  const btnCloseNasaApiLegacy = document.getElementById('btn-close-nasa-api');
  [btnCloseNasaDrawer, btnCloseNasaApiLegacy].forEach((btn) => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeNasaPhotoDrawer();
      });
    }
  });

  if (btnNasaApiSearch && nasaApiSearchInput) {
    btnNasaApiSearch.addEventListener('click', () => {
      fetchNasaLivePanoramas(nasaApiSearchInput.value);
    });
    nasaApiSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        fetchNasaLivePanoramas(nasaApiSearchInput.value);
      }
    });
  }

  document.querySelectorAll('.snad-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.snad-chip').forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      const q = chip.getAttribute('data-nasa-query');
      if (nasaApiSearchInput && q && q !== '__LOCAL__') {
        nasaApiSearchInput.value = q;
      }
      if (q) fetchNasaLivePanoramas(q);
    });
  });

  // Eventos de interacción de cámara 360° (Arrastrar para mirar, Rueda de ratón para Zoom y Botones)
  if (pannellumMountEl) {
    pannellumMountEl.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.hud-360-hotspot')) return;
      isDragging360 = true;
      targetYaw = null;
      targetPitch = null;
      targetFov = null;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragStartYaw = camYaw;
      dragStartPitch = camPitch;
      pannellumMountEl.setPointerCapture?.(e.pointerId);
    });

    pannellumMountEl.addEventListener('pointermove', (e) => {
      if (!isDragging360) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      const sensitivity = camFov / 480;
      camYaw = ((dragStartYaw - dx * sensitivity) % 360 + 360) % 360;
      camPitch = Math.max(-80, Math.min(80, dragStartPitch + dy * sensitivity));
      needs360Redraw = true;
    });

    const endDrag360 = () => {
      isDragging360 = false;
    };
    pannellumMountEl.addEventListener('pointerup', endDrag360);
    pannellumMountEl.addEventListener('pointercancel', endDrag360);

    pannellumMountEl.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        targetYaw = null;
        camFov = Math.max(30, Math.min(125, camFov + (e.deltaY > 0 ? 5 : -5)));
        needs360Redraw = true;
      },
      { passive: false }
    );
  }

  if (btn360ZoomIn) {
    btn360ZoomIn.addEventListener('click', () => {
      targetYaw = null;
      camFov = Math.max(30, camFov - 10);
      needs360Redraw = true;
    });
  }
  if (btn360ZoomOut) {
    btn360ZoomOut.addEventListener('click', () => {
      targetYaw = null;
      camFov = Math.min(125, camFov + 10);
      needs360Redraw = true;
    });
  }
  if (btn360Fit) {
    btn360Fit.addEventListener('click', () => {
      targetFov = 125;
      targetPitch = 0;
      needs360Redraw = true;
      if (typeof playHudTone === 'function') playHudTone(720, 0.06, 'sine');
    });
  }
  if (btn360ResetCam) {
    btn360ResetCam.addEventListener('click', () => {
      const st = STREETVIEW_STATIONS.find((s) => s.id === currentStationId) || STREETVIEW_STATIONS[1];
      animateCameraTo(st.initialYaw, st.initialPitch, 90);
    });
  }

  // Interacción táctil y de ratón con la miniatura completa del panorama 360° (#sv-overview-canvas)
  if (svOverviewCanvas) {
    const handleOverviewSeek = (e) => {
      const rect = svOverviewCanvas.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const clickY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
      const normRatioX = clickX / rect.width;
      const normRatioY = clickY / rect.height;
      camYaw = Math.round(normRatioX * 360);
      camPitch = Math.round(70 - normRatioY * 140);
      targetYaw = null;
      targetPitch = null;
      needs360Redraw = true;
    };

    let isSeekingOverview = false;
    svOverviewCanvas.addEventListener('pointerdown', (e) => {
      isSeekingOverview = true;
      svOverviewCanvas.setPointerCapture?.(e.pointerId);
      handleOverviewSeek(e);
    });
    svOverviewCanvas.addEventListener('pointermove', (e) => {
      if (isSeekingOverview) handleOverviewSeek(e);
    });
    const stopSeek = () => { isSeekingOverview = false; };
    svOverviewCanvas.addEventListener('pointerup', stopSeek);
    svOverviewCanvas.addEventListener('pointercancel', stopSeek);
  }

  // Arrancar el bucle gráfico 60FPS del visor 360°
  requestAnimationFrame(renderMars360Frame);

  // Actualiza la tarjeta holográfica de inspección científica dentro del visor 360°
  function updateInspectorCard(info) {
    if (!info) return;
    if (sviKickerEl && info.kicker) {
      sviKickerEl.innerHTML = `<i class="fa-solid fa-microscope"></i> ${info.kicker}`;
    }
    if (sviTitleEl && info.title) sviTitleEl.textContent = info.title;
    if (sviDescEl && info.desc) sviDescEl.textContent = info.desc;
    if (sviDistEl && info.dist) {
      sviDistEl.innerHTML = `<i class="fa-solid fa-ruler-horizontal text-orange"></i> ${info.dist}`;
    }
    if (sviCompEl && info.comp) {
      sviCompEl.innerHTML = `<i class="fa-solid fa-atom text-cyan"></i> ${info.comp}`;
    }
  }

  // Renderiza las píldoras de navegación Paso a Paso en la consola inferior del visor 360°
  function renderStreetViewStepPills() {
    if (!svStepsPillsEl) return;
    svStepsPillsEl.innerHTML = '';

    STREETVIEW_STATIONS.forEach((st) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `sv-step-pill ${st.id === currentStationId ? 'is-active' : ''}`;
      btn.innerHTML = `<i class="fa-solid fa-location-dot"></i> <span>${st.shortLabel}</span>`;
      btn.addEventListener('click', () => {
        loadStreetViewStation(st.id, true);
      });
      svStepsPillsEl.appendChild(btn);
    });
  }

  // Inicializa o actualiza la estación activa en el motor esférico 360°
  function loadStreetViewStation(stationId, syncWithMapAndRoute = true) {
    const station =
      STREETVIEW_STATIONS.find((s) => s.id === stationId) || STREETVIEW_STATIONS[1];
    currentStationId = station.id;

    if (svStationTitleEl) {
      svStationTitleEl.textContent = `360° MARTE // ${station.title}`;
    }

    if (Array.isArray(station.coords) && station.coords.length >= 2) {
      const [sLat, sLng] = station.coords;
      const latDir = sLat >= 0 ? 'N' : 'S';
      const lngDir = sLng >= 0 ? 'E' : 'O';
      if (headerCoords) {
        headerCoords.textContent = `${Math.abs(sLat).toFixed(2)}°${latDir} • ${Math.abs(sLng).toFixed(2)}°${lngDir}`;
      }
      if (cursorReadout && typeof station.elev === 'number') {
        const altStr = `${station.elev > 0 ? '+' : ''}${station.elev.toLocaleString('en-US')}m`;
        cursorReadout.textContent = `LAT: ${Math.abs(sLat).toFixed(4)}° ${latDir} | LON: ${Math.abs(sLng).toFixed(4)}° ${lngDir} | ALT: ${altStr}`;
      }
    }

    sync360ViewportSize();
    const realEntry = getOrComposeRealPanoramaCanvas(station);
    if (render360Mode === 'sim2d') {
      getOrGeneratePanoramaCanvas(station);
    }
    updateRealPhotoBadge(station, realEntry);
    buildStationHotspotElements(station);
    animateCameraTo(station.initialYaw, station.initialPitch, 90);
    needs360Redraw = true;

    updateInspectorCard(station.defaultInspect);
    renderStreetViewStepPills();

    // Sincronizar con la ruta activa, posición del Rover en el mapa 2D y telemetría de supervivencia
    if (syncWithMapAndRoute) {
      if (station.routeKey && station.routeKey !== currentRouteKey && currentRouteKey !== 'custom') {
        if (routeSelector) routeSelector.value = station.routeKey;
        loadRoute(station.routeKey, true);
      }
      updateRoverProgress(station.progressPct);
      marsMap.panTo(station.coords, { animate: true, duration: 0.8 });
    }
    if (typeof playHudTone === 'function') {
      playHudTone(740, 0.06, 'triangle');
    }
  }

  // ==========================================================================
  // 10. ETAPA 5: SINCRONIZACIÓN BIDIRECCIONAL (CONO DE VISIÓN 360° EN MAPA 2D)
  // ==========================================================================
  let roverVisionCone = null;
  let lastKnownYaw = 14;
  let lastKnownHfov = 90;
  let lastRenderedConeYaw = -999;
  let lastRenderedConeFov = -999;
  let isInternalStationSync = false;

  // Calcula un punto (lat, lng) proyectado desde un origen dado un rumbo (bearingDeg) y radio en km
  function projectMarsLatLng(originLat, originLng, bearingDeg, distKm) {
    const radBearing = (bearingDeg * Math.PI) / 180;
    const dLat = (distKm / 59.27) * Math.cos(radBearing);
    const cosLat = Math.max(0.2, Math.cos((originLat * Math.PI) / 180));
    const dLng = (distKm / (59.27 * cosLat)) * Math.sin(radBearing);
    return [originLat + dLat, originLng + dLng];
  }

  // Dibuja o actualiza el Cono de Visión Radar (FOV) sobre el Mapa 2D sincronizado con la cámara 360°
  function updateRoverVisionConeOnMap(yawDeg = lastKnownYaw, hfovDeg = lastKnownHfov) {
    lastKnownYaw = yawDeg;
    lastKnownHfov = hfovDeg;

    const pos = interpolateRoverPosition(activeRouteData.pathCoords, roverProgress);
    const coneRadiusKm = 6.5;
    const halfFov = Math.max(20, Math.min(65, hfovDeg / 2));

    const pts = [[pos.lat, pos.lng]];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const angle = yawDeg - halfFov + (i / steps) * (halfFov * 2);
      pts.push(projectMarsLatLng(pos.lat, pos.lng, angle, coneRadiusKm));
    }

    if (!roverVisionCone) {
      roverVisionCone = L.polygon(pts, {
        color: '#00e5ff',
        weight: 1.5,
        dashArray: '4, 4',
        fillColor: '#00e5ff',
        fillOpacity: 0.22,
        interactive: false
      }).addTo(dynamicRouteLayerGroup);
    } else {
      roverVisionCone.setLatLngs(pts);
      if (!dynamicRouteLayerGroup.hasLayer(roverVisionCone)) {
        dynamicRouteLayerGroup.addLayer(roverVisionCone);
      }
    }
  }

  // Cuando el usuario mueve el deslizador del Rover en modo Street View o Pantalla Dividida,
  // sincroniza automáticamente la escena panorámica 360° más cercana a ese porcentaje de ruta
  function syncStreetViewToRoverProgress() {
    if (isInternalStationSync || streetContainer.classList.contains('is-hidden')) return;

    let targetScene = null;
    if (currentRouteKey === 'gale-sharp') {
      targetScene = 'scene-gale';
    } else if (currentRouteKey === 'valles-marineris') {
      targetScene = 'scene-valles';
    } else {
      if (roverProgress <= 18) targetScene = 'scene-landing';
      else if (roverProgress <= 50) targetScene = 'scene-kodiak';
      else if (roverProgress <= 84) targetScene = 'scene-ice';
      else targetScene = 'scene-base';
    }

    if (targetScene && targetScene !== currentStationId) {
      isInternalStationSync = true;
      loadStreetViewStation(targetScene, false);
      isInternalStationSync = false;
    }
  }

  // Bucle de telemetría de orientación 360° (Brújula, Pitch, FOV y Cono de Visión en Mapa 2D sin sobrecargar el DOM)
  setInterval(() => {
    if (streetContainer.classList.contains('is-hidden')) return;
    const normYaw = Math.round(((camYaw % 360) + 360) % 360);
    const fov = Math.round(camFov);

    if (Math.abs(normYaw - lastRenderedConeYaw) >= 2 || Math.abs(fov - lastRenderedConeFov) >= 2) {
      lastRenderedConeYaw = normYaw;
      lastRenderedConeFov = fov;
      const pitch = camPitch.toFixed(1);
      const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
      const dirLabel = dirs[Math.round(normYaw / 45) % 8];

      if (svCompassHeadingEl) {
        svCompassHeadingEl.textContent = `AZIMUT: ${String(normYaw).padStart(3, '0')}° ${dirLabel}`;
      }
      const activeStation = STREETVIEW_STATIONS.find((s) => s.id === currentStationId);
      if (svCameraAnglesEl && activeStation) {
        svCameraAnglesEl.textContent = `PITCH: ${pitch}° | FOV: ${fov}° | SENSOR: ${activeStation.sensor}`;
      }

      if (!isDragging360) {
        updateRoverVisionConeOnMap(normYaw, fov);
      }
    }
  }, 200);

  // Botones de Navegación Paso a Paso (Anterior / Siguiente)
  if (btnSvPrev) {
    btnSvPrev.addEventListener('click', () => {
      const idx = STREETVIEW_STATIONS.findIndex((s) => s.id === currentStationId);
      const prevIdx = (idx - 1 + STREETVIEW_STATIONS.length) % STREETVIEW_STATIONS.length;
      loadStreetViewStation(STREETVIEW_STATIONS[prevIdx].id, true);
    });
  }

  if (btnSvNext) {
    btnSvNext.addEventListener('click', () => {
      const idx = STREETVIEW_STATIONS.findIndex((s) => s.id === currentStationId);
      const nextIdx = (idx + 1) % STREETVIEW_STATIONS.length;
      loadStreetViewStation(STREETVIEW_STATIONS[nextIdx].id, true);
    });
  }

  // Botón de giro orbital automático 360°
  if (btnSvAutoRotate) {
    btnSvAutoRotate.addEventListener('click', () => {
      isAutoRotating = !isAutoRotating;
      btnSvAutoRotate.classList.toggle('is-active', isAutoRotating);
    });
  }

  // CERRAR COMPLETAMENTE, minimizar o reabrir la ventana emergente de inspección científica en 360°
  if (btnCloseInspector && svInspectorCard) {
    btnCloseInspector.addEventListener('click', () => {
      svInspectorCard.classList.add('is-closed');
      if (btnReopenInspector) btnReopenInspector.classList.remove('is-active');
      if (typeof playHudTone === 'function') playHudTone(520, 0.05, 'sine');
    });
  }

  if (btnMinimizeInspector && svInspectorCard) {
    btnMinimizeInspector.addEventListener('click', () => {
      svInspectorCard.classList.toggle('is-minimized');
    });
  }

  if (btnReopenInspector && svInspectorCard) {
    btnReopenInspector.addEventListener('click', () => {
      const willOpen = svInspectorCard.classList.contains('is-closed');
      svInspectorCard.classList.toggle('is-closed', !willOpen);
      if (willOpen) svInspectorCard.classList.remove('is-minimized');
      btnReopenInspector.classList.toggle('is-active', willOpen);
    });
  }

  // Cerrar el archivo fotográfico de la NASA o la ventana de inspección con la tecla Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (svNasaApiDrawer && !svNasaApiDrawer.classList.contains('is-hidden')) {
        closeNasaPhotoDrawer();
        return;
      }
      if (svInspectorCard && !svInspectorCard.classList.contains('is-closed') && !dossierDialog?.open) {
        svInspectorCard.classList.add('is-closed');
      }
    }
  });

  // ==========================================================================
  // 10B. CONTROL DE SIDEBARS DESPLEGABLES (TOGGLE DRAWERS) Y MODO INMERSIVO
  // ==========================================================================
  const sidebarLeftEl = document.getElementById('sidebar-left');
  const sidebarRightEl = document.getElementById('sidebar-right');
  const hudFooterEl = document.getElementById('hud-footer');

  const btnToggleLeft = document.getElementById('btn-toggle-left-panel');
  const btnToggleRight = document.getElementById('btn-toggle-right-panel');
  const btnToggleBottom = document.getElementById('btn-toggle-bottom-panel');
  const btnZenMode = document.getElementById('btn-zen-mode');

  const btnCloseLeftSidebar = document.getElementById('btn-close-left-sidebar');
  const btnCloseRightSidebar = document.getElementById('btn-close-right-sidebar');
  const btnCloseBottomHud = document.getElementById('btn-close-bottom-hud');

  const btnEdgeLeft = document.getElementById('btn-edge-left');
  const btnEdgeRight = document.getElementById('btn-edge-right');
  const btnEdgeBottom = document.getElementById('btn-edge-bottom');

  function syncZenButtonState() {
    if (!btnZenMode) return;
    const allHidden =
      sidebarLeftEl?.classList.contains('is-collapsed') &&
      sidebarRightEl?.classList.contains('is-collapsed') &&
      hudFooterEl?.classList.contains('is-collapsed');
    btnZenMode.classList.toggle('is-active', Boolean(allHidden));
  }

  function setPanelOpen(which, shouldOpen) {
    const map = {
      left: { panel: sidebarLeftEl, btn: btnToggleLeft },
      right: { panel: sidebarRightEl, btn: btnToggleRight },
      bottom: { panel: hudFooterEl, btn: btnToggleBottom }
    };
    const item = map[which];
    if (!item || !item.panel) return;

    const openState =
      typeof shouldOpen === 'boolean' ? shouldOpen : item.panel.classList.contains('is-collapsed');

    item.panel.classList.toggle('is-collapsed', !openState);
    if (item.btn) {
      item.btn.classList.toggle('is-active', openState);
      item.btn.setAttribute('aria-expanded', String(openState));
    }

    syncZenButtonState();
    requestAnimationFrame(() => {
      marsMap.invalidateSize({ pan: false });
    });
    setTimeout(() => {
      marsMap.invalidateSize({ pan: false });
    }, 180);
  }

  if (typeof ResizeObserver !== 'undefined' && mapContainer) {
    const mapRo = new ResizeObserver(() => {
      marsMap.invalidateSize({ pan: false });
    });
    mapRo.observe(mapContainer);
  }

  if (btnToggleLeft) btnToggleLeft.addEventListener('click', () => setPanelOpen('left'));
  if (btnCloseLeftSidebar) btnCloseLeftSidebar.addEventListener('click', () => setPanelOpen('left', false));
  if (btnEdgeLeft) btnEdgeLeft.addEventListener('click', () => setPanelOpen('left', true));

  if (btnToggleRight) btnToggleRight.addEventListener('click', () => setPanelOpen('right'));
  if (btnCloseRightSidebar) btnCloseRightSidebar.addEventListener('click', () => setPanelOpen('right', false));
  if (btnEdgeRight) btnEdgeRight.addEventListener('click', () => setPanelOpen('right', true));

  if (btnToggleBottom) btnToggleBottom.addEventListener('click', () => setPanelOpen('bottom'));
  if (btnCloseBottomHud) btnCloseBottomHud.addEventListener('click', () => setPanelOpen('bottom', false));
  if (btnEdgeBottom) btnEdgeBottom.addEventListener('click', () => setPanelOpen('bottom', true));

  if (btnZenMode) {
    btnZenMode.addEventListener('click', () => {
      const anyOpen =
        !sidebarLeftEl?.classList.contains('is-collapsed') ||
        !sidebarRightEl?.classList.contains('is-collapsed') ||
        !hudFooterEl?.classList.contains('is-collapsed');

      if (anyOpen) {
        setPanelOpen('left', false);
        setPanelOpen('right', false);
        setPanelOpen('bottom', false);
      } else {
        setPanelOpen('left', true);
        setPanelOpen('right', true);
        setPanelOpen('bottom', true);
      }
      if (typeof playHudTone === 'function') playHudTone(680, 0.07, 'triangle');
    });
  }

  // Iniciar con el HUD inferior oculto en pantallas compactas para dar máxima amplitud al mapa
  if (window.innerHeight < 860) {
    setPanelOpen('bottom', false);
  }

  // ==========================================================================
  // 11. CONMUTACIÓN DE VISTAS (MAPA 2D / STREET VIEW 360° / PANTALLA DIVIDIDA)
  // ==========================================================================
  function setViewportMode(mode, targetStationId = null) {
    viewportStage.setAttribute('data-view-mode', mode);

    if (mode === 'streetview') {
      mapContainer.classList.add('is-hidden');
      streetContainer.classList.remove('is-hidden');
      btnToggleStreet.classList.add('is-active');
      btnToggleStreet.setAttribute('aria-pressed', 'true');
      btnSplitView.classList.remove('is-active');
      streetBtnLabel.textContent = 'MAPA 2D';
      setPanelOpen('left', false);
      setPanelOpen('right', false);
      setPanelOpen('bottom', false);
    } else if (mode === 'split') {
      mapContainer.classList.remove('is-hidden');
      streetContainer.classList.remove('is-hidden');
      btnToggleStreet.classList.add('is-active');
      btnSplitView.classList.add('is-active');
      streetBtnLabel.textContent = '360° ACTIVO';
      setPanelOpen('left', false);
      setPanelOpen('right', false);
      setPanelOpen('bottom', false);
    } else {
      mapContainer.classList.remove('is-hidden');
      streetContainer.classList.add('is-hidden');
      btnToggleStreet.classList.remove('is-active');
      btnToggleStreet.setAttribute('aria-pressed', 'false');
      btnSplitView.classList.remove('is-active');
      streetBtnLabel.textContent = 'VISTA 360°';
    }

    if (mode === 'streetview' || mode === 'split') {
      loadStreetViewStation(targetStationId || currentStationId, false);
    }

    setTimeout(() => {
      marsMap.invalidateSize();
    }, 220);
  }

  if (btnToggleStreet) {
    btnToggleStreet.addEventListener('click', () => {
      const currentMode = viewportStage.getAttribute('data-view-mode');
      setViewportMode(currentMode === 'streetview' ? 'map' : 'streetview');
    });
  }

  if (btnSplitView) {
    btnSplitView.addEventListener('click', () => {
      const currentMode = viewportStage.getAttribute('data-view-mode');
      setViewportMode(currentMode === 'split' ? 'map' : 'split');
    });
  }

  if (btnCloseStreet) btnCloseStreet.addEventListener('click', () => setViewportMode('map'));
  if (btnQuick360) {
    btnQuick360.addEventListener('click', () => {
      const currentMode = viewportStage.getAttribute('data-view-mode');
      setViewportMode(currentMode === 'streetview' ? 'map' : 'streetview');
      if (typeof playHudTone === 'function') playHudTone(680, 0.06, 'triangle');
    });
  }

  // ==========================================================================
  // 12. CLIMA DINÁMICO POR REGIÓN PLANETARIA (ETAPA 5)
  // ==========================================================================
  const REGIONAL_WEATHER_DATA = {
    'jezero-alpha': {
      kicker: 'ESTACIÓN MEDA // REPORTE METEOROLÓGICO',
      title: 'WEATHER AT JEZERO CRATER',
      sol: 'SOL 1420',
      temp: '-62°C',
      max: '-18°C',
      min: '-84°C',
      wind: '24.5 <small>km/h</small>',
      windDir: 'Dirección: ENE (68°)',
      press: '718 <small>Pa</small>',
      pressSub: '95.3% CO₂ Nominal',
      tau: '&tau; 0.74',
      uv: '0.24 <small>mSv/h</small>',
      alertTitle: 'ALERTA DE TORMENTA DE POLVO',
      alertDesc:
        'Frente regional detectado a 42 km al SO de Jezero. Reducción de visibilidad y caída de recarga solar (-18%) prevista en 3 horas.'
    },
    'jezero-beta': {
      kicker: 'ESTACIÓN MEDA-NORTE // REPORTE METEOROLÓGICO',
      title: 'WEATHER AT JEZERO (BELVA RIM)',
      sol: 'SOL 1420',
      temp: '-65°C',
      max: '-21°C',
      min: '-86°C',
      wind: '29.2 <small>km/h</small>',
      windDir: 'Dirección: NE (45°)',
      press: '704 <small>Pa</small>',
      pressSub: 'Meseta Deltaica Superior',
      tau: '&tau; 0.81',
      uv: '0.26 <small>mSv/h</small>',
      alertTitle: 'RÁFAGAS TURBULENTAS EN CRÁTER BELVA',
      alertDesc:
        'Remolinos convectivos (Dust Devils) activos sobre el borde del cráter de impacto Belva. Mantener anclaje de tracción.'
    },
    'gale-sharp': {
      kicker: 'ESTACIÓN REMS (MSL) // REPORTE METEOROLÓGICO',
      title: 'WEATHER AT GALE CRATER',
      sol: 'SOL 4412',
      temp: '-54°C',
      max: '-9°C',
      min: '-79°C',
      wind: '18.4 <small>km/h</small>',
      windDir: 'Dirección: NNO (338°)',
      press: '845 <small>Pa</small>',
      pressSub: 'Cuenca profunda (-4.5 km)',
      tau: '&tau; 0.58',
      uv: '0.21 <small>mSv/h</small>',
      alertTitle: 'VIENTO DE LADERA EN AEOLIS MONS',
      alertDesc:
        'Corrientes térmicas descendentes desde la cumbre del Monte Sharp. Visibilidad orbital clara para ascenso EVA.'
    },
    'valles-marineris': {
      kicker: 'SONDA MRO-MCS // REPORTE METEOROLÓGICO',
      title: 'WEATHER AT VALLES MARINERIS',
      sol: 'SOL 1420',
      temp: '-48°C',
      max: '-4°C',
      min: '-74°C',
      wind: '64.8 <small>km/h</small>',
      windDir: 'Cañón Axial: E (92°)',
      press: '890 <small>Pa</small>',
      pressSub: 'Alta densidad en abismo',
      tau: '&tau; 1.32',
      uv: '0.19 <small>mSv/h</small>',
      alertTitle: '⚠ ALERTA SEVERA: VIENTO CATABÁTICO DE CAÑÓN',
      alertDesc:
        'Ráfagas canalizadas de 64.8 km/h en el fondo de Coprates Chasma. Niebla matutina de H₂O y polvo en suspensión denso.'
    }
  };

  function updateRegionalWeatherPanel(routeKey) {
    const w = REGIONAL_WEATHER_DATA[routeKey] || REGIONAL_WEATHER_DATA['jezero-alpha'];
    const setHtml = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = val;
    };
    setHtml('wc-kicker', w.kicker);
    setHtml('wc-title', w.title);
    setHtml('wc-sol', w.sol);
    setHtml('wc-temp-val', w.temp);
    setHtml('wc-temp-max', w.max);
    setHtml('wc-temp-min', w.min);
    setHtml('wc-wind-val', w.wind);
    setHtml('wc-wind-dir', w.windDir);
    setHtml('wc-press-val', w.press);
    setHtml('wc-press-sub', w.pressSub);
    setHtml('wc-tau-val', w.tau);
    setHtml('wc-uv-val', w.uv);
    setHtml('wc-alert-title', w.alertTitle);
    setHtml('wc-alert-desc', w.alertDesc);
  }

  // ==========================================================================
  // 13. DOSSIER DE MISIONES DE LA NASA (<dialog closedby="any">) Y EXPORTACIÓN EVA
  // ==========================================================================
  const NASA_MISSIONS_DOSSIER = [
    {
      id: 'perseverance-m2020',
      shortName: 'Perseverance (Mars 2020)',
      subLabel: 'Cráter Jezero • Activo',
      icon: 'fa-truck-monster',
      agency: 'NASA / JPL-CALTECH // MARS 2020 PROGRAM',
      name: 'Rover Perseverance (Misión Mars 2020)',
      status: 'OPERATIVO EN SUPERFICIE (SOL 1420)',
      coords: [18.4447, 77.4508],
      routeKey: 'jezero-alpha',
      stationId: 'scene-kodiak',
      summary:
        'Laboratorio astrobiológico propulsado por generador termoeléctrico de radioisótopos (MMRTG) de 1,025 kg. Aterrizó el 18 de febrero de 2021 en Octavia E. Butler Landing con la misión de recolectar núcleos de roca del antiguo delta lacustre y validar tecnologías críticas para la exploración humana.',
      specs: [
        { label: 'SITIO DE DESCENSO', val: '18.4447°N, 77.4508°E' },
        { label: 'ALTITUD MOLA', val: '-2,564 metros' },
        { label: 'FUENTE DE ENERGÍA', val: 'MMRTG Pu-238 (110W)' },
        { label: 'PRODUCCIÓN O₂ (MOXIE)', val: '122g O₂ (Pureza 98%)' },
        { label: 'MUESTRAS SELLADAS', val: '24 Tubos de Titanio' },
        { label: 'VELOCIDAD AUTÓNOMA', val: 'AutoNav 120 m/hora' }
      ],
      instruments: [
        '<strong>MOXIE (ISRU Oxígeno):</strong> Demostró la conversión electroquímica de CO₂ atmosférico marciano en oxígeno respirable para futuros astronautas.',
        '<strong>RIMFAX (Radar Subsuperficial):</strong> Cartografió estratos enterrados y lentes de hielo de agua hasta 20 metros bajo las ruedas del rover.',
        '<strong>MEDA (Estación Ambiental):</strong> Provee la telemetría en vivo de viento, presión, humedad, polvo y radiación UV mostrada en este HUD.',
        '<strong>PIXL & SHERLOC:</strong> Espectrómetros de fluorescencia de rayos X y Raman UV para detectar minerales hidratados y compuestos orgánicos.'
      ]
    },
    {
      id: 'ingenuity-field',
      shortName: 'Helicóptero Ingenuity',
      subLabel: '72 Vuelos Completados',
      icon: 'fa-helicopter',
      agency: 'NASA / JPL / AEROVIRONMENT // DEMOSTRADOR TECNOLÓGICO',
      name: 'Helicóptero Marciano Ingenuity (Ginnie)',
      status: 'MISIÓN HISTÓRICA COMPLETADA (72 VUELOS)',
      coords: [18.4486, 77.4509],
      routeKey: 'jezero-alpha',
      stationId: 'scene-landing',
      summary:
        'Primera aeronave motorizada en lograr vuelo controlado en otro planeta (19 de abril de 2021). Diseñado originalmente para solo 5 vuelos de prueba, superó todas las expectativas realizando 72 vuelos como explorador aéreo adelantado para Perseverance en una atmósfera con apenas el 1% de la densidad terrestre.',
      specs: [
        { label: 'AERÓDROMO BASE', val: 'Wright Brothers Field' },
        { label: 'VUELOS TOTALES', val: '72 Vuelos Exitosos' },
        { label: 'DISTANCIA VOLADA', val: '17.0 kilómetros' },
        { label: 'ALTITUD MÁXIMA', val: '24.0 metros AGL' },
        { label: 'VELOCIDAD DE CRUCERO', val: '10.0 m/s (36 km/h)' },
        { label: 'ROTOR COAXIAL', val: '2,537 RPM Fibra Carbono' }
      ],
      instruments: [
        '<strong>Cámara RTE en Color (13 MP):</strong> Reconocimiento aéreo de escarpes, campos de dunas (Séítah) y rutas seguras para el rover y futuros exploradores.',
        '<strong>Cámara Navcam Blanco y Negro:</strong> Seguimiento óptico del terreno a 30 cuadros por segundo para navegación autónoma.',
        '<strong>Altímetro Láser Garmin:</strong> Medición continua de distancia al suelo sobre relieve rocoso irregular.'
      ]
    },
    {
      id: 'global-curiosity',
      shortName: 'Curiosity (MSL)',
      subLabel: 'Cráter Gale • Monte Sharp',
      icon: 'fa-robot',
      agency: 'NASA / JPL-CALTECH // MARS SCIENCE LABORATORY',
      name: 'Rover Curiosity (MSL) — Cráter Gale',
      status: 'OPERATIVO EN SUPERFICIE (SOL 4412+)',
      coords: [-4.5895, 137.4417],
      routeKey: 'gale-sharp',
      stationId: 'scene-gale',
      summary:
        'En la superficie marciana desde el 6 de agosto de 2012. Curiosity ha ascendido más de 800 metros verticales por las faldas del Monte Sharp (Aeolis Mons), confirmando que el antiguo lago del Cráter Gale poseía agua líquida con pH neutro y todos los ingredientes químicos necesarios para la vida (C, H, N, O, P, S).',
      specs: [
        { label: 'SITIO DE DESCENSO', val: 'Bradbury Landing (-4.58°S)' },
        { label: 'ALTITUD BASE', val: '-4,501 metros (MOLA)' },
        { label: 'ODOMETRÍA ACUMULADA', val: '+32.4 kilómetros' },
        { label: 'DOSIS RADIACIÓN (RAD)', val: '0.64 mSv/día en superficie' },
        { label: 'PERFORACIONES', val: '42 Muestras Analizadas' },
        { label: 'ENERGÍA', val: 'MMRTG Nuclear' }
      ],
      instruments: [
        '<strong>RAD (Radiation Assessment Detector):</strong> Instrumento clave que midió por primera vez la radiación cósmica galáctica y solar en la superficie para diseñar el blindaje de hábitats humanos.',
        '<strong>SAM (Sample Analysis at Mars):</strong> Laboratorio químico que detectó moléculas orgánicas complejas y variaciones estacionales de metano.',
        '<strong>ChemCam (LIBS):</strong> Láser de ablación capaz de vaporizar rocas a 7 metros para identificar su composición elemental.'
      ]
    },
    {
      id: 'global-insight',
      shortName: 'Sonda InSight',
      subLabel: 'Elysium Planitia • Geofísica',
      icon: 'fa-wave-square',
      agency: 'NASA DISCOVERY PROGRAM // CNES / DLR',
      name: 'Lander Geofísico InSight — Elysium Planitia',
      status: 'ARCHIVO SÍSMICO COMPLETADO (2018-2022)',
      coords: [4.5024, 135.6234],
      routeKey: null,
      stationId: null,
      summary:
        'Primera misión dedicada a investigar el interior profundo de Marte. Reveló el grosor de la corteza marciana (24 a 72 km), el tamaño de su núcleo de hierro-níquel líquido (radio de ~1,830 km) y la tasa de impactos meteóricos actuales, datos esenciales para la ingeniería estructural de bases permanentes.',
      specs: [
        { label: 'COORDENADAS', val: '4.5024°N, 135.6234°E' },
        { label: 'ALTITUD MOLA', val: '-2,613 metros' },
        { label: 'MARTEMOTOS DETECTADOS', val: '1,319 Eventos Sísmicos' },
        { label: 'SISMO MÁS FUERTE', val: 'Magnitud 4.7 (Sol 1222)' },
        { label: 'FLUJO TÉRMICO', val: 'Sonda HP³ (40 cm prof.)' },
        { label: 'ENERGÍA', val: 'Paneles Solares UltraFlex' }
      ],
      instruments: [
        '<strong>SEIS (Sismómetro de Banda Ancha):</strong> Determinó las zonas de actividad tectónica (Cerberus Fossae) para evitar construir campamentos humanos sobre fallas activas.',
        '<strong>TWINS (Sensores Meteorológicos):</strong> Monitoreo continuo de remolinos de polvo e infrasonido atmosférico.'
      ]
    },
    {
      id: 'global-viking1',
      shortName: 'Viking 1 Lander',
      subLabel: 'Chryse Planitia • 1976',
      icon: 'fa-flag-usa',
      agency: 'NASA LANGLEY / JPL // VIKING PROGRAM',
      name: 'Sonda Histórica Viking 1 — Chryse Planitia',
      status: 'PATRIMONIO HISTÓRICO PLANETARIO (1976-1982)',
      coords: [22.48, -47.95],
      routeKey: null,
      stationId: null,
      summary:
        'Aterrizó el 20 de julio de 1976, transmitiendo las primeras fotografías panorámicas nítidas desde la superficie de Marte y operando durante 2,245 soles (más de 6 años terrestres). Sus análisis del regolito establecieron la presencia de percloratos y óxidos de hierro que hoy guían los protocolos de descontaminación EVA.',
      specs: [
        { label: 'COORDENADAS', val: '22.4800°N, 47.9500°O' },
        { label: 'ALTITUD MOLA', val: '-3,627 metros' },
        { label: 'DURACIÓN OPERATIVA', val: '2,245 Soles Marcianos' },
        { label: 'MASA EN SUPERFICIE', val: '572 kilogramos' },
        { label: 'ENERGÍA', val: '2x RTG SNAP-19' },
        { label: 'ESTACIÓN DESIGNADA', val: 'Thomas Mutch Memorial' }
      ],
      instruments: [
        '<strong>GCMS (Cromatógrafo de Gases / Espectrómetro de Masas):</strong> Caracterizó la composición química del suelo superficial y la atmósfera de CO₂ (95.3%).',
        '<strong>Brazo Robótico Colector:</strong> Excavó las primeras trincheras de regolito marciano para ensayos biológicos.'
      ]
    },
    {
      id: 'global-olympus',
      shortName: 'MRO HiRISE & MGS MOLA',
      subLabel: 'Red Orbital Cartográfica',
      icon: 'fa-satellite',
      agency: 'NASA / JPL / USGS ASTROGEOLOGY // RED ORBITAL',
      name: 'Constelación Orbital: MRO (HiRISE/CRISM) & MGS (MOLA)',
      status: 'ENLACE ORBITAL ACTIVO (250-400 KM)',
      coords: [18.65, -133.8],
      routeKey: 'valles-marineris',
      stationId: 'scene-valles',
      summary:
        'Los datos topográficos, geológicos y de hielo de agua que alimentan las 5 capas de esta aplicación provienen del Altímetro Láser MOLA (Mars Global Surveyor) y de los sensores HiRISE (25 cm/píxel), CTX y radar SHARAD a bordo del Mars Reconnaissance Orbiter (MRO), incluyendo el mapeo de Olympus Mons (+21,229m) y Valles Marineris.',
      specs: [
        { label: 'RESOLUCIÓN HIRISE', val: '0.25 metros / píxel' },
        { label: 'PRECISIÓN VERTICAL MOLA', val: '±1.0 metro absoluto' },
        { label: 'RADAR SHARAD (HIELO)', val: 'Penetración hasta 1 km' },
        { label: 'CUMBRE OLYMPUS MONS', val: '+21,229 metros' },
        { label: 'ABISMO VALLES MARINERIS', val: '-4,120 a -7,000 metros' },
        { label: 'RELÉ TELEMETRÍA UHF', val: 'Electra Transceiver' }
      ],
      instruments: [
        '<strong>MOLA (Mars Orbiter Laser Altimeter):</strong> Base del modelo digital de elevación global utilizado en este planificador para calcular pendientes y esfuerzo metabólico.',
        '<strong>CRISM & THEMIS:</strong> Espectrómetros orbitales que identifican arcillas hidratadas, carbonatos y reservas de hielo subsuperficial (ISRU).'
      ]
    }
  ];

  const dossierDialog = document.getElementById('mission-dossier-dialog');
  const btnOpenDossier = document.getElementById('btn-open-dossier');
  const btnCloseDossier = document.getElementById('btn-close-dossier');
  const btnExportEva = document.getElementById('btn-export-eva');
  const dossierMissionListEl = document.getElementById('dossier-mission-list');
  const ddpAgencyEl = document.getElementById('ddp-agency');
  const ddpNameEl = document.getElementById('ddp-name');
  const ddpStatusEl = document.getElementById('ddp-status');
  const ddpSummaryEl = document.getElementById('ddp-summary');
  const ddpSpecsGridEl = document.getElementById('ddp-specs-grid');
  const ddpInstrumentsListEl = document.getElementById('ddp-instruments-list');
  const btnDossierFlyTo = document.getElementById('btn-dossier-flyto');
  const btnDossierOpen360 = document.getElementById('btn-dossier-open360');
  const evaJsonPreviewEl = document.getElementById('eva-json-preview');
  const btnDownloadJson = document.getElementById('btn-download-json');
  const btnCopyManifest = document.getElementById('btn-copy-manifest');
  const copyManifestLabel = document.getElementById('copy-manifest-label');

  let currentDossierMissionId = 'perseverance-m2020';

  // Fallback obligatorio (Modern Web Guidance) para navegadores sin soporte nativo de <dialog closedby="any">
  if (dossierDialog && !('closedBy' in HTMLDialogElement.prototype)) {
    dossierDialog.addEventListener('click', (event) => {
      if (event.target !== dossierDialog) return;
      const rect = dossierDialog.getBoundingClientRect();
      const isDialogContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (isDialogContent) return;
      dossierDialog.close();
    });
  }

  // Genera el objeto JSON con toda la telemetría de supervivencia y ruta actual
  function buildCurrentEvaManifestObject() {
    const pos = interpolateRoverPosition(activeRouteData.pathCoords, roverProgress);
    return {
      missionProgram: 'NASA Space Apps Challenge 2026 — M.A.R.T.E',
      timestampMTC: document.getElementById('hud-header-clock')?.textContent || 'SOL 1420 MTC',
      activeRoute: {
        code: activeRouteData.code,
        title: activeRouteData.title,
        difficulty: activeRouteData.difficulty,
        maxSlopeDeg: activeRouteData.maxSlopeDeg,
        totalDistanceKm: Number(activeRouteData.totalDistKm.toFixed(2))
      },
      roverLiveTelemetry: {
        progressPercent: roverProgress,
        currentCoordinates: {
          lat: Number(pos.lat.toFixed(4)),
          lon: Number(pos.lng.toFixed(4)),
          elevationMolaMeters: pos.elev
        },
        oxygenConsumedPercent: Number(metricOxygen?.textContent || 22),
        batteryRemainingPercent: Number(metricBattery?.textContent || 92),
        estimatedTotalTimeHrs: metricTime?.textContent || '04:45'
      },
      waypoints: activeRouteData.waypoints.map((wp, idx) => ({
        order: idx + 1,
        name: wp.name,
        distanceKm: Number(wp.km.toFixed(1)),
        elevationMeters: wp.elev,
        coords: wp.coords
      }))
    };
  }

  function refreshEvaManifestPreview() {
    if (!evaJsonPreviewEl) return;
    evaJsonPreviewEl.textContent = JSON.stringify(buildCurrentEvaManifestObject(), null, 2);
  }

  function renderDossierMission(missionId) {
    const m =
      NASA_MISSIONS_DOSSIER.find((item) => item.id === missionId) || NASA_MISSIONS_DOSSIER[0];
    currentDossierMissionId = m.id;

    if (dossierMissionListEl) {
      dossierMissionListEl.innerHTML = '';
      NASA_MISSIONS_DOSSIER.forEach((item) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `dossier-mission-btn ${item.id === m.id ? 'is-active' : ''}`;
        btn.innerHTML = `
          <div class="dmb-icon"><i class="fa-solid ${item.icon}"></i></div>
          <div class="dmb-text">
            <strong>${item.shortName}</strong>
            <span>${item.subLabel}</span>
          </div>
        `;
        btn.addEventListener('click', () => {
          renderDossierMission(item.id);
          playHudTone(660, 0.05, 'sine');
        });
        dossierMissionListEl.appendChild(btn);
      });
    }

    if (ddpAgencyEl) ddpAgencyEl.textContent = m.agency;
    if (ddpNameEl) ddpNameEl.textContent = m.name;
    if (ddpStatusEl) ddpStatusEl.textContent = m.status;
    if (ddpSummaryEl) ddpSummaryEl.textContent = m.summary;

    if (ddpSpecsGridEl) {
      ddpSpecsGridEl.innerHTML = m.specs
        .map(
          (sp) => `
          <div class="ddp-spec-box">
            <span>${sp.label}</span>
            <strong>${sp.val}</strong>
          </div>
        `
        )
        .join('');
    }

    if (ddpInstrumentsListEl) {
      ddpInstrumentsListEl.innerHTML = m.instruments.map((inst) => `<li>${inst}</li>`).join('');
    }

    refreshEvaManifestPreview();
  }

  function openDossierModal(targetMissionId = null) {
    if (!dossierDialog) return;
    renderDossierMission(targetMissionId || currentDossierMissionId);
    if (!dossierDialog.open) {
      dossierDialog.showModal();
    }
    playHudTone(820, 0.08, 'triangle');
  }

  if (btnOpenDossier) {
    btnOpenDossier.addEventListener('click', () => openDossierModal());
  }
  if (btnExportEva) {
    btnExportEva.addEventListener('click', () => openDossierModal());
  }
  if (btnCloseDossier && dossierDialog) {
    btnCloseDossier.addEventListener('click', () => dossierDialog.close());
  }

  // Acciones de sincronización directa dentro del Dossier ("LOCALIZAR EN MAPA" / "ABRIR 360°")
  if (btnDossierFlyTo) {
    btnDossierFlyTo.addEventListener('click', () => {
      const m = NASA_MISSIONS_DOSSIER.find((item) => item.id === currentDossierMissionId);
      if (!m) return;
      if (dossierDialog?.open) dossierDialog.close();
      setViewportMode('map');
      if (m.routeKey && m.routeKey !== currentRouteKey) {
        if (routeSelector) routeSelector.value = m.routeKey;
        loadRoute(m.routeKey, false);
      }
      marsMap.flyTo(m.coords, 6, { duration: 1.2 });
    });
  }

  if (btnDossierOpen360) {
    btnDossierOpen360.addEventListener('click', () => {
      const m = NASA_MISSIONS_DOSSIER.find((item) => item.id === currentDossierMissionId);
      if (!m) return;
      if (dossierDialog?.open) dossierDialog.close();
      const targetScene = m.stationId || currentStationId;
      setViewportMode('split', targetScene);
      loadStreetViewStation(targetScene, true);
    });
  }

  // Descargar el Manifiesto EVA como archivo .json real
  if (btnDownloadJson) {
    btnDownloadJson.addEventListener('click', () => {
      const manifest = buildCurrentEvaManifestObject();
      const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MARTE-PLAN-EVA-${activeRouteData.code}-SOL1420.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      playHudTone(960, 0.1, 'sine');
    });
  }

  // Copiar telemetría EVA al portapapeles
  if (btnCopyManifest) {
    btnCopyManifest.addEventListener('click', async () => {
      const text = JSON.stringify(buildCurrentEvaManifestObject(), null, 2);
      try {
        await navigator.clipboard.writeText(text);
        if (copyManifestLabel) {
          copyManifestLabel.textContent = '¡TELEMETRÍA COPIADA AL PORTAPAPELES!';
          setTimeout(() => {
            copyManifestLabel.textContent = 'COPIAR TELEMETRÍA AL PORTAPAPELES';
          }, 2200);
        }
        playHudTone(880, 0.08, 'sine');
      } catch {
        // Ignorar si el navegador restringe el portapapeles
      }
    });
  }

  // Delegación global de clics en popups del mapa ("EXPLORAR EN 360°" y "VER EXPEDIENTE TÉCNICO NASA")
  document.body.addEventListener('click', (e) => {
    const btn360 = e.target.closest('[data-open-360]');
    if (btn360) {
      const targetCode = btn360.getAttribute('data-open-360');
      const wpToStationMap = {
        'wp-0': 'scene-landing',
        'wp-1': 'scene-kodiak',
        'wp-2': 'scene-ice',
        'wp-3': 'scene-base',
        'rover-live': currentStationId
      };
      const chosenScene = wpToStationMap[targetCode] || currentStationId;
      setViewportMode('split', chosenScene);
      return;
    }

    const btnDossier = e.target.closest('[data-open-dossier]');
    if (btnDossier) {
      const dossierId = btnDossier.getAttribute('data-open-dossier');
      openDossierModal(dossierId);
    }
  });

  // ==========================================================================
  // 14. RELOJ MARCIANO MTC EN TIEMPO REAL Y SINTETIZADOR DE AUDIO SCI-FI HUD
  // ==========================================================================
  const hudClockEl = document.getElementById('hud-header-clock');
  let mtcTotalSeconds = 14 * 3600 + 32 * 60 + 8;

  const updateHudClock = () => {
    const hrs = String(Math.floor(mtcTotalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((mtcTotalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(mtcTotalSeconds % 60).padStart(2, '0');
    if (hudClockEl) {
      hudClockEl.innerHTML = `SOL 1420 &bull; ${hrs}:${mins}:${secs} MTC`;
    }
  };
  updateHudClock();

  setInterval(() => {
    mtcTotalSeconds = (mtcTotalSeconds + 1) % 86400;
    updateHudClock();
  }, 1027); // 1 segundo marciano equivale a ~1.02749 segundos terrestres

  let hudAudioEnabled = true;
  let audioCtx = null;
  const btnHudAudio = document.getElementById('btn-hud-audio');
  const hudAudioIcon = document.getElementById('hud-audio-icon');

  function playHudTone(freq = 640, duration = 0.06, type = 'sine') {
    if (!hudAudioEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtx) audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.035, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Ignorar si el navegador aún no ha registrado interacción de usuario
    }
  }

  if (btnHudAudio) {
    btnHudAudio.addEventListener('click', () => {
      hudAudioEnabled = !hudAudioEnabled;
      btnHudAudio.setAttribute('aria-pressed', String(hudAudioEnabled));
      if (hudAudioIcon) {
        hudAudioIcon.className = hudAudioEnabled
          ? 'fa-solid fa-volume-high'
          : 'fa-solid fa-volume-xmark';
      }
      if (hudAudioEnabled) playHudTone(780, 0.07, 'sine');
    });
  }

  // Inicializar la ruta por defecto (JEZERO-ALPHA), el cono de visión y el Street View al arrancar
  loadStreetViewStation('scene-kodiak', false);
  loadRoute('jezero-alpha', false);
  updateRoverVisionConeOnMap(14, 90);
}

// Iniciar de inmediato si el DOM ya está listo, o al dispararse DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMarsDashboard);
} else {
  initMarsDashboard();
}
