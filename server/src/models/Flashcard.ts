import mongoose, { Schema, Document } from 'mongoose';

// Flashcard interface
export interface Flashcard extends Document {
  userId?: string; // Optional if you want to associate flashcards with users
  category: string;
  question: string;
  answer: string;
  options: string[];
  createdAt: Date;
}

// Flashcard schema
const FlashcardSchema: Schema = new Schema({
  userId: { type: String, required: false }, // Optional if using authentication
  category: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  options: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now },
});

const FlashcardModel = mongoose.model<Flashcard>('Flashcard', FlashcardSchema);

export default FlashcardModel;
