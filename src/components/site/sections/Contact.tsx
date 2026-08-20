import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Reveal, SectionHeader } from "@/components/site/ui";
import { useQuery } from "convex/react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

// NYC bounding box used to project branch coordinates onto the map panel
const BOUNDS = { minLat: 40.7, maxLat: 40.9, minLng: -74.05, maxLng: -73.9 };

export function Contact() {
  const branches = useQuery(api.content.listBranches);
  const settings = useQuery(api.content.getSettings);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    toast.success("Message sent — we'll get back within 24h.", {
      description: "Thanks for reaching out to the BR FITNESS team.",
    });
    setName("");
    setEmail("");
    setMessage("");
  };

  const pinPos = (lat: number, lng: number) => ({
    left: `${((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100}%`,
    top: `${((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100}%`,
  });

  return (
    <section id="contact" className="relative bg-carbon py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="LOCATION & CONTACT"
          title={
            <>
              FIND YOUR
              <span className="text-volt"> FLOOR</span>
            </>
          }
          description="Three clubs across the city. Drop in, call, or send a message — the crew answers fast."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Stylized map */}
          <Reveal>
            <div className="relative h-[420px] overflow-hidden rounded-2xl border border-white/8 bg-graphite">
              <div className="absolute inset-0 bg-grid" />
              <div className="absolute inset-0 bg-mesh-lime opacity-30" />
              {/* faux streets */}
              <div className="absolute left-0 right-0 top-1/3 h-px rotate-[8deg] bg-white/[0.06]" />
              <div className="absolute left-0 right-0 top-2/3 h-px -rotate-[6deg] bg-white/[0.06]" />
              <div className="absolute bottom-0 left-1/4 top-0 w-px rotate-[12deg] bg-white/[0.05]" />
              <div className="absolute bottom-0 right-1/3 top-0 w-px -rotate-[10deg] bg-white/[0.05]" />

              {(branches ?? []).map((b) => (
                <button
                  key={b._id}
                  onClick={() => navigate(`/branch/${b._id}`)}
                  className="group absolute z-10 -translate-x-1/2 -translate-y-full"
                  style={pinPos(b.lat, b.lng)}
                  aria-label={`Open ${b.name}`}
                >
                  <span className="relative flex flex-col items-center">
                    <span className="rounded-full border border-lime/60 bg-carbon px-3 py-1.5 font-data text-[10px] font-semibold text-lime shadow-lg shadow-black/40 transition-transform group-hover:scale-110">
                      {b.area}
                    </span>
                    <span className="mt-1 grid size-6 place-items-center">
                      <span className="size-3 rotate-45 rounded-[2px] border-r border-b border-lime bg-carbon" />
                    </span>
                  </span>
                </button>
              ))}

              <div className="absolute bottom-4 left-4 rounded-lg bg-carbon/80 px-3 py-2 backdrop-blur">
                <p className="micro-label text-[9px]! text-lime">
                  ALL 3 BRANCHES
                </p>
                <p className="font-data text-[11px] text-ash">
                  Tap a pin to open the club
                </p>
              </div>
            </div>
          </Reveal>

          {/* Contact channels + form */}
          <div className="flex flex-col gap-6">
            <Reveal delay={0.1}>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: Phone,
                    label: "CALL US",
                    value: settings?.contactPhone ?? "+1 (212) 555-0100",
                  },
                  {
                    icon: Mail,
                    label: "EMAIL",
                    value: settings?.contactEmail ?? "hello@brfitness.com",
                  },
                  {
                    icon: MapPin,
                    label: "HQ",
                    value: "New York City",
                  },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="rounded-xl border border-white/8 bg-graphite p-4"
                  >
                    <c.icon className="size-4 text-lime" />
                    <p className="micro-label mt-3 text-[9px]!">{c.label}</p>
                    <p className="mt-1 truncate font-data text-xs text-bone">
                      {c.value}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.18}>
              <form
                onSubmit={submit}
                className="flex flex-1 flex-col gap-4 rounded-2xl border border-white/8 bg-graphite p-6"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label htmlFor="ct-name" className="micro-label text-[9px]!">
                      NAME
                    </label>
                    <Input
                      id="ct-name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Carter"
                      className="border-white/10 bg-carbon text-bone"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="ct-email" className="micro-label text-[9px]!">
                      EMAIL
                    </label>
                    <Input
                      id="ct-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@email.com"
                      className="border-white/10 bg-carbon text-bone"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="ct-msg" className="micro-label text-[9px]!">
                    MESSAGE
                  </label>
                  <Textarea
                    id="ct-msg"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="I'm interested in a membership / a tour / the Uptown offer…"
                    className="min-h-28 border-white/10 bg-carbon text-bone"
                  />
                </div>
                <Button
                  type="submit"
                  className="mt-1 gap-2 self-start bg-lime text-carbon hover:bg-lime/90 glow-lime"
                >
                  <Send className="size-4" />
                  Send Message
                </Button>
              </form>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
