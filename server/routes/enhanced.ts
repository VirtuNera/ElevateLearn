import { Router } from 'express';
import { authMiddleware, roleMiddleware, organizationMiddleware, AuthenticatedRequest } from '../middleware/auth';
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
import { eq, and, desc, count } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { enrollments } from '@shared/schema';

const router = Router();

// Apply rate limiting to all routes
router.use(rateLimit(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

// ==================== NURA AI ROUTES ====================

// Generate learner performance report
router.post('/nura/learner-report', 
  authMiddleware, 
  asyncHandler(async (req: AuthenticatedRequest, res) => {
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
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { courseId } = req.body;
    
    const report = await aiService.generateCourseReport(courseId);
    res.json(report);
  })
);

// Generate system-wide report
router.post('/nura/system-report', 
  authMiddleware, 
  roleMiddleware(['admin']),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const report = await aiService.generateSystemReport();
    res.json(report);
  })
);

// Generate personalized study plan
router.post('/nura/study-plan', 
  authMiddleware, 
  asyncHandler(async (req: AuthenticatedRequest, res) => {
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
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { type, targetId } = req.query;
    
    let whereConditions = [];
    
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
    
    const reports = await db.select()
      .from(nuraReports)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(nuraReports.createdAt));
    
    res.json(reports);
  })
);

// ==================== TAG ENGINE ROUTES ====================

// Get all tags
router.get('/tags', asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  
  const tags = await tagEngine.getTags(
    category as string, 
    search as string
  );
  
  res.json(tags);
}));

// Get popular tags
router.get('/tags/popular', asyncHandler(async (req, res) => {
  const { limit } = req.query;
  
  const tags = await tagEngine.getPopularTags(parseInt(limit as string) || 10);
  res.json(tags);
}));

// Get course tags
router.get('/courses/:courseId/tags', asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  
  const tags = await tagEngine.getCourseTags(courseId);
  res.json(tags);
}));

// Auto-tag a course
router.post('/courses/:courseId/auto-tag', 
  authMiddleware, 
  roleMiddleware(['mentor', 'admin']),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
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
      description: course[0].description,
      manualTags,
    });
    
    res.json(appliedTags);
  })
);

// Suggest tags for a course
router.post('/tags/suggest', asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  
  const suggestions = await tagEngine.suggestTagsForCourse(title, description);
  res.json(suggestions);
}));

// Create a new tag
router.post('/tags', 
  authMiddleware, 
  roleMiddleware(['admin']),
  asyncHandler(async (req, res) => {
    const { name, category, description, color } = req.body;
    
    const tag = await db.insert(tags).values({
      name,
      category,
      description,
      color,
    }).returning();
    
    res.status(201).json(tag[0]);
  })
);

// Update a tag
router.put('/tags/:tagId', 
  authMiddleware, 
  roleMiddleware(['admin']),
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const quizData = req.body;
    
    const quiz = await quizService.createQuiz(quizData);
    res.status(201).json(quiz);
  })
);

// Get quiz (without answers for students)
router.get('/quizzes/:quizId', 
  authMiddleware, 
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { quizId } = req.params;
    const includeAnswers = req.user!.role === 'admin' || req.user!.role === 'mentor';
    
    const quiz = await quizService.getQuiz(quizId, includeAnswers);
    res.json(quiz);
  })
);

// Submit quiz answers
router.post('/quizzes/:quizId/submit', 
  authMiddleware, 
  asyncHandler(async (req: AuthenticatedRequest, res) => {
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
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { quizId, userId } = req.params;
    
    // Users can only see their own results unless they're admin/mentor
    if (req.user!.role !== 'admin' && req.user!.role !== 'mentor' && req.user!.id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const results = await quizService.getQuizResults(quizId, userId);
    res.json(results);
  })
);

// Get quiz statistics
router.get('/quizzes/:quizId/stats', 
  authMiddleware, 
  roleMiddleware(['mentor', 'admin']),
  asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    
    const stats = await quizService.getQuizStats(quizId);
    res.json(stats);
  })
);

// Get course quizzes
router.get('/courses/:courseId/quizzes', asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  
  const quizzes = await quizService.getCourseQuizzes(courseId);
  res.json(quizzes);
}));

// Get user quiz history
router.get('/users/:userId/quiz-history', 
  authMiddleware, 
  asyncHandler(async (req: AuthenticatedRequest, res) => {
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
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    
    await quizService.deleteQuiz(quizId);
    res.status(204).send();
  })
);

// ==================== ANALYTICS ROUTES ====================

