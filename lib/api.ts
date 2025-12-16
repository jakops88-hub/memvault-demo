// API service for backend communication

// Ensure we have a valid backend URL without trailing slash
const API_BASE_URL = (() => {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  if (!url) {
    console.warn('⚠️ NEXT_PUBLIC_BACKEND_URL is not set! Using localhost:4000');
    return 'http://localhost:4000';
  }
  return url.replace(/\/$/, '');
})();

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Get user's API key from localStorage
function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') {
    return { 'Content-Type': 'application/json' };
  }

  const apiKey = localStorage.getItem('memvault_api_key');
  
  if (!apiKey) {
    console.warn('⚠️ No API key found in localStorage');
  }
  
  return {
    'Content-Type': 'application/json',
    ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
  };
}

// Get current user ID from localStorage
function getCurrentUserId(): string {
  if (typeof window === 'undefined') {
    return 'demo-user';
  }

  const storedUser = localStorage.getItem('memvault_user');
  if (storedUser) {
    try {
      return JSON.parse(storedUser).id;
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e);
    }
  }
  return 'demo-user';
}

// Billing API
export const billingApi = {
  async getBalance(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/billing/balance/${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch balance');
    return response.json();
  },

  async addCredits(userId: string, amount: number) {
    const response = await fetch(`${API_BASE_URL}/api/billing/add-credits`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, amount }),
    });
    if (!response.ok) throw new Error('Failed to add credits');
    return response.json();
  },

  async createPortalSession() {
    const response = await fetch(`${API_BASE_URL}/api/stripe/create-portal-session`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to create portal session');
    return response.json();
  },

  async createCheckoutSession(priceId: string) {
    const response = await fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ priceId }),
    });
    if (!response.ok) throw new Error('Failed to create checkout session');
    return response.json();
  },
};

// Memory API
export const memoryApi = {
  async addMemory(userId: string, text: string, metadata?: Record<string, unknown>) {
    const response = await fetch(`${API_BASE_URL}/api/memory/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, text, metadata }),
    });
    if (!response.ok) throw new Error('Failed to add memory');
    return response.json();
  },

  async getJobStatus(jobId: string) {
    const response = await fetch(`${API_BASE_URL}/api/memory/job/${jobId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get job status');
    return response.json();
  },

  async searchMemories(userId: string, query: string, limit = 10) {
    const response = await fetch(`${API_BASE_URL}/api/memory/search`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ sessionId: userId, query, limit }),
    });
    if (!response.ok) throw new Error('Failed to search memories');
    return response.json();
  },
};

// GraphRAG API
export const graphRAGApi = {
  async retrieve(userId: string, query: string, maxMemories = 10) {
    const response = await fetch(`${API_BASE_URL}/api/graphrag/retrieve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, query, maxMemories }),
    });
    if (!response.ok) throw new Error('Failed to retrieve with GraphRAG');
    return response.json();
  },
};

// User API (for stats)
export const userApi = {
  // Get comprehensive user stats
  async getStats() {
    const userId = getCurrentUserId();
    try {
      const balance = await billingApi.getBalance(userId);
      
      return {
        userId,
        creditsUsed: balance.balance < 100000 ? 100000 - balance.balance : 0,
        creditsLimit: 100000,
        creditsBalance: balance.balance,
        tier: balance.tier || 'HOBBY',
        // These would ideally come from dedicated endpoints
        totalMemories: 1284, // Mock for now
        storageUsed: 2.4, // GB - Mock for now
      };
    } catch (error) {
      console.error('Failed to get user stats:', error);
      // Return mock data if API fails
      return {
        userId,
        creditsUsed: 45231,
        creditsLimit: 100000,
        creditsBalance: 54769,
        tier: 'HOBBY' as const,
        totalMemories: 1284,
        storageUsed: 2.4,
      };
    }
  },

  // Get user's API keys
  async getApiKeys() {
    // TODO: Replace with real API call when backend endpoint is ready
    // const response = await fetch(`${API_BASE_URL}/api/user/api-keys`, {
    //   headers: getAuthHeaders(),
    // });
    // if (!response.ok) throw new Error('Failed to fetch API keys');
    // return response.json();

    // TEMPORARY: Return mock data with current user's API key
    const apiKey = typeof window !== 'undefined' ? localStorage.getItem('memvault_api_key') : null;
    
    if (!apiKey) {
      return { apiKeys: [] };
    }

    return {
      apiKeys: [
        {
          id: '1',
          key: apiKey,
          name: 'Production Key',
          createdAt: new Date().toISOString(),
          lastUsedAt: new Date().toISOString(),
        }
      ]
    };
  },

  // Delete an API key
  async deleteApiKey(keyId: string) {
    // TODO: Replace with real API call when backend endpoint is ready
    // const response = await fetch(`${API_BASE_URL}/api/user/api-keys/${keyId}`, {
    //   method: 'DELETE',
    //   headers: getAuthHeaders(),
    // });
    // if (!response.ok) throw new Error('Failed to delete API key');
    // return response.json();

    // TEMPORARY: Mock deletion (just return success)
    console.log('Mock: Deleting API key', keyId);
    return { success: true };
  },
};
