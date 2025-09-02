import { Router, Request, Response } from 'express';
import { authMiddleware, roleMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { asyncHandler } from '../middleware/errorHandler';
import { aiService } from '../services/aiService';
import { tagEngine } from '../services/tagEngine';
import { quizService } from '../services/quizService';
import { analyticsService } from '../services/analyticsService';
import { db } from '../db';
import {
  courses,
  users,
  organizations,
  tags,
  nuraReports,
  studyPlans
} from '@shared/schema';
import { desc, sql } from 'drizzle-orm';
import { enrollments } from '@shared/schema';

const router = Router();

// Local helpers to build SQL conditions without relying on specific drizzle helper exports
const eq = (left: any, right: any) => sql`${left} = ${right}`;
const and = (...conditions: any[]) =>
  conditions.reduce((acc: any, curr: any) => (acc ? sql`${acc} and ${curr}` : curr), undefined as any);

// Apply rate limiting to all routes
router.use(rateLimit(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

// ==================== NURA AI ROUTES ====================

// Generate learner performance report
router.post('/nura/learner-report',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.body;
    
    if (!req.user || (req.user.role !== 'admin' && req.user.id !== userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const report = await aiService.generateLearnerReport(userId);
    res.json(report);
  })
);

// Generate course analysis report
router.post('/nura/course-report',
  authMiddleware,
  roleMiddleware(['mentor', 'admin']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { courseId } = req.body;
    
    const report = await aiService.generateCourseReport(courseId);
    res.json(report);
  })
);

// Generate system-wide report
router.post('/nura/system-report',
  authMiddleware,
  roleMiddleware(['admin']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const report = await aiService.generateSystemReport();
    res.json(report);
  })
);

// Generate personalized study plan
router.post('/nura/study-plan',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { goals, timeAvailable, preferences } = req.body;
    
    const studyPlan = await aiService.generateStudyPlan({
      userId: req.user!.id,
      goals,
      timeAvailable,
      preferences,
    });
    
    res.json(studyPlan);
  })
);

// Get AI-generated reports
router.get('/nura/reports',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { type, targetId } = req.query;
    
    const whereConditions = [] as any[];
    
    if (type) {
      whereConditions.push(eq(nuraReports.type, type as any));
    }
    
    if (targetId) {
      whereConditions.push(eq(nuraReports.targetId, targetId as string));
    }
    
    // Users can only see their own reports unless they're admin
    if (req.user!.role !== 'admin') {
      whereConditions.push(eq(nuraReports.targetId, req.user!.id));
    }
    
    const baseQuery = db.select().from(nuraReports);
    const conditionedQuery = whereConditions.length > 0
      ? baseQuery.where(and(...whereConditions))
      : baseQuery;
    const reports = await conditionedQuery.orderBy(desc(nuraReports.createdAt));
    
    res.json(reports);
  })
);

// ==================== TAG ENGINE ROUTES ====================

// Get all tags
router.get('/tags', asyncHandler(async (req: Request, res: Response) => {
  const { category, search } = req.query;
  
  const tagList = await tagEngine.getTags(
    category as string, 
    search as string
  );
  
  res.json(tagList);
}));

// Get popular tags
router.get('/tags/popular', asyncHandler(async (req: Request, res: Response) => {
  const { limit } = req.query;
  
  const popularTags = await tagEngine.getPopularTags(parseInt(limit as string) || 10);
  res.json(popularTags);
}));

// Get course tags
router.get('/courses/:courseId/tags', asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  
  const courseTagList = await tagEngine.getCourseTags(courseId);
  res.json(courseTagList);
}));

// Auto-tag a course
router.post('/courses/:courseId/auto-tag',
  authMiddleware,
  roleMiddleware(['mentor', 'admin']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { courseId } = req.params;
    const { manualTags } = req.body;
    
    // Get course details
    const course = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
    if (!course.length) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const appliedTags = await tagEngine.autoTagCourse({
      courseId,
      title: course[0].title,
      description: course[0].description || undefined,
      manualTags,
    });
    
    res.json(appliedTags);
  })
);

