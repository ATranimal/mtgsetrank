import React, { useState, useEffect, useRef } from 'react';
import { compressData } from '../utils/compression';
import { getCardKey } from '../utils/cardUtils';

const NAME_KEY = 'ranker-name';

const ShareControls = ({ rankings, allCards, setCode, setRankings }) => {
  const savedKey = `saved-rankings-${setCode}`;

  const [userName, setUserName] = useState(() => localStorage.getItem(NAME_KEY) || '');
  const [showSaved, setShowSaved] = useState(false);
  const [savedRankings, setSavedRankings] = useState(() => {
    try { return JSON.parse(localStorage.getItem(savedKey) || '{}'); }
    catch { return {}; }
  });
  const panelRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(NAME_KEY, userName);
  }, [userName]);

  useEffect(() => {
    if (!showSaved) return;
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowSaved(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSaved]);

  const saveOwnRanking = (name, currentRankings) => {
    const updated = { ...savedRankings, [name]: currentRankings };
    setSavedRankings(updated);
    localStorage.setItem(savedKey, JSON.stringify(updated));
  };

  const exportRankings = () => {
    if (!userName.trim()) return;

    const unrankedCount = allCards.filter(card => !rankings[getCardKey(card)]).length;
    if (unrankedCount > 0) {
      const proceed = window.confirm(`You have ${unrankedCount} unranked card(s). Share anyway?`);
      if (!proceed) return;
    }

    saveOwnRanking(userName.trim(), rankings);

    const compressed = compressData(rankings);
    if (compressed) {
      const name = encodeURIComponent(userName.trim());
      const url = `${window.location.origin}${window.location.pathname}?import=${compressed}&name=${name}`;
      navigator.clipboard.writeText(url);
      alert('Shareable link copied to clipboard!');
    } else {
      alert('Failed to create shareable link!');
    }
  };

  const loadSaved = (name) => {
    setRankings(savedRankings[name]);
    setUserName(name);
    setShowSaved(false);
  };

  const deleteSaved = (name) => {
    const updated = { ...savedRankings };
    delete updated[name];
    setSavedRankings(updated);
    localStorage.setItem(savedKey, JSON.stringify(updated));
  };

  const savedCount = Object.keys(savedRankings).length;

  return (
    <div className="relative" ref={panelRef}>
      <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-2">
        <input
          type="text"
          value={userName}
          onChange={e => setUserName(e.target.value)}
          placeholder="your name..."
          className="bg-gray-700 border border-gray-600 rounded p-2 text-sm text-white placeholder-gray-400 w-32 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={exportRankings}
          disabled={!userName.trim()}
          className="bg-purple-600 p-2 rounded hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          Share Link
        </button>
        <button
          onClick={() => setShowSaved(s => !s)}
          className={`p-2 rounded text-sm font-medium transition-colors ${showSaved ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          Saved Rankings{savedCount > 0 ? ` (${savedCount})` : ''}
        </button>
      </div>

      {showSaved && (
        <div className="absolute right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 w-72 p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Saved Rankings — {setCode.toUpperCase()}</p>
          {savedCount === 0 ? (
            <p className="text-gray-400 text-sm">No saved rankings yet. When someone shares a link, their rankings will appear here.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {Object.entries(savedRankings).map(([name, data]) => (
                <li key={name} className="flex items-center gap-3 text-sm py-1 border-b border-gray-700 last:border-0">
                  <span className="font-medium text-white flex-1">{name}</span>
                  <span className="text-gray-400 text-xs">{Object.keys(data).length} ranked</span>
                  <button
                    onClick={() => loadSaved(name)}
                    className="text-blue-400 hover:text-blue-300 text-xs"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => deleteSaved(name)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ShareControls;
