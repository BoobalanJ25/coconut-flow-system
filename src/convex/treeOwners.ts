import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    location: v.string(),
    numberOfTrees: v.number(),
    annualRent: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("treeOwners", args);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    return await ctx.db.query("treeOwners").collect();
  },
});

export const get = query({
  args: { id: v.id("treeOwners") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("treeOwners"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    numberOfTrees: v.optional(v.number()),
    annualRent: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("treeOwners") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
