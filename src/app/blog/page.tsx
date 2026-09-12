// app/blog/page.tsx
"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { BlogPost, BlogCategory, CATEGORY_COLORS, mapApiBlogToPost } from "@/lib/blogData";
import { getBlogs } from "@/api/customerApi";

// ── helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── sub-components ────────────────────────────────────────────────────────────

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: BlogCategory;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        active
          ? "bg-orange-500 text-white"
          : "text-gray-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const cls = CATEGORY_COLORS[category] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {category}
    </span>
  );
}

function FeaturedHero({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group relative rounded-2xl overflow-hidden h-[340px] md:h-[420px] shadow-sm">
      <img
        src={post.image_url}
        alt={post.title}
        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
      />
      {/* dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

      {/* featured badge */}
      <span className="absolute top-4 left-4 flex items-center gap-1.5 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        FEATURED
      </span>

      {/* content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <CategoryBadge category={post.category} />
        <h2 className="text-white text-2xl md:text-3xl font-bold mt-2 mb-2 leading-tight group-hover:text-orange-200 transition-colors">
          {post.title}
        </h2>
        <div className="flex items-center gap-3 text-white/70 text-xs">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {post.author}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {post.read_time} min read
          </span>
        </div>
      </div>
    </Link>
  );
}

function TrendingCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative rounded-xl overflow-hidden h-[120px] block flex-shrink-0"
    >
      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <CategoryBadge category={post.category} />
        <p className="text-white text-xs font-semibold mt-1 leading-tight line-clamp-2 group-hover:text-orange-200 transition-colors">
          {post.title}
        </p>
        <div className="flex items-center gap-2 text-white/60 text-[10px] mt-1">
          <span className="flex items-center gap-0.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {post.author}
          </span>
          <span className="flex items-center gap-0.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {post.read_time} min read
          </span>
        </div>
      </div>
    </Link>
  );
}

function ArticleCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow flex flex-col"
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={post.image_url}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <CategoryBadge category={post.category} />
        <h3 className="text-gray-900 font-bold text-base mt-2 mb-1.5 leading-snug group-hover:text-orange-500 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>
        <div className="flex items-center gap-3 text-gray-400 text-xs mt-4 pt-4 border-t border-gray-50">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {post.author}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {post.read_time} min read
          </span>
          <span className="ml-auto">{timeAgo(post.published_at)}</span>
        </div>
      </div>
    </Link>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<BlogCategory>("All");
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getBlogs();
        setPosts((data ?? []).map(mapApiBlogToPost));
      } catch (err: any) {
        setError(err?.message || "Failed to load blog posts");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.category))).sort()],
    [posts],
  );

  const featured = posts.find((p) => p.is_featured) ?? posts[0];
  const trending = posts.filter((p) => p.slug !== featured?.slug).slice(0, 3);

  const filtered = posts.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && p.slug !== featured?.slug;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto" />
          <p className="text-gray-400 mt-4 text-sm">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 text-sm">No articles published yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Top Nav Bar ── */}
      <div className="bg-[#111] border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-12">
          {/* Category pills */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <CategoryPill
                key={cat}
                label={cat}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-shrink-0 ml-4">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/10 text-white placeholder-gray-500 text-sm pl-9 pr-4 py-1.5 rounded-full border border-white/10 focus:outline-none focus:border-orange-400 w-40 focus:w-52 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Hero + Trending ── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
          {/* Featured hero — left 3/5 */}
          <div className="lg:col-span-3">
            <FeaturedHero post={featured} />
          </div>

          {/* Trending — right 2/5 */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h3 className="text-gray-900 font-bold text-base">Trending</h3>
            </div>
            <div className="flex flex-col gap-3">
              {trending.map((post) => (
                <TrendingCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Latest Articles ── */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-gray-900 font-bold text-xl">
              {activeCategory === "All" ? "Latest Articles" : activeCategory}
            </h2>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium">No articles found</p>
              <p className="text-sm mt-1">Try a different category or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}