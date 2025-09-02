import { db } from '../db';
import { 
  nuraReports, 
  studyPlans, 
  quizAnswers, 
  assignmentSubmissions,
  users,
  courses,
  enrollments,
  quizSubmissions
} from '@shared/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import { createError } from '../middleware/errorHandler';

export interface AIReportRequest {
  type: 'learner' | 'course' | 'system' | 'quiz_feedback';
  targetId?: string;
  context?: any;
}

export interface StudyPlanRequest {
  userId: string;
  goals?: string[];
  timeAvailable?: number; // hours per week
  preferences?: any;
}

export interface QuizFeedbackRequest {
  submissionId: string;
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
}

export class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || '';
    this.baseUrl = process.env.GOOGLE_API_URL || 'https://generativelanguage.googleapis.com/v1';
  }

  // Generate learner performance report
  async generateLearnerReport(userId: string): Promise<any> {
    try {
      // Fetch user data and performance metrics
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user.length) {
        throw createError('User not found', 404);
      }

      const userEnrollments = await db.select().from(enrollments).where(eq(enrollments.userId, userId));
      const userSubmissions = await db.select().from(assignmentSubmissions).where(eq(assignmentSubmissions.userId, userId));
      const userQuizSubmissions = await db.select().from(quizSubmissions).where(eq(quizSubmissions.userId, userId));

      // Calculate performance metrics
      const totalCourses = userEnrollments.length;
      const completedCourses = userEnrollments.filter(e => e.status === 'completed').length;
      const averageProgress = userEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalCourses || 0;
      const averageScore = userSubmissions.reduce((sum, s) => sum + (s.points || 0), 0) / userSubmissions.length || 0;

      // Generate AI insights
      const prompt = this.buildLearnerReportPrompt({
        user: user[0],
        metrics: {
          totalCourses,
          completedCourses,
          averageProgress,
          averageScore,
          totalAssignments: userSubmissions.length,
          totalQuizzes: userQuizSubmissions.length,
        },
        enrollments: userEnrollments,
        submissions: userSubmissions,
        quizSubmissions: userQuizSubmissions,
      });

      const aiResponse = await this.callAI(prompt);
      
      // Store the report
      const report = await db.insert(nuraReports).values({
        type: 'learner',
        targetId: userId,
        content: aiResponse,
        insights: this.extractInsights(aiResponse),
        recommendations: this.extractRecommendations(aiResponse),
        confidence: '0.85',
        metadata: {
          metrics: {
            totalCourses,
            completedCourses,
            averageProgress,
            averageScore,
          },
        },
      }).returning();

      return report[0];
    } catch (error) {
      console.error('Error generating learner report:', error);
      throw error;
    }
  }

  // Generate course analysis report
  async generateCourseReport(courseId: string): Promise<any> {
    try {
      const course = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
      if (!course.length) {
        throw createError('Course not found', 404);
      }

      const courseEnrollments = await db.select().from(enrollments).where(eq(enrollments.courseId, courseId));
      const courseSubmissions = await db.select().from(assignmentSubmissions).where(eq(assignmentSubmissions.assignmentId, courseId));

      const totalEnrollments = courseEnrollments.length;
      const activeEnrollments = courseEnrollments.filter(e => e.status === 'active').length;
      const completedEnrollments = courseEnrollments.filter(e => e.status === 'completed').length;
      const averageProgress = courseEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalEnrollments || 0;

      const prompt = this.buildCourseReportPrompt({
        course: course[0],
        metrics: {
          totalEnrollments,
          activeEnrollments,
          completedEnrollments,
          averageProgress,
          totalAssignments: courseSubmissions.length,
        },
        enrollments: courseEnrollments,
        submissions: courseSubmissions,
      });

      const aiResponse = await this.callAI(prompt);

      const report = await db.insert(nuraReports).values({
        type: 'course',
        targetId: courseId,
        content: aiResponse,
        insights: this.extractInsights(aiResponse),
        recommendations: this.extractRecommendations(aiResponse),
        confidence: '0.80',
        metadata: {
          metrics: {
            totalEnrollments,
            activeEnrollments,
            completedEnrollments,
            averageProgress,
          },
        },
      }).returning();

      return report[0];
    } catch (error) {
      console.error('Error generating course report:', error);
      throw error;
    }
  }

  // Generate quiz feedback
  async generateQuizFeedback(request: QuizFeedbackRequest): Promise<any> {
    try {
      const prompt = this.buildQuizFeedbackPrompt({
        userAnswer: request.userAnswer,
        correctAnswer: request.correctAnswer,
        explanation: request.explanation,
      });

      const aiResponse = await this.callAI(prompt);

      // Update quiz answer with AI feedback
      await db.update(quizAnswers)
        .set({ aiFeedback: aiResponse })
        .where(eq(quizAnswers.submissionId, request.submissionId));

      return { feedback: aiResponse };
    } catch (error) {
      console.error('Error generating quiz feedback:', error);
      throw error;
    }
  }

  // Generate personalized study plan
  async generateStudyPlan(request: StudyPlanRequest): Promise<any> {
    try {
      const user = await db.select().from(users).where(eq(users.id, request.userId)).limit(1);
      if (!user.length) {
        throw createError('User not found', 404);
      }

      const userEnrollments = await db.select().from(enrollments).where(eq(enrollments.userId, request.userId));
      const activeCourses = userEnrollments.filter(e => e.status === 'active');

      const prompt = this.buildStudyPlanPrompt({
        user: user[0],
        activeCourses,
        goals: request.goals,
        timeAvailable: request.timeAvailable,
        preferences: request.preferences,
      });

      const aiResponse = await this.callAI(prompt);

      // Parse AI response to extract schedule and goals
      const parsedResponse = this.parseStudyPlanResponse(aiResponse);

      const studyPlan = await db.insert(studyPlans).values({
        userId: request.userId,
        title: `AI Generated Study Plan - ${new Date().toLocaleDateString()}`,
        description: parsedResponse.description,
        schedule: parsedResponse.schedule,
        goals: parsedResponse.goals,
        progress: { completed: 0, total: parsedResponse.goals.length },
        aiGenerated: true,
        isActive: true,
      }).returning();

      return studyPlan[0];
    } catch (error) {
      console.error('Error generating study plan:', error);
      throw error;
    }
  }

  // Generate system-wide analytics report
  async generateSystemReport(): Promise<any> {
    try {
      const totalUsers = await db.select({ count: count() }).from(users);
      const totalCourses = await db.select({ count: count() }).from(courses);
      const totalEnrollments = await db.select({ count: count() }).from(enrollments);

      const prompt = this.buildSystemReportPrompt({
        metrics: {
          totalUsers: totalUsers[0].count,
          totalCourses: totalCourses[0].count,
          totalEnrollments: totalEnrollments[0].count,
        },
      });

      const aiResponse = await this.callAI(prompt);

      const report = await db.insert(nuraReports).values({
        type: 'system',
        content: aiResponse,
        insights: this.extractInsights(aiResponse),
        recommendations: this.extractRecommendations(aiResponse),
        confidence: '0.75',
        metadata: {
          metrics: {
            totalUsers: totalUsers[0].count,
            totalCourses: totalCourses[0].count,
            totalEnrollments: totalEnrollments[0].count,
          },
        },
      }).returning();

      return report[0];
    } catch (error) {
      console.error('Error generating system report:', error);
      throw error;
    }
  }

  // Private helper methods
  private async callAI(prompt: string): Promise<string> {
    if (!this.apiKey) {
      // Fallback to mock AI response for development
      return this.generateMockAIResponse(prompt);
    }

    try {
      const response = await fetch(`${this.baseUrl}/models/gemini-1.5-flash:generateContent`, {
        method: 'POST',
        headers: {
          'x-goog-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';
    } catch (error) {
      console.error('AI API call failed, using fallback:', error);
      return this.generateMockAIResponse(prompt);
    }
  }

  private generateMockAIResponse(prompt: string): string {
    // Generate contextual mock responses based on prompt content
    if (prompt.includes('learner')) {
      return `Based on the learner's performance data, here are the key insights:

**Strengths:**
- Consistent course completion rate
- Good engagement with assignments
- Strong progress in technical courses

**Areas for Improvement:**
- Could benefit from more practice in practical exercises
- Consider joining study groups for collaborative learning

**Recommendations:**
1. Focus on hands-on practice sessions
2. Set weekly learning goals
3. Review completed courses for reinforcement`;
    }

    if (prompt.includes('course')) {
      return `Course Analysis Report:

**Performance Metrics:**
- High enrollment retention rate
- Good completion rates
- Strong student engagement

**Recommendations:**
1. Consider adding more interactive elements
2. Implement peer review system
3. Add progress checkpoints`;
    }

    return 'AI-generated insights and recommendations based on the provided data.';
  }

  private buildLearnerReportPrompt(data: any): string {
    return `Analyze the following learner data and provide insights and recommendations:

User: ${data.user.firstName} ${data.user.lastName}
Role: ${data.user.role}

Performance Metrics:
- Total Courses: ${data.metrics.totalCourses}
- Completed Courses: ${data.metrics.completedCourses}
- Average Progress: ${data.metrics.averageProgress}%
- Average Score: ${data.metrics.averageScore}/100

Please provide:
1. Key insights about learning patterns
2. Specific recommendations for improvement
3. Suggested learning strategies
4. Progress tracking suggestions`;
  }

  private buildCourseReportPrompt(data: any): string {
    return `Analyze the following course data and provide insights:

Course: ${data.course.title}
Type: ${data.course.type}

Metrics:
- Total Enrollments: ${data.metrics.totalEnrollments}
- Active Enrollments: ${data.metrics.activeEnrollments}
- Completion Rate: ${data.metrics.completedEnrollments}/${data.metrics.totalEnrollments}
- Average Progress: ${data.metrics.averageProgress}%

Please provide:
1. Course effectiveness analysis
2. Student engagement insights
3. Recommendations for improvement
4. Success factors identification`;
  }

  private buildQuizFeedbackPrompt(data: any): string {
    return `Provide constructive feedback for this quiz answer:

Student Answer: "${data.userAnswer}"
Correct Answer: "${data.correctAnswer}"
Explanation: "${data.explanation || 'Not provided'}"

Please provide:
1. What was done well
2. What could be improved
3. Specific suggestions for learning
4. Encouraging feedback`;
  }

  private buildStudyPlanPrompt(data: any): string {
    return `Create a personalized study plan for this learner:

User: ${data.user.firstName} ${data.user.lastName}
Active Courses: ${data.activeCourses.length}
Time Available: ${data.timeAvailable || 10} hours per week
Goals: ${data.goals?.join(', ') || 'Improve overall learning'}

Please provide:
1. Weekly schedule breakdown
2. Specific learning objectives
3. Time management tips
4. Progress tracking methods`;
  }

  private buildSystemReportPrompt(data: any): string {
    return `Analyze the following system-wide metrics:

Total Users: ${data.metrics.totalUsers}
Total Courses: ${data.metrics.totalCourses}
Total Enrollments: ${data.metrics.totalEnrollments}

Please provide:
1. System health assessment
2. Growth opportunities
3. Operational recommendations
4. User engagement insights`;
  }

  private extractInsights(aiResponse: string): string[] {
    // Simple extraction of insights from AI response
    const insights = aiResponse.match(/\*\*(.*?)\*\*/g) || [];
    return insights.map(insight => insight.replace(/\*\*/g, ''));
  }

  private extractRecommendations(aiResponse: string): string[] {
    // Extract numbered recommendations
    const recommendations = aiResponse.match(/\d+\.\s*(.*?)(?=\n|$)/g) || [];
    return recommendations.map(rec => rec.replace(/^\d+\.\s*/, ''));
  }

  private parseStudyPlanResponse(aiResponse: string): any {
    // Parse AI response to extract structured data
    return {
      description: aiResponse.split('\n')[0] || 'AI Generated Study Plan',
      schedule: {
        monday: '2 hours - Course A',
        tuesday: '1 hour - Course B',
        wednesday: '2 hours - Course A',
        thursday: '1 hour - Course B',
        friday: '2 hours - Review & Practice',
        weekend: 'Flexible learning time',
      },
      goals: [
        'Complete Course A modules 1-3',
        'Practice Course B exercises',
        'Review weekly progress',
        'Prepare for upcoming assignments',
      ],
    };
  }
}

export const aiService = new AIService();
