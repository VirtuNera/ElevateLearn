import { useState, useEffect } from "react";

// Mock demo users
const DEMO_USERS = [
  {
    id: "demo-learner-1",
    name: "Alex Johnson",
    email: "alex.johnson@demo.com",
    role: "learner",
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-mentor-1", 
    name: "Dr. Sarah Chen",
    email: "sarah.chen@demo.com",
    role: "mentor",
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-admin-1",
    name: "Michael Rodriguez",
    email: "michael.rodriguez@demo.com", 
    role: "admin",
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function useMockAuth() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      // Default to learner role for demo
      const defaultUser = DEMO_USERS.find(user => user.role === "learner") || DEMO_USERS[0];
      setCurrentUser(defaultUser);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const switchUser = (role: string) => {
    const user = DEMO_USERS.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    // Redirect to landing page
    window.location.href = "/";
  };

  return {
    user: currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    error: null,
    switchUser,
    logout,
    demoUsers: DEMO_USERS,
  };
}
