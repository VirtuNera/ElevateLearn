import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Calendar, 
  CheckCircle, 
  PlayCircle,
  FileText,
  Award,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

// Dummy course data with modules
const createDummyCourseData = (courseId: string) => ({
  id: courseId,
  title: courseId === 'course-creative-3' ? 'Creative Writing Masterclass' : 
         courseId === 'course-web-dev-1' ? 'Full Stack Web Development' : 
         courseId === 'course-data-sci-2' ? 'Data Science Fundamentals' : 'Course Title',
  description: courseId === 'course-creative-3' ? 
    'Master the art of creative writing with hands-on exercises, expert feedback, and proven techniques used by published authors. This comprehensive course covers fiction, non-fiction, poetry, and screenplay writing.' :
    courseId === 'course-web-dev-1' ? 
    'Learn modern web development from scratch. Build real-world applications using React, Node.js, and popular frameworks while mastering best practices and industry standards.' :
    courseId === 'course-data-sci-2' ? 
    'Dive into data science with Python, machine learning algorithms, data visualization, and statistical analysis. Work with real datasets to solve practical problems.' :
    'Course description placeholder',
  instructor: {
    name: courseId === 'course-creative-3' ? 'Sarah Mitchell' :
          courseId === 'course-web-dev-1' ? 'Alex Chen' :
          courseId === 'course-data-sci-2' ? 'Dr. Maria Rodriguez' : 'Instructor Name',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: courseId === 'course-creative-3' ? 'Published author of 3 novels and former editor at major publishing house' :
         courseId === 'course-web-dev-1' ? 'Senior Software Engineer with 8+ years at Google and startup experience' :
         courseId === 'course-data-sci-2' ? 'PhD in Statistics, former Netflix data scientist' : 'Instructor bio',
    rating: 4.8
  },
  type: courseId === 'course-creative-3' ? 'academic' : 'corporate',
  duration: courseId === 'course-creative-3' ? '12 weeks' : 
            courseId === 'course-web-dev-1' ? '16 weeks' :
            courseId === 'course-data-sci-2' ? '14 weeks' : '8 weeks',
  difficulty: courseId === 'course-creative-3' ? 'Intermediate' :
              courseId === 'course-web-dev-1' ? 'Beginner to Advanced' :
              courseId === 'course-data-sci-2' ? 'Intermediate' : 'Beginner',
  category: courseId === 'course-creative-3' ? 'Creative Arts' :
            courseId === 'course-web-dev-1' ? 'Technology' :
            courseId === 'course-data-sci-2' ? 'Data Science' : 'General',
  imageUrl: courseId === 'course-creative-3' ? 
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400' :
    courseId === 'course-web-dev-1' ? 
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400' :
    courseId === 'course-data-sci-2' ? 
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400' :
    'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
  progress: courseId === 'course-creative-3' ? 35 : 
            courseId === 'course-web-dev-1' ? 60 :
            courseId === 'course-data-sci-2' ? 20 : 0,
  totalModules: courseId === 'course-creative-3' ? 8 :
                courseId === 'course-web-dev-1' ? 12 :
                courseId === 'course-data-sci-2' ? 10 : 6,
  completedModules: courseId === 'course-creative-3' ? 3 :
                    courseId === 'course-web-dev-1' ? 7 :
                    courseId === 'course-data-sci-2' ? 2 : 0,
  enrollmentDate: '2024-01-15',
  nextAssignment: courseId === 'course-creative-3' ? 'Character Development Exercise' :
                  courseId === 'course-web-dev-1' ? 'Build a React Component' :
                  courseId === 'course-data-sci-2' ? 'Data Cleaning Project' : null,
  modules: courseId === 'course-creative-3' ? [
    {
      id: 'mod1',
      title: 'Finding Your Voice',
      description: 'Discover your unique writing style and voice',
      duration: '2 hours',
      completed: true,
      lessons: [
        { title: 'Understanding Writing Voice', duration: '25 min', completed: true },
        { title: 'Style Analysis Exercise', duration: '35 min', completed: true },
        { title: 'Voice Development Techniques', duration: '30 min', completed: true },
        { title: 'Practice: Write in Different Voices', duration: '30 min', completed: true }
      ]
    },
    {
      id: 'mod2',
      title: 'Character Creation',
      description: 'Build compelling, three-dimensional characters',
      duration: '2.5 hours',
      completed: true,
      lessons: [
        { title: 'Character Archetypes', duration: '30 min', completed: true },
        { title: 'Backstory Development', duration: '40 min', completed: true },
        { title: 'Character Motivation', duration: '35 min', completed: true },
        { title: 'Dialogue and Voice', duration: '35 min', completed: true }
      ]
    },
    {
      id: 'mod3',
      title: 'Plot Structure',
      description: 'Master story structure and pacing',
      duration: '3 hours',
      completed: true,
      lessons: [
        { title: 'Three-Act Structure', duration: '45 min', completed: true },
        { title: 'Plot Points and Turning Points', duration: '40 min', completed: true },
        { title: 'Subplots and Parallel Stories', duration: '50 min', completed: false },
        { title: 'Pacing Techniques', duration: '45 min', completed: false }
      ]
    },
    {
      id: 'mod4',
      title: 'Show vs Tell',
      description: 'Learn to show rather than tell your story',
      duration: '2 hours',
      completed: false,
      current: true,
      lessons: [
        { title: 'Understanding Show vs Tell', duration: '30 min', completed: false },
        { title: 'Sensory Details', duration: '35 min', completed: false },
        { title: 'Action and Dialogue', duration: '25 min', completed: false },
        { title: 'Practice Exercises', duration: '30 min', completed: false }
      ]
    }
  ] : courseId === 'course-web-dev-1' ? [
    {
      id: 'mod1',
      title: 'HTML & CSS Fundamentals',
      description: 'Build responsive web layouts',
      duration: '3 hours',
      completed: true,
      lessons: [
        { title: 'HTML Structure', duration: '45 min', completed: true },
        { title: 'CSS Styling', duration: '60 min', completed: true },
        { title: 'Flexbox & Grid', duration: '45 min', completed: true },
        { title: 'Responsive Design', duration: '30 min', completed: true }
      ]
    },
    {
      id: 'mod2',
      title: 'JavaScript Essentials',
      description: 'Master modern JavaScript concepts',
      duration: '4 hours',
      completed: true,
      lessons: [
        { title: 'Variables & Functions', duration: '60 min', completed: true },
        { title: 'DOM Manipulation', duration: '50 min', completed: true },
        { title: 'Async Programming', duration: '70 min', completed: true },
        { title: 'ES6+ Features', duration: '40 min', completed: true }
      ]
    },
    {
      id: 'mod3',
      title: 'React Fundamentals',
      description: 'Build dynamic user interfaces',
      duration: '5 hours',
      completed: false,
      current: true,
      lessons: [
        { title: 'Components & JSX', duration: '60 min', completed: true },
        { title: 'Props & State', duration: '70 min', completed: true },
        { title: 'Event Handling', duration: '45 min', completed: false },
        { title: 'Hooks Deep Dive', duration: '105 min', completed: false }
      ]
    }
  ] : [
    {
      id: 'mod1',
      title: 'Introduction to Data Science',
      description: 'Overview of data science workflow',
      duration: '2 hours',
      completed: true,
      lessons: [
        { title: 'What is Data Science?', duration: '30 min', completed: true },
        { title: 'Tools and Technologies', duration: '40 min', completed: true },
        { title: 'Data Science Pipeline', duration: '30 min', completed: true },
        { title: 'Setting Up Your Environment', duration: '20 min', completed: true }
      ]
    },
    {
      id: 'mod2',
      title: 'Python for Data Science',
      description: 'Essential Python libraries and concepts',
      duration: '4 hours',
      completed: true,
      lessons: [
        { title: 'NumPy Basics', duration: '60 min', completed: true },
        { title: 'Pandas DataFrames', duration: '80 min', completed: true },
        { title: 'Matplotlib Visualization', duration: '60 min', completed: true },
        { title: 'Jupyter Notebooks', duration: '40 min', completed: true }
      ]
    },
    {
      id: 'mod3',
      title: 'Data Cleaning & Preprocessing',
      description: 'Prepare data for analysis',
      duration: '3.5 hours',
      completed: false,
      current: true,
      lessons: [
        { title: 'Handling Missing Data', duration: '50 min', completed: false },
        { title: 'Data Types & Conversion', duration: '40 min', completed: false },
        { title: 'Outlier Detection', duration: '45 min', completed: false },
        { title: 'Feature Engineering', duration: '55 min', completed: false }
      ]
    }
  ]
});

