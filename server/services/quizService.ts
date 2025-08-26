import { db } from '../db';
import { 
  quizzes, 
  quizQuestions, 
  quizSubmissions, 
  quizAnswers,
  courses,
  users
} from '@shared/schema';
import { eq, and, desc, count, inArray } from 'drizzle-orm';
import { createError } from '../middleware/errorHandler';
import { aiService } from './aiService';

export interface CreateQuizRequest {
  courseId: string;
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore?: number;
  isRandomized?: boolean;
  maxAttempts?: number;
  questions: CreateQuestionRequest[];
}

export interface CreateQuestionRequest {
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'true_false' | 'essay';
  options?: string[];
  correctAnswer: string;
  points?: number;
  explanation?: string;
}

export interface SubmitQuizRequest {
  quizId: string;
  userId: string;
  answers: QuizAnswerRequest[];
}

export interface QuizAnswerRequest {
  questionId: string;
  answer: string;
}

export interface QuizResult {
  submission: any;
  answers: any[];
  score: number;
  maxScore: number;
  isPassed: boolean;
  feedback: any[];
}

export class QuizService {
  // Create a new quiz with questions
  async createQuiz(request: CreateQuizRequest): Promise<any> {
    try {
      // Validate course exists
      const course = await db.select().from(courses).where(eq(courses.id, request.courseId)).limit(1);
      if (!course.length) {
        throw createError('Course not found', 404);
      }

      // Create quiz
      const quiz = await db.insert(quizzes).values({
        courseId: request.courseId,
        title: request.title,
        description: request.description,
        timeLimit: request.timeLimit,
        passingScore: request.passingScore || 70,
        isRandomized: request.isRandomized || false,
        maxAttempts: request.maxAttempts || 1,
      }).returning();

      // Create questions
      const questions = [];
      for (let i = 0; i < request.questions.length; i++) {
        const question = request.questions[i];
        const createdQuestion = await db.insert(quizQuestions).values({
          quizId: quiz[0].id,
          question: question.question,
          type: question.type,
          options: question.options,
          correctAnswer: question.correctAnswer,
          points: question.points || 1,
          explanation: question.explanation,
          orderIndex: i + 1,
        }).returning();
        questions.push(createdQuestion[0]);
      }

      return {
        quiz: quiz[0],
        questions,
        totalQuestions: questions.length,
      };
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  }

  // Get quiz with questions
  async getQuiz(quizId: string, includeAnswers: boolean = false): Promise<any> {
    try {
      const quiz = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
      if (!quiz.length) {
        throw createError('Quiz not found', 404);
      }

      let questionsQuery = db.select().from(quizQuestions).where(eq(quizQuestions.quizId, quizId));
      
      if (!includeAnswers) {
        // Don't include correct answers for students
        questionsQuery = db.select({
          id: quizQuestions.id,
          question: quizQuestions.question,
          type: quizQuestions.type,
          options: quizQuestions.options,
          points: quizQuestions.points,
          orderIndex: quizQuestions.orderIndex,
        }).from(quizQuestions).where(eq(quizQuestions.quizId, quizId));
      }

      const questions = await questionsQuery.orderBy(quizQuestions.orderIndex);

      return {
        ...quiz[0],
        questions,
      };
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
  }

  // Submit quiz answers
  async submitQuiz(request: SubmitQuizRequest): Promise<QuizResult> {
    try {
      // Validate quiz exists
      const quiz = await db.select().from(quizzes).where(eq(quizzes.id, request.quizId)).limit(1);
      if (!quiz.length) {
        throw createError('Quiz not found', 404);
      }

      // Check if user has already taken this quiz
      const existingSubmissions = await db.select().from(quizSubmissions)
        .where(and(eq(quizSubmissions.quizId, request.quizId), eq(quizSubmissions.userId, request.userId)));

      if (existingSubmissions.length >= quiz[0].maxAttempts) {
        throw createError(`Maximum attempts (${quiz[0].maxAttempts}) exceeded for this quiz`, 400);
      }

      // Get quiz questions for grading
      const questions = await db.select().from(quizQuestions)
        .where(eq(quizQuestions.quizId, request.quizId))
        .orderBy(quizQuestions.orderIndex);

      // Grade the quiz
      const gradingResult = await this.gradeQuiz(request.answers, questions);
      
      // Create submission
      const submission = await db.insert(quizSubmissions).values({
        quizId: request.quizId,
        userId: request.userId,
        answers: request.answers,
        score: gradingResult.score,
        maxScore: gradingResult.maxScore,
        timeSpent: 0, // TODO: Track actual time spent
        isPassed: gradingResult.score >= (quiz[0].passingScore || 70),
      }).returning();

      // Create detailed answer records
      const answers = [];
      for (const answer of gradingResult.answers) {
        const createdAnswer = await db.insert(quizAnswers).values({
          submissionId: submission[0].id,
          questionId: answer.questionId,
          answer: answer.userAnswer,
          isCorrect: answer.isCorrect,
          points: answer.points,
          feedback: answer.feedback,
        }).returning();
        answers.push(createdAnswer[0]);
      }

      // Generate AI feedback for incorrect answers
      await this.generateAIFeedback(submission[0].id, answers);

      return {
        submission: submission[0],
        answers,
        score: gradingResult.score,
        maxScore: gradingResult.maxScore,
        isPassed: gradingResult.score >= (quiz[0].passingScore || 70),
        feedback: gradingResult.feedback,
      };
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  }

  // Grade quiz answers
  private async gradeQuiz(userAnswers: QuizAnswerRequest[], questions: any[]): Promise<any> {
    let totalScore = 0;
    let maxScore = 0;
    const gradedAnswers = [];
    const feedback = [];

    for (const question of questions) {
      maxScore += question.points || 1;
      const userAnswer = userAnswers.find(a => a.questionId === question.id);
      
      if (!userAnswer) {
        // No answer provided
        gradedAnswers.push({
          questionId: question.id,
          userAnswer: '',
          isCorrect: false,
          points: 0,
          feedback: 'No answer provided',
        });
        continue;
      }

      const isCorrect = this.checkAnswer(userAnswer.answer, question);
      const points = isCorrect ? (question.points || 1) : 0;
      totalScore += points;

      const answerFeedback = this.generateFeedback(question, userAnswer.answer, isCorrect);
      
      gradedAnswers.push({
        questionId: question.id,
        userAnswer: userAnswer.answer,
        isCorrect,
        points,
        feedback: answerFeedback,
      });

      if (!isCorrect) {
        feedback.push({
          question: question.question,
          userAnswer: userAnswer.answer,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
        });
      }
    }

    return {
      score: totalScore,
      maxScore,
      answers: gradedAnswers,
      feedback,
    };
  }

  // Check if an answer is correct
  private checkAnswer(userAnswer: string, question: any): boolean {
    const userAnswerLower = userAnswer.toLowerCase().trim();
    const correctAnswerLower = question.correctAnswer.toLowerCase().trim();

    switch (question.type) {
      case 'multiple_choice':
        return userAnswerLower === correctAnswerLower;
      
      case 'true_false':
        return userAnswerLower === correctAnswerLower;
      
      case 'short_answer':
        // Allow partial matches for short answers
        return userAnswerLower.includes(correctAnswerLower) || 
               correctAnswerLower.includes(userAnswerLower);
      
      case 'essay':
        // For essays, we'll need more sophisticated grading
        // For now, return true if answer is not empty
        return userAnswer.trim().length > 10;
      
      default:
        return false;
    }
  }

  // Generate feedback for an answer
  private generateFeedback(question: any, userAnswer: string, isCorrect: boolean): string {
    if (isCorrect) {
      return 'Correct! Well done.';
    }

    switch (question.type) {
      case 'multiple_choice':
        return `Incorrect. The correct answer is: ${question.correctAnswer}`;
      
      case 'true_false':
        return `Incorrect. The correct answer is: ${question.correctAnswer}`;
      
      case 'short_answer':
        return `Your answer: "${userAnswer}". The correct answer is: "${question.correctAnswer}"`;
      
      case 'essay':
        return 'Your essay answer could be improved. Consider reviewing the course material.';
      
      default:
        return 'Incorrect answer.';
    }
  }

  // Generate AI feedback for incorrect answers
  private async generateAIFeedback(submissionId: string, answers: any[]): Promise<void> {
    try {
      for (const answer of answers) {
        if (!answer.isCorrect && answer.feedback) {
          // Get question details for better AI feedback
          const question = await db.select().from(quizQuestions)
            .where(eq(quizQuestions.id, answer.questionId))
            .limit(1);

          if (question.length > 0) {
            const aiFeedback = await aiService.generateQuizFeedback({
              submissionId,
              questionId: answer.questionId,
              userAnswer: answer.userAnswer,
              correctAnswer: question[0].correctAnswer,
              explanation: question[0].explanation,
            });

            // Update answer with AI feedback
            await db.update(quizAnswers)
              .set({ aiFeedback: aiFeedback.feedback })
              .where(eq(quizAnswers.id, answer.id));
          }
        }
      }
    } catch (error) {
      console.error('Error generating AI feedback:', error);
      // Don't fail the quiz submission if AI feedback fails
    }
  }

  // Get quiz results for a user
  async getQuizResults(quizId: string, userId: string): Promise<any[]> {
    try {
      const submissions = await db.select().from(quizSubmissions)
        .where(and(eq(quizSubmissions.quizId, quizId), eq(quizSubmissions.userId, userId)))
        .orderBy(desc(quizSubmissions.submittedAt));

      const results = [];
      for (const submission of submissions) {
        const answers = await db.select().from(quizAnswers)
          .where(eq(quizAnswers.submissionId, submission.id));

        results.push({
          ...submission,
          answers,
        });
      }

      return results;
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      throw error;
    }
  }

  // Get quiz statistics
  async getQuizStats(quizId: string): Promise<any> {
    try {
      const submissions = await db.select().from(quizSubmissions)
        .where(eq(quizSubmissions.quizId, quizId));

      if (submissions.length === 0) {
        return {
          totalSubmissions: 0,
          averageScore: 0,
          passRate: 0,
          scoreDistribution: {},
        };
      }

      const totalSubmissions = submissions.length;
      const passedSubmissions = submissions.filter(s => s.isPassed).length;
      const totalScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
      const averageScore = totalScore / totalSubmissions;
      const passRate = (passedSubmissions / totalSubmissions) * 100;

      // Score distribution
      const scoreDistribution = {
        '0-20%': 0,
        '21-40%': 0,
        '41-60%': 0,
        '61-80%': 0,
        '81-100%': 0,
      };

      for (const submission of submissions) {
        const percentage = (submission.score / submission.maxScore) * 100;
        if (percentage <= 20) scoreDistribution['0-20%']++;
        else if (percentage <= 40) scoreDistribution['21-40%']++;
        else if (percentage <= 60) scoreDistribution['41-60%']++;
        else if (percentage <= 80) scoreDistribution['61-80%']++;
        else scoreDistribution['81-100%']++;
      }

      return {
        totalSubmissions,
        averageScore: Math.round(averageScore * 100) / 100,
        passRate: Math.round(passRate * 100) / 100,
        scoreDistribution,
        highestScore: Math.max(...submissions.map(s => s.score || 0)),
        lowestScore: Math.min(...submissions.map(s => s.score || 0)),
      };
    } catch (error) {
      console.error('Error fetching quiz stats:', error);
      throw error;
    }
  }

  // Update quiz
  async updateQuiz(quizId: string, updates: Partial<any>): Promise<any> {
    try {
      const updatedQuiz = await db.update(quizzes)
        .set(updates)
        .where(eq(quizzes.id, quizId))
        .returning();

      return updatedQuiz[0];
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  }

  // Delete quiz
  async deleteQuiz(quizId: string): Promise<void> {
    try {
      // Delete in order due to foreign key constraints
      await db.delete(quizAnswers).where(eq(quizAnswers.submissionId, quizId));
      await db.delete(quizSubmissions).where(eq(quizSubmissions.quizId, quizId));
      await db.delete(quizQuestions).where(eq(quizQuestions.quizId, quizId));
      await db.delete(quizzes).where(eq(quizzes.id, quizId));
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  }

  // Get quizzes for a course
  async getCourseQuizzes(courseId: string): Promise<any[]> {
    try {
      const courseQuizzes = await db.select().from(quizzes)
        .where(eq(quizzes.courseId, courseId))
        .orderBy(quizzes.createdAt);

      return courseQuizzes;
    } catch (error) {
      console.error('Error fetching course quizzes:', error);
      throw error;
    }
  }

  // Get user's quiz history
  async getUserQuizHistory(userId: string): Promise<any[]> {
    try {
      const submissions = await db.select({
        id: quizSubmissions.id,
        quizId: quizSubmissions.quizId,
        quizTitle: quizzes.title,
        courseId: quizzes.courseId,
        score: quizSubmissions.score,
        maxScore: quizSubmissions.maxScore,
        isPassed: quizSubmissions.isPassed,
        submittedAt: quizSubmissions.submittedAt,
      })
      .from(quizSubmissions)
      .innerJoin(quizzes, eq(quizSubmissions.quizId, quizzes.id))
      .where(eq(quizSubmissions.userId, userId))
      .orderBy(desc(quizSubmissions.submittedAt));

      return submissions;
    } catch (error) {
      console.error('Error fetching user quiz history:', error);
      throw error;
    }
  }
}

export const quizService = new QuizService();
