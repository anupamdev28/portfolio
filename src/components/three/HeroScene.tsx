import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, Text } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  Shared scroll state (written by ScrollDriver, read everywhere)    */
/* ------------------------------------------------------------------ */
const sceneState = { progress: 0 };

/* ------------------------------------------------------------------ */
/*  SMOOTHSTEP CAMERA RIG                                             */
/* ------------------------------------------------------------------ */
function CameraRig() {
  useFrame((state) => {
    const { camera } = state;
    const t = sceneState.progress;
    // Orbit from front-left to side to slightly above and behind
    const angle = THREE.MathUtils.lerp(-0.4, 1.2, t);
    const radius = THREE.MathUtils.lerp(12, 7, t);
    const height = THREE.MathUtils.lerp(2.5, 4.5, t);
    const camX = Math.sin(angle) * radius;
    const camZ = Math.cos(angle) * radius;
    camera.position.set(camX, height, camZ);
    camera.lookAt(0, 1.8, 0);
  });
  return null;
}

/* ------------------------------------------------------------------ */
/*  POWER RACK                                                        */
/* ------------------------------------------------------------------ */
function PowerRack() {
  const metalColor = "#1a1a20";
  const metalProps = { color: metalColor, metalness: 0.85, roughness: 0.25 };
  const barColor = "#444449";
  const barProps = { color: barColor, metalness: 0.92, roughness: 0.15 };

  return (
    <group position={[0, 0, 0]}>
      {/* 4 uprights */}
      {[
        [-1.1, 0, -0.8],
        [1.1, 0, -0.8],
        [-1.1, 0, 0.8],
        [1.1, 0, 0.8],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <boxGeometry args={[0.08, 3.2, 0.08]} />
          <meshStandardMaterial {...metalProps} />
        </mesh>
      ))}

      {/* Top cross beams */}
      {[
        [[-1.1, 3.2, -0.8], [1.1, 3.2, -0.8]],
        [[-1.1, 3.2, 0.8], [1.1, 3.2, 0.8]],
        [[-1.1, 3.2, -0.8], [-1.1, 3.2, 0.8]],
        [[1.1, 3.2, -0.8], [1.1, 3.2, 0.8]],
      ].map(([a, b], i) => {
        const mx = (a[0] + b[0]) / 2;
        const my = (a[1] + b[1]) / 2;
        const mz = (a[2] + b[2]) / 2;
        const len = Math.sqrt(
          (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2 + (b[2] - a[2]) ** 2,
        );
        const isZ = Math.abs(b[2] - a[2]) > 0.1;
        return (
          <mesh
            key={i}
            position={[mx, my, mz]}
            rotation={[0, isZ ? 0 : 0, isZ ? 0 : 0]}
          >
            <boxGeometry
              args={
                isZ ? [0.06, 0.06, len] : [len, 0.06, 0.06]
              }
            />
            <meshStandardMaterial {...metalProps} />
          </mesh>
        );
      })}

      {/* J-hooks / barbell supports at mid-height */}
      {[-0.8, 0.8].map((z) => (
        <group key={z}>
          {[-1.1, 1.1].map((x) => (
            <mesh key={x} position={[x, 1.6, z]}>
              <boxGeometry args={[0.06, 0.06, 0.2]} />
              <meshStandardMaterial color="#d4ff3f" emissive="#d4ff3f" emissiveIntensity={0.3} metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Base feet */}
      {[-1.1, 1.1].map((x) =>
        [-0.8, 0.8].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.02, z]}>
            <boxGeometry args={[0.18, 0.04, 0.18]} />
            <meshStandardMaterial {...metalProps} />
          </mesh>
        )),
      )}

      {/* BR FITNESS nameplate on back beam */}
      <Text
        position={[0, 3.35, -0.8]}
        fontSize={0.12}
        color="#d4ff3f"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.2}
      >
        BR FITNESS
      </Text>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  BARBELL with spinning plates                                      */
/* ------------------------------------------------------------------ */
function Barbell() {
  const plateRefs = useRef<THREE.Mesh[]>([]);
  const barRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = sceneState.progress;
    // Plates spin faster on scroll
    const spinSpeed = 0.5 + p * 3;
    plateRefs.current.forEach((plate) => {
      if (plate) plate.rotation.x += spinSpeed * 0.02;
    });
    // Slight bar bounce on scroll
    if (barRef.current) {
      barRef.current.position.y = 1.8 + Math.sin(t * 1.5) * 0.02 + p * 0.15;
    }
  });

  const plateGeometry = <cylinderGeometry args={[0.4, 0.4, 0.06, 32]} />;
  const plateMaterial = (color: string) => (
    <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
  );

  const addPlateRef = (el: THREE.Mesh | null) => {
    if (el && plateRefs.current.length < 8) plateRefs.current.push(el);
  };

  return (
    <group ref={barRef} position={[0, 1.8, 0]} rotation={[0, 0, Math.PI / 2]}>
      {/* Bar shaft */}
      <mesh>
        <cylinderGeometry args={[0.015, 0.015, 3.4, 12]} />
        <meshStandardMaterial color="#999999" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Bar sleeves (thicker ends) */}
      {[-1.5, 1.5].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.4, 12]} />
          <meshStandardMaterial color="#888888" metalness={0.93} roughness={0.12} />
        </mesh>
      ))}

      {/* Weight plates — left side */}
      {[
        { y: -1.55, r: 0.4, w: 0.06, color: "#222228" },
        { y: -1.62, r: 0.35, w: 0.05, color: "#1a1a20" },
        { y: -1.68, r: 0.25, w: 0.04, color: "#2a2a30" },
      ].map((p, i) => (
        <mesh
          key={`l${i}`}
          ref={i === 0 ? addPlateRef : undefined}
          position={[0, p.y, 0]}
          rotation={[0, 0, 0]}
        >
          <cylinderGeometry args={[p.r, p.r, p.w, 32]} />
          {plateMaterial(p.color)}
        </mesh>
      ))}

      {/* Weight plates — right side */}
      {[
        { y: 1.55, r: 0.4, w: 0.06, color: "#222228" },
        { y: 1.62, r: 0.35, w: 0.05, color: "#1a1a20" },
        { y: 1.68, r: 0.25, w: 0.04, color: "#2a2a30" },
      ].map((p, i) => (
        <mesh
          key={`r${i}`}
          ref={i === 0 ? addPlateRef : undefined}
          position={[0, p.y, 0]}
        >
          <cylinderGeometry args={[p.r, p.r, p.w, 32]} />
          {plateMaterial(p.color)}
        </mesh>
      ))}

      {/* Neon accent rings on outer plates */}
      {[-1.55, 1.55].map((y) => (
        <mesh key={`ring${y}`} position={[0, y, 0]}>
          <torusGeometry args={[0.4, 0.008, 8, 48]} />
          <meshStandardMaterial
            color="#d4ff3f"
            emissive="#d4ff3f"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  ENERGY RINGS — pulse outward on scroll                            */
/* ------------------------------------------------------------------ */
function EnergyRings() {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!ringsRef.current) return;
    const p = sceneState.progress;
    const children = ringsRef.current.children;
    for (let i = 0; i < children.length; i++) {
      const ring = children[i] as THREE.Mesh;
      const offset = i * 0.15;
      const phase = (p * 2 + offset) % 1;
      const scale = 1 + phase * 3;
      ring.scale.set(scale, scale, scale);
      const mat = ring.material as THREE.MeshStandardMaterial;
      mat.opacity = Math.max(0, (1 - phase) * 0.6 * Math.min(1, p * 3));
    }
  });

  return (
    <group ref={ringsRef} position={[0, 1.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i}>
          <torusGeometry args={[1, 0.008, 8, 64]} />
          <meshStandardMaterial
            color="#d4ff3f"
            emissive="#d4ff3f"
            emissiveIntensity={1.5}
            transparent
            opacity={0}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  FLOATING WEIGHT PLATES — decorative scattered plates              */
/* ------------------------------------------------------------------ */
function FloatingPlates() {
  const plates = [
    { pos: [-3.5, 2.5, -2] as [number, number, number], r: 0.35, speed: 0.4 },
    { pos: [3.8, 3, -1.5] as [number, number, number], r: 0.28, speed: 0.6 },
    { pos: [-2, 4.5, -3] as [number, number, number], r: 0.2, speed: 0.5 },
    { pos: [2.5, 1.5, 2] as [number, number, number], r: 0.3, speed: 0.35 },
    { pos: [-3, 1, 1] as [number, number, number], r: 0.25, speed: 0.45 },
    { pos: [4, 4, -3] as [number, number, number], r: 0.18, speed: 0.55 },
    { pos: [-4, 3.5, 0.5] as [number, number, number], r: 0.22, speed: 0.38 },
    { pos: [1.5, 5, -2.5] as [number, number, number], r: 0.15, speed: 0.5 },
  ];

  return (
    <>
      {plates.map((p, i) => (
        <Float key={i} speed={p.speed} rotationIntensity={0.4} floatIntensity={0.6}>
          <group position={p.pos}>
            <mesh rotation={[Math.PI / 3, i * 0.8, 0]}>
              <torusGeometry args={[p.r, p.r * 0.18, 12, 32]} />
              <meshStandardMaterial
                color="#1a1a20"
                metalness={0.85}
                roughness={0.3}
              />
            </mesh>
            {/* Neon edge */}
            <mesh rotation={[Math.PI / 3, i * 0.8, 0]}>
              <torusGeometry args={[p.r, 0.005, 8, 48]} />
              <meshStandardMaterial
                color="#d4ff3f"
                emissive="#d4ff3f"
                emissiveIntensity={1}
                transparent
                opacity={0.4}
                toneMapped={false}
              />
            </mesh>
          </group>
        </Float>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  FLOATING DUMBBELLS                                                */
/* ------------------------------------------------------------------ */
function FloatingDumbbells() {
  const dumbbells = [
    { pos: [-4.5, 2, -1] as [number, number, number], rot: 0.3, speed: 0.3 },
    { pos: [4.5, 3.5, -2] as [number, number, number], rot: -0.4, speed: 0.4 },
    { pos: [0, 5.5, -3] as [number, number, number], rot: 0.6, speed: 0.35 },
  ];

  return (
    <>
      {dumbbells.map((d, i) => (
        <Float key={i} speed={d.speed} rotationIntensity={0.3} floatIntensity={0.5}>
          <group position={d.pos} rotation={[0, 0, d.rot]}>
            {/* Handle */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
              <meshStandardMaterial color="#999999" metalness={0.9} roughness={0.15} />
            </mesh>
            {/* Left head */}
            <mesh position={[-0.22, 0, 0]}>
              <boxGeometry args={[0.08, 0.1, 0.08]} />
              <meshStandardMaterial color="#1e1e24" metalness={0.85} roughness={0.3} />
            </mesh>
            {/* Right head */}
            <mesh position={[0.22, 0, 0]}>
              <boxGeometry args={[0.08, 0.1, 0.08]} />
              <meshStandardMaterial color="#1e1e24" metalness={0.85} roughness={0.3} />
            </mesh>
          </group>
        </Float>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  KETTLEBELL — large decorative centerpiece                         */
/* ------------------------------------------------------------------ */
function Kettlebell() {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = Math.sin(t * 0.3) * 0.15;
    ref.current.position.y = 3.8 + Math.sin(t * 0.5) * 0.12;
  });

  return (
    <group ref={ref} position={[0, 3.8, -2.5]}>
      {/* Body */}
      <mesh>
        <sphereGeometry args={[0.35, 24, 18]} />
        <meshStandardMaterial color="#1a1a20" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Handle arch */}
      <mesh position={[0, 0.35, 0]}>
        <torusGeometry args={[0.15, 0.025, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#888888" metalness={0.92} roughness={0.12} />
      </mesh>
      {/* Flat bottom */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.03, 16]} />
        <meshStandardMaterial color="#1a1a20" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* BR text */}
      <Text
        position={[0, 0, 0.36]}
        fontSize={0.1}
        color="#d4ff3f"
        anchorX="center"
        anchorY="middle"
      >
        BR
      </Text>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  FLOOR + GROUND                                                    */
/* ------------------------------------------------------------------ */
function GymFloor() {
  return (
    <group>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Rubber mat under rack */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[3, 2.5]} />
        <meshStandardMaterial color="#0e0e11" roughness={0.98} metalness={0.02} />
      </mesh>

      {/* Neon floor grid lines */}
      {[-4, -2, 0, 2, 4].map((x) => (
        <mesh key={`gx${x}`} position={[x, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.005, 20]} />
          <meshStandardMaterial
            color="#d4ff3f"
            emissive="#d4ff3f"
            emissiveIntensity={0.5}
            transparent
            opacity={0.15}
            toneMapped={false}
          />
        </mesh>
      ))}
      {[-4, -2, 0, 2, 4].map((z) => (
        <mesh key={`gz${z}`} position={[0, 0.01, z]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[0.005, 20]} />
          <meshStandardMaterial
            color="#d4ff3f"
            emissive="#d4ff3f"
            emissiveIntensity={0.5}
            transparent
            opacity={0.1}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  SCROLL DRIVER                                                     */
/* ------------------------------------------------------------------ */
function ScrollDriver() {
  useFrame(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const raw = THREE.MathUtils.clamp(-rect.top / (rect.height - window.innerHeight), 0, 1);
    sceneState.progress = raw;
  });
  return null;
}

/* ------------------------------------------------------------------ */
/*  PARTICLES                                                         */
/* ------------------------------------------------------------------ */
function EnergyParticles() {
  return (
    <>
      <Sparkles count={250} scale={[16, 12, 16]} size={1.2} speed={0.25} color="#d4ff3f" opacity={0.25} />
      <Sparkles count={60} scale={[12, 10, 12]} size={2} speed={0.15} color="#ff5a1f" opacity={0.15} />
      <Sparkles count={40} scale={[14, 8, 14]} size={1.8} speed={0.2} color="#3f8cff" opacity={0.12} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN EXPORT                                                       */
/* ------------------------------------------------------------------ */
export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 2.5, 12], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} color="#f5f5f2" />
        <spotLight position={[0, 8, 3]} angle={0.4} penumbra={0.8} intensity={50} decay={2} color="#d4ff3f" distance={20} />
        <spotLight position={[-5, 5, -3]} angle={0.5} penumbra={0.7} intensity={25} decay={2} color="#ff5a1f" distance={16} />
        <spotLight position={[5, 4, -2]} angle={0.4} penumbra={0.6} intensity={20} decay={2} color="#3f8cff" distance={14} />
        <pointLight position={[0, 1, 0]} intensity={15} decay={2} color="#d4ff3f" distance={8} />

        {/* Scene */}
        <GymFloor />
        <PowerRack />
        <Barbell />
        <EnergyRings />
        <Kettlebell />
        <FloatingPlates />
        <FloatingDumbbells />
        <EnergyParticles />

        {/* Camera + Scroll */}
        <CameraRig />
        <ScrollDriver />
      </Suspense>
    </Canvas>
  );
}
