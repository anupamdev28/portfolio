import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { BookTourButton } from "@/components/site/BookTourDialog";
import { Logo } from "@/components/site/Logo";
import { Counter, SmartImage } from "@/components/site/ui";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  CalendarCheck,
  Dumbbell,
  Flame,
  LogOut,
  MapPin,
  Shield,
  Sparkles,
  Target,
  Trophy,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-ash/15 text-ash",
  confirmed: "bg-lime/15 text-lime",
  cancelled: "bg-flame/15 text-flame",
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const branches = useQuery(api.content.listBranches);
  const plans = useQuery(api.content.listPlans);
  const bookings = useQuery(api.bookings.myBookings);
  const cancelBooking = useMutation(api.bookings.cancelBooking);

  const staff = user?.role === "admin" || user?.role === "branch_manager";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleCancel = async (id: Id<"bookings">) => {
    try {
      await cancelBooking({ id });
      toast.success("Booking cancelled.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel.");
    }
  };

  const branchName = (id: string) =>
    branches?.find((b) => b._id === id)?.name ?? "BR FITNESS";

  return (
    <div className="min-h-screen bg-carbon">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-carbon/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Logo />
            <span className="hidden rounded-full bg-lime/10 px-3 py-1 font-data text-[10px] font-semibold uppercase tracking-widest text-lime sm:block">
              Member Hub
            </span>
          </div>
          <div className="flex items-center gap-2">
            {staff && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-lime/30 text-lime hover:bg-lime/10"
                onClick={() => navigate("/admin")}
              >
                <Shield className="size-3.5" />
                Admin
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-ash hover:text-flame"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="flex flex-col gap-2">
          <p className="micro-label text-lime">WELCOME BACK</p>
          <h1 className="headline-xl text-4xl text-bone sm:text-5xl">
            {user?.name ? `LET'S GO, ${user.name.split(" ")[0].toUpperCase()}` : "LET'S GO"}
          </h1>
          <p className="text-sm text-ash">
            Your membership hub — book visits, track bookings and pick a plan.
          </p>
        </div>

        {/* Stat cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Flame, label: "DAY STREAK", value: 12, suffix: " days", tint: "text-flame" },
            { icon: CalendarCheck, label: "UPCOMING BOOKINGS", value: bookings?.filter((b) => b.status !== "cancelled").length ?? 0, suffix: "", tint: "text-lime" },
            { icon: Trophy, label: "GOAL PROGRESS", value: 68, suffix: "%", tint: "text-volt" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/8 bg-graphite p-5"
            >
              <div className="flex items-center justify-between">
                <s.icon className={cn("size-5", s.tint)} />
                <span className="micro-label text-[9px]!">{s.label}</span>
              </div>
              <p className="mt-4 font-data text-3xl font-semibold text-bone">
                <Counter value={s.value} suffix={s.suffix} />
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-5">
          {/* Book a visit */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-lime/20 bg-mesh-lime p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="micro-label text-lime">FIRST SESSION ON US</p>
                  <h2 className="headline-xl mt-2 text-2xl text-bone sm:text-3xl">
                    BOOK YOUR FREE VISIT
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-ash">
                    Pick a branch and a date. A coach will tour you through the
                    floor and set you up with a free trial workout.
                  </p>
                </div>
                <Sparkles className="hidden size-12 text-lime/40 sm:block" />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {!branches &&
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-32 animate-pulse rounded-xl border border-white/8 bg-white/[0.04]" />
                  ))}
                {(branches ?? []).map((b) => (
                  <div
                    key={b._id}
                    className="group flex items-center gap-3 rounded-xl border border-white/10 bg-carbon/60 p-3.5 transition-all hover:border-lime/50"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                      <SmartImage src={b.coverPhoto} className="h-full w-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-bone">
                        {b.name}
                      </p>
                      <p className="flex items-center gap-1 truncate text-[11px] text-ash">
                        <MapPin className="size-3 shrink-0 text-lime/60" />
                        {b.area} · {b.phone}
                      </p>
                    </div>
                    <BookTourButton
                      branch={b}
                      label="Book"
                      size="sm"
                      className="shrink-0 bg-lime text-carbon hover:bg-lime/90"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming bookings */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="headline-xl text-xl text-bone sm:text-2xl">
                  YOUR BOOKINGS
                </h2>
                <span className="micro-label text-[9px]!">
                  {bookings?.filter((b) => b.status !== "cancelled").length ?? 0} ACTIVE
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {!bookings &&
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-xl border border-white/8 bg-white/[0.04]" />
                  ))}
                {bookings && bookings.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/15 p-8 text-center">
                    <CalendarCheck className="mx-auto size-8 text-ash/50" />
                    <p className="mt-3 text-sm text-ash">
                      No bookings yet — book your free visit above.
                    </p>
                  </div>
                )}
                {bookings
                  ?.filter((b) => b.status !== "cancelled")
                  .map((b) => (
                    <div
                      key={b._id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/8 bg-graphite p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="grid size-11 place-items-center rounded-lg bg-lime/10">
                          <CalendarCheck className="size-5 text-lime" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-bone">
                            {b.type === "tour" ? "Guided Tour" : b.type === "trial" ? "Free Trial Session" : "Class"} · {branchName(b.branchId)}
                          </p>
                          <p className="font-data text-xs text-ash">
                            {new Date(b.date).toLocaleDateString(undefined, {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 font-data text-[10px] font-semibold uppercase tracking-wider",
                            STATUS_STYLES[b.status],
                          )}
                        >
                          {b.status}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Cancel booking"
                          onClick={() => handleCancel(b._id)}
                          className="text-ash hover:text-flame"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Sidebar: plans + goals */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="rounded-2xl border border-white/8 bg-graphite p-6">
              <p className="micro-label flex items-center gap-2">
                <Target className="size-3.5 text-lime" />
                YOUR GOALS
              </p>
              <div className="mt-4 space-y-4">
                {[
                  { label: "Sessions this week", done: 3, total: 4 },
                  { label: "Strength training", done: 2, total: 3 },
                  { label: "Mobility & recovery", done: 1, total: 2 },
                ].map((g) => (
                  <div key={g.label}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-bone/85">{g.label}</span>
                      <span className="font-data text-ash">
                        {g.done}/{g.total}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-lime"
                        style={{ width: `${(g.done / g.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-graphite p-6">
              <p className="micro-label flex items-center gap-2">
                <Dumbbell className="size-3.5 text-lime" />
                MEMBERSHIP
              </p>
              <p className="mt-3 text-sm text-ash">
                {plans && plans.length > 0
                  ? `From $${plans[0].priceMonthly}/mo — no joining fees, cancel anytime.`
                  : "Compare plans and pick your level."}
              </p>
              <Button
                variant="outline"
                className="mt-4 w-full gap-2 border-white/15 text-bone hover:border-lime/50 hover:text-lime"
                onClick={() => navigate("/#pricing")}
              >
                Compare Plans
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="ghost"
                className="mt-2 w-full gap-2 text-ash hover:text-bone"
                onClick={() => navigate("/#branches")}
              >
                <MapPin className="size-4" />
                Find a Branch
              </Button>
            </div>

            <div className="rounded-2xl border border-flame/20 bg-flame/[0.05] p-6">
              <p className="micro-label text-flame">REFER A FRIEND</p>
              <p className="mt-2 text-sm text-bone/85">
                Get a free month for every friend who joins. Your code:
              </p>
              <p className="mt-3 rounded-lg border border-dashed border-flame/40 bg-carbon px-4 py-2.5 text-center font-data text-lg font-semibold tracking-[0.3em] text-flame">
                BR-{user?._id.slice(0, 4).toUpperCase() ?? "JOIN"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
