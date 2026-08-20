import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ---------------------------------------------------------------------------
// Public queries — consumed by the landing page, branch pages and member hub.
// All are reactive subscriptions backed by Convex.
// ---------------------------------------------------------------------------

export const listBranches = query({
  args: {},
  handler: async (ctx) => {
    const branches = await ctx.db
      .query("branches")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    return branches.sort((a, b) => a.order - b.order);
  },
});

export const listAllBranches = query({
  args: {},
  handler: async (ctx) => {
    const branches = await ctx.db.query("branches").collect();
    return branches.sort((a, b) => a.order - b.order);
  },
});

export const getBranch = query({
  args: { id: v.id("branches") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const listPlans = query({
  args: {},
  handler: async (ctx) => {
    const plans = await ctx.db
      .query("plans")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    return plans.sort((a, b) => a.order - b.order);
  },
});

export const listAllPlans = query({
  args: {},
  handler: async (ctx) => {
    const plans = await ctx.db.query("plans").collect();
    return plans.sort((a, b) => a.order - b.order);
  },
});

export const listOffers = query({
  args: {},
  handler: async (ctx) => {
    const offers = await ctx.db
      .query("offers")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    return offers.sort((a, b) => a.expiryDate - b.expiryDate);
  },
});

export const listTrainers = query({
  args: {},
  handler: async (ctx) => {
    const trainers = await ctx.db
      .query("trainers")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
    return trainers.sort((a, b) => a.order - b.order);
  },
});

export const listAllTrainers = query({
  args: {},
  handler: async (ctx) => {
    const trainers = await ctx.db.query("trainers").collect();
    return trainers.sort((a, b) => a.order - b.order);
  },
});

export const listTestimonials = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("testimonials")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
    return items;
  },
});

export const listAllTestimonials = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("testimonials").collect();
  },
});

export const listClasses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("classes")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

export const listAllClasses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("classes").collect();
  },
});

export const listMedia = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("media").collect();
    return items.sort(
      (a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0),
    );
  },
});

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("siteSettings").first();
  },
});

export const adminExists = query({
  args: {},
  handler: async (ctx) => {
    const admins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .collect();
    return admins.length > 0;
  },
});

// ---------------------------------------------------------------------------
// Seed data — demo-ready content for the 3 branches. Idempotent: only runs
// when no branches exist yet.
// ---------------------------------------------------------------------------

const img = (id: string, w = 1400) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

