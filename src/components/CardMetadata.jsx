import React from 'react';
import { renderManaSymbols } from '../utils/manaUtils.jsx';

const CardMetadata = ({ card }) => {
  if (!card) return null;

  const rarityColors = {
    common: 'text-gray-400',
    uncommon: 'text-gray-300',
    rare: 'text-yellow-400',
    mythic: 'text-orange-500',
  };

  const rarityColor = rarityColors[card.rarity?.toLowerCase()] || 'text-white';

  const oracleText = card.oracle_text || (card.card_faces ? card.card_faces[0].oracle_text : '');
  const typeLine = card.type_line || (card.card_faces ? card.card_faces[0].type_line : '');
  const manaCost = card.mana_cost || (card.card_faces ? card.card_faces[0].mana_cost : '');

  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-700/50 rounded-lg text-left w-full">
      <div className="flex justify-between items-start gap-2">
        <span className="text-sm font-semibold text-gray-300 italic">{typeLine}</span>
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-0.5">
            {renderManaSymbols(manaCost)}
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${rarityColor}`}>
            {card.rarity}
          </span>
        </div>
      </div>
      
      <div className="border-t border-gray-600 my-1"></div>
      
      <div className="text-sm text-gray-100 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto pr-1 custom-scrollbar">
        {renderManaSymbols(oracleText)}
      </div>

      {card.power && card.toughness && (
        <div className="mt-auto pt-2 text-right font-bold text-gray-200">
          {card.power}/{card.toughness}
        </div>
      )}
    </div>
  );
};

export default CardMetadata;
