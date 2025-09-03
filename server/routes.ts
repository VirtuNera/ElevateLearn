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
  insertNotificationSchema,
  insertCertificationSchema
} from "@shared/schema";
import enhancedRoutes from "./routes/enhanced";

export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);

  // Auth middleware
  await setupAuth(app);

  // Apply enhanced routes with /api prefix
  app.use('/api', enhancedRoutes);

  // Health check endpoint for Railway
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Legacy routes for backward compatibility
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

  app.put('/api/courses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const courseId = req.params.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'mentor' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Only mentors and admins can update courses" });
      }

      // Check if the course exists and belongs to the user (unless admin)
      const existingCourse = await storage.getCourse(courseId);
      if (!existingCourse) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (user?.role !== 'admin' && existingCourse.mentorId !== userId) {
        return res.status(403).json({ message: "You can only update your own courses" });
      }

      const courseData = insertCourseSchema.partial().parse(req.body);
      
      const updatedCourse = await storage.updateCourse(courseId, courseData);
      res.json(updatedCourse);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course" });
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
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  app.get('/api/users/:id/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const enrollments = await storage.getEnrollmentsByUser(userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
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

  app.get('/api/courses/:id/assignments', async (req, res) => {
    try {
      const assignments = await storage.getAssignmentsByCourse(req.params.id);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  // Assignment submission routes
  app.post('/api/assignments/:id/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assignmentId = req.params.id;
      
      const submissionData = insertAssignmentSubmissionSchema.parse({
        ...req.body,
        assignmentId,
        userId,
      });
      
      const submission = await storage.createAssignmentSubmission(submissionData);
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      res.status(500).json({ message: "Failed to submit assignment" });
    }
  });

  app.get('/api/assignments/:id/submissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'mentor' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const submissions = await storage.getAssignmentSubmissions(req.params.id);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // Message routes
  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId,
      });
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.get('/api/users/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const messages = await storage.getMessagesByUser(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Notification routes
  app.post('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can create notifications" });
      }

      const notificationData = insertNotificationSchema.parse({
        ...req.body,
        userId: req.body.userId || userId,
      });
      
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.get('/api/users/:id/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.put('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = req.params.id;
      const userId = req.user.claims.sub;
      
      const notification = await storage.markNotificationAsRead(notificationId, userId);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Certification routes
  app.post('/api/certifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'mentor' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Only mentors and admins can create certifications" });
      }

      const certificationData = insertCertificationSchema.parse({
        ...req.body,
        userId: req.body.userId || userId,
      });
      
      const certification = await storage.createCertification(certificationData);
      res.status(201).json(certification);
    } catch (error) {
      console.error("Error creating certification:", error);
      res.status(500).json({ message: "Failed to create certification" });
    }
  });

  app.get('/api/users/:id/certifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const certifications = await storage.getCertificationsByUser(userId);
      res.json(certifications);
    } catch (error) {
      console.error("Error fetching certifications:", error);
      res.status(500).json({ message: "Failed to fetch certifications" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/:role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const role = req.params.role;
      
      if (role === 'learner') {
        const dashboard = await storage.getLearnerDashboard(userId);
        res.json(dashboard);
      } else if (role === 'mentor') {
        const dashboard = await storage.getMentorDashboard(userId);
        res.json(dashboard);
      } else if (role === 'admin') {
        const dashboard = await storage.getAdminDashboard(userId);
        res.json(dashboard);
      } else {
        res.status(400).json({ message: "Invalid role" });
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard" });
    }
  });

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      features: [
        'Nura AI Integration',
        'Quiz System',
        'Tag Engine',
        'Advanced Analytics',
        'Study Plans',
        'Organization Management'
      ]
    });
  });

  return server;
}
