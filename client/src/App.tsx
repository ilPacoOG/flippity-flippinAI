import React, { useState, useEffect, useRef, FormEvent } from 'react';
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
  const [useOpenAI, setUseOpenAI] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [numFlashcards, setNumFlashcards] = useState(10); // Default number of flashcards

  const categoryEl = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    axios.get('https://opentdb.com/api_category.php').then((res) => {
      setCategories(res.data.trivia_categories);
    });
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (useOpenAI) {
      axios
        .post('/api/generate-flashcards', {
          category: customCategory || 'General Knowledge',
          count: numFlashcards,
        })
        .then((res) => {
          setFlashcards(res.data.flashcards);
        })
        .catch((err) => console.error('Error with OpenAI API:', err));
    } else {
      axios
        .get('https://opentdb.com/api.php', {
          params: {
            amount: numFlashcards,
            category: categoryEl.current?.value,
          },
        })
        .then((res) => {
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
        });
    }
  }

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
