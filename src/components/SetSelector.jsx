import React from 'react';
import { AVAILABLE_SETS } from '../constants/sets';

const SetSelector = ({ currentSet, onSetChange }) => {
  return (
    <div className="p-4 bg-gray-800 rounded-lg flex items-center gap-2">
      <label htmlFor="set-selector" className="text-sm font-medium text-gray-300">
        Set:
      </label>
      <select
        id="set-selector"
        value={currentSet}
        onChange={(e) => onSetChange(e.target.value)}
        className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {AVAILABLE_SETS.map((set) => (
          <option key={set.code} value={set.code}>
            {set.code.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SetSelector;
