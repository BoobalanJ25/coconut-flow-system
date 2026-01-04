import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Force redeploy: updated validators
export const createRentPayment = mutation({
  args: {
    ownerId: v.id("treeOwners"),
    amount: v.number(),
    paymentDate: v.number(),
    dueDate: v.number(),
    status: v.union(v.literal("paid"), v.literal("pending"), v.literal("overdue")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("rentPayments", args);
  },
});

export const listRentPayments = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const payments = await ctx.db.query("rentPayments").order("desc").take(100);
    
    const paymentsWithOwners = await Promise.all(
      payments.map(async (payment) => {
        const owner = await ctx.db.get(payment.ownerId);
        return { ...payment, owner };
      })
    );

    return paymentsWithOwners;
  },
});

export const createSalaryPayment = mutation({
  args: {
    workerId: v.id("users"),
    amount: v.number(),
    paymentDate: v.number(),
    periodStart: v.number(),
    periodEnd: v.number(),
    status: v.union(v.literal("paid"), v.literal("pending")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("salaryPayments", args);
  },
});

export const listSalaryPayments = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const payments = await ctx.db.query("salaryPayments").order("desc").take(100);
    
    const paymentsWithWorkers = await Promise.all(
      payments.map(async (payment) => {
        const worker = await ctx.db.get(payment.workerId);
        return { ...payment, worker };
      })
    );

    return paymentsWithWorkers;
  },
});

export const getWorkerSalaryPayments = query({
  args: { 
    workerId: v.id("users"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    if (user.role !== "admin" && user._id !== args.workerId) {
      throw new Error("Unauthorized");
    }

    const paymentsQuery = ctx.db
      .query("salaryPayments")
      .withIndex("by_worker", (q) => q.eq("workerId", args.workerId))
      .order("desc");

    if (args.startDate !== undefined && args.endDate !== undefined) {
      const allPayments = await paymentsQuery.collect();
      return allPayments.filter(
        (p) => p.paymentDate >= args.startDate! && p.paymentDate <= args.endDate!
      );
    }

    return await paymentsQuery.take(50);
  },
});