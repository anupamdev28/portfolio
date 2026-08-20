import { Marquee } from "@/components/site/ui";
import { Dumbbell } from "lucide-react";

const WORDS = [
  "STRENGTH",
  "SPEED",
  "DISCIPLINE",
  "NO EXCUSES",
  "TRAIN HARD",
  "EST. 2024",
];

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {WORDS.map((w, i) => (
        <span key={`${w}-${i}`} className="flex items-center">
          <span
            className={
              i % 2 === 0
                ? "font-display text-5xl font-bold uppercase tracking-tight text-bone/90 sm:text-6xl"
                : "font-display text-5xl font-bold uppercase tracking-tight text-stroke sm:text-6xl"
            }
          >
            {w}
          </span>
          <span className="mx-8 flex items-center gap-1.5">
            <Dumbbell className="size-4 text-lime" />
            <Dumbbell className="size-4 text-flame" />
          </span>
        </span>
      ))}
    </div>
  );
}

export function MarqueeBand() {
  return (
    <div className="relative overflow-hidden border-y border-white/8 bg-graphite py-8">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-graphite to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-graphite to-transparent" />
      <Marquee duration={32}>
        <Row />
      </Marquee>
    </div>
  );
}
