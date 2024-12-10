import axios from 'axios';

// Fetch categories from OpenTDB
export const fetchCategories = async () => {
  try {
    const response = await axios.get('https://opentdb.com/api_category.php');
    return response.data.trivia_categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories.');
  }
};

// Fetch saved categories from the database
export const fetchSavedCategories = async () => {
  try {
    const response = await axios.get('/api/flashcards/categories');
    return response.data.categories;
  } catch (error) {
    console.error('Error fetching saved categories:', error);
    throw new Error('Failed to fetch saved categories.');
  }
};

// Generate flashcards using OpenAI or OpenTDB
export const generateFlashcards = async (category: string, count: number, useOpenAI: boolean) => {
  try {
    if (useOpenAI) {
      const response = await axios.post('/api/generate-flashcards', { category, count });
      return response.data.flashcards.map((flashcard: any, index: number) => ({
        ...flashcard,
        id: flashcard.id || `${Date.now()}-${index}`,
      }));
    } else {
      const response = await axios.get('https://opentdb.com/api.php', {
        params: { amount: count, category },
      });
      return response.data.results.map((questionItem: any, index: number) => {
        const answer = questionItem.correct_answer;
        const options = [...questionItem.incorrect_answers, answer];
        return {
          id: `${index}-${Date.now()}`,
          question: questionItem.question,
          answer,
          options: options.sort(() => Math.random() - 0.5),
        };
      });
    }
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw new Error('Failed to generate flashcards.');
  }
};

// Save flashcards to the database
export const saveFlashcards = async (flashcards: any[], category: string) => {
  try {
    await axios.post('/api/flashcards', { flashcards, category });
    return true;
  } catch (error) {
    console.error('Error saving flashcards:', error);
    throw new Error('Failed to save flashcards.');
  }
};

// Fetch flashcards by category from the database
export const fetchSavedFlashcards = async (category: string, limit: number) => {
  try {
    const response = await axios.get('/api/flashcards', {
      params: { category, limit },
    });
    return response.data.flashcards.map((flashcard: any, index: number) => ({
      ...flashcard,
      id: flashcard._id || `${Date.now()}-${index}`,
    }));
  } catch (error) {
    console.error('Error fetching saved flashcards:', error);
    throw new Error('Failed to fetch saved flashcards.');
  }
};
