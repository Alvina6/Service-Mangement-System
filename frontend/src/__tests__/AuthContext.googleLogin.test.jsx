/**
 * frontend/src/__tests__/AuthContext.googleLogin.test.jsx
 *
 * Unit tests for the googleLogin() method added to AuthContext.
 * Mocks the api module to avoid real HTTP calls.
 */

import React from "react";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";

// ---------------------------------------------------------------------------
// Mock the Axios api module
// ---------------------------------------------------------------------------
jest.mock("../lib/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

const mockApi = require("../lib/api");

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] ?? null),
    setItem: jest.fn((key, val) => { store[key] = val; }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(global, "localStorage", { value: localStorageMock });

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();

  // Default: no existing token in localStorage (unauthenticated start)
  localStorageMock.getItem.mockReturnValue(null);

  // Silence the /auth/me call that fires when no token is present
  mockApi.get.mockResolvedValue({ data: { user: null } });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("AuthContext.googleLogin", () => {
  const fakeUser = { _id: "abc123", name: "G User", email: "g@example.com", role: "customer" };
  const fakeToken = "fake.jwt.token";

  it("calls POST /auth/google with the credential", async () => {
    mockApi.post.mockResolvedValueOnce({ data: { user: fakeUser, token: fakeToken } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.googleLogin("test-credential");
    });

    expect(mockApi.post).toHaveBeenCalledWith("/auth/google", {
      credential: "test-credential",
    });
  });

  it("stores the token in localStorage", async () => {
    mockApi.post.mockResolvedValueOnce({ data: { user: fakeUser, token: fakeToken } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.googleLogin("test-credential");
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith("serviceflow_token", fakeToken);
  });

  it("sets the user state after a successful call", async () => {
    mockApi.post.mockResolvedValueOnce({ data: { user: fakeUser, token: fakeToken } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.googleLogin("test-credential");
    });

    expect(result.current.user).toEqual(fakeUser);
  });

  it("returns the user object from the call", async () => {
    mockApi.post.mockResolvedValueOnce({ data: { user: fakeUser, token: fakeToken } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let returnedUser;
    await act(async () => {
      returnedUser = await result.current.googleLogin("test-credential");
    });

    expect(returnedUser).toEqual(fakeUser);
  });

  it("re-throws the error when the API call fails", async () => {
    const err = new Error("Invalid Google token");
    mockApi.post.mockRejectedValueOnce(err);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.googleLogin("bad-credential");
      })
    ).rejects.toThrow("Invalid Google token");
  });

  it("does not update user state when the API call fails", async () => {
    mockApi.post.mockRejectedValueOnce(new Error("server error"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    try {
      await act(async () => {
        await result.current.googleLogin("bad-cred");
      });
    } catch {
      // expected
    }

    expect(result.current.user).toBeNull();
  });

  it("does not store a token in localStorage when the API call fails", async () => {
    mockApi.post.mockRejectedValueOnce(new Error("server error"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    try {
      await act(async () => {
        await result.current.googleLogin("bad-cred");
      });
    } catch {
      // expected
    }

    expect(localStorageMock.setItem).not.toHaveBeenCalledWith(
      "serviceflow_token",
      expect.anything()
    );
  });
});
