
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
      className="w-full h-64 glass-panel border-dashed border-[var(--border-subtle)] flex flex-col items-center justify-center space-y-4 cursor-pointer group hover:bg-[var(--panel-hover)] transition-all"
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
      
      <div className="w-16 h-16 rounded-full bg-[var(--border-subtle)] flex items-center justify-center border border-[var(--border-subtle)] group-hover:scale-105 transition-transform">
        <svg className="w-6 h-6 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>

      <div className="text-center px-4">
        <p className="text-sm font-semibold opacity-80">Add assets to your dashboard</p>
        <p className="text-[10px] mono mt-1 uppercase opacity-30 tracking-widest">
          DRAG & DROP OR BROWSE LOCAL FILES
        </p>
      </div>
      
      <div className="flex space-x-2 pt-2">
        {['PNG', 'WEBP', 'JPG', 'SVG'].map(fmt => (
          <span key={fmt} className="text-[8px] mono font-bold opacity-30 border border-[var(--border-subtle)] px-2 py-0.5 rounded">
            {fmt}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Uploader;
