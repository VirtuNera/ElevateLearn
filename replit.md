# Overview

Elevate 360 LMS is a comprehensive Learning Management System designed to serve both higher education and corporate training environments. The system features a dual-purpose architecture that supports academic-style learning (assignments, grades, rubrics) and corporate-style training (microlearning, simulations, auto-certifications). Built with a role-based access control system, it provides tailored experiences for learners, mentors/instructors, and administrators across different organizational contexts.

## Recent Changes (January 2025)

- **Authentication System Updated**: Replaced Replit Auth with demo authentication system to remove external account connection requirements
- **Demo Users Implemented**: Created three test users (Sarah/Learner, John/Mentor, Alex/Admin) for easy role-based testing
- **Simplified Login Flow**: Users can now access the LMS immediately through the demo login modal without external service dependencies
- **Full Role-Based Dashboards**: All three user roles have functional dashboards with appropriate features and permissions
- **New Color Palette Applied**: Updated entire UI to use sophisticated slate blue palette (#0D1321, #1D2D44, #3E5C76, #748CAB, #F0EBD8) with proper light/dark mode support
- **Sample Data Added**: Populated LMS with demo courses, enrollments, assignments, and certifications for comprehensive testing experience

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript for end-to-end type safety
- **API Design**: RESTful API with role-based route protection
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL session store
- **File Structure**: Modular architecture with separate client, server, and shared directories

## Authentication & Authorization
- **Provider**: Replit Auth with OpenID Connect integration
- **Session Storage**: PostgreSQL-backed sessions for persistence
- **Role System**: Three-tier role hierarchy (learner, mentor, admin) with granular permissions
- **Security**: JWT token handling with automatic refresh and unauthorized request handling

## Data Storage Architecture
- **Primary Database**: PostgreSQL with Neon serverless database hosting
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **File Storage**: Google Cloud Storage integration for course materials and user uploads
- **Caching**: TanStack Query provides client-side caching with configurable stale times

## Course Content Management
- **Dual Course Models**: 
  - Academic: Structured modules with assignments, gradebooks, and rubric-based assessment
  - Corporate: Self-paced content with scenario-based quizzes and automated certifications
- **Content Types**: Support for various media types including documents, videos, and interactive content
- **Progress Tracking**: Granular progress monitoring with completion status and performance analytics

## Real-time Features
- **Messaging System**: Internal messaging between mentors, learners, and administrators
- **Notifications**: Real-time notifications for deadlines, feedback, course completions, and system updates
- **Live Updates**: Real-time data synchronization using React Query's background refetching

## Responsive Design
- **Mobile-First**: Responsive design optimized for desktop, tablet, and mobile devices
- **Progressive Enhancement**: Core functionality works across different device capabilities
- **Accessibility**: ARIA compliance and keyboard navigation support through Radix UI components

# External Dependencies

## Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Google Cloud Storage**: File storage and CDN for course materials and user uploads
- **Replit Hosting**: Primary hosting platform with integrated development environment

## Authentication Services
- **Replit Auth**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware with OpenID Connect strategy

## File Upload & Management
- **Uppy**: Advanced file upload handling with drag-and-drop, progress tracking, and cloud storage integration
- **AWS S3 Compatible**: Upload directly to Google Cloud Storage using S3-compatible APIs

## UI Component Libraries
- **Radix UI**: Headless, accessible UI primitives for complex components
- **Lucide React**: Consistent icon library with extensive icon set
- **React Hook Form**: Form handling with validation and error management

## Development & Build Tools
- **TypeScript**: Static type checking across frontend and backend
- **ESBuild**: Fast bundling for server-side code
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer
- **Drizzle Kit**: Database migration and schema management tools

## Monitoring & Development
- **Replit Development Tools**: Integrated debugging and error tracking
- **TanStack React Query Devtools**: Development-time query inspection and debugging