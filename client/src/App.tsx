import express from 'express';
import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // Ensure this is at the very top

const app = express();
const port = process.env.PORT || 5000;
const openaiApiKey = process.env.OPENAI_API_KEY;

app.use(express.json());

app.post('/api/generate-flashcards', async (req, res) => {
    const { category } = req.body;

    // Debugging statements
    console.log('OpenAI API Key:', openaiApiKey);
    console.log('Category:', category);

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: `Generate flashcards for the category: ${category}` }],
                max_tokens: 150,
            },
            {
                headers: {
                    'Authorization': `Bearer ${openaiApiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('OpenAI API Response:', response.data);

        const flashcards = response.data.choices.map((choice: any, index: number) => {
            const content = choice.message.content;
            const [question, answer] = content.split('?');
            return {
                id: `${index}-${Date.now()}`,
                question: question.trim() + '?',
                answer: answer.trim(),
                options: [answer.trim(), 'Option 1', 'Option 2', 'Option 3'].sort(() => Math.random() - 0.5)
            };
        });

        res.json({ flashcards });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error generating flashcards:', error.message);
            console.error('Error details:', error.response ? error.response.data : error.message);
            console.error('Full error response:', error.toJSON());
            res.status(500).send('Error generating flashcards');
        } else {
            console.error('Unexpected error:', error);
            res.status(500).send('Unexpected error occurred');
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});