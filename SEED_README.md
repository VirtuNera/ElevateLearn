# Database Seeding Script

This script populates your Elevate360 LMS database with realistic sample data for testing and development.

## What it creates:

### Organizations (3)
- TechCorp University
- Innovate Solutions Inc.
- Global Learning Center

### Users (13 total)
- **2 Admins**: Sarah Johnson, Michael Chen
- **4 Mentors**: Dr. Emily Smith, Prof. James Davis, Lisa Wilson, Robert Brown
- **7 Learners**: Alex Garcia, Maria Rodriguez, David Kim, Sophie Taylor, John Anderson, Emma Thomas, Chris Martinez

### Courses (6)
- Introduction to React Development
- Advanced Python for Data Science
- Leadership in the Digital Age
- UI/UX Design Fundamentals
- DevOps and CI/CD Pipeline
- Cybersecurity Essentials

### Additional Data
- **Tags** (10): JavaScript, React, Python, Data Science, Leadership, Communication, Project Management, UI/UX Design, DevOps, Cybersecurity
- **Course Modules**: 4-8 modules per course
- **Enrollments**: Each learner enrolled in 2-4 random courses
- **Assignments**: 2-4 assignments per course with submissions
- **Quizzes**: 1-2 quizzes per course with questions and submissions
- **Certifications**: For completed courses
- **Messages**: Between learners and mentors
- **Notifications**: Various system notifications

## How to run:

1. Make sure your database is set up and your `.env` file contains the `DATABASE_URL`
2. Run the seeding script:

```bash
npm run db:seed
```

## Sample Login Credentials:

You can use these email addresses to test different user roles:

### Admin Users:
- `admin@elevate360.com` - Sarah Johnson
- `admin2@elevate360.com` - Michael Chen

### Mentor Users:
- `dr.smith@techcorp.edu` - Dr. Emily Smith
- `prof.davis@techcorp.edu` - Prof. James Davis
- `trainer.wilson@innovate.com` - Lisa Wilson
- `coach.brown@global.com` - Robert Brown

### Learner Users:
- `alex.garcia@student.edu` - Alex Garcia
- `maria.rodriguez@student.edu` - Maria Rodriguez
- `david.kim@student.edu` - David Kim
- `sophie.taylor@employee.com` - Sophie Taylor
- `john.anderson@employee.com` - John Anderson
- `emma.thomas@professional.com` - Emma Thomas
- `chris.martinez@professional.com` - Chris Martinez

## Notes:

- The script will **clear all existing data** before seeding (you can comment out the deletion section if you want to keep existing data)
- All users have profile images from Unsplash
- Course images are also from Unsplash
- Progress and grades are randomized for realistic variation
- Dates are set within reasonable ranges (last 30 days for enrollments, etc.)

## Customization:

You can modify the `seed-database.ts` file to:
- Add more users, courses, or other data
- Change the data generation logic
- Adjust the number of items created
- Modify the helper functions for different content

## Troubleshooting:

If you encounter errors:
1. Make sure your database is running and accessible
2. Check that your `.env` file has the correct `DATABASE_URL`
3. Ensure all dependencies are installed (`npm install`)
4. Verify your database schema is up to date (`npm run db:push`)
