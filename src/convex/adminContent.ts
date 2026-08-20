import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  assertAdmin,
  assertAdminQuery,
  assertStaff,
  assertStaffQuery,
  getCurrentUser,
  logActivity,
} from "./roles";
import { classTypeValidator, roleValidator } from "./schema";

const branchFields = {
  name: v.string(),
  area: v.string(),
  tagline: v.string(),
  description: v.string(),
  address: v.string(),
  lat: v.number(),
  lng: v.number(),
  phone: v.string(),
  email: v.string(),
  whatsapp: v.optional(v.string()),
  hours: v.array(v.object({ day: v.string(), open: v.string(), close: v.string(), closed: v.boolean() })),
  photos: v.array(v.string()),
  coverPhoto: v.string(),
  amenities: v.array(v.string()),
  order: v.number(),
  active: v.boolean(),
};

export const upsertBranch = mutation({
  args: { id: v.optional(v.id("branches")), ...branchFields },
  handler: async (ctx, args) => {
    const user = await assertStaff(ctx, args.id);
    const { id, ...data } = args;
    if (id) { await ctx.db.patch(id, data); await logActivity(ctx, user, "updated branch", data.name); return id; }
    const newId = await ctx.db.insert("branches", data);
    await logActivity(ctx, user, "created branch", data.name);
    return newId;
  },
});

export const deleteBranch = mutation({
  args: { id: v.id("branches") },
  handler: async (ctx, { id }) => {
    const user = await assertStaff(ctx, id);
    const branch = await ctx.db.get(id);
    if (!branch) throw new Error("Branch not found.");
    await ctx.db.delete(id);
    await logActivity(ctx, user, "deleted branch", branch.name);
  },
});

export const upsertTrainer = mutation({
  args: { id: v.optional(v.id("trainers")), name: v.string(), role: v.string(), bio: v.string(), photo: v.string(), specialties: v.array(v.string()), socials: v.optional(v.object({ instagram: v.optional(v.string()), twitter: v.optional(v.string()), linkedin: v.optional(v.string()) })), branchId: v.optional(v.id("branches")), order: v.number(), active: v.boolean() },
  handler: async (ctx, args) => {
    const user = await assertStaff(ctx, args.branchId);
    const { id, ...data } = args;
    if (id) { await ctx.db.patch(id, data); await logActivity(ctx, user, "updated trainer", data.name); return id; }
    const newId = await ctx.db.insert("trainers", data);
    await logActivity(ctx, user, "created trainer", data.name);
    return newId;
  },
});

export const deleteTrainer = mutation({
  args: { id: v.id("trainers") },
  handler: async (ctx, { id }) => {
    const trainer = await ctx.db.get(id);
    if (!trainer) throw new Error("Trainer not found.");
    const user = await assertStaff(ctx, trainer.branchId);
    await ctx.db.delete(id);
    await logActivity(ctx, user, "deleted trainer", trainer.name);
  },
});

export const upsertTestimonial = mutation({
  args: { id: v.optional(v.id("testimonials")), name: v.string(), photo: v.optional(v.string()), rating: v.number(), text: v.string(), branchId: v.optional(v.id("branches")), featured: v.boolean(), active: v.boolean() },
  handler: async (ctx, args) => {
    const user = await assertStaff(ctx, args.branchId);
    const { id, ...data } = args;
    if (id) { await ctx.db.patch(id, data); await logActivity(ctx, user, "updated testimonial", data.name); return id; }
    const newId = await ctx.db.insert("testimonials", data);
    await logActivity(ctx, user, "created testimonial", data.name);
    return newId;
  },
});

export const deleteTestimonial = mutation({
  args: { id: v.id("testimonials") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    if (!item) throw new Error("Testimonial not found.");
    const user = await assertStaff(ctx, item.branchId);
    await ctx.db.delete(id);
    await logActivity(ctx, user, "deleted testimonial", item.name);
  },
});

export const upsertClass = mutation({
  args: { id: v.optional(v.id("classes")), name: v.string(), type: classTypeValidator, branchId: v.id("branches"), trainerId: v.optional(v.id("trainers")), day: v.string(), startTime: v.string(), endTime: v.string(), room: v.string(), capacity: v.number(), booked: v.number(), active: v.boolean() },
  handler: async (ctx, args) => {
    const user = await assertStaff(ctx, args.branchId);
    const { id, ...data } = args;
    if (id) { await ctx.db.patch(id, data); await logActivity(ctx, user, "updated class", data.name); return id; }
    const newId = await ctx.db.insert("classes", data);
    await logActivity(ctx, user, "created class", data.name);
    return newId;
  },
});

export const deleteClass = mutation({
  args: { id: v.id("classes") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    if (!item) throw new Error("Class not found.");
    const user = await assertStaff(ctx, item.branchId);
    await ctx.db.delete(id);
    await logActivity(ctx, user, "deleted class", item.name);
  },
});

export const upsertPlan = mutation({
  args: { id: v.optional(v.id("plans")), name: v.string(), tagline: v.string(), priceMonthly: v.number(), priceAnnual: v.number(), currency: v.string(), popular: v.boolean(), active: v.boolean(), order: v.number(), features: v.array(v.string()) },
  handler: async (ctx, args) => {
    const user = await assertAdmin(ctx);
    const { id, ...data } = args;
    if (id) { await ctx.db.patch(id, data); await logActivity(ctx, user, "updated plan", data.name); return id; }
    const newId = await ctx.db.insert("plans", data);
    await logActivity(ctx, user, "created plan", data.name);
    return newId;
  },
});

