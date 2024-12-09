import React, { useState, useEffect, useRef, FormEvent } from 'react';
import FlashcardList from './components/FlashcardList';
import './app.css';
import axios from 'axios';

interface Flashcard {
  id: string | number; // Updated to support unique IDs as strings or numbers
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
  const [savedCategories, setSavedCategories] = useState<string[]>([]); // State for saved categories
  const [useOpenAI, setUseOpenAI] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [numFlashcards, setNumFlashcards] = useState(10); // Default number of flashcards
  const [category, setCategory] = useState(''); // Tracks selected or custom category
  const categoryEl = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    // Fetch OpenTDB categories
    axios.get('https://opentdb.com/api_category.php').then((res) => {
      setCategories(res.data.trivia_categories);
    });

    // Fetch saved categories from the backend
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

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
            id: flashcard.id || `${Date.now()}-${index}`, // Ensure unique ID
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

  const saveFlashcards = async () => {
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

  const fetchSavedFlashcards = async () => {
    try {
      console.log('Fetching saved flashcards for category:', category);
      const res = await axios.get('/api/flashcards', {
        params: { category: isNaN(Number(category)) ? category : Number(category) },
      });

      console.log('Fetched flashcards from database:', res.data.flashcards);

      setFlashcards(
        res.data.flashcards.map((flashcard: any, index: number) => ({
          ...flashcard,
          id: flashcard._id || `${Date.now()}-${index}`, // Ensure unique ID
        }))
      );
    } catch (error) {
      console.error('Error fetching saved flashcards:', error);
      alert('Failed to load saved flashcards.');
    }
  };

  return (
    <>
      <form className="header" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            <input
              type="radio"
              name="source"
              value="opentdb"
              checked={!useOpenAI}
              onChange={() => setUseOpenAI(false)}
            />
            Use OpenTDB
          </label>
          <label>
            <input
              type="radio"
              name="source"
              value="openai"
              checked={useOpenAI}
              onChange={() => setUseOpenAI(true)}
            />
            Use OpenAI
          </label>
        </div>

        {!useOpenAI ? (
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" ref={categoryEl}>
              {categories.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="custom-category">Custom Category</label>
            <input
              type="text"
              id="custom-category"
              placeholder="Enter custom category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="num-flashcards">Number of Flashcards</label>
          <select
            id="num-flashcards"
            value={numFlashcards}
            onChange={(e) => setNumFlashcards(parseInt(e.target.value, 10))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={40}>40</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="form-group">
          <button className="btn" type="submit">
            Generate
          </button>
        </div>
      </form>

      <div className="container">
        <div className="form-group">
          <label htmlFor="saved-category">Load Saved Category</label>
          <select
            id="saved-category"
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select a category</option>
            {savedCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button onClick={fetchSavedFlashcards} className="btn">
            Load Saved Flashcards
          </button>
        </div>

        <FlashcardList flashcards={flashcards} />
        {flashcards.length > 0 && (
          <div className="actions">
            <button onClick={saveFlashcards} className="btn">
              Save Flashcards
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
