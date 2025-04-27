import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv'
dotenv.config();

class GeminiService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
  
    if (!apiKey) {
      console.error('Error: GEMINI_API_KEY not found in environment variables');
      this.isConfigured = false;
      return;
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      this.isConfigured = true;
    } catch (error) {
      console.error('Error initializing Gemini:', error);
      this.isConfigured = false;
    }
  }

  async generateResponse(message) {
    if (!this.isConfigured) {
      throw new Error('Gemini service is not properly configured');
    }

    try {
      const result = await this.model.generateContent(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new Error('Invalid API key configuration');
      }
      throw error;
    }
  }
}

const geminiService = new GeminiService();
export { geminiService };
