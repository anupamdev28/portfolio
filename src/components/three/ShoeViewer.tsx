import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { Suspense, useState } from "react";
import { cn } from "@/lib/utils";
import { Shoe } from "./models";

// ── Colour presets ──────────────────────────────────────────────────────────
const COLORWAYS = [
  {
    key: "midnight",
    label: "Midnight Lime",
    upper: "#0f0f1a",
    sole: "#d4ff3f",
    accent: "#d4ff3f",
  },
  {
    key: "flame",
    label: "Flame Black",
    upper: "#1a0a00",
    sole: "#ff5a1f",
    accent: "#ff5a1f",
  },
  {
    key: "arctic",
    label: "Arctic White",
    upper: "#e8e8f0",
    sole: "#ffffff",
    accent: "#3b82f6",
  },
  {
    key: "carbon",
    label: "Carbon Red",
    upper: "#18181b",
    sole: "#ef4444",
    accent: "#ef4444",
  },
  {
    key: "volt",
    label: "Volt Navy",
    upper: "#0a0a2e",
    sole: "#facc15",
    accent: "#facc15",
  },
  {
    key: "olive",
    label: "Olive Ghost",
    upper: "#3d4a2e",
    sole: "#a3b18a",
    accent: "#ffffff",
  },
] as const;

type ColorwayKey = (typeof COLORWAYS)[number]["key"];

export function ShoeViewer() {
  const [active, setActive] = useState<ColorwayKey>("midnight");
  const cw = COLORWAYS.find((c) => c.key === active)!;

  return (
    <div>
      {/* ── Canvas ── */}
      <div className="relative h-[400px] overflow-hidden rounded-2xl border border-white/8 bg-graphite sm:h-[480px]">
        {/* subtle mesh overlay */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-mesh-lime opacity-30" />

        <Canvas
          camera={{ position: [0, 0.5, 5], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true }}
          className="relative z-0"
        >
          <Suspense fallback={null}>
            {/* Scene background so the shoe is always visible */}
            <color attach="background" args={["#111116"]} />

            {/* Strong ambient so dark uppers are always visible */}
            <ambientLight intensity={1.8} />
            {/* Key light from front-top-right */}
            <directionalLight position={[3, 5, 5]} intensity={3} />
            {/* Fill light from left */}
            <directionalLight position={[-4, 2, 2]} intensity={1.5} />
            {/* Rim light from behind */}
            <directionalLight position={[0, -2, -4]} intensity={1} />
            {/* Accent coloured point lights */}
            <pointLight
              position={[-3, 1, 3]}
              intensity={60}
              decay={2}
              color={cw.sole}
            />
            <pointLight
              position={[3, -1, -2]}
              intensity={30}
              decay={2}
              color={cw.accent}
            />

            {/* Shoe model */}
            <Float speed={1.4} rotationIntensity={0.12} floatIntensity={0.2}>
              <group key={active}>
                <Shoe
                  upperColor={cw.upper}
                  soleColor={cw.sole}
                  accentColor={cw.accent}
                />
              </group>
            </Float>

            <OrbitControls
              enablePan={false}
              minDistance={3}
              maxDistance={9}
              autoRotate
              autoRotateSpeed={1.8}
              enableDamping
              dampingFactor={0.08}
            />
          </Suspense>
        </Canvas>

        {/* Corner labels */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex flex-col gap-1">
          <span className="micro-label text-lime">360° VIEW</span>
          <span className="font-data text-sm text-bone/80">{cw.label}</span>
        </div>
        <div className="pointer-events-none absolute right-4 top-4 z-20">
          <span className="micro-label text-ash/60">DRAG · ZOOM</span>
        </div>
      </div>

      {/* ── Colorway picker ── */}
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {COLORWAYS.map((c) => (
          <button
            key={c.key}
            onClick={() => setActive(c.key)}
            className={cn(
              "flex flex-col items-start gap-1.5 rounded-lg border px-3 py-2.5 text-left transition-all",
              active === c.key
                ? "border-lime/60 bg-lime/10"
                : "border-white/8 bg-white/[0.03] hover:border-white/20",
            )}
          >
            {/* Colour swatch */}
            <span
              className="h-3 w-full rounded-sm"
              style={{ background: c.sole }}
            />
            <span
              className={cn(
                "text-[10px] font-medium leading-tight",
                active === c.key ? "text-lime" : "text-ash",
              )}
            >
              {c.label}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-ash/70">
        Drag to rotate · scroll to zoom — select a colorway to see it live.
      </p>
    </div>
  );
}
