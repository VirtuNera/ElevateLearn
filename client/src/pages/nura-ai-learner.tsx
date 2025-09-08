import { useMockAuth } from "@/hooks/useMockAuth";
import Navigation from "@/components/navigation";
import LearnerNuraAI from "@/components/learner-nura-ai";

export default function NuraAILearnerPage() {
  const { isAuthenticated, isLoading, user } = useMockAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Loading Nura AI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <LearnerNuraAI />
      </div>
    </div>
  );
}
