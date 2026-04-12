import React, { useState } from 'react';
import GalleryCard from './GalleryCard';

const COLOR_LABELS = { W: 'White', U: 'Blue', B: 'Black', R: 'Red', G: 'Green' };
const COLOR_BG = {
  W: 'bg-yellow-100 text-yellow-900',
  U: 'bg-blue-200 text-blue-900',
  B: 'bg-gray-400 text-gray-900',
  R: 'bg-red-200 text-red-900',
  G: 'bg-green-200 text-green-900',
};

const TiebreakerModal = ({ color, ties, onResolve, onClose, setCode }) => {
  const [selected, setSelected] = useState([]);
  const { grade, candidates, pick } = ties;

  const toggleCard = (cardKey) => {
    setSelected((prev) => {
      if (prev.includes(cardKey)) {
        return prev.filter((k) => k !== cardKey);
      }
      if (prev.length >= pick) return prev;
      return [...prev, cardKey];
    });
  };

  const getCardKey = (card) => `${card.set}-${card.collector_number}`;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">
          Tiebreaker — <span className={`px-2 py-1 rounded ${COLOR_BG[color]}`}>{COLOR_LABELS[color]}</span>
        </h2>
        <p className="text-gray-400 mb-4">
          There are {candidates.length} cards tied at grade <span className="font-bold text-white">{grade}</span> for
          the remaining {pick} spot{pick > 1 ? 's' : ''} in your top 3.
          Select {pick} card{pick > 1 ? 's' : ''} to include.
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-6">
          {candidates.map((card) => {
            const key = getCardKey(card);
            const isSelected = selected.includes(key);
            return (
              <div
                key={card.id}
                onClick={() => toggleCard(key)}
                className={`cursor-pointer rounded-lg border-3 p-1 transition-all ${
                  isSelected
                    ? 'border-yellow-400 ring-2 ring-yellow-400/50 scale-105'
                    : 'border-gray-600 hover:border-gray-400 opacity-70 hover:opacity-100'
                }`}
              >
                <GalleryCard card={card} onClick={() => {}} setCode={setCode} />
                <p className="text-xs text-center mt-1 truncate">{card.name}</p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selected.length === pick) {
                onResolve(color, selected);
                onClose();
              }
            }}
            disabled={selected.length !== pick}
            className={`px-6 py-2 rounded-lg font-bold transition-colors ${
              selected.length === pick
                ? 'bg-blue-600 hover:bg-blue-500'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Confirm ({selected.length}/{pick})
          </button>
        </div>
      </div>
    </div>
  );
};

export default TiebreakerModal;
