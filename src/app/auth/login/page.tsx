"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Suspense } from "react";
import { showError, showSuccess } from "@/lib/toast";
import { customerApi } from "@/api/customerApi";

type Mode = "login" | "forgot" | "reset";

function LoginForm() {
  const { login, user } = useAuth();
  const router          = useRouter();
  const searchParams    = useSearchParams();
  const redirectTo      = searchParams.get("redirect") || "/";
  const resetToken       = searchParams.get("token") || "";

  // If a reset token is present in the URL, jump straight into reset mode.
  const [mode, setMode] = useState<Mode>(resetToken ? "reset" : "login");

  // ── login state ──
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [focused,  setFocused]  = useState<string | null>(null);
  const [shake,    setShake]    = useState(false);

  // ── forgot password state ──
  const [forgotEmail, setForgotEmail]     = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent]       = useState(false);
  const [forgotError, setForgotError]     = useState("");

  // ── reset password state ──
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass]         = useState(false);
  const [resetLoading, setResetLoading]       = useState(false);
  const [resetError, setResetError]           = useState("");
  const [resetDone, setResetDone]             = useState(false);

  useEffect(() => { if (user && mode === "login") router.replace(redirectTo); }, [user, router, redirectTo, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (res.ok) {
      showSuccess(`Welcome back, ${res.name ?? email.trim().split("@")[0]}! 👋`);
      router.push(redirectTo);
    } else {
      setError(res.error || "Login failed.");
      showError(res.error || "Login failed.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(""); setForgotLoading(true);
    try {
      await customerApi.auth.forgotPassword(forgotEmail.trim());
      setForgotSent(true);
      showSuccess("Reset link sent! Check your email.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setForgotError(msg);
      showError(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    if (!resetToken) {
      setResetError("Reset token missing or invalid. Please use the link from your email.");
      return;
    }
    if (newPassword.length < 8) {
      setResetError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }

    setResetLoading(true);
    try {
      await customerApi.auth.resetPassword(resetToken, newPassword);
      setResetDone(true);
      showSuccess("Password reset successfully!");
      setTimeout(() => {
        router.replace("/auth/login");
        setMode("login");
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setResetError(msg);
      showError(msg);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── LEFT decorative panel ── */}
      <div className="hidden lg:flex w-[46%] relative flex-col justify-between p-12 bg-gray-950 overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(249,115,22,0.15)_0%,transparent_55%)]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-500/8 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)", backgroundSize: "52px 52px" }} />

        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
            </svg>
          </div>
          <div>
            <span className="text-white font-bold text-xl">EventStan</span>
            <span className="block text-orange-400 text-[10px] font-semibold tracking-widest uppercase leading-none">UAE Event Marketplace</span>
          </div>
        </Link>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-orange-500/12 border border-orange-500/20 rounded-full px-4 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
            <span className="text-orange-400 text-xs font-semibold">Trusted by 1,200+ events</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-snug mb-3">
            Plan your perfect<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-300">event today.</span>
          </h2>
          <p className="text-gray-400 leading-relaxed text-sm max-w-sm">
            Book venues, caterers, decorators, and entertainers — all in one place, with transparent pricing and verified vendors.
          </p>

          <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex gap-1 mb-2">
              {Array(5).fill(0).map((_,i) => <svg key={i} className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
            </div>
            <p className="text-gray-300 text-sm italic leading-relaxed">"Finding our venue and decorator in one place saved us so much stress. The Grand Palace Ballroom was breathtaking!"</p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">PS</div>
              <div>
                <p className="text-white text-xs font-semibold">Priya & Arjun Sharma</p>
                <p className="text-gray-500 text-xs">Wedding — New York</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[["500+","Vendors"],["1.2K+","Events"],["4.9★","Rating"]].map(([v,l]) => (
            <div key={l} className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
              <p className="text-orange-400 font-bold text-lg">{v}</p>
              <p className="text-gray-500 text-xs">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">

          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">EventStan</span>
          </Link>

          {/* ══════════ LOGIN MODE ══════════ */}
          {mode === "login" && (
            <>
              <div className="mb-7">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back</h1>
                <p className="text-gray-500 text-sm">Sign in to manage your bookings and events.</p>
              </div>

              {error && (
                <div className={`flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 ${shake ? "animate-[shake_0.4s_ease]" : ""}`}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Email</label>
                  <div className={`relative flex items-center bg-white border rounded-xl transition-all ${focused === "email" ? "border-orange-400 ring-2 ring-orange-100" : "border-gray-200"}`}>
                    <svg className="absolute left-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <input
                      type="email" value={email} required
                      onChange={e => { setEmail(e.target.value); setError(""); }}
                      onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                      placeholder="you@email.com"
                      className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</label>
                    <button
                      type="button"
                      onClick={() => { setMode("forgot"); setForgotEmail(email); setForgotError(""); setForgotSent(false); }}
                      className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className={`relative flex items-center bg-white border rounded-xl transition-all ${focused === "pass" ? "border-orange-400 ring-2 ring-orange-100" : "border-gray-200"}`}>
                    <svg className="absolute left-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    <input
                      type={showPass ? "text" : "password"} value={password} required
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      onFocus={() => setFocused("pass")} onBlur={() => setFocused(null)}
                      placeholder="••••••••"
                      className="w-full bg-transparent pl-10 pr-11 py-3 text-sm text-gray-900 placeholder-gray-400 rounded-xl focus:outline-none"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 text-gray-400 hover:text-gray-600">
                      {showPass
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      }
                    </button>
                  </div>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-orange-200 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in...</>
                    : <>Sign In <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></>
                  }
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="text-orange-500 font-semibold hover:text-orange-600">Create one</Link>
              </p>
            </>
          )}

          {/* ══════════ FORGOT PASSWORD MODE ══════════ */}
          {mode === "forgot" && (
            <>
              <div className="mb-7">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Forgot password?</h1>
                <p className="text-gray-500 text-sm">Enter your email and we&apos;ll send you a reset link.</p>
              </div>

              {forgotSent ? (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
                  If an account exists for <strong>{forgotEmail}</strong>, a reset link has been sent.
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  {forgotError && (
                    <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {forgotError}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Email</label>
                    <div className="relative flex items-center bg-white border border-gray-200 rounded-xl focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100">
                      <svg className="absolute left-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                      <input
                        type="email" required value={forgotEmail}
                        onChange={e => { setForgotEmail(e.target.value); setForgotError(""); }}
                        placeholder="you@email.com"
                        className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit" disabled={forgotLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {forgotLoading
                      ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Sending...</>
                      : "Send reset link"
                    }
                  </button>
                </form>
              )}

              <p className="text-center text-sm text-gray-500 mt-6">
                Remembered it?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-orange-500 font-semibold hover:text-orange-600"
                >
                  Back to login
                </button>
              </p>
            </>
          )}

          {/* ══════════ RESET PASSWORD MODE ══════════ */}
          {mode === "reset" && (
            <>
              <div className="mb-7">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Reset password</h1>
                <p className="text-gray-500 text-sm">Enter your new password below.</p>
              </div>

              {!resetToken && !resetDone && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  This link looks invalid or expired. Please request a new one.
                </div>
              )}

              {resetDone ? (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
                  Password reset! Redirecting to login...
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  {resetError && (
                    <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {resetError}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">New password</label>
                    <div className="relative flex items-center bg-white border border-gray-200 rounded-xl focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100">
                      <input
                        type={showNewPass ? "text" : "password"} required value={newPassword}
                        onChange={e => { setNewPassword(e.target.value); setResetError(""); }}
                        placeholder="••••••••"
                        className="w-full bg-transparent pl-4 pr-11 py-3 text-sm text-gray-900 placeholder-gray-400 rounded-xl focus:outline-none"
                      />
                      <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3.5 text-gray-400 hover:text-gray-600">
                        {showNewPass
                          ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                          : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        }
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Confirm password</label>
                    <input
                      type={showNewPass ? "text" : "password"} required value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setResetError(""); }}
                      placeholder="••••••••"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                  <button
                    type="submit" disabled={resetLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {resetLoading
                      ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Resetting...</>
                      : "Reset password"
                    }
                  </button>
                </form>
              )}

              <p className="text-center text-sm text-gray-500 mt-6">
                <button
                  type="button"
                  onClick={() => { router.replace("/auth/login"); setMode("login"); }}
                  className="text-orange-500 font-semibold hover:text-orange-600"
                >
                  Back to login
                </button>
              </p>
            </>
          )}

        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)}
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}