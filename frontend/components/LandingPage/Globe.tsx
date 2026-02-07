"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { Color, Vector3 } from "three";
import ThreeGlobe from "three-globe";
import { Canvas, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// 1. REGISTER COMPONENT
extend({ ThreeGlobe });

declare module "@react-three/fiber" {
  interface ThreeElements {
    threeGlobe: any;
  }
}

// 🎨 THEME PALETTES
const PALETTE_DARK = {
    void: "#050505",       // Deep Black
    land: "#00fffb",       // Gunmetal Grey
    cyan: "#00F0FF",       // Neon Cyan
    pink: "#FF0055",       // Neon Pink
    atmosphere: "#38bdf8", // Blue Glow
    emissive: "#0f172a"
};

const PALETTE_LIGHT = {
    void: "#FFFFFF",       // Pure White
    land: "#cbd5e1",       // Slate 300
    cyan: "#0284c7",       // Sky Blue 600 (Darker for contrast)
    pink: "#e11d48",       // Rose 600
    atmosphere: "#bae6fd", // Light Blue
    emissive: "#f1f5f9"
};

type HubType = "cyan" | "pink";

const randomType = (): HubType =>
  Math.random() > 0.5 ? "cyan" : "pink";

const randomSize = (base: number, variance: number = 0.05): number => {
  const min = Math.max(0.05, base - variance);
  const max = base + variance;

  return Number((Math.random() * (max - min) + min).toFixed(2));
};



// 🌍 RAW DATA (Coordinates only, no colors yet)
const HUBS_DATA = [
  { name: "NYC", lat: 40.7128, lng: -74.0060, size: randomSize(0.25), type: randomType() },
  { name: "CHI", lat: 41.8781, lng: -87.6298, size: randomSize(0.15), type: randomType() },
  { name: "TOR", lat: 43.6511, lng: -79.3470, size: randomSize(0.15), type: randomType() },
  { name: "LON", lat: 51.5074, lng: -0.1278, size: randomSize(0.2),  type: randomType() },
  { name: "FRA", lat: 50.1109, lng: 8.6821,  size: randomSize(0.15), type: randomType() },
  { name: "ZRH", lat: 47.3769, lng: 8.5417,  size: randomSize(0.1),  type: randomType() },
  { name: "TOK", lat: 35.6762, lng: 139.6503, size: randomSize(0.2),  type: randomType() },
  { name: "HKG", lat: 22.3193, lng: 114.1694, size: randomSize(0.2),  type: randomType() },
  { name: "SHA", lat: 31.2304, lng: 121.4737, size: randomSize(0.15), type: randomType() },
  { name: "SGP", lat: 1.3521, lng: 103.8198, size: randomSize(0.15), type: randomType() },
  { name: "MUM", lat: 19.0760, lng: 72.8777, size: randomSize(0.15), type: randomType() },
  { name: "DXB", lat: 25.2048, lng: 55.2708, size: randomSize(0.12), type: randomType() },
  { name: "SYD", lat: -33.8688, lng: 151.2093, size: randomSize(0.12), type: randomType() },
  { name: "SAO", lat: -23.5505, lng: -46.6333, size: randomSize(0.12), type: randomType() },
  { name: "JNB", lat: -26.2041, lng: 28.0473, size: randomSize(0.1),  type: randomType() },
];

const ROUTES_DATA = [
  { start: [40.7128, -74.0060], end: [51.5074, -0.1278], type: randomType() },
  { start: [51.5074, -0.1278], end: [35.6762, 139.6503], type: randomType() },
  { start: [35.6762, 139.6503], end: [40.7128, -74.0060], type: randomType() },
  { start: [41.8781, -87.6298], end: [40.7128, -74.0060], type: randomType() },
  { start: [43.6511, -79.3470], end: [40.7128, -74.0060], type: randomType() },
  { start: [40.7128, -74.0060], end: [50.1109, 8.6821], type: randomType() },
  { start: [51.5074, -0.1278], end: [50.1109, 8.6821], type: randomType() },
  { start: [50.1109, 8.6821], end: [47.3769, 8.5417], type: randomType() },
  { start: [35.6762, 139.6503], end: [22.3193, 114.1694], type: randomType() },
  { start: [22.3193, 114.1694], end: [31.2304, 121.4737], type: randomType() },
  { start: [22.3193, 114.1694], end: [1.3521, 103.8198], type: randomType() },
  { start: [1.3521, 103.8198], end: [19.0760, 72.8777], type: randomType() },
  { start: [35.6762, 139.6503], end: [-33.8688, 151.2093], type: randomType() },
  { start: [25.2048, 55.2708], end: [19.0760, 72.8777], type: randomType() },
  { start: [25.2048, 55.2708], end: [51.5074, -0.1278], type: randomType() },
  { start: [-23.5505, -46.6333], end: [40.7128, -74.0060], type: randomType() },
  { start: [-26.2041, 28.0473], end: [51.5074, -0.1278], type: randomType() },
];


export function GlobeComponent({ isDark }: { isDark: boolean }) {
  const globeRef = useRef<ThreeGlobe>(null);
  const [countries, setCountries] = useState(null);

  // 1. SELECT ACTIVE PALETTE
  const colors = isDark ? PALETTE_DARK : PALETTE_LIGHT;

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/three-globe/master/example/country-polygons/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(setCountries);
  }, []);

  useEffect(() => {
    if (!globeRef.current || !countries) return;

    const globe = globeRef.current;
    
    // 2. CLEAR PREVIOUS DATA (Crucial for theme switching)
    globe.pointsData([]).ringsData([]).arcsData([]);

    // --- BASE ---
    globe
      .hexPolygonsData((countries as any).features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.7)
      .showAtmosphere(true)
      .atmosphereColor(colors.atmosphere)
      .atmosphereAltitude(0.2)
      .hexPolygonColor(() => colors.land);

    // --- ARCS ---
    globe
      .arcsData(ROUTES_DATA)
      .arcStartLat((d: any) => d.start[0])
      .arcStartLng((d: any) => d.start[1])
      .arcEndLat((d: any) => d.end[0])
      .arcEndLng((d: any) => d.end[1])
      .arcColor((d: any) => (d.type === "cyan" ? colors.cyan : colors.pink))
      .arcAltitude(0.4) 
      .arcStroke(0.5)
      .arcDashLength(0.4) 
      .arcDashGap(2)      
      .arcDashInitialGap(() => Math.random() * 5)
      .arcDashAnimateTime(2000);

    // --- NODES ---
    globe
      .pointsData(HUBS_DATA)
      .pointColor((d: any) => (d.type === "cyan" ? colors.cyan : colors.pink))
      .pointLat((d: any) => d.lat)
      .pointLng((d: any) => d.lng)
      .pointAltitude(0.05)
      .pointRadius((d: any) => d.size); 

    // --- RINGS ---
    globe
      .ringsData(HUBS_DATA)
      .ringColor((d: any) => (d.type === "cyan" ? colors.cyan : colors.pink))
      .ringLat((d: any) => d.lat)
      .ringLng((d: any) => d.lng)
      .ringMaxRadius(6)
      .ringPropagationSpeed(3)
      .ringRepeatPeriod(() => Math.random() * 1000 + 1000);

    // --- MATERIAL ---
    const globeMaterial = globe.globeMaterial() as any;
    globeMaterial.color = new Color(colors.void);
    globeMaterial.emissive = new Color(colors.emissive);
    globeMaterial.emissiveIntensity = isDark ? 0.5 : 0.8; // Brighter emissive in light mode
    globeMaterial.shininess = isDark ? 0.9 : 0.2; // Matte finish for light mode

  }, [countries, isDark]); // Re-run when theme changes

  return (
    <>
      <threeGlobe ref={globeRef} />
      
      {/* Lighting Adapts to Theme */}
      <ambientLight color="#ffffff" intensity={isDark ? 0.6 : 1.2} />
      <directionalLight color="#ffffff" position={new Vector3(-400, 100, 400)} intensity={0.8} />
      
      <spotLight 
        position={[-200, 500, 200]} 
        intensity={isDark ? 2.0 : 0.5} 
        color={colors.cyan} 
        distance={1000} 
        angle={Math.PI / 4}
        penumbra={1}
      /> 
    </>
  );
}

// MAIN EXPORT
export function Globe({ className }: { className?: string }) {
  // 3. THEME DETECTOR
  // This listens for the 'dark' class on the <html> tag (standard Tailwind approach)
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Initial Check
    const checkTheme = () => {
      const isDarkClass = document.documentElement.classList.contains('dark');
      setIsDark(isDarkClass);
    };
    checkTheme();

    // Observer for changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const colors = isDark ? PALETTE_DARK : PALETTE_LIGHT;

  return (
    <div className={`absolute inset-0 z-0 pointer-events-none ${className || ''}`}>
      <Canvas 
         camera={{ position: [0, 0, 400], fov: 45 }}
         gl={{ antialias: true, alpha: true }}
      >
        {/* Dynamic Fog matches background */}
        <fog attach="fog" args={[colors.void, 400, 2000]} />
        <GlobeComponent isDark={isDark} />
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          autoRotate={true}
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}