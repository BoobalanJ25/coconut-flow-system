import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.string(),
    location: v.string(),
    salaryType: v.union(v.literal("daily"), v.literal("per_coconut")),
    salaryAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      role: "worker",
    });

    return await ctx.db.insert("workers", {
      userId,
      salaryType: args.salaryType,
      salaryAmount: args.salaryAmount,
      location: args.location,
      status: "active",
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const workers = await ctx.db.query("workers").collect();
    
    const workersWithUsers = await Promise.all(
      workers.map(async (worker) => {
        const userInfo = await ctx.db.get(worker.userId);
        return { ...worker, user: userInfo };
      })
    );

    return workersWithUsers;
  },
});

export const get = query({
  args: { id: v.id("workers") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const worker = await ctx.db.get(args.id);
    if (!worker) return null;

    const userInfo = await ctx.db.get(worker.userId);
    return { ...worker, user: userInfo };
  },
});

export const update = mutation({
  args: {
    id: v.id("workers"),
    salaryType: v.optional(v.union(v.literal("daily"), v.literal("per_coconut"))),
    salaryAmount: v.optional(v.number()),
    location: v.optional(v.string()),
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
