import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options?: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  }
): Promise<any> {
  const { method = 'GET', body, headers = {} } = options || {};
  
  console.log(`Making ${method} request to ${url}`, body ? body : '');
  
  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    console.log(`Response: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API Error: ${res.status} - ${errorText}`);
      throw new Error(`${res.status}: ${errorText || res.statusText}`);
    }
    
    const result = await res.json();
    console.log('Response data:', result);
    return result;
  } catch (error) {
    console.error(`Request failed:`, error);
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
    
    // Ensure URL is absolute
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    
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
