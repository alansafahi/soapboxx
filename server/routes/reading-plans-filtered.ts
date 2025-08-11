import type { Request, Response } from "express";
import { db } from "../db";
import { readingPlans } from "../../shared/schema";
import { and, or, eq, like, ilike, inArray, between, sql, desc, asc } from "drizzle-orm";

const DURATION_MAP = {
  lt30: [0, 30],
  "1to3m": [31, 92],
  "4to6m": [93, 183],
  "7to12m": [184, 366],
  gt12m: [367, 5000]
} as const;

const DAILY_TIME_MAP = {
  lt10: [0, 10],
  "10to20": [10, 20],
  gt20: [21, 999]
} as const;

interface FilterParams {
  testament?: string;
  orderType?: string;
  books?: string;
  themes?: string;
  seasons?: string;
  translation?: string;
  difficulty?: string;
  formatTypes?: string;
  audienceTypes?: string;
  duration?: string;
  dailyTime?: string;
  tier?: string;
  search?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

export async function getFilteredReadingPlans(req: Request, res: Response) {
  try {
    const params = req.query as FilterParams;
    
    const page = Math.max(parseInt(params.page || "1"), 1);
    const limit = Math.min(Math.max(parseInt(params.limit || "20"), 1), 60);
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions: any[] = [
      eq(readingPlans.isActive, true),
      eq(readingPlans.isPublic, true)
    ];

    // Helper function to parse CSV values
    const parseCSV = (value?: string): string[] => 
      value ? value.split(",").map(v => v.trim()).filter(Boolean) : [];

    // Testament filter
    const testamentValues = parseCSV(params.testament);
    if (testamentValues.length) {
      conditions.push(inArray(readingPlans.testament, testamentValues));
    }

    // Order type filter
    const orderValues = parseCSV(params.orderType);
    if (orderValues.length) {
      conditions.push(inArray(readingPlans.orderType, orderValues));
    }

    // Translation filter
    if (params.translation) {
      conditions.push(eq(readingPlans.translation, params.translation));
    }

    // Difficulty filter
    const difficultyValues = parseCSV(params.difficulty);
    if (difficultyValues.length) {
      conditions.push(inArray(readingPlans.difficulty, difficultyValues));
    }

    // Subscription tier filter
    const tierValues = parseCSV(params.tier);
    if (tierValues.length) {
      conditions.push(inArray(readingPlans.subscriptionTier, tierValues));
    }

    // Duration filter
    const durationValues = parseCSV(params.duration);
    if (durationValues.length) {
      const durationConditions = durationValues
        .map(d => DURATION_MAP[d as keyof typeof DURATION_MAP])
        .filter(Boolean)
        .map(([min, max]) => 
          and(
            sql`${readingPlans.durationDays} >= ${min}`,
            sql`${readingPlans.durationDays} <= ${max}`
          )
        );
      
      if (durationConditions.length) {
        conditions.push(or(...durationConditions));
      }
    }

    // Daily time filter
    const dailyTimeValues = parseCSV(params.dailyTime);
    if (dailyTimeValues.length) {
      const dailyConditions = dailyTimeValues
        .map(d => DAILY_TIME_MAP[d as keyof typeof DAILY_TIME_MAP])
        .filter(Boolean)
        .map(([min, max]) => 
          and(
            sql`${readingPlans.dailyMinutes} >= ${min}`,
            sql`${readingPlans.dailyMinutes} <= ${max}`
          )
        );
      
      if (dailyConditions.length) {
        conditions.push(or(...dailyConditions));
      }
    }

    // Array-based filters using PostgreSQL array operators
    const formatValues = parseCSV(params.formatTypes);
    if (formatValues.length) {
      conditions.push(sql`${readingPlans.formatTypes} && ARRAY[${formatValues.map(v => `'${v}'`).join(',')}]::text[]`);
    }

    const audienceValues = parseCSV(params.audienceTypes);
    if (audienceValues.length) {
      conditions.push(sql`${readingPlans.audienceTypes} && ARRAY[${audienceValues.map(v => `'${v}'`).join(',')}]::text[]`);
    }

    const themeValues = parseCSV(params.themes);
    if (themeValues.length) {
      conditions.push(sql`${readingPlans.themes} && ARRAY[${themeValues.map(v => `'${v}'`).join(',')}]::text[]`);
    }

    const seasonValues = parseCSV(params.seasons);
    if (seasonValues.length) {
      conditions.push(sql`${readingPlans.seasons} && ARRAY[${seasonValues.map(v => `'${v}'`).join(',')}]::text[]`);
    }

    const bookValues = parseCSV(params.books);
    if (bookValues.length) {
      conditions.push(sql`${readingPlans.books} && ARRAY[${bookValues.map(v => `'${v}'`).join(',')}]::text[]`);
    }

    // Search filter
    if (params.search) {
      const searchTerm = `%${params.search}%`;
      conditions.push(
        or(
          ilike(readingPlans.name, searchTerm),
          ilike(readingPlans.description, searchTerm),
          ilike(readingPlans.category, searchTerm)
        )
      );
    }

    // Determine sort order
    let orderBy;
    switch (params.sort) {
      case "name_asc":
        orderBy = asc(readingPlans.name);
        break;
      case "name_desc":
        orderBy = desc(readingPlans.name);
        break;
      case "duration_asc":
        orderBy = asc(readingPlans.durationDays);
        break;
      case "duration_desc":
        orderBy = desc(readingPlans.durationDays);
        break;
      case "newest":
        orderBy = desc(readingPlans.createdAt);
        break;
      default:
        // Default sort by subscription tier (premium first) then by name
        orderBy = desc(readingPlans.subscriptionTier);
    }

    // Execute the main query
    let query = db
      .select()
      .from(readingPlans)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);
    
    // Add ordering - handle both single order and multiple orders
    if (Array.isArray(orderBy)) {
      query = query.orderBy(...orderBy);
    } else {
      query = query.orderBy(orderBy);
    }
    
    const plans = await query;

    // Get total count for pagination
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(readingPlans)
      .where(and(...conditions));
    
    const total = totalResult[0]?.count || 0;

    res.json({
      items: plans,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error("Error filtering reading plans:", error);
    res.status(500).json({ 
      error: "Failed to filter reading plans",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

// Get available filter options
export async function getFilterOptions(req: Request, res: Response) {
  try {
    // Get unique values for select filters
    const [testaments, orderTypes, translations, difficulties, tiers] = await Promise.all([
      db.selectDistinct({ testament: readingPlans.testament }).from(readingPlans)
        .where(and(eq(readingPlans.isActive, true), eq(readingPlans.isPublic, true))),
      db.selectDistinct({ orderType: readingPlans.orderType }).from(readingPlans)
        .where(and(eq(readingPlans.isActive, true), eq(readingPlans.isPublic, true))),
      db.selectDistinct({ translation: readingPlans.translation }).from(readingPlans)
        .where(and(eq(readingPlans.isActive, true), eq(readingPlans.isPublic, true))),
      db.selectDistinct({ difficulty: readingPlans.difficulty }).from(readingPlans)
        .where(and(eq(readingPlans.isActive, true), eq(readingPlans.isPublic, true))),
      db.selectDistinct({ tier: readingPlans.subscriptionTier }).from(readingPlans)
        .where(and(eq(readingPlans.isActive, true), eq(readingPlans.isPublic, true)))
    ]);

    res.json({
      testaments: testaments.map(t => t.testament).filter(Boolean),
      orderTypes: orderTypes.map(o => o.orderType).filter(Boolean),
      translations: translations.map(t => t.translation).filter(Boolean),
      difficulties: difficulties.map(d => d.difficulty).filter(Boolean),
      tiers: tiers.map(t => t.tier).filter(Boolean)
    });

  } catch (error) {
    console.error("Error getting filter options:", error);
    res.status(500).json({ 
      error: "Failed to get filter options",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}