import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import LearnerDashboard from "@/components/learner-dashboard";
import MentorDashboard from "@/components/mentor-dashboard";
import AdminDashboard from "@/components/admin-dashboard";
import Navigation from "@/components/navigation";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const renderDashboard = () => {
    switch (user?.role) {
      case 'learner':
        return <LearnerDashboard />;
      case 'mentor':
        return <MentorDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <LearnerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navigation />
      {renderDashboard()}
    </div>
  );
}
