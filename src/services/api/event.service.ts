// services/category.service.ts

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
  image?: string;
  showInHomePage?: boolean;
}

export interface CategoryWithMetadata extends Category {
  desc: string;
  icon: string;
  img: string;
}

// Client-side calls go through the Next.js rewrite proxy (no CORS issue),
// server-side calls hit the real API directly.
const isServer = typeof window === "undefined";
const API_BASE_URL = isServer
  ? `${process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "https://api.eventstan.com"}/api/v1`
  : "/api/proxy";

// Static metadata for categories
const CATEGORY_METADATA: Record<string, { desc: string; icon: string; img: string }> = {
  Venue: {
    desc: "Halls, gardens, resorts & unique spaces",
    icon: "🏛️",
    img: "/images/categories/venue.jpg",
  },
  Decor: {
    desc: "Themes, florals, lighting & staging",
    icon: "🌸",
    img: "/images/categories/decor.jpg",
  },
  Catering: {
    desc: "Cuisines, buffets, desserts & bars",
    icon: "🍽️",
    img: "/images/categories/catering.jpg",
  },
  Entertainment: {
    desc: "DJs, bands, performers & MCs",
    icon: "🎵",
    img: "/images/categories/entertainment.jpg",
  },
  Rentals: {
    desc: "Furniture, tents, sound systems & event essentials",
    icon: "🪑",
    img: "/images/categories/rentals.jpg",
  },
  "Corporate Events": {
    desc: "Conferences, seminars, launches & team events",
    icon: "💼",
    img: "/images/categories/corporate-events.jpg",
  },
};

const DEFAULT_METADATA = {
  desc: "Top-rated vendors for your event",
  icon: "✨",
  img: "/images/categories/default.jpg",
};

export class CategoryService {
  private static instance: CategoryService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = API_BASE_URL; // was: "https://api.eventstan.com/api/v1"
  }

  public static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

  /**
   * Fetch all categories from API
   */
  async fetchCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${this.baseUrl}/master-data/categories`, {
        headers: {
          accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  /**
   * Fetch categories and merge with metadata
   */
  async fetchCategoriesWithMetadata(): Promise<CategoryWithMetadata[]> {
    try {
      const categories = await this.fetchCategories();

      // Merge API data with static metadata (or a sensible default
      // for any category that doesn't have an explicit entry). The
      // backend's own `image` is the real, up-to-date image — use it
      // when present, and only fall back to the static local image
      // (or emoji icon) if the backend hasn't set one.
      const categoriesWithMetadata = categories
        .filter((cat) => cat.isActive) // Only active categories
        .filter((cat) => cat.showInHomePage !== false) // Respect homepage flag when present
        .map((cat) => {
          const metadata = CATEGORY_METADATA[cat.name] ?? DEFAULT_METADATA;
          return {
            ...cat,
            ...metadata,
            img: cat.image?.trim() ? cat.image : metadata.img,
          };
        });

      return categoriesWithMetadata;
    } catch (error) {
      console.error("Error fetching categories with metadata:", error);
      // Fallback: return static categories if API fails
      return this.getStaticCategories();
    }
  }

  /**
   * Get static categories as fallback
   */
  getStaticCategories(): CategoryWithMetadata[] {
    return Object.entries(CATEGORY_METADATA).map(([name, metadata]) => ({
      id: `static-${name.toLowerCase().replace(/\s+/g, "-")}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      parentId: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      ...metadata,
    }));
  }

  /**
   * Get category by name
   */
  async getCategoryByName(name: string): Promise<CategoryWithMetadata | null> {
    const categories = await this.fetchCategoriesWithMetadata();
    return categories.find((cat) => cat.name.toLowerCase() === name.toLowerCase()) || null;
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<CategoryWithMetadata | null> {
    const categories = await this.fetchCategoriesWithMetadata();
    return categories.find((cat) => cat.slug.toLowerCase() === slug.toLowerCase()) || null;
  }
}

// Export singleton instance
export const categoryService = CategoryService.getInstance();