// Suggest tags for a course
router.post('/tags/suggest', asyncHandler(async (req: Request, res: Response) => {
  const { title, description } = req.body;
  
  const suggestions = await tagEngine.suggestTagsForCourse(title, description);
  res.json(suggestions);
}));

// Create a new tag
router.post('/tags',
  authMiddleware,
  roleMiddleware(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, category, description, color } = req.body;
    try {
      const tag = await db.insert(tags).values({
        name,
        category,
        description,
        color,
      }).returning();
      res.status(201).json(tag[0]);
    } catch (err: any) {
      if (err?.code === '23505') {
        return res.status(409).json({ message: 'Tag name already exists' });
      }
      throw err;
    }
  })
);

// Update a tag
router.put('/tags/:tagId',
  authMiddleware,
  roleMiddleware(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const { tagId } = req.params;
    const updates = req.body;
    
    const updatedTag = await tagEngine.updateTag(tagId, updates);
    res.json(updatedTag);
  })
);

// Delete a tag
router.delete('/tags/:tagId',
  authMiddleware,
  roleMiddleware(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const { tagId } = req.params;
    
    await tagEngine.deleteTag(tagId);
    res.status(204).send();
  })
);

// ==================== QUIZ SYSTEM ROUTES ====================

// Create a new quiz
router.post('/quizzes',
  authMiddleware,
  roleMiddleware(['mentor', 'admin']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const quizData = req.body;
    
    const quiz = await quizService.createQuiz(quizData);
    res.status(201).json(quiz);
  })
);

// Get quiz (without answers for students)
router.get('/quizzes/:quizId',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { quizId } = req.params;
    const includeAnswers = req.user!.role === 'admin' || req.user!.role === 'mentor';
    
    const quiz = await quizService.getQuiz(quizId, includeAnswers);
    res.json(quiz);
  })
);

// Submit quiz answers
router.post('/quizzes/:quizId/submit',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { quizId } = req.params;
    const { answers } = req.body;
    
    const result = await quizService.submitQuiz({
      quizId,
      userId: req.user!.id,
      answers,
    });
    
    res.json(result);
  })
);

// Get quiz results
router.get('/quizzes/:quizId/results/:userId',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { quizId, userId } = req.params;
    
    // Users can only see their own results unless they're admin/mentor
    if (req.user!.role !== 'admin' && req.user!.role !== 'mentor' && req.user!.id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const results = await quizService.getQuizResults(quizId, userId);
    res.json(results);
  })
);

// Get quiz analytics
router.get('/quizzes/:quizId/analytics',
  authMiddleware,
  roleMiddleware(['mentor', 'admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const { quizId } = req.params;
    
    // For now, return basic quiz stats since getQuizAnalytics doesn't exist
    const stats = await quizService.getQuizStats(quizId);
    res.json(stats);
  })
);

// Get course quizzes
router.get('/courses/:courseId/quizzes', asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  
  const quizzes = await quizService.getCourseQuizzes(courseId);
  res.json(quizzes);
}));

// Get user quiz history
router.get('/users/:userId/quiz-history',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    
    // Users can only see their own history unless they're admin
    if (req.user!.role !== 'admin' && req.user!.id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const history = await quizService.getUserQuizHistory(userId);
    res.json(history);
  })
);

// Update quiz
router.put('/quizzes/:quizId',
  authMiddleware,
  roleMiddleware(['mentor', 'admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const { quizId } = req.params;
    const updates = req.body;
    
    const updatedQuiz = await quizService.updateQuiz(quizId, updates);
    res.json(updatedQuiz);
  })
);

// Delete quiz
router.delete('/quizzes/:quizId',
  authMiddleware,
  roleMiddleware(['mentor', 'admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const { quizId } = req.params;
    
    await quizService.deleteQuiz(quizId);
    res.status(204).send();
  })
);

// ==================== ANALYTICS ROUTES ====================

// Get course analytics
router.get('/analytics/courses/:courseId',
  authMiddleware,
  roleMiddleware(['mentor', 'admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const { period } = req.query;
    
    const analytics = await analyticsService.getCourseAnalytics({ courseId });
    res.json(analytics);
  })
);

