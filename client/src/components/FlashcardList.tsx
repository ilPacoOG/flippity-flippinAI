import React, { FC } from 'react';
import Flashcard from './Flashcard';

interface Flashcard {
  id: string | number;
  question: string;
  answer: string;
  options: string[];
}

interface FlashcardListProps {
  flashcards: Flashcard[];
}

const FlashcardList: FC<FlashcardListProps> = ({ flashcards }) => {
  return (
    <div className="card-grid">
      {flashcards.map((flashcard) => (
        <Flashcard key={flashcard.id} flashcard={flashcard} />
      ))}
    </div>
  );
};

export default FlashcardList;