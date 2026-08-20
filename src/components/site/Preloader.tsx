import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import { CanvasErrorBoundary } from "@/components/three/CanvasErrorBoundary";
import { detectWebGL } from "@/components/three/detect";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Morphing loader shape: a torus knot that assembles itself as progress
 * climbs — fully distorted and "blobby" at 0%, clean at 100%.
 */
function LoaderShape({ progress }: { progress: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    const m = mesh.current;
    if (!m) return;
    m.rotation.x += delta * 0.5;
    m.rotation.y += delta * 0.7;
    m.rotation.z += delta * 0.2;
  });
  const p = progress / 100;
  return (
    <mesh ref={mesh} scale={0.55 + p * 0.5}>
      <torusKnotGeometry args={[0.6, 0.2, 160, 24]} />
      <MeshDistortMaterial
        color="#d4ff3f"
        emissive="#d4ff3f"
        emissiveIntensity={0.9}
        metalness={0.55}
        roughness={0.2}
        distort={0.4 * (1 - p)}
        speed={1.6}
      />
    </mesh>
  );
}

/** Static fallback for no-WebGL / reduced-motion devices. */
function StaticShape() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <span className="relative block size-16 rounded-full border border-white/10">
        <span className="absolute inset-0 animate-spin rounded-full border-t-2 border-lime" />
      </span>
    </div>
  );
}

function PreloaderCanvas({ progress }: { progress: number }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.4], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 3, 4]} intensity={60} decay={1.6} color="#d4ff3f" />
      <pointLight position={[-3, -2, 2]} intensity={40} decay={1.8} color="#ff5a1f" />
      <LoaderShape progress={progress} />
    </Canvas>
  );
}

export function Preloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [show3D] = useState(() => {
    if (typeof window === "undefined") return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return false;
    return detectWebGL();
  });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = reduced ? 100 : 3;
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + step, 100);
        if (next >= 100) clearInterval(interval);
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(onDone, 350);
      return () => clearTimeout(t);
    }
  }, [progress, onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[9990] flex flex-col items-center justify-center bg-carbon"
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grain absolute inset-0" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col items-center gap-7"
      >
        {/* Morphing 3D shape — only when WebGL available */}
        <div className="h-36 w-36">
          {show3D ? (
            <CanvasErrorBoundary fallback={<StaticShape />}>
              <PreloaderCanvas progress={progress} />
            </CanvasErrorBoundary>
          ) : (
            <StaticShape />
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-md bg-lime">
            <span className="font-display text-lg font-bold text-carbon">BR</span>
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight text-bone">
            FITNESS
          </span>
        </div>

        <div className="flex items-baseline gap-1 font-data">
          <span className="text-5xl font-semibold tabular-nums text-lime">
            {progress}
          </span>
          <span className="text-xl text-ash">%</span>
        </div>

        <div className="h-px w-56 overflow-hidden bg-white/10">
          <motion.div
            className="h-full bg-lime"
            style={{ width: `${progress}%` }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: progress > 40 ? 1 : 0 }}
          className="micro-label"
        >
          STRENGTH · SPEED · DISCIPLINE
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
