import React, { useState, useEffect, useRef, FormEvent } from 'react';
import FlashcardList from './components/FlashcardList';
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
    <>
      <header className="header">
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

  <div className="form-group">
    <label htmlFor="category">Category</label>
    {!useOpenAI ? (
      <select id="category" ref={categoryEl}>
        {categories.map((category) => (
          <option value={category.id} key={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    ) : (
      <input
        type="text"
        id="custom-category"
        placeholder="Enter custom category"
        value={customCategory}
        onChange={(e) => setCustomCategory(e.target.value)}
      />
    )}
  </div>

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
    <button className="btn" type="submit" onClick={handleSubmit}>
      Generate
    </button>
  </div>

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
  </div>

  <div className="form-group">
    <label htmlFor="saved-flashcard-quantity">
      Number of Saved Flashcards
    </label>
    <input
      type="number"
      id="saved-flashcard-quantity"
      value={savedFlashcardQuantity}
      onChange={(e) =>
        setSavedFlashcardQuantity(parseInt(e.target.value, 10))
      }
      min="1"
      max="50"
    />
    <button onClick={fetchSavedFlashcards} className="btn">
      Load Saved Flashcards
    </button>
    <button onClick={saveFlashcards} className="btn">
      Save Flashcards
    </button>
  </div>
</header>

<div className="container">
  <FlashcardList flashcards={flashcards} />
</div>

    </>
  );
}

export default App;
