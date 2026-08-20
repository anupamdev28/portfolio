import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { CalendarDays, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

type Branch = Doc<"branches">;

export function BookTourButton({
  branch,
  label = "Book a Tour",
  variant = "default",
  size = "default",
  className,
}: {
  branch: Branch;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const bookTour = useMutation(api.bookings.bookTour);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [type, setType] = useState<"tour" | "trial">("tour");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const openDialog = () => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate(
        `/auth?returnTo=${encodeURIComponent(location.pathname + location.search)}`,
      );
      return;
    }
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    setSubmitting(true);
    try {
      await bookTour({
        branchId: branch._id,
        type,
        date: new Date(`${date}T12:00:00`).getTime(),
        phone: phone || undefined,
        note: note || undefined,
      });
      toast.success("Visit booked — see you on the floor!", {
        description: `${branch.name} · ${new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}. Our team will confirm shortly.`,
      });
      setOpen(false);
      setDate("");
      setPhone("");
      setNote("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not book — try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          onClick={openDialog}
          className={className}
        >
          <CalendarDays className="size-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-graphite text-bone sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase">
            Book your visit
          </DialogTitle>
          <DialogDescription className="text-ash">
            {branch.name} — free guided tour or a full trial session. No
            contract, no pressure.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="bk-type" className="text-xs text-ash">
              VISIT TYPE
            </Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as "tour" | "trial")}
            >
              <SelectTrigger id="bk-type" className="border-white/10 bg-carbon">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-graphite">
                <SelectItem value="tour">Guided Tour (30 min)</SelectItem>
                <SelectItem value="trial">Free Trial Session (full workout)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bk-date" className="text-xs text-ash">
              PREFERRED DATE
            </Label>
            <Input
              id="bk-date"
              type="date"
              min={today}
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-white/10 bg-carbon text-bone"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bk-phone" className="text-xs text-ash">
              PHONE <span className="text-ash/50">(optional)</span>
            </Label>
            <Input
              id="bk-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="border-white/10 bg-carbon text-bone"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bk-note" className="text-xs text-ash">
              NOTES <span className="text-ash/50">(optional)</span>
            </Label>
            <Textarea
              id="bk-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Goals, injuries, preferred time of day…"
              className="min-h-20 border-white/10 bg-carbon text-bone"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting || !date}
            className="mt-1 w-full bg-lime text-carbon hover:bg-lime/90 glow-lime"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
