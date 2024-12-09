import express from 'express';
import FlashcardModel from '../models/Flashcard';

const router = express.Router();

// Route to get flashcards by category
router.get('/', async (req, res) => {
  const { category } = req.query;

  try {
    const query: any = category ? { category } : {};
    const flashcards = await FlashcardModel.find(query);
    res.status(200).json({ flashcards });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// Route to get all flashcards
router.get('/all', async (req, res) => {
  try {
    const flashcards = await FlashcardModel.find();
    res.status(200).json({ flashcards });
  } catch (error) {
    console.error('Error fetching all flashcards:', error);
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// Route to save flashcards
router.post('/', async (req, res) => {
    const { flashcards, category } = req.body;
  
    try {
      const savedFlashcards = await FlashcardModel.insertMany(
        flashcards.map((flashcard: any) => ({
          question: flashcard.question,
          answer: flashcard.answer,
          options: flashcard.options,
          category: flashcard.category || category,
          createdAt: new Date(),
        }))
      );
      res.status(201).json({ savedFlashcards });
    } catch (error) {
      console.error('Error saving flashcards:', error);
      res.status(500).json({ error: 'Failed to save flashcards' });
    }
  });

export default router;
