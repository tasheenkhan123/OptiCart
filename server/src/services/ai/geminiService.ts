import { GoogleGenAI } from '@google/genai';
import { ENV } from '../../config/env.js';
import { ShoppingIntent, StructuredAiResponse } from '../../types/intent.js';

export const OPTICART_AGENT_SYSTEM_INSTRUCTION = `You are OptiCart, an intelligent, category-agnostic AI shopping and purchase-optimization assistant.

Your mission is to understand user shopping requirements across ANY product category (Electronics, Skincare, Beauty, Fashion, Footwear, Home & Living, Groceries, Daily Needs, etc.) and guide users directly to the smartest purchase decisions.

================================================================================
CRITICAL BEHAVIOR RULES:
================================================================================

1. NATURAL CONVERSATION & MINIMUM QUESTIONS:
   - When the user provides enough information (e.g. "My budget is ₹3000. I want a toner and cleanser" or "I need an ASUS gaming laptop under ₹90,000"), IMMEDIATELY proceed to search and recommendations.
   - NEVER interrogate the customer with multiple technical questions (e.g. DO NOT ask: "Which brand? What skin type? Which GPU? How much RAM?").
   - If the user does NOT specify a brand, DO NOT ask "Which brand do you prefer?". Search across suitable available brands.
   - If the user specifies a brand (e.g. Minimalist, ASUS, Apple, Nike), STRICTLY honor that brand.
   - ONLY ask for budget if the user gave a broad request with NO budget at all (e.g., "I need a gaming laptop" -> "What is your approximate budget?").

2. NO INVENTED REQUIREMENTS:
   - NEVER tell the user: "I'll assume you want 16GB RAM" or claim they requested specifications they did not mention.
   - Keep your conversational reply concise, polite, and directly focused on the recommended products.

3. FRESH REQUESTS VS FOLLOW-UP MUTATIONS:
   - For a FRESH request, do NOT say "Updated target budget to..." or "Prioritized your brand". Simply provide a friendly introduction like "Got it — here are the top options within your ₹X,XXX budget:"
   - For a genuine FOLLOW-UP mutation (e.g., user says "Make it cheaper", "Increase budget by ₹10,000", "Make it Minimalist", "Remove ASUS"):
     * PRESERVE all established requirements (category, items, budget) unless specifically modified.
     * State what was changed in the first sentence and set "changeSummary".

4. MULTI-ITEM BASKETS:
   - When the user asks for multiple items (e.g. "toner and cleanser", "laptop, mouse and headset"), set "isMultiItem": true and list each item in the "items" array with its category and name.

5. REQUESTED RESULT COUNT:
   - If the user asks for "3 options", "top 3", "5 products", etc., populate "requestedResultCount" with that number (default: 3).

================================================================================
MANDATORY JSON RESPONSE FORMAT:
================================================================================
You MUST ALWAYS respond with a valid JSON object matching this schema:
{
  "reply": "Your conversational markdown response. Keep it friendly and concise.",
  "intent": {
    "category": "Laptops | Skincare | Phones | Gaming | Fashion | Groceries | Audio | Electronics | Shoes | Home | Other",
    "productType": "Specific product type (e.g. Gaming Laptop, Summer Dress, Toner + Cleanser Basket)",
    "items": [
      {
        "name": "Item name (e.g. Toner, Face Cleanser, Gaming Laptop)",
        "category": "Category name",
        "targetBudget": number or null,
        "preferredBrands": ["Brand1"]
      }
    ],
    "isMultiItem": boolean,
    "budget": {
      "amount": number or null,
      "currency": "INR",
      "raw": "String (e.g. ₹3,000)",
      "isFlexible": boolean
    },
    "preferredBrands": ["Brand1"],
    "excludedBrands": ["Brand2"],
    "qualityPreference": "budget" | "mid-range" | "premium" | "best-value",
    "deliveryPreference": "e.g. Fast (1-2 days) | null",
    "importantFeatures": ["Feature1"],
    "quantity": number or 1,
    "requestedResultCount": number or 3,
    "concern": "e.g. pimples | null",
    "userPriorities": ["Priority1"],
    "assumptionsMade": [],
    "readinessState": "needs_budget" | "ready_for_recommendation" | "refining",
    "summary": "1-sentence concise synopsis of active requirement",
    "changeSummary": "1-sentence summary of what changed if follow-up turn (or null if fresh request)"
  }
}`;

export interface ChatHistoryMessage {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

export interface GeminiChatRequest {
  message: string;
  conversationHistory?: ChatHistoryMessage[];
  budget?: string;
  previousIntent?: ShoppingIntent;
}

export interface GeminiChatResponse {
  reply: string;
  intent: ShoppingIntent;
  modelUsed: string;
}

export class GeminiService {
  private client: GoogleGenAI | null = null;
  private readonly defaultModel = 'gemini-3.6-flash';

