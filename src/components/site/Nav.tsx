import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Menu, Shield, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Logo } from "./Logo";
import { Magnetic } from "./ui";

const SECTIONS = [
  { id: "facilities", label: "Facilities" },
  { id: "programs", label: "Programs" },
  { id: "pricing", label: "Pricing" },
  { id: "branches", label: "Branches" },
  { id: "contact", label: "Contact" },
];

export function Nav() {
  const { isAuthenticated, user, isLoading, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const goSection = (id: string) => {
    setOpen(false);
    if (location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(
        () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
        350,
      );
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const staff = user?.role === "admin" || user?.role === "branch_manager";

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-white/8 bg-carbon/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => goSection(s.id)}
                className="group relative px-4 py-2 text-[13px] font-medium tracking-wide text-bone/80 transition-colors hover:text-bone"
              >
                {s.label}
                <span className="absolute inset-x-4 bottom-1 h-px origin-left scale-x-0 bg-lime transition-transform duration-300 group-hover:scale-x-100" />
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {isLoading ? null : isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="gap-2 text-bone/85 hover:bg-white/5 hover:text-bone"
                  onClick={() => navigate("/dashboard")}
                >
                  <User className="size-4" />
                  <span className="max-w-28 truncate">
                    {user?.name ?? "Member"}
                  </span>
                  <ChevronDown className="size-3.5 text-ash" />
                </Button>
                {staff && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-lime/30 text-lime hover:bg-lime/10"
                    onClick={() => navigate("/admin")}
                  >
                    <Shield className="size-3.5" />
                    Admin
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Sign out"
                  onClick={handleSignOut}
                  className="text-ash hover:text-flame"
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-bone/85 hover:bg-white/5 hover:text-bone"
                  onClick={() => navigate("/auth")}
                >
                  Sign in
                </Button>
                <Magnetic strength={0.25}>
                  <Button
                    className="gap-2 bg-lime text-carbon hover:bg-lime/90 glow-lime"
                    onClick={() => navigate("/auth")}
                  >
                    Book Free Trial
                  </Button>
                </Magnetic>
              </>
            )}
          </div>

          <button
            className="grid size-10 place-items-center rounded-md text-bone lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </motion.header>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex flex-col bg-carbon lg:hidden"
          >
            <div className="grain absolute inset-0" />
            <div className="relative mt-24 flex flex-1 flex-col justify-between px-6 pb-10">
              <nav className="flex flex-col gap-2" aria-label="Mobile">
                {SECTIONS.map((s, i) => (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    onClick={() => goSection(s.id)}
                    className="headline-xl flex items-baseline gap-4 py-3 text-left text-4xl text-bone/90"
                  >
                    <span className="font-data text-sm text-lime">
                      0{i + 1}
                    </span>
                    {s.label}
                  </motion.button>
                ))}
              </nav>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="flex flex-col gap-3"
              >
                {isAuthenticated ? (
                  <>
                    <Button
                      size="lg"
                      className="w-full bg-lime text-carbon hover:bg-lime/90"
                      onClick={() => navigate("/dashboard")}
                    >
                      Member Dashboard
                    </Button>
                    {staff && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full border-lime/30 text-lime"
                        onClick={() => navigate("/admin")}
                      >
                        Admin Panel
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="lg"
                      className="w-full text-ash"
                      onClick={handleSignOut}
                    >
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      className="w-full bg-lime text-carbon hover:bg-lime/90 glow-lime"
                      onClick={() => navigate("/auth")}
                    >
                      Book Free Trial
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => navigate("/auth")}
                    >
                      Sign in / Join
                    </Button>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
