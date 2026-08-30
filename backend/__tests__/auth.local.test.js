/**
 * backend/__tests__/auth.local.test.js
 *
 * Regression tests for the existing password-based auth flows.
 * Ensures Google OAuth changes have not broken register, login, or getMe.
 * Uses mongodb-memory-server for an isolated DB.
 */

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_EXPIRES_IN = "1h";
process.env.NODE_ENV = "test";
process.env.GOOGLE_CLIENT_ID = "test-client-id";

// google-auth-library is not called in local auth routes, but the module
// is imported at startup — stub it to avoid network calls.
jest.mock("google-auth-library", () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

let app;
let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  app = require("../server");
  await mongoose.connection.asPromise();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
  jest.resetModules();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
describe("POST /api/auth/register", () => {
  const validPayload = {
    name: "Test Customer",
    email: "customer@test.com",
    password: "password123",
  };

  it("returns 201 with user and token for valid registration", async () => {
    const res = await request(app).post("/api/auth/register").send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("customer@test.com");
  });

  it("new user defaults to role: customer", async () => {
    const res = await request(app).post("/api/auth/register").send(validPayload);
    expect(res.body.user.role).toBe("customer");
  });

  it("password is not returned in the response", async () => {
    const res = await request(app).post("/api/auth/register").send(validPayload);
    expect(res.body.user.password).toBeUndefined();
  });

  it("returns 400 for duplicate email", async () => {
    await request(app).post("/api/auth/register").send(validPayload);
    const res = await request(app).post("/api/auth/register").send(validPayload);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "x@test.com", password: "pass123" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "X", password: "pass123" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "X", email: "x@test.com" });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    // Seed one active user
    await request(app).post("/api/auth/register").send({
      name: "Login User",
      email: "login@test.com",
      password: "correctpassword",
    });
  });

  it("returns 200 with token for valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@test.com", password: "correctpassword" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it("returns 401 for wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@test.com", password: "wrongpassword" });
    expect(res.status).toBe(401);
  });

  it("returns 401 for unknown email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@test.com", password: "pass123" });
    expect(res.status).toBe(401);
  });

  it("returns 400 when email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "pass123" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@test.com" });
    expect(res.status).toBe(400);
  });

  it("returns 403 for a deactivated user", async () => {
    const User = require("../models/User");
    await User.updateOne({ email: "login@test.com" }, { isActive: false });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@test.com", password: "correctpassword" });
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/deactivated/i);
  });
});

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------
describe("GET /api/auth/me", () => {
  let token;

  beforeEach(async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Me User",
      email: "me@test.com",
      password: "password123",
    });
    token = res.body.token;
  });

  it("returns 200 with user for a valid JWT", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("me@test.com");
  });

  it("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 for an invalid/tampered token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer this.is.not.valid");
    expect(res.status).toBe(401);
  });

  it("does not return the password field", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.body.user.password).toBeUndefined();
  });
});
