import { Reveal, SectionHeader } from "@/components/site/ui";
import {
  ArrowRight,
  Bike,
  Dumbbell,
  Flower2,
  HeartPulse,
  Swords,
  Weight,
  Zap,
} from "lucide-react";

const PROGRAMS = [
  {
    icon: Dumbbell,
    name: "Strength",
    tag: "POWER",
    text: "Competition platforms, 40 racks and coaches who fix your form before it breaks.",
    accent: "text-lime",
  },
  {
    icon: Zap,
    name: "HIIT",
    tag: "CONDITION",
    text: "45 minutes, zero wasted seconds. Work intervals that build engine, not ego.",
    accent: "text-flame",
  },
  {
    icon: Swords,
    name: "Boxing",
    tag: "THE RING",
    text: "Full-size ring, heavy-bag wall and fundamentals from coaches who've fought.",
    accent: "text-volt",
  },
  {
    icon: Flower2,
    name: "Yoga & Mobility",
    tag: "RECOVER",
    text: "Vinyasa flow, breathwork and myofascial release — the calm after the storm.",
    accent: "text-lime",
  },
  {
    icon: Weight,
    name: "CrossFit",
    tag: "WOD",
    text: "Scaled WODs on the turf zone, programmed for every level from brand-new to games.",
    accent: "text-flame",
  },
  {
    icon: Bike,
    name: "Spin",
    tag: "ENGINE",
    text: "Power targets, climb blocks and a playlist that does the talking.",
    accent: "text-volt",
  },
];

export function Programs() {
  const goSchedule = () =>
    document.getElementById("schedule")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="programs" className="relative bg-carbon py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="PROGRAMS & CLASSES"
          title={
            <>
              SIX WAYS TO
              <br />
              <span className="text-flame">PUT IN WORK</span>
            </>
          }
          description="Every class is coached, programmed and capped at a real capacity — no crowded floors, no watered-down sessions."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map((p, i) => (
            <Reveal key={p.name} delay={0.05 + i * 0.06}>
              <button
                onClick={goSchedule}
                className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-graphite p-6 text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-2xl hover:shadow-black/40"
              >
                <span className="pointer-events-none absolute right-0 top-0 select-none font-display text-7xl font-bold text-white/[0.04] transition-colors group-hover:text-lime/10">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-xl border border-white/10 bg-carbon">
                    <p.icon className={`size-5 ${p.accent}`} />
                  </span>
                  <span className="micro-label text-[9px]!">{p.tag}</span>
                </div>
                <h3 className="headline-xl mt-6 text-2xl text-bone">
                  {p.name}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-ash">
                  {p.text}
                </p>
                <span className="mt-6 flex items-center gap-2 text-xs font-semibold text-lime opacity-0 transition-all duration-300 group-hover:opacity-100">
                  View schedule
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-2xl border border-lime/20 bg-mesh-lime p-8 sm:flex-row sm:items-center">
            <div>
              <p className="micro-label text-lime">FIRST SESSION FREE</p>
              <p className="headline-xl mt-2 text-2xl text-bone sm:text-3xl">
                TRY ANY CLASS, ON US
              </p>
              <p className="mt-2 text-sm text-ash">
                Book a free trial at the branch nearest you — no contract, no
                pressure.
              </p>
            </div>
            <Reveal delay={0.3}>
              <button
                onClick={goSchedule}
                className="group inline-flex items-center gap-2 rounded-lg bg-lime px-6 py-3 font-semibold text-carbon transition-all hover:bg-lime/90 glow-lime"
              >
                See this week&apos;s schedule
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Reveal>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
