import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { User, GraduationCap, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DemoUser {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface LoginResponse {
  message: string;
  users: DemoUser[];
}

interface DemoLoginProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoLogin({ isOpen, onClose }: DemoLoginProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Debug logging for component lifecycle
  console.log("DemoLogin component rendered, isOpen:", isOpen);
  
  const { data: loginData, error, isLoading } = useQuery<LoginResponse>({
    queryKey: ["demo-login"],
    queryFn: async () => {
      console.log("Fetching demo users...");
      try {
        // Use the apiRequest function from queryClient with relative URL (will be proxied)
        const response = await apiRequest("GET", "/api/login");
        const data = await response.json();
        console.log("Demo users fetched:", data);
        return data;
      } catch (fetchError) {
        console.error("Fetch error details:", fetchError);
        throw fetchError;
      }
    },
    enabled: isOpen,
    retry: false,
  });

  // Debug logging
  console.log("DemoLogin component state:", { isOpen, loginData, error, isLoading });

  const loginMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Use apiRequest function to ensure correct URL handling
      const response = await apiRequest("POST", "/api/login", { userId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Logged in successfully",
        description: "Welcome to Elevate 360 LMS!",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "learner":
        return <User className="h-5 w-5" />;
      case "mentor":
        return <GraduationCap className="h-5 w-5" />;
      case "admin":
        return <Shield className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "learner":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "mentor":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Demo Login</DialogTitle>
          <DialogDescription>
            Choose a demo user to explore the Elevate 360 LMS with different roles and permissions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          {isLoading && (
            <div className="text-center py-4">
              <p>Loading demo users...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-4 text-red-600">
              <p>Error loading demo users: {error.message}</p>
            </div>
          )}
          
          {loginData?.users?.map((user: DemoUser) => (
            <Card
              key={user.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => loginMutation.mutate(user.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(user.role)}
                    <CardTitle className="text-sm">{user.name}</CardTitle>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-xs">
                  {user.email}</CardDescription>
              </CardContent>
            </Card>
          ))}
          
          {loginData?.users && loginData.users.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <p>No demo users available</p>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loginMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}