import { pipeline } from '@xenova/transformers';

class SentimentAnalyzer {
  constructor() {
    this.analyzer = null;
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      try {
        this.analyzer = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
        this.initialized = true;
        console.log('Sentiment analyzer initialized successfully');
      } catch (error) {
        console.error('Error initializing sentiment analyzer:', error);
        throw error;
      }
    }
  }

  async analyzeSentiment(text) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const result = await this.analyzer(text);
      const sentiment = result[0];
      
      // Convert the sentiment to a polarity score (-1 to 1)
      const polarity = sentiment.label === 'POSITIVE' 
        ? sentiment.score 
        : -sentiment.score;

      return {
        polarity,
        label: sentiment.label,
        confidence: sentiment.score,
        text
      };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return {
        polarity: 0,
        label: 'NEUTRAL',
        confidence: 0,
        text
      };
    }
  }

  getSentimentCategory(polarity) {
    if (polarity >= 0.6) return 'Very Positive';
    if (polarity >= 0.2) return 'Positive';
    if (polarity <= -0.6) return 'Very Negative';
    if (polarity <= -0.2) return 'Negative';
    return 'Neutral';
  }
}

export default new SentimentAnalyzer(); 