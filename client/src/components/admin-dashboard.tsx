import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp,
  Settings,
  Shield,
  BarChart3,
  UserCheck,
  Search,
  Filter,
  Edit,
  Trash2,
  Check,
  X,
  Eye,
  Plus,
  Download,
  Upload,
  RefreshCw
} from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  difficulty: string;
  duration: string;
  maxStudents: number;
  createdAt: string;
}

interface Analytics {
  coursesCount: number;
  activeEnrollments: number;
  completedEnrollments: number;
  certificationsCount: number;
}

interface EnhancedAnalytics {
  totalUsers: number;
  totalCourses: number;
  activeEnrollments: number;
  completedEnrollments: number;
  monthlyStats: {
    month: string;
    enrollments: number;
    completions: number;
  }[];
  coursesByCategory: {
    category: string;
    count: number;
  }[];
  usersByRole: {
    role: string;
    count: number;
  }[];
}

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'courses' | 'analytics'>('overview');
  const [userFilters, setUserFilters] = useState({ role: '', search: '' });
  const [courseFilter, setCourseFilter] = useState('pending');
  const { toast } = useToast();

  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ['/api/analytics'],
  });

  const { data: enhancedAnalytics, isLoading: enhancedAnalyticsLoading } = useQuery<EnhancedAnalytics>({
    queryKey: ['/api/admin/analytics'],
  });

  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useQuery<User[]>({
    queryKey: ['/api/admin/users', userFilters],
    enabled: activeView === 'users',
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userFilters.role) params.append('role', userFilters.role);
      if (userFilters.search) params.append('search', userFilters.search);
      const response = await fetch(`/api/admin/users?${params}`);
      return response.json();
    }
  });

  const { data: pendingCourses, isLoading: pendingCoursesLoading, refetch: refetchCourses } = useQuery<Course[]>({
    queryKey: ['/api/admin/courses/pending'],
    enabled: activeView === 'courses',
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({ title: "User role updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: () => {
      toast({ title: "Failed to update user role", variant: "destructive" });
    }
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      return await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({ title: "User deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    }
  });

  const approveCourse = useMutation({
    mutationFn: async (courseId: string) => {
      return await fetch(`/api/admin/courses/${courseId}/approve`, {
        method: 'PUT'
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({ title: "Course approved successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses/pending'] });
    },
    onError: () => {
      toast({ title: "Failed to approve course", variant: "destructive" });
    }
  });

  const rejectCourse = useMutation({
    mutationFn: async (courseId: string) => {
      return await fetch(`/api/admin/courses/${courseId}/reject`, {
        method: 'DELETE'
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({ title: "Course rejected" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses/pending'] });
    },
    onError: () => {
      toast({ title: "Failed to reject course", variant: "destructive" });
    }
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'courses', label: 'Course Approval', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">Admin Dashboard</h1>
          <p className="text-on-surface-variant">Manage users, courses, and system analytics.</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span>System Settings</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-on-surface-variant text-sm">Total Courses</p>
                <p className="text-2xl font-bold text-on-surface">
                  {analyticsLoading ? '...' : analytics?.coursesCount || 0}
                </p>
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
                <p className="text-on-surface-variant text-sm">Active Enrollments</p>
                <p className="text-2xl font-bold text-on-surface">
                  {analyticsLoading ? '...' : analytics?.activeEnrollments || 0}
                </p>
              </div>
              <div className="bg-secondary/10 p-3 rounded-lg">
                <Users className="text-secondary text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-on-surface-variant text-sm">Completed Courses</p>
                <p className="text-2xl font-bold text-on-surface">
                  {analyticsLoading ? '...' : analytics?.completedEnrollments || 0}
                </p>
              </div>
              <div className="bg-academic/10 p-3 rounded-lg">
                <UserCheck className="text-academic text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-on-surface-variant text-sm">Certificates Issued</p>
                <p className="text-2xl font-bold text-on-surface">
                  {analyticsLoading ? '...' : analytics?.certificationsCount || 0}
                </p>
              </div>
              <div className="bg-corporate/10 p-3 rounded-lg">
                <Award className="text-corporate text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
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
          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>System Health</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">99.9%</div>
                  <div className="text-sm text-green-700">Uptime</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">1.2s</div>
                  <div className="text-sm text-blue-700">Avg Response</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">Active</div>
                  <div className="text-sm text-purple-700">System Status</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent System Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="h-5 w-5 text-secondary" />
                    <div>
                      <p className="text-sm font-medium">New user registration</p>
                      <p className="text-xs text-muted-foreground">5 minutes ago</p>
                    </div>
                  </div>
                  <Badge variant="secondary">User</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Course published</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                  <Badge variant="default">Course</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-corporate" />
                    <div>
                      <p className="text-sm font-medium">Certificate issued</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <Badge style={{ backgroundColor: 'hsl(var(--corporate))' }}>Certificate</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Management Tab */}
      {activeView === 'users' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>User Management</span>
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => refetchUsers()}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add User
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      value={userFilters.search}
                      onChange={(e) => setUserFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={userFilters.role}
                  onValueChange={(value) => setUserFilters(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Roles</SelectItem>
                    <SelectItem value="learner">Learner</SelectItem>
                    <SelectItem value="mentor">Mentor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              {usersLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{user.firstName} {user.lastName}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : user.role === 'mentor' ? 'secondary' : 'outline'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit User Role</DialogTitle>
                                  <DialogDescription>
                                    Change the role for {user.firstName} {user.lastName}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <Select
                                    defaultValue={user.role}
                                    onValueChange={(value) => updateUserRole.mutate({ userId: user.id, role: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="learner">Learner</SelectItem>
                                      <SelectItem value="mentor">Mentor</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {user.firstName} {user.lastName}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteUser.mutate(user.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Course Approval Tab */}
      {activeView === 'courses' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Course Management</span>
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => refetchCourses()}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export Data
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Course Status Filters */}
              <div className="flex space-x-4 mb-6">
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved Courses</SelectItem>
                    <SelectItem value="all">All Courses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pending Courses */}
              {courseFilter === 'pending' && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Courses Pending Approval</h3>
                  {pendingCoursesLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : pendingCourses?.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No pending courses</h3>
                      <p className="text-gray-500">All courses have been reviewed</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingCourses?.map((course: any) => (
                        <Card key={course.id} className="border-l-4 border-l-yellow-400">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="text-lg font-semibold">{course.title}</h4>
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                    Pending
                                  </Badge>
                                </div>
                                <p className="text-gray-600 mb-3">{course.description}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    Type: {course.type}
                                  </span>
                                  <span className="flex items-center">
                                    <Award className="h-4 w-4 mr-1" />
                                    Category: {course.category || 'Uncategorized'}
                                  </span>
                                  <span className="flex items-center">
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    Difficulty: {course.difficulty || 'Not specified'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Eye className="h-4 w-4 mr-1" />
                                      Preview
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>{course.title}</DialogTitle>
                                      <DialogDescription>
                                        Course details and preview
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-medium mb-2">Description</h4>
                                        <p className="text-gray-600">{course.description}</p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="font-medium mb-1">Type</h4>
                                          <p className="text-gray-600">{course.type}</p>
                                        </div>
                                        <div>
                                          <h4 className="font-medium mb-1">Category</h4>
                                          <p className="text-gray-600">{course.category || 'Uncategorized'}</p>
                                        </div>
                                        <div>
                                          <h4 className="font-medium mb-1">Duration</h4>
                                          <p className="text-gray-600">{course.duration || 'Not specified'}</p>
                                        </div>
                                        <div>
                                          <h4 className="font-medium mb-1">Max Students</h4>
                                          <p className="text-gray-600">{course.maxStudents || 'Unlimited'}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-1">Created</h4>
                                        <p className="text-gray-600">{new Date(course.createdAt).toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => approveCourse.mutate(course.id)}
                                  disabled={approveCourse.isPending}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                                      <X className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Reject Course</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to reject "{course.title}"? This will permanently delete the course.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => rejectCourse.mutate(course.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Reject Course
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {pendingCourses?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500">Pending Approval</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics?.coursesCount || 0}
                    </div>
                    <div className="text-sm text-gray-500">Total Published</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {((analytics?.coursesCount || 0) + (pendingCourses?.length || 0))}
                    </div>
                    <div className="text-sm text-gray-500">Total Courses</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeView === 'analytics' && (
        <div className="space-y-6">
          {/* Top-level Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">
                      {enhancedAnalyticsLoading ? '...' : enhancedAnalytics?.totalUsers || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Courses</p>
                    <p className="text-2xl font-bold">
                      {enhancedAnalyticsLoading ? '...' : enhancedAnalytics?.totalCourses || 0}
                    </p>
                  </div>
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Enrollments</p>
                    <p className="text-2xl font-bold">
                      {enhancedAnalyticsLoading ? '...' : enhancedAnalytics?.activeEnrollments || 0}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completions</p>
                    <p className="text-2xl font-bold">
                      {enhancedAnalyticsLoading ? '...' : enhancedAnalytics?.completedEnrollments || 0}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Monthly Enrollment Trends</span>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export Chart
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enhancedAnalyticsLoading ? (
                <div className="h-64 bg-gray-100 rounded animate-pulse" />
              ) : (
                <div className="space-y-4">
                  <div className="h-64 flex items-end space-x-4 px-4">
                    {enhancedAnalytics?.monthlyStats.map((stat, index) => (
                      <div key={stat.month} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex space-x-1">
                          <div 
                            className="bg-blue-500 rounded-t"
                            style={{ 
                              height: `${(stat.enrollments / 100) * 200}px`,
                              width: '50%'
                            }}
                          />
                          <div 
                            className="bg-green-500 rounded-t"
                            style={{ 
                              height: `${(stat.completions / 100) * 200}px`,
                              width: '50%'
                            }}
                          />
                        </div>
                        <div className="text-xs mt-2 text-center">
                          <div className="font-medium">{stat.month}</div>
                          <div className="text-gray-500 text-xs">
                            {stat.enrollments}/{stat.completions}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center space-x-6">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded mr-2" />
                      <span className="text-sm">Enrollments</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded mr-2" />
                      <span className="text-sm">Completions</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Users by Role */}
            <Card>
              <CardHeader>
                <CardTitle>Users by Role</CardTitle>
              </CardHeader>
              <CardContent>
                {enhancedAnalyticsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enhancedAnalytics?.usersByRole.map((userType) => {
                      const total = enhancedAnalytics.totalUsers;
                      const percentage = total > 0 ? (userType.count / total) * 100 : 0;
                      const roleColors: Record<string, string> = {
                        learner: 'bg-blue-500',
                        mentor: 'bg-green-500',
                        admin: 'bg-purple-500'
                      };
                      
                      return (
                        <div key={userType.role} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium capitalize">{userType.role}</span>
                            <span className="text-sm text-gray-600">
                              {userType.count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress 
                            value={percentage} 
                            className="h-2"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Courses by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Courses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {enhancedAnalyticsLoading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enhancedAnalytics?.coursesByCategory.map((category) => {
                      const total = enhancedAnalytics.totalCourses;
                      const percentage = total > 0 ? (category.count / total) * 100 : 0;
                      
                      return (
                        <div key={category.category} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{category.category}</span>
                            <span className="text-sm text-gray-600">
                              {category.count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress 
                            value={percentage} 
                            className="h-2"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Key Performance Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {enhancedAnalytics?.activeEnrollments && enhancedAnalytics?.totalUsers 
                      ? ((enhancedAnalytics.activeEnrollments / enhancedAnalytics.totalUsers) * 100).toFixed(1) 
                      : '0'}%
                  </div>
                  <div className="text-sm text-blue-700">Engagement Rate</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {enhancedAnalytics?.completedEnrollments && enhancedAnalytics?.activeEnrollments 
                      ? ((enhancedAnalytics.completedEnrollments / (enhancedAnalytics.activeEnrollments + enhancedAnalytics.completedEnrollments)) * 100).toFixed(1) 
                      : '0'}%
                  </div>
                  <div className="text-sm text-green-700">Completion Rate</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {enhancedAnalytics?.totalCourses && enhancedAnalytics?.usersByRole 
                      ? (enhancedAnalytics.totalCourses / (enhancedAnalytics.usersByRole.find(u => u.role === 'mentor')?.count || 1)).toFixed(1)
                      : '0'}
                  </div>
                  <div className="text-sm text-purple-700">Courses per Mentor</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {enhancedAnalytics?.activeEnrollments && enhancedAnalytics?.totalCourses 
                      ? (enhancedAnalytics.activeEnrollments / enhancedAnalytics.totalCourses).toFixed(1)
                      : '0'}
                  </div>
                  <div className="text-sm text-orange-700">Avg. Students per Course</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
