/**
 * backend/__tests__/auth.google.test.js
 *
 * Integration tests for POST /api/auth/google.
 * Uses mongodb-memory-server for an isolated DB.
 * Mocks google-auth-library so no live Google API calls are made.
 */

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// --- Mock google-auth-library BEFORE app is loaded -------------------------
jest.mock("google-auth-library", () => {
  const mockVerifyIdToken = jest.fn();
  return {
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: mockVerifyIdToken,
    })),
    _mockVerifyIdToken: mockVerifyIdToken, // exposed for per-test control
  };
});

// Helper to access the shared mock function
const { _mockVerifyIdToken: mockVerifyIdToken } = require("google-auth-library");

// Set required env before app loads
process.env.GOOGLE_CLIENT_ID = "test-client-id";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_EXPIRES_IN = "1h";
process.env.NODE_ENV = "test";

let app;
let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  app = require("../server");
  // Allow Mongoose to connect
  await mongoose.connection.asPromise();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
  jest.resetModules();
});

afterEach(async () => {
  // Clear all collections between tests to ensure isolation
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Helper: build a minimal valid GIS payload
// ---------------------------------------------------------------------------
const makePayload = (overrides = {}) => ({
  sub: "google-sub-123",
  email: "guser@example.com",
  name: "Google User",
  picture: "https://lh3.googleusercontent.com/photo.jpg",
  email_verified: true,
  ...overrides,
});

const mockValidToken = (payloadOverrides = {}) => {
  mockVerifyIdToken.mockResolvedValueOnce({
    getPayload: () => makePayload(payloadOverrides),
  });
};

// ---------------------------------------------------------------------------
// OAuth Success Tests
// ---------------------------------------------------------------------------
describe("POST /api/auth/google — success", () => {
  it("returns 200 with user and JWT for a brand-new Google user", async () => {
    mockValidToken();
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "valid-credential" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.token).toBeDefined();
  });

  it("new user gets role: customer", async () => {
    mockValidToken();
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "valid-credential" });

    expect(res.body.user.role).toBe("customer");
  });

  it("new user gets authProvider: google", async () => {
    mockValidToken();
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "valid-credential" });

    expect(res.body.user.authProvider).toBe("google");
  });

  it("JWT in response is a non-empty string", async () => {
    mockValidToken();
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "valid-credential" });

    expect(typeof res.body.token).toBe("string");
    expect(res.body.token.length).toBeGreaterThan(0);
  });

  it("second call with same googleId returns the same user (no duplicate)", async () => {
    // First login — creates user
    mockValidToken({ sub: "unique-sub-999", email: "returning@example.com" });
    const first = await request(app)
      .post("/api/auth/google")
      .send({ credential: "cred-1" });

    // Second login — should return same user
    mockValidToken({ sub: "unique-sub-999", email: "returning@example.com" });
    const second = await request(app)
      .post("/api/auth/google")
      .send({ credential: "cred-2" });

    expect(first.body.user._id).toBe(second.body.user._id);
  });
});

// ---------------------------------------------------------------------------
// Invalid Token Tests
// ---------------------------------------------------------------------------
describe("POST /api/auth/google — invalid tokens", () => {
  it("returns 400 when credential field is missing", async () => {
    const res = await request(app).post("/api/auth/google").send({});
    expect(res.status).toBe(400);
  });

  it("returns 401 when google-auth-library throws (malformed token)", async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error("Invalid token"));
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "bad-token" });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid google token/i);
  });

  it("returns 401 when email_verified is false", async () => {
    mockValidToken({ email_verified: false });
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "unverified-credential" });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/not verified/i);
  });
});

// ---------------------------------------------------------------------------
// Account-Linking Tests
// ---------------------------------------------------------------------------
describe("POST /api/auth/google — account linking", () => {
  it("attaches googleId to an existing local user with the same email", async () => {
    const User = require("../models/User");

    // Create a local password user
    await User.create({
      name: "Local User",
      email: "local@example.com",
      password: "password123",
      authProvider: "local",
      role: "customer",
    });

    // Sign in with Google using the same email
    mockValidToken({ sub: "new-sub-from-google", email: "local@example.com" });
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "link-credential" });

    expect(res.status).toBe(200);
    // The returned user should be the original local user
    const linked = await User.findOne({ email: "local@example.com" });
    expect(linked.googleId).toBe("new-sub-from-google");
  });

  it("returns the existing user object after linking (same _id)", async () => {
    const User = require("../models/User");

    const existingUser = await User.create({
      name: "Existing",
      email: "existing@example.com",
      password: "password123",
      authProvider: "local",
      role: "customer",
    });

    mockValidToken({ sub: "link-sub-abc", email: "existing@example.com" });
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "link-cred" });

    expect(res.body.user._id).toBe(existingUser._id.toString());
  });

  it("returns 403 for an inactive Google user", async () => {
    const User = require("../models/User");

    // Create Google user and deactivate them
    await User.create({
      name: "Inactive",
      email: "inactive@example.com",
      googleId: "inactive-sub-000",
      authProvider: "google",
      role: "customer",
      isActive: false,
    });

    mockValidToken({ sub: "inactive-sub-000", email: "inactive@example.com" });
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "inactive-cred" });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/deactivated/i);
  });

  it("returns 403 for an inactive linked-local user", async () => {
    const User = require("../models/User");

    await User.create({
      name: "Inactive Local",
      email: "inactivelocal@example.com",
      password: "password123",
      authProvider: "local",
      role: "customer",
      isActive: false,
    });

    mockValidToken({ sub: "sub-for-inactive", email: "inactivelocal@example.com" });
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "inactive-local-cred" });

    expect(res.status).toBe(403);
  });
});
