import React from 'react';


export const renderManaSymbols = (text) => {
  if (!text) return [];

  const parts = text.split(/(\{[A-Z0-9/]+\})/g);

  return parts.map((part, index) => {
    const match = part.match(/\{([A-Z0-9/]+)\}/);
    if (match) {
      let symbol = match[1].toLowerCase();
      
      if (symbol === 't') symbol = 'tap';
      if (symbol === 'q') symbol = 'untap';
      
      symbol = symbol.replace(/\//g, '');

      return (
        <i 
          key={index} 
          className={`ms ms-${symbol} ms-cost`} 
          aria-hidden="true"
        ></i>
      );
    }
    return part;
  });
};
