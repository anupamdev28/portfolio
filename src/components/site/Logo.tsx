import { Link } from "react-router";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      to="/"
      className={cn("group flex items-center gap-2.5", className)}
      aria-label="BR FITNESS home"
    >
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-md bg-lime transition-shadow group-hover:glow-lime">
        <span className="font-display text-sm font-bold text-carbon">BR</span>
      </span>
      {!compact && (
        <span className="font-display text-lg font-semibold tracking-tight text-bone">
          FITNESS
        </span>
      )}
    </Link>
  );
}
