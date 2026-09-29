import { ApiResponse, HealthCheckData, ChatMessage, ShoppingIntent } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ChatApiResponseData {
  reply: string;
  intent?: ShoppingIntent;
  modelUsed: string;
}

export interface ChatApiResult {
  success: boolean;
  reply: string;
  intent?: ShoppingIntent;
  error?: string;
  isMockFallback?: boolean;
}

/**
 * Perform health-check request to backend API
 */
export async function checkBackendHealth(): Promise<{
  connected: boolean;
  data: HealthCheckData | null;
  error: string | null;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const json: ApiResponse<HealthCheckData> = await response.json();
    if (json.success && json.data) {
      return { connected: true, data: json.data, error: null };
    }

    throw new Error(json.error || 'Invalid health check payload');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to reach OptiCart backend';
    return { connected: false, data: null, error: message };
  }
}

/**
 * Send user shopping request, conversation history, and previous intent to backend /api/chat
 */
export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = [],
  budget?: string,
  previousIntent?: ShoppingIntent
): Promise<ChatApiResult> {
  try {
    const conversationHistory = history.map((msg) => ({
      role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
      content: msg.text,
    }));

    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory,
        budget,
        previousIntent,
      }),
    });

    const data: ApiResponse<ChatApiResponseData> = await response.json();

    if (!response.ok || !data.success) {
      const errorMsg = data.error || `Server responded with status ${response.status}`;
      return {
        success: false,
        reply: errorMsg,
        error: errorMsg,
      };
    }

    return {
      success: true,
      reply: data.data?.reply || 'I received your shopping request. How else can I assist you?',
      intent: data.data?.intent,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error communicating with OptiCart backend';
    return {
      success: false,
      reply: message,
      error: message,
    };
  }
}

/**
 * Discover normalized products matching a structured ShoppingIntent
 */
export async function discoverProducts(
  intent: ShoppingIntent,
  options?: { limit?: number; offset?: number; includeOutOfStock?: boolean }
): Promise<ApiResponse<import('../types').DiscoveryResult>> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/discover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ intent, options }),
    });

    return await response.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to discover products';
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Search products by keyword query / category
 */
export async function searchProducts(
  query: string,
  category?: string,
  filters?: { minPrice?: number; maxPrice?: number; preferredBrands?: string[]; excludedBrands?: string[] }
): Promise<ApiResponse<import('../types').DiscoveryResult>> {
  try {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);
    if (filters?.minPrice) params.append('minPrice', String(filters.minPrice));
    if (filters?.maxPrice) params.append('maxPrice', String(filters.maxPrice));
    if (filters?.preferredBrands?.length) params.append('preferredBrands', filters.preferredBrands.join(','));
    if (filters?.excludedBrands?.length) params.append('excludedBrands', filters.excludedBrands.join(','));

    const response = await fetch(`${API_BASE_URL}/products/search?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    return await response.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to search products';
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Generate 3 purchase strategies using the Purchase Optimization Engine
 */
export async function optimizePurchase(
  intent: ShoppingIntent,
  candidateProducts?: import('../types').NormalizedProduct[]
): Promise<ApiResponse<import('../types').OptimizationResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ intent, candidateProducts }),
    });

    return await response.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate purchase optimization';
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

