import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NuraAISection from './nura-ai-section';
import {
  Users,
  TrendingDown,
  AlertTriangle,
  FileText,
  BarChart3,
  UserX,
  Brain,
  MessageCircle,
  Clock,
  CheckCircle,
  RefreshCw,
  Download,
  Eye,
  ArrowLeft
} from 'lucide-react';

const mockLearnerProgress = {
  behindCount: 5,
  dropoffModules: ['JavaScript Fundamentals - Module 3', 'Data Structures - Module 1'],
  interventions: [
    'Schedule 1-on-1 sessions for struggling students',
    'Create supplementary materials for challenging topics',
    'Set up study groups for peer learning'
  ],
  groups: [
    { name: 'Web Development Cohort A', behind: 3, total: 15, status: 'attention' },
    { name: 'Data Science Fundamentals', behind: 2, total: 12, status: 'warning' },
    { name: 'Creative Writing Workshop', behind: 0, total: 8, status: 'good' }
  ]
};

const mockStudents = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@demo.com' },
  { id: '2', name: 'Mike Chen', email: 'mike@demo.com' },
  { id: '3', name: 'Emma Davis', email: 'emma@demo.com' }
];

const mockCourses = [
  { id: '1', title: 'Full Stack Web Development' },
  { id: '2', title: 'Data Science Fundamentals' },
  { id: '3', title: 'Creative Writing Masterclass' }
];

const mockLearnerReport = {
  name: 'Sarah Johnson',
  completionRate: 78,
  skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
  gaps: ['Testing', 'DevOps', 'Security'],
  strengths: ['Problem-solving', 'Code organization', 'Documentation'],
  recommendations: 'Focus on testing methodologies and deployment practices'
};

const mockCourseReport = {
  title: 'Full Stack Web Development',
  avgCompletionRate: 72,
  mostFailedQuiz: 'Advanced JavaScript Concepts - Quiz 3',
  mostFailedModule: 'Async Programming & Promises',
  suggestions: [
    'Add more interactive coding examples to Async Programming module',
    'Create video explanations for Promise concepts',
    'Include real-world project examples'
  ]
};

