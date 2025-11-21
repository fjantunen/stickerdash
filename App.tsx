import React, { useState, useCallback, useRef } from 'react';
import { GamePhase, Sticker, DrawingTool, ToolType } from './types';
import { STICKER_WORDS, PEN_COLORS, BRUSH_SIZES } from './constants';
import { judgeDrawing } from './services/geminiService';
import Canvas from './components/Canvas';
import StickerBook from './components/StickerBook';

function App() {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.START_SCREEN);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [currentWord, setCurrentWord] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  
  // Canvas State
  const [tool, setTool] = useState<DrawingTool>({ type: 'pen', color: '#000000', size: 8 });
  const [clearTrigger, setClearTrigger] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Helper to extract data from child
  const getCanvasDataRef = useRef<((callback: (data: string) => void) => void) | null>(null);

  const startNewRound = () => {
    const randomWord = STICKER_WORDS[Math.floor(Math.random() * STICKER_WORDS.length)];
    setCurrentWord(randomWord);
    setClearTrigger(prev => prev + 1);
    setHasDrawn(false);
    setTool({ type: 'pen', color: '#000000', size: 8 });
    setPhase(GamePhase.DRAWING);
  };

  const handleSubmit = useCallback(() => {
    if (!getCanvasDataRef.current) return;

    getCanvasDataRef.current(async (base64Data) => {
      setPhase(GamePhase.JUDGING);
      
      try {
        const result = await judgeDrawing(base64Data, currentWord);
        setFeedback(result.feedback);
        
        if (result.isMatch) {
          // Create new sticker
          const newSticker: Sticker = {
            id: Date.now().toString(),
            word: currentWord,
            imageData: base64Data,
            createdAt: Date.now()
          };
          setStickers(prev => [...prev, newSticker]);
          setPhase(GamePhase.RESULT_SUCCESS);
        } else {
          setPhase(GamePhase.RESULT_FAIL);
        }
      } catch (e) {
        setFeedback("Something went wrong with the judge. Try again!");
        setPhase(GamePhase.RESULT_FAIL);
      }
    });
  }, [currentWord]);

  const setGetCanvasData = useCallback((fn: (callback: (data: string) => void) => void) => {
    getCanvasDataRef.current = fn;
  }, []);

  // --- RENDER HELPERS ---

  if (phase === GamePhase.STICKER_BOOK) {
    return <StickerBook stickers={stickers} onBack={() => setPhase(GamePhase.START_SCREEN)} />;
  }

  if (phase === GamePhase.START_SCREEN) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center p-4 text-white">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-6xl font-black font-['Fredoka'] tracking-wider drop-shadow-lg">
              Sticker<br/><span className="text-yellow-300">Dash</span>
            </h1>
            <p className="text-xl text-indigo-100 font-light">Draw fast. Collect them all.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={startNewRound}
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 text-2xl font-bold rounded-xl shadow-[0_4px_0_rgb(180,83,9)] active:shadow-none active:translate-y-1 transition-all"
              >
                Play Now
              </button>
              <button 
                onClick={() => setPhase(GamePhase.STICKER_BOOK)}
                className="w-full py-4 bg-white hover:bg-gray-100 text-indigo-600 text-xl font-bold rounded-xl shadow-[0_4px_0_rgb(200,200,200)] active:shadow-none active:translate-y-1 transition-all"
              >
                My Collection ({stickers.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Fredoka']">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">SD</div>
          <span className="font-bold text-slate-700">Sticker Dash</span>
        </div>
        <div className="flex items-center space-x-4">
             <div className="text-slate-500 font-medium text-sm hidden sm:block">
               Collection: <span className="text-indigo-600 font-bold">{stickers.length}</span>
             </div>
             <button onClick={() => setPhase(GamePhase.START_SCREEN)} className="text-slate-400 hover:text-slate-600">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full p-4 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar / Tools */}
        <div className="md:w-64 flex flex-col gap-4 order-2 md:order-1">
          {/* Prompt Card */}
          <div className="bg-indigo-100 p-6 rounded-2xl border-2 border-indigo-200 text-center shadow-sm">
            <p className="text-indigo-600 text-sm font-bold uppercase tracking-widest mb-1">Draw This</p>
            <h2 className="text-4xl font-black text-indigo-900 break-words">{currentWord}</h2>
          </div>

          {/* Tools */}
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm flex-1 flex flex-col gap-4">
             {/* Brush Size */}
             <div>
               <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Size</label>
               <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                 {BRUSH_SIZES.map(size => (
                   <button
                     key={size}
                     onClick={() => setTool({...tool, size})}
                     className={`rounded-full bg-slate-800 transition-all ${tool.size === size ? 'ring-2 ring-indigo-500 ring-offset-2' : 'opacity-30 hover:opacity-60'}`}
                     style={{ width: size, height: size }}
                   />
                 ))}
               </div>
             </div>

             {/* Colors */}
             <div>
               <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Color</label>
               <div className="grid grid-cols-4 gap-2">
                 {PEN_COLORS.map(color => (
                   <button
                     key={color}
                     onClick={() => setTool({...tool, color, type: 'pen'})}
                     className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${tool.type === 'pen' && tool.color === color ? 'border-indigo-500 scale-110 shadow-md' : 'border-transparent'}`}
                     style={{ backgroundColor: color }}
                   />
                 ))}
               </div>
             </div>

             {/* Actions */}
             <div className="mt-auto grid grid-cols-2 gap-2">
               <button 
                 onClick={() => setTool({...tool, type: tool.type === 'eraser' ? 'pen' : 'eraser'})}
                 className={`p-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${tool.type === 'eraser' ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                 </svg>
                 Eraser
               </button>
               <button 
                 onClick={() => setClearTrigger(prev => prev + 1)}
                 className="p-3 rounded-xl font-bold text-sm bg-slate-100 text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center gap-2 transition-colors"
               >
                  Clear
               </button>
             </div>
          </div>
        </div>

        {/* Main Drawing Area */}
        <div className="flex-1 relative order-1 md:order-2 h-[50vh] md:h-auto min-h-[400px]">
           <Canvas 
             tool={tool} 
             onDrawStart={() => setHasDrawn(true)}
             getCanvasData={setGetCanvasData}
             clearTrigger={clearTrigger}
           />

           {/* Overlay for loading/results */}
           {(phase === GamePhase.JUDGING || phase === GamePhase.RESULT_SUCCESS || phase === GamePhase.RESULT_FAIL) && (
             <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center p-8 z-20 animate-fade-in">
               {phase === GamePhase.JUDGING && (
                 <div className="text-center">
                   <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                   <h3 className="text-2xl font-bold text-indigo-900">Judging Art...</h3>
                   <p className="text-indigo-600">Is it a {currentWord}?</p>
                 </div>
               )}

               {phase === GamePhase.RESULT_SUCCESS && (
                 <div className="text-center max-w-sm">
                   <div className="text-6xl mb-4">🎉</div>
                   <h3 className="text-3xl font-black text-green-600 mb-2">Sticker Collected!</h3>
                   <p className="text-slate-600 mb-6 text-lg italic">"{feedback}"</p>
                   <div className="flex gap-3 justify-center">
                     <button onClick={startNewRound} className="px-6 py-3 bg-green-500 hover:bg-green-400 text-white rounded-xl font-bold shadow-lg transition-transform hover:scale-105">
                       Next Word
                     </button>
                     <button onClick={() => setPhase(GamePhase.STICKER_BOOK)} className="px-6 py-3 bg-white text-green-600 border-2 border-green-100 hover:border-green-300 rounded-xl font-bold transition-colors">
                       Open Book
                     </button>
                   </div>
                 </div>
               )}

               {phase === GamePhase.RESULT_FAIL && (
                 <div className="text-center max-w-sm">
                   <div className="text-6xl mb-4">🤔</div>
                   <h3 className="text-3xl font-black text-orange-500 mb-2">Nice Try!</h3>
                   <p className="text-slate-600 mb-6 text-lg italic">"{feedback}"</p>
                   <div className="flex gap-3 justify-center">
                     <button onClick={() => setPhase(GamePhase.DRAWING)} className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold shadow-lg transition-transform hover:scale-105">
                       Keep Drawing
                     </button>
                     <button onClick={startNewRound} className="px-6 py-3 bg-white text-slate-500 border-2 border-slate-100 hover:border-slate-300 rounded-xl font-bold transition-colors">
                       Skip Word
                     </button>
                   </div>
                 </div>
               )}
             </div>
           )}
        </div>

      </div>

      {/* Bottom Action Bar for Mobile/Desktop consistency */}
      {phase === GamePhase.DRAWING && (
        <div className="p-4 bg-white border-t border-slate-200 flex justify-center md:justify-end">
          <button
            onClick={handleSubmit}
            disabled={!hasDrawn}
            className={`
              w-full md:w-auto px-8 py-4 rounded-xl text-xl font-black tracking-wide shadow-lg transition-all transform
              ${hasDrawn 
                ? 'bg-gradient-to-r from-green-400 to-emerald-600 text-white hover:-translate-y-1 hover:shadow-xl' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
            `}
          >
            I'M DONE!
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
