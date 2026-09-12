// app/blog/[slug]/page.tsx
"use client";
import { use } from "react";
import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import CurrencySymbol from "@/components/ui/CurrencySymbol";
import { BlogPost, CATEGORY_COLORS, mapApiBlogToPost } from "@/lib/blogData";
import { getBlogBySlug, getServices, getPackages } from "@/api/customerApi";
import { Service, Package } from "@/types";
import { FaFacebook } from "react-icons/fa";
import { FaTwitter, FaLinkedin } from "react-icons/fa";
import { usePathname } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ slug: string }>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function CategoryBadge({ category }: { category: string }) {
  const cls = CATEGORY_COLORS[category] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {category}
    </span>
  );
}
const stripInlineSizing = (tag: string) =>
  tag
    .replace(/\swidth\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\sheight\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\sstyle\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\sclass\s*=\s*["'][^"']*["']/gi, "");

function normalizeArticleMedia(html: string): string {
  if (!html) return html;
  let out = html;

  // Images
  out = out.replace(/<img\b[^>]*>/gi, (match) => {
    const cleaned = stripInlineSizing(match);
    const withClass = cleaned.replace(
      /^<img/i,
      '<img class="w-full h-64 md:h-[420px] object-cover" loading="lazy"'
    );
    return `<span class="block my-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">${withClass}</span>`;
  });

  // Videos
  out = out.replace(/<video\b[^>]*>/gi, (match) => {
    const cleaned = stripInlineSizing(match);
    const withClass = cleaned.replace(
      /^<video/i,
      '<video class="w-full h-64 md:h-[420px] object-cover bg-black" controls preload="metadata"'
    );
    return `<span class="block my-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">${withClass}</span>`;
  });

  // Iframes (YouTube/Vimeo embeds)
  out = out.replace(/<iframe\b[^>]*>/gi, (match) => {
    const cleaned = stripInlineSizing(match);
    const withClass = cleaned.replace(
      /^<iframe/i,
      '<iframe class="w-full h-64 md:h-[420px] border-0"'
    );
    return `<span class="block my-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">${withClass}</span>`;
  });

  return out;
}

