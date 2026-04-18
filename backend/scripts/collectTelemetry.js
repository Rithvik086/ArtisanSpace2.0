import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const BASE_URL = "https://as.lightshadow.tech/api/v1";

const DEFAULT_SUCCESS_STATUSES = [200, 201, 204];
const AUTO_PROVISIONED_ROLES = ["customer", "artisan"];

// Populated at runtime
const AUTH_TOKENS = {
  customer: null,
  artisan: null,
  manager: process.env.TELEMETRY_MANAGER_TOKEN || null,
  admin: process.env.TELEMETRY_ADMIN_TOKEN || null,
  delivery: process.env.TELEMETRY_DELIVERY_TOKEN || null,
};

const TEST_CREDENTIALS = {
  customer: null,
  artisan: null,
};

const TEST_DATA = {
  productId: null,
  deliveryOrderId: null,
};

// All routes extracted from backend configuration
const ROUTES = [
  // Health check
  { method: "GET", path: "/health", requiresAuth: false },

  // Auth routes (excluding destructive delete-account)
  {
    method: "POST",
    path: "/auth/logout",
    requiresAuth: true,
    authRole: "customer",
  },
  {
    method: "GET",
    path: "/auth/me",
    requiresAuth: true,
    authRole: "customer",
  },
  {
    method: "POST",
    path: "/auth/update-profile",
    requiresAuth: true,
    authRole: "customer",
    getBody: () => ({ name: "Telemetry User" }),
  },

  // Products routes
  { method: "GET", path: "/products/approved", requiresAuth: false },
  { method: "GET", path: "/products/public", requiresAuth: false },
  {
    method: "GET",
    path: "/products/my",
    requiresAuth: true,
    authRole: "customer",
  },
  {
    method: "GET",
    path: "/products",
    requiresAuth: true,
    authRole: "customer",
  },

  // Admin routes
  {
    method: "GET",
    path: "/admin/products",
    requiresAuth: true,
    allowedRoles: ["admin"],
    authRole: "admin",
  },
  {
    method: "GET",
    path: "/admin/orders",
    requiresAuth: true,
    allowedRoles: ["admin"],
    authRole: "admin",
  },
  {
    method: "GET",
    path: "/admin/sales",
    requiresAuth: true,
    allowedRoles: ["admin"],
    authRole: "admin",
  },

  // Manager routes
  {
    method: "GET",
    path: "/manager/products",
    requiresAuth: true,
    allowedRoles: ["manager", "admin"],
    authRole: "manager",
  },
  {
    method: "GET",
    path: "/manager/orders",
    requiresAuth: true,
    allowedRoles: ["manager", "admin"],
    authRole: "manager",
  },

  // Payment routes
  {
    method: "POST",
    path: "/payments/create-order",
    requiresAuth: true,
    authRole: "customer",
    expectedStatuses: [200, 400],
  },

  // B2B routes
  {
    method: "GET",
    path: "/b2b",
    requiresAuth: true,
    allowedRoles: ["artisan"],
    authRole: "artisan",
  },
  {
    method: "GET",
    path: "/b2b/products",
    requiresAuth: true,
    allowedRoles: ["artisan"],
    authRole: "artisan",
  },
  {
    method: "GET",
    path: "/b2b/orders",
    requiresAuth: true,
    allowedRoles: ["artisan"],
    authRole: "artisan",
  },
  {
    method: "GET",
    path: "/b2b/analytics/sales",
    requiresAuth: true,
    allowedRoles: ["artisan"],
    authRole: "artisan",
  },

  // Users routes
  {
    method: "GET",
    path: "/users",
    requiresAuth: true,
    allowedRoles: ["manager", "admin"],
    authRole: "manager",
  },

  // Cart routes (nested under /user)
  {
    method: "GET",
    path: "/cart",
    requiresAuth: true,
    authRole: "customer",
  },
  {
    method: "POST",
    path: "/cart",
    requiresAuth: true,
    authRole: "customer",
    getBody: ({ testData }) => ({ productId: testData.productId, quantity: 1 }),
    skipWhen: ({ testData }) => !testData.productId,
    skipReason: "No public product found for cart insertion",
  },
  {
    method: "PUT",
    path: "/cart",
    requiresAuth: true,
    authRole: "customer",
    getBody: ({ testData }) => ({ productId: testData.productId, action: "add" }),
    skipWhen: ({ testData }) => !testData.productId,
    skipReason: "No public product found for cart update",
  },

  // Order routes (nested under /user)
  {
    method: "GET",
    path: "/orders/user",
    requiresAuth: true,
    authRole: "customer",
  },
  {
    method: "POST",
    path: "/orders",
    requiresAuth: true,
    authRole: "customer",
    getBody: () => ({ paymentMethod: "cod" }),
    expectedStatuses: [201, 400],
  },

  // Workshop routes (nested under /user)
  {
    method: "GET",
    path: "/workshops",
    requiresAuth: true,
    allowedRoles: ["artisan", "manager", "admin"],
    authRole: "artisan",
  },
  {
    method: "GET",
    path: "/workshops/accepted",
    requiresAuth: true,
    allowedRoles: ["customer", "artisan", "manager", "admin"],
    authRole: "customer",
  },

  // Ticket routes (nested under /user)
  {
    method: "GET",
    path: "/tickets",
    requiresAuth: true,
    allowedRoles: ["manager", "admin"],
    authRole: "manager",
  },
  {
    method: "POST",
    path: "/tickets",
    requiresAuth: true,
    allowedRoles: ["customer", "artisan", "manager", "admin"],
    authRole: "customer",
    getBody: () => ({
      subject: "Telemetry Test Ticket",
      category: "General",
      description: "Telemetry collection validation request body.",
    }),
  },

  // Custom Request routes (nested under /user)
  {
    method: "GET",
    path: "/custom-requests",
    requiresAuth: true,
    allowedRoles: ["artisan", "manager", "admin"],
    authRole: "artisan",
  },
  {
    method: "GET",
    path: "/custom-requests/user",
    requiresAuth: true,
    allowedRoles: ["customer", "artisan", "manager", "admin"],
    authRole: "customer",
  },
  {
    method: "POST",
    path: "/custom-requests",
    requiresAuth: true,
    allowedRoles: ["customer", "artisan", "manager", "admin"],
    authRole: "customer",
    skipWhen: () => true,
    skipReason: "Requires multipart image upload and business fields",
  },

  // Data routes (nested under /user)
  {
    method: "GET",
    path: "/chart/customer_chart",
    requiresAuth: true,
    allowedRoles: ["admin", "manager", "artisan"],
    authRole: "artisan",
  },
  {
    method: "GET",
    path: "/chart/orders_chart",
    requiresAuth: true,
    allowedRoles: ["admin", "manager", "artisan"],
    authRole: "artisan",
  },
  {
    method: "GET",
    path: "/chart/products_chart",
    requiresAuth: true,
    allowedRoles: ["admin", "manager", "artisan"],
    authRole: "artisan",
  },

  // Delivery routes
  {
    method: "GET",
    path: "/delivery/available",
    requiresAuth: true,
    allowedRoles: ["delivery", "admin"],
    authRole: "delivery",
  },
  {
    method: "POST",
    path: "/delivery/accept",
    requiresAuth: true,
    allowedRoles: ["delivery", "admin"],
    authRole: "delivery",
    getBody: ({ testData }) => ({ orderId: testData.deliveryOrderId }),
    expectedStatuses: [200, 400, 403],
    skipWhen: ({ authRoleUsed, testData }) =>
      authRoleUsed === "delivery" && !testData.deliveryOrderId,
    skipReason: "No available delivery order to accept",
  },
  {
    method: "POST",
    path: "/delivery/complete",
    requiresAuth: true,
    allowedRoles: ["delivery", "admin"],
    authRole: "delivery",
    getBody: ({ testData }) => ({ orderId: testData.deliveryOrderId }),
    expectedStatuses: [200, 400, 403],
    skipWhen: ({ authRoleUsed, testData }) =>
      authRoleUsed === "delivery" && !testData.deliveryOrderId,
    skipReason: "No assigned delivery order to complete",
  },
  {
    method: "GET",
    path: "/delivery/my-orders",
    requiresAuth: true,
    allowedRoles: ["delivery", "admin"],
    authRole: "delivery",
  },

  // Additional auth coverage
  {
    method: "POST",
    path: "/auth/check-username",
    requiresAuth: false,
    getBody: () => ({
      username: TEST_CREDENTIALS.customer?.username || "telemetry_user",
    }),
    expectedStatuses: [200, 400],
  },
  {
    method: "POST",
    path: "/auth/check-email",
    requiresAuth: false,
    getBody: () => ({
      email: TEST_CREDENTIALS.customer?.email || "telemetry@test.local",
    }),
    expectedStatuses: [200, 400],
  },
  {
    method: "GET",
    path: "/auth/verify-email",
    requiresAuth: false,
    expectedStatuses: [200, 400],
  },
  {
    method: "POST",
    path: "/auth/forgot-password",
    requiresAuth: false,
    getBody: () => ({ email: TEST_CREDENTIALS.customer?.email }),
    expectedStatuses: [200, 400],
  },
  {
    method: "POST",
    path: "/auth/reset-password",
    requiresAuth: false,
    getBody: () => ({
      token: "telemetry-invalid-token",
      password: "TelemetryResetPass123!",
    }),
    expectedStatuses: [200, 400],
  },
  {
    method: "POST",
    path: "/auth/delete-account",
    requiresAuth: true,
    authRole: "customer",
    skipWhen: () => true,
    skipReason: "Destructive account deletion route",
  },
  {
    method: "DELETE",
    path: "/auth/user/:userId",
    requiresAuth: true,
    allowedRoles: ["manager", "admin"],
    authRole: "manager",
    skipWhen: () => true,
    skipReason: "Parameterized destructive route",
  },
  {
    method: "POST",
    path: "/auth/add-user",
    requiresAuth: true,
    allowedRoles: ["admin"],
    authRole: "admin",
    skipWhen: () => true,
    skipReason: "Creates privileged users",
  },

  // Additional products coverage
  {
    method: "GET",
    path: "/products/all",
    requiresAuth: true,
    allowedRoles: ["manager", "admin"],
    authRole: "manager",
  },
  {
    method: "GET",
    path: "/products/:id",
    requiresAuth: true,
    authRole: "customer",
    skipWhen: () => true,
    skipReason: "Parameterized route requires real product ID",
  },
  {
    method: "POST",
    path: "/products",
    requiresAuth: true,
    authRole: "artisan",
    skipWhen: () => true,
    skipReason: "Requires multipart upload and creates products",
  },
  {
    method: "POST",
    path: "/products/bulk",
    requiresAuth: true,
    authRole: "artisan",
    skipWhen: () => true,
    skipReason: "Bulk creation route skipped by default",
  },
  {
    method: "PATCH",
    path: "/products/:id/image",
    requiresAuth: true,
    authRole: "artisan",
    skipWhen: () => true,
    skipReason: "Requires multipart upload",
  },
  {
    method: "PATCH",
    path: "/products/:id/rejection-reason",
    requiresAuth: true,
    authRole: "manager",
    skipWhen: () => true,
    skipReason: "Parameterized moderation mutation",
  },
  {
    method: "PATCH",
    path: "/products/:id/removal-reason",
    requiresAuth: true,
    authRole: "manager",
    skipWhen: () => true,
    skipReason: "Parameterized moderation mutation",
  },
  {
    method: "PUT",
    path: "/products/:id",
    requiresAuth: true,
    authRole: "artisan",
    skipWhen: () => true,
    skipReason: "Parameterized product mutation",
  },
  {
    method: "DELETE",
    path: "/products/:id",
    requiresAuth: true,
    authRole: "artisan",
    skipWhen: () => true,
    skipReason: "Destructive product deletion route",
  },
  {
    method: "POST",
    path: "/products/moderation",
    requiresAuth: true,
    allowedRoles: ["manager", "admin"],
    authRole: "manager",
    skipWhen: () => true,
    skipReason: "Moderation mutation route",
  },

  // Additional admin and manager coverage
  {
    method: "GET",
    path: "/admin/dashboard-overview",
    requiresAuth: true,
    allowedRoles: ["admin"],
    authRole: "admin",
  },
  {
    method: "GET",
    path: "/admin/revenue-analytics",
    requiresAuth: true,
    allowedRoles: ["admin"],
    authRole: "admin",
  },
  {
    method: "GET",
    path: "/admin/revenue-by-category",
    requiresAuth: true,
    allowedRoles: ["admin"],
    authRole: "admin",
  },
  {
    method: "GET",
    path: "/admin/geographic-revenue",
    requiresAuth: true,
    allowedRoles: ["admin"],
    authRole: "admin",
  },
  {
    method: "GET",
    path: "/admin/top-selling-products",
    requiresAuth: true,
    allowedRoles: ["admin"],
    authRole: "admin",
  },
  {
    method: "GET",
    path: "/admin/inventory-analytics",
    requiresAuth: true,
    allowedRoles: ["admin"],
    authRole: "admin",
  },
  {
    method: "GET",
    path: "/admin/users",
    requiresAuth: true,
    allowedRoles: ["admin"],
    authRole: "admin",
  },
  {
    method: "GET",
    path: "/manager/sales",
    requiresAuth: true,
    allowedRoles: ["manager", "admin"],
    authRole: "manager",
  },
  {
    method: "GET",
    path: "/manager/users",
    requiresAuth: true,
    allowedRoles: ["manager", "admin"],
    authRole: "manager",
  },

  // Additional B2B coverage
  {
    method: "GET",
    path: "/b2b/products/:id",
    requiresAuth: true,
    allowedRoles: ["artisan"],
    authRole: "artisan",
    skipWhen: () => true,
    skipReason: "Parameterized route requires real product ID",
  },
  {
    method: "GET",
    path: "/b2b/orders/:orderId",
    requiresAuth: true,
    allowedRoles: ["artisan"],
    authRole: "artisan",
    skipWhen: () => true,
    skipReason: "Parameterized route requires real order ID",
  },
  {
    method: "PATCH",
    path: "/b2b/orders/:orderId/status",
    requiresAuth: true,
    allowedRoles: ["artisan"],
    authRole: "artisan",
    skipWhen: () => true,
    skipReason: "State-changing route skipped by default",
  },

  // Additional order coverage
  {
    method: "GET",
    path: "/orders/:orderId",
    requiresAuth: true,
    authRole: "customer",
    skipWhen: () => true,
    skipReason: "Parameterized route requires real order ID",
  },
  {
    method: "PUT",
    path: "/orders/:orderId/status",
    requiresAuth: true,
    allowedRoles: ["manager", "admin"],
    authRole: "manager",
    skipWhen: () => true,
    skipReason: "State-changing route skipped by default",
  },
  {
    method: "DELETE",
    path: "/orders/:orderId",
    requiresAuth: true,
    allowedRoles: ["manager", "admin"],
    authRole: "manager",
    skipWhen: () => true,
    skipReason: "Destructive route",
  },

  // Additional workshop coverage
  {
    method: "GET",
    path: "/workshops/user/:userId",
    requiresAuth: true,
    authRole: "customer",
    skipWhen: () => true,
    skipReason: "Parameterized route requires user ID",
  },
  {
    method: "POST",
    path: "/workshops",
    requiresAuth: true,
    authRole: "customer",
    skipWhen: () => true,
    skipReason: "Creates workshop/booking records",
  },
  {
    method: "PUT",
    path: "/workshops/:action/:workshopId",
    requiresAuth: true,
    allowedRoles: ["artisan", "manager", "admin"],
    authRole: "artisan",
    skipWhen: () => true,
    skipReason: "Parameterized state-changing route",
  },

  // Additional ticket and custom request coverage
  {
    method: "POST",
    path: "/tickets",
    requiresAuth: true,
    allowedRoles: ["manager", "admin"],
    authRole: "manager",
    skipWhen: () => true,
    skipReason: "Duplicate route signature mapped to delete handler",
  },
  {
    method: "PUT",
    path: "/custom-requests",
    requiresAuth: true,
    allowedRoles: ["artisan", "manager", "admin"],
    authRole: "artisan",
    skipWhen: () => true,
    skipReason: "State-changing route skipped by default",
  },
  {
    method: "DELETE",
    path: "/custom-requests/:requestId",
    requiresAuth: true,
    allowedRoles: ["manager", "admin"],
    authRole: "manager",
    skipWhen: () => true,
    skipReason: "Destructive route",
  },

  // Additional direct/alias mount coverage
  {
    method: "GET",
    path: "/data/customer_chart",
    requiresAuth: true,
    allowedRoles: ["admin", "manager", "artisan"],
    authRole: "artisan",
  },
  {
    method: "GET",
    path: "/data/orders_chart",
    requiresAuth: true,
    allowedRoles: ["admin", "manager", "artisan"],
    authRole: "artisan",
  },
  {
    method: "GET",
    path: "/data/products_chart",
    requiresAuth: true,
    allowedRoles: ["admin", "manager", "artisan"],
    authRole: "artisan",
  },
  {
    method: "GET",
    path: "/settings",
    requiresAuth: true,
    authRole: "customer",
  },
  {
    method: "GET",
    path: "/workshop",
    requiresAuth: true,
    allowedRoles: ["artisan", "manager", "admin"],
    authRole: "artisan",
  },
  {
    method: "GET",
    path: "/workshop/accepted",
    requiresAuth: true,
    allowedRoles: ["customer", "artisan", "manager", "admin"],
    authRole: "customer",
  },
  {
    method: "GET",
    path: "/custom-request",
    requiresAuth: true,
    allowedRoles: ["artisan", "manager", "admin"],
    authRole: "artisan",
  },
  {
    method: "GET",
    path: "/custom-request/user",
    requiresAuth: true,
    allowedRoles: ["customer", "artisan", "manager", "admin"],
    authRole: "customer",
  },
  {
    method: "POST",
    path: "/payments/webhooks/razorpay",
    requiresAuth: false,
    skipWhen: () => true,
    skipReason: "Webhook endpoint requires gateway signature payload",
  },
];

