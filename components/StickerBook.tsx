import React from 'react';
import { Sticker } from '../types';

interface StickerBookProps {
  stickers: Sticker[];
  onBack: () => void;
}

const StickerBook: React.FC<StickerBookProps> = ({ stickers, onBack }) => {
  return (
    <div className="flex flex-col h-full max-h-screen bg-amber-100">
      <div className="p-6 bg-amber-200 shadow-md flex justify-between items-center z-10">
        <h2 className="text-3xl font-bold text-amber-800 font-['Fredoka']">My Sticker Book</h2>
        <button 
          onClick={onBack}
          className="bg-white text-amber-800 px-6 py-2 rounded-full font-bold hover:bg-amber-50 transition-colors shadow-sm"
        >
          Back to Studio
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {stickers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-amber-800/50 space-y-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-xl font-medium">It's empty! Go draw some stickers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {stickers.map((sticker) => (
              <div key={sticker.id} className="relative group perspective">
                <div className="aspect-square bg-white/40 rounded-xl border-2 border-amber-200/50 p-4 flex flex-col items-center justify-center transition-transform hover:scale-105 duration-300">
                  <div className="relative">
                    <img 
                      src={sticker.imageData} 
                      alt={sticker.word} 
                      className="max-w-full max-h-32 object-contain sticker-border"
                    />
                  </div>
                  <span className="mt-3 text-amber-800 font-bold text-sm bg-white/80 px-3 py-1 rounded-full shadow-sm">
                    {sticker.word}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-amber-200 p-4 text-center text-amber-800 text-sm font-medium">
        Collected: {stickers.length} stickers
      </div>
    </div>
  );
};

export default StickerBook;
