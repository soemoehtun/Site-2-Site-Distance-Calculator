import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CalcMethod,
  CalcMode,
  CalculatedData,
  ColumnMapping,
  Dataset,
  DistanceOperator,
  DistanceUnit,
  Site,
} from "@/types";
import { PALETTE } from "@/types";
import { parseFile, parseFileSheet } from "@/lib/parse";
import { calculateDistancesAsync } from "@/lib/distance";
import {
  exportExcelFile,
  exportKmzFile,
} from "@/lib/export";
import MapView from "@/components/MapView";
import { engineVoronoiCells } from "@/lib/engine";
import { computeAllVoronoiPolygons } from "@/lib/voronoi";


/* ------------------------------------------------------------------ icons */
const I = {
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),

  Upload: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),

  Columns: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  ),

  Style: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  ),

  Filter: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),

  Search: (p: { size?: number }) => (
    <svg width={p.size ?? 14} height={p.size ?? 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),

  X: (p: { size?: number }) => (
    <svg width={p.size ?? 14} height={p.size ?? 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),

  Export: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),

  Bolt: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),

  Trash: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),

  Sheet: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="9" x2="9" y2="21" />
    </svg>
  ),

  Cloud: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 16V4m0 0L8 8m4-4 4 4" /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  ),

  FileSheet: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M8 13h8" /><path d="M8 17h8" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ setup */
type Tab = "upload" | "columns" | "style" | "filter";
type FileKind = "source" | "target";

const TABS: { id: Tab; label: string; Icon: () => React.ReactElement }[] = [
  { id: "upload", label: "Source", Icon: I.Upload },
  { id: "columns", label: "Fields", Icon: I.Columns },
  { id: "style", label: "Style", Icon: I.Style },
  { id: "filter", label: "Export", Icon: I.Filter },
];

const EMPTY_MAPPING: ColumnMapping = { id: "", lat: "", lng: "" };
const EMPTY_RESULTS: CalculatedData = { sitesWithNeighbors: [], allSites: [], connections: [] };

const MAP_FIELDS: { key: keyof ColumnMapping; label: string; hint: string }[] = [
  { key: "id", label: "Site Name", hint: "unique identifier" },
  { key: "lat", label: "Latitude", hint: "WGS84 · -90 to 90" },
  { key: "lng", label: "Longitude", hint: "WGS84 · -180 to 180" },
];

function guessMapping(columns: string[]): ColumnMapping {
  return {
    id: columns.find((c) => /id|site|name|code/i.test(c)) ?? columns[0] ?? "",
    lat: columns.find((c) => /lat/i.test(c)) ?? columns[1] ?? "",
    lng: columns.find((c) => /lon|lng/i.test(c)) ?? columns[2] ?? "",
  };
}

/* ------------------------------------------------------------- primitives */
function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="check-row">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <strong>{label}</strong>
        {hint && <small>{hint}</small>}
      </span>
    </label>
  );
}

function ColorSwatches({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mapping-field">
      <div className="mapping-label">
        <label>{label}</label>
        <span>{value.toUpperCase()}</span>
      </div>
      <div className="sw-row">
        {PALETTE.map((c) => (
          <button
            key={c}
            className={`sw ${value === c ? "active" : ""}`}
            style={{ background: c }}
            onClick={() => onChange(c)}
            title={c}
          />
        ))}
        <label className="sw sw-custom" title="Custom colour">
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
          <span style={{ background: value }} />
        </label>
      </div>
    </div>
  );
}

