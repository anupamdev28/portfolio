import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  Facebook,
  Instagram,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Logo } from "./Logo";
import { Reveal } from "./ui";

export function Footer() {
  const { isAuthenticated } = useAuth();
  const settings = useQuery(api.content.getSettings);
  const branches = useQuery(api.content.listBranches);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("You're on the list — first-month offer incoming.", {
      description: "Check your inbox for a welcome note from the BR team.",
    });
    setEmail("");
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/8 bg-carbon">
      <div className="grain absolute inset-0" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-lime/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-8 border-b border-white/8 pb-12 md:flex-row">
            <div className="max-w-md">
              <Logo />
              <p className="mt-5 text-sm leading-6 text-ash">
                Three clubs. One standard. Premium training floors, elite
                coaching and recovery-grade facilities — built for people who
                take the work seriously.
              </p>
              <div className="mt-6 flex gap-3">
                {[
                  { icon: Instagram, href: settings?.instagram ?? "#" },
                  { icon: Facebook, href: settings?.facebook ?? "#" },
                  { icon: Youtube, href: settings?.youtube ?? "#" },
                ].map(({ icon: Icon, href }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Social link"
                    className="grid size-10 place-items-center rounded-md border border-white/10 text-ash transition-all hover:border-lime/50 hover:text-lime"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>

            <form
              onSubmit={subscribe}
              className="w-full max-w-sm"
              aria-label="Newsletter signup"
            >
              <p className="micro-label mb-3">JOIN THE CREW</p>
              <p className="mb-4 text-sm text-ash">
                Training plans, member-only offers and drop dates. No spam.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="h-11 border-white/10 bg-white/5 text-bone placeholder:text-ash/60"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-11 w-11 shrink-0 bg-lime text-carbon hover:bg-lime/90"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          </div>
        </Reveal>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="micro-label mb-4">CLUB</p>
            <ul className="space-y-2.5 text-sm text-ash">
              {[
                "Facilities",
                "Programs & Classes",
                "Trainers",
                "Membership",
                "Transformations",
              ].map((l) => (
                <li key={l}>
                  <button
                    onClick={() => {
                      const id = l.toLowerCase().includes("member")
                        ? "pricing"
                        : l.toLowerCase();
                      navigate("/");
                      setTimeout(
                        () =>
                          document
                            .getElementById(id)
                            ?.scrollIntoView({ behavior: "smooth" }),
                        350,
                      );
                    }}
                    className="transition-colors hover:text-lime"
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="micro-label mb-4">VISIT US</p>
            <ul className="space-y-4 text-sm text-ash">
              {branches?.map((b) => (
                <li key={b._id}>
                  <button
                    onClick={() => navigate(`/branch/${b._id}`)}
                    className="group flex items-start gap-2 text-left"
                  >
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-lime/70" />
                    <span>
                      <span className="block font-medium text-bone transition-colors group-hover:text-lime">
                        {b.name}
                      </span>
                      <span className="text-xs">{b.address}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="micro-label mb-4">MEMBERS</p>
            <ul className="space-y-2.5 text-sm text-ash">
              <li>
                <button
                  onClick={() =>
                    isAuthenticated
                      ? navigate("/dashboard")
                      : navigate("/auth")
                  }
                  className="transition-colors hover:text-lime"
                >
                  Member Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/auth")}
                  className="transition-colors hover:text-lime"
                >
                  Book a Free Trial
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/admin")}
                  className="transition-colors hover:text-lime"
                >
                  Staff / Admin
                </button>
              </li>
            </ul>
          </div>

          <div>
            <p className="micro-label mb-4">CONTACT</p>
            <ul className="space-y-3 text-sm text-ash">
              <li className="flex items-center gap-2">
                <Phone className="size-3.5 text-lime/70" />
                {settings?.contactPhone ?? "+1 (212) 555-0100"}
              </li>
              <li>
                <a
                  href={`mailto:${settings?.contactEmail ?? "hello@brfitness.com"}`}
                  className="transition-colors hover:text-lime"
                >
                  {settings?.contactEmail ?? "hello@brfitness.com"}
                </a>
              </li>
              <li className="text-xs leading-5">
                {settings?.address ?? "12 Steel Avenue, New York"}
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 sm:flex-row">
          <p className="text-xs text-ash/70">
            © {new Date().getFullYear()} BR FITNESS. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-ash/70">
            <a href="#" className="transition-colors hover:text-bone">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-bone">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-bone">
              Accessibility
            </a>
          </div>
          <span className="font-display text-xs font-semibold tracking-[0.3em] text-bone/30">
            EST. 2024
          </span>
        </div>
      </div>
    </footer>
  );
}
