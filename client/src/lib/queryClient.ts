import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  body?: unknown,
  headers?: Record<string, string>
): Promise<any> {
  try {
    // Handle case where all parameters are passed as a single object (common mistake)
    if (typeof method === 'object' && method !== null) {
      const obj = method as any;
      if (obj.method && obj.url) {
        return apiRequest(obj.method, obj.url, obj.body, obj.headers);
      } else if (obj.method && !obj.url && typeof url === 'object') {
        const urlObj = url as any;
        return apiRequest(obj.method, urlObj.url || '/api/invitations', obj.body || urlObj, obj.headers);
      }
    }
    
    // Type validation
    if (typeof method !== 'string' || method === null || method === undefined) {
      method = 'POST';
    }
    
    if (typeof url !== 'string' || url === null || url === undefined) {
      throw new Error('Invalid URL provided to apiRequest');
    }
    
    // Ensure method is a valid string
    let validMethod = method.toString().trim();
    let validUrl = url.toString().trim();
    
    // Parameter order safety check
    if (validMethod.startsWith('/') || validMethod.startsWith('http')) {
      [validMethod, validUrl] = [validUrl, validMethod];
    }
    
    // Final validation for HTTP methods
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    if (!allowedMethods.includes(validMethod.toUpperCase())) {
      validMethod = 'POST';
    }
    
    // Check if body is FormData to handle file uploads correctly
    const isFormData = body instanceof FormData;
    
    const fetchOptions: RequestInit = {
      method: validMethod.toUpperCase(),
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Referer": window.location.origin,
        ...(headers || {}),
      },
      credentials: "include",
    };

    // For FormData, don't set Content-Type (let browser handle it with boundary)
    // For other data, use JSON
    if (isFormData) {
      fetchOptions.body = body as FormData;
    } else {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        "Content-Type": "application/json",
      };
      fetchOptions.body = body ? JSON.stringify(body) : undefined;
    }

    const res = await fetch(validUrl, fetchOptions);
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`${res.status}: ${errorText || res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    let url = queryKey[0] as string;
    
    // Handle conversation messages URLs: ["/api/conversations", conversationId, "messages"]
    if (queryKey.length === 3 && queryKey[2] === "messages") {
      const conversationId = queryKey[1];
      url = `/api/conversations/${conversationId}/messages`;
    }
    // Handle search queries with parameters
    else if (queryKey.length > 1 && url.includes('/search')) {
      const searchTerm = queryKey[1] as string;
      url += `?q=${encodeURIComponent(searchTerm)}`;
    }
    
    // Force all API calls to use relative URLs (no external domains)
    // This prevents SSL errors from hardcoded external URLs
    const fullUrl = url.startsWith('/') ? url : `/${url}`;
    console.log("API Request URL:", fullUrl);
    
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes cache for performance
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors or client errors
        if (error?.message?.includes('401') || error?.message?.includes('40')) {
          return false;
        }
        return failureCount < 2; // Allow more retries for network issues
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
      networkMode: 'online',
    },
  },
});
