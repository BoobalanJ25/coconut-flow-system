import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// User roles
export const ROLES = {
  ADMIN: "admin",
  WORKER: "worker",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.WORKER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      phone: v.optional(v.string()),
    }).index("email", ["email"]),

    // Tree Owners (Landlords)
    treeOwners: defineTable({
      name: v.string(),
      phone: v.string(),
      location: v.string(),
      numberOfTrees: v.number(),
      annualRent: v.number(),
      notes: v.optional(v.string()),
    }),

    // Coconut Trees
    coconutTrees: defineTable({
      treeId: v.string(),
      ownerId: v.id("treeOwners"),
      location: v.string(),
      rentPerYear: v.number(),
      expectedCoconutsCount: v.number(),
      lastCutDate: v.optional(v.number()),
      nextCutDate: v.optional(v.number()),
      assignedWorkerId: v.optional(v.id("users")),
      status: v.union(v.literal("active"), v.literal("inactive")),
    })
      .index("by_owner", ["ownerId"])
      .index("by_worker", ["assignedWorkerId"])
      .index("by_tree_id", ["treeId"]),

    // Workers
    workers: defineTable({
      userId: v.id("users"),
      salaryType: v.union(v.literal("daily"), v.literal("per_coconut")),
      salaryAmount: v.number(),
      location: v.string(),
      status: v.union(v.literal("active"), v.literal("inactive")),
    }).index("by_user", ["userId"]),

    // Attendance & Work Records
    attendance: defineTable({
      workerId: v.id("users"),
      date: v.number(),
      status: v.union(v.literal("present"), v.literal("absent"), v.literal("half_day"), v.literal("leave")),
      treesWorked: v.optional(v.number()),
      coconutsHarvested: v.optional(v.number()),
      amountEarned: v.optional(v.number()),
      workType: v.optional(v.union(v.literal("cutting"), v.literal("picking"), v.literal("both"), v.literal("maintenance"), v.literal("other"))),
      notes: v.optional(v.string()),
    })
      .index("by_worker", ["workerId"])
      .index("by_date", ["date"])
      .index("by_worker_date", ["workerId", "date"]),

    // Harvest Records
    harvests: defineTable({
      treeId: v.id("coconutTrees"),
      dateCut: v.number(),
      totalCoconuts: v.number(),
      cutterWorkerId: v.id("users"),
      pickerWorkerId: v.optional(v.id("users")),
      notes: v.optional(v.string()),
    })
      .index("by_tree", ["treeId"])
      .index("by_cutter", ["cutterWorkerId"])
      .index("by_date", ["dateCut"]),

    // Stock Management
    stock: defineTable({
      freshCoconuts: v.number(),
      oldStock: v.number(),
      damagedCoconuts: v.number(),
      lastUpdated: v.number(),
    }),

    // Stock History
    stockHistory: defineTable({
      date: v.number(),
      type: v.union(v.literal("in"), v.literal("out"), v.literal("wastage")),
      quantity: v.number(),
      reason: v.string(),
      referenceId: v.optional(v.string()),
    }).index("by_date", ["date"]),

    // Sales
    sales: defineTable({
      date: v.number(),
      quantitySold: v.number(),
      ratePerCoconut: v.number(),
      totalRevenue: v.number(),
      customerName: v.optional(v.string()),
      customerPhone: v.optional(v.string()),
      notes: v.optional(v.string()),
    }).index("by_date", ["date"]),

    // Rent Payments to Tree Owners
    rentPayments: defineTable({
      ownerId: v.id("treeOwners"),
      amount: v.number(),
      paymentDate: v.number(),
      dueDate: v.number(),
      status: v.union(v.literal("paid"), v.literal("pending"), v.literal("overdue")),
      notes: v.optional(v.string()),
    })
      .index("by_owner", ["ownerId"])
      .index("by_status", ["status"]),

    // Salary Payments to Workers
    salaryPayments: defineTable({
      workerId: v.id("users"),
      amount: v.number(),
      paymentDate: v.number(),
      periodStart: v.number(),
      periodEnd: v.number(),
      status: v.union(v.literal("paid"), v.literal("pending")),
      notes: v.optional(v.string()),
    })
      .index("by_worker", ["workerId"])
      .index("by_status", ["status"])
      .index("by_worker_date", ["workerId", "paymentDate"]),

    // Expenses
    expenses: defineTable({
      date: v.number(),
      category: v.union(
        v.literal("transport"),
        v.literal("storage"),
        v.literal("maintenance"),
        v.literal("other")
      ),
      amount: v.number(),
      description: v.string(),
      notes: v.optional(v.string()),
    }).index("by_date", ["date"]),

    // Business Settings
    settings: defineTable({
      businessName: v.string(),
      location: v.string(),
      phone: v.string(),
      email: v.optional(v.string()),
      defaultRentCycle: v.number(), // in days
    }),
  },
  {
    schemaValidation: false,
  },
);

export default schema;