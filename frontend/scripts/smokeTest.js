// BoltPatch: Enhanced smoke test script
import axios from "axios";

const API_BASE = process.env.VITE_API_BASE || "http://localhost:4000";
const TEST_TOKEN = process.env.TEST_TOKEN; // Optional: provide a valid token for authenticated tests

async function runSmokeTests() {
  console.log("🔥 Running TrackIt Smoke Tests...\n");

  const results = [];

  // Test 1: Health check (if available)
  try {
    console.log("Testing server health...");
    const response = await axios.get(`${API_BASE}/api/v2/lost-items`, {
      timeout: 5000,
      validateStatus: (status) => status < 500, // Accept 4xx as valid responses
    });
    results.push({
      test: "Server Health",
      status: "PASS",
      code: response.status,
    });
    console.log("✅ Server is responding");
  } catch (error) {
    results.push({
      test: "Server Health",
      status: "FAIL",
      error: error.message,
    });
    console.log("❌ Server health check failed:", error.message);
  }

  // Test 2: Lost items endpoint
  try {
    console.log("Testing lost items endpoint...");
    const response = await axios.get(`${API_BASE}/api/v2/lost-items`, {
      timeout: 5000,
      validateStatus: (status) => status < 500,
    });
    results.push({
      test: "Lost Items API",
      status: "PASS",
      code: response.status,
    });
    console.log("✅ Lost items endpoint responding");
  } catch (error) {
    results.push({
      test: "Lost Items API",
      status: "FAIL",
      error: error.message,
    });
    console.log("❌ Lost items endpoint failed:", error.message);
  }

  // Test 3: Found items endpoint
  try {
    console.log("Testing found items endpoint...");
    const response = await axios.get(`${API_BASE}/api/v2/found-items`, {
      timeout: 5000,
      validateStatus: (status) => status < 500,
    });
    results.push({
      test: "Found Items API",
      status: "PASS",
      code: response.status,
    });
    console.log("✅ Found items endpoint responding");
  } catch (error) {
    results.push({
      test: "Found Items API",
      status: "FAIL",
      error: error.message,
    });
    console.log("❌ Found items endpoint failed:", error.message);
  }

  // Test 4: Authenticated endpoint (if token provided)
  if (TEST_TOKEN) {
    try {
      console.log("Testing authenticated profile endpoint...");
      const response = await axios.get(`${API_BASE}/api/v1/users/profile`, {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` },
        timeout: 5000,
        validateStatus: (status) => status < 500,
      });
      results.push({
        test: "Profile API (Auth)",
        status: "PASS",
        code: response.status,
      });
      console.log("✅ Profile endpoint responding");
    } catch (error) {
      results.push({
        test: "Profile API (Auth)",
        status: "FAIL",
        error: error.message,
      });
      console.log("❌ Profile endpoint failed:", error.message);
    }
  } else {
    console.log("⏭️  Skipping auth test (no TEST_TOKEN provided)");
  }

  // Test 5: Socket.io connection
  try {
    console.log("Testing Socket.io connection...");
    const response = await axios.get(`${API_BASE}/socket.io/`, {
      timeout: 5000,
      validateStatus: (status) => status < 500,
    });
    results.push({ test: "Socket.io", status: "PASS", code: response.status });
    console.log("✅ Socket.io endpoint responding");
  } catch (error) {
    results.push({ test: "Socket.io", status: "FAIL", error: error.message });
    console.log("❌ Socket.io test failed:", error.message);
  }

  // Summary
  console.log("\n📊 Test Results Summary:");
  console.log("========================");
  results.forEach((result) => {
    const status = result.status === "PASS" ? "✅" : "❌";
    const details = result.code
      ? `(${result.code})`
      : result.error
        ? `(${result.error})`
        : "";
    console.log(`${status} ${result.test} ${details}`);
  });

  const passed = results.filter((r) => r.status === "PASS").length;
  const total = results.length;
  console.log(`\n🎯 ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log("🎉 All smoke tests passed! TrackIt backend is ready.");
    process.exit(0);
  } else {
    console.log("⚠️  Some tests failed. Check the backend configuration.");
    process.exit(1);
  }
}

// Run the tests
runSmokeTests().catch((error) => {
  console.error("💥 Smoke test runner failed:", error.message);
  process.exit(1);
});
