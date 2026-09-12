"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { customerApi, Country } from "@/api/customerApi";

export default function SignupPage() {
  const { signup, user } = useAuth();
  const router = useRouter();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [focused,  setFocused]  = useState<string | null>(null);
  const [step,     setStep]     = useState<1 | 2>(1);
  const [countries, setCountries]   = useState<Country[]>([]);
  const [countryCode, setCountryCode] = useState("+971");
  const [codeOpen, setCodeOpen]       = useState(false);

  useEffect(() => { if (user) router.replace("/"); }, [user, router]);

  useEffect(() => {
    customerApi.masterData.getCountries().then((list) => {
      setCountries(list);
      if (list.length && !list.some((c) => c.phoneCode === countryCode)) {
        setCountryCode(list[0].phoneCode);
      }
    });
  }, []);

  const pwStrength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][pwStrength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-green-500"][pwStrength];

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim())  { setError("Please enter your full name."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!phone.trim()) { setError("Please enter your phone number."); return; }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (pwStrength < 2)       { setError("Please choose a stronger password."); return; }
    setError(""); setLoading(true);
    const fullPhone = `${countryCode}${phone.replace(/^0+/, "")}`;
    const res = await signup(name, email, fullPhone, password, "individual");
    setLoading(false);
    if (res.ok) router.push("/");
    else setError(res.error || "Sign up failed.");
  };

  const inputBase = "w-full bg-transparent pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 rounded-xl focus:outline-none";
  const boxClass  = (id: string) =>
    `relative flex items-center bg-white border rounded-xl transition-all ${focused === id ? "border-orange-400 ring-2 ring-orange-100" : "border-gray-200"}`;

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── LEFT panel ── */}
      <div className="hidden lg:flex w-[46%] relative flex-col justify-between p-12 bg-gray-950 overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.13)_0%,transparent_60%)]" />
        <div className="absolute top-0 left-0 w-80 h-80 bg-orange-500/6 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
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
            <span className="block text-orange-400 text-[10px] font-semibold tracking-widest uppercase">UAE Event Marketplace</span>
          </div>
        </Link>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-snug mb-4">
            Your event journey<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-300">starts here.</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
            Join thousands of customers who plan unforgettable events with verified vendors across the UAE.
          </p>
          <div className="space-y-4">
            {[
              { icon: "🏛️", title: "500+ Verified Vendors", desc: "Every vendor is background-checked and reviewed." },
              { icon: "💳", title: "Secure 50% Advance",    desc: "Pay just 50% upfront — rest before your event." },
              { icon: "🎉", title: "All Event Types",       desc: "Weddings, birthdays, corporate galas, and more." },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-3 bg-white/5 border border-white/8 rounded-2xl p-4">
                <span className="text-xl flex-shrink-0">{f.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
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

      {/* ── RIGHT form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">EventStan</span>
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {([1, 2] as const).map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                  {step > s
                    ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                    : s}
                </div>
                <span className={`text-xs font-medium ${step >= s ? "text-gray-700" : "text-gray-400"}`}>
                  {s === 1 ? "Your Info" : "Password"}
                </span>
                {s < 2 && <div className={`w-10 h-px mx-1 ${step > s ? "bg-orange-400" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {step === 1 ? "Create your account" : "Set your password"}
            </h1>
            <p className="text-gray-400 text-sm">
              {step === 1 ? "Start planning unforgettable events." : "Almost there — just secure your account."}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className={boxClass("name")}>
                  <svg className="absolute left-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  <input
                    id="name" type="text" value={name} required placeholder="Your full name"
                    onChange={e => { setName(e.target.value); setError(""); }}
                    onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                    className={inputBase}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className={boxClass("email")}>
                  <svg className="absolute left-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <input
                    id="email" type="email" value={email} required placeholder="you@email.com"
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                    className={inputBase}
                  />
                </div>
              </div>

              {/* Phone — with country code selector */}
              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Phone Number</label>
                <div className={boxClass("phone")}>

                  {/* Country code dropdown */}
                  <div className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setCodeOpen(o => !o)}
                      className="flex items-center gap-1 pl-3.5 pr-2 py-3 text-sm text-gray-700 font-medium border-r border-gray-200 focus:outline-none"
                    >
                      <span>
                        {countries.find(c => c.phoneCode === countryCode)?.flag ?? "🌐"}
                      </span>
                      <span>{countryCode}</span>
                      <svg className={`w-3 h-3 text-gray-400 transition-transform ${codeOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>

                    {codeOpen && (
                      <>
                        {/* backdrop to close on outside click */}
                        <div className="fixed inset-0 z-10" onClick={() => setCodeOpen(false)} />
                        <div className="absolute z-20 top-full left-0 mt-1 w-56 max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                          {countries.map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => { setCountryCode(c.phoneCode); setCodeOpen(false); }}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-orange-50 ${c.phoneCode === countryCode ? "bg-orange-50 text-orange-600" : "text-gray-700"}`}
                            >
                              <span>{c.flag}</span>
                              <span className="flex-1 truncate">{c.name}</span>
                              <span className="text-gray-400">{c.phoneCode}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <input
                    id="phone" type="tel" value={phone} required placeholder="50 000 0000"
                    onChange={e => { setPhone(e.target.value.replace(/[^\d]/g, "")); setError(""); }}
                    onFocus={() => setFocused("phone")} onBlur={() => setFocused(null)}
                    className="w-full bg-transparent pl-3 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-orange-200 flex items-center justify-center gap-2">
                Continue
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Password</label>
                <div className={boxClass("pass")}>
                  <svg className="absolute left-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  <input
                    id="password" type={showPass ? "text" : "password"} value={password} required placeholder="Min 8 characters"
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    onFocus={() => setFocused("pass")} onBlur={() => setFocused(null)}
                    className="w-full bg-transparent pl-10 pr-11 py-3 text-sm text-gray-900 placeholder-gray-400 rounded-xl focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3.5 text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPass
                        ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"}
                      />
                    </svg>
                  </button>
                </div>
                {password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${pwStrength >= i ? strengthColor : "bg-gray-200"}`} />
                      ))}
                    </div>
                    <span className={`text-xs font-semibold ${pwStrength <= 1 ? "text-red-400" : pwStrength === 2 ? "text-amber-500" : pwStrength === 3 ? "text-blue-500" : "text-green-500"}`}>
                      {strengthLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div>
                <label htmlFor="confirm" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <div className={`relative flex items-center bg-white border rounded-xl transition-all ${focused === "confirm" ? "border-orange-400 ring-2 ring-orange-100" : confirm && confirm !== password ? "border-red-300" : "border-gray-200"}`}>
                  <svg className="absolute left-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  <input
                    id="confirm" type={showPass ? "text" : "password"} value={confirm} required placeholder="Re-enter password"
                    onChange={e => { setConfirm(e.target.value); setError(""); }}
                    onFocus={() => setFocused("confirm")} onBlur={() => setFocused(null)}
                    className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 rounded-xl focus:outline-none"
                  />
                  {confirm && (
                    <span className="absolute right-3.5">
                      {confirm === password
                        ? <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                        : <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                      }
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-400">
                By creating an account, you agree to our{" "}
                <span className="text-orange-500 cursor-pointer hover:underline">Terms of Service</span> and{" "}
                <span className="text-orange-500 cursor-pointer hover:underline">Privacy Policy</span>.
              </p>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(1); setError(""); }}
                  className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
                  ← Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-orange-200 disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading
                    ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating...</>
                    : "Create Account"
                  }
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-orange-500 font-semibold hover:text-orange-600">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}