import React, { useState, useEffect, useCallback, useReducer, useMemo } from 'react';
import './App.css';
import { DEFAULT_SET_CODE } from './constants/sets';
import { getCardColors, getCardKey } from './utils/cardUtils';
import { useRankings } from './hooks/useRankings';
import { useCardData } from './hooks/useCardData';

import Card from './components/Card';
import GalleryView from './components/GalleryView';
import TopCommonsView from './components/TopCommonsView';
import FilterControls from './components/FilterControls';
import SortControls from './components/SortControls';
import ShareControls from './components/ShareControls';
import HelpPanel from './components/HelpPanel';
import SetSelector from './components/SetSelector';
import { useTopCommons } from './hooks/useTopCommons';

const initialState = {
  filters: {
    colors: [],
    type: '',
    cmc: '',
    rarity: '',
    showUnrankedOnly: false,
    searchTerm: '',
  },
  sortBy: 'name',
};

function stateReducer(state, action) {
  switch (action.type) {
    case 'SET_FILTER': {
      if (action.onFilterChange) action.onFilterChange();
      const newFilters = { ...state.filters, [action.payload.filterName]: action.payload.value };
      if (action.payload.filterName !== 'showUnrankedOnly' && action.payload.filterName !== 'searchTerm') {
        newFilters.showUnrankedOnly = false;
      }
      return {
        ...state,
        filters: newFilters,
      };
    }
    case 'SET_SORT':
      if (action.onSortChange) action.onSortChange();
      return { ...state, sortBy: action.payload };
    default:
      return state;
  }
}