  constructor() {
    if (ENV.hasGeminiKey) {
      this.client = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
    }
  }

  private getClient(): GoogleGenAI {
    if (!this.client) {
      if (!ENV.GEMINI_API_KEY || ENV.GEMINI_API_KEY.trim() === '' || ENV.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        throw new Error(
          'GEMINI_API_KEY is missing or invalid. Please set your GEMINI_API_KEY in server/.env or system environment.'
        );
      }
      this.client = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
    }
    return this.client;
  }

  /**
   * Helper static method to extract budget number from text (e.g. ₹3,000, 3000, 3k, under 90k, etc.)
   */
  static extractBudgetAmountFromText(text: string): number | undefined {
    if (!text || !text.trim()) return undefined;
    const clean = text.trim();

    // 1. Delta budget (e.g. "I can spend ₹10,000 more", "increase budget by 5k")
    const deltaMatch = clean.match(/(?:spend|add|increase)\s*(?:by|₹|rs\.?)?\s*(\d[\d,.]*)\s*(?:k|thousand|lakh|crore)?\s*(?:more|extra)?/i);
    if (deltaMatch && deltaMatch[1]) {
      let val = parseFloat(deltaMatch[1].replace(/,/g, ''));
      if (clean.includes('lakh')) val *= 100000;
      else if (clean.includes('k') && val < 1000) val *= 1000;
      else if (clean.includes('crore')) val *= 10000000;
      return val;
    }

    // 2. Direct Budget Patterns (Using \d[\d,.]* to avoid matching lone commas)
    const patterns = [
      /(?:(?:my\s*)?budget\s*(?:is|of|was|has|for)?\s*[:=]?\s*(?:₹|rs\.?|inr)?\s*(\d[\d,.]*))(?:\s*(?:k|thousand|lakh|crore|rupees|rs|inr|\/-))?/i,
      /(?:have\s*(?:around|about|upto|approx)?\s*(?:₹|rs\.?|inr)?\s*(\d[\d,.]*))(?:\s*(?:k|thousand|lakh|crore|rupees|rs|inr|\/-))?/i,
      /(?:(?:under|around|upto|below|for|target|within|less than|max|maximum|at most)\s*(?:of|my budget of)?\s*(?:₹|rs\.?|inr)?\s*(\d[\d,.]*))(?:\s*(?:k|thousand|lakh|crore|rupees|rs|inr|\/-))?/i,
      /(?:(?:₹|rs\.?|inr)\s*(\d[\d,.]*))(?:\s*(?:k|thousand|lakh|crore|rupees|rs|inr|\/-))?/i,
      /\b(\d[\d,.]*)\s*(?:k|thousand|lakh|crore|rupees|rs|inr|\/-)\b/i,
      // Standalone number or short budget answer (e.g. "3000", "₹3000", "3000 rupees")
      /^\s*(?:₹|rs\.?|inr)?\s*(\d[\d,.]*)\s*(?:k|thousand|lakh|crore|rupees|rs|inr|\/-)?\s*$/i,
    ];

    for (const pattern of patterns) {
      const match = clean.match(pattern);
      if (match && match[1]) {
        const numStr = match[1].replace(/,/g, '');
        let val = parseFloat(numStr);
        if (!isNaN(val) && val > 0) {
          const matchedFull = match[0].toLowerCase();
          if (matchedFull.includes('lakh')) {
            val *= 100000;
          } else if (matchedFull.includes('k') && val < 1000) {
            val *= 1000;
          } else if (matchedFull.includes('crore')) {
            val *= 10000000;
          }
          if (val >= 50) {
            return val;
          }
        }
      }
    }

    // 3. Check for short phrase containing a valid 3-7 digit number (e.g. "3000", "50000")
    const words = clean.split(/\s+/);
    if (words.length <= 5) {
      for (const w of words) {
        const numMatch = w.match(/(?:₹|rs\.?|inr)?(\d{3,7})/i);
        if (numMatch && numMatch[1]) {
          const val = parseFloat(numMatch[1]);
          if (!isNaN(val) && val >= 50) {
            return val;
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Helper static method to extract intent from a prompt
   */
  static async extractIntent(message: string, previousIntent?: ShoppingIntent): Promise<ShoppingIntent> {
    const service = new GeminiService();
    const response = await service.generateChatResponse({ message, previousIntent });
    return response.intent;
  }

  /**
   * Process user shopping message and return natural conversational advice & structured ShoppingIntent
   */
  async generateChatResponse(request: GeminiChatRequest): Promise<GeminiChatResponse> {
    const { message, conversationHistory = [], budget, previousIntent } = request;

    // Direct pre-extraction of budget from message/props
    const detectedBudgetVal = GeminiService.extractBudgetAmountFromText(message) ||
      (budget ? parseFloat(budget.replace(/[^0-9.]/g, '')) : undefined) ||
      previousIntent?.budget?.amount;

    // Check if client is available; if not or if key missing, instantly use fallback
    let ai: GoogleGenAI;
    try {
      ai = this.getClient();
    } catch {
      return this.generateDeterministicFallbackIntent(message, budget, previousIntent);
    }

    // Build multi-turn message history for Gemini API
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Add prior conversation turns
    for (const turn of conversationHistory) {
      if (!turn.content || turn.content.trim() === '') continue;
      const role: 'user' | 'model' = turn.role === 'assistant' || turn.role === 'model' ? 'model' : 'user';
      contents.push({
        role,
        parts: [{ text: turn.content }],
      });
    }

    // Format current user prompt with optional budget and prior intent context
    let currentUserPrompt = message;
    const contextPrefixes: string[] = [];

    if (previousIntent && previousIntent.summary) {
      contextPrefixes.push(
        `[ACTIVE SHOPPING CONTEXT / PREVIOUS INTENT: ${JSON.stringify(previousIntent)}]`
      );
      contextPrefixes.push(
        `[INSTRUCTION FOR THIS TURN: Apply any modifications requested in "${message}" to the active shopping intent. Preserve all unaffected fields. State what was changed in changeSummary.]`
      );
    }

    if (detectedBudgetVal) {
      contextPrefixes.push(`[Active User Target Budget: ₹${detectedBudgetVal}]`);
    } else if (budget && budget.trim() !== '') {
      const cleanBudget = budget.replace(/[^0-9.]/g, '');
      if (cleanBudget) {
        contextPrefixes.push(`[Active User Target Budget: ₹${cleanBudget}]`);
      }
    }

    if (contextPrefixes.length > 0) {
      currentUserPrompt = `${contextPrefixes.join('\n')}\n\nUser Message: ${message}`;
    }

    contents.push({
      role: 'user',
      parts: [{ text: currentUserPrompt }],
    });

    try {
      let response: { text?: string } | undefined;
      const maxRetries = 2;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: this.defaultModel,
            contents,
            config: {
              systemInstruction: OPTICART_AGENT_SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          });
          break;
        } catch (apiErr: unknown) {
          const errMsg = apiErr instanceof Error ? apiErr.message : String(apiErr);
          const is429 = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota exceeded');
          if (is429) {
            console.warn(`[GeminiService Notice]: Rate limit quota active. Falling back to instant local shopping engine.`);
            return this.generateDeterministicFallbackIntent(message, budget, previousIntent);
          } else {
            throw apiErr;
          }
        }
      }

      const rawText = response?.text || '';
      let parsed: StructuredAiResponse;

      try {
        parsed = JSON.parse(rawText) as StructuredAiResponse;
      } catch {
        const cleaned = rawText.replace(/```json\s*/i, '').replace(/```\s*$/, '').trim();
        parsed = JSON.parse(cleaned) as StructuredAiResponse;
      }

      const isMulti = parsed.intent?.isMultiItem ?? (Array.isArray(parsed.intent?.items) && parsed.intent.items.length > 1);
      const budgetVal = parsed.intent?.budget?.amount || detectedBudgetVal || (budget ? parseFloat(budget.replace(/[^0-9.]/g, '')) : previousIntent?.budget?.amount);
      const rawBudgetStr = budgetVal ? `₹${budgetVal.toLocaleString('en-IN')}` : parsed.intent?.budget?.raw || previousIntent?.budget?.raw;

      const hasBudget = typeof budgetVal === 'number' && budgetVal > 0;
      const readinessState: 'needs_budget' | 'ready_for_recommendation' | 'refining' = hasBudget
        ? 'ready_for_recommendation'
        : (parsed.intent?.readinessState || 'needs_budget');

      let replyText = parsed.reply || 'Here are the best recommendations tailored to your request:';
      if (hasBudget && (replyText.toLowerCase().includes('what is your') || replyText.toLowerCase().includes('approximate budget') || replyText.toLowerCase().includes('what\'s your budget') || replyText.toLowerCase().includes('what is the budget'))) {
        if (isMulti && parsed.intent?.items && parsed.intent.items.length > 1) {
          replyText = `Got it — here is an optimized **${parsed.intent.items.map(i => i.name).join(' + ')}** basket curated within your **₹${budgetVal?.toLocaleString('en-IN')}** budget across trusted stores:`;
        } else {
          replyText = `Here are top ${parsed.intent?.productType || 'options'} matching your criteria within **₹${budgetVal?.toLocaleString('en-IN')}**:`;
        }
      }

      const intent: ShoppingIntent = {
        category: parsed.intent?.category || previousIntent?.category || 'General',
        productType: parsed.intent?.productType || previousIntent?.productType || message,
        budget: budgetVal ? { amount: budgetVal, currency: 'INR', raw: rawBudgetStr } : undefined,
        preferredBrands: Array.isArray(parsed.intent?.preferredBrands) ? parsed.intent.preferredBrands : (previousIntent?.preferredBrands || []),
        excludedBrands: Array.isArray(parsed.intent?.excludedBrands) ? parsed.intent.excludedBrands : (previousIntent?.excludedBrands || []),
        qualityPreference: parsed.intent?.qualityPreference || previousIntent?.qualityPreference || 'best-value',
        deliveryPreference: parsed.intent?.deliveryPreference || previousIntent?.deliveryPreference,
        importantFeatures: Array.isArray(parsed.intent?.importantFeatures) ? parsed.intent.importantFeatures : (previousIntent?.importantFeatures || []),
        quantity: parsed.intent?.quantity || previousIntent?.quantity || 1,
        requestedResultCount: parsed.intent?.requestedResultCount || 3,
        concern: parsed.intent?.concern,
        userPriorities: Array.isArray(parsed.intent?.userPriorities) ? parsed.intent.userPriorities : (previousIntent?.userPriorities || []),
        assumptionsMade: [],
        readinessState,
        summary: parsed.intent?.summary || previousIntent?.summary || message,
        changeSummary: previousIntent ? parsed.intent?.changeSummary : undefined,
        items: Array.isArray(parsed.intent?.items) ? parsed.intent.items : previousIntent?.items,
        isMultiItem: isMulti,
      };

      return {
        reply: replyText,
        intent,
        modelUsed: this.defaultModel,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process structured shopping intent';
      console.warn('[GeminiService Intent Notice]: Using deterministic shopping optimizer fallback due to:', errorMessage);
      return this.generateDeterministicFallbackIntent(message, budget, previousIntent);
    }
  }

  /**
   * Deterministic local fallback generator for conversational mutations and intent tracking
   */
  private generateDeterministicFallbackIntent(
    message: string,
    budget?: string,
    previousIntent?: ShoppingIntent
  ): GeminiChatResponse {
    const text = message.toLowerCase().trim();
    let category = previousIntent?.category || 'General';
    let productType = previousIntent?.productType || 'General Product';
    let preferredBrands = previousIntent?.preferredBrands ? [...previousIntent.preferredBrands] : [];
    let excludedBrands = previousIntent?.excludedBrands ? [...previousIntent.excludedBrands] : [];
    let qualityPreference = previousIntent?.qualityPreference || 'best-value';
    let deliveryPreference = previousIntent?.deliveryPreference;
    let importantFeatures = previousIntent?.importantFeatures ? [...previousIntent.importantFeatures] : [];
    let userPriorities = previousIntent?.userPriorities ? [...previousIntent.userPriorities] : [];
    let changeSummary: string | undefined;
    let concern: string | undefined;

    // Requested product result count (e.g. "3 options", "top 3", "3 products", "three laptops", default: 3)
    let requestedResultCount = 3;
    const countMatch = text.match(/\b([1-9]|10)\s*(?:options?|products?|items?|choices?|picks?|laptops?|shoes?|dresses?|combinations?|bundles?)\b/i) ||
                       text.match(/\b(?:top|show|give|find|get)\s*(?:me\s*)?([1-9]|10)\b/i);
    if (countMatch && countMatch[1]) {
      requestedResultCount = parseInt(countMatch[1], 10);
    } else if (text.includes('three ')) {
      requestedResultCount = 3;
    } else if (text.includes('two ')) {
      requestedResultCount = 2;
    } else if (text.includes('four ')) {
      requestedResultCount = 4;
    } else if (text.includes('five ')) {
      requestedResultCount = 5;
    }

    // 0. Detect Multi-Item / Bundle Requests
    let items: import('../../types/intent.js').ShoppingItemRequirement[] = previousIntent?.items ? [...previousIntent.items] : [];
    let isMultiItem = previousIntent?.isMultiItem || false;

    // Clean text of budget mentions for accurate keyword isolation
    const textWithoutBudget = text
      .replace(/(?:under|around|budget|of|upto|below|for|target|have|is|within)\s*(?:of|is|was|has)?\s*(?:₹|rs\.?|rupees|inr)?\s*[\d,]+(?:\s*(?:k|thousand|lakh|rupees|inr))?/gi, '')
      .replace(/(?:₹|rs\.?|inr)\s*[\d,]+(?:\s*(?:k|thousand|lakh|rupees|inr))?/gi, '')
      .replace(/\b\d+\s*k\b/gi, '')
      .replace(/\b\d+\s*(?:thousand|lakh|rupees|inr)\b/gi, '')
      .trim();

    const knownItemKeywords = [
      { kw: 'lip balm', name: 'Lip Balm', category: 'Skincare' },
      { kw: 'lipbalm', name: 'Lip Balm', category: 'Skincare' },
      { kw: 'lip care', name: 'Lip Balm', category: 'Skincare' },
      { kw: 'lip butter', name: 'Lip Balm', category: 'Skincare' },
      { kw: 'lipstick', name: 'Lipstick', category: 'Skincare' },
      { kw: 'lip gloss', name: 'Lip Gloss', category: 'Skincare' },
      { kw: 'toner', name: 'Face Toner', category: 'Skincare' },
      { kw: 'cleanser', name: 'Face Cleanser', category: 'Skincare' },
      { kw: 'face wash', name: 'Face Cleanser', category: 'Skincare' },
      { kw: 'facewash', name: 'Face Cleanser', category: 'Skincare' },
      { kw: 'serum', name: 'Face Serum', category: 'Skincare' },
      { kw: 'sunscreen', name: 'Sunscreen SPF 50', category: 'Skincare' },
      { kw: 'moisturizer', name: 'Hydrating Moisturizer', category: 'Skincare' },
      { kw: 'cream', name: 'Face Cream', category: 'Skincare' },
      { kw: 'shampoo', name: 'Gentle Shampoo', category: 'Skincare' },
      { kw: 'perfume', name: 'Luxury Perfume', category: 'Skincare' },
      { kw: 'fragrance', name: 'Eau De Parfum', category: 'Skincare' },
      { kw: 'laptop', name: 'Gaming Laptop', category: 'Laptops' },
      { kw: 'macbook', name: 'Apple MacBook', category: 'Laptops' },
      { kw: 'mouse', name: 'Wireless Mouse', category: 'Electronics' },
      { kw: 'headset', name: 'Gaming Headset', category: 'Electronics' },
      { kw: 'headphone', name: 'Headphones', category: 'Electronics' },
      { kw: 'earbud', name: 'Wireless Earbuds', category: 'Electronics' },
      { kw: 'earphone', name: 'Wireless Earphones', category: 'Electronics' },
      { kw: 'airpod', name: 'Apple AirPods', category: 'Electronics' },
      { kw: 'smartwatch', name: 'Smartwatch', category: 'Electronics' },
      { kw: 'watch', name: 'Smartwatch', category: 'Electronics' },
      { kw: 'sleeve', name: 'Laptop Sleeve', category: 'Electronics' },
      { kw: 'backpack', name: 'Laptop Backpack', category: 'Electronics' },
      { kw: 'bag', name: 'Laptop Bag', category: 'Electronics' },
      { kw: 'case', name: 'Protective Case', category: 'Electronics' },
      { kw: 'phone', name: '5G Smartphone', category: 'Phones' },
      { kw: 'mobile', name: '5G Smartphone', category: 'Phones' },
      { kw: 'iphone', name: 'Apple iPhone', category: 'Phones' },
      { kw: 'controller', name: 'Wireless Controller', category: 'Gaming' },
      { kw: 'shoes', name: 'Running Shoes', category: 'Shoes' },
      { kw: 'shoe', name: 'Running Shoes', category: 'Shoes' },
      { kw: 'sneaker', name: 'Running Shoes', category: 'Shoes' },
      { kw: 'dress', name: 'Summer Dress', category: 'Fashion' },
      { kw: 'jeans', name: 'Stretch Jeans', category: 'Fashion' },
      { kw: 'jean', name: 'Stretch Jeans', category: 'Fashion' },
      { kw: 'hoodie', name: 'Cotton Hoodie', category: 'Fashion' },
      { kw: 'oil', name: 'Olive Oil', category: 'Groceries' },
    ];

    const detected = knownItemKeywords.filter((k) =>
      new RegExp(`\\b${k.kw}`, 'i').test(textWithoutBudget)
    );
    // Deduplicate by item name
    const uniqueDetected = detected.filter((v, i, a) => a.findIndex((t) => t.name === v.name) === i);

    const hasMultiConjunction = /[,&+]|\band\b|\bwith\b|\bplus\b|\bset\b|\bbundle\b|\broutine\b|\bcombination\b|\bcombinations\b/i.test(textWithoutBudget);
    if (uniqueDetected.length >= 2 && hasMultiConjunction) {
      isMultiItem = true;
      category = uniqueDetected[0].category;
      productType = `${uniqueDetected.map((d) => d.name).join(' + ')} Basket`;
      items = [];
      uniqueDetected.forEach((d, idx) => {
        items.push({
          id: `item-req-${idx + 1}`,
          name: d.name,
          category: d.category,
          preferredBrands: preferredBrands.length > 0 ? preferredBrands : undefined,
        });
      });
    }

    // 1. Detect Natural Concerns & Categories for Single Items (only if not already multi-item)
    if (!isMultiItem && uniqueDetected.length <= 1) {
      if (text.includes('lip balm') || text.includes('lipbalm') || text.includes('lip care') || text.includes('lip butter') || text.includes('baby lips') || text.includes('lip sleeping')) {
        category = 'Skincare';
        productType = 'Lip Balm';
        concern = undefined;
        items = [];
      } else if (text.includes('pimple') || text.includes('acne') || text.includes('blemish') || text.includes('breakout')) {
        concern = 'pimples';
        category = 'Skincare';
        productType = text.includes('cream') ? 'Acne & Pimple Clarifying Cream' : (text.includes('serum') ? 'Anti-Acne Face Serum' : 'Acne Treatment');
        items = [];
      } else if (text.includes('toner')) {
        category = 'Skincare';
        productType = 'Face Toner';
        concern = undefined;
        items = [];
      } else if (text.includes('cleanser') || text.includes('face wash') || text.includes('facewash')) {
        category = 'Skincare';
        productType = 'Face Cleanser';
        concern = undefined;
        items = [];
      } else if (text.includes('moisturizer')) {
        category = 'Skincare';
        productType = 'Hydrating Moisturizer';
        concern = undefined;
        items = [];
      } else if (text.includes('sunscreen') || text.includes('spf')) {
        category = 'Skincare';
        productType = 'Sunscreen SPF 50';
        concern = undefined;
        items = [];
      } else if (text.includes('serum')) {
        category = 'Skincare';
        productType = 'Face Serum';
        concern = undefined;
        items = [];
      } else if (text.includes('cream')) {
        category = 'Skincare';
        productType = 'Face Cream';
        concern = undefined;
        items = [];
      } else if (text.includes('skincare') || text.includes('beauty')) {
        category = 'Skincare';
        productType = previousIntent?.productType || 'Skincare';
      } else if (text.includes('dress') || text.includes('summer dress')) {
        category = 'Fashion';
        productType = 'Summer Dress';
      } else if (text.includes('jeans') || text.includes('jean') || text.includes('denim')) {
        category = 'Fashion';
        productType = 'Stretch Denim Jeans';
      } else if (text.includes('hoodie') || text.includes('shirt') || text.includes('clothing') || text.includes('fashion') || text.includes('apparel')) {
        category = 'Fashion';
        productType = 'Fashion Apparel';
      } else if (text.includes('shoe') || text.includes('sneaker') || text.includes('running') || text.includes('footwear')) {
        category = 'Shoes';
        productType = 'Running Shoes';
      } else if (text.includes('macbook') || text.includes('apple laptop')) {
        category = 'Laptops';
        productType = 'Apple MacBook';
      } else if (text.includes('laptop') || text.includes('pc')) {
        category = 'Laptops';
        productType = text.includes('gaming') ? 'Gaming Laptop' : 'Laptop';
      } else if (text.includes('phone') || text.includes('mobile') || text.includes('iphone') || text.includes('galaxy')) {
        category = 'Phones';
        productType = text.includes('iphone') ? 'Apple iPhone' : '5G Smartphone';
      } else if (text.includes('headset') || text.includes('headphone') || text.includes('earbud') || text.includes('mouse') || text.includes('audio')) {
        category = 'Electronics';
        productType = text.includes('headset') ? 'Gaming Headset' : (text.includes('mouse') ? 'Wireless Mouse' : 'Wireless Audio');
      } else if (text.includes('game') || text.includes('gaming') || text.includes('controller') || text.includes('playstation') || text.includes('ps5')) {
        category = 'Gaming';
        productType = 'Gaming Accessory';
      } else if (text.includes('oil') || text.includes('grocery') || text.includes('food')) {
        category = 'Groceries';
        productType = 'Groceries';
      }
    }

    // 2. Robust Budget Extraction
    let budgetAmount: number | undefined = previousIntent?.budget?.amount;
    let rawBudget: string | undefined = previousIntent?.budget?.raw;

    // Delta Budget (e.g. "I can spend ₹10,000 more", "increase budget by 5k")
    const deltaMatch = text.match(/(?:spend|add|increase)\s*(?:by|₹|rs\.?)?\s*(\d[\d,.]*)\s*(?:k|thousand|lakh|crore)?\s*(?:more|extra)?/i);

    if (deltaMatch && deltaMatch[1] && budgetAmount && previousIntent) {
      let deltaVal = parseFloat(deltaMatch[1].replace(/,/g, ''));
      if (text.includes('lakh')) deltaVal *= 100000;
      else if (text.includes('k') && deltaVal < 1000) deltaVal *= 1000;
      else if (text.includes('crore')) deltaVal *= 10000000;
      const oldBudget = budgetAmount;
      budgetAmount += deltaVal;
      rawBudget = `₹${budgetAmount.toLocaleString('en-IN')}`;
      changeSummary = `Updated your budget from ₹${oldBudget.toLocaleString('en-IN')} to ₹${budgetAmount.toLocaleString('en-IN')}.`;
    } else {
      const extractedVal = GeminiService.extractBudgetAmountFromText(message);
      if (typeof extractedVal === 'number' && extractedVal >= 50) {
        if (previousIntent && previousIntent.budget?.amount && previousIntent.budget.amount !== extractedVal) {
          changeSummary = `Updated target budget to ₹${extractedVal.toLocaleString('en-IN')}.`;
        }
        budgetAmount = extractedVal;
        rawBudget = `₹${budgetAmount.toLocaleString('en-IN')}`;
      } else if (budget && budget.trim() !== '') {
        const clean = budget.replace(/[^0-9.]/g, '');
        const parsed = parseFloat(clean);
        if (!isNaN(parsed) && parsed > 0) {
          budgetAmount = parsed;
          rawBudget = `₹${budgetAmount.toLocaleString('en-IN')}`;
        }
      }
    }

    // 3. Detect Brand Mentions & Modifications
    const nonBrandWords = ['everything', 'all', 'the', 'it', 'me', 'good', 'cheap', 'cheapest', 'this', 'that', 'under', 'need', 'want', 'gaming', 'running', 'cute', 'summer', 'pimples', 'acne', 'cream', 'dress', 'toner', 'cleanser', 'best', 'brands', 'brand'];

    if (text.includes('remove ') || text.includes('exclude ') || text.includes('no ')) {
      const removeMatch = text.match(/(?:remove|exclude|no)\s+([a-z0-9]+)/i);
      if (removeMatch && removeMatch[1] && !nonBrandWords.includes(removeMatch[1].toLowerCase())) {
        const brandToRemove = removeMatch[1].charAt(0).toUpperCase() + removeMatch[1].slice(1);
        excludedBrands = Array.from(new Set([...excludedBrands, brandToRemove]));
        preferredBrands = preferredBrands.filter((b) => b.toLowerCase() !== brandToRemove.toLowerCase());
        if (previousIntent) {
          changeSummary = changeSummary ? `${changeSummary} Excluded ${brandToRemove}.` : `Excluded ${brandToRemove} from recommendations.`;
        }
      }
    }

    const knownBrandCatalog = [
      'Samsung', 'Apple', 'OnePlus', 'ASUS', 'Lenovo', 'Acer', 'HP', 'Dell',
      'Sony', 'Poco', 'Realme', 'Minimalist', 'Anua', 'Medik8', 'DermaGlow',
      'Cetaphil', 'Plum', 'Zara', 'H&M', 'Forever 21', 'Nike', 'Adidas', 'Puma', "Levi's",
      'PlayStation', 'Borges', 'Bose', 'Logitech', 'Razer', 'Spigen', 'HyperX'
    ];

    const brandMatches: string[] = [];
    for (const kb of knownBrandCatalog) {
      if (new RegExp(`\\b${kb.replace("'", "\\'")}\\b`, 'i').test(text)) {
        brandMatches.push(kb);
      }
    }

    if (brandMatches.length > 0) {
      preferredBrands = brandMatches;
      excludedBrands = excludedBrands.filter((b) => !brandMatches.some((bm) => bm.toLowerCase() === b.toLowerCase()));

      if (category === 'General') {
        const topBrand = brandMatches[0];
        if (['Minimalist', 'DermaGlow', 'Cetaphil', 'Plum', 'Anua', 'Medik8'].includes(topBrand)) {
          category = 'Skincare';
          productType = 'Skincare Products';
        } else if (['ASUS', 'Lenovo', 'Acer', 'HP', 'Dell'].includes(topBrand)) {
          category = 'Laptops';
          productType = 'Laptops';
        } else if (['Nike', 'Adidas', 'Puma'].includes(topBrand)) {
          category = 'Shoes';
          productType = 'Shoes';
        } else if (['Zara', 'H&M', 'Forever 21', "Levi's"].includes(topBrand)) {
          category = 'Fashion';
          productType = 'Fashion Apparel';
        } else if (['Logitech', 'Razer', 'Spigen', 'HyperX', 'Bose', 'Sony'].includes(topBrand)) {
          category = 'Electronics';
          productType = 'Electronics';
        }
      }

      if (previousIntent && previousIntent.preferredBrands && JSON.stringify(previousIntent.preferredBrands) !== JSON.stringify(preferredBrands)) {
        changeSummary = changeSummary ? `${changeSummary} Prioritized ${preferredBrands.join(', ')}.` : `Prioritized ${preferredBrands.join(', ')}.`;
      }
    }

    if (text.includes('forget the brand') || text.includes('ignore brand') || text.includes('no brand preference') || text.includes('maximize savings')) {
      preferredBrands = [];
      qualityPreference = 'best-value';
      if (previousIntent) {
        changeSummary = changeSummary ? `${changeSummary} Reset brand constraints for maximum value.` : `Removed brand restrictions to focus on highest performance/value.`;
      }
    }

    // 4. Detect Quality Preferences & Delivery Preferences
    if (text.includes('cheapest') || text.includes('as cheap as possible') || text.includes('cheap option') || text.includes('make it cheaper')) {
      qualityPreference = 'budget';
      userPriorities = Array.from(new Set([...userPriorities, 'Lowest Price', 'Maximum Savings']));
      if (previousIntent) {
        changeSummary = changeSummary ? `${changeSummary} Prioritized most economical options.` : `Prioritized the lowest cost and maximum savings options.`;
      }
    }

    if (text.includes('better gpu') || text.includes('gpu performance') || text.includes('more gpu') || text.includes('stronger gpu')) {
      userPriorities = Array.from(new Set([...userPriorities, 'GPU Performance', 'High TGP Graphics']));
      importantFeatures = Array.from(new Set([...importantFeatures, 'RTX 4060', 'RTX 4050 6GB 95W+']));
      if (previousIntent) {
        changeSummary = changeSummary ? `${changeSummary} Prioritized stronger GPU performance.` : `Prioritized higher GPU performance and graphics power.`;
      }
    }

    if (text.includes('arrive quickly') || text.includes('fast delivery') || text.includes('quick delivery')) {
      deliveryPreference = 'Fast (1-2 days)';
      if (previousIntent) {
        changeSummary = changeSummary ? `${changeSummary} Filtered for fast 1-2 day delivery.` : `Filtered for express 1-2 day delivery.`;
      }
    }

    // 5. Readiness state calculation
    const hasBudget = typeof budgetAmount === 'number' && budgetAmount > 0;
    const readinessState: 'needs_budget' | 'ready_for_recommendation' | 'refining' = hasBudget ? 'ready_for_recommendation' : 'needs_budget';

    // 6. Conversational Reply Generation (Friendly, natural, concise, without invented assumptions)
    let reply = '';
    if (!hasBudget) {
      if (isMultiItem && items.length > 1) {
        reply = `I can help you assemble your **${items.map(i => i.name).join(' + ')}** basket! What is your approximate total budget?`;
      } else {
        reply = `I can help you find the best **${category !== 'General' ? category : productType}**! What is your approximate budget?`;
      }
    } else {
      const prefix = changeSummary ? `### ${changeSummary}\n\n` : '';
      if (isMultiItem && items.length > 1) {
        reply = `${prefix}Got it — here is an optimized **${items.map(i => i.name).join(' + ')}** basket curated within your **₹${budgetAmount?.toLocaleString('en-IN')}** budget across trusted stores:`;
      } else if (concern === 'pimples') {
        reply = `${prefix}Here are effective, gentle acne and pimple clarifying options within your **₹${budgetAmount?.toLocaleString('en-IN')}** budget:`;
      } else if (preferredBrands.length > 0) {
        reply = `${prefix}Here are top **${preferredBrands.join(' & ')}** ${productType} recommendations within your **₹${budgetAmount?.toLocaleString('en-IN')}** budget:`;
      } else {
        reply = `${prefix}Here are top ${productType} options matching your criteria within **₹${budgetAmount?.toLocaleString('en-IN')}**:`;
      }
    }

    const intent: ShoppingIntent = {
      category,
      productType,
      budget: budgetAmount ? { amount: budgetAmount, currency: 'INR', raw: rawBudget || `₹${budgetAmount}` } : undefined,
      preferredBrands,
      excludedBrands,
      qualityPreference,
      deliveryPreference,
      importantFeatures,
      quantity: 1,
      requestedResultCount,
      concern,
      userPriorities,
      assumptionsMade: [],
      readinessState,
      summary: isMultiItem
        ? `${items.map(i => i.name).join(' + ')} under ₹${budgetAmount?.toLocaleString('en-IN') || 'budget'}`
        : `${preferredBrands.length ? preferredBrands.join(' ') + ' ' : ''}${productType} under ₹${budgetAmount?.toLocaleString('en-IN') || 'budget'}`,
      changeSummary,
      items: isMultiItem && items.length > 0 ? items : undefined,
      isMultiItem,
    };

    return {
      reply,
      intent,
      modelUsed: 'gemini-3.6-flash (deterministic-intent)',
    };
  }
}

export const geminiService = new GeminiService();

