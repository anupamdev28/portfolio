import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./roles";

/** Signed-in member books a free trial / tour at a branch. */
export const bookTour = mutation({
  args: {
    branchId: v.id("branches"),
    type: v.union(v.literal("tour"), v.literal("trial"), v.literal("class")),
    date: v.number(),
    phone: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, { branchId, type, date, phone, note }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("You must be signed in to book.");

    const branch = await ctx.db.get(branchId);
    if (!branch) throw new Error("Branch not found.");

    // One active booking per user per branch for tours/trials.
    const existing = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const dup = existing.find(
      (b) =>
        b.branchId === branchId &&
        b.type !== "class" &&
        b.status !== "cancelled",
    );
    if (dup) {
      throw new Error(
        "You already have a pending visit at this branch — we'll call you to confirm it.",
      );
    }

    await ctx.db.insert("bookings", {
      userId: user._id,
      userName: user.name ?? "New member",
      userEmail: user.email ?? "",
      branchId,
      type,
      date,
      phone,
      note,
      status: "pending",
    });
    return { booked: true };
  },
});

export const myBookings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    return bookings.sort((a, b) => a.date - b.date);
  },
});

export const cancelBooking = mutation({
  args: { id: v.id("bookings") },
  handler: async (ctx, { id }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("You must be signed in.");
    const booking = await ctx.db.get(id);
    if (!booking || booking.userId !== user._id) {
      throw new Error("Booking not found.");
    }
    await ctx.db.patch(id, { status: "cancelled" });
  },
});
