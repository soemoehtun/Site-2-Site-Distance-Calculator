# Myanmar Utility Toolset

This directory contains two standalone, browser-based utility applications designed for specific calculation and visualization tasks in Myanmar. Both tools are built as single-file HTML applications using React 18, Tailwind CSS, and Lucide-inspired SVG icons, requiring zero installation or local server setup.

---

## 🌎 1. Site-to-Site Distance Calculator

A professional geospatial visualization tool for calculating distances between multiple coordinates (Source to Target) and identifying nearest neighbors.

### Key Features
- **Flexible Modes**: Support for "All Sites (1 File)" to find neighbors within one dataset, or "Source & Target (2 Files)" for pairwise calculation.
- **Global Search & Filter**: Real-time filtering logic that displays a matching Source site along with all its connected Neighbor sites.
- **Analysis Controls**:
    - **N-Nearest Neighbors**: Adjustable range (1-50).
    - **Distance Units**: Toggle between Kilometers (km), Meters (m), Miles (mi), and Feet (ft).
    - **Max Distance Filter**: Limit results to a specific radius.
    - **Zero-Distance Exclusion**: Option to filter out identical site locations.
- **Premium Map Visualization**:
    - Multiple base layers (Light, Satellite, OSM, Terrain).
    - Interactive markers with custom Google Earth-style icons and labels.
    - Dynamic line connections between sites.
- **Export Capabilities**:
    - **GeoJSON**: For GIS and map data manipulation.
    - **KML**: Direct compatibility with Google Earth Pro.
    - **Excel (XLSX)**: Detailed breakdown including site IDs, coordinates, rankings, and distances.

### How to Use
1. Open `Site-to-Site-Distance-Calculator.html` in any modern web browser.
2. Upload your coordinate list (CSV, XLSX, or TXT formats supported).
3. Map your columns (ID, Latitude, Longitude).
4. Use the sidebar to fine-tune your visualization and export your results.

---

## ⚡ 2. Myanmar Electricity Bill Calculator

A mobile-responsive utility for calculating electricity costs based on the latest 2024 progressive slab rates in Myanmar.

### Key Features
- **Progressive Slab Logic**: Accurate tiered calculations ensuring the first units are charged at lower rates before moving to higher tiers.
- **Dual Categories**:
    - **Household**: 1-50 (50 MMK), 51-100 (100 MMK), 101-200 (150 MMK), 201+ (300 MMK).
    - **Commercial**: 1-5,000 (250 MMK), 5,001-20,000 (400 MMK), 20,001+ (500 MMK).
- **Detailed Results View**: A clean "Banking App" style breakdown showing the cost contribution of each unit tier.
- **Admin Settings View**: Persistent rate configuration allows you to manually adjust prices per unit to keep the app future-proof if government rates change.
- **Persistence**: Your custom rate settings are automatically saved to your browser's local storage.

### How to Use
1. Open `Myanmar-Electricity-Bill-Calculator.html` on your computer or mobile device.
2. Select your category (Household or Commercial).
3. Enter your total Units used for the month.
4. View the total cost and the slab breakdown.

---

## 🛠️ Technical Stack
- **Framework**: React 18 (via CDN)
- **Styling**: Tailwind CSS & Vanilla CSS
- **Icons**: Custom embedded SVGs
- **Data Handling**: PapaParse (CSV), SheetJS (Excel)
- **Maps**: Leaflet.js

Developed with 🇲🇲 in mind.