export default function MentorNuraAI() {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showLearnerReport, setShowLearnerReport] = useState(false);
  const [showCourseReport, setShowCourseReport] = useState(false);

  const generateLearnerReport = async () => {
    if (!selectedStudent) return;
    setIsGeneratingReport(true);
    setTimeout(() => {
      setShowLearnerReport(true);
      setIsGeneratingReport(false);
    }, 2000);
  };

  const generateCourseReport = async () => {
    if (!selectedCourse) return;
    setIsGeneratingReport(true);
    setTimeout(() => {
      setShowCourseReport(true);
      setIsGeneratingReport(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/'}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
        <div className="text-center flex-1">
          <h2 className="text-2xl font-bold text-on-surface flex items-center justify-center space-x-3 mb-2">
            <Brain className="h-8 w-8 text-indigo-600" />
            <span>Nura AI for Mentors</span>
          </h2>
          <p className="text-on-surface-variant">AI-powered insights and automation for better teaching</p>
        </div>
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progress" className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4" />
            <span>Progress Summary</span>
          </TabsTrigger>
          <TabsTrigger value="learner-report" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Learner Report</span>
          </TabsTrigger>
          <TabsTrigger value="course-report" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Course Report</span>
          </TabsTrigger>
        </TabsList>

        {/* Auto-Summarize Learner Progress */}
        <TabsContent value="progress">
          <NuraAISection
            title="Auto-Summarize Learner Progress"
            description="AI-generated insights about student performance and recommendations for intervention"
          >
            <div className="space-y-6">
              {/* Summary Panel */}
              <Card className="bg-amber-50 border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <span>Attention Required</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-amber-100 rounded-lg">
                    <div className="text-3xl font-bold text-amber-800">
                      {mockLearnerProgress.behindCount}
                    </div>
                    <div className="text-sm text-amber-700">learners are behind schedule</div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-amber-800">Drop-off Modules:</h4>
                    <div className="space-y-2">
                      {mockLearnerProgress.dropoffModules.map((module, index) => (
                        <Badge key={index} variant="destructive" className="mr-2">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-amber-800">Suggested Interventions:</h4>
                    <ul className="space-y-1 text-sm">
                      {mockLearnerProgress.interventions.map((intervention, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-amber-600 mt-1">•</span>
                          <span>{intervention}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Group Status */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Group Performance</h3>
                <div className="space-y-3">
                  {mockLearnerProgress.groups.map((group, index) => (
                    <Card key={index} className={`${
                      group.status === 'attention' ? 'border-red-200 bg-red-50' :
                      group.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                      'border-green-200 bg-green-50'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{group.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {group.behind} of {group.total} students behind
                            </p>
                          </div>
                          <div className="text-right">
                            <Progress 
                              value={((group.total - group.behind) / group.total) * 100} 
                              className="w-20 mb-1"
                            />
                            <div className={`text-xs font-medium ${
                              group.status === 'attention' ? 'text-red-600' :
                              group.status === 'warning' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {Math.round(((group.total - group.behind) / group.total) * 100)}%
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </NuraAISection>
        </TabsContent>

        {/* Generate Learner Report */}
        <TabsContent value="learner-report">
          <NuraAISection
            title="Generate Learner Report"
            description="Create comprehensive AI-generated reports for individual student progress"
          >
            <div className="space-y-6">
              <div className="flex gap-4">
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={generateLearnerReport}
                  disabled={!selectedStudent || isGeneratingReport}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isGeneratingReport ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>

              {showLearnerReport && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Learner Summary: {mockLearnerReport.name}</span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Full
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {mockLearnerReport.completionRate}%
                        </div>
                        <div className="text-sm text-muted-foreground">Completion Rate</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {mockLearnerReport.skills.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Skills Mastered</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {mockLearnerReport.gaps.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Skill Gaps</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 text-green-700">Strengths</h4>
                        <div className="flex flex-wrap gap-1">
                          {mockLearnerReport.skills.map((skill) => (
                            <Badge key={skill} className="bg-green-100 text-green-700 text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-orange-700">Areas to Focus</h4>
                        <div className="flex flex-wrap gap-1">
                          {mockLearnerReport.gaps.map((gap) => (
                            <Badge key={gap} variant="outline" className="text-orange-700 text-xs">
                              {gap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">AI Recommendations</h4>
                      <p className="text-sm bg-white p-3 rounded border-l-4 border-blue-400">
                        {mockLearnerReport.recommendations}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </NuraAISection>
        </TabsContent>

        {/* Generate Course Report */}
        <TabsContent value="course-report">
          <NuraAISection
            title="Generate Course Report"
            description="AI-powered analysis of course performance and improvement suggestions"
          >
            <div className="space-y-6">
              <div className="flex gap-4">
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={generateCourseReport}
                  disabled={!selectedCourse || isGeneratingReport}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isGeneratingReport ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analyze Course
                    </>
                  )}
                </Button>
              </div>

              {showCourseReport && (
                <Card className="bg-purple-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Course Analysis: {mockCourseReport.title}</span>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Export Report
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {mockCourseReport.avgCompletionRate}%
                        </div>
                        <div className="text-sm text-muted-foreground">Avg. Completion Rate</div>
                      </div>
                      <div className="p-4 bg-white rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Most Failed Quiz</div>
                        <div className="font-medium text-sm text-red-600">
                          {mockCourseReport.mostFailedQuiz}
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Challenging Module</div>
                        <div className="font-medium text-sm text-red-600">
                          {mockCourseReport.mostFailedModule}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3 text-purple-700">AI Suggestions for Improvement</h4>
                      <div className="space-y-2">
                        {mockCourseReport.suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded border-l-4 border-purple-400">
                            <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-center space-x-3">
                      <Button variant="outline">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Discuss with Team
                      </Button>
                      <Button>
                        <Clock className="h-4 w-4 mr-2" />
                        Schedule Improvements
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </NuraAISection>
        </TabsContent>
      </Tabs>
    </div>
  );
}