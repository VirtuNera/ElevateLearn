import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get the API base URL - use Render URL in production, relative URL in development
const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    // In production, use the Render backend URL
    // Support both VITE_API_URL and VITE_RAILWAY_URL for flexibility
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_RAILWAY_URL;
    if (apiUrl) {
      // Ensure the URL has https:// prefix
      return apiUrl.startsWith('http') ? apiUrl : `https://${apiUrl}`;
    }
    
    // Fallback to Render URL pattern
    return 'https://elevatelearn-backend.onrender.com';
  }
  // In development, use relative URL
  return '';
};

const API_BASE_URL = getApiBaseUrl();

// Debug logging to help identify the correct URL
console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', import.meta.env.MODE);
console.log('API URL from env:', import.meta.env.VITE_API_URL);
console.log('Railway URL from env:', import.meta.env.VITE_RAILWAY_URL);

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Prepend API base URL to relative URLs
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  console.log(`Making ${method} request to: ${fullUrl}`);
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Prepend API base URL to relative URLs
    const url = queryKey.join("/") as string;
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
    console.log(`Making query request to: ${fullUrl}`);
    
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
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
