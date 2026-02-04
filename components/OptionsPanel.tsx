
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
  const handleDimensionChange = (key: 'width' | 'height', value: string) => {
    const numValue = value === '' ? undefined : parseInt(value);
    setOptions(prev => ({ ...prev, [key]: numValue }));
  };

  const isPng = options.format === ImageFormat.PNG;

  return (
    <div className="glass-panel p-8 space-y-8">
      <h3 className="text-xs font-semibold opacity-40 uppercase tracking-widest">Settings</h3>
      
      <div className="space-y-8">
        {/* Output Format Section */}
        <div>
          <label className="block text-[10px] font-bold opacity-30 uppercase tracking-widest mb-4">Target Format</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(SUPPORTED_FORMATS) as (keyof typeof SUPPORTED_FORMATS)[]).map((label) => (
              <button
                key={label}
                onClick={() => setOptions(prev => ({ ...prev, format: SUPPORTED_FORMATS[label] }))}
                className={`py-2 px-1 text-[10px] font-bold tracking-widest rounded-lg border transition-all ${
                  options.format === SUPPORTED_FORMATS[label]
                    ? 'bg-[var(--text-main)] text-[var(--bg-main)] border-[var(--text-main)]'
                    : 'bg-transparent opacity-40 border-[var(--border-subtle)] hover:opacity-100 hover:border-[var(--text-muted)]'
                }`}
              >
                {label}
                {label === 'WEBP' && <span className="block text-[7px] opacity-50 font-normal">RECOMMENDED</span>}
              </button>
            ))}
          </div>
          
          {isPng && (
            <div className="mt-4 p-3 bg-amber-400/5 rounded-lg border border-amber-500/20 text-[9px] font-medium text-amber-600/80 leading-relaxed uppercase">
              Warning: PNG is lossless. Large assets will result in high storage usage.
            </div>
          )}
        </div>

        {/* Dimensions Section */}
        <div className="space-y-4">
          <label className="block text-[10px] font-bold opacity-30 uppercase tracking-widest">Dimensions</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input 
                type="number"
                placeholder="WIDTH (PX)"
                value={options.width || ''}
                onChange={(e) => handleDimensionChange('width', e.target.value)}
                className="w-full crypto-input p-3 text-xs mono"
              />
            </div>
            <div>
              <input 
                type="number"
                placeholder="HEIGHT (PX)"
                value={options.height || ''}
                onChange={(e) => handleDimensionChange('height', e.target.value)}
                className="w-full crypto-input p-3 text-xs mono"
              />
            </div>
          </div>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox"
                checked={options.maintainAspectRatio}
                onChange={(e) => setOptions(prev => ({ ...prev, maintainAspectRatio: e.target.checked }))}
                className="w-5 h-5 crypto-input appearance-none checked:bg-[var(--text-main)] checked:border-[var(--text-main)] transition-colors"
              />
              {options.maintainAspectRatio && (
                <svg className="absolute inset-0 w-5 h-5 text-[var(--bg-main)] p-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
              )}
            </div>
            <span className="text-[10px] font-bold uppercase opacity-50 group-hover:opacity-100 transition-opacity">Lock Aspect Ratio</span>
          </label>
        </div>

        {/* Quality Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Asset Fidelity</label>
            <span className="text-xs font-bold">{options.quality}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={options.quality}
            onChange={(e) => setOptions(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
            className="w-full h-1.5 bg-[var(--border-subtle)] rounded-full appearance-none cursor-pointer accent-[var(--text-main)]"
          />
        </div>

        {/* AI Enhancement Toggle */}
        <div className="pt-6 border-t border-[var(--border-subtle)]">
          <label className="flex items-center justify-between p-4 bg-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)] cursor-pointer hover:bg-[var(--panel-hover)] transition-colors group">
            <div className="pr-4">
              <span className="text-[11px] font-bold uppercase tracking-tight opacity-90">Gemini Pro Upscale</span>
              <p className="text-[9px] opacity-30 mt-0.5 uppercase">AI Neural Enhancement</p>
            </div>
            <div className="relative">
               <input
                  type="checkbox"
                  checked={options.aiEnhance}
                  onChange={(e) => setOptions(prev => ({ ...prev, aiEnhance: e.target.checked }))}
                  className="w-12 h-6 rounded-full bg-[var(--border-subtle)] border border-[var(--border-subtle)] appearance-none transition-colors checked:bg-emerald-400"
                />
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-[var(--text-main)] shadow-sm transition-transform ${options.aiEnhance ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </label>
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={isLoading}
        className={`w-full py-4 btn-primary flex items-center justify-center space-x-2 ${
          isLoading ? 'opacity-20 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold uppercase">Executing...</span>
          </>
        ) : (
          <span className="text-xs font-bold uppercase">Execute Transformation</span>
        )}
      </button>
    </div>
  );
};

export default OptionsPanel;
