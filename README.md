# Site to Site Distance Calculator

A high-performance, privacy-focused, browser-local geospatial analysis tool designed to calculate geodesic distances, nearest neighbor rankings, and multi-layer Voronoi tessellations between geographic coordinate datasets (CSV, Excel, KML, GPX, TXT) with interactive WebGL satellite mapping and Google Earth KMZ export.

---

## 1. Overview & Core Philosophy

**Site to Site Distance Calculator** is engineered for telecom network planning engineers, RF surveyors, GIS professionals, and spatial data analysts who need to measure distances and spatial proximity between infrastructure sites (such as cellular base stations, towers, fiber nodes, or facility points) without uploading sensitive network data to external cloud servers.

- **100% Client-Side Privacy**: All dataset parsing, spatial trigonometry, Delaunay triangulations, Voronoi cell generation, and KMZ archive compression execute entirely in your web browser. No site data or coordinates are ever transmitted over the network.
- **Hybrid WebAssembly + Web Worker Engine**: Computationally heavy operations (spherical distance matrices, Bowyer-Watson triangulation, binary KMZ archive compilation, and XLSX generation) are handled by a multi-threaded Go-compiled WebAssembly (WASM) worker pool with automatic TypeScript fallback.
- **GPU-Accelerated WebGL Visualization**: Powered by MapLibre GL JS to smoothly render tens of thousands of coordinate points, connection vectors, and Voronoi polygon cells at 60 FPS across satellite and vector basemaps.
- **Self-Contained Single-File Application**: The entire application, styles, workers, and WebAssembly payloads compile into a single portable `.html` file that can be distributed and run completely offline.

---

## 2. Calculation Modes & Spatial Algorithms

### A. Calculation Modes

| Mode | Description | Typical Use Case |
|---|---|---|
| **All Sites (Self-Matrix)** | Measures pairwise distances among all sites within a single dataset. | Identifying nearest neighboring cell towers within an existing network for handover and neighbor-list planning. |
| **Source & Target (Pairwise / Bipartite)** | Measures each site in the **Source Dataset** against sites in an independent **Target Dataset**. | Measuring new site candidate locations (Source) against existing live towers or competitor sites (Target). |

---

### B. Calculation Methods

#### 1. Brute-Force (Nearest N Neighbors)
- **Algorithm**: Calculates the Great-Circle (Haversine) spherical distance between every source point and potential target points:
  $$\Delta\sigma = 2 \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\phi_1 \cos\phi_2 \sin^2\left(\frac{\Delta\lambda}{2}\right)} \right)$$
  $$d = R \cdot \Delta\sigma$$
- **Configurable Parameters**:
  - **Number of Neighbors ($N$)**: 1 to 50 nearest neighbors per site.
  - **Distance Units**: Kilometers (`km`), Meters (`m`), Miles (`mi`), or Feet (`ft`).
  - **Distance Filters**: Optional condition (`<`, `<=`, `=`, `>`, `>=`) with a distance threshold (e.g., only include neighbors within $\le 5\text{ km}$).
  - **Exclude Zero Distances**: Automatically filters out identical coordinates (self-matches).
- **Map Representation**: Renders interactive geodesic connection lines between each source site and its resolved neighbors.

#### 2. Voronoi / Delaunay Neighbor Layers
- **Algorithm**:
  1. Computes the planar Bowyer-Watson Delaunay triangulation across the coordinate space.
  2. Constructs an optimized Delaunay adjacency graph ($O(\text{degree})$ lookup).
  3. Executes a Breadth-First Search (BFS) starting from each source site to categorize neighbors into topological graph distance rings:
     - **Layer 1**: Direct Delaunay / Voronoi neighbors (sites that share a common Voronoi polygon edge).
     - **Layer 2**: Secondary neighbors (neighbors of Layer 1 neighbors).
     - **Layer $N$**: Extended $N$-ring topological neighborhood.
  4. Generates closed Voronoi polygon cell boundaries around sites using triangle circumcenters.
- **Color-Coded Layers**: Distinct, high-contrast palette assigned per layer (Layer 1: Green, Layer 2: Yellow, Layer 3: Red, Layer 4: Cyan, Layer 5: Purple, etc.).
- **Map Representation**: Renders color-coded Voronoi polygon cell overlays representing the coverage basin of each site.

---

## 3. Google Earth KMZ & Excel Export System

The tool features a specialized export pipeline tailored specifically to the chosen calculation method:

### A. Google Earth KMZ Export Rules

