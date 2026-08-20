import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { Suspense, useState } from "react";
import { cn } from "@/lib/utils";
import { Barbell, Bench, Dumbbell, Kettlebell } from "./models";

const EQUIPMENT = [
  { key: "barbell", label: "Olympic Barbell", model: <Barbell /> },
  { key: "dumbbell", label: "Dumbbells", model: <Dumbbell /> },
  { key: "kettlebell", label: "Kettlebells", model: <Kettlebell /> },
  { key: "bench", label: "Flat Bench", model: <Bench /> },
] as const;

export function EquipmentViewer() {
  const [active, setActive] = useState<(typeof EQUIPMENT)[number]["key"]>(
    "barbell",
  );
  const current = EQUIPMENT.find((e) => e.key === active)!;

  return (
    <div>
      <div className="relative h-[380px] overflow-hidden rounded-2xl border border-white/8 bg-graphite sm:h-[440px]">
        <div className="pointer-events-none absolute inset-0 z-10 bg-mesh-lime opacity-40" />
        <Canvas
          camera={{ position: [0, 0.8, 5.4], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          className="relative z-0"
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.55} />
            <directionalLight position={[4, 6, 4]} intensity={2.4} />
            <pointLight position={[-4, -2, 3]} intensity={35} decay={1.8} color="#d4ff3f" />
            <pointLight position={[3, 2, -3]} intensity={25} decay={1.8} color="#ff5a1f" />
            <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
              <group key={active}>{current.model}</group>
            </Float>
            <OrbitControls
              enablePan={false}
              minDistance={3}
              maxDistance={8}
              autoRotate
              autoRotateSpeed={1.6}
              enableDamping
              dampingFactor={0.08}
            />
          </Suspense>
        </Canvas>

        <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex flex-col gap-1">
          <span className="micro-label text-lime">360° VIEW</span>
          <span className="font-data text-sm text-bone/80">
            {current.label}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {EQUIPMENT.map((e) => (
          <button
            key={e.key}
            onClick={() => setActive(e.key)}
            className={cn(
              "rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition-all",
              active === e.key
                ? "border-lime/60 bg-lime/10 text-lime"
                : "border-white/8 bg-white/[0.03] text-ash hover:border-white/20 hover:text-bone",
            )}
          >
            {e.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-ash/70">
        Drag to rotate · scroll to zoom — every piece on the floor, rendered
        live.
      </p>
    </div>
  );
}
