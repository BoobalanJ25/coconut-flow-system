import { query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const getAdminStats = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    console.log("getAdminStats called for user:", user?._id, "Role:", user?.role);
    
    if (!user || user.role !== "admin") {
      console.log("Unauthorized access attempt to getAdminStats");
      return null;
    }

    const sales = await ctx.db.query("sales").collect();
    const filteredSales = sales.filter(
      (s) => s.date >= args.startDate && s.date <= args.endDate
    );
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalRevenue, 0);

    const rentPayments = await ctx.db.query("rentPayments").collect();
    const filteredRent = rentPayments.filter(
      (r) => r.paymentDate >= args.startDate && r.paymentDate <= args.endDate && r.status === "paid"
    );
    const totalRentPaid = filteredRent.reduce((sum, r) => sum + r.amount, 0);

    const salaryPayments = await ctx.db.query("salaryPayments").collect();
    const filteredSalary = salaryPayments.filter(
      (s) => s.paymentDate >= args.startDate && s.paymentDate <= args.endDate && s.status === "paid"
    );
    const totalSalaryPaid = filteredSalary.reduce((sum, s) => sum + s.amount, 0);

    const expenses = await ctx.db.query("expenses").collect();
    const filteredExpenses = expenses.filter(
      (e) => e.date >= args.startDate && e.date <= args.endDate
    );
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    const totalCosts = totalRentPaid + totalSalaryPaid + totalExpenses;
    const profit = totalRevenue - totalCosts;

    const stock = await ctx.db.query("stock").first();
    const trees = await ctx.db.query("coconutTrees").collect();
    const activeTrees = trees.filter((t) => t.status === "active").length;
    const owners = await ctx.db.query("treeOwners").collect();
    const workers = await ctx.db.query("workers").collect();
    const activeWorkers = workers.filter((w) => w.status === "active").length;

    return {
      totalRevenue,
      totalCosts,
      profit,
      totalRentPaid,
      totalSalaryPaid,
      totalExpenses,
      currentStock: stock,
      activeTrees,
      totalOwners: owners.length,
      activeWorkers,
      salesCount: filteredSales.length,
    };
  },
});

export const getWorkerStats = query({
  args: {
    workerId: v.id("users"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }

    const harvests = await ctx.db
      .query("harvests")
      .withIndex("by_cutter", (q) => q.eq("cutterWorkerId", args.workerId))
      .collect();

    const filteredHarvests = harvests.filter(
      (h) => h.dateCut >= args.startDate && h.dateCut <= args.endDate
    );

    const totalCoconuts = filteredHarvests.reduce((sum, h) => sum + h.totalCoconuts, 0);
    const treesWorked = filteredHarvests.length;

    const salaryPayments = await ctx.db
      .query("salaryPayments")
      .withIndex("by_worker", (q) => q.eq("workerId", args.workerId))
      .collect();

    const filteredPayments = salaryPayments.filter(
      (p) => p.paymentDate >= args.startDate && p.paymentDate <= args.endDate
    );

    const totalEarned = filteredPayments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingPayments = salaryPayments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalCoconuts,
      treesWorked,
      totalEarned,
      pendingPayments,
      harvestCount: filteredHarvests.length,
    };
  },
});