// ── Share Buttons ─────────────────────────────────────────────────────────────
function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();
  const url = `http://localhost:3000${pathname}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platforms = [
    {
      label: "Twitter",
      icon: <FaTwitter className="w-4 h-4" />,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      label: "Facebook",
      icon: <FaFacebook className="w-4 h-4" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      label: "LinkedIn",
      icon: <FaLinkedin className="w-4 h-4" />,
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {platforms.map((p) => (
        <a
          key={p.label}
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-600 text-sm hover:border-orange-400 hover:text-orange-500 transition-colors"
        >
          {p.icon}
          {p.label}
        </a>
      ))}
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-600 text-sm hover:border-orange-400 hover:text-orange-500 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}

// ── Related Service Card ───────────────────────────────────────────────────────
function RelatedServiceCard({ service }: { service: Service }) {
  return (
    <Link href={`/services/${service.id}`} className="group block">
      <div className="rounded-xl overflow-hidden aspect-[4/3] mb-3">
        <img
          src={service.image_url}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">{service.category}</span>
      <p className="text-gray-900 font-semibold text-sm mt-0.5 group-hover:text-orange-500 transition-colors line-clamp-1">
        {service.title}
      </p>
      <div className="flex items-center gap-1 mt-1">
        <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="text-xs font-medium text-gray-700">{service.rating}</span>
        <span className="text-xs text-gray-400 ml-1">
          From <CurrencySymbol currency="AED" />{service.price_min?.toLocaleString()}
        </span>
      </div>
    </Link>
  );
}

// ── Related Package Card ──────────────────────────────────────────────────────
function RelatedPackageCard({ pkg, services }: { pkg: Package; services: Service[] }) {
  const service = services.find((s) => s.id === pkg.service_id);
  return (
    <Link href={`/services/${pkg.service_id}`} className="group block">
      <div className="rounded-xl overflow-hidden aspect-[4/3] mb-3 bg-gray-100">
        {service?.image_url ? (
          <img
            src={service.image_url}
            alt={pkg.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : null}
      </div>
      <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">
        {service?.category}
      </span>
      <p className="text-gray-900 font-semibold text-sm mt-0.5 group-hover:text-orange-500 transition-colors line-clamp-1">
        {pkg.title}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">
        <CurrencySymbol currency="AED" />{pkg.price.toLocaleString()} · up to {pkg.max_guests} guests
      </p>
    </Link>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BlogDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [raw, servicesData, packagesData] = await Promise.all([
          getBlogBySlug(slug),
          getServices().catch(() => []),
          getPackages().catch(() => []),
        ]);
        if (!raw) {
          setNotFoundFlag(true);
        } else {
          setPost(mapApiBlogToPost(raw));
        }
        setServices(servicesData);
        setPackages(packagesData);
      } catch {
        setNotFoundFlag(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (notFoundFlag || !post) return notFound();

  // Related services — prefer the ones the author explicitly linked, and
  // fall back to matching by category if none were picked.
  const categoryMap: Record<string, string> = {
    Venues: "Venue",
    Catering: "Catering",
    Decor: "Decor",
    Entertainment: "Entertainment",
  };
  const mappedCategory = categoryMap[post.category] ?? post.category;

  const relatedServices = post.related_services && post.related_services.length > 0
    ? services.filter((s) => post.related_services!.includes(s.id)).slice(0, 3)
    : services.filter((s) => s.category === mappedCategory).slice(0, 3);

  const featuredPackages = post.related_packages && post.related_packages.length > 0
    ? packages.filter((p) => post.related_packages!.includes(p.id)).slice(0, 3)
    : packages.slice(0, 3);

  const normalizedContent = normalizeArticleMedia(post.content);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* ── Back ── */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        {/* ── Meta row ── */}
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <CategoryBadge category={post.category} />
          <span className="flex items-center gap-1 text-gray-400 text-xs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {post.author}
          </span>
          <span className="flex items-center gap-1 text-gray-400 text-xs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {post.read_time} min read
          </span>
        </div>

        {/* ── Title ── */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
          {post.title}
        </h1>

        {/* ── Excerpt ── */}
        <p className="text-gray-500 text-base leading-relaxed mb-6">{post.excerpt}</p>

        {/* ── Hero image ── */}
        <div className="rounded-2xl overflow-hidden aspect-[16/9] mb-8 shadow-sm">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* ── Article body ── */}
        <div
          className="text-black prose prose-gray prose-lg max-w-none mb-10
            prose-h2:text-2xl prose-h2:font-bold prose-h2:text-gray-900 prose-h2:mt-8 prose-h2:mb-3
            prose-h3:text-lg prose-h3:font-semibold prose-h3:text-gray-800 prose-h3:mt-6 prose-h3:mb-2
            prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline
            prose-img:m-0 prose-img:rounded-none"
          dangerouslySetInnerHTML={{ __html: normalizedContent }}
        />

        {/* ── Tags ── */}
        {post.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-8">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full hover:bg-orange-50 hover:text-orange-600 cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* ── Share ── */}
        <div className="border-t border-b border-gray-100 py-6 mb-10">
          <p className="text-sm font-semibold text-gray-700 mb-3">Share this article</p>
          <ShareButtons title={post.title} slug={post.slug} />
        </div>

        {/* ── Related Services ── */}
        {relatedServices.length > 0 && (
          <div className="mb-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Services</p>
            <div className="grid grid-cols-3 gap-4">
              {relatedServices.map((s) => (
                <RelatedServiceCard key={s.id} service={s} />
              ))}
            </div>
          </div>
        )}

        {/* ── Featured Packages ── */}
        <div className="mb-10">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Featured Packages</p>
          <div className="grid grid-cols-3 gap-4">
            {featuredPackages.map((pkg) => (
              <RelatedPackageCard key={pkg.id} pkg={pkg} services={services} />
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <Link
              href="/services"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-orange-500 transition-colors"
            >
              Browse All Services
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/packages"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:border-orange-400 hover:text-orange-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              View Packages
            </Link>
          </div>
        </div>

        {/* ── More Articles ── */}
        <div className="border-t border-gray-100 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            More Articles
          </Link>
        </div>
      </div> 
    </div>
  );
}