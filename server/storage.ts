import {
  users,
  courses,
  enrollments,
  assignments,
  assignmentSubmissions,
  certifications,
  messages,
  notifications,
  courseModules,
  type User,
  type UpsertUser,
  type Course,
  type Enrollment,
  type Assignment,
  type AssignmentSubmission,
  type Certification,
  type Message,
  type Notification,
  type InsertCourse,
  type InsertEnrollment,
  type InsertAssignment,
  type InsertAssignmentSubmission,
  type InsertCertification,
  type InsertMessage,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, like, or, count, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Course operations
  createCourse(course: InsertCourse): Promise<Course>;
  getCourses(filters?: { type?: string; category?: string; search?: string }): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  getCoursesByMentor(mentorId: string): Promise<Course[]>;
  updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<boolean>;

  // Enrollment operations
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  getEnrollmentsByUser(userId: string): Promise<(Enrollment & { course: Course })[]>;
  getEnrollmentsByCourse(courseId: string): Promise<(Enrollment & { user: User })[]>;
  updateEnrollmentProgress(enrollmentId: string, progress: number): Promise<Enrollment | undefined>;
  completeEnrollment(enrollmentId: string): Promise<Enrollment | undefined>;

  // Assignment operations
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  getAssignmentsByCourse(courseId: string): Promise<Assignment[]>;
  getAssignment(id: string): Promise<Assignment | undefined>;
  submitAssignment(submission: InsertAssignmentSubmission): Promise<AssignmentSubmission>;
  gradeAssignment(submissionId: string, points: number, feedback?: string): Promise<AssignmentSubmission | undefined>;
  getSubmissionsByAssignment(assignmentId: string): Promise<(AssignmentSubmission & { user: User })[]>;
  getUserSubmissions(userId: string): Promise<(AssignmentSubmission & { assignment: Assignment })[]>;

  // Certification operations
  createCertification(certification: InsertCertification): Promise<Certification>;
  getCertificationsByUser(userId: string): Promise<Certification[]>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByUser(userId: string): Promise<(Message & { sender: User; recipient: User })[]>;
  markMessageAsRead(messageId: string): Promise<boolean>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string): Promise<boolean>;

  // Analytics operations
  getCoursesCount(): Promise<number>;
  getActiveEnrollmentsCount(): Promise<number>;
  getCompletedEnrollmentsCount(): Promise<number>;
  getCertificationsCount(): Promise<number>;

  // Admin-specific operations
  getAllUsers(filters?: { role?: string; search?: string }): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User | undefined>;
  deleteUser(userId: string): Promise<boolean>;
  getPendingCourses(): Promise<Course[]>;
  approveCourse(courseId: string): Promise<Course | undefined>;
  rejectCourse(courseId: string): Promise<boolean>;
  getAnalyticsData(): Promise<{
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
  }>;

  // Mentor-specific operations
  getStudentsByMentor(mentorId: string): Promise<(User & { enrollments: (Enrollment & { course: Course })[] })[]>;
  getAssignmentsByMentor(mentorId: string): Promise<(Assignment & { course: Course; submissions: AssignmentSubmission[] })[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Course operations
  async createCourse(courseData: InsertCourse): Promise<Course> {
    const [course] = await db.insert(courses).values(courseData).returning();
    return course;
  }

  async getCourses(filters?: { type?: string; category?: string; search?: string }): Promise<Course[]> {
    let query = db.select().from(courses).where(eq(courses.isPublic, true));
    
    if (filters?.type) {
      query = query.where(eq(courses.type, filters.type as any));
    }
    
    if (filters?.category) {
      query = query.where(eq(courses.category, filters.category));
    }
    
    if (filters?.search) {
      query = query.where(
        or(
          like(courses.title, `%${filters.search}%`),
          like(courses.description, `%${filters.search}%`)
        )
      );
    }
    
    return await query.orderBy(desc(courses.createdAt));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getCoursesByMentor(mentorId: string): Promise<Course[]> {
    return await db.select().from(courses)
      .where(eq(courses.mentorId, mentorId))
      .orderBy(desc(courses.createdAt));
  }

  async updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course | undefined> {
    const [course] = await db.update(courses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return course;
  }

  async deleteCourse(id: string): Promise<boolean> {
    const result = await db.delete(courses).where(eq(courses.id, id));
    return result.rowCount > 0;
  }

  // Enrollment operations
  async createEnrollment(enrollmentData: InsertEnrollment): Promise<Enrollment> {
    const [enrollment] = await db.insert(enrollments).values(enrollmentData).returning();
    return enrollment;
  }

  async getEnrollmentsByUser(userId: string): Promise<(Enrollment & { course: Course })[]> {
    return await db.select({
      id: enrollments.id,
      userId: enrollments.userId,
      courseId: enrollments.courseId,
      status: enrollments.status,
      progress: enrollments.progress,
      enrolledAt: enrollments.enrolledAt,
      completedAt: enrollments.completedAt,
      course: courses,
    })
    .from(enrollments)
    .leftJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.userId, userId))
    .orderBy(desc(enrollments.enrolledAt));
  }

  async getEnrollmentsByCourse(courseId: string): Promise<(Enrollment & { user: User })[]> {
    return await db.select({
      id: enrollments.id,
      userId: enrollments.userId,
      courseId: enrollments.courseId,
      status: enrollments.status,
      progress: enrollments.progress,
      enrolledAt: enrollments.enrolledAt,
      completedAt: enrollments.completedAt,
      user: users,
    })
    .from(enrollments)
    .leftJoin(users, eq(enrollments.userId, users.id))
    .where(eq(enrollments.courseId, courseId))
    .orderBy(desc(enrollments.enrolledAt));
  }

  async updateEnrollmentProgress(enrollmentId: string, progress: number): Promise<Enrollment | undefined> {
    const [enrollment] = await db.update(enrollments)
      .set({ progress })
      .where(eq(enrollments.id, enrollmentId))
      .returning();
    return enrollment;
  }

  async completeEnrollment(enrollmentId: string): Promise<Enrollment | undefined> {
    const [enrollment] = await db.update(enrollments)
      .set({ 
        status: 'completed',
        progress: 100,
        completedAt: new Date()
      })
      .where(eq(enrollments.id, enrollmentId))
      .returning();
    return enrollment;
  }

  // Assignment operations
  async createAssignment(assignmentData: InsertAssignment): Promise<Assignment> {
    const [assignment] = await db.insert(assignments).values(assignmentData).returning();
    return assignment;
  }

  async getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    return await db.select().from(assignments)
      .where(eq(assignments.courseId, courseId))
      .orderBy(asc(assignments.dueDate));
  }

  async getAssignment(id: string): Promise<Assignment | undefined> {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    return assignment;
  }

  async submitAssignment(submissionData: InsertAssignmentSubmission): Promise<AssignmentSubmission> {
    const [submission] = await db.insert(assignmentSubmissions)
      .values({ ...submissionData, status: 'submitted' })
      .returning();
    return submission;
  }

  async gradeAssignment(submissionId: string, points: number, feedback?: string): Promise<AssignmentSubmission | undefined> {
    const [submission] = await db.update(assignmentSubmissions)
      .set({ 
        points,
        feedback,
        status: 'graded',
        gradedAt: new Date()
      })
      .where(eq(assignmentSubmissions.id, submissionId))
      .returning();
    return submission;
  }

  async getSubmissionsByAssignment(assignmentId: string): Promise<(AssignmentSubmission & { user: User })[]> {
    return await db.select({
      id: assignmentSubmissions.id,
      assignmentId: assignmentSubmissions.assignmentId,
      userId: assignmentSubmissions.userId,
      content: assignmentSubmissions.content,
      fileUrl: assignmentSubmissions.fileUrl,
      status: assignmentSubmissions.status,
      points: assignmentSubmissions.points,
      feedback: assignmentSubmissions.feedback,
      submittedAt: assignmentSubmissions.submittedAt,
      gradedAt: assignmentSubmissions.gradedAt,
      user: users,
    })
    .from(assignmentSubmissions)
    .leftJoin(users, eq(assignmentSubmissions.userId, users.id))
    .where(eq(assignmentSubmissions.assignmentId, assignmentId))
    .orderBy(desc(assignmentSubmissions.submittedAt));
  }

  async getUserSubmissions(userId: string): Promise<(AssignmentSubmission & { assignment: Assignment })[]> {
    return await db.select({
      id: assignmentSubmissions.id,
      assignmentId: assignmentSubmissions.assignmentId,
      userId: assignmentSubmissions.userId,
      content: assignmentSubmissions.content,
      fileUrl: assignmentSubmissions.fileUrl,
      status: assignmentSubmissions.status,
      points: assignmentSubmissions.points,
      feedback: assignmentSubmissions.feedback,
      submittedAt: assignmentSubmissions.submittedAt,
      gradedAt: assignmentSubmissions.gradedAt,
      assignment: assignments,
    })
    .from(assignmentSubmissions)
    .leftJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
    .where(eq(assignmentSubmissions.userId, userId))
    .orderBy(desc(assignmentSubmissions.submittedAt));
  }

  // Certification operations
  async createCertification(certificationData: InsertCertification): Promise<Certification> {
    const [certification] = await db.insert(certifications).values(certificationData).returning();
    return certification;
  }

  async getCertificationsByUser(userId: string): Promise<Certification[]> {
    return await db.select().from(certifications)
      .where(eq(certifications.userId, userId))
      .orderBy(desc(certifications.issuedAt));
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }

  async getMessagesByUser(userId: string): Promise<(Message & { sender: User; recipient: User })[]> {
    return await db.select({
      id: messages.id,
      senderId: messages.senderId,
      recipientId: messages.recipientId,
      subject: messages.subject,
      content: messages.content,
      isRead: messages.isRead,
      createdAt: messages.createdAt,
      sender: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        profileImageUrl: users.profileImageUrl,
      },
      recipient: users,
    })
    .from(messages)
    .leftJoin(users, eq(messages.senderId, users.id))
    .where(or(eq(messages.senderId, userId), eq(messages.recipientId, userId)))
    .orderBy(desc(messages.createdAt));
  }

  async markMessageAsRead(messageId: string): Promise<boolean> {
    const result = await db.update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
    return result.rowCount > 0;
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const result = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
    return result.rowCount > 0;
  }

  // Analytics operations
  async getCoursesCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(courses);
    return result.count;
  }

  async getActiveEnrollmentsCount(): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(enrollments)
      .where(eq(enrollments.status, 'active'));
    return result.count;
  }

  async getCompletedEnrollmentsCount(): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(enrollments)
      .where(eq(enrollments.status, 'completed'));
    return result.count;
  }

  async getCertificationsCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(certifications);
    return result.count;
  }

  // Mentor-specific operations
  async getStudentsByMentor(mentorId: string): Promise<(User & { enrollments: (Enrollment & { course: Course })[] })[]> {
    const mentorCourses = await this.getCoursesByMentor(mentorId);
    const courseIds = mentorCourses.map(course => course.id);
    
    if (courseIds.length === 0) return [];

    const enrollmentsWithDetails = await db
      .select({
        user: users,
        enrollment: enrollments,
        course: courses,
      })
      .from(enrollments)
      .leftJoin(users, eq(enrollments.userId, users.id))
      .leftJoin(courses, eq(enrollments.courseId, courses.id))
      .where(
        and(
          eq(enrollments.status, 'active'),
          inArray(enrollments.courseId, courseIds)
        )
      )
      .orderBy(users.firstName, users.lastName);

    // Group by user
    const studentMap = new Map<string, User & { enrollments: (Enrollment & { course: Course })[] }>();
    
    for (const row of enrollmentsWithDetails) {
      if (!row.user) continue;
      
      if (!studentMap.has(row.user.id)) {
        studentMap.set(row.user.id, {
          ...row.user,
          enrollments: []
        });
      }
      
      if (row.enrollment && row.course) {
        studentMap.get(row.user.id)!.enrollments.push({
          ...row.enrollment,
          course: row.course
        });
      }
    }

    return Array.from(studentMap.values());
  }

  async getAssignmentsByMentor(mentorId: string): Promise<(Assignment & { course: Course; submissions: AssignmentSubmission[] })[]> {
    const mentorCourses = await this.getCoursesByMentor(mentorId);
    const courseIds = mentorCourses.map(course => course.id);
    
    if (courseIds.length === 0) return [];

    const assignmentsWithCourses = await db
      .select({
        assignment: assignments,
        course: courses,
      })
      .from(assignments)
      .leftJoin(courses, eq(assignments.courseId, courses.id))
      .where(inArray(assignments.courseId, courseIds))
      .orderBy(desc(assignments.createdAt));

    // Get submissions for each assignment
    const result = [];
    for (const row of assignmentsWithCourses) {
      if (!row.assignment || !row.course) continue;
      
      const submissions = await db
        .select()
        .from(assignmentSubmissions)
        .where(eq(assignmentSubmissions.assignmentId, row.assignment.id));

      result.push({
        ...row.assignment,
        course: row.course,
        submissions
      });
    }

    return result;
  }

  // Admin-specific operations
  async getAllUsers(filters?: { role?: string; search?: string }): Promise<User[]> {
    let query = db.select().from(users);
    
    if (filters?.role) {
      query = query.where(eq(users.role, filters.role as any));
    }
    
    if (filters?.search) {
      query = query.where(
        or(
          like(users.firstName, `%${filters.search}%`),
          like(users.lastName, `%${filters.search}%`),
          like(users.email, `%${filters.search}%`)
        )
      );
    }
    
    return await query.orderBy(users.firstName, users.lastName);
  }

  async updateUserRole(userId: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role: role as any, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, userId));
    return result.rowCount > 0;
  }

  async getPendingCourses(): Promise<Course[]> {
    return await db.select().from(courses)
      .where(eq(courses.isPublic, false))
      .orderBy(desc(courses.createdAt));
  }

  async approveCourse(courseId: string): Promise<Course | undefined> {
    const [course] = await db
      .update(courses)
      .set({ isPublic: true, updatedAt: new Date() })
      .where(eq(courses.id, courseId))
      .returning();
    return course;
  }

  async rejectCourse(courseId: string): Promise<boolean> {
    const result = await db.delete(courses).where(eq(courses.id, courseId));
    return result.rowCount > 0;
  }

  async getAnalyticsData(): Promise<{
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
  }> {
    // Get basic counts
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [totalCourses] = await db.select({ count: count() }).from(courses);
    const [activeEnrollments] = await db.select({ count: count() })
      .from(enrollments).where(eq(enrollments.status, 'active'));
    const [completedEnrollments] = await db.select({ count: count() })
      .from(enrollments).where(eq(enrollments.status, 'completed'));

    // Get users by role
    const usersByRole = await db
      .select({
        role: users.role,
        count: count()
      })
      .from(users)
      .groupBy(users.role);

    // Get courses by category
    const coursesByCategory = await db
      .select({
        category: courses.category,
        count: count()
      })
      .from(courses)
      .groupBy(courses.category);

    // Generate mock monthly stats (in a real app, this would come from actual data)
    const monthlyStats = [
      { month: 'Jan', enrollments: 45, completions: 32 },
      { month: 'Feb', enrollments: 52, completions: 41 },
      { month: 'Mar', enrollments: 67, completions: 53 },
      { month: 'Apr', enrollments: 72, completions: 61 },
      { month: 'May', enrollments: 83, completions: 74 },
      { month: 'Jun', enrollments: 91, completions: 82 },
    ];

    return {
      totalUsers: totalUsers.count,
      totalCourses: totalCourses.count,
      activeEnrollments: activeEnrollments.count,
      completedEnrollments: completedEnrollments.count,
      monthlyStats,
      coursesByCategory: coursesByCategory.map(c => ({
        category: c.category || 'Uncategorized',
        count: c.count
      })),
      usersByRole: usersByRole.map(u => ({
        role: u.role,
        count: u.count
      }))
    };
  }
}

export const storage = new DatabaseStorage();
