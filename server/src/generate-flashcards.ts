import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import FlashcardModel from './models/Flashcard';

// Load environment variables
dotenv.config();

// OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is loaded properly
});
const openai = new OpenAIApi(configuration);

// Function to generate flashcards
export async function generateFlashcards(
  category: string,
  numberOfFlashcards: number = 10
) {
  if (!category) {
    throw new Error('Category is required');
  }

  const batchSize = 10; // Number of flashcards per batch
  const batches = Math.ceil(numberOfFlashcards / batchSize); // Number of batches
  const flashcards: any[] = [];

  for (let i = 0; i < batches; i++) {
    const remaining = numberOfFlashcards - flashcards.length;
    const currentBatchSize = Math.min(batchSize, remaining);

    console.log(`Generating batch ${i + 1} of ${batches}, size: ${currentBatchSize}`);

    try {
      // OpenAI API call
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Generate ${currentBatchSize} flashcards for the category: ${category}. Each flashcard should have:
              1. A question.
              2. A correct answer.
              3. Three incorrect options.
              Format the response as a JSON array where each item has "question", "answer", and "options".`
          }
        ],
        max_tokens: 2000,
      });

      const message = response.data.choices[0]?.message?.content;

      if (!message) {
        throw new Error('No content found in OpenAI response');
      }

      console.log('Raw OpenAI Response:', message);

      // Parse the current batch
      const batchFlashcards = JSON.parse(message);
      flashcards.push(
        ...batchFlashcards.map((item: any, index: number) => ({
          id: `${i}-${index}-${Date.now()}`,
          question: item.question?.trim() || 'No question provided',
          answer: item.answer?.trim() || 'No answer provided',
          options: (item.options || [])
            .filter((opt: string) => opt.trim() !== '')
            .map((opt: string) => opt.trim()),
          category,
          createdAt: new Date(),
        }))
      );
    } catch (error: unknown) {
      // Narrow the error type
      if (error instanceof Error) {
        console.error('Error generating flashcards:', error.message);

        // Check if error has a response property (e.g., AxiosError)
        if ((error as any).response) {
          console.error('API Response Error:', (error as any).response.data);
        }

        throw new Error(
          `Failed to fetch flashcards: ${error.message || 'Unknown error'}`
        );
      } else {
        console.error('Unexpected error:', error);
        throw new Error('An unknown error occurred.');
      }
    }
  }

  try {
    // Save flashcards to MongoDB
    const savedFlashcards = await FlashcardModel.insertMany(
      flashcards.map((flashcard) => ({
        question: flashcard.question,
        answer: flashcard.answer,
        options: flashcard.options,
        category: flashcard.category,
        createdAt: flashcard.createdAt,
      }))
    );
    console.log('Flashcards saved to database:', savedFlashcards);
  } catch (dbError) {
    console.error('Error saving flashcards to database:', dbError);
    throw new Error('Failed to save flashcards to database');
  }

  return flashcards;
}
