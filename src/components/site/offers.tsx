import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type Offer = Doc<"offers">;

export function isOfferLive(o: Offer, now = Date.now()): boolean {
  return o.active && now >= o.startDate && now <= o.expiryDate;
}

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

export function Countdown({
  expiry,
  className,
  compact = false,
}: {
  expiry: number;
  className?: string;
  compact?: boolean;
}) {
  const [left, setLeft] = useState(() => expiry - Date.now());

  useEffect(() => {
    const t = setInterval(() => setLeft(expiry - Date.now()), 1000);
    return () => clearInterval(t);
  }, [expiry]);

  if (left <= 0) return null;
  const { d, h, m, s } = parts(left);

  if (compact) {
    return (
      <span className={cn("font-data tabular-nums", className)}>
        {d > 0 ? `${d}d ` : ""}
        {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:
        {String(s).padStart(2, "0")}
      </span>
    );
  }

  const cells = [
    { v: d, l: "DAYS" },
    { v: h, l: "HRS" },
    { v: m, l: "MIN" },
    { v: s, l: "SEC" },
  ];
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {cells.map((c, i) => (
        <div
          key={c.l}
          className="flex items-center gap-2 rounded-md border border-lime/25 bg-carbon px-2.5 py-1.5"
        >
          <span className="font-data text-base font-semibold tabular-nums text-lime">
            {String(c.v).padStart(2, "0")}
          </span>
          <span className="micro-label text-[9px]!">{c.l}</span>
          {i < cells.length - 1 && (
            <span className="text-lime/40">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function OfferTag({
  offer,
  className,
}: {
  offer: Offer;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-data text-[11px] font-semibold tracking-wider",
        offer.type === "branch"
          ? "bg-flame/15 text-flame"
          : offer.type === "plan"
            ? "bg-volt/15 text-volt"
            : "bg-lime/15 text-lime",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          offer.type === "branch"
            ? "bg-flame"
            : offer.type === "plan"
              ? "bg-volt"
              : "bg-lime",
        )}
      />
      {offer.discount}
    </span>
  );
}
