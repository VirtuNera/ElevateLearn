import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import NuraAISection from './nura-ai-section';
import {
  TrendingUp,
  BarChart3,
  Shield,
  AlertTriangle,
  FileText,
  Brain,
  Download,
  RefreshCw,
  Users,
  BookOpen,
  Award,
  Eye,
  Target,
  ArrowLeft
} from 'lucide-react';

const mockTrendingSkills = [
  { skill: 'Machine Learning', growth: 45, trend: 'up' },
  { skill: 'Cloud Computing', growth: 38, trend: 'up' },
  { skill: 'Cybersecurity', growth: 32, trend: 'up' },
  { skill: 'Data Visualization', growth: 28, trend: 'stable' },
  { skill: 'UX/UI Design', growth: 25, trend: 'up' }
];

const mockRecommendedCourses = [
  'AI Ethics and Governance',
  'Sustainable Technology Practices',
  'Remote Team Leadership',
  'Digital Transformation Strategy'
];

const mockEquityData = [
  { group: 'Computer Science', passRate: 89, concern: 'none' },
  { group: 'Business Administration', passRate: 76, concern: 'moderate' },
  { group: 'Liberal Arts', passRate: 58, concern: 'high' },
  { group: 'Engineering', passRate: 85, concern: 'low' }
];

const mockSystemReport = {
  activeDepartments: ['Engineering', 'Marketing', 'Design', 'Data Science'],
  topPerforming: 'Engineering (94% completion rate)',
  courseGaps: [
    'Leadership Development (High demand, low availability)',
    'Advanced Analytics (Waitlist of 45 learners)',
    'Communication Skills (Requested by 12 departments)'
  ],
  complianceRate: 92,
  insights: [
    'Peak learning hours: 2-4 PM and 7-9 PM weekdays',
    'Mobile learning adoption increased 67% this quarter',
    'Peer learning sessions have 23% higher completion rates'
  ]
};

