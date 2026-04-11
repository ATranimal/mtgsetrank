import React, { useState } from 'react';

const HelpPanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Help Button */}
      <div className="flex justify-end">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 hover:bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer shadow-lg"
        >
          <span className="text-white text-2xl font-bold">?</span>
        </div>
      </div>
      
      {/* Info Panel */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-gray-800 border-2 border-gray-700 rounded-lg p-4 shadow-xl min-w-[280px]">
          <h3 className="text-lg font-bold mb-3 text-blue-400">Hotkeys</h3>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Navigate:</span>
              <span className="font-mono bg-gray-700 px-2 py-0.5 rounded">← →</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Grade:</span>
              <span className="font-mono bg-gray-700 px-2 py-0.5 rounded">A B C D F</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Modifier:</span>
              <span className="font-mono bg-gray-700 px-2 py-0.5 rounded">+ -</span>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-3 mt-3">
            <h4 className="text-sm font-semibold mb-2 text-gray-300">Created by:</h4>
            <div className="space-y-1 text-sm">
              <a 
                href="https://github.com/ATranimal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-blue-400 hover:text-blue-300 hover:underline"
              >
                github.com/ATranimal
              </a>
              <a 
                href="https://github.com/andrew-jung" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-blue-400 hover:text-blue-300 hover:underline"
              >
                github.com/andrew-jung
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpPanel;
