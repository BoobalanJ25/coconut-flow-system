import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    treeId: v.string(),
    ownerId: v.id("treeOwners"),
    location: v.string(),
    rentPerYear: v.number(),
    expectedCoconutsCount: v.number(),
    assignedWorkerId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("coconutTrees", {
      ...args,
      status: "active",
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const trees = await ctx.db.query("coconutTrees").collect();
    
    const treesWithOwners = await Promise.all(
      trees.map(async (tree) => {
        const owner = await ctx.db.get(tree.ownerId);
        const worker = tree.assignedWorkerId ? await ctx.db.get(tree.assignedWorkerId) : null;
        return { ...tree, owner, worker };
      })
    );

    return treesWithOwners;
  },
});

export const getByWorker = query({
  args: { workerId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const trees = await ctx.db
      .query("coconutTrees")
      .withIndex("by_worker", (q) => q.eq("assignedWorkerId", args.workerId))
      .collect();

    const treesWithOwners = await Promise.all(
      trees.map(async (tree) => {
        const owner = await ctx.db.get(tree.ownerId);
        return { ...tree, owner };
      })
    );

    return treesWithOwners;
  },
});

export const update = mutation({
  args: {
    id: v.id("coconutTrees"),
    treeId: v.optional(v.string()),
    location: v.optional(v.string()),
    rentPerYear: v.optional(v.number()),
    expectedCoconutsCount: v.optional(v.number()),
    lastCutDate: v.optional(v.number()),
    nextCutDate: v.optional(v.number()),
    assignedWorkerId: v.optional(v.id("users")),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
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
  args: { id: v.id("coconutTrees") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
