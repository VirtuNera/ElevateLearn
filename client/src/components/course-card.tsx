import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Course {
  id: string;
  title: string;
  description: string;
  type: 'academic' | 'corporate';
  duration: string;
  category: string;
  imageUrl?: string;
  difficulty?: string;
}

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const enrollMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/enrollments', {
        courseId: course.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Enrolled successfully!",
        description: `You have been enrolled in ${course.title}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Enrollment failed",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  const handleEnroll = () => {
    enrollMutation.mutate();
  };

  const getDefaultImage = () => {
    if (course.type === 'academic') {
      return "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200";
    }
    return "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200";
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <img 
        src={course.imageUrl || getDefaultImage()} 
        alt={course.title}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <div className="flex items-center mb-3">
          <Badge 
            variant={course.type === 'academic' ? 'default' : 'secondary'}
            className={course.type === 'academic' ? 'bg-academic' : 'bg-corporate'}
          >
            {course.type === 'academic' ? 'Academic' : 'Corporate'}
          </Badge>
          <span className="ml-2 text-xs text-on-surface-variant">
            {course.duration}
          </span>
        </div>
        
        <h3 className="font-semibold text-on-surface mb-2">{course.title}</h3>
        <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-on-surface-variant">
            {course.type === 'academic' ? (
              <>
                <Users className="mr-1 h-4 w-4" />
                <span>156 students</span>
              </>
            ) : (
              <>
                <Clock className="mr-1 h-4 w-4" />
                <span>Self-paced</span>
              </>
            )}
          </div>
          <Button 
            onClick={handleEnroll} 
            disabled={enrollMutation.isPending}
            className={course.type === 'corporate' ? 'bg-corporate hover:bg-orange-600' : ''}
          >
            {enrollMutation.isPending ? 'Enrolling...' : course.type === 'academic' ? 'Enroll' : 'Start'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
