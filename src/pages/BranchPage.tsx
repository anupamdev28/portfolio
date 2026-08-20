import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { BookTourButton } from "@/components/site/BookTourDialog";
import { hoursLabel, isOpenNow, todayHours } from "@/components/site/branchUtils";
import { Footer } from "@/components/site/Footer";
import { Countdown, isOfferLive, OfferTag } from "@/components/site/offers";
import { Nav } from "@/components/site/Nav";
import { Reveal, SectionHeader, SmartImage } from "@/components/site/ui";
import { useQuery } from "convex/react";
import {
  ArrowLeft,
  Building2,
  Car,
  Clock,
  Coffee,
  CupSoda,
  Dumbbell,
  Flame,
  Flower2,
  HeartPulse,
  LayoutGrid,
  Lock,
  Mail,
  MapPin,
  Navigation,
  Phone,
  ShoppingBag,
  Snowflake,
  Swords,
  Target,
  Waves,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { cn } from "@/lib/utils";

const AMENITY_ICONS: Record<string, typeof Dumbbell> = {
  Pool: Waves,
  Sauna: Flame,
  Steam: Flame,
  Parking: Car,
  "Valet Parking": Car,
  Lockers: Lock,
  "24/7 Access": Clock,
  "Smoothie Bar": CupSoda,
  "Cold Plunge": Snowflake,
  "Boxing Ring": Swords,
  "Turf Zone": LayoutGrid,
  "Recovery Lounge": HeartPulse,
  "Glass Yoga Studio": Flower2,
  Yoga: Flower2,
  "Rooftop Terrace": Building2,
  Cafe: Coffee,
  "In-house Cafe": Coffee,
  "Pro Shop": ShoppingBag,
  "Heavy Bag Wall": Target,
};

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function BranchPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const branch = useQuery(
    api.content.getBranch,
    id ? ({ id: id as Id<"branches"> } as const) : "skip",
  );
  const trainers = useQuery(api.content.listTrainers);
  const classes = useQuery(api.content.listClasses);
  const offers = useQuery(api.content.listOffers);

  if (!branch) {
    return (
      <div className="min-h-screen bg-carbon">
        <Nav />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-24 w-full max-w-md animate-pulse rounded-2xl border border-white/8 bg-white/[0.04]" />
        </div>
        <Footer />
      </div>
    );
  }

  const liveOffers = (offers ?? []).filter(
    (o) => o.branchId === branch._id && isOfferLive(o),
  );
  const branchTrainers = (trainers ?? []).filter(
    (t) => t.branchId === branch._id,
  );
  const branchClasses = (classes ?? []).filter(
    (c) => c.branchId === branch._id,
  );
  const open = isOpenNow(branch);
  const todayIdx = (new Date().getDay() + 6) % 7;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${branch.lat},${branch.lng}`;

  return (
    <div className="min-h-screen bg-carbon">
      <Nav />

      {/* Hero */}
      <section className="relative flex min-h-[62vh] items-end overflow-hidden">
        <SmartImage src={branch.coverPhoto} className="absolute inset-0" imgClassName="scale-100!" />
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/50 to-carbon/20" />
        <div className="absolute inset-0 bg-grid opacity-30" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 pt-32 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="mb-6 flex items-center gap-2 text-xs text-ash transition-colors hover:text-lime"
          >
            <ArrowLeft className="size-3.5" />
            Back to all branches
          </button>

          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-lime px-3 py-1 font-data text-[10px] font-bold uppercase tracking-widest text-carbon">
                {branch.area}
              </span>
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 font-data text-[10px] font-semibold",
                  open ? "bg-lime/15 text-lime" : "bg-flame/15 text-flame",
                )}
              >
                <span className={cn("size-1.5 rounded-full", open ? "bg-lime animate-pulse-glow" : "bg-flame")} />
                {open ? "OPEN NOW" : "CLOSED NOW"}
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="headline-xl mt-4 text-5xl text-bone sm:text-6xl md:text-7xl">
              {branch.name}
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-3 max-w-xl font-data text-sm text-lime">
              {branch.tagline}
            </p>
          </Reveal>
          <Reveal delay={0.22}>
            <p className="mt-4 flex max-w-xl items-start gap-2 text-sm text-ash">
              <MapPin className="mt-0.5 size-4 shrink-0 text-lime/70" />
              {branch.address}
            </p>
          </Reveal>
          <Reveal delay={0.28}>
            <div className="mt-8 flex flex-wrap gap-3">
              <BookTourButton
                branch={branch}
                label="Book a Tour"
                size="lg"
                className="bg-lime text-carbon hover:bg-lime/90 glow-lime"
              />
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/20 px-6 text-sm font-semibold text-bone transition-all hover:border-lime/60 hover:text-lime"
              >
                <Navigation className="size-4" />
                Get Directions
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Offers */}
      {liveOffers.length > 0 && (
        <section className="relative border-y border-white/8 bg-graphite">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:px-8">
            {liveOffers.map((o) => (
              <div
                key={o._id}
                className="flex items-center justify-between gap-4 rounded-xl border border-flame/25 bg-flame/[0.06] p-5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <OfferTag offer={o} />
                  </div>
                  <p className="mt-2 font-display text-lg font-semibold uppercase text-bone">
                    {o.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-ash">
                    {o.description}
                  </p>
                </div>
                <div className="shrink-0 text-center">
                  <p className="micro-label text-[9px]! text-ash">ENDS IN</p>
                  <Countdown expiry={o.expiryDate} className="mt-2" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About + amenities */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeader
              eyebrow="ABOUT THIS CLUB"
              title={
                <>
                  THE <span className="text-lime">{branch.area}</span> STANDARD
                </>
              }
            />
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-xl text-sm leading-8 text-ash sm:text-base">
                {branch.description}
              </p>
            </Reveal>
            <Reveal delay={0.22}>
              <div className="mt-8 flex flex-wrap gap-2">
                {branch.amenities.map((a) => {
                  const Icon = AMENITY_ICONS[a] ?? Dumbbell;
                  return (
                    <span
                      key={a}
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-graphite px-3.5 py-1.5 font-data text-[11px] text-bone/85"
                    >
                      <Icon className="size-3.5 text-lime" />
                      {a}
                    </span>
                  );
                })}
              </div>
            </Reveal>
            <Reveal delay={0.28}>
              <div className="mt-8 flex flex-wrap gap-6 border-t border-white/8 pt-6">
                <a
                  href={`tel:${branch.phone}`}
                  className="flex items-center gap-2 text-sm text-ash transition-colors hover:text-lime"
                >
                  <Phone className="size-4 text-lime/70" />
                  {branch.phone}
                </a>
                <a
                  href={`mailto:${branch.email}`}
                  className="flex items-center gap-2 text-sm text-ash transition-colors hover:text-lime"
                >
                  <Mail className="size-4 text-lime/70" />
                  {branch.email}
                </a>
                {branch.whatsapp && (
                  <a
                    href={`https://wa.me/${branch.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-ash transition-colors hover:text-lime"
                  >
                    <span className="font-data text-lime/70">WA</span>
                    WhatsApp
                  </a>
                )}
              </div>
            </Reveal>
          </div>

          {/* Opening hours */}
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-white/8 bg-graphite p-6 sm:p-8">
              <p className="micro-label flex items-center gap-2">
                <Clock className="size-3.5 text-lime" />
                OPENING HOURS
              </p>
              <div className="mt-5 space-y-1">
                {DAY_ORDER.map((d, i) => {
                  const h = branch.hours.find((x) => x.day === d);
                  return (
                    <div
                      key={d}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2.5",
                        i === todayIdx
                          ? "bg-lime/10 text-lime"
                          : "text-ash",
                      )}
                    >
                      <span
                        className={cn(
                          "font-data text-sm",
                          i === todayIdx && "font-semibold",
                        )}
                      >
                        {d}
                        {i === todayIdx && (
                          <span className="ml-2 rounded bg-lime/20 px-1.5 py-0.5 text-[9px] font-bold uppercase">
                            Today
                          </span>
                        )}
                      </span>
                      <span className="font-data text-sm">
                        {h ? hoursLabel(h) : "--"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-graphite py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="GALLERY"
            title={
              <>
                INSIDE THE <span className="text-flame">{branch.area}</span> CLUB
              </>
            }
          />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(branch.photos ?? []).map((p, i) => (
              <Reveal key={p + i} delay={i * 0.05}>
                <div
                  className={cn(
                    "group overflow-hidden rounded-xl border border-white/8",
                    i === 0 && "col-span-2 row-span-2",
                  )}
                >
                  <SmartImage
                    src={p}
                    className={cn("w-full", i === 0 ? "h-full min-h-64" : "aspect-square")}
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trainers at this branch */}
      {branchTrainers.length > 0 && (
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="COACHES ON DUTY"
              title={
                <>
                  MEET THE <span className="text-lime">{branch.area}</span> TEAM
                </>
              }
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {branchTrainers.map((t, i) => (
                <Reveal key={t._id} delay={i * 0.06}>
                  <div className="flex gap-4 rounded-2xl border border-white/8 bg-graphite p-4 transition-all hover:border-lime/40">
                    <SmartImage
                      src={t.photo}
                      className="h-24 w-24 shrink-0 rounded-xl"
                    />
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-semibold uppercase text-bone">
                        {t.name}
                      </h3>
                      <p className="mt-0.5 text-xs font-medium text-flame">
                        {t.role}
                      </p>
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-ash">
                        {t.bio}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Schedule at this branch */}
      <section className="bg-graphite py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="CLASSES HERE"
            title={
              <>
                THIS WEEK AT{" "}
                <span className="text-volt">{branch.area.toUpperCase()}</span>
              </>
            }
          />
          <div className="mt-10 space-y-3">
            {DAY_ORDER.map((d) => {
              const dayClasses = branchClasses
                .filter((c) => c.day === d)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));
              if (dayClasses.length === 0) return null;
              return (
                <Reveal key={d}>
                  <div className="rounded-2xl border border-white/8 bg-carbon/60 p-5">
                    <p className="micro-label mb-4 text-[10px]! text-lime">
                      {d.toUpperCase()}
                    </p>
                    <div className="space-y-2.5">
                      {dayClasses.map((c) => {
                        const spots = c.capacity - c.booked;
                        const trainer = trainers?.find(
                          (t) => t._id === c.trainerId,
                        );
                        return (
                          <div
                            key={c._id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/6 bg-white/[0.02] px-4 py-3"
                          >
                            <div className="flex items-center gap-4">
                              <span className="w-20 font-data text-sm font-semibold text-bone">
                                {c.startTime}
                              </span>
                              <div>
                                <p className="text-sm font-medium text-bone">
                                  {c.name}
                                </p>
                                <p className="text-[11px] text-ash">
                                  {c.room} · {trainer?.name ?? "Staff Coach"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={cn(
                                  "font-data text-[11px] font-semibold",
                                  spots <= 0
                                    ? "text-flame"
                                    : spots <= 3
                                      ? "text-flame"
                                      : "text-lime",
                                )}
                              >
                                {spots <= 0
                                  ? "FULL"
                                  : `${spots} LEFT`}
                              </span>
                              <BookTourButton
                                branch={branch}
                                label={spots <= 0 ? "Waitlist" : "Book"}
                                size="sm"
                                variant={spots <= 0 ? "outline" : "default"}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-mesh-lime" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 text-center">
          <Reveal>
            <p className="micro-label text-lime">YOUR FIRST SESSION IS ON US</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="headline-xl mt-4 text-4xl text-bone sm:text-6xl">
              SEE THE FLOOR.
              <br />
              <span className="text-lime">FEEL THE CULTURE.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <BookTourButton
                branch={branch}
                label="Book a Free Tour"
                size="lg"
                className="bg-lime text-carbon hover:bg-lime/90 glow-lime"
              />
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/20 px-6 text-sm font-semibold text-bone transition-all hover:border-lime/60 hover:text-lime"
              >
                <Navigation className="size-4" />
                Get Directions
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
