import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Edit,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AreaInput,
  BoolToggle,
  ConfirmDelete,
  EmptyState,
  LineInput,
  NumInput,
  PageHeader,
  SaveButton,
  SkeletonRows,
  StatCard,
} from "./admin-ui";

const FRANCHISE_STATUSES = ["active", "inactive", "suspended"] as const;
const MEMBERSHIP_STATUSES = ["active", "expired", "cancelled", "upcoming"] as const;
const PAYMENT_STATUSES = ["paid", "partial", "pending"] as const;

// ═════════════════════════════════════════════════════════════════════════════
// FRANCHISES MANAGEMENT — Super Admin
// ═════════════════════════════════════════════════════════════════════════════

export function FranchisesAdmin() {
  const franchises = useQuery(api.franchiseAdmin.listFranchises);
  const customers = useQuery(api.franchiseAdmin.listCustomers, {});
  const save = useMutation(api.franchiseAdmin.upsertFranchise);
  const remove = useMutation(api.franchiseAdmin.deleteFranchise);
  const navigate = useNavigate();
  const [editing, setEditing] = useState<Doc<"franchises"> | "new" | null>(
    null,
  );

  const getCustomerCount = (franchiseId: Id<"franchises">) =>
    customers?.filter((c) => c.franchiseId === franchiseId).length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Franchises"
        description="Manage all franchise locations. Each franchise has its own admin, customers and data."
        action={
          <Button
            className="gap-2 bg-lime text-carbon hover:bg-lime/90"
            onClick={() => setEditing("new")}
          >
            <Plus className="size-4" /> Add Franchise
          </Button>
        }
      />

      {!franchises && <SkeletonRows />}
      {franchises && franchises.length === 0 && (
        <EmptyState text="No franchises yet — add your first franchise." />
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {franchises?.map((f) => (
          <div
            key={f._id}
            className="flex flex-col rounded-2xl border border-white/8 bg-graphite p-5 transition-all hover:border-lime/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-base font-semibold uppercase text-bone">
                  {f.name}
                </p>
                <p className="mt-0.5 flex items-center gap-1 font-data text-[11px] text-ash">
                  <MapPin className="size-3" /> {f.city}, {f.state}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 font-data text-[9px] font-bold uppercase",
                  f.status === "active"
                    ? "bg-lime/15 text-lime"
                    : f.status === "suspended"
                      ? "bg-flame/15 text-flame"
                      : "bg-ash/15 text-ash",
                )}
              >
                {f.status}
              </span>
            </div>

            <div className="mt-3 space-y-1">
              <p className="flex items-center gap-1.5 font-data text-[10px] text-ash">
                <Users className="size-3" /> {getCustomerCount(f._id)} customers
              </p>
              <p className="flex items-center gap-1.5 font-data text-[10px] text-ash">
                <Phone className="size-3" /> {f.phone}
              </p>
              <p className="flex items-center gap-1.5 font-data text-[10px] text-ash">
                <Mail className="size-3" /> {f.email}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-white/8 pt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 border-white/15 text-bone hover:border-lime/50 hover:text-lime"
                onClick={() => navigate(`/admin/franchises/${f._id}`)}
              >
                <ArrowRight className="size-3.5" /> View Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-white/15 text-bone hover:border-lime/50 hover:text-lime"
                onClick={() => setEditing(f)}
              >
                <Edit className="size-3.5" /> Edit
              </Button>
              <ConfirmDelete
                onConfirm={async () => {
                  await remove({ id: f._id });
                  toast.success(`${f.name} deleted.`);
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto border-white/10 bg-graphite text-bone sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display uppercase">
              {editing === "new"
                ? "New Franchise"
                : `Edit ${(editing as Doc<"franchises">)?.name}`}
            </DialogTitle>
            <DialogDescription className="text-ash">
              Franchise details — this creates an isolated data partition.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <FranchiseForm
              key={editing === "new" ? "new" : editing._id}
              initial={editing === "new" ? null : editing}
              onSave={async (args) => {
                try {
                  await save(args as never);
                  toast.success("Franchise saved.");
                  setEditing(null);
                } catch (err) {
                  toast.error(
                    err instanceof Error ? err.message : "Save failed.",
                  );
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FranchiseForm({
  initial,
  onSave,
}: {
  initial: Doc<"franchises"> | null;
  onSave: (args: Record<string, unknown>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    location: initial?.location ?? "",
    address: initial?.address ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
    country: initial?.country ?? "India",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    ownerName: initial?.ownerName ?? "",
    status: (initial?.status ?? "active") as
      | "active"
      | "inactive"
      | "suspended",
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ id: initial?._id, ...form });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <LineInput
          label="Franchise name"
          value={form.name}
          onChange={(v) => set("name", v)}
          required
        />
        <LineInput
          label="Location / area"
          value={form.location}
          onChange={(v) => set("location", v)}
          required
        />
      </div>
      <LineInput
        label="Full address"
        value={form.address}
        onChange={(v) => set("address", v)}
        required
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <LineInput
          label="City"
          value={form.city}
          onChange={(v) => set("city", v)}
          required
        />
        <LineInput
          label="State"
          value={form.state}
          onChange={(v) => set("state", v)}
          required
        />
        <LineInput
          label="Country"
          value={form.country}
          onChange={(v) => set("country", v)}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <LineInput
          label="Phone"
          value={form.phone}
          onChange={(v) => set("phone", v)}
          required
        />
        <LineInput
          label="Email"
          value={form.email}
          onChange={(v) => set("email", v)}
          type="email"
          required
        />
        <LineInput
          label="Owner name"
          value={form.ownerName}
          onChange={(v) => set("ownerName", v)}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <p className="text-xs text-ash">STATUS</p>
        <Select
          value={form.status}
          onValueChange={(v) => set("status", v as typeof form.status)}
        >
          <SelectTrigger className="border-white/10 bg-carbon text-bone">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-graphite text-bone">
            {FRANCHISE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <SaveButton loading={saving} />
    </form>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// FRANCHISE DETAIL — Super Admin drill-down
// ═════════════════════════════════════════════════════════════════════════════

export function FranchiseDetailScreen({ franchiseId }: { franchiseId: string }) {
  const detail = useQuery(
    api.franchiseAdmin.getFranchiseDetail,
    { franchiseId: franchiseId as Id<"franchises"> },
  );

  if (!detail) return <SkeletonRows />;

  const { franchise, customers, totalCustomers, activeCustomers } = detail;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={franchise.name}
        description={`${franchise.city}, ${franchise.state} — ${franchise.address}`}
      />

      {/* Franchise Info */}
      <div className="rounded-2xl border border-white/8 bg-graphite p-6">
        <p className="micro-label mb-4 text-[10px]!">FRANCHISE INFORMATION</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="Name" value={franchise.name} />
          <InfoRow label="Location" value={franchise.location} />
          <InfoRow label="City" value={franchise.city} />
          <InfoRow label="State" value={franchise.state} />
          <InfoRow label="Country" value={franchise.country} />
          <InfoRow label="Owner" value={franchise.ownerName} />
          <InfoRow label="Phone" value={franchise.phone} />
          <InfoRow label="Email" value={franchise.email} />
          <InfoRow label="Status" value={franchise.status.toUpperCase()} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="TOTAL CUSTOMERS" value={totalCustomers} />
        <StatCard label="ACTIVE CUSTOMERS" value={activeCustomers} tint="text-lime" />
        <StatCard label="MEMBERSHIPS" value={detail.activeMemberships} tint="text-volt" />
        <StatCard label="NEW THIS MONTH" value={detail.newCustomersThisMonth} tint="text-flame" />
      </div>

      {/* Customer List */}
      <div className="rounded-2xl border border-white/8 bg-graphite p-6">
        <p className="micro-label mb-4 text-[10px]!">
          CUSTOMERS ({customers.length})
        </p>
        {customers.length === 0 ? (
          <EmptyState text="No customers in this franchise yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-ash">
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Phone</th>
                  <th className="pb-2 pr-4">Plan</th>
                  <th className="pb-2 pr-4">Start</th>
                  <th className="pb-2 pr-4">Expiry</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.slice(0, 50).map((c) => (
                  <tr
                    key={c._id}
                    className="border-b border-white/5 text-bone"
                  >
                    <td className="py-2 pr-4 font-semibold">{c.fullName}</td>
                    <td className="py-2 pr-4 font-data text-ash">{c.phone}</td>
                    <td className="py-2 pr-4 text-ash">
                      {c.membershipPlan ?? "—"}
                    </td>
                    <td className="py-2 pr-4 font-data text-ash">
                      {c.membershipStartDate
                        ? new Date(c.membershipStartDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-2 pr-4 font-data text-ash">
                      {c.membershipEndDate
                        ? new Date(c.membershipEndDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-2">
                      <StatusBadge status={c.membershipStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// FRANCHISE ADMINS MANAGEMENT — Super Admin
// ═════════════════════════════════════════════════════════════════════════════

export function FranchiseAdminsScreen() {
  const admins = useQuery(api.franchiseAdmin.listFranchiseAdmins);
  const franchises = useQuery(api.franchiseAdmin.listFranchises);
  const users = useQuery(api.adminContent.listMembers);
  const assign = useMutation(api.franchiseAdmin.assignFranchiseAdmin);
  const remove = useMutation(api.franchiseAdmin.removeFranchiseAdmin);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedFranchise, setSelectedFranchise] = useState("");

  const assignedUserIds = new Set(admins?.map((a) => a._id));
  const availableUsers =
    users?.filter((u) => !assignedUserIds.has(u._id)) ?? [];

  const handleAssign = async () => {
    if (!selectedUser || !selectedFranchise) {
      toast.error("Select both a user and a franchise.");
      return;
    }
    try {
      await assign({
        userId: selectedUser as Id<"users">,
        franchiseId: selectedFranchise,
      });
      toast.success("Franchise admin assigned.");
      setShowAssign(false);
      setSelectedUser("");
      setSelectedFranchise("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Franchise Admins"
        description="Assign users as Franchise Admins. Each admin gets access to exactly one franchise."
        action={
          <Button
            className="gap-2 bg-lime text-carbon hover:bg-lime/90"
            onClick={() => setShowAssign(true)}
          >
            <UserPlus className="size-4" /> Assign Admin
          </Button>
        }
      />

      {!admins && <SkeletonRows />}
      {admins && admins.length === 0 && (
        <EmptyState text="No franchise admins assigned yet." />
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {admins?.map((a) => {
          const franchise = franchises?.find((f) => f._id === a.franchiseId);
          return (
            <div
              key={a._id}
              className="rounded-2xl border border-white/8 bg-graphite p-5"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-flame/15 font-display text-sm font-bold text-flame">
                  {(a.name ?? "U").slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-bone">
                    {a.name ?? "Unnamed"}
                  </p>
                  <p className="truncate text-xs text-ash">{a.email}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="font-data text-[10px] text-ash">
                  FRANCHISE:{" "}
                  <span className="text-lime">
                    {franchise?.name ?? "Unknown"}
                  </span>
                </p>
              </div>
              <div className="mt-3 border-t border-white/8 pt-3">
                <ConfirmDelete
                  label="Remove"
                  onConfirm={async () => {
                    await remove({ userId: a._id });
                    toast.success("Admin removed.");
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent className="border-white/10 bg-graphite text-bone sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display uppercase">
              Assign Franchise Admin
            </DialogTitle>
            <DialogDescription className="text-ash">
              Select a user and assign them to manage a specific franchise.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid gap-1.5">
              <p className="text-xs text-ash">SELECT USER</p>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="border-white/10 bg-carbon text-bone">
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-graphite text-bone">
                  {availableUsers.map((u) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.name ?? u.email ?? "Unnamed"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <p className="text-xs text-ash">SELECT FRANCHISE</p>
              <Select
                value={selectedFranchise}
                onValueChange={setSelectedFranchise}
              >
                <SelectTrigger className="border-white/10 bg-carbon text-bone">
                  <SelectValue placeholder="Choose a franchise..." />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-graphite text-bone">
                  {franchises?.map((f) => (
                    <SelectItem key={f._id} value={f._id}>
                      {f.name} — {f.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="gap-2 bg-lime text-carbon hover:bg-lime/90"
              onClick={handleAssign}
            >
              <ShieldCheck className="size-4" /> Assign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CUSTOMERS MANAGEMENT — Super Admin + Franchise Admin (isolated)
// ═════════════════════════════════════════════════════════════════════════════

export function CustomersAdmin() {
  const myRole = useQuery(api.adminContent.myRole);
  const customers = useQuery(api.franchiseAdmin.listCustomers, {});
  const franchises = useQuery(api.franchiseAdmin.listFranchises);
  const addCustomer = useMutation(api.franchiseAdmin.addCustomer);
  const updateCustomer = useMutation(api.franchiseAdmin.updateCustomer);
  const deleteCustomer = useMutation(api.franchiseAdmin.deleteCustomer);
  const [editing, setEditing] = useState<Doc<"customers"> | "new" | null>(
    null,
  );
  const [search, setSearch] = useState("");

  const isSuperAdmin = myRole?.role === "admin" || myRole?.role === "admin";

  const filtered = (customers ?? []).filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.includes(term)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        description={
          isSuperAdmin
            ? "All customers across all franchises."
            : "Customers in your franchise only."
        }
        action={
          <Button
            className="gap-2 bg-lime text-carbon hover:bg-lime/90"
            onClick={() => setEditing("new")}
          >
            <Plus className="size-4" /> Add Customer
          </Button>
        }
      />

      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-graphite px-4 py-3 text-sm text-bone placeholder:text-ash focus:border-lime/50 focus:outline-none"
        />
      </div>

      {!customers && <SkeletonRows />}
      {customers && filtered.length === 0 && (
        <EmptyState text={search ? "No customers match your search." : "No customers yet."} />
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => {
          const franchise = franchises?.find((f) => f._id === c.franchiseId);
          return (
            <div
              key={c._id}
              className="rounded-2xl border border-white/8 bg-graphite p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-bone">
                    {c.fullName}
                  </p>
                  <p className="mt-0.5 text-xs text-ash">{c.email}</p>
                  <p className="mt-0.5 font-data text-[10px] text-ash">
                    {c.phone}
                  </p>
                </div>
                <StatusBadge status={c.membershipStatus} />
              </div>
              {isSuperAdmin && franchise && (
                <p className="mt-2 font-data text-[10px] text-lime">
                  <Building2 className="mr-1 inline size-3" />
                  {franchise.name}
                </p>
              )}
              <div className="mt-2 space-y-0.5">
                <p className="font-data text-[10px] text-ash">
                  PLAN: {c.membershipPlan ?? "—"}
                </p>
                {c.membershipEndDate && (
                  <p className="font-data text-[10px] text-ash">
                    EXPIRES:{" "}
                    {new Date(c.membershipEndDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-white/8 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 border-white/15 text-bone hover:border-lime/50 hover:text-lime"
                  onClick={() => setEditing(c)}
                >
                  <Edit className="size-3.5" /> Edit
                </Button>
                <ConfirmDelete
                  onConfirm={async () => {
                    await deleteCustomer({ id: c._id });
                    toast.success(`${c.fullName} deleted.`);
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto border-white/10 bg-graphite text-bone sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display uppercase">
              {editing === "new"
                ? "Add Customer"
                : `Edit ${(editing as Doc<"customers">)?.fullName}`}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <CustomerForm
              key={editing === "new" ? "new" : editing._id}
              initial={editing === "new" ? null : editing}
              franchises={franchises ?? []}
              isSuperAdmin={isSuperAdmin}
              defaultFranchiseId={myRole?.branchId}
              onSave={async (args) => {
                try {
                  if (editing === "new") {
                    await addCustomer(args as never);
                  } else {
                    await updateCustomer({
                      id: editing._id,
                      ...args,
                    } as never);
                  }
                  toast.success("Customer saved.");
                  setEditing(null);
                } catch (err) {
                  toast.error(
                    err instanceof Error ? err.message : "Save failed.",
                  );
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CustomerForm({
  initial,
  franchises,
  isSuperAdmin,
  defaultFranchiseId,
  onSave,
}: {
  initial: Doc<"customers"> | null;
  franchises: Doc<"franchises">[];
  isSuperAdmin: boolean;
  defaultFranchiseId?: string | null;
  onSave: (args: Record<string, unknown>) => Promise<void>;
}) {
  const myRole = useQuery(api.adminContent.myRole);
  const [form, setForm] = useState({
    franchiseId:
      initial?.franchiseId ??
      (isSuperAdmin ? "" : (myRole?.branchId ?? "")),
    fullName: initial?.fullName ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    dateOfBirth: initial?.dateOfBirth ?? "",
    gender: initial?.gender ?? "",
    address: initial?.address ?? "",
    membershipPlan: initial?.membershipPlan ?? "",
    membershipStartDate: initial?.membershipStartDate ?? Date.now(),
    membershipEndDate: initial?.membershipEndDate ?? Date.now() + 30 * 86400000,
    membershipStatus: (initial?.membershipStatus ?? "active") as
      | "active"
      | "expired"
      | "cancelled"
      | "upcoming",
    emergencyContactName: initial?.emergencyContactName ?? "",
    emergencyContactPhone: initial?.emergencyContactPhone ?? "",
    notes: initial?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toLocalDate = (ms: number) => {
    if (!ms) return "";
    const d = new Date(ms);
    return d.toISOString().split("T")[0];
  };
  const fromLocalDate = (s: string) => (s ? new Date(s).getTime() : 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.franchiseId && isSuperAdmin) {
      toast.error("Select a franchise.");
      return;
    }
    if (!form.fullName || !form.email || !form.phone) {
      toast.error("Name, email and phone are required.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...form,
        franchiseId: form.franchiseId as Id<"franchises">,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {isSuperAdmin && (
        <div className="grid gap-1.5">
          <p className="text-xs text-ash">FRANCHISE</p>
          <Select
            value={form.franchiseId}
            onValueChange={(v) => set("franchiseId", v)}
          >
            <SelectTrigger className="border-white/10 bg-carbon text-bone">
              <SelectValue placeholder="Select franchise..." />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-graphite text-bone">
              {franchises.map((f) => (
                <SelectItem key={f._id} value={f._id}>
                  {f.name} — {f.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <LineInput
          label="Full name"
          value={form.fullName}
          onChange={(v) => set("fullName", v)}
          required
        />
        <LineInput
          label="Email"
          value={form.email}
          onChange={(v) => set("email", v)}
          type="email"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <LineInput
          label="Phone"
          value={form.phone}
          onChange={(v) => set("phone", v)}
          required
        />
        <LineInput
          label="Date of birth"
          value={form.dateOfBirth}
          onChange={(v) => set("dateOfBirth", v)}
          type="date"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <p className="text-xs text-ash">GENDER</p>
          <Select
            value={form.gender}
            onValueChange={(v) => set("gender", v)}
          >
            <SelectTrigger className="border-white/10 bg-carbon text-bone">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-graphite text-bone">
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <LineInput
          label="Address"
          value={form.address}
          onChange={(v) => set("address", v)}
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-carbon p-4">
        <p className="micro-label mb-3 text-[9px]!">MEMBERSHIP</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <LineInput
            label="Plan name"
            value={form.membershipPlan}
            onChange={(v) => set("membershipPlan", v)}
            placeholder="e.g. Basic, Pro, Elite"
          />
          <div className="grid gap-1.5">
            <p className="text-xs text-ash">STATUS</p>
            <Select
              value={form.membershipStatus}
              onValueChange={(v) =>
                set("membershipStatus", v as typeof form.membershipStatus)
              }
            >
              <SelectTrigger className="border-white/10 bg-carbon text-bone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-graphite text-bone">
                {MEMBERSHIP_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <p className="text-xs text-ash">START DATE</p>
            <input
              type="date"
              value={toLocalDate(form.membershipStartDate)}
              onChange={(e) =>
                set("membershipStartDate", fromLocalDate(e.target.value))
              }
              className="rounded-md border border-white/10 bg-carbon px-3 py-2 font-data text-xs text-bone"
            />
          </div>
          <div className="grid gap-1.5">
            <p className="text-xs text-ash">END DATE</p>
            <input
              type="date"
              value={toLocalDate(form.membershipEndDate)}
              onChange={(e) =>
                set("membershipEndDate", fromLocalDate(e.target.value))
              }
              className="rounded-md border border-white/10 bg-carbon px-3 py-2 font-data text-xs text-bone"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-carbon p-4">
        <p className="micro-label mb-3 text-[9px]!">EMERGENCY CONTACT</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <LineInput
            label="Contact name"
            value={form.emergencyContactName}
            onChange={(v) => set("emergencyContactName", v)}
          />
          <LineInput
            label="Contact phone"
            value={form.emergencyContactPhone}
            onChange={(v) => set("emergencyContactPhone", v)}
          />
        </div>
      </div>

      <AreaInput
        label="Notes"
        value={form.notes}
        onChange={(v) => set("notes", v)}
        rows={3}
      />
      <SaveButton loading={saving} />
    </form>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MEMBERSHIPS MANAGEMENT — Super Admin + Franchise Admin (isolated)
// ═════════════════════════════════════════════════════════════════════════════

export function MembershipsAdmin() {
  const myRole = useQuery(api.adminContent.myRole);
  const memberships = useQuery(api.franchiseAdmin.listMemberships, {});
  const customers = useQuery(api.franchiseAdmin.listCustomers, {});
  const franchises = useQuery(api.franchiseAdmin.listFranchises);
  const upsert = useMutation(api.franchiseAdmin.upsertMembership);
  const remove = useMutation(api.franchiseAdmin.deleteMembership);
  const [editing, setEditing] = useState<
    Doc<"memberships"> | "new" | null
  >(null);

  const isSuperAdmin =
    myRole?.role === "admin" || myRole?.role === "admin";

  const getCustomerName = (customerId: Id<"customers">) =>
    customers?.find((c) => c._id === customerId)?.fullName ?? "Unknown";

  const getFranchiseName = (franchiseId: Id<"franchises">) =>
    franchises?.find((f) => f._id === franchiseId)?.name ?? "Unknown";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Memberships"
        description="Manage membership subscriptions and payment status."
        action={
          <Button
            className="gap-2 bg-lime text-carbon hover:bg-lime/90"
            onClick={() => setEditing("new")}
          >
            <Plus className="size-4" /> Add Membership
          </Button>
        }
      />

      {!memberships && <SkeletonRows />}
      {memberships && memberships.length === 0 && (
        <EmptyState text="No memberships yet." />
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {memberships?.map((m) => (
          <div
            key={m._id}
            className="rounded-2xl border border-white/8 bg-graphite p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-bone">
                  {getCustomerName(m.customerId)}
                </p>
                <p className="mt-0.5 font-data text-xs text-flame">
                  {m.planName}
                </p>
              </div>
              <StatusBadge status={m.membershipStatus} />
            </div>
            {isSuperAdmin && (
              <p className="mt-2 font-data text-[10px] text-lime">
                <Building2 className="mr-1 inline size-3" />
                {getFranchiseName(m.franchiseId)}
              </p>
            )}
            <div className="mt-2 space-y-0.5 font-data text-[10px] text-ash">
              <p>
                DURATION: {m.planDuration} · PRICE: ${m.price}
              </p>
              <p>
                {new Date(m.startDate).toLocaleDateString()} —{" "}
                {new Date(m.endDate).toLocaleDateString()}
              </p>
              <p>
                PAYMENT:{" "}
                <span
                  className={
                    m.paymentStatus === "paid"
                      ? "text-lime"
                      : m.paymentStatus === "pending"
                        ? "text-flame"
                        : "text-volt"
                  }
                >
                  {m.paymentStatus.toUpperCase()}
                </span>
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-white/8 pt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 border-white/15 text-bone hover:border-lime/50 hover:text-lime"
                onClick={() => setEditing(m)}
              >
                <Edit className="size-3.5" /> Edit
              </Button>
              <ConfirmDelete
                onConfirm={async () => {
                  await remove({ id: m._id });
                  toast.success("Membership deleted.");
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto border-white/10 bg-graphite text-bone sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display uppercase">
              {editing === "new"
                ? "New Membership"
                : "Edit Membership"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <MembershipForm
              key={editing === "new" ? "new" : editing._id}
              initial={editing === "new" ? null : editing}
              customers={customers ?? []}
              onSave={async (args) => {
                try {
                  await upsert(args as never);
                  toast.success("Membership saved.");
                  setEditing(null);
                } catch (err) {
                  toast.error(
                    err instanceof Error ? err.message : "Save failed.",
                  );
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MembershipForm({
  initial,
  customers,
  onSave,
}: {
  initial: Doc<"memberships"> | null;
  customers: Doc<"customers">[];
  onSave: (args: Record<string, unknown>) => Promise<void>;
}) {
  const toLocalDate = (ms: number) => {
    if (!ms) return "";
    return new Date(ms).toISOString().split("T")[0];
  };
  const fromLocalDate = (s: string) => (s ? new Date(s).getTime() : 0);

  const [form, setForm] = useState({
    customerId: initial?.customerId ?? "",
    planName: initial?.planName ?? "",
    planDuration: initial?.planDuration ?? "1 month",
    startDate: initial?.startDate ?? Date.now(),
    endDate: initial?.endDate ?? Date.now() + 30 * 86400000,
    price: initial?.price ?? 0,
    paymentStatus: (initial?.paymentStatus ?? "paid") as
      | "paid"
      | "partial"
      | "pending",
    membershipStatus: (initial?.membershipStatus ?? "active") as
      | "active"
      | "expired"
      | "cancelled"
      | "upcoming",
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.planName) {
      toast.error("Customer and plan name are required.");
      return;
    }
    setSaving(true);
    try {
      const customer = customers.find((c) => c._id === form.customerId);
      await onSave({
        ...form,
        customerId: form.customerId as Id<"customers">,
        franchiseId: customer?.franchiseId,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-1.5">
        <p className="text-xs text-ash">CUSTOMER</p>
        <Select
          value={form.customerId}
          onValueChange={(v) => set("customerId", v)}
        >
          <SelectTrigger className="border-white/10 bg-carbon text-bone">
            <SelectValue placeholder="Select customer..." />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-graphite text-bone">
            {customers.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.fullName} — {c.phone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <LineInput
          label="Plan name"
          value={form.planName}
          onChange={(v) => set("planName", v)}
          required
        />
        <LineInput
          label="Duration"
          value={form.planDuration}
          onChange={(v) => set("planDuration", v)}
          placeholder="e.g. 1 month, 3 months, 1 year"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumInput
          label="Price ($)"
          value={form.price}
          onChange={(v) => set("price", v)}
          step="0.01"
        />
        <div className="grid gap-1.5">
          <p className="text-xs text-ash">PAYMENT STATUS</p>
          <Select
            value={form.paymentStatus}
            onValueChange={(v) =>
              set("paymentStatus", v as typeof form.paymentStatus)
            }
          >
            <SelectTrigger className="border-white/10 bg-carbon text-bone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-graphite text-bone">
              {PAYMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <p className="text-xs text-ash">START DATE</p>
          <input
            type="date"
            value={toLocalDate(form.startDate)}
            onChange={(e) =>
              set("startDate", fromLocalDate(e.target.value))
            }
            className="rounded-md border border-white/10 bg-carbon px-3 py-2 font-data text-xs text-bone"
          />
        </div>
        <div className="grid gap-1.5">
          <p className="text-xs text-ash">END DATE</p>
          <input
            type="date"
            value={toLocalDate(form.endDate)}
            onChange={(e) =>
              set("endDate", fromLocalDate(e.target.value))
            }
            className="rounded-md border border-white/10 bg-carbon px-3 py-2 font-data text-xs text-bone"
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <p className="text-xs text-ash">MEMBERSHIP STATUS</p>
        <Select
          value={form.membershipStatus}
          onValueChange={(v) =>
            set("membershipStatus", v as typeof form.membershipStatus)
          }
        >
          <SelectTrigger className="border-white/10 bg-carbon text-bone">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-graphite text-bone">
            {MEMBERSHIP_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <SaveButton loading={saving} />
    </form>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MY FRANCHISE — Franchise Admin's own franchise dashboard
// ═════════════════════════════════════════════════════════════════════════════

export function MyFranchiseScreen() {
  const stats = useQuery(api.franchiseAdmin.getFranchiseDashboardStats);

  if (!stats) return <SkeletonRows />;

  const { franchise } = stats;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={franchise.name}
        description={`${franchise.location} · ${franchise.city}, ${franchise.state}`}
      />

      {/* Franchise Info */}
      <div className="rounded-2xl border border-white/8 bg-graphite p-6">
        <p className="micro-label mb-4 text-[10px]!">FRANCHISE DETAILS</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="Name" value={franchise.name} />
          <InfoRow label="City" value={franchise.city} />
          <InfoRow label="State" value={franchise.state} />
          <InfoRow label="Country" value={franchise.country} />
          <InfoRow label="Owner" value={franchise.ownerName} />
          <InfoRow label="Phone" value={franchise.phone} />
          <InfoRow label="Email" value={franchise.email} />
          <InfoRow label="Address" value={franchise.address} />
          <InfoRow
            label="Status"
            value={franchise.status.toUpperCase()}
            className={
              franchise.status === "active" ? "text-lime" : "text-flame"
            }
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="TOTAL CUSTOMERS" value={stats.totalCustomers} />
        <StatCard
          label="ACTIVE CUSTOMERS"
          value={stats.activeCustomers}
          tint="text-lime"
        />
        <StatCard
          label="EXPIRED"
          value={stats.expiredCustomers}
          tint="text-flame"
        />
        <StatCard
          label="NEW THIS MONTH"
          value={stats.newCustomersThisMonth}
          tint="text-volt"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="ACTIVE MEMBERSHIPS"
          value={stats.activeMemberships}
        />
        <StatCard
          label="EXPIRED MEMBERSHIPS"
          value={stats.expiredMemberships}
          tint="text-flame"
        />
        <StatCard
          label="UPCOMING EXPIRATIONS"
          value={stats.upcomingExpirations}
          tint="text-volt"
        />
        <StatCard
          label="NEW MEMBERSHIPS"
          value={stats.newMemberships}
          tint="text-lime"
        />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SHARED HELPERS
// ═════════════════════════════════════════════════════════════════════════════

function StatusBadge({
  status,
}: {
  status?: string | null;
}) {
  if (!status) return <span className="font-data text-[9px] text-ash">—</span>;
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 font-data text-[9px] font-bold uppercase",
        status === "active"
          ? "bg-lime/15 text-lime"
          : status === "expired" || status === "cancelled"
            ? "bg-flame/15 text-flame"
            : status === "upcoming"
              ? "bg-volt/15 text-volt"
              : "bg-ash/15 text-ash",
      )}
    >
      {status}
    </span>
  );
}

function InfoRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div>
      <p className="font-data text-[9px] uppercase tracking-wider text-ash">
        {label}
      </p>
      <p className={cn("mt-0.5 text-sm text-bone", className)}>{value}</p>
    </div>
  );
}