export default function App() {
  const [setCode, setSetCode] = useState(DEFAULT_SET_CODE);
  const { allCards, isLoading, error } = useCardData(setCode);
  const { rankings, handleRank, setRankings } = useRankings(setCode, allCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState("ranker");

  const {
    resolvedTopCommons,
    pendingTiebreakers,
    warnings: topCommonsWarnings,
    resolveTiebreaker,
  } = useTopCommons(setCode, allCards, rankings);

  const [state, dispatch] = useReducer(stateReducer, initialState);

  useEffect(() => {
    if (!isLoading && allCards.length > 0) {
      const unrankedCount = allCards.filter((card) => !rankings[getCardKey(card)]).length;
      if (unrankedCount === 0) setViewMode("gallery");
    }
  }, [isLoading, allCards.length]); 
  const filteredAndSortedCards = useMemo(() => {
    let filtered = allCards.filter((card) => {
      const { type, cmc, rarity, showUnrankedOnly, searchTerm } = state.filters;
      const selectedColors = state.filters.colors;
      const cardColors = getCardColors(card);

      if (showUnrankedOnly && rankings[getCardKey(card)]) {
        return false;
      }

      if (searchTerm && !card.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      if (selectedColors && selectedColors.length > 0) {
        if (selectedColors === "M") {
          if (cardColors.length <= 1) return false;
        } else if (selectedColors === "C") {
          if (cardColors.length > 0) return false;
        } else {
          if (cardColors.length !== 1 || cardColors[0] !== selectedColors) {
            return false;
          }
        }
      }

      if (type && !card.type_line.includes(type)) return false;
      if (cmc && card.cmc > parseInt(cmc)) return false;
      if (rarity && card.rarity !== rarity) return false;

      return true;
    });

    const rarityOrder = { common: 4, uncommon: 3, rare: 2, mythic: 1 };
    const gradeOrder = {
      "A+": 1, A: 2, "A-": 3,
      "B+": 4, B: 5, "B-": 6,
      "C+": 7, C: 8, "C-": 9,
      "D+": 10, D: 11, "D-": 12,
      F: 13,
    };

    return filtered.sort((a, b) => {
      if (state.sortBy === "name") return a.name.localeCompare(b.name);
      if (state.sortBy === "rarity")
        return (rarityOrder[a.rarity] || 5) - (rarityOrder[b.rarity] || 5);
      if (state.sortBy === "rank") {
        const rankA = rankings[getCardKey(a)] ? gradeOrder[rankings[getCardKey(a)]] || 99 : 100;
        const rankB = rankings[getCardKey(b)] ? gradeOrder[rankings[getCardKey(b)]] || 99 : 100;
        return rankA - rankB;
      }
      return 0;
    });
  }, [allCards, state.filters, state.sortBy, rankings]);

  const groupedCardsForGallery = useMemo(() => {
    const tierOrder = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "Unranked"];
    const groups = {};
    filteredAndSortedCards.forEach((card) => {
      const rank = rankings[getCardKey(card)] || "Unranked";
      if (!groups[rank]) groups[rank] = [];
      groups[rank].push(card);
    });
    return tierOrder.map((tier) => (groups[tier]?.length > 0 ? { tier, cards: groups[tier] } : null)).filter(Boolean);
  }, [filteredAndSortedCards, rankings]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % filteredAndSortedCards.length);
  }, [filteredAndSortedCards.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + filteredAndSortedCards.length) % filteredAndSortedCards.length);
  }, [filteredAndSortedCards.length]);

  const handleGalleryCardClick = (cardId) => {
    const index = filteredAndSortedCards.findIndex((c) => c.id === cardId);
    if (index !== -1) {
      setViewMode("ranker");
      setCurrentIndex(index);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (viewMode !== "ranker") return;
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, viewMode]);

  if (error) return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center justify-center gap-4">
      <h2 className="text-3xl font-bold text-red-500">Error</h2>
      <p className="text-xl">{error}</p>
      <button onClick={() => window.location.reload()} className="bg-blue-600 px-6 py-2 rounded-lg font-bold">Retry</button>
    </div>
  );
  
  if (isLoading) return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center gap-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      <p className="text-xl font-medium">Loading {setCode.toUpperCase()} cards...</p>
    </div>
  );

  const currentCard = filteredAndSortedCards[currentIndex];

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 flex flex-col items-center font-sans selection:bg-blue-500/30">
      <header className="w-full max-w-7xl flex flex-col items-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-center mb-2 tracking-tighter bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          MTG RANKER
        </h1>
        <div className="flex items-center gap-2 text-gray-400 font-mono text-sm uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          SET: {setCode.toUpperCase()}
        </div>
      </header>

      <div className="py-4 w-full border-b border-gray-800 mb-8">
        <div className="container mx-auto flex flex-col items-center gap-6 px-4">
          <div className="flex flex-wrap justify-center items-center gap-4 w-full max-w-5xl">
            <div className="bg-gray-800 p-1 rounded-xl flex shadow-inner">
              <button
                onClick={() => setViewMode("ranker")}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${viewMode === "ranker" ? "bg-blue-600 shadow-lg" : "text-gray-400 hover:text-white"}`}
              >
                Ranker
              </button>
              <button
                onClick={() => setViewMode("gallery")}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${viewMode === "gallery" ? "bg-blue-600 shadow-lg" : "text-gray-400 hover:text-white"}`}
              >
                Gallery
              </button>
              <button
                onClick={() => setViewMode("topcommons")}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${viewMode === "topcommons" ? "bg-blue-600 shadow-lg" : "text-gray-400 hover:text-white"}`}
              >
                Top Commons
              </button>
            </div>
            
            <div className="flex flex-nowrap justify-center gap-3">
              <SetSelector currentSet={setCode} onSetChange={(newSet) => { setSetCode(newSet); setCurrentIndex(0); }} />
              <SortControls dispatch={dispatch} onSortChange={() => setCurrentIndex(0)} />
              <ShareControls rankings={rankings} allCards={allCards} setCode={setCode} setRankings={setRankings} />
            </div>
          </div>
          
          <FilterControls
            dispatch={dispatch}
            onFilterChange={() => setCurrentIndex(0)}
            filters={state.filters}
          />
        </div>
      </div>

      <main className="w-full max-w-7xl mx-auto flex-grow flex flex-col items-center">
        {filteredAndSortedCards.length > 0 ? (
          <>
            {viewMode === "ranker" && (
              <div className="flex items-center justify-center gap-2 md:gap-8 w-full">
                <button
                  onClick={handlePrev}
                  className="flex w-12 h-12 items-center justify-center bg-gray-800 rounded-full hover:bg-gray-700 text-2xl transition-all border border-gray-700 shadow-xl"
                  title="Previous (Left Arrow)"
                >
                  ←
                </button>
                <Card
                  card={currentCard}
                  currentRank={rankings[getCardKey(currentCard)]}
                  onRank={handleRank}
                  setCode={setCode}
                />
                <button
                  onClick={handleNext}
                  className="flex w-12 h-12 items-center justify-center bg-gray-800 rounded-full hover:bg-gray-700 text-2xl transition-all border border-gray-700 shadow-xl"
                  title="Next (Right Arrow)"
                >
                  →
                </button>
              </div>
            )}
            {viewMode === "gallery" && (
              <GalleryView
                groupedCards={groupedCardsForGallery}
                onCardClick={handleGalleryCardClick}
                setCode={setCode}
              />
            )}
            {viewMode === "topcommons" && (
              <TopCommonsView
                resolvedTopCommons={resolvedTopCommons}
                pendingTiebreakers={pendingTiebreakers}
                warnings={topCommonsWarnings}
                resolveTiebreaker={resolveTiebreaker}
                rankings={rankings}
                setCode={setCode}
                onCardClick={handleGalleryCardClick}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-700">
            <p className="text-2xl font-bold text-gray-400">No cards match the current filters.</p>
            <button 
              onClick={() => dispatch({ type: 'SET_FILTER', payload: { filterName: 'searchTerm', value: '' } })}
              className="mt-4 text-blue-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>

      <footer className="w-full max-w-7xl mt-12 py-8 border-t border-gray-800 flex flex-col items-center gap-2 text-gray-500">
        <div className="flex items-center gap-4 text-sm font-medium">
          <span>{filteredAndSortedCards.length} Cards Found</span>
          {viewMode === "ranker" && filteredAndSortedCards.length > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-700"></span>
              <span className="text-blue-400">Card {currentIndex + 1} of {filteredAndSortedCards.length}</span>
            </>
          )}
        </div>
        <p className="text-xs uppercase tracking-widest">MTG Limited Learning Tool</p>
      </footer>
      
      <HelpPanel />
    </div>
  );
}
