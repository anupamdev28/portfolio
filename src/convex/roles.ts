import { getAuthUserId } from "@convex-dev/auth/server";
import { ROLES, Role } from "./schema";
import { MutationCtx, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export type AuthUser = Doc<"users"> | null;

export const getCurrentUser = async (
  ctx: QueryCtx | MutationCtx,
): Promise<AuthUser> => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  return await ctx.db.get(userId);
};

// ─── Role checks ─────────────────────────────────────────────────────────────

export const isAdmin = (user: AuthUser): boolean =>
  user?.role === "admin";

export const isSuperAdmin = (user: AuthUser): boolean =>
  user?.role === "admin";

export const isFranchiseAdmin = (user: AuthUser): boolean =>
  user?.role === "franchise_admin";

export const isBranchManager = (user: AuthUser): boolean =>
  user?.role === "branch_manager";

export const isStaff = (user: AuthUser): boolean =>
  isAdmin(user) || isBranchManager(user) || isFranchiseAdmin(user);

/** Returns the franchise ID if the user is a franchise admin, null otherwise. */
export const getUserFranchiseId = (user: AuthUser): string | null => {
  if (!user) return null;
  if (isFranchiseAdmin(user)) return user.franchiseId ?? null;
  return null; // super admins can access all
};

// ─── Mutation guards ─────────────────────────────────────────────────────────

/**
 * Assert the caller is staff. When `branchId` is provided, a branch manager
 * is only allowed to operate on their own branch.
 */
export async function assertStaff(
  ctx: MutationCtx,
  branchId?: Id<"branches">,
): Promise<NonNullable<AuthUser>> {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("You must be signed in.");
  if (user.role === "admin") return user;
  if (user.role === "branch_manager") {
    if (branchId && user.branchId !== branchId) {
      throw new Error("Branch managers can only manage their own branch.");
    }
    return user;
  }
  if (user.role === "franchise_admin") {
    return user;
  }
  throw new Error("You do not have permission to do this.");
}

/** Assert the caller is a full admin (admin role = SUPER_ADMIN). */
export async function assertAdmin(
  ctx: MutationCtx,
): Promise<NonNullable<AuthUser>> {
  const user = await getCurrentUser(ctx);
  if (!user || user.role !== "admin") {
    throw new Error("Super Admin access required.");
  }
  return user;
}

/** Assert the caller is a Franchise Admin. */
export async function assertFranchiseAdmin(
  ctx: MutationCtx,
): Promise<NonNullable<AuthUser> & { franchiseId: string }> {
  const user = await getCurrentUser(ctx);
  if (!user || user.role !== "franchise_admin") {
    throw new Error("Franchise Admin access required.");
  }
  if (!user.franchiseId) {
    throw new Error("Franchise Admin must be assigned to a franchise.");
  }
  return user as NonNullable<AuthUser> & { franchiseId: string };
}

// ─── Query guards ────────────────────────────────────────────────────────────

/** Query variant of assertStaff. */
export async function assertStaffQuery(
  ctx: QueryCtx,
  branchId?: Id<"branches">,
): Promise<NonNullable<AuthUser>> {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("You must be signed in.");
  if (user.role === "admin") return user;
  if (user.role === "branch_manager") {
    if (branchId && user.branchId !== branchId) {
      throw new Error("Branch managers can only manage their own branch.");
    }
    return user;
  }
  if (user.role === "franchise_admin") return user;
  throw new Error("You do not have permission to do this.");
}

/** Query variant of assertAdmin. */
export async function assertAdminQuery(
  ctx: QueryCtx,
): Promise<NonNullable<AuthUser>> {
  const user = await getCurrentUser(ctx);
  if (!user || user.role !== "admin") {
    throw new Error("Super Admin access required.");
  }
  return user;
}

/** Query variant of assertFranchiseAdmin. */
export async function assertFranchiseAdminQuery(
  ctx: QueryCtx,
): Promise<NonNullable<AuthUser> & { franchiseId: string }> {
  const user = await getCurrentUser(ctx);
  if (!user || user.role !== "franchise_admin") {
    throw new Error("Franchise Admin access required.");
  }
  if (!user.franchiseId) {
    throw new Error("Franchise Admin must be assigned to a franchise.");
  }
  return user as NonNullable<AuthUser> & { franchiseId: string };
}

/**
 * Query-level helper: returns the franchise filter for the current user.
 * Super admins get null (no filter = all data).
 * Franchise admins get their franchiseId (filter = own franchise only).
 */
export async function getFranchiseFilter(
  ctx: QueryCtx,
): Promise<string | null> {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("You must be signed in.");
  if (user.role === "admin") return null;
  if (user.role === "franchise_admin") {
    if (!user.franchiseId)
      throw new Error("Franchise Admin must be assigned to a franchise.");
    return user.franchiseId;
  }
  throw new Error("You do not have permission to access this data.");
}

// ─── Activity log ────────────────────────────────────────────────────────────

export async function logActivity(
  ctx: MutationCtx,
  user: NonNullable<AuthUser>,
  action: string,
  target: string,
) {
  await ctx.db.insert("activityLogs", {
    userId: user._id,
    userName: user.name ?? user.email ?? "Unknown",
    action,
    target,
  });
}

// ─── Role labels ─────────────────────────────────────────────────────────────

export function roleLabel(role?: Role): string {
  switch (role) {
    case "admin":
      return "Super Admin";
    case "franchise_admin":
      return "Franchise Admin";
    case "branch_manager":
      return "Branch Manager";
    case "member":
      return "Member";
    default:
      return "Guest";
  }
}
