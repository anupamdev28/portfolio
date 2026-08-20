import { EquipmentViewer } from "@/components/three/EquipmentViewer";
import { use3DCapable } from "@/components/three/detect";
import { CanvasErrorBoundary } from "@/components/three/CanvasErrorBoundary";
import { Reveal, SectionHeader, SmartImage } from "@/components/site/ui";
import {
  Car,
  Clock,
  CupSoda,
  Flame,
  HeartPulse,
  Snowflake,
  Waves,
} from "lucide-react";

const FEATURES = [
  {
    icon: Clock,
    title: "24/7 Access",
    text: "Swipe in any hour. The floor never closes.",
    color: "text-lime",
  },
  {
    icon: Waves,
    title: "25m Pool",
    text: "Lap lanes for conditioning & recovery swims.",
    color: "text-volt",
  },
  {
    icon: Flame,
    title: "Sauna & Steam",
    text: "Sweat it out — then rinse and reset.",
    color: "text-flame",
  },
  {
    icon: Snowflake,
    title: "Cold Plunge",
    text: "3°C plunge pools at two of our clubs.",
    color: "text-volt",
  },
  {
    icon: HeartPulse,
    title: "Recovery Lounge",
    text: "Compression, massage guns and quiet space.",
    color: "text-lime",
  },
  {
    icon: CupSoda,
    title: "Smoothie Bar",
    text: "Post-workout fuel brewed in-house.",
    color: "text-flame",
  },
  {
    icon: Car,
    title: "Parking",
    text: "Free member parking at every club.",
    color: "text-ash",
  },
];

function FacilitiesFallback() {
  return (
    <div className="relative h-[380px] overflow-hidden rounded-2xl border border-white/8 bg-graphite sm:h-[440px]">
      <SmartImage
        src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1400&auto=format&fit=crop"
        className="h-full w-full"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-graphite via-transparent to-transparent" />
      <div className="absolute bottom-4 left-4">
        <span className="micro-label text-lime">THE FLOOR</span>
        <p className="mt-1 font-data text-sm text-bone">
          Commercial-grade equipment at every club
        </p>
      </div>
    </div>
  );
}

export function Facilities() {
  const capable = use3DCapable();

  return (
    <section
      id="facilities"
      className="relative overflow-hidden bg-graphite py-24 sm:py-32"
    >
      <div className="absolute inset-0 bg-grid opacity-60" />
      <span className="pointer-events-none absolute -left-8 bottom-0 select-none font-display text-[9rem] font-bold uppercase leading-none text-white/[0.03] sm:text-[14rem]">
        FLOOR
      </span>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow="SHOWCASE FACILITIES"
            title={
              <>
                TRAIN ON THE BEST
                <br />
                <span className="text-lime">FLOOR IN THE CITY</span>
              </>
            }
            description="A 1,800 m² warehouse floor with competition platforms, 40 racks, a turf zone and a recovery wing. This is what you're actually paying for — look around."
          />
          <Reveal delay={0.2}>
            <div className="flex items-center gap-8 rounded-xl border border-white/8 bg-carbon/60 px-6 py-4">
              <div>
                <p className="font-data text-2xl font-semibold text-bone">40+</p>
                <p className="micro-label text-[9px]!">POWER RACKS</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <p className="font-data text-2xl font-semibold text-bone">1,800</p>
                <p className="micro-label text-[9px]!">M² OF FLOOR</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <p className="font-data text-2xl font-semibold text-lime">100%</p>
                <p className="micro-label text-[9px]!">COMMERCIAL GRADE</p>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-5">
          <Reveal className="lg:col-span-3" delay={0.05}>
            {capable ? (
              <CanvasErrorBoundary fallback={<FacilitiesFallback />}>
                <EquipmentViewer />
              </CanvasErrorBoundary>
            ) : (
              <FacilitiesFallback />
            )}
          </Reveal>

          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1 xl:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={0.08 + i * 0.05}>
                <div className="group h-full rounded-xl border border-white/8 bg-carbon/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-lime/40 hover:glow-lime">
                  <f.icon
                    className={`size-5 ${f.color} transition-transform duration-300 group-hover:scale-110`}
                  />
                  <p className="mt-3 text-sm font-semibold text-bone">
                    {f.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-ash">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
