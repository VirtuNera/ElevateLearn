CREATE TYPE "public"."assignment_status" AS ENUM('pending', 'submitted', 'graded');--> statement-breakpoint
CREATE TYPE "public"."course_type" AS ENUM('academic', 'corporate');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('active', 'completed', 'dropped');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('multiple_choice', 'short_answer', 'true_false', 'essay');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('learner', 'course', 'system', 'quiz_feedback');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('learner', 'mentor', 'admin');--> statement-breakpoint
CREATE TABLE "assignment_submissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text,
	"file_url" varchar,
	"status" "assignment_status" DEFAULT 'pending' NOT NULL,
	"points" integer,
	"feedback" text,
	"ai_feedback" text,
	"submitted_at" timestamp DEFAULT now(),
	"graded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"due_date" timestamp,
	"max_points" integer DEFAULT 100,
	"rubric" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"action" varchar NOT NULL,
	"resource" varchar,
	"resource_id" varchar,
	"details" jsonb,
	"ip_address" varchar,
	"user_agent" varchar,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "certifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"course_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"image_url" varchar,
	"issued_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"certificate_url" varchar
);
--> statement-breakpoint
CREATE TABLE "course_modules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"content" text,
	"order_index" integer NOT NULL,
	"estimated_duration" integer,
	"prerequisites" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_tags" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar NOT NULL,
	"tag_id" varchar NOT NULL,
	"confidence" numeric(3, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"type" "course_type" NOT NULL,
	"mentor_id" varchar NOT NULL,
	"organization_id" varchar,
	"duration" varchar,
	"difficulty" varchar,
	"category" varchar,
	"image_url" varchar,
	"is_public" boolean DEFAULT true,
	"max_students" integer,
	"tags" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"course_id" varchar NOT NULL,
	"status" "enrollment_status" DEFAULT 'active' NOT NULL,
	"progress" integer DEFAULT 0,
	"enrolled_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"last_accessed_at" timestamp,
	"time_spent" integer
);
--> statement-breakpoint
CREATE TABLE "equity_insights" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar,
	"metric" varchar NOT NULL,
	"demographic" varchar NOT NULL,
	"value" numeric(10, 4),
	"baseline" numeric(10, 4),
	"trend" varchar,
	"recommendations" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_id" varchar NOT NULL,
	"recipient_id" varchar NOT NULL,
	"subject" varchar,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"message" text NOT NULL,
	"type" varchar NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "nura_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "report_type" NOT NULL,
	"target_id" varchar,
	"content" jsonb NOT NULL,
	"insights" jsonb,
	"recommendations" jsonb,
	"confidence" numeric(3, 2),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar NOT NULL,
	"description" text,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_answers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" varchar NOT NULL,
	"question_id" varchar NOT NULL,
	"answer" text,
	"is_correct" boolean,
	"points" integer,
	"feedback" text,
	"ai_feedback" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" varchar NOT NULL,
	"question" text NOT NULL,
	"type" "question_type" NOT NULL,
	"options" jsonb,
	"correct_answer" text,
	"points" integer DEFAULT 1,
	"explanation" text,
	"order_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_submissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"answers" jsonb,
	"score" integer,
	"max_score" integer,
	"time_spent" integer,
	"is_passed" boolean,
	"submitted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"time_limit" integer,
	"passing_score" integer,
	"is_randomized" boolean DEFAULT false,
	"max_attempts" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"schedule" jsonb NOT NULL,
	"goals" jsonb,
	"progress" jsonb,
	"ai_generated" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metric" varchar NOT NULL,
	"value" jsonb NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"category" varchar,
	"description" text,
	"color" varchar,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" "user_role" DEFAULT 'learner' NOT NULL,
	"organization_type" varchar,
	"organization_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");