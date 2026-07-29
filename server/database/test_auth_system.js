/**
 * Quick integration test for the auth feature flag system.
 * Run with: node database/test_auth_system.js
 *
 * Requires the server to be running on localhost:3000
 */

const BASE = "http://localhost:3000/api";

async function request(method, path, body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();
  return { status: res.status, data };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✅ ${message}`);
  }
}

async function run() {
  console.log("\n🧪 Auth Feature Flag System - Integration Test\n");

  // 1. Login as Super Admin
  console.log("─── 1. Login as Super Admin ───");
  const login = await request("POST", "/auth/login", {
    email: "admin@example.com",
    password: "password123",
  });

  if (login.status !== 200) {
    console.error("  ❌ Cannot login. Update the password in this script.");
    console.error(`     Status: ${login.status}, Message: ${login.data.message}`);
    console.log("\n  💡 Tip: Set the correct password for admin@example.com in this script");
    process.exit(1);
  }

  const token = login.data.data.accessToken;
  assert(!!token, "Got access token");

  // 2. Get available methods (public endpoint)
  console.log("\n─── 2. Public: GET /auth/methods ───");
  const methods = await request("GET", "/auth/methods");
  assert(methods.status === 200, `Status 200 (got ${methods.status})`);
  console.log(`     Available methods: ${methods.data.data.methods.map(m => m.type).join(", ")}`);

  // 3. Get all configs (admin)
  console.log("\n─── 3. Admin: GET /admin/config/auth ───");
  const configs = await request("GET", "/admin/config/auth", null, token);
  assert(configs.status === 200, `Status 200 (got ${configs.status})`);
  assert(configs.data.data.configs.length >= 5, `Has ${configs.data.data.configs.length} configs`);

  // 4. Test forbidden for non-Super Admin
  console.log("\n─── 4. RBAC: Regular user cannot access admin config ───");
  const userLogin = await request("POST", "/auth/login", {
    email: "user@example.com",
    password: "password123",
  });
  if (userLogin.status === 200) {
    const userToken = userLogin.data.data.accessToken;
    const forbidden = await request("GET", "/admin/config/auth", null, userToken);
    assert(forbidden.status === 403, `Regular user gets 403 (got ${forbidden.status})`);
  } else {
    console.log("  ⚠️  Skipping (cannot login as regular user)");
  }

  // 5. Toggle OTP on
  console.log("\n─── 5. Toggle OTP ON ───");
  const toggleOn = await request("PUT", "/admin/config/auth/otp/toggle", null, token);
  assert(toggleOn.status === 200, `Status 200 (got ${toggleOn.status})`);
  assert(toggleOn.data.data.enabled === true, "OTP is now enabled");

  // 6. Request OTP (should succeed since it's ON)
  console.log("\n─── 6. OTP Request (should work since enabled) ───");
  const otpReq = await request("POST", "/auth/otp/request", { email: "test@test.com" });
  assert(otpReq.status === 200, `OTP request succeeded (status ${otpReq.status})`);
  if (otpReq.data.data?.dev_code) {
    console.log(`     Dev OTP code: ${otpReq.data.data.dev_code}`);
  }

  // 7. Toggle OTP off
  console.log("\n─── 7. Toggle OTP OFF ───");
  const toggleOff = await request("PUT", "/admin/config/auth/otp/toggle", null, token);
  assert(toggleOff.status === 200, `Status 200 (got ${toggleOff.status})`);
  assert(toggleOff.data.data.enabled === false, "OTP is now disabled");

  // 8. OTP request should now fail with 403
  console.log("\n─── 8. OTP Request (should be blocked since disabled) ───");
  const otpBlocked = await request("POST", "/auth/otp/request", { email: "test@test.com" });
  assert(otpBlocked.status === 403, `OTP blocked with 403 (got ${otpBlocked.status})`);

  // 9. Rate limiting test
  console.log("\n─── 9. Rate Limiting (rapid OTP requests) ───");
  // Re-enable OTP for this test
  await request("PUT", "/admin/config/auth/otp/toggle", null, token);
  let hitLimit = false;
  for (let i = 0; i < 5; i++) {
    const r = await request("POST", "/auth/otp/request", { email: "ratelimit@test.com" });
    if (r.status === 429) {
      hitLimit = true;
      console.log(`     Rate limited after ${i + 1} requests`);
      break;
    }
  }
  assert(hitLimit, "Rate limiter kicked in (429)");
  // Disable OTP again after test
  await request("PUT", "/admin/config/auth/otp/toggle", null, token);

  console.log("\n─── Done ───\n");
}

run().catch((err) => {
  console.error("Test crashed:", err);
  process.exit(1);
});