export const deletePlan = mutation({
  args: { id: v.id("plans") },
  handler: async (ctx, { id }) => {
    const user = await assertAdmin(ctx);
    const plan = await ctx.db.get(id);
    if (!plan) throw new Error("Plan not found.");
    await ctx.db.delete(id);
    await logActivity(ctx, user, "deleted plan", plan.name);
  },
});

export const upsertOffer = mutation({
  args: { id: v.optional(v.id("offers")), title: v.string(), description: v.string(), discount: v.string(), type: v.union(v.literal("sitewide"), v.literal("branch"), v.literal("plan")), branchId: v.optional(v.id("branches")), planId: v.optional(v.id("plans")), startDate: v.number(), expiryDate: v.number(), bannerImage: v.optional(v.string()), featured: v.boolean(), active: v.boolean() },
  handler: async (ctx, args) => {
    const user = await assertStaff(ctx, args.branchId);
    if ((args.type === "sitewide" || args.type === "plan") && user.role !== "admin") throw new Error("Only admins can create sitewide or plan offers.");
    const { id, ...data } = args;
    if (id) { await ctx.db.patch(id, data); await logActivity(ctx, user, "updated offer", data.title); return id; }
    const newId = await ctx.db.insert("offers", data);
    await logActivity(ctx, user, "created offer", data.title);
    return newId;
  },
});

export const deleteOffer = mutation({
  args: { id: v.id("offers") },
  handler: async (ctx, { id }) => {
    const offer = await ctx.db.get(id);
    if (!offer) throw new Error("Offer not found.");
    const user = await assertStaff(ctx, offer.branchId);
    await ctx.db.delete(id);
    await logActivity(ctx, user, "deleted offer", offer.title);
  },
});

export const updateSiteSettings = mutation({
  args: { heroHeadline: v.string(), heroSubheadline: v.string(), aboutTitle: v.string(), aboutBody: v.string(), stats: v.object({ members: v.number(), classesRun: v.number(), rating: v.number(), locations: v.number() }), contactEmail: v.string(), contactPhone: v.string(), instagram: v.string(), facebook: v.string(), youtube: v.string(), address: v.string() },
  handler: async (ctx, args) => {
    const user = await assertAdmin(ctx);
    const settings = await ctx.db.query("siteSettings").first();
    if (settings) { await ctx.db.patch(settings._id, args); } else { await ctx.db.insert("siteSettings", args); }
    await logActivity(ctx, user, "updated site settings", "Site");
  },
});

// --- Role query: return role/branchId/franchiseId for the frontend ----------------
export const myRole = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { role: null, branchId: null, franchiseId: null };
    return {
      role: (user.role as string) ?? null,
      branchId: user.branchId ?? null,
      franchiseId: (user.franchiseId as string) ?? null,
    };
  },
});

export const claimSuperAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const admins = await ctx.db.query("users").filter((q) => q.eq(q.field("role"), "admin")).collect();
    if (admins.length > 0) throw new Error("A Super Admin already exists.");
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("You must be signed in.");
    await ctx.db.patch(user._id, { role: "admin" });
    return { claimed: true };
  },
});

export const claimAdminByEmail = mutation({
  args: {},
  handler: async (ctx) => {
    const admins = await ctx.db.query("users").filter((q) => q.eq(q.field("role"), "admin")).collect();
    if (admins.length > 0) return { claimed: false, reason: "admin-exists" as const };
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("You must be signed in.");
    const DESIGNATED_ADMIN = "devraj31436@gmail.com";
    if (user.email !== DESIGNATED_ADMIN) throw new Error(`Only ${DESIGNATED_ADMIN} can claim the first admin account. You signed in as ${user.email ?? "unknown"}.`);
    await ctx.db.patch(user._id, { role: "admin" });
    return { claimed: true };
  },
});

export const isDesignatedAdmin = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return { matches: user?.email === "devraj31436@gmail.com", email: user?.email ?? null };
  },
});

export const listMembers = query({
  args: {},
  handler: async (ctx) => {
    await assertAdminQuery(ctx);
    const users = await ctx.db.query("users").collect();
    return users.filter((u) => u.role === "member" || u.role === undefined).map((u) => ({ _id: u._id, name: u.name ?? null, email: u.email ?? null, role: u.role ?? null, createdAt: u._creationTime }));
  },
});

export const setUserRole = mutation({
  args: { userId: v.id("users"), role: v.union(roleValidator, v.literal("none")), branchId: v.optional(v.id("branches")) },
  handler: async (ctx, { userId, role, branchId }) => {
    const admin = await assertAdmin(ctx);
    const target = await ctx.db.get(userId);
    if (!target) throw new Error("User not found.");
    await ctx.db.patch(userId, { role: role === "none" ? undefined : role, branchId: role === "branch_manager" ? branchId : undefined });
    await logActivity(ctx, admin, "changed role", `${target.email ?? target.name ?? "user"} → ${role}`);
  },
});

export const listActivityLogs = query({
  args: {},
  handler: async (ctx) => {
    await assertAdminQuery(ctx);
    const logs = await ctx.db.query("activityLogs").collect();
    return logs.sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0));
  },
});

export const listBookings = query({
  args: {},
  handler: async (ctx) => {
    await assertStaffQuery(ctx);
    return await ctx.db.query("bookings").collect();
  },
});

export const updateBookingStatus = mutation({
  args: { id: v.id("bookings"), status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")) },
  handler: async (ctx, { id, status }) => {
    const booking = await ctx.db.get(id);
    if (!booking) throw new Error("Booking not found.");
    const user = await assertStaff(ctx, booking.branchId);
    await ctx.db.patch(id, { status });
    await logActivity(ctx, user, "updated booking", `${status}`);
  },
});
