import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "convex/react";
import { Check, Copy, Link2, Loader2, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
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

/* ===================================================================== */
/* MEDIA LIBRARY                                                          */
/* ===================================================================== */

export function MediaAdmin() {
  const media = useQuery(api.content.listMedia);
  const generateUploadUrl = useMutation(api.media.generateUploadUrl);
  const saveMedia = useMutation(api.media.saveMedia);
  const saveMediaUrl = useMutation(api.media.saveMediaUrl);
  const remove = useMutation(api.media.deleteMedia);

  const folders = useMemo(() => {
    const set = new Set<string>();
    (media ?? []).forEach((m) => set.add(m.folder));
    return ["All", ...Array.from(set)];
  }, [media]);

  const [folder, setFolder] = useState("All");
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const visible = (media ?? []).filter(
    (m) => folder === "All" || m.folder === folder,
  );

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await generateUploadUrl();
      const result = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!result.ok) throw new Error("Upload failed.");
      const { storageId } = (await result.json()) as { storageId: string };
      await saveMedia({
        storageId: storageId as Id<"_storage">,
        name: file.name,
        folder: folder === "All" ? "Uploads" : folder,
        size: file.size,
        mimeType: file.type,
      });
      toast.success(`${file.name} uploaded.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const copyUrl = async (m: Doc<"media">) => {
    try {
      await navigator.clipboard.writeText(m.url);
      setCopiedId(m._id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error("Could not copy.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Media Library"
        description="Upload, organize and reuse images across the site."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-2 border-white/15 text-bone hover:border-lime/50 hover:text-lime"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {uploading ? "Uploading…" : "Upload"}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                files.forEach((f) => void handleFile(f));
              }}
            />
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {folders.map((f) => (
          <button
            key={f}
            onClick={() => setFolder(f)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
              folder === f
                ? "border-lime/60 bg-lime/10 text-lime"
                : "border-white/10 text-ash hover:text-bone",
            )}
          >
            {f}
            <span className="ml-1.5 font-data text-[10px] opacity-70">
              {f === "All" ? media?.length ?? 0 : media?.filter((m) => m.folder === f).length ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Add external URL */}
      <div className="flex flex-col gap-2 rounded-xl border border-white/8 bg-graphite p-4 sm:flex-row sm:items-center">
        <Link2 className="size-4 shrink-0 text-ash" />
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Paste an image URL to add to the library…"
          className="flex-1 rounded-md border border-white/10 bg-carbon px-3 py-2 text-xs text-bone placeholder:text-ash/60"
        />
        <Button
          size="sm"
          variant="outline"
          className="border-white/15 text-bone hover:border-lime/50 hover:text-lime"
          onClick={async () => {
            if (!urlInput.trim()) return;
            await saveMediaUrl({
              url: urlInput.trim(),
              name: urlInput.split("/").pop()?.slice(0, 40) ?? "image",
              folder: folder === "All" ? "Uploads" : folder,
            });
            toast.success("Added to library.");
            setUrlInput("");
          }}
        >
          Add
        </Button>
      </div>

      {!media && <SkeletonRows rows={6} />}
      {media && visible.length === 0 && <EmptyState text="No media in this folder yet." />}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((m) => (
          <div
            key={m._id}
            className="group overflow-hidden rounded-xl border border-white/8 bg-graphite"
          >
            <div className="relative aspect-square overflow-hidden bg-carbon">
              <img
                src={m.url}
                alt={m.alt ?? m.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <button
                onClick={() => copyUrl(m)}
                className="absolute right-2 top-2 grid size-8 place-items-center rounded-md bg-carbon/85 text-bone backdrop-blur transition-colors hover:text-lime"
                aria-label="Copy URL"
              >
                {copiedId === m._id ? (
                  <Check className="size-3.5 text-lime" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between gap-2 p-2.5">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-bone">{m.name}</p>
                <p className="font-data text-[9px] uppercase tracking-wider text-ash">
                  {m.folder}
                  {m.size ? ` · ${Math.round(m.size / 1024)}KB` : ""}
                </p>
              </div>
              <ConfirmDelete
                onConfirm={async () => {
                  await remove({ id: m._id });
                  toast.success("Media deleted.");
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================================================================== */
/* SITE SETTINGS                                                          */
/* ===================================================================== */

export function SettingsAdmin() {
  const settings = useQuery(api.content.getSettings);
  const save = useMutation(api.adminContent.updateSiteSettings);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<{
    heroHeadline: string;
    heroSubheadline: string;
    aboutTitle: string;
    aboutBody: string;
    stats: { members: number; classesRun: number; rating: number; locations: number };
    contactEmail: string;
    contactPhone: string;
    instagram: string;
    facebook: string;
    youtube: string;
    address: string;
  } | null>(null);

  const current = form ?? {
    heroHeadline: settings?.heroHeadline ?? "FORGE YOUR STRONGEST SELF",
    heroSubheadline:
      settings?.heroSubheadline ??
      "Premium training floors, elite coaching and a recovery wing at three clubs across the city. Your first session is on us.",
    aboutTitle: settings?.aboutTitle ?? "BUILT DIFFERENT, ON PURPOSE",
    aboutBody:
      settings?.aboutBody ??
      "BR FITNESS started with one idea: a gym that treats training like a craft.",
    stats: settings?.stats ?? { members: 4820, classesRun: 12600, rating: 4.9, locations: 3 },
    contactEmail: settings?.contactEmail ?? "hello@brfitness.com",
    contactPhone: settings?.contactPhone ?? "+1 (212) 555-0100",
    instagram: settings?.instagram ?? "https://instagram.com",
    facebook: settings?.facebook ?? "https://facebook.com",
    youtube: settings?.youtube ?? "https://youtube.com",
    address: settings?.address ?? "12 Steel Avenue, New York, NY 10018",
  };

  const set = <K extends keyof typeof current>(k: K, v: (typeof current)[K]) =>
    setForm((f) => ({ ...(f ?? current), [k]: v }));

  if (settings === undefined) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Site Settings" />
        <SkeletonRows rows={5} />
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await save(current);
      toast.success("Settings published to the live site.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Site Settings"
        description="Homepage hero, about manifesto, stats and contact details."
      />

      <div className="rounded-2xl border border-white/8 bg-graphite p-6">
        <p className="micro-label mb-4 text-[9px]!">HOMEPAGE HERO</p>
        <div className="flex flex-col gap-4">
          <LineInput label="Hero headline" value={current.heroHeadline} onChange={(v) => set("heroHeadline", v)} />
          <AreaInput label="Hero subheadline" value={current.heroSubheadline} onChange={(v) => set("heroSubheadline", v)} rows={2} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-graphite p-6">
        <p className="micro-label mb-4 text-[9px]!">ABOUT / PHILOSOPHY</p>
        <div className="flex flex-col gap-4">
          <LineInput label="Section title" value={current.aboutTitle} onChange={(v) => set("aboutTitle", v)} />
          <AreaInput label="Manifesto text" value={current.aboutBody} onChange={(v) => set("aboutBody", v)} rows={4} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-graphite p-6">
        <p className="micro-label mb-4 text-[9px]!">LIVE STATS (HERO TICKER)</p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <NumInput label="Members" value={current.stats.members} onChange={(v) => set("stats", { ...current.stats, members: v })} />
          <NumInput label="Classes run" value={current.stats.classesRun} onChange={(v) => set("stats", { ...current.stats, classesRun: v })} />
          <NumInput label="Rating" value={current.stats.rating} onChange={(v) => set("stats", { ...current.stats, rating: v })} step="0.1" />
          <NumInput label="Locations" value={current.stats.locations} onChange={(v) => set("stats", { ...current.stats, locations: v })} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-graphite p-6">
        <p className="micro-label mb-4 text-[9px]!">CONTACT & SOCIALS</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <LineInput label="Contact email" value={current.contactEmail} onChange={(v) => set("contactEmail", v)} />
          <LineInput label="Contact phone" value={current.contactPhone} onChange={(v) => set("contactPhone", v)} />
          <LineInput label="Instagram URL" value={current.instagram} onChange={(v) => set("instagram", v)} />
          <LineInput label="Facebook URL" value={current.facebook} onChange={(v) => set("facebook", v)} />
          <LineInput label="YouTube URL" value={current.youtube} onChange={(v) => set("youtube", v)} />
          <LineInput label="HQ address" value={current.address} onChange={(v) => set("address", v)} />
        </div>
      </div>

      <SaveButton loading={saving}>Publish Settings</SaveButton>
    </form>
  );
}

/* ===================================================================== */
/* MEMBERS                                                                */
/* ===================================================================== */

function RoleRow({
  member,
  branches,
  setRole,
}: {
  member: { _id: string; name: string | null; email: string | null; role: string | null; createdAt: number };
  branches: Doc<"branches">[];
  setRole: (args: {
    userId: Id<"users">;
    role: "member" | "admin" | "branch_manager";
    branchId?: Id<"branches">;
  }) => Promise<unknown>;
}) {
  const [role, setRoleLocal] = useState<string>(member.role ?? "member");
  const [branchId, setBranchId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const apply = async (nextRole: string, nextBranch?: string) => {
    setSaving(true);
    try {
      await setRole({
        userId: member._id as Id<"users">,
        role: nextRole as "member" | "admin" | "branch_manager",
        branchId: nextRole === "branch_manager" ? ((nextBranch || undefined) as Id<"branches"> | undefined) : undefined,
      });
      toast.success("Role updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="border-b border-white/5 last:border-0">
      <td className="px-4 py-3">
        <p className="font-medium text-bone">{member.name ?? "Guest"}</p>
        <p className="font-data text-[11px] text-ash">{member.email ?? "no email"}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={role} onValueChange={(v) => { setRoleLocal(v); void apply(v, branchId); }} disabled={saving}>
            <SelectTrigger className="h-8 w-40 border-white/10 bg-carbon font-data text-xs text-bone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-graphite text-bone">
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Super Admin</SelectItem>
              <SelectItem value="branch_manager">Branch Manager</SelectItem>
            </SelectContent>
          </Select>
          {role === "branch_manager" && (
            <Select value={branchId} onValueChange={(v) => { setBranchId(v); void apply("branch_manager", v); }} disabled={saving}>
              <SelectTrigger className="h-8 w-44 border-white/10 bg-carbon font-data text-xs text-bone">
                <SelectValue placeholder="Pick branch" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-graphite text-bone">
                {branches.map((b) => (
                  <SelectItem key={b._id} value={b._id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </td>
      <td className="hidden px-4 py-3 font-data text-xs text-ash sm:table-cell">
        {new Date(member.createdAt).toLocaleDateString()}
      </td>
    </tr>
  );
}

export function MembersAdmin() {
  const members = useQuery(api.adminContent.listMembers);
  const branches = useQuery(api.content.listAllBranches);
  const setRole = useMutation(api.adminContent.setUserRole);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Members"
        description="Promote members to staff roles. Branch managers can only edit their own branch."
      />
      {!members && <SkeletonRows />}
      <div className="overflow-x-auto rounded-2xl border border-white/8 bg-graphite">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/8 text-[10px] uppercase tracking-widest text-ash">
              <th className="px-4 py-3 font-medium">MEMBER</th>
              <th className="px-4 py-3 font-medium">ROLE</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">JOINED</th>
            </tr>
          </thead>
          <tbody>
            {members?.map((m) => (
              <RoleRow key={m._id} member={m} branches={branches ?? []} setRole={setRole} />
            ))}
          </tbody>
        </table>
        {members && members.length === 0 && <EmptyState text="No members yet." />}
      </div>
    </div>
  );
}

/* ===================================================================== */
/* ACTIVITY LOG                                                            */
/* ===================================================================== */

export function ActivityAdmin() {
  const logs = useQuery(api.adminContent.listActivityLogs);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Activity Log"
        description="Who changed what, and when — across the whole site."
      />
      {!logs && <SkeletonRows />}
      <div className="rounded-2xl border border-white/8 bg-graphite">
        <div className="divide-y divide-white/5">
          {logs?.map((l) => (
            <div key={l._id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm text-bone/90">
                  <span className="font-semibold text-bone">{l.userName}</span>{" "}
                  {l.action}
                </p>
                <p className="truncate font-data text-[11px] text-ash">{l.target}</p>
              </div>
              <span className="shrink-0 font-data text-[11px] text-ash">
                {new Date(l._creationTime).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
        {logs && logs.length === 0 && <EmptyState text="No activity yet." />}
      </div>
    </div>
  );
}

/* ===================================================================== */
/* BOOKINGS                                                               */
/* ===================================================================== */

const BOOKING_STATUS = ["pending", "confirmed", "cancelled"] as const;

export function BookingsAdmin() {
  const bookings = useQuery(api.adminContent.listBookings);
  const branches = useQuery(api.content.listAllBranches);
  const update = useMutation(api.adminContent.updateBookingStatus);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bookings"
        description="Tour & trial requests from new members."
        action={
          <div className="flex gap-2">
            <StatCard
              label="PENDING"
              value={bookings?.filter((b) => b.status === "pending").length ?? "—"}
              tint="text-flame"
            />
          </div>
        }
      />
      {!bookings && <SkeletonRows />}
      {bookings && bookings.length === 0 && <EmptyState text="No bookings yet." />}
      <div className="space-y-3">
        {bookings?.map((b) => (
          <div
            key={b._id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/8 bg-graphite px-5 py-4"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-bone">{b.userName}</p>
              <p className="font-data text-[11px] text-ash">{b.userEmail}</p>
              <p className="mt-1.5 text-xs text-ash">
                {b.type === "tour" ? "Guided Tour" : b.type === "trial" ? "Free Trial" : "Class"} ·{" "}
                <span className="text-bone/80">
                  {branches?.find((x) => x._id === b.branchId)?.name ?? "Branch"}
                </span>{" "}
                · {new Date(b.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              </p>
              {(b.phone || b.note) && (
                <p className="mt-1 truncate font-data text-[11px] text-ash/80">
                  {[b.phone, b.note].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "rounded-full px-3 py-1 font-data text-[10px] font-semibold uppercase tracking-wider",
                  b.status === "confirmed"
                    ? "bg-lime/15 text-lime"
                    : b.status === "cancelled"
                      ? "bg-flame/15 text-flame"
                      : "bg-ash/15 text-ash",
                )}
              >
                {b.status}
              </span>
              <Select
                value={b.status}
                onValueChange={async (v) => {
                  try {
                    await update({ id: b._id, status: v as (typeof BOOKING_STATUS)[number] });
                    toast.success("Booking updated.");
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Update failed.");
                  }
                }}
              >
                <SelectTrigger className="h-9 w-32 border-white/10 bg-carbon font-data text-xs text-bone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-graphite text-bone">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirm</SelectItem>
                  <SelectItem value="cancelled">Cancel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
