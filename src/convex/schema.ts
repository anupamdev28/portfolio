import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// ─── Roles ──────────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN: "admin", // SUPER_ADMIN (Brand Owner)
  USER: "user",
  MEMBER: "member",
  BRANCH_MANAGER: "branch_manager",
  FRANCHISE_ADMIN: "franchise_admin",
} as const;

export const roleValidator = v.union(
  v.literal("admin"),
  v.literal("user"),
  v.literal("member"),
  v.literal("branch_manager"),
  v.literal("franchise_admin"),
);
export type Role = Infer<typeof roleValidator>;

// ─── Franchise statuses ──────────────────────────────────────────────────────
export const FRANCHISE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
} as const;
export const franchiseStatusValidator = v.union(
  v.literal(FRANCHISE_STATUS.ACTIVE),
  v.literal(FRANCHISE_STATUS.INACTIVE),
  v.literal(FRANCHISE_STATUS.SUSPENDED),
);
export type FranchiseStatus = Infer<typeof franchiseStatusValidator>;

// ─── Membership statuses ─────────────────────────────────────────────────────
export const MEMBERSHIP_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
  UPCOMING: "upcoming",
} as const;
export const membershipStatusValidator = v.union(
  v.literal(MEMBERSHIP_STATUS.ACTIVE),
  v.literal(MEMBERSHIP_STATUS.EXPIRED),
  v.literal(MEMBERSHIP_STATUS.CANCELLED),
  v.literal(MEMBERSHIP_STATUS.UPCOMING),
);
export type MembershipStatus = Infer<typeof membershipStatusValidator>;

// ─── Payment statuses ────────────────────────────────────────────────────────
export const PAYMENT_STATUS = {
  PAID: "paid",
  PARTIAL: "partial",
  PENDING: "pending",
} as const;
export const paymentStatusValidator = v.union(
  v.literal(PAYMENT_STATUS.PAID),
  v.literal(PAYMENT_STATUS.PARTIAL),
  v.literal(PAYMENT_STATUS.PENDING),
);
export type PaymentStatus = Infer<typeof paymentStatusValidator>;

// ─── Other enums ─────────────────────────────────────────────────────────────
export const OFFER_TYPES = {
  SITEWIDE: "sitewide",
  BRANCH: "branch",
  PLAN: "plan",
} as const;
export const offerTypeValidator = v.union(
  v.literal(OFFER_TYPES.SITEWIDE),
  v.literal(OFFER_TYPES.BRANCH),
  v.literal(OFFER_TYPES.PLAN),
);
export type OfferType = Infer<typeof offerTypeValidator>;

