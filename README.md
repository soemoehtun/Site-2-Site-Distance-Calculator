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

### 1. Dual Calculation Modes

#### All Sites (Single File Mode)
- Upload one file containing all your sites
- Each site will find its N nearest neighbors from the same dataset
- Ideal for: store clustering, facility proximity analysis

#### Source & Target (Pairwise Mode)
- Upload two separate files: source sites and target sites
- Each source site finds its N nearest targets
- Ideal for: customer to store mapping, delivery route optimization

### 2. Flexible Data Import

| Format | Extension | Description |
|--------|----------|------------|
| CSV | .csv | Comma-separated values |
| Text | .txt | Tab or comma delimited |
| Excel | .xlsx, .xls | Microsoft Excel files |

- Automatic column detection (ID, Latitude, Longitude)
- Manual column mapping override
- Drag and drop support
- Large file support with progress indication

### 3. Advanced Filtering

- **Search by Site ID**: Quick search to locate specific sites
- **Column Filters**: Filter sites by any data column value
- **Distance Filters**: Exclude zero distances (identical coordinates)
- **Max Distance**: Set maximum neighbor distance threshold
- **Operator Options**: <, <=, =, >, >=

### 4. Interactive Map Visualization

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
- Click-to-zoom on table selection
- Fly-to animation
- Custom zoom controls
- Layer switcher

### 5. Data Table View

Virtualized table rendering for handling datasets with 100,000+ rows:

- Source Site column
- Rank column (#1, #2, #3, etc.)
- Neighbor Site column
- Distance column (with unit)
- Click row to zoom to site on map
- Smooth scrolling

### 6. Custom Popup Information

Configurable popup display showing:
- Site ID / Name
- Coordinate (Lat, Lng)
- Custom data columns (user selectable)
- Nearest N neighbors with distances
- Parent source sites (for targets)

### 7. Export Options

#### GeoJSON
Standard GeoJSON format with:
- Point features for sites
- LineString features for connections
- All properties included

#### KML (Google Earth)
- Styled placemarks
- Connection lines
- Info bubbles with neighbor data
- Compatible with Google Earth Pro

#### Excel (XLSX)
Three sheets included:
1. **Detailed_Distances**: Source → Neighbor with rank
2. **Sites**: All sites with coordinates and types
3. **Unique_Connections**: Deduplicated connections

---

## Getting Started

### Prerequisites

Modern web browser (Chrome, Firefox, Edge, Safari)
No installation required - runs entirely in browser

### Quick Start

1. Open the HTML file in your browser
2. Drag and drop your CSV/Excel file
3. Verify column mappings are correct
4. Set number of neighbors (default: 3)
5. Click "Calculate & Draw"
6. Explore results on map

---

## Step by Step Guide

### Step 1: Choose Calculation Mode

| Mode | Use When |
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

**Location**: Sidebar > Style tab

### Step 7: Configure Analysis Settings

Set neighbor finding parameters:

| Setting | Description | Default |
|---------|-------------|---------|
| N Neighbors | Number of closest sites to find | 3 |
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

#### Implementation

```javascript
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
```

#### Distance Units

| Unit | Conversion Factor |
|------|------------------|
| Kilometers (km) | 1 |
| Meters (m) | 1000 |
| Miles (mi) | 0.621371 |
| Feet (ft) | 3280.84 |

### Algorithm

1. Parse source and target coordinates
2. For each source site, calculate distance to all targets
3. Filter by max distance (if set)
4. Sort by distance ascending
5. Take top N neighbors
6. Build connection list

#### Time Complexity

O(S × T × log(T)) where:
- S = number of source sites
- T = number of target sites
- Sorting is performed per source

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

### Sample Data (Excel)

| site_id | site_name | lat | lng | region | type |
|--------|----------|-----|-----|--------|------|
| NYC001 | New York Store | 40.7128 | -74.0060 | NE | Retail |
| LAX002 | Los Angeles Store | 34.0522 | -118.2437 | West | Retail |
| CHI003 | Chicago Store | 41.8781 | -87.6298 | Midwest | Warehouse |

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
      },
      "properties": {
        "id": "NYC001",
        "region": "NE",
        "type": "Retail"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-74.0060, 40.7128],
          [-118.2437, 34.0522]
        ]
      },
      "properties": {
        "from": "NYC001",
        "to": "LAX002",
        "distance": 3935.789
      }
    }
  ]
}
```

### KML Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <name>Site To Site Distance Calculator Export</name>
  <Style id="sourceStyle">
    <IconStyle>
      <scale>1.0</scale>
      <Icon>
        <href>http://www.google.com/mapfiles/kml/paddle/grn-blank.png</href>
      </Icon>
    </IconStyle>
  </Style>
  <Placemark>
    <name>NYC001</name>
    <description><![CDATA[<div>Distance: 3.942 km</div>]]></description>
    <styleUrl>#sourceStyle</styleUrl>
    <Point>
      <coordinates>-74.0060,40.7128,0</coordinates>
    </Point>
  </Placemark>
</Document>
</kml>
```

### Excel Structure

#### Sheet 1: Detailed_Distances
| Source Site | Rank | Neighbor Site | Distance (km) |
|------------|------|---------------|---------------|
| NYC001 | 1 | CHI003 | 1143.205 |
| NYC001 | 2 | LAX002 | 3935.789 |
| LAX002 | 1 | CHI002 | 2803.442 |

#### Sheet 2: Sites
| ID | Lat | Lng | Type | Neighbors |
|----|-----|-----|------|-----------|
| NYC001 | 40.7128 | -74.0060 | Source & Target | 1. CHI003 (1143.20 km) \| 2. LAX002 (3935.79 km) |

#### Sheet 3: Unique_Connections
| From | To | Distance (km) |
|------|----|---------------|
| NYC001 | CHI003 | 1143.205 |
| NYC001 | LAX002 | 3935.789 |

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
2. Too many markers

**Solutions:**
- Use max distance filter to reduce results
- Increase max zoom level for clustering
- Export to Excel for full data

### Export Not Working

**Possible Causes:**
1. No data calculated
2. Browser security settings

**Solutions:**
- Click Calculate & Draw first
- Try different browser
- Check browser console for errors

### Map Not Loading

**Possible Causes:**
1. No internet connection (for map tiles)
2. Browser compatibility

**Solutions:**
- Check internet connection
- Try Chrome or Firefox
- Check firewall/proxy settings

---

## Technical Details

### Technologies Used

- **React 18**: UI Framework
- **Leaflet**: Interactive maps
- **Leaflet MarkerCluster**: Marker clustering
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

### Performance Guidelines

| Dataset Size | Recommendation |
|--------------|--------------|
| < 1,000 sites | No issues |
| 1,000 - 10,000 | Use clustering |
| 10,000 - 50,000 | Use async processing |
| 50,000+ | Use max distance filter |

### Coordinate Reference System

**WGS84** (EPSG:4326)
- Standard GPS coordinate system
- Used by all mapping applications
- Earth-centered, Earth-fixed

---

## License

This tool is provided as-is for educational and commercial use.

## Version

Current Version: 1.0.0