function FilePanel({
  fileName,
  data,
  loading,
  onFile,
  onSheet,
  onRemove,
}: {
  fileName: string;
  data: Dataset | null;
  loading: boolean;
  onFile: (f: File) => void;
  onSheet: (name: string) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const columns = data?.columns ?? [];

  return (
    <>
      <div
        className={`dropzone ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <I.Cloud />
        <strong>{loading ? "Parsing file…" : "Drop file to upload"}</strong>
        <span>CSV · XLSX · XLS · TXT · KML · GPX</span>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.txt,.xlsx,.xls,.kml,.gpx"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {data && (
        <>
          <div style={{ marginTop: 18 }} className="source-summary">
            <div className="source-icon sheet">
              <I.Sheet />
            </div>
            <div>
              <strong>{fileName}</strong>
              <span>
                {data.sheetName ? `${data.sheetName} · ` : ""}
                {data.rows.length.toLocaleString()} rows · {columns.length} columns
              </span>
            </div>
          </div>

          {data.sheetNames && data.sheetNames.length > 1 && (
            <div className="sheet-picker">
              <div className="mapping-label">
                <label>Worksheet</label>
                <span>{data.sheetNames.length} sheets</span>
              </div>
              <select
                className="field-control"
                value={data.sheetName ?? ""}
                onChange={(e) => onSheet(e.target.value)}
              >
                {data.sheetNames.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <p className="field-help">Switching sheets reloads the columns and clears the current mapping.</p>
            </div>
          )}

          <div className="source-actions">
            <button onClick={() => inputRef.current?.click()}>Replace</button>
            <button className="danger" onClick={onRemove}>
              Remove
            </button>
          </div>
        </>
      )}
    </>
  );
}

function MappingFields({
  mapping,
  columns,
  onChange,
  validCount,
  totalCount,
}: {
  mapping: ColumnMapping;
  columns: string[];
  onChange: (m: ColumnMapping) => void;
  validCount: number;
  totalCount: number;
}) {
  return (
    <>
      {!columns.length && <p className="field-help">Upload a dataset first to map its columns.</p>}

      {MAP_FIELDS.map((f) => (
        <div className="mapping-field" key={f.key}>
          <div className="mapping-label">
            <label>
              {f.label}
              <b>*</b>
            </label>
            <span>{f.hint}</span>
          </div>
          <select
            className="field-control"
            value={mapping[f.key]}
            onChange={(e) => onChange({ ...mapping, [f.key]: e.target.value })}
            disabled={!columns.length}
          >
            <option value="">— Select column —</option>
            {columns.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      ))}

      {validCount > 0 && (
        <p className="field-help">
          <code>{validCount.toLocaleString()}</code> usable rows
          {totalCount > validCount ? ` · ${(totalCount - validCount).toLocaleString()} skipped` : ""}
        </p>
      )}
    </>
  );
}

function PopupFields({
  label,
  columns,
  selected,
  onChange,
}: {
  label: string;
  columns: string[];
  selected: Set<string>;
  onChange: (s: Set<string>) => void;
}) {
  const toggle = (col: string) => {
    const next = new Set(selected);
    if (next.has(col)) next.delete(col);
    else next.add(col);
    onChange(next);
  };

  return (
    <>
      <div className="mapping-label">
        <label>{label}</label>
        <span>{selected.size} selected</span>
      </div>
      <div className="source-actions">
        <button onClick={() => onChange(new Set(columns))}>Select all</button>
        <button onClick={() => onChange(new Set<string>())}>Clear</button>
      </div>
      <div className="check-list" style={{ marginTop: 12 }}>
        {columns.map((col) => (
          <label className="check-row" key={col}>
            <input type="checkbox" checked={selected.has(col)} onChange={() => toggle(col)} />
            <span>
              <strong>{col}</strong>
            </span>
          </label>
        ))}
        {!columns.length && <div className="pg-empty" style={{ fontSize: 10 }}>No columns yet.</div>}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------- app */
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window === "undefined" ? true : window.innerWidth > 860,
  );
  const [tab, setTab] = useState<Tab>("upload");

  // Calculation settings
  const [calcMode, setCalcMode] = useState<CalcMode>("all");
  const [calcMethod, setCalcMethod] = useState<CalcMethod>("brute");
  const [voronoiLayers, setVoronoiLayers] = useState(1);
  const [nNeighbors, setNNeighbors] = useState(1);
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>("km");
  const [excludeZero, setExcludeZero] = useState(true);
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [distanceOp, setDistanceOp] = useState<DistanceOperator>("<=");

  // Datasets
  const [sourceFileName, setSourceFileName] = useState("");
  const [sourceData, setSourceData] = useState<Dataset | null>(null);
  const [sourceMapping, setSourceMapping] = useState<ColumnMapping>(EMPTY_MAPPING);

  const [targetFileName, setTargetFileName] = useState("");
  const [targetData, setTargetData] = useState<Dataset | null>(null);
  const [targetMapping, setTargetMapping] = useState<ColumnMapping>(EMPTY_MAPPING);

  const [popupColumns, setPopupColumns] = useState<Set<string>>(new Set());
  const [popupColumnsTarget, setPopupColumnsTarget] = useState<Set<string>>(new Set());

  // Styling & map
  const [markerSize, setMarkerSize] = useState(1.0);
  const [lineThickness, setLineThickness] = useState(2);
  const [lineColor, setLineColor] = useState("#10b981");
  const [lineOpacity, setLineOpacity] = useState(40);
  const [sourceIconColor, setSourceIconColor] = useState("#13a38f");
  const [neighborIconColor, setNeighborIconColor] = useState("#ef4444");
  const [showSiteLabels, setShowSiteLabels] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [showVoronoi, setShowVoronoi] = useState(false);


  // Filtering & search
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [filterCol, setFilterCol] = useState("");
  const [filterVals, setFilterVals] = useState<string[]>([]);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [focusSite, setFocusSite] = useState<{ id: string; timestamp: number } | null>(null);

  // Session status
  const [loading, setLoading] = useState<FileKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [showOnMap, setShowOnMap] = useState(false);

  const [calculatedData, setCalculatedData] = useState<CalculatedData>(EMPTY_RESULTS);
  const hasResults = calculatedData.allSites.length > 0;

  const sourceFileRef = useRef<File | null>(null);
  const targetFileRef = useRef<File | null>(null);

  const sourceColumns = sourceData?.columns ?? [];
  const targetColumns = targetData?.columns ?? [];
  const hasTarget = calcMode === "pairwise" && Boolean(targetData?.rows.length);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  /* -------------------------------------------------------- File Upload */
  const handleFile = useCallback(
    async (file: File, kind: FileKind) => {
      setLoading(kind);
      setError(null);
      try {
        const ds = await parseFile(file);
        if (!ds.rows.length) throw new Error("The file contains no data rows.");
        const mapping = guessMapping(ds.columns);

        if (kind === "source") {
          sourceFileRef.current = file;
          setSourceFileName(file.name);
          setSourceData(ds);
          setSourceMapping(mapping);
          setPopupColumns(new Set(ds.columns.slice(0, 6)));
          setCalculatedData(EMPTY_RESULTS);
          setShowOnMap(false);
          setSelectedSite(null);
          setTab("columns");
        } else {
          targetFileRef.current = file;
          setTargetFileName(file.name);
          setTargetData(ds);
          setTargetMapping(mapping);
          setPopupColumnsTarget(new Set(ds.columns.slice(0, 6)));
          setCalculatedData(EMPTY_RESULTS);
          setShowOnMap(false);
          setSelectedSite(null);
        }

        const sheet = ds.sheetName ? `"${ds.sheetName}" · ` : "";
        flash(
          `Loaded ${ds.rows.length.toLocaleString()} rows from ${sheet}${file.name}` +
            (kind === "source" ? ` · ${mapping.lat || "?"} / ${mapping.lng || "?"} detected` : ""),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not read that file.");
      } finally {
        setLoading(null);
      }
    },
    [flash],
  );

  const handleSheetChange = useCallback(
    async (sheetName: string, kind: FileKind) => {
      const file = kind === "source" ? sourceFileRef.current : targetFileRef.current;
      if (!file) return;
      setLoading(kind);
      setError(null);
      try {
        const ds = await parseFileSheet(file, sheetName);
        if (!ds.rows.length) throw new Error(`Worksheet "${sheetName}" has no data rows.`);
        const mapping = guessMapping(ds.columns);

        if (kind === "source") {
          setSourceData(ds);
          setSourceMapping(mapping);
        } else {
          setTargetData(ds);
          setTargetMapping(mapping);
        }
        setCalculatedData(EMPTY_RESULTS);
        setShowOnMap(false);
        setSelectedSite(null);
        flash(`Switched to "${sheetName}" · ${ds.rows.length.toLocaleString()} rows`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not read that worksheet.");
      } finally {
        setLoading(null);
      }
    },
    [flash],
  );

  const removeSource = useCallback(() => {
    sourceFileRef.current = null;
    setSourceFileName("");
    setSourceData(null);
    setSourceMapping(EMPTY_MAPPING);
    setPopupColumns(new Set());
    setCalculatedData(EMPTY_RESULTS);
    setSelectedSite(null);

    setShowOnMap(false);
    setShowVoronoi(false);
  }, []);

  const removeTarget = useCallback(() => {
    targetFileRef.current = null;
    setTargetFileName("");
    setTargetData(null);
    setTargetMapping(EMPTY_MAPPING);
    setPopupColumnsTarget(new Set());
  }, []);

  const clearSession = useCallback(() => {
    removeSource();
    removeTarget();
    setSearchTerm("");
    setFilterCol("");
    setFilterVals([]);
    flash("Session cleared");
  }, [removeSource, removeTarget, flash]);

  /* -------------------------------------------------- Distance Calculation */
  const toSites = useCallback((data: Dataset | null, mapping: ColumnMapping): Site[] => {
    if (!data || !mapping.lat || !mapping.lng) return [];
    const rows = data.rows;
    const n = rows.length;
    const out: Site[] = [];
    const idKey = mapping.id;
    const latKey = mapping.lat;
    const lngKey = mapping.lng;
    for (let i = 0; i < n; i++) {
      const row = rows[i];
      const latRaw = row[latKey];
      const lngRaw = row[lngKey];
      if (latRaw === undefined || latRaw === null || lngRaw === undefined || lngRaw === null) continue;

      const lat = typeof latRaw === "number"
        ? latRaw
        : parseFloat(String(latRaw).trim().replace(/,/g, "").replace(/[°\s]/g, ""));
      if (isNaN(lat) || lat < -90 || lat > 90) continue;

      const lng = typeof lngRaw === "number"
        ? lngRaw
        : parseFloat(String(lngRaw).trim().replace(/,/g, "").replace(/[°\s]/g, ""));
      if (isNaN(lng) || lng < -180 || lng > 180) continue;

      const idRaw = idKey ? row[idKey] : undefined;
      const id = idRaw !== undefined && idRaw !== null && String(idRaw).trim() !== ""
        ? String(idRaw).trim()
        : `Site ${i + 1}`;

      out.push({ id, lat, lng, originalData: row });
    }
    return out;
  }, []);

  // Building a Site for every row allocates one object per row, so the lists are
  // memoised: the two counts below and the run itself all need the same lists,
  // and rebuilding them per count meant three full passes over the dataset.
  const sourceSites = useMemo(
    () => toSites(sourceData, sourceMapping),
    [toSites, sourceData, sourceMapping],
  );
  const targetSites = useMemo(
    () => toSites(targetData, targetMapping),
    [toSites, targetData, targetMapping],
  );

  const validSourceCount = sourceSites.length;
  const validTargetCount = targetSites.length;

  const handleDraw = useCallback(async () => {
    const parsedSource = sourceSites;
    if (!parsedSource.length) {
      setCalculatedData(EMPTY_RESULTS);
      flash("Map the source columns first — open the Fields tab");
      return;
    }

    setShowProgress(true);
    setProgress(0);
    setError(null);

    const parsedTarget = hasTarget ? targetSites : parsedSource;
    if (hasTarget && !parsedTarget.length) {
      setShowProgress(false);
      flash("The target dataset has no usable rows with the mapped columns");
      return;
    }

    // Progress is reported far more often than the UI can show it, and every
    // update re-renders the whole app, so only the newest value in each frame
    // is pushed to state.
    let progressFrame = 0;
    let latestProgress = 0;
    const onProgress = (p: number) => {
      latestProgress = p;
      if (progressFrame) return;
      progressFrame = requestAnimationFrame(() => {
        progressFrame = 0;
        setProgress(latestProgress);
      });
    };

    const res = await calculateDistancesAsync({
      mode: calcMode,
      method: calcMethod,
      sourceSites: parsedSource,
      targetSites: parsedTarget,
      nNeighbors,
      voronoiLayers,
      unit: distanceUnit,
      excludeZero,
      maxDistance,
      distanceOp,
      onProgress,
    });

    if (progressFrame) cancelAnimationFrame(progressFrame);
    setProgress(100);
    setCalculatedData(res);
    setShowProgress(false);
    setShowOnMap(true);
    setSidebarOpen(false);
    if (calcMethod === "voronoi") setShowVoronoi(true);
    if (calcMethod === "voronoi") {
      flash(
        `Generated Voronoi layer across ${res.allSites.length.toLocaleString()} sites`,
      );
    } else {
      flash(
        `Calculated ${res.connections.length.toLocaleString()} connections across ${res.allSites.length.toLocaleString()} sites`,
      );
    }
  }, [
    sourceSites,
    targetSites,
    calcMode,
    calcMethod,
    nNeighbors,
    voronoiLayers,
    distanceUnit,
    excludeZero,
    maxDistance,
    distanceOp,
    hasTarget,
    flash,
  ]);

  /* ----------------------------------------------------- Column Filtering */
  const { sitesWithNeighbors, allSites, connections } = useMemo(() => {
    if (!filterCol || filterVals.length === 0) {
      return calculatedData;
    }

    let {
      sitesWithNeighbors: rawSites,
      allSites: rawAll,
      connections: rawConns,
    } = calculatedData;

    // A Set rather than Array.includes: this runs once per site, and a linear
    // scan over the picked values is the whole cost of the filter.
    const wanted = new Set(filterVals);
    rawSites = rawSites.filter((s) =>
      wanted.has(String(s.originalData?.[filterCol] ?? "").trim() || "(blank)"),
    );
    const keptSources = new Set(rawSites.map((s) => s.id));
    const keptIds = new Set(keptSources);
    rawConns
      .filter((c) => keptSources.has(c.from))
      .forEach((c) => keptIds.add(c.to));
    rawAll = rawAll.filter((s) => keptIds.has(s.id));
    rawConns = rawConns.filter((c) => keptSources.has(c.from));

    return { sitesWithNeighbors: rawSites, allSites: rawAll, connections: rawConns };
  }, [calculatedData, filterCol, filterVals]);

  const uniqueFilterVals = useMemo(
    () =>
      filterCol && sourceData
        ? Array.from(
            new Set(sourceData.rows.map((r) => String(r[filterCol] ?? "").trim() || "(blank)")),
          )
        : [],
    [filterCol, sourceData],
  );

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchSites = useMemo(
    () => (showOnMap && hasResults ? allSites : []),
    [showOnMap, hasResults, allSites],
  );

  // Fast map from lowercase ID -> Site for O(1) exact matching
  const searchSiteMap = useMemo(() => {
    const map = new Map<string, Site>();
    for (let i = 0; i < searchSites.length; i++) {
      map.set(searchSites[i].id.toLowerCase(), searchSites[i]);
    }
    return map;
  }, [searchSites]);

  const searchMatchingSites = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];
    const hits: Site[] = [];
    const MAX_HITS = 40;

    // Check ID first: overwhelming majority of searches match by ID
    for (let i = 0; i < searchSites.length; i++) {
      const s = searchSites[i];
      if (s.id.toLowerCase().includes(q)) {
        hits.push(s);
        if (hits.length >= MAX_HITS) return hits;
      }
    }

    // Check properties only if needed
    for (let i = 0; i < searchSites.length; i++) {
      const s = searchSites[i];
      if (s.id.toLowerCase().includes(q)) continue;
      if (s.originalData) {
        let match = false;
        const vals = Object.values(s.originalData);
        for (let j = 0; j < vals.length; j++) {
          const v = vals[j];
          if (v !== null && v !== undefined && String(v).toLowerCase().includes(q)) {
            match = true;
            break;
          }
        }
        if (match) {
          hits.push(s);
          if (hits.length >= MAX_HITS) return hits;
        }
      }
    }
    return hits;
  }, [searchSites, searchTerm]);

  useEffect(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) {
      setSelectedSite(null);
      setFocusSite(null);
      return;
    }
    const exact = searchSiteMap.get(q);
    if (exact) {
      setSelectedSite(exact.id);
      setFocusSite({ id: exact.id, timestamp: Date.now() });
      setShowOnMap(true);
    } else if (searchMatchingSites.length === 1) {
      setSelectedSite(searchMatchingSites[0].id);
      setFocusSite({ id: searchMatchingSites[0].id, timestamp: Date.now() });
      setShowOnMap(true);
    }
  }, [searchSiteMap, searchMatchingSites, searchTerm]);

  const handleSiteClick = useCallback((id: string | null) => {
    setSelectedSite(id);
    if (id === null) {
      setSearchTerm("");
      setFocusSite(null);
    } else {
      setSearchTerm(id);
      setFocusSite({ id, timestamp: Date.now() });
    }
    setShowDropdown(false);
  }, []);

  const legendItems = useMemo(() => {
    const items: { label: string; color: string; count: number }[] = [];

    if (hasTarget) {
      let srcCount = 0;
      let tgtCount = 0;
      for (let i = 0; i < allSites.length; i++) {
        const s = allSites[i];
        if (s.isSource) srcCount++;
        else if (s.isTarget) tgtCount++;
      }
      items.push({
        label: "Source sites",
        color: sourceIconColor,
        count: srcCount || sourceSites.length,
      });
      items.push({
        label: "Target neighbours",
        color: neighborIconColor,
        count: tgtCount || targetSites.length,
      });
    } else {
      items.push({ label: "All sites", color: sourceIconColor, count: allSites.length });
    }

    if (showVoronoi && calcMethod === "voronoi") {
      items.push({
        label: "Voronoi layer",
        color: "#8b5cf6",
        count: allSites.length,
      });
    }
    return items;
  }, [
    allSites,
    sourceSites.length,
    targetSites.length,
    hasTarget,
    sourceIconColor,
    neighborIconColor,
    showVoronoi,
    calcMethod,
  ]);

  /* ------------------------------------------------------------- exports */
  const handleExportKmz = useCallback(async () => {
    let voronoiPolygons;
    if (calcMethod === "voronoi" && allSites.length >= 3) {
      voronoiPolygons =
        (await engineVoronoiCells(allSites).catch(() => null)) ??
        computeAllVoronoiPolygons(allSites);
    }
    exportKmzFile({
      sourceIcon: { url: "VECTOR_CIRCLE", color: sourceIconColor, scale: markerSize, opacity: 1 },
      neighborIcon: { url: "VECTOR_CIRCLE", color: neighborIconColor, scale: markerSize, opacity: 1 },
      allSites,
      sitesWithNeighbors,
      connections,
      lineColor,
      lineThickness,
      lineOpacity,
      showVoronoi,
      distanceUnit,
      calcMethod,
      voronoiLayers,
      nNeighbors,
      popupColumns,
      popupColumnsTarget,
      hasTarget,
      voronoiPolygons,
    });
    flash("KMZ exported");
  }, [
    allSites,
    sitesWithNeighbors,
    connections,
    sourceIconColor,
    neighborIconColor,
    markerSize,
    lineColor,
    lineThickness,
    lineOpacity,
    showVoronoi,
    distanceUnit,
    calcMethod,
    voronoiLayers,
    nNeighbors,
    popupColumns,
    popupColumnsTarget,
    hasTarget,
    flash,
  ]);


  const handleExportXlsx = useCallback(async () => {
    await exportExcelFile(sitesWithNeighbors, distanceUnit, calcMethod);
    flash("Excel workbook exported");
  }, [sitesWithNeighbors, distanceUnit, calcMethod, flash]);

  /* ---------------------------------------------------------- shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === "enter") {
        e.preventDefault();
        void handleDraw();
      } else if (k === "b") {
        e.preventDefault();
        setSidebarOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleDraw]);

  const canDraw = validSourceCount > 0 && !showProgress;

  /* ---------------------------------------------------------------- view */
  return (
    <div className="app-shell">
      {/* ============================ header ============================ */}
      <header className="app-header">
        <div className="brand">
          <button
            className="mobile-menu"
            onClick={() => setSidebarOpen((v) => !v)}
            title="Toggle input panel"
            aria-label="Toggle input panel"
          >
            <I.Menu />
          </button>
          <div className="brand-name">Site To Site Distance</div>
        </div>
      </header>

      <div className="workspace">
        {sidebarOpen && <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close" />}

        {/* ============================ sidebar =========================== */}
        <aside className={`sidebar ${sidebarOpen ? "is-open" : "collapsed"}`}>
          <div className="sidebar-mobile-head">
            CONFIGURATION
            <button onClick={() => setSidebarOpen(false)} aria-label="Close panel">
              <I.X size={16} />
            </button>
          </div>

          <nav className="tabs">
            {TABS.map((t) => (
              <button key={t.id} className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id)}>
                <t.Icon />
                {t.label}
              </button>
            ))}
          </nav>

          <div className="sidebar-scroll">
            {/* ---------------------------------------------------- SOURCE */}
            {tab === "upload" && (
              <div className="panel-enter">
                <section className="sidebar-section intro-section">
                  <div className="section-kicker">Step 01</div>
                  <h1>Bring your coordinate data.</h1>
                  <p>
                    Drop a CSV or Excel export of your sites. Everything is parsed in your browser —
                    nothing is uploaded.
                  </p>
                </section>

                <section className="sidebar-section border-top">
                  <div className="mapping-label">
                    <label>Calculation Mode</label>
                    <span>1 or 2 files</span>
                  </div>
                  <div className="mode-selector" style={{ marginBottom: 0 }}>
                    <div
                      className={`mode-option ${calcMode === "all" ? "active" : ""}`}
                      onClick={() => setCalcMode("all")}
                    >
                      All Sites
                    </div>
                    <div
                      className={`mode-option ${calcMode === "pairwise" ? "active" : ""}`}
                      onClick={() => setCalcMode("pairwise")}
                    >
                      Source &amp; Target
                    </div>
                  </div>
                  <p className="field-help">
                    All Sites measures neighbours inside one file. Source &amp; Target measures every
                    source site against a second dataset.
                  </p>
                </section>

                <section className="sidebar-section border-top">
                  <div className="mapping-label">
                    <label>Source Dataset</label>
                    <span>{sourceData ? "loaded" : "required"}</span>
                  </div>
                  <FilePanel
                    fileName={sourceFileName}
                    data={sourceData}
                    loading={loading === "source"}
                    onFile={(f) => void handleFile(f, "source")}
                    onSheet={(s) => void handleSheetChange(s, "source")}
                    onRemove={removeSource}
                  />

                  {error && <div className="error-note">{error}</div>}
                </section>

                {calcMode === "pairwise" && (
                  <section className="sidebar-section border-top">
                    <div className="mapping-label">
                      <label>Target Dataset</label>
                      <span>{targetData ? "loaded" : "optional"}</span>
                    </div>
                    <FilePanel
                      fileName={targetFileName}
                      data={targetData}
                      loading={loading === "target"}
                      onFile={(f) => void handleFile(f, "target")}
                      onSheet={(s) => void handleSheetChange(s, "target")}
                      onRemove={removeTarget}
                    />
                    <p className="field-help">
                      Leave empty to measure the source sites against themselves.
                    </p>
                  </section>
                )}
              </div>
            )}

            {/* ---------------------------------------------------- FIELDS */}
            {tab === "columns" && (
              <div className="panel-enter">
                <section className="sidebar-section intro-section compact">
                  <div className="section-kicker">Step 02</div>
                  <h1>Map your data columns.</h1>
                  <p>
                    Assign the site name, latitude and longitude columns used for spatial
                    calculations.
                  </p>
                </section>

                <section className="sidebar-section border-top">
                  <MappingFields
                    mapping={sourceMapping}
                    columns={sourceColumns}
                    onChange={setSourceMapping}
                    validCount={validSourceCount}
                    totalCount={sourceData?.rows.length ?? 0}
                  />
                </section>

                {calcMode === "pairwise" && (
                  <section className="sidebar-section border-top">
                    <div className="mapping-label">
                      <label>Target Columns</label>
                      <span>{targetFileName || "not loaded"}</span>
                    </div>
                    <MappingFields
                      mapping={targetMapping}
                      columns={targetColumns}
                      onChange={setTargetMapping}
                      validCount={validTargetCount}
                      totalCount={targetData?.rows.length ?? 0}
                    />
                  </section>
                )}

                <section className="sidebar-section border-top">
                  <PopupFields
                    label="Source popup fields"
                    columns={sourceColumns}
                    selected={popupColumns}
                    onChange={setPopupColumns}
                  />
                </section>

                {calcMode === "pairwise" && targetColumns.length > 0 && (
                  <section className="sidebar-section border-top">
                    <PopupFields
                      label="Target popup fields"
                      columns={targetColumns}
                      selected={popupColumnsTarget}
                      onChange={setPopupColumnsTarget}
                    />
                  </section>
                )}
              </div>
            )}

            {/* ----------------------------------------------------- STYLE */}
            {tab === "style" && (
              <div className="panel-enter">
                <section className="sidebar-section intro-section compact">
                  <div className="section-kicker">Step 03</div>
                  <h1>Customize map appearance.</h1>
                  <p>Configure marker colours, connection lines, labels and the Voronoi diagram.</p>
                </section>

                <section className="sidebar-section border-top">
                  <span className="field-label">Marker colours</span>
                  <ColorSwatches label="Source sites" value={sourceIconColor} onChange={setSourceIconColor} />
                  {hasTarget && (
                    <ColorSwatches
                      label="Target neighbours"
                      value={neighborIconColor}
                      onChange={setNeighborIconColor}
                    />
                  )}

                  <div className="range-setting" style={{ marginTop: 4 }}>
                    <div>
                      Marker scale <span>{markerSize.toFixed(1)}×</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={markerSize}
                      onChange={(e) => setMarkerSize(parseFloat(e.target.value))}
                    />
                  </div>
                </section>

                {calcMethod !== "voronoi" && (
                  <section className="sidebar-section border-top">
                    <span className="field-label">Connection lines</span>
                    <ColorSwatches label="Line colour" value={lineColor} onChange={setLineColor} />

                    <div className="range-setting" style={{ marginTop: 4 }}>
                      <div>
                        Line thickness <span>{lineThickness}px</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={lineThickness}
                        onChange={(e) => setLineThickness(parseInt(e.target.value))}
                      />
                    </div>

                    <div className="range-setting">
                      <div>
                        Line opacity <span>{lineOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={lineOpacity}
                        onChange={(e) => setLineOpacity(parseInt(e.target.value))}
                      />
                    </div>
                  </section>
                )}

                <section className="sidebar-section border-top">
                  <Toggle
                    label="Site labels"
                    hint="Always show names beside points"
                    checked={showSiteLabels}
                    onChange={setShowSiteLabels}
                  />
                  {calcMethod === "voronoi" && (
                    <Toggle
                      label="Voronoi diagram"
                      hint="Draw cell polygons for neighbour layers"
                      checked={showVoronoi}
                      onChange={setShowVoronoi}
                    />
                  )}
                  <Toggle
                    label="Map legend"
                    hint="Colour key at the bottom of the map"
                    checked={showLegend}
                    onChange={setShowLegend}
                  />
                </section>
              </div>
            )}

            {/* ---------------------------------------------------- EXPORT */}
            {tab === "filter" && (
              <div className="panel-enter">
                <section className="sidebar-section intro-section compact">
                  <div className="section-kicker">Step 04</div>
                  <h1>Calculate &amp; export.</h1>
                  <p>Run the distance calculation, then share the result as KMZ or XLSX.</p>
                </section>

                <section className="sidebar-section border-top">
                  <span className="field-label">Calculation method</span>
                  <div className="mode-selector" style={{ marginBottom: 0 }}>
                    <div
                      className={`mode-option ${calcMethod === "brute" ? "active" : ""}`}
                      onClick={() => {
                        if (calcMethod !== "brute") {
                          setCalcMethod("brute");
                          setShowVoronoi(false);
                          setCalculatedData(EMPTY_RESULTS);
                          setShowOnMap(false);
                          setSelectedSite(null);
                        }
                      }}
                    >
                      Brute force
                    </div>
                    <div
                      className={`mode-option ${calcMethod === "voronoi" ? "active" : ""}`}
                      onClick={() => {
                        if (calcMethod !== "voronoi") {
                          setCalcMethod("voronoi");
                          setShowVoronoi(false);
                          setCalculatedData(EMPTY_RESULTS);
                          setShowOnMap(false);
                          setSelectedSite(null);
                        }
                      }}
                    >
                      Voronoi
                    </div>
                  </div>
                  <p className="field-help">
                    Brute force compares every pair. Voronoi walks Delaunay layers — much faster on
                    large datasets.
                  </p>

                  {calcMethod === "brute" ? (
                    <div className="range-setting" style={{ marginTop: 18 }}>
                      <div>
                        Nearest N sites <span>{nNeighbors}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        step="1"
                        value={nNeighbors}
                        onChange={(e) => setNNeighbors(parseInt(e.target.value))}
                      />
                    </div>
                  ) : (
                    <div className="range-setting" style={{ marginTop: 18 }}>
                      <div>
                        Voronoi layers <span>{voronoiLayers}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={voronoiLayers}
                        onChange={(e) => setVoronoiLayers(parseInt(e.target.value))}
                      />
                    </div>
                  )}

                  {calcMethod === "brute" && (
                    <>
                      <div className="mapping-field" style={{ marginTop: 18 }}>
                        <div className="mapping-label">
                          <label>Distance unit</label>
                          <span>output precision</span>
                        </div>
                        <select
                          className="field-control"
                          value={distanceUnit}
                          onChange={(e) => setDistanceUnit(e.target.value as DistanceUnit)}
                        >
                          <option value="km">Kilometers (km)</option>
                          <option value="m">Meters (m)</option>
                          <option value="mi">Miles (mi)</option>
                          <option value="ft">Feet (ft)</option>
                        </select>
                      </div>

                      <div className="mapping-field">
                        <div className="mapping-label">
                          <label>Max distance</label>
                          <span>optional</span>
                        </div>
                        <div className="dual-input">
                          <select
                            className="field-control"
                            value={distanceOp}
                            onChange={(e) => setDistanceOp(e.target.value as DistanceOperator)}
                          >
                            <option value={"<"}>&lt;</option>
                            <option value={"<="}>&lt;=</option>
                            <option value="=">=</option>
                            <option value={">"}>&gt;</option>
                            <option value={">="}>&gt;=</option>
                          </select>
                          <input
                            className="field-control num-control"
                            type="number"
                            placeholder="No limit"
                            value={maxDistance ?? ""}
                            onChange={(e) => setMaxDistance(e.target.value ? parseFloat(e.target.value) : null)}
                          />
                        </div>
                      </div>

                      <Toggle
                        label="Exclude zero distance"
                        hint={`Skip pairs at 0 ${distanceUnit}`}
                        checked={excludeZero}
                        onChange={setExcludeZero}
                      />
                    </>
                  )}
                </section>

                <section className="sidebar-section border-top">
                  <button className="connect-button" onClick={() => void handleDraw()} disabled={!canDraw}>
                    <I.Bolt />
                    {showProgress ? `Calculating ${Math.round(progress)}%` : "Calculate & Draw"}
                  </button>

                  {showProgress && (
                    <div className="progress-row">
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                      <span className="progress-pct">{Math.round(progress)}%</span>
                    </div>
                  )}

                  <div className="export-stack">
                    <button className="action-button action-blue" disabled={!hasResults} onClick={handleExportKmz}>
                      <I.Export /> Export KMZ
                    </button>
                    <button className="action-button action-outline" disabled={!hasResults} onClick={handleExportXlsx}>
                      <I.FileSheet /> Excel (XLSX)
                    </button>
                    <button className="action-button action-red-outline" onClick={clearSession}>
                      <I.Trash /> Clear session
                    </button>
                  </div>
                </section>
              </div>
            )}
          </div>
        </aside>

        {/* ========================== map workspace ======================== */}
        <main className="map-workspace">
          <div className="map-toolbar">
            <div className="map-search" ref={searchContainerRef} style={{ position: "relative" }}>
              <I.Search />
              <input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (searchMatchingSites.length > 0) {
                      const q = searchTerm.trim().toLowerCase();
                      const exact = searchMatchingSites.find((s) => s.id.toLowerCase() === q);
                      const pick = exact || searchMatchingSites[0];
                      setSelectedSite(pick.id);
                      setSearchTerm(pick.id);
                      setFocusSite({ id: pick.id, timestamp: Date.now() });
                      setShowDropdown(false);
                      setShowOnMap(true);
                    }
                  } else if (e.key === "Escape") {
                    setShowDropdown(false);
                  }
                }}
                placeholder="Search site name or any field…"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSite(null);
                    setFocusSite(null);
                    setShowDropdown(false);
                  }}
                  aria-label="Clear search"
                >
                  <I.X size={13} />
                </button>
              )}

              {showDropdown && searchTerm.trim() && searchMatchingSites.length > 0 && (
                <div
                  className="search-dropdown"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    marginTop: 4,
                    background: "#ffffff",
                    borderRadius: 8,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e2e8f0",
                    maxHeight: 250,
                    overflowY: "auto",
                    zIndex: 100,
                  }}
                >
                  {searchMatchingSites.slice(0, 20).map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setSelectedSite(s.id);
                        setSearchTerm(s.id);
                        setFocusSite({ id: s.id, timestamp: Date.now() });
                        setShowDropdown(false);
                        setShowOnMap(true);
                      }}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontSize: 12,
                        borderBottom: "1px solid #f1f5f9",
                        backgroundColor: selectedSite === s.id ? "#f0fdf4" : "transparent",
                        fontWeight: selectedSite === s.id ? 700 : 500,
                        color: selectedSite === s.id ? "#15803d" : "#1e293b",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          selectedSite === s.id ? "#f0fdf4" : "transparent")
                      }
                    >
                      <span>{s.id}</span>
                      <small style={{ color: "#64748b" }}>
                        {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                      </small>
                    </div>
                  ))}
                  {searchMatchingSites.length > 20 && (
                    <div
                      style={{
                        padding: "6px 12px",
                        fontSize: 11,
                        color: "#64748b",
                        backgroundColor: "#f8fafc",
                        textAlign: "center",
                      }}
                    >
                      Showing 20 of {searchMatchingSites.length.toLocaleString()} matches
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="toolbar-divider" />

            <div className="status-filter">
              <select
                value={filterCol}
                onChange={(e) => {
                  setFilterCol(e.target.value);
                  setFilterVals([]);
                }}
              >
                <option value="">All columns</option>
                {sourceColumns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {filterCol && (
                <select
                  value={filterVals.length === 1 ? filterVals[0] : ""}
                  onChange={(e) => setFilterVals(e.target.value ? [e.target.value] : [])}
                >
                  <option value="">Any value</option>
                  {uniqueFilterVals.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="toolbar-count">
              {searchTerm.trim() ? (
                <>
                  <strong>{searchMatchingSites.length.toLocaleString()}</strong> matched (
                  {searchSites.length.toLocaleString()} sites)
                </>
              ) : (
                <>
                  <strong>{showOnMap && hasResults ? allSites.length.toLocaleString() : 0}</strong> /{" "}
                  {(sourceData?.rows.length ?? 0).toLocaleString()} points
                </>
              )}
            </div>
          </div>

          <div className="map-frame">
            <MapView
              sites={showOnMap && hasResults ? allSites : []}
              connections={showOnMap && hasResults && calcMethod !== "voronoi" ? connections : []}
              selectedSite={selectedSite}
              onSiteClick={handleSiteClick}
              focusSite={focusSite}
              lineThickness={lineThickness}
              lineColor={lineColor}
              lineOpacity={lineOpacity}
              markerIconUrl="VECTOR_CIRCLE"
              iconColor={sourceIconColor}
              iconOpacity={100}
              iconScale={markerSize}
              neighborMarkerIconUrl="VECTOR_CIRCLE"
              neighborIconColor={neighborIconColor}
              neighborIconOpacity={100}
              neighborIconScale={markerSize}
              showSiteLabels={showSiteLabels}
              markerSize={markerSize}
              singleIconMode={!hasTarget}
              sitesWithNeighbors={sitesWithNeighbors}
              nNeighbors={nNeighbors}
              distanceUnit={distanceUnit}
              popupColumns={popupColumns}
              popupColumnsTarget={popupColumnsTarget}
              showVoronoi={showOnMap && hasResults && showVoronoi}
              calcMethod={calcMethod}
              voronoiLayers={voronoiLayers}
              sidebarOpen={sidebarOpen}
            />

            {showOnMap && showLegend && hasResults && allSites.length > 0 && (
              <div className="map-footer-info align-start">
                <div className="legend-inline">
                  <div className="legend-title">{hasTarget ? "Source vs target" : "Sites"}</div>
                  <div className="legend-list">
                    {legendItems.map((it) => (
                      <span key={it.label}>
                        <i style={{ background: it.color }} />
                        {it.label} <b>{it.count.toLocaleString()}</b>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
