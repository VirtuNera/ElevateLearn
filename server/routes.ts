import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { 
  insertCourseSchema,
  insertEnrollmentSchema,
  insertAssignmentSchema,
  insertAssignmentSubmissionSchema,
  insertMessageSchema,
  insertNotificationSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Course routes
  app.get('/api/courses', async (req, res) => {
    try {
      const { type, category, search } = req.query;
      const courses = await storage.getCourses({
        type: type as string,
        category: category as string,
        search: search as string,
      });
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post('/api/courses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'mentor' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Only mentors and admins can create courses" });
      }

      const courseData = insertCourseSchema.parse({
        ...req.body,
        mentorId: userId,
      });
      
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.get('/api/mentor/courses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const courses = await storage.getCoursesByMentor(userId);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching mentor courses:", error);
      res.status(500).json({ message: "Failed to fetch mentor courses" });
    }
  });

  // Get students for mentor's courses
  app.get('/api/mentor/students', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const students = await storage.getStudentsByMentor(userId);
      res.json(students);
    } catch (error) {
      console.error("Error fetching mentor students:", error);
      res.status(500).json({ message: "Failed to fetch mentor students" });
    }
  });

  // Get assignments for mentor's courses  
  app.get('/api/mentor/assignments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assignments = await storage.getAssignmentsByMentor(userId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching mentor assignments:", error);
      res.status(500).json({ message: "Failed to fetch mentor assignments" });
    }
  });

  // Get submissions for a specific assignment
  app.get('/api/assignments/:id/submissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'mentor' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Only mentors and admins can view submissions" });
      }

      const submissions = await storage.getSubmissionsByAssignment(req.params.id);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching assignment submissions:", error);
      res.status(500).json({ message: "Failed to fetch assignment submissions" });
    }
  });

  // Enrollment routes
  app.post('/api/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const enrollmentData = insertEnrollmentSchema.parse({
        ...req.body,
        userId,
      });
      
      const enrollment = await storage.createEnrollment(enrollmentData);
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      res.status(500).json({ message: "Failed to enroll in course" });
    }
  });

  app.get('/api/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const enrollments = await storage.getEnrollmentsByUser(userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.put('/api/enrollments/:id/progress', isAuthenticated, async (req, res) => {
    try {
      const { progress } = req.body;
      const enrollment = await storage.updateEnrollmentProgress(req.params.id, progress);
      
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      
      res.json(enrollment);
    } catch (error) {
      console.error("Error updating enrollment progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Assignment routes
  app.post('/api/assignments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'mentor' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Only mentors and admins can create assignments" });
      }

      const assignmentData = insertAssignmentSchema.parse(req.body);
      const assignment = await storage.createAssignment(assignmentData);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error creating assignment:", error);
      res.status(500).json({ message: "Failed to create assignment" });
    }
  });

  app.get('/api/courses/:courseId/assignments', isAuthenticated, async (req, res) => {
    try {
      const assignments = await storage.getAssignmentsByCourse(req.params.courseId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.post('/api/assignments/:id/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submissionData = insertAssignmentSubmissionSchema.parse({
        ...req.body,
        assignmentId: req.params.id,
        userId,
      });
      
      const submission = await storage.submitAssignment(submissionData);
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      res.status(500).json({ message: "Failed to submit assignment" });
    }
  });

  app.put('/api/submissions/:id/grade', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'mentor' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Only mentors and admins can grade assignments" });
      }

      const { points, feedback } = req.body;
      const submission = await storage.gradeAssignment(req.params.id, points, feedback);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      res.json(submission);
    } catch (error) {
      console.error("Error grading assignment:", error);
      res.status(500).json({ message: "Failed to grade assignment" });
    }
  });

  // Certification routes
  app.get('/api/certifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const certifications = await storage.getCertificationsByUser(userId);
      res.json(certifications);
    } catch (error) {
      console.error("Error fetching certifications:", error);
      res.status(500).json({ message: "Failed to fetch certifications" });
    }
  });

  // Message routes
  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId,
      });
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getMessagesByUser(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.put('/api/messages/:id/read', isAuthenticated, async (req, res) => {
    try {
      const success = await storage.markMessageAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const success = await storage.markNotificationAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Analytics routes (Admin only)
  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const [coursesCount, activeEnrollments, completedEnrollments, certificationsCount] = await Promise.all([
        storage.getCoursesCount(),
        storage.getActiveEnrollmentsCount(),
        storage.getCompletedEnrollmentsCount(),
        storage.getCertificationsCount(),
      ]);

      res.json({
        coursesCount,
        activeEnrollments,
        completedEnrollments,
        certificationsCount,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Enhanced analytics for admin dashboard
  app.get('/api/admin/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const analyticsData = await storage.getAnalyticsData();
      res.json(analyticsData);
    } catch (error) {
      console.error("Error fetching enhanced analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  // Admin user management routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { role, search } = req.query;
      const users = await storage.getAllUsers({
        role: role as string,
        search: search as string,
      });
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:id/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { role } = req.body;
      const updatedUser = await storage.updateUserRole(req.params.id, role);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.delete('/api/admin/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const success = await storage.deleteUser(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Admin course management routes
  app.get('/api/admin/courses/pending', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const pendingCourses = await storage.getPendingCourses();
      res.json(pendingCourses);
    } catch (error) {
      console.error("Error fetching pending courses:", error);
      res.status(500).json({ message: "Failed to fetch pending courses" });
    }
  });

  app.put('/api/admin/courses/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const approvedCourse = await storage.approveCourse(req.params.id);
      
      if (!approvedCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json(approvedCourse);
    } catch (error) {
      console.error("Error approving course:", error);
      res.status(500).json({ message: "Failed to approve course" });
    }
  });

  app.delete('/api/admin/courses/:id/reject', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const success = await storage.rejectCourse(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error rejecting course:", error);
      res.status(500).json({ message: "Failed to reject course" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
