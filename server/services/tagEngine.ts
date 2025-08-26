import { db } from '../db';
import { tags, courseTags, courses } from '@shared/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { createError } from '../middleware/errorHandler';

export interface TagSuggestion {
  name: string;
  category: string;
  confidence: number;
  description?: string;
  color?: string;
}

export interface CourseTaggingRequest {
  courseId: string;
  title: string;
  description?: string;
  content?: string;
  manualTags?: string[];
}

export class TagEngine {
  private predefinedTags: Map<string, any> = new Map();

  constructor() {
    this.initializePredefinedTags();
  }

  // Initialize predefined tags for common categories
  private async initializePredefinedTags() {
    const predefinedTags = [
      { name: 'JavaScript', category: 'technology', color: '#F7DF1E', description: 'JavaScript programming language' },
      { name: 'Python', category: 'technology', color: '#3776AB', description: 'Python programming language' },
      { name: 'React', category: 'technology', color: '#61DAFB', description: 'React JavaScript library' },
      { name: 'Node.js', category: 'technology', color: '#339933', description: 'Node.js runtime environment' },
      { name: 'Data Science', category: 'domain', color: '#FF6B6B', description: 'Data science and analytics' },
      { name: 'Machine Learning', category: 'domain', color: '#4ECDC4', description: 'Machine learning and AI' },
      { name: 'Web Development', category: 'domain', color: '#45B7D1', description: 'Web development and design' },
      { name: 'Mobile Development', category: 'domain', color: '#96CEB4', description: 'Mobile app development' },
      { name: 'Database', category: 'technology', color: '#FFEAA7', description: 'Database systems and SQL' },
      { name: 'DevOps', category: 'domain', color: '#DDA0DD', description: 'DevOps and deployment' },
      { name: 'Cybersecurity', category: 'domain', color: '#FF8A80', description: 'Cybersecurity and security' },
      { name: 'Cloud Computing', category: 'domain', color: '#81C784', description: 'Cloud platforms and services' },
      { name: 'UI/UX', category: 'skill', color: '#FFB74D', description: 'User interface and experience design' },
      { name: 'Project Management', category: 'skill', color: '#BA68C8', description: 'Project management methodologies' },
      { name: 'Leadership', category: 'skill', color: '#4DB6AC', description: 'Leadership and management skills' },
      { name: 'Communication', category: 'skill', color: '#FFD54F', description: 'Communication and presentation skills' },
    ];

    for (const tag of predefinedTags) {
      this.predefinedTags.set(tag.name.toLowerCase(), tag);
    }
  }

  // Auto-tag a course based on its content
  async autoTagCourse(request: CourseTaggingRequest): Promise<any[]> {
    try {
      const suggestions = await this.generateTagSuggestions(request);
      const appliedTags: any[] = [];

      for (const suggestion of suggestions) {
        if (suggestion.confidence > 0.6) { // Only apply high-confidence tags
          const tag = await this.ensureTagExists(suggestion);
          const courseTag = await this.applyTagToCourse(request.courseId, tag.id, suggestion.confidence);
          appliedTags.push(courseTag);
        }
      }

      // Apply manual tags if provided
      if (request.manualTags) {
        for (const tagName of request.manualTags) {
          const tag = await this.ensureTagExists({ name: tagName, category: 'manual', confidence: 1.0 });
          const courseTag = await this.applyTagToCourse(request.courseId, tag.id, 1.0);
          appliedTags.push(courseTag);
        }
      }

      return appliedTags;
    } catch (error) {
      console.error('Error auto-tagging course:', error);
      throw error;
    }
  }

