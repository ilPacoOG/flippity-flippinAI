import { Configuration, OpenAIApi } from 'openai';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/api/generate-flashcards', async (req, res) => {
  const { category } = req.body;

  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Generate 50 flashcards for the category: ${category}`,
      max_tokens: 1500,
    });

    const flashcards = response.data.choices[0].text
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => {
        const [question, answer] = line.split(':');
        return { question: question.trim(), answer: answer.trim() };
      });

    res.json({ flashcards });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    res.status(500).json({ error: 'Error generating flashcards' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});