import Link from "next/link";
import Image from "next/image";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Logo + description + socials */}
          <div className="col-span-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
              <Link href="/" className="flex items-center shrink-0">
                <Image
                  src="/eventstan-logo-white.png"
                  alt="EventStan Logo"
                  width={180}
                  height={48}
                  className="rounded-lg w-auto h-auto"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </Link>
            </div>
            <p className="text-sm leading-relaxed max-w-xs mx-auto sm:mx-0 mb-5">
              Your one-stop marketplace for premium event services. Find the
              perfect vendors for your special occasions.
            </p>
            <div className="flex justify-center sm:justify-start gap-3">
              <a
                href="https://www.instagram.com/eventstan.official/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors focus:ring-2 focus:ring-orange-400 focus:outline-none"
                aria-label="Instagram"
              >
                <FaInstagram className="w-4 h-4 text-white" />
              </a>
              <a
                href="https://www.facebook.com/EVENTSTAN/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors focus:ring-2 focus:ring-orange-400 focus:outline-none"
                aria-label="Facebook"
              >
                <FaFacebook className="w-4 h-4 text-white" />
              </a>
              <a
                href="https://tiktok.com/@eventstan"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors focus:ring-2 focus:ring-orange-400 focus:outline-none"
                aria-label="TikTok"
              >
                <FaTiktok className="w-4 h-4 text-white" />
              </a>
              <a
                href="https://www.youtube.com/@eventstan"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors focus:ring-2 focus:ring-orange-400 focus:outline-none"
                aria-label="YouTube"
              >
                <FaYoutube className="w-4 h-4 text-white" />
              </a>
              <a
                href="https://www.linkedin.com/company/eventstan"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors focus:ring-2 focus:ring-orange-400 focus:outline-none"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-semibold mb-4 text-base sm:text-lg">
              Categories
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/services?category=venues", label: "Venues" },
                { href: "/services?category=decors", label: "Decors" },
                { href: "/services?category=caterings", label: "Caterings" },
                {
                  href: "/services?category=entertainments",
                  label: "Entertainments",
                },
                { href: "/services?category=rentals", label: "Rentals" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-orange-400 transition-colors inline-block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-semibold mb-4 text-base sm:text-lg">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/services", label: "Browse Services" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact-Us" },
                { href: "/vendor-partners", label: "Vendor Portal" },
                { href: "/event-types", label: "Event Types" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-orange-400 transition-colors inline-block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-semibold mb-4 text-base sm:text-lg">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-center sm:justify-start gap-2 break-all">
                <FaEnvelope className="w-4 h-4 text-orange-500 shrink-0" />
                <a
                  href="mailto:hello@eventstan.com"
                  className="hover:text-orange-400 transition-colors"
                >
                  hello@eventstan.com
                </a>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <FaPhone className="w-4 h-4 text-orange-500 shrink-0 -scale-x-100" />
                <a
                  href="tel:+971566405353"
                  className="hover:text-orange-400 transition-colors"
                >
                  +971 56 640 5353
                </a>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <FaMapMarkerAlt className="w-4 h-4 text-orange-500 shrink-0" />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=In5+Tech+Dubai+UAE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange-400 transition-colors"
                >
                  In5 Tech, Dubai - UAE
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-center">
          <span>© {new Date().getFullYear()} EventStan. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-orange-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-conditions" className="hover:text-orange-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}