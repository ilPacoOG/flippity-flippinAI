import React from 'react';

interface HeaderProps {
  categories: { id: number; name: string }[];
  savedCategories: string[];
  useOpenAI: boolean;
  customCategory: string;
  numFlashcards: number;
  savedFlashcardQuantity: number;
  category: string;
  setUseOpenAI: (value: boolean) => void;
  setCustomCategory: (value: string) => void;
  setNumFlashcards: (value: number) => void;
  setCategory: (value: string) => void;
  setSavedFlashcardQuantity: (value: number) => void;
  handleGenerateFlashcards: () => void;
  handleLoadSavedFlashcards: () => void;
  handleSaveFlashcards: () => void;
}

const Header: React.FC<HeaderProps> = ({
  categories,
  savedCategories,
  useOpenAI,
  customCategory,
  numFlashcards,
  savedFlashcardQuantity,
  category,
  setUseOpenAI,
  setCustomCategory,
  setNumFlashcards,
  setCategory,
  setSavedFlashcardQuantity,
  handleGenerateFlashcards,
  handleLoadSavedFlashcards,
  handleSaveFlashcards,
}) => {
  return (
    <header className="header">
      {/* OpenTDB or OpenAI Radio Buttons */}
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

      {/* Category Selection */}
      <div className="form-group">
        <label htmlFor="category">Category</label>
        {!useOpenAI ? (
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
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

      {/* Number of Flashcards Input and Generate Button */}
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
        <button className="btn" onClick={handleGenerateFlashcards}>
          Generate
        </button>
      </div>

      {/* Saved Categories Dropdown */}
      <div className="form-group">
        <label htmlFor="saved-category">Load Saved Category</label>
        <select
          id="saved-category"
          value={category}
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

      {/* Selected Category Display */}
      <div className="form-group">
        <label htmlFor="saved-flashcard-category">Selected Category</label>
        <input
          type="text"
          id="saved-flashcard-category"
          value={category}
          readOnly
          className="readonly-input"
        />
      </div>

      {/* Number of Saved Flashcards Input */}
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
      </div>

      {/* Load and Save Flashcards Buttons */}
      <div className="form-group">
        <button onClick={handleLoadSavedFlashcards} className="btn">
          Load Saved Flashcards
        </button>
        <button onClick={handleSaveFlashcards} className="btn">
          Save Flashcards
        </button>
      </div>
    </header>
  );
};

export default Header;
