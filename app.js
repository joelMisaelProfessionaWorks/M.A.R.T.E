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
  // 9. CONMUTACIÓN DE VISTAS (MAPA 2D / STREET VIEW 360° / PANTALLA DIVIDIDA)
  // ==========================================================================
  function setViewportMode(mode) {
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

    setTimeout(() => {
      marsMap.invalidateSize();
    }, 150);
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

  document.body.addEventListener('click', (e) => {
    const btn360 = e.target.closest('[data-open-360]');
    if (btn360) {
      setViewportMode('split');
    }
  });

  // Inicializar la ruta por defecto (JEZERO-ALPHA) y su telemetría al arrancar
  loadRoute('jezero-alpha', false);
});
