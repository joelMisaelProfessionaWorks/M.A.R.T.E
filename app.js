/**
 * ============================================================================
 * NASA SPACE APPS CHALLENGE 2026
 * PROYECTO: Interplanetary Survival Guide: Martian Map (M.A.R.T.E)
 * ETAPA 2 & ETAPA 3:
 *  - Mapa Orbital 2D Interactivo con Leaflet.js y 5 Capas de la NASA
 *  - Planificador de Rutas y Motor de Telemetría de Supervivencia en Tiempo Real
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
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

  // Constantes Planetarias Marcianas
  const MARS_RADIUS_KM = 3396.2; // Radio ecuatorial de Marte en km
  const JEZERO_CENTER = [18.448, 77.432];
  const DEFAULT_ZOOM = 12;

  // ==========================================================================
  // 1. CATÁLOGO CIENTÍFICO DE RUTAS MARCIANAS (ETAPA 3)
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
      center: [18.448, 77.432],
      zoom: 12,
      pathCoords: [
        [18.4447, 77.4508, -2540],
        [18.4365, 77.4420, -2518],
        [18.4280, 77.4310, -2490],
        [18.4440, 77.4220, -2465],
        [18.4590, 77.4150, -2435],
        [18.4665, 77.4020, -2405],
        [18.4720, 77.3920, -2380]
      ],
      waypoints: [
        {
          name: 'Punto de Inicio (Start)',
          sub: 'Octavia E. Butler Landing',
          km: 0.0,
          coords: [18.4447, 77.4508],
          elev: -2540
        },
        {
          name: 'Parada Científica: Kodiak',
          sub: 'Análisis estratigráfico fluvial',
          km: 4.8,
          coords: [18.4280, 77.4310],
          elev: -2490
        },
        {
          name: 'Depósito de Hielo Subterráneo',
          sub: 'Extracción ISRU de H₂O',
          km: 9.4,
          coords: [18.4590, 77.4150],
          elev: -2435
        },
        {
          name: 'Campamento Base (Base Camp)',
          sub: 'Hábitat Delta Prime',
          km: 14.6,
          coords: [18.4720, 77.3920],
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
      center: [18.458, 77.405],
      zoom: 12,
      pathCoords: [
        [18.4447, 77.4508, -2540],
        [18.4580, 77.4360, -2495],
        [18.4630, 77.4120, -2420],
        [18.4710, 77.3890, -2365],
        [18.4790, 77.3690, -2325],
        [18.4850, 77.3520, -2295]
      ],
      waypoints: [
        {
          name: 'Octavia E. Butler Landing',
          sub: 'Base de partida en llanura',
          km: 0.0,
          coords: [18.4447, 77.4508],
          elev: -2540
        },
        {
          name: 'Frente del Delta Norte',
          sub: 'Ascenso por talud sedimentario',
          km: 6.1,
          coords: [18.4630, 77.4120],
          elev: -2420
        },
        {
          name: 'Mirador Cráter Belva',
          sub: 'Impacto expone estratos antiguos',
          km: 12.8,
          coords: [18.4710, 77.3890],
          elev: -2365
        },
        {
          name: 'Boca de Neretva Vallis',
          sub: 'Estación Hidrológica Avanzada',
          km: 19.2,
          coords: [18.4850, 77.3520],
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
      center: [-4.64, 137.40],
      zoom: 11,
      pathCoords: [
        [-4.5895, 137.4417, -4501],
        [-4.6120, 137.4250, -4440],
        [-4.6450, 137.4010, -4310],
        [-4.6780, 137.3850, -4185],
        [-4.7120, 137.3680, -4011]
      ],
      waypoints: [
        {
          name: 'Bradbury Landing (Inicio)',
          sub: 'Sitio de descenso MSL Curiosity',
          km: 0.0,
          coords: [-4.5895, 137.4417],
          elev: -4501
        },
        {
          name: 'Campo de Dunas Bagnold',
          sub: 'Arena basáltica eólica activa',
          km: 7.4,
          coords: [-4.6120, 137.4250],
          elev: -4440
        },
        {
          name: 'Cresta Vera Rubin',
          sub: 'Depósitos de óxido férrico (Hematita)',
          km: 16.2,
          coords: [-4.6450, 137.4010],
          elev: -4310
        },
        {
          name: 'Unidad de Sulfatos Monte Sharp',
          sub: 'Campamento de Altura Gale',
          km: 24.8,
          coords: [-4.7120, 137.3680],
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
      zoom: 11,
      pathCoords: [
        [-13.8200, -59.2600, -4120],
        [-13.8550, -59.2200, -3960],
        [-13.8900, -59.1800, -3790],
        [-13.9250, -59.1400, -3610],
        [-13.9600, -59.0950, -3440]
      ],
      waypoints: [
        {
          name: 'Plataforma Coprates Floor',
          sub: 'Fondo del cañón abisal',
          km: 0.0,
          coords: [-13.8200, -59.2600],
          elev: -4120
        },
        {
          name: 'Escarpe de Falla Normal 01',
          sub: 'Pendiente rocosa de 27.6°',
          km: 10.5,
          coords: [-13.8550, -59.2200],
          elev: -3960
        },
        {
          name: 'Terraza de Sulfatos Hídricos',
          sub: 'Vetas minerales expuestas',
          km: 21.0,
          coords: [-13.8900, -59.1800],
          elev: -3790
        },
        {
          name: 'Refugio Subterráneo de Pared',
          sub: 'Tubo de lava / Caverna protegida',
          km: 31.5,
          coords: [-13.9600, -59.0950],
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
  // 2. INICIALIZACIÓN DEL MOTOR CARTOGRÁFICO LEAFLET.JS (ETAPA 2)
  // ==========================================================================
  const marsMap = L.map('mars-leaflet-map', {
    center: JEZERO_CENTER,
    zoom: DEFAULT_ZOOM,
    minZoom: 2,
    maxZoom: 16,
    zoomControl: false,
    attributionControl: true
  });

  marsMap.attributionControl.setPrefix(
    '<span class="hud-attr-tag">NASA / JPL-Caltech / USGS Astrogeology / OpenPlanetaryMap</span>'
  );

  const baseTiles = {
    opmMars: L.tileLayer(
      'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-2/all/{z}/{x}/{y}.png',
      {
        maxZoom: 16,
        maxNativeZoom: 6,
        attribution: 'OpenPlanetaryMap / Viking MDIM 2.1'
      }
    ),
    molaColor: L.tileLayer(
      'https://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/mola-color/{z}/{x}/{y}.png',
      {
        tms: true,
        maxZoom: 16,
        maxNativeZoom: 6,
        opacity: 0.72,
        attribution: 'NASA MGS MOLA Altimetry'
      }
    ),
    shadedRelief: L.tileLayer(
      'https://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/celestia_mars-shaded-16k_global/{z}/{x}/{y}.png',
      {
        tms: true,
        maxZoom: 16,
        maxNativeZoom: 5,
        opacity: 0.65,
        attribution: 'Celestia 16K Shaded Relief'
      }
    )
  };

  baseTiles.opmMars.addTo(marsMap);

  // ==========================================================================
  // 3. CONSTRUCCIÓN DE LAS 5 CAPAS CIENTÍFICAS DE LA NASA
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

  // CAPA 1: TOPOGRAPHY (MOLA)
  nasaLayers.topo.addLayer(baseTiles.molaColor);

  const molaContoursData = [
    {
      elev: '-2,560m (Llanura del Cráter)',
      color: '#ff9e66',
      dash: '6, 6',
      coords: [
        [18.412, 77.410],
        [18.420, 77.465],
        [18.455, 77.495],
        [18.485, 77.480],
        [18.492, 77.435],
        [18.468, 77.405]
      ]
    },
    {
      elev: '-2,480m (Talud Frontal del Delta)',
      color: '#FF6B2B',
      dash: null,
      coords: [
        [18.425, 77.390],
        [18.442, 77.428],
        [18.465, 77.438],
        [18.482, 77.415],
        [18.488, 77.382]
      ]
    },
    {
      elev: '-2,390m (Meseta Superior Delta Prime)',
      color: '#ff3d00',
      dash: '10, 5',
      coords: [
        [18.445, 77.365],
        [18.458, 77.395],
        [18.476, 77.402],
        [18.490, 77.385],
        [18.495, 77.358]
      ]
    },
    {
      elev: '-2,210m (Borde Occidental del Cráter Jezero)',
      color: '#ffab40',
      dash: '4, 4',
      coords: [
        [18.410, 77.342],
        [18.445, 77.352],
        [18.478, 77.356],
        [18.508, 77.348]
      ]
    }
  ];

  molaContoursData.forEach((contour) => {
    const polyline = L.polyline(contour.coords, {
      color: contour.color,
      weight: 2,
      opacity: 0.85,
      dashArray: contour.dash
    }).bindTooltip(`MOLA ALTITUD: ${contour.elev}`, {
      sticky: true,
      className: 'cyber-leaflet-tooltip'
    });
    nasaLayers.topo.addLayer(polyline);
  });

  // CAPA 2: GEOLOGY
  const geologyUnits = [
    {
      name: 'Unidad Deltaica Aluvial (Filosilicatos y Carbonatos)',
      code: 'Nh-d1 // Alta Prioridad Astrobiológica',
      desc: 'Sedimentos fluviales ricos en arcillas esmectitas y carbonatos depositados por el antiguo río Neretva Vallis hace ~3.700 millones de años.',
      color: '#ce93d8',
      fillColor: '#ab47bc',
      coords: [
        [18.452, 77.372],
        [18.485, 77.376],
        [18.478, 77.422],
        [18.446, 77.416]
      ]
    },
    {
      name: 'Unidad Máaz (Piso Volcánico Basáltico / Olivino)',
      code: 'Ah-v2 // Regolito Ígneo Fracturado',
      desc: 'Rocas ígneas ricas en piroxeno y olivino alteradas por agua subterránea. Terreno firme óptimo para tracción de rovers.',
      color: '#ffb74d',
      fillColor: '#f57c00',
      coords: [
        [18.418, 77.425],
        [18.456, 77.432],
        [18.452, 77.478],
        [18.415, 77.468]
      ]
    },
    {
      name: 'Unidad Séítah (Cumulados de Olivino y Carbonato Magnésico)',
      code: 'Nh-s3 // Zona de Dunas Peligrosas',
      desc: 'Afloramiento geológico más antiguo del piso del cráter con presencia de ondas eólicas (megaripples). Precaución: riesgo de atasco en ruedas.',
      color: '#ef5350',
      fillColor: '#d32f2f',
      coords: [
        [18.436, 77.402],
        [18.458, 77.408],
        [18.454, 77.429],
        [18.431, 77.422]
      ]
    }
  ];

  geologyUnits.forEach((unit) => {
    const polygon = L.polygon(unit.coords, {
      color: unit.color,
      fillColor: unit.fillColor,
      fillOpacity: 0.22,
      weight: 1.8,
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

  // CAPA 3: RESOURCES (ICE)
  const iceResources = [
    {
      name: 'Reserva de Hielo Subsuperficial: Delta Norte (ISRU-01)',
      coords: [18.459, 77.415],
      radius: 850,
      purity: '84% H₂O Cristalino + Sílice Hidratada',
      depth: '1.2m bajo regolito',
      yield: 'Estimado: 42,000 Litros procesables'
    },
    {
      name: 'Bolsón de Permafrost Protegido: Neretva Rim (ISRU-02)',
      coords: [18.476, 77.386],
      radius: 620,
      purity: '91% Hielo de Agua Subterráneo',
      depth: '0.8m (Sombra térmica permanente)',
      yield: 'Estimado: 68,500 Litros (Soporte Vital Campamento Base)'
    },
    {
      name: 'Depósito de Sulfatos Polihidratados: Kodiak Este',
      coords: [18.431, 77.452],
      radius: 520,
      purity: '38% Agua ligada a minerales',
      depth: 'Superficial (0.2m)',
      yield: 'Requiere horno de pirólisis a 450°C'
    }
  ];

  iceResources.forEach((res) => {
    const outerCircle = L.circle(res.coords, {
      radius: res.radius,
      color: '#00e5ff',
      weight: 2,
      dashArray: '6, 4',
      fillColor: '#00e5ff',
      fillOpacity: 0.18
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

  // CAPA 4: WEATHER (Tormenta de Polvo)
  const dustStormZone = L.circle([18.415, 77.368], {
    radius: 1550,
    color: '#ffab00',
    weight: 2.5,
    dashArray: '10, 6',
    fillColor: '#ff6b2b',
    fillOpacity: 0.24
  }).bindPopup(`
    <div class="hud-popup-card warning-theme">
      <div class="hp-kicker">ALERTA METEOROLÓGICA ACTIVA // SOL 1420</div>
      <h4 class="hp-title"><i class="fa-solid fa-triangle-exclamation"></i> Frente de Tormenta de Polvo Regional</h4>
      <p class="hp-desc">Avance hacia el ENE a 24.5 km/h. Opacidad atmosférica Tau (&tau;) subiendo a 1.45. Se recomienda completar travesía antes de las 17:30 MTC.</p>
    </div>
  `);

  const dustStormCore = L.circle([18.415, 77.368], {
    radius: 750,
    color: '#ff3d00',
    weight: 1,
    fillColor: '#ffab00',
    fillOpacity: 0.3
  });

  const stormAlertBadge = L.marker([18.415, 77.368], {
    icon: L.divIcon({
      className: 'hud-custom-div-icon',
      html: `
        <div class="weather-map-tag">
          <i class="fa-solid fa-wind"></i> TORMENTA DE POLVO (&tau; 1.45 | 24.5 KM/H)
        </div>
      `,
      iconSize: [230, 28],
      iconAnchor: [115, 14]
    })
  });

  nasaLayers.weather.addLayer(dustStormZone);
  nasaLayers.weather.addLayer(dustStormCore);
  nasaLayers.weather.addLayer(stormAlertBadge);

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
      marsMap.flyTo(activeRouteData.center, activeRouteData.zoom || 12, { duration: 1.3 });
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

      // Al hacer clic en un waypoint, movemos el Rover y la cámara hacia ese punto
      li.addEventListener('click', () => {
        stopRoverSimulation();
        const targetPct =
          activeRouteData.totalDistKm > 0
            ? Math.round((wp.km / activeRouteData.totalDistKm) * 100)
            : 0;
        updateRoverProgress(targetPct);
        marsMap.flyTo(wp.coords, Math.max(marsMap.getZoom(), 12), { duration: 0.9 });
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

  // Carga una ruta del catálogo o inicializa la ruta personalizada
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

    renderRouteOnMap(flyTo);
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

    // Si veníamos de una ruta predefinida y es el primer clic en modo custom, conservamos el punto de inicio actual o creamos nuevo punto
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
      cb.addEventListener('change', syncLayersWithCheckboxes);
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
        marsMap.flyTo(liveRoverMarker.getLatLng(), 13, { duration: 1.2 });
        setTimeout(() => liveRoverMarker.openPopup(), 1250);
      } else {
        marsMap.flyTo(JEZERO_CENTER, DEFAULT_ZOOM, { duration: 1.2 });
      }
    });
  }

  if (btnGlobalMars) {
    btnGlobalMars.addEventListener('click', () => {
      marsMap.flyTo([12.0, 45.0], 3, { duration: 1.6 });
    });
  }

  if (baseLayerSelect) {
    baseLayerSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      marsMap.removeLayer(baseTiles.opmMars);
      marsMap.removeLayer(baseTiles.shadedRelief);

      if (val === 'shaded') {
        baseTiles.shadedRelief.setOpacity(1);
        baseTiles.shadedRelief.addTo(marsMap);
      } else {
        baseTiles.opmMars.addTo(marsMap);
      }
    });
  }

  // ==========================================================================
  // 9. ETAPA 4: MÓDULO "MARTIAN STREET VIEW 360°" (PANNELLUM.JS) Y NAVEGACIÓN PASO A PASO
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

  // Definición de las 6 Estaciones Panorámicas 360° Paso a Paso en Marte
  const STREETVIEW_STATIONS = [
    {
      id: 'scene-landing',
      stepNum: '01',
      shortLabel: '01 INICIO (LANDING)',
      title: 'ESTACIÓN 01: SITIO DE AMARTIZAJE OCTAVIA E. BUTLER (KM 0.0)',
      sensor: 'NAVCAM + MASTCAM-Z (PERSEVERANCE)',
      routeKey: 'jezero-alpha',
      progressPct: 0,
      coords: [18.4447, 77.4508],
      elev: -2540,
      initialYaw: 18,
      initialPitch: -2,
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
          pitch: -6,
          yaw: 22,
          kind: 'nav',
          icon: 'fa-circle-arrow-up',
          label: 'AVANZAR PASO 02: MESA KODIAK (KM 4.8)',
          targetScene: 'scene-kodiak'
        },
        {
          pitch: -12,
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
          pitch: -18,
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
      coords: [18.4280, 77.4310],
      elev: -2490,
      initialYaw: 10,
      initialPitch: 2,
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
          pitch: -5,
          yaw: 35,
          kind: 'nav',
          icon: 'fa-circle-arrow-up',
          label: 'AVANZAR PASO 03: DEPÓSITO HIELO ISRU (KM 9.4)',
          targetScene: 'scene-ice'
        },
        {
          pitch: -8,
          yaw: -155,
          kind: 'nav',
          icon: 'fa-circle-arrow-left',
          label: 'RETROCEDER PASO 01: SITIO DE INICIO (KM 0.0)',
          targetScene: 'scene-landing'
        },
        {
          pitch: 6,
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
          pitch: -20,
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
      coords: [18.4590, 77.4150],
      elev: -2435,
      initialYaw: 0,
      initialPitch: -4,
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
          pitch: -4,
          yaw: 28,
          kind: 'nav',
          icon: 'fa-circle-arrow-up',
          label: 'AVANZAR PASO 04: CAMPAMENTO BASE (KM 14.6)',
          targetScene: 'scene-base'
        },
        {
          pitch: -8,
          yaw: -160,
          kind: 'nav',
          icon: 'fa-circle-arrow-left',
          label: 'RETROCEDER PASO 02: MESA KODIAK (KM 4.8)',
          targetScene: 'scene-kodiak'
        },
        {
          pitch: -14,
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
          pitch: -10,
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
      coords: [18.4720, 77.3920],
      elev: -2380,
      initialYaw: -10,
      initialPitch: 0,
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
          pitch: -7,
          yaw: -145,
          kind: 'nav',
          icon: 'fa-circle-arrow-left',
          label: 'RETROCEDER PASO 03: ESTACIÓN HIELO ISRU',
          targetScene: 'scene-ice'
        },
        {
          pitch: -2,
          yaw: 95,
          kind: 'nav',
          icon: 'fa-rocket',
          label: 'SALTO PLANETARIO: CRÁTER GALE (CURIOSITY)',
          targetScene: 'scene-gale'
        },
        {
          pitch: 2,
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
          pitch: 8,
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
      coords: [-4.6450, 137.4010],
      elev: -4310,
      initialYaw: 5,
      initialPitch: 4,
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
          pitch: -5,
          yaw: 50,
          kind: 'nav',
          icon: 'fa-circle-arrow-up',
          label: 'SALTO PLANETARIO: VALLES MARINERIS SUR',
          targetScene: 'scene-valles'
        },
        {
          pitch: -6,
          yaw: -130,
          kind: 'nav',
          icon: 'fa-circle-arrow-left',
          label: 'VOLVER A CRÁTER JEZERO: CAMPAMENTO BASE',
          targetScene: 'scene-base'
        },
        {
          pitch: 11,
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
      initialPitch: 6,
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
          pitch: -6,
          yaw: 0,
          kind: 'nav',
          icon: 'fa-circle-arrow-up',
          label: 'VOLVER AL INICIO: CRÁTER JEZERO (KM 0.0)',
          targetScene: 'scene-landing'
        },
        {
          pitch: 14,
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

  const panoTextureCache = {};
  let panoViewer = null;
  let currentStationId = 'scene-kodiak';
  let isAutoRotating = true;

  // Generador procedural equirectangular 2:1 (sin costuras en 0°/360°) de alta resolución para cada estación de Marte
  function getOrGeneratePanoramaTexture(station) {
    if (panoTextureCache[station.id]) {
      return panoTextureCache[station.id];
    }

    const width = 2048;
    const height = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const pal = station.palette;

    // 1. Cielo marciano atmosférico (Cénit a Horizonte)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.52);
    skyGrad.addColorStop(0, pal.skyZenith);
    skyGrad.addColorStop(0.55, pal.skyMid);
    skyGrad.addColorStop(1, pal.skyHorizon);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height * 0.55);

    // 2. Disco solar en el cielo marciano con halo azulado de dispersión de Mie
    const sunX = width * 0.62;
    const sunY = height * 0.24;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 170);
    sunGlow.addColorStop(0, 'rgba(255, 250, 240, 1)');
    sunGlow.addColorStop(0.15, 'rgba(190, 225, 255, 0.65)');
    sunGlow.addColorStop(0.5, 'rgba(255, 165, 110, 0.25)');
    sunGlow.addColorStop(1, 'rgba(255, 130, 80, 0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(sunX - 180, sunY - 180, 360, 360);

    // 3. Cordilleras y bordes de cráter 360° continuos (Funciones periódicas en 2*PI para costura cero)
    const drawPeriodicMountainLayer = (baseY, amp, freqMult, fillStyle, detailBoost = 1) => {
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 4) {
        const theta = (x / width) * Math.PI * 2;
        let offset =
          Math.sin(theta * 2 + freqMult) * amp * 0.48 +
          Math.cos(theta * 5 - freqMult) * amp * 0.28 +
          Math.sin(theta * 9 + freqMult * 2) * amp * 0.15 * detailBoost +
          Math.cos(theta * 17) * amp * 0.08 * detailBoost;

        // Si es Kodiak o Gale, añadimos una meseta truncada o pico imponente al frente (theta ~ PI)
        if (pal.accentFeature === 'kodiak' && Math.abs(theta - Math.PI) < 0.45) {
          offset = Math.max(offset, amp * 0.85);
        } else if (pal.accentFeature === 'gale' && Math.abs(theta - Math.PI) < 0.6) {
          offset += Math.cos((theta - Math.PI) * 2.5) * amp * 1.35;
        } else if (pal.accentFeature === 'valles') {
          offset *= 1.65;
        }

        ctx.lineTo(x, baseY - offset);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = fillStyle;
      ctx.fill();
    };

    // Cordillera lejana del borde del cráter
    drawPeriodicMountainLayer(height * 0.51, 58, 1.1, pal.groundFar, 1.0);
    // Mesetas intermedias y escarpes deltaicos
    drawPeriodicMountainLayer(height * 0.54, 38, 2.4, pal.ridgeColor, 1.3);

    // 4. Suelo marciano (Gradiente desde el horizonte hasta el nadir bajo el Rover)
    const groundGrad = ctx.createLinearGradient(0, height * 0.52, 0, height);
    groundGrad.addColorStop(0, pal.groundFar);
    groundGrad.addColorStop(0.32, pal.groundMid);
    groundGrad.addColorStop(0.78, pal.groundNear);
    groundGrad.addColorStop(1, '#120804');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, height * 0.53, width, height * 0.47);

    // 5. Estratos sedimentarios horizontales en el terreno y afloramientos rocosos
    ctx.strokeStyle = 'rgba(255, 165, 110, 0.14)';
    ctx.lineWidth = 2;
    for (let s = 0; s < 14; s++) {
      const yLine = height * 0.53 + s * s * 2.2;
      if (yLine > height * 0.92) break;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 16) {
        const theta = (x / width) * Math.PI * 2;
        const wave = Math.sin(theta * 6 + s) * (3 + s * 0.6);
        if (x === 0) ctx.moveTo(x, yLine + wave);
        else ctx.lineTo(x, yLine + wave);
      }
      ctx.stroke();
    }

    // 6. Rasgos visuales distintivos según la estación (Hielo ISRU, Domos de Campamento Base, Rocas)
    let seed = station.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const pseudoRand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    // Rocas basálticas y sedimentarias distribuidas en el suelo
    for (let r = 0; r < 160; r++) {
      const rx = pseudoRand() * width;
      const ry = height * 0.55 + Math.pow(pseudoRand(), 1.5) * (height * 0.37);
      const scale = ((ry - height * 0.52) / (height * 0.45)) * 26 + 3;
      const rw = scale * (0.8 + pseudoRand() * 1.2);
      const rh = scale * (0.45 + pseudoRand() * 0.55);

      // Sombra de la roca
      ctx.fillStyle = 'rgba(10, 4, 2, 0.55)';
      ctx.beginPath();
      ctx.ellipse(rx + rw * 0.3, ry + rh * 0.35, rw * 0.65, rh * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cuerpo de la roca
      ctx.fillStyle = pseudoRand() > 0.3 ? '#4a1f10' : '#69301a';
      ctx.beginPath();
      ctx.moveTo(rx - rw * 0.5, ry + rh * 0.3);
      ctx.lineTo(rx - rw * 0.3, ry - rh * 0.5);
      ctx.lineTo(rx + rw * 0.25, ry - rh * 0.4);
      ctx.lineTo(rx + rw * 0.55, ry + rh * 0.3);
      ctx.closePath();
      ctx.fill();

      // Iluminación superior solar
      ctx.strokeStyle = 'rgba(255, 180, 130, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Si es la estación de Hielo Subterráneo (scene-ice), dibujamos la trinchera de hielo cristalino H2O
    if (pal.accentFeature === 'ice') {
      ctx.save();
      const iceX = width * 0.46;
      const iceY = height * 0.67;
      const iceGlow = ctx.createRadialGradient(iceX, iceY, 10, iceX, iceY, 190);
      iceGlow.addColorStop(0, 'rgba(180, 250, 255, 0.85)');
      iceGlow.addColorStop(0.4, 'rgba(0, 229, 255, 0.38)');
      iceGlow.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = iceGlow;
      ctx.beginPath();
      ctx.ellipse(iceX, iceY, 175, 52, -0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Si es el Campamento Base (scene-base), dibujamos el domo presurizado en el horizonte frontal
    if (pal.accentFeature === 'base') {
      ctx.save();
      const domeX = width * 0.45;
      const domeY = height * 0.53;
      ctx.fillStyle = '#dce4ec';
      ctx.beginPath();
      ctx.arc(domeX, domeY, 44, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#FF6B2B';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    // 7. Huellas de las ruedas de titanio del Rover convergiendo hacia el horizonte
    ctx.strokeStyle = 'rgba(25, 10, 4, 0.65)';
    ctx.lineWidth = 6;
    ctx.setLineDash([12, 6]);
    ctx.beginPath();
    ctx.moveTo(width * 0.44, height * 0.92);
    ctx.lineTo(width * 0.54, height * 0.55);
    ctx.moveTo(width * 0.58, height * 0.92);
    ctx.lineTo(width * 0.56, height * 0.55);
    ctx.stroke();
    ctx.setLineDash([]);

    // 8. Cubierta técnica del Rover en el Nadir (parte inferior de la esfera)
    ctx.fillStyle = '#181d26';
    ctx.fillRect(0, height * 0.91, width, height * 0.09);
    ctx.strokeStyle = '#FF6B2B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.91);
    ctx.lineTo(width, height * 0.91);
    ctx.stroke();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    panoTextureCache[station.id] = dataUrl;
    return dataUrl;
  }

  // Actualiza la tarjeta holográfica de inspección científica dentro del visor 360°
  function updateInspectorCard(info) {
    if (!info) return;
    if (svInspectorCard) svInspectorCard.classList.remove('is-minimized');
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

  // Construye el objeto de configuración de escenas para Pannellum.js
  function buildPannellumScenesConfig() {
    const scenesObj = {};

    STREETVIEW_STATIONS.forEach((station) => {
      const textureUrl = getOrGeneratePanoramaTexture(station);

      const formattedHotspots = station.hotspots.map((hs) => ({
        pitch: hs.pitch,
        yaw: hs.yaw,
        cssClass: 'hud-360-hotspot',
        createTooltipFunc: (hotSpotDiv) => {
          const pinTypeClass =
            hs.kind === 'nav' ? 'type-nav' : hs.kind === 'ice' ? 'type-ice' : 'type-science';
          hotSpotDiv.innerHTML = `
            <div class="hs360-pin ${pinTypeClass}">
              <div class="hs360-icon"><i class="fa-solid ${hs.icon}"></i></div>
              <span class="hs360-label">${hs.label}</span>
            </div>
          `;
        },
        clickHandlerFunc: () => {
          if (hs.kind === 'nav' && hs.targetScene) {
            loadStreetViewStation(hs.targetScene, true);
          } else {
            if (panoViewer) {
              panoViewer.lookAt(hs.pitch, hs.yaw, 75, 800);
            }
            updateInspectorCard({
              kicker: hs.kicker,
              title: hs.label,
              desc: hs.desc,
              dist: hs.dist,
              comp: hs.comp
            });
          }
        }
      }));

      scenesObj[station.id] = {
        type: 'equirectangular',
        panorama: textureUrl,
        yaw: station.initialYaw,
        pitch: station.initialPitch,
        hfov: 95,
        hotSpots: formattedHotspots
      };
    });

    return scenesObj;
  }

  // Inicializa o actualiza la estación activa en el motor WebGL Pannellum.js
  function loadStreetViewStation(stationId, syncWithMapAndRoute = true) {
    const station =
      STREETVIEW_STATIONS.find((s) => s.id === stationId) || STREETVIEW_STATIONS[1];
    currentStationId = station.id;

    if (svStationTitleEl) {
      svStationTitleEl.textContent = `MARTIAN STREET VIEW 360° // ${station.title}`;
    }

    updateInspectorCard(station.defaultInspect);
    renderStreetViewStepPills();

    if (!panoViewer && typeof pannellum !== 'undefined') {
      const scenesConfig = buildPannellumScenesConfig();
      panoViewer = pannellum.viewer('pannellum-viewer', {
        default: {
          firstScene: station.id,
          autoLoad: true,
          autoRotate: -2.2,
          compass: false,
          showZoomCtrl: true,
          showFullscreenCtrl: true,
          sceneFadeDuration: 650
        },
        scenes: scenesConfig
      });
    } else if (panoViewer && panoViewer.getScene() !== station.id) {
      panoViewer.loadScene(station.id, station.initialPitch, station.initialYaw, 95);
    }

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
  let lastKnownHfov = 95;
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
    const coneRadiusKm = 1.15;
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

  // Bucle de telemetría de orientación 360° (Brújula, Pitch, FOV y Cono de Visión en Mapa 2D)
  setInterval(() => {
    if (!panoViewer || streetContainer.classList.contains('is-hidden')) return;
    try {
      const rawYaw = panoViewer.getYaw() || 0;
      const normYaw = Math.round(((rawYaw % 360) + 360) % 360);
      const pitch = (panoViewer.getPitch() || 0).toFixed(1);
      const fov = Math.round(panoViewer.getHfov() || 95);

      const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
      const dirLabel = dirs[Math.round(normYaw / 45) % 8];

      if (svCompassHeadingEl) {
        svCompassHeadingEl.textContent = `AZIMUT: ${String(normYaw).padStart(3, '0')}° ${dirLabel}`;
      }
      const activeStation = STREETVIEW_STATIONS.find((s) => s.id === currentStationId);
      if (svCameraAnglesEl && activeStation) {
        svCameraAnglesEl.textContent = `PITCH: ${pitch}° | FOV: ${fov}° | SENSOR: ${activeStation.sensor}`;
      }

      // Actualizar en tiempo real el cono de visión radar sobre el Mapa 2D
      updateRoverVisionConeOnMap(normYaw, fov);
    } catch {
      // Ignorar mientras la escena WebGL está en transición
    }
  }, 180);

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
      if (panoViewer) {
        if (isAutoRotating) panoViewer.startAutoRotate(-2.2);
        else panoViewer.stopAutoRotate();
      }
    });
  }

  // Minimizar / expandir tarjeta de inspección científica en 360°
  if (btnCloseInspector && svInspectorCard) {
    btnCloseInspector.addEventListener('click', () => {
      svInspectorCard.classList.toggle('is-minimized');
    });
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
      streetBtnLabel.textContent = 'VOLVER AL MAPA 2D';
    } else if (mode === 'split') {
      mapContainer.classList.remove('is-hidden');
      streetContainer.classList.remove('is-hidden');
      btnToggleStreet.classList.add('is-active');
      btnSplitView.classList.add('is-active');
      streetBtnLabel.textContent = '360° ACTIVO (DIVIDIDO)';
    } else {
      mapContainer.classList.remove('is-hidden');
      streetContainer.classList.add('is-hidden');
      btnToggleStreet.classList.remove('is-active');
      btnToggleStreet.setAttribute('aria-pressed', 'false');
      btnSplitView.classList.remove('is-active');
      streetBtnLabel.textContent = 'ACTIVATE 360° STREET VIEW';
    }

    if (mode === 'streetview' || mode === 'split') {
      loadStreetViewStation(targetStationId || currentStationId, false);
    }

    setTimeout(() => {
      marsMap.invalidateSize();
      if (panoViewer && typeof panoViewer.resize === 'function') {
        panoViewer.resize();
      }
    }, 180);
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
  if (btnQuick360) btnQuick360.addEventListener('click', () => setViewportMode('split'));

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
      marsMap.flyTo(m.coords, 11, { duration: 1.4 });
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

  setInterval(() => {
    mtcTotalSeconds = (mtcTotalSeconds + 1) % 86400;
    const hrs = String(Math.floor(mtcTotalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((mtcTotalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(mtcTotalSeconds % 60).padStart(2, '0');
    if (hudClockEl) {
      hudClockEl.innerHTML = `SOL 1420 &bull; ${hrs}:${mins}:${secs} MTC`;
    }
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
  renderStreetViewStepPills();
  loadRoute('jezero-alpha', false);
  updateRoverVisionConeOnMap(14, 95);
});
