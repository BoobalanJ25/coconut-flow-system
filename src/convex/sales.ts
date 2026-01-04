import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    date: v.number(),
    quantitySold: v.number(),
    ratePerCoconut: v.number(),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const totalRevenue = args.quantitySold * args.ratePerCoconut;

    const saleId = await ctx.db.insert("sales", {
      ...args,
      totalRevenue,
    });

    const currentStock = await ctx.db.query("stock").first();
    if (currentStock) {
      await ctx.db.patch(currentStock._id, {
        freshCoconuts: Math.max(0, currentStock.freshCoconuts - args.quantitySold),
        lastUpdated: Date.now(),
      });
    }

    await ctx.db.insert("stockHistory", {
      date: args.date,
      type: "out",
      quantity: args.quantitySold,
      reason: "Sale",
      referenceId: saleId,
    });

    return saleId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.query("sales").order("desc").take(100);
  },
});

export const getStats = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const sales = await ctx.db.query("sales").collect();
    
    const filteredSales = sales.filter(
      (sale) => sale.date >= args.startDate && sale.date <= args.endDate
    );

    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalRevenue, 0);
    const totalQuantity = filteredSales.reduce((sum, sale) => sum + sale.quantitySold, 0);

    return {
      totalRevenue,
      totalQuantity,
      salesCount: filteredSales.length,
      averageRate: totalQuantity > 0 ? totalRevenue / totalQuantity : 0,
    };
  },
});