// Get learning metrics
router.get('/analytics/metrics', 
  authMiddleware, 
  roleMiddleware(['mentor', 'admin']),
  asyncHandler(async (req, res) => {
    const filters = req.query;
    
    const metrics = await analyticsService.getLearningMetrics({
      startDate: filters.startDate ? new Date(filters.startDate as string) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate as string) : undefined,
      organizationId: filters.organizationId as string,
    });
    
    res.json(metrics);
  })
);

// Get course analytics
router.get('/analytics/courses', 
  authMiddleware, 
  roleMiddleware(['mentor', 'admin']),
  asyncHandler(async (req, res) => {
    const filters = req.query;
    
    const analytics = await analyticsService.getCourseAnalytics({
      startDate: filters.startDate ? new Date(filters.startDate as string) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate as string) : undefined,
      organizationId: filters.organizationId as string,
    });
    
    res.json(analytics);
  })
);

// Get user analytics
router.get('/analytics/users', 
  authMiddleware, 
  roleMiddleware(['mentor', 'admin']),
  asyncHandler(async (req, res) => {
    const filters = req.query;
    
    const analytics = await analyticsService.getUserAnalytics({
      startDate: filters.startDate ? new Date(filters.startDate as string) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate as string) : undefined,
      organizationId: filters.organizationId as string,
    });
    
    res.json(analytics);
  })
);

// Get learning trends
router.get('/analytics/trends', 
  authMiddleware, 
  roleMiddleware(['mentor', 'admin']),
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
    const { organizationId } = req.query;
    
    const gaps = await analyticsService.getSkillGapAnalysis(organizationId as string);
    res.json(gaps);
  })
);

// Get performance insights
router.get('/analytics/performance', 
  authMiddleware, 
  roleMiddleware(['mentor', 'admin']),
  asyncHandler(async (req, res) => {
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
router.get('/organizations', asyncHandler(async (req, res) => {
  const organizations = await db.select().from(organizations).orderBy(organizations.name);
  res.json(organizations);
}));

// Get organization by ID
router.get('/organizations/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const organization = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  
  if (!organization.length) {
    return res.status(404).json({ message: 'Organization not found' });
  }
  
  res.json(organization[0]);
}));

// Create organization
router.post('/organizations', 
  authMiddleware, 
  roleMiddleware(['admin']),
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { isActive } = req.query;
    
    let whereConditions = [eq(studyPlans.userId, req.user!.id)];
    
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
  asyncHandler(async (req: AuthenticatedRequest, res) => {
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
  asyncHandler(async (req: AuthenticatedRequest, res) => {
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
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    
    await db.delete(studyPlans)
      .where(and(
        eq(studyPlans.id, id),
        eq(studyPlans.userId, req.user!.id)
      ));
    
    res.status(204).send();
  })
);

// ==================== ENHANCED COURSE ROUTES ====================

// Get courses with enhanced filtering and tagging
router.get('/courses/enhanced', asyncHandler(async (req, res) => {
  const { type, category, search, tags, organizationId } = req.query;
  
  let whereConditions = [];
  
  if (type) {
    whereConditions.push(eq(courses.type, type as any));
  }
  
  if (category) {
    whereConditions.push(eq(courses.category, category as string));
  }
  
  if (organizationId) {
    whereConditions.push(eq(courses.organizationId, organizationId as string));
  }
  
  let query = db.select().from(courses);
  
  if (whereConditions.length > 0) {
    query = query.where(and(...whereConditions));
  }
  
  let coursesData = await query.orderBy(desc(courses.createdAt));
  
  // Filter by tags if specified
  if (tags) {
    const tagArray = (tags as string).split(',');
    coursesData = coursesData.filter(course => {
      const courseTags = course.tags || [];
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
      const courseTags = await tagEngine.getCourseTags(course.id);
      return {
        ...course,
        tags: courseTags,
      };
    })
  );
  
  res.json(enhancedCourses);
}));

// Get course recommendations based on user preferences
router.get('/courses/recommendations', 
  authMiddleware, 
  asyncHandler(async (req: AuthenticatedRequest, res) => {
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
      if (enrollment.tags) {
        enrollment.tags.forEach((tag: string) => userTags.add(tag));
      }
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
      if (course.tags) {
        course.tags.forEach((tag: string) => {
          if (userTags.has(tag)) {
            score += 1;
          }
        });
      }
      return { ...course, recommendationScore: score };
    });
    
    // Sort by recommendation score
    scoredRecommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);
    
    res.json(scoredRecommendations.slice(0, parseInt(limit as string)));
  })
);

export default router;
