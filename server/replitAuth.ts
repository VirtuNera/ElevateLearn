import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || 'demo-secret-key-for-lms',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Allow HTTP for demo
      maxAge: sessionTtl,
    },
  });
}

// Demo users for testing different roles
const demoUsers = [
  {
    id: "demo-learner-1",
    email: "learner@demo.com",
    firstName: "Sarah",
    lastName: "Student",
    role: "learner" as const,
    profileImageUrl: null,
  },
  {
    id: "demo-mentor-1", 
    email: "mentor@demo.com",
    firstName: "John",
    lastName: "Teacher",
    role: "mentor" as const,
    profileImageUrl: null,
  },
  {
    id: "demo-admin-1",
    email: "admin@demo.com", 
    firstName: "Alex",
    lastName: "Admin",
    role: "admin" as const,
    profileImageUrl: null,
  }
];

const demoCourses = [
  // Technology Courses
  {
    id: "course-tech-1",
    title: "Introduction to JavaScript",
    description: "Learn the fundamentals of JavaScript programming, including variables, functions, and DOM manipulation.",
    type: "academic" as const,
    mentorId: "demo-mentor-1",
    duration: "8 weeks",
    difficulty: "beginner",
    category: "Technology",
    imageUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=200&fit=crop",
    isPublic: true,
    maxStudents: 30,
  },
  {
    id: "course-tech-2", 
    title: "React Development Bootcamp",
    description: "Master React.js with hands-on projects covering components, hooks, state management, and modern development practices.",
    type: "corporate" as const,
    mentorId: "demo-mentor-1",
    duration: "12 weeks",
    difficulty: "intermediate",
    category: "Technology",
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop",
    isPublic: true,
    maxStudents: 25,
  },
  {
    id: "course-tech-3",
    title: "Advanced Python for Data Science",
    description: "Deep dive into Python libraries like Pandas, NumPy, and Matplotlib for data analysis and visualization.",
    type: "academic" as const,
    mentorId: "demo-mentor-1", 
    duration: "10 weeks",
    difficulty: "advanced",
    category: "Technology",
    imageUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=200&fit=crop",
    isPublic: true,
    maxStudents: 20,
  },
  {
    id: "course-tech-4",
    title: "Machine Learning Fundamentals",
    description: "Introduction to machine learning algorithms, supervised and unsupervised learning, and practical applications.",
    type: "academic" as const,
    mentorId: "demo-mentor-1",
    duration: "14 weeks", 
    difficulty: "intermediate",
    category: "Technology",
    imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop",
    isPublic: true,
    maxStudents: 15,
  },
  {
    id: "course-tech-5",
    title: "Cybersecurity Essentials",
    description: "Learn essential cybersecurity concepts, threat assessment, and protection strategies for modern organizations.",
    type: "corporate" as const,
    mentorId: "demo-mentor-1",
    duration: "6 weeks",
    difficulty: "beginner",
    category: "Technology", 
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=200&fit=crop",
    isPublic: true,
    maxStudents: 40,
  },

  // Business Courses
  {
    id: "course-biz-1",
    title: "Digital Marketing Strategy",
    description: "Comprehensive guide to digital marketing including SEO, social media, content marketing, and analytics.",
    type: "corporate" as const,
    mentorId: "demo-mentor-1",
    duration: "8 weeks",
    difficulty: "intermediate",
    category: "Business",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop",
    isPublic: true,
    maxStudents: 35,
  },
  {
    id: "course-biz-2",
    title: "Project Management Professional",
    description: "Learn industry-standard project management methodologies, tools, and best practices for successful project delivery.",
    type: "corporate" as const,
    mentorId: "demo-mentor-1",
    duration: "10 weeks",
    difficulty: "intermediate",
    category: "Business",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=200&fit=crop",
    isPublic: true,
    maxStudents: 30,
  },
  {
    id: "course-biz-3", 
    title: "Leadership and Team Management",
    description: "Develop essential leadership skills, team dynamics understanding, and effective communication strategies.",
    type: "corporate" as const,
    mentorId: "demo-mentor-1",
    duration: "6 weeks",
    difficulty: "beginner",
    category: "Business",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop",
    isPublic: true,
    maxStudents: 25,
  },
  {
    id: "course-biz-4",
    title: "Financial Analysis for Business",
    description: "Master financial statement analysis, budgeting, forecasting, and key financial metrics for business decisions.",
    type: "academic" as const,
    mentorId: "demo-mentor-1",
    duration: "12 weeks",
    difficulty: "advanced",
    category: "Business",
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop",
    isPublic: true,
    maxStudents: 20,
  },

  // Science Courses
  {
    id: "course-sci-1",
    title: "Introduction to Biotechnology",
    description: "Explore the fundamentals of biotechnology, genetic engineering, and applications in medicine and agriculture.",
    type: "academic" as const,
    mentorId: "demo-mentor-1",
    duration: "16 weeks",
    difficulty: "intermediate",
    category: "Science",
    imageUrl: "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=400&h=200&fit=crop",
    isPublic: true,
    maxStudents: 18,
  },
  {
    id: "course-sci-2",
    title: "Environmental Science and Sustainability",
    description: "Study environmental systems, climate change, pollution control, and sustainable development practices.",
    type: "academic" as const,
    mentorId: "demo-mentor-1",
    duration: "14 weeks",
    difficulty: "beginner",
    category: "Science",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop",
    isPublic: true,
    maxStudents: 25,
  },
  {
    id: "course-sci-3",
    title: "Organic Chemistry Fundamentals",
    description: "Master the principles of organic chemistry including molecular structure, reactions, and synthesis methods.",
    type: "academic" as const,
    mentorId: "demo-mentor-1",
    duration: "18 weeks",
    difficulty: "advanced",
    category: "Science",
    imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=200&fit=crop",
    isPublic: true,
    maxStudents: 15,
  },

  // Creative Courses  
  {
    id: "course-creative-1",
    title: "Digital Design Fundamentals",
    description: "Learn design principles, color theory, typography, and digital tools like Photoshop and Illustrator.",
    type: "corporate" as const,
    mentorId: "demo-mentor-1",
    duration: "8 weeks",
    difficulty: "beginner",
    category: "Creative",
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop",
    isPublic: true,
    maxStudents: 22,
  },
  {
    id: "course-creative-2",
    title: "UX/UI Design Workshop",
    description: "Comprehensive course covering user experience research, interface design, prototyping, and usability testing.",
    type: "corporate" as const,
    mentorId: "demo-mentor-1",
    duration: "10 weeks",
    difficulty: "intermediate",
    category: "Creative",
    imageUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=200&fit=crop",
    isPublic: true,
    maxStudents: 20,
  },
  {
    id: "course-creative-3",
    title: "Creative Writing Workshop",
    description: "Develop your writing skills through exercises in storytelling, character development, and various literary forms.",
    type: "academic" as const,
    mentorId: "demo-mentor-1",
    duration: "12 weeks",
    difficulty: "beginner",
    category: "Creative",
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=200&fit=crop",
    isPublic: true,
    maxStudents: 16,
  },

  // Pending Courses (awaiting admin approval)
  {
    id: "course-pending-1",
    title: "Advanced Artificial Intelligence",
    description: "Comprehensive study of AI algorithms, neural networks, deep learning, and practical applications in modern industries.",
    type: "academic" as const,
    mentorId: "demo-mentor-1",
    duration: "16 weeks",
    difficulty: "advanced",
    category: "Technology",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop",
    isPublic: false,
    maxStudents: 12,
  },
  {
    id: "course-pending-2",
    title: "Blockchain and Cryptocurrency Fundamentals",
    description: "Learn blockchain technology, cryptocurrency mechanics, smart contracts, and decentralized applications.",
    type: "corporate" as const,
    mentorId: "demo-mentor-1",
    duration: "8 weeks",
    difficulty: "intermediate",
    category: "Technology",
    imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop",
    isPublic: false,
    maxStudents: 20,
  },
  {
    id: "course-pending-3",
    title: "Entrepreneurship and Startup Strategy",
    description: "Master the fundamentals of starting a business, from idea validation to scaling and funding strategies.",
    type: "corporate" as const,
    mentorId: "demo-mentor-1",
    duration: "10 weeks",
    difficulty: "intermediate",
    category: "Business",
    imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop",
    isPublic: false,
    maxStudents: 25,
  },
  {
    id: "course-pending-4",
    title: "Advanced Data Visualization with Python",
    description: "Create compelling data visualizations using matplotlib, seaborn, plotly, and interactive dashboard development.",
    type: "academic" as const,
    mentorId: "demo-mentor-1",
    duration: "6 weeks",
    difficulty: "advanced",
    category: "Technology",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
    isPublic: false,
    maxStudents: 18,
  },
  {
    id: "course-pending-5",
    title: "Motion Graphics and Animation",
    description: "Learn professional motion graphics and animation techniques using After Effects and Cinema 4D.",
    type: "corporate" as const,
    mentorId: "demo-mentor-1",
    duration: "12 weeks",
    difficulty: "intermediate",
    category: "Creative",
    imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=200&fit=crop",
    isPublic: false,
    maxStudents: 15,
  },
  {
    id: "course-pending-6",
    title: "Climate Science and Policy",
    description: "Explore climate change science, environmental policy, and sustainable solutions for global challenges.",
    type: "academic" as const,
    mentorId: "demo-mentor-1",
    duration: "14 weeks",
    difficulty: "intermediate",
    category: "Science",
    imageUrl: "https://images.unsplash.com/photo-1569163139394-de44aa7273d2?w=400&h=200&fit=crop",
    isPublic: false,
    maxStudents: 22,
  }
];

