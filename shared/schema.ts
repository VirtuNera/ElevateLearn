import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum,
  decimal,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const userRoleEnum = pgEnum('user_role', ['learner', 'mentor', 'admin']);
export const courseTypeEnum = pgEnum('course_type', ['academic', 'corporate']);
export const enrollmentStatusEnum = pgEnum('enrollment_status', ['active', 'completed', 'dropped']);
export const assignmentStatusEnum = pgEnum('assignment_status', ['pending', 'submitted', 'graded']);
export const questionTypeEnum = pgEnum('question_type', ['multiple_choice', 'short_answer', 'true_false', 'essay']);
export const reportTypeEnum = pgEnum('report_type', ['learner', 'course', 'system', 'quiz_feedback']);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('learner').notNull(),
  organizationType: varchar("organization_type"),
  organizationId: varchar("organization_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Organizations table
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // 'university', 'company', 'training_center'
  description: text("description"),
  settings: jsonb("settings"), // JSON config for org-specific features
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tags table for course categorization
export const tags = pgTable("tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  category: varchar("category"), // 'skill', 'technology', 'domain'
  description: text("description"),
  color: varchar("color"), // Hex color for UI
  createdAt: timestamp("created_at").defaultNow(),
});

// Courses table
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  type: courseTypeEnum("type").notNull(),
  mentorId: varchar("mentor_id").notNull(),
  organizationId: varchar("organization_id"),
  duration: varchar("duration"),
  difficulty: varchar("difficulty"),
  category: varchar("category"),
  imageUrl: varchar("image_url"),
  isPublic: boolean("is_public").default(true),
  maxStudents: integer("max_students"),
  tags: jsonb("tags"), // Array of tag IDs
  metadata: jsonb("metadata"), // Additional course metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course tags junction table
export const courseTags = pgTable("course_tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull(),
  tagId: varchar("tag_id").notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // AI confidence score
  createdAt: timestamp("created_at").defaultNow(),
});

// Course modules table
export const courseModules = pgTable("course_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  content: text("content"),
  orderIndex: integer("order_index").notNull(),
  estimatedDuration: integer("estimated_duration"), // in minutes
  prerequisites: jsonb("prerequisites"), // Array of module IDs
  createdAt: timestamp("created_at").defaultNow(),
});

// Enrollments table
export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  courseId: varchar("course_id").notNull(),
  status: enrollmentStatusEnum("status").default('active').notNull(),
  progress: integer("progress").default(0),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  lastAccessedAt: timestamp("last_accessed_at"),
  timeSpent: integer("time_spent"), // Total time spent in minutes
});

// Assignments table (for academic courses)
export const assignments = pgTable("assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  maxPoints: integer("max_points").default(100),
  rubric: jsonb("rubric"), // JSON rubric for grading
  createdAt: timestamp("created_at").defaultNow(),
});

// Assignment submissions table
export const assignmentSubmissions = pgTable("assignment_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assignmentId: varchar("assignment_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content"),
  fileUrl: varchar("file_url"),
  status: assignmentStatusEnum("status").default('pending').notNull(),
  points: integer("points"),
  feedback: text("feedback"),
  aiFeedback: text("ai_feedback"), // Nura AI generated feedback
  submittedAt: timestamp("submitted_at").defaultNow(),
  gradedAt: timestamp("graded_at"),
});

// Quizzes table
export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  timeLimit: integer("time_limit"), // in minutes
  passingScore: integer("passing_score"),
  isRandomized: boolean("is_randomized").default(false),
  maxAttempts: integer("max_attempts").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quiz questions table
