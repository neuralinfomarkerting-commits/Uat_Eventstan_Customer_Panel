"use client";

const PARTNERS = [
  { name: "Iman Developers",      logo: "/logo/iman.png" },
  { name: "Careem",               logo: "/logo/careem.avif" },
  { name: "Logicom Distribution", logo: "/logo/logicomdistribution.png" },
  { name: "Cosmo",                logo: "/logo/cosmo.webp" },
  { name: "Holiday Factory",      logo: "/logo/holidayfactory.png" },
  { name: "Max",                  logo: "/logo/max.png" },
  { name: "Babyshop",             logo: "/logo/babyshop.png" },
];

export default function PartnerMarquee() {
  return (
    <section className="py-10 overflow-hidden border-y border-border/40 bg-muted/20">
      {/* Heading */}
      <div className="text-center mb-6">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">
          Trusted By
        </p>
        <h2 className="text-2xl font-bold text-gray-900">
          Our Clients &amp; Vendor Partners
        </h2>
      </div>

      {/* Marquee */}
      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10 bg-gradient-to-l from-background to-transparent" />

        {/* Track — duplicated for seamless loop */}
        <div className="flex overflow-hidden">
          <div
            className="flex items-center gap-6 animate-marquee hover:[animation-play-state:paused]"
            style={{ width: "max-content" }}
          >
            {[...PARTNERS, ...PARTNERS].map((partner, i) => (
              <div
                key={i}
                className="
                  group
                  flex items-center justify-center
                  px-6 py-4
                  rounded-2xl
                  bg-white
                  border border-border/50
                  shadow-sm
                  hover:shadow-md hover:border-primary/30
                  transition-all duration-300
                  shrink-0
                "
                style={{ minWidth: "140px", height: "72px" }}
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="
                    h-9 w-auto object-contain
                    grayscale opacity-50
                    group-hover:grayscale-0 group-hover:opacity-100
                    transition-all duration-300
                  "
                  onError={(e) => {
                    const el = e.currentTarget;
                    el.style.display = "none";
                    const span = document.createElement("span");
                    span.className =
                      "text-sm font-semibold text-gray-400 group-hover:text-gray-700 whitespace-nowrap transition-colors duration-300";
                    span.textContent = partner.name;
                    el.parentElement?.appendChild(span);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}