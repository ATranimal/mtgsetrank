import React from 'react';

const FilterControls = ({ dispatch, onFilterChange, filters }) => {
  const handleColorChange = (color) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { filterName: 'colors', value: color },
      onFilterChange: onFilterChange
    });
  };

  const handleUnrankedFilter = () => {
    dispatch({
      type: 'SET_FILTER',
      payload: { filterName: 'showUnrankedOnly', value: !filters.showUnrankedOnly },
      onFilterChange: onFilterChange
    });
  };

  const handleRarityFilter = (rarity) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { filterName: 'rarity', value: rarity },
      onFilterChange: onFilterChange
    });
  }

  const handleSearchChange = (e) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { filterName: 'searchTerm', value: e.target.value },
      onFilterChange: onFilterChange
    });
  };

  return (
    <div className="px-4 py-3 bg-gray-800 rounded-lg flex gap-3 items-center justify-center">
      {/* Search Input */}
      <div className="flex items-center bg-gray-700 rounded p-1 border border-gray-600 focus-within:ring-2 focus-within:ring-blue-500">
        <input
          type="text"
          placeholder="Search cards..."
          value={filters.searchTerm || ''}
          onChange={handleSearchChange}
          className="bg-transparent text-white p-1 outline-none w-32"
        />
        {filters.searchTerm && (
          <button
            onClick={() => dispatch({ type: 'SET_FILTER', payload: { filterName: 'searchTerm', value: '' }, onFilterChange })}
            className="px-2 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex gap-1">
        {['W', 'U', 'B', 'R', 'G'].map(color => (
          <button 
            key={color} 
            onClick={() => handleColorChange(color)} 
            className={`w-8 h-8 rounded-full text-white font-bold transition-all ${filters.colors === color ? 'ring-2 ring-white scale-110' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            {color}
          </button>
        ))}
        <button onClick={() => handleColorChange('M')} className={`px-3 py-1 rounded transition-all ${filters.colors === 'M' ? 'ring-2 ring-white bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Multi</button>
        <button onClick={() => handleColorChange('C')} className={`px-3 py-1 rounded transition-all ${filters.colors === 'C' ? 'ring-2 ring-white bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Colorless</button>
        <button onClick={() => handleColorChange([])} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600">All</button>
      </div>

      <button
        onClick={handleUnrankedFilter}
        className={`px-3 py-1 rounded transition-colors ${filters.showUnrankedOnly ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-700 hover:bg-gray-600'}`}
      >
        Unranked Only
      </button>

      <div className="flex gap-2">
        <select 
          onChange={(e) => dispatch({ type: 'SET_FILTER', payload: { filterName: 'type', value: e.target.value }, onFilterChange })} 
          value={filters.type || ''}
          className="bg-gray-700 p-2 rounded text-white border border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="Creature">Creature</option>
          <option value="Instant">Instant</option>
          <option value="Sorcery">Sorcery</option>
          <option value="Enchantment">Enchantment</option>
          <option value="Artifact">Artifact</option>
          <option value="Land">Land</option>
        </select>

        <select 
          onChange ={(e) => handleRarityFilter(e.target.value)} 
          value={filters.rarity || ''}
          className="bg-gray-700 p-2 rounded text-white border border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Rarities</option>
          <option value="common">Common</option>
          <option value="uncommon">Uncommon</option>
          <option value="rare">Rare</option>
          <option value="mythic">Mythic</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Max CMC:</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Max"
          value={filters.cmc || ''}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            dispatch({ type: 'SET_FILTER', payload: { filterName: 'cmc', value: val }, onFilterChange });
          }}
          className="bg-gray-700 p-2 rounded w-12 text-white border border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 text-center"
        />
      </div>
    </div>
  );
};

export default FilterControls;