  // Generate tag suggestions using AI and keyword analysis
  private async generateTagSuggestions(request: CourseTaggingRequest): Promise<TagSuggestion[]> {
    const suggestions: TagSuggestion[] = [];
    const text = `${request.title} ${request.description || ''} ${request.content || ''}`.toLowerCase();

    // Keyword-based tagging
    const keywordMatches = this.findKeywordMatches(text);
    suggestions.push(...keywordMatches);

    // AI-based tagging (if available)
    if (process.env.GOOGLE_API_KEY) {
      try {
        const aiSuggestions = await this.generateAITagSuggestions(request);
        suggestions.push(...aiSuggestions);
      } catch (error) {
        console.warn('AI tagging failed, using keyword-based only:', error);
      }
    }

    // Remove duplicates and sort by confidence
    const uniqueSuggestions = this.removeDuplicateSuggestions(suggestions);
    return uniqueSuggestions.sort((a, b) => b.confidence - a.confidence);
  }

  // Find keyword matches in predefined tags
  private findKeywordMatches(text: string): TagSuggestion[] {
    const matches: TagSuggestion[] = [];

    for (const [key, tag] of this.predefinedTags) {
      if (text.includes(key)) {
        matches.push({
          name: tag.name,
          category: tag.category,
          confidence: 0.8,
          description: tag.description,
          color: tag.color,
        });
      }
    }

    // Check for partial matches
    const words = text.split(/\s+/);
    for (const word of words) {
      if (word.length > 3) {
        for (const [key, tag] of this.predefinedTags) {
          if (key.includes(word) || word.includes(key)) {
            matches.push({
              name: tag.name,
              category: tag.category,
              confidence: 0.6,
              description: tag.description,
              color: tag.color,
            });
          }
        }
      }
    }

    return matches;
  }

  // Generate AI-based tag suggestions
  private async generateAITagSuggestions(request: CourseTaggingRequest): Promise<TagSuggestion[]> {
    try {
      const prompt = `Analyze the following course content and suggest relevant tags:

Course Title: ${request.title}
Description: ${request.description || 'No description provided'}
Content: ${request.content || 'No content provided'}

Please suggest 5-8 relevant tags in the following format:
- Technology tags (programming languages, frameworks, tools)
- Domain tags (subject areas, industries)
- Skill tags (competencies, abilities)

Format each tag as: [name]|[category]|[confidence 0.0-1.0]|[brief description]

Example:
JavaScript|technology|0.9|JavaScript programming language
Web Development|domain|0.8|Web development and design
Problem Solving|skill|0.7|Analytical and problem-solving skills`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'x-goog-api-key': process.env.GOOGLE_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.3,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return this.parseAITagSuggestions(aiResponse);
    } catch (error) {
      console.error('AI tag suggestion failed:', error);
      return [];
    }
  }

  // Parse AI-generated tag suggestions
  private parseAITagSuggestions(aiResponse: string): TagSuggestion[] {
    const suggestions: TagSuggestion[] = [];
    const lines = aiResponse.split('\n');

    for (const line of lines) {
      const parts = line.split('|');
      if (parts.length >= 3) {
        const [name, category, confidenceStr, description] = parts;
        const confidence = parseFloat(confidenceStr) || 0.7;

        if (name && category && confidence > 0) {
          suggestions.push({
            name: name.trim(),
            category: category.trim(),
            confidence: Math.min(confidence, 1.0),
            description: description?.trim(),
          });
        }
      }
    }

    return suggestions;
  }

