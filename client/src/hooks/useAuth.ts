import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    // Return null instead of throwing on 401
    queryFn: async ({ queryKey }) => {
      try {
        const url = queryKey.join("/") as string;
        const fullUrl = url.startsWith('http') ? url : `${import.meta.env.PROD ? 'https://elevatelearn-production.up.railway.app' : ''}${url}`;
        
        console.log('Auth check URL:', fullUrl);
        
        const res = await fetch(fullUrl, {
          credentials: "include",
        });

        if (res.status === 401) {
          console.log('User not authenticated (401)');
          return null;
        }

        if (!res.ok) {
          throw new Error(`Auth check failed: ${res.status}`);
        }

        return await res.json();
      } catch (error) {
        console.error('Auth check error:', error);
        return null;
      }
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
