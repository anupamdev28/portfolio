import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold uppercase text-bone">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-ash">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  tint = "text-lime",
}: {
  label: string;
  value: string | number;
  tint?: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-graphite p-4">
      <p className="micro-label text-[9px]!">{label}</p>
      <p className={`mt-2 font-data text-2xl font-semibold ${tint}`}>{value}</p>
    </div>
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-xl border border-white/8 bg-white/[0.04]"
        />
      ))}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 p-10 text-center">
      <p className="text-sm text-ash">{text}</p>
    </div>
  );
}

export function LineInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-ash">{label}</Label>
      <Input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="border-white/10 bg-carbon text-bone"
      />
    </div>
  );
}

export function NumInput({
  label,
  value,
  onChange,
  step = "1",
  min,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: string;
  min?: number;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-ash">{label}</Label>
      <Input
        type="number"
        step={step}
        min={min}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border-white/10 bg-carbon font-data text-bone"
      />
    </div>
  );
}

export function AreaInput({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-ash">{label}</Label>
      <Textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="border-white/10 bg-carbon text-bone"
      />
    </div>
  );
}

/** One-item-per-line editor for string arrays (features, amenities…). */
export function ListEditor({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-ash">
        {label} <span className="text-ash/50">(one per line)</span>
      </Label>
      <Textarea
        rows={Math.max(3, values.length + 1)}
        value={values.join("\n")}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))
        }
        className="border-white/10 bg-carbon font-data text-xs text-bone"
      />
    </div>
  );
}

export function BoolToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-carbon px-3 py-2.5">
      <Label className="text-xs text-bone">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function ConfirmDelete({
  onConfirm,
  label = "Delete",
  title = "Delete this item?",
  description = "This cannot be undone.",
}: {
  onConfirm: () => void;
  label?: string;
  title?: string;
  description?: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          className="text-ash hover:bg-flame/10 hover:text-flame"
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-white/10 bg-graphite text-bone">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-ash">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/15 text-bone hover:bg-white/5">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-flame text-white hover:bg-flame/90"
          >
            {label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function SaveButton({
  loading,
  children = "Save changes",
}: {
  loading: boolean;
  children?: ReactNode;
}) {
  return (
    <Button
      type="submit"
      disabled={loading}
      className="gap-2 bg-lime text-carbon hover:bg-lime/90 glow-lime"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Plus className="size-4" />
      )}
      {children}
    </Button>
  );
}
