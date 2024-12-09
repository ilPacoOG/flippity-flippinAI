import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function generateFlashcards(category: string, numberOfFlashcards: number = 10) {
  if (!category) {
    throw new Error('Category is required');
  }

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: `Generate ${numberOfFlashcards} flashcards for the category: ${category}` }
    ],
    max_tokens: 1500,
  });

  const message = response.data.choices[0]?.message?.content;
  if (!message) {
    throw new Error('No content found in OpenAI response');
  }

  const flashcards = message
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const delimiterIndex = line.indexOf(':');
      if (delimiterIndex === -1) {
        return { question: line.trim(), answer: 'No answer provided' };
      }
      const question = line.slice(0, delimiterIndex).trim();
      const answer = line.slice(delimiterIndex + 1).trim();
      return { question, answer };
    })
    .filter((flashcard) => flashcard.question && flashcard.answer);

  return flashcards;
}
