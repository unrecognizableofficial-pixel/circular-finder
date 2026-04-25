const baseUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:4000/api";
const nonce = Date.now().toString(36);

const results = [];
const failures = [];

const state = {
  admin: null,
  tempUser: null,
  tempUserPassword: `Circular${nonce}!`,
  resetPassword: `CircularReset${nonce}!`,
  existingBrand: null,
  existingSubBrand: null,
  existingProduct: null,
  existingInventory: null,
  existingCircularCode: null,
  createdPostId: null,
  createdProductId: null,
  createdPresetId: null,
  createdCircularCode: null,
  createdOrderId: null,
  trainingAssignmentId: null
};

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(method, path, { token, body, expectedStatus = 200 } = {}) {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (response.status !== expectedStatus) {
    throw new Error(`${method} ${path} returned ${response.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
  }

  return data;
}

async function step(name, action) {
  try {
    const detail = await action();
    results.push({ name, status: "passed", detail });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    results.push({ name, status: "failed", detail: message });
    failures.push(name);
  }
}

function summarizeArray(value, countKey = "count") {
  return Array.isArray(value) ? { [countKey]: value.length } : { [countKey]: 0 };
}

await step("Health", async () => {
  const data = await request("GET", "/health");
  ensure(data?.status === "ok", "Health status was not ok.");
  return data;
});

await step("Auth Public Endpoints", async () => {
  const [google, apple, verifyEmail] = await Promise.all([
    request("GET", "/auth/oauth/google"),
    request("GET", "/auth/oauth/apple"),
    request("GET", "/auth/verify-email/demo-token")
  ]);
  ensure(google?.provider === "google", "Google OAuth bootstrap failed.");
  ensure(apple?.provider === "apple", "Apple OAuth bootstrap failed.");
  ensure(verifyEmail?.success === true, "Email verify endpoint failed.");
  return { google: google.provider, apple: apple.provider, verifyEmail: verifyEmail.success };
});

await step("Auth Register / Login / Refresh / Reset / Logout", async () => {
  const email = `verify-${nonce}@circularfinder.demo`;
  const register = await request("POST", "/auth/register", {
    expectedStatus: 201,
    body: {
      fullName: `Verifier ${nonce}`,
      email,
      password: state.tempUserPassword,
      roleKey: "STANDARD_USER"
    }
  });

  state.tempUser = {
    id: register.user.id,
    email,
    token: register.accessToken,
    refreshToken: register.refreshToken
  };

  const login = await request("POST", "/auth/login", {
    expectedStatus: 201,
    body: {
      email,
      password: state.tempUserPassword
    }
  });

  const refresh = await request("POST", "/auth/refresh", {
    expectedStatus: 201,
    body: { refreshToken: login.refreshToken }
  });

  const forgot = await request("POST", "/auth/forgot-password", {
    expectedStatus: 201,
    body: { email }
  });

  const reset = await request("POST", "/auth/reset-password", {
    expectedStatus: 201,
    body: { email, newPassword: state.resetPassword, token: `reset-${nonce}` }
  });

  const relogin = await request("POST", "/auth/login", {
    expectedStatus: 201,
    body: {
      email,
      password: state.resetPassword
    }
  });

  state.tempUser.token = relogin.accessToken;
  state.tempUser.refreshToken = relogin.refreshToken;

  const logout = await request("POST", "/auth/logout", {
    token: state.tempUser.token,
    expectedStatus: 201
  });

  ensure(register.user.role === "STANDARD_USER", "Unexpected role from register.");
  ensure(Boolean(refresh.accessToken), "Refresh token flow failed.");
  ensure(forgot.accepted === true, "Forgot password did not accept.");
  ensure(reset.success === true, "Reset password failed.");
  ensure(logout.success === true, "Logout failed.");
  return {
    userId: state.tempUser.id,
    refreshed: Boolean(refresh.accessToken),
    reset: reset.success,
    logout: logout.success
  };
});

await step("Admin Login", async () => {
  const login = await request("POST", "/auth/login", {
    expectedStatus: 201,
    body: {
      email: "mia-parker-0@circularfinder.demo",
      password: "Circular123!"
    }
  });
  state.admin = {
    id: login.user.id,
    email: login.user.email,
    token: login.accessToken
  };
  ensure(login.user.role === "MASTER_BRAND_ADMIN", "Admin login did not return master admin.");
  return { adminId: state.admin.id, email: state.admin.email };
});

await step("Users", async () => {
  const users = await request("GET", "/users", { token: state.admin.token });
  const tempUser = users.find((user) => user.id === state.tempUser.id);
  ensure(users.length >= 100, "Users list was unexpectedly short.");
  ensure(tempUser, "Temporary user missing from users list.");

  const user = await request("GET", `/users/${state.tempUser.id}`, { token: state.admin.token });
  const warning = await request("PATCH", `/users/${state.tempUser.id}/status`, {
    token: state.admin.token,
    body: { status: "WARNING" }
  });
  const active = await request("PATCH", `/users/${state.tempUser.id}/status`, {
    token: state.admin.token,
    body: { status: "ACTIVE" }
  });

  ensure(user.id === state.tempUser.id, "User lookup mismatch.");
  ensure(warning.status === "WARNING", "Failed to set WARNING status.");
  ensure(active.status === "ACTIVE", "Failed to restore ACTIVE status.");
  return { count: users.length, tempUserStatus: active.status };
});

await step("Roles and Permissions", async () => {
  const roles = await request("GET", "/roles", { token: state.admin.token });
  const permissions = await request("GET", "/permissions", { token: state.admin.token });
  const standardRole = roles.find((role) => role.key === "STANDARD_USER");
  ensure(standardRole, "STANDARD_USER role not found.");

  const permissionKeys = standardRole.permissions.map((entry) => entry.permission.key);
  await request("POST", "/roles/STANDARD_USER/permissions", {
    token: state.admin.token,
    expectedStatus: 201,
    body: { permissionKeys }
  });

  const check = await request("POST", "/permissions/check", {
    token: state.admin.token,
    expectedStatus: 201,
    body: {
      roleKey: "STANDARD_USER",
      resource: "feed",
      action: "read"
    }
  });

  ensure(Array.isArray(permissions) && permissions.length > 0, "Permissions list was empty.");
  ensure(check.allowed === true, "Expected STANDARD_USER to have feed:read.");
  return { roles: roles.length, permissions: permissions.length, check: check.allowed };
});

await step("Profiles", async () => {
  const me = await request("GET", "/profiles/me", { token: state.tempUser.token });
  const updated = await request("PATCH", "/profiles/me", {
    token: state.tempUser.token,
    body: {
      bio: `Live verification profile ${nonce}`,
      location: "Los Angeles, United States",
      nearbyEnabled: true,
      stylePreferences: ["tailored", "minimal"]
    }
  });
  const search = await request("GET", `/profiles/search?q=${encodeURIComponent("Verifier")}`, { token: state.admin.token });
  const suggestions = await request("GET", "/profiles/suggestions", { token: state.admin.token });

  ensure(me.userId === state.tempUser.id, "Profile me endpoint returned wrong user.");
  ensure(updated.bio.includes("Live verification"), "Profile update did not persist.");
  ensure(Array.isArray(search) && search.some((profile) => profile.userId === state.tempUser.id), "Profile search missed temp user.");
  ensure(Array.isArray(suggestions), "Suggestions did not return an array.");
  return { searchCount: search.length, suggestionCount: suggestions.length };
});

await step("Feed and Follows", async () => {
  const suggestedFeed = await request("GET", "/feed/suggested", { token: state.tempUser.token });
  ensure(Array.isArray(suggestedFeed) && suggestedFeed.length > 0, "Suggested feed was empty.");

  const followTargetId = suggestedFeed[0]?.author?.id ?? suggestedFeed[0]?.authorId;
  ensure(followTargetId, "Could not determine follow target.");

  await request("POST", `/follows/${followTargetId}`, {
    token: state.tempUser.token,
    expectedStatus: 201
  });

  const relationships = await request("GET", "/follows/me", { token: state.tempUser.token });
  const followingFeed = await request("GET", "/feed/following", { token: state.tempUser.token });
  const trending = await request("GET", "/feed/trending", { token: state.tempUser.token });
  const suggested = await request("GET", "/feed/suggested-follows", { token: state.tempUser.token });

  const created = await request("POST", "/feed", {
    token: state.tempUser.token,
    body: {
      title: `Verification post ${nonce}`,
      caption: "Circular Finder live verification post",
      autoCaption: "Generated during live API verification",
      cta: "Explore the demo"
    },
    expectedStatus: 201
  });
  state.createdPostId = created.id;

  await request("POST", `/feed/${state.createdPostId}/like`, { token: state.admin.token, expectedStatus: 201 });
  await request("POST", `/feed/${state.createdPostId}/comment`, {
    token: state.admin.token,
    body: { body: "Verified in live smoke test." },
    expectedStatus: 201
  });
  await request("POST", `/feed/${state.createdPostId}/share`, { token: state.admin.token, expectedStatus: 201 });
  await request("POST", `/feed/${state.createdPostId}/save`, { token: state.admin.token, expectedStatus: 201 });
  await request("DELETE", `/feed/${state.createdPostId}`, { token: state.tempUser.token });
  await request("DELETE", `/follows/${followTargetId}`, { token: state.tempUser.token });

  ensure(Array.isArray(relationships.following), "Follow relationships missing following list.");
  ensure(Array.isArray(followingFeed), "Following feed did not return an array.");
  ensure(Array.isArray(trending) && trending.length > 0, "Trending feed was empty.");
  ensure(Array.isArray(suggested), "Suggested follows was not an array.");
  return {
    following: relationships.following.length,
    followingFeed: followingFeed.length,
    trending: trending.length,
    suggestedFollows: suggested.length
  };
});

await step("Products", async () => {
  const products = await request("GET", "/products", { token: state.admin.token });
  ensure(Array.isArray(products) && products.length > 0, "Products list was empty.");

  const productWithInventory = products.find((entry) => Array.isArray(entry.inventories) && entry.inventories.length > 0);
  const productWithCircularId = products.find((entry) => Array.isArray(entry.circularIds) && entry.circularIds.length > 0);
  const chosenProduct = productWithInventory ?? productWithCircularId ?? products[0];

  state.existingProduct = chosenProduct;
  state.existingInventory = productWithInventory?.inventories?.[0] ?? null;
  state.existingCircularCode = productWithCircularId?.circularIds?.[0]?.code ?? null;
  state.existingBrand = chosenProduct.brand;
  state.existingSubBrand = chosenProduct.subBrand ?? null;

  const product = await request("GET", `/products/${state.existingProduct.id}`, { token: state.admin.token });
  const inventory = await request("GET", `/products/${state.existingProduct.id}/inventory`, { token: state.admin.token });

  const created = await request("POST", "/products", {
    token: state.admin.token,
    body: {
      brandId: state.existingBrand.id,
      subBrandId: state.existingSubBrand?.id,
      name: `Verifier Product ${nonce}`,
      sku: `VERIFY-${nonce.toUpperCase()}`,
      category: "Outerwear",
      description: "Live verification product",
      materials: ["Organic cotton", "Recycled nylon"],
      price: 199,
      carbonScore: 81,
      repairabilityScore: 84,
      sustainabilityScore: 89,
      reuseValue: 112,
      fitGuidance: "Regular fit",
      careInstructions: "Cold wash",
      origin: "Portugal",
      verified: true
    },
    expectedStatus: 201
  });
  state.createdProductId = created.id;

  const patched = await request("PATCH", `/products/${state.createdProductId}`, {
    token: state.admin.token,
    body: {
      description: "Updated during live verification",
      sustainabilityScore: 91
    }
  });

  ensure(product.id === state.existingProduct.id, "Product lookup mismatch.");
  ensure(Array.isArray(inventory), "Inventory endpoint did not return an array.");
  ensure(patched.sustainabilityScore === 91, "Product patch did not persist.");
  return {
    catalogCount: products.length,
    inventoryCount: inventory.length,
    createdProductId: state.createdProductId
  };
});

await step("Orders", async () => {
  ensure(state.existingInventory?.id, "No seeded inventory item available for checkout.");

  const order = await request("POST", "/orders/checkout", {
    token: state.tempUser.token,
    body: {
      productId: state.existingProduct.id,
      inventoryId: state.existingInventory.id,
      quantity: 1,
      shippingLine1: "100 Demo Street",
      shippingCity: "Los Angeles",
      shippingCountry: "United States"
    },
    expectedStatus: 201
  });
  state.createdOrderId = order.id;

  const mine = await request("GET", "/orders", { token: state.tempUser.token });
  const updated = await request("PATCH", `/orders/${state.createdOrderId}/status/PAID`, {
    token: state.admin.token
  });

  ensure(mine.some((entry) => entry.id === state.createdOrderId), "New order missing from order list.");
  ensure(updated.status === "PAID", "Order status did not update.");
  return { orderId: state.createdOrderId, orderCount: mine.length };
});

await step("Brands", async () => {
  const brands = await request("GET", "/brands", { token: state.admin.token });
  ensure(Array.isArray(brands) && brands.length > 0, "Brands list was empty.");

  const brand = brands[0];
  const brandDetail = await request("GET", `/brands/${brand.id}`, { token: state.admin.token });
  const subBrands = await request("GET", `/brands/${brand.id}/sub-brands`, { token: state.admin.token });
  state.existingBrand = brand;
  state.existingSubBrand = subBrands[0] ?? state.existingSubBrand;

  const preset = await request("POST", "/brands/presets", {
    token: state.admin.token,
    body: {
      brandId: brand.id,
      subBrandId: state.existingSubBrand?.id,
      name: `Verifier preset ${nonce}`,
      colorFamily: "Graphite / Sand",
      typography: "Modern Grotesk",
      darkModePreview: { accent: "#112233", surface: "#0f1115" },
      lightModePreview: { accent: "#335577", surface: "#f7f4ef" }
    },
    expectedStatus: 201
  });
  state.createdPresetId = preset.id;

  ensure(brandDetail.id === brand.id, "Brand detail mismatch.");
  ensure(Array.isArray(subBrands), "Sub-brands endpoint did not return array.");
  return { brands: brands.length, subBrands: subBrands.length, createdPresetId: preset.id };
});

await step("Governance", async () => {
  const presets = await request("GET", "/governance/presets", { token: state.admin.token });
  const policies = await request("GET", "/governance/policies", { token: state.admin.token });
  const auditTrail = await request("GET", "/governance/audit-trail", { token: state.admin.token });
  const approved = await request("POST", `/governance/presets/${state.createdPresetId}/approve`, {
    token: state.admin.token,
    body: {
      approvedById: state.admin.id
    },
    expectedStatus: 201
  });
  const reverted = await request("POST", `/governance/sub-brands/${state.existingSubBrand.id}/revert`, {
    token: state.admin.token,
    expectedStatus: 201
  });

  ensure(Array.isArray(presets), "Governance presets was not an array.");
  ensure(Array.isArray(policies.precedence), "Policies response missing precedence.");
  ensure(Array.isArray(auditTrail), "Audit trail was not an array.");
  ensure(Boolean(approved.approvedAt), "Preset approval did not set approvedAt.");
  ensure(typeof reverted.count === "number", "Revert response did not include count.");
  return { presets: presets.length, auditTrail: auditTrail.length, reverted: reverted.count };
});

await step("Impact / Leaderboard / Challenges", async () => {
  const adminChallenges = await request("GET", "/impact/challenges", { token: state.admin.token });
  ensure(Array.isArray(adminChallenges) && adminChallenges.length > 0, "Seeded admin challenge progress was empty.");

  const challengeId = adminChallenges[0].challenge.id;
  const before = await request("GET", "/impact/summary", { token: state.tempUser.token });
  const award = await request("POST", "/impact/award", {
    token: state.admin.token,
    body: {
      userId: state.tempUser.id,
      type: "SOCIAL_ENGAGEMENT",
      points: 42,
      reason: "Live verification award"
    },
    expectedStatus: 201
  });
  const completed = await request("POST", `/challenges/${challengeId}/complete`, {
    token: state.tempUser.token,
    expectedStatus: 201
  });
  const impactChallenges = await request("GET", "/impact/challenges", { token: state.tempUser.token });
  const challenges = await request("GET", "/challenges", { token: state.tempUser.token });
  const impactLeaderboard = await request("GET", "/impact/leaderboard", { token: state.tempUser.token });
  const leaderboard = await request("GET", "/leaderboard", { token: state.tempUser.token });
  const after = await request("GET", "/impact/summary", { token: state.tempUser.token });

  ensure(after.totalPoints > before.totalPoints, "Impact summary points did not increase.");
  ensure(award.points === 42, "Impact award response mismatch.");
  ensure(completed.alreadyCompleted === false || completed.alreadyCompleted === undefined, "Challenge unexpectedly already completed.");
  ensure(Array.isArray(impactChallenges), "Impact challenges was not an array.");
  ensure(Array.isArray(challenges), "Challenges endpoint was not an array.");
  ensure(Array.isArray(impactLeaderboard) && impactLeaderboard.length > 0, "Impact leaderboard was empty.");
  ensure(Array.isArray(leaderboard) && leaderboard.length > 0, "Leaderboard endpoint was empty.");
  return {
    beforePoints: before.totalPoints,
    afterPoints: after.totalPoints,
    leaderboardBoards: leaderboard.length
  };
});

await step("Circular ID and Scanner", async () => {
  ensure(state.existingCircularCode, "No seeded circular ID was available.");
  const historyBefore = await request("GET", "/scanner/history", { token: state.admin.token });
  const lookup = await request("POST", "/scanner/lookup", {
    token: state.admin.token,
    body: {
      value: state.existingCircularCode,
      scanType: "Circular ID",
      locationText: "Los Angeles demo"
    },
    expectedStatus: 201
  });

  const created = await request("POST", "/circular-id", {
    token: state.admin.token,
    body: {
      productId: state.createdProductId,
      origin: "Portugal",
      materials: ["Organic cotton", "Recycled nylon"],
      fitGuidance: "Modern regular fit",
      repairGuide: "Repair seams and refresh trims",
      careInstructions: "Cold wash and line dry",
      sustainabilityScore: 88
    },
    expectedStatus: 201
  });
  state.createdCircularCode = created.code;

  const circular = await request("GET", `/circular-id/${state.createdCircularCode}`, { token: state.admin.token });
  const transfer = await request("POST", `/circular-id/${state.createdCircularCode}/transfer`, {
    token: state.admin.token,
    body: {
      fromUserId: state.admin.id,
      toUserId: state.tempUser.id,
      salePrice: 125,
      notes: "Transferred during live verification"
    },
    expectedStatus: 201
  });
  const lifecycle = await request("POST", `/circular-id/${state.createdCircularCode}/lifecycle/resale-ready`, {
    token: state.admin.token,
    expectedStatus: 201
  });
  const historyAfter = await request("GET", "/scanner/history", { token: state.admin.token });

  ensure(lookup.code === state.existingCircularCode, "Scanner lookup returned wrong circular ID.");
  ensure(circular.code === state.createdCircularCode, "Created circular ID could not be fetched.");
  ensure(transfer.circularIdId === circular.id, "Ownership transfer did not target created circular ID.");
  ensure(lifecycle.lifecycleState === "resale-ready", "Lifecycle state did not update.");
  ensure(
    historyAfter.some((entry) => entry.circularId?.code === state.existingCircularCode),
    "Scanner history did not include the lookup result."
  );
  return {
    lookedUp: lookup.code,
    created: state.createdCircularCode,
    historyCount: historyAfter.length
  };
});

await step("Notifications", async () => {
  const created = await request("POST", "/notifications", {
    token: state.admin.token,
    body: {
      userId: state.tempUser.id,
      type: "SYSTEM",
      title: "Live verification",
      body: "Notification generated during live verification.",
      payload: { nonce }
    },
    expectedStatus: 201
  });
  const mine = await request("GET", "/notifications", { token: state.tempUser.token });

  ensure(created.userId === state.tempUser.id, "Notification target mismatch.");
  ensure(mine.some((notification) => notification.id === created.id), "Created notification missing from recipient list.");
  return { notificationId: created.id, notificationCount: mine.length };
});

await step("Analytics", async () => {
  const overview = await request("GET", "/analytics/overview", { token: state.admin.token });
  const activity = await request("GET", "/analytics/user-activity", { token: state.admin.token });
  const compliance = await request("GET", "/analytics/compliance", { token: state.admin.token });
  const tracked = await request("POST", "/analytics/track", {
    token: state.admin.token,
    body: {
      eventName: "verify.live.run",
      resourceType: "verification",
      resourceId: nonce,
      metricValue: 1
    },
    expectedStatus: 201
  });

  ensure(overview.users >= 100, "Analytics overview user count was too low.");
  ensure(Array.isArray(activity), "Analytics user activity was not an array.");
  ensure(Array.isArray(compliance), "Analytics compliance trends was not an array.");
  ensure(tracked.eventName === "verify.live.run", "Analytics track event mismatch.");
  return {
    users: overview.users,
    activityBuckets: activity.length,
    complianceBuckets: compliance.length
  };
});

await step("Files", async () => {
  const signed = await request("POST", "/files/signed-upload", {
    token: state.admin.token,
    body: {
      type: "IMAGE",
      fileName: `verify-${nonce}.png`,
      mimeType: "image/png",
      brandId: state.existingBrand.id,
      subBrandId: state.existingSubBrand?.id
    },
    expectedStatus: 201
  });

  ensure(typeof signed.uploadUrl === "string" && signed.uploadUrl.includes("X-Amz-Algorithm"), "Signed upload URL was not generated.");
  ensure(Boolean(signed.assetId), "Signed upload did not create an asset.");
  return { assetId: signed.assetId };
});

await step("Settings", async () => {
  const before = await request("GET", "/settings", { token: state.tempUser.token });
  const upserted = await request("POST", "/settings", {
    token: state.tempUser.token,
    body: {
      scope: "USER",
      scopeId: state.tempUser.id,
      key: `verify-live-${nonce}`,
      value: {
        enabled: true,
        nonce
      }
    },
    expectedStatus: 201
  });
  const after = await request("GET", "/settings", { token: state.tempUser.token });

  ensure(Array.isArray(before), "Settings GET did not return an array.");
  ensure(upserted.key === `verify-live-${nonce}`, "Settings upsert key mismatch.");
  ensure(after.some((setting) => setting.key === upserted.key), "Upserted setting missing from settings list.");
  return { before: before.length, after: after.length, key: upserted.key };
});

await step("Compliance", async () => {
  const dashboard = await request("GET", "/compliance/dashboard", { token: state.admin.token });
  const policyCenter = await request("GET", "/compliance/policy-center", { token: state.admin.token });
  const modules = await request("GET", "/compliance/training-modules", { token: state.admin.token });
  const auditLog = await request("GET", "/compliance/audit-log", { token: state.admin.token });
  const adminAssignments = await request("GET", "/compliance/training-assignments/me", { token: state.admin.token });
  const incident = await request("POST", "/compliance/demo/off-brand-incident", {
    token: state.admin.token,
    expectedStatus: 201
  });

  const subjectUser = await request("GET", `/users/${incident.userId}`, { token: state.admin.token });
  const frozen = await request("POST", `/compliance/events/${incident.id}/action`, {
    token: state.admin.token,
    body: {
      action: "FREEZE",
      reason: "Live verification freeze"
    },
    expectedStatus: 201
  });

  ensure(frozen.trainingAssignment?.id, "Freeze action did not create a training assignment.");
  state.trainingAssignmentId = frozen.trainingAssignment.id;

  const subjectLogin = await request("POST", "/auth/login", {
    expectedStatus: 201,
    body: {
      email: subjectUser.email,
      password: "Circular123!"
    }
  });
  const subjectAssignments = await request("GET", "/compliance/training-assignments/me", {
    token: subjectLogin.accessToken
  });
  const completed = await request("POST", `/compliance/training-assignments/${state.trainingAssignmentId}/complete`, {
    token: subjectLogin.accessToken,
    expectedStatus: 201
  });
  const restored = await request("POST", `/compliance/events/${incident.id}/action`, {
    token: state.admin.token,
    body: {
      action: "RESTORE",
      reason: "Live verification restore"
    },
    expectedStatus: 201
  });

  ensure(Array.isArray(dashboard.events), "Compliance dashboard events missing.");
  ensure(Array.isArray(policyCenter.hierarchy), "Policy center hierarchy missing.");
  ensure(Array.isArray(modules) && modules.length > 0, "Training modules were empty.");
  ensure(Array.isArray(auditLog), "Compliance audit log was not an array.");
  ensure(Array.isArray(adminAssignments), "Admin assignments was not an array.");
  ensure(subjectAssignments.some((assignment) => assignment.id === state.trainingAssignmentId), "Subject user could not see assigned training.");
  ensure(completed.assignment.completedAt, "Training assignment did not complete.");
  ensure(restored.event.action === "RESTORE", "Restore action failed.");
  return {
    events: dashboard.events.length,
    modules: modules.length,
    auditEntries: auditLog.length,
    assignmentId: state.trainingAssignmentId
  };
});

await step("Governance Master Reset", async () => {
  const reset = await request("POST", "/governance/master-reset", {
    token: state.admin.token,
    expectedStatus: 201
  });
  ensure(reset.success === true, "Master reset did not succeed.");
  return reset;
});

const summary = {
  baseUrl,
  total: results.length,
  passed: results.filter((result) => result.status === "passed").length,
  failed: failures.length,
  failures,
  results
};

console.log(JSON.stringify(summary, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
