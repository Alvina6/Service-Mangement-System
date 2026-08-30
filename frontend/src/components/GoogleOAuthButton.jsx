"use client";

import { useEffect, useRef } from "react";

const SCRIPT_ID = "google-gsi-script";
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

/**
 * GoogleOAuthButton
 *
 * Loads the Google Identity Services script once, initialises the GIS library
 * with the provided client ID, and renders Google's branded sign-in button.
 *
 * Props:
 *   onCredential(credentialString) — called with the raw ID token when the user
 *                                    completes the Google sign-in popup.
 *   disabled — when true the button wrapper is visually muted (e.g. while loading)
 */
export default function GoogleOAuthButton({ onCredential, disabled = false }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set — Google sign-in unavailable.");
      return;
    }

    const initGIS = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) {
            onCredential(response.credential);
          }
        },
      });
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: buttonRef.current.offsetWidth || 320,
        });
      }
    };

    // If GIS is already available (e.g. script loaded earlier), initialize now
    if (window.google?.accounts?.id) {
      initGIS();
      return;
    }

    // Inject the script only once across renders
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = initGIS;
      document.head.appendChild(script);
    }
    // If the script tag already exists but window.google isn't ready yet,
    // its onload will fire once Google's CDN responds — nothing to do here.
  }, [onCredential]);

  return (
    <div
      ref={buttonRef}
      className={disabled ? "opacity-50 pointer-events-none" : ""}
      style={{ minHeight: "44px" }}
    />
  );
}