const demoEnrollments = [
  {
    id: "enrollment-1",
    userId: "demo-learner-1",
    courseId: "course-tech-1",
    status: "active" as const,
    progress: 65,
  },
  {
    id: "enrollment-2", 
    userId: "demo-learner-1",
    courseId: "course-biz-1",
    status: "active" as const,
    progress: 30,
  },
  {
    id: "enrollment-3",
    userId: "demo-learner-1",
    courseId: "course-creative-1",
    status: "completed" as const,
    progress: 100,
  }
];

const demoCertifications = [
  {
    id: "cert-1",
    userId: "demo-learner-1",
    courseId: "course-creative-1",
    title: "Digital Design Fundamentals Certificate",
    description: "Successfully completed comprehensive training in digital design principles and tools.",
    imageUrl: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=400&h=300&fit=crop",
  }
];

// Function to seed demo data into the database
async function seedDemoData() {
  try {
    // Create demo users first
    for (const user of demoUsers) {
      await storage.upsertUser(user);
    }

    // Check if courses already exist to avoid duplicates
    const existingCourses = await storage.getCourses();
    const pendingCourses = await storage.getPendingCourses();
    
    if (existingCourses.length === 0) {
      // Create demo courses if none exist
      for (const course of demoCourses) {
        await storage.createCourse(course);
      }

      // Create demo enrollments
      for (const enrollment of demoEnrollments) {
        await storage.createEnrollment(enrollment);
      }

      // Create demo certifications
      for (const certification of demoCertifications) {
        await storage.createCertification(certification);
      }

      console.log("Demo data seeded successfully");
    } else {
      // If courses exist but no pending courses, add the pending ones
      if (pendingCourses.length === 0) {
        const pendingCoursesToAdd = demoCourses.filter(course => !course.isPublic);
        for (const course of pendingCoursesToAdd) {
          const existingCourse = await storage.getCourse(course.id);
          if (!existingCourse) {
            await storage.createCourse(course);
          }
        }
        console.log("Pending demo courses added successfully");
      }
    }
  } catch (error) {
    console.error("Error seeding demo data:", error);
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Demo login routes - simplified authentication
  app.get("/api/login", (req, res) => {
    res.json({
      message: "Choose a demo user to login as",
      users: demoUsers.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        email: user.email
      }))
    });
  });

  app.post("/api/login", async (req, res) => {
    const { userId } = req.body;
    const demoUser = demoUsers.find(user => user.id === userId);
    
    if (!demoUser) {
      return res.status(400).json({ message: "Invalid demo user" });
    }

    // Create or update the demo user in database and seed data
    try {
      await storage.upsertUser(demoUser);
      
      // Seed demo data if not already present
      await seedDemoData();
      
      // Set session
      (req.session as any).userId = demoUser.id;
      (req.session as any).user = demoUser;
      
      res.json({ 
        message: "Logged in successfully",
        user: demoUser
      });
    } catch (error) {
      console.error("Error during demo login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
      }
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const session = req.session as any;
  
  if (!session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Add user info to request for easier access
  (req as any).user = { 
    claims: { 
      sub: session.userId 
    }
  };
  
  return next();
};