// Get user analytics
router.get('/analytics/users/:userId',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    const { period } = req.query;
    
    // Users can only see their own analytics unless they're admin/mentor
    if (req.user!.role !== 'admin' && req.user!.role !== 'mentor' && req.user!.id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const analytics = await analyticsService.getUserAnalytics({ userId });
    res.json(analytics);
  })
);

// Get organization analytics
router.get('/analytics/organizations/:organizationId',
  authMiddleware,
  roleMiddleware(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.params;
    const { period } = req.query;
    
    // Use getLearningMetrics with organization filter instead
    const analytics = await analyticsService.getLearningMetrics({ organizationId });
    res.json(analytics);
  })
);

// Get system-wide analytics
router.get('/analytics/system',
  authMiddleware,
  roleMiddleware(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const { period } = req.query;
    
    // Use getLearningMetrics for system-wide analytics
    const analytics = await analyticsService.getLearningMetrics();
    res.json(analytics);
  })
);

// Get learning trends
router.get('/analytics/trends',
  authMiddleware,
  roleMiddleware(['mentor', 'admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const { period, startDate, endDate, organizationId } = req.query;
    
    const trends = await analyticsService.getLearningTrends({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      organizationId: organizationId as string,
    }, period as 'daily' | 'weekly' | 'monthly');
    
    res.json(trends);
  })
);

// Get skill gap analysis
router.get('/analytics/skill-gaps',
  authMiddleware,
  roleMiddleware(['mentor', 'admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.query;
    
    const gaps = await analyticsService.getSkillGapAnalysis(organizationId as string);
    res.json(gaps);
  })
);

// Get performance insights
router.get('/analytics/performance',
  authMiddleware,
  roleMiddleware(['mentor', 'admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const filters = req.query;
    
    const insights = await analyticsService.getPerformanceInsights({
      startDate: filters.startDate ? new Date(filters.startDate as string) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate as string) : undefined,
      organizationId: filters.organizationId as string,
    });
    
    res.json(insights);
  })
);

// ==================== ORGANIZATION ROUTES ====================

// Get organizations
router.get('/organizations', asyncHandler(async (req: Request, res: Response) => {
  const orgList = await db.select().from(organizations).orderBy(organizations.name);
  res.json(orgList);
}));

// Get organization by ID
router.get('/organizations/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const orgRows = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  
  if (!orgRows.length) {
    return res.status(404).json({ message: 'Organization not found' });
  }
  
  res.json(orgRows[0]);
}));

// Create organization
router.post('/organizations',
  authMiddleware,
  roleMiddleware(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, type, description, settings } = req.body;
    
    const organization = await db.insert(organizations).values({
      name,
      type,
      description,
      settings,
    }).returning();
    
    res.status(201).json(organization[0]);
  })
);

// Update organization
router.put('/organizations/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    
    const organization = await db.update(organizations)
      .set(updates)
      .where(eq(organizations.id, id))
      .returning();
    
    if (!organization.length) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    res.json(organization[0]);
  })
);

// ==================== STUDY PLANS ROUTES ====================

// Get user's study plans
router.get('/study-plans',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { isActive } = req.query;
    
    const whereConditions = [eq(studyPlans.userId, req.user!.id)];
    
    if (isActive !== undefined) {
      whereConditions.push(eq(studyPlans.isActive, isActive === 'true'));
    }
    
    const plans = await db.select()
      .from(studyPlans)
      .where(and(...whereConditions))
      .orderBy(desc(studyPlans.updatedAt));
    
    res.json(plans);
  })
);

// Get study plan by ID
router.get('/study-plans/:id',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    const plan = await db.select()
      .from(studyPlans)
      .where(and(
        eq(studyPlans.id, id),
        eq(studyPlans.userId, req.user!.id)
      ))
      .limit(1);
    
    if (!plan.length) {
      return res.status(404).json({ message: 'Study plan not found' });
    }
    
    res.json(plan[0]);
  })
);

