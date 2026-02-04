
import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { ImageFile, ConversionOptions, ImageFormat } from './types';
import { getImageMetadata, convertImage } from './services/imageProcessor';
import { analyzeImageAI, enhanceImageAI } from './services/geminiService';
import Uploader from './components/Uploader';
import OptionsPanel from './components/OptionsPanel';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(
    (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
  );
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [options, setOptions] = useState<ConversionOptions>({
    format: ImageFormat.WEBP,
    quality: 85,
    maintainAspectRatio: true,
    aiEnhance: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleFilesSelect = async (fileList: FileList) => {
    const newFiles: ImageFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const previewUrl = URL.createObjectURL(file);
      try {
        const meta = await getImageMetadata(file);
        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          previewUrl,
          metadata: {
            width: meta.width,
            height: meta.height,
            size: file.size,
            type: file.type,
          },
          status: 'pending'
        });
      } catch (e) {
        console.error("Metadata load failed", e);
      }
    }
    setFiles(prev => [...prev, ...newFiles]);
  };

  const startConversion = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    const updatedFiles = [...files];
    for (let i = 0; i < updatedFiles.length; i++) {
      const item = updatedFiles[i];
      if (item.status === 'completed') continue;
      try {
        updatedFiles[i] = { ...item, status: 'processing' };
        setFiles([...updatedFiles]);
        let sourceUrl = item.previewUrl;
        
        if (options.aiEnhance) {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(item.file);
          });
          const enhanced = await enhanceImageAI(base64);
          if (enhanced) sourceUrl = enhanced;
        }

        const convertedUrl = await convertImage(sourceUrl, options);
        updatedFiles[i] = {
          ...updatedFiles[i],
          status: 'completed',
          convertedUrl
        };

        if (i === 0) {
           const reader = new FileReader();
           const base64 = await new Promise<string>((resolve) => {
             reader.onload = () => resolve(reader.result as string);
             reader.readAsDataURL(item.file);
           });
           const desc = await analyzeImageAI(base64);
           setDescription(desc);
        }
        setFiles([...updatedFiles]);
      } catch (error: any) {
        updatedFiles[i] = { ...updatedFiles[i], status: 'error', error: error.message };
        setFiles([...updatedFiles]);
      }
    }
    setIsProcessing(false);
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== id);
      if (newFiles.length === 0) setDescription("");
      return newFiles;
    });
  };

  const clearAll = () => {
    setFiles([]);
    setDescription("");
  };

  const downloadAllAsZip = async () => {
    const zip = new JSZip();
    const completedFiles = files.filter(f => f.status === 'completed' && f.convertedUrl);
    if (completedFiles.length === 0) return;
    for (const file of completedFiles) {
      if (!file.convertedUrl) continue;
      const ext = options.format.split('/')[1].replace('jpeg', 'jpg').replace('svg+xml', 'svg');
      const fullName = `${file.file.name.split('.')[0]}.${ext}`;
      const response = await fetch(file.convertedUrl);
      const blob = await response.blob();
      zip.file(fullName, blob);
    }
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `pixelflex-export-${Date.now()}.zip`;
    link.click();
  };

  const allCompleted = files.length > 0 && files.every(f => f.status === 'completed');

  return (
    <div className="min-h-screen py-8 px-6 sm:px-12 max-w-screen-2xl mx-auto">
      {/* Navbar / Header */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[var(--text-main)] rounded-lg flex items-center justify-center transition-colors">
            <div className="w-4 h-4 bg-[var(--bg-main)] rotate-45 transition-colors"></div>
          </div>
          <span className="text-xl font-bold tracking-tight">PixelFlex <span className="opacity-40">Pro</span></span>
        </div>
        <div className="flex items-center space-x-4 md:space-x-8">
          <nav className="hidden md:flex space-x-8 text-sm font-medium opacity-50">
            <a href="#" className="opacity-100">Dashboard</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Queue</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Assets</a>
          </nav>
          
          <div className="flex items-center space-x-3 border-l border-[var(--border-subtle)] pl-4 md:pl-8">
             <button 
               onClick={toggleTheme}
               className="p-2 rounded-full hover:bg-[var(--panel-hover)] transition-colors"
               aria-label="Toggle theme"
             >
               {theme === 'dark' ? (
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
               ) : (
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
               )}
             </button>
             <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500 border border-[var(--border-subtle)]"></div>
          </div>
        </div>
      </header>

      <main>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Balance Style Info Panel */}
            <div className="glass-panel p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xs font-semibold opacity-40 uppercase tracking-widest mb-1">Queue Overview</h4>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-bold">{files.length}</span>
                    <span className="text-sm font-medium text-emerald-400">Assets Loaded</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-[var(--border-subtle)] px-3 py-1 rounded-full text-[10px] font-bold opacity-60">
                  <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></div>
                  <span>{isProcessing ? 'PROCESSING' : 'SYSTEM READY'}</span>
                </div>
              </div>
              
              <div className="p-4 bg-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)] mono text-[11px] leading-relaxed opacity-70">
                {description ? `> ${description.toUpperCase()}` : "> READY FOR ASSET TRANSFORMATION. AWAITING INPUT DATA..."}
              </div>
            </div>

            {/* Queue List Area */}
            {files.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-sm font-semibold opacity-40 uppercase tracking-widest">Active Assets</h3>
                  <div className="flex space-x-3">
                    {allCompleted && (
                      <button onClick={downloadAllAsZip} className="btn-primary text-[11px] py-1.5 px-4 uppercase tracking-tighter">Export All (ZIP)</button>
                    )}
                    <button onClick={clearAll} className="text-[11px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase">Clear Queue</button>
                  </div>
                </div>

                <div className="space-y-3">
                  {files.map((file) => (
                    <div key={file.id} className="glass-panel p-4 flex items-center group hover:bg-[var(--panel-hover)] transition-colors">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--input-bg)] flex-shrink-0">
                        <img src={file.convertedUrl || file.previewUrl} alt="prev" className="w-full h-full object-cover" />
                      </div>
                      <div className="ml-6 flex-grow min-w-0">
                        <h4 className="text-sm font-medium truncate">{file.file.name}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-[10px] mono opacity-30 uppercase">{file.metadata.width}x{file.metadata.height} PX</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            file.status === 'completed' ? 'text-emerald-500 bg-emerald-500/10' :
                            file.status === 'processing' ? 'text-amber-500 bg-amber-500/10' :
                            'opacity-20 bg-[var(--border-subtle)]'
                          }`}>
                            {file.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-4">
                        {file.status === 'completed' && file.convertedUrl && (
                          <a 
                            href={file.convertedUrl} 
                            download={`export-${file.file.name}`}
                            className="w-8 h-8 rounded-full border border-[var(--border-subtle)] flex items-center justify-center hover:bg-[var(--border-subtle)] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                          </a>
                        )}
                        <button onClick={() => removeFile(file.id)} className="opacity-10 hover:opacity-100 hover:text-red-400 transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uploader Section */}
            <div className={files.length > 0 ? 'opacity-60 hover:opacity-100 transition-opacity' : ''}>
              <Uploader onFilesSelect={handleFilesSelect} />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <OptionsPanel 
              options={options} 
              setOptions={setOptions} 
              onStart={startConversion}
              isLoading={isProcessing}
            />

            <div className="glass-panel p-6">
              <h4 className="text-xs font-semibold opacity-40 uppercase tracking-widest mb-4">Total Efficiency</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-60">Processing Speed</span>
                  <span className="font-bold text-emerald-500">High</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-60">AI Verification</span>
                  <span className="font-bold">Active</span>
                </div>
                <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-between items-baseline">
                  <span className="text-2xl font-bold">100<span className="opacity-20 text-sm ml-1">%</span></span>
                  <span className="text-xs opacity-40 uppercase font-medium">Local Privacy</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="mt-20 py-8 border-t border-[var(--border-subtle)] flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 opacity-20">
        <p className="text-[10px] mono uppercase tracking-widest">
          PIXELFLEX ENGINE V4.0 // DEPLOYED ON LOCAL CANVAS
        </p>
        <div className="flex space-x-6 text-[10px] mono uppercase">
          <a href="#" className="hover:opacity-100 transition-colors">Privacy</a>
          <a href="#" className="hover:opacity-100 transition-colors">Terms</a>
          <a href="#" className="hover:opacity-100 transition-colors">Docs</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