export default function AdminNuraAI() {
  const [, setLocation] = useLocation();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showSystemReport, setShowSystemReport] = useState(false);

  const generateSystemReport = async () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setShowSystemReport(true);
      setIsGeneratingReport(false);
    }, 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          onClick={() => setLocation('/')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
        <div className="text-center flex-1">
          <h2 className="text-2xl font-bold text-on-surface flex items-center justify-center space-x-3 mb-2">
            <Brain className="h-8 w-8 text-indigo-600" />
            <span>Nura AI for Admins</span>
          </h2>
          <p className="text-on-surface-variant">Strategic insights and predictive analytics for platform management</p>
        </div>
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Learning Trends</span>
          </TabsTrigger>
          <TabsTrigger value="equity" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Equity Monitor</span>
          </TabsTrigger>
          <TabsTrigger value="system-report" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>System Report</span>
          </TabsTrigger>
        </TabsList>

        {/* Predictive Learning Trends */}
        <TabsContent value="trends">
          <NuraAISection
            title="Predictive Learning Trends"
            description="AI-powered analysis of emerging skills and course demand forecasting"
          >
            <div className="space-y-6">
              {/* Trending Skills Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span>Trending Skill Tags</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTrendingSkills.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{item.skill}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.growth}% growth this quarter
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={item.growth} className="w-20" />
                          <TrendingUp className={`h-4 w-4 ${
                            item.trend === 'up' ? 'text-green-500' : 'text-gray-400'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommended New Course Areas */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span>Recommended New Course Areas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockRecommendedCourses.map((course, index) => (
                      <Card key={index} className="bg-white border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm">{course}</div>
                            <Badge className="bg-green-600 text-white text-xs">High Demand</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Based on skill trend analysis
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex justify-center mt-4">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Plan Course Development
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </NuraAISection>
        </TabsContent>

        {/* Bias & Equity Monitor */}
        <TabsContent value="equity">
          <NuraAISection
            title="Bias & Equity Monitor"
            description="AI-powered analysis of learning outcomes across different demographics and groups"
          >
            <div className="space-y-6">
              {/* Equity Graph */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <span>Pass Rates by Program</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockEquityData.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.group}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{item.passRate}%</span>
                            <Badge variant={
                              item.concern === 'high' ? 'destructive' :
                              item.concern === 'moderate' ? 'default' :
                              item.concern === 'low' ? 'secondary' : 'outline'
                            }>
                              {item.concern === 'none' ? 'Good' : 
                               item.concern === 'low' ? 'Low Risk' :
                               item.concern === 'moderate' ? 'Monitor' : 'Action Needed'}
                            </Badge>
                          </div>
                        </div>
                        <Progress 
                          value={item.passRate} 
                          className={`h-2 ${
                            item.concern === 'high' ? '[&>div]:bg-red-500' :
                            item.concern === 'moderate' ? '[&>div]:bg-yellow-500' :
                            '[&>div]:bg-green-500'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Flagged Concerns */}
              <Card className="bg-amber-50 border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <span>Flagged Concerns</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border-l-4 border-red-400">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <div className="font-medium text-red-800">Liberal Arts Program - Low Pass Rate</div>
                          <div className="text-sm text-red-600 mt-1">
                            58% pass rate is significantly below average (78%). Requires immediate attention.
                          </div>
                          <div className="mt-2">
                            <Button size="sm" variant="outline" className="text-red-600 border-red-300">
                              <Eye className="h-3 w-3 mr-1" />
                              Investigate
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-lg border-l-4 border-yellow-400">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <div className="font-medium text-yellow-800">Business Administration - Declining Trend</div>
                          <div className="text-sm text-yellow-600 mt-1">
                            Pass rate decreased from 82% to 76% over the last quarter.
                          </div>
                          <div className="mt-2">
                            <Button size="sm" variant="outline" className="text-yellow-600 border-yellow-300">
                              <Target className="h-3 w-3 mr-1" />
                              Create Action Plan
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center py-4">
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Download className="h-4 w-4 mr-2" />
                        Export Equity Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </NuraAISection>
        </TabsContent>

        {/* Generate System Report */}
        <TabsContent value="system-report">
          <NuraAISection
            title="Generate System Report"
            description="Comprehensive AI-generated analysis of platform performance and recommendations"
          >
            <div className="space-y-6">
              <div className="text-center">
                <Button 
                  onClick={generateSystemReport}
                  disabled={isGeneratingReport}
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isGeneratingReport ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Generating System Report...
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5 mr-2" />
                      Generate System Report
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  This will analyze all platform data and generate comprehensive insights
                </p>
              </div>

              {showSystemReport && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>System Performance Report</span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Full Report
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Export PDF
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {mockSystemReport.activeDepartments.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Active Departments</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {mockSystemReport.complianceRate}%
                        </div>
                        <div className="text-sm text-muted-foreground">Compliance Rate</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {mockSystemReport.courseGaps.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Course Gaps Identified</div>
                      </div>
                    </div>

                    {/* Top Performing Department */}
                    <div>
                      <h4 className="font-medium mb-2 text-blue-700">Top Performing Department</h4>
                      <div className="p-3 bg-green-100 rounded-lg border-l-4 border-green-400">
                        <div className="flex items-center space-x-2">
                          <Award className="h-5 w-5 text-green-600" />
                          <span className="font-medium">{mockSystemReport.topPerforming}</span>
                        </div>
                      </div>
                    </div>

                    {/* Course Gaps */}
                    <div>
                      <h4 className="font-medium mb-2 text-blue-700">Identified Course Gaps</h4>
                      <div className="space-y-2">
                        {mockSystemReport.courseGaps.map((gap, index) => (
                          <div key={index} className="p-3 bg-white rounded border-l-4 border-orange-400">
                            <span className="text-sm">{gap}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Insights */}
                    <div>
                      <h4 className="font-medium mb-2 text-blue-700">AI-Generated Insights</h4>
                      <div className="space-y-2">
                        {mockSystemReport.insights.map((insight, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded">
                            <Brain className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{insight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-center space-x-3">
                      <Button variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Share with Leadership
                      </Button>
                      <Button>
                        <Target className="h-4 w-4 mr-2" />
                        Create Action Items
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