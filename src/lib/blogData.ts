// lib/blogData.ts
// Blog data now comes from the live API (see src/api/customerApi.ts -> getBlogs).
// This file keeps the shared types, category color mapping, and a mapper that
// converts the API's camelCase blog shape into the shape the UI expects.

import { ApiBlogPost } from "@/api/customerApi";

// Categories are set freely by admins from the master categories list, so we
// no longer restrict this to a fixed union — "All" plus whatever the API
// returns.
export type BlogCategory = string;

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML string, rendered directly
  category: string;
  author: string;
  read_time: number; // minutes
  image_url: string;
  tags: string[];
  published_at: string;
  is_featured?: boolean;
  related_services?: string[];
  related_packages?: string[];
}

export function mapApiBlogToPost(post: ApiBlogPost): BlogPost {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    author: post.authorName,
    read_time: post.readTime,
    image_url: post.coverImage,
    tags: post.tags ?? [],
    published_at: post.publishedAt,
    is_featured: post.isFeatured,
    related_services: post.relatedServiceIds ?? [],
    related_packages: post.relatedPackageIds ?? [],
  };
}

// Fallback list shown for the category pills before the API has loaded.
export const BLOG_CATEGORIES: BlogCategory[] = ["All"];

// Category color mapping — falls back to gray for any category not listed
// here (see CATEGORY_COLORS usage in blog pages).
export const CATEGORY_COLORS: Record<string, string> = {
  Trends: "bg-purple-100 text-purple-700",
  Venues: "bg-blue-100 text-blue-700",
  Venue: "bg-blue-100 text-blue-700",
  Decor: "bg-pink-100 text-pink-700",
  Catering: "bg-green-100 text-green-700",
  Entertainment: "bg-yellow-100 text-yellow-700",
  "Planning Tips": "bg-cyan-100 text-cyan-700",
  "Real Events": "bg-orange-100 text-orange-700",
  Rentals: "bg-indigo-100 text-indigo-700",
  "Corporate Events": "bg-teal-100 text-teal-700",
};