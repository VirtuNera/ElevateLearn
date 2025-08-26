import { db } from '../db';
import { 
  users, 
  courses, 
  enrollments, 
  assignments, 
  assignmentSubmissions,
  quizzes,
  quizSubmissions,
  certifications,
  nuraReports,
  systemMetrics
} from '@shared/schema';
import { eq, and, desc, count, gte, lte, sql } from 'drizzle-orm';
import { createError } from '../middleware/errorHandler';

export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  organizationId?: string;
  courseId?: string;
  userId?: string;
}

export interface LearningMetrics {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  completionRate: number;
  averageProgress: number;
  averageScore: number;
  activeUsers: number;
}

export interface CourseAnalytics {
  courseId: string;
  title: string;
  enrollments: number;
  completions: number;
  averageProgress: number;
  averageScore: number;
  timeToComplete: number; // in days
  satisfactionScore?: number;
}

export interface UserAnalytics {
  userId: string;
  firstName: string;
  lastName: string;
  totalCourses: number;
  completedCourses: number;
  averageProgress: number;
  averageScore: number;
  timeSpent: number; // in hours
  certifications: number;
}

export interface TrendData {
  period: string;
  enrollments: number;
  completions: number;
  newUsers: number;
  activeUsers: number;
}

export class AnalyticsService {
  // Get overall learning metrics
  async getLearningMetrics(filters: AnalyticsFilters = {}): Promise<LearningMetrics> {
    try {
      const whereConditions = this.buildWhereConditions(filters);

      const [
        totalUsers,
        totalCourses,
        totalEnrollments,
        completedEnrollments,
        activeEnrollments,
        averageProgress,
        averageScore,
        activeUsers
      ] = await Promise.all([
        this.getTotalUsers(whereConditions),
        this.getTotalCourses(whereConditions),
        this.getTotalEnrollments(whereConditions),
        this.getCompletedEnrollments(whereConditions),
        this.getActiveEnrollments(whereConditions),
        this.getAverageProgress(whereConditions),
        this.getAverageScore(whereConditions),
        this.getActiveUsers(filters),
      ]);

      const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

      return {
        totalUsers,
        totalCourses,
        totalEnrollments,
        completionRate: Math.round(completionRate * 100) / 100,
        averageProgress: Math.round(averageProgress * 100) / 100,
        averageScore: Math.round(averageScore * 100) / 100,
        activeUsers,
      };
    } catch (error) {
      console.error('Error fetching learning metrics:', error);
      throw error;
    }
  }

  // Get course-specific analytics
  async getCourseAnalytics(filters: AnalyticsFilters = {}): Promise<CourseAnalytics[]> {
    try {
      const whereConditions = this.buildWhereConditions(filters);
      
      const coursesData = await db.select({
        id: courses.id,
        title: courses.title,
        type: courses.type,
        createdAt: courses.createdAt,
      })
      .from(courses)
      .where(whereConditions.courseCondition);

      const courseAnalytics: CourseAnalytics[] = [];

      for (const course of coursesData) {
        const courseFilters = { ...filters, courseId: course.id };
        const courseWhereConditions = this.buildWhereConditions(courseFilters);

        const [
          enrollments,
          completions,
          averageProgress,
          averageScore,
          timeToComplete
        ] = await Promise.all([
          this.getCourseEnrollments(course.id),
          this.getCourseCompletions(course.id),
          this.getCourseAverageProgress(course.id),
          this.getCourseAverageScore(course.id),
          this.getCourseTimeToComplete(course.id),
        ]);

        courseAnalytics.push({
          courseId: course.id,
          title: course.title,
          enrollments,
          completions,
          averageProgress: Math.round(averageProgress * 100) / 100,
          averageScore: Math.round(averageScore * 100) / 100,
          timeToComplete: Math.round(timeToComplete * 100) / 100,
        });
      }

      return courseAnalytics.sort((a, b) => b.enrollments - a.enrollments);
    } catch (error) {
      console.error('Error fetching course analytics:', error);
      throw error;
    }
  }

