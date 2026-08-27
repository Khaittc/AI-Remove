import React from 'react';
import { Download, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ResultComparisonProps {
  originalImage: string;
  processedImage: string;
}

export const ResultComparison: React.FC<ResultComparisonProps> = ({
  originalImage,
  processedImage,
}) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${processedImage}`;
    link.download = 'cleaned-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
        
      <div className="flex items-center gap-2 text-green-600 font-medium p-4 bg-green-50 rounded-lg border border-green-200">
        <CheckCircle2 className="w-5 h-5" />
        <span>Image processed successfully!</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Before */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
            <span>Before</span>
          </div>
          <div className="relative h-64 md:h-80 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
             <img
              src={`data:image/png;base64,${originalImage}`}
              alt="Original"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* After */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-indigo-600 uppercase tracking-wider flex items-center justify-between">
            <span>After</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">AI Enhanced</span>
          </div>
          <div className="relative h-64 md:h-80 bg-gray-900 rounded-xl overflow-hidden border-2 border-indigo-500 shadow-lg ring-4 ring-indigo-50">
             <img
              src={`data:image/png;base64,${processedImage}`}
              alt="Processed"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Download className="w-5 h-5" />
          Download Clean Image
        </button>
      </div>
    </div>
  );
};