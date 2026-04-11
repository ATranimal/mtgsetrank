import React from 'react';
import GalleryCard from './GalleryCard';

const GalleryView = ({ groupedCards, onCardClick, setCode }) => {
  return (
    <div className="w-full flex flex-col gap-6">
      {groupedCards.map(({ tier, cards }) => (
        <div key={tier} className={`p-4 rounded-lg border-2`}>
          <h2 className={`text-3xl font-bold mb-4 p-2 rounded-md inline-block border-2`}>{tier} ({cards.length})</h2>
          {/* This line is updated for a much denser grid */}
          <div className="w-full grid grid-cols-5 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 gap-1">
            {cards.map((card) => (
              <GalleryCard
                key={card.id}
                card={card}
                onClick={() => onCardClick(card.id)}
                setCode={setCode}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GalleryView;
