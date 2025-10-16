import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function useAuth() {
  const queryClient = useQueryClient();
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    // Return null instead of throwing on 401
    queryFn: async ({ queryKey }) => {
      try {
        const url = queryKey.join("/") as string;
        const fullUrl = url.startsWith('http') ? url : `${import.meta.env.PROD ? 'https://elevatelearn.onrender.com' : ''}${url}`;
        
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

  const logout = async () => {
    try {
      const fullUrl = `${import.meta.env.PROD ? 'https://elevatelearn.onrender.com' : ''}/api/auth/logout`;
      await fetch(fullUrl, {
        method: 'POST',
        credentials: "include",
      });
      // Clear the query cache to force re-fetch
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Force reload anyway
      window.location.reload();
    }
  };

  // Role switching functionality for demo purposes
  const switchRole = (role: string) => {
    if (!user) return;
    
    // Create a modified user object with the new role
    const modifiedUser = {
      ...user,
      role: role
    };
    
    // Update the current role state
    setCurrentRole(role);
    
    // Update the query cache with the modified user
    queryClient.setQueryData(["/api/auth/user"], modifiedUser);
    
    console.log(`Switched to ${role} role`);
  };

  // Use the current role if set, otherwise use the user's role
  const effectiveUser = currentRole && user ? { ...user, role: currentRole } : user;

  return {
    user: effectiveUser,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout,
    switchRole,
  };
}