| Calculation Method | Output in KMZ File |
|---|---|
| **Brute Force Mode** | • **Sites Folder**: Placemark pins/circles with coordinate metadata and neighbor list in popup.<br>• **Connections Folder**: LineString vectors connecting each site to its nearest neighbors with distance labels. |
| **Voronoi Mode** | • **Sites Folder**: Placemark pins/circles with coordinate metadata and color-coded layer breakdown in popup.<br>• **Voronoi Polygons Folder**: 2D closed polygon boundaries (`<Polygon>`) representing Voronoi cells.<br>• **No Connection Lines**: LineString connections are omitted to keep the Voronoi polygon tessellation clean. |

#### Additional KMZ Features:
- **KML Color Conversion**: Converts standard web hex colors (`#RRGGBB`) and opacity into Google Earth's required KML color format (`AABBGGRR`).
- **Interactive Balloons**: Clickable placemark popups include mapped site attributes and formatted neighbor distance summaries.
- **Offline Self-Contained Archive**: Zips `doc.kml` with embedded local icon sprites into a compressed `.kmz` archive compatible with Google Earth Pro (Desktop), Google Earth Web, and mobile viewers.

### B. Excel (.xlsx) Export
Produces a structured worksheet named `Detailed_Distances` containing:
- `Source Site`: ID of the origin site.
- `Neighbor Site`: ID of the neighboring site.
- `Distance (unit)`: Distance rounded to 3 decimal places.
- `Voronoi Layer`: Layer depth index (only included for Voronoi mode).
- `Rank`: Proximity rank per site (1 to $N$, or ranked within each Voronoi layer).

---

