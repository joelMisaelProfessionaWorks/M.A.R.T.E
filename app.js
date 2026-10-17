/**
 * ============================================================================
 * NASA SPACE APPS CHALLENGE 2026
 * PROYECTO: Interplanetary Survival Guide: Martian Map (M.A.R.T.E)
 * ETAPA 2: Mapa Orbital 2D Interactivo con Leaflet.js y Capas de la NASA
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

  // Coordenadas centrales de la misión: Cráter Jezero (Abanico Deltaico Occidental)
  const JEZERO_CENTER = [18.448, 77.432];
  const DEFAULT_ZOOM = 12;

  // ==========================================================================
  // 1. INICIALIZACIÓN DEL MOTOR CARTOGRÁFICO LEAFLET.JS
  // ==========================================================================
  const marsMap = L.map('mars-leaflet-map', {
    center: JEZERO_CENTER,
    zoom: DEFAULT_ZOOM,
    minZoom: 2,
    maxZoom: 16,
    zoomControl: false, // Usamos nuestros controles HUD personalizados
    attributionControl: true
  });

  marsMap.attributionControl.setPrefix(
    '<span class="hud-attr-tag">NASA / JPL-Caltech / USGS Astrogeology / OpenPlanetaryMap</span>'
  );

  // ==========================================================================
  // 2. MOSAICOS ORBITALES BASE DE LA NASA / OPENPLANETARYMAP
  // ==========================================================================
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

  // Activamos el mosaico marciano base por defecto
  baseTiles.opmMars.addTo(marsMap);

  // ==========================================================================
  // 3. CONSTRUCCIÓN DE LAS 5 CAPAS CIENTÍFICAS DE LA NASA (LAYER GROUPS)
  // ==========================================================================
  const nasaLayers = {
    topo: L.layerGroup(),
    geol: L.layerGroup(),
    res: L.layerGroup(),
    weather: L.layerGroup(),
    sites: L.layerGroup()
  };

  // --------------------------------------------------------------------------
  // CAPA 1: TOPOGRAPHY (MOLA) - Altimetría Láser + Curvas de Nivel en Jezero
  // --------------------------------------------------------------------------
  // Añadimos el mosaico global de color MOLA con transparencia táctica
  nasaLayers.topo.addLayer(baseTiles.molaColor);

  // Curvas de nivel batimétricas/topográficas del Cráter Jezero y su Delta
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

  // --------------------------------------------------------------------------
  // CAPA 2: GEOLOGY - Unidades Litológicas y Minerales (THEMIS IR / CRISM)
  // --------------------------------------------------------------------------
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
          <span><i class="fa-solid fa-Microscope"></i> PIXL / SHERLOC</span>
        </div>
      </div>
    `);
    nasaLayers.geol.addLayer(polygon);
  });

  // --------------------------------------------------------------------------
  // CAPA 3: RESOURCES (ICE) - Reservas de Hielo Subterráneo y Minerales H2O
  // --------------------------------------------------------------------------
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
    // Anillo exterior de radar SHARAD
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

    // Marcador central de recurso hídrico
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

  // --------------------------------------------------------------------------
  // CAPA 4: WEATHER - Frente de Tormenta de Polvo y Vectores de Viento MEDA
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // CAPA 5: MISSION SITES & RUTA ACTIVA (JEZERO-ALPHA + MISIONES HISTÓRICAS)
  // --------------------------------------------------------------------------
  const jezeroAlphaRouteCoords = [
    [18.4447, 77.4508], // WP 01: Octavia E. Butler Landing (Start)
    [18.4365, 77.4420], // Borde sur de Séítah
    [18.4280, 77.4310], // WP 02: Parada Científica Kodiak (Posición Actual Rover)
    [18.4440, 77.4220], // Ascenso al frente del delta
    [18.4590, 77.4150], // WP 03: Estación Hielo Subsuperficial ISRU
    [18.4665, 77.4020], // Meseta intermedia del abanico aluvial
    [18.4720, 77.3920]  // WP 04: Campamento Base (Delta Prime)
  ];

  // Sombra resplandeciente de la ruta
  const routeGlowLine = L.polyline(jezeroAlphaRouteCoords, {
    color: '#FF6B2B',
    weight: 9,
    opacity: 0.28,
    lineCap: 'round'
  });

  // Línea táctica principal
  const routeMainLine = L.polyline(jezeroAlphaAlphaCoords(), {
    color: '#FF6B2B',
    weight: 3.5,
    opacity: 0.95,
    dashArray: '10, 8'
  }).bindTooltip('RUTA ACTIVA: JEZERO-ALPHA (14.6 km)', {
    sticky: true,
    className: 'cyber-leaflet-tooltip'
  });

  function jezeroAlphaAlphaCoords() {
    return jezeroAlphaRouteCoords;
  }

  nasaLayers.sites.addLayer(routeGlowLine);
  nasaLayers.sites.addLayer(routeMainLine);

  // Waypoints locales en Jezero y Sitios Globales de la NASA en Marte
  const missionSitesData = [
    {
      id: 'wp-start',
      name: 'Punto de Inicio: Octavia E. Butler Landing',
      mission: 'Perseverance Rover (NASA Mars 2020)',
      coords: [18.4447, 77.4508],
      elev: '-2,540m',
      type: 'start',
      icon: 'fa-rocket',
      desc: 'Punto de amartizaje original del rover Perseverance (18 Feb 2021). Zona despejada con baliza de comunicaciones UHF activa.'
    },
    {
      id: 'wp-rover',
      name: 'Parada Científica: Mesa Kodiak (ROVER ACTUAL)',
      mission: 'Exploradores Humanos + Rover Presurizado',
      coords: [18.4280, 77.4310],
      elev: '-2,490m',
      type: 'rover',
      icon: 'fa-satellite-dish',
      desc: 'Remanente erosivo del antiguo delta lacustre. Las capas inclinadas (foresets) confirman el nivel histórico del lago de Jezero.'
    },
    {
      id: 'wp-ice',
      name: 'Estación ISRU: Hielo Delta Norte',
      mission: 'Planta de Extracción de Agua y O₂',
      coords: [18.4590, 77.4150],
      elev: '-2,435m',
      type: 'waypoint',
      icon: 'fa-flask',
      desc: 'Punto de reabastecimiento intermedio para filtrado de agua subsuperficial y generación electrolítica de oxígeno respirable.'
    },
    {
      id: 'wp-base',
      name: 'Campamento Base: Hábitat Delta Prime',
      mission: 'Destino Final de Expedición Humana',
      coords: [18.4720, 77.3920],
      elev: '-2,380m',
      type: 'base',
      icon: 'fa-campground',
      desc: 'Meseta elevada protegida contra vientos catabáticos, con acceso directo a depósitos de hielo y radiación solar despejada.'
    },
    {
      id: 'ingenuity-field',
      name: 'Campo de Vuelo Wright Brothers (Ingenuity)',
      mission: 'Helicóptero Marciano Ingenuity (72 Vuelos)',
      coords: [18.4486, 77.4509],
      elev: '-2,538m',
      type: 'historic',
      icon: 'fa-helicopter',
      desc: 'Primer aeródromo extraterrestre de la historia humana.'
    },
    // Sitios Globales en Marte para exploración planetaria
    {
      id: 'global-curiosity',
      name: 'Misión Curiosity (MSL) — Cráter Gale',
      mission: 'NASA Mars Science Laboratory (2012 - Presente)',
      coords: [-4.5895, 137.4417],
      elev: '-4,501m',
      type: 'historic',
      icon: 'fa-robot',
      desc: 'Ascenso por Aeolis Mons (Monte Sharp). Evidencia confirmada de antiguos ambientes habitables ricos en compuestos orgánicos.'
    },
    {
      id: 'global-insight',
      name: 'Sonda InSight — Elysium Planitia',
      mission: 'NASA Discovery Program (Estudio Sísmico)',
      coords: [4.5024, 135.6234],
      elev: '-2,613m',
      type: 'historic',
      icon: 'fa-wave-square',
      desc: 'Estación geofísica que registró más de 1,300 martemotos y midió el núcleo líquido de Marte.'
    },
    {
      id: 'global-viking1',
      name: 'Viking 1 Lander — Chryse Planitia',
      mission: 'NASA Viking Program (1976)',
      coords: [22.4800, -47.9500],
      elev: '-3,627m',
      type: 'historic',
      icon: 'fa-flag-usa',
      desc: 'Primera nave espacial en operar exitosamente a largo plazo sobre la superficie de Marte.'
    },
    {
      id: 'global-olympus',
      name: 'Cumbre de Olympus Mons',
      mission: 'Volcán Escudo Más Grande del Sistema Solar',
      coords: [18.6500, -133.8000],
      elev: '+21,229m',
      type: 'historic',
      icon: 'fa-mountain',
      desc: 'Caldera volcánica de 21.2 km de altitud sobre el datum marciano, casi tres veces la altura del Monte Everest.'
    }
  ];

  const siteMarkersMap = {};

  missionSitesData.forEach((site) => {
    const markerHtml = `
      <div class="hud-site-marker marker-${site.type}">
        <div class="hsm-ring"></div>
        <div class="hsm-core"><i class="fa-solid ${site.icon}"></i></div>
        <span class="hsm-label">${site.name.split(':')[0]}</span>
      </div>
    `;

    const marker = L.marker(site.coords, {
      icon: L.divIcon({
        className: 'hud-custom-div-icon',
        html: markerHtml,
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
        <button type="button" class="hp-action-btn" data-open-360="${site.id}">
          <i class="fa-solid fa-vr-cardboard"></i> EXPLORAR EN 360° STREET VIEW
        </button>
      </div>
    `);

    siteMarkersMap[site.id] = marker;
    nasaLayers.sites.addLayer(marker);
  });

  // Añadimos todas las 5 capas al mapa inicialmente (ya que los 5 switches están activos)
  Object.values(nasaLayers).forEach((layerGroup) => layerGroup.addTo(marsMap));

  // ==========================================================================
  // 4. INTERACTIVIDAD DE INTERRUPTORES (TOGGLES) DE CAPAS DE LA NASA
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
  }

  Object.keys(layerMapping).forEach((checkboxId) => {
    const cb = document.getElementById(checkboxId);
    if (cb) {
      cb.addEventListener('change', syncLayersWithCheckboxes);
    }
  });

  // ==========================================================================
  // 5. TELEMETRÍA DEL CURSOR EN VIVO Y NAVEGACIÓN DE CONTROLES DEL MAPA
  // ==========================================================================
  // Función que estima la altitud MOLA local según la posición en el Cráter Jezero
  function estimateMartianAltitude(lat, lng) {
    const distFromJezero = Math.hypot(lat - 18.448, lng - 77.432);
    if (distFromJezero < 0.25) {
      // Gradiente real desde el piso del cráter (-2,560m) hacia el borde occidental (-2,200m)
      const deltaSlope = (77.48 - lng) * 1900;
      const alt = Math.round(-2560 + deltaSlope);
      return `${alt.toLocaleString('en-US')}m`;
    }
    // Altitud planetaria aproximada fuera de Jezero
    const globalAlt = Math.round(-1800 + Math.sin(lat * 0.1) * 1400 - Math.cos(lng * 0.08) * 1200);
    return `${globalAlt > 0 ? '+' : ''}${globalAlt.toLocaleString('en-US')}m`;
  }

  marsMap.on('mousemove', (e) => {
    const { lat, lng } = e.latlng;
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'O';
    const altStr = estimateMartianAltitude(lat, lng);

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

  // Botones de la barra de herramientas flotante del mapa
  const btnZoomIn = document.getElementById('btn-map-zoom-in');
  const btnZoomOut = document.getElementById('btn-map-zoom-out');
  const btnCenterRover = document.getElementById('btn-map-center-rover');
  const btnGlobalMars = document.getElementById('btn-map-global');
  const baseLayerSelect = document.getElementById('map-baselayer-select');

  if (btnZoomIn) btnZoomIn.addEventListener('click', () => marsMap.zoomIn());
  if (btnZoomOut) btnZoomOut.addEventListener('click', () => marsMap.zoomOut());

  if (btnCenterRover) {
    btnCenterRover.addEventListener('click', () => {
      marsMap.flyTo(JEZERO_CENTER, DEFAULT_ZOOM, { duration: 1.4 });
      if (siteMarkersMap['wp-rover']) {
        setTimeout(() => siteMarkersMap['wp-rover'].openPopup(), 1450);
      }
    });
  }

  if (btnGlobalMars) {
    btnGlobalMars.addEventListener('click', () => {
      marsMap.flyTo([12.0, 45.0], 3, { duration: 1.6 });
    });
  }

  // Selector de mosaico orbital base (OPM Viking / MOLA / Celestia Shaded)
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
  // 6. INTERACCIÓN CON LOS WAYPOINTS DE LA BARRA LATERAL IZQUIERDA
  // ==========================================================================
  const waypointNodes = document.querySelectorAll('.waypoints-timeline .waypoint-node');
  const wpIdMap = ['wp-start', 'wp-rover', 'wp-ice', 'wp-base'];

  waypointNodes.forEach((node, idx) => {
    node.style.cursor = 'pointer';
    node.addEventListener('click', () => {
      waypointNodes.forEach((n) => n.classList.remove('status-active'));
      node.classList.add('status-active');

      const markerId = wpIdMap[idx];
      const targetMarker = siteMarkersMap[markerId];
      if (targetMarker) {
        marsMap.flyTo(targetMarker.getLatLng(), 13, { duration: 1.1 });
        setTimeout(() => targetMarker.openPopup(), 1150);
      }
    });
  });

  // ==========================================================================
  // 7. CONMUTACIÓN DE VISTAS (MAPA 2D / STREET VIEW 360° / PANTALLA DIVIDIDA)
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

    // Recalcular dimensiones del mapa Leaflet tras transición de layout
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

  // Delegación de eventos para el botón "EXPLORAR EN 360°" dentro de los popups de Leaflet
  document.body.addEventListener('click', (e) => {
    const btn360 = e.target.closest('[data-open-360]');
    if (btn360) {
      setViewportMode('split');
    }
  });
});
