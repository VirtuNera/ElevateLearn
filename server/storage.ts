import {
  users,
  courses,
  enrollments,
  assignments,
  assignmentSubmissions,
  certifications,
  messages,
  notifications,
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
import { eq, and, desc, asc, ilike, or, count, inArray } from 'drizzle-orm';
import { alias } from "drizzle-orm/pg-core";

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
  createAssignmentSubmission(submission: InsertAssignmentSubmission): Promise<AssignmentSubmission>;
  getAssignmentSubmissions(assignmentId: string): Promise<(AssignmentSubmission & { user: User })[]>;
  gradeAssignment(submissionId: string, points: number, feedback?: string): Promise<AssignmentSubmission | undefined>;
  getSubmissionsByAssignment(assignmentId: string): Promise<(AssignmentSubmission & { user: User })[]>; // (kept if used elsewhere)
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
  markNotificationAsRead(notificationId: string, userId: string): Promise<boolean>;

  // Dashboard operations
  getLearnerDashboard(userId: string): Promise<any>;
  getMentorDashboard(userId: string): Promise<any>;
  getAdminDashboard(userId: string): Promise<any>;

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
      .values({ ...userData, id: (userData as any).id! })
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
    const conditions = [eq(courses.isPublic, true)];
    if (filters?.type) conditions.push(eq(courses.type, filters.type as any));
    if (filters?.category) conditions.push(eq(courses.category, filters.category));
    if (filters?.search) {
      conditions.push(
        or(
          ilike(courses.title, `%${filters.search}%`),
          ilike(courses.description || '', `%${filters.search}%`)
        )
      );
    }
    if (conditions.length > 0) {
      return await db
        .select()
        .from(courses)
        .where(and(...conditions))
        .orderBy(desc(courses.createdAt));
    } else {
      return await db
        .select()
        .from(courses)
        .orderBy(desc(courses.createdAt));
    }
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getCoursesByMentor(mentorId: string): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(eq(courses.mentorId, mentorId))
      .orderBy(desc(courses.createdAt));
  }

  async updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course | undefined> {
    const [course] = await db
      .update(courses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return course;
  }

  async deleteCourse(id: string): Promise<boolean> {
    const deleted = await db
      .delete(courses)
      .where(eq(courses.id, id))
      .returning({ id: courses.id });
    return deleted.length > 0;
  }

  // Enrollment operations
  async createEnrollment(enrollmentData: InsertEnrollment): Promise<Enrollment> {
    const [enrollment] = await db.insert(enrollments).values(enrollmentData).returning();
    return enrollment;
  }

  async getEnrollmentsByUser(userId: string): Promise<(Enrollment & { course: Course })[]> {
    return await db
      .select({
        id: enrollments.id,
        userId: enrollments.userId,
        courseId: enrollments.courseId,
        status: enrollments.status,
        progress: enrollments.progress,
        enrolledAt: enrollments.enrolledAt,
        completedAt: enrollments.completedAt,
        lastAccessedAt: enrollments.lastAccessedAt,
        timeSpent: enrollments.timeSpent,
        course: courses,
      })
      .from(enrollments)
      .leftJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.enrolledAt));
  }

  async getEnrollmentsByCourse(courseId: string): Promise<(Enrollment & { user: User })[]> {
    return await db
      .select({
        id: enrollments.id,
        userId: enrollments.userId,
        courseId: enrollments.courseId,
        status: enrollments.status,
        progress: enrollments.progress,
        enrolledAt: enrollments.enrolledAt,
        completedAt: enrollments.completedAt,
        lastAccessedAt: enrollments.lastAccessedAt,
        timeSpent: enrollments.timeSpent,
        user: users,
      })
      .from(enrollments)
      .leftJoin(users, eq(enrollments.userId, users.id))
      .where(eq(enrollments.courseId, courseId))
      .orderBy(desc(enrollments.enrolledAt));
  }

  async updateEnrollmentProgress(enrollmentId: string, progress: number): Promise<Enrollment | undefined> {
    const [enrollment] = await db
      .update(enrollments)
      .set({ progress })
      .where(eq(enrollments.id, enrollmentId))
      .returning();
    return enrollment;
  }

  async completeEnrollment(enrollmentId: string): Promise<Enrollment | undefined> {
    const [enrollment] = await db
      .update(enrollments)
      .set({
        status: "completed",
        progress: 100,
        completedAt: new Date(),
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
    return await db
      .select()
      .from(assignments)
      .where(eq(assignments.courseId, courseId))
      .orderBy(asc(assignments.dueDate));
  }

  async getAssignment(id: string): Promise<Assignment | undefined> {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    return assignment;
  }

  async createAssignmentSubmission(submissionData: InsertAssignmentSubmission): Promise<AssignmentSubmission> {
    const [submission] = await db
      .insert(assignmentSubmissions)
      .values({ ...submissionData, status: "submitted" })
      .returning();
    return submission;
  }

  async submitAssignment(submissionData: InsertAssignmentSubmission): Promise<AssignmentSubmission> {
    return this.createAssignmentSubmission(submissionData);
  }

  async getAssignmentSubmissions(assignmentId: string): Promise<(AssignmentSubmission & { user: User })[]> {
    return await db
      .select({
        id: assignmentSubmissions.id,
        assignmentId: assignmentSubmissions.assignmentId,
        userId: assignmentSubmissions.userId,
        content: assignmentSubmissions.content,
        fileUrl: assignmentSubmissions.fileUrl,
        status: assignmentSubmissions.status,
        points: assignmentSubmissions.points,
        feedback: assignmentSubmissions.feedback,
        aiFeedback: assignmentSubmissions.aiFeedback,
        submittedAt: assignmentSubmissions.submittedAt,
        gradedAt: assignmentSubmissions.gradedAt,
        user: users,
      })
      .from(assignmentSubmissions)
      .leftJoin(users, eq(assignmentSubmissions.userId, users.id))
      .where(eq(assignmentSubmissions.assignmentId, assignmentId))
      .orderBy(desc(assignmentSubmissions.submittedAt));
  }

  async gradeAssignment(submissionId: string, points: number, feedback?: string): Promise<AssignmentSubmission | undefined> {
    const [submission] = await db
      .update(assignmentSubmissions)
      .set({
        points,
        feedback,
        status: "graded",
        gradedAt: new Date(),
      })
      .where(eq(assignmentSubmissions.id, submissionId))
      .returning();
    return submission;
  }

  async getSubmissionsByAssignment(assignmentId: string): Promise<(AssignmentSubmission & { user: User })[]> {
    return await db
      .select({
        id: assignmentSubmissions.id,
        assignmentId: assignmentSubmissions.assignmentId,
        userId: assignmentSubmissions.userId,
        content: assignmentSubmissions.content,
        fileUrl: assignmentSubmissions.fileUrl,
        status: assignmentSubmissions.status,
        points: assignmentSubmissions.points,
        feedback: assignmentSubmissions.feedback,
        aiFeedback: assignmentSubmissions.aiFeedback,
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
    return await db
      .select({
        id: assignmentSubmissions.id,
        assignmentId: assignmentSubmissions.assignmentId,
        userId: assignmentSubmissions.userId,
        content: assignmentSubmissions.content,
        fileUrl: assignmentSubmissions.fileUrl,
        status: assignmentSubmissions.status,
        points: assignmentSubmissions.points,
        feedback: assignmentSubmissions.feedback,
        aiFeedback: assignmentSubmissions.aiFeedback,
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
    return await db
      .select()
      .from(certifications)
      .where(eq(certifications.userId, userId))
      .orderBy(desc(certifications.issuedAt));
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }

  async getMessagesByUser(userId: string): Promise<(Message & { sender: User; recipient: User })[]> {
    const sender = alias(users, "sender");
    const recipient = alias(users, "recipient");

    return await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        recipientId: messages.recipientId,
        subject: messages.subject,
        content: messages.content,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        sender: {
          id: sender.id,
          firstName: sender.firstName,
          lastName: sender.lastName,
          email: sender.email,
          profileImageUrl: sender.profileImageUrl,
        },
        recipient: {
          id: recipient.id,
          firstName: recipient.firstName,
          lastName: recipient.lastName,
          email: recipient.email,
          profileImageUrl: recipient.profileImageUrl,
        },
      })
      .from(messages)
      .leftJoin(sender, eq(messages.senderId, sender.id))
      .leftJoin(recipient, eq(messages.recipientId, recipient.id))
      .where(or(eq(messages.senderId, userId), eq(messages.recipientId, userId)))
      .orderBy(desc(messages.createdAt));
  }

  async markMessageAsRead(messageId: string): Promise<boolean> {
    const updated = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId))
      .returning({ id: messages.id });
    return updated.length > 0;
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
    const updated = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
      .returning({ id: notifications.id });
    return updated.length > 0;
  }

  // Dashboard operations (placeholders)
  async getLearnerDashboard(userId: string): Promise<any> {
    return {
      totalCourses: 0,
      activeEnrollments: 0,
      completedEnrollments: 0,
      recentCertifications: [],
      recentMessages: [],
      recentNotifications: [],
    };
  }

  async getMentorDashboard(userId: string): Promise<any> {
    return {
      totalCourses: 0,
      activeEnrollments: 0,
      completedEnrollments: 0,
      recentAssignments: [],
      recentSubmissions: [],
      recentMessages: [],
      recentNotifications: [],
    };
  }

  async getAdminDashboard(userId: string): Promise<any> {
    return {
      totalUsers: 0,
      totalCourses: 0,
      activeEnrollments: 0,
      completedEnrollments: 0,
      recentActivities: [],
      pendingCourses: [],
      topPerformers: [],
    };
  }

  // Analytics operations
  async getCoursesCount(): Promise<number> {
    const [r] = await db.select({ c: count() }).from(courses);
    return Number(r.c);
  }

  async getActiveEnrollmentsCount(): Promise<number> {
    const [r] = await db
      .select({ c: count() })
      .from(enrollments)
      .where(eq(enrollments.status, "active"));
    return Number(r.c);
  }

  async getCompletedEnrollmentsCount(): Promise<number> {
    const [r] = await db
      .select({ c: count() })
      .from(enrollments)
      .where(eq(enrollments.status, "completed"));
    return Number(r.c);
  }

  async getCertificationsCount(): Promise<number> {
    const [r] = await db.select({ c: count() }).from(certifications);
    return Number(r.c);
  }

  // Mentor-specific operations
  async getStudentsByMentor(mentorId: string): Promise<(User & { enrollments: (Enrollment & { course: Course })[] })[]> {
    const mentorCourses = await this.getCoursesByMentor(mentorId);
    const courseIds = mentorCourses.map((course) => course.id);

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
      .where(and(eq(enrollments.status, "active"), inArray(enrollments.courseId, courseIds)))
      .orderBy(users.firstName, users.lastName);

    const studentMap = new Map<string, User & { enrollments: (Enrollment & { course: Course })[] }>();

    for (const row of enrollmentsWithDetails) {
      if (!row.user) continue;

      if (!studentMap.has(row.user.id)) {
        studentMap.set(row.user.id, {
          ...row.user,
          enrollments: [],
        });
      }

      if (row.enrollment && row.course) {
        studentMap.get(row.user.id)!.enrollments.push({
          ...row.enrollment,
          course: row.course,
        });
      }
    }

    return Array.from(studentMap.values());
  }

  async getAssignmentsByMentor(mentorId: string): Promise<(Assignment & { course: Course; submissions: AssignmentSubmission[] })[]> {
    const mentorCourses = await this.getCoursesByMentor(mentorId);
    const courseIds = mentorCourses.map((course) => course.id);

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

    const result: (Assignment & { course: Course; submissions: AssignmentSubmission[] })[] = [];
    for (const row of assignmentsWithCourses) {
      if (!row.assignment || !row.course) continue;

      const submissions = await db
        .select()
        .from(assignmentSubmissions)
        .where(eq(assignmentSubmissions.assignmentId, row.assignment.id));

      result.push({
        ...row.assignment,
        course: row.course,
        submissions,
      });
    }

    return result;
  }

  // Admin-specific operations
    async getAllUsers(filters?: { role?: string; search?: string }): Promise<User[]> {
    const conditions: any[] = [];
    if (filters?.role) {
      conditions.push(eq(users.role, filters.role as any));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(users.firstName, `%${filters.search}%`),
          ilike(users.lastName, `%${filters.search}%`),
          ilike(users.email, `%${filters.search}%`)
        )
      );
    }
    
    const base = db.select().from(users);
    const q = conditions.length ? base.where(and(...conditions)) : base;

    return await q.orderBy(users.firstName, users.lastName);
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
    const deleted = await db.delete(users).where(eq(users.id, userId)).returning({ id: users.id });
    return deleted.length > 0;
  }

  async getPendingCourses(): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
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
    const deleted = await db.delete(courses).where(eq(courses.id, courseId)).returning({ id: courses.id });
    return deleted.length > 0;
  }

  async getAnalyticsData(): Promise<{
    totalUsers: number;
    totalCourses: number;
    activeEnrollments: number;
    completedEnrollments: number;
    monthlyStats: { month: string; enrollments: number; completions: number }[];
    coursesByCategory: { category: string; count: number }[];
    usersByRole: { role: string; count: number }[];
  }> {
    const [tu] = await db.select({ c: count() }).from(users);
    const [tc] = await db.select({ c: count() }).from(courses);
    const [ae] = await db.select({ c: count() }).from(enrollments).where(eq(enrollments.status, "active"));
    const [ce] = await db.select({ c: count() }).from(enrollments).where(eq(enrollments.status, "completed"));

    const usersByRoleRaw = await db
      .select({
        role: users.role,
        count: count(),
      })
      .from(users)
      .groupBy(users.role);

    const coursesByCategoryRaw = await db
      .select({
        category: courses.category,
        count: count(),
      })
      .from(courses)
      .groupBy(courses.category);

    const monthlyStats = [
      { month: "Jan", enrollments: 45, completions: 32 },
      { month: "Feb", enrollments: 52, completions: 41 },
      { month: "Mar", enrollments: 67, completions: 53 },
      { month: "Apr", enrollments: 72, completions: 61 },
      { month: "May", enrollments: 83, completions: 74 },
      { month: "Jun", enrollments: 91, completions: 82 },
    ];

    return {
      totalUsers: Number(tu.c),
      totalCourses: Number(tc.c),
      activeEnrollments: Number(ae.c),
      completedEnrollments: Number(ce.c),
      monthlyStats,
      coursesByCategory: coursesByCategoryRaw.map((c) => ({
        category: c.category || "Uncategorized",
        count: Number(c.count),
      })),
      usersByRole: usersByRoleRaw.map((u) => ({
        role: u.role,
        count: Number(u.count),
      })),
    };
  }
}

export const storage = new DatabaseStorage();
