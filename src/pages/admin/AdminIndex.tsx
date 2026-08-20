import { api } from "@/convex/_generated/api";
import { PageHeader, StatCard } from "./admin-ui";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { ArrowRight, Database } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AdminIndex() {
  const navigate = useNavigate();
  const myRole = useQuery(api.adminContent.myRole);
  const branches = useQuery(api.content.listAllBranches);
  const plans = useQuery(api.content.listAllPlans);
  const trainers = useQuery(api.content.listAllTrainers);
  const classes = useQuery(api.content.listAllClasses);
  const bookings = useQuery(api.adminContent.listBookings);

  const role = myRole?.role;
  const isSuperAdmin = role === "admin";
  const isFranchiseAdmin = role === "franchise_admin";

  const superStats = useQuery(
    api.franchiseAdmin.getSuperAdminDashboardStats,
    isSuperAdmin ? undefined : "skip",
  );

  const franchiseStats = useQuery(
    api.franchiseAdmin.getFranchiseDashboardStats,
    isFranchiseAdmin ? undefined : "skip",
  );

  const seedData = useMutation(api.franchiseAdmin.seedFranchiseData);
  const [seeding, setSeeding] = useState(false);

  const pendingBookings = bookings?.filter((b) => b.status === "pending").length ?? 0;

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await seedData();
      if (result.seeded) {
        toast.success(`Seeded ${result.franchises} franchises, ${result.customers} customers, ${result.memberships} memberships.`);
        if (result.note) toast.info(result.note);
      } else {
        toast.info(result.reason ?? "Already seeded.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Seed failed.");
    } finally {
      setSeeding(false);
    }
  };

  // Super Admin Dashboard
  if (isSuperAdmin) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader title="Brand Control Room" description="Global overview of all BR FITNESS franchises, customers and performance." />

        {/* Seed button */}
        <div className="rounded-2xl border border-lime/20 bg-lime/5 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-bone">Seed Test Data</p>
              <p className="text-xs text-ash">Creates 2 franchises (Delhi &amp; Mumbai) with 30 test customers and auto-assigns franchise admins.</p>
            </div>
            <Button onClick={handleSeed} disabled={seeding} className="gap-2 bg-lime text-carbon hover:bg-lime/90">
              <Database className="size-4" />
              {seeding ? "Seeding..." : "Seed Data"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="FRANCHISES" value={superStats?.totalFranchises ?? "—"} />
          <StatCard label="TOTAL CUSTOMERS" value={superStats?.totalCustomers ?? "—"} tint="text-volt" />
          <StatCard label="ACTIVE CUSTOMERS" value={superStats?.activeCustomers ?? "—"} tint="text-lime" />
          <StatCard label="EXPIRED" value={superStats?.expiredCustomers ?? "—"} tint="text-flame" />
          <StatCard label="NEW THIS MONTH" value={superStats?.newCustomersThisMonth ?? "—"} />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="ACTIVE MEMBERSHIPS" value={superStats?.activeMemberships ?? "—"} tint="text-lime" />
          <StatCard label="EXPIRED MEMBERSHIPS" value={superStats?.expiredMemberships ?? "—"} tint="text-flame" />
          <StatCard label="PENDING BOOKINGS" value={pendingBookings} tint="text-volt" />
        </div>

        {superStats && superStats.franchiseStats.length > 0 && (
          <div className="rounded-2xl border border-white/8 bg-graphite p-6">
            <p className="micro-label mb-4 text-[10px]!">FRANCHISE PERFORMANCE</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-ash">
                    <th className="pb-2 pr-4">Franchise</th>
                    <th className="pb-2 pr-4">City</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4 text-right">Total</th>
                    <th className="pb-2 pr-4 text-right">Active</th>
                    <th className="pb-2 text-right">New (30d)</th>
                  </tr>
                </thead>
                <tbody>
                  {superStats.franchiseStats.map((f) => (
                    <tr key={f.franchiseId} className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5" onClick={() => navigate(`/admin/franchises/${f.franchiseId}`)}>
                      <td className="py-2.5 pr-4 font-semibold text-bone">{f.name}</td>
                      <td className="py-2.5 pr-4 text-ash">{f.city}</td>
                      <td className="py-2.5 pr-4">
                        <span className={cn("rounded-full px-2 py-0.5 font-data text-[9px] font-bold uppercase", f.status === "active" ? "bg-lime/15 text-lime" : f.status === "suspended" ? "bg-flame/15 text-flame" : "bg-ash/15 text-ash")}>{f.status}</span>
                      </td>
                      <td className="py-2.5 pr-4 text-right font-data text-bone">{f.totalCustomers}</td>
                      <td className="py-2.5 pr-4 text-right font-data text-lime">{f.activeCustomers}</td>
                      <td className="py-2.5 text-right font-data text-volt">{f.newThisMonth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-white/8 bg-graphite p-5">
          <p className="micro-label mb-4 text-[10px]!">QUICK ACTIONS</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { to: "/admin/franchises", label: "Manage Franchises", desc: "Add, edit, view all franchises" },
              { to: "/admin/franchise-admins", label: "Franchise Admins", desc: "Assign & manage franchise admins" },
              { to: "/admin/customers", label: "All Customers", desc: "View customers across all franchises" },
              { to: "/admin/memberships", label: "Memberships", desc: "Manage subscriptions & payments" },
            ].map((l) => (
              <button key={l.to} onClick={() => navigate(l.to)} className="group flex items-center justify-between rounded-xl border border-white/8 bg-carbon p-4 text-left transition-all hover:border-lime/40">
                <div><p className="text-sm font-semibold text-bone">{l.label}</p><p className="mt-0.5 text-xs text-ash">{l.desc}</p></div>
                <ArrowRight className="size-4 text-ash transition-transform group-hover:translate-x-0.5 group-hover:text-lime" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Franchise Admin Dashboard
  if (isFranchiseAdmin && franchiseStats) {
    const { franchise } = franchiseStats;
    return (
      <div className="flex flex-col gap-8">
        <PageHeader title={franchise.name} description={`${franchise.location} · ${franchise.city}, ${franchise.state} — Your franchise dashboard.`} />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="TOTAL CUSTOMERS" value={franchiseStats.totalCustomers} />
          <StatCard label="ACTIVE CUSTOMERS" value={franchiseStats.activeCustomers} tint="text-lime" />
          <StatCard label="EXPIRED" value={franchiseStats.expiredCustomers} tint="text-flame" />
          <StatCard label="NEW THIS MONTH" value={franchiseStats.newCustomersThisMonth} tint="text-volt" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="ACTIVE MEMBERSHIPS" value={franchiseStats.activeMemberships} />
          <StatCard label="EXPIRED" value={franchiseStats.expiredMemberships} tint="text-flame" />
          <StatCard label="EXPIRING SOON" value={franchiseStats.upcomingExpirations} tint="text-volt" />
          <StatCard label="NEW MEMBERSHIPS" value={franchiseStats.newMemberships} tint="text-lime" />
        </div>
        <div className="rounded-2xl border border-white/8 bg-graphite p-5">
          <p className="micro-label mb-4 text-[10px]!">QUICK ACTIONS</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { to: "/admin/customers", label: "My Customers", desc: "View & manage your customers" },
              { to: "/admin/memberships", label: "My Memberships", desc: "Manage subscriptions" },
              { to: "/admin/my-franchise", label: "Franchise Details", desc: "View franchise info & stats" },
            ].map((l) => (
              <button key={l.to} onClick={() => navigate(l.to)} className="group flex items-center justify-between rounded-xl border border-white/8 bg-carbon p-4 text-left transition-all hover:border-lime/40">
                <div><p className="text-sm font-semibold text-bone">{l.label}</p><p className="mt-0.5 text-xs text-ash">{l.desc}</p></div>
                <ArrowRight className="size-4 text-ash transition-transform group-hover:translate-x-0.5 group-hover:text-lime" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Branch Manager / Fallback
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Control Room" description="Live content management — every change publishes to the site instantly." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="BRANCHES" value={branches?.length ?? "—"} />
        <StatCard label="MEMBERSHIP PLANS" value={plans?.length ?? "—"} tint="text-volt" />
        <StatCard label="COACHES" value={trainers?.length ?? "—"} tint="text-flame" />
        <StatCard label="CLASSES / WEEK" value={classes?.length ?? "—"} />
      </div>
      <div className="rounded-2xl border border-white/8 bg-graphite p-5">
        <p className="micro-label mb-4 text-[10px]!">QUICK ACTIONS</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { to: "/admin/branches", label: "My Branch", desc: "Details, photos, hours" },
            { to: "/admin/classes", label: "Class Schedule", desc: "Timetable & capacity" },
            { to: "/admin/bookings", label: "Bookings", desc: "Tour & trial requests" },
          ].map((l) => (
            <button key={l.to} onClick={() => navigate(l.to)} className="group flex items-center justify-between rounded-xl border border-white/8 bg-carbon p-4 text-left transition-all hover:border-lime/40">
              <div><p className="text-sm font-semibold text-bone">{l.label}</p><p className="mt-0.5 text-xs text-ash">{l.desc}</p></div>
              <ArrowRight className="size-4 text-ash transition-transform group-hover:translate-x-0.5 group-hover:text-lime" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
