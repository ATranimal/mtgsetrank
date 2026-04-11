/**
 * Extracts the color identity of a card.
 * @param {Object} card 
 * @returns {string[]}
 */
export const getCardColors = (card) => {
  return card.color_identity || [];
};

/**
 * Generates a unique key for a card based on its set and collector number.
 * @param {Object} card 
 * @returns {string}
 */
export const getCardKey = (card) => `${card.set}-${card.collector_number}`;
