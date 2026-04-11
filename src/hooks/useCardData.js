import { useState, useEffect } from 'react';

/**
 * Hook to fetch card data for a given set.
 * @param {string} setCode - The set code to fetch.
 * @returns {Object} { allCards, isLoading, error }
 */
export const useCardData = (setCode) => {
  const [allCards, setAllCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCards() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/sets/${setCode}/${setCode}.json`);
        if (!response.ok) throw new Error(`Could not find ${setCode}.json`);
        const data = await response.json();
        setAllCards(data);
      } catch (err) {
        console.error(err);
        setError(
          `Failed to load card data. Make sure ${setCode}.json is in /public/sets/${setCode}/`
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadCards();
  }, [setCode]);

  return { allCards, isLoading, error };
};
