import { Configuration, OpenAIApi } from 'openai';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

router.post('/generate-flashcards', async (req, res) => {
  const { category } = req.body;

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `Generate 50 flashcards for the category: ${category}` }],
      max_tokens: 1500,
    });

    const content = response.data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }

    const flashcards = content
      .split('\n')
      .filter((line: string) => line.trim() !== '')
      .map((line: string) => {
        const [question, answer] = line.split(':');
        return { question: question.trim(), answer: answer.trim() };
      });

    res.json({ flashcards });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    res.status(500).json({ error: 'Error generating flashcards' });
  }
});

export default router;