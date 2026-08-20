import { api } from "@/convex/_generated/api";
import { BookTourButton } from "@/components/site/BookTourDialog";
import { hoursLabel, isOpenNow, todayHours } from "@/components/site/branchUtils";
import { Countdown, isOfferLive, OfferTag } from "@/components/site/offers";
import { Reveal, SectionHeader, SmartImage } from "@/components/site/ui";
import { useQuery } from "convex/react";
import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";

export function Branches() {
  const branches = useQuery(api.content.listBranches);
  const offers = useQuery(api.content.listOffers);
  const navigate = useNavigate();

  const liveOffersFor = (branchId: string) =>
    (offers ?? []).filter(
      (o) => o.type === "branch" && o.branchId === branchId && isOfferLive(o),
    );

  return (
    <section id="branches" className="relative overflow-hidden bg-carbon py-24 sm:py-32">
      <span className="pointer-events-none absolute -right-8 bottom-0 select-none font-display text-[9rem] font-bold uppercase leading-none text-white/[0.03] sm:text-[14rem]">
        THREE
      </span>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="OUR BRANCHES"
          title={
            <>
              THREE CLUBS.
              <br />
              <span className="text-lime">ONE STANDARD.</span>
            </>
          }
          description="Pick the floor closest to you — each branch has its own personality, amenities and offers. Details are live from the club management system."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {!branches &&
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[540px] animate-pulse rounded-2xl border border-white/8 bg-white/[0.04]"
              />
            ))}
          {(branches ?? []).map((b, i) => {
            const liveOffers = liveOffersFor(b._id);
            const open = isOpenNow(b);
            const today = todayHours(b);
            return (
              <Reveal key={b._id} delay={0.08 + i * 0.1}>
                <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-graphite transition-all duration-300 hover:-translate-y-1.5 hover:border-lime/40 hover:shadow-2xl hover:shadow-black/50">
                  {/* Cover */}
                  <button
                    onClick={() => navigate(`/branch/${b._id}`)}
                    className="relative block aspect-[16/10] overflow-hidden text-left"
                    aria-label={`Explore ${b.name}`}
                  >
                    <SmartImage
                      src={b.coverPhoto}
                      className="h-full w-full"
                      imgClassName="group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-graphite via-graphite/20 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-carbon/85 px-3 py-1 font-data text-[10px] font-bold uppercase tracking-widest text-lime backdrop-blur">
                      {b.area}
                    </span>
                    <span
                      className={cn(
                        "absolute right-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1 font-data text-[10px] font-semibold backdrop-blur",
                        open
                          ? "bg-lime/15 text-lime"
                          : "bg-flame/15 text-flame",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          open ? "bg-lime animate-pulse-glow" : "bg-flame",
                        )}
                      />
                      {open ? "OPEN NOW" : "CLOSED"}
                    </span>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="micro-label text-[9px]! text-lime">
                        {b.tagline}
                      </p>
                      <h3 className="headline-xl mt-1 text-2xl text-bone">
                        {b.name}
                      </h3>
                    </div>
                  </button>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="flex items-start gap-2 text-xs leading-5 text-ash">
                      <MapPin className="mt-0.5 size-3.5 shrink-0 text-lime/70" />
                      {b.address}
                    </p>

                    {/* Branch-specific offer */}
                    {liveOffers.map((o) => (
                      <div
                        key={o._id}
                        className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-flame/25 bg-flame/[0.07] p-3"
                      >
                        <div className="min-w-0">
                          <p className="flex items-center gap-2">
                            <OfferTag offer={o} />
                          </p>
                          <p className="mt-1 truncate text-[11px] text-ash">
                            {o.title}
                          </p>
                        </div>
                        <Countdown expiry={o.expiryDate} compact className="text-flame" />
                      </div>
                    ))}

                    {/* Amenities */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {b.amenities.slice(0, 6).map((a) => (
                        <span
                          key={a}
                          className="rounded-full border border-white/10 px-2.5 py-0.5 font-data text-[10px] text-ash"
                        >
                          {a}
                        </span>
                      ))}
                      {b.amenities.length > 6 && (
                        <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-data text-[10px] text-ash">
                          +{b.amenities.length - 6} more
                        </span>
                      )}
                    </div>

                    {/* Hours + contact */}
                    <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4">
                      <span className="flex items-center gap-1.5 font-data text-[11px] text-ash">
                        <Clock className="size-3.5 text-lime/70" />
                        Today: {hoursLabel(today)}
                      </span>
                      <span className="flex items-center gap-1.5 font-data text-[11px] text-ash">
                        <Phone className="size-3.5 text-lime/70" />
                        {b.phone}
                      </span>
                    </div>

                    {/* CTAs */}
                    <div className="mt-5 flex gap-2.5">
                      <button
                        onClick={() => navigate(`/branch/${b._id}`)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/15 py-2.5 text-xs font-semibold text-bone transition-all hover:border-lime/50 hover:text-lime"
                      >
                        Explore Branch
                        <ArrowRight className="size-3.5" />
                      </button>
                      <BookTourButton
                        branch={b}
                        label="Book a Tour"
                        size="sm"
                        className="bg-lime text-carbon hover:bg-lime/90"
                      />
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
