//creating a new component called GenerateFlashcards
import React, { useState } from 'react';
import axios from 'axios';

const GenerateFlashcards: React.FC = () => {
  const [category, setCategory] = useState('');
  const [flashcards, setFlashcards] = useState([]);

  const handleGenerate = async () => {
    try {
      const response = await axios.post('/api/generate-flashcards', { category });
      setFlashcards(response.data.flashcards);
    } catch (error) {
      console.error('Error generating flashcards:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Enter category"
      />
      <button onClick={handleGenerate}>Generate Flashcards</button>
      <div>
        {flashcards.map((flashcard, index) => (
          <div key={index}>
            <h3>{flashcard.question}</h3>
            <p>{flashcard.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenerateFlashcards;