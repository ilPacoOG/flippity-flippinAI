import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { generateFlashcards } from './generate-flashcards';
import flashcardsRoutes from './routes/flashcards'; // Import flashcards route

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || '')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
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
      console.error('Error generating flashcards:', error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'Unexpected error occurred' });
    }
  }
});

// Use flashcards routes
app.use('/api/flashcards', flashcardsRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
