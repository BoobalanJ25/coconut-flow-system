import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const markAttendance = mutation({
  args: {
    workerId: v.id("users"),
    date: v.number(),
    status: v.union(v.literal("present"), v.literal("absent"), v.literal("half_day"), v.literal("leave")),
    treesWorked: v.optional(v.number()),
    coconutsHarvested: v.optional(v.number()),
    amountEarned: v.optional(v.number()),
    workType: v.optional(v.union(v.literal("cutting"), v.literal("picking"), v.literal("both"), v.literal("maintenance"), v.literal("other"))),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Check if attendance already exists for this worker on this date
    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_worker_date", (q) => 
        q.eq("workerId", args.workerId).eq("date", args.date)
      )
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        status: args.status,
        treesWorked: args.treesWorked,
        coconutsHarvested: args.coconutsHarvested,
        amountEarned: args.amountEarned,
        workType: args.workType,
        notes: args.notes,
      });
    } else {
      return await ctx.db.insert("attendance", {
        workerId: args.workerId,
        date: args.date,
        status: args.status,
        treesWorked: args.treesWorked,
        coconutsHarvested: args.coconutsHarvested,
        amountEarned: args.amountEarned,
        workType: args.workType,
        notes: args.notes,
      });
    }
  },
});

export const getAttendanceByDate = query({
  args: { date: v.number() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const attendanceRecords = await ctx.db
      .query("attendance")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    // Enrich with worker details
    const enrichedRecords = await Promise.all(
      attendanceRecords.map(async (record) => {
        const workerUser = await ctx.db.get(record.workerId);
        return {
          ...record,
          workerName: workerUser?.name || "Unknown",
          workerEmail: workerUser?.email,
        };
      })
    );

    return enrichedRecords;
  },
});

export const getWorkerAttendanceHistory = query({
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

    // If worker, can only view own attendance
    if (user.role === "worker" && user._id !== args.workerId) {
      throw new Error("Unauthorized");
    }

    if (args.startDate !== undefined && args.endDate !== undefined) {
      return await ctx.db
        .query("attendance")
        .withIndex("by_worker_date", (q) => 
          q.eq("workerId", args.workerId)
           .gte("date", args.startDate!)
           .lte("date", args.endDate!)
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("attendance")
      .withIndex("by_worker", (q) => q.eq("workerId", args.workerId))
      .order("desc")
      .take(100);
  },
});