/**
 * OptiCart Structured Shopping Intent Definition
 */

export interface ShoppingBudget {
  amount?: number;
  currency: string;
  raw?: string;
  isFlexible?: boolean;
}

export interface ShoppingItemRequirement {
  id?: string;
  name: string; // e.g. "Gaming Laptop", "Wireless Mouse", "Laptop Sleeve"
  category?: string; // e.g. "Laptops", "Electronics", "Accessories"
  targetBudget?: number;
  preferredBrands?: string[];
  importantFeatures?: string[];
  quantity?: number;
}

export interface ShoppingIntent {
  category: string;
  productType: string;
  budget?: ShoppingBudget;
  preferredBrands: string[];
  excludedBrands: string[];
  qualityPreference: 'budget' | 'mid-range' | 'premium' | 'best-value';
  deliveryPreference?: string;
  importantFeatures: string[];
  quantity?: number;
  requestedResultCount?: number;
  concern?: string;
  userPriorities: string[];
  assumptionsMade: string[];
  readinessState: 'needs_budget' | 'ready_for_recommendation' | 'refining';
  summary: string;
  changeSummary?: string;
  items?: ShoppingItemRequirement[];
  isMultiItem?: boolean;
}

export interface StructuredAiResponse {
  reply: string;
  intent: ShoppingIntent;
}