// Update study plan
router.put('/study-plans/:id',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    
    const plan = await db.update(studyPlans)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(studyPlans.id, id),
        eq(studyPlans.userId, req.user!.id)
      ))
      .returning();
    
    if (!plan.length) {
      return res.status(404).json({ message: 'Study plan not found' });
    }
    
    res.json(plan[0]);
  })
);

// Delete study plan
router.delete('/study-plans/:id',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    await db.delete(studyPlans)
      .where(and(
        eq(studyPlans.id, id),
        eq(studyPlans.userId, req.user!.id)
      ));
    
    res.status(204).send();
  })
);

// Create a new study plan
router.post('/study-plans',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { title, description, goals, schedule } = req.body;
    
    const plan = await db.insert(studyPlans).values({
      userId: req.user!.id,
      title,
      description,
      goals,
      schedule,
    }).returning();
    
    res.status(201).json(plan[0]);
  })
);

// ==================== ENHANCED COURSE ROUTES ====================

// Get courses with enhanced filtering and tagging
router.get('/courses/enhanced', asyncHandler(async (req: Request, res: Response) => {
  const { type, category, search, tags: tagIdsParam, organizationId } = req.query as Record<string, any>;
  
  const whereConditions = [] as any[];
  
  if (type) {
    whereConditions.push(eq(courses.type, type as any));
  }
  
  if (category) {
    whereConditions.push(eq(courses.category, category as string));
  }
  
  if (organizationId) {
    whereConditions.push(eq(courses.organizationId, organizationId as string));
  }
  
  let coursesData = await db.select()
    .from(courses)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .orderBy(desc(courses.createdAt));
  
  // Filter by tags if specified
  if (tagIdsParam) {
    const tagArray = (tagIdsParam as string).split(',');
    coursesData = coursesData.filter(course => {
      const courseTags = Array.isArray(course.tags) ? (course.tags as string[]) : [];
      return tagArray.some(tag => courseTags.includes(tag));
    });
  }
  
  // Search functionality
  if (search) {
    const searchTerm = (search as string).toLowerCase();
    coursesData = coursesData.filter(course =>
      course.title.toLowerCase().includes(searchTerm) ||
      (course.description && course.description.toLowerCase().includes(searchTerm))
    );
  }
  
  // Get tags for each course
  const enhancedCourses = await Promise.all(
    coursesData.map(async (course) => {
      const courseTagList = await tagEngine.getCourseTags(course.id);
      return {
        ...course,
        tags: courseTagList,
      };
    })
  );
  
  res.json(enhancedCourses);
}));

// Get course recommendations based on user preferences
router.get('/courses/recommendations',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { limit = 5 } = req.query;
    
    // Get user's enrolled courses and their tags
    const userEnrollments = await db.select({
      courseId: courses.id,
      tags: courses.tags,
    })
    .from(courses)
    .innerJoin(enrollments, eq(courses.id, enrollments.courseId))
    .where(eq(enrollments.userId, req.user!.id));
    
    // Extract user's preferred tags
    const userTags = new Set<string>();
    userEnrollments.forEach(enrollment => {
      const tagsArray = Array.isArray(enrollment.tags) ? (enrollment.tags as string[]) : [];
      tagsArray.forEach((tag: string) => userTags.add(tag));
    });
    
    // Find courses with similar tags
    const recommendations = await db.select()
      .from(courses)
      .where(and(
        eq(courses.isPublic, true),
        // Not already enrolled
        sql`${courses.id} NOT IN (
          SELECT ${enrollments.courseId} 
          FROM ${enrollments} 
          WHERE ${enrollments.userId} = ${req.user!.id}
        )`
      ))
      .orderBy(desc(courses.createdAt))
      .limit(parseInt(limit as string));
    
    // Score recommendations based on tag similarity
    const scoredRecommendations = recommendations.map(course => {
      let score = 0;
      const courseTags = Array.isArray(course.tags) ? (course.tags as string[]) : [];
      courseTags.forEach((tag: string) => {
        if (userTags.has(tag)) {
          score += 1;
        }
      });
      return { ...course, recommendationScore: score };
    });
    
    // Sort by recommendation score
    scoredRecommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);
    
    res.json(scoredRecommendations.slice(0, parseInt(limit as string)));
  })
);

export default router;
