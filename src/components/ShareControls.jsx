import React from 'react';
import { compressData, decompressData } from '../utils/compression';
import { getCardKey } from '../utils/cardUtils';

const ShareControls = ({ rankings, allCards, setCode }) => {
  const STORAGE_KEY = `rankings-${setCode}`;

  const createShareableLink = () => {
    const unrankedCount = allCards.filter(card => !rankings[getCardKey(card)]).length;
    if (unrankedCount > 0) {
      const proceed = window.confirm(
        `You have ${unrankedCount} unranked card(s). Are you sure you want to create a shareable link?`
      );
      if (!proceed) {
        return;
      }
    }

    const compressed = compressData(rankings);
    if (compressed) {
      const url = `${window.location.origin}${window.location.pathname}?import=${compressed}`;
      navigator.clipboard.writeText(url);
      alert(`Shareable link copied to clipboard!\nLink length: ${url.length} characters`);
    } else {
      alert('Failed to create shareable link!');
    }
  };

  const exportRankings = () => {
    const unrankedCount = allCards.filter(card => !rankings[getCardKey(card)]).length;
    if (unrankedCount > 0) {
      const proceed = window.confirm(
        `You have ${unrankedCount} unranked card(s). Are you sure you want to export?`
      );
      if (!proceed) {
        return;
      }
    }

    const compressed = compressData(rankings);
    if (compressed) {
      navigator.clipboard.writeText(compressed);
      alert('Compressed rankings copied to clipboard!');
    } else {
      alert('Failed to export rankings!');
    }
  };

  const importRankings = () => {
    const input = prompt('Paste your ranking string or shareable link:');
    if (input) {
      try {
        let rankingString = input;
        if (input.startsWith('http://') || input.startsWith('https://')) {
          const url = new URL(input);
          const importParam = url.searchParams.get('import');
          if (!importParam) {
            alert('No ranking data found in the URL!');
            return;
          }
          rankingString = importParam;
        }

        let parsedRankings = decompressData(rankingString);
        
        if (!parsedRankings) {
          try {
            const decoded = atob(rankingString);
            parsedRankings = JSON.parse(decoded);
          } catch {
            alert('Invalid ranking string!');
            return;
          }
        }
        
        if (parsedRankings) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedRankings));
          window.location.reload();
        }
      } catch (error) {
        console.error('Import failed:', error);
        alert('Invalid ranking data!');
      }
    }
  };
  
  return (
    <div className="p-4 bg-gray-800 rounded-lg flex gap-4 flex-wrap">
      <button onClick={createShareableLink} className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500">
        📤 Share Link
      </button>
      <button onClick={exportRankings} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500">Export</button>
      <button onClick={importRankings} className="bg-green-600 px-4 py-2 rounded hover:bg-green-500">Import</button>
    </div>
  );
};

export default ShareControls;
