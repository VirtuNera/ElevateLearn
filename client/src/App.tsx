import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import NuraAILearnerPage from "@/pages/nura-ai-learner";
import NuraAIMentorPage from "@/pages/nura-ai-mentor";
import NuraAIAdminPage from "@/pages/nura-ai-admin";
import CoursePage from "@/pages/course";
import CreateCoursePage from "@/pages/create-course";
import EditCoursePage from "@/pages/edit-course";

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? Dashboard : Landing} />
      {isAuthenticated && (
        <>
          <Route path="/nura-ai/learner" component={NuraAILearnerPage} />
          <Route path="/nura-ai/mentor" component={NuraAIMentorPage} />
          <Route path="/nura-ai/admin" component={NuraAIAdminPage} />
          <Route path="/course/:id" component={CoursePage} />
          <Route path="/create-course" component={CreateCoursePage} />
          <Route path="/edit-course/:id" component={EditCoursePage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Use root base path for Render/GitHub Pages (assets served from '/')
  const basePath = '';
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router base={basePath}>
          <AppRouter />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
