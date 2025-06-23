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
  
  const res = await fetch(url, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      "X-Requested-With": "XMLHttpRequest",
      "Referer": window.location.href,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json();
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
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 0, // Always fresh queries for auth reliability
      gcTime: 0, // No caching for immediate auth state updates
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors or client errors
        if (error?.message?.includes('401') || error?.message?.includes('40')) {
          return false;
        }
        return failureCount < 1; // Single retry for performance
      },
      retryDelay: (attemptIndex) => Math.min(750 * 2 ** attemptIndex, 3000), // Faster retries
      networkMode: 'online', // Only fetch when online
    },
    mutations: {
      retry: 1, // Single retry for mutations
      retryDelay: 1000,
      networkMode: 'online',
      onError: (error) => {
        console.warn('Mutation error handled:', error);
      },
    },
  },
});
