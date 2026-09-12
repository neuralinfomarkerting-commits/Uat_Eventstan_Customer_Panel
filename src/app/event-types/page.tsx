import Link from "next/link";
import EventTypePills from "@/components/ui/EventTypePills";
import { Gem, Cake, Briefcase, Flower2, Baby, GraduationCap } from "lucide-react";

const EVENT_TYPES = [
  {
    slug: "weddings",
    name: "Weddings",
    icon: Gem,
    tagline: "Your perfect day, flawlessly planned",
    description: "From intimate garden ceremonies to grand ballroom receptions, EventStan connects you with the finest wedding vendors. Our curated network of venues, florists, caterers, and entertainers ensures every moment of your wedding day is exactly as you've always dreamed.",
    services: ["Luxury ballrooms & garden venues", "Bespoke floral arrangements", "Multi-cuisine catering & open bars", "Live bands, DJs & string quartets"],
    image: "images/previous-works/previous-work-1.jpg",
    gallery: [
      "/images/featured-services/featured-services-1.jpg",
      "/images/featured-services/featured-services-2.jpg",
      "/images/previous-works/previous-work-6.jpg",
    ],
    category: "Venue",
  },
  {
    slug: "birthdays",
    name: "Birthdays",
    icon: Cake,
    tagline: "Celebrate every milestone in style",
    description: "Whether it's a kids party, a milestone 30th, or a lavish 50th, we have vendors for every birthday vision. From whimsical balloon decor to gourmet cake experiences and DJ sets that keep the dance floor packed.",
    services: ["Themed decoration & balloon art", "Custom birthday cakes & dessert bars", "DJ & entertainment acts", "Party venues for all sizes"],
    image: "/images/previous-works/previous-work-2.jpg",
    gallery: [
      "/images/previous-works/previous-work-3.jpg",
      "/images/event-type/event-type-1.jpg",
      "/images/previous-works/previous-work-7.jpg",
    ],
    category: "Entertainment",
  },
  {
    slug: "corporate",
    name: "Corporate Events",
    icon: Briefcase,
    tagline: "Impress clients and inspire your team",
    description: "Professional corporate events demand professional execution. From product launches and annual galas to team offsites and conference dinners, our vendors deliver polished, on-brand experiences that reflect your company's values.",
    services: ["Conference & banquet halls", "AV & stage production", "Corporate catering & coffee stations", "Team building & entertainment"],
    image: "/images/event-type/event-type-1.jpg",
    gallery: [
      "/images/previous-works/previous-work-1.jpg",
      "/images/previous-works/previous-work-6.jpg",
      "/images/previous-works/previous-work-7.jpg",
    ],
    category: "Venue",
  },
  {
    slug: "proposals",
    name: "Proposals",
    icon: Flower2,
    tagline: "Make the moment unforgettable",
    description: "The most important question deserves the most beautiful setting. Our proposal specialists create breathtaking scenarios — from rooftop rose petal setups to candlelit beach arrangements — tailored to your partner's personality.",
    services: ["Intimate venue setup", "Custom floral & candle arrangements", "Private dining experiences", "Photographers & videographers"],
    image: "/images/previous-works/previous-work-4.jpg",
    gallery: [
      "/images/featured-services/featured-services-1.jpg",
      "/images/featured-services/featured-services-2.jpg",
      "/images/previous-works/gallery/previous-work-gallery7.jpg",
    ],
    category: "Decor",
  },
  {
    slug: "baby-showers",
    name: "Baby Showers",
    icon: Baby,
    tagline: "Welcome the little one with love",
    description: "Celebrate the arrival of a new life with a beautifully styled baby shower. Our vendors specialize in soft, whimsical themes — from gender reveals to elegant brunch setups — creating memories that last a lifetime.",
    services: ["Pastel & themed decoration", "Brunch & dessert catering", "Gender reveal setups", "Cake & cupcake towers"],
    image: "images/previous-works/previous-work-3.jpg",
    gallery: [
      "/images/featured-services/featured-services-2.jpg",
      "/images/previous-works/previous-work-6.jpg",
      "/images/previous-works/previous-work-2.jpg",
    ],
    category: "Decor",
  },
  {
    slug: "graduations",
    name: "Graduations",
    icon: GraduationCap,
    tagline: "Honor the achievement, celebrate the future",
    description: "Graduation is one of life's greatest milestones. We help you throw a party as epic as the achievement — whether it's an intimate family dinner or a blowout celebration with friends, our vendors deliver unforgettable experiences.",
    services: ["Party venues & outdoor spaces", "Graduation-themed decor", "Full catering & BBQ setups", "Photo booths & entertainment"],
    image: "/images/event-type/event-type-3.jpg",
    gallery: [
      "/images/previous-works/previous-work-7.jpg",
      "/images/previous-works/previous-work-6.jpg",
      "/images/previous-works/previous-work-1.jpg",
    ],
    category: "Catering",
  },
];

export default function EventTypesPage() {
  return (
    <div>
      {/* Hero */}
      <section
        className="py-20 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #fff5f0 0%, #fff8f5 40%, #fffaf0 70%, #fff5e0 100%)' }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase text-orange-600 mb-5">
          What We Offer
        </p>
        <h1 className="text-5xl font-bold leading-tight text-gray-900 mb-5 max-w-xl mx-auto">
          Every Event,{' '}
          <span className="text-orange-600">
            Expertly<br />Done
          </span>
        </h1>
        <p className="text-base text-gray-500 max-w-md mx-auto leading-relaxed mb-9">
          From weddings to corporate galas, baby showers to proposals — explore the types of events we specialize in and see the magic we've helped create.
        </p>
        <EventTypePills />
      </section>

      {/* Event Type Sections */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-16">
        {EVENT_TYPES.map((event, idx) => {
          const Icon = event.icon;
          return (
            <div
              key={event.slug}
              id={event.slug}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${idx % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
            >
              <div className={idx % 2 === 1 ? "lg:order-2" : ""}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-orange-500" strokeWidth={2} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">{event.name}</h2>
                </div>
                <p className="text-orange-500 font-semibold mb-3">{event.tagline}</p>
                <p className="text-gray-600 leading-relaxed mb-5">{event.description}</p>

                <ul className="space-y-2 mb-6">
                  {event.services.map((s) => (
                    <li key={s} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {s}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/services?category=${event.category}`}
                  className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors"
                >
                  Find {event.name} Vendors →
                </Link>
              </div>

              <div className={`space-y-3 ${idx % 2 === 1 ? "lg:order-1" : ""}`}>
                <div className="rounded-2xl overflow-hidden h-56">
                  <img src={event.image} alt={event.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {event.gallery.map((img, i) => (
                    <div key={i} className="rounded-xl overflow-hidden h-24">
                      <img src={img} alt={`${event.name} gallery ${i}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <section className="py-12 px-4 max-w-4xl mx-auto">
        <div className="bg-orange-500 rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to Plan Your Event?</h2>
          <p className="text-orange-100 mb-6">We support hundreds of event types. Browse all our services or contact us directly.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/about" className="bg-gray-900 text-white px-7 py-3 rounded-full font-semibold hover:bg-gray-800">
              View All Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}