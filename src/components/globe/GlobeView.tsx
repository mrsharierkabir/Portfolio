"use client";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { feature } from "topojson-client";
import { geoCentroid } from "d3-geo";
import type { Feature, Geometry } from "geojson";

type CountryFeature = Feature<Geometry, { name: string }>;
export type CountryInfo = { name: string; count: number; lat: number; lng: number };

type Props = {
  counts: Record<string, number>;
  progress: MutableRefObject<number>; // 0..1 entrance progress
  revealed: { polygons: boolean; arcs: boolean };
  home: string;
  openCountry: string | null;
  onOpen: (name: string | null) => void;
  onCentroids?: (c: Record<string, [number, number]>) => void;
};

const OCEAN = "#EEF0F5";
const LAND = "#FFFFFF";
const POPULATED = "#CDC9C1";
const HOVER = "#3B3A37";
const STROKE = "#BDB7AC";

export default function GlobeView({ counts, progress, revealed, home, openCountry, onOpen, onCentroids }: Props) {
  const ref = useRef<GlobeMethods | undefined>(undefined);
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 600, h: 600 });
  const [features, setFeatures] = useState<CountryFeature[]>([]);
  const [hover, setHover] = useState<CountryFeature | null>(null);
  const stopped = useRef(false);
  const altRef = useRef(2.35);
  const hoverRef = useRef<CountryFeature | null>(null);
  const touch = useRef(false);
  const dwell = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    touch.current = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    fetch("/geo/countries-110m.json")
      .then((r) => r.json())
      .then((topo) => {
        const fc = feature(topo, topo.objects.countries) as unknown as { features: CountryFeature[] };
        const list = fc.features.filter((f) => f.properties?.name && f.properties.name !== "Antarctica");
        setFeatures(list);
        const c: Record<string, [number, number]> = {};
        list.forEach((f) => { const [lng, lat] = geoCentroid(f); c[f.properties.name] = [lat, lng]; });
        onCentroids?.(c);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width), h = Math.round(e.contentRect.height);
      if (w && h) setSize({ w, h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const centroid = useMemo(() => {
    const m: Record<string, { lat: number; lng: number }> = {};
    features.forEach((f) => { const [lng, lat] = geoCentroid(f); m[f.properties.name] = { lat, lng }; });
    return m;
  }, [features]);

  const material = useMemo(() => new THREE.MeshPhongMaterial({ color: OCEAN, emissive: "#e6e8ef", emissiveIntensity: 0.72, shininess: 2 }), []);

  /* setup controls + drive spin speed from entrance progress / hover / stop */
  useEffect(() => {
    let raf = 0;
    const g = ref.current;
    if (!g) return;
    const ctl = g.controls() as unknown as { autoRotate: boolean; autoRotateSpeed: number; enableZoom: boolean; enableRotate: boolean; enableDamping: boolean; dampingFactor: number; addEventListener: (e: string, f: () => void) => void; removeEventListener: (e: string, f: () => void) => void };
    ctl.enableZoom = false;
    ctl.enableDamping = true;
    ctl.dampingFactor = 0.08;
    ctl.enableRotate = !touch.current;
    ctl.autoRotate = true;
    const ALT = box.current && box.current.clientWidth < 520 ? 1.75 : 2.35;
    altRef.current = ALT;
    g.pointOfView({ lat: 18, lng: 95, altitude: ALT }, 0);
    const onStart = () => { stopped.current = true; };
    ctl.addEventListener("start", onStart);
    let speed = 30;
    let settled = false;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const p = progress.current;
      if (!settled && p > 0.82) {
        settled = true;
        g.pointOfView({ lat: 12, lng: 105, altitude: altRef.current }, 1800); // land on home + neighbours
      } else if (settled && p < 0.4) settled = false;
      const eased = 1 - Math.pow(1 - Math.min(1, p / 0.75), 3);
      let target = 30 * (1 - eased) + 0.55 * eased;
      if (p >= 0.99 && hoverRef.current) target = 0.2;
      if (stopped.current) target = 0;
      speed += (target - speed) * 0.06;
      ctl.autoRotateSpeed = speed;
      ctl.autoRotate = Math.abs(speed) > 0.005;
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ctl.removeEventListener("start", onStart); };
  }, [progress, features.length]);

  /* open / close country */
  useEffect(() => {
    const g = ref.current;
    if (!g) return;
    if (openCountry && centroid[openCountry]) {
      stopped.current = true;
      g.pointOfView({ ...centroid[openCountry], altitude: altRef.current * 0.72 }, 1100);
    } else if (!openCountry) {
      stopped.current = false;
      g.pointOfView({ altitude: altRef.current }, 900);
    }
  }, [openCountry, centroid]);

  const homeC = centroid[home];
  const arcs = useMemo(() => {
    if (!revealed.arcs || !homeC) return [];
    return Object.keys(counts)
      .filter((n) => n !== home && centroid[n])
      .map((n) => ({ startLat: homeC.lat, startLng: homeC.lng, endLat: centroid[n].lat, endLng: centroid[n].lng }));
  }, [revealed.arcs, counts, centroid, homeC, home]);

  const rings = useMemo(() => (homeC && revealed.polygons ? [{ lat: homeC.lat, lng: homeC.lng }] : []), [homeC, revealed.polygons]);

  const labels = useMemo(() => {
    if (!hover) return [];
    const name = hover.properties.name;
    const c = centroid[name];
    return c ? [{ name, count: counts[name] ?? 0, ...c }] : [];
  }, [hover, centroid, counts]);

  const setHoverBoth = (f: CountryFeature | null) => { hoverRef.current = f; setHover(f); };

  return (
    <div ref={box} className="h-full w-full" data-cursor={hover && counts[hover.properties.name] ? "View" : undefined}>
      <Globe
        ref={ref}
        width={size.w}
        height={size.h}
        animateIn={false}
        backgroundColor="rgba(0,0,0,0)"
        globeMaterial={material}
        showAtmosphere
        atmosphereColor="#c7cdf2"
        atmosphereAltitude={0.16}
        polygonsData={revealed.polygons ? features : []}
        polygonCapColor={(f: object) => {
          const ft = f as CountryFeature;
          if (ft === hover || ft.properties.name === openCountry) return HOVER;
          return counts[ft.properties.name] ? POPULATED : LAND;
        }}
        polygonSideColor={() => "rgba(17,17,17,0.06)"}
        polygonStrokeColor={() => STROKE}
        polygonAltitude={(f: object) => {
          const ft = f as CountryFeature;
          if (ft === hover || ft.properties.name === openCountry) return 0.035;
          return counts[ft.properties.name] ? 0.014 : 0.006;
        }}
        polygonsTransitionDuration={700}
        onPolygonHover={(f: object | null) => {
          if (touch.current) return;
          const ft = f as CountryFeature | null;
          setHoverBoth(ft);
          if (dwell.current) clearTimeout(dwell.current);
          const g = ref.current;
          if (ft && counts[ft.properties.name] && g && !openCountry && progress.current >= 0.99) {
            dwell.current = setTimeout(() => {
              const c = centroid[ft.properties.name];
              if (c && hoverRef.current === ft) g.pointOfView({ ...c, altitude: altRef.current * 0.85 }, 1000);
            }, 350);
          }
        }}
        onPolygonClick={(f: object) => {
          const ft = f as CountryFeature;
          const name = ft.properties.name;
          if (touch.current && hoverRef.current !== ft) { setHoverBoth(ft); return; } // 1st tap = hover
          if (counts[name]) onOpen(name);
        }}
        onGlobeClick={() => { if (touch.current) setHoverBoth(null); }}
        arcsData={arcs}
        arcColor={() => ["rgba(47,69,255,0.15)", "rgba(47,69,255,0.95)"]}
        arcStroke={0.55}
        arcDashLength={0.45}
        arcDashGap={0.2}
        arcDashInitialGap={1}
        arcDashAnimateTime={2600}
        arcAltitudeAutoScale={0.45}
        arcsTransitionDuration={1200}
        ringsData={rings}
        ringColor={() => (t: number) => `rgba(47,69,255,${1 - t})`}
        ringMaxRadius={5}
        ringPropagationSpeed={2.2}
        ringRepeatPeriod={1400}
        htmlElementsData={labels}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={0.05}
        htmlElement={(d: object) => {
          const x = d as { name: string; count: number };
          const el = document.createElement("div");
          el.style.cssText = "transform:translate(-50%,-130%);pointer-events:none;white-space:nowrap;";
          el.innerHTML = `<div style="display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:999px;background:#111;color:#f5f3ef;font:500 12px/1 var(--font-sans);box-shadow:0 8px 24px -10px rgba(0,0,0,.4)">
            <span>${x.name}</span>
            <span style="font-family:var(--font-mono);font-size:11px;color:${x.count ? "#9fb0ff" : "#8a877f"}">${x.count ? `${String(x.count).padStart(2, "0")} project${x.count > 1 ? "s" : ""}` : "—"}</span>
            ${x.count ? '<span style="opacity:.7">→</span>' : ""}
          </div>
          <div style="width:1px;height:14px;background:#111;margin:0 auto"></div>`;
          return el;
        }}
      />
    </div>
  );
}
