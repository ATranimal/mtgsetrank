import React from 'react';

const SortControls = ({ dispatch, onSortChange }) => (
  <div className="p-4 bg-gray-800 rounded-lg flex items-center">
    <label className="mr-2">Sort by:</label>
    <select onChange={(e) => dispatch({ type: 'SET_SORT', payload: e.target.value, onSortChange })} className="bg-gray-700 p-2 rounded text-white">
      <option value="name">Name</option>
      <option value="rarity">Rarity</option>
      <option value="rank">My Rank</option>
    </select>
  </div>
);

export default SortControls;
