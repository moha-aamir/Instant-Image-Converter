
import React from 'react';
import { ConversionOptions, ImageFormat } from '../types';
import { SUPPORTED_FORMATS } from '../constants';

interface OptionsPanelProps {
  options: ConversionOptions;
  setOptions: React.Dispatch<React.SetStateAction<ConversionOptions>>;
  onStart: () => void;
  isLoading: boolean;
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({ options, setOptions, onStart, isLoading }) => {
  return (
    <div className="brutalist-card p-6 space-y-8">
      <div className="border-b-2 border-black pb-2">
        <h3 className="text-lg font-black uppercase italic tracking-tighter">Configuration</h3>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-black uppercase mb-3 tracking-widest text-slate-500">Output Format</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(SUPPORTED_FORMATS) as (keyof typeof SUPPORTED_FORMATS)[]).map((label) => (
              <button
                key={label}
                onClick={() => setOptions(prev => ({ ...prev, format: SUPPORTED_FORMATS[label] }))}
                className={`py-2 px-1 brutalist-button text-[10px] tracking-widest ${
                  options.format === SUPPORTED_FORMATS[label]
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-3">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Quality Level</label>
            <span className="mono text-xs font-bold">{options.quality}%</span>
          </div>
          <div className="relative h-6 flex items-center">
             <input
                type="range"
                min="1"
                max="100"
                value={options.quality}
                onChange={(e) => setOptions(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                className="w-full h-2 bg-white border-2 border-black rounded-none appearance-none cursor-pointer accent-black"
                style={{ WebkitAppearance: 'none' }}
              />
          </div>
        </div>

        <div className="pt-4 border-t-2 border-black border-dashed">
          <label className="flex items-start space-x-3 cursor-pointer group">
            <div className="relative flex items-center h-5">
              <input
                type="checkbox"
                checked={options.aiEnhance}
                onChange={(e) => setOptions(prev => ({ ...prev, aiEnhance: e.target.checked }))}
                className="w-5 h-5 border-2 border-black rounded-none bg-white checked:bg-black appearance-none transition-colors"
              />
              {options.aiEnhance && (
                <svg className="absolute w-5 h-5 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-tight">Gemini AI Upscale</span>
              <p className="mono text-[10px] text-slate-500 leading-tight mt-1 uppercase">Removes artifacts & sharpens pixels using GenAI</p>
            </div>
          </label>
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={isLoading}
        className={`w-full py-4 brutalist-button flex items-center justify-center space-x-2 ${
          isLoading ? 'bg-slate-200 cursor-not-allowed' : 'bg-black text-white hover:bg-slate-800'
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-4 border-white border-t-transparent animate-spin"></div>
            <span className="text-sm">Processing...</span>
          </>
        ) : (
          <span className="text-sm">Execute Conversion</span>
        )}
      </button>
    </div>
  );
};

export default OptionsPanel;
