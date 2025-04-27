import natural from 'natural';
import Lesson from '../models/lessonModel.js';

class DoubtSolverBot {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.classifier = new natural.BayesClassifier();

    // Common questions and responses
    this.commonQuestions = {
      'course_info': {
        patterns: ['what courses are available', 'course list', 'available classes'],
        response: 'We offer various courses in programming, mathematics, science, and languages. You can check the course catalog for a complete list.'
      },
      'lesson_help': {
        patterns: ['how to start lesson', 'lesson difficulty', 'lesson resources'],
        response: 'Each lesson shows its difficulty level, estimated duration, and includes helpful resources. You can track your progress as you complete lessons.'
      },
      'technical_issues': {
        patterns: ['cant login', 'video not playing', 'technical problem'],
        response: 'For technical issues, try clearing your browser cache or using a different browser. If the problem persists, contact our support team.'
      },
      'learning_path': {
        patterns: ['what should I learn first', 'learning path', 'course order'],
        response: 'We recommend starting with beginner-level lessons in your chosen category. Each lesson builds upon previous concepts.'
      }
    };

    // Train the classifier
    this.trainClassifier();
  }

  trainClassifier() {
    Object.keys(this.commonQuestions).forEach(category => {
      this.commonQuestions[category].patterns.forEach(pattern => {
        this.classifier.addDocument(pattern, category);
      });
    });
    this.classifier.train();
  }

  async processQuery(query) {
    const category = this.classifier.classify(query.toLowerCase());
    const response = this.commonQuestions[category]?.response;

    // Get related lessons using text search
    const relatedLessons = await this.findRelatedLessons(query);

    return {
      answer: response || "I'm not sure about that. Please try rephrasing your question or contact an instructor.",
      relatedLessons,
      category
    };
  }

  async findRelatedLessons(query) {
    try {
      // Use MongoDB text search with weights
      const lessons = await Lesson.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
      )
      .sort({ score: { $meta: "textScore" } })
      .limit(3)
      .select('title description difficulty duration category');

      return lessons;
    } catch (error) {
      console.error('Error finding related lessons:', error);
      return [];
    }
  }
}

export const doubtSolverBot = new DoubtSolverBot(); 