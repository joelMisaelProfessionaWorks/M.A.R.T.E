/**
 * ============================================================================
 * NASA SPACE APPS CHALLENGE 2026
 * PROJECT: Interplanetary Survival Guide: Martian Map (M.A.R.T.E)
 * STAGE 2 & STAGE 3:
 *  - Interactive 2D Orbital Map with Leaflet.js and 5 NASA Imagery Layers
 *  - EVA Route Planner and Real-Time Survival Telemetry Engine
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
      title: 'Human Explorers: Destination Jezero Crater',
      sector: 'Sector: Western Alluvial Fan • Syrtis Major Quadrangle',
      desc: 'Planned traverse for astronauts and pressurized rover from the landing site to the ancient lacustrine delta. Priority: hydrated regolith extraction and Base Camp establishment.',
      difficulty: 'MEDIUM',
      maxSlopeDeg: 14.2,
      slopeStatus: 'SAFE',
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
          name: 'Starting Point (Start)',
          sub: 'Octavia E. Butler Landing',
          km: 0.0,
          coords: [18.28, 77.68],
          elev: -2540
        },
        {
          name: 'Science Stop: Kodiak',
          sub: 'Fluvial stratigraphic analysis',
          km: 4.8,
          coords: [18.38, 77.49],
          elev: -2490
        },
        {
          name: 'Subsurface Ice Deposit',
          sub: 'H₂O ISRU extraction',
          km: 9.4,
          coords: [18.52, 77.33],
          elev: -2435
        },
        {
          name: 'Base Camp',
          sub: 'Delta Prime Habitat',
          km: 14.6,
          coords: [18.64, 77.15],
          elev: -2380
        }
      ]
    },

    'jezero-beta': {
      id: 'jezero-beta',
      code: 'JEZERO-BETA',
      title: 'Geological Expedition: Belva Crater & Neretva Vallis',
      sector: 'Sector: Upper Delta Plateau • Western Inlet Channel',
      desc: 'Steep ascent route skirting Belva impact crater toward the Neretva Vallis feeder canyon. Higher energy expenditure in exchange for deep crustal samples.',
      difficulty: 'HIGH',
      maxSlopeDeg: 19.8,
      slopeStatus: 'CAUTION',
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
          sub: 'Plains departure base',
          km: 0.0,
          coords: [18.28, 77.68],
          elev: -2540
        },
        {
          name: 'Northern Delta Front',
          sub: 'Ascent via sedimentary slope',
          km: 6.1,
          coords: [18.49, 77.42],
          elev: -2420
        },
        {
          name: 'Belva Crater Overlook',
          sub: 'Impact exposes ancient strata',
          km: 12.8,
          coords: [18.58, 77.28],
          elev: -2365
        },
        {
          name: 'Neretva Vallis Mouth',
          sub: 'Advanced Hydrological Station',
          km: 19.2,
          coords: [18.74, 76.98],
          elev: -2295
        }
      ]
    },

    'gale-sharp': {
      id: 'gale-sharp',
      code: 'GALE-SHARP',
      title: 'Historic Traverse: Gale Crater toward Aeolis Mons',
      sector: 'Sector: Aeolis Palus • Foothills of Mount Sharp (5.5 km altitude)',
      desc: 'Following the historic tracks of the Curiosity rover across dark basaltic dunes (Bagnold Dunes) and ridges rich in hematite and sulfates.',
      difficulty: 'HIGH',
      maxSlopeDeg: 23.4,
      slopeStatus: 'DEMANDING',
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
          name: 'Bradbury Landing (Start)',
          sub: 'MSL Curiosity landing site',
          km: 0.0,
          coords: [-4.42, 137.62],
          elev: -4501
        },
        {
          name: 'Bagnold Dune Field',
          sub: 'Active aeolian basaltic sand',
          km: 7.4,
          coords: [-4.54, 137.50],
          elev: -4440
        },
        {
          name: 'Vera Rubin Ridge',
          sub: 'Ferric oxide (Hematite) deposits',
          km: 16.2,
          coords: [-4.68, 137.38],
          elev: -4310
        },
        {
          name: 'Mount Sharp Sulfate Unit',
          sub: 'Gale High-Altitude Camp',
          km: 24.8,
          coords: [-4.95, 137.14],
          elev: -4011
        }
      ]
    },

    'valles-marineris': {
      id: 'valles-marineris',
      code: 'VALLES-SUR',
      title: 'Extreme Mission: Coprates Canyon (Valles Marineris)',
      sector: 'Sector: Coprates Chasma • Equatorial Canyon System',
      desc: 'High-risk exploration inside the largest tectonic canyon in the Solar System. Strong katabatic winds and slopes approaching the rover rollover limit (28°).',
      difficulty: 'EXTREME',
      maxSlopeDeg: 27.6,
      slopeStatus: 'CRITICAL',
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
          name: 'Coprates Floor Platform',
          sub: 'Abyssal canyon floor',
          km: 0.0,
          coords: [-13.62, -59.52],
          elev: -4120
        },
        {
          name: 'Normal Fault Scarp 01',
          sub: 'Rocky 27.6° slope',
          km: 10.5,
          coords: [-13.75, -59.35],
          elev: -3960
        },
        {
          name: 'Hydrated Sulfate Terrace',
          sub: 'Exposed mineral veins',
          km: 21.0,
          coords: [-13.88, -59.18],
          elev: -3790
        },
        {
          name: 'Subsurface Cliffside Shelter',
          sub: 'Lava tube / Shielded cavern',
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
          elev: '-2,560m (Jezero Lacustrine Floor)',
          color: '#ff9e66',
          dash: '6, 6',
          coords: [[18.18, 77.52], [18.25, 77.74], [18.46, 77.78], [18.65, 77.62], [18.68, 77.38]]
        },
        {
          elev: '-2,460m (Front Delta Slope)',
          color: '#FF6B2B',
          dash: null,
          coords: [[18.24, 77.38], [18.38, 77.52], [18.54, 77.48], [18.66, 77.30], [18.72, 77.12]]
        },
        {
          elev: '-2,340m (Delta Prime Plateau & Crater Rim)',
          color: '#ff3d00',
          dash: '10, 5',
          coords: [[18.32, 77.10], [18.48, 77.26], [18.62, 77.22], [18.75, 77.05]]
        }
      ],
      geology: [
        {
          name: 'Alluvial Delta Unit (Phyllosilicates & Carbonates)',
          code: 'Nh-d1 // High Astrobiological Priority',
          desc: 'Fluvial sediments rich in smectite clays and carbonates deposited by the ancient Neretva Vallis river ~3.7 billion years ago.',
          color: '#ce93d8',
          fillColor: '#ab47bc',
          coords: [[18.44, 77.12], [18.68, 77.14], [18.64, 77.42], [18.40, 77.38]]
        },
        {
          name: 'Máaz Unit (Basaltic / Olivine Volcanic Floor)',
          code: 'Ah-v2 // Fractured Igneous Regolith',
          desc: 'Igneous rocks rich in pyroxene and olivine altered by groundwater. Firm terrain optimal for rover traction.',
          color: '#ffb74d',
          fillColor: '#f57c00',
          coords: [[18.20, 77.46], [18.44, 77.48], [18.42, 77.76], [18.18, 77.72]]
        },
        {
          name: 'Séítah Unit (Olivine & Magnesium Carbonate Cumulates)',
          code: 'Nh-s3 // Aeolian Dune Hazard Zone',
          desc: 'Oldest geological outcrop on the crater floor with aeolian bedforms (megaripples). Caution: wheel entrapment hazard.',
          color: '#ef5350',
          fillColor: '#d32f2f',
          coords: [[18.30, 77.32], [18.48, 77.35], [18.46, 77.54], [18.28, 77.50]]
        }
      ],
      resources: [
        {
          name: 'Subsurface Ice Reserve: North Delta (ISRU-01)',
          coords: [18.52, 77.33],
          radius: 5800,
          purity: '84% Crystalline H₂O + Hydrated Silica',
          depth: '1.2m beneath regolith',
          yield: 'Estimated: 42,000 Liters processable'
        },
        {
          name: 'Protected Permafrost Pocket: Neretva Rim (ISRU-02)',
          coords: [18.64, 77.15],
          radius: 4800,
          purity: '91% Subsurface Water Ice',
          depth: '0.8m (Permanent thermal shadow)',
          yield: 'Estimated: 68,500 Liters (Base Camp Life Support)'
        },
        {
          name: 'Polyhydrated Sulfate Deposit: East Kodiak',
          coords: [18.35, 77.56],
          radius: 4200,
          purity: '38% Mineral-bound water',
          depth: 'Surface (0.2m)',
          yield: 'Requires pyrolysis furnace at 450°C'
        }
      ],
      weather: {
        coords: [18.24, 77.22],
        outerRadius: 11500,
        innerRadius: 5500,
        tag: 'DUST STORM (&tau; 1.45 | 24.5 KM/H)',
        title: 'Regional Dust Storm Front (SW Jezero)',
        desc: 'Advancing ENE at 24.5 km/h. Atmospheric opacity Tau (&tau;) rising to 1.45. Recommended to complete traverse before 17:30 MTC.'
      }
    },
    'jezero-beta': {
      contours: [
        {
          elev: '-2,420m (Belva Ascent Ramp)',
          color: '#ff9e66',
          dash: '6, 6',
          coords: [[18.34, 77.45], [18.48, 77.56], [18.64, 77.46], [18.74, 77.28]]
        },
        {
          elev: '-2,350m (Belva Crater Ejecta Ring)',
          color: '#FF6B2B',
          dash: null,
          coords: [[18.48, 77.18], [18.58, 77.34], [18.68, 77.26], [18.76, 77.08]]
        },
        {
          elev: '-2,280m (Neretva Vallis Gorge)',
          color: '#ff3d00',
          dash: '10, 5',
          coords: [[18.60, 76.88], [18.72, 77.04], [18.82, 76.96]]
        }
      ],
      geology: [
        {
          name: 'Belva Crater Impact Breccia (Exposed Stratigraphy)',
          code: 'Hc-b1 // Deep Crustal Window',
          desc: '900m impact crater exposing deep deltaic sequences and flood-transported megablocks.',
          color: '#ce93d8',
          fillColor: '#8e24aa',
          coords: [[18.50, 77.18], [18.66, 77.20], [18.64, 77.38], [18.48, 77.35]]
        },
        {
          name: 'Neretva Vallis Fluvial Channel (Fe/Mg Clays)',
          code: 'Nh-nv // Ancient Feeder Canyon',
          desc: 'Bedrock carved by the river that fed Lake Jezero. Abundant hydrated phyllosilicates.',
          color: '#4dd0e1',
          fillColor: '#0097a7',
          coords: [[18.64, 76.88], [18.80, 76.90], [18.78, 77.16], [18.62, 77.12]]
        }
      ],
      resources: [
        {
          name: 'Frozen Aquifer Neretva Gorge (ISRU-NV1)',
          coords: [18.74, 76.98],
          radius: 6200,
          purity: '93% Subsurface Ice in Canyon Wall',
          depth: '0.7m beneath northern slope',
          yield: 'Estimated: 74,000 Liters processable'
        },
        {
          name: 'Ice Lens South Belva Crater (ISRU-BV2)',
          coords: [18.58, 77.28],
          radius: 4800,
          purity: '81% H₂O in porous breccia',
          depth: '1.4m beneath crater floor',
          yield: 'Estimated: 39,000 Liters processable'
        }
      ],
      weather: {
        coords: [18.62, 77.18],
        outerRadius: 10500,
        innerRadius: 4800,
        tag: 'BELVA TURBULENCE (&tau; 0.81 | 29.2 KM/H)',
        title: 'Dust Devil Swarm along Belva Rim',
        desc: 'Convective vortices detected by the MEDA-North sensor with gusts up to 29.2 km/h.'
      }
    },
    'gale-sharp': {
      contours: [
        {
          elev: '-4,500m (Aeolis Palus Plains / Bradbury)',
          color: '#ff9e66',
          dash: '6, 6',
          coords: [[-4.35, 137.45], [-4.42, 137.70], [-4.60, 137.68], [-4.68, 137.52]]
        },
        {
          elev: '-4,310m (Vera Rubin Hematite Ridge)',
          color: '#FF6B2B',
          dash: null,
          coords: [[-4.55, 137.28], [-4.68, 137.45], [-4.82, 137.38], [-4.88, 137.22]]
        },
        {
          elev: '-4,010m (Aeolis Mons / Mount Sharp Sulfate Foothills)',
          color: '#ff3d00',
          dash: '10, 5',
          coords: [[-4.78, 137.05], [-4.92, 137.22], [-5.05, 137.12]]
        }
      ],
      geology: [
        {
          name: 'Bagnold Aeolian Dune Field (Basalt & Olivine)',
          code: 'Am-bd // Dark Active Dunes',
          desc: 'Belt of basaltic sand dunes shaped by Mount Sharp winds. Low traction hazard for metal wheels.',
          color: '#ef5350',
          fillColor: '#c62828',
          coords: [[-4.48, 137.38], [-4.62, 137.40], [-4.60, 137.58], [-4.46, 137.55]]
        },
        {
          name: 'Murray Formation & Vera Rubin Ridge (Lacustrine Mudstones)',
          code: 'Hm-vr // Hematite and Smectite Clays',
          desc: 'Finely laminated lacustrine sediments proving the existence of a long-lived habitable lake in Gale.',
          color: '#ce93d8',
          fillColor: '#9c27b0',
          coords: [[-4.62, 137.24], [-4.80, 137.26], [-4.78, 137.46], [-4.60, 137.42]]
        },
        {
          name: 'Sulfate-Bearing Unit (Mount Sharp / Gediz Vallis)',
          code: 'Hs-ms // Kieserite and Magnesium Sulfates',
          desc: 'Strata deposited during Mars climatic transition toward a more arid era.',
          color: '#ffb74d',
          fillColor: '#ef6c00',
          coords: [[-4.82, 137.04], [-5.02, 137.06], [-4.98, 137.28], [-4.80, 137.24]]
        }
      ],
      resources: [
        {
          name: 'Hydrated Clays Glen Torridon (ISRU-GALE-01)',
          coords: [-4.68, 137.38],
          radius: 6400,
          purity: '62% Structural Water in Phyllosilicates',
          depth: '0.4m beneath surface',
          yield: 'Estimated: 51,000 Liters via thermal extraction'
        },
        {
          name: 'Alluvial Channel Gediz Vallis (ISRU-GALE-02)',
          coords: [-4.95, 137.14],
          radius: 5600,
          purity: '78% Polyhydrated Sulfates + Subsurface H₂O',
          depth: '1.1m in debris fan',
          yield: 'Estimated: 63,000 Liters processable'
        }
      ],
      weather: {
        coords: [-4.76, 137.52],
        outerRadius: 12000,
        innerRadius: 5200,
        tag: 'GALE SLOPE WIND (&tau; 0.58 | 18.4 KM/H)',
        title: 'Downslope Flow from Aeolis Mons (Mount Sharp)',
        desc: 'NNW thermal flow at 18.4 km/h recorded by the Curiosity rover REMS station.'
      }
    },
    'valles-marineris': {
      contours: [
        {
          elev: '-4,120m (Coprates Chasma Abyssal Floor)',
          color: '#ff9e66',
          dash: '6, 6',
          coords: [[-13.52, -59.62], [-13.68, -59.40], [-13.84, -59.48]]
        },
        {
          elev: '-3,790m (Normal Fault Tectonic Terrace)',
          color: '#FF6B2B',
          dash: null,
          coords: [[-13.70, -59.38], [-13.88, -59.18], [-14.04, -59.25]]
        },
        {
          elev: '-3,440m (Upper Scarp & Canyon Wall)',
          color: '#ff3d00',
          dash: '10, 5',
          coords: [[-13.92, -59.02], [-14.12, -58.82], [-14.24, -58.95]]
        }
      ],
      geology: [
        {
          name: 'Interior Layered Deposits (Hydrated Sulfates)',
          code: 'Hvi-s1 // Canyon Sedimentary Plateaus',
          desc: 'Kilometer-thick sequences of hydrated sulfates and ferric oxides exposed by the tectonic collapse of Valles Marineris.',
          color: '#ce93d8',
          fillColor: '#8e24aa',
          coords: [[-13.76, -59.32], [-13.98, -59.30], [-13.96, -59.05], [-13.74, -59.08]]
        },
        {
          name: 'Basaltic Scarp & Rock Landslides',
          code: 'Av-ls // Critical 27.6° Slope',
          desc: 'Volcanic fragmentation talus slopes with recurring slope lineae (RSL) and landslide hazard.',
          color: '#ef5350',
          fillColor: '#d32f2f',
          coords: [[-13.96, -59.04], [-14.20, -59.02], [-14.18, -58.76], [-13.94, -58.78]]
        }
      ],
      resources: [
        {
          name: 'Saline Aquifer & H₂O Fog Coprates (ISRU-VM-01)',
          coords: [-13.88, -59.18],
          radius: 7500,
          purity: '89% Hydrated Brines + Atmospheric Condensation',
          depth: '0.9m in fractured terrace',
          yield: 'Estimated: 92,000 Liters processable'
        },
        {
          name: 'Cavern / Subsurface Tube with Buried Glacier (ISRU-VM-02)',
          coords: [-14.14, -58.84],
          radius: 6200,
          purity: '95% Ice Shielded from UV Radiation',
          depth: 'Interior of canyon wall cavern',
          yield: 'Estimated: 120,000 Liters (Permanent Base)'
        }
      ],
      weather: {
        coords: [-13.78, -59.02],
        outerRadius: 14500,
        innerRadius: 6800,
        tag: '⚠ CANYON KATABATIC WIND (&tau; 1.32 | 64.8 KM/H)',
        title: 'Channeled Jet Stream in Coprates Chasma',
        desc: 'Severe gusts of 64.8 km/h along the canyon axis with suspended dust haze (&tau; 1.32).'
      }
    }
  };

  function buildProceduralSectorLayers(centerLat, centerLng) {
    return {
      contours: [
        {
          elev: `${estimateNumericAltitude(centerLat, centerLng)}m (Primary Regional Contour)`,
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
          name: 'Mapped Regional Lithostratigraphic Unit (THEMIS IR)',
          code: 'Nh-custom // EVA Exploration Sector',
          desc: 'Basaltic regolith and mineral sediments analyzed by orbital spectrometry.',
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
          name: 'Subsurface H₂O Deposit Detected by SHARAD Radar',
          coords: [centerLat + 0.06, centerLng - 0.05],
          radius: 5500,
          purity: '82% Water Ice + Hydrated Regolith',
          depth: '1.3m beneath surface',
          yield: 'Estimated: 45,000 Liters processable'
        }
      ],
      weather: {
        coords: [centerLat - 0.10, centerLng + 0.12],
        outerRadius: 11000,
        innerRadius: 5000,
        tag: 'REGIONAL AEOLIAN FRONT (&tau; 0.95 | 26.0 KM/H)',
        title: 'Regional Aeolian Activity Detected',
        desc: 'Surface winds monitored by NASA orbital sensors in the active sector.'
      }
    };
  }

  // Rebuilds and syncs NASA layers (Topography, Geology, Resources, Weather) for the active region
  function rebuildRegionalNasaLayers(routeKey) {
    const center = activeRouteData?.center || JEZERO_CENTER;
    const regionData =
      REGIONAL_LAYERS_DB[routeKey] || buildProceduralSectorLayers(center[0], center[1]);

    // 1. Update MOLA Contour Lines (Topography Layer)
    regionalContoursGroup.clearLayers();
    regionData.contours.forEach((contour) => {
      const polyline = L.polyline(contour.coords, {
        color: contour.color,
        weight: 2.2,
        opacity: 0.9,
        dashArray: contour.dash
      }).bindTooltip(`MOLA ALTITUDE: ${contour.elev}`, {
        sticky: true,
        className: 'cyber-leaflet-tooltip'
      });
      regionalContoursGroup.addLayer(polyline);
    });

    // 2. Update Lithological Polygons (Geology Layer)
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
          <div class="hp-kicker">SUBSURFACE RADAR SHARAD / RIMFAX</div>
          <h4 class="hp-title"><i class="fa-solid fa-snowflake"></i> ${res.name}</h4>
          <ul class="hp-list">
            <li><strong>Detected Purity:</strong> ${res.purity}</li>
            <li><strong>Extraction Depth:</strong> ${res.depth}</li>
            <li><strong>ISRU Potential (O₂ / Water):</strong> ${res.yield}</li>
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
        `H₂O RESOURCE: ${res.name}`,
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
        <div class="hp-kicker">ACTIVE WEATHER ALERT // SOL 1420</div>
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
      name: 'Wright Brothers Field (Ingenuity)',
      mission: 'Ingenuity Mars Helicopter (72 Flights)',
      coords: [18.4486, 77.4509],
      elev: '-2,538m',
      icon: 'fa-helicopter',
      desc: 'First extraterrestrial airfield in human history.'
    },
    {
      id: 'global-curiosity',
      name: 'Curiosity Mission (MSL) — Gale Crater',
      mission: 'NASA Mars Science Laboratory (2012 - Present)',
      coords: [-4.5895, 137.4417],
      elev: '-4,501m',
      icon: 'fa-robot',
      desc: 'Ascent up Aeolis Mons (Mount Sharp). Confirmed evidence of ancient habitable environments rich in organic compounds.'
    },
    {
      id: 'global-insight',
      name: 'InSight Lander — Elysium Planitia',
      mission: 'NASA Discovery Program (Seismic Study)',
      coords: [4.5024, 135.6234],
      elev: '-2,613m',
      icon: 'fa-wave-square',
      desc: 'Geophysical station that recorded over 1,300 marsquakes and measured the liquid core of Mars.'
    },
    {
      id: 'global-viking1',
      name: 'Viking 1 Lander — Chryse Planitia',
      mission: 'NASA Viking Program (1976)',
      coords: [22.4800, -47.9500],
      elev: '-3,627m',
      icon: 'fa-flag-usa',
      desc: 'First spacecraft to operate successfully long-term on the surface of Mars.'
    },
    {
      id: 'global-olympus',
      name: 'Olympus Mons Summit',
      mission: 'Largest Shield Volcano in the Solar System',
      coords: [18.6500, -133.8000],
      elev: '+21,229m',
      icon: 'fa-mountain',
      desc: 'Volcanic caldera standing 21.2 km above the Martian datum, nearly three times the height of Mount Everest.'
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
          <i class="fa-solid fa-book-journal-whills"></i> VIEW NASA TECHNICAL DOSSIER
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

  // Configurable EVA mission parameters and local persistence key
  const STORAGE_KEY_EVA = 'MARTE_MISSION_STATE_V1';
  const btnUndoPoint = document.getElementById('btn-undo-point');
  const evaCrewSelect = document.getElementById('eva-crew-size');
  const evaModeSelect = document.getElementById('eva-transport-mode');
  const evaWindowSelect = document.getElementById('eva-departure-window');

  let evaConfig = {
    crewSize: 2,
    transportMode: 'rover', // 'rover' | 'foot'
    departureWindow: 'morning' // 'morning' | 'afternoon' | 'night'
  };

  function saveMissionStateToStorage() {
    try {
      const payload = {
        routeKey: currentRouteKey,
        roverProgress,
        evaConfig,
        customRouteData: activeRouteData.id === 'custom' ? activeRouteData : null
      };
      localStorage.setItem(STORAGE_KEY_EVA, JSON.stringify(payload));
    } catch {
      // Ignore if storage is restricted in private browsing mode
    }
  }

  function restoreMissionStateFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_EVA);
      if (!raw) return false;
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== 'object') return false;

      if (saved.evaConfig && typeof saved.evaConfig === 'object') {
        evaConfig = {
          crewSize: Number(saved.evaConfig.crewSize) || 2,
          transportMode: saved.evaConfig.transportMode === 'foot' ? 'foot' : 'rover',
          departureWindow: ['morning', 'afternoon', 'night'].includes(saved.evaConfig.departureWindow)
            ? saved.evaConfig.departureWindow
            : 'morning'
        };
        if (evaCrewSelect) evaCrewSelect.value = String(evaConfig.crewSize);
        if (evaModeSelect) evaModeSelect.value = evaConfig.transportMode;
        if (evaWindowSelect) evaWindowSelect.value = evaConfig.departureWindow;
      }

      const targetProgress =
        typeof saved.roverProgress === 'number' && !Number.isNaN(saved.roverProgress)
          ? Math.max(0, Math.min(100, Math.round(saved.roverProgress)))
          : 33;

      if (
        saved.routeKey === 'custom' &&
        saved.customRouteData &&
        Array.isArray(saved.customRouteData.waypoints) &&
        saved.customRouteData.waypoints.length >= 2
      ) {
        currentRouteKey = 'custom';
        activeRouteData = saved.customRouteData;
        if (routeSelector) routeSelector.value = 'custom';
        recalculateRouteMetricsFromWaypoints(false);
        rebuildRegionalNasaLayers('custom');
        renderRouteOnMap(false);
        syncLayersWithCheckboxes();
        updateRoverProgress(targetProgress);
        if (typeof updateRegionalWeatherPanel === 'function') {
          updateRegionalWeatherPanel('custom');
        }
        return true;
      }

      if (saved.routeKey && ROUTES_CATALOG[saved.routeKey]) {
        if (routeSelector) routeSelector.value = saved.routeKey;
        loadRoute(saved.routeKey, false);
        updateRoverProgress(targetProgress);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  // Modelo hipsométrico MOLA regional (calibra cuencas reales: Jezero, Gale/Sharp, Valles Marineris, Olympus, Hellas y dicotomía global)
  function estimateNumericAltitude(lat, lng) {
    // 1. Cuenca del Cráter Jezero y Canal Neretva Vallis
    const dJezero = Math.hypot(lat - 18.45, lng - 77.42);
    if (dJezero < 1.2) {
      const rimRise = dJezero > 0.36 ? (dJezero - 0.36) * 1450 : 0;
      const westSlope = (77.52 - lng) * 1650;
      return Math.round(-2555 + westSlope + rimRise);
    }

    // 2. Cráter Gale y ascenso central de Aeolis Mons (Monte Sharp: hasta +950 m sobre datum, piso -4500 m)
    const dGale = Math.hypot(lat - -5.08, lng - 137.85);
    if (dGale < 1.4) {
      const sharpPeak = Math.max(0, 1 - dGale / 0.42) * 5150;
      const craterFloor = -4520 + Math.max(0, dGale - 0.65) * 2600;
      return Math.round(craterFloor + sharpPeak);
    }

    // 3. Sistema de cañones Valles Marineris (Coprates Chasma: trinchera axial de -4200 m a meseta de +1800 m)
    if (lat >= -18 && lat <= -9 && lng >= -68 && lng <= -52) {
      const canyonAxisLat = -13.85 + (lng + 60) * 0.12;
      const distToAxis = Math.abs(lat - canyonAxisLat);
      const trenchDepth = distToAxis < 0.45
        ? -4150 + distToAxis * 2200
        : Math.min(1850, -3160 + (distToAxis - 0.45) * 6800);
      return Math.round(trenchDepth);
    }

    // 4. Escudo volcánico de Olympus Mons (+21,229 m)
    const dOlympus = Math.hypot(lat - 18.65, lng - -133.8);
    if (dOlympus < 4.0) {
      return Math.round(1800 + Math.max(0, 1 - dOlympus / 3.8) * 19400);
    }

    // 5. Cuenca de impacto Hellas Planitia (-7,150 m)
    const dHellas = Math.hypot(lat - -42.4, lng - 70.5);
    if (dHellas < 12) {
      return Math.round(-7150 + (dHellas / 12) * 5800);
    }

    // 6. Dicotomía cortical global marciana (Tierras bajas boreales vs. Tierras altas australes)
    const dichotomyBase = -1450 - Math.tanh(lat / 22) * 2350;
    const tharsisBulge = Math.exp(-(((lat - 2) ** 2) / 900 + ((lng + 108) ** 2) / 1600)) * 4600;
    const mesoRelief = Math.sin(lat * 0.24) * 380 + Math.cos(lng * 0.19) * 340;
    return Math.round(dichotomyBase + tharsisBulge + mesoRelief);
  }

  // Interpola la posición (lat, lng, elev) del Rover por DISTANCIA GEODÉSICA ACUMULADA REAL (km)
  function interpolateRoverPosition(pathCoords, pct) {
    if (!pathCoords || pathCoords.length === 0) {
      return { lat: JEZERO_CENTER[0], lng: JEZERO_CENTER[1], elev: -2490, segIndex: 0 };
    }
    if (pathCoords.length === 1 || pct <= 0) {
      return { lat: pathCoords[0][0], lng: pathCoords[0][1], elev: pathCoords[0][2], segIndex: 0 };
    }
    if (pct >= 100) {
      const last = pathCoords[pathCoords.length - 1];
      return { lat: last[0], lng: last[1], elev: last[2], segIndex: pathCoords.length - 2 };
    }

    const cumKm = [0];
    for (let i = 1; i < pathCoords.length; i++) {
      const d = computeMarsDistanceKm(pathCoords[i - 1], pathCoords[i]);
      cumKm.push(cumKm[i - 1] + d);
    }
    const totalKm = cumKm[cumKm.length - 1];
    if (totalKm <= 0.0001) {
      return { lat: pathCoords[0][0], lng: pathCoords[0][1], elev: pathCoords[0][2], segIndex: 0 };
    }

    const targetKm = (pct / 100) * totalKm;
    let idx = 0;
    for (let i = 0; i < cumKm.length - 1; i++) {
      if (targetKm >= cumKm[i] && targetKm <= cumKm[i + 1]) {
        idx = i;
        break;
      }
    }

    const segLen = Math.max(1e-6, cumKm[idx + 1] - cumKm[idx]);
    const t = Math.max(0, Math.min(1, (targetKm - cumKm[idx]) / segLen));
    const p1 = pathCoords[idx];
    const p2 = pathCoords[idx + 1];

    return {
      lat: p1[0] + (p2[0] - p1[0]) * t,
      lng: p1[1] + (p2[1] - p1[1]) * t,
      elev: Math.round(p1[2] + (p2[2] - p1[2]) * t),
      segIndex: idx
    };
  }

  // Converts any edited route (drag/delete) into a custom route and recalculates distances, elevations, and slopes
  function recalculateRouteMetricsFromWaypoints(convertToCustom = false) {
    if (convertToCustom && activeRouteData.id !== 'custom') {
      activeRouteData.id = 'custom';
      activeRouteData.code = 'CUSTOM-EVA';
      activeRouteData.title = 'Custom Tactical Exploration';
      activeRouteData.sector = 'Sector: Route Adjusted by Mission Commander';
      activeRouteData.difficulty = 'CUSTOM';
      currentRouteKey = 'custom';
      if (routeSelector) routeSelector.value = 'custom';
    }

    let cumDist = 0;
    let maxSlope = 4.0;
    const newPathCoords = [];

    activeRouteData.waypoints.forEach((wp, i) => {
      const lat = Number(wp.coords[0]);
      const lng = Number(wp.coords[1]);
      const elev = typeof wp.elev === 'number' ? wp.elev : estimateNumericAltitude(lat, lng);
      wp.coords = [lat, lng];
      wp.elev = elev;

      if (i > 0) {
        const prev = activeRouteData.waypoints[i - 1];
        const segKm = computeMarsDistanceKm(prev.coords, wp.coords);
        cumDist += segKm;
        const dElev = Math.abs(elev - prev.elev);
        const segMeters = Math.max(segKm * 1000, 1);
        const localSlope = Math.min(35, ((Math.atan(dElev / segMeters) * 180) / Math.PI) * 2.2 + 3.2);
        maxSlope = Math.max(maxSlope, localSlope);
      }
      wp.km = cumDist;
      newPathCoords.push([lat, lng, elev]);
    });

    activeRouteData.pathCoords = newPathCoords;
    activeRouteData.totalDistKm = cumDist;
    activeRouteData.maxSlopeDeg = Number(maxSlope.toFixed(1));
    activeRouteData.slopeStatus =
      maxSlope > 24 ? 'CRITICAL' : maxSlope > 16 ? 'CAUTION' : 'SAFE';

    if (newPathCoords.length > 0) {
      const mid = newPathCoords[Math.floor(newPathCoords.length / 2)];
      activeRouteData.center = [mid[0], mid[1]];
    }

    if (routeDifficultyEl) routeDifficultyEl.textContent = activeRouteData.difficulty;
    if (routeMaxSlopeEl) {
      routeMaxSlopeEl.textContent = `${activeRouteData.maxSlopeDeg.toFixed(1)}° (${activeRouteData.slopeStatus})`;
    }
    if (missionTitleEl) missionTitleEl.textContent = activeRouteData.title;
    if (missionSectorEl) missionSectorEl.textContent = activeRouteData.sector;
    if (missionDescEl) missionDescEl.textContent = activeRouteData.desc;

    saveMissionStateToStorage();
  }

  function removeWaypointAtIndex(index) {
    if (!activeRouteData.waypoints || activeRouteData.waypoints.length <= 2) return;
    stopRoverSimulation();
    activeRouteData.waypoints.splice(index, 1);
    recalculateRouteMetricsFromWaypoints(true);
    renderRouteOnMap(false);
    updateRoverProgress(roverProgress);
    if (typeof playHudTone === 'function') playHudTone(440, 0.06, 'triangle');
  }

  // Algoritmo Ray-Casting (Point-in-Polygon) para detectar cruce con polígonos geológicos NASA
  function isPointInPolygon(point, polygonCoords) {
    const [lat, lng] = point;
    let inside = false;
    for (let i = 0, j = polygonCoords.length - 1; i < polygonCoords.length; j = i++) {
      const [latI, lngI] = polygonCoords[i];
      const [latJ, lngJ] = polygonCoords[j];
      const intersect =
        lngI > lng !== lngJ > lng &&
        lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI + 1e-12) + latI;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  // Evalúa intersecciones reales de la ruta activa contra Tormentas, Riesgo Geológico y Depósitos de Hielo ISRU
  function evaluateRouteEnvironmentalHazards() {
    const center = activeRouteData?.center || JEZERO_CENTER;
    const regionKey = REGIONAL_LAYERS_DB[currentRouteKey] ? currentRouteKey : 'jezero-alpha';
    const regionData =
      currentRouteKey === 'custom' && !REGIONAL_LAYERS_DB[currentRouteKey]
        ? buildProceduralSectorLayers(center[0], center[1])
        : REGIONAL_LAYERS_DB[regionKey];

    const isWeatherOn = document.getElementById('toggle-weather')?.checked ?? true;
    const isGeolOn = document.getElementById('toggle-geol')?.checked ?? true;
    const isResOn = document.getElementById('toggle-res')?.checked ?? true;

    let crossesStormCore = false;
    let crossesStormOuter = false;
    let crossesHazardGeol = null;
    let reachedIsruDepot = null;

    // Muestrear puntos a lo largo del porcentaje recorrido actual (0% -> roverProgress%)
    const steps = Math.max(4, Math.ceil(roverProgress / 5));
    for (let s = 0; s <= steps; s++) {
      const samplePct = (s / steps) * roverProgress;
      const pt = interpolateRoverPosition(activeRouteData.pathCoords, samplePct);
      const coord = [pt.lat, pt.lng];

      if (isWeatherOn && regionData.weather) {
        const dStormMeters = computeMarsDistanceKm(coord, regionData.weather.coords) * 1000;
        if (dStormMeters <= regionData.weather.innerRadius) crossesStormCore = true;
        else if (dStormMeters <= regionData.weather.outerRadius) crossesStormOuter = true;
      }

      if (isGeolOn && Array.isArray(regionData.geology)) {
        for (const unit of regionData.geology) {
          const isHighRisk =
            unit.color === '#ef5350' ||
            /caution|hazard|risk|dune|scarp|fault|landslide|precauci|riesgo|duna|escarpe|falla/i.test(unit.desc);
          if (isHighRisk && isPointInPolygon(coord, unit.coords)) {
            crossesHazardGeol = unit.name;
          }
        }
      }

      if (isResOn && Array.isArray(regionData.resources)) {
        for (const res of regionData.resources) {
          const dResMeters = computeMarsDistanceKm(coord, res.coords) * 1000;
          if (dResMeters <= res.radius) {
            reachedIsruDepot = res.name;
          }
        }
      }
    }

    return {
      isWeatherOn,
      crossesStormCore,
      crossesStormOuter,
      crossesHazardGeol,
      reachedIsruDepot
    };
  }

  // Dibuja la ruta activa y sus waypoints ARRASTRABLES (draggable: true) en el mapa de Leaflet
  function renderRouteOnMap(flyToRoute = false) {
    dynamicRouteLayerGroup.clearLayers();

    const latLngs = activeRouteData.pathCoords.map((p) => [p[0], p[1]]);

    if (latLngs.length >= 2) {
      L.polyline(latLngs, {
        color: '#FF6B2B',
        weight: 9,
        opacity: 0.25,
        lineCap: 'round'
      }).addTo(dynamicRouteLayerGroup);

      L.polyline(latLngs, {
        color: '#FF6B2B',
        weight: 3.5,
        opacity: 0.9,
        dashArray: '10, 8'
      })
        .bindTooltip(`ACTIVE ROUTE: ${activeRouteData.code} (${activeRouteData.totalDistKm.toFixed(1)} km)`, {
          sticky: true,
          className: 'cyber-leaflet-tooltip'
        })
        .addTo(dynamicRouteLayerGroup);

      routeTraveledLine = L.polyline([], {
        color: '#00e5ff',
        weight: 4,
        opacity: 0.95
      }).addTo(dynamicRouteLayerGroup);
    }

    const canDeleteWp = activeRouteData.waypoints.length > 2;

    activeRouteData.waypoints.forEach((wp, index) => {
      const isStart = index === 0;
      const isEnd = index === activeRouteData.waypoints.length - 1 && activeRouteData.waypoints.length > 1;
      const markerType = isStart ? 'start' : isEnd ? 'base' : 'waypoint';
      const iconClass = isStart ? 'fa-rocket' : isEnd ? 'fa-campground' : 'fa-flask';

      const wpMarker = L.marker(wp.coords, {
        draggable: true,
        icon: L.divIcon({
          className: 'hud-custom-div-icon',
          html: `
            <div class="hud-site-marker marker-${markerType}" title="Drag to readjust this point live">
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
          <div class="hp-kicker">WAYPOINT 0${index + 1} // DRAGGABLE ON MAP</div>
          <h4 class="hp-title">${wp.name}</h4>
          <p class="hp-desc">${wp.sub}</p>
          <div class="hp-meta">
            <span>KM: ${wp.km.toFixed(1)}</span>
            <span>ALT: ${wp.elev.toLocaleString('en-US')}m</span>
          </div>
          <button type="button" class="hp-action-btn" data-open-360="wp-${index}">
            <i class="fa-solid fa-vr-cardboard"></i> EXPLORE IN 360° STREET VIEW
          </button>
          ${
            canDeleteWp
              ? `<button type="button" class="hp-action-btn secondary" data-delete-wp="${index}">
                   <i class="fa-solid fa-trash-can"></i> REMOVE THIS WAYPOINT
                 </button>`
              : ''
          }
        </div>
      `);

      wpMarker.on('dragend', (ev) => {
        const newPos = ev.target.getLatLng();
        const newElev = estimateNumericAltitude(newPos.lat, newPos.lng);
        activeRouteData.waypoints[index].coords = [newPos.lat, newPos.lng];
        activeRouteData.waypoints[index].elev = newElev;
        activeRouteData.waypoints[index].sub = `LAT ${newPos.lat.toFixed(3)}° LON ${newPos.lng.toFixed(3)}°`;
        recalculateRouteMetricsFromWaypoints(true);
        renderRouteOnMap(false);
        updateRoverProgress(roverProgress);
        if (typeof playHudTone === 'function') playHudTone(710, 0.06, 'sine');
      });

      dynamicRouteLayerGroup.addLayer(wpMarker);
    });

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
        <div class="hp-kicker">LIVE MOBILE UNIT TELEMETRY</div>
        <h4 class="hp-title">EVA Unit M.A.R.T.E 01</h4>
        <p class="hp-desc">Current progress: ${roverProgress}% of route ${activeRouteData.code}. Crew: ${evaConfig.crewSize} astronauts.</p>
        <button type="button" class="hp-action-btn" data-open-360="rover-live">
          <i class="fa-solid fa-vr-cardboard"></i> OPEN ROVER 360° CAMERA
        </button>
      </div>
    `);

    dynamicRouteLayerGroup.addLayer(liveRoverMarker);

    if (flyToRoute && activeRouteData.center) {
      const isMapVisible =
        mapContainer && !mapContainer.classList.contains('is-hidden') && mapContainer.clientWidth > 0;
      try {
        if (isMapVisible) {
          marsMap.flyTo(activeRouteData.center, activeRouteData.zoom || 8, { duration: 1.1 });
        } else {
          marsMap.setView(activeRouteData.center, activeRouteData.zoom || 8, { animate: false });
        }
      } catch {
        // Ignore Leaflet layout errors while map container is hidden
      }
    }
  }

  // Renderiza la lista de Waypoints con botón individual de borrado (×)
  function renderWaypointsTimeline() {
    if (!waypointsListEl) return;
    const traveledKm = (roverProgress / 100) * activeRouteData.totalDistKm;
    const canDelete = activeRouteData.waypoints.length > 2;

    waypointsListEl.innerHTML = '';

    activeRouteData.waypoints.forEach((wp, idx) => {
      const isLast = idx === activeRouteData.waypoints.length - 1;
      let nodeStatus = 'status-pending';
      let badgeClass = isLast ? 'target' : 'next';
      let badgeText = isLast ? 'DESTINATION' : 'PENDING';

      if (traveledKm >= wp.km + 0.4 || (roverProgress === 100 && isLast)) {
        nodeStatus = 'status-completed';
        badgeClass = 'done';
        badgeText = 'COMPLETED';
      } else if (Math.abs(traveledKm - wp.km) <= 2.2) {
        nodeStatus = 'status-active';
        badgeClass = 'current';
        badgeText = 'CURRENT POSITION';
      }

      const li = document.createElement('li');
      li.className = `waypoint-node ${nodeStatus}`;
      li.style.cursor = 'pointer';
      li.innerHTML = `
        <div class="wp-marker">${String(idx + 1).padStart(2, '0')}</div>
        <div class="wp-content">
          <div class="wp-row">
            <strong>${wp.name}</strong>
            <span class="wp-actions-inline">
              <span class="wp-badge ${badgeClass}">${badgeText}</span>
              ${
                canDelete
                  ? `<button type="button" class="wp-delete-btn" title="Remove this point" aria-label="Remove ${wp.name}">
                       <i class="fa-solid fa-xmark"></i>
                     </button>`
                  : ''
              }
            </span>
          </div>
          <span class="wp-sub">${wp.sub} &bull; KM ${wp.km.toFixed(1)} (${wp.elev}m)</span>
        </div>
      `;

      const delBtn = li.querySelector('.wp-delete-btn');
      if (delBtn) {
        delBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          removeWaypointAtIndex(idx);
        });
      }

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

  // Renderiza el Gráfico SVG del Perfil de Elevación Topográfica proporcional a la distancia acumulada
  function renderElevationProfileSVG() {
    const coords = activeRouteData.pathCoords;
    if (!coords || coords.length === 0) return;

    const elevations = coords.map((c) => c[2]);
    const minElev = Math.min(...elevations);
    const maxElev = Math.max(...elevations);
    const deltaElev = Math.max(maxElev - minElev, 40);

    if (elevTitleEl) {
      elevTitleEl.innerHTML = `<i class="fa-solid fa-chart-area text-orange"></i> TOPOGRAPHIC ELEVATION PROFILE // ROUTE: ${activeRouteData.code}`;
    }
    if (elevMetaEl) {
      const sign = maxElev >= minElev ? '+' : '';
      elevMetaEl.innerHTML = `ALTITUDE: ${minElev.toLocaleString('en-US')}m to ${maxElev.toLocaleString('en-US')}m (&Delta; ${sign}${maxElev - minElev}m)`;
    }

    const svgWidth = 600;
    const topY = 12;
    const bottomY = 66;
    const bottomBase = 78;

    const cumKm = [0];
    for (let i = 1; i < coords.length; i++) {
      cumKm.push(cumKm[i - 1] + computeMarsDistanceKm(coords[i - 1], coords[i]));
    }
    const totalPathKm = Math.max(cumKm[cumKm.length - 1], 0.001);

    const svgPoints = coords.map((c, idx) => {
      const x = coords.length === 1 ? 0 : Math.round((cumKm[idx] / totalPathKm) * svgWidth);
      const norm = (c[2] - minElev) / deltaElev;
      const y = Math.round(bottomY - norm * (bottomY - topY));
      return { x, y, elev: c[2] };
    });

    if (svgPoints.length >= 2) {
      const pathD = svgPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`).join(' ');
      const polyPts =
        `0,${bottomBase} ` +
        svgPoints.map((pt) => `${pt.x},${pt.y}`).join(' ') +
        ` ${svgWidth},${bottomBase}`;

      if (elevPath) elevPath.setAttribute('d', pathD);
      if (elevPolygon) elevPolygon.setAttribute('points', polyPts);
    }

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
      elevRoverLabel.textContent = `CURRENT ROVER (KM ${traveledKm} | ${roverPos.elev.toLocaleString('en-US')}m)`;
    }
  }

  // ==========================================================================
  // 5. MOTOR DE TELEMETRÍA CON INTERSECCIÓN DE CAPAS NASA Y PARÁMETROS EVA
  // ==========================================================================
  function updateSurvivalTelemetry() {
    const totalKm = activeRouteData.totalDistKm;
    const traveledKm = (roverProgress / 100) * totalKm;
    const remainingKm = Math.max(0, totalKm - traveledKm);

    const env = evaluateRouteEnvironmentalHazards();

    // Modificadores por Parámetros Configurables de Misión EVA
    const crewFactor = evaConfig.crewSize / 2; // Calibrado base = 2 astronautas
    const isFootEva = evaConfig.transportMode === 'foot';
    const modeO2Mult = isFootEva ? 1.55 : 1.0;
    const modeBattMult = isFootEva ? 0.65 : 1.0; // PLSS de traje vs tracción de Rover
    const speedBase = isFootEva ? 1.45 : activeRouteData.avgSpeedKmh;

    const departureSolarMult =
      evaConfig.departureWindow === 'morning'
        ? 0.88 // +12% eficiencia solar matutina
        : evaConfig.departureWindow === 'night'
        ? 1.38 // Sin sol + calefactores nocturnos a -84°C
        : 1.0;

    // Modificadores espaciales dinámicos por capas científicas NASA
    const stormPenalty = env.crossesStormCore
      ? 1.35
      : env.crossesStormOuter
      ? 1.22
      : env.isWeatherOn
      ? 1.12
      : 1.0;
    const geolTractionPenalty = env.crossesHazardGeol ? 1.15 : 1.0;
    const isruO2BonusPct = env.reachedIsruDepot ? 16 : 0; // Recarga criogénica ISRU H₂O -> O₂
    const isruBattBonusPct = env.reachedIsruDepot ? 8 : 0;

    const effectiveSpeedKmh = Math.max(
      0.8,
      speedBase * (env.crossesStormCore ? 0.82 : 1.0) * (env.crossesHazardGeol ? 0.88 : 1.0)
    );

    // 1. Oxígeno Consumido (%)
    const slopeFactor = 1 + Math.max(0, activeRouteData.maxSlopeDeg - 10) * (isFootEva ? 0.042 : 0.025);
    const rawO2Consumed =
      4 +
      traveledKm * activeRouteData.baseO2RatePerKm * slopeFactor * crewFactor * modeO2Mult * geolTractionPenalty -
      isruO2BonusPct;
    const o2ConsumedPct = Math.max(2, Math.min(99, Math.round(rawO2Consumed)));
    const o2ReservePct = Math.max(1, 100 - o2ConsumedPct);
    const o2KgRate = (0.42 * evaConfig.crewSize * slopeFactor * modeO2Mult).toFixed(2);

    if (metricOxygen) metricOxygen.textContent = o2ConsumedPct;
    if (metricOxygenReserve) {
      metricOxygenReserve.textContent = env.reachedIsruDepot
        ? `RESERVE: ${o2ReservePct}% (+ISRU)`
        : `RESERVE: ${o2ReservePct}%`;
    }
    if (metricOxygenRate) {
      metricOxygenRate.textContent =
        o2ConsumedPct > 72
          ? `High Consumption! (${o2KgRate} kg/h • ${evaConfig.crewSize} PAX)`
          : `${o2KgRate} kg/h (${evaConfig.crewSize} Astronauts)`;
    }
    if (barOxygen) barOxygen.style.width = `${o2ConsumedPct}%`;
    if (cardOxygen) cardOxygen.classList.toggle('alert-critical', o2ConsumedPct >= 75);

    // 2. Battery (%)
    const effectiveBattRate =
      activeRouteData.baseBatteryPerKm * modeBattMult * departureSolarMult * stormPenalty * geolTractionPenalty;
    const batteryDrain = traveledKm * effectiveBattRate - isruBattBonusPct;
    const batteryRemainingPct = Math.max(3, Math.min(100, Math.round(100 - batteryDrain)));
    const remainingAutonomyKm = (batteryRemainingPct / Math.max(0.25, effectiveBattRate)).toFixed(1);

    if (metricBattery) metricBattery.textContent = batteryRemainingPct;
    if (metricBatteryTag) {
      metricBatteryTag.textContent = env.crossesStormCore
        ? 'CORE STORM (-35%)'
        : evaConfig.departureWindow === 'night'
        ? 'NIGHT MODE (MMRTG)'
        : env.isWeatherOn
        ? 'SOLAR ATTENUATED (DUST)'
        : 'MMRTG + SOLAR OPTIMAL';
    }
    if (metricBatteryRange) metricBatteryRange.textContent = `Range: ${remainingAutonomyKm} km`;
    if (barBattery) barBattery.style.width = `${batteryRemainingPct}%`;
    if (cardBattery) cardBattery.classList.toggle('alert-critical', batteryRemainingPct <= 25);

    // 3. Distance (km)
    if (metricDistance) metricDistance.textContent = totalKm.toFixed(1);
    if (metricDistanceTraveled) metricDistanceTraveled.textContent = `TRAVELED: ${traveledKm.toFixed(1)} KM`;
    if (metricDistanceRemaining) metricDistanceRemaining.textContent = `Remaining: ${remainingKm.toFixed(1)} km`;
    if (barDistance) barDistance.style.width = `${roverProgress}%`;

    // 4. Estimated Time
    const totalHours = totalKm / effectiveSpeedKmh;
    const hrs = Math.floor(totalHours);
    const mins = Math.round((totalHours - hrs) * 60);
    const formattedTime = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

    const remHours = remainingKm / effectiveSpeedKmh;
    const remH = Math.floor(remHours);
    const remM = Math.round((remHours - remH) * 60);

    if (metricTime) metricTime.textContent = formattedTime;
    if (metricSpeedTag) {
      metricSpeedTag.textContent = `${isFootEva ? 'FOOT EVA' : 'ROVER'}: ${effectiveSpeedKmh.toFixed(1)} KM/H`;
    }
    if (metricTimeSub) {
      metricTimeSub.textContent =
        roverProgress >= 100
          ? 'Destination reached successfully!'
          : totalHours > 8.5 || evaConfig.departureWindow === 'night'
          ? `⚠ ${remH}h ${remM}m left (Nocturnal thermal exposure)`
          : `${remH}h ${remM}m left (Before sunset)`;
    }
    if (barTime) {
      const timeLoadPct = Math.min(100, Math.round((totalHours / 12) * 100));
      barTime.style.width = `${timeLoadPct}%`;
    }

    // 4.5. Ionizing Radiation (GCR + SPE) calibrated with NASA Curiosity RAD data
    const elapsedHours = traveledKm / effectiveSpeedKmh;
    const baseGcrRate = 0.027; // Average mSv/h on the Martian surface

    // Shielding attenuation: Pressurized Rover attenuates ~38%, Foot EVA suit only ~5%
    const shieldingMult = isFootEva ? 0.95 : 0.62;

    // Departure window and solar activity (SPE) modifier
    const solarWindowMult =
      evaConfig.departureWindow === 'night'
        ? 0.85 // No direct nocturnal solar component (GCR only)
        : evaConfig.departureWindow === 'morning'
        ? 0.95
        : 1.15; // Midday / Peak solar exposure

    // Particle spike if crossing storm core or active SPE event
    const speSpike = env.crossesStormCore ? 0.16 : env.crossesStormOuter ? 0.06 : 0;

    // Effective absorbed crew rate (mSv/h) and accumulated dose (mSv)
    const radiationRateMsvH = Number(((baseGcrRate * solarWindowMult + speSpike) * shieldingMult).toFixed(3));
    const accumulatedDoseMsv = Number((radiationRateMsvH * elapsedHours).toFixed(2));
    const projectedTotalDoseMsv = Number((accumulatedDoseMsv + radiationRateMsvH * remHours).toFixed(2));
    const isRadiationCritical = radiationRateMsvH >= 0.08 || projectedTotalDoseMsv >= 2.5;

    // Update the right-hand weather panel radiation reading
    const metricRadEl =
      document.getElementById('wc-uv-val') ||
      document.getElementById('weather-uv-value') ||
      document.querySelector('[data-metric="radiation"]');
    if (metricRadEl) {
      metricRadEl.textContent = `${radiationRateMsvH.toFixed(2)} mSv/h`;
    }

    // 5. Intelligent Dynamic Directive based on NASA Layer Intersections
    if (directiveBoxEl && directiveTitleEl && directiveTextEl) {
      const hazards = [];
      if (env.crossesStormCore || env.crossesStormOuter) {
        hazards.push('Active dust storm front crossing');
      }
      if (env.crossesHazardGeol) {
        hazards.push(`Hazard terrain (${env.crossesHazardGeol})`);
      }
      if (isRadiationCritical) {
        hazards.push(
          `Elevated ionizing radiation (${radiationRateMsvH.toFixed(2)} mSv/h • Accum dose: ${accumulatedDoseMsv} mSv)`
        );
      }

      if (
        o2ConsumedPct >= 75 ||
        batteryRemainingPct <= 25 ||
        activeRouteData.maxSlopeDeg >= 25 ||
        env.crossesStormCore ||
        isRadiationCritical
      ) {
        directiveBoxEl.classList.add('alert-mode');
        directiveTitleEl.textContent =
          isRadiationCritical && !env.crossesStormCore
            ? '☢ SURFACE RADIATION ALERT:'
            : '⚠ TACTICAL SURVIVAL ALERT:';

        directiveTextEl.textContent =
          `${hazards.length ? hazards.join(' • ') + '. ' : ''}` +
          `O₂: ${o2ConsumedPct}% | Bat: ${batteryRemainingPct}% | EVA Dose: ${accumulatedDoseMsv} mSv. ` +
          `${
            isRadiationCritical
              ? isFootEva
                ? 'Board Pressurized Rover or evacuate to Subsurface Cliffside Shelter.'
                : 'Rover shielding active (-38%). Proceed to Subsurface Cliffside Shelter.'
              : env.reachedIsruDepot
              ? `ISRU resupply active at ${env.reachedIsruDepot}.`
              : 'Head to a nearby ISRU ice deposit.'
          }`;
      } else {
        directiveBoxEl.classList.remove('alert-mode');
        directiveTitleEl.textContent = env.reachedIsruDepot
          ? '✓ ISRU RESUPPLY CONNECTED:'
          : 'SURVIVAL DIRECTIVE:';
        directiveTextEl.textContent = env.reachedIsruDepot
          ? `H₂O/O₂ extraction validated at "${env.reachedIsruDepot}" (+16% O₂ reserve). ${hazards.length ? 'Attention: ' + hazards.join(', ') + '.' : 'Systems nominal.'}`
          : `${hazards.length ? 'Route caution: ' + hazards.join(' • ') + '. ' : ''}O₂ reserve at ${o2ReservePct}% for ${evaConfig.crewSize} astronauts • Accum rad dose: ${accumulatedDoseMsv} mSv.`;
      }
    }

    if (typeof refreshEvaManifestPreview === 'function' && document.getElementById('mission-dossier-dialog')?.open) {
      refreshEvaManifestPreview();
    }
  }

  function syncSliderCSSVariables() {
    if (!roverSlider) return;
    roverSlider.style.setProperty('--attr-min', roverSlider.min || 0);
    roverSlider.style.setProperty('--attr-max', roverSlider.max || 100);
    roverSlider.style.setProperty('--control-value', roverSlider.value);
    roverSlider.setAttribute(
      'aria-valuetext',
      `${roverSlider.value} percent of route completed`
    );
  }

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

    if (liveRoverMarker) {
      liveRoverMarker.setLatLng([pos.lat, pos.lng]);
      const labelSpan = liveRoverMarker.getElement()?.querySelector('.hsm-label');
      if (labelSpan) {
        labelSpan.textContent = `ROVER (${roverProgress}%)`;
      }
    }

    if (routeTraveledLine && activeRouteData.pathCoords.length >= 2) {
      const traveledLatLngs = activeRouteData.pathCoords
        .slice(0, pos.segIndex + 1)
        .map((c) => [c[0], c[1]]);
      traveledLatLngs.push([pos.lat, pos.lng]);
      routeTraveledLine.setLatLngs(traveledLatLngs);
    }

    renderWaypointsTimeline();
    renderElevationProfileSVG();
    updateSurvivalTelemetry();
    saveMissionStateToStorage();

    if (typeof updateRoverVisionConeOnMap === 'function') {
      updateRoverVisionConeOnMap();
    }
    if (typeof syncStreetViewToRoverProgress === 'function') {
      syncStreetViewToRoverProgress();
    }
  }

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

    activeRouteData = structuredClone(ROUTES_CATALOG[routeKey] || ROUTES_CATALOG['jezero-alpha']);

    if (routeDifficultyEl) routeDifficultyEl.textContent = activeRouteData.difficulty;
    if (routeMaxSlopeEl) {
      routeMaxSlopeEl.textContent = `${activeRouteData.maxSlopeDeg.toFixed(1)}° (${activeRouteData.slopeStatus})`;
    }
    if (missionTitleEl) missionTitleEl.textContent = activeRouteData.title;
    if (missionSectorEl) missionSectorEl.textContent = activeRouteData.sector;
    if (missionDescEl) missionDescEl.textContent = activeRouteData.desc;

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
  // 6. EVENTOS DE CONTROL DE RUTAS, PARÁMETROS EVA Y EDICIÓN EN EL MAPA
  // ==========================================================================
  if (routeSelector) {
    routeSelector.addEventListener('change', (e) => {
      loadRoute(e.target.value, true);
    });
  }

  // Eventos de los Parámetros Configurables de Misión EVA
  const onEvaConfigChange = () => {
    evaConfig = {
      crewSize: Number(evaCrewSelect?.value || 2),
      transportMode: evaModeSelect?.value || 'rover',
      departureWindow: evaWindowSelect?.value || 'morning'
    };
    updateSurvivalTelemetry();
    saveMissionStateToStorage();
    if (typeof playHudTone === 'function') playHudTone(660, 0.05, 'sine');
  };
  evaCrewSelect?.addEventListener('change', onEvaConfigChange);
  evaModeSelect?.addEventListener('change', onEvaConfigChange);
  evaWindowSelect?.addEventListener('change', onEvaConfigChange);

  if (roverSlider) {
    roverSlider.addEventListener('input', (e) => {
      stopRoverSimulation();
      updateRoverProgress(Number(e.target.value));
    });
  }

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
      if (isScrubbingElev) scrubFromPointer(e.clientX);
    });
    window.addEventListener('pointerup', () => {
      isScrubbingElev = false;
    });
  }

  function stopRoverSimulation() {
    if (simIntervalId) {
      clearInterval(simIntervalId);
      simIntervalId = null;
    }
    if (btnPlaySim) {
      btnPlaySim.classList.remove('is-playing');
      btnPlaySim.innerHTML = '<i class="fa-solid fa-play"></i> <span>SIMULATE</span>';
    }
  }

  if (btnPlaySim) {
    btnPlaySim.addEventListener('click', () => {
      if (simIntervalId) {
        stopRoverSimulation();
        return;
      }
      if (roverProgress >= 100) updateRoverProgress(0);
      btnPlaySim.classList.add('is-playing');
      btnPlaySim.innerHTML = '<i class="fa-solid fa-pause"></i> <span>PAUSE</span>';

      simIntervalId = setInterval(() => {
        if (roverProgress >= 100) {
          stopRoverSimulation();
          return;
        }
        updateRoverProgress(roverProgress + 1);
      }, 95);
    });
  }

  function toggleCustomDrawingMode(forceState) {
    isCustomDrawing = typeof forceState === 'boolean' ? forceState : !isCustomDrawing;

    if (btnCustomDraw) {
      btnCustomDraw.classList.toggle('is-drawing', isCustomDrawing);
      btnCustomDraw.innerHTML = isCustomDrawing
        ? '<i class="fa-solid fa-check"></i> <span>DRAWING</span>'
        : '<i class="fa-solid fa-pen-ruler"></i> <span>+ DRAW</span>';
    }

    if (isCustomDrawing) {
      if (routeSelector) routeSelector.value = 'custom';
      marsMap.getContainer().style.cursor = 'crosshair';
      if (window.innerWidth <= 820 && typeof setPanelOpen === 'function') {
        setPanelOpen('left', false);
      }
    } else {
      marsMap.getContainer().style.cursor = '';
    }
  }

  if (btnCustomDraw) {
    btnCustomDraw.addEventListener('click', () => toggleCustomDrawingMode());
  }

  // Deshacer el último punto añadido (Botón DESHACER o Ctrl+Z)
  function undoLastWaypoint() {
    if (!activeRouteData.waypoints || activeRouteData.waypoints.length <= 2) return;
    removeWaypointAtIndex(activeRouteData.waypoints.length - 1);
  }

  if (btnUndoPoint) {
    btnUndoPoint.addEventListener('click', undoLastWaypoint);
  }

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && activeRouteData.waypoints.length > 2) {
      e.preventDefault();
      undoLastWaypoint();
    }
  });

  // Delegación para botón de eliminar waypoint dentro de los popups de Leaflet
  document.body.addEventListener('click', (e) => {
    const delWpBtn = e.target.closest('[data-delete-wp]');
    if (delWpBtn) {
      const idx = Number(delWpBtn.getAttribute('data-delete-wp'));
      marsMap.closePopup();
      removeWaypointAtIndex(idx);
    }
  });

  if (btnResetRoute) {
    btnResetRoute.addEventListener('click', () => {
      toggleCustomDrawingMode(false);
      localStorage.removeItem(STORAGE_KEY_EVA);
      const restoreKey = currentRouteKey === 'custom' ? 'jezero-alpha' : currentRouteKey;
      if (routeSelector) routeSelector.value = restoreKey;
      loadRoute(restoreKey, true);
    });
  }

  marsMap.on('click', (e) => {
    if (!isCustomDrawing) return;

    const { lat, lng } = e.latlng;
    const elev = estimateNumericAltitude(lat, lng);

    if (activeRouteData.id !== 'custom') {
      const startPt = activeRouteData.pathCoords[0];
      activeRouteData = {
        id: 'custom',
        code: 'CUSTOM-EVA',
        title: 'Custom Tactical Exploration',
        sector: 'Sector: Manual Track by Mission Commander',
        desc: 'Route manually plotted on NASA orbital cartography. Drag any marker to adjust the route live.',
        difficulty: 'CUSTOM',
        maxSlopeDeg: 8.5,
        slopeStatus: 'CALCULATED',
        avgSpeedKmh: 2.9,
        totalDistKm: 0,
        baseO2RatePerKm: 3.25,
        baseBatteryPerKm: 1.85,
        center: [lat, lng],
        zoom: marsMap.getZoom(),
        pathCoords: [startPt],
        waypoints: [
          {
            name: 'EVA Starting Point',
            sub: `LAT ${startPt[0].toFixed(3)}° LON ${startPt[1].toFixed(3)}°`,
            km: 0.0,
            coords: [startPt[0], startPt[1]],
            elev: startPt[2]
          }
        ]
      };
    }

    const wpNumber = activeRouteData.waypoints.length + 1;
    activeRouteData.waypoints.push({
      name: `Tactical EVA Point ${String(wpNumber).padStart(2, '0')}`,
      sub: `LAT ${lat.toFixed(3)}° LON ${lng.toFixed(3)}°`,
      km: 0,
      coords: [lat, lng],
      elev
    });

    recalculateRouteMetricsFromWaypoints(true);
    rebuildRegionalNasaLayers('custom');
    renderRouteOnMap(false);
    updateRoverProgress(roverProgress);
    if (typeof playHudTone === 'function') playHudTone(760, 0.05, 'sine');
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
      activeLayersCounter.textContent = `${activeCount} ACTIVE`;
    }

    // Recalculate telemetry (e.g. dust storm impact on solar array)
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
    const lngDir = lng >= 0 ? 'E' : 'W';
    const numAlt = estimateNumericAltitude(lat, lng);
    const altStr = `${numAlt > 0 ? '+' : ''}${numAlt.toLocaleString('en-US')}m`;

    if (cursorReadout) {
      cursorReadout.textContent = `LAT: ${Math.abs(lat).toFixed(4)}° ${latDir} | LON: ${Math.abs(lng).toFixed(4)}° ${lngDir} | ALT: ${altStr}`;
    }
  });

  marsMap.on('moveend', () => {
    const center = marsMap.getCenter();
    const latDir = center.lat >= 0 ? 'N' : 'S';
    const lngDir = center.lng >= 0 ? 'E' : 'W';
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

  // Definition of the 6 Step-by-Step 360° Mars Panoramic Stations (Real NASA JPL-Caltech Imagery + 2D Geometry)
  const STREETVIEW_STATIONS = [
    {
      id: 'scene-landing',
      stepNum: '01',
      shortLabel: '01 START (LANDING)',
      title: 'STATION 01: OCTAVIA E. BUTLER LANDING SITE (KM 0.0)',
      sensor: 'NAVCAM + MASTCAM-Z (PERSEVERANCE)',
      routeKey: 'jezero-alpha',
      progressPct: 0,
      coords: [18.28, 77.68],
      elev: -2540,
      initialYaw: 18,
      initialPitch: 0,
      narration: "You have arrived at Octavia Butler landing site. All rover systems operational.",
      realPano: {
        piaId: 'PIA24264',
        sol: 'SOL 3 (MARS 2020)',
        localUrl: 'panoramas/PIA24264-landing.jpg',
        remoteThumbUrl: 'https://images-assets.nasa.gov/image/PIA24264/PIA24264~medium.jpg',
        remoteUrl: 'https://images-assets.nasa.gov/image/PIA24264/PIA24264~large.jpg',
        jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA24264',
        credit: 'NASA/JPL-Caltech/ASU/MSSS — First Mastcam-Z 360° Panorama at Octavia E. Butler Landing (142 stitched images)'
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
        kicker: 'MARS 2020 LANDING BEACON // UHF TELEMETRY',
        title: 'Starting Point: Octavia E. Butler Landing',
        desc: 'Initial touchdown zone on the Máaz Volcanic Unit. Skycrane retro-rocket blast marks visible in the surrounding regolith.',
        dist: 'DIST: 6.2 m',
        comp: 'Basalt / Pyroxene'
      },
      hotspots: [
        {
          pitch: 0,
          yaw: 22,
          kind: 'nav',
          icon: 'fa-circle-arrow-up',
          label: 'ADVANCE STEP 02: KODIAK MESA (KM 4.8)',
          targetScene: 'scene-kodiak'
        },
        {
          pitch: 2,
          yaw: -42,
          kind: 'science',
          icon: 'fa-helicopter',
          label: 'Wright Brothers Field (Ingenuity)',
          kicker: 'PLANETARY AVIATION LOG // INGENUITY',
          desc: 'Flat compacted regolith runway from which the first powered helicopter on another planet took off (72 flights completed).',
          dist: 'DIST: 48.0 m',
          comp: 'Firm Regolith (0% Risk)'
        },
        {
          pitch: -2,
          yaw: 78,
          kind: 'science',
          icon: 'fa-microscope',
          label: '"Máaz" Igneous Outcrop',
          kicker: 'PIXL SPECTROMETER // X-RAY',
          desc: 'Vesicular basaltic rock coated with ferric dust and perchlorate salts. Indicates ancient volcanic activity followed by aqueous alteration.',
          dist: 'DIST: 3.4 m',
          comp: 'FeO / MgO / Olivine'
        }
      ]
    },
    {
      id: 'scene-kodiak',
      stepNum: '02',
      shortLabel: '02 KODIAK MESA',
      title: 'STATION 02: KODIAK MESA SCIENCE STOP (KM 4.8)',
      sensor: 'MASTCAM-Z SUPER-RESOLUTION 110MM',
      routeKey: 'jezero-alpha',
      progressPct: 33,
      coords: [18.38, 77.49],
      elev: -2490,
      initialYaw: 10,
      initialPitch: 0,
      narration: "Arrived at Kodiak Mesa science stop. Geological analysis in progress.",
      realPano: {
        piaId: 'PIA24921',
        sol: 'SOL 466 (MARS 2020)',
        localUrl: 'panoramas/PIA24921-kodiak-delta.jpg',
        remoteThumbUrl: 'https://images-assets.nasa.gov/image/PIA24921/PIA24921~medium.jpg',
        remoteUrl: 'https://images-assets.nasa.gov/image/PIA24921/PIA24921~large.jpg',
        jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA24921',
        credit: 'NASA/JPL-Caltech/ASU/MSSS — Real 2.5-Gigapixel Mosaic of the Jezero Delta Front and Kodiak Butte (1,118 frames)'
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
        kicker: 'PIXL SPECTROMETER / SUPERCAM LASER',
        title: 'Fluvial Stratigraphy: Kodiak Mesa',
        desc: 'Inclined sedimentary beds (foresets) proving the progradation of an ancient river delta into Lake Jezero 3.7 billion years ago.',
        dist: 'DIST: 18.4 m',
        comp: 'SiO₂ / Phyllosilicates'
      },
      hotspots: [
        {
          pitch: 0,
          yaw: 35,
          kind: 'nav',
          icon: 'fa-circle-arrow-up',
          label: 'ADVANCE STEP 03: ISRU ICE DEPOSIT (KM 9.4)',
          targetScene: 'scene-ice'
        },
        {
          pitch: -1,
          yaw: -155,
          kind: 'nav',
          icon: 'fa-circle-arrow-left',
          label: 'GO BACK STEP 01: LANDING SITE (KM 0.0)',
          targetScene: 'scene-landing'
        },
        {
          pitch: 4,
          yaw: -8,
          kind: 'science',
          icon: 'fa-layer-group',
          label: 'Kodiak Deltaic Strata',
          kicker: 'ASTROBIOLOGY // PALEO-LACUSTRINE HORIZON',
          desc: 'Sequence of conglomerates and fine sandstones deposited by low-energy currents. Excellent biosignature preservation potential.',
          dist: 'DIST: 24.5 m',
          comp: 'Smectite Clays / Carbonates'
        },
        {
          pitch: -2,
          yaw: 65,
          kind: 'science',
          icon: 'fa-vial',
          label: 'Titanium Sample Tube #14',
          kicker: 'MARS SAMPLE RETURN PROGRAM // NASA-ESA',
          desc: 'Cylindrical sedimentary rock core hermetically sealed for recovery by the human crew.',
          dist: 'DIST: 2.1 m',
          comp: 'Nominal Hermetic Seal'
        }
      ]
    },
    {
      id: 'scene-ice',
      stepNum: '03',
      shortLabel: '03 ISRU ICE',
      title: 'STATION 03: SUBSURFACE ISRU ICE DEPOSIT (KM 9.4)',
      sensor: 'MASTCAM-Z + RIMFAX RADAR OVERLAY',
      routeKey: 'jezero-alpha',
      progressPct: 65,
      coords: [18.52, 77.33],
      elev: -2435,
      initialYaw: 0,
      initialPitch: 0,
      narration: "Approaching subsurface ice deposit. Resource utilization systems ready.",
      realPano: {
        piaId: 'PIA26369',
        sol: 'SOL 1178 (NERETVA VALLIS)',
        localUrl: 'panoramas/PIA26369-bright-angel.jpg',
        remoteThumbUrl: 'https://images-assets.nasa.gov/image/PIA26369/PIA26369~medium.jpg',
        remoteUrl: 'https://images-assets.nasa.gov/image/PIA26369/PIA26369~large.jpg',
        jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA26369',
        credit: 'NASA/JPL-Caltech/ASU/MSSS — 360° Panorama of "Bright Angel" and Neretva Vallis Fluvial Channel (Cheyava Falls)'
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
        kicker: 'RIMFAX SUBSURFACE RADAR // ISRU EXTRACTION',
        title: 'Subsurface Water Ice Vein (ISRU-01)',
        desc: 'Crystalline ice lens exposed at 1.2m depth along the sheltered northern delta slope. Critical resource for potable water and LOX/CH₄ propellant.',
        dist: 'DIST: 7.8 m',
        comp: '84% H₂O + Hydrated Silica'
      },
      hotspots: [
        {
          pitch: 0,
          yaw: 28,
          kind: 'nav',
          icon: 'fa-circle-arrow-up',
          label: 'ADVANCE STEP 04: BASE CAMP (KM 14.6)',
          targetScene: 'scene-base'
        },
        {
          pitch: -1,
          yaw: -160,
          kind: 'nav',
          icon: 'fa-circle-arrow-left',
          label: 'GO BACK STEP 02: KODIAK MESA (KM 4.8)',
          targetScene: 'scene-kodiak'
        },
        {
          pitch: -1,
          yaw: -15,
          kind: 'ice',
          icon: 'fa-snowflake',
          label: 'Crystalline H₂O Ice Trench (84%)',
          kicker: 'LIFE SUPPORT // CONFIRMED WATER RESERVE',
          desc: 'Estimated capacity of 42,000 liters after thermal sublimation and perchlorate filtration. Capable of refilling 100% of PLSS backpacks.',
          dist: 'DIST: 5.4 m',
          comp: 'Solid H₂O (-64°C)'
        },
        {
          pitch: 3,
          yaw: 55,
          kind: 'ice',
          icon: 'fa-lungs',
          label: 'MOXIE-XL Processing Plant',
          kicker: 'SOLID OXIDE ELECTROLYSIS // O₂',
          desc: 'Surface oxygen generator producing 2.4 kg of breathable O₂ per hour from Martian atmospheric CO₂.',
          dist: 'DIST: 11.2 m',
          comp: 'O₂ Purity: 99.6%'
        }
      ]
    },
    {
      id: 'scene-base',
      stepNum: '04',
      shortLabel: '04 BASE CAMP',
      title: 'STATION 04: DELTA PRIME HABITAT BASE CAMP (KM 14.6)',
      sensor: 'EXTERIOR METEOROLOGICAL TOWER CAMERA',
      routeKey: 'jezero-alpha',
      progressPct: 100,
      coords: [18.64, 77.15],
      elev: -2380,
      initialYaw: -10,
      initialPitch: 0,
      narration: "Welcome to Base Camp Delta Prime. Radiation levels are stable.",
      realPano: {
        piaId: 'PIA26474',
        sol: 'SOL 1337 (JEZERO RIM SUMMIT)',
        localUrl: 'panoramas/PIA26474-rio-chiquito.jpg',
        remoteThumbUrl: 'https://images-assets.nasa.gov/image/PIA26474/PIA26474~medium.jpg',
        remoteUrl: 'https://images-assets.nasa.gov/image/PIA26474/PIA26474~large.jpg',
        jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA26474',
        credit: 'NASA/JPL-Caltech/ASU/MSSS — 360° Panorama at "Rio Chiquito" (Western Jezero Crater Rim Summit Overlook)'
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
        kicker: 'DESTINATION REACHED // CLASS IV PRESSURIZED SHELTER',
        title: 'Base Camp: Delta Prime Habitat',
        desc: 'Pressurized complex with sintered regolith shielding against cosmic and solar radiation. EVA airlocks ready for rover docking.',
        dist: 'DIST: 14.0 m',
        comp: 'Internal Press: 101.3 kPa (Nominal)'
      },
      hotspots: [
        {
          pitch: -1,
          yaw: -145,
          kind: 'nav',
          icon: 'fa-circle-arrow-left',
          label: 'GO BACK STEP 03: ISRU ICE STATION',
          targetScene: 'scene-ice'
        },
        {
          pitch: 1,
          yaw: 95,
          kind: 'nav',
          icon: 'fa-rocket',
          label: 'PLANETARY JUMP: GALE CRATER (CURIOSITY)',
          targetScene: 'scene-gale'
        },
        {
          pitch: 3,
          yaw: -18,
          kind: 'science',
          icon: 'fa-campground',
          label: 'Main Habitation Dome "Ares Prime"',
          kicker: 'HUMAN INFRASTRUCTURE ON MARS // NASA ARTEMIS-MARS',
          desc: 'Supports 6 astronauts for 500 Sols. Equipped with a pressurized hydroponic greenhouse, medical lab, and Kilopower reactor.',
          dist: 'DIST: 16.0 m',
          comp: 'Shielding: 0.02 mSv/h'
        },
        {
          pitch: 6,
          yaw: -85,
          kind: 'science',
          icon: 'fa-triangle-exclamation',
          label: 'Southwest Dust Storm Front',
          kicker: 'MEDA WEATHER RADAR // ACTIVE ALERT',
          desc: 'Suspended dust plume rising to 12 km altitude. Explorers must remain inside the habitat while the front passes.',
          dist: 'DIST: 42.0 km',
          comp: 'Tau Opacity: 1.45'
        }
      ]
    },
    {
      id: 'scene-gale',
      stepNum: '05',
      shortLabel: '05 GALE CRATER',
      title: 'STATION 05: GALE CRATER — MOUNT SHARP (CURIOSITY MSL)',
      sensor: 'MASTCAM 100MM // CURIOSITY ROVER',
      routeKey: 'gale-sharp',
      progressPct: 65,
      coords: [-4.68, 137.38],
      elev: -4310,
      initialYaw: 5,
      initialPitch: 1,
      narration: "Welcome to Gale Crater. Mount Sharp is visible ahead.",
      realPano: {
        piaId: 'PIA22545',
        sol: 'SOL 2137 / 4220 (CURIOSITY MSL)',
        localUrl: 'panoramas/PIA22545-gale-curiosity.jpg',
        remoteThumbUrl: 'https://images-assets.nasa.gov/image/PIA22545/PIA22545~medium.jpg',
        remoteUrl: 'https://images-assets.nasa.gov/image/PIA22545/PIA22545~large.jpg',
        jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA22545',
        credit: 'NASA/JPL-Caltech/MSSS — Real Curiosity Mastcam 360° Panorama at Vera Rubin Ridge and Aeolis Mons (Mount Sharp)'
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
        kicker: 'MARS SCIENCE LABORATORY MISSION // SOL 3840',
        title: 'Foothills of Aeolis Mons (Mount Sharp)',
        desc: '5.5 km high central peak whose strata record Mars climate transition from a wet clay-forming era to an arid sulfate era.',
        dist: 'DIST: 32.0 m',
        comp: 'Hematite / Calcium Sulfate'
      },
      hotspots: [
        {
          pitch: 0,
          yaw: 50,
          kind: 'nav',
          icon: 'fa-circle-arrow-up',
          label: 'PLANETARY JUMP: SOUTH VALLES MARINERIS',
          targetScene: 'scene-valles'
        },
        {
          pitch: -1,
          yaw: -130,
          kind: 'nav',
          icon: 'fa-circle-arrow-left',
          label: 'RETURN TO JEZERO CRATER: BASE CAMP',
          targetScene: 'scene-base'
        },
        {
          pitch: 6,
          yaw: 4,
          kind: 'science',
          icon: 'fa-mountain',
          label: 'Layered Summit of Aeolis Mons',
          kicker: 'PLANETARY GEOLOGY // CURIOSITY CHEMCAM',
          desc: 'Hematite-rich outcrops on Vera Rubin Ridge and bright gypsum veins formed by hydrothermal fluid circulation.',
          dist: 'DIST: 4.2 km',
          comp: 'Fe₂O₃ / CaSO₄·2H₂O'
        }
      ]
    },
    {
      id: 'scene-valles',
      stepNum: '06',
      shortLabel: '06 VALLES MARINERIS',
      title: 'STATION 06: COPRATES CHASMA ABYSSAL CANYON (VALLES MARINERIS)',
      sensor: 'EXTREME RECONNAISSANCE OPTICAL PROBE',
      routeKey: 'valles-marineris',
      progressPct: 68,
      coords: [-13.8900, -59.1800],
      elev: -3790,
      initialYaw: 0,
      initialPitch: 1,
      narration: "Entering Coprates Chasma. Caution, extreme depth and steep cliffs.",
      realPano: {
        piaId: 'PIA13077',
        sol: 'MRO HiRISE + VIKING',
        localUrl: 'panoramas/PIA13077-valles-marineris.jpg',
        remoteThumbUrl: 'https://images-assets.nasa.gov/image/PIA13077/PIA13077~medium.jpg',
        remoteUrl: 'https://images-assets.nasa.gov/image/PIA13077/PIA13077~large.jpg',
        jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA13077',
        credit: 'NASA/JPL-Caltech/Univ. of Arizona — Real Mosaic of Valles Marineris (Coprates Chasma)'
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
        kicker: 'EQUATORIAL CANYON SYSTEM // 7 KM DEPTH',
        title: 'Coprates Chasma Tectonic Scarp',
        desc: 'Exposed canyon walls reveal over 6 km of primordial Martian crust and massive hydrated sulfate deposits.',
        dist: 'DIST: 120 m',
        comp: 'Basalt / Hydrated Kieserite'
      },
      hotspots: [
        {
          pitch: 0,
          yaw: 0,
          kind: 'nav',
          icon: 'fa-circle-arrow-up',
          label: 'RETURN TO START: JEZERO CRATER (KM 0.0)',
          targetScene: 'scene-landing'
        },
        {
          pitch: 5,
          yaw: -32,
          kind: 'science',
          icon: 'fa-person-falling-burst',
          label: 'North Wall of Coprates (27.6° Slope)',
          kicker: 'GEOTECHNICAL ALERT // REGOLITH AVALANCHE RISK',
          desc: 'Recurrent debris fans and dark slope lineae (RSL). Rover approach prohibited within 50 meters of the talus base.',
          dist: 'DIST: 85.0 m',
          comp: 'Critical Slope: 27.6°'
        }
      ]
    }
  ];

  STREETVIEW_STATIONS.forEach((st) => {
    st.defaultRealPano = st.realPano ? structuredClone(st.realPano) : null;
  });

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

  // Sanitize NASA URLs that may contain unencoded spaces or mixed encoding
  function sanitizeNasaUrl(rawUrl) {
    if (!rawUrl) return '';
    const str = String(rawUrl).trim();
    try {
      return encodeURI(decodeURI(str));
    } catch {
      return str;
    }
  }

  // Resuelve rutas de panoramas locales de forma universal (Vite root, relative, public o remote)
  function resolvePanoPath(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return sanitizeNasaUrl(path);
    }
    const fileName = path.split('/').pop();
    return `panoramas/${fileName}`;
  }

  // Compone un lienzo equirectangular 360° (2048x1024) a partir de fotografía real de NASA JPL-Caltech (Mastcam-Z / Mastcam / HiRISE)
  function getOrComposeRealPanoramaCanvas(station, previewImg = null, forceReload = false) {
    if (!station || !station.realPano) return null;
    const rawLocal = sanitizeNasaUrl(station.realPano.localUrl);
    const isRemoteSource = /^https?:\/\//i.test(rawLocal);
    const fileName = !isRemoteSource ? (rawLocal || '').split('/').pop().split('?')[0] : '';
    const cacheKey = `${station.id}::${station.realPano.piaId || ''}::${station.realPano.localUrl || station.realPano.remoteUrl || station.realPano.thumbUrl || ''}`;
    const existing = realPanoCanvasCache[cacheKey];

    const width = 2048;
    const height = 1024;

    const drawImageToEntry = (entryObj, img, sourceLabel, isFinal = true) => {
      const ctx = entryObj.canvas.getContext('2d', { alpha: false });
      const p = station.palette;

      // 1. Equirectangular projection preserving natural proportions and prominence
      const imgAspect = img.naturalWidth / Math.max(1, img.naturalHeight);

      // Ambient Mars sky zenith and ground fill
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
        // Continuous rover panorama: prominent band >= 72% of canvas height
        const naturalBandH = Math.round(width / Math.max(1.8, Math.min(3.6, imgAspect)));
        bandH = Math.min(height, Math.max(Math.round(height * 0.72), naturalBandH));
        topY = Math.max(0, Math.min(height - bandH, Math.round(height * 0.5 - bandH * 0.45)));
        ctx.drawImage(img, 0, topY, width, bandH);
      } else {
        // Mirrored mosaic for standard aspect ratio images (>= 86% height across full sphere)
        const tileW = width / 2;
        const naturalBandH = Math.round(tileW / Math.max(0.6, imgAspect));
        bandH = Math.min(height, Math.max(Math.round(height * 0.86), naturalBandH));
        topY = Math.max(0, Math.min(height - bandH, Math.round(height * 0.5 - bandH * 0.48)));
        ctx.drawImage(img, 0, topY, tileW, bandH);
        ctx.save();
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, topY, tileW, bandH);
        ctx.restore();
      }

      // Soft horizon edge blending
      const topEdgeH = Math.min(32, Math.round(bandH * 0.06));
      if (topEdgeH > 2 && topY > 0) {
        const topGrad = ctx.createLinearGradient(0, topY - 2, 0, topY + topEdgeH);
        topGrad.addColorStop(0.0, p.skyHorizon);
        topGrad.addColorStop(1.0, 'rgba(0,0,0,0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, topY - 2, width, topEdgeH + 2);
      }

      const botEdgeH = Math.min(36, Math.round(bandH * 0.06));
      const botY = topY + bandH;
      if (botEdgeH > 2 && botY < height) {
        const botGrad = ctx.createLinearGradient(0, botY - botEdgeH, 0, botY + 2);
        botGrad.addColorStop(0.0, 'rgba(0,0,0,0)');
        botGrad.addColorStop(1.0, p.groundFar);
        ctx.fillStyle = botGrad;
        ctx.fillRect(0, botY - botEdgeH, width, botEdgeH + 2);
      }

      entryObj.loaded = true;
      entryObj.error = false;
      if (isFinal) {
        entryObj.loading = false;
      }
      if (isFinal || !entryObj.sourceUsed || entryObj.sourceUsed.startsWith('LOADING')) {
        entryObj.sourceUsed = sourceLabel;
      }
      needs360Redraw = true;
      if (station.id === currentStationId && station.realPano?.piaId === entryObj.piaId) {
        updateRealPhotoBadge(station, entryObj);
      }
    };

    if (existing) {
      if (previewImg && previewImg.complete && previewImg.naturalWidth > 0 && !existing.loaded) {
        drawImageToEntry(existing, previewImg, 'INSTANT NASA PREVIEW', false);
      }
      if (existing.loaded && !forceReload) {
        return existing;
      }
      if (!existing.loaded && existing.loading && !forceReload) {
        return existing;
      }
      if (existing.error && !forceReload) {
        return existing;
      }
      if (forceReload && existing.loaded && !existing.error && existing.sourceUsed !== 'INSTANT NASA PREVIEW') {
        return existing;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const entry = {
      canvas,
      piaId: station.realPano.piaId || '',
      loaded: false,
      loading: true,
      error: false,
      sourceUsed: 'LOADING NASA OPTICAL TELEMETRY...'
    };
    realPanoCanvasCache[cacheKey] = entry;

    if (previewImg && previewImg.complete && previewImg.naturalWidth > 0) {
      drawImageToEntry(entry, previewImg, 'INSTANT NASA PREVIEW', false);
    }

    // Candidate URL chain ordered to load across GitHub Pages, Vite, Live Server, and file://
    const candidateUrls = [
      !isRemoteSource && fileName ? `panoramas/${fileName}` : null,
      !isRemoteSource && fileName ? `./panoramas/${fileName}` : null,
      !isRemoteSource && fileName ? `public/panoramas/${fileName}` : null,
      rawLocal,
      sanitizeNasaUrl(station.realPano.remoteThumbUrl),
      sanitizeNasaUrl(station.realPano.remoteUrl),
      sanitizeNasaUrl(station.realPano.thumbUrl),
      ...(Array.isArray(station.realPano.allUrls) ? station.realPano.allUrls.map(sanitizeNasaUrl) : [])
    ].filter(Boolean);
    const uniqueCandidates = [...new Set(candidateUrls)];

    let attemptIndex = 0;
    const tryNext = () => {
      if (attemptIndex >= uniqueCandidates.length) {
        entry.loading = false;
        if (!entry.loaded) {
          entry.error = true;
        }
        needs360Redraw = true;
        if (station.id === currentStationId && station.realPano?.piaId === entry.piaId) {
          updateRealPhotoBadge(station, entry);
        }
        return;
      }
      const url = uniqueCandidates[attemptIndex++];
      const isRemote = /^https?:\/\//i.test(url);
      const img = new Image();
      img.decoding = 'async';

      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        tryNext();
      }, 8500);

      img.onload = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (img.naturalWidth === 0) {
          tryNext();
          return;
        }
        const label = isRemote ? 'REMOTE NASA IMAGES API SERVER' : 'OFFICIAL NASA JPL ARCHIVE (HIGH SPEED)';
        if (typeof img.decode === 'function') {
          img.decode()
            .then(() => drawImageToEntry(entry, img, label, true))
            .catch(() => drawImageToEntry(entry, img, label, true));
        } else {
          drawImageToEntry(entry, img, label, true);
        }
      };

      img.onerror = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        tryNext();
      };

      img.src = url;
    };

    tryNext();
    return entry;
  }

  // Precargar fotografías panorámicas reales de la NASA (en móvil solo la estación activa para ahorrar RAM)
  setTimeout(() => {
    if (window.innerWidth <= 900) {
      const activeStation = STREETVIEW_STATIONS.find((s) => s.id === currentStationId) || STREETVIEW_STATIONS[0];
      if (activeStation) getOrComposeRealPanoramaCanvas(activeStation);
    } else {
      STREETVIEW_STATIONS.forEach((st) => {
        getOrComposeRealPanoramaCanvas(st);
      });
    }
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
        srpbStatusTagEl.innerHTML = '<i class="fa-solid fa-vector-square"></i> SIMULATED 2D VIEW ACTIVE';
        srpbStatusTagEl.style.color = '#00E5FF';
      } else if (realEntry && realEntry.loaded) {
        srpbStatusTagEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> REAL NASA 360° VIEW ACTIVE';
        srpbStatusTagEl.style.color = '#38F28D';
      } else if (realEntry && realEntry.error) {
        srpbStatusTagEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> 2D VIEW FALLBACK';
        srpbStatusTagEl.style.color = '#FFB020';
      } else {
        srpbStatusTagEl.innerHTML = '<i class="fa-solid fa-satellite-dish fa-spin"></i> LOADING REAL NASA VIEW...';
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
        if (mars360Ctx) mars360Ctx.imageSmoothingQuality = 'high';
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
      updateRealPhotoBadge(st, getOrComposeRealPanoramaCanvas(st));
      if (typeof playHudTone === 'function') playHudTone(680, 0.05, 'sine');
    });
  }

  // ==========================================================================
  // REAL NASA PHOTOGRAPHIC ARCHIVE (INSTANT LOCAL CATALOG + LIVE API)
  // ==========================================================================
  const LOCAL_CURATED_PANORAMAS = [
    {
      nasaId: 'PIA24264',
      stationId: 'scene-landing',
      title: 'Perseverance 360° — Octavia E. Butler Landing (Sol 3)',
      dateStr: 'MARS 2020',
      thumbUrl: 'panoramas/PIA24264-landing.jpg',
      hiResUrl: 'panoramas/PIA24264-landing.jpg',
      remoteThumbUrl: 'https://images-assets.nasa.gov/image/PIA24264/PIA24264~medium.jpg',
      remoteUrl: 'https://images-assets.nasa.gov/image/PIA24264/PIA24264~large.jpg',
      jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA24264',
      credit: 'NASA/JPL-Caltech/ASU/MSSS — Mastcam-Z 360° Panorama at Octavia E. Butler Landing'
    },
    {
      nasaId: 'PIA24921',
      stationId: 'scene-kodiak',
      title: 'Perseverance 360° — Jezero Delta Front & Kodiak Mesa',
      dateStr: 'SOL 466',
      thumbUrl: 'panoramas/PIA24921-kodiak-delta.jpg',
      hiResUrl: 'panoramas/PIA24921-kodiak-delta.jpg',
      remoteThumbUrl: 'https://images-assets.nasa.gov/image/PIA24921/PIA24921~medium.jpg',
      remoteUrl: 'https://images-assets.nasa.gov/image/PIA24921/PIA24921~large.jpg',
      jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA24921',
      credit: 'NASA/JPL-Caltech/ASU/MSSS — Real 2.5-Gigapixel Mosaic of the Delta Front and Kodiak Mesa'
    },
    {
      nasaId: 'PIA26369',
      stationId: 'scene-ice',
      title: 'Perseverance 360° — Bright Angel & Neretva Vallis Channel',
      dateStr: 'SOL 1178',
      thumbUrl: 'panoramas/PIA26369-bright-angel.jpg',
      hiResUrl: 'panoramas/PIA26369-bright-angel.jpg',
      remoteThumbUrl: 'https://images-assets.nasa.gov/image/PIA26369/PIA26369~medium.jpg',
      remoteUrl: 'https://images-assets.nasa.gov/image/PIA26369/PIA26369~large.jpg',
      jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA26369',
      credit: 'NASA/JPL-Caltech/ASU/MSSS — 360° Panorama at Bright Angel (Neretva Vallis)'
    },
    {
      nasaId: 'PIA26474',
      stationId: 'scene-base',
      title: 'Perseverance 360° — Western Rim Summit (Rio Chiquito)',
      dateStr: 'SOL 1337',
      thumbUrl: 'panoramas/PIA26474-rio-chiquito.jpg',
      hiResUrl: 'panoramas/PIA26474-rio-chiquito.jpg',
      remoteThumbUrl: 'https://images-assets.nasa.gov/image/PIA26474/PIA26474~medium.jpg',
      remoteUrl: 'https://images-assets.nasa.gov/image/PIA26474/PIA26474~large.jpg',
      jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA26474',
      credit: 'NASA/JPL-Caltech/ASU/MSSS — 360° Panorama at Rio Chiquito Overlook (Jezero Summit)'
    },
    {
      nasaId: 'PIA22545',
      stationId: 'scene-gale',
      title: 'Curiosity 360° — Vera Rubin Ridge & Mount Sharp (Gale Crater)',
      dateStr: 'MSL CURIOSITY',
      thumbUrl: 'panoramas/PIA22545-gale-curiosity.jpg',
      hiResUrl: 'panoramas/PIA22545-gale-curiosity.jpg',
      remoteThumbUrl: 'https://images-assets.nasa.gov/image/PIA22545/PIA22545~medium.jpg',
      remoteUrl: 'https://images-assets.nasa.gov/image/PIA22545/PIA22545~large.jpg',
      jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA22545',
      credit: 'NASA/JPL-Caltech/MSSS — Mastcam 360° Panorama at Vera Rubin Ridge (Gale Crater)'
    },
    {
      nasaId: 'PIA26363',
      stationId: 'scene-gale',
      title: 'Curiosity 360° — Gediz Vallis Channel & Elemental Sulfur Rocks',
      dateStr: 'SOL 4208',
      thumbUrl: 'panoramas/PIA26363-gediz-vallis.jpg',
      hiResUrl: 'panoramas/PIA26363-gediz-vallis.jpg',
      remoteThumbUrl: 'https://images-assets.nasa.gov/image/PIA26363/PIA26363~medium.jpg',
      remoteUrl: 'https://images-assets.nasa.gov/image/PIA26363/PIA26363~large.jpg',
      jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA26363',
      credit: 'NASA/JPL-Caltech/MSSS — Mastcam 360° Panorama at Gediz Vallis Channel (Mount Sharp)'
    },
    {
      nasaId: 'PIA13077',
      stationId: 'scene-valles',
      title: 'MRO HiRISE + Viking — Coprates Canyon (Valles Marineris)',
      dateStr: 'MRO / VIKING',
      thumbUrl: 'panoramas/PIA13077-valles-marineris.jpg',
      hiResUrl: 'panoramas/PIA13077-valles-marineris.jpg',
      remoteThumbUrl: 'https://images-assets.nasa.gov/image/PIA13077/PIA13077~medium.jpg',
      remoteUrl: 'https://images-assets.nasa.gov/image/PIA13077/PIA13077~large.jpg',
      jplUrl: 'https://photojournal.jpl.nasa.gov/catalog/PIA13077',
      credit: 'NASA/JPL-Caltech/Univ. of Arizona — Real Mosaic of Valles Marineris'
    }
  ];

  function closeNasaPhotoDrawer() {
    if (svNasaApiDrawer) svNasaApiDrawer.classList.add('is-hidden');
    if (btnSvNasaApi) btnSvNasaApi.classList.remove('is-active');
  }

  // Close photo drawer with Escape or by clicking outside
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

  function applySelectedPanoramaToViewer(panoItem, previewImg = null) {
    closeNasaPhotoDrawer();

    const customRealPano = {
      piaId: panoItem.nasaId,
      sol: panoItem.dateStr || 'NASA ARCHIVE',
      localUrl: panoItem.hiResUrl || panoItem.thumbUrl || panoItem.remoteThumbUrl,
      remoteThumbUrl: panoItem.remoteThumbUrl || panoItem.thumbUrl || '',
      remoteUrl: panoItem.remoteUrl || panoItem.hiResUrl || panoItem.thumbUrl || '',
      thumbUrl: panoItem.thumbUrl || panoItem.remoteThumbUrl || panoItem.hiResUrl || '',
      allUrls: Array.isArray(panoItem.allUrls) ? panoItem.allUrls : [],
      jplUrl: panoItem.jplUrl,
      credit: panoItem.credit
    };

    const hasStationTarget =
      panoItem.stationId && STREETVIEW_STATIONS.some((s) => s.id === panoItem.stationId);
    const targetStationId = hasStationTarget ? panoItem.stationId : currentStationId;

    if (streetContainer && streetContainer.classList.contains('is-hidden')) {
      setViewportMode('streetview', targetStationId, customRealPano);
    } else {
      loadStreetViewStation(targetStationId, true, false, customRealPano);
    }

    const st =
      STREETVIEW_STATIONS.find((s) => s.id === targetStationId) ||
      STREETVIEW_STATIONS.find((s) => s.id === currentStationId) ||
      STREETVIEW_STATIONS[1];

    st.realPano = customRealPano;

    if (svStationTitleEl && panoItem.title) {
      svStationTitleEl.textContent = `360° MARS // ${panoItem.title.toUpperCase()}`;
    }

    updateInspectorCard({
      kicker: `NASA PHOTO ARCHIVE // ${panoItem.nasaId || 'JPL'}`,
      title: panoItem.title || 'NASA Mars Photograph',
      desc: panoItem.credit || 'Official NASA Planetary Image loaded into the 360° viewer.',
      dist: panoItem.dateStr ? `DATE: ${panoItem.dateStr}` : 'SOURCE: NASA ARCHIVE',
      comp: '360° Spherical Projection'
    });

    // Activate REAL VIEW (LIFE) without overlay
    render360Mode = 'real';
    if (svRenderModeGroup) {
      svRenderModeGroup.querySelectorAll('[data-360-mode]').forEach((b) => {
        b.classList.toggle('is-active', b.getAttribute('data-360-mode') === 'real');
      });
    }

    sync360ViewportSize();
    animateCameraTo(st.initialYaw ?? 10, 0, 90);
    const newEntry = getOrComposeRealPanoramaCanvas(st, previewImg, true);
    updateRealPhotoBadge(st, newEntry);
    needs360Redraw = true;
    if (typeof playHudTone === 'function') playHudTone(920, 0.08, 'sine');
  }

  function renderPanoramaCardsInDrawer(list) {
    if (!nasaApiResultsGrid) return;
    nasaApiResultsGrid.innerHTML = '';

    list.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'snad-card';

      const thumbSrc = sanitizeNasaUrl(
        resolvePanoPath(item.thumbUrl || item.remoteThumbUrl || item.remoteUrl)
      );
      const cleanFileName =
        item.thumbUrl && !/^https?:\/\//i.test(item.thumbUrl)
          ? item.thumbUrl.split('/').pop().split('?')[0]
          : '';

      const fallbackQueue = [
        cleanFileName ? `panoramas/${cleanFileName}` : null,
        cleanFileName ? `./panoramas/${cleanFileName}` : null,
        cleanFileName ? `public/panoramas/${cleanFileName}` : null,
        sanitizeNasaUrl(item.remoteThumbUrl),
        sanitizeNasaUrl(item.remoteUrl),
        sanitizeNasaUrl(item.hiResUrl),
        ...(Array.isArray(item.allUrls) ? item.allUrls.map(sanitizeNasaUrl) : [])
      ].filter((u) => u && u !== thumbSrc);
      const uniqueFallbacks = [...new Set(fallbackQueue)];

      const thumbEl = document.createElement('img');
      thumbEl.className = 'snad-thumb';
      thumbEl.alt = item.title || 'NASA Mars Panorama';
      thumbEl.decoding = 'async';

      let fbIdx = 0;
      thumbEl.addEventListener('error', () => {
        if (fbIdx < uniqueFallbacks.length) {
          thumbEl.src = uniqueFallbacks[fbIdx++];
        } else if (!thumbEl.dataset.synthFallback) {
          thumbEl.dataset.synthFallback = '1';
          const fallbackSt =
            STREETVIEW_STATIONS.find((s) => s.id === (item.stationId || currentStationId)) ||
            STREETVIEW_STATIONS[1];
          try {
            thumbEl.src = getOrGeneratePanoramaCanvas(fallbackSt).toDataURL('image/jpeg', 0.8);
          } catch {
            // Keep background placeholder if data URL export fails
          }
        }
      });
      thumbEl.src = thumbSrc || uniqueFallbacks.shift() || '';

      const bodyEl = document.createElement('div');
      bodyEl.className = 'snad-body';
      bodyEl.innerHTML = `
        <div class="snad-id-row">
          <span class="snad-id"></span>
          <span class="snad-date"></span>
        </div>
        <div class="snad-title"></div>
        <button type="button" class="snad-load-btn">
          <i class="fa-solid fa-vr-cardboard"></i> LOAD IN 360°
        </button>
      `;
      bodyEl.querySelector('.snad-id').textContent = item.nasaId || 'NASA';
      bodyEl.querySelector('.snad-date').textContent = item.dateStr || '';
      bodyEl.querySelector('.snad-title').textContent = item.title || 'NASA Mars Photograph';

      card.appendChild(thumbEl);
      card.appendChild(bodyEl);

      const loadBtnEl = bodyEl.querySelector('.snad-load-btn');
      let downX = 0;
      let downY = 0;
      let lastActivateMs = 0;

      const trackDown = (e) => {
        downX = e.clientX || 0;
        downY = e.clientY || 0;
      };
      const activateCard = (e) => {
        const now = Date.now();
        if (now - lastActivateMs < 250) return;
        lastActivateMs = now;
        if (e) e.stopPropagation();
        applySelectedPanoramaToViewer(item, thumbEl);
      };
      const handleTouchUp = (e) => {
        if (e.pointerType !== 'touch') return;
        const dx = Math.abs((e.clientX || 0) - downX);
        const dy = Math.abs((e.clientY || 0) - downY);
        if (dx <= 10 && dy <= 10) {
          activateCard(e);
        }
      };

      if (loadBtnEl) {
        loadBtnEl.addEventListener('pointerdown', trackDown);
        loadBtnEl.addEventListener('pointerup', handleTouchUp);
        loadBtnEl.addEventListener('click', activateCard);
      }

      card.addEventListener('pointerdown', trackDown);
      card.addEventListener('pointerup', handleTouchUp);
      card.addEventListener('click', activateCard);

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
        <span>SEARCHING NASA: "${cleanQuery.toUpperCase()}"...</span>
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
        const imageLinks = (item.links || []).filter((l) => l.render === 'image' && l.href);
        if (!meta || imageLinks.length === 0) return;

        const nasaId = meta.nasa_id || 'NASA-IMG';
        const title = meta.title || 'NASA Planetary Photograph';
        const dateStr = (meta.date_created || '').slice(0, 10);

        const findBySuffix = (suffix) =>
          imageLinks.find((l) => l.href.toLowerCase().includes(suffix))?.href;

        const previewLink =
          imageLinks.find((l) => l.rel === 'preview')?.href || imageLinks[0].href;
        const smallUrl = findBySuffix('~small.');
        const mediumUrl = findBySuffix('~medium.');
        const largeUrl = findBySuffix('~large.');
        const origUrl = findBySuffix('~orig.');

        const thumbUrl = smallUrl || previewLink || mediumUrl || imageLinks[0].href;
        const remoteThumbUrl = mediumUrl || smallUrl || previewLink || largeUrl || imageLinks[0].href;
        const hiResUrl = largeUrl || mediumUrl || origUrl || remoteThumbUrl;
        const remoteUrl = origUrl || largeUrl || mediumUrl || previewLink;
        const allUrls = [...new Set(imageLinks.map((l) => l.href))];

        mapped.push({
          nasaId,
          title,
          dateStr,
          thumbUrl,
          remoteThumbUrl,
          hiResUrl,
          remoteUrl,
          allUrls,
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

  if (svNasaApiDrawer) {
    svNasaApiDrawer.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    });
    svNasaApiDrawer.addEventListener(
      'wheel',
      (e) => {
        e.stopPropagation();
      },
      { passive: true }
    );
  }

  // Eventos de interacción de cámara 360° (Arrastrar para mirar, Pellizcar con 2 dedos en móvil, Rueda de ratón y Botones)
  if (pannellumMountEl) {
    let pinchStartDist = null;
    let pinchStartFov = camFov;
    const interactiveChildSelector =
      '.hud-360-hotspot, #sv-nasa-api-drawer, .sv-floating-controls, #sv-real-photo-badge';

    pannellumMountEl.addEventListener('pointerdown', (e) => {
      if (e.target.closest(interactiveChildSelector)) return;
      if (pinchStartDist !== null) return;
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
      if (!isDragging360 || pinchStartDist !== null) return;
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

    // Soporte táctil de pellizco con 2 dedos (Pinch-to-Zoom) en teléfonos y tablets
    pannellumMountEl.addEventListener(
      'touchstart',
      (e) => {
        if (e.target.closest(interactiveChildSelector)) return;
        if (e.touches.length === 2) {
          isDragging360 = false;
          targetYaw = null;
          targetFov = null;
          pinchStartDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          pinchStartFov = camFov;
        }
      },
      { passive: true }
    );

    pannellumMountEl.addEventListener(
      'touchmove',
      (e) => {
        if (e.target.closest(interactiveChildSelector)) return;
        if (e.touches.length === 2 && pinchStartDist && pinchStartDist > 10) {
          e.preventDefault();
          const currentDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          const scale = pinchStartDist / Math.max(10, currentDist);
          camFov = Math.max(30, Math.min(125, pinchStartFov * scale));
          needs360Redraw = true;
        }
      },
      { passive: false }
    );

    const endPinch360 = (e) => {
      if (!e.touches || e.touches.length < 2) {
        pinchStartDist = null;
      }
    };
    pannellumMountEl.addEventListener('touchend', endPinch360, { passive: true });
    pannellumMountEl.addEventListener('touchcancel', endPinch360, { passive: true });

    pannellumMountEl.addEventListener(
      'wheel',
      (e) => {
        if (e.target.closest(interactiveChildSelector)) return;
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
  function loadStreetViewStation(
    stationId,
    syncWithMapAndRoute = true,
    playVoice = true,
    customRealPano = null
  ) {
    if (typeof MissionControlVoice !== 'undefined') {
      MissionControlVoice.stop();
    }

    const station =
      STREETVIEW_STATIONS.find((s) => s.id === stationId) || STREETVIEW_STATIONS[1];
    currentStationId = station.id;
    if (customRealPano) {
      station.realPano = customRealPano;
    } else if (station.defaultRealPano) {
      station.realPano = structuredClone(station.defaultRealPano);
    }

    if (svStationTitleEl) {
      svStationTitleEl.textContent = `360° MARS // ${station.title}`;
    }

    if (Array.isArray(station.coords) && station.coords.length >= 2) {
      const [sLat, sLng] = station.coords;
      const latDir = sLat >= 0 ? 'N' : 'S';
      const lngDir = sLng >= 0 ? 'E' : 'W';
      if (headerCoords) {
        headerCoords.textContent = `${Math.abs(sLat).toFixed(2)}°${latDir} • ${Math.abs(sLng).toFixed(2)}°${lngDir}`;
      }
      if (cursorReadout && typeof station.elev === 'number') {
        const altStr = `${station.elev > 0 ? '+' : ''}${station.elev.toLocaleString('en-US')}m`;
        cursorReadout.textContent = `LAT: ${Math.abs(sLat).toFixed(4)}° ${latDir} | LON: ${Math.abs(sLng).toFixed(4)}° ${lngDir} | ALT: ${altStr}`;
      }
    }

    sync360ViewportSize();
    const realEntry = customRealPano ? null : getOrComposeRealPanoramaCanvas(station);
    if (render360Mode === 'sim2d') {
      getOrGeneratePanoramaCanvas(station);
    }
    if (!customRealPano) {
      updateRealPhotoBadge(station, realEntry);
    }
    buildStationHotspotElements(station);
    animateCameraTo(station.initialYaw, station.initialPitch, 90);
    needs360Redraw = true;

    updateInspectorCard(station.defaultInspect);
    renderStreetViewStepPills();

    // Sync with active route, Rover position on 2D map, and survival telemetry
    if (syncWithMapAndRoute) {
      isInternalStationSync = true;
      try {
        const isMapVisible =
          mapContainer && !mapContainer.classList.contains('is-hidden') && mapContainer.clientWidth > 0;
        if (station.routeKey && station.routeKey !== currentRouteKey && currentRouteKey !== 'custom') {
          if (routeSelector) routeSelector.value = station.routeKey;
          loadRoute(station.routeKey, isMapVisible);
        }
        updateRoverProgress(station.progressPct);
        if (isMapVisible) {
          marsMap.panTo(station.coords, { animate: true, duration: 0.8 });
        } else {
          marsMap.setView(station.coords, marsMap.getZoom() || 8, { animate: false });
        }
      } catch {
        // Ignore Leaflet layout errors when 2D map container is hidden
      } finally {
        isInternalStationSync = false;
      }
    }
    if (typeof playHudTone === 'function') {
      playHudTone(740, 0.06, 'triangle');
    }

    if (playVoice && station.narration && typeof MissionControlVoice !== 'undefined') {
      MissionControlVoice.narrate(station.narration);
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

  // 360° orientation telemetry loop (Compass, Pitch, FOV, and 2D Map Vision Cone without overloading DOM)
  setInterval(() => {
    if (streetContainer.classList.contains('is-hidden')) return;
    const normYaw = Math.round(((camYaw % 360) + 360) % 360);
    const fov = Math.round(camFov);

    if (Math.abs(normYaw - lastRenderedConeYaw) >= 2 || Math.abs(fov - lastRenderedConeFov) >= 2) {
      lastRenderedConeYaw = normYaw;
      lastRenderedConeFov = fov;
      const pitch = camPitch.toFixed(1);
      const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const dirLabel = dirs[Math.round(normYaw / 45) % 8];

      if (svCompassHeadingEl) {
        svCompassHeadingEl.textContent = `AZIMUTH: ${String(normYaw).padStart(3, '0')}° ${dirLabel}`;
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

  const mobileMediaQuery = window.matchMedia('(max-width: 820px)');

  function syncZenButtonState() {
    if (!btnZenMode) return;
    const allHidden =
      sidebarLeftEl?.classList.contains('is-collapsed') &&
      sidebarRightEl?.classList.contains('is-collapsed') &&
      hudFooterEl?.classList.contains('is-collapsed');
    btnZenMode.classList.toggle('is-active', Boolean(allHidden));
  }

  function setPanelOpen(which, shouldOpen, skipMobileExclusive = false) {
    const map = {
      left: { panel: sidebarLeftEl, btn: btnToggleLeft, edge: btnEdgeLeft },
      right: { panel: sidebarRightEl, btn: btnToggleRight, edge: btnEdgeRight },
      bottom: { panel: hudFooterEl, btn: btnToggleBottom, edge: btnEdgeBottom }
    };
    const item = map[which];
    if (!item || !item.panel) return;

    const openState =
      typeof shouldOpen === 'boolean' ? shouldOpen : item.panel.classList.contains('is-collapsed');

    // En modo teléfono (estilo Google Maps / Waze), abrir una gaveta inferior cierra automáticamente las otras dos
    if (openState && mobileMediaQuery.matches && !skipMobileExclusive) {
      ['left', 'right', 'bottom'].forEach((otherKey) => {
        if (otherKey !== which) {
          setPanelOpen(otherKey, false, true);
        }
      });
    }

    item.panel.classList.toggle('is-collapsed', !openState);
    if (item.edge) {
      item.edge.classList.toggle('is-visible', !openState);
      item.edge.classList.toggle('is-sheet-open', openState);
      item.edge.setAttribute('aria-expanded', String(openState));
    }
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
  if (btnEdgeLeft) btnEdgeLeft.addEventListener('click', () => setPanelOpen('left'));

  if (btnToggleRight) btnToggleRight.addEventListener('click', () => setPanelOpen('right'));
  if (btnCloseRightSidebar) btnCloseRightSidebar.addEventListener('click', () => setPanelOpen('right', false));
  if (btnEdgeRight) btnEdgeRight.addEventListener('click', () => setPanelOpen('right'));

  if (btnToggleBottom) btnToggleBottom.addEventListener('click', () => setPanelOpen('bottom'));
  if (btnCloseBottomHud) btnCloseBottomHud.addEventListener('click', () => setPanelOpen('bottom', false));
  if (btnEdgeBottom) btnEdgeBottom.addEventListener('click', () => setPanelOpen('bottom'));

  if (btnZenMode) {
    btnZenMode.addEventListener('click', () => {
      const anyOpen =
        !sidebarLeftEl?.classList.contains('is-collapsed') ||
        !sidebarRightEl?.classList.contains('is-collapsed') ||
        !hudFooterEl?.classList.contains('is-collapsed');

      if (anyOpen) {
        setPanelOpen('left', false, true);
        setPanelOpen('right', false, true);
        setPanelOpen('bottom', false, true);
      } else if (mobileMediaQuery.matches) {
        setPanelOpen('left', true);
      } else {
        setPanelOpen('left', true, true);
        setPanelOpen('right', true, true);
        setPanelOpen('bottom', true, true);
      }
      if (typeof playHudTone === 'function') playHudTone(680, 0.07, 'triangle');
    });
  }

  function applyResponsivePanelDefaults(isMobile) {
    if (isMobile) {
      // En teléfono (estilo Google Maps / Waze): mapa 100% despejado al iniciar con barra inferior de pestañas lista
      setPanelOpen('left', false, true);
      setPanelOpen('right', false, true);
      setPanelOpen('bottom', false, true);
    } else if (window.innerWidth <= 1080) {
      // En tablet (821px–1080px): abrir solo el panel izquierdo y el HUD inferior para no comprimir el mapa central
      setPanelOpen('left', true, true);
      setPanelOpen('right', false, true);
      setPanelOpen('bottom', true, true);
    } else {
      // En escritorio amplio: mostrar las barras laterales y el HUD inferior en sus extremos
      setPanelOpen('left', true, true);
      setPanelOpen('right', true, true);
      setPanelOpen('bottom', true, true);
    }
  }

  applyResponsivePanelDefaults(mobileMediaQuery.matches);
  if (typeof mobileMediaQuery.addEventListener === 'function') {
    mobileMediaQuery.addEventListener('change', (e) => applyResponsivePanelDefaults(e.matches));
  }

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      marsMap.invalidateSize({ pan: false });
      sync360ViewportSize();
    }, 240);
  });

  // Gesto táctil de deslizar hacia abajo (swipe-down) sobre el encabezado de cada gaveta inferior en móvil
  [
    { el: sidebarLeftEl, key: 'left' },
    { el: sidebarRightEl, key: 'right' },
    { el: hudFooterEl, key: 'bottom' }
  ].forEach(({ el, key }) => {
    if (!el) return;
    let touchStartY = null;
    el.addEventListener(
      'touchstart',
      (e) => {
        if (!mobileMediaQuery.matches || el.scrollTop > 8) {
          touchStartY = null;
          return;
        }
        touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );
    el.addEventListener(
      'touchend',
      (e) => {
        if (touchStartY === null || !mobileMediaQuery.matches) return;
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        if (deltaY > 55) {
          setPanelOpen(key, false);
        }
        touchStartY = null;
      },
      { passive: true }
    );
  });

  // ==========================================================================
  // 11. VIEWPORT SWITCHING (2D MAP / 360° STREET VIEW / SPLIT SCREEN)
  // ==========================================================================
  function setViewportMode(mode, targetStationId = null, customRealPano = null) {
    viewportStage.setAttribute('data-view-mode', mode);

    if (mode === 'streetview') {
      mapContainer.classList.add('is-hidden');
      streetContainer.classList.remove('is-hidden');
      btnToggleStreet.classList.add('is-active');
      btnToggleStreet.setAttribute('aria-pressed', 'true');
      btnSplitView.classList.remove('is-active');
      streetBtnLabel.textContent = '2D MAP';
      setPanelOpen('left', false);
      setPanelOpen('right', false);
    } else if (mode === 'split') {
      mapContainer.classList.remove('is-hidden');
      streetContainer.classList.remove('is-hidden');
      btnToggleStreet.classList.add('is-active');
      btnSplitView.classList.add('is-active');
      streetBtnLabel.textContent = '360° ACTIVE';
      setPanelOpen('left', false);
      if (window.innerWidth <= 1150) {
        setPanelOpen('right', false);
      }
      if (mobileMediaQuery.matches) {
        setPanelOpen('bottom', false);
      }
    } else {
      mapContainer.classList.remove('is-hidden');
      streetContainer.classList.add('is-hidden');
      btnToggleStreet.classList.remove('is-active');
      btnToggleStreet.setAttribute('aria-pressed', 'false');
      btnSplitView.classList.remove('is-active');
      streetBtnLabel.textContent = '360° VIEW';
    }

    if (mode === 'streetview' || mode === 'split') {
      const nextStationId = targetStationId || currentStationId;
      const preservedPano =
        customRealPano ||
        (!targetStationId
          ? STREETVIEW_STATIONS.find((s) => s.id === nextStationId)?.realPano || null
          : null);
      loadStreetViewStation(nextStationId, false, !customRealPano, preservedPano);
    }

    requestAnimationFrame(() => {
      marsMap.invalidateSize({ pan: false });
      sync360ViewportSize();
    });
    setTimeout(() => {
      marsMap.invalidateSize({ pan: false });
      sync360ViewportSize();
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
  // 12. DYNAMIC WEATHER BY PLANETARY REGION (STAGE 5)
  // ==========================================================================
  const REGIONAL_WEATHER_DATA = {
    'jezero-alpha': {
      kicker: 'MEDA STATION // METEOROLOGICAL REPORT',
      title: 'WEATHER AT JEZERO CRATER',
      sol: 'SOL 1420',
      temp: '-62°C',
      max: '-18°C',
      min: '-84°C',
      wind: '24.5 <small>km/h</small>',
      windDir: 'Direction: ENE (68°)',
      press: '718 <small>Pa</small>',
      pressSub: '95.3% CO₂ Nominal',
      tau: '&tau; 0.74',
      uv: '0.24 <small>mSv/h</small>',
      alertTitle: 'DUST STORM ALERT',
      alertDesc:
        'Regional front detected 42 km SW of Jezero. Visibility drop and solar recharge reduction (-18%) forecast within 3 hours.'
    },
    'jezero-beta': {
      kicker: 'MEDA-NORTH STATION // METEOROLOGICAL REPORT',
      title: 'WEATHER AT JEZERO (BELVA RIM)',
      sol: 'SOL 1420',
      temp: '-65°C',
      max: '-21°C',
      min: '-86°C',
      wind: '29.2 <small>km/h</small>',
      windDir: 'Direction: NE (45°)',
      press: '704 <small>Pa</small>',
      pressSub: 'Upper Delta Plateau',
      tau: '&tau; 0.81',
      uv: '0.26 <small>mSv/h</small>',
      alertTitle: 'TURBULENT GUSTS AT BELVA CRATER',
      alertDesc:
        'Active convective vortices (Dust Devils) over the Belva impact crater rim. Maintain traction anchoring.'
    },
    'gale-sharp': {
      kicker: 'REMS STATION (MSL) // METEOROLOGICAL REPORT',
      title: 'WEATHER AT GALE CRATER',
      sol: 'SOL 4412',
      temp: '-54°C',
      max: '-9°C',
      min: '-79°C',
      wind: '18.4 <small>km/h</small>',
      windDir: 'Direction: NNW (338°)',
      press: '845 <small>Pa</small>',
      pressSub: 'Deep basin (-4.5 km)',
      tau: '&tau; 0.58',
      uv: '0.21 <small>mSv/h</small>',
      alertTitle: 'SLOPE WIND ON AEOLIS MONS',
      alertDesc:
        'Thermal flows descending from Mount Sharp summit. Clear orbital visibility for EVA ascent.'
    },
    'valles-marineris': {
      kicker: 'MRO-MCS PROBE // METEOROLOGICAL REPORT',
      title: 'WEATHER AT VALLES MARINERIS',
      sol: 'SOL 1420',
      temp: '-48°C',
      max: '-4°C',
      min: '-74°C',
      wind: '64.8 <small>km/h</small>',
      windDir: 'Axial Canyon: E (92°)',
      press: '890 <small>Pa</small>',
      pressSub: 'High density in abyss',
      tau: '&tau; 1.32',
      uv: '0.19 <small>mSv/h</small>',
      alertTitle: '⚠ SEVERE ALERT: CANYON KATABATIC WIND',
      alertDesc:
        'Channeled 64.8 km/h gusts along Coprates Chasma floor. Morning H₂O fog and dense suspended dust.'
    }
  };

  let liveMarsWeatherFeed = null;

  async function fetchLiveMarsWeatherTelemetry() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5500);
    try {
      const res = await fetch(
        'https://api.nasa.gov/insight_weather/?api_key=DEMO_KEY&feedtype=json&ver=1.0',
        { signal: controller.signal }
      );
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const sols = Array.isArray(data.sol_keys) ? data.sol_keys : [];
      if (sols.length > 0) {
        const latestSol = sols[sols.length - 1];
        const sData = data[latestSol];
        if (sData?.AT) {
          liveMarsWeatherFeed = {
            sol: `SOL ${latestSol} (LIVE)`,
            avTemp: `${Math.round(sData.AT.av)}°C`,
            maxTemp: `${Math.round(sData.AT.mx)}°C`,
            minTemp: `${Math.round(sData.AT.mn)}°C`,
            windKmh: sData.HWS ? `${(sData.HWS.av * 3.6).toFixed(1)} <small>km/h</small>` : null,
            windDir: sData.WD?.most_common?.compass_point
              ? `Direction: ${sData.WD.most_common.compass_point} (${sData.WD.most_common.compass_degrees}°)`
              : null,
            pressPa: sData.PRE ? `${Math.round(sData.PRE.av)} <small>Pa</small>` : null
          };
          updateRegionalWeatherPanel(currentRouteKey);
        }
      }
    } catch {
      clearTimeout(timer);
    }
  }

  function updateRegionalWeatherPanel(routeKey) {
    const w = REGIONAL_WEATHER_DATA[routeKey] || REGIONAL_WEATHER_DATA['jezero-alpha'];
    const setHtml = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = val;
    };

    const statusBadge = liveMarsWeatherFeed
      ? `<span class="wc-live-badge"><i class="fa-solid fa-satellite-dish"></i> NASA LIVE TELEMETRY</span>`
      : `<span class="wc-live-badge is-fallback"><i class="fa-solid fa-database"></i> MEDA / REMS REFERENCE</span>`;

    setHtml('wc-kicker', `${w.kicker}<br>${statusBadge}`);
    setHtml('wc-title', w.title);
    setHtml('wc-sol', liveMarsWeatherFeed?.sol || w.sol);
    setHtml('wc-temp-val', liveMarsWeatherFeed?.avTemp || w.temp);
    setHtml('wc-temp-max', liveMarsWeatherFeed?.maxTemp || w.max);
    setHtml('wc-temp-min', liveMarsWeatherFeed?.minTemp || w.min);
    setHtml('wc-wind-val', liveMarsWeatherFeed?.windKmh || w.wind);
    setHtml('wc-wind-dir', liveMarsWeatherFeed?.windDir || w.windDir);
    setHtml('wc-press-val', liveMarsWeatherFeed?.pressPa || w.press);
    setHtml('wc-press-sub', w.pressSub);
    setHtml('wc-tau-val', w.tau);
    setHtml('wc-uv-val', w.uv);
    setHtml('wc-alert-title', w.alertTitle);
    setHtml('wc-alert-desc', w.alertDesc);
  }

  fetchLiveMarsWeatherTelemetry();

  // ==========================================================================
  // 13. NASA MISSIONS DOSSIER (<dialog closedby="any">) & EVA EXPORT
  // ==========================================================================
  const NASA_MISSIONS_DOSSIER = [
    {
      id: 'perseverance-m2020',
      shortName: 'Perseverance (Mars 2020)',
      subLabel: 'Jezero Crater • Active',
      icon: 'fa-truck-monster',
      agency: 'NASA / JPL-CALTECH // MARS 2020 PROGRAM',
      name: 'Perseverance Rover (Mars 2020 Mission)',
      status: 'OPERATIONAL ON SURFACE (SOL 1420)',
      coords: [18.4447, 77.4508],
      routeKey: 'jezero-alpha',
      stationId: 'scene-kodiak',
      summary:
        'Astrobiology laboratory powered by a 1,025 kg Multi-Mission Radioisotope Thermoelectric Generator (MMRTG). Landed on February 18, 2021 at Octavia E. Butler Landing with the mission to collect core rock samples from the ancient lake delta and validate critical technologies for human exploration.',
      specs: [
        { label: 'LANDING SITE', val: '18.4447°N, 77.4508°E' },
        { label: 'MOLA ALTITUDE', val: '-2,564 meters' },
        { label: 'POWER SOURCE', val: 'MMRTG Pu-238 (110W)' },
        { label: 'O₂ PRODUCTION (MOXIE)', val: '122g O₂ (98% Purity)' },
        { label: 'SEALED SAMPLES', val: '24 Titanium Tubes' },
        { label: 'AUTONOMOUS SPEED', val: 'AutoNav 120 m/hour' }
      ],
      instruments: [
        '<strong>MOXIE (ISRU Oxygen):</strong> Demonstrated electrochemical conversion of Martian atmospheric CO₂ into breathable oxygen for future astronauts.',
        '<strong>RIMFAX (Subsurface Radar):</strong> Mapped buried strata and water ice lenses up to 20 meters beneath the rover wheels.',
        '<strong>MEDA (Environmental Station):</strong> Provides live wind, pressure, humidity, dust, and UV radiation telemetry displayed on this HUD.',
        '<strong>PIXL & SHERLOC:</strong> X-ray fluorescence and deep-UV Raman spectrometers to detect hydrated minerals and organic compounds.'
      ]
    },
    {
      id: 'ingenuity-field',
      shortName: 'Ingenuity Helicopter',
      subLabel: '72 Flights Completed',
      icon: 'fa-helicopter',
      agency: 'NASA / JPL / AEROVIRONMENT // TECH DEMONSTRATOR',
      name: 'Ingenuity Mars Helicopter (Ginnie)',
      status: 'HISTORIC MISSION COMPLETED (72 FLIGHTS)',
      coords: [18.4486, 77.4509],
      routeKey: 'jezero-alpha',
      stationId: 'scene-landing',
      summary:
        'First powered aircraft to achieve controlled flight on another planet (April 19, 2021). Originally designed for only 5 test flights, it exceeded all expectations by completing 72 flights as an advance aerial scout for Perseverance in an atmosphere with barely 1% of Earth density.',
      specs: [
        { label: 'HOME AIRFIELD', val: 'Wright Brothers Field' },
        { label: 'TOTAL FLIGHTS', val: '72 Successful Flights' },
        { label: 'DISTANCE FLOWN', val: '17.0 kilometers' },
        { label: 'MAX ALTITUDE', val: '24.0 meters AGL' },
        { label: 'CRUISING SPEED', val: '10.0 m/s (36 km/h)' },
        { label: 'COAXIAL ROTOR', val: '2,537 RPM Carbon Fiber' }
      ],
      instruments: [
        '<strong>RTE Color Camera (13 MP):</strong> Aerial reconnaissance of scarps, dune fields (Séítah), and safe routes for the rover and future explorers.',
        '<strong>Navcam Black & White Camera:</strong> Optical terrain tracking at 30 frames per second for autonomous flight navigation.',
        '<strong>Garmin Laser Altimeter:</strong> Continuous ground-clearance measurement over rugged rocky relief.'
      ]
    },
    {
      id: 'global-curiosity',
      shortName: 'Curiosity (MSL)',
      subLabel: 'Gale Crater • Mount Sharp',
      icon: 'fa-robot',
      agency: 'NASA / JPL-CALTECH // MARS SCIENCE LABORATORY',
      name: 'Curiosity Rover (MSL) — Gale Crater',
      status: 'OPERATIONAL ON SURFACE (SOL 4412+)',
      coords: [-4.5895, 137.4417],
      routeKey: 'gale-sharp',
      stationId: 'scene-gale',
      summary:
        'Operating on Mars since August 6, 2012. Curiosity has climbed over 800 vertical meters up the foothills of Mount Sharp (Aeolis Mons), confirming that the ancient Gale Crater lake held pH-neutral liquid water and all key chemical ingredients for life (C, H, N, O, P, S).',
      specs: [
        { label: 'LANDING SITE', val: 'Bradbury Landing (-4.58°S)' },
        { label: 'BASE ALTITUDE', val: '-4,501 meters (MOLA)' },
        { label: 'TOTAL ODOMETRY', val: '+32.4 kilometers' },
        { label: 'RADIATION DOSE (RAD)', val: '0.64 mSv/day on surface' },
        { label: 'DRILL SAMPLES', val: '42 Samples Analyzed' },
        { label: 'POWER', val: 'Nuclear MMRTG' }
      ],
      instruments: [
        '<strong>RAD (Radiation Assessment Detector):</strong> Key instrument that first measured galactic cosmic and solar radiation on the surface to design human habitat shielding.',
        '<strong>SAM (Sample Analysis at Mars):</strong> Chemical laboratory that detected complex organic molecules and seasonal methane variations.',
        '<strong>ChemCam (LIBS):</strong> Laser ablation spectrometer capable of vaporizing rocks from 7 meters away to identify elemental composition.'
      ]
    },
    {
      id: 'global-insight',
      shortName: 'InSight Lander',
      subLabel: 'Elysium Planitia • Geophysics',
      icon: 'fa-wave-square',
      agency: 'NASA DISCOVERY PROGRAM // CNES / DLR',
      name: 'InSight Geophysical Lander — Elysium Planitia',
      status: 'SEISMIC ARCHIVE COMPLETED (2018-2022)',
      coords: [4.5024, 135.6234],
      routeKey: null,
      stationId: null,
      summary:
        'First mission dedicated to investigating Mars deep interior. Revealed Martian crustal thickness (24 to 72 km), the size of its liquid iron-nickel core (radius ~1,830 km), and current meteorite impact rates, essential data for structural engineering of permanent bases.',
      specs: [
        { label: 'COORDINATES', val: '4.5024°N, 135.6234°E' },
        { label: 'MOLA ALTITUDE', val: '-2,613 meters' },
        { label: 'MARSQUAKES DETECTED', val: '1,319 Seismic Events' },
        { label: 'STRONGEST QUAKE', val: 'Magnitude 4.7 (Sol 1222)' },
        { label: 'HEAT FLOW', val: 'HP³ Mole (40 cm depth)' },
        { label: 'POWER', val: 'UltraFlex Solar Arrays' }
      ],
      instruments: [
        '<strong>SEIS (Broadband Seismometer):</strong> Mapped active tectonic zones (Cerberus Fossae) to avoid building human camps over active faults.',
        '<strong>TWINS (Weather Sensors):</strong> Continuous monitoring of dust vortices and atmospheric infrasound.'
      ]
    },
    {
      id: 'global-viking1',
      shortName: 'Viking 1 Lander',
      subLabel: 'Chryse Planitia • 1976',
      icon: 'fa-flag-usa',
      agency: 'NASA LANGLEY / JPL // VIKING PROGRAM',
      name: 'Historic Viking 1 Lander — Chryse Planitia',
      status: 'PLANETARY HERITAGE SITE (1976-1982)',
      coords: [22.48, -47.95],
      routeKey: null,
      stationId: null,
      summary:
        'Landed on July 20, 1976, transmitting the first sharp panoramic photographs from the Martian surface and operating for 2,245 sols (over 6 Earth years). Its regolith analyses established the presence of perchlorates and iron oxides that guide today EVA decontamination protocols.',
      specs: [
        { label: 'COORDINATES', val: '22.4800°N, 47.9500°W' },
        { label: 'MOLA ALTITUDE', val: '-3,627 meters' },
        { label: 'OPERATIONAL SPAN', val: '2,245 Martian Sols' },
        { label: 'SURFACE MASS', val: '572 kilograms' },
        { label: 'POWER', val: '2x SNAP-19 RTG' },
        { label: 'DESIGNATED STATION', val: 'Thomas Mutch Memorial' }
      ],
      instruments: [
        '<strong>GCMS (Gas Chromatograph / Mass Spectrometer):</strong> Characterized surface soil chemistry and the CO₂-dominated atmosphere (95.3%).',
        '<strong>Surface Sampler Arm:</strong> Dug the first Martian regolith trenches for biological experiments.'
      ]
    },
    {
      id: 'global-olympus',
      shortName: 'MRO HiRISE & MGS MOLA',
      subLabel: 'Orbital Mapping Network',
      icon: 'fa-satellite',
      agency: 'NASA / JPL / USGS ASTROGEOLOGY // ORBITAL NETWORK',
      name: 'Orbital Constellation: MRO (HiRISE/CRISM) & MGS (MOLA)',
      status: 'ACTIVE ORBITAL LINK (250-400 KM)',
      coords: [18.65, -133.8],
      routeKey: 'valles-marineris',
      stationId: 'scene-valles',
      summary:
        'Topographic, geological, and water-ice datasets powering the 5 layers of this application originate from the MOLA Laser Altimeter (Mars Global Surveyor) and HiRISE (25 cm/pixel), CTX, and SHARAD radar sensors aboard the Mars Reconnaissance Orbiter (MRO), including mapping of Olympus Mons (+21,229m) and Valles Marineris.',
      specs: [
        { label: 'HIRISE RESOLUTION', val: '0.25 meters / pixel' },
        { label: 'MOLA VERTICAL ACCURACY', val: '±1.0 meter absolute' },
        { label: 'SHARAD RADAR (ICE)', val: 'Penetration up to 1 km' },
        { label: 'OLYMPUS MONS SUMMIT', val: '+21,229 meters' },
        { label: 'VALLES MARINERIS ABYSS', val: '-4,120 to -7,000 meters' },
        { label: 'UHF TELEMETRY RELAY', val: 'Electra Transceiver' }
      ],
      instruments: [
        '<strong>MOLA (Mars Orbiter Laser Altimeter):</strong> Foundation of the global digital elevation model used in this planner to compute slopes and metabolic effort.',
        '<strong>CRISM & THEMIS:</strong> Orbital spectrometers identifying hydrated clays, carbonates, and subsurface water-ice reserves (ISRU).'
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
      routeKey: currentRouteKey,
      evaConfig: { ...evaConfig },
      activeRoute: {
        code: activeRouteData.code,
        title: activeRouteData.title,
        sector: activeRouteData.sector,
        desc: activeRouteData.desc,
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
        sub: wp.sub || '',
        distanceKm: Number(wp.km.toFixed(1)),
        elevationMeters: wp.elev,
        coords: wp.coords
      }))
    };
  }

  // Importar Plan EVA desde archivo .json descargado previamente
  const btnImportJson = document.getElementById('btn-import-json');
  const inputImportJson = document.getElementById('input-import-json');

  if (btnImportJson && inputImportJson) {
    btnImportJson.addEventListener('click', () => inputImportJson.click());

    inputImportJson.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const rawText = await file.text();
        const parsed = JSON.parse(rawText);
        if (!Array.isArray(parsed.waypoints) || parsed.waypoints.length < 2) {
          throw new Error('JSON file does not contain at least 2 valid waypoints.');
        }

        if (parsed.evaConfig) {
          evaConfig = {
            crewSize: Number(parsed.evaConfig.crewSize || 2),
            transportMode: parsed.evaConfig.transportMode || 'rover',
            departureWindow: parsed.evaConfig.departureWindow || 'morning'
          };
          if (evaCrewSelect) evaCrewSelect.value = String(evaConfig.crewSize);
          if (evaModeSelect) evaModeSelect.value = evaConfig.transportMode;
          if (evaWindowSelect) evaWindowSelect.value = evaConfig.departureWindow;
        }

        activeRouteData = {
          id: 'custom',
          code: parsed.activeRoute?.code || 'IMPORTED-EVA',
          title: parsed.activeRoute?.title || 'Imported EVA Plan',
          sector: parsed.activeRoute?.sector || 'Sector: Imported Tactical Manifest (.JSON)',
          desc: parsed.activeRoute?.desc || 'Expedition restored from official EVA telemetry file.',
          difficulty: parsed.activeRoute?.difficulty || 'CUSTOM',
          maxSlopeDeg: Number(parsed.activeRoute?.maxSlopeDeg || 12),
          slopeStatus: 'CALCULATED',
          avgSpeedKmh: 2.9,
          totalDistKm: 0,
          baseO2RatePerKm: 3.25,
          baseBatteryPerKm: 1.85,
          center: parsed.waypoints[0].coords,
          zoom: 8,
          pathCoords: [],
          waypoints: parsed.waypoints.map((w, i) => ({
            name: w.name || `EVA Waypoint 0${i + 1}`,
            sub: w.sub || `LAT ${Number(w.coords[0]).toFixed(3)}° LON ${Number(w.coords[1]).toFixed(3)}°`,
            km: Number(w.distanceKm || 0),
            coords: [Number(w.coords[0]), Number(w.coords[1])],
            elev: typeof w.elevationMeters === 'number'
              ? w.elevationMeters
              : estimateNumericAltitude(Number(w.coords[0]), Number(w.coords[1]))
          }))
        };

        currentRouteKey = 'custom';
        if (routeSelector) routeSelector.value = 'custom';
        recalculateRouteMetricsFromWaypoints(false);
        rebuildRegionalNasaLayers('custom');
        renderRouteOnMap(true);
        updateRoverProgress(Number(parsed.roverLiveTelemetry?.progressPercent ?? 0));
        refreshEvaManifestPreview();
        if (dossierDialog?.open) dossierDialog.close();
        if (typeof playHudTone === 'function') playHudTone(940, 0.09, 'sine');
      } catch (err) {
        alert(`Could not import EVA Plan: ${err.message}`);
      } finally {
        inputImportJson.value = '';
      }
    });
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

  // Download the EVA Manifest as a real .json file
  if (btnDownloadJson) {
    btnDownloadJson.addEventListener('click', () => {
      const manifest = buildCurrentEvaManifestObject();
      const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MARTE-EVA-PLAN-${activeRouteData.code}-SOL1420.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      playHudTone(960, 0.1, 'sine');
    });
  }

  // Copy EVA telemetry to clipboard
  if (btnCopyManifest) {
    btnCopyManifest.addEventListener('click', async () => {
      const text = JSON.stringify(buildCurrentEvaManifestObject(), null, 2);
      try {
        await navigator.clipboard.writeText(text);
        if (copyManifestLabel) {
          copyManifestLabel.textContent = 'TELEMETRY COPIED TO CLIPBOARD!';
          setTimeout(() => {
            copyManifestLabel.textContent = 'COPY TELEMETRY TO CLIPBOARD';
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
    } catch (e) {
      // Ignorar si el navegador bloquea autoplay de audio antes de interacción
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

  // Initialize restored or default route (JEZERO-ALPHA), vision cone, and Street View on startup
  loadStreetViewStation('scene-kodiak', true, false);
  if (!restoreMissionStateFromStorage()) {
    loadRoute('jezero-alpha', false);
  }
  updateRoverVisionConeOnMap(14, 90);

  if ('serviceWorker' in navigator && /^https?:$/i.test(window.location.protocol)) {
    window.addEventListener('load', () => {
      if ('caches' in window) {
        caches
          .keys()
          .then((keys) => {
            keys
              .filter((k) => k !== 'marte-hud-offline-v21')
              .forEach((k) => caches.delete(k));
          })
          .catch(() => {});
      }
      navigator.serviceWorker
        .register('./sw.js?v=21')
        .then((reg) => {
          if (reg && typeof reg.update === 'function') reg.update().catch(() => {});
        })
        .catch(() => {});
    });
  }
}

const MissionControlVoice = {
    audioPlayer: null,
    audioCache: {},
    apiUrl: 'https://mars-voice-api-1072208312217.us-central1.run.app/api/narrate',

    narrate: async function(text) {
        if (!text) return;

        // 1. Stop previous audio if playing
        if (this.audioPlayer) {
            this.audioPlayer.pause();
            this.audioPlayer.currentTime = 0;
        }

        const cachedUrl = this.audioCache[text];
        if (cachedUrl) {
            console.log("🎵 Replaying cached F5-TTS narration...");
            this.audioPlayer = new Audio(cachedUrl);
            this.audioPlayer.volume = 1.0;
            try {
                await this.audioPlayer.play();
            } catch (playError) {
                console.warn("⚠️ Error playing cached audio:", playError);
            }
            return;
        }

        console.log("📡 Requesting narration from F5-TTS voice server...");

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: text })
            });

            if (!response.ok) throw new Error(`HTTP response error: ${response.status}`);

            // 2. Retrieve Blob and verify size
            const audioBlob = await response.blob();
            console.log(`📦 Audio received. Size: ${audioBlob.size} bytes | Type: ${audioBlob.type}`);

            if (audioBlob.size === 0) {
                console.error("⚠️ Server returned an empty audio file (0 bytes).");
                return;
            }

            // 3. Create WAV object URL, cache it, and initialize audio player
            const audioUrl = URL.createObjectURL(audioBlob);
            this.audioCache[text] = audioUrl;

            this.audioPlayer = new Audio(audioUrl);
            this.audioPlayer.volume = 1.0;

            this.audioPlayer.onloadedmetadata = () => {
                console.log(`⏱️ Audio duration: ${this.audioPlayer.duration.toFixed(2)} seconds`);
            };

            try {
                await this.audioPlayer.play();
                console.log("🔊 Playing Mars narration...");
            } catch (playError) {
                console.warn("⚠️ Error playing audio:", playError);
            }

        } catch (error) {
            console.error("❌ Failed to communicate with Mars Voice server:", error);
        }
    },

    stop: function() {
        if (this.audioPlayer) this.audioPlayer.pause();
    }
};

// Start immediately if DOM is ready, or wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMarsDashboard);
} else {
  initMarsDashboard();
}