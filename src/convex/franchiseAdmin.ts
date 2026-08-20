import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  assertAdmin,
  assertAdminQuery,
  assertFranchiseAdmin,
  assertFranchiseAdminQuery,
  getCurrentUser,
  logActivity,
} from "./roles";
import {
  franchiseStatusValidator,
  membershipStatusValidator,
  paymentStatusValidator,
} from "./schema";
import { Doc, Id } from "./_generated/dataModel";

// ═════════════════════════════════════════════════════════════════════════════
// FRANCHISE MANAGEMENT — Super Admin only
// ═════════════════════════════════════════════════════════════════════════════

export const listFranchises = query({
  args: {},
  handler: async (ctx) => {
    await assertAdminQuery(ctx);
    const franchises = await ctx.db.query("franchises").collect();
    return franchises.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const getFranchise = query({
  args: { id: v.id("franchises") },
  handler: async (ctx, { id }) => {
    await assertAdminQuery(ctx);
    return await ctx.db.get(id);
  },
});

export const upsertFranchise = mutation({
  args: {
    id: v.optional(v.id("franchises")),
    name: v.string(),
    location: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    country: v.string(),
    phone: v.string(),
    email: v.string(),
    ownerName: v.string(),
    status: franchiseStatusValidator,
  },
  handler: async (ctx, args) => {
    const user = await assertAdmin(ctx);
    const now = Date.now();
    const { id, ...data } = args;
    if (id) {
      await ctx.db.patch(id, { ...data, updatedAt: now });
      await logActivity(ctx, user, "updated franchise", data.name);
      return id;
    }
    const newId = await ctx.db.insert("franchises", {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    await logActivity(ctx, user, "created franchise", data.name);
    return newId;
  },
});

export const deleteFranchise = mutation({
  args: { id: v.id("franchises") },
  handler: async (ctx, { id }) => {
    const user = await assertAdmin(ctx);
    const franchise = await ctx.db.get(id);
    if (!franchise) throw new Error("Franchise not found.");
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", id))
      .take(1);
    if (customers.length > 0) {
      throw new Error("Cannot delete franchise with existing customers. Remove customers first.");
    }
    await ctx.db.delete(id);
    await logActivity(ctx, user, "deleted franchise", franchise.name);
  },
});

// ═════════════════════════════════════════════════════════════════════════════
// CUSTOMER MANAGEMENT
// ═════════════════════════════════════════════════════════════════════════════

export const listCustomers = query({
  args: {
    franchiseId: v.optional(v.id("franchises")),
    status: v.optional(membershipStatusValidator),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("You must be signed in.");

    const isSuperAdm = user.role === "admin";
    let result: Doc<"customers">[];

    if (isSuperAdm) {
      if (args.franchiseId) {
        result = await ctx.db
          .query("customers")
          .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId!))
          .collect();
      } else {
        result = await ctx.db.query("customers").collect();
      }
    } else if (user.role === "franchise_admin") {
      if (!user.franchiseId)
        throw new Error("Franchise Admin must be assigned to a franchise.");
      const franchiseDoc = await ctx.db
        .query("franchises")
        .filter((q) => q.eq(q.field("_id"), user.franchiseId as any))
        .first();
      if (franchiseDoc) {
        result = await ctx.db
          .query("customers")
          .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseDoc._id))
          .collect();
      } else {
        result = [];
      }
    } else {
      throw new Error("You do not have permission to view customers.");
    }

    if (args.status) {
      result = result.filter((c) => c.membershipStatus === args.status);
    }

    if (args.search) {
      const term = args.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.fullName.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.phone.includes(term),
      );
    }

    return result.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getCustomer = query({
  args: { id: v.id("customers") },
  handler: async (ctx, { id }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("You must be signed in.");
    const customer = await ctx.db.get(id);
    if (!customer) throw new Error("Customer not found.");
    if (user.role !== "admin") {
      if (user.role === "franchise_admin") {
        if (!user.franchiseId)
          throw new Error("Franchise Admin must be assigned to a franchise.");
        const franchiseDoc = await ctx.db
          .query("franchises")
          .filter((q) => q.eq(q.field("_id"), user.franchiseId as any))
          .first();
        if (!franchiseDoc || customer.franchiseId !== franchiseDoc._id) {
          throw new Error("You do not have access to this customer's data.");
        }
      } else {
        throw new Error("You do not have permission to view customers.");
      }
    }
    return customer;
  },
});

export const addCustomer = mutation({
  args: {
    franchiseId: v.id("franchises"),
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.string()),
    address: v.optional(v.string()),
    membershipPlan: v.optional(v.string()),
    membershipStartDate: v.optional(v.number()),
    membershipEndDate: v.optional(v.number()),
    membershipStatus: v.optional(membershipStatusValidator),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("You must be signed in.");
    const now = Date.now();
    let effectiveFranchiseId: Id<"franchises"> = args.franchiseId;
    const isSuperAdm = user.role === "admin";

    if (!isSuperAdm) {
      if (user.role === "franchise_admin") {
        if (!user.franchiseId)
          throw new Error("Franchise Admin must be assigned to a franchise.");
        const franchiseDoc = await ctx.db
          .query("franchises")
          .filter((q) => q.eq(q.field("_id"), user.franchiseId as any))
          .first();
        if (!franchiseDoc) throw new Error("Your franchise was not found.");
        effectiveFranchiseId = franchiseDoc._id;
      } else {
        throw new Error("You do not have permission to add customers.");
      }
    }

    const franchise = await ctx.db.get(effectiveFranchiseId);
    if (!franchise) throw new Error("Franchise not found.");

    const newId = await ctx.db.insert("customers", {
      franchiseId: effectiveFranchiseId,
      fullName: args.fullName,
      email: args.email,
      phone: args.phone,
      dateOfBirth: args.dateOfBirth,
      gender: args.gender,
      address: args.address,
      membershipPlan: args.membershipPlan,
      membershipStartDate: args.membershipStartDate,
      membershipEndDate: args.membershipEndDate,
      membershipStatus: args.membershipStatus,
      emergencyContactName: args.emergencyContactName,
      emergencyContactPhone: args.emergencyContactPhone,
      notes: args.notes,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    await logActivity(ctx, user, "added customer", args.fullName);
    return newId;
  },
});

export const updateCustomer = mutation({
  args: {
    id: v.id("customers"),
    fullName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.string()),
    address: v.optional(v.string()),
    membershipPlan: v.optional(v.string()),
    membershipStartDate: v.optional(v.number()),
    membershipEndDate: v.optional(v.number()),
    membershipStatus: v.optional(membershipStatusValidator),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    notes: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("You must be signed in.");
    const customer = await ctx.db.get(args.id);
    if (!customer) throw new Error("Customer not found.");

    if (user.role !== "admin") {
      if (user.role === "franchise_admin") {
        if (!user.franchiseId)
          throw new Error("Franchise Admin must be assigned to a franchise.");
        const franchiseDoc = await ctx.db
          .query("franchises")
          .filter((q) => q.eq(q.field("_id"), user.franchiseId as any))
          .first();
        if (!franchiseDoc || customer.franchiseId !== franchiseDoc._id) {
          throw new Error("You do not have access to modify this customer.");
        }
      } else {
        throw new Error("You do not have permission to update customers.");
      }
    }

    const { id, ...updates } = args;
    const nonNullUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) nonNullUpdates[key] = value;
    }
    nonNullUpdates.updatedAt = Date.now();

    await ctx.db.patch(id, nonNullUpdates);
    await logActivity(ctx, user, "updated customer", customer.fullName);
  },
});

export const deleteCustomer = mutation({
  args: { id: v.id("customers") },
  handler: async (ctx, { id }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("You must be signed in.");
    const customer = await ctx.db.get(id);
    if (!customer) throw new Error("Customer not found.");

    if (user.role !== "admin") {
      if (user.role === "franchise_admin") {
        if (!user.franchiseId)
          throw new Error("Franchise Admin must be assigned to a franchise.");
        const franchiseDoc = await ctx.db
          .query("franchises")
          .filter((q) => q.eq(q.field("_id"), user.franchiseId as any))
          .first();
        if (!franchiseDoc || customer.franchiseId !== franchiseDoc._id) {
          throw new Error("You do not have access to delete this customer.");
        }
      } else {
        throw new Error("You do not have permission to delete customers.");
      }
    }

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_customer", (q) => q.eq("customerId", id))
      .collect();
    for (const m of memberships) {
      await ctx.db.delete(m._id);
    }

    await ctx.db.delete(id);
    await logActivity(ctx, user, "deleted customer", customer.fullName);
  },
});

// ═════════════════════════════════════════════════════════════════════════════
// MEMBERSHIP MANAGEMENT
// ═════════════════════════════════════════════════════════════════════════════

export const listMemberships = query({
  args: {
    customerId: v.optional(v.id("customers")),
    franchiseId: v.optional(v.id("franchises")),
    status: v.optional(membershipStatusValidator),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("You must be signed in.");

    const isSuperAdm = user.role === "admin";
    let result: Doc<"memberships">[];

    if (args.customerId) {
      result = await ctx.db
        .query("memberships")
        .withIndex("by_customer", (q) => q.eq("customerId", args.customerId!))
        .collect();
    } else if (args.franchiseId) {
      result = await ctx.db
        .query("memberships")
        .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId!))
        .collect();
    } else {
      result = await ctx.db.query("memberships").collect();
    }

    if (!isSuperAdm) {
      if (user.role === "franchise_admin") {
        if (!user.franchiseId)
          throw new Error("Franchise Admin must be assigned to a franchise.");
        const franchiseDoc = await ctx.db
          .query("franchises")
          .filter((q) => q.eq(q.field("_id"), user.franchiseId as any))
          .first();
        if (!franchiseDoc) throw new Error("Your franchise was not found.");
        result = result.filter((m) => m.franchiseId === franchiseDoc._id);
      } else {
        throw new Error("You do not have permission to view memberships.");
      }
    }

    if (args.status) {
      result = result.filter((m) => m.membershipStatus === args.status);
    }

    return result.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const upsertMembership = mutation({
  args: {
    id: v.optional(v.id("memberships")),
    customerId: v.id("customers"),
    franchiseId: v.optional(v.id("franchises")),
    planName: v.string(),
    planDuration: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    price: v.number(),
    paymentStatus: paymentStatusValidator,
    membershipStatus: membershipStatusValidator,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("You must be signed in.");
    const customer = await ctx.db.get(args.customerId);
    if (!customer) throw new Error("Customer not found.");

    const now = Date.now();
    const isSuperAdm = user.role === "admin";
    let effectiveFranchiseId: Id<"franchises"> = args.franchiseId ?? customer.franchiseId;

    if (!isSuperAdm) {
      if (user.role === "franchise_admin") {
        if (!user.franchiseId)
          throw new Error("Franchise Admin must be assigned to a franchise.");
        const franchiseDoc = await ctx.db
          .query("franchises")
          .filter((q) => q.eq(q.field("_id"), user.franchiseId as any))
          .first();
        if (!franchiseDoc || customer.franchiseId !== franchiseDoc._id) {
          throw new Error("You do not have access to manage this customer's memberships.");
        }
        effectiveFranchiseId = franchiseDoc._id;
      } else {
        throw new Error("You do not have permission to manage memberships.");
      }
    }

    if (args.id) {
      const existing = await ctx.db.get(args.id);
      if (!existing) throw new Error("Membership not found.");
      if (!isSuperAdm && existing.franchiseId !== effectiveFranchiseId) {
        throw new Error("Access denied to this membership.");
      }
      await ctx.db.patch(args.id, {
        planName: args.planName,
        planDuration: args.planDuration,
        startDate: args.startDate,
        endDate: args.endDate,
        price: args.price,
        paymentStatus: args.paymentStatus,
        membershipStatus: args.membershipStatus,
        updatedAt: now,
      });
      await ctx.db.patch(args.customerId, {
        membershipPlan: args.planName,
        membershipStartDate: args.startDate,
        membershipEndDate: args.endDate,
        membershipStatus: args.membershipStatus,
        updatedAt: now,
      });
      await logActivity(ctx, user, "updated membership", `${customer.fullName} — ${args.planName}`);
      return args.id;
    }

    const newId = await ctx.db.insert("memberships", {
      customerId: args.customerId,
      franchiseId: effectiveFranchiseId,
      planName: args.planName,
      planDuration: args.planDuration,
      startDate: args.startDate,
      endDate: args.endDate,
      price: args.price,
      paymentStatus: args.paymentStatus,
      membershipStatus: args.membershipStatus,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.customerId, {
      membershipPlan: args.planName,
      membershipStartDate: args.startDate,
      membershipEndDate: args.endDate,
      membershipStatus: args.membershipStatus,
      updatedAt: now,
    });

    await logActivity(ctx, user, "created membership", `${customer.fullName} — ${args.planName}`);
    return newId;
  },
});

export const deleteMembership = mutation({
  args: { id: v.id("memberships") },
  handler: async (ctx, { id }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("You must be signed in.");
    const membership = await ctx.db.get(id);
    if (!membership) throw new Error("Membership not found.");

    const isSuperAdm = user.role === "admin";
    if (!isSuperAdm) {
      if (user.role === "franchise_admin") {
        if (!user.franchiseId)
          throw new Error("Franchise Admin must be assigned to a franchise.");
        const franchiseDoc = await ctx.db
          .query("franchises")
          .filter((q) => q.eq(q.field("_id"), user.franchiseId as any))
          .first();
        if (!franchiseDoc || membership.franchiseId !== franchiseDoc._id) {
          throw new Error("Access denied to this membership.");
        }
      } else {
        throw new Error("You do not have permission to delete memberships.");
      }
    }

    await ctx.db.delete(id);
    await logActivity(ctx, user, "deleted membership", `ID: ${id}`);
  },
});

// ═════════════════════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ═════════════════════════════════════════════════════════════════════════════

export const getSuperAdminDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    await assertAdminQuery(ctx);
    const franchises = await ctx.db.query("franchises").collect();
    const allCustomers = await ctx.db.query("customers").collect();
    const allMemberships = await ctx.db.query("memberships").collect();

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const franchiseStats = franchises.map((f) => {
      const fCustomers = allCustomers.filter((c) => c.franchiseId === f._id);
      return {
        franchiseId: f._id,
        name: f.name,
        city: f.city,
        status: f.status,
        totalCustomers: fCustomers.length,
        activeCustomers: fCustomers.filter((c) => c.membershipStatus === "active").length,
        newThisMonth: fCustomers.filter((c) => c.createdAt >= thirtyDaysAgo).length,
      };
    });

    return {
      totalFranchises: franchises.length,
      activeFranchises: franchises.filter((f) => f.status === "active").length,
      totalCustomers: allCustomers.length,
      activeCustomers: allCustomers.filter((c) => c.membershipStatus === "active").length,
      expiredCustomers: allCustomers.filter((c) => c.membershipStatus === "expired").length,
      newCustomersThisMonth: allCustomers.filter((c) => c.createdAt >= thirtyDaysAgo).length,
      activeMemberships: allMemberships.filter((m) => m.membershipStatus === "active").length,
      expiredMemberships: allMemberships.filter((m) => m.membershipStatus === "expired").length,
      franchiseStats,
    };
  },
});

export const getFranchiseDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await assertFranchiseAdminQuery(ctx);
    const franchiseDoc = await ctx.db
      .query("franchises")
      .filter((q) => q.eq(q.field("_id"), user.franchiseId as any))
      .first();
    if (!franchiseDoc) throw new Error("Your franchise was not found.");

    const customers = await ctx.db
      .query("customers")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseDoc._id))
      .collect();

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseDoc._id))
      .collect();

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000;

    return {
      franchise: franchiseDoc,
      totalCustomers: customers.length,
      activeCustomers: customers.filter((c) => c.membershipStatus === "active").length,
      expiredCustomers: customers.filter((c) => c.membershipStatus === "expired").length,
      newCustomersThisMonth: customers.filter((c) => c.createdAt >= thirtyDaysAgo).length,
      activeMemberships: memberships.filter((m) => m.membershipStatus === "active").length,
      expiredMemberships: memberships.filter((m) => m.membershipStatus === "expired").length,
      upcomingExpirations: memberships.filter(
        (m) => m.membershipStatus === "active" && m.endDate <= thirtyDaysFromNow && m.endDate >= now,
      ).length,
      newMemberships: memberships.filter((m) => m.createdAt >= thirtyDaysAgo).length,
    };
  },
});

// ═════════════════════════════════════════════════════════════════════════════
// FRANCHISE ADMIN USER MANAGEMENT
// ═════════════════════════════════════════════════════════════════════════════

