import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.post('/api/generate-flashcards', async (req, res) => {
    const { category } = req.body;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/engines/davinci-codex/completions',
            {
                prompt: `Generate flashcards for the category: ${category}`,
                max_tokens: 150,
                n: 10,
                stop: ['\n']
            },
            {
                headers: {
                    'Authorization': `Bearer ${openaiApiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const flashcards = response.data.choices.map((choice: any, index: number) => ({
            id: `${index}-${Date.now()}`,
            question: choice.text.split('?')[0] + '?',
            answer: choice.text.split('?')[1].trim(),
            options: [choice.text.split('?')[1].trim(), 'Option 1', 'Option 2', 'Option 3'].sort(() => Math.random() - 0.5)
        }));

        res.json({ flashcards });
    } catch (error) {
        console.error('Error generating flashcards:', error);
        res.status(500).send('Error generating flashcards');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});