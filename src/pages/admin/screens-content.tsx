import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery } from "convex/react";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AreaInput,
  BoolToggle,
  ConfirmDelete,
  EmptyState,
  LineInput,
  ListEditor,
  NumInput,
  PageHeader,
  SaveButton,
  SkeletonRows,
} from "./admin-ui";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const CLASS_TYPES = [
  "Strength",
  "HIIT",
  "Boxing",
  "Yoga",
  "CrossFit",
  "Spin",
  "Recovery",
];

const toLocalInput = (ms: number) => {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (s: string) => new Date(s).getTime();

function BranchSelect({
  value,
  onChange,
  branches,
}: {
  value: string;
  onChange: (v: string) => void;
  branches: Doc<"branches">[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="border-white/10 bg-carbon text-bone">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-white/10 bg-graphite text-bone">
        {(branches ?? []).map((b) => (
          <SelectItem key={b._id} value={b._id}>
            {b.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* ===================================================================== */
/* BRANCHES                                                               */
/* ===================================================================== */

type HoursRow = { day: string; open: string; close: string; closed: boolean };

export function BranchesAdmin() {
  const branches = useQuery(api.content.listAllBranches);
  const myRole = useQuery(api.adminContent.myRole);
  const save = useMutation(api.adminContent.upsertBranch);
  const remove = useMutation(api.adminContent.deleteBranch);
  const [editing, setEditing] = useState<Doc<"branches"> | "new" | null>(null);

  const isManager = myRole?.role === "branch_manager";
  const lockedBranch = isManager ? myRole.branchId : null;
  const visibleBranches = (branches ?? []).filter(
    (b) => !lockedBranch || b._id === lockedBranch,
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Branches"
        description="Club details, photos, hours, amenities and branch offers. Branch managers can only edit their own club."
        action={
          !isManager && (
            <Button
              className="gap-2 bg-lime text-carbon hover:bg-lime/90"
              onClick={() => setEditing("new")}
            >
              <Plus className="size-4" /> Add Branch
            </Button>
          )
        }
      />

      {!branches && <SkeletonRows />}
      {branches && visibleBranches.length === 0 && (
        <EmptyState text="No branches yet — add your first club." />
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleBranches.map((b) => (
          <div
            key={b._id}
            className="flex flex-col rounded-2xl border border-white/8 bg-graphite p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-base font-semibold uppercase text-bone">
                  {b.name}
                </p>
                <p className="mt-0.5 font-data text-[11px] text-ash">
                  {b.area} · {b.address}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 font-data text-[9px] font-bold uppercase",
                  b.active ? "bg-lime/15 text-lime" : "bg-ash/15 text-ash",
                )}
              >
                {b.active ? "Live" : "Hidden"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {b.amenities.slice(0, 5).map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-white/10 px-2 py-0.5 font-data text-[9px] text-ash"
                >
                  {a}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-white/8 pt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 border-white/15 text-bone hover:border-lime/50 hover:text-lime"
                onClick={() => setEditing(b)}
              >
                <Pencil className="size-3.5" /> Edit
              </Button>
              {!isManager && (
                <ConfirmDelete
                  onConfirm={async () => {
                    await remove({ id: b._id });
                    toast.success(`${b.name} deleted.`);
                  }}
                />
              )}
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
              {editing === "new" ? "New Branch" : `Edit ${(editing as Doc<"branches">)?.name}`}
            </DialogTitle>
            <DialogDescription className="text-ash">
              Everything here publishes to the live site instantly.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <BranchForm
              key={editing === "new" ? "new" : editing._id}
              initial={editing === "new" ? null : editing}
              lockedBranchId={lockedBranch}
              onSave={async (args) => {
                try {
                  await save(args as never);
                  toast.success("Branch saved.");
                  setEditing(null);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Save failed.");
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BranchForm({
  initial,
  lockedBranchId,
  onSave,
}: {
  initial: Doc<"branches"> | null;
  lockedBranchId: Id<"branches"> | null;
  onSave: (args: Record<string, unknown>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    area: initial?.area ?? "",
    tagline: initial?.tagline ?? "",
    description: initial?.description ?? "",
    address: initial?.address ?? "",
    lat: initial?.lat ?? 40.75,
    lng: initial?.lng ?? -73.98,
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    whatsapp: initial?.whatsapp ?? "",
    hours: initial?.hours ?? DAYS.map((d) => ({ day: d, open: "06:00", close: "22:00", closed: false })),
    photos: initial?.photos ?? [],
    coverPhoto: initial?.coverPhoto ?? "",
    amenities: initial?.amenities ?? [],
    order: initial?.order ?? 1,
    active: initial?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        id: initial?._id,
        ...form,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <LineInput label="Branch name" value={form.name} onChange={(v) => set("name", v)} required />
        <LineInput label="Area / locality tag" value={form.area} onChange={(v) => set("area", v)} placeholder="Downtown" required />
      </div>
      <LineInput label="Tagline" value={form.tagline} onChange={(v) => set("tagline", v)} placeholder="The flagship. 24/7. Zero excuses." />
      <AreaInput label="About this club" value={form.description} onChange={(v) => set("description", v)} rows={4} />
      <LineInput label="Full address" value={form.address} onChange={(v) => set("address", v)} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <LineInput label="Phone" value={form.phone} onChange={(v) => set("phone", v)} required />
        <LineInput label="Email" value={form.email} onChange={(v) => set("email", v)} type="email" />
        <LineInput label="WhatsApp (optional)" value={form.whatsapp ?? ""} onChange={(v) => set("whatsapp", v)} placeholder="+1 555 000 0000" />
        <div className="grid grid-cols-2 gap-3">
          <NumInput label="Latitude" value={form.lat} onChange={(v) => set("lat", v)} step="0.0001" />
          <NumInput label="Longitude" value={form.lng} onChange={(v) => set("lng", v)} step="0.0001" />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-carbon p-4">
        <p className="micro-label mb-3 text-[9px]!">OPENING HOURS (PER DAY)</p>
        <div className="space-y-1.5">
          {form.hours.map((h, i) => (
            <div key={h.day} className="flex items-center gap-2">
              <span className="w-20 shrink-0 font-data text-xs text-bone">{h.day}</span>
              <input
                type="time"
                value={h.open}
                disabled={h.closed}
                onChange={(e) =>
                  set("hours", form.hours.map((x, j) => (j === i ? { ...x, open: e.target.value } : x)))
                }
                className="rounded-md border border-white/10 bg-carbon px-2 py-1.5 font-data text-xs text-bone disabled:opacity-40"
              />
              <span className="text-ash">–</span>
              <input
                type="time"
                value={h.close}
                disabled={h.closed}
                onChange={(e) =>
                  set("hours", form.hours.map((x, j) => (j === i ? { ...x, close: e.target.value } : x)))
                }
                className="rounded-md border border-white/10 bg-carbon px-2 py-1.5 font-data text-xs text-bone disabled:opacity-40"
              />
              <label className="ml-auto flex items-center gap-1.5 text-[10px] text-ash">
                Closed
                <Switch
                  checked={h.closed}
                  onCheckedChange={(c) =>
                    set("hours", form.hours.map((x, j) => (j === i ? { ...x, closed: c } : x)))
                  }
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <LineInput label="Cover photo URL" value={form.coverPhoto} onChange={(v) => set("coverPhoto", v)} placeholder="https://…" />
        <NumInput label="Display order" value={form.order} onChange={(v) => set("order", v)} min={1} />
      </div>
      <ListEditor label="Gallery photos (URLs)" values={form.photos} onChange={(v) => set("photos", v)} placeholder="https://…\nhttps://…" />
      <ListEditor label="Amenities" values={form.amenities} onChange={(v) => set("amenities", v)} placeholder="24/7 Access\nPool\nSauna" />
      <BoolToggle label="Visible on site" checked={form.active} onChange={(v) => set("active", v)} />
      <SaveButton loading={saving} />
      {lockedBranchId && (
        <p className="text-xs text-ash">
          Editing is locked to your managed branch.
        </p>
      )}
    </form>
  );
}

/* ===================================================================== */
/* PLANS                                                                  */
/* ===================================================================== */

export function PlansAdmin() {
  const plans = useQuery(api.content.listAllPlans);
  const save = useMutation(api.adminContent.upsertPlan);
  const remove = useMutation(api.adminContent.deletePlan);
  const [editing, setEditing] = useState<Doc<"plans"> | "new" | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Membership Plans"
        description="Pricing, billing cycles and included features."
        action={
          <Button
            className="gap-2 bg-lime text-carbon hover:bg-lime/90"
            onClick={() => setEditing("new")}
          >
            <Plus className="size-4" /> Add Plan
          </Button>
        }
      />
      {!plans && <SkeletonRows />}
      {plans && plans.length === 0 && <EmptyState text="No plans yet." />}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans?.map((p) => (
          <div key={p._id} className="rounded-2xl border border-white/8 bg-graphite p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="flex items-center gap-2 font-display text-base font-semibold uppercase text-bone">
                  {p.name}
                  {p.popular && (
                    <span className="rounded-full bg-lime px-2 py-0.5 font-data text-[9px] font-bold text-carbon">
                      POPULAR
                    </span>
                  )}
                </p>
                <p className="font-data text-lg text-lime">
                  ${p.priceMonthly}/mo
                  <span className="text-xs text-ash"> · ${p.priceAnnual}/yr</span>
                </p>
              </div>
              <span className={cn("rounded-full px-2 py-1 font-data text-[9px] font-bold uppercase", p.active ? "bg-lime/15 text-lime" : "bg-ash/15 text-ash")}>
                {p.active ? "Live" : "Hidden"}
              </span>
            </div>
            <p className="mt-3 line-clamp-2 text-xs text-ash">{p.tagline}</p>
            <div className="mt-4 flex items-center gap-2 border-t border-white/8 pt-4">
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 border-white/15 text-bone hover:border-lime/50 hover:text-lime" onClick={() => setEditing(p)}>
                <Pencil className="size-3.5" /> Edit
              </Button>
              <ConfirmDelete onConfirm={async () => { await remove({ id: p._id }); toast.success("Plan deleted."); }} />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-white/10 bg-graphite text-bone sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display uppercase">
              {editing === "new" ? "New Plan" : `Edit ${(editing as Doc<"plans">)?.name}`}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <PlanForm
              key={editing === "new" ? "new" : editing._id}
              initial={editing === "new" ? null : editing}
              onSave={async (args) => {
                try {
                  await save(args as never);
                  toast.success("Plan saved.");
                  setEditing(null);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Save failed.");
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlanForm({
  initial,
  onSave,
}: {
  initial: Doc<"plans"> | null;
  onSave: (args: Record<string, unknown>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    tagline: initial?.tagline ?? "",
    priceMonthly: initial?.priceMonthly ?? 29,
    priceAnnual: initial?.priceAnnual ?? 290,
    currency: initial?.currency ?? "USD",
    popular: initial?.popular ?? false,
    active: initial?.active ?? true,
    order: initial?.order ?? 1,
    features: initial?.features ?? [],
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
      <LineInput label="Plan name" value={form.name} onChange={(v) => set("name", v)} required />
      <LineInput label="Tagline" value={form.tagline} onChange={(v) => set("tagline", v)} />
      <div className="grid grid-cols-2 gap-3">
        <NumInput label="Monthly price ($)" value={form.priceMonthly} onChange={(v) => set("priceMonthly", v)} step="0.01" />
        <NumInput label="Annual price ($)" value={form.priceAnnual} onChange={(v) => set("priceAnnual", v)} step="0.01" />
        <LineInput label="Currency" value={form.currency} onChange={(v) => set("currency", v)} />
        <NumInput label="Display order" value={form.order} onChange={(v) => set("order", v)} min={1} />
      </div>
      <ListEditor label="Included features" values={form.features} onChange={(v) => set("features", v)} placeholder="Full gym floor access\n…" />
      <div className="grid grid-cols-2 gap-3">
        <BoolToggle label="Most Popular badge" checked={form.popular} onChange={(v) => set("popular", v)} />
        <BoolToggle label="Visible on site" checked={form.active} onChange={(v) => set("active", v)} />
      </div>
      <SaveButton loading={saving} />
    </form>
  );
}

/* ===================================================================== */
/* OFFERS                                                                 */
/* ===================================================================== */

export function OffersAdmin() {
  const offers = useQuery(api.content.listOffers);
  const branches = useQuery(api.content.listAllBranches);
  const plans = useQuery(api.content.listAllPlans);
  const myRole = useQuery(api.adminContent.myRole);
  const save = useMutation(api.adminContent.upsertOffer);
  const remove = useMutation(api.adminContent.deleteOffer);
  const [editing, setEditing] = useState<Doc<"offers"> | "new" | null>(null);

  const isManager = myRole?.role === "branch_manager";
  const lockedBranch = isManager ? myRole.branchId : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Offers & Promotions"
        description="Sitewide, plan-specific or branch-specific promos with expiry-based countdowns."
        action={
          <Button className="gap-2 bg-lime text-carbon hover:bg-lime/90" onClick={() => setEditing("new")}>
            <Plus className="size-4" /> Add Offer
          </Button>
        }
      />
      {!offers && <SkeletonRows />}
      {offers && offers.length === 0 && <EmptyState text="No offers yet." />}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {offers?.map((o) => {
          const expired = Date.now() > o.expiryDate;
          return (
            <div key={o._id} className={cn("rounded-2xl border p-5", o.featured ? "border-lime/40 bg-lime/[0.04]" : "border-white/8 bg-graphite")}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-data text-sm font-bold text-flame">{o.discount}</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-bone">{o.title}</p>
                  <p className="mt-0.5 font-data text-[10px] uppercase tracking-wider text-ash">
                    {o.type}
                    {o.type === "branch" && branches ? ` · ${branches.find((b) => b._id === o.branchId)?.name ?? ""}` : ""}
                    {o.type === "plan" && plans ? ` · ${plans.find((p) => p._id === o.planId)?.name ?? ""}` : ""}
                  </p>
                </div>
                <span className={cn("shrink-0 rounded-full px-2 py-1 font-data text-[9px] font-bold uppercase", !o.active ? "bg-ash/15 text-ash" : expired ? "bg-flame/15 text-flame" : "bg-lime/15 text-lime")}>
                  {!o.active ? "Off" : expired ? "Expired" : "Live"}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-ash">{o.description}</p>
              <p className="mt-2 font-data text-[10px] text-ash">
                Ends {new Date(o.expiryDate).toLocaleDateString()}
              </p>
              <div className="mt-4 flex items-center gap-2 border-t border-white/8 pt-4">
                <Button variant="outline" size="sm" className="flex-1 gap-1.5 border-white/15 text-bone hover:border-lime/50 hover:text-lime" onClick={() => setEditing(o)}>
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <ConfirmDelete onConfirm={async () => { await remove({ id: o._id }); toast.success("Offer deleted."); }} />
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-white/10 bg-graphite text-bone sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display uppercase">
              {editing === "new" ? "New Offer" : "Edit Offer"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <OfferForm
              key={editing === "new" ? "new" : editing._id}
              initial={editing === "new" ? null : editing}
              branches={branches ?? []}
              plans={plans ?? []}
              lockedBranchId={lockedBranch}
              onSave={async (args) => {
                try {
                  await save(args as never);
                  toast.success("Offer saved.");
                  setEditing(null);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Save failed.");
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OfferForm({
  initial,
  branches,
  plans,
  lockedBranchId,
  onSave,
}: {
  initial: Doc<"offers"> | null;
  branches: Doc<"branches">[];
  plans: Doc<"plans">[];
  lockedBranchId: Id<"branches"> | null;
  onSave: (args: Record<string, unknown>) => Promise<void>;
}) {
  const now = Date.now();
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    discount: initial?.discount ?? "20% OFF",
    type: initial?.type ?? ("sitewide" as "sitewide" | "branch" | "plan"),
    branchId: initial?.branchId ?? lockedBranchId ?? "",
    planId: initial?.planId ?? "",
    startDate: initial?.startDate ?? now - 86400000,
    expiryDate: initial?.expiryDate ?? now + 30 * 86400000,
    bannerImage: initial?.bannerImage ?? "",
    featured: initial?.featured ?? false,
    active: initial?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.type === "branch" && !form.branchId) {
      toast.error("Pick a branch for this offer.");
      return;
    }
    if (form.type === "plan" && !form.planId) {
      toast.error("Pick a plan for this offer.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        id: initial?._id,
        ...form,
        branchId: form.type === "branch" ? (form.branchId || undefined) : undefined,
        planId: form.type === "plan" ? (form.planId || undefined) : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <LineInput label="Offer title" value={form.title} onChange={(v) => set("title", v)} required />
        <LineInput label="Discount badge (e.g. 20% OFF)" value={form.discount} onChange={(v) => set("discount", v)} required />
      </div>
      <AreaInput label="Description" value={form.description} onChange={(v) => set("description", v)} rows={2} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <p className="text-xs text-ash">OFFER TYPE</p>
          <Select value={form.type} onValueChange={(v) => set("type", v as typeof form.type)}>
            <SelectTrigger className="border-white/10 bg-carbon text-bone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-graphite text-bone">
              <SelectItem value="sitewide">Sitewide</SelectItem>
              <SelectItem value="branch">Branch-specific</SelectItem>
              <SelectItem value="plan">Plan-specific</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {form.type === "branch" && (
          <div className="grid gap-1.5 sm:col-span-2">
            <p className="text-xs text-ash">BRANCH</p>
            <BranchSelect value={form.branchId ?? ""} onChange={(v) => set("branchId", v)} branches={branches} />
          </div>
        )}
        {form.type === "plan" && (
          <div className="grid gap-1.5 sm:col-span-2">
            <p className="text-xs text-ash">PLAN</p>
            <Select value={form.planId ?? ""} onValueChange={(v) => set("planId", v)}>
              <SelectTrigger className="border-white/10 bg-carbon text-bone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-graphite text-bone">
                {plans.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <p className="text-xs text-ash">STARTS</p>
          <input
            type="datetime-local"
            value={toLocalInput(form.startDate)}
            onChange={(e) => set("startDate", fromLocalInput(e.target.value))}
            className="rounded-md border border-white/10 bg-carbon px-3 py-2 font-data text-xs text-bone"
          />
        </div>
        <div className="grid gap-1.5">
          <p className="text-xs text-ash">EXPIRES</p>
          <input
            type="datetime-local"
            value={toLocalInput(form.expiryDate)}
            onChange={(e) => set("expiryDate", fromLocalInput(e.target.value))}
            className="rounded-md border border-white/10 bg-carbon px-3 py-2 font-data text-xs text-bone"
          />
        </div>
      </div>

      <LineInput label="Banner image URL (optional)" value={form.bannerImage ?? ""} onChange={(v) => set("bannerImage", v)} />
      <div className="grid grid-cols-2 gap-3">
        <BoolToggle label="Featured (homepage)" checked={form.featured} onChange={(v) => set("featured", v)} />
        <BoolToggle label="Active" checked={form.active} onChange={(v) => set("active", v)} />
      </div>
      <SaveButton loading={saving} />
    </form>
  );
}

/* ===================================================================== */
/* TRAINERS                                                               */
/* ===================================================================== */

export function TrainersAdmin() {
  const trainers = useQuery(api.content.listAllTrainers);
  const branches = useQuery(api.content.listAllBranches);
  const myRole = useQuery(api.adminContent.myRole);
  const save = useMutation(api.adminContent.upsertTrainer);
  const remove = useMutation(api.adminContent.deleteTrainer);
  const [editing, setEditing] = useState<Doc<"trainers"> | "new" | null>(null);

  const lockedBranch = myRole?.role === "branch_manager" ? myRole.branchId : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Trainers"
        description="Coach profiles, specialties and social links."
        action={
          <Button className="gap-2 bg-lime text-carbon hover:bg-lime/90" onClick={() => setEditing("new")}>
            <Plus className="size-4" /> Add Trainer
          </Button>
        }
      />
      {!trainers && <SkeletonRows />}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {trainers?.map((t) => (
          <div key={t._id} className="flex gap-4 rounded-2xl border border-white/8 bg-graphite p-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-carbon">
              {t.photo && <img src={t.photo} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-bone">{t.name}</p>
              <p className="text-xs text-flame">{t.role}</p>
              <p className="mt-1 truncate font-data text-[10px] text-ash">
                {branches?.find((b) => b._id === t.branchId)?.name ?? "Unassigned"}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1.5 border-white/15 text-bone hover:border-lime/50 hover:text-lime" onClick={() => setEditing(t)}>
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <ConfirmDelete onConfirm={async () => { await remove({ id: t._id }); toast.success("Trainer deleted."); }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-white/10 bg-graphite text-bone sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display uppercase">
              {editing === "new" ? "New Trainer" : "Edit Trainer"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <TrainerForm
              key={editing === "new" ? "new" : editing._id}
              initial={editing === "new" ? null : editing}
              branches={branches ?? []}
              lockedBranchId={lockedBranch}
              onSave={async (args) => {
                try {
                  await save(args as never);
                  toast.success("Trainer saved.");
                  setEditing(null);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Save failed.");
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TrainerForm({
  initial,
  branches,
  lockedBranchId,
  onSave,
}: {
  initial: Doc<"trainers"> | null;
  branches: Doc<"branches">[];
  lockedBranchId: Id<"branches"> | null;
  onSave: (args: Record<string, unknown>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    role: initial?.role ?? "",
    bio: initial?.bio ?? "",
    photo: initial?.photo ?? "",
    specialties: initial?.specialties ?? [],
    socials: initial?.socials ?? {},
    branchId: initial?.branchId ?? lockedBranchId ?? "",
    order: initial?.order ?? 1,
    active: initial?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const setSocial = (k: string, v: string) =>
    setForm((f) => ({ ...f, socials: { ...f.socials, [k]: v || undefined } }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        id: initial?._id,
        ...form,
        branchId: form.branchId || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <LineInput label="Name" value={form.name} onChange={(v) => set("name", v)} required />
        <LineInput label="Role" value={form.role} onChange={(v) => set("role", v)} placeholder="Head Strength Coach" required />
      </div>
      <LineInput label="Photo URL" value={form.photo} onChange={(v) => set("photo", v)} />
      <AreaInput label="Bio" value={form.bio} onChange={(v) => set("bio", v)} rows={3} />
      <ListEditor label="Specialties" values={form.specialties} onChange={(v) => set("specialties", v)} placeholder="Powerlifting\nHIIT" />
      <div className="grid gap-3 sm:grid-cols-3">
        <LineInput label="Instagram URL" value={form.socials?.instagram ?? ""} onChange={(v) => setSocial("instagram", v)} />
        <LineInput label="X / Twitter URL" value={form.socials?.twitter ?? ""} onChange={(v) => setSocial("twitter", v)} />
        <LineInput label="LinkedIn URL" value={form.socials?.linkedin ?? ""} onChange={(v) => setSocial("linkedin", v)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <p className="text-xs text-ash">BRANCH</p>
          <BranchSelect value={form.branchId ?? ""} onChange={(v) => set("branchId", v)} branches={branches} />
        </div>
        <NumInput label="Display order" value={form.order} onChange={(v) => set("order", v)} min={1} />
      </div>
      <BoolToggle label="Visible on site" checked={form.active} onChange={(v) => set("active", v)} />
      <SaveButton loading={saving} />
    </form>
  );
}

/* ===================================================================== */
/* TESTIMONIALS                                                           */
/* ===================================================================== */

export function TestimonialsAdmin() {
  const items = useQuery(api.content.listAllTestimonials);
  const branches = useQuery(api.content.listAllBranches);
  const myRole = useQuery(api.adminContent.myRole);
  const save = useMutation(api.adminContent.upsertTestimonial);
  const remove = useMutation(api.adminContent.deleteTestimonial);
  const [editing, setEditing] = useState<Doc<"testimonials"> | "new" | null>(null);
  const lockedBranch = myRole?.role === "branch_manager" ? myRole.branchId : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Testimonials"
        description="Social proof shown on the landing page marquee."
        action={
          <Button className="gap-2 bg-lime text-carbon hover:bg-lime/90" onClick={() => setEditing("new")}>
            <Plus className="size-4" /> Add Testimonial
          </Button>
        }
      />
      {!items && <SkeletonRows />}
      {items && items.length === 0 && <EmptyState text="No testimonials yet." />}
      <div className="grid gap-4 md:grid-cols-2">
        {items?.map((t) => (
          <div key={t._id} className="rounded-2xl border border-white/8 bg-graphite p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-bone">
                {t.name}
                <span className="ml-2 font-data text-[10px] text-ash">
                  {branches?.find((b) => b._id === t.branchId)?.name ?? "General"}
                </span>
              </p>
              <span className="font-data text-xs text-lime">{"★".repeat(Math.round(t.rating))}</span>
            </div>
            <p className="mt-2 line-clamp-3 text-xs leading-5 text-ash">“{t.text}”</p>
            <div className="mt-4 flex items-center gap-2 border-t border-white/8 pt-4">
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 border-white/15 text-bone hover:border-lime/50 hover:text-lime" onClick={() => setEditing(t)}>
                <Pencil className="size-3.5" /> Edit
              </Button>
              <ConfirmDelete onConfirm={async () => { await remove({ id: t._id }); toast.success("Testimonial deleted."); }} />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="border-white/10 bg-graphite text-bone sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display uppercase">
              {editing === "new" ? "New Testimonial" : "Edit Testimonial"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <TestimonialForm
              key={editing === "new" ? "new" : editing._id}
              initial={editing === "new" ? null : editing}
              branches={branches ?? []}
              lockedBranchId={lockedBranch}
              onSave={async (args) => {
                try {
                  await save(args as never);
                  toast.success("Testimonial saved.");
                  setEditing(null);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Save failed.");
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TestimonialForm({
  initial,
  branches,
  lockedBranchId,
  onSave,
}: {
  initial: Doc<"testimonials"> | null;
  branches: Doc<"branches">[];
  lockedBranchId: Id<"branches"> | null;
  onSave: (args: Record<string, unknown>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    photo: initial?.photo ?? "",
    rating: initial?.rating ?? 5,
    text: initial?.text ?? "",
    branchId: initial?.branchId ?? lockedBranchId ?? "",
    featured: initial?.featured ?? false,
    active: initial?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ id: initial?._id, ...form, branchId: form.branchId || undefined });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <LineInput label="Member name" value={form.name} onChange={(v) => set("name", v)} required />
        <NumInput label="Rating (1–5)" value={form.rating} onChange={(v) => set("rating", Math.max(1, Math.min(5, v)))} min={1} />
      </div>
      <LineInput label="Photo URL (optional)" value={form.photo} onChange={(v) => set("photo", v)} />
      <AreaInput label="Quote" value={form.text} onChange={(v) => set("text", v)} rows={3} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <p className="text-xs text-ash">BRANCH (OPTIONAL)</p>
          <BranchSelect value={form.branchId ?? ""} onChange={(v) => set("branchId", v)} branches={branches} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <BoolToggle label="Featured" checked={form.featured} onChange={(v) => set("featured", v)} />
          <BoolToggle label="Active" checked={form.active} onChange={(v) => set("active", v)} />
        </div>
      </div>
      <SaveButton loading={saving} />
    </form>
  );
}

/* ===================================================================== */
/* CLASSES                                                                */
/* ===================================================================== */

export function ClassesAdmin() {
  const classes = useQuery(api.content.listAllClasses);
  const branches = useQuery(api.content.listAllBranches);
  const trainers = useQuery(api.content.listAllTrainers);
  const myRole = useQuery(api.adminContent.myRole);
  const save = useMutation(api.adminContent.upsertClass);
  const remove = useMutation(api.adminContent.deleteClass);
  const [editing, setEditing] = useState<Doc<"classes"> | "new" | null>(null);
  const lockedBranch = myRole?.role === "branch_manager" ? myRole.branchId : null;
  const visible = (classes ?? []).filter((c) => !lockedBranch || c.branchId === lockedBranch);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Class Schedule"
        description="Weekly timetable with capacity and live availability."
        action={
          <Button className="gap-2 bg-lime text-carbon hover:bg-lime/90" onClick={() => setEditing("new")}>
            <Plus className="size-4" /> Add Class
          </Button>
        }
      />
      {!classes && <SkeletonRows />}
      {classes && visible.length === 0 && <EmptyState text="No classes yet." />}
      <div className="space-y-3">
        {visible.map((c) => (
          <div key={c._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-graphite px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-bone">
                {c.name}
                <span className="ml-2 rounded-full bg-white/5 px-2 py-0.5 font-data text-[9px] uppercase tracking-wider text-lime">{c.type}</span>
              </p>
              <p className="mt-0.5 font-data text-xs text-ash">
                {c.day} · {c.startTime}–{c.endTime} · {c.room} ·{" "}
                {branches?.find((b) => b._id === c.branchId)?.name ?? ""} ·{" "}
                {trainers?.find((t) => t._id === c.trainerId)?.name ?? "Staff"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn("font-data text-[11px] font-semibold", c.capacity - c.booked <= 3 ? "text-flame" : "text-lime")}>
                {c.booked}/{c.capacity}
              </span>
              <Button variant="outline" size="sm" className="gap-1.5 border-white/15 text-bone hover:border-lime/50 hover:text-lime" onClick={() => setEditing(c)}>
                <Pencil className="size-3.5" /> Edit
              </Button>
              <ConfirmDelete onConfirm={async () => { await remove({ id: c._id }); toast.success("Class deleted."); }} />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="border-white/10 bg-graphite text-bone sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display uppercase">
              {editing === "new" ? "New Class" : "Edit Class"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <ClassForm
              key={editing === "new" ? "new" : editing._id}
              initial={editing === "new" ? null : editing}
              branches={branches ?? []}
              trainers={trainers ?? []}
              lockedBranchId={lockedBranch}
              onSave={async (args) => {
                try {
                  await save(args as never);
                  toast.success("Class saved.");
                  setEditing(null);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Save failed.");
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClassForm({
  initial,
  branches,
  trainers,
  lockedBranchId,
  onSave,
}: {
  initial: Doc<"classes"> | null;
  branches: Doc<"branches">[];
  trainers: Doc<"trainers">[];
  lockedBranchId: Id<"branches"> | null;
  onSave: (args: Record<string, unknown>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    type: initial?.type ?? "Strength",
    branchId: initial?.branchId ?? lockedBranchId ?? "",
    trainerId: initial?.trainerId ?? "",
    day: initial?.day ?? "Monday",
    startTime: initial?.startTime ?? "18:00",
    endTime: initial?.endTime ?? "19:00",
    room: initial?.room ?? "Studio A",
    capacity: initial?.capacity ?? 20,
    booked: initial?.booked ?? 0,
    active: initial?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ id: initial?._id, ...form, trainerId: form.trainerId || undefined });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <LineInput label="Class name" value={form.name} onChange={(v) => set("name", v)} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <p className="text-xs text-ash">TYPE</p>
          <Select value={form.type} onValueChange={(v) => set("type", v as typeof form.type)}>
            <SelectTrigger className="border-white/10 bg-carbon text-bone"><SelectValue /></SelectTrigger>
            <SelectContent className="border-white/10 bg-graphite text-bone">
              {CLASS_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <p className="text-xs text-ash">BRANCH</p>
          <BranchSelect value={form.branchId} onChange={(v) => set("branchId", v)} branches={branches} />
        </div>
        <div className="grid gap-1.5">
          <p className="text-xs text-ash">COACH</p>
          <Select value={form.trainerId ?? ""} onValueChange={(v) => set("trainerId", v)}>
            <SelectTrigger className="border-white/10 bg-carbon text-bone"><SelectValue /></SelectTrigger>
            <SelectContent className="border-white/10 bg-graphite text-bone">
              <SelectItem value="__none__">Staff Coach</SelectItem>
              {trainers.map((t) => (
                <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <p className="text-xs text-ash">DAY</p>
          <Select value={form.day} onValueChange={(v) => set("day", v)}>
            <SelectTrigger className="border-white/10 bg-carbon text-bone"><SelectValue /></SelectTrigger>
            <SelectContent className="border-white/10 bg-graphite text-bone">
              {DAYS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <p className="text-xs text-ash">STARTS</p>
          <input type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} className="rounded-md border border-white/10 bg-carbon px-3 py-2 font-data text-xs text-bone" />
        </div>
        <div className="grid gap-1.5">
          <p className="text-xs text-ash">ENDS</p>
          <input type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} className="rounded-md border border-white/10 bg-carbon px-3 py-2 font-data text-xs text-bone" />
        </div>
        <LineInput label="Room / zone" value={form.room} onChange={(v) => set("room", v)} />
        <div className="grid grid-cols-2 gap-3">
          <NumInput label="Capacity" value={form.capacity} onChange={(v) => set("capacity", v)} min={1} />
          <NumInput label="Booked" value={form.booked} onChange={(v) => set("booked", Math.max(0, v))} min={0} />
        </div>
      </div>
      <BoolToggle label="Active" checked={form.active} onChange={(v) => set("active", v)} />
      <SaveButton loading={saving} />
    </form>
  );
}
