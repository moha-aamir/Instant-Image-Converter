
import React, { useCallback, useRef } from 'react';

interface UploaderProps {
  onFilesSelect: (files: FileList) => void;
}

const Uploader: React.FC<UploaderProps> = ({ onFilesSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      onFilesSelect(e.dataTransfer.files);
    }
  }, [onFilesSelect]);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  return (
    <div 
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="w-full h-72 brutalist-card flex flex-col items-center justify-center space-y-6 cursor-pointer group hover:bg-[#F8FAF9] transition-colors"
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        multiple 
        accept="image/*,.svg"
        onChange={(e) => e.target.files && onFilesSelect(e.target.files)}
      />
      
      <div className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-transform">
        <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
        </svg>
      </div>

      <div className="text-center px-4">
        <p className="text-xl font-black uppercase leading-tight">Drop files to convert</p>
        <p className="mono text-xs mt-2 uppercase font-bold text-slate-600 tracking-tight">
          JPG, PNG, WEBP, SVG, BMP (UP TO 50MB)
        </p>
      </div>

      <div className="flex space-x-2">
        {['PNG', 'JPG', 'WEBP', 'SVG'].map(fmt => (
          <div key={fmt} className="bg-[#CADED5] border border-black/20 text-[10px] px-2 py-0.5 font-bold uppercase tracking-widest text-slate-700">
            {fmt}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Uploader;
