import { api } from "@/convex/_generated/api";
import { BookTourButton } from "@/components/site/BookTourDialog";
import { Reveal, SectionHeader } from "@/components/site/ui";
import { useQuery } from "convex/react";
import { CalendarDays, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function Schedule() {
  const classes = useQuery(api.content.listClasses);
  const branches = useQuery(api.content.listBranches);
  const trainers = useQuery(api.content.listTrainers);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const [day, setDay] = useState(DAY_ORDER.includes(today) ? today : "Monday");
  const [branchFilter, setBranchFilter] = useState<string>("all");

  const branchName = (id: string) =>
    branches?.find((b) => b._id === id)?.name ?? "BR FITNESS";
  const trainerName = (id?: string) =>
    trainers?.find((t) => t._id === id)?.name ?? "Staff Coach";

  const dayClasses = useMemo(() => {
    const list = (classes ?? []).filter(
      (c) =>
        c.day === day &&
        (branchFilter === "all" || c.branchId === branchFilter),
    );
    return list.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [classes, day, branchFilter]);

  const dayNumber = DAY_ORDER.indexOf(day);

  return (
    <section
      id="schedule"
      className="relative overflow-hidden bg-graphite py-24 sm:py-32"
    >
      <span className="pointer-events-none absolute -right-6 top-8 select-none font-display text-[9rem] font-bold uppercase leading-none text-white/[0.03] sm:text-[13rem]">
        TIMETABLE
      </span>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="THIS WEEK'S TIMETABLE"
          title={
            <>
              PICK A DAY.
              <br />
              <span className="text-volt">SHOW UP.</span>
            </>
          }
          description="Live availability straight from the club floor. Bookings fill fast — grab your spot."
        />

        {/* Day tabs */}
        <Reveal delay={0.1}>
          <div className="mt-10 flex gap-2 overflow-x-auto pb-2">
            {DAY_ORDER.map((d, i) => (
              <button
                key={d}
                onClick={() => setDay(d)}
                className={cn(
                  "flex shrink-0 flex-col items-center rounded-lg border px-4 py-2.5 transition-all",
                  day === d
                    ? "border-lime/60 bg-lime/10 text-lime"
                    : "border-white/8 bg-white/[0.03] text-ash hover:border-white/20 hover:text-bone",
                )}
              >
                <span className="font-data text-[10px] uppercase">
                  {d.slice(0, 3)}
                </span>
                <span
                  className={cn(
                    "font-data text-xs",
                    i === dayNumber && day !== d && "text-lime/60",
                  )}
                >
                  {i + 1}
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Branch filter */}
        <Reveal delay={0.15}>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setBranchFilter("all")}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-medium transition-all",
                branchFilter === "all"
                  ? "border-lime/60 bg-lime/10 text-lime"
                  : "border-white/10 text-ash hover:text-bone",
              )}
            >
              All branches
            </button>
            {(branches ?? []).map((b) => (
              <button
                key={b._id}
                onClick={() => setBranchFilter(b._id)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-medium transition-all",
                  branchFilter === b._id
                    ? "border-lime/60 bg-lime/10 text-lime"
                    : "border-white/10 text-ash hover:text-bone",
                )}
              >
                {b.area}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Class list */}
        <div className="mt-8 space-y-3">
          {!classes && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl border border-white/8 bg-white/[0.04]"
                />
              ))}
            </div>
          )}
          {classes &&
            dayClasses.map((c, i) => {
              const spotsLeft = c.capacity - c.booked;
              const full = spotsLeft <= 0;
              const branch = branches?.find((b) => b._id === c.branchId);
              return (
                <Reveal key={c._id} delay={i * 0.04}>
                  <div className="group flex flex-col gap-4 rounded-xl border border-white/8 bg-carbon/70 p-5 transition-all hover:border-lime/30 sm:flex-row sm:items-center">
                    <div className="flex w-28 shrink-0 flex-col">
                      <span className="font-data text-xl font-semibold text-bone">
                        {c.startTime}
                      </span>
                      <span className="font-data text-xs text-ash">
                        → {c.endTime}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-lg font-semibold uppercase text-bone">
                          {c.name}
                        </h3>
                        <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-data text-[10px] font-medium uppercase tracking-wider text-lime">
                          {c.type}
                        </span>
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ash">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="size-3 text-ash/60" />
                          {branchName(c.branchId)} · {c.room}
                        </span>
                        <span>Coach: {trainerName(c.trainerId)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-28">
                        <p
                          className={cn(
                            "font-data text-xs font-semibold",
                            full
                              ? "text-flame"
                              : spotsLeft <= 3
                                ? "text-flame"
                                : "text-lime",
                          )}
                        >
                          {full
                            ? "FULL"
                            : `${spotsLeft} SPOT${spotsLeft === 1 ? "" : "S"} LEFT`}
                        </p>
                        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              full
                                ? "bg-flame"
                                : spotsLeft <= 3
                                  ? "bg-flame"
                                  : "bg-lime",
                            )}
                            style={{
                              width: `${Math.min(100, (c.booked / c.capacity) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      {branch ? (
                        <BookTourButton
                          branch={branch}
                          label={full ? "Waitlist" : "Book"}
                          size="sm"
                          variant={full ? "outline" : "default"}
                          className={full ? "text-flame" : ""}
                        />
                      ) : (
                        <CalendarDays className="size-4 text-ash" />
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          {classes && dayClasses.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/15 p-10 text-center">
              <p className="font-data text-sm text-ash">
                No classes on {day} at the selected branch — check another day
                or branch.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
