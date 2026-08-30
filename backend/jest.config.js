/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  setupFiles: ["dotenv/config"],
  // Increase timeout for mongodb-memory-server startup
  testTimeout: 30000,
};
