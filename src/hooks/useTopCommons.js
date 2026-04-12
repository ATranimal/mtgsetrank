import { useState, useMemo, useCallback, useEffect } from 'react';
import { getCardKey, getCardColors } from '../utils/cardUtils';

const COLORS = ['W', 'U', 'B', 'R', 'G'];
const COLOR_NAMES = { W: 'White', U: 'Blue', B: 'Black', R: 'Red', G: 'Green' };

const GRADE_ORDER = {
  "A+": 1, A: 2, "A-": 3,
  "B+": 4, B: 5, "B-": 6,
  "C+": 7, C: 8, "C-": 9,
  "D+": 10, D: 11, "D-": 12,
  F: 13,
};

export const useTopCommons = (setCode, allCards, rankings) => {
  const storageKey = `topCommons-${setCode}`;

  const [tiebreakers, setTiebreakers] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(tiebreakers));
    } catch (e) {
      console.error("Failed to save top commons tiebreakers", e);
    }
  }, [tiebreakers, storageKey]);

  // Get all commons grouped by color
  const commonsByColor = useMemo(() => {
    const result = {};
    COLORS.forEach(color => {
      result[color] = allCards.filter(card => {
        const colors = getCardColors(card);
        return card.rarity === 'common' && colors.length === 1 && colors[0] === color;
      });
    });
    return result;
  }, [allCards]);

  // Check which colors have all commons ranked
  const unrankedByColor = useMemo(() => {
    const result = {};
    COLORS.forEach(color => {
      const commons = commonsByColor[color] || [];
      result[color] = commons.filter(card => !rankings[getCardKey(card)]);
    });
    return result;
  }, [commonsByColor, rankings]);

  // Compute top 3 with tie detection per color
  const analysisPerColor = useMemo(() => {
    const result = {};
    COLORS.forEach(color => {
      const commons = commonsByColor[color] || [];
      const ranked = commons
        .filter(card => rankings[getCardKey(card)])
        .map(card => ({
          card,
          key: getCardKey(card),
          rank: rankings[getCardKey(card)],
          order: GRADE_ORDER[rankings[getCardKey(card)]] || 99,
        }))
        .sort((a, b) => a.order - b.order);

      if (ranked.length < 3) {
        result[color] = { ranked, top3: ranked, ties: null, needsMore: true };
        return;
      }

      // Find the grade at position 3 (index 2)
      const thirdGradeOrder = ranked[2].order;

      // Cards that are clearly in top 2 (better than 3rd)
      const clearTop = ranked.filter(c => c.order < thirdGradeOrder);
      // Cards tied at the 3rd position grade
      const tiedAtBoundary = ranked.filter(c => c.order === thirdGradeOrder);
      // How many more we need to fill to get 3
      const slotsNeeded = 3 - clearTop.length;

      if (tiedAtBoundary.length > slotsNeeded) {
        // There's a tie — user needs to pick
        result[color] = {
          ranked,
          clearTop,
          tiedAtBoundary,
          slotsNeeded,
          ties: {
            grade: ranked[2].rank,
            candidates: tiedAtBoundary.map(c => c.card),
            pick: slotsNeeded,
          },
          needsMore: false,
        };
      } else {
        // No tie, take top 3
        result[color] = {
          ranked,
          top3: ranked.slice(0, 3),
          ties: null,
          needsMore: false,
        };
      }
    });
    return result;
  }, [commonsByColor, rankings]);

  // Resolve final top 3 using tiebreaker selections
  const resolvedTopCommons = useMemo(() => {
    const result = {};
    COLORS.forEach(color => {
      const analysis = analysisPerColor[color];
      if (!analysis) { result[color] = []; return; }

      if (analysis.top3) {
        // No ties, use computed top 3
        result[color] = analysis.top3.map(c => c.card);
        return;
      }

      // Has ties — check if user has resolved them
      const picks = tiebreakers[color];
      if (picks && picks.length === analysis.slotsNeeded) {
        // Validate picks are still among the tied candidates
        const candidateKeys = new Set(analysis.tiedAtBoundary.map(c => c.key));
        const validPicks = picks.filter(key => candidateKeys.has(key));
        if (validPicks.length === analysis.slotsNeeded) {
          const pickedCards = validPicks.map(key =>
            analysis.tiedAtBoundary.find(c => c.key === key).card
          );
          result[color] = [...analysis.clearTop.map(c => c.card), ...pickedCards];
          return;
        }
      }

      // Ties not resolved yet
      result[color] = null;
    });
    return result;
  }, [analysisPerColor, tiebreakers]);

  const resolveTiebreaker = useCallback((color, selectedCardKeys) => {
    setTiebreakers(prev => ({
      ...prev,
      [color]: selectedCardKeys,
    }));
  }, []);

  // Determine which colors need tiebreaking
  const pendingTiebreakers = useMemo(() => {
    const pending = {};
    COLORS.forEach(color => {
      const analysis = analysisPerColor[color];
      if (analysis?.ties && resolvedTopCommons[color] === null) {
        pending[color] = analysis.ties;
      }
    });
    return pending;
  }, [analysisPerColor, resolvedTopCommons]);

  // Warnings for unranked commons
  const warnings = useMemo(() => {
    const w = [];
    COLORS.forEach(color => {
      const unranked = unrankedByColor[color] || [];
      if (unranked.length > 0) {
        w.push({
          color,
          colorName: COLOR_NAMES[color],
          count: unranked.length,
          total: (commonsByColor[color] || []).length,
        });
      }
    });
    return w;
  }, [unrankedByColor, commonsByColor]);

  return {
    resolvedTopCommons,
    pendingTiebreakers,
    warnings,
    resolveTiebreaker,
    analysisPerColor,
    commonsByColor,
    tiebreakers,
  };
};

export { COLORS, COLOR_NAMES };
