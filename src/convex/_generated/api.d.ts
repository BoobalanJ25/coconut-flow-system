/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as coconutTrees from "../coconutTrees.js";
import type * as dashboard from "../dashboard.js";
import type * as harvests from "../harvests.js";
import type * as http from "../http.js";
import type * as payments from "../payments.js";
import type * as sales from "../sales.js";
import type * as settings from "../settings.js";
import type * as stock from "../stock.js";
import type * as treeOwners from "../treeOwners.js";
import type * as users from "../users.js";
import type * as workers from "../workers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  coconutTrees: typeof coconutTrees;
  dashboard: typeof dashboard;
  harvests: typeof harvests;
  http: typeof http;
  payments: typeof payments;
  sales: typeof sales;
  settings: typeof settings;
  stock: typeof stock;
  treeOwners: typeof treeOwners;
  users: typeof users;
  workers: typeof workers;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
