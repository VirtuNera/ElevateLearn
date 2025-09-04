import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  MessageSquare,
  Mail,
  Eye,
  FileText,
  Award,
  Star,
  ArrowUpDown,
  Filter,
  Search,
  MoreHorizontal,
  Edit,
  Trash,
  Sparkles,
  TrendingUp
} from "lucide-react";

export default function MentorDashboard() {
  const [activeView, setActiveView] = useState<'overview' | 'courses' | 'students' | 'assignments'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: mentorCourses = [], isLoading: coursesLoading } = useQuery<any[]>({
    queryKey: ['/api/mentor/courses'],
  });

  const { data: mentorStudents = [], isLoading: studentsLoading } = useQuery<any[]>({
    queryKey: ['/api/mentor/students'],
  });

  const { data: mentorAssignments = [], isLoading: assignmentsLoading } = useQuery<any[]>({
    queryKey: ['/api/mentor/assignments'],
  });

  const totalStudents = mentorCourses.reduce((sum: number, course: any) => sum + (course.enrolledCount || 0), 0);
  const activeCourses = mentorCourses.filter((course: any) => course.isActive).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">Mentor Dashboard</h1>
          <p className="text-on-surface-variant">Manage your courses, students, and teaching materials.</p>
        </div>
        <Button 
          className="flex items-center space-x-2"
          onClick={() => window.location.href = '/create-course'}
        >
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
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center space-y-2"
                  onClick={() => window.location.href = '/create-course'}
                >
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
                <Button onClick={() => window.location.href = '/create-course'}>Create Course</Button>
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/edit-course/${course.id}`}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => window.location.href = `/course/${course.id}`}
                        >
                          View Details
                        </Button>
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
        <div className="space-y-6">
          {/* Students Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-on-surface">Student Management</h2>
              <p className="text-on-surface-variant">Track your students' progress and manage enrollments</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>
          </div>

          {/* Students Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-xl font-bold">{mentorStudents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-xl font-bold">
                      {mentorStudents.filter(s => s.enrollments.some((e: any) => e.status === 'active')).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-xl font-bold">{mentorStudents.filter(s => s.enrollments.some((e: any) => e.progress > 0 && e.progress < 100)).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-xl font-bold">{mentorStudents.filter(s => s.enrollments.some((e: any) => e.status === 'completed')).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 animate-pulse">
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : mentorStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-on-surface mb-2">No students yet</h3>
                  <p className="text-on-surface-variant mb-4">Students will appear here when they enroll in your courses</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Enrolled Courses</TableHead>
                      <TableHead>Overall Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mentorStudents
                      .filter(student => 
                        !searchTerm || 
                        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((student) => {
                        const avgProgress = student.enrollments.length > 0 
                          ? student.enrollments.reduce((sum: any, e: any) => sum + (e.progress || 0), 0) / student.enrollments.length
                          : 0;
                        const hasActiveEnrollments = student.enrollments.some((e: any) => e.status === 'active');
                        
                        return (
                          <TableRow key={student.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarImage src={student.profileImageUrl || ''} />
                                  <AvatarFallback>
                                    {student.firstName?.[0]}{student.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{student.firstName} {student.lastName}</p>
                                  <p className="text-sm text-muted-foreground">{student.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {student.enrollments.map((enrollment: any) => (
                                  <Badge key={enrollment.id} variant="outline" className="text-xs">
                                    {enrollment.course.title}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="w-full">
                                <div className="flex items-center space-x-2">
                                  <Progress value={avgProgress} className="flex-1" />
                                  <span className="text-sm text-muted-foreground w-12">
                                    {Math.round(avgProgress)}%
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={hasActiveEnrollments ? "default" : "secondary"}>
                                {hasActiveEnrollments ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(student.enrollments[0]?.enrolledAt || '').toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Message
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Progress
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assignments Tab */}
      {activeView === 'assignments' && (
        <div className="space-y-6">
          {/* Assignments Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-on-surface">Assignment Management</h2>
              <p className="text-on-surface-variant">Create, manage, and grade assignments for your courses</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </div>
          </div>

          {/* Assignment Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Assignments</p>
                    <p className="text-xl font-bold">{mentorAssignments.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                    <p className="text-xl font-bold">
                      {mentorAssignments.reduce((sum: any, a) => sum + a.submissions.filter((s: any) => s.status === 'submitted').length, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Graded</p>
                    <p className="text-xl font-bold">
                      {mentorAssignments.reduce((sum: any, a) => sum + a.submissions.filter((s: any) => s.status === 'graded').length, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Star className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                    <p className="text-xl font-bold">
                      {mentorAssignments.length > 0 ? Math.round(
                        mentorAssignments
                          .flatMap(a => a.submissions.filter((s: any) => s.points !== null))
                          .reduce((sum: any, s: any, _, arr) => sum + (s.points || 0) / arr.length, 0)
                      ) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assignments Content */}
          <Tabs defaultValue="assignments" className="w-full">
            <TabsList>
              <TabsTrigger value="assignments">All Assignments</TabsTrigger>
              <TabsTrigger value="pending">Pending Review ({mentorAssignments.reduce((sum: any, a) => sum + a.submissions.filter((s: any) => s.status === 'submitted').length, 0)})</TabsTrigger>
              <TabsTrigger value="graded">Recently Graded</TabsTrigger>
            </TabsList>

            <TabsContent value="assignments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  {assignmentsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="border rounded-lg p-4 animate-pulse">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            </div>
                            <div className="h-8 w-20 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : mentorAssignments.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-on-surface mb-2">No assignments yet</h3>
                      <p className="text-on-surface-variant mb-4">Create your first assignment to start assessing students</p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Assignment
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mentorAssignments
                        .filter(assignment => 
                          !searchTerm || 
                          assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          assignment.course.title.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((assignment) => {
                          const submissionCount = assignment.submissions.length;
                          const gradedCount = assignment.submissions.filter((s: any) => s.status === 'graded').length;
                          const pendingCount = assignment.submissions.filter((s: any) => s.status === 'submitted').length;
                          const avgScore = gradedCount > 0 
                            ? assignment.submissions
                                .filter((s: any) => s.points !== null)
                                .reduce((sum: any, s: any) => sum + (s.points || 0), 0) / gradedCount
                            : 0;

                          return (
                            <div key={assignment.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="text-lg font-semibold text-on-surface">{assignment.title}</h3>
                                    <Badge variant="outline">{assignment.course.title}</Badge>
                                    {assignment.dueDate && new Date(assignment.dueDate) < new Date() && (
                                      <Badge variant="destructive">Overdue</Badge>
                                    )}
                                  </div>
                                  <p className="text-on-surface-variant mb-3">{assignment.description}</p>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <p className="text-muted-foreground">Due Date</p>
                                      <p className="font-medium">
                                        {assignment.dueDate 
                                          ? new Date(assignment.dueDate).toLocaleDateString()
                                          : 'No due date'
                                        }
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Submissions</p>
                                      <p className="font-medium">{submissionCount}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Pending Review</p>
                                      <p className="font-medium text-orange-600">{pendingCount}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Avg Score</p>
                                      <p className="font-medium">{gradedCount > 0 ? `${Math.round(avgScore)}%` : 'N/A'}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2 ml-4">
                                  {pendingCount > 0 && (
                                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                                      {pendingCount} to review
                                    </Badge>
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <FileText className="h-4 w-4 mr-2" />
                                        View Submissions
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Assignment
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600">
                                        <Trash className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const pendingSubmissions = mentorAssignments
                      .flatMap(assignment => 
                        assignment.submissions
                            .filter((s: any) => s.status === 'submitted')
                            .map((submission: any) => ({
                            ...submission,
                            assignment: assignment
                          }))
                      )
                      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

                    return pendingSubmissions.length === 0 ? (
                      <div className="text-center py-12">
                        <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-on-surface mb-2">No pending reviews</h3>
                        <p className="text-on-surface-variant">All submissions have been reviewed</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingSubmissions.map((submission) => (
                          <div key={submission.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-semibold">{submission.assignment.title}</h4>
                                  <Badge variant="outline">{submission.assignment.course.title}</Badge>
                                  <Badge variant="secondary">Submitted</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  Submitted {new Date(submission.submittedAt).toLocaleDateString()} at {new Date(submission.submittedAt).toLocaleTimeString()}
                                </p>
                                {submission.content && (
                                  <p className="text-sm bg-gray-50 p-3 rounded border">
                                    {submission.content.length > 150 
                                      ? `${submission.content.substring(0, 150)}...`
                                      : submission.content
                                    }
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Review
                                </Button>
                                <Button size="sm">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Grade
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="graded" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recently Graded</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const gradedSubmissions = mentorAssignments
                      .flatMap(assignment => 
                        assignment.submissions
                            .filter((s: any) => s.status === 'graded')
                            .map((submission: any) => ({
                            ...submission,
                            assignment: assignment
                          }))
                      )
                      .sort((a, b) => new Date(b.gradedAt || 0).getTime() - new Date(a.gradedAt || 0).getTime())
                      .slice(0, 10); // Show only recent 10

                    return gradedSubmissions.length === 0 ? (
                      <div className="text-center py-12">
                        <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-on-surface mb-2">No graded assignments yet</h3>
                        <p className="text-on-surface-variant">Graded assignments will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {gradedSubmissions.map((submission) => (
                          <div key={submission.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-semibold">{submission.assignment.title}</h4>
                                  <Badge variant="outline">{submission.assignment.course.title}</Badge>
                                  <Badge variant="default">Graded</Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Score</p>
                                    <p className="font-medium">
                                      {submission.points}/{submission.assignment.maxPoints} 
                                      ({Math.round((submission.points || 0) / (submission.assignment.maxPoints || 100) * 100)}%)
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Graded</p>
                                    <p className="font-medium">
                                      {submission.gradedAt ? new Date(submission.gradedAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Feedback</p>
                                    <p className="font-medium">
                                      {submission.feedback ? 'Provided' : 'None'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Nura AI Assistant Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-on-surface mb-2">Nura AI for Mentors</h2>
            <p className="text-on-surface-variant">AI-powered insights to enhance your teaching and course management</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            onClick={() => window.location.href = '/nura-ai/mentor'}
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Open Nura AI
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-6 text-center">
              <div className="bg-indigo-600 p-3 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="text-white text-2xl" />
              </div>
              <h3 className="font-semibold text-on-surface mb-2">Course Analytics</h3>
              <p className="text-on-surface-variant text-sm mb-4">AI-powered course performance insights</p>
              <Button variant="outline" size="sm" className="w-full">View Analytics</Button>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-6 text-center">
              <div className="bg-indigo-600 p-3 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="text-white text-2xl" />
              </div>
              <h3 className="font-semibold text-on-surface mb-2">Student Insights</h3>
              <p className="text-on-surface-variant text-sm mb-4">Individual student performance analysis</p>
              <Button variant="outline" size="sm" className="w-full">View Insights</Button>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-6 text-center">
              <div className="bg-indigo-600 p-3 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="text-white text-2xl" />
              </div>
              <h3 className="font-semibold text-on-surface mb-2">Teaching Tips</h3>
              <p className="text-on-surface-variant text-sm mb-4">AI-generated teaching recommendations</p>
              <Button variant="outline" size="sm" className="w-full">Get Tips</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
