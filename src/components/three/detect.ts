import { useState } from "react";

export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

/**
 * Whether the current device should render the 3D scenes.
 *
 * Blocks on: reduced-motion preference OR no WebGL support.
 * The old viewport-width gate (< 768px) was removed — modern phones
 * handle WebGL fine and the gate also broke narrow preview iframes
 * that DO support WebGL. When WebGL is unavailable we show styled
 * static fallbacks (the error boundary also catches runtime GPU errors).
 */
export function use3DCapable(): boolean {
  const [capable] = useState(() => {
    if (typeof window === "undefined") return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return false;
    return detectWebGL();
  });
  return capable;
}