  // Get user-specific analytics
  async getUserAnalytics(filters: AnalyticsFilters = {}): Promise<UserAnalytics[]> {
    try {
      const whereConditions = this.buildWhereConditions(filters);
      
      const usersData = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(whereConditions.userCondition);

      const userAnalytics: UserAnalytics[] = [];

      for (const user of usersData) {
        const userFilters = { ...filters, userId: user.id };
        const userWhereConditions = this.buildWhereConditions(userFilters);

        const [
          totalCourses,
          completedCourses,
          averageProgress,
          averageScore,
          timeSpent,
          certifications
        ] = await Promise.all([
          this.getUserTotalCourses(user.id),
          this.getUserCompletedCourses(user.id),
          this.getUserAverageProgress(user.id),
          this.getUserAverageScore(user.id),
          this.getUserTimeSpent(user.id),
          this.getUserCertifications(user.id),
        ]);

        userAnalytics.push({
          userId: user.id,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          totalCourses,
          completedCourses,
          averageProgress: Math.round(averageProgress * 100) / 100,
          averageScore: Math.round(averageScore * 100) / 100,
          timeSpent: Math.round(timeSpent * 100) / 100,
          certifications,
        });
      }

      return userAnalytics.sort((a, b) => b.averageProgress - a.averageProgress);
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  }

  // Get learning trends over time
  async getLearningTrends(filters: AnalyticsFilters = {}, period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<TrendData[]> {
    try {
      const whereConditions = this.buildWhereConditions(filters);
      const trends: TrendData[] = [];

      // Generate date periods
      const periods = this.generateDatePeriods(filters.startDate, filters.endDate, period);

      for (const periodData of periods) {
        const periodFilters = {
          ...filters,
          startDate: periodData.start,
          endDate: periodData.end,
        };
        const periodWhereConditions = this.buildWhereConditions(periodFilters);

        const [
          enrollments,
          completions,
          newUsers,
          activeUsers
        ] = await Promise.all([
          this.getPeriodEnrollments(periodWhereConditions),
          this.getPeriodCompletions(periodWhereConditions),
          this.getPeriodNewUsers(periodWhereConditions),
          this.getPeriodActiveUsers(periodWhereConditions),
        ]);

        trends.push({
          period: periodData.label,
          enrollments,
          completions,
          newUsers,
          activeUsers,
        });
      }

      return trends;
    } catch (error) {
      console.error('Error fetching learning trends:', error);
      throw error;
    }
  }

  // Get skill gap analysis
  async getSkillGapAnalysis(organizationId?: string): Promise<any> {
    try {
      // This would typically involve more complex analysis
      // For now, we'll provide a basic implementation
      const coursesData = await db.select({
        id: courses.id,
        title: courses.title,
        category: courses.category,
        enrollments: count(enrollments.id),
        completions: count(enrollments.id),
      })
      .from(courses)
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .where(organizationId ? eq(courses.organizationId, organizationId) : undefined)
      .groupBy(courses.id, courses.title, courses.category);

      const skillGaps = coursesData
        .filter(course => course.enrollments < 10) // Low enrollment courses
        .map(course => ({
          skill: course.category || 'Uncategorized',
          course: course.title,
          gap: 'Low enrollment',
          recommendation: 'Consider promoting this course or updating content',
        }));

      return skillGaps;
    } catch (error) {
      console.error('Error fetching skill gap analysis:', error);
      throw error;
    }
  }

  // Get performance insights
  async getPerformanceInsights(filters: AnalyticsFilters = {}): Promise<any> {
    try {
      const whereConditions = this.buildWhereConditions(filters);

      const [
        topPerformers,
        strugglingLearners,
        courseEffectiveness,
        timeAnalysis
      ] = await Promise.all([
        this.getTopPerformers(whereConditions),
        this.getStrugglingLearners(whereConditions),
        this.getCourseEffectiveness(whereConditions),
        this.getTimeAnalysis(whereConditions),
      ]);

      return {
        topPerformers,
        strugglingLearners,
        courseEffectiveness,
        timeAnalysis,
      };
    } catch (error) {
      console.error('Error fetching performance insights:', error);
      throw error;
    }
  }

  // Store system metrics
  async storeSystemMetrics(metrics: Record<string, any>): Promise<void> {
    try {
      const timestamp = new Date();
      
      for (const [key, value] of Object.entries(metrics)) {
        await db.insert(systemMetrics).values({
          metric: key,
          value: value,
          timestamp,
        });
      }
    } catch (error) {
      console.error('Error storing system metrics:', error);
      throw error;
    }
  }

  // Get stored system metrics
  async getSystemMetrics(metric: string, days: number = 30): Promise<any[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const metrics = await db.select()
        .from(systemMetrics)
        .where(and(
          eq(systemMetrics.metric, metric),
          gte(systemMetrics.timestamp, cutoffDate)
        ))
        .orderBy(systemMetrics.timestamp);

      return metrics;
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      throw error;
    }
  }

  // Private helper methods
  private buildWhereConditions(filters: AnalyticsFilters) {
    const conditions: any = {};
    
    if (filters.organizationId) {
      conditions.organizationCondition = eq(courses.organizationId, filters.organizationId);
    }
    
    if (filters.courseId) {
      conditions.courseCondition = eq(courses.id, filters.courseId);
    }
    
    if (filters.userId) {
      conditions.userCondition = eq(users.id, filters.userId);
    }

    if (filters.startDate || filters.endDate) {
      conditions.dateCondition = this.buildDateCondition(filters.startDate, filters.endDate);
    }

    return conditions;
  }

  private buildDateCondition(startDate?: Date, endDate?: Date) {
    const conditions = [];
    
    if (startDate) {
      conditions.push(gte(courses.createdAt, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(courses.createdAt, endDate));
    }
    
    return conditions.length > 0 ? conditions : undefined;
  }

  private generateDatePeriods(startDate?: Date, endDate?: Date, period: string) {
    const periods = [];
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate || new Date();
    
    let current = new Date(start);
    
    while (current <= end) {
      const periodStart = new Date(current);
      let periodEnd: Date;
      let label: string;
      
      switch (period) {
        case 'daily':
          periodEnd = new Date(current);
          periodEnd.setDate(periodEnd.getDate() + 1);
          label = current.toLocaleDateString();
          current.setDate(current.getDate() + 1);
          break;
          
        case 'weekly':
          periodEnd = new Date(current);
          periodEnd.setDate(periodEnd.getDate() + 7);
          label = `Week ${current.getWeek()}`;
          current.setDate(current.getDate() + 7);
          break;
          
        case 'monthly':
          periodEnd = new Date(current);
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          label = current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          current.setMonth(current.getMonth() + 1);
          break;
          
        default:
          periodEnd = new Date(current);
          periodEnd.setDate(periodEnd.getDate() + 1);
          label = current.toLocaleDateString();
          current.setDate(current.getDate() + 1);
      }
      
      periods.push({
        start: periodStart,
        end: periodEnd,
        label,
      });
    }
    
    return periods;
  }

  // Helper methods for fetching specific metrics
  private async getTotalUsers(whereConditions: any): Promise<number> {
    const result = await db.select({ count: count() }).from(users);
    return result[0].count;
  }

  private async getTotalCourses(whereConditions: any): Promise<number> {
    const result = await db.select({ count: count() }).from(courses);
    return result[0].count;
  }

  private async getTotalEnrollments(whereConditions: any): Promise<number> {
    const result = await db.select({ count: count() }).from(enrollments);
    return result[0].count;
  }

  private async getCompletedEnrollments(whereConditions: any): Promise<number> {
    const result = await db.select({ count: count() })
      .from(enrollments)
      .where(eq(enrollments.status, 'completed'));
    return result[0].count;
  }

  private async getActiveEnrollments(whereConditions: any): Promise<number> {
    const result = await db.select({ count: count() })
      .from(enrollments)
      .where(eq(enrollments.status, 'active'));
    return result[0].count;
  }

  private async getAverageProgress(whereConditions: any): Promise<number> {
    const result = await db.select({ avg: sql`AVG(${enrollments.progress})` }).from(enrollments);
    return result[0].avg || 0;
  }

  private async getAverageScore(whereConditions: any): Promise<number> {
    const result = await db.select({ avg: sql`AVG(${assignmentSubmissions.points})` })
      .from(assignmentSubmissions);
    return result[0].avg || 0;
  }

  private async getActiveUsers(filters: AnalyticsFilters): Promise<number> {
    // Users who have been active in the last 30 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    const result = await db.select({ count: count() })
      .from(enrollments)
      .where(gte(enrollments.lastAccessedAt || enrollments.enrolledAt, cutoffDate));
    
    return result[0].count;
  }

  // Course-specific metrics
  private async getCourseEnrollments(courseId: string): Promise<number> {
    const result = await db.select({ count: count() })
      .from(enrollments)
      .where(eq(enrollments.courseId, courseId));
    return result[0].count;
  }

  private async getCourseCompletions(courseId: string): Promise<number> {
    const result = await db.select({ count: count() })
      .from(enrollments)
      .where(and(
        eq(enrollments.courseId, courseId),
        eq(enrollments.status, 'completed')
      ));
    return result[0].count;
  }

  private async getCourseAverageProgress(courseId: string): Promise<number> {
    const result = await db.select({ avg: sql`AVG(${enrollments.progress})` })
      .from(enrollments)
      .where(eq(enrollments.courseId, courseId));
    return result[0].avg || 0;
  }

  private async getCourseAverageScore(courseId: string): Promise<number> {
    const result = await db.select({ avg: sql`AVG(${assignmentSubmissions.points})` })
      .from(assignmentSubmissions)
      .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
      .where(eq(assignments.courseId, courseId));
    return result[0].avg || 0;
  }

  private async getCourseTimeToComplete(courseId: string): Promise<number> {
    const result = await db.select({
      avg: sql`AVG(EXTRACT(EPOCH FROM (${enrollments.completedAt} - ${enrollments.enrolledAt})) / 86400)`
    })
    .from(enrollments)
    .where(and(
      eq(enrollments.courseId, courseId),
      eq(enrollments.status, 'completed')
    ));
    return result[0].avg || 0;
  }

  // User-specific metrics
  private async getUserTotalCourses(userId: string): Promise<number> {
    const result = await db.select({ count: count() })
      .from(enrollments)
      .where(eq(enrollments.userId, userId));
    return result[0].count;
  }

  private async getUserCompletedCourses(userId: string): Promise<number> {
    const result = await db.select({ count: count() })
      .from(enrollments)
      .where(and(
        eq(enrollments.userId, userId),
        eq(enrollments.status, 'completed')
      ));
    return result[0].count;
  }

  private async getUserAverageProgress(userId: string): Promise<number> {
    const result = await db.select({ avg: sql`AVG(${enrollments.progress})` })
      .from(enrollments)
      .where(eq(enrollments.userId, userId));
    return result[0].avg || 0;
  }

  private async getUserAverageScore(userId: string): Promise<number> {
    const result = await db.select({ avg: sql`AVG(${assignmentSubmissions.points})` })
      .from(assignmentSubmissions)
      .where(eq(assignmentSubmissions.userId, userId));
    return result[0].avg || 0;
  }

  private async getUserTimeSpent(userId: string): Promise<number> {
    const result = await db.select({ sum: sql`SUM(${enrollments.timeSpent})` })
      .from(enrollments)
      .where(eq(enrollments.userId, userId));
    return (result[0].sum || 0) / 60; // Convert minutes to hours
  }

  private async getUserCertifications(userId: string): Promise<number> {
    const result = await db.select({ count: count() })
      .from(certifications)
      .where(eq(certifications.userId, userId));
    return result[0].count;
  }

  // Period-specific metrics
  private async getPeriodEnrollments(whereConditions: any): Promise<number> {
    const result = await db.select({ count: count() }).from(enrollments);
    return result[0].count;
  }

  private async getPeriodCompletions(whereConditions: any): Promise<number> {
    const result = await db.select({ count: count() })
      .from(enrollments)
      .where(eq(enrollments.status, 'completed'));
    return result[0].count;
  }

  private async getPeriodNewUsers(whereConditions: any): Promise<number> {
    const result = await db.select({ count: count() }).from(users);
    return result[0].count;
  }

  private async getPeriodActiveUsers(whereConditions: any): Promise<number> {
    const result = await db.select({ count: count() }).from(enrollments);
    return result[0].count;
  }

  // Performance analysis methods
  private async getTopPerformers(whereConditions: any): Promise<any[]> {
    // Implementation for top performers
    return [];
  }

  private async getStrugglingLearners(whereConditions: any): Promise<any[]> {
    // Implementation for struggling learners
    return [];
  }

  private async getCourseEffectiveness(whereConditions: any): Promise<any[]> {
    // Implementation for course effectiveness
    return [];
  }

  private async getTimeAnalysis(whereConditions: any): Promise<any[]> {
    // Implementation for time analysis
    return [];
  }
}

// Extend Date prototype for week calculation
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function() {
  const d = new Date(this.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
};

export const analyticsService = new AnalyticsService();
