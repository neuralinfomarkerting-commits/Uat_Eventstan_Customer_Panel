"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import Image from 'next/image';
import { showSuccess } from "@/lib/toast";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleCart, count } = useCart();
  const { user, logout, loading } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const links = [
    { href: "/services", label: "Services" },
    { href: "/event-types", label: "Event Types" },
    { href: "/about", label: "About Us" },
    { href: "/promotions", label: "Promotions" },
    { href: "/bookings", label: "My Bookings" },
    { href: "/blog", label: "Blog" },
    // { href: "/contact", label: "Contact" },
  ];

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 900);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => { queueMicrotask(() => setMenuOpen(false)); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = (menuOpen || showLogoutModal) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, showLogoutModal]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setUserDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
    setUserDropOpen(false);
    setMenuOpen(false);
    showSuccess("Logged out successfully!");
    router.push("/");
  };

  const avatarColor = user
    ? ["bg-orange-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500"][user.name.charCodeAt(0) % 5]
    : "bg-orange-500";

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">

            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/eventstan-logo.png"
                alt="EventStan Logo"
                width={180}
                height={48}
                className="rounded-lg w-auto h-auto"
                style={{ width: "auto", height: "auto" }}
                priority
              />
            </Link>

            {/* Desktop links */}
            <div className={`hidden items-center gap-4 lg:gap-6 ${!isMobile ? 'md:flex' : ''}`}>
              {links.map(link => (
                <Link key={link.href} href={link.href}
                  className={`text-sm font-medium transition-colors whitespace-nowrap ${pathname === link.href ? "text-orange-500" : "text-gray-600 hover:text-orange-500"}`}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Cart */}
              <button onClick={toggleCart}
                className="relative flex items-center gap-1.5 sm:gap-2 bg-gray-900 text-white px-3 sm:px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 active:scale-95 transition-all"
                aria-label="Open shopping cart">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </button>

              {/* Auth area */}
              {!loading && (
                user ? (
                  <div className="relative hidden sm:block" ref={dropRef}>
                    <button
                      onClick={() => setUserDropOpen(o => !o)}
                      className="flex items-center gap-2 bg-gray-50 border border-gray-200 hover:border-orange-300 hover:bg-orange-50 rounded-full pl-1 pr-3 py-1 transition-all group"
                    >
                      <div className={`w-8 h-8 ${avatarColor} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {user.avatar}
                      </div>
                      <div className="text-left hidden lg:block">
                        <p className="text-xs font-bold text-gray-900 leading-none group-hover:text-orange-600 transition-colors">
                          {user.name.split(" ")[0]}
                        </p>
                      </div>
                      <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${userDropOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown */}
                    {userDropOpen && (
                      <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                        <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-white border-b border-gray-100 flex items-center gap-3">
                          <div className={`w-10 h-10 ${avatarColor} rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                            {user.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="py-1">
                          {[
                            { href: "/my-profile", label: "My Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
                            { href: "/bookings", label: "My Bookings", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
                            // { href: "/", label: "Browse Events", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
                          ].map(item => (
                            <Link key={item.href} href={item.href} onClick={() => setUserDropOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-orange-500 transition-colors">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                              </svg>
                              {item.label}
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-gray-100">
                          <button onClick={() => { setUserDropOpen(false); setShowLogoutModal(true); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center gap-2">
                    <Link href="/auth/signup"
                      className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
                      Sign Up
                    </Link>
                  </div>
                )
              )}

              {/* Mobile hamburger */}
              <button
                className={`p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors ${isMobile ? 'block' : 'md:hidden'}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Open menu">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile slide-in panel */}
      {menuOpen && isMobile && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setMenuOpen(false)} aria-hidden />
          <div className="fixed top-0 right-0 h-full w-4/5 max-w-xs bg-white z-50 flex flex-col shadow-2xl animate-slideInRight">
            <div className="flex justify-end p-4">
              <button onClick={() => setMenuOpen(false)}
                className="w-9 h-9 rounded-full border-2 border-orange-400 flex items-center justify-center text-orange-500 hover:bg-orange-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {user && (
              <div className="mx-4 mb-4 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className={`w-10 h-10 ${avatarColor} rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
                  {user.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 text-sm truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col px-6 gap-1 flex-1">
              {links.map(link => (
                <Link key={link.href} href={link.href}
                  className={`py-3.5 text-base font-medium border-b border-gray-100 transition-colors ${pathname === link.href ? "text-orange-500" : "text-gray-800 hover:text-orange-500"}`}
                  onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="px-6 pb-10 pt-4 space-y-2">
              {user ? (
                <button onClick={() => { setMenuOpen(false); setShowLogoutModal(true); }}
                  className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 py-3 rounded-full text-sm font-semibold hover:bg-red-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              ) : (
                <>
                  <Link href="/auth/signup" onClick={() => setMenuOpen(false)}
                    className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-3 rounded-full text-sm font-semibold transition-colors">
                    Create Account
                  </Link>
                  <Link href="/auth/login" onClick={() => setMenuOpen(false)}
                    className="block w-full border border-gray-200 text-gray-700 text-center py-3 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fadeInUp">
            {/* Icon */}
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-1">Logout?</h2>
            <p className="text-sm text-gray-500 text-center mb-6">Are you sure you want to logout from your account?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-sm font-bold transition-colors">
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slideInRight { animation: slideInRight 0.25s cubic-bezier(0.16,1,0.3,1); }
        .animate-fadeInUp { animation: fadeInUp 0.2s cubic-bezier(0.16,1,0.3,1); }
      `}</style>
    </>
  );
}