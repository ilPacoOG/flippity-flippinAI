// needs to be converted to use TypeScript

import React from 'react'
import Flashcard from './Flashcard'

interface FlashcardListProps {
  flashcards: {
    id: number;
    question: string;
    answer: string;
    options: string[];
  }[];
}

export default function FlashcardList({ flashcards }: FlashcardListProps) {
  return (
    <div className='card-grid'>
      {flashcards.map(flashcard => {
        return <Flashcard flashcard={flashcard} key={flashcard.id} />
      })}
    </div>
  )
}

