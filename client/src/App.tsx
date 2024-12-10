import React, { useState, useEffect, useRef } from 'react';
import FlashcardList from './components/FlashcardList';
import Header from './components/Header';
import './app.css';
import axios from 'axios';

interface Flashcard {
  id: string | number;
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
  const [savedCategories, setSavedCategories] = useState<string[]>([]);
  const [useOpenAI, setUseOpenAI] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [numFlashcards, setNumFlashcards] = useState(10);
  const [category, setCategory] = useState('');
  const [savedFlashcardQuantity, setSavedFlashcardQuantity] = useState(10);
  const categoryEl = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    axios.get('https://opentdb.com/api_category.php').then((res) => {
      setCategories(res.data.trivia_categories);
    });

    const fetchSavedCategories = async () => {
      try {
        const res = await axios.get('/api/flashcards/categories');
        setSavedCategories(res.data.categories);
      } catch (error) {
        console.error('Error fetching saved categories:', error);
      }
    };

    fetchSavedCategories();
  }, []);

  const handleGenerateFlashcards = async () => {
    const selectedCategory = useOpenAI
      ? customCategory || 'General Knowledge'
      : categoryEl.current?.value || '';

    setCategory(selectedCategory);

    if (useOpenAI) {
      try {
        const res = await axios.post('/api/generate-flashcards', {
          category: selectedCategory,
          count: numFlashcards,
        });
        setFlashcards(
          res.data.flashcards.map((flashcard: any, index: number) => ({
            ...flashcard,
            id: flashcard.id || `${Date.now()}-${index}`,
          }))
        );
      } catch (err) {
        console.error('Error with OpenAI API:', err);
        alert('Failed to generate flashcards using OpenAI.');
      }
    } else {
      try {
        const res = await axios.get('https://opentdb.com/api.php', {
          params: {
            amount: numFlashcards,
            category: selectedCategory,
          },
        });
        setFlashcards(
          res.data.results.map((questionItem: any, index: number) => {
            const answer = questionItem.correct_answer;
            const options = [...questionItem.incorrect_answers, answer];
            return {
              id: `${index}-${Date.now()}`,
              question: questionItem.question,
              answer,
              options: options.sort(() => Math.random() - 0.5),
            };
          })
        );
      } catch (err) {
        console.error('Error with OpenTDB API:', err);
        alert('Failed to generate flashcards using OpenTDB.');
      }
    }
  };

  const handleSaveFlashcards = async () => {
    try {
      await axios.post('/api/flashcards', {
        flashcards,
        category,
      });
      alert('Flashcards saved successfully!');
    } catch (error) {
      console.error('Error saving flashcards:', error);
      alert('Failed to save flashcards.');
    }
  };

  const handleLoadSavedFlashcards = async () => {
    try {
      const res = await axios.get('/api/flashcards', {
        params: {
          category: isNaN(Number(category)) ? category : Number(category),
          limit: savedFlashcardQuantity,
        },
      });
      setFlashcards(
        res.data.flashcards.map((flashcard: any, index: number) => ({
          ...flashcard,
          id: flashcard._id || `${Date.now()}-${index}`,
        }))
      );
    } catch (error) {
      console.error('Error fetching saved flashcards:', error);
      alert('Failed to load saved flashcards.');
    }
  };

  return (
    <div>
      <Header
        categories={categories}
        savedCategories={savedCategories}
        useOpenAI={useOpenAI}
        customCategory={customCategory}
        setCustomCategory={setCustomCategory}
        setCategory={setCategory}
        setUseOpenAI={setUseOpenAI}
        numFlashcards={numFlashcards}
        savedFlashcardQuantity={savedFlashcardQuantity}
        category={category}
        setNumFlashcards={setNumFlashcards}
        setSavedFlashcardQuantity={setSavedFlashcardQuantity}
        handleGenerateFlashcards={handleGenerateFlashcards}
        handleLoadSavedFlashcards={handleLoadSavedFlashcards}
        handleSaveFlashcards={handleSaveFlashcards}
      />
      <div className="container">
        <FlashcardList flashcards={flashcards} />
      </div>
    </div>
  );
}

export default App;
