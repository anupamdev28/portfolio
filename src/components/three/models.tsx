import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const metal = {
  color: "#26262b",
  metalness: 0.92,
  roughness: 0.3,
};

const darkMetal = {
  color: "#17171a",
  metalness: 0.85,
  roughness: 0.45,
};

const lime = {
  color: "#d4ff3f",
  emissive: "#d4ff3f",
  emissiveIntensity: 0.9,
  metalness: 0.3,
  roughness: 0.4,
};

const flame = {
  color: "#ff5a1f",
  emissive: "#ff5a1f",
  emissiveIntensity: 0.35,
  metalness: 0.5,
  roughness: 0.35,
};

export function Barbell() {
  return (
    <group>
      {/* bar */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 4.4, 20]} />
        <meshStandardMaterial {...darkMetal} />
      </mesh>
      {[1, -1].map((side) => (
        <group key={side}>
          {[0.95, 1.15, 1.35, 1.55].map((x, i) => (
            <mesh
              key={x}
              position={[side * x, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.62 - i * 0.05, 0.62 - i * 0.05, 0.16, 32]} />
              <meshStandardMaterial
                {...(i === 1 ? lime : metal)}
              />
            </mesh>
          ))}
          {/* collar */}
          <mesh position={[side * 1.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.12, 16]} />
            <meshStandardMaterial {...flame} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Dumbbell() {
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 2.2, 24]} />
        <meshStandardMaterial {...darkMetal} />
      </mesh>
      {[1, -1].map((side) => (
        <group key={side}>
          {[0.72, 0.92].map((x, i) => (
            <mesh
              key={x}
              position={[side * x, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.5 - i * 0.06, 0.5 - i * 0.06, 0.18, 32]} />
              <meshStandardMaterial {...(i === 1 ? lime : metal)} />
            </mesh>
          ))}
          {/* hex end */}
          <mesh position={[side * 1.14, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.42, 0.42, 0.2, 6]} />
            <meshStandardMaterial {...darkMetal} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Kettlebell() {
  return (
    <group>
      {/* ball */}
      <mesh position={[0, 0.42, 0]}>
        <sphereGeometry args={[0.56, 32, 32]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      {/* handle — half torus arcing upward */}
      <mesh position={[0, 1.02, 0]}>
        <torusGeometry args={[0.34, 0.1, 20, 32, Math.PI]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      {/* lime band around the ball */}
      <mesh position={[0, 0.42, 0]}>
        <torusGeometry args={[0.565, 0.035, 12, 48]} />
        <meshStandardMaterial {...lime} />
      </mesh>
      {/* flat base */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.05, 32]} />
        <meshStandardMaterial {...darkMetal} />
      </mesh>
    </group>
  );
}

export function Bench() {
  return (
    <group>
      {/* pad */}
      <mesh position={[0, 0.86, 0]}>
        <boxGeometry args={[1.45, 0.13, 0.62]} />
        <meshStandardMaterial color="#1f2126" metalness={0.4} roughness={0.7} />
      </mesh>
      {/* pad cushion accent */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[1.45, 0.02, 0.62]} />
        <meshStandardMaterial {...darkMetal} />
      </mesh>
      {/* legs */}
      {[0.55, -0.55].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.42, 0.2]} rotation={[0, 0, 0.12]}>
            <boxGeometry args={[0.1, 0.86, 0.1]} />
            <meshStandardMaterial {...darkMetal} />
          </mesh>
          <mesh position={[x, 0.42, -0.2]} rotation={[0, 0, -0.12]}>
            <boxGeometry args={[0.1, 0.86, 0.1]} />
            <meshStandardMaterial {...darkMetal} />
          </mesh>
        </group>
      ))}
      {/* crossbars */}
      <mesh position={[0, 0.34, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 1.4, 12]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      {/* floor plates */}
      {[-0.9, 0.9].map((x, i) => (
        <mesh
          key={x}
          position={[x, 0.16, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[i === 0 ? 0.42 : 0.36, i === 0 ? 0.42 : 0.36, 0.12, 32]} />
          <meshStandardMaterial {...(i === 0 ? lime : metal)} />
        </mesh>
      ))}
      {/* lime edge strip on the pad */}
      <mesh position={[0, 0.79, 0.32]}>
        <boxGeometry args={[1.45, 0.03, 0.03]} />
        <meshStandardMaterial {...lime} />
      </mesh>
    </group>
  );
}

/** Slow idle rotation used by the viewer's fallback models. */
export function useSlowSpin(speed = 0.3) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed;
  });
  return ref;
}

// ---------------------------------------------------------------------------
// Shoe — procedural athletic sneaker built from Three.js primitives
// ---------------------------------------------------------------------------

interface ShoeProps {
  /** Hex colour for the upper body of the shoe */
  upperColor?: string;
  /** Hex colour for the sole */
  soleColor?: string;
  /** Hex colour for the accent stripe */
  accentColor?: string;
}

export function Shoe({
  upperColor = "#1a1a2e",
  soleColor = "#d4ff3f",
  accentColor = "#ff5a1f",
}: ShoeProps) {
  // Upper material — fully diffuse (zero metalness) so dark colours
  // scatter light and stay visible against a dark background.
  const upper = { color: upperColor, metalness: 0, roughness: 0.85 };
  const sole  = { color: soleColor,  metalness: 0.05, roughness: 0.65 };
  const accent = {
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 0.55,
    metalness: 0,
    roughness: 0.4,
  };
  const midsole = { color: "#d0d0d8", metalness: 0, roughness: 0.75 };
  const lace    = { color: "#f4f4f4", metalness: 0, roughness: 0.8 };

  return (
    <group rotation={[0, -0.4, 0]} position={[0, -0.35, 0]}>
      {/* ── Outsole ── */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.6, 0.09, 0.68]} />
        <meshStandardMaterial {...sole} />
      </mesh>
      {/* Heel raise */}
      <mesh position={[-0.52, 0.07, 0]}>
        <boxGeometry args={[0.52, 0.1, 0.66]} />
        <meshStandardMaterial {...sole} />
      </mesh>
      {/* Toe curve */}
      <mesh position={[0.72, 0.05, 0]} rotation={[0, 0, -0.28]}>
        <boxGeometry args={[0.24, 0.09, 0.64]} />
        <meshStandardMaterial {...sole} />
      </mesh>

      {/* ── Midsole ── */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[1.56, 0.1, 0.64]} />
        <meshStandardMaterial {...midsole} />
      </mesh>

      {/* ── Upper — main body ── */}
      <mesh position={[-0.28, 0.34, 0]}>
        <boxGeometry args={[0.98, 0.44, 0.62]} />
        <meshStandardMaterial {...upper} />
      </mesh>

      {/* ── Upper — toe box ── */}
      <mesh position={[0.46, 0.25, 0]}>
        <boxGeometry args={[0.64, 0.28, 0.6]} />
        <meshStandardMaterial {...upper} />
      </mesh>

      {/* Toe taper */}
      <mesh position={[0.72, 0.2, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.26, 0.22, 0.58]} />
        <meshStandardMaterial {...upper} />
      </mesh>

      {/* ── Heel collar ── */}
      <mesh position={[-0.68, 0.52, 0]}>
        <torusGeometry args={[0.21, 0.045, 12, 28, Math.PI]} />
        <meshStandardMaterial {...upper} />
      </mesh>

      {/* ── Tongue ── */}
      <mesh position={[0.04, 0.5, 0.04]}>
        <boxGeometry args={[0.54, 0.32, 0.06]} />
        <meshStandardMaterial {...upper} />
      </mesh>

      {/* ── Accent stripe left ── */}
      <mesh position={[0.08, 0.28, 0.315]}>
        <boxGeometry args={[0.88, 0.07, 0.025]} />
        <meshStandardMaterial {...accent} />
      </mesh>
      {/* ── Accent stripe right ── */}
      <mesh position={[0.08, 0.28, -0.315]}>
        <boxGeometry args={[0.88, 0.07, 0.025]} />
        <meshStandardMaterial {...accent} />
      </mesh>

      {/* ── Laces ── */}
      {[0, 0.1, 0.2, 0.3, 0.4].map((offset, i) => (
        <mesh key={i} position={[0.34 - offset, 0.54, 0]}>
          <boxGeometry args={[0.06, 0.025, 0.44]} />
          <meshStandardMaterial {...lace} />
        </mesh>
      ))}

      {/* ── Heel logo panel (glowing sole colour) ── */}
      <mesh position={[-0.79, 0.32, 0]}>
        <boxGeometry args={[0.04, 0.22, 0.4]} />
        <meshStandardMaterial {...accent} />
      </mesh>

      {/* ── Grip dots ── */}
      {[-0.5, -0.1, 0.3, 0.65].map((x, i) => (
        <mesh key={i} position={[x, -0.055, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.02, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.95} metalness={0} />
        </mesh>
      ))}
    </group>
  );
}
