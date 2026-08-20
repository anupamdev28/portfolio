import { api } from "@/convex/_generated/api";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Lock, LogOut, ShieldCheck, Sparkles } from "lucide-react";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Navigation items with role-based visibility
type NavItem = {
  to: string;
  label: string;
  end?: boolean;
  role?: "admin" | "franchise_admin" | null;
};

const NAV: NavItem[] = [
  { to: "/admin", label: "Overview", end: true, role: null },
  { to: "/admin/franchises", label: "Franchises", role: "admin" },
  { to: "/admin/franchise-admins", label: "Franchise Admins", role: "admin" },
  { to: "/admin/members", label: "Members", role: "admin" },
  { to: "/admin/plans", label: "Plans & Pricing", role: "admin" },
  { to: "/admin/settings", label: "Site Settings", role: "admin" },
  { to: "/admin/my-franchise", label: "My Franchise", role: "franchise_admin" },
  { to: "/admin/customers", label: "Customers", role: null },
  { to: "/admin/memberships", label: "Memberships", role: null },
  { to: "/admin/branches", label: "Branches", role: null },
  { to: "/admin/trainers", label: "Trainers", role: null },
  { to: "/admin/classes", label: "Classes", role: null },
  { to: "/admin/bookings", label: "Bookings", role: null },
  { to: "/admin/activity", label: "Activity Log", role: "admin" },
];

function filterNavByRole(
  nav: NavItem[],
  role: string | null | undefined,
): NavItem[] {
  return nav.filter((item) => {
    if (item.role === null) return true;
    if (item.role === "admin")
      return role === "admin" || role === "admin";
    if (item.role === "franchise_admin") return role === "franchise_admin";
    return false;
  });
}

export function AdminLayout() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const myRole = useQuery(api.adminContent.myRole);
  const adminExists = useQuery(api.content.adminExists);
  const claim = useMutation(api.adminContent.claimAdminByEmail);
  const navigate = useNavigate();

  if (isLoading || myRole === undefined || adminExists === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-carbon">
        <Loader2 className="size-6 animate-spin text-lime" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth?returnTo=%2Fadmin" replace />;
  }

  const role = myRole.role;
  const isSuperAdmin = role === "admin" || role === "admin";
  const isFranchiseAdmin = role === "franchise_admin";
  const isStaff = isSuperAdmin || isFranchiseAdmin || role === "branch_manager";

  if (!isStaff) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-carbon px-6 text-center">
        <div className="grid size-16 place-items-center rounded-2xl border border-white/10 bg-graphite">
          <Lock className="size-7 text-flame" />
        </div>
        <div>
          <h1 className="headline-xl text-3xl text-bone">STAFF ACCESS ONLY</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-ash">
            {adminExists
              ? "Your account does not have staff permissions. Ask a Super Admin to promote you, then refresh."
              : user?.email === "devraj31436@gmail.com"
                ? "Claim your Super Admin account to start managing BR FITNESS."
                : "This account is not authorized for admin access."}
          </p>
        </div>
        {!adminExists && user?.email === "devraj31436@gmail.com" ? (
          <Button
            className="gap-2 bg-lime text-carbon hover:bg-lime/90 glow-lime"
            onClick={async () => {
              try {
                await claim();
                toast.success("Welcome — you are now Super Admin.");
                window.location.reload();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to claim.");
              }
            }}
          >
            <ShieldCheck className="size-4" />
            Claim Admin Account
          </Button>
        ) : (
          <Button
            variant="outline"
            className="border-white/15 text-bone"
            onClick={() => navigate("/")}
          >
            Back to site
          </Button>
        )}
      </div>
    );
  }

  const navItems = filterNavByRole(NAV, role);
  const roleBadge = isSuperAdmin
    ? "Super Admin"
    : isFranchiseAdmin
      ? "Franchise Admin"
      : "Branch Mgr";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-carbon">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-white/8 bg-graphite/60 backdrop-blur lg:flex">
        <div className="flex h-16 items-center border-b border-white/8 px-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  "block rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-lime/10 text-lime"
                    : "text-ash hover:bg-white/5 hover:text-bone",
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/8 p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-lime/15 font-display text-xs font-bold text-lime">
              {(user?.name ?? "A").slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-bone">
                {user?.name ?? "Staff"}
              </p>
              <p className="font-data text-[10px] text-lime">{roleBadge}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              onClick={handleSignOut}
              className="text-ash hover:text-flame"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-carbon/90 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Logo compact />
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-lime/10 px-2.5 py-1 font-data text-[9px] font-semibold uppercase text-lime">
              {roleBadge}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              onClick={handleSignOut}
              className="text-ash"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pb-2">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium",
                  isActive
                    ? "border-lime/60 bg-lime/10 text-lime"
                    : "border-white/10 text-ash",
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-8 sm:px-6 lg:ml-60 lg:px-10">
        <Outlet />
      </main>

      {/* Mobile floating admin badge */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-30 flex items-center gap-2 rounded-full border border-lime/30 bg-carbon/90 px-3 py-1.5 font-data text-[10px] uppercase tracking-widest text-lime shadow-lg backdrop-blur lg:hidden">
        <Sparkles className="size-3" />
        {roleBadge}
      </div>
    </div>
  );
}

export default AdminLayout;
