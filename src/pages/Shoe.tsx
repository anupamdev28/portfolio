import { motion } from "framer-motion";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { ShoeViewer } from "@/components/three/ShoeViewer";
import { CanvasErrorBoundary } from "@/components/three/CanvasErrorBoundary";
import { use3DCapable } from "@/components/three/detect";

function ShoeFallback() {
  return (
    <div className="flex h-[400px] items-center justify-center rounded-2xl border border-white/8 bg-graphite sm:h-[480px]">
      <div className="text-center">
        <p className="micro-label text-lime">3D VIEWER</p>
        <p className="mt-2 text-sm text-ash">
          WebGL not available on this device.
        </p>
      </div>
    </div>
  );
}

const SPECS = [
  { label: "Upper", value: "Engineered mesh + TPU overlays" },
  { label: "Midsole", value: "Responsive foam compound" },
  { label: "Outsole", value: "Rubber with multi-directional grip" },
  { label: "Drop", value: "8 mm heel-to-toe" },
  { label: "Weight", value: "265 g (US 9)" },
  { label: "Use", value: "Cross-training · HIIT · Gym" },
];

export default function ShoePage() {
  const capable = use3DCapable();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="min-h-screen bg-carbon text-bone"
    >
      {/* ── Top nav bar ── */}
      <header className="sticky top-0 z-30 border-b border-white/8 bg-carbon/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-ash transition-colors hover:text-bone"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <span className="micro-label text-lime">BR ELITE — FOOTWEAR</span>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-start">

          {/* Left — 3D viewer */}
          <div>
            {capable ? (
              <CanvasErrorBoundary fallback={<ShoeFallback />}>
                <ShoeViewer />
              </CanvasErrorBoundary>
            ) : (
              <ShoeFallback />
            )}
          </div>

          {/* Right — product info */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="flex flex-col gap-8"
          >
            {/* Eyebrow + title */}
            <div>
              <p className="micro-label text-lime">BR ELITE ORIGINALS</p>
              <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-none tracking-tight sm:text-5xl">
                ELITE
                <br />
                <span className="text-lime">TRAINER X1</span>
              </h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-ash">
                Built for the floor, designed to last. The Elite Trainer X1
                pairs a responsive foam midsole with a grippy rubber outsole so
                you stay planted through every lift, sprint, and lateral cut.
              </p>
            </div>

            {/* Price */}
            <div className="flex items-end gap-4">
              <span className="font-data text-3xl font-semibold text-bone">
                ₹8,999
              </span>
              <span className="mb-0.5 text-sm text-ash line-through">
                ₹11,499
              </span>
              <span className="mb-0.5 micro-label text-flame">22% OFF</span>
            </div>

            {/* Size selector */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ash">
                Select Size (UK)
              </p>
              <div className="flex flex-wrap gap-2">
                {[6, 7, 7.5, 8, 8.5, 9, 9.5, 10, 11, 12].map((s) => (
                  <button
                    key={s}
                    className="rounded-lg border border-white/8 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-ash transition-all hover:border-lime/50 hover:text-lime focus:outline-none focus:ring-1 focus:ring-lime/50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="flex-1 rounded-xl bg-lime px-6 py-3.5 text-sm font-semibold text-carbon transition-all hover:bg-lime/90 hover:shadow-[0_0_24px_rgba(212,255,63,0.35)] active:scale-[0.98]">
                Add to Cart
              </button>
              <button className="flex-1 rounded-xl border border-white/12 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-bone transition-all hover:border-white/25 hover:bg-white/[0.08] active:scale-[0.98]">
                Save for Later
              </button>
            </div>

            {/* Specs */}
            <div className="rounded-xl border border-white/8 bg-graphite/60 p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-ash">
                Specifications
              </p>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                {SPECS.map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <dt className="text-[10px] uppercase tracking-wider text-ash/60">
                      {label}
                    </dt>
                    <dd className="text-xs font-medium text-bone/90">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Members badge */}
            <div className="flex items-center gap-3 rounded-xl border border-lime/20 bg-lime/5 px-4 py-3">
              <span className="text-lime">★</span>
              <p className="text-xs text-ash">
                <span className="font-semibold text-bone">BR Elite members</span>{" "}
                get an extra 10% off all footwear, every day.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </motion.div>
  );
}
