import React from 'react';

const GalleryCard = ({ card, onClick, setCode }) => {
  const face1ImageUrl = card.localImagePaths?.[0]
    ? `/images/sets/${setCode}/${card.localImagePaths[0]}`
    : card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal;

  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center p-1 rounded-lg border-2 cursor-pointer transition-transform hover:scale-105 hover:shadow-lg hover:shadow-black/50`}
    >
      <img src={face1ImageUrl} alt={card.name} loading="lazy" className="w-full h-auto rounded-md" />
    </div>
  );
};

export default GalleryCard;
