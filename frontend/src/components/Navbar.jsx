"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Snowflake, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/services", label: "Services" },
  { href: "/maintenance-plans", label: "Maintenance Plans" },
  { href: "/emergency", label: "Emergency" },
  { href: "/about", label: "About Us" },
  { href: "/#service-areas", label: "Service Areas" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-graphite/95 backdrop-blur-md shadow-lg"
          : "bg-graphite/90 backdrop-blur-sm"
      } border-b border-white/10`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - Fixed width to prevent overlap */}
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-lg font-semibold text-ice whitespace-nowrap flex-shrink-0"
          >
            <Snowflake
              size={20}
              className="text-frost-light"
              strokeWidth={2.2}
            />
            <span>ArcticAir</span>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-center">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-slate-light hover:text-ice transition-colors whitespace-nowrap"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6 flex-shrink-0">
            <a
              href="tel:+18005550142"
              className="flex items-center gap-1.5 text-sm text-ember-light hover:text-ember transition-colors whitespace-nowrap"
            >
              <Phone size={14} />
              <span className="hidden xl:inline">(800) 555-0142</span>
              <span className="xl:hidden">Call</span>
            </a>

            {user ? (
              <Link
                href={`/dashboard/${user.role}`}
                className="text-sm font-medium bg-frost hover:bg-frost-light text-ice px-4 py-2 rounded-full transition-colors whitespace-nowrap"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-slate-light hover:text-ice transition-colors whitespace-nowrap"
                >
                  Log in
                </Link>
                <Link
                  href="/request-quote"
                  className="text-sm font-medium bg-ember hover:bg-ember-light text-ice px-4 py-2 rounded-full transition-colors whitespace-nowrap"
                >
                  Request Service
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-ice hover:text-frost-light transition-colors p-2 -mr-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu - Full width with smooth transition */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-white/10 py-4 space-y-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block px-3 py-2.5 text-sm text-slate-light hover:text-ice hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}

            {/* Mobile Divider */}
            <div className="h-px bg-white/10 my-2"></div>

            {/* Mobile Actions */}
            <div className="px-3 py-2 space-y-2">
              <a
                href="tel:+18005550142"
                className="flex items-center gap-2 text-sm text-ember-light hover:text-ember transition-colors"
              >
                <Phone size={14} /> (800) 555-0142
              </a>

              {user ? (
                <>
                  <Link
                    href={`/dashboard/${user.role}`}
                    className="block w-full text-center text-sm font-medium bg-frost hover:bg-frost-light text-ice px-4 py-2.5 rounded-full transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="block w-full text-center text-sm text-ember-light hover:text-ember transition-colors px-4 py-2"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block w-full text-center text-sm text-slate-light hover:text-ice transition-colors px-4 py-2"
                    onClick={() => setOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/request-quote"
                    className="block w-full text-center text-sm font-medium bg-ember hover:bg-ember-light text-ice px-4 py-2.5 rounded-full transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    Request Service
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
