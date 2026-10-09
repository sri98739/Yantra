// Automated test runner for Yantra fullstack application
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const host = "127.0.0.1";
const port = 5500;

console.log("=== Running Yantra Application Test Suite ===\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

// 1. Structure Tests
console.log("1. Checking Project Structure:");
const frontendFiles = [
  "index.html",
  "login.html",
  "home.html",
  "dashboard.html",
  "styles.css",
  "ui.js",
  "auth.js",
  "brand.js",
  "firebase-config.js",
  "package.json",
];
const backendFiles = ["server.js", "package.json"];

frontendFiles.forEach((file) => {
  const exists = fs.existsSync(path.join(rootDir, "frontend", file));
  assert(exists, `frontend/${file} exists`);
});

backendFiles.forEach((file) => {
  const exists = fs.existsSync(path.join(rootDir, "backend", file));
  assert(exists, `backend/${file} exists`);
});

// 2. Syntax Validation Tests
console.log("\n2. Syntax Validation:");
const jsFiles = [
  "backend/server.js",
  "frontend/auth.js",
  "frontend/brand.js",
  "frontend/ui.js",
  "frontend/firebase-config.js",
];

jsFiles.forEach((file) => {
  try {
    execSync(`node --check ${path.join(rootDir, file)}`, { stdio: "pipe" });
    assert(true, `Syntax valid: ${file}`);
  } catch (err) {
    assert(false, `Syntax error in: ${file}`);
  }
});

// 3. Live Server Endpoint Tests
console.log("\n3. Live Server Endpoint Tests (http://127.0.0.1:5500):");

function fetch(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://${host}:${port}${urlPath}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, data }));
    }).on("error", reject);
  });
}

async function runHttpTests() {
  try {
    const healthz = await fetch("/healthz");
    assert(healthz.status === 200 && healthz.data === "ok", "GET /healthz returns 200 'ok'");

    const rootRes = await fetch("/");
    assert(rootRes.status === 200 && rootRes.data.includes("<title>Yantra"), "GET / returns 200 with Yantra home page");

    const dashRes = await fetch("/dashboard.html");
    assert(dashRes.status === 200 && dashRes.data.includes("dashboard"), "GET /dashboard.html returns 200");

    const loginRes = await fetch("/login.html");
    assert(loginRes.status === 200 && loginRes.data.includes("loginForm"), "GET /login.html returns 200");

    const cssRes = await fetch("/styles.css");
    assert(cssRes.status === 200 && cssRes.data.length > 500, "GET /styles.css returns valid stylesheet");

    const authRes = await fetch("/auth.js");
    assert(authRes.status === 200 && authRes.data.includes("createDemoAuth"), "GET /auth.js returns client auth logic");

    console.log(`\n=== Test Results: ${passed} Passed, ${failed} Failed ===`);
    if (failed > 0) process.exit(1);
    console.log("All application tests passed successfully!\n");
  } catch (err) {
    console.error("HTTP connection failed. Is the server running? Error:", err.message);
    process.exit(1);
  }
}

runHttpTests();
