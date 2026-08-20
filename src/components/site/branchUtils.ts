import type { Doc } from "@/convex/_generated/dataModel";

type Branch = Doc<"branches">;

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function todayHours(branch: Branch, now = new Date()) {
  const day = DAY_ORDER[(now.getDay() + 6) % 7]; // Monday-based
  return (
    branch.hours.find((h) => h.day === day) ??
    branch.hours[0] ?? { day, open: "--:--", close: "--:--", closed: false }
  );
}

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function isOpenNow(branch: Branch, now = new Date()) {
  const h = todayHours(branch, now);
  if (h.closed) return false;
  const mins = now.getHours() * 60 + now.getMinutes();
  const open = toMinutes(h.open);
  const close = toMinutes(h.close);
  // 24h floor (00:00 -> 23:59)
  if (open === 0 && close === 1439) return true;
  return mins >= open && mins < close;
}

export function hoursLabel(h: { open: string; close: string; closed?: boolean }) {
  if (h.closed) return "Closed";
  if (h.open === "00:00" && h.close === "23:59") return "Open 24 hours";
  return `${h.open} – ${h.close}`;
}
