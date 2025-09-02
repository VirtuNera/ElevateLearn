import { db } from './server/db';
import { 
  users, 
  courses, 
  enrollments, 
  assignments, 
  assignmentSubmissions,
  certifications,
  messages,
  notifications,
  tags,
  courseTags,
  courseModules,
  quizzes,
  quizQuestions,
  quizSubmissions,
  organizations
} from './shared/schema';
import { v4 as uuidv4 } from 'uuid';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await db.delete(quizSubmissions);
    await db.delete(quizQuestions);
    await db.delete(quizzes);
    await db.delete(assignmentSubmissions);
    await db.delete(assignments);
    await db.delete(courseTags);
    await db.delete(courseModules);
    await db.delete(enrollments);
    await db.delete(certifications);
    await db.delete(messages);
    await db.delete(notifications);
    await db.delete(courses);
    await db.delete(tags);
    await db.delete(users);
    await db.delete(organizations);

    // Create organizations
    console.log('🏢 Creating organizations...');
    const orgs = await db.insert(organizations).values([
      {
        id: uuidv4(),
        name: 'TechCorp University',
        type: 'university',
        description: 'Leading technology university focused on innovation and practical learning',
        settings: { theme: 'blue', features: ['ai_assistant', 'analytics'] }
      },
      {
        id: uuidv4(),
        name: 'Innovate Solutions Inc.',
        type: 'company',
        description: 'Corporate training and development company',
        settings: { theme: 'green', features: ['mentoring', 'certifications'] }
      },
      {
        id: uuidv4(),
        name: 'Global Learning Center',
        type: 'training_center',
        description: 'Professional development and skill enhancement center',
        settings: { theme: 'purple', features: ['quizzes', 'reports'] }
      }
    ]).returning();

    // Create users
    console.log('👥 Creating users...');
    const userData = [
      // Admins
      {
        id: uuidv4(),
        email: 'admin@elevate360.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'admin' as const,
        organizationId: orgs[0].id,
        profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: uuidv4(),
        email: 'admin2@elevate360.com',
        firstName: 'Michael',
        lastName: 'Chen',
        role: 'admin' as const,
        organizationId: orgs[1].id,
        profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      
      // Mentors
      {
        id: uuidv4(),
        email: 'dr.smith@techcorp.edu',
        firstName: 'Dr. Emily',
        lastName: 'Smith',
        role: 'mentor' as const,
        organizationId: orgs[0].id,
        profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: uuidv4(),
        email: 'prof.davis@techcorp.edu',
        firstName: 'Prof. James',
        lastName: 'Davis',
        role: 'mentor' as const,
        organizationId: orgs[0].id,
        profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: uuidv4(),
        email: 'trainer.wilson@innovate.com',
        firstName: 'Lisa',
        lastName: 'Wilson',
        role: 'mentor' as const,
        organizationId: orgs[1].id,
        profileImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: uuidv4(),
        email: 'coach.brown@global.com',
        firstName: 'Robert',
        lastName: 'Brown',
        role: 'mentor' as const,
        organizationId: orgs[2].id,
        profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
      },
      
      // Learners
      {
        id: uuidv4(),
        email: 'alex.garcia@student.edu',
        firstName: 'Alex',
        lastName: 'Garcia',
        role: 'learner' as const,
        organizationId: orgs[0].id,
        profileImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: uuidv4(),
        email: 'maria.rodriguez@student.edu',
        firstName: 'Maria',
        lastName: 'Rodriguez',
        role: 'learner' as const,
        organizationId: orgs[0].id,
        profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: uuidv4(),
        email: 'david.kim@student.edu',
        firstName: 'David',
        lastName: 'Kim',
        role: 'learner' as const,
        organizationId: orgs[0].id,
        profileImageUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: uuidv4(),
        email: 'sophie.taylor@employee.com',
        firstName: 'Sophie',
        lastName: 'Taylor',
        role: 'learner' as const,
        organizationId: orgs[1].id,
        profileImageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: uuidv4(),
        email: 'john.anderson@employee.com',
        firstName: 'John',
        lastName: 'Anderson',
        role: 'learner' as const,
        organizationId: orgs[1].id,
        profileImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: uuidv4(),
        email: 'emma.thomas@professional.com',
        firstName: 'Emma',
        lastName: 'Thomas',
        role: 'learner' as const,
        organizationId: orgs[2].id,
        profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: uuidv4(),
        email: 'chris.martinez@professional.com',
        firstName: 'Chris',
        lastName: 'Martinez',
        role: 'learner' as const,
        organizationId: orgs[2].id,
        profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      }
    ];

    const createdUsers = await db.insert(users).values(userData).returning();
    const admins = createdUsers.filter(u => u.role === 'admin');
    const mentors = createdUsers.filter(u => u.role === 'mentor');
    const learners = createdUsers.filter(u => u.role === 'learner');

    // Create tags
    console.log('🏷️ Creating tags...');
    const tagData = [
      { id: uuidv4(), name: 'JavaScript', category: 'technology', description: 'Programming language for web development', color: '#F7DF1E' },
      { id: uuidv4(), name: 'React', category: 'technology', description: 'Frontend framework for building user interfaces', color: '#61DAFB' },
      { id: uuidv4(), name: 'Python', category: 'technology', description: 'Versatile programming language', color: '#3776AB' },
      { id: uuidv4(), name: 'Data Science', category: 'domain', description: 'Field of study in data analysis and machine learning', color: '#FF6B6B' },
      { id: uuidv4(), name: 'Leadership', category: 'skill', description: 'Management and team leadership skills', color: '#4ECDC4' },
      { id: uuidv4(), name: 'Communication', category: 'skill', description: 'Effective communication and presentation skills', color: '#45B7D1' },
      { id: uuidv4(), name: 'Project Management', category: 'skill', description: 'Planning and executing projects effectively', color: '#96CEB4' },
      { id: uuidv4(), name: 'UI/UX Design', category: 'skill', description: 'User interface and experience design', color: '#FFEAA7' },
      { id: uuidv4(), name: 'DevOps', category: 'technology', description: 'Development and operations practices', color: '#DDA0DD' },
      { id: uuidv4(), name: 'Cybersecurity', category: 'domain', description: 'Information security and protection', color: '#FF8C42' }
    ];

    const createdTags = await db.insert(tags).values(tagData).returning();

    // Create courses
    console.log('📚 Creating courses...');
    const courseData = [
      {
        id: uuidv4(),
        title: 'Introduction to React Development',
        description: 'Learn the fundamentals of React.js including components, state management, and hooks. Perfect for beginners who want to build modern web applications.',
        type: 'academic' as const,
        mentorId: mentors[0].id,
        organizationId: orgs[0].id,
        duration: '8 weeks',
        difficulty: 'beginner',
        category: 'Web Development',
        imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
        isPublic: true,
        maxStudents: 50,
        tags: [createdTags[1].id, createdTags[0].id]
      },
      {
        id: uuidv4(),
        title: 'Advanced Python for Data Science',
        description: 'Master Python programming for data analysis, machine learning, and scientific computing. Covers pandas, numpy, matplotlib, and scikit-learn.',
        type: 'academic' as const,
        mentorId: mentors[1].id,
        organizationId: orgs[0].id,
        duration: '12 weeks',
        difficulty: 'intermediate',
        category: 'Data Science',
        imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop',
        isPublic: true,
        maxStudents: 30,
        tags: [createdTags[2].id, createdTags[3].id]
      },
      {
        id: uuidv4(),
        title: 'Leadership in the Digital Age',
        description: 'Develop essential leadership skills for managing teams in technology-driven environments. Learn about remote leadership, digital transformation, and change management.',
        type: 'corporate' as const,
        mentorId: mentors[2].id,
        organizationId: orgs[1].id,
        duration: '6 weeks',
        difficulty: 'intermediate',
        category: 'Leadership',
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
        isPublic: true,
        maxStudents: 25,
        tags: [createdTags[4].id, createdTags[5].id]
      },
      {
        id: uuidv4(),
        title: 'UI/UX Design Fundamentals',
        description: 'Learn the principles of user interface and user experience design. Create beautiful, functional, and user-friendly digital products.',
        type: 'corporate' as const,
        mentorId: mentors[3].id,
        organizationId: orgs[2].id,
        duration: '10 weeks',
        difficulty: 'beginner',
        category: 'Design',
        imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
        isPublic: true,
        maxStudents: 35,
        tags: [createdTags[7].id, createdTags[5].id]
      },
      {
        id: uuidv4(),
        title: 'DevOps and CI/CD Pipeline',
        description: 'Master DevOps practices including continuous integration, continuous deployment, and infrastructure as code. Learn Docker, Kubernetes, and cloud deployment.',
        type: 'corporate' as const,
        mentorId: mentors[0].id,
        organizationId: orgs[1].id,
        duration: '8 weeks',
        difficulty: 'advanced',
        category: 'DevOps',
        imageUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=250&fit=crop',
        isPublic: true,
        maxStudents: 20,
        tags: [createdTags[8].id, createdTags[2].id]
      },
      {
        id: uuidv4(),
        title: 'Cybersecurity Essentials',
        description: 'Learn fundamental cybersecurity concepts, threat detection, and security best practices. Protect systems and data from cyber attacks.',
        type: 'academic' as const,
        mentorId: mentors[1].id,
        organizationId: orgs[0].id,
        duration: '10 weeks',
        difficulty: 'intermediate',
        category: 'Security',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop',
        isPublic: true,
        maxStudents: 40,
        tags: [createdTags[9].id, createdTags[8].id]
      }
    ];

    const createdCourses = await db.insert(courses).values(courseData).returning();

    // Create course tags relationships
    console.log('🔗 Creating course-tag relationships...');
    const courseTagData = [];
    for (const course of createdCourses) {
      if (course.tags) {
        for (const tagId of course.tags) {
          courseTagData.push({
            id: uuidv4(),
            courseId: course.id,
            tagId: tagId,
            confidence: 0.95
          });
        }
      }
    }
    await db.insert(courseTags).values(courseTagData);

    // Create course modules
    console.log('📖 Creating course modules...');
    const moduleData = [];
    for (const course of createdCourses) {
      const moduleCount = Math.floor(Math.random() * 5) + 4; // 4-8 modules per course
      for (let i = 0; i < moduleCount; i++) {
        moduleData.push({
          id: uuidv4(),
          courseId: course.id,
          title: `Module ${i + 1}: ${getModuleTitle(course.title, i + 1)}`,
          description: `This module covers essential concepts and practical applications.`,
          content: `Detailed content for module ${i + 1}. This includes theoretical concepts, practical examples, and hands-on exercises.`,
          orderIndex: i + 1,
          estimatedDuration: Math.floor(Math.random() * 60) + 30 // 30-90 minutes
        });
      }
    }
    await db.insert(courseModules).values(moduleData);

    // Create enrollments
    console.log('📝 Creating enrollments...');
    const enrollmentData = [];
    for (const learner of learners) {
      // Each learner enrolls in 2-4 random courses
      const numEnrollments = Math.floor(Math.random() * 3) + 2;
      const shuffledCourses = [...createdCourses].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < numEnrollments && i < shuffledCourses.length; i++) {
        const course = shuffledCourses[i];
        const progress = Math.floor(Math.random() * 100);
        // Ensure some enrollments get completed status (about 20% chance)
        const status = (progress >= 95 || Math.random() < 0.2) ? 'completed' : progress > 0 ? 'active' : 'active';
        
        enrollmentData.push({
          id: uuidv4(),
          userId: learner.id,
          courseId: course.id,
          status: status as any,
          progress: progress,
          enrolledAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          lastAccessedAt: new Date(),
          timeSpent: Math.floor(Math.random() * 480) + 60 // 1-9 hours in minutes
        });
      }
    }
    await db.insert(enrollments).values(enrollmentData);

    // Create assignments
    console.log('📋 Creating assignments...');
    const assignmentData = [];
    for (const course of createdCourses) {
      const assignmentCount = Math.floor(Math.random() * 3) + 2; // 2-4 assignments per course
      for (let i = 0; i < assignmentCount; i++) {
        assignmentData.push({
          id: uuidv4(),
          courseId: course.id,
          title: `Assignment ${i + 1}: ${getAssignmentTitle(course.title, i + 1)}`,
          description: `Complete this assignment to demonstrate your understanding of the course material.`,
          dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000), // Due in 1-4 weeks
          maxPoints: 100,
          rubric: {
            criteria: [
              { name: 'Understanding', weight: 0.4 },
              { name: 'Implementation', weight: 0.4 },
              { name: 'Documentation', weight: 0.2 }
            ]
          }
        });
      }
    }
    const createdAssignments = await db.insert(assignments).values(assignmentData).returning();

    // Create assignment submissions
    console.log('📤 Creating assignment submissions...');
    const submissionData = [];
    for (const assignment of createdAssignments) {
      // Get learners enrolled in this assignment's course
      const courseEnrollments = enrollmentData.filter(e => e.courseId === assignment.courseId);
      
      for (const enrollment of courseEnrollments) {
        if (Math.random() > 0.3) { // 70% submission rate
          const points = Math.floor(Math.random() * 100) + 1;
          const status = points > 0 ? 'graded' : 'submitted';
          
          submissionData.push({
            id: uuidv4(),
            assignmentId: assignment.id,
            userId: enrollment.userId,
            content: `Submission for ${assignment.title}. This is a sample submission demonstrating understanding of the course material.`,
            fileUrl: 'https://example.com/sample-submission.pdf',
            status: status as any,
            points: status === 'graded' ? points : null,
            feedback: status === 'graded' ? getFeedback(points) : null,
            aiFeedback: status === 'graded' ? getAIFeedback(points) : null,
            submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Submitted within last week
            gradedAt: status === 'graded' ? new Date() : null
          });
        }
      }
    }
    await db.insert(assignmentSubmissions).values(submissionData);

    // Create quizzes
    console.log('🧠 Creating quizzes...');
    const quizData = [];
    for (const course of createdCourses) {
      const quizCount = Math.floor(Math.random() * 2) + 1; // 1-2 quizzes per course
      for (let i = 0; i < quizCount; i++) {
        quizData.push({
          id: uuidv4(),
          courseId: course.id,
          title: `Quiz ${i + 1}: ${getQuizTitle(course.title, i + 1)}`,
          description: `Test your knowledge of the course material with this comprehensive quiz.`,
          timeLimit: 30, // 30 minutes
          passingScore: 70,
          isRandomized: true,
          maxAttempts: 3
        });
      }
    }
    const createdQuizzes = await db.insert(quizzes).values(quizData).returning();

    // Create quiz questions
    console.log('❓ Creating quiz questions...');
    const questionData = [];
    for (const quiz of createdQuizzes) {
      const questionCount = Math.floor(Math.random() * 5) + 5; // 5-10 questions per quiz
      for (let i = 0; i < questionCount; i++) {
        const questionType = Math.random() > 0.5 ? 'multiple_choice' : 'true_false';
        const question = getQuizQuestion(quiz.title, i + 1, questionType);
        
        questionData.push({
          id: uuidv4(),
          quizId: quiz.id,
          question: question.text,
          type: questionType as any,
          options: question.options,
          correctAnswer: question.correctAnswer,
          points: 10,
          explanation: question.explanation,
          orderIndex: i + 1
        });
      }
    }
    await db.insert(quizQuestions).values(questionData);

    // Create quiz submissions
    console.log('📝 Creating quiz submissions...');
    const quizSubmissionData = [];
    for (const quiz of createdQuizzes) {
      const courseEnrollments = enrollmentData.filter(e => e.courseId === quiz.courseId);
      
      for (const enrollment of courseEnrollments) {
        if (Math.random() > 0.4) { // 60% quiz completion rate
          const score = Math.floor(Math.random() * 100) + 1;
          const maxScore = 100;
          
          quizSubmissionData.push({
            id: uuidv4(),
            quizId: quiz.id,
            userId: enrollment.userId,
            answers: { answers: ['Sample answer 1', 'Sample answer 2'] },
            score: score,
            maxScore: maxScore,
            timeSpent: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes in seconds
            isPassed: score >= 70,
            submittedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000) // Submitted within last 2 weeks
          });
        }
      }
    }
    await db.insert(quizSubmissions).values(quizSubmissionData);

    // Create certifications
    console.log('🏆 Creating certifications...');
    const certificationData = [];
    for (const enrollment of enrollmentData) {
      if (enrollment.status === 'completed') {
        const course = createdCourses.find(c => c.id === enrollment.courseId);
        if (course) {
          certificationData.push({
            id: uuidv4(),
            userId: enrollment.userId,
            courseId: course.id,
            title: `${course.title} - Certificate of Completion`,
            description: `This certificate recognizes successful completion of ${course.title}`,
            imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
            issuedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Issued within last week
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Expires in 1 year
            certificateUrl: 'https://example.com/certificate.pdf'
          });
        }
      }
    }
    await db.insert(certifications).values(certificationData);

    // Create messages
    console.log('💬 Creating messages...');
    const messageData = [];
    for (let i = 0; i < 20; i++) {
      const sender = learners[Math.floor(Math.random() * learners.length)];
      const recipient = mentors[Math.floor(Math.random() * mentors.length)];
      
      messageData.push({
        id: uuidv4(),
        senderId: sender.id,
        recipientId: recipient.id,
        subject: getMessageSubject(),
        content: getMessageContent(),
        isRead: Math.random() > 0.3, // 70% read rate
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Within last 30 days
      });
    }
    await db.insert(messages).values(messageData);

    // Create notifications
    console.log('🔔 Creating notifications...');
    const notificationData = [];
    for (const user of createdUsers) {
      const notificationCount = Math.floor(Math.random() * 5) + 1; // 1-5 notifications per user
      for (let i = 0; i < notificationCount; i++) {
        notificationData.push({
          id: uuidv4(),
          userId: user.id,
          title: getNotificationTitle(),
          message: getNotificationMessage(),
          type: getNotificationType(),
          isRead: Math.random() > 0.4, // 60% read rate
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Within last week
        });
      }
    }
    await db.insert(notifications).values(notificationData);

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created:
    - ${createdUsers.length} users (${admins.length} admins, ${mentors.length} mentors, ${learners.length} learners)
    - ${orgs.length} organizations
    - ${createdTags.length} tags
    - ${createdCourses.length} courses
    - ${enrollmentData.length} enrollments
    - ${createdAssignments.length} assignments
    - ${submissionData.length} assignment submissions
    - ${createdQuizzes.length} quizzes
    - ${questionData.length} quiz questions
    - ${quizSubmissionData.length} quiz submissions
    - ${certificationData.length} certifications
    - ${messageData.length} messages
    - ${notificationData.length} notifications`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Helper functions for generating realistic data
function getModuleTitle(courseTitle: string, moduleNum: number): string {
  const titles = [
    'Introduction and Setup',
    'Core Concepts',
    'Advanced Techniques',
    'Practical Applications',
    'Best Practices',
    'Project Implementation',
    'Troubleshooting',
    'Final Review'
  ];
  return titles[moduleNum - 1] || `Module ${moduleNum}`;
}

function getAssignmentTitle(courseTitle: string, assignmentNum: number): string {
  const titles = [
    'Getting Started Project',
    'Core Implementation',
    'Advanced Features',
    'Final Project'
  ];
  return titles[assignmentNum - 1] || `Assignment ${assignmentNum}`;
}

function getQuizTitle(courseTitle: string, quizNum: number): string {
  const titles = [
    'Fundamentals Assessment',
    'Advanced Concepts Test',
    'Final Examination'
  ];
  return titles[quizNum - 1] || `Quiz ${quizNum}`;
}

function getQuizQuestion(quizTitle: string, questionNum: number, type: string) {
  if (type === 'multiple_choice') {
    return {
      text: `What is the primary purpose of ${quizTitle.toLowerCase().includes('react') ? 'React components' : 'this technology'}?`,
      options: ['Performance optimization', 'Code organization', 'User interface creation', 'Database management'],
      correctAnswer: 'User interface creation',
      explanation: 'The primary purpose is to create reusable user interface components.'
    };
  } else {
    return {
      text: `${quizTitle.toLowerCase().includes('react') ? 'React' : 'This technology'} is a programming language.`,
      options: null,
      correctAnswer: 'false',
      explanation: 'It is a framework/library, not a programming language.'
    };
  }
}

function getFeedback(points: number): string {
  if (points >= 90) return 'Excellent work! You demonstrate a thorough understanding of the concepts.';
  if (points >= 80) return 'Good work! You show solid understanding with room for improvement.';
  if (points >= 70) return 'Satisfactory work. Consider reviewing the material for better understanding.';
  return 'Please review the course material and consider seeking additional help.';
}

function getAIFeedback(points: number): string {
  if (points >= 90) return 'AI Analysis: Outstanding performance! Your work shows exceptional understanding and application of concepts.';
  if (points >= 80) return 'AI Analysis: Strong performance with minor areas for enhancement.';
  if (points >= 70) return 'AI Analysis: Adequate performance. Focus on strengthening foundational concepts.';
  return 'AI Analysis: Consider reviewing core concepts and seeking clarification on challenging topics.';
}

function getMessageSubject(): string {
  const subjects = [
    'Question about course material',
    'Assignment clarification needed',
    'Technical issue with platform',
    'Request for additional resources',
    'Feedback on course content',
    'Schedule adjustment request'
  ];
  return subjects[Math.floor(Math.random() * subjects.length)];
}

function getMessageContent(): string {
  const contents = [
    'I have a question about the latest module. Could you please clarify the concept of state management?',
    'I\'m having trouble with the assignment submission. The file upload isn\'t working properly.',
    'Thank you for the detailed feedback on my last assignment. It was very helpful!',
    'Could you recommend additional resources for further study on this topic?',
    'I really enjoyed the practical exercises in this module. They helped solidify the concepts.',
    'Is there any flexibility with the assignment due date? I have a scheduling conflict.'
  ];
  return contents[Math.floor(Math.random() * contents.length)];
}

function getNotificationTitle(): string {
  const titles = [
    'New course available',
    'Assignment due reminder',
    'Grade posted',
    'Course update',
    'Welcome message',
    'System maintenance'
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function getNotificationMessage(): string {
  const messages = [
    'A new course has been added to your recommended list.',
    'Your assignment is due in 24 hours. Please submit on time.',
    'Your grade for the latest assignment has been posted.',
    'New content has been added to your enrolled course.',
    'Welcome to Elevate360 LMS! We\'re excited to have you here.',
    'System maintenance scheduled for tonight at 2 AM EST.'
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

function getNotificationType(): string {
  const types = ['info', 'warning', 'success', 'reminder'];
  return types[Math.floor(Math.random() * types.length)];
}

// Run the seeding
seedDatabase()
  .then(() => {
    console.log('🎉 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
