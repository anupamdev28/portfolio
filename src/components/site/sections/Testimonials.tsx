import { api } from "@/convex/_generated/api";
import { Marquee, Reveal, SectionHeader, SmartImage, Stars } from "@/components/site/ui";
import { useQuery } from "convex/react";
import { Quote } from "lucide-react";

export function Testimonials() {
  const testimonials = useQuery(api.content.listTestimonials);
  const branches = useQuery(api.content.listBranches);

  const areaFor = (id?: string) =>
    branches?.find((b) => b._id === id)?.area ?? "";

  const cards = (testimonials ?? []).map((t) => (
    <figure
      key={t._id}
      className="mx-3 w-[340px] shrink-0 rounded-2xl border border-white/8 bg-graphite p-6 sm:w-[400px]"
    >
      <div className="flex items-center justify-between">
        <Stars rating={t.rating} />
        <Quote className="size-5 text-lime/40" />
      </div>
      <blockquote className="mt-4 text-sm leading-6 text-bone/85">
        “{t.text}”
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-white/8 pt-4">
        <span className="grid size-9 place-items-center rounded-full bg-lime/15 font-display text-sm font-bold text-lime">
          {t.name.slice(0, 1)}
        </span>
        <div>
          <p className="text-sm font-semibold text-bone">{t.name}</p>
          <p className="font-data text-[11px] text-ash">
            {areaFor(t.branchId) ? `Member · ${areaFor(t.branchId)}` : "Member"}
          </p>
        </div>
      </figcaption>
    </figure>
  ));

  return (
    <section id="testimonials" className="relative overflow-hidden bg-graphite py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          align="center"
          eyebrow="MEMBER RESULTS"
          title={
            <>
              REAL PEOPLE.
              <br />
              <span className="text-flame">REAL WORK.</span>
            </>
          }
          description="4.9★ across 1,200+ Google reviews. Here's what the crew says."
        />
      </div>

      <Reveal delay={0.15}>
        <div className="mt-14 space-y-5 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <Marquee duration={55}>
            {cards.length ? cards : (
              <div className="mx-3 h-40 w-[340px] animate-pulse rounded-2xl border border-white/8 bg-white/[0.04]" />
            )}
          </Marquee>
        </div>
      </Reveal>
    </section>
  );
}
