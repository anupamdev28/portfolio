import { Cursor } from "@/components/site/Cursor";
import { Footer } from "@/components/site/Footer";
import { Nav } from "@/components/site/Nav";
import { Preloader } from "@/components/site/Preloader";
import { About } from "@/components/site/sections/About";
import { Branches } from "@/components/site/sections/Branches";
import { Contact } from "@/components/site/sections/Contact";
import { Facilities } from "@/components/site/sections/Facilities";
import { Hero } from "@/components/site/sections/Hero";
import { MarqueeBand } from "@/components/site/sections/MarqueeBand";
import { Pricing } from "@/components/site/sections/Pricing";
import { Programs } from "@/components/site/sections/Programs";
import { Schedule } from "@/components/site/sections/Schedule";
import { Testimonials } from "@/components/site/sections/Testimonials";
import { Trainers } from "@/components/site/sections/Trainers";
import { Transformations } from "@/components/site/sections/Transformations";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

export default function Landing() {
  const [showPreloader, setShowPreloader] = useState(true);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001,
  });
  const { hash } = useLocation();

  // Deep-link to a section (e.g. /#pricing from the dashboard).
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => {
      document
        .getElementById(hash.slice(1))
        ?.scrollIntoView({ behavior: "smooth" });
    }, 400);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <>
      <AnimatePresence>
        {showPreloader && <Preloader onDone={() => setShowPreloader(false)} />}
      </AnimatePresence>

      {/* Scroll progress bar */}
      <motion.div
        className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-lime"
        style={{ scaleX: progress }}
      />

      <Cursor />
      <Nav />

      <main>
        <Hero />
        <MarqueeBand />
        <About />
        <Facilities />
        <Programs />
        <Schedule />
        <Trainers />
        <Transformations />
        <Pricing />
        <Branches />
        <Testimonials />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