export const CLASS_TYPES = [
  "Strength",
  "HIIT",
  "Boxing",
  "Yoga",
  "CrossFit",
  "Spin",
  "Recovery",
] as const;
export const classTypeValidator = v.union(
  ...CLASS_TYPES.map((t) => v.literal(t)),
);
export type ClassType = Infer<typeof classTypeValidator>;

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      branchId: v.optional(v.id("branches")),
      franchiseId: v.optional(v.string()),
      phone: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    })
      .index("email", ["email"])
      .index("by_role", ["role"])
      .index("by_franchise", ["franchiseId"]),

    franchises: defineTable({
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
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_status", ["status"])
      .index("by_city", ["city"]),

    customers: defineTable({
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
      isActive: v.optional(v.boolean()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_franchise", ["franchiseId"])
      .index("by_membership_status", ["membershipStatus"])
      .index("by_email", ["email"])
      .index("by_phone", ["phone"]),

    memberships: defineTable({
      customerId: v.id("customers"),
      franchiseId: v.id("franchises"),
      planName: v.string(),
      planDuration: v.string(),
      startDate: v.number(),
      endDate: v.number(),
      price: v.number(),
      paymentStatus: paymentStatusValidator,
      membershipStatus: membershipStatusValidator,
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_customer", ["customerId"])
      .index("by_franchise", ["franchiseId"])
      .index("by_status", ["membershipStatus"]),

    branches: defineTable({
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
      hours: v.array(
        v.object({
          day: v.string(),
          open: v.string(),
          close: v.string(),
          closed: v.boolean(),
        }),
      ),
      photos: v.array(v.string()),
      coverPhoto: v.string(),
      amenities: v.array(v.string()),
      order: v.number(),
      active: v.boolean(),
    }).index("by_active", ["active"]),

    plans: defineTable({
      name: v.string(),
      tagline: v.string(),
      priceMonthly: v.number(),
      priceAnnual: v.number(),
      currency: v.string(),
      popular: v.boolean(),
      active: v.boolean(),
      order: v.number(),
      features: v.array(v.string()),
    }).index("by_active", ["active"]),

    offers: defineTable({
      title: v.string(),
      description: v.string(),
      discount: v.string(),
      type: offerTypeValidator,
      branchId: v.optional(v.id("branches")),
      planId: v.optional(v.id("plans")),
      startDate: v.number(),
      expiryDate: v.number(),
      bannerImage: v.optional(v.string()),
      featured: v.boolean(),
      active: v.boolean(),
    }).index("by_active", ["active"]),

    trainers: defineTable({
      name: v.string(),
      role: v.string(),
      bio: v.string(),
      photo: v.string(),
      specialties: v.array(v.string()),
      socials: v.optional(
        v.object({
          instagram: v.optional(v.string()),
          twitter: v.optional(v.string()),
          linkedin: v.optional(v.string()),
        }),
      ),
      branchId: v.optional(v.id("branches")),
      order: v.number(),
      active: v.boolean(),
    }).index("by_branch", ["branchId"]),

    testimonials: defineTable({
      name: v.string(),
      photo: v.optional(v.string()),
      rating: v.number(),
      text: v.string(),
      branchId: v.optional(v.id("branches")),
      featured: v.boolean(),
      active: v.boolean(),
    }).index("by_branch", ["branchId"]),

    classes: defineTable({
      name: v.string(),
      type: classTypeValidator,
      branchId: v.id("branches"),
      trainerId: v.optional(v.id("trainers")),
      day: v.string(),
      startTime: v.string(),
      endTime: v.string(),
      room: v.string(),
      capacity: v.number(),
      booked: v.number(),
      active: v.boolean(),
    }).index("by_branch", ["branchId"]),

    media: defineTable({
      name: v.string(),
      url: v.string(),
      storageId: v.optional(v.string()),
      folder: v.string(),
      alt: v.optional(v.string()),
      size: v.optional(v.number()),
      mimeType: v.optional(v.string()),
    }).index("by_folder", ["folder"]),

    siteSettings: defineTable({
      heroHeadline: v.string(),
      heroSubheadline: v.string(),
      aboutTitle: v.string(),
      aboutBody: v.string(),
      stats: v.object({
        members: v.number(),
        classesRun: v.number(),
        rating: v.number(),
        locations: v.number(),
      }),
      contactEmail: v.string(),
      contactPhone: v.string(),
      instagram: v.string(),
      facebook: v.string(),
      youtube: v.string(),
      address: v.string(),
    }),

    bookings: defineTable({
      userId: v.id("users"),
      userName: v.string(),
      userEmail: v.string(),
      branchId: v.id("branches"),
      classId: v.optional(v.id("classes")),
      type: v.union(v.literal("tour"), v.literal("trial"), v.literal("class")),
      date: v.number(),
      phone: v.optional(v.string()),
      note: v.optional(v.string()),
      status: v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("cancelled"),
      ),
    })
      .index("by_user", ["userId"])
      .index("by_branch", ["branchId"]),

    activityLogs: defineTable({
      userId: v.optional(v.id("users")),
      userName: v.optional(v.string()),
      action: v.string(),
      target: v.string(),
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