const PHOTOS = {
  hero: img("photo-1534438327276-14e5300c3a48", 1920),
  floor: img("photo-1517836357463-d25dfeac3438", 1600),
  weights: img("photo-1532029837206-abbe2b7620e3", 1600),
  kettlebell: img("photo-1517963879433-6ad2b056d712", 1200),
  treadmill: img("photo-1576678927484-cc907957088c", 1600),
  boxing: img("photo-1549719386-74dfcbf7dbed", 1600),
  yoga: img("photo-1575052814086-f385e2e2ad1b", 1600),
  spin: img("photo-1538805060514-97d9cc17730c", 1600),
  coachM: img("photo-1583454110551-21f2fa2afe61", 800),
  coachF: img("photo-1571019613454-1cb2f99b2d8b", 800),
  sauna: img("photo-1600334089648-b0d9d3028eb2", 1200),
  pool: img("photo-1562778612-e1e0cda9915c", 1200),
  roof: img("photo-1521312390673-7c0785f9e4ee", 1200),
  bag: img("photo-1599058917212-d750089bc07e", 1200),
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const fullWeek = (open: string, close: string, closedDay?: string) =>
  DAYS.map((day) => ({
    day,
    open,
    close,
    closed: day === closedDay,
  }));

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("branches").first();
    if (existing) return { seeded: false, reason: "already-seeded" };

    // ---- Branches ----------------------------------------------------------
    const downtown = await ctx.db.insert("branches", {
      name: "BR FITNESS — Downtown",
      area: "Downtown",
      tagline: "The flagship. 24/7. Zero excuses.",
      description:
        "The original BR FITNESS. A 1,800 m² warehouse floor with a competition lifting platform, 40 racks, a 25 m lap pool and a dedicated recovery wing. Open around the clock because your best hours aren't always 9-to-5.",
      address: "12 Steel Avenue, Metro Heights, New York, NY 10018",
      lat: 40.7549,
      lng: -73.984,
      phone: "+1 (212) 555-0140",
      email: "downtown@brfitness.com",
      whatsapp: "+12125550140",
      hours: fullWeek("00:00", "23:59"),
      photos: [PHOTOS.hero, PHOTOS.floor, PHOTOS.pool, PHOTOS.sauna],
      coverPhoto: PHOTOS.hero,
      amenities: [
        "24/7 Access",
        "25m Pool",
        "Sauna & Steam",
        "Cold Plunge",
        "Recovery Lounge",
        "Smoothie Bar",
        "Parking",
        "Lockers",
      ],
      order: 1,
      active: true,
    });

    const west = await ctx.db.insert("branches", {
      name: "BR FITNESS — West Side",
      area: "West Side",
      tagline: "Where the fighters train.",
      description:
        "Raw, loud and built for performance. The West Side club is centred on a full-size boxing ring, a 400 m² turf zone and a heavy-bag wall that never sleeps. If you want to be pushed past comfortable, this is home.",
      address: "45 Foundry Street, Iron District, New York, NY 10001",
      lat: 40.7455,
      lng: -74.0074,
      phone: "+1 (212) 555-0166",
      email: "west@brfitness.com",
      whatsapp: "+12125550166",
      hours: fullWeek("05:00", "23:00", "Sunday"),
      photos: [PHOTOS.boxing, PHOTOS.bag, PHOTOS.floor],
      coverPhoto: PHOTOS.boxing,
      amenities: [
        "Boxing Ring",
        "Turf Zone",
        "Heavy Bag Wall",
        "Sled Track",
        "Pro Shop",
        "Lockers",
        "Parking",
      ],
      order: 2,
      active: true,
    });

    const uptown = await ctx.db.insert("branches", {
      name: "BR FITNESS — Uptown",
      area: "Uptown",
      tagline: "Train hard. Recover harder.",
      description:
        "The wellness-forward club. Uptown pairs a full strength floor with a glass yoga studio, rooftop terrace, cold plunge and an in-house cafe — built for members who treat training as a lifestyle, not a chore.",
      address: "8 Summit Plaza, Ridge Boulevard, New York, NY 10025",
      lat: 40.8033,
      lng: -73.9647,
      phone: "+1 (212) 555-0188",
      email: "uptown@brfitness.com",
      whatsapp: "+12125550188",
      hours: fullWeek("06:00", "22:00", "Sunday"),
      photos: [PHOTOS.roof, PHOTOS.yoga, PHOTOS.sauna, PHOTOS.pool],
      coverPhoto: PHOTOS.roof,
      amenities: [
        "Rooftop Terrace",
        "Glass Yoga Studio",
        "Cold Plunge",
        "Sauna",
        "In-house Cafe",
        "Valet Parking",
        "Lockers",
      ],
      order: 3,
      active: true,
    });

    // ---- Membership plans --------------------------------------------------
    const basic = await ctx.db.insert("plans", {
      name: "Basic",
      tagline: "Everything you need to start.",
      priceMonthly: 29,
      priceAnnual: 290,
      currency: "USD",
      popular: false,
      active: true,
      order: 1,
      features: [
        "Full gym floor access",
        "Locker rooms & showers",
        "BR FITNESS app with workout plans",
        "1 guest pass / month",
        "Fitness assessment (once)",
      ],
    });

    const pro = await ctx.db.insert("plans", {
      name: "Pro",
      tagline: "Our most popular membership.",
      priceMonthly: 49,
      priceAnnual: 490,
      currency: "USD",
      popular: true,
      active: true,
      order: 2,
      features: [
        "Everything in Basic",
        "Unlimited group classes",
        "Sauna, steam & recovery lounge",
        "20% off PT sessions",
        "Nutrition starter plan",
        "2 guest passes / month",
      ],
    });

    const elite = await ctx.db.insert("plans", {
      name: "Elite",
      tagline: "The full BR experience.",
      priceMonthly: 79,
      priceAnnual: 790,
      currency: "USD",
      popular: false,
      active: true,
      order: 3,
      features: [
        "Everything in Pro",
        "All 3 branches, 24/7",
        "2 PT sessions / month included",
        "Pool, cold plunge & spa access",
        "Priority booking & lockers",
        "10% merch & smoothie bar discount",
      ],
    });

    // ---- Offers ------------------------------------------------------------
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    await ctx.db.insert("offers", {
      title: "First month half price",
      description:
        "New members get 50% off their first month on any plan. No contract, cancel anytime.",
      discount: "50% OFF",
      type: "sitewide",
      startDate: now - 2 * day,
      expiryDate: now + 60 * day,
      featured: true,
      active: true,
    });
    await ctx.db.insert("offers", {
      title: "Downtown — 20% off first month",
      description:
        "Join the flagship Downtown club and save 20% on your first month, plus a free onboarding session with a coach.",
      discount: "20% OFF",
      type: "branch",
      branchId: downtown,
      startDate: now - 2 * day,
      expiryDate: now + 45 * day,
      featured: false,
      active: true,
    });
    await ctx.db.insert("offers", {
      title: "West Side — free boxing starter kit",
      description:
        "Sign up at the West Side club and get wraps, gloves and a 1-on-1 fundamentals session with Coach Diego. While stocks last.",
      discount: "FREE KIT",
      type: "branch",
      branchId: west,
      startDate: now - 2 * day,
      expiryDate: now + 30 * day,
      featured: false,
      active: true,
    });
    await ctx.db.insert("offers", {
      title: "Uptown — 2 weeks free",
      description:
        "Taste the Uptown lifestyle: two full weeks free on any Pro or Elite membership, rooftop yoga included.",
      discount: "2 WEEKS FREE",
      type: "branch",
      branchId: uptown,
      startDate: now - 2 * day,
      expiryDate: now + 90 * day,
      featured: false,
      active: true,
    });
    await ctx.db.insert("offers", {
      title: "Elite upgrade — save $120",
      description:
        "Upgrade any membership to Elite and lock in your first year at the annual rate — a $120 saving.",
      discount: "SAVE $120",
      type: "plan",
      planId: elite,
      startDate: now - 2 * day,
      expiryDate: now + 120 * day,
      featured: false,
      active: true,
    });

    // ---- Trainers ----------------------------------------------------------
    const t1 = await ctx.db.insert("trainers", {
      name: "Marcus 'Tank' Reed",
      role: "Head Strength Coach",
      bio: "Former national-level powerlifter with 12 years on the floor. Marcus builds the programmes behind every BR athlete — from first-time lifters to podium finishers.",
      photo: PHOTOS.coachM,
      specialties: ["Powerlifting", "Strength", "Hypertrophy"],
      socials: { instagram: "https://instagram.com", twitter: "https://x.com" },
      branchId: downtown,
      order: 1,
      active: true,
    });
    const t2 = await ctx.db.insert("trainers", {
      name: "Aisha Bennett",
      role: "HIIT & Conditioning Coach",
      bio: "Track sprinter turned coach. Aisha's HIIT sessions are infamous — 45 minutes, zero wasted seconds, and a finish line you'll actually feel.",
      photo: PHOTOS.coachF,
      specialties: ["HIIT", "Conditioning", "Mobility"],
      socials: { instagram: "https://instagram.com" },
      branchId: downtown,
      order: 2,
      active: true,
    });
    const t3 = await ctx.db.insert("trainers", {
      name: "Diego Fuentes",
      role: "Boxing Coach",
      bio: "Ex-amateur champion with a corner-side calm and a corner-side scream. Diego teaches footwork, timing and the discipline that wins rounds.",
      photo: PHOTOS.coachM,
      specialties: ["Boxing", "Footwork", "Heavy Bag"],
      socials: { instagram: "https://instagram.com", twitter: "https://x.com" },
      branchId: west,
      order: 3,
      active: true,
    });
    const t4 = await ctx.db.insert("trainers", {
      name: "Lena Okafor",
      role: "CrossFit & Mobility Coach",
      bio: "Level-2 CrossFit coach and mobility nerd. Lena programmes WODs that scale from brand-new to games-level — and fixes your hips while she's at it.",
      photo: PHOTOS.coachF,
      specialties: ["CrossFit", "Olympic Lifting", "Mobility"],
      socials: { instagram: "https://instagram.com" },
      branchId: west,
      order: 4,
      active: true,
    });
    const t5 = await ctx.db.insert("trainers", {
      name: "Priya Nair",
      role: "Yoga & Recovery Coach",
      bio: "500-hour certified instructor blending vinyasa flow with breathwork and myofascial release. The calm at the end of every hard week.",
      photo: PHOTOS.coachF,
      specialties: ["Vinyasa", "Breathwork", "Recovery"],
      socials: { instagram: "https://instagram.com" },
      branchId: uptown,
      order: 5,
      active: true,
    });
    const t6 = await ctx.db.insert("trainers", {
      name: "Jonas Weber",
      role: "Spin & Endurance Coach",
      bio: "Former pro cyclist. Jonas turns stationary bikes into race day — power targets, climb blocks and playlists that do the motivational talking.",
      photo: PHOTOS.coachM,
      specialties: ["Spin", "Endurance", "VO2 Max"],
      socials: { instagram: "https://instagram.com" },
      branchId: uptown,
      order: 6,
      active: true,
    });

    // ---- Testimonials ------------------------------------------------------
    const testimonials: Array<{
      name: string;
      rating: number;
      text: string;
      branchId?: Id<"branches">;
      featured: boolean;
    }> = [
      {
        name: "Sofia Ramirez",
        rating: 5,
        text: "I walked in terrified of the squat rack. Marcus rebuilt my form from zero — 8 months later I hit my first 100kg squat. The Downtown club feels like family.",
        branchId: downtown,
        featured: true,
      },
      {
        name: "Dev Patel",
        rating: 5,
        text: "Tried every gym in the city before BR. The 24/7 Downtown access + recovery lounge is the reason I've actually stayed consistent for a year.",
        branchId: downtown,
        featured: true,
      },
      {
        name: "Kayla Thomas",
        rating: 5,
        text: "Diego's boxing fundamentals changed everything. First session I couldn't hold the guard, now I'm sparring twice a week. West Side is the real deal.",
        branchId: west,
        featured: true,
      },
      {
        name: "James O'Connell",
        rating: 4,
        text: "Came for the turf zone, stayed for the coaches. The WOD programming is brutal in the best way and scales to whatever level you're at.",
        branchId: west,
        featured: false,
      },
      {
        name: "Nina Petrova",
        rating: 5,
        text: "Rooftop yoga at sunrise, then a cold plunge, then matcha from the cafe. Uptown turned 'working out' into something I genuinely look forward to.",
        branchId: uptown,
        featured: true,
      },
      {
        name: "Andre Silva",
        rating: 5,
        text: "The Elite membership pays for itself with the PT sessions alone. Every branch is spotless, the app tracks my streak, and the staff know my name.",
        branchId: uptown,
        featured: false,
      },
    ];
    for (const t of testimonials) {
      await ctx.db.insert("testimonials", {
        ...t,
        active: true,
      });
    }

    // ---- Classes / schedule ------------------------------------------------
    const classes: Array<{
      name: string;
      type: "Strength" | "HIIT" | "Boxing" | "Yoga" | "CrossFit" | "Spin";
      branchId: Id<"branches">;
      trainerId?: Id<"trainers">;
      day: string;
      startTime: string;
      endTime: string;
      room: string;
      capacity: number;
      booked: number;
    }> = [
      { name: "Strength Foundations", type: "Strength", branchId: downtown, trainerId: t1, day: "Monday", startTime: "07:00", endTime: "08:00", room: "Main Floor", capacity: 16, booked: 12 },
      { name: "HIIT Burn", type: "HIIT", branchId: downtown, trainerId: t2, day: "Monday", startTime: "18:00", endTime: "18:45", room: "Studio A", capacity: 24, booked: 21 },
      { name: "Power Hour", type: "Strength", branchId: downtown, trainerId: t1, day: "Wednesday", startTime: "06:00", endTime: "07:00", room: "Platform Zone", capacity: 14, booked: 9 },
      { name: "HIIT Burn", type: "HIIT", branchId: downtown, trainerId: t2, day: "Friday", startTime: "12:15", endTime: "13:00", room: "Studio A", capacity: 24, booked: 18 },
      { name: "Boxing Fundamentals", type: "Boxing", branchId: west, trainerId: t3, day: "Tuesday", startTime: "18:30", endTime: "19:30", room: "The Ring", capacity: 16, booked: 16 },
      { name: "Heavy Bag Hour", type: "Boxing", branchId: west, trainerId: t3, day: "Thursday", startTime: "07:00", endTime: "08:00", room: "The Ring", capacity: 14, booked: 11 },
      { name: "CrossFit WOD", type: "CrossFit", branchId: west, trainerId: t4, day: "Wednesday", startTime: "18:00", endTime: "19:00", room: "Turf Zone", capacity: 20, booked: 17 },
      { name: "CrossFit WOD", type: "CrossFit", branchId: west, trainerId: t4, day: "Saturday", startTime: "10:00", endTime: "11:00", room: "Turf Zone", capacity: 20, booked: 14 },
      { name: "Sunrise Vinyasa", type: "Yoga", branchId: uptown, trainerId: t5, day: "Monday", startTime: "06:30", endTime: "07:30", room: "Glass Studio", capacity: 20, booked: 13 },
      { name: "Recovery & Breathwork", type: "Yoga", branchId: uptown, trainerId: t5, day: "Thursday", startTime: "19:00", endTime: "20:00", room: "Glass Studio", capacity: 18, booked: 8 },
      { name: "Spin City", type: "Spin", branchId: uptown, trainerId: t6, day: "Tuesday", startTime: "18:00", endTime: "18:45", room: "Spin Lab", capacity: 22, booked: 19 },
      { name: "Spin City", type: "Spin", branchId: uptown, trainerId: t6, day: "Saturday", startTime: "09:00", endTime: "09:45", room: "Spin Lab", capacity: 22, booked: 15 },
    ];
    for (const c of classes) {
      await ctx.db.insert("classes", { ...c, active: true });
    }

    // ---- Media library -----------------------------------------------------
    const media: Array<{ name: string; url: string; folder: string; alt: string }> = [
      { name: "Hero — main floor", url: PHOTOS.hero, folder: "Hero", alt: "BR FITNESS main gym floor" },
      { name: "Dumbbell rack", url: PHOTOS.floor, folder: "Facilities", alt: "Dumbbell rack" },
      { name: "Barbell platform", url: PHOTOS.weights, folder: "Facilities", alt: "Barbell lifting platform" },
      { name: "Kettlebell wall", url: PHOTOS.kettlebell, folder: "Facilities", alt: "Kettlebell wall" },
      { name: "Treadmill row", url: PHOTOS.treadmill, folder: "Facilities", alt: "Cardio deck" },
      { name: "Boxing ring", url: PHOTOS.boxing, folder: "Branches", alt: "West Side boxing ring" },
      { name: "Yoga studio", url: PHOTOS.yoga, folder: "Branches", alt: "Uptown yoga studio" },
      { name: "Sauna", url: PHOTOS.sauna, folder: "Facilities", alt: "Recovery sauna" },
      { name: "Pool", url: PHOTOS.pool, folder: "Facilities", alt: "Downtown lap pool" },
      { name: "Rooftop terrace", url: PHOTOS.roof, folder: "Branches", alt: "Uptown rooftop terrace" },
      { name: "Coach Marcus", url: PHOTOS.coachM, folder: "Trainers", alt: "Coach Marcus Reed" },
      { name: "Coach Aisha", url: PHOTOS.coachF, folder: "Trainers", alt: "Coach Aisha Bennett" },
    ];
    for (const m of media) {
      await ctx.db.insert("media", m);
    }

    // ---- Site settings -----------------------------------------------------
    await ctx.db.insert("siteSettings", {
      heroHeadline: "FORGE YOUR STRONGEST SELF",
      heroSubheadline:
        "Premium training floors, elite coaching and a recovery wing at three clubs across the city. Your first session is on us.",
      aboutTitle: "BUILT DIFFERENT, ON PURPOSE",
      aboutBody:
        "BR FITNESS started with one idea: a gym that treats training like a craft. No wasted mirrors, no gimmicks — just world-class equipment, coaches who actually coach, and a culture that holds you to your word. Three clubs, one standard: show up, put in the work, and we'll take care of everything else.",
      stats: {
        members: 4820,
        classesRun: 12600,
        rating: 4.9,
        locations: 3,
      },
      contactEmail: "hello@brfitness.com",
      contactPhone: "+1 (212) 555-0100",
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
      youtube: "https://youtube.com",
      address: "12 Steel Avenue, New York, NY 10018",
    });

    return { seeded: true, branches: 3 };
  },
});
