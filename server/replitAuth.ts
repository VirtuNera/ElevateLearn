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

    // Create or update the demo user in database
    try {
      await storage.upsertUser(demoUser);
      
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
