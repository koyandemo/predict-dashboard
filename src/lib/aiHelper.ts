import { GoogleGenAI } from '@google/genai';

// Initialize Google Gemini client
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '' });

/**
 * Generate a comment using AI based on match details
 * @param matchDetails Details about the match
 * @returns Generated comment text
 */
export const generateAIComment = async (matchDetails: {
  homeTeam: string;
  awayTeam: string;
  league: string;
  matchDate: string;
}): Promise<string> => {
  try {
    const prompt = `Generate a short, engaging comment for a football match prediction platform. 
    Match: ${matchDetails.homeTeam} vs ${matchDetails.awayTeam}
    League: ${matchDetails.league}
    Date: ${matchDetails.matchDate}
    
    The comment should be insightful but casual, as if written by a knowledgeable football fan. 
    Keep it under 200 characters. Do not include any markdown or special formatting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt
    });

    return response.text || 
      `Excited for this ${matchDetails.league} match between ${matchDetails.homeTeam} and ${matchDetails.awayTeam}!`;
  } catch (error) {
    // Return a fallback comment
    return `Looking forward to seeing how this ${matchDetails.league} clash unfolds!`;
  }
};