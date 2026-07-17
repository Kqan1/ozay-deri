import { unstable_cache } from "next/cache";
import db from "@/lib/db";

// ==========================================
// LAYOUT & HOME CACHE
// ==========================================

export const getCachedCategoriesBar = unstable_cache(
  async () => {
    return await db.category.findMany({
      where: { isHidden: false, parentId: null },
      orderBy: { name: "asc" },
      include: {
        subcategories: {
          where: { isHidden: false },
          orderBy: { name: "asc" },
        },
      },
    });
  },
  ["categories-bar"],
  { revalidate: 3600, tags: ["categories"] }
);

export const getCachedHeaderCategories = unstable_cache(
  async () => {
    return await db.category.findMany({
      where: { isHidden: false, parentId: null },
      orderBy: { name: "asc" },
      include: {
        subcategories: {
          where: { isHidden: false },
          orderBy: { name: "asc" },
        },
      },
      take: 10,
    });
  },
  ["header-categories"],
  { revalidate: 3600, tags: ["categories"] }
);

export const getCachedFooterCategories = unstable_cache(
  async () => {
    return await db.category.findMany({
      where: { isHidden: false, parentId: null },
      orderBy: { name: "asc" },
      take: 6,
    });
  },
  ["footer-categories"],
  { revalidate: 3600, tags: ["categories"] }
);

export const getCachedTopCategories = unstable_cache(
  async () => {
    return await db.category.findMany({
      where: { isHidden: false, parentId: null },
      include: {
        subcategories: {
          where: { isHidden: false },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
  },
  ["home-top-categories"],
  { revalidate: 3600, tags: ["categories"] }
);

export const getCachedCarouselSlides = unstable_cache(
  async () => {
    return await db.carouselSlide.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  },
  ["home-carousel"],
  { revalidate: 3600, tags: ["carousel"] }
);

export const getCachedNewProducts = unstable_cache(
  async () => {
    return await db.product.findMany({
      where: { isHidden: false },
      include: {
        fields: {
          where: { name: { in: ["Thumbnail", "Açıklama", "Description"] } },
        },
        category: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
  },
  ["home-new-products"],
  { revalidate: 3600, tags: ["products"] }
);

// ==========================================
// DYNAMIC CACHE (Category & Search Pages)
// ==========================================

export const getCachedCategory = async (id: string) => {
  return unstable_cache(
    async () => {
      return await db.category.findUnique({
        where: { id },
        include: { subcategories: { where: { isHidden: false } } },
      });
    },
    [`category-${id}`],
    { revalidate: 3600, tags: ["categories"] }
  )();
};

export const getCachedAllCategoriesLight = unstable_cache(
  async () => {
    return await db.category.findMany({ select: { id: true, name: true, parentId: true } });
  },
  ["all-categories-light"],
  { revalidate: 3600, tags: ["categories"] }
);

export const getCachedFilterableFields = async (categoryId: string, ancestorIds: string[]) => {
  const cacheKey = `filterable-fields-${categoryId}`;
  return unstable_cache(
    async () => {
      return await db.fieldDefinition.findMany({
        where: {
          isFilterable: true,
          OR: [
            { isGlobal: true },
            { categoryId },
            { categoryId: { in: ancestorIds }, includeSubcategories: true },
          ],
        },
      });
    },
    [cacheKey],
    { revalidate: 3600, tags: ["categories", "fields"] }
  )();
};

export const getCachedCategoryProducts = async (
  targetCategoryIds: string[],
  filterConditions: any[],
  orderBy: any,
  take: number,
  skip: number
) => {
  // Using JSON.stringify for complex queries to generate a unique cache key
  const queryStr = JSON.stringify({ targetCategoryIds, filterConditions, orderBy, take, skip });
  
  return unstable_cache(
    async () => {
      return await db.product.findMany({
        where: {
          categoryId: { in: targetCategoryIds },
          AND: filterConditions.length > 0 ? filterConditions : undefined,
        },
        include: {
          fields: {
            where: { name: { in: ["Thumbnail", "Açıklama", "Description"] } },
          },
        },
        orderBy,
        take,
        skip,
      });
    },
    [`category-products-${queryStr}`],
    { revalidate: 60, tags: ["products"] } // 60 seconds revalidate for paginated products to allow some real-time updates
  )();
};

export const getCachedCategoryProductsCount = async (
  targetCategoryIds: string[],
  filterConditions: any[]
) => {
  const queryStr = JSON.stringify({ targetCategoryIds, filterConditions });
  
  return unstable_cache(
    async () => {
      return await db.product.count({
        where: {
          categoryId: { in: targetCategoryIds },
          AND: filterConditions.length > 0 ? filterConditions : undefined,
        },
      });
    },
    [`category-products-count-${queryStr}`],
    { revalidate: 60, tags: ["products"] }
  )();
};

// ==========================================
// SITEMAP CACHE
// ==========================================

export const getCachedSitemapCategories = unstable_cache(
  async () => {
    return await db.category.findMany({
      where: { isHidden: false },
      select: { id: true, updatedAt: true },
    });
  },
  ["sitemap-categories"],
  { revalidate: 86400, tags: ["categories"] } // 24 hours
);

export const getCachedSitemapProducts = unstable_cache(
  async () => {
    return await db.product.findMany({
      where: { isHidden: false },
      select: { id: true, updatedAt: true },
    });
  },
  ["sitemap-products"],
  { revalidate: 86400, tags: ["products"] } // 24 hours
);
