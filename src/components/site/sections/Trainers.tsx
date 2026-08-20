import { api } from "@/convex/_generated/api";
import { BookTourButton } from "@/components/site/BookTourDialog";
import { Reveal, SectionHeader, SmartImage } from "@/components/site/ui";
import { useQuery } from "convex/react";
import { Instagram } from "lucide-react";

export function Trainers() {
  const trainers = useQuery(api.content.listTrainers);
  const branches = useQuery(api.content.listBranches);

  const branchFor = (id?: string) =>
    branches?.find((b) => b._id === id);

  return (
    <section id="trainers" className="relative bg-carbon py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="THE COACHES"
          title={
            <>
              COACHED, NOT
              <br />
              <span className="text-lime">JUST SUPERVISED</span>
            </>
          }
          description="Every BR coach is certified, experienced and accountable for your progress — from first session to new PR."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {!trainers &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[420px] animate-pulse rounded-2xl border border-white/8 bg-white/[0.04]"
              />
            ))}
          {(trainers ?? []).map((t, i) => {
            const branch = branchFor(t.branchId);
            return (
              <Reveal key={t._id} delay={0.05 + i * 0.06}>
                <div className="group overflow-hidden rounded-2xl border border-white/8 bg-graphite transition-all duration-300 hover:-translate-y-1.5 hover:border-lime/40">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <SmartImage src={t.photo} className="h-full w-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-graphite via-transparent to-transparent" />
                    {branch && (
                      <span className="absolute left-3 top-3 rounded-full bg-carbon/80 px-3 py-1 font-data text-[10px] font-semibold uppercase tracking-wider text-lime backdrop-blur">
                        {branch.area}
                      </span>
                    )}
                    {t.socials?.instagram && (
                      <a
                        href={t.socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${t.name} on Instagram`}
                        className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-carbon/80 text-bone backdrop-blur transition-colors hover:text-lime"
                      >
                        <Instagram className="size-4" />
                      </a>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-lg font-semibold uppercase text-bone">
                          {t.name}
                        </h3>
                        <p className="mt-0.5 text-xs font-medium text-flame">
                          {t.role}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-3 text-xs leading-5 text-ash">
                      {t.bio}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {t.specialties.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-white/10 px-2.5 py-0.5 font-data text-[10px] text-ash"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    {branch && (
                      <div className="mt-5">
                        <BookTourButton
                          branch={branch}
                          label="Book 1:1 Session"
                          size="sm"
                          variant="outline"
                          className="w-full border-white/15 text-bone hover:border-lime/50 hover:text-lime"
                        />
                      </div>
                    )}
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
