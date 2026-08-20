import { api } from "@/convex/_generated/api";
import { isOfferLive, OfferTag } from "@/components/site/offers";
import { Magnetic, Reveal, SectionHeader } from "@/components/site/ui";
import { useQuery } from "convex/react";
import { Check, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";

export function Pricing() {
  const plans = useQuery(api.content.listPlans);
  const offers = useQuery(api.content.listOffers);
  const [annual, setAnnual] = useState(true);
  const navigate = useNavigate();

  const featuredOffer = useMemo(
    () =>
      (offers ?? []).find(
        (o) => o.featured && o.type === "sitewide" && isOfferLive(o),
      ),
    [offers],
  );

  return (
    <section id="pricing" className="relative overflow-hidden bg-graphite py-24 sm:py-32">
      <div className="absolute inset-0 bg-mesh-lime opacity-50" />
      <span className="pointer-events-none absolute -left-6 top-0 select-none font-display text-[9rem] font-bold uppercase leading-none text-white/[0.03] sm:text-[13rem]">
        MEMBER
      </span>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          align="center"
          eyebrow="MEMBERSHIP"
          title={
            <>
              PICK YOUR
              <span className="text-lime"> LEVEL</span>
            </>
          }
          description="No joining fees. No contracts. Cancel anytime from the app."
        />

        {featuredOffer && (
          <Reveal delay={0.1}>
            <div className="mx-auto mt-8 flex max-w-xl flex-col items-center justify-between gap-3 rounded-xl border border-lime/30 bg-lime/5 p-4 sm:flex-row">
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 shrink-0 text-lime" />
                <div>
                  <p className="font-data text-sm font-semibold text-lime">
                    {featuredOffer.title}
                  </p>
                  <p className="text-xs text-ash">{featuredOffer.description}</p>
                </div>
              </div>
              <OfferTag offer={featuredOffer} />
            </div>
          </Reveal>
        )}

        {/* Billing toggle */}
        <Reveal delay={0.15}>
          <div className="mt-10 flex items-center justify-center gap-4">
            <span
              className={cn(
                "font-data text-sm",
                !annual ? "text-bone" : "text-ash",
              )}
            >
              MONTHLY
            </span>
            <button
              role="switch"
              aria-checked={annual}
              aria-label="Toggle annual billing"
              onClick={() => setAnnual((a) => !a)}
              className={cn(
                "relative h-7 w-14 rounded-full border transition-colors",
                annual ? "border-lime/60 bg-lime/20" : "border-white/15 bg-white/5",
              )}
            >
              <span
                className={cn(
                  "absolute top-1 size-5 rounded-full transition-all",
                  annual
                    ? "left-8 bg-lime"
                    : "left-1 bg-ash",
                )}
              />
            </button>
            <span
              className={cn(
                "font-data text-sm",
                annual ? "text-bone" : "text-ash",
              )}
            >
              ANNUAL
              <span className="ml-2 rounded-full bg-flame/15 px-2 py-0.5 text-[10px] font-semibold text-flame">
                SAVE ~17%
              </span>
            </span>
          </div>
        </Reveal>

        {/* Plans */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {!plans &&
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[480px] animate-pulse rounded-2xl border border-white/8 bg-white/[0.04]"
              />
            ))}
          {(plans ?? []).map((p, i) => {
            const price = annual ? p.priceAnnual : p.priceMonthly;
            const per = annual ? "/yr" : "/mo";
            return (
              <Reveal key={p._id} delay={0.08 + i * 0.08}>
                <div
                  className={cn(
                    "group relative flex h-full flex-col rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1.5",
                    p.popular
                      ? "border-lime/60 bg-lime/[0.06] hover:glow-lime"
                      : "border-white/10 bg-carbon/70 hover:border-white/25",
                  )}
                >
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime px-4 py-1 font-data text-[10px] font-bold uppercase tracking-widest text-carbon glow-lime">
                      Most Popular
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="headline-xl text-2xl text-bone">{p.name}</h3>
                    <span className="micro-label text-[9px]!">
                      {p.tagline}
                    </span>
                  </div>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="font-data text-4xl font-semibold text-bone">
                      ${price}
                    </span>
                    <span className="font-data text-sm text-ash">{per}</span>
                  </div>
                  {annual && (
                    <p className="mt-1 font-data text-xs text-lime">
                      ${p.priceMonthly}/mo if paid monthly
                    </p>
                  )}

                  <ul className="mt-7 flex-1 space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-bone/85">
                        <span
                          className={cn(
                            "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full",
                            p.popular ? "bg-lime text-carbon" : "bg-white/10 text-lime",
                          )}
                        >
                          <Check className="size-3" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Magnetic strength={0.15} className="mt-8 w-full">
                    <button
                      onClick={() => navigate("/auth")}
                      className={cn(
                        "w-full rounded-lg py-3 font-semibold transition-all",
                        p.popular
                          ? "bg-lime text-carbon hover:bg-lime/90 glow-lime"
                          : "border border-white/15 text-bone hover:border-lime/50 hover:text-lime",
                      )}
                    >
                      Start Free Trial
                    </button>
                  </Magnetic>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.25}>
          <p className="mt-10 text-center text-xs text-ash">
            All plans include a{" "}
            <span className="font-data text-lime">7-day money-back guarantee</span>{" "}
            — train on us first, decide later.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
