import express from 'express';
import dotenv from 'dotenv';
import { generateFlashcards } from './generate-flashcards';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.post('/api/generate-flashcards', async (req, res) => {
  const { category, count } = req.body;

  try {
    const numberOfFlashcards = count || 10; // Default to 10 if count is not provided
    const flashcards = await generateFlashcards(category, numberOfFlashcards);
    res.json({ flashcards });
  } catch (error) {
    if (error instanceof Error) {
      // Use instanceof Error to narrow the type of 'error'
      console.error('Error generating flashcards:', error.message);
      res.status(500).json({ error: error.message });
    } else {
      // Handle unexpected non-Error types
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'Unexpected error occurred' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
