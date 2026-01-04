import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    treeId: v.id("coconutTrees"),
    dateCut: v.number(),
    totalCoconuts: v.number(),
    cutterWorkerId: v.id("users"),
    pickerWorkerId: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const harvestId = await ctx.db.insert("harvests", args);

    await ctx.db.patch(args.treeId, {
      lastCutDate: args.dateCut,
      nextCutDate: args.dateCut + 45 * 24 * 60 * 60 * 1000,
    });

    const currentStock = await ctx.db.query("stock").first();
    if (currentStock) {
      await ctx.db.patch(currentStock._id, {
        freshCoconuts: currentStock.freshCoconuts + args.totalCoconuts,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("stock", {
        freshCoconuts: args.totalCoconuts,
        oldStock: 0,
        damagedCoconuts: 0,
        lastUpdated: Date.now(),
      });
    }

    await ctx.db.insert("stockHistory", {
      date: args.dateCut,
      type: "in",
      quantity: args.totalCoconuts,
      reason: "Harvest",
      referenceId: harvestId,
    });

    return harvestId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const harvests = await ctx.db.query("harvests").order("desc").take(100);
    
    const harvestsWithDetails = await Promise.all(
      harvests.map(async (harvest) => {
        const tree = await ctx.db.get(harvest.treeId);
        const cutter = await ctx.db.get(harvest.cutterWorkerId);
        const picker = harvest.pickerWorkerId ? await ctx.db.get(harvest.pickerWorkerId) : null;
        return { ...harvest, tree, cutter, picker };
      })
    );

    return harvestsWithDetails;
  },
});

export const getByWorker = query({
  args: { workerId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const harvests = await ctx.db
      .query("harvests")
      .withIndex("by_cutter", (q) => q.eq("cutterWorkerId", args.workerId))
      .order("desc")
      .take(50);

    const harvestsWithDetails = await Promise.all(
      harvests.map(async (harvest) => {
        const tree = await ctx.db.get(harvest.treeId);
        return { ...harvest, tree };
      })
    );

    return harvestsWithDetails;
  },
});
