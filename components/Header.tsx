import React, { useEffect, useState } from 'react';
import { Eraser, UserCircle, LogIn } from 'lucide-react';

export const Header: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // Use type assertion to access aistudio to avoid conflicting with existing global type definition
      const win = window as any;
      if (win.aistudio) {
        try {
          const selected = await win.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } catch (e) {
          console.error("Error checking API key status", e);
        }
      }
    };
    checkKey();
  }, []);

  const handleAuthClick = async () => {
    const win = window as any;
    if (win.aistudio) {
      try {
        await win.aistudio.openSelectKey();
        // Check status again after dialog closes (small delay to ensure state update)
        setTimeout(async () => {
          const selected = await win.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        }, 500);
      } catch (e) {
        console.error("Error selecting API key", e);
      }
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <Eraser className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">
              AI Logo Remover
            </h1>
            <p className="text-xs text-slate-400 font-medium hidden sm:block mt-0.5">
              Smart Image Cleanup
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Account / API Key Button */}
          <button
            onClick={handleAuthClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
              hasKey 
                ? 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white' 
                : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700'
            }`}
            title="Manage Google Account / API Key"
          >
            {hasKey ? (
              <>
                <div className="relative">
                  <UserCircle className="w-5 h-5" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full ring-2 ring-slate-800"></div>
                </div>
                <span className="hidden sm:inline">Google Account</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Connect Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};