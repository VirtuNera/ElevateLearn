import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMockAuth } from "@/hooks/useMockAuth";
import { MockAuthProvider } from "@/contexts/MockAuthContext";
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
  const { isAuthenticated, isLoading } = useMockAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
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
    <MockAuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router base={basePath}>
            <AppRouter />
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </MockAuthProvider>
  );
}

export default App;
