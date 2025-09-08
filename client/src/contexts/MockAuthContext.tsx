import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

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

interface MockAuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: any;
  switchUser: (role: string) => void;
  logout: () => void;
  demoUsers: typeof DEMO_USERS;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if user wants to access dashboard directly
    const storedRole = localStorage.getItem('mockUserRole');
    const defaultUser = storedRole 
      ? DEMO_USERS.find(user => user.role === storedRole) 
      : DEMO_USERS.find(user => user.role === "learner") || DEMO_USERS[0];

    // Simulate loading time
    const timer = setTimeout(() => {
      setCurrentUser(defaultUser);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const switchUser = (role: string) => {
    const user = DEMO_USERS.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('mockUserRole', role);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    // Redirect to landing page
    setLocation("/");
  };

  const value = {
    user: currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    error: null,
    switchUser,
    logout,
    demoUsers: DEMO_USERS,
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
}