## 4. User Guide & Interface Walkthrough

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [≡] Site To Site Distance         [🔍 Search site name or any field…]   [10,000 points]│
├────────────────────┬───────────────────────────────────────────────────────────────────┤
│ [Source]  [Fields] │                                                                   │
│ [Style]   [Export] │                                                                   │
│ ───────────────────┤                         INTERACTIVE MAP                           │
│ Mode: All / Target │                       (MapLibre GL WebGL)                         │
│ Method: Brute / Voro                                                                   │
│ Neighbors / Layers │                 [Selected Site Focus & Zoom-in]                   │
│ Distance Filters   │             [Connection Lines / Voronoi Polygons]                 │
│ ───────────────────┤                                                                   │
│ [Calculate & Draw] │                                                                   │
└────────────────────┴───────────────────────────────────────────────────────────────────┘
```

### Step 1: Upload Datasets
- Open the **Source** tab.
- Drag and drop your coordinate file into **Source Dataset** (supports `.csv`, `.xlsx`, `.xls`, `.txt`, `.kml`, `.gpx`).
- If using **Source & Target** mode, switch the mode toggle and upload a second file into **Target Dataset**.
- If uploading multi-sheet Excel files, select the desired sheet from the worksheet dropdown.

### Step 2: Verify Column Mappings
- Click the **Fields** tab.
- Ensure **Site ID**, **Latitude**, and **Longitude** columns are mapped correctly. (The auto-detection engine matches column names automatically).
- Toggle checkboxes for any extra columns (e.g., `Township`, `Region`, `Operator`, `Height`) to include them in map popups and exports.

### Step 3: Configure Distance Parameters & Style
- In the sidebar, select your **Calculation Method**:
  - **Brute Force**: Set the number of nearest neighbors ($N$) and optional distance threshold filters.
  - **Voronoi**: Set the number of Voronoi layers (1 to 5).
- Choose your **Distance Unit** (`km`, `m`, `mi`, `ft`).
- In the **Style** tab, customize marker colors, marker scale, line color, line thickness, opacity, and toggle site label visibility.

### Step 4: Run Calculation
- Click **Calculate & Draw** (or press `Ctrl` + `Enter` / `Cmd` + `Enter`).
- The WebAssembly engine processes the dataset, draws the sites, renders connection lines or Voronoi polygons, and displays the summary legend.

### Step 5: Search & Inspect
- **Animated Search & Zoom-in**: Type in the top toolbar search input (`Search site name or any field…`). Press `Enter` or click a dropdown result to fly the camera directly to the site at a detailed zoom scale (`zoom: 15`).
- **Site Details Drawer**: Click any site marker on the map to open the slide-out details drawer showing all site attributes and ranked neighbor distances.

### Step 6: Export Results
- Click **Export KMZ** in the sidebar to download the Google Earth file.
- Click **Export Excel** to download the structured `.xlsx` calculation workbook.

---

## 5. Supported Input Formats

| Extension | Format | Features / Behavior |
|---|---|---|
| `.csv` | Comma-Separated Values | Auto-detects delimiters (comma, tab, semicolon, pipe), strips UTF-8 BOM, supports quoted multiline values. |
| `.xlsx` / `.xls` | Microsoft Excel | High-speed binary parsing with multi-sheet workbook dropdown picker. |
| `.txt` | Delimited Text Files | Tab- or comma-delimited coordinate tables. |
| `.kml` | Keyhole Markup Language | Extracts `Point` coordinates and `ExtendedData` XML attributes. |
| `.gpx` | GPS Exchange Format | Extracts Waypoints (`<wpt>`) and track points with metadata. |

### Column Auto-Detection Patterns
The engine uses case-insensitive fuzzy keyword matching to auto-map columns:
- **Latitude**: `latitude`, `lat`, `y`, `lat_dd`, `site_lat`, `ycoord`, `northing`
- **Longitude**: `longitude`, `long`, `lon`, `lng`, `x`, `site_lon`, `xcoord`, `easting`
- **Site ID / Name**: `site name`, `sitename`, `site_id`, `site id`, `site`, `name`, `id`, `cellid`, `label`

> **Coordinate Swap Guard**: The parser samples numerical coordinate ranges. If Latitude values exceed $\pm 90^\circ$ or match Longitude patterns, it automatically swaps the mapping to prevent inverted projections.

---

## 6. Technical Stack & Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client Browser                                │
├─────────────────────────────────────────────────────────────────────────┤
│  React 19 + TypeScript UI Layer (Vite 7 + Tailwind CSS 4)               │
│                                                                         │
│  ┌───────────────────────┐         ┌─────────────────────────────────┐  │
│  │   MapLibre GL JS      │         │   Dedicated Web Workers         │  │
│  │   WebGL Map Canvas    │         │   - parse.worker.ts (Parsing)   │  │
│  │   - Satellite Raster  │         │   - engine.worker.ts (WASM)     │  │
│  │   - Vector Pin Layers │         └────────────────┬────────────────┘  │
│  │   - Voronoi Polygons  │                          │                   │
│  │   - Geodesic Lines    │                          ▼                   │
│  └───────────────────────┘         ┌─────────────────────────────────┐  │
│                                    │   Go WebAssembly (WASM) Engine  │  │
│                                    │   - Great-Circle Distance       │  │
│                                    │   - Bowyer-Watson Delaunay      │  │
│                                    │   - Voronoi Cell Polygons       │  │
│                                    │   - Binary KMZ / XLSX Builders  │  │
│                                    └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

- **UI Framework**: React 19, TypeScript 5, Tailwind CSS 4, Vite 7
- **Mapping Engine**: MapLibre GL JS `v5.6.0` (WebGL vector tiles, raster tiles, polygon fill/outline, symbol layers)
- **High-Performance Spatial Engine**: Go (`1.22+`) compiled to WebAssembly with worker concurrency pool (`src/lib/engineClient.ts`, `engine/*.go`)
- **Spatial Triangulation**: Bowyer-Watson Delaunay Triangulation with Voronoi dual-graph generation (`src/lib/voronoi.ts` and `engine/delaunay.go`)
- **File Parsers**: SheetJS (`xlsx`), PapaParse, `@tmcw/togeojson`
- **Packaging & Compression**: JSZip `v3.10.1`, FileSaver.js `v2.0.5`
- **Single-File Bundler**: `vite-plugin-singlefile` (inlines all HTML, CSS, JavaScript, and WebAssembly into one single portable `dist/index.html` file)

---

## 7. Developer Setup & Build Instructions

### Prerequisites
- Node.js `18.0.0` or higher
- npm `9.0.0` or higher

```bash
# 1. Clone the repository
git clone https://github.com/your-username/site-to-site-distance.git
cd site-to-site-distance

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Build single-file production asset
npm run build

# 5. Preview production build locally
npm run preview
```

The production output is generated as a standalone file at `dist/index.html`. You can open this file directly in any modern web browser without needing a web server.

---

## 8. Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl` + `Enter` / `Cmd` + `Enter` | Run Distance Calculation & Draw Map |
| `Ctrl` + `E` / `Cmd` + `E` | Export to Google Earth KMZ |
| `Ctrl` + `L` / `Cmd` + `L` | Toggle Map Legend |
| `Ctrl` + `B` / `Cmd` + `B` | Toggle Sidebar Visibility |

---

## License

This project is licensed under the MIT License.
