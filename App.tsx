import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultComparison } from './components/ResultComparison';
import { ResizeControls } from './components/ResizeControls';
import { removeLogoFromImage } from './services/geminiService';
import { getImageDimensions, resizeImage } from './utils/imageHelpers';
import { AppState, ErrorState, ImageDimensions } from './types';
import { Wand2, AlertCircle, Loader2, Image as ImageIcon, Settings2 } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppState>(AppState.IDLE);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [error, setError] = useState<ErrorState>({ hasError: false, message: '' });

  // Resize State
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions | null>(null);
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);

  const handleImageSelected = async (base64: string, type: string) => {
    setOriginalImage(base64);
    setMimeType(type);
    setStatus(AppState.IDLE);
    setProcessedImage(null);
    setError({ hasError: false, message: '' });

    // Get dimensions
    try {
      const dims = await getImageDimensions(base64, type);
      setOriginalDimensions(dims);
      setTargetWidth(dims.width);
      setTargetHeight(dims.height);
    } catch (e) {
      console.error("Could not get image dimensions", e);
    }
  };

  const handleClear = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setPrompt('');
    setStatus(AppState.IDLE);
    setError({ hasError: false, message: '' });
    setOriginalDimensions(null);
    setTargetWidth(0);
    setTargetHeight(0);
  };

  const handleWidthChange = (newWidth: number) => {
    setTargetWidth(newWidth);
    if (lockAspectRatio && originalDimensions) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setTargetHeight(Math.round(newWidth * ratio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setTargetHeight(newHeight);
    if (lockAspectRatio && originalDimensions) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setTargetWidth(Math.round(newHeight * ratio));
    }
  };

  const handleResetDimensions = () => {
    if (originalDimensions) {
      setTargetWidth(originalDimensions.width);
      setTargetHeight(originalDimensions.height);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage || !prompt) return;

    setStatus(AppState.PROCESSING);
    setError({ hasError: false, message: '' });

    try {
      // 1. Process Image with Gemini
      const geminiResultBase64 = await removeLogoFromImage(originalImage, mimeType, prompt);
      
      // 2. Resize if needed
      let finalImage = geminiResultBase64;
      
      // Check if resizing is needed (dimensions different from original or input)
      // Note: Gemini sometimes changes dimensions slightly, but we want to force user selection.
      // We always run resize to ensure "exact pixel dimensions specified".
      if (targetWidth > 0 && targetHeight > 0) {
         finalImage = await resizeImage(geminiResultBase64, mimeType, targetWidth, targetHeight);
      }

      setProcessedImage(finalImage);
      setStatus(AppState.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setError({ 
        hasError: true, 
        message: err.message || "Failed to process image. Please try again." 
      });
      setStatus(AppState.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-slate-800 flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8">
          
          {/* Left Column: Input Controls */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Upload */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">1</span>
                Upload Image
              </h2>
              <ImageUploader
                onImageSelected={handleImageSelected}
                selectedImage={originalImage}
                onClear={handleClear}
              />
            </div>
            
            {/* 2. Output Settings (Resize) */}
            <div className={`bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transition-opacity duration-300 ${!originalImage ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
               <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">2</span>
                Output Settings
              </h2>
              <ResizeControls 
                width={targetWidth}
                height={targetHeight}
                originalDimensions={originalDimensions}
                lockAspectRatio={lockAspectRatio}
                onWidthChange={handleWidthChange}
                onHeightChange={handleHeightChange}
                onToggleLock={() => setLockAspectRatio(!lockAspectRatio)}
                onReset={handleResetDimensions}
              />
            </div>

            {/* 3. Instructions */}
            <div className={`bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transition-opacity duration-300 ${!originalImage ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                 <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">3</span>
                Instructions
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
                    What should be removed?
                  </label>
                  <textarea
                    id="prompt"
                    rows={4}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base p-3 border resize-none bg-gray-50 text-gray-900 placeholder:text-gray-400"
                    placeholder="E.g., Remove the watermark in the bottom right corner, erase the brand logo on the shirt..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={status === AppState.PROCESSING}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Be specific about the location and description of the object.
                  </p>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!prompt || !originalImage || status === AppState.PROCESSING}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-white shadow-lg shadow-indigo-200 transition-all
                    ${!prompt || !originalImage || status === AppState.PROCESSING
                      ? 'bg-gray-400 cursor-not-allowed shadow-none'
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                >
                  {status === AppState.PROCESSING ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Remove Logo & Generate
                    </>
                  )}
                </button>

                 {error.hasError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Preview/Results */}
          <div className="lg:col-span-7">
             <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 min-h-[600px] flex flex-col sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">4</span>
                Result
              </h2>

              {status === AppState.COMPLETE && originalImage && processedImage ? (
                <ResultComparison
                  originalImage={originalImage}
                  processedImage={processedImage}
                />
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50 p-12">
                  {status === AppState.PROCESSING ? (
                     <div className="flex flex-col items-center animate-pulse">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full mb-4 flex items-center justify-center">
                            <Wand2 className="w-8 h-8 text-indigo-600 animate-spin-slow" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Magic in progress...</h3>
                        <p className="max-w-xs mx-auto text-gray-500">AI is analyzing your image, removing unwanted elements, and resizing.</p>
                     </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-gray-100 rounded-full mb-4 flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-gray-300" />
                      </div>
                      <p className="text-lg font-medium text-gray-900">No results yet</p>
                      <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">Upload an image, adjust settings, and see the AI magic happen here.</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
      
      <footer className="bg-slate-800 border-t border-slate-700 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} AI Logo Remover. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;