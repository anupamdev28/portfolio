import { api } from "@/convex/_generated/api";
import { Counter, Reveal, SmartImage } from "@/components/site/ui";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";

export function About() {
  const settings = useQuery(api.content.getSettings);
  const branches = useQuery(api.content.listBranches);

  const stats = settings?.stats ?? {
    members: 4820,
    classesRun: 12600,
    rating: 4.9,
    locations: 3,
  };

  return (
    <section id="about" className="relative overflow-hidden bg-carbon py-24 sm:py-32">
      <span className="pointer-events-none absolute -right-10 top-10 select-none font-display text-[10rem] font-bold uppercase leading-none text-white/[0.03] sm:text-[16rem]">
        MIND
      </span>

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Manifesto */}
        <div>
          <Reveal>
            <span className="micro-label flex items-center gap-3">
              <span className="h-px w-8 bg-flame" />
              OUR PHILOSOPHY
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="headline-xl mt-5 text-4xl text-bone sm:text-5xl md:text-6xl">
              {settings?.aboutTitle ?? "BUILT DIFFERENT, ON PURPOSE"}
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-7 max-w-xl text-sm leading-8 text-ash sm:text-base">
              {settings?.aboutBody ??
                "BR FITNESS started with one idea: a gym that treats training like a craft."}
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { value: stats.members, suffix: "+", label: "MEMBERS" },
              { value: stats.classesRun, suffix: "+", label: "CLASSES" },
              { value: stats.rating, suffix: "★", label: "RATING" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={0.2 + i * 0.08}>
                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="font-data text-2xl font-semibold text-lime sm:text-3xl">
                    <Counter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="micro-label mt-1 text-[9px]!">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {(branches ?? []).slice(0, 3).map((b) => (
                  <span
                    key={b._id}
                    className="grid size-9 place-items-center rounded-full border-2 border-carbon bg-graphite font-data text-[10px] font-semibold text-lime"
                    title={b.name}
                  >
                    {b.area.slice(0, 2).toUpperCase()}
                  </span>
                ))}
              </div>
              <p className="text-xs text-ash">
                One standard across{" "}
                <span className="font-data text-bone">{stats.locations}</span>{" "}
                clubs
              </p>
            </div>
          </Reveal>
        </div>

        {/* Visual collage */}
        <div className="relative">
          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-2xl border border-white/10">
              <SmartImage
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1400&auto=format&fit=crop"
                className="aspect-[4/5] w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-carbon/80 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5">
                <p className="font-display text-2xl font-semibold text-bone">
                  THE STANDARD
                </p>
                <p className="font-data text-xs text-lime">
                  EST. 2024 — THREE CLUBS
                </p>
              </div>
            </div>
          </Reveal>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="absolute -bottom-8 -left-4 w-44 overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/50 sm:-left-8"
          >
            <SmartImage
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop"
              className="aspect-square w-full"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="glass absolute -right-3 top-8 rounded-xl px-5 py-4 sm:-right-6"
          >
            <p className="font-data text-2xl font-semibold text-flame">
              <Counter value={6} suffix="+" />
            </p>
            <p className="micro-label mt-1 text-[9px]!">ELITE COACHES</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
