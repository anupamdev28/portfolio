import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin, assertStaff, logActivity } from "./roles";

/** Get a fresh upload URL for a media file (staff only). */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await assertStaff(ctx);
    void user;
    return await ctx.storage.generateUploadUrl();
  },
});

/** Persist an uploaded file as a media library entry. */
export const saveMedia = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    folder: v.string(),
    alt: v.optional(v.string()),
    size: v.optional(v.number()),
    mimeType: v.optional(v.string()),
  },
  handler: async (ctx, { storageId, name, folder, alt, size, mimeType }) => {
    const user = await assertStaff(ctx);
    const url = await ctx.storage.getUrl(storageId);
    if (!url) throw new Error("Could not resolve uploaded file.");
    const newId = await ctx.db.insert("media", {
      storageId: storageId as unknown as string,
      url,
      name,
      folder,
      alt,
      size,
      mimeType,
    });
    await logActivity(ctx, user, "uploaded media", name);
    return newId;
  },
});

/** Save a media entry that lives at an external URL (e.g. seeded images). */
export const saveMediaUrl = mutation({
  args: {
    url: v.string(),
    name: v.string(),
    folder: v.string(),
    alt: v.optional(v.string()),
  },
  handler: async (ctx, { url, name, folder, alt }) => {
    const user = await assertStaff(ctx);
    const newId = await ctx.db.insert("media", {
      url,
      name,
      folder,
      alt,
    });
    await logActivity(ctx, user, "added media link", name);
    return newId;
  },
});

export const deleteMedia = mutation({
  args: { id: v.id("media") },
  handler: async (ctx, { id }) => {
    const user = await assertAdmin(ctx);
    const item = await ctx.db.get(id);
    if (!item) throw new Error("Media not found.");
    if (item.storageId) {
      await ctx.storage.delete(item.storageId as Parameters<typeof ctx.storage.delete>[0]);
    }
    await ctx.db.delete(id);
    await logActivity(ctx, user, "deleted media", item.name);
  },
});