export const quizQuestions = pgTable("quiz_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull(),
  question: text("question").notNull(),
  type: questionTypeEnum("type").notNull(),
  options: jsonb("options"), // For multiple choice questions
  correctAnswer: text("correct_answer"),
  points: integer("points").default(1),
  explanation: text("explanation"),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quiz submissions table
export const quizSubmissions = pgTable("quiz_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull(),
  userId: varchar("user_id").notNull(),
  answers: jsonb("answers"), // JSON array of answers
  score: integer("score"),
  maxScore: integer("max_score"),
  timeSpent: integer("time_spent"), // in seconds
  isPassed: boolean("is_passed"),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// Quiz answers table for detailed tracking
export const quizAnswers = pgTable("quiz_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submissionId: varchar("submission_id").notNull(),
  questionId: varchar("question_id").notNull(),
  answer: text("answer"),
  isCorrect: boolean("is_correct"),
  points: integer("points"),
  feedback: text("feedback"),
  aiFeedback: text("ai_feedback"), // Nura AI generated feedback
  createdAt: timestamp("created_at").defaultNow(),
});

// Certifications table
export const certifications = pgTable("certifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  courseId: varchar("course_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  issuedAt: timestamp("issued_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  certificateUrl: varchar("certificate_url"),
});

// Messages table
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull(),
  recipientId: varchar("recipient_id").notNull(),
  subject: varchar("subject"),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Nura AI Reports table
export const nuraReports = pgTable("nura_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: reportTypeEnum("type").notNull(),
  targetId: varchar("target_id"), // User ID, Course ID, or null for system
  content: jsonb("content").notNull(), // AI generated report content
  insights: jsonb("insights"), // Key insights extracted
  recommendations: jsonb("recommendations"), // AI recommendations
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  metadata: jsonb("metadata"), // Additional context
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // For time-sensitive reports
});

// Study Plans table (AI generated)
export const studyPlans = pgTable("study_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  schedule: jsonb("schedule").notNull(), // Weekly schedule structure
  goals: jsonb("goals"), // Learning objectives
  progress: jsonb("progress"), // Progress tracking
  aiGenerated: boolean("ai_generated").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Equity Insights table (optional)
export const equityInsights = pgTable("equity_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id"),
  metric: varchar("metric").notNull(), // 'completion_rate', 'performance_gap', etc.
  demographic: varchar("demographic").notNull(), // 'gender', 'age_group', 'location'
  value: decimal("value", { precision: 10, scale: 4 }),
  baseline: decimal("baseline", { precision: 10, scale: 4 }),
  trend: varchar("trend"), // 'improving', 'declining', 'stable'
  recommendations: jsonb("recommendations"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System Metrics table
export const systemMetrics = pgTable("system_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metric: varchar("metric").notNull(),
  value: jsonb("value").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"),
});

// Audit Logs table for security
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  action: varchar("action").notNull(),
  resource: varchar("resource"),
  resourceId: varchar("resource_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  courses: many(courses),
  enrollments: many(enrollments),
  assignmentSubmissions: many(assignmentSubmissions),
  certifications: many(certifications),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "recipient" }),
  notifications: many(notifications),
  studyPlans: many(studyPlans),
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  courses: many(courses),
  equityInsights: many(equityInsights),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  mentor: one(users, {
    fields: [courses.mentorId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [courses.organizationId],
    references: [organizations.id],
  }),
  modules: many(courseModules),
  enrollments: many(enrollments),
  assignments: many(assignments),
  certifications: many(certifications),
  quizzes: many(quizzes),
  courseTags: many(courseTags),
}));