/**
 * Generate random test credentials
 */
function generateTestCredentials(role) {
  const timestamp = Date.now();
  const random = Math.random()
    .toString(36)
    .substring(2, 8)
    .replace(/[^a-z0-9]/g, "");
  // Username with only alphanumeric and underscores (required by schema)
  const username = `tm_${role}_${timestamp}_${random}`.substring(0, 30);
  return {
    username,
    email: `${username}@test.local`,
    password: `TelemetryTest${timestamp}Pass123!`,
    name: `Telemetry User`,
    mobile_no: `9${Math.random().toString().slice(2, 11)}`, // Generate 10-digit number
    role,
  };
}

/**
 * Signup with auto-generated credentials
 */
async function signupUser(credentials) {
  console.log(
    `📝 Creating ${credentials.role} telemetry account...\n   Username: ${credentials.username}\n   Email: ${credentials.email}`,
  );
  try {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
        mobile_no: credentials.mobile_no,
        role: credentials.role,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Account created successfully!\n`);
      return true;
    } else {
      // If account already exists or other error, we can try to login anyway
      console.log(`⚠️  Signup response: ${data.message || "Unknown error"}\n`);
      return true; // Continue to login attempt
    }
  } catch (error) {
    console.warn(`❌ Signup failed: ${error.message}`);
    return false;
  }
}

/**
 * Login and get auth token
 */
async function loginUser(credentials) {
  console.log(`🔓 Logging in as ${credentials.username} (${credentials.role})...`);
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      console.log(`✅ Successfully logged in and obtained token!\n`);
      return data.token;
    } else {
      console.warn(`❌ Login failed: ${data.message || "Unknown error"}`);
      return null;
    }
  } catch (error) {
    console.warn(`❌ Login error: ${error.message}`);
    return null;
  }
}

/**
 * Automatically signup and get auth token
 */
async function getAuthTokenForRole(role) {
  TEST_CREDENTIALS[role] = generateTestCredentials(role);

  const signupSuccess = await signupUser(TEST_CREDENTIALS[role]);
  if (!signupSuccess) {
    console.log(
      `⚠️  Signup failed for ${role}. Trying to login anyway...\n`,
    );
  }

  const token = await loginUser(TEST_CREDENTIALS[role]);
  if (!token) {
    console.error(
      `❌ Failed to authenticate role ${role}. Make sure backend is reachable and signup/login work.`,
    );
    return null;
  }

  AUTH_TOKENS[role] = token;
  return token;
}

async function setupAuth() {
  console.log("🚀 Starting role-aware authentication setup...\n");

  for (const role of AUTO_PROVISIONED_ROLES) {
    await getAuthTokenForRole(role);
  }

  ["manager", "admin", "delivery"].forEach((role) => {
    if (AUTH_TOKENS[role]) {
      console.log(`🔐 Using provided token for role: ${role}`);
    } else {
      console.log(
        `ℹ️  No token provided for ${role}. Endpoints requiring this role may return expected 403.`,
      );
    }
  });
  console.log("");
}

function extractProductsFromResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }
  if (!data || typeof data !== "object") {
    return [];
  }
  if (Array.isArray(data.products)) {
    return data.products;
  }
  if (Array.isArray(data.data)) {
    return data.data;
  }
  if (Array.isArray(data.items)) {
    return data.items;
  }
  return [];
}

// Telemetry collector
class TelemetryCollector {
  constructor() {
    this.results = [];
    this.startTime = null;
    this.endTime = null;
    this.testData = { ...TEST_DATA };
  }

  getTokenContext(route) {
    if (!route.requiresAuth) {
      return { token: null, role: null };
    }

    if (route.authRole && AUTH_TOKENS[route.authRole]) {
      return { token: AUTH_TOKENS[route.authRole], role: route.authRole };
    }

    if (route.allowedRoles?.length) {
      for (const role of route.allowedRoles) {
        if (AUTH_TOKENS[role]) {
          return { token: AUTH_TOKENS[role], role };
        }
      }
    }

    if (AUTH_TOKENS.customer) {
      return { token: AUTH_TOKENS.customer, role: "customer" };
    }

    if (AUTH_TOKENS.artisan) {
      return { token: AUTH_TOKENS.artisan, role: "artisan" };
    }

    return { token: null, role: null };
  }

  getExpectedStatuses(route, authRoleUsed) {
    const statuses = new Set(
      route.expectedStatuses?.length
        ? route.expectedStatuses
        : DEFAULT_SUCCESS_STATUSES,
    );

    if (route.allowedRoles?.length) {
      if (!authRoleUsed || !route.allowedRoles.includes(authRoleUsed)) {
        statuses.add(403);
      }
    }

    return Array.from(statuses);
  }

  async prepareTestData() {
    try {
      const productsRes = await fetch(`${BASE_URL}/products/approved`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const productsData = await productsRes.json().catch(() => null);
      const products = extractProductsFromResponse(productsData);
      const firstProduct = products[0];

      this.testData.productId = firstProduct?._id || firstProduct?.id || null;

      if (this.testData.productId) {
        console.log(`🧩 Prepared productId for cart/order flows: ${this.testData.productId}`);
      } else {
        console.log("ℹ️  No public product available; cart mutation routes may be skipped.");
      }
    } catch (error) {
      console.warn(`⚠️  Failed to prepare product data: ${error.message}`);
    }

    if (AUTH_TOKENS.delivery) {
      try {
        const response = await fetch(`${BASE_URL}/delivery/available`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AUTH_TOKENS.delivery}`,
          },
        });

        const data = await response.json().catch(() => null);
        const orders = Array.isArray(data?.orders) ? data.orders : [];
        const firstOrder = orders[0];
        this.testData.deliveryOrderId = firstOrder?._id || firstOrder?.id || null;

        if (this.testData.deliveryOrderId) {
          console.log(
            `🧩 Prepared delivery orderId for delivery mutations: ${this.testData.deliveryOrderId}`,
          );
        }
      } catch (error) {
        console.warn(`⚠️  Failed to prepare delivery data: ${error.message}`);
      }
    }
  }

  async collectTelemetry() {
    console.log("🚀 Starting telemetry collection...");
    console.log(`📍 Base URL: ${BASE_URL}`);
    console.log(`📊 Total routes to test: ${ROUTES.length}\n`);

    this.startTime = new Date();

    await this.prepareTestData();
    console.log("");

    for (const route of ROUTES) {
      await this.testRoute(route);
      // Small delay to avoid overwhelming the server
      await this.sleep(100);
    }

    this.endTime = new Date();

    console.log("\n✅ Telemetry collection completed!");
    return this.generateReport();
  }

  async testRoute(route) {
    const url = `${BASE_URL}${route.path}`;
    const headers = {
      "Content-Type": "application/json",
    };

    const { token, role: authRoleUsed } = this.getTokenContext(route);

    if (route.requiresAuth && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (route.skipWhen?.({ testData: this.testData, authRoleUsed })) {
      const skippedResult = {
        method: route.method,
        path: route.path,
        url,
        statusCode: null,
        responseTime: 0,
        responseSize: 0,
        success: true,
        skipped: true,
        requiresAuth: route.requiresAuth,
        authRoleUsed,
        expectedStatuses: [],
        timestamp: new Date().toISOString(),
        error: null,
        note: route.skipReason || "Skipped by route condition",
      };

      this.results.push(skippedResult);
      console.log(
        `⏭️  SKIP  ${route.method.padEnd(6)} ${route.path.padEnd(40)} ${skippedResult.note}`,
      );
      return;
    }

    const body = route.getBody?.({ testData: this.testData, authRoleUsed });

    const startTime = performance.now();
    let statusCode = 0;
    let responseSize = 0;
    let success = false;
    let errorMessage = null;
    const expectedStatuses = this.getExpectedStatuses(route, authRoleUsed);

    try {
      const response = await fetch(url, {
        method: route.method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {}),
        timeout: 10000,
      });

      statusCode = response.status;
      const text = await response.text();
      responseSize = Buffer.byteLength(text);
      success = expectedStatuses.includes(statusCode);

      if (!success) {
        errorMessage = `HTTP ${statusCode} (expected: ${expectedStatuses.join(", ")})`;
      }
    } catch (error) {
      success = false;
      errorMessage = error.message;
      statusCode = 0;
    }

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    const result = {
      method: route.method,
      path: route.path,
      url: url,
      statusCode,
      responseTime: Math.round(responseTime * 100) / 100, // Round to 2 decimals
      responseSize,
      success,
      skipped: false,
      requiresAuth: route.requiresAuth,
      authRoleUsed,
      expectedStatuses,
      timestamp: new Date().toISOString(),
      error: errorMessage,
    };

    this.results.push(result);

    // Console output with status indicator
    const statusIndicator = success ? "✅" : "❌";
    const timeColor =
      responseTime < 100 ? "⚡" : responseTime < 500 ? "🟡" : "🔴";
    console.log(
      `${statusIndicator} ${timeColor} ${route.method.padEnd(6)} ${route.path.padEnd(40)} ${responseTime.toFixed(2)}ms ${statusCode}${authRoleUsed ? ` [${authRoleUsed}]` : ""}`,
    );
  }

  generateReport() {
    const totalTime = this.endTime - this.startTime;
    const executedResults = this.results.filter((r) => !r.skipped);
    const skippedRequests = this.results.filter((r) => r.skipped).length;
    const successfulRequests = executedResults.filter((r) => r.success).length;
    const failedRequests = executedResults.filter((r) => !r.success).length;

    const responseTimes = executedResults.map((r) => r.responseTime);
    const avgResponseTime =
      responseTimes.reduce((a, b) => a + b, 0) /
      (responseTimes.length || 1);
    const minResponseTime = responseTimes.length ? Math.min(...responseTimes) : 0;
    const maxResponseTime = responseTimes.length ? Math.max(...responseTimes) : 0;

    const totalResponseSize = executedResults.reduce(
      (total, r) => total + r.responseSize,
      0,
    );

    // Find fastest and slowest routes
    const sortedByTime = [...executedResults].sort(
      (a, b) => a.responseTime - b.responseTime,
    );
    const fastestRoutes = sortedByTime.slice(0, 5);
    const slowestRoutes = sortedByTime.slice(-5).reverse();

    const report = {
      metadata: {
        collectionTime: new Date().toISOString(),
        baseUrl: BASE_URL,
        totalDuration: `${totalTime.toFixed(2)}ms`,
      },
      summary: {
        totalRoutes: ROUTES.length,
        executedRoutes: executedResults.length,
        skippedRequests,
        successfulRequests,
        failedRequests,
        successRate: `${((successfulRequests / (executedResults.length || 1)) * 100).toFixed(2)}%`,
      },
      responseTimeStats: {
        average: `${avgResponseTime.toFixed(2)}ms`,
        min: `${minResponseTime.toFixed(2)}ms`,
        max: `${maxResponseTime.toFixed(2)}ms`,
      },
      dataStats: {
        totalDataTransferred: `${(totalResponseSize / 1024).toFixed(2)} KB`,
        averageResponseSize: `${(totalResponseSize / (executedResults.length || 1) / 1024).toFixed(2)} KB`,
      },
      fastestRoutes: fastestRoutes.map((r) => ({
        method: r.method,
        path: r.path,
        responseTime: `${r.responseTime}ms`,
        statusCode: r.statusCode,
      })),
      slowestRoutes: slowestRoutes.map((r) => ({
        method: r.method,
        path: r.path,
        responseTime: `${r.responseTime}ms`,
        statusCode: r.statusCode,
      })),
      failedRoutes: this.results
        .filter((r) => !r.skipped && !r.success)
        .map((r) => ({
          method: r.method,
          path: r.path,
          statusCode: r.statusCode,
          error: r.error,
          authRoleUsed: r.authRoleUsed,
          expectedStatuses: r.expectedStatuses,
        })),
      detailedResults: this.results,
    };

    return report;
  }

  async saveReport(report) {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);
    const filename = `telemetry-${timestamp}.json`;
    const filePath = path.join(__dirname, "../telemetry", filename);

    // Create telemetry directory if it doesn't exist
    const telemetryDir = path.dirname(filePath);
    if (!fs.existsSync(telemetryDir)) {
      fs.mkdirSync(telemetryDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    console.log(`\n📁 Telemetry report saved to: ${filePath}`);

    return filePath;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  try {
    await setupAuth();

    const collector = new TelemetryCollector();
    const report = await collector.collectTelemetry();
    await collector.saveReport(report);

    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 TELEMETRY SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Routes Tested: ${report.summary.totalRoutes}`);
    console.log(`Executed: ${report.summary.executedRoutes}`);
    console.log(`Skipped: ${report.summary.skippedRequests}`);
    console.log(`Successful: ${report.summary.successfulRequests}`);
    console.log(`Failed: ${report.summary.failedRequests}`);
    console.log(`Success Rate: ${report.summary.successRate}`);
    console.log("\n⏱️  RESPONSE TIME STATS");
    console.log(`Average: ${report.responseTimeStats.average}`);
    console.log(`Fastest: ${report.responseTimeStats.min}`);
    console.log(`Slowest: ${report.responseTimeStats.max}`);
    console.log("\n🚀 TOP 5 FASTEST ROUTES:");
    report.fastestRoutes.forEach((route, i) => {
      console.log(
        `  ${i + 1}. ${route.method.padEnd(6)} ${route.path} - ${route.responseTime}`,
      );
    });
    console.log("\n🐢 TOP 5 SLOWEST ROUTES:");
    report.slowestRoutes.forEach((route, i) => {
      console.log(
        `  ${i + 1}. ${route.method.padEnd(6)} ${route.path} - ${route.responseTime}`,
      );
    });

    if (report.failedRoutes.length > 0) {
      console.log("\n⚠️  FAILED ROUTES:");
      report.failedRoutes.forEach((route) => {
        console.log(
          `  ❌ ${route.method.padEnd(6)} ${route.path} - ${route.error}${route.authRoleUsed ? ` [role:${route.authRoleUsed}]` : ""}`,
        );
      });
    }

    console.log("\n" + "=".repeat(60) + "\n");
  } catch (error) {
    console.error("❌ Error during telemetry collection:", error);
    process.exit(1);
  }
}

main();
