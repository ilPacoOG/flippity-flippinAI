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
      {
        role: 'user',
        content: `Generate ${numberOfFlashcards} flashcards for the category: ${category}. Each flashcard should have:
        1. A question.
        2. A correct answer.
        3. Three incorrect options.
        Format the response as a JSON array where each item has "question", "answer", and "options". Do not include prefixes like "Flashcard:", "Correct Answer:", or "Incorrect Options:".`
      }
    ],
    max_tokens: 2000,
  });

  const message = response.data.choices[0]?.message?.content;

  if (!message) {
    throw new Error('No content found in OpenAI response');
  }

  console.log('Raw OpenAI Response:', message);

  // Parse the OpenAI response into a usable format
  try {
    const rawFlashcards = JSON.parse(message);
    const flashcards = rawFlashcards.map((item: any, index: number) => {
      return {
        id: `${index}-${Date.now()}`,
        question: item.question?.trim() || 'No question provided',
        answer: item.answer?.trim() || 'No answer provided',
        options: (item.options || [])
          .filter((opt: string) => opt.trim() !== '') // Remove empty options
          .map((opt: string) => opt.trim()), // Trim extra spaces
      };
    });

    return flashcards;
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    throw new Error('Failed to parse OpenAI response. Ensure the API response is properly formatted.');
  }
}


