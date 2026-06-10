import { useState, useEffect, useCallback } from 'react';
import { getCardKey } from '../utils/cardUtils';
import { decompressData } from '../utils/compression';


export const useRankings = (setCode, allCards) => {
  const storageKey = `rankings-${setCode}`;

  const [rankings, setRankings] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to load rankings from localStorage", e);
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(rankings));
    } catch (e) {
      console.error("Failed to save rankings to localStorage", e);
    }
  }, [rankings, storageKey]);

  const handleRank = useCallback((cardKey, rank) => {
    setRankings((prevRankings) => ({
      ...prevRankings,
      [cardKey]: rank,
    }));
  }, []);

  useEffect(() => {
    if (allCards.length === 0) return;
    
    const currentRankings = rankings;
    const migratedRankings = {};
    
    const hasOldFormat = Object.keys(currentRankings).some(key => key.includes('-') && key.length > 20);
    
    if (hasOldFormat) {
      console.log('Detected old ranking format, migrating...');
      
      allCards.forEach(card => {
        const oldId = card.id;
        const newKey = getCardKey(card);
        
        if (currentRankings[oldId]) {
          migratedRankings[newKey] = currentRankings[oldId];
        }
      });
      
      Object.keys(currentRankings).forEach(key => {
        if (!key.includes('-') || key.length <= 20) {
          migratedRankings[key] = currentRankings[key];
        }
      });
      
      console.log(`Migrated ${Object.keys(migratedRankings).length} rankings to new format`);
      setRankings(migratedRankings);
    }
  }, [allCards, rankings]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const importData = urlParams.get("import");
    const importName = urlParams.get("name");

    if (importData) {
      try {
        let parsedRankings = decompressData(importData);

        if (!parsedRankings) {
          const decoded = atob(importData);
          parsedRankings = JSON.parse(decoded);
        }

        if (importName) {
          const name = decodeURIComponent(importName);
          const savedKey = `saved-rankings-${setCode}`;
          const existing = JSON.parse(localStorage.getItem(savedKey) || '{}');
          existing[name] = parsedRankings;
          localStorage.setItem(savedKey, JSON.stringify(existing));
          alert(`Saved rankings for "${name}"!`);
        } else {
          setRankings(parsedRankings);
          alert("Rankings imported successfully!");
        }

        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error("Failed to import rankings:", error);
        alert("Invalid import data in URL!");
      }
    }
  }, []);

  return { rankings, handleRank, setRankings };
};
