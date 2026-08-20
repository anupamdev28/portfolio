import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Counter, Magnetic } from "@/components/site/ui";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Hero Image Background — muscular man gym exercise clip             */
/* ------------------------------------------------------------------ */

const HERO_IMAGES = [
  // Muscular man doing kettlebell lunge — dark gym, dramatic blue/cyan lighting
  "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=1920&q=80&auto=format&fit=crop",
  // Man training in dark gym — moody fitness atmosphere
  "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1920&q=80&auto=format&fit=crop",
  // Dark gym with weights — intense training vibe
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1920&q=80&auto=format&fit=crop",
];

function HeroBackground() {
  const [imgIndex, setImgIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = () => {
    if (imgIndex < HERO_IMAGES.length - 1) {
      setImgIndex((i) => i + 1);
      setIsLoaded(false);
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Dark base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 55% 50%, #0d1117 0%, #080a0e 50%, #040506 100%)",
        }}
      />

      {/* Hero image — muscular man doing gym exercise */}
      <img
        src={HERO_IMAGES[imgIndex]}
        alt="Athlete training at BR FITNESS gym"
        className="absolute inset-0 h-full w-full object-cover object-center"
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 1.5s ease-in-out",
          filter: "brightness(0.7) contrast(1.1) saturate(1.15)",
        }}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
      />

      {/* Cinematic overlays */}
      {/* Left fade — heavy for text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(4,5,6,0.97) 0%, rgba(4,5,6,0.9) 20%, rgba(4,5,6,0.6) 45%, rgba(4,5,6,0.2) 65%, rgba(4,5,6,0.05) 100%)",
        }}
      />

      {/* Bottom vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(0deg, rgba(4,5,6,0.95) 0%, rgba(4,5,6,0.4) 35%, transparent 65%)",
        }}
      />

      {/* Top vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(4,5,6,0.7) 0%, transparent 30%)",
        }}
      />

      {/* Cyan/blue tint overlay to match the uploaded image's color grading */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-soft-light"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 60% 45%, rgba(0,180,216,0.08), transparent 70%)",
        }}
      />

      {/* Film grain texture */}
      <div className="grain absolute inset-0 pointer-events-none" />

      {/* === BR FITNESS neon sign overlay === */}
      <div className="absolute top-[8%] right-[6%] text-center z-10 hidden lg:block">
        <div
          className="px-5 py-1.5"
          style={{
            border: "1.5px solid rgba(0,210,255,0.3)",
            background: "rgba(4,5,6,0.65)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <span
            className="font-display text-sm md:text-lg font-bold tracking-[0.25em] uppercase"
            style={{
              color: "#00d2ff",
              textShadow:
                "0 0 10px rgba(0,210,255,0.5), 0 0 30px rgba(0,210,255,0.2), 0 0 60px rgba(0,210,255,0.08)",
            }}
          >
            BR FITNESS
          </span>
        </div>
      </div>

      {/* === Floating particles (matching uploaded image's particle effects) === */}
      {Array.from({ length: 25 }).map((_, i) => {
        const x = 5 + ((i * 31) % 90);
        const y = 5 + ((i * 47) % 85);
        const size = 1 + (i % 3) * 0.8;
        const dur = 5 + (i % 6) * 2.5;
        const delay = (i % 8) * -1.2;
        // Cyan/white particles matching the uploaded image's glow effects
        const color =
          i % 4 === 0
            ? "#00d2ff"
            : i % 4 === 1
              ? "#ffffff"
              : i % 4 === 2
                ? "#00b4d8"
                : "#90e0ef";
        return (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              background: color,
              opacity: 0,
              animation: `hero-particle-drift ${dur}s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}

      {/* === Floating light streaks (matching uploaded image's light effects) === */}
      {Array.from({ length: 6 }).map((_, i) => {
        const x = 30 + ((i * 23) % 50);
        const y = 20 + ((i * 37) % 60);
        const width = 30 + (i % 3) * 20;
        const dur = 8 + (i % 4) * 3;
        const delay = i * -2;
        return (
          <div
            key={`streak-${i}`}
            className="absolute pointer-events-none"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: width,
              height: 1,
              background: `linear-gradient(90deg, transparent, rgba(0,210,255,${0.15 + (i % 3) * 0.05}), transparent)`,
              transform: `rotate(${-20 + i * 15}deg)`,
              opacity: 0,
              animation: `hero-streak ${dur}s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}

      {/* Keyframes */}
      <style>{`
        @keyframes hero-particle-drift {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10% { opacity: 0.6; }
          50% { opacity: 0.3; transform: translateY(-40px) translateX(15px) scale(1.2); }
          90% { opacity: 0.5; }
          100% { transform: translateY(-80px) translateX(-10px) scale(0.8); opacity: 0; }
        }
        @keyframes hero-streak {
          0% { transform: translateX(-20px) rotate(var(--r, -15deg)); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.5; }
          100% { transform: translateX(40px) rotate(var(--r, -15deg)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero section                                                       */
/* ------------------------------------------------------------------ */

export function Hero() {
  const settings = useQuery(api.content.getSettings);
  const navigate = useNavigate();

  const stats = settings?.stats ?? {
    members: 4820,
    classesRun: 12600,
    rating: 4.9,
    locations: 3,
  };

  const goPrograms = () =>
    document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col overflow-hidden bg-carbon"
    >
      {/* Background — muscular man doing gym exercise */}
      <HeroBackground />

      {/* Content overlay */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3"
        >
          <span className="h-px w-10 bg-lime" />
          <span className="micro-label">
            EST. 2024 / STRENGTH. SPEED. DISCIPLINE.
          </span>
        </motion.div>

        <h1 className="headline-xl mt-6 max-w-3xl text-[13vw] text-bone sm:text-7xl md:text-8xl lg:text-[7.5rem]">
          <motion.span
            className="block"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            FORGE YOUR
          </motion.span>
          <motion.span
            className="block text-lime"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            STRONGEST
          </motion.span>
          <motion.span
            className="block text-stroke"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            SELF
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="mt-6 max-w-xl text-sm leading-7 text-bone/90 sm:text-base"
        >
          {settings?.heroSubheadline ??
            "Premium training floors, elite coaching and a recovery wing at three clubs across the city. Your first session is on us."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75 }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <Magnetic strength={0.25}>
            <Button
              size="lg"
              className="h-13 gap-2 bg-lime px-7 text-[15px] font-semibold text-carbon hover:bg-lime/90 glow-lime"
              onClick={() => navigate("/auth")}
            >
              Book Free Trial
              <ArrowRight className="size-4" />
            </Button>
          </Magnetic>
          <Magnetic strength={0.25}>
            <Button
              size="lg"
              variant="outline"
              className="h-13 border-white/20 bg-black/30 backdrop-blur-sm px-7 text-[15px] font-semibold text-bone hover:border-lime/60 hover:text-lime"
              onClick={goPrograms}
            >
              Explore Programs
            </Button>
          </Magnetic>
        </motion.div>

        {/* Live stat ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-14 grid max-w-2xl grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4"
        >
          {[
            { value: stats.members, suffix: "+", label: "MEMBERS TRAINED" },
            { value: stats.classesRun, suffix: "+", label: "CLASSES RUN" },
            { value: stats.rating, suffix: "★", label: "AVG RATING" },
            { value: stats.locations, suffix: "", label: "CLUBS" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-data text-3xl font-semibold text-bone sm:text-4xl">
                <Counter
                  value={s.value}
                  suffix={s.suffix}
                  className="text-3xl sm:text-4xl"
                />
              </p>
              <p className="micro-label mt-1.5 text-[10px]!">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        onClick={goPrograms}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-ash transition-colors hover:text-lime md:flex"
        aria-label="Scroll down"
      >
        <span className="micro-label text-[9px]!">SCROLL</span>
        <span className="relative h-12 w-6 rounded-full border border-white/20">
          <span className="absolute left-1/2 top-2 h-2 w-1 -translate-x-1/2 rounded-full bg-lime animate-scroll-cue" />
        </span>
        <ChevronDown className="size-4 animate-bounce" />
      </motion.button>
    </section>
  );
}
