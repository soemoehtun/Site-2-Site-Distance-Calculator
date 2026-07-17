# Site to Site Distance Calculator

A powerful web-based tool for calculating distances between geographic locations and visualizing them on interactive maps. Perfect for logistics, facility planning, retail analysis, and any use case requiring proximity analysis between multiple sites.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Step by Step Guide](#step-by-step-guide)
- [Calculation Method](#calculation-method)
- [Data Format Requirements](#data-format-requirements)
- [Export Formats](#export-formats)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Troubleshooting](#troubleshooting)
- [Technical Details](#technical-details)

---

## Features

### 1. Dual Dataset Modes

#### All Sites (Single File Mode)
- Upload one file containing all your sites
- Each site will find its N nearest neighbors from the same dataset
- Ideal for: store clustering, facility proximity analysis

#### Source & Target (Pairwise Mode)
- Upload two separate files: source sites and target sites
- Each source site finds its N nearest targets
- Ideal for: customer to store mapping, delivery route optimization

### 2. Nearest Neighbor Algorithms

#### Brute Force 1-NN
- Calculates raw Haversine distances to every point and selects the absolute closest N sites.
- Ideal for exact distance-based proximity when ignoring topology.

#### Voronoi 1-Layer (Delaunay Triangulation)
- Calculates logical proximity based on geometric adjacency (Voronoi Diagrams / Delaunay Triangulation).
- Layer 1 finds directly adjacent neighbors (sharing a Voronoi boundary).
- Layer 2 expands to neighbors of neighbors.
- Ideal for natural territory mapping and spatial coverage analysis.

### 3. Flexible Data Import

| Format | Extension | Description |
|--------|----------|------------|
| CSV | .csv | Comma-separated values |
| Text | .txt | Tab or comma delimited |
| Excel | .xlsx, .xls | Microsoft Excel files |

- Automatic column detection (ID, Latitude, Longitude)
- Manual column mapping override
- Drag and drop support
- Large file support with progress indication

### 4. Advanced Filtering

- **Search by Site ID**: Quick search to locate specific sites
- **Column Filters**: Filter sites by any data column value
- **Distance Filters**: Exclude zero distances (identical coordinates)
- **Max Distance**: Set maximum neighbor distance threshold
- **Operator Options**: <, <=, =, >, >=

### 5. Interactive Map Visualization

#### Map Layers
| Style | Description |
|-------|-------------|
| Light | Clean, minimal basemap |
| Dark | Dark theme for presentations |
| Satellite | Aerial imagery |
| OSM | OpenStreetMap tiles |

#### Customization Options
- Marker icons (Google Earth style icons)
- Marker colors (14 predefined colors)
- Marker size (8-72px)
- Marker opacity (25-100%)
- Site labels toggle
- Connection lines (color, thickness, opacity)
- Global scale slider (0.5x - 3.0x)

#### Map Features
- Marker clustering for large datasets
- Hover highlighting
- **Combined Voronoi Polygons**: Visualize underlying territory areas when using the Voronoi algorithm.
- Click-to-zoom on table selection
- Fly-to animation
- Custom zoom controls
- Layer switcher

### 6. Data Table View

Virtualized table rendering for handling datasets with 100,000+ rows:

- Source Site column
- Rank column (#1, #2, #3, etc. - in Voronoi mode, resets per layer)
- Neighbor Site column
- Distance column (with unit)
- Voronoi Layer (only available in Voronoi algorithm mode)
- Click row to zoom to site on map
- Smooth scrolling

### 7. Custom Popup Information

Configurable popup display showing:
- Site ID / Name
- Coordinate (Lat, Lng)
- Custom data columns (user selectable)
- Nearest N neighbors with distances
- Parent source sites (for targets)

### 8. Export Options

#### GeoJSON
Standard GeoJSON format with:
- Point features for sites
- LineString features for connections
- All properties included

#### KML (Google Earth)
- Styled placemarks
- Connection lines
- Info bubbles with neighbor data
- **Voronoi Cell Polygons**: Bounded territory regions for neighborhood analysis.
- Compatible with Google Earth Pro

#### Excel (XLSX)
Contains one clean sheet:
1. **Detailed_Distances**: Directed list (Source → Neighbor) with distance and rank. In Voronoi mode, this also includes the `Voronoi Layer` each neighbor belongs to, with `Rank` values ordered cleanly within each layer.

---

## Getting Started

### Prerequisites

Modern web browser (Chrome, Firefox, Edge, Safari)
No installation required - runs entirely in browser

### Quick Start

1. Open the HTML file in your browser
2. Drag and drop your CSV/Excel file
3. Verify column mappings are correct
4. Set calculation mode (Brute Force or Voronoi) and neighbor limits
5. Click "Calculate & Draw"
6. Explore results on map

---

## Step by Step Guide

### Step 1: Choose Calculation Mode

| Dataset Mode | Use When |
|------|---------|
| All Sites (1 File) | Finding neighbors within one dataset |
| Source & Target | Finding targets from a separate dataset |

**Location**: Left panel > Mode section

### Step 2: Upload Source File

1. **Drag & Drop** or click Browse
2. Supported formats: CSV, TXT, XLS, XLSX
3. File loads automatically
4. Column detection runs

**Location**: Left panel > Source File section

### Step 3: Upload Target File (Pairwise Mode Only)

1. Switch to "Source & Target" mode
2. Upload second file
3. Map columns separately

**Location**: Left panel > Target File section

### Step 4: Configure Column Mappings

After upload, verify these mappings:

| Field | Description | Auto-Detected By |
|-------|-------------|------------------|
| Site Name | Unique identifier | id, site, name, code |
| Latitude | Y coordinate | lat |
| Longitude | X coordinate | lng, lon |

**Location**: Left panel > Source Mapping / Target Mapping sections

### Step 5: Select Popup Columns (Optional)

Choose which data fields to display in map popups:

1. Go to "Columns" tab
2. Check desired columns
3. For Source AND Target mode, configure separately

**Location**: Sidebar > Columns tab > Popup Columns

### Step 6: Customize Map Appearance (Optional)

Customize markers and lines:

1. Go to "Style" tab
2. Click Source/Target Style buttons
3. Choose icon, color, size, opacity
4. Adjust line settings
5. Toggle site labels
6. Toggle Voronoi global diagram visibility

**Location**: Sidebar > Style tab

### Step 7: Configure Analysis Settings

Set neighbor finding parameters:

| Setting | Description | Default |
|---------|-------------|---------|
| Algorithm | Brute Force or Voronoi | Brute Force |
| N Neighbors / Layers | Number of nearest sites or Voronoi layer depth | 3 / 1 |
| Distance Unit | km, m, mi, ft | km |
| Exclude Zero | Remove identical coordinates | Checked |
| Max Distance | Optional distance limit | None |

**Location**: Sidebar > Filter tab > Analysis Controls

### Step 8: Calculate & Visualize

1. Click "Calculate & Draw" button
2. Watch progress bar
3. View results on map
4. Switch between Map/Table views

**Location**: Left panel > Actions section

### Step 9: Search & Filter Results

Use the search bar to:
- Find specific site by ID
- Map auto-centers on matching site

Use column filters to:
- Show only sites matching criteria
- Chain with search for refined results

**Location**: Sidebar > Filter tab > Search section

### Step 10: Export Results

Click export buttons:
- GeoJSON: For GIS software
- KML: For Google Earth
- Excel: For further analysis

**Location**: Left panel > Actions section

---

## Calculation Method

### Haversine Formula

The application uses the **Haversine formula** to calculate geodesic distances between two points on a sphere (Earth).

#### Formula

```
a = sin²(Δφ/2) + cos(φ₁) × cos(φ₂) × sin²(Δλ/2)
c = 2 × atan2(√a, √(1-a))
d = R × c
```

Where:
- φ₁, φ₂ = latitudes in radians
- Δφ = latitude difference
- Δλ = longitude difference
- R = Earth's radius (6,371 km)
- d = distance

### Voronoi Diagram & Delaunay Triangulation

In Voronoi mode, the application builds a **Delaunay Triangulation** using the `delaunator` library to find naturally adjacent geographic neighbors.
- Points that share a triangle edge in the Delaunay graph are considered "Layer 1" neighbors.
- The Voronoi cells are derived from the circumcenters of the Delaunay triangles, mathematically representing the territory closest to each site.

#### Algorithm

1. Parse source and target coordinates
2. Generate Delaunay Triangulation (if using Voronoi Mode)
3. For each source site, calculate Haversine distance to targets (either all targets in Brute Force, or topologically adjacent targets in Voronoi mode).
4. Filter by max distance (if set)
5. Sort by distance ascending (and by layer in Voronoi mode)
6. Take top N neighbors or N layers
7. Build connection list

#### Async Chunking

For large datasets (10,000+ sites):
- Process in chunks of 50 sites
- Yield to browser between chunks
- Progress bar updates smoothly

---

## Data Format Requirements

### Minimum Required Columns

| Column | Description | Example |
|--------|------------|---------|
| Site ID | Unique identifier | ABC001, Store-123 |
| Latitude | Decimal degrees | 40.7128 |
| Longitude | Decimal degrees | -74.0060 |

### Coordinate Format

**Decimal Degrees** (WGS84):

```
Latitude:  -90 to 90 (N is positive)
Longitude: -180 to 180 (E is positive)
```

Examples:
- New York: 40.7128, -74.0060
- London: 51.5074, -0.1278
- Sydney: -33.8688, 151.2093

### Sample Data (CSV)

```csv
site_id,site_name,lat,lng,region,type
NYC001,New York Store,40.7128,-74.0060,NE,Retail
LAX002,Los Angeles Store,34.0522,-118.2437,West,Retail
CHI003,Chicago Store,41.8781,-87.6298,Midwest,Warehouse
```

---

## Export Formats

### GeoJSON Structure

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-74.0060, 40.7128]
      }
    }
  ]
}
```

### KML Structure (Google Earth)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <name>Site To Site Distance Calculator Export</name>
  <!-- Styled placemarks, connection lines, and layered Voronoi polygons -->
</Document>
</kml>
```

### Excel Structure (Detailed_Distances)

| Source Site | Neighbor Site | Distance (km) | Voronoi Layer | Rank |
|------------|---------------|---------------|---------------|------|
| NYC001 | CHI003 | 1143.205 | 1 | 1 |
| NYC001 | LAX002 | 3935.789 | 2 | 1 |
*(Note: Voronoi Layer is only present when using Voronoi Algorithm)*

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Zoom In | Mouse wheel up / + key |
| Zoom Out | Mouse wheel down / - key |
| Pan | Click and drag |
| Reset View | Click center button |

---

## Troubleshooting

### No Sites Display on Map

**Possible Causes:**
1. Invalid coordinate values
2. Incorrect column mapping
3. All coordinates are identical

**Solutions:**
- Verify latitude/longitude columns are numeric
- Check column mapping in mappings section
- Ensure lat is -90 to 90, lng is -180 to 180

### Distance Seems Incorrect

**Possible Causes:**
1. Wrong distance unit selected
2. Coordinates in wrong format

**Solutions:**
- Check distance unit setting (km, m, mi, ft)
- Verify coordinates are decimal degrees

### Large File Slow

**Possible Causes:**
1. Browser memory limits
2. Too many markers or Voronoi polygons

**Solutions:**
- Use max distance filter to reduce results
- Increase max zoom level for clustering
- Toggle off "Show Voronoi" map visual overlay
- Export to Excel for full data

---

## Technical Details

### Technologies Used

- **React 18**: UI Framework
- **Leaflet**: Interactive maps
- **Leaflet MarkerCluster**: Marker clustering
- **Delaunator**: Voronoi/Delaunay Triangulation
- **PapaParse**: CSV parsing
- **SheetJS (XLSX)**: Excel file handling
- **Lucide Icons**: Icon library

### Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13.1+ |
| Edge | 80+ |

### Coordinate Reference System

**WGS84** (EPSG:4326)
- Standard GPS coordinate system
- Used by all mapping applications

---

## License

This tool is provided as-is for educational and commercial use.
