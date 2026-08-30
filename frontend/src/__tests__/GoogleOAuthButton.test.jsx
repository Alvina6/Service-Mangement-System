/**
 * frontend/src/__tests__/GoogleOAuthButton.test.jsx
 *
 * Unit tests for the GoogleOAuthButton component.
 * The GIS library (window.google) is mocked to avoid network calls.
 */

import React from "react";
import { render, act } from "@testing-library/react";
import GoogleOAuthButton from "../components/GoogleOAuthButton";

// ---------------------------------------------------------------------------
// Mock window.google.accounts.id before each test
// ---------------------------------------------------------------------------
const mockInitialize = jest.fn();
const mockRenderButton = jest.fn();

const gsiMock = {
  accounts: {
    id: {
      initialize: mockInitialize,
      renderButton: mockRenderButton,
    },
  },
};

beforeEach(() => {
  jest.clearAllMocks();

  // Assign to window (jsdom) rather than global so the component picks it up
  Object.defineProperty(window, "google", {
    value: gsiMock,
    writable: true,
    configurable: true,
  });

  // Set the required env var
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = "test-client-id";
});

afterEach(() => {
  // Clean up any injected scripts
  const script = document.getElementById("google-gsi-script");
  if (script) script.remove();
  // Remove google from window
  try { delete window.google; } catch { window.google = undefined; }
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("GoogleOAuthButton", () => {
  it("renders without crashing", () => {
    const { container } = render(<GoogleOAuthButton onCredential={jest.fn()} />);
    expect(container).toBeDefined();
  });

  it("calls google.accounts.id.initialize with the client ID on mount", async () => {
    await act(async () => {
      render(<GoogleOAuthButton onCredential={jest.fn()} />);
    });
    expect(mockInitialize).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: "test-client-id" })
    );
  });

  it("calls google.accounts.id.renderButton on mount", async () => {
    await act(async () => {
      render(<GoogleOAuthButton onCredential={jest.fn()} />);
    });
    expect(mockRenderButton).toHaveBeenCalled();
  });

  it("calls onCredential prop when GIS triggers the callback", async () => {
    const onCredential = jest.fn();

    await act(async () => {
      render(<GoogleOAuthButton onCredential={onCredential} />);
    });

    // Simulate GIS calling back with a credential
    const callbackArg = mockInitialize.mock.calls[0][0];
    act(() => {
      callbackArg.callback({ credential: "test-id-token" });
    });

    expect(onCredential).toHaveBeenCalledWith("test-id-token");
  });

  it("does not call onCredential if the response has no credential", async () => {
    const onCredential = jest.fn();

    await act(async () => {
      render(<GoogleOAuthButton onCredential={onCredential} />);
    });

    const callbackArg = mockInitialize.mock.calls[0][0];
    act(() => {
      callbackArg.callback({});
    });

    expect(onCredential).not.toHaveBeenCalled();
  });

  it("does not inject a second script tag on re-render", async () => {
    // Inject a dummy script to simulate the tag already being there
    const existing = document.createElement("script");
    existing.id = "google-gsi-script";
    document.head.appendChild(existing);

    await act(async () => {
      render(<GoogleOAuthButton onCredential={jest.fn()} />);
    });

    const tags = document.querySelectorAll("#google-gsi-script");
    expect(tags.length).toBe(1);
  });

  it("renders with disabled styles when disabled prop is true", async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <GoogleOAuthButton onCredential={jest.fn()} disabled={true} />
      ));
    });

    const wrapper = container.firstChild;
    expect(wrapper.className).toMatch(/opacity-50/);
    expect(wrapper.className).toMatch(/pointer-events-none/);
  });
});
