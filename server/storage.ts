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
import { eq, and, desc, asc, like, or, count } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
