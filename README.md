# 🚀 M.A.R.T.E — Interplanetary Survival Guide: Martian Map
### NASA Space Apps Challenge 2026 // Challenge 1.1

> **"Real Data. Safer Journeys. Bigger Discoveries."**

![Status](https://img.shields.io/badge/MISSION%20STATUS-NOMINAL%20%2F%20ACTIVE-brightgreen)
![Challenge](https://img.shields.io/badge/NASA%20Space%20Apps-2026-ff6b2b)
![Build](https://img.shields.io/badge/Bundler-Vite%206-646cff)
![License](https://img.shields.io/badge/License-MIT-blue)

Interactive web platform for planning extravehicular activity (**EVA**) traverses and human survival on Mars. Designed as an **aerospace HUD console** (dark mode with `#FF6B2B` and `#00E5FF` accents), it combines **multispectral 2D orbital cartography**, biophysical life-support simulation, AI-generated voice briefings, and an immersive **360° Martian Street View** powered by real NASA/JPL mosaics and live telemetry feeds.

---

## ✨ Key Modules

1. **Multispectral 2D Orbital Map (`Leaflet.js`)**
   - **5 Orbital Base Maps**: Mars Viking MDIM 2.1, MOLA Color Shaded Relief, MOLA Elevation, CTX Global Mosaic, and Valles Marineris HiRISE.
   - **5 Toggleable NASA Tactical Layers**: Topographic Contours (MOLA), Geological Units (CRISM/THEMIS), Subsurface Water-Ice Reserves (SHARAD/RIMFAX ISRU), Dust Storm & Wind Advisories (MEDA/REMS), and Historic Landing Sites.
   - Real-time rover vision cone overlay synced to the 360° camera azimuth and FOV.

2. **EVA Route Planner & Survival Telemetry Engine**
   - **4 Curated Mission Routes**: `JEZERO-ALPHA`, `JEZERO-BETA`, `GALE-SHARP`, and `VALLES-SUR` (Coprates Chasma).
   - **Live Route Editing**: Custom drawing mode (`+ DRAW`), click-to-add waypoints, draggable markers, `UNDO`/`Ctrl+Z` support, and automatic `localStorage` state persistence.
   - **Topographic Elevation Profile (SVG)** & real-time O₂ consumption, MMRTG/solar battery autonomy, distance, ETA, crew size (`2–6` astronauts), transport mode (`Rover` vs. `Foot EVA`), and departure window calculations.

3. **Immersive 360° Martian Street View**
   - **6 Step-by-Step Stations** across Jezero Crater, Gale Crater (Mount Sharp), and Valles Marineris with real NASA/JPL panoramic imagery and a procedurally rendered 2D fallback canvas.
   - Interactive drag/zoom camera controls, azimuth compass, step pills, science/navigation hotspots, minimap overview, and a **NASA Photo Archive & Live Search Drawer** (`images-api.nasa.gov`).

4. **Dynamic Mars Weather, NASA Missions Dossier & EVA JSON Export**
   - Live Mars weather telemetry via NASA's InSight API (`api.nasa.gov/insight_weather/`) with regional MEDA/REMS/MRO-MCS fallback presets.
   - Native `<dialog>` **NASA Missions Dossier** covering Perseverance, Ingenuity, Curiosity, InSight, Viking 1, and MRO/MGS orbital sensors.
   - Full `.JSON` EVA manifest export, clipboard copy, and `.JSON` route import.

5. **Local AI Voice Briefing Server (`mars-voice-api`, Optional)**
   - Optional Flask + F5-TTS voice synthesis server (`http://localhost:5000/api/narrate`) that generates spoken station briefings and caches audio blobs per session.

6. **PWA & Offline Asset Caching**
   - Pre-caches local panoramic mosaics and core assets via `public/sw.js` and `public/manifest.webmanifest`.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES Modules), HTML5 (`<dialog>`, Canvas 2D, SVG), CSS3 Grid/Flexbox
- **Mapping & Build**: Leaflet 1.9.4, Vite 6
- **Voice API (Optional)**: Python 3, Flask, Flask-CORS, PyTorch, F5-TTS, SoundFile
- **Data Sources**: NASA/JPL-Caltech/ASU/MSSS, USGS Astrogeology (OpenPlanetaryMap Mars tiles), NASA Images API, NASA InSight Weather API

---

## 📂 Project Structure

```text
M.A.R.T.E/
├── mars-voice-api/
│   ├── app.py                  # Flask + F5-TTS narration API server (port 5000)
│   ├── test_voice.py           # Local verification script for voice generation
│   └── requirements.txt        # Python dependencies for the voice backend
├── public/
│   ├── panoramas/              # Local real NASA/JPL 360° panoramic mosaics
│   ├── manifest.webmanifest    # PWA manifest metadata
│   └── sw.js                   # Service Worker for offline panorama caching
├── index.html                  # Semantic HUD layout, control drawers, 360° viewer & dossier modal
├── styles.css                  # Aerospace dark HUD theme, Grid layout & responsive mobile styles
├── app.js                      # GIS logic (Leaflet), EVA telemetry, 360° engine & NASA APIs
├── vite.config.js              # Vite config with relative base ('./') for static deployment
└── package.json                # npm development and production build scripts
```

---

## 🚀 Quick Start

### 1. Frontend HUD (Required)

```bash
# 1. Navigate to the project directory
cd M.A.R.T.E

# 2. Install Node dependencies
npm install

# 3. Start the Vite development server
npm run dev

# 4. Build production bundle (outputs to dist/)
npm run build
```

### 2. AI Voice Narration Backend (Optional)

Ensure the reference audio file `mars-voice-api/AI_Ranni.wav` is present before launching the Flask server:

```bash
# 1. Navigate to the voice API directory
cd mars-voice-api

# 2. Create a virtual environment and install dependencies
python -m venv .venv
# Windows PowerShell: .\.venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

# 3. Run the F5-TTS server on port 5000
python app.py
```
