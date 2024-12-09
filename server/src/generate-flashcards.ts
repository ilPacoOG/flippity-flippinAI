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
      { role: 'user', content: `Generate ${numberOfFlashcards} flashcards for the category: ${category}. Each flashcard should include a question, the correct answer, and 3 incorrect options.` }
    ],
    max_tokens: 2000, // Increased for longer responses
  });

  const message = response.data.choices[0]?.message?.content;
  if (!message) {
    throw new Error('No content found in OpenAI response');
  }

  console.log('Generated Content:', message);

  // Split the response into lines
  const lines = message.split('\n').filter((line) => line.trim() !== '');

  // Group questions, answers, and options
  const flashcards = [];
  for (let i = 0; i < lines.length; i += 5) {
    const question = lines[i]?.trim();
    const correctAnswer = lines[i + 1]?.trim();
    const options = [
      correctAnswer,
      lines[i + 2]?.trim(),
      lines[i + 3]?.trim(),
      lines[i + 4]?.trim(),
    ].filter(Boolean); // Remove undefined or empty options

    flashcards.push({
      question: question || 'No question provided',
      answer: correctAnswer || 'No correct answer provided',
      options: options.sort(() => Math.random() - 0.5), // Shuffle options
    });
  }

  return flashcards;
}

