import { Reveal, SectionHeader } from "@/components/site/ui";
import { ArrowRight, ChevronsLeftRight } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";

const MEMBERS = [
  {
    name: "MAYA R.",
    branch: "DOWNTOWN",
    time: "24 WEEKS",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=900&auto=format&fit=crop",
    quote:
      "From zero gym days to five a week — BR made it a habit, not a chore.",
    stats: [
      { value: "−12", unit: "KG", tint: "text-flame" },
      { value: "+2", unit: "PRs", tint: "text-lime" },
      { value: "5", unit: "DAYS/WK", tint: "text-volt" },
    ],
  },
  {
    name: "DARIO V.",
    branch: "UPTOWN",
    time: "9 MONTHS",
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=900&auto=format&fit=crop",
    quote:
      "Coaches rewrote my program twice a year. The numbers don't lie — neither does the mirror.",
    stats: [
      { value: "+5", unit: "KG MUSCLE", tint: "text-lime" },
      { value: "−8", unit: "KG FAT", tint: "text-flame" },
      { value: "215", unit: "SESSIONS", tint: "text-volt" },
    ],
  },
  {
    name: "SOFIA K.",
    branch: "EASTSIDE",
    time: "16 WEEKS",
    image:
      "https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=900&auto=format&fit=crop",
    quote:
      "First 5K ever at week 12. Then I deadlifted 100kg. BR pacing is a cheat code.",
    stats: [
      { value: "−9", unit: "% BODY FAT", tint: "text-flame" },
      { value: "+30", unit: "KG DEADLIFT", tint: "text-lime" },
      { value: "5K", unit: "FIRST RACE", tint: "text-volt" },
    ],
  },
];

/** Draggable before/after comparison slider (pointer + keyboard accessible). */
function BeforeAfter({ src, alt }: { src: string; alt: string }) {
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  const update = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(97, Math.max(3, p)));
  };

  return (
    <div
      ref={ref}
      role="slider"
      aria-label="Drag to compare before and after"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      tabIndex={0}
      className="relative aspect-[4/5] w-full touch-none select-none overflow-hidden bg-graphite"
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e.clientX);
      }}
      onPointerMove={(e) => {
        if (dragging.current) update(e.clientX);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setPos((p) => Math.max(3, p - 4));
        if (e.key === "ArrowRight") setPos((p) => Math.min(97, p + 4));
        if (e.key === "Home") setPos(3);
        if (e.key === "End") setPos(97);
      }}
    >
      {/* AFTER — vibrant base layer */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-carbon/75 via-transparent to-transparent" />
      <span className="absolute right-4 top-4 rounded-full bg-lime px-3 py-1 font-data text-[10px] font-bold uppercase tracking-widest text-carbon">
        After
      </span>

      {/* BEFORE — clipped, flattened treatment */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img
          src={src}
          alt=""
          aria-hidden
          loading="lazy"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover grayscale brightness-[0.55] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-carbon/30" />
        <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-carbon/70 px-3 py-1 font-data text-[10px] font-bold uppercase tracking-widest text-bone backdrop-blur">
          Before
        </span>
      </div>

      {/* Handle */}
      <div
        className="pointer-events-none absolute inset-y-0 z-10"
        style={{ left: `${pos}%` }}
      >
        <div
          className="absolute inset-y-0 w-px -translate-x-1/2 bg-bone/80"
          style={{ boxShadow: "0 0 12px rgba(0,0,0,0.6)" }}
        />
        <div className="absolute top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-carbon/85 text-lime shadow-xl backdrop-blur">
          <ChevronsLeftRight className="size-4" />
        </div>
      </div>
    </div>
  );
}

function MemberCard({
  m,
  index,
}: {
  m: (typeof MEMBERS)[number];
  index: number;
}) {
  return (
    <Reveal delay={0.08 + index * 0.08}>
      <div className="group overflow-hidden rounded-2xl border border-white/8 bg-graphite transition-all duration-300 hover:-translate-y-1.5 hover:border-lime/40 hover:shadow-2xl hover:shadow-black/50">
        <BeforeAfter src={m.image} alt={`${m.name} BR FITNESS transformation`} />
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-semibold uppercase text-bone">
              {m.name}
            </h3>
            <span className="micro-label shrink-0 text-[9px]!">
              {m.branch} · {m.time}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-ash">“{m.quote}”</p>
          <div className="mt-4 flex gap-2">
            {m.stats.map((s) => (
              <span
                key={s.unit}
                className="flex-1 rounded-lg border border-white/10 bg-carbon px-3 py-2 text-center"
              >
                <span className={`font-data text-lg font-semibold ${s.tint}`}>
                  {s.value}
                </span>
                <span className="ml-1 font-data text-[10px] text-ash">
                  {s.unit}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function Transformations() {
  const navigate = useNavigate();

  return (
    <section
      id="transformations"
      className="relative overflow-hidden bg-carbon py-24 sm:py-32"
    >
      <span className="pointer-events-none absolute -left-6 top-10 select-none font-display text-[9rem] font-bold uppercase leading-none text-white/[0.03] sm:text-[14rem]">
        PROOF
      </span>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="REAL TRANSFORMATIONS"
          title={
            <>
              DRAG THE LINE.
              <br />
              <span className="text-flame">SEE THE WORK.</span>
            </>
          }
          description="Straight from member check-ins — coached programs, tracked weekly, no shortcuts. Drag the handle on each photo to see where they started."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MEMBERS.map((m, i) => (
            <MemberCard key={m.name} m={m} index={i} />
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-2xl border border-flame/20 bg-mesh-lime p-8 text-center sm:flex-row sm:text-left">
            <div>
              <p className="micro-label text-flame">YOUR TURN</p>
              <p className="headline-xl mt-2 max-w-xl text-2xl text-bone sm:text-3xl">
                SIX MONTHS FROM NOW, YOU&apos;LL WISH YOU STARTED TODAY
              </p>
            </div>
            <button
              onClick={() => navigate("/auth")}
              className="group inline-flex shrink-0 items-center gap-2 rounded-lg bg-lime px-7 py-3.5 font-semibold text-carbon transition-all hover:bg-lime/90 glow-lime"
            >
              Start Your Transformation
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