export const courseModulesRelations = relations(courseModules, ({ one }) => ({
  course: one(courses, {
    fields: [courseModules.courseId],
    references: [courses.id],
  }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  course: one(courses, {
    fields: [assignments.courseId],
    references: [courses.id],
  }),
  submissions: many(assignmentSubmissions),
}));

export const assignmentSubmissionsRelations = relations(assignmentSubmissions, ({ one }) => ({
  assignment: one(assignments, {
    fields: [assignmentSubmissions.assignmentId],
    references: [assignments.id],
  }),
  user: one(users, {
    fields: [assignmentSubmissions.userId],
    references: [users.id],
  }),
}));

export const certificationsRelations = relations(certifications, ({ one }) => ({
  user: one(users, {
    fields: [certifications.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [certifications.courseId],
    references: [courses.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
    relationName: "recipient",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  course: one(courses, {
    fields: [quizzes.courseId],
    references: [courses.id],
  }),
  questions: many(quizQuestions),
  submissions: many(quizSubmissions),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [quizQuestions.quizId],
    references: [quizzes.id],
  }),
  answers: many(quizAnswers),
}));

export const quizSubmissionsRelations = relations(quizSubmissions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [quizSubmissions.quizId],
    references: [quizzes.id],
  }),
  user: one(users, {
    fields: [quizSubmissions.userId],
    references: [users.id],
  }),
  answers: many(quizAnswers),
}));

export const quizAnswersRelations = relations(quizAnswers, ({ one }) => ({
  submission: one(quizSubmissions, {
    fields: [quizAnswers.submissionId],
    references: [quizSubmissions.id],
  }),
  question: one(quizQuestions, {
    fields: [quizAnswers.questionId],
    references: [quizQuestions.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  courseTags: many(courseTags),
}));

export const courseTagsRelations = relations(courseTags, ({ one }) => ({
  course: one(courses, {
    fields: [courseTags.courseId],
    references: [courses.id],
  }),
  tag: one(tags, {
    fields: [courseTags.tagId],
    references: [tags.id],
  }),
}));

export const nuraReportsRelations = relations(nuraReports, ({ one }) => ({
  user: one(users, {
    fields: [nuraReports.targetId],
    references: [users.id],
  }),
}));

export const studyPlansRelations = relations(studyPlans, ({ one }) => ({
  user: one(users, {
    fields: [studyPlans.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
});

export const insertAssignmentSubmissionSchema = createInsertSchema(assignmentSubmissions).omit({
  id: true,
  submittedAt: true,
  gradedAt: true,
});

export const insertCertificationSchema = createInsertSchema(certifications).omit({
  id: true,
  issuedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertQuizSubmissionSchema = createInsertSchema(quizSubmissions).omit({
  id: true,
  submittedAt: true,
});

export const insertQuizAnswerSchema = createInsertSchema(quizAnswers).omit({
  id: true,
  createdAt: true,
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
  createdAt: true,
});

export const insertCourseTagSchema = createInsertSchema(courseTags).omit({
  id: true,
  createdAt: true,
});

export const insertNuraReportSchema = createInsertSchema(nuraReports).omit({
  id: true,
  createdAt: true,
});

export const insertStudyPlanSchema = createInsertSchema(studyPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type CourseModule = typeof courseModules.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Assignment = typeof assignments.$inferSelect;
export type AssignmentSubmission = typeof assignmentSubmissions.$inferSelect;
export type Certification = typeof certifications.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type QuizSubmission = typeof quizSubmissions.$inferSelect;
export type QuizAnswer = typeof quizAnswers.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type CourseTag = typeof courseTags.$inferSelect;
export type NuraReport = typeof nuraReports.$inferSelect;
export type StudyPlan = typeof studyPlans.$inferSelect;
export type EquityInsight = typeof equityInsights.$inferSelect;
export type SystemMetric = typeof systemMetrics.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type InsertAssignmentSubmission = z.infer<typeof insertAssignmentSubmissionSchema>;
export type InsertCertification = z.infer<typeof insertCertificationSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type InsertQuizSubmission = z.infer<typeof insertQuizSubmissionSchema>;
export type InsertQuizAnswer = z.infer<typeof insertQuizAnswerSchema>;
export type InsertTag = z.infer<typeof insertTagSchema>;
export type InsertCourseTag = z.infer<typeof insertCourseTagSchema>;
export type InsertNuraReport = z.infer<typeof insertNuraReportSchema>;
export type InsertStudyPlan = z.infer<typeof insertStudyPlanSchema>;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
