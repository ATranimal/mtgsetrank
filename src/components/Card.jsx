import React, { useState, useEffect, useCallback } from 'react';
import { getCardKey } from '../utils/cardUtils';
import CardMetadata from './CardMetadata';

const Card = ({ card, currentRank, onRank, setCode }) => {
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedModifier, setSelectedModifier] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const isTransformCard = card.layout === 'transform' || card.layout === 'modal_dfc';

  useEffect(() => {
    setSelectedGrade(null);
    setSelectedModifier(null);
    setIsFlipped(false);
  }, [getCardKey(card)]);

  const handleRank = useCallback((grade, modifier) => {
    const finalRank = `${grade}${modifier || ''}`;
    onRank(getCardKey(card), finalRank);
  }, [card, onRank]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D', 'F'].includes(key)) {
        setSelectedGrade(key);
        handleRank(key, selectedModifier);
      } else if (key === '+' || key === '=') {
        const modifierToset = selectedModifier === "+" ? null : '+';
        setSelectedModifier(modifierToset);
        if (selectedGrade) handleRank(selectedGrade, modifierToset);
      } else if (key === '-') {
        const modifierToset = selectedModifier === "-" ? null : "-";
        setSelectedModifier(modifierToset);
        if (selectedGrade) handleRank(selectedGrade, modifierToset);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGrade, selectedModifier, handleRank]);

  const handleFlip = () => {
    if (isTransformCard) {
      setIsFlipped(prev => !prev);
    }
  };

  const face1ImageUrl = card.localImagePaths?.[0]
    ? `/sets/${setCode}/${card.localImagePaths[0]}`
    : card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal;

  const face2ImageUrl = isTransformCard
    ? (card.localImagePaths?.[1]
      ? `/sets/${setCode}/${card.localImagePaths[1]}`
      : card.card_faces?.[1]?.image_uris?.normal)
    : null;

  return (
    <div className="w-full max-w-4xl mx-auto border rounded-xl p-4 md:p-6 shadow-2xl flex flex-col bg-gray-800 border-gray-700 transition-all">
      <div className="flex flex-col md:flex-row gap-6 items-start justify-center">
        {/* Card Image Column */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <div
            className={`card-container ${isTransformCard ? 'cursor-pointer' : ''} w-full max-w-[280px] md:max-w-xs aspect-[5/7]`}
            onClick={handleFlip}
          >
            <div className={`card-flipper h-full ${isFlipped ? 'is-flipped' : ''}`}>
              <div className="card-face card-front h-full">
                {face1ImageUrl ? (
                  <img src={face1ImageUrl} alt={card.name} loading="lazy" className="w-full h-full object-contain rounded-xl shadow-lg" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-700 rounded-xl text-center text-gray-300 p-4 border-2 border-dashed border-gray-600">
                    {card.name} (No Image)
                  </div>
                )}
              </div>
              {isTransformCard && (
                <div className="card-face card-back h-full">
                  {face2ImageUrl ? (
                    <img src={face2ImageUrl} alt={card.card_faces[1].name} loading="lazy" className="w-full h-full object-contain rounded-xl shadow-lg" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-700 rounded-xl text-center text-gray-300 p-4 border-2 border-dashed border-gray-600">
                      {card.card_faces[1].name} (No Image)
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {isTransformCard && (
            <p className="mt-2 text-xs text-blue-400 font-medium animate-pulse">
              Click card to flip
            </p>
          )}
        </div>

        {/* Metadata & Ranking Info Column */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-white text-center md:text-left">{card.name}</h2>
          
          <CardMetadata card={card} />

          {currentRank && (
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3 text-center">
              <span className="text-sm uppercase tracking-widest text-yellow-500 font-semibold block">Current Rank</span>
              <span className="text-3xl font-black text-yellow-400">{currentRank}</span>
            </div>
          )}

          <div className="hidden md:block mt-auto">
            <p className="text-gray-500 text-xs italic">
              Use keys A, B, C, D, F and +, - to rank quickly.
              Use ← → arrows to navigate.
            </p>
          </div>
        </div>
      </div>

      {/* Ranking Controls - Bottom Bar */}
      <div className="mt-8 pt-6 border-t border-gray-700 w-full">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center max-w-sm mx-auto w-full">
            {['A', 'B', 'C', 'D', 'F'].map(grade => (
              <button
                key={grade}
                onClick={(e) => { e.stopPropagation(); setSelectedGrade(grade); handleRank(grade, selectedModifier); }}
                className={`w-12 h-12 text-xl font-bold rounded-full transition-all shadow-lg transform active:scale-95 flex items-center justify-center ${selectedGrade === grade ? 'bg-blue-600 text-white ring-4 ring-blue-400 scale-110' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
              >
                {grade}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-6">
            {['+', '-'].map(mod => (
              <button
                key={mod}
                onClick={(e) => { e.stopPropagation(); selectedModifier === mod ? setSelectedModifier(null) : setSelectedModifier(mod); if (selectedGrade) handleRank(selectedGrade, mod); }}
                className={`w-10 h-10 text-xl font-bold rounded-full transition-all shadow-lg transform active:scale-95 flex items-center justify-center ${selectedModifier === mod ? 'bg-green-600 text-white ring-4 ring-green-400 scale-110' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
              >
                {mod}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
