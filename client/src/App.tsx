import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import LearnerNuraAI from "@/components/learner-nura-ai";
import MentorNuraAI from "@/components/mentor-nura-ai";
import AdminNuraAI from "@/components/admin-nura-ai";
import CoursePage from "@/pages/course";
import CreateCoursePage from "@/pages/create-course";
import EditCoursePage from "@/pages/edit-course";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/nura-ai/learner" component={LearnerNuraAI} />
          <Route path="/nura-ai/mentor" component={MentorNuraAI} />
          <Route path="/nura-ai/admin" component={AdminNuraAI} />
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
