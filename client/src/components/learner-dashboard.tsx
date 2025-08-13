import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import CourseCard from "@/components/course-card";
import { 
  Search, 
  BookOpen, 
  Trophy, 
  Medal, 
  Flame, 
  PlayCircle, 
  CheckCircle, 
  Award,
  Code,
  TrendingUp,
  Microscope,
  Palette
} from "lucide-react";

type TabType = 'learning-hub' | 'active-courses' | 'completed' | 'credentials';

export default function LearnerDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('learning-hub');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/courses', searchQuery, typeFilter, levelFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (levelFilter !== 'all') params.append('level', levelFilter);
      
      const response = await fetch(`/api/courses?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
  });

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['/api/enrollments'],
  });

  const { data: certifications = [], isLoading: certificationsLoading } = useQuery({
    queryKey: ['/api/certifications'],
  });

  const activeCourses = enrollments.filter(e => e.status === 'active');
  const completedCourses = enrollments.filter(e => e.status === 'completed');

  const tabs = [
    { id: 'learning-hub', label: 'Learning Hub', icon: Search },
    { id: 'active-courses', label: 'Active Courses', icon: PlayCircle },
    { id: 'completed', label: 'Completed', icon: CheckCircle },
    { id: 'credentials', label: 'Credentials', icon: Award },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface mb-2">Welcome back!</h1>
        <p className="text-on-surface-variant">Continue your learning journey and track your progress.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-on-surface-variant text-sm">Active Courses</p>
                <p className="text-2xl font-bold text-on-surface">{activeCourses.length}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <BookOpen className="text-primary text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-on-surface-variant text-sm">Completed</p>
                <p className="text-2xl font-bold text-on-surface">{completedCourses.length}</p>
              </div>
              <div className="bg-secondary/10 p-3 rounded-lg">
                <Trophy className="text-secondary text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-on-surface-variant text-sm">Certificates</p>
                <p className="text-2xl font-bold text-on-surface">{certifications.length}</p>
              </div>
              <div className="bg-corporate/10 p-3 rounded-lg">
                <Medal className="text-corporate text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-on-surface-variant text-sm">Study Streak</p>
                <p className="text-2xl font-bold text-on-surface">15 days</p>
              </div>
              <div className="bg-yellow-500/10 p-3 rounded-lg">
                <Flame className="text-yellow-500 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Learning Hub Tab */}
      {activeTab === 'learning-hub' && (
        <div className="space-y-8">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant h-4 w-4" />
                  <Input
                    placeholder="Search courses, skills, topics..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Courses */}
          <div>
            <h2 className="text-xl font-semibold text-on-surface mb-4">Recommended for You</h2>
            {coursesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-48 w-full"></div>
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.slice(0, 6).map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>

          {/* Browse by Category */}
          <div>
            <h2 className="text-xl font-semibold text-on-surface mb-4">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Code, name: 'Technology', count: 5, color: 'text-primary' },
                { icon: TrendingUp, name: 'Business', count: 4, color: 'text-secondary' },
                { icon: Microscope, name: 'Science', count: 3, color: 'text-academic' },
                { icon: Palette, name: 'Creative', count: 3, color: 'text-corporate' },
              ].map((category) => {
                const Icon = category.icon;
                return (
                  <Card key={category.name} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Icon className={`text-3xl ${category.color} mb-3 mx-auto`} />
                      <h3 className="font-medium text-on-surface">{category.name}</h3>
                      <p className="text-sm text-on-surface-variant">{category.count} courses</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Active Courses Tab */}
      {activeTab === 'active-courses' && (
        <div className="space-y-6">
          {enrollmentsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="w-32 h-20 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-4"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeCourses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-on-surface mb-2">No active courses</h3>
                <p className="text-on-surface-variant mb-4">Start learning by enrolling in a course</p>
                <Button onClick={() => setActiveTab('learning-hub')}>Browse Courses</Button>
              </CardContent>
            </Card>
          ) : (
            activeCourses.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <img 
                      src={enrollment.course.imageUrl || "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80"} 
                      alt={enrollment.course.title}
                      className="w-full lg:w-32 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Badge variant={enrollment.course.type === 'academic' ? 'default' : 'secondary'}>
                          {enrollment.course.type === 'academic' ? 'Academic' : 'Corporate'}
                        </Badge>
                        <span className="ml-2 text-xs text-on-surface-variant">
                          {enrollment.course.duration}
                        </span>
                      </div>
                      <h3 className="font-semibold text-on-surface mb-1">{enrollment.course.title}</h3>
                      <p className="text-on-surface-variant text-sm mb-3">
                        Next: Continue learning
                      </p>
                      <Progress value={enrollment.progress || 0} className="mb-2" />
                      <p className="text-sm text-on-surface-variant">
                        {enrollment.progress || 0}% complete
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button>Continue</Button>
                      <Button variant="outline">View Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Completed Courses Tab */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {enrollmentsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded mb-2 w-48"></div>
                          <div className="h-3 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : completedCourses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-on-surface mb-2">No completed courses</h3>
                <p className="text-on-surface-variant">Complete your first course to see it here</p>
              </CardContent>
            </Card>
          ) : (
            completedCourses.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-secondary/10 p-3 rounded-lg">
                        <CheckCircle className="text-secondary text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-on-surface">{enrollment.course.title}</h3>
                        <p className="text-on-surface-variant text-sm">
                          Completed {enrollment.completedAt ? new Date(enrollment.completedAt).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline">View Certificate</Button>
                      <Button variant="outline">Review Materials</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Credentials Tab */}
      {activeTab === 'credentials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificationsLoading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : certifications.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-on-surface mb-2">No certificates yet</h3>
                  <p className="text-on-surface-variant">Complete courses to earn certificates</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            certifications.map((cert) => (
              <Card key={cert.id}>
                <CardContent className="p-6 text-center">
                  <div className="bg-corporate/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Award className="text-corporate text-2xl" />
                  </div>
                  <h3 className="font-semibold text-on-surface mb-2">{cert.title}</h3>
                  <p className="text-on-surface-variant text-sm mb-4">
                    Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                    {cert.expiresAt && ` • Valid until: ${new Date(cert.expiresAt).toLocaleDateString()}`}
                  </p>
                  <Button className="w-full">Download Certificate</Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
