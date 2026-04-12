import React, { useState, useEffect } from 'react';
import GalleryCard from './GalleryCard';
import TiebreakerModal from './TiebreakerModal';
import { compressData } from '../utils/compression';
import { COLORS, COLOR_NAMES } from '../hooks/useTopCommons';
import { getCardKey } from '../utils/cardUtils';

const COLOR_BG = {
  W: 'from-yellow-600/30 to-yellow-800/10 border-yellow-600/50',
  U: 'from-blue-600/30 to-blue-800/10 border-blue-600/50',
  B: 'from-gray-500/30 to-gray-700/10 border-gray-500/50',
  R: 'from-red-600/30 to-red-800/10 border-red-600/50',
  G: 'from-green-600/30 to-green-800/10 border-green-600/50',
};

const COLOR_HEADER_BG = {
  W: 'bg-yellow-600/40',
  U: 'bg-blue-600/40',
  B: 'bg-gray-500/40',
  R: 'bg-red-600/40',
  G: 'bg-green-600/40',
};

const TopCommonsView = ({
  resolvedTopCommons,
  pendingTiebreakers,
  warnings,
  resolveTiebreaker,
  rankings,
  setCode,
  onCardClick,
}) => {
  const [showWarnings, setShowWarnings] = useState(false);
  const [tiebreakerColor, setTiebreakerColor] = useState(null);
  const [hasSeenWarning, setHasSeenWarning] = useState(false);

  // Show warnings on first visit if there are unranked commons
  useEffect(() => {
    if (!hasSeenWarning && warnings.length > 0) {
      setShowWarnings(true);
      setHasSeenWarning(true);
    }
  }, [warnings, hasSeenWarning]);

  // Prompt tiebreakers automatically
  useEffect(() => {
    const pendingColors = Object.keys(pendingTiebreakers);
    if (pendingColors.length > 0 && !tiebreakerColor) {
      setTiebreakerColor(pendingColors[0]);
    }
  }, [pendingTiebreakers, tiebreakerColor]);

  const handleExport = () => {
    const exportData = {};
    COLORS.forEach(color => {
      const cards = resolvedTopCommons[color];
      if (cards) {
        exportData[color] = cards.map(card => ({
          name: card.name,
          key: getCardKey(card),
          rank: rankings[getCardKey(card)],
        }));
      }
    });

    const compressed = compressData(exportData);
    if (compressed) {
      const url = `${window.location.origin}${window.location.pathname}?topcommons=${compressed}`;
      navigator.clipboard.writeText(url);
      alert(`Top Commons shareable link copied to clipboard!\nLink length: ${url.length} characters`);
    } else {
      alert('Failed to create shareable link!');
    }
  };

  const handleCopyText = () => {
    let text = `Top 3 Commons — ${setCode.toUpperCase()}\n`;
    text += '━'.repeat(30) + '\n\n';
    COLORS.forEach(color => {
      const cards = resolvedTopCommons[color];
      text += `${COLOR_NAMES[color]}:\n`;
      if (cards) {
        cards.forEach((card, i) => {
          const rank = rankings[getCardKey(card)] || '?';
          text += `  ${i + 1}. ${card.name} (${rank})\n`;
        });
      } else {
        text += '  Not yet resolved\n';
      }
      text += '\n';
    });
    navigator.clipboard.writeText(text);
    alert('Top Commons text copied to clipboard!');
  };

  const allResolved = COLORS.every(color => resolvedTopCommons[color] !== null);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Warnings modal */}
      {showWarnings && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border border-yellow-600/50 p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold text-yellow-400 mb-3">⚠️ Unranked Commons</h2>
            <p className="text-gray-300 mb-4">
              Some colors have unranked common cards. Your top 3 may not be accurate until all commons are ranked.
            </p>
            <ul className="space-y-2 mb-6">
              {warnings.map(w => (
                <li key={w.color} className="flex items-center gap-2 text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${COLOR_HEADER_BG[w.color]}`}>
                    {w.colorName}
                  </span>
                  <span className="text-gray-400">
                    {w.count} of {w.total} commons unranked
                  </span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowWarnings(false)}
              className="w-full bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded-lg font-bold transition-colors"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      )}

      {/* Tiebreaker modal */}
      {tiebreakerColor && pendingTiebreakers[tiebreakerColor] && (
        <TiebreakerModal
          color={tiebreakerColor}
          ties={pendingTiebreakers[tiebreakerColor]}
          onResolve={(color, picks) => {
            resolveTiebreaker(color, picks);
            // Move to next pending tiebreaker
            const remaining = Object.keys(pendingTiebreakers).filter(c => c !== color);
            setTiebreakerColor(remaining.length > 0 ? remaining[0] : null);
          }}
          onClose={() => setTiebreakerColor(null)}
          setCode={setCode}
        />
      )}

      {/* Export controls */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={handleExport}
          disabled={!allResolved}
          className={`px-4 py-2 rounded-lg font-bold transition-colors ${
            allResolved
              ? 'bg-purple-600 hover:bg-purple-500'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          📤 Share Top Commons Link
        </button>
        <button
          onClick={handleCopyText}
          disabled={!allResolved}
          className={`px-4 py-2 rounded-lg font-bold transition-colors ${
            allResolved
              ? 'bg-blue-600 hover:bg-blue-500'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          📋 Copy as Text
        </button>
        {Object.keys(pendingTiebreakers).length > 0 && (
          <button
            onClick={() => setTiebreakerColor(Object.keys(pendingTiebreakers)[0])}
            className="px-4 py-2 rounded-lg font-bold bg-yellow-600 hover:bg-yellow-500 transition-colors"
          >
            ⚖️ Resolve Ties ({Object.keys(pendingTiebreakers).length})
          </button>
        )}
      </div>

      {/* Top 3 by color */}
      {COLORS.map(color => {
        const cards = resolvedTopCommons[color];
        return (
          <div
            key={color}
            className={`p-4 rounded-xl border bg-gradient-to-r ${COLOR_BG[color]}`}
          >
            <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
              <span className={`px-3 py-1 rounded-lg ${COLOR_HEADER_BG[color]}`}>
                {COLOR_NAMES[color]}
              </span>
              <span className="text-sm font-normal text-gray-400">Top 3 Commons</span>
            </h2>

            {cards === null ? (
              <div className="text-center py-8">
                <p className="text-yellow-400 font-medium">Ties need to be resolved</p>
                <button
                  onClick={() => setTiebreakerColor(color)}
                  className="mt-2 text-sm text-blue-400 hover:underline"
                >
                  Resolve now →
                </button>
              </div>
            ) : cards.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No ranked commons in this color</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
                {cards.map((card, i) => (
                  <div key={card.id} className="relative">
                    <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-gray-900 border-2 border-gray-600 flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </div>
                    <GalleryCard
                      card={card}
                      onClick={() => onCardClick?.(card.id)}
                      setCode={setCode}
                    />
                    <div className="text-center mt-1">
                      <p className="text-sm font-medium truncate">{card.name}</p>
                      <p className="text-xs text-gray-400">{rankings[getCardKey(card)] || 'Unranked'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TopCommonsView;
