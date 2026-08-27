import React, { useEffect } from 'react';
import { Lock, Unlock, MoveHorizontal, MoveVertical, RotateCcw } from 'lucide-react';
import { ImageDimensions } from '../types';

interface ResizeControlsProps {
  width: number;
  height: number;
  originalDimensions: ImageDimensions | null;
  lockAspectRatio: boolean;
  onWidthChange: (w: number) => void;
  onHeightChange: (h: number) => void;
  onToggleLock: () => void;
  onReset: () => void;
}

export const ResizeControls: React.FC<ResizeControlsProps> = ({
  width,
  height,
  originalDimensions,
  lockAspectRatio,
  onWidthChange,
  onHeightChange,
  onToggleLock,
  onReset,
}) => {
  const presets = [256, 512, 1024];

  const handleWidthInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      onWidthChange(val);
    }
  };

  const handleHeightInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      onHeightChange(val);
    }
  };

  const applyPreset = (size: number) => {
    if (!originalDimensions) return;
    
    // If locked, we usually fit the largest dimension to the preset, 
    // or just set width to preset and adjust height.
    
    if (lockAspectRatio) {
       const aspectRatio = originalDimensions.width / originalDimensions.height;
       if (aspectRatio > 1) {
         // Width is larger
         onWidthChange(size);
         // Height auto-updates in parent
       } else {
         // Height is larger
         onHeightChange(size);
         // Width auto-updates in parent
       }
    } else {
      onWidthChange(size);
      onHeightChange(size);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Output Resolution (px)
        </label>
        {originalDimensions && (
           <button 
             onClick={onReset}
             className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
             title="Reset to original size"
           >
             <RotateCcw className="w-3 h-3" />
             Reset ({originalDimensions.width}×{originalDimensions.height})
           </button>
        )}
      </div>

      <div className="flex items-end gap-3">
        {/* Width */}
        <div className="relative flex-1">
          <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
            <MoveHorizontal className="w-3 h-3" /> Width
          </label>
          <input
            type="number"
            min="1"
            value={width || ''}
            onChange={handleWidthInput}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
          />
        </div>

        {/* Lock Toggle */}
        <button
          onClick={onToggleLock}
          className={`p-2.5 mb-[1px] rounded-lg border transition-all ${
            lockAspectRatio
              ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
              : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
          }`}
          title={lockAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
        >
          {lockAspectRatio ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
        </button>

        {/* Height */}
        <div className="relative flex-1">
          <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
             <MoveVertical className="w-3 h-3" /> Height
          </label>
          <input
            type="number"
            min="1"
            value={height || ''}
            onChange={handleHeightInput}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
          />
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map((size) => (
          <button
            key={size}
            onClick={() => applyPreset(size)}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors border border-gray-200"
            title={`Resize to ${size}px`}
          >
            {size}×{size}
          </button>
        ))}
      </div>
      
      <p className="text-xs text-gray-400">
        Resizing happens after the AI editing process to ensure exact dimensions.
      </p>
    </div>
  );
};