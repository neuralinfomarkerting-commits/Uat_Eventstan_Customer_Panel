import Link from "next/link";
import { Handshake, Sparkles, Lightbulb, Globe } from "lucide-react";

const TEAM = [
  {
    name: "Suraj Mahajan",
    role: "Founder & CEO",
    img: "/images/team/team.png",
    // bio: "10+ years in event management across Asia and North America.",
  },
  {
    name: "Mehak Gouri",
    role: "Coo & Co Founder",
    img: "/images/team/team.png",
    // bio: "Former senior engineer at leading tech companies, passionate about seamless UX.",
  },
  {
    name: "Ashiza Sheikh",
    role: "Customer Experience Lead",
    img: "/images/team/team.png",
    // bio: "Built partnerships with 300+ premium event vendors across the country.",
  },
  {
    name: "David ",
    role: "Creative Director",
    img: "/images/team/team.png",
    // bio: "Dedicated to ensuring every event goes exactly as planned.",
  },
];

const VALUES = [
  {
    icon: Handshake,
    title: "Trust & Transparency",
    desc: "Every vendor is vetted. Every review is real. No hidden fees, ever.",
  },
  {
    icon: Sparkles,
    title: "Excellence First",
    desc: "We only partner with vendors who consistently deliver exceptional experiences.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    desc: "We continuously build smarter tools to make event planning effortless.",
  },
  {
    icon: Globe,
    title: "Community",
    desc: "We empower local vendors while connecting clients with the best talent.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section
        className="py-20 px-4 text-center"
        style={{
          background:
            "linear-gradient(135deg, #fff5f0 0%, #fff8f5 40%, #fffaf0 70%, #fff5e0 100%)",
        }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase text-orange-600 mb-5">
          Our Story
        </p>
        <h1 className="text-5xl font-bold leading-tight text-gray-900 mb-5 max-w-xl mx-auto">
          We Make Every Event{" "}
          <span className="text-orange-600">Unforgettable</span>
        </h1>
        <p className="text-base text-gray-500 max-w-md mx-auto leading-relaxed mb-9">
          EventStan was born out of a simple belief — planning your perfect
          event shouldn't be stressful. We connect you with the finest venues,
          decorators, caterers, and entertainers in one seamless platform.
        </p>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-b border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: "500+", label: "Verified Vendors" },
            { num: "1,200+", label: "Events Executed" },
            { num: "4.9★", label: "Average Rating" },
            { num: "50+", label: "Cities Covered" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-orange-500 mb-1">
                {stat.num}
              </div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-14 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why EventStan?
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Planning an event used to mean endless phone calls, scattered
              spreadsheets, and hoping vendors showed up. We changed that by
              creating a single platform where clients can discover, compare,
              and book the best event vendors — all with transparent pricing and
              verified reviews.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              For vendors, we provide a powerful storefront to showcase their
              work, manage bookings, and grow their business. For clients, we
              provide peace of mind that every vendor on EventStan is
              hand-vetted and held to our quality standards.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors"
            >
              Explore Services →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <img
              src="/images/previous-works/previous-work-1.jpg"
              alt="Event"
              className="rounded-2xl object-cover h-44 w-full"
            />
            <img
              src="/images/previous-works/previous-work-4.jpg"
              alt="Decor"
              className="rounded-2xl object-cover h-44 w-full mt-6"
            />
            <img
              src="/images/previous-works/previous-work-6.jpg"
              alt="Catering"
              className="rounded-2xl object-cover h-44 w-full"
            />
            <img
              src="/images/previous-works/previous-work-7.jpg"
              alt="Entertainment"
              className="rounded-2xl object-cover h-44 w-full mt-6"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-orange-500" strokeWidth={2} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Meet the Team
          </h2>
          <p className="text-gray-500 mt-2 text-lg">The people behind EventStan</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {TEAM.map((member) => (
            <div key={member.name} className="text-center group">
              <div className="relative w-40 h-40 mx-auto mb-5 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
              <p className="text-base text-gray-500 mt-1">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 max-w-4xl mx-auto">
        <div className="bg-orange-500 rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Ready to Plan Your Next Event?
          </h2>
          <p className="text-orange-100 mb-6">
            Browse hundreds of verified vendors and book with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/services"
              className="bg-white text-orange-500 px-7 py-3 rounded-full font-semibold hover:bg-orange-50 transition-colors"
            >
              Browse Services
            </Link>
            <Link
              href="/vendor-partners"
              className="bg-gray-900 text-white px-7 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
            >
              Become a Vendor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}