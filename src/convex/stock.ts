import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.query("stock").first();
  },
});

export const updateStock = mutation({
  args: {
    freshCoconuts: v.optional(v.number()),
    oldStock: v.optional(v.number()),
    damagedCoconuts: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const currentStock = await ctx.db.query("stock").first();
    
    if (currentStock) {
      await ctx.db.patch(currentStock._id, {
        ...args,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("stock", {
        freshCoconuts: args.freshCoconuts || 0,
        oldStock: args.oldStock || 0,
        damagedCoconuts: args.damagedCoconuts || 0,
        lastUpdated: Date.now(),
      });
    }
  },
});

export const getHistory = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.query("stockHistory").order("desc").take(100);
  },
});
