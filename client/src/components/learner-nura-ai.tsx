import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import NuraAISection from './nura-ai-section';
import {
  Calendar,
  Brain,
  Lightbulb,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Zap,
  Target,
  TrendingUp,
  Award,
  FileText,
  User
} from 'lucide-react';

const mockStudyPlan = [
  { id: 1, course: 'Creative Writing Masterclass', timeBlock: 'Monday 2-4 PM', priority: 'High', color: 'bg-red-500' },
  { id: 2, course: 'Data Science Fundamentals', timeBlock: 'Wednesday 6-8 PM', priority: 'Medium', color: 'bg-yellow-500' },
  { id: 3, course: 'Full Stack Web Development', timeBlock: 'Saturday 10-12 PM', priority: 'High', color: 'bg-red-500' },
  { id: 4, course: 'Review: JavaScript Basics', timeBlock: 'Sunday 3-4 PM', priority: 'Low', color: 'bg-green-500' },
];

const mockRecommendation = {
  title: 'Advanced Project Management',
  reason: 'Based on your completion of Business Fundamentals and interest in leadership topics, this course will help you develop practical management skills.',
  skills: ['Project Planning', 'Team Leadership', 'Risk Management', 'Agile Methodology'],
  match: 92
};

export default function LearnerNuraAI() {
  const [elinInput, setElinInput] = useState('');
  const [elinOutput, setElinOutput] = useState('');
  const [isElinLoading, setIsElinLoading] = useState(false);
  const [isPlanGenerating, setIsPlanGenerating] = useState(false);
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showLearnerReport, setShowLearnerReport] = useState(false);

  const handleElinSubmit = async () => {
    if (!elinInput.trim()) return;
    
    setIsElinLoading(true);
    // Simulate AI response
    setTimeout(() => {
      setElinOutput(`Great question! Let me explain "${elinInput}" in simple terms:

This is a fundamental concept that works by breaking down complex ideas into smaller, manageable parts. Think of it like building with blocks - you start with the basics and gradually add more complex pieces.

Key points to remember:
• Start with the foundation concepts
• Practice with simple examples first
• Apply what you learn to real-world scenarios
• Don't hesitate to ask follow-up questions

Would you like me to provide some specific examples or practice exercises?`);
      setIsElinLoading(false);
    }, 2000);
  };

  const generateStudyPlan = async () => {
    setIsPlanGenerating(true);
    setTimeout(() => {
      setIsPlanGenerating(false);
    }, 3000);
  };

  const generateLearnerReport = async () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setIsGeneratingReport(false);
      setShowLearnerReport(true);
    }, 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-on-surface flex items-center justify-center space-x-3 mb-2">
          <Brain className="h-8 w-8 text-indigo-600" />
          <span>Nura AI Assistant</span>
        </h2>
        <p className="text-on-surface-variant">Your intelligent learning companion powered by AI</p>
      </div>

      <Tabs defaultValue="planner" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="planner" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Study Planner</span>
          </TabsTrigger>
          <TabsTrigger value="elin" className="flex items-center space-x-2">
            <Lightbulb className="h-4 w-4" />
            <span>Ask Nura</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Recommendations</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Quiz Help</span>
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>My Report</span>
          </TabsTrigger>
        </TabsList>

        {/* Smart Study Planner */}
        <TabsContent value="planner">
          <NuraAISection
            title="Smart Study Planner"
            description="AI-generated personalized study schedule based on your learning goals and availability"
          >
            <div className="space-y-6">
              {/* Calendar Overview */}
              <div className="grid grid-cols-7 gap-2 text-center">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="font-medium text-sm text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className="h-20 bg-gray-50 rounded-lg p-2 text-xs">
                    <div className="font-medium">{i + 15}</div>
                    {(i === 0 || i === 2 || i === 5) && (
                      <div className={`mt-1 p-1 rounded text-white text-xs ${
                        i === 0 ? 'bg-red-500' : i === 2 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        Study
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Generate Button */}
              <div className="flex justify-center">
                <Button 
                  onClick={generateStudyPlan} 
                  disabled={isPlanGenerating}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isPlanGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Plan...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate My Study Plan
                    </>
                  )}
                </Button>
              </div>

              {/* Study Plan Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">This Week's Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockStudyPlan.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <div>
                            <p className="font-medium text-sm">{item.course}</p>
                            <p className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {item.timeBlock}
                            </p>
                          </div>
                        </div>
                        <Badge variant={item.priority === 'High' ? 'destructive' : item.priority === 'Medium' ? 'default' : 'secondary'}>
                          {item.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </NuraAISection>
        </TabsContent>

        {/* Explain Like I'm New (ELIN) */}
        <TabsContent value="elin">
          <NuraAISection
            title="Explain Like I'm New (ELIN)"
            description="Get clear, beginner-friendly explanations for any topic you're learning"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">What do you need help with?</label>
                <Textarea
                  placeholder="Ask me anything about your courses, concepts, or topics you're studying..."
                  value={elinInput}
                  onChange={(e) => setElinInput(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <Button 
                onClick={handleElinSubmit} 
                disabled={!elinInput.trim() || isElinLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {isElinLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Nura is thinking...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Ask Nura
                  </>
                )}
              </Button>

              {elinOutput && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5 text-blue-600" />
                      <span>Nura's Explanation</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-sm">{elinOutput}</div>
                  </CardContent>
                </Card>
              )}
            </div>
          </NuraAISection>
        </TabsContent>

        {/* AI Course Recommendation */}
        <TabsContent value="recommendations">
          <NuraAISection
            title="AI Course Recommendations"
            description="Personalized course suggestions based on your learning history and goals"
          >
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recommended for You</CardTitle>
                  <Badge className="bg-green-600 text-white">
                    {mockRecommendation.match}% Match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{mockRecommendation.title}</h3>
                  <p className="text-sm text-muted-foreground">{mockRecommendation.reason}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Skills you'll learn:</h4>
                  <div className="flex flex-wrap gap-2">
                    {mockRecommendation.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        #{skill.toLowerCase().replace(' ', '')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button className="flex-1">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Course
                  </Button>
                  <Button variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Add to Goals
                  </Button>
                </div>
              </CardContent>
            </Card>
          </NuraAISection>
        </TabsContent>

        {/* Immediate Quiz Feedback */}
        <TabsContent value="feedback">
          <NuraAISection
            title="Immediate Quiz Feedback"
            description="Get instant AI-powered explanations for quiz questions and answers"
          >
            <div className="space-y-4">
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-on-surface mb-2">Quiz Feedback</h3>
                <p className="text-sm text-on-surface-variant mb-4">
                  Take a quiz to see AI-powered feedback in action
                </p>
                <Button 
                  onClick={() => setShowQuizFeedback(!showQuizFeedback)}
                  variant="outline"
                >
                  Show Demo Feedback
                </Button>
              </div>

              {showQuizFeedback && (
                <div className="space-y-4">
                  {/* Sample Quiz Question */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Sample Quiz Question</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">Which of the following best describes machine learning?</p>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="quiz" value="a" />
                          <span>A programming language</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="quiz" value="b" defaultChecked readOnly />
                          <span>A method of data analysis that automates analytical model building</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="quiz" value="c" />
                          <span>A type of database</span>
                        </label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Feedback */}
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Card className="cursor-pointer hover:bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="font-medium text-green-700">Correct!</span>
                            </div>
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <p className="text-sm">
                              <strong>Excellent!</strong> You correctly identified that machine learning is a method of data analysis that automates analytical model building.
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <strong>Why this is correct:</strong> Machine learning uses algorithms to identify patterns in data and make predictions without being explicitly programmed for each specific task.
                            </p>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <BookOpen className="h-4 w-4 mr-1" />
                                Review Module
                              </Button>
                              <Button size="sm" variant="outline">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                Next Topic
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
            </div>
          </NuraAISection>
        </TabsContent>

        {/* Generate Learner Report */}
        <TabsContent value="report">
          <NuraAISection
            title="Generate Learner Report"
            description="AI-powered comprehensive analysis of your learning progress, strengths, and recommendations"
          >
            <div className="space-y-6">
              {/* Generate Button */}
              <div className="text-center">
                <Button 
                  onClick={generateLearnerReport} 
                  disabled={isGeneratingReport}
                  className="bg-indigo-600 hover:bg-indigo-700"
                  size="lg"
                >
                  {isGeneratingReport ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing Your Progress...
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5 mr-2" />
                      Generate My Report
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  This will analyze your learning data to provide personalized insights
                </p>
              </div>

              {/* Report Results */}
              {showLearnerReport && (
                <Collapsible defaultOpen>
                  <CollapsibleTrigger asChild>
                    <Card className="cursor-pointer hover:bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-indigo-600" />
                            <span className="font-medium text-lg">Your Learning Report</span>
                          </div>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-4 mt-4">
                      {/* Strengths */}
                      <Card className="bg-green-50 border-green-200">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Star className="h-5 w-5 text-green-600" />
                            <span>Your Strengths</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            <li className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm">Strong problem-solving skills demonstrated in Data Science coursework</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm">Consistent engagement with creative writing assignments</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm">High completion rate across all enrolled courses (89%)</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm">Active participation in collaborative projects</span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>

                      {/* Skill Gaps */}
                      <Card className="bg-yellow-50 border-yellow-200">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Target className="h-5 w-5 text-yellow-600" />
                            <span>Areas for Improvement</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            <li className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm">JavaScript fundamentals - review recommended for Full Stack course</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm">Statistical analysis concepts for advanced data science topics</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm">Time management - some assignment submissions near deadlines</span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>

                      {/* Certifications Summary */}
                      <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Award className="h-5 w-5 text-blue-600" />
                            <span>Certifications Summary</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Earned Certifications</span>
                              <Badge className="bg-blue-600">2 Completed</Badge>
                            </div>
                            <ul className="space-y-2">
                              <li className="flex items-center space-x-2">
                                <Award className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">Creative Writing Fundamentals</span>
                                <Badge variant="outline" className="text-xs">Dec 2024</Badge>
                              </li>
                              <li className="flex items-center space-x-2">
                                <Award className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">Business Communication Basics</span>
                                <Badge variant="outline" className="text-xs">Jan 2025</Badge>
                              </li>
                            </ul>
                            <div className="border-t pt-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">In Progress</span>
                                <Badge variant="secondary">1 Course</Badge>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">Data Science Fundamentals</span>
                                <Progress value={68} className="w-20" />
                                <span className="text-xs text-muted-foreground">68%</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Suggested Actions */}
                      <Card className="bg-indigo-50 border-indigo-200">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Lightbulb className="h-5 w-5 text-indigo-600" />
                            <span>Suggested Actions</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="p-3 bg-white rounded border">
                              <div className="flex items-start space-x-3">
                                <div className="bg-indigo-100 p-1 rounded">
                                  <BookOpen className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">Complete JavaScript Review</p>
                                  <p className="text-xs text-muted-foreground">Spend 2-3 hours reviewing JavaScript basics before continuing Full Stack Development</p>
                                </div>
                                <Button size="sm" variant="outline">Start</Button>
                              </div>
                            </div>
                            <div className="p-3 bg-white rounded border">
                              <div className="flex items-start space-x-3">
                                <div className="bg-green-100 p-1 rounded">
                                  <Target className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">Set Study Schedule</p>
                                  <p className="text-xs text-muted-foreground">Use the Smart Study Planner to create a consistent learning schedule</p>
                                </div>
                                <Button size="sm" variant="outline">Plan</Button>
                              </div>
                            </div>
                            <div className="p-3 bg-white rounded border">
                              <div className="flex items-start space-x-3">
                                <div className="bg-purple-100 p-1 rounded">
                                  <Award className="h-4 w-4 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">Focus on Data Science</p>
                                  <p className="text-xs text-muted-foreground">You're 68% complete - dedicate extra time this week to finish your certification</p>
                                </div>
                                <Button size="sm" variant="outline">Focus</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </NuraAISection>
        </TabsContent>
      </Tabs>
    </div>
  );
}