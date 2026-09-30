
export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CategoryWithMetadata extends Category {
  desc: string;
  icon: string;
  img: string;
}

const isServer = typeof window === "undefined";
const API_BASE_URL = isServer
  ? `${process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "")}/api/v1`
  : "/api/proxy";

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
    this.baseUrl = API_BASE_URL;
  }

  public static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

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

      return await response.json();
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  async fetchCategoriesWithMetadata(): Promise<CategoryWithMetadata[]> {
    try {
      const categories = await this.fetchCategories();

      return categories
        .filter((cat) => cat.isActive)
        .map((cat) => ({
          ...cat,
          ...(CATEGORY_METADATA[cat.name] ?? DEFAULT_METADATA),
        }));
    } catch (error) {
      console.error("Error fetching categories with metadata:", error);
      return this.getStaticCategories();
    }
  }

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

  async getCategoryByName(name: string): Promise<CategoryWithMetadata | null> {
    const categories = await this.fetchCategoriesWithMetadata();
    return categories.find((cat) => cat.name.toLowerCase() === name.toLowerCase()) || null;
  }

  async getCategoryBySlug(slug: string): Promise<CategoryWithMetadata | null> {
    const categories = await this.fetchCategoriesWithMetadata();
    return categories.find((cat) => cat.slug.toLowerCase() === slug.toLowerCase()) || null;
  }
}

export const categoryService = CategoryService.getInstance();