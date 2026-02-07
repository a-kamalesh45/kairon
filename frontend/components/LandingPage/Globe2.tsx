"use client"

import { useEffect, useRef } from "react"
import createGlobe from "cobe"
import { useMotionValue, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"

const MOVEMENT_DAMPING = 1400

// 🎨 THEME
// Cities: Cyan [#00F0FF]
// Packets: White [#FFFFFF] 

// 📍 STATIC NODES
const CITIES = [
  { location: [40.7128, -74.006], size: 0.1 },     // NYC
  { location: [51.5074, -0.1278], size: 0.08 },    // London
  { location: [35.6762, 139.6503], size: 0.08 },   // Tokyo
  { location: [22.3193, 114.1694], size: 0.05 },   // Hong Kong
  { location: [1.3521, 103.8198], size: 0.05 },    // Singapore
  { location: [50.1109, 8.6821], size: 0.05 },     // Frankfurt
  { location: [19.076, 72.8777], size: 0.06 },     // Mumbai
  { location: [-33.8688, 151.2093], size: 0.05 },  // Sydney
]

// 🔗 ROUTES
const ROUTES = [
  { start: [40.7128, -74.006], end: [51.5074, -0.1278] },    // NYC -> London
  { start: [51.5074, -0.1278], end: [35.6762, 139.6503] },   // London -> Tokyo
  { start: [35.6762, 139.6503], end: [22.3193, 114.1694] },  // Tokyo -> HK
  { start: [22.3193, 114.1694], end: [1.3521, 103.8198] },   // HK -> Singapore
  { start: [1.3521, 103.8198], end: [19.076, 72.8777] },     // Singapore -> Mumbai
  { start: [19.076, 72.8777], end: [50.1109, 8.6821] },      // Mumbai -> Frankfurt
  { start: [50.1109, 8.6821], end: [40.7128, -74.006] },     // Frankfurt -> NYC
  { start: [40.7128, -74.006], end: [35.6762, 139.6503] },   // NYC -> Tokyo
]

// 🧮 MATH: Calculate Great Circle Path
// Moved outside component for performance
function getInterpolatedPosition(start: number[], end: number[], progress: number) {
  const toRad = (n: number) => (n * Math.PI) / 180
  const toDeg = (n: number) => (n * 180) / Math.PI

  const lat1 = toRad(start[0])
  const lon1 = toRad(start[1])
  const lat2 = toRad(end[0])
  const lon2 = toRad(end[1])

  const d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((lat1 - lat2) / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon1 - lon2) / 2), 2)))

  // Safety: If points are too close, return start to avoid NaN
  if (d < 0.001) return start;

  const A = Math.sin((1 - progress) * d) / Math.sin(d)
  const B = Math.sin(progress * d) / Math.sin(d)

  const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2)
  const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2)
  const z = A * Math.sin(lat1) + B * Math.sin(lat2)

  const lat3 = Math.atan2(z, Math.sqrt(x * x + y * y))
  const lon3 = Math.atan2(y, x)

  return [toDeg(lat3), toDeg(lon3)]
}

export function Globe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)

  const r = useMotionValue(0)
  const rs = useSpring(r, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  })

  useEffect(() => {
    let phi = 0
    let width = 0
    let globe: any

    const onResize = () => {
      // Safety: Ensure canvas exists
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth
      }
    }
    window.addEventListener("resize", onResize)
    onResize()

    if (!canvasRef.current) return;

    // Initialize Cobe
    globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2 || 1000, // Fallback width
      height: width * 2 || 1000, // Fallback height
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 12000,
      mapBrightness: 6,
      baseColor: [0.05, 0.05, 0.05],
      markerColor: [0, 0.94, 1], // Cyan
      glowColor: [0.1, 0.1, 0.1],
      opacity: 0.8,
      markers: [],
      onRender: (state) => {
        // 1. Rotation
        if (!pointerInteracting.current) {
          phi += 0.003
        }
        state.phi = phi + rs.get()

        // 2. Packets Animation
        const time = Date.now()
        const packets = ROUTES.map((route, index) => {
          // Cycle 0 to 1 over 1.5 seconds
          const progress = (time + index * 300) % 1500 / 1500
          const pos = getInterpolatedPosition(route.start, route.end, progress)
          return {
            location: pos,
            size: 0.04, // Small packet size
          }
        })

        // 3. Update Markers
        state.markers = [
          ...CITIES.map(c => ({ ...c, size: c.size })),
          ...packets
        ]
      },
    })

    // Force visibility immediately
    if (canvasRef.current) {
      canvasRef.current.style.opacity = "1";
    }

    return () => {
      if (globe) globe.destroy()
      window.removeEventListener("resize", onResize)
    }
  }, [rs])

  return (
    <div className={cn("absolute inset-0 mx-auto aspect-square w-full max-w-3xl", className)}>
      <canvas
        className={cn("size-full opacity-100 transition-opacity duration-1000 ease-in-out")}
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX
          if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
        }}
        onPointerUp={() => {
          pointerInteracting.current = null
          if (canvasRef.current) canvasRef.current.style.cursor = "grab"
        }}
        onPointerOut={() => {
          pointerInteracting.current = null
          if (canvasRef.current) canvasRef.current.style.cursor = "grab"
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current
            pointerInteractionMovement.current = delta
            rs.set(r.get() + delta / MOVEMENT_DAMPING)
          }
        }}
        onTouchMove={(e) => {
          if (e.touches[0] && pointerInteracting.current !== null) {
            const delta = e.touches[0].clientX - pointerInteracting.current
            rs.set(r.get() + delta / MOVEMENT_DAMPING)
          }
        }}
      />
    </div>
  )
}