  // Remove duplicate tag suggestions
  private removeDuplicateSuggestions(suggestions: TagSuggestion[]): TagSuggestion[] {
    const seen = new Set<string>();
    return suggestions.filter(suggestion => {
      const key = suggestion.name.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Ensure a tag exists in the database
  private async ensureTagExists(suggestion: TagSuggestion): Promise<any> {
    // Check if tag already exists
    const existingTag = await db.select().from(tags).where(eq(tags.name, suggestion.name)).limit(1);
    
    if (existingTag.length > 0) {
      return existingTag[0];
    }

    // Create new tag
    const newTag = await db.insert(tags).values({
      name: suggestion.name,
      category: suggestion.category,
      description: suggestion.description,
      color: suggestion.color || this.generateRandomColor(),
    }).returning();

    return newTag[0];
  }

  // Apply a tag to a course
  private async applyTagToCourse(courseId: string, tagId: string, confidence: number): Promise<any> {
    // Check if tag is already applied
    const existingTag = await db.select().from(courseTags)
      .where(and(eq(courseTags.courseId, courseId), eq(courseTags.tagId, tagId)))
      .limit(1);

    if (existingTag.length > 0) {
      // Update confidence if higher
      if (confidence > existingTag[0].confidence) {
        await db.update(courseTags)
          .set({ confidence })
          .where(and(eq(courseTags.courseId, courseId), eq(courseTags.tagId, tagId)));
      }
      return existingTag[0];
    }

    // Apply new tag
    const courseTag = await db.insert(courseTags).values({
      courseId,
      tagId,
      confidence,
    }).returning();

    return courseTag[0];
  }

  // Generate a random color for tags
  private generateRandomColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#FF8A80', '#81C784', '#FFB74D', '#BA68C8',
      '#4DB6AC', '#FFD54F', '#A1887F', '#90A4AE', '#FFAB91'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Get all tags with optional filtering
  async getTags(category?: string, search?: string): Promise<any[]> {
    try {
      let query = db.select().from(tags);

      if (category) {
        query = query.where(eq(tags.category, category));
      }

      if (search) {
        // Simple search - in production, consider using full-text search
        query = query.where(eq(tags.name, search));
      }

      const tags = await query.orderBy(tags.name);
      return tags;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  }

  // Get tags for a specific course
  async getCourseTags(courseId: string): Promise<any[]> {
    try {
      const courseTags = await db.select({
        id: courseTags.id,
        name: tags.name,
        category: tags.category,
        description: tags.description,
        color: tags.color,
        confidence: courseTags.confidence,
      })
      .from(courseTags)
      .innerJoin(tags, eq(courseTags.tagId, tags.id))
      .where(eq(courseTags.courseId, courseId))
      .orderBy(courseTags.confidence);

      return courseTags;
    } catch (error) {
      console.error('Error fetching course tags:', error);
      throw error;
    }
  }

  // Remove a tag from a course
  async removeCourseTag(courseId: string, tagId: string): Promise<void> {
    try {
      await db.delete(courseTags)
        .where(and(eq(courseTags.courseId, courseId), eq(courseTags.tagId, tagId)));
    } catch (error) {
      console.error('Error removing course tag:', error);
      throw error;
    }
  }

  // Update tag information
  async updateTag(tagId: string, updates: Partial<any>): Promise<any> {
    try {
      const updatedTag = await db.update(tags)
        .set(updates)
        .where(eq(tags.id, tagId))
        .returning();

      return updatedTag[0];
    } catch (error) {
      console.error('Error updating tag:', error);
      throw error;
    }
  }

  // Delete a tag (and remove from all courses)
  async deleteTag(tagId: string): Promise<void> {
    try {
      // Remove from all courses first
      await db.delete(courseTags).where(eq(courseTags.tagId, tagId));
      
      // Delete the tag
      await db.delete(tags).where(eq(tags.id, tagId));
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  }

  // Get popular tags (most used)
  async getPopularTags(limit: number = 10): Promise<any[]> {
    try {
      const popularTags = await db.select({
        id: tags.id,
        name: tags.name,
        category: tags.category,
        description: tags.description,
        color: tags.color,
        usageCount: courseTags.id,
      })
      .from(tags)
      .leftJoin(courseTags, eq(tags.id, courseTags.tagId))
      .groupBy(tags.id)
      .orderBy(courseTags.id)
      .limit(limit);

      return popularTags;
    } catch (error) {
      console.error('Error fetching popular tags:', error);
      throw error;
    }
  }

  // Suggest tags for a new course based on title/description
  async suggestTagsForCourse(title: string, description?: string): Promise<TagSuggestion[]> {
    try {
      const request: CourseTaggingRequest = {
        courseId: 'temp',
        title,
        description,
      };

      const suggestions = await this.generateTagSuggestions(request);
      return suggestions.slice(0, 8); // Return top 8 suggestions
    } catch (error) {
      console.error('Error suggesting tags:', error);
      return [];
    }
  }
}

export const tagEngine = new TagEngine();