export const listFranchiseAdmins = query({
  args: {},
  handler: async (ctx) => {
    await assertAdminQuery(ctx);
    const users = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "franchise_admin"))
      .collect();
    return users.map((u) => ({
      _id: u._id,
      name: u.name ?? null,
      email: u.email ?? null,
      franchiseId: u.franchiseId ?? null,
      isActive: u.isActive ?? true,
    }));
  },
});

export const assignFranchiseAdmin = mutation({
  args: {
    userId: v.id("users"),
    franchiseId: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await assertAdmin(ctx);
    const target = await ctx.db.get(args.userId);
    if (!target) throw new Error("User not found.");

    const franchiseDoc = await ctx.db
      .query("franchises")
      .filter((q) => q.eq(q.field("_id"), args.franchiseId))
      .first();
    if (!franchiseDoc) throw new Error("Franchise not found.");

    await ctx.db.patch(args.userId, {
      role: "franchise_admin",
      franchiseId: args.franchiseId,
      isActive: true,
    });

    await logActivity(
      ctx,
      admin,
      "assigned franchise admin",
      `${target.email ?? target.name ?? "user"} → ${franchiseDoc.name}`,
    );
  },
});

export const removeFranchiseAdmin = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const admin = await assertAdmin(ctx);
    const target = await ctx.db.get(userId);
    if (!target) throw new Error("User not found.");
    if (target.role === "admin") {
      throw new Error("Cannot change a Super Admin's role from here.");
    }
    await ctx.db.patch(userId, { role: "user", franchiseId: undefined });
    await logActivity(ctx, admin, "removed franchise admin", target.email ?? target.name ?? "user");
  },
});

// ═════════════════════════════════════════════════════════════════════════════
// FRANCHISE DETAIL
// ═════════════════════════════════════════════════════════════════════════════

export const getFranchiseDetail = query({
  args: { franchiseId: v.id("franchises") },
  handler: async (ctx, { franchiseId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("You must be signed in.");
    const franchise = await ctx.db.get(franchiseId);
    if (!franchise) throw new Error("Franchise not found.");

    if (user.role !== "admin" && user.franchiseId !== (franchise._id as any)) {
      throw new Error("You do not have access to this franchise's data.");
    }

    const customers = await ctx.db
      .query("customers")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .collect();

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .collect();

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000;

    return {
      franchise,
      totalCustomers: customers.length,
      activeCustomers: customers.filter((c) => c.membershipStatus === "active").length,
      inactiveCustomers: customers.filter((c) => c.membershipStatus !== "active").length,
      expiredMemberships: memberships.filter((m) => m.membershipStatus === "expired").length,
      newCustomersThisMonth: customers.filter((c) => c.createdAt >= thirtyDaysAgo).length,
      activeMemberships: memberships.filter((m) => m.membershipStatus === "active").length,
      upcomingExpirations: memberships.filter(
        (m) => m.membershipStatus === "active" && m.endDate <= thirtyDaysFromNow && m.endDate >= now,
      ).length,
      newMembershipsThisMonth: memberships.filter((m) => m.createdAt >= thirtyDaysAgo).length,
      customers: customers.sort((a, b) => b.createdAt - a.createdAt),
      memberships: memberships.sort((a, b) => b.createdAt - a.createdAt),
    };
  },
});

// ═════════════════════════════════════════════════════════════════════════════
// SEED DATA — Super Admin only. Idempotent.
// ═════════════════════════════════════════════════════════════════════════════

const DELHI_CUSTOMERS = [
  { fullName: "Rahul Sharma", email: "rahul.sharma@test.com", phone: "+91 98765 43210", gender: "male", plan: "Pro", planDuration: "3 months" },
  { fullName: "Priya Singh", email: "priya.singh@test.com", phone: "+91 98765 43211", gender: "female", plan: "Elite", planDuration: "1 year" },
  { fullName: "Amit Kumar", email: "amit.kumar@test.com", phone: "+91 98765 43212", gender: "male", plan: "Basic", planDuration: "1 month" },
  { fullName: "Neha Gupta", email: "neha.gupta@test.com", phone: "+91 98765 43213", gender: "female", plan: "Pro", planDuration: "6 months" },
  { fullName: "Vikram Patel", email: "vikram.patel@test.com", phone: "+91 98765 43214", gender: "male", plan: "Elite", planDuration: "1 year" },
  { fullName: "Sunita Verma", email: "sunita.verma@test.com", phone: "+91 98765 43215", gender: "female", plan: "Pro", planDuration: "3 months" },
  { fullName: "Rajesh Mishra", email: "rajesh.mishra@test.com", phone: "+91 98765 43216", gender: "male", plan: "Basic", planDuration: "1 month" },
  { fullName: "Kavita Joshi", email: "kavita.joshi@test.com", phone: "+91 98765 43217", gender: "female", plan: "Pro", planDuration: "6 months" },
  { fullName: "Sanjay Reddy", email: "sanjay.reddy@test.com", phone: "+91 98765 43218", gender: "male", plan: "Elite", planDuration: "1 year" },
  { fullName: "Anjali Nair", email: "anjali.nair@test.com", phone: "+91 98765 43219", gender: "female", plan: "Basic", planDuration: "1 month" },
  { fullName: "Deepak Jain", email: "deepak.jain@test.com", phone: "+91 98765 43220", gender: "male", plan: "Pro", planDuration: "3 months" },
  { fullName: "Pooja Thakur", email: "pooja.thakur@test.com", phone: "+91 98765 43221", gender: "female", plan: "Elite", planDuration: "1 year" },
  { fullName: "Manoj Tiwari", email: "manoj.tiwari@test.com", phone: "+91 98765 43222", gender: "male", plan: "Pro", planDuration: "6 months" },
  { fullName: "Ritu Saxena", email: "ritu.saxena@test.com", phone: "+91 98765 43223", gender: "female", plan: "Basic", planDuration: "1 month" },
  { fullName: "Arjun Mehta", email: "arjun.mehta@test.com", phone: "+91 98765 43224", gender: "male", plan: "Elite", planDuration: "1 year" },
];

const MUMBAI_CUSTOMERS = [
  { fullName: "Siddharth Rao", email: "siddharth.rao@test.com", phone: "+91 98765 43300", gender: "male", plan: "Elite", planDuration: "1 year" },
  { fullName: "Meera Iyer", email: "meera.iyer@test.com", phone: "+91 98765 43301", gender: "female", plan: "Pro", planDuration: "3 months" },
  { fullName: "Karan Bhatt", email: "karan.bhatt@test.com", phone: "+91 98765 43302", gender: "male", plan: "Basic", planDuration: "1 month" },
  { fullName: "Shruti Kulkarni", email: "shruti.kulkarni@test.com", phone: "+91 98765 43303", gender: "female", plan: "Pro", planDuration: "6 months" },
  { fullName: "Akash Deshmukh", email: "akash.deshmukh@test.com", phone: "+91 98765 43304", gender: "male", plan: "Elite", planDuration: "1 year" },
  { fullName: "Tanvi Patil", email: "tanvi.patil@test.com", phone: "+91 98765 43305", gender: "female", plan: "Basic", planDuration: "1 month" },
  { fullName: "Nikhil Sharma", email: "nikhil.sharma@test.com", phone: "+91 98765 43306", gender: "male", plan: "Pro", planDuration: "3 months" },
  { fullName: "Pallavi More", email: "pallavi.more@test.com", phone: "+91 98765 43307", gender: "female", plan: "Elite", planDuration: "1 year" },
  { fullName: "Vivek Kulkarni", email: "vivek.kulkarni@test.com", phone: "+91 98765 43308", gender: "male", plan: "Pro", planDuration: "6 months" },
  { fullName: "Aditi Joshi", email: "aditi.joshi@test.com", phone: "+91 98765 43309", gender: "female", plan: "Basic", planDuration: "1 month" },
  { fullName: "Rohan Gokhale", email: "rohan.gokhale@test.com", phone: "+91 98765 43310", gender: "male", plan: "Elite", planDuration: "1 year" },
  { fullName: "Sneha Pawar", email: "sneha.pawar@test.com", phone: "+91 98765 43311", gender: "female", plan: "Pro", planDuration: "3 months" },
  { fullName: "Gaurav Malhotra", email: "gaurav.malhotra@test.com", phone: "+91 98765 43312", gender: "male", plan: "Pro", planDuration: "6 months" },
  { fullName: "Deepika Chopra", email: "deepika.chopra@test.com", phone: "+91 98765 43313", gender: "female", plan: "Elite", planDuration: "1 year" },
  { fullName: "Yash Agarwal", email: "yash.agarwal@test.com", phone: "+91 98765 43314", gender: "male", plan: "Basic", planDuration: "1 month" },
];

function randomDate(daysAgo: number, daysFromNow: number): number {
  const now = Date.now();
  const min = now - daysAgo * 86400000;
  const max = now + daysFromNow * 86400000;
  return min + Math.random() * (max - min);
}

function planPrice(plan: string): number {
  switch (plan) {
    case "Elite": return 2999;
    case "Pro": return 1499;
    case "Basic": return 799;
    default: return 999;
  }
}

function durationMs(dur: string): number {
  if (dur.includes("year")) return 365 * 86400000;
  if (dur.includes("6")) return 180 * 86400000;
  if (dur.includes("3")) return 90 * 86400000;
  return 30 * 86400000;
}

export const seedFranchiseData = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await assertAdmin(ctx);
    const now = Date.now();
    let createdFranchises = 0;
    let createdCustomers = 0;
    let createdMemberships = 0;
    let assignedAdmins = 0;

    // Check if franchises already exist
    const existingFranchises = await ctx.db.query("franchises").collect();
    if (existingFranchises.length > 0) {
      return { seeded: false, reason: "Franchises already exist. Cannot re-seed." };
    }

    // 1. Create franchises
    const delhiId = await ctx.db.insert("franchises", {
      name: "BR FITNESS — Delhi",
      location: "Connaught Place",
      address: "42 Janpath Road, Connaught Place, New Delhi, Delhi 110001",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      phone: "+91 11 2345 6789",
      email: "delhi@brfitness.com",
      ownerName: "Ranupam",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    createdFranchises++;

    const mumbaiId = await ctx.db.insert("franchises", {
      name: "BR FITNESS — Mumbai",
      location: "Andheri West",
      address: "15 Link Road, Andheri West, Mumbai, Maharashtra 400053",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      phone: "+91 22 6789 0123",
      email: "mumbai@brfitness.com",
      ownerName: "Dev Anupam",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    createdFranchises++;

    // 2. Create customers and memberships for Delhi
    for (const c of DELHI_CUSTOMERS) {
      const startDate = randomDate(180, -30);
      const endMs = durationMs(c.planDuration);
      const endDate = startDate + endMs;
      const isExpired = endDate < now;
      const status = isExpired ? "expired" : "active";

      const customerId = await ctx.db.insert("customers", {
        franchiseId: delhiId,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        gender: c.gender,
        membershipPlan: c.plan,
        membershipStartDate: startDate,
        membershipEndDate: endDate,
        membershipStatus: status,
        isActive: true,
        createdAt: startDate,
        updatedAt: now,
      });
      createdCustomers++;

      await ctx.db.insert("memberships", {
        customerId,
        franchiseId: delhiId,
        planName: c.plan,
        planDuration: c.planDuration,
        startDate,
        endDate,
        price: planPrice(c.plan),
        paymentStatus: Math.random() > 0.1 ? "paid" : "pending",
        membershipStatus: status,
        createdAt: startDate,
        updatedAt: now,
      });
      createdMemberships++;
    }

    // 3. Create customers and memberships for Mumbai
    for (const c of MUMBAI_CUSTOMERS) {
      const startDate = randomDate(180, -30);
      const endMs = durationMs(c.planDuration);
      const endDate = startDate + endMs;
      const isExpired = endDate < now;
      const status = isExpired ? "expired" : "active";

      const customerId = await ctx.db.insert("customers", {
        franchiseId: mumbaiId,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        gender: c.gender,
        membershipPlan: c.plan,
        membershipStartDate: startDate,
        membershipEndDate: endDate,
        membershipStatus: status,
        isActive: true,
        createdAt: startDate,
        updatedAt: now,
      });
      createdCustomers++;

      await ctx.db.insert("memberships", {
        customerId,
        franchiseId: mumbaiId,
        planName: c.plan,
        planDuration: c.planDuration,
        startDate,
        endDate,
        price: planPrice(c.plan),
        paymentStatus: Math.random() > 0.1 ? "paid" : "pending",
        membershipStatus: status,
        createdAt: startDate,
        updatedAt: now,
      });
      createdMemberships++;
    }

    // 4. Auto-assign franchise admins if users exist
    const ranupam = await ctx.db.query("users").filter((q) => q.eq(q.field("email"), "ranupam243@gmail.com")).first();
    if (ranupam) {
      await ctx.db.patch(ranupam._id, { role: "franchise_admin", franchiseId: delhiId, isActive: true });
      assignedAdmins++;
      await logActivity(ctx, user, "auto-assigned franchise admin", `ranupam243@gmail.com → Delhi Franchise`);
    }

    const devanupam = await ctx.db.query("users").filter((q) => q.eq(q.field("email"), "devanupam20@gmail.com")).first();
    if (devanupam) {
      await ctx.db.patch(devanupam._id, { role: "franchise_admin", franchiseId: mumbaiId, isActive: true });
      assignedAdmins++;
      await logActivity(ctx, user, "auto-assigned franchise admin", `devanupam20@gmail.com → Mumbai Franchise`);
    }

    await logActivity(ctx, user, "seeded franchise data", `${createdFranchises} franchises, ${createdCustomers} customers, ${createdMemberships} memberships`);

    return {
      seeded: true,
      franchises: createdFranchises,
      customers: createdCustomers,
      memberships: createdMemberships,
      assignedAdmins,
      franchiseIds: { delhi: delhiId, mumbai: mumbaiId },
      note: assignedAdmins < 2 ? `Assigned ${assignedAdmins}/2 admins. Users may need to sign up first.` : "All admins assigned.",
    };
  },
});
