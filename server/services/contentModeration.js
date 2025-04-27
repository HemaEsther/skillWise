class ContentModerator {
  constructor() {
    // List of bad words to check for (you can expand this list)
    this.badWords = [
      'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'piss', 'dick', 'cock', 'pussy',
      'asshole', 'bastard', 'slut', 'douche', 'cunt', 'whore'
    ];
    this.badWordsRegex = new RegExp(`\\b(${this.badWords.join('|')})\\b`, 'gi');
  }

  checkContent(text) {
    // Check for bad words
    const containsBadWords = this.badWordsRegex.test(text);
    
    // Reset the regex lastIndex
    this.badWordsRegex.lastIndex = 0;
    
    // Find all matches to highlight the bad words
    const matches = text.match(this.badWordsRegex) || [];
    
    return {
      flagged: containsBadWords,
      reason: matches.length > 0 ? `Found inappropriate words: ${matches.join(', ')}` : null,
      badWordsFound: matches
    };
  }

  // Method to check both sentiment and content
  async moderateContent(text, sentimentResult) {
    const contentCheck = this.checkContent(text);
    
    // Flag content if it contains bad words or has very negative sentiment
    const shouldFlag = contentCheck.flagged || 
                      (sentimentResult.label === 'NEGATIVE' && sentimentResult.confidence > 0.8);

    return {
      flagged: shouldFlag,
      reason: contentCheck.reason || 
              (shouldFlag && !contentCheck.reason ? 'Extremely negative content detected' : null),
      badWordsFound: contentCheck.badWordsFound,
      reviewedBy: null,
      reviewedAt: null
    };
  }
}

export default new ContentModerator(); 