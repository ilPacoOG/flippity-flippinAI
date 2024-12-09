import express from 'express';
import dotenv from 'dotenv';
import { generateFlashcards } from './generate-flashcards';
import mongoose from 'mongoose';

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || '', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1); // Exit the process if the database connection fails
  });

// Generate flashcards route
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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
