import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import FlashcardList from './components/FlashcardList';
import './app.css';
import axios from 'axios';

interface Flashcard {
    id: number;
    question: string;
    answer: string;
    options: string[];
}

interface Category {
    id: number;
    name: string;
}

function App() {
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [customCategory, setCustomCategory] = useState<string>('');

    const categoryEl = useRef<HTMLSelectElement>(null);
    const amountEl = useRef<HTMLInputElement>(null);

    useEffect(() => {
        axios.get('https://opentdb.com/api_category.php').then((res: any) => {
            setCategories(res.data.trivia_categories);
        });
    }, []);

    function decodeString(str: string): string {
        const textArea = document.createElement('textarea');
        textArea.innerHTML = str;
        return textArea.value;
    }

    async function fetchWithRetry(url: string, options: any, retries: number = 3, backoff: number = 300): Promise<any> {
        try {
            const response = await axios.get(url, options);
            return response;
        } catch (error) {
            if (retries > 0 && (error as any).response && (error as any).response.status === 429) {
                await new Promise((resolve) => setTimeout(resolve, backoff));
                return fetchWithRetry(url, options, retries - 1, backoff * 2);
            } else {
                throw error;
            }
        }
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const selectedCategory = categoryEl.current?.value;
        const amount = amountEl.current?.value;

        if (customCategory) {
            // Use backend endpoint to generate flashcards with OpenAI API
            axios
                .post('/api/generate-flashcards', { category: customCategory })
                .then((res: any) => {
                    setFlashcards(res.data.flashcards);
                })
                .catch((error: any) => {
                    console.error('Error generating flashcards:', error);
                });
        } else {
            // Use Open Trivia Database API to generate flashcards
            fetchWithRetry('https://opentdb.com/api.php', {
                params: {
                    amount: amount,
                    category: selectedCategory,
                },
            })
                .then((res) => {
                    setFlashcards(
                        res.data.results.map((questionItem: any, index: number) => {
                            const answer = decodeString(questionItem.correct_answer);
                            const options = [...questionItem.incorrect_answers.map((a: string) => decodeString(a)), answer];
                            return {
                                id: `${index}-${Date.now()}`,
                                question: decodeString(questionItem.question),
                                answer: answer,
                                options: options.sort(() => Math.random() - 0.5),
                            };
                        })
                    );
                })
                .catch((error) => {
                    console.error('Error fetching trivia questions:', error);
                });
        }
    }

    return (
        <>
            <form className="header" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select id="category" ref={categoryEl} disabled={!!customCategory}>
                        {categories.map((category) => {
                            return (
                                <option value={category.id} key={category.id}>
                                    {category.name}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="custom-category">Or Enter Custom Category</label>
                    <input
                        type="text"
                        id="custom-category"
                        value={customCategory}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomCategory(e.target.value)}
                        placeholder="Enter custom category"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="amount">Number of Questions</label>
                    <input type="number" id="amount" min="1" step="1" defaultValue={10} ref={amountEl} />
                </div>
                <div className="form-group">
                    <button className="btn">Generate</button>
                </div>
            </form>
            <div className="container">
                <FlashcardList flashcards={flashcards} />
            </div>
        </>
    );
}

export default App;