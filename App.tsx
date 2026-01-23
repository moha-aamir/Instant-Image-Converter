
import React, { useState } from 'react';
import JSZip from 'jszip';
import { ImageFile, ConversionOptions, ImageFormat } from './types';
import { getImageMetadata, convertImage } from './services/imageProcessor';
import { analyzeImageAI, enhanceImageAI } from './services/geminiService';
import Uploader from './components/Uploader';
import OptionsPanel from './components/OptionsPanel';

const App: React.FC = () => {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [options, setOptions] = useState<ConversionOptions>({
    format: ImageFormat.PNG,
    quality: 90,
    maintainAspectRatio: true,
    aiEnhance: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [description, setDescription] = useState<string>("");

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
        console.error("Failed to load image metadata", e);
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
      const fileName = file.file.name.split('.')[0];
      const extension = options.format.split('/')[1].replace('jpeg', 'jpg').replace('svg+xml', 'svg');
      const fullName = `${fileName}.${extension}`;
      const response = await fetch(file.convertedUrl);
      const blob = await response.blob();
      zip.file(fullName, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `pixelflex-converted-${Date.now()}.zip`;
    link.click();
  };

  const allCompleted = files.length > 0 && files.every(f => f.status === 'completed');

  return (
    <div className="min-h-screen flex flex-col p-6 sm:p-12 max-w-7xl mx-auto w-full">
      <main className="flex-grow w-full pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            
            {/* Info Box */}
            <div className="info-box p-4 sm:p-5 flex items-start space-x-4 bg-white">
              <div className="flex-shrink-0 w-6 h-6 rounded-full border border-black flex items-center justify-center text-[10px] font-black">
                i
              </div>
              <div className="mono text-[11px] font-bold uppercase tracking-tight leading-relaxed">
                {description ? description : (
                  files.length === 0 
                  ? "SYSTEM READY. UPLOAD ASSETS TO BEGIN HIGH-FIDELITY TRANSFORMATION."
                  : "QUEUE ACTIVE. CONVERSION CONFIGURATION READY FOR EXECUTION."
                )}
              </div>
            </div>

            {files.length === 0 ? (
              <Uploader onFilesSelect={handleFilesSelect} />
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b-4 border-black pb-2">
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">Queue [{files.length}]</h2>
                  <div className="flex items-center space-x-4">
                    {allCompleted && (
                      <button 
                        onClick={downloadAllAsZip}
                        className="brutalist-button bg-black text-white px-3 py-1 text-[10px] flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export ZIP
                      </button>
                    )}
                    <button 
                      onClick={clearAll} 
                      className="brutalist-button bg-red-500 text-white px-3 py-1 text-[10px] font-black uppercase"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {files.map((file) => (
                    <div key={file.id} className="brutalist-card p-4 flex items-center space-x-6">
                      <div className="w-20 h-20 border-2 border-black bg-slate-50 relative group flex-shrink-0">
                        <img 
                          src={file.convertedUrl || file.previewUrl} 
                          alt="preview" 
                          className="w-full h-full object-cover"
                        />
                        {file.status === 'processing' && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-black uppercase truncate pr-4">{file.file.name}</h4>
                          <button onClick={() => removeFile(file.id)} className="hover:text-red-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="mono text-[9px] font-bold uppercase text-slate-500 mt-2 space-x-3 flex flex-wrap">
                          <span className="bg-slate-100 px-1 border border-black/10">{file.metadata.width}x{file.metadata.height}PX</span>
                          <span className={`px-1 border border-black/10 ${
                            file.status === 'completed' ? 'bg-green-400 text-black' : 
                            file.status === 'error' ? 'bg-red-500 text-white' : 
                            'bg-slate-200'
                          }`}>
                            {file.status}
                          </span>
                        </div>
                        {file.status === 'completed' && file.convertedUrl && (
                          <div className="mt-4">
                            <a 
                              href={file.convertedUrl} 
                              download={`converted-${file.file.name.split('.')[0]}.${options.format.split('/')[1].replace('svg+xml', 'svg')}`}
                              className="brutalist-button bg-black text-white px-3 py-1 text-[10px] inline-flex items-center"
                            >
                              Download
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-8">
                  <Uploader onFilesSelect={handleFilesSelect} />
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 sticky top-12">
            <OptionsPanel 
              options={options} 
              setOptions={setOptions} 
              onStart={startConversion}
              isLoading={isProcessing}
            />
            
            <div className="mt-8 brutalist-card bg-[#CADED5] p-6">
              <h4 className="font-black uppercase text-sm mb-2">Technical Info</h4>
              <p className="mono text-[11px] font-bold uppercase text-slate-700 leading-relaxed mb-4">
                All conversions are processed locally using your browser's hardware acceleration.
              </p>
              <div className="w-full border border-black/10 bg-white/50 p-2 text-center text-[10px] mono font-bold uppercase">
                Privacy Protected • Local First
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-24 pt-10 border-t-2 border-black/10">
        <div className="text-center">
          <p className="mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
            PIXELFLEX ENGINE • POWERED BY LOCAL BROWSER CANVAS API • 2025
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