export default function CoursePage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [, params] = useRoute('/course/:id');
  const courseId = params?.id;

  // Get course data (using dummy data for now)
  const { data: course, isLoading } = useQuery({
    queryKey: ['/api/courses', courseId],
    queryFn: async () => {
      // For now, return dummy data based on courseId
      return createDummyCourseData(courseId!);
    },
    enabled: !!courseId
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-on-surface mb-4">Course Not Found</h1>
          <p className="text-on-surface-variant mb-6">The course you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentModule = course.modules.find(m => m.current) || course.modules.find(m => !m.completed);
  
  return (
    <div className="min-h-screen bg-surface">
      <Navigation />
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            
            <div className="flex items-center gap-3">
              <Badge variant={course.type === 'academic' ? 'default' : 'secondary'}>
                {course.type === 'academic' ? 'Academic' : 'Corporate'}
              </Badge>
              <Badge variant="outline">{course.difficulty}</Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-on-surface mb-4">{course.title}</h1>
              <p className="text-on-surface-variant text-lg mb-6">{course.description}</p>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-on-surface-variant" />
                  <span className="text-sm text-on-surface-variant">{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-on-surface-variant" />
                  <span className="text-sm text-on-surface-variant">{course.totalModules} modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-on-surface-variant" />
                  <span className="text-sm text-on-surface-variant">{course.category}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-on-surface">Course Progress</span>
                  <span className="text-sm text-on-surface-variant">{course.progress}% complete</span>
                </div>
                <Progress value={course.progress} className="mb-2" />
                <p className="text-sm text-on-surface-variant">
                  {course.completedModules} of {course.totalModules} modules completed
                </p>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <img 
                src={course.imageUrl} 
                alt={course.title}
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              
              {/* Instructor Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={course.instructor.avatar} />
                      <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-on-surface">{course.instructor.name}</h3>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-yellow-500">★</span>
                        <span className="text-sm text-on-surface-variant">{course.instructor.rating}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant">{course.instructor.bio}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="curriculum" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="curriculum" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Module - Featured */}
              {currentModule && (
                <div className="lg:col-span-2 mb-6">
                  <h2 className="text-xl font-semibold text-on-surface mb-4">Continue Learning</h2>
                  <Card className="border-primary bg-primary/5">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="default">Current Module</Badge>
                        <span className="text-sm text-on-surface-variant">{currentModule.duration}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-on-surface mb-2">{currentModule.title}</h3>
                      <p className="text-on-surface-variant mb-4">{currentModule.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-on-surface-variant">
                          {currentModule.lessons.filter(l => l.completed).length} of {currentModule.lessons.length} lessons completed
                        </div>
                        <Button>
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Continue Learning
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* All Modules */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-on-surface mb-4">All Modules</h2>
                <div className="space-y-4">
                  {course.modules.map((module, index) => (
                    <Card key={module.id} className={module.current ? 'border-primary' : ''}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {module.completed ? (
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : module.current ? (
                              <PlayCircle className="w-6 h-6 text-primary" />
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                            )}
                            <div>
                              <h3 className="font-semibold text-on-surface">
                                Module {index + 1}: {module.title}
                              </h3>
                              <p className="text-sm text-on-surface-variant">{module.description}</p>
                            </div>
                          </div>
                          <span className="text-sm text-on-surface-variant">{module.duration}</span>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="space-y-2">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div key={lessonIndex} className="flex items-center justify-between py-2">
                              <div className="flex items-center gap-3">
                                {lesson.completed ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-gray-300" />
                                )}
                                <span className="text-sm text-on-surface">{lesson.title}</span>
                              </div>
                              <span className="text-xs text-on-surface-variant">{lesson.duration}</span>
                            </div>
                          ))}
                        </div>
                        
                        {!module.completed && (
                          <div className="mt-4">
                            <Button variant={module.current ? 'default' : 'outline'} className="w-full">
                              {module.current ? 'Continue Module' : 'Start Module'}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="assignments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {course.nextAssignment ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <h3 className="font-medium text-on-surface">{course.nextAssignment}</h3>
                          <p className="text-sm text-on-surface-variant">Due in 5 days</p>
                        </div>
                      </div>
                      <Button variant="outline">View Assignment</Button>
                    </div>
                    <p className="text-sm text-on-surface-variant mt-4">
                      Complete your current module to unlock more assignments.
                    </p>
                  </div>
                ) : (
                  <p className="text-on-surface-variant">No upcoming assignments at this time.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resources" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Course Materials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-on-surface">Course Syllabus</span>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-on-surface">Reading List</span>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-on-surface">Templates & Worksheets</span>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Your Achievement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-medium text-on-surface mb-2">Course Certificate</h3>
                    <p className="text-sm text-on-surface-variant mb-4">
                      Complete all modules to earn your certificate
                    </p>
                    <Progress value={course.progress} className="mb-2" />
                    <p className="text-xs text-on-surface-variant">
                      {100 - course.progress}% remaining
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}