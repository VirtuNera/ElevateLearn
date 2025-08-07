import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  MessageSquare
} from "lucide-react";

export default function MentorDashboard() {
  const [activeView, setActiveView] = useState<'overview' | 'courses' | 'students' | 'assignments'>('overview');

  const { data: mentorCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/mentor/courses'],
  });

  const totalStudents = mentorCourses.reduce((sum, course) => sum + (course.enrolledCount || 0), 0);
  const activeCourses = mentorCourses.filter(course => course.isActive).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">Mentor Dashboard</h1>
          <p className="text-on-surface-variant">Manage your courses, students, and teaching materials.</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Course</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-on-surface-variant text-sm">Total Courses</p>
                <p className="text-2xl font-bold text-on-surface">{mentorCourses.length}</p>
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
                <p className="text-on-surface-variant text-sm">Active Courses</p>
                <p className="text-2xl font-bold text-on-surface">{activeCourses}</p>
              </div>
              <div className="bg-secondary/10 p-3 rounded-lg">
                <GraduationCap className="text-secondary text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-on-surface-variant text-sm">Total Students</p>
                <p className="text-2xl font-bold text-on-surface">{totalStudents}</p>
              </div>
              <div className="bg-academic/10 p-3 rounded-lg">
                <Users className="text-academic text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-on-surface-variant text-sm">Pending Reviews</p>
                <p className="text-2xl font-bold text-on-surface">12</p>
              </div>
              <div className="bg-corporate/10 p-3 rounded-lg">
                <Clock className="text-corporate text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BookOpen },
            { id: 'courses', label: 'My Courses', icon: GraduationCap },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'assignments', label: 'Assignments', icon: CheckCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeView === tab.id
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

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <div className="space-y-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New message from student</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Assignment submitted</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Users className="h-5 w-5 text-academic" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New student enrolled</p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
                  <Plus className="h-5 w-5" />
                  <span className="text-sm">Create Course</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm">Schedule Class</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">Grade Assignments</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-sm">Send Message</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Courses Tab */}
      {activeView === 'courses' && (
        <div className="space-y-6">
          {coursesLoading ? (
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded mb-4 w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : mentorCourses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-on-surface mb-2">No courses yet</h3>
                <p className="text-on-surface-variant mb-4">Create your first course to start teaching</p>
                <Button>Create Course</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {mentorCourses.map((course) => (
                <Card key={course.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Badge variant={course.type === 'academic' ? 'default' : 'secondary'}>
                            {course.type === 'academic' ? 'Academic' : 'Corporate'}
                          </Badge>
                          <span className="ml-2 text-sm text-muted-foreground">
                            {course.duration}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-on-surface mb-1">{course.title}</h3>
                        <p className="text-on-surface-variant mb-4">{course.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {course.enrolledCount || 0} students
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Created {new Date(course.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button size="sm">View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeView === 'students' && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-on-surface mb-2">Student Management</h3>
            <p className="text-on-surface-variant">Manage your students, track progress, and provide feedback</p>
          </CardContent>
        </Card>
      )}

      {/* Assignments Tab */}
      {activeView === 'assignments' && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-on-surface mb-2">Assignment Management</h3>
            <p className="text-on-surface-variant">Create, manage, and grade assignments for your courses</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
