const BASE = "http://localhost:3000";

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
  } catch (e) {
    console.log(`❌ ${name}: ${e.message}`);
  }
}

const TEST_EMAIL = "testbatch2@example.com";
const TEST_PASSWORD = "Test1234!";

// Clean up first
await fetch(`${BASE}/api/auth/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Test User",
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    role: "student",
    gceLevel: "Advanced"
  })
}).catch(() => {}); // ignore — might not exist

// Delete from DB if already exists (handles broken user)
console.log("Cleaning up old test user...\n");

// Test 1: Register
await test("Register new user", async () => {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      role: "student",
      gceLevel: "Advanced"
    })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(`Status ${res.status}: ${data.message}`);
  }
  const data = await res.json();
  if (!data.user) throw new Error("No user in response");
  if (typeof data.user.id !== "string") throw new Error(`ID is not string: ${typeof data.user.id}`);
});

// Test 2: Login with same credentials
await test("Login returns user with string ID", async () => {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(`Status ${res.status}: ${data.message}`);
  }
  const data = await res.json();
  if (typeof data.user.id !== "string") throw new Error(`ID is not string: ${typeof data.user.id}`);
  if (data.user.id.length !== 24) throw new Error(`ID length is ${data.user.id.length}, expected 24`);
});

// Test 3: /me without token returns 401
await test("/me without token returns 401", async () => {
  const res = await fetch(`${BASE}/api/auth/me`);
  if (res.status !== 401) throw new Error(`Status ${res.status}`);
});

// Test 4: /me with invalid token returns 401
await test("/me with invalid token returns 401", async () => {
  const res = await fetch(`${BASE}/api/auth/me`, {
    headers: { Cookie: "token=garbage" }
  });
  if (res.status !== 401) throw new Error(`Status ${res.status}`);
});

// Test 5: Duplicate registration returns error
await test("Duplicate registration returns error", async () => {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      role: "student",
      gceLevel: "Advanced"
    })
  });
  if (res.status === 200) throw new Error("Duplicate email was accepted");
});

// Test 6: Wrong password returns 401
await test("Wrong password returns 401", async () => {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL, password: "WrongPassword!" })
  });
  if (res.status !== 401) throw new Error(`Status ${res.status}`);
});

// Test 7: Login response does NOT leak passwordHash
await test("Login response has no passwordHash", async () => {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
  });
  const data = await res.json();
  if (data.user.passwordHash) throw new Error("passwordHash leaked in response");
  if (data.user.password) throw new Error("password leaked in response");
});

console.log("\nDone.");