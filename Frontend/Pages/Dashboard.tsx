import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout, updateTokens } from '../store/authSlice';
import { 
  ModelGender, ModelEthnicity, SettingType, LightingStyle, 
  ProductCategory, MockupConfig, GenerationResult 
} from '../types';
import { generateMockup } from '../geminiService';
import { compressImage } from '../imageUtils';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  
  // Pull SaaS data & secure token from Redux
  const { tokensAvailable, email, token } = useSelector((state: RootState) => state.auth);

  // Local State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const [config, setConfig] = useState<MockupConfig>({
    gender: ModelGender.FEMALE,
    ethnicity: ModelEthnicity.CAUCASIAN,
    setting: SettingType.STUDIO,
    lighting: LightingStyle.SOFT,
    category: ProductCategory.UPPER_BODY,
    age: '25'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null); // Reset result when new image is uploaded
    }
  };

  const updateConfig = (key: keyof MockupConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    // 1. Frontend Token Gate
    if (tokensAvailable <= 0) {
      setError("Out of tokens! Please purchase more credits to continue.");
      return;
    }

    if (!previewUrl || !selectedFile) {
      setError("Please upload a product image first.");
      return;
    }

    if (!token) {
      setError("Authentication error. Please log in again.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // 2. Compress the image locally
      const compressedBase64 = await compressImage(selectedFile, 512);
      
      // 3. Send data securely to the Node.js backend
      // Prompt building is now handled completely on the server
      const { imageUrl, tokensRemaining } = await generateMockup(
        compressedBase64, 
        config, 
        token
      );
      
      // 4. Update the Canvas
      setResult({ imageUrl, timestamp: Date.now() });
      
      // 5. Update Redux with the exact token count verified by the database
      dispatch(updateTokens(tokensRemaining));

    } catch (err: any) {
      setError(err.message || "Failed to generate mockup.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadMockup = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.imageUrl;
    link.download = `vogue-mockup-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      {/* SaaS Navbar */}
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white w-8 h-8 flex items-center justify-center rounded-lg">
            <i className="fa-solid fa-layer-group text-sm"></i>
          </div>
          <span className="font-bold tracking-tight text-xl">Vogue<span className="font-light text-slate-500">AI</span></span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 shadow-inner">
            <i className="fa-solid fa-bolt text-yellow-500 mr-2"></i>
            <span className="text-sm font-bold text-slate-700">{tokensAvailable} Credits</span>
            {tokensAvailable < 3 && (
              <button className="ml-3 text-[10px] bg-black text-white px-2 py-1 rounded-full uppercase font-bold tracking-wider hover:bg-indigo-600 transition-colors">
                Refill
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
            <span className="text-xs font-medium text-slate-500 hidden md:block">{email}</span>
            <button 
              onClick={() => dispatch(logout())}
              className="text-slate-400 hover:text-red-500 transition-colors"
              title="Log out"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT SIDEBAR: CONTROLS --- */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* 1. Upload Section */}
          <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 group">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">01. Source Asset</h3>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-square rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden relative ${
                previewUrl ? 'border-slate-200 bg-slate-50' : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50'
              }`}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} className="w-full h-full object-contain p-2" alt="Source" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Change Image</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  </div>
                  <p className="text-xs font-bold text-slate-600">Upload Product</p>
                  <p className="text-[10px] text-slate-400 mt-1">PNG, WEBP, JPG</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange} 
              />
            </div>
          </section>

          {/* 2. Product Context */}
          <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">02. Context</h3>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Category</label>
              <select 
                value={config.category}
                onChange={(e) => updateConfig('category', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                {Object.values(ProductCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </section>

          {/* 3. Model & Scene Details */}
          <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">03. Model & Scene</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Ethnicity</label>
                    <select 
                      value={config.ethnicity}
                      onChange={(e) => updateConfig('ethnicity', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500"
                    >
                      {Object.values(ModelEthnicity).map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Gender</label>
                    <select 
                      value={config.gender}
                      onChange={(e) => updateConfig('gender', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500"
                    >
                      {Object.values(ModelGender).map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                 </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-bold text-slate-600">Model Age</label>
                  <span className="text-xs text-slate-400">{config.age} years</span>
                </div>
                <input 
                  type="range" 
                  min="18" max="65" 
                  value={config.age}
                  onChange={(e) => updateConfig('age', e.target.value)}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="border-t border-slate-100 my-4"></div>

              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Setting</label>
                    <select 
                      value={config.setting}
                      onChange={(e) => updateConfig('setting', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500"
                    >
                      {Object.values(SettingType).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Lighting</label>
                    <select 
                      value={config.lighting}
                      onChange={(e) => updateConfig('lighting', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500"
                    >
                      {Object.values(LightingStyle).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                 </div>
              </div>
            </div>
          </section>

          {/* Dynamic Generation Button */}
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !previewUrl || tokensAvailable <= 0}
            className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg ${
              tokensAvailable <= 0 
                ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-red-500/30 transform hover:scale-[1.02]'
                : isGenerating || !previewUrl 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-black text-white hover:bg-indigo-600 hover:shadow-indigo-500/30 transform active:scale-[0.98]'
            }`}
          >
            {tokensAvailable <= 0 ? (
              <span><i className="fa-solid fa-lock mr-2"></i> OUT OF CREDITS</span>
            ) : isGenerating ? (
              <span><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> RENDERING...</span>
            ) : (
              <span><i className="fa-solid fa-wand-magic-sparkles mr-2"></i> GENERATE (1 Credit)</span>
            )}
          </button>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-start">
               <i className="fa-solid fa-triangle-exclamation mr-2 mt-0.5"></i> {error}
            </div>
          )}
        </div>

        {/* --- RIGHT PANEL: CANVAS --- */}
        <div className="lg:col-span-9 flex flex-col h-full">
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col relative min-h-[600px]">
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Render Canvas</h2>
                <p className="text-xs text-slate-400 font-medium">Output Resolution: High Fidelity • Engine: Gemini 2.5</p>
              </div>
              {result && (
                <button 
                  onClick={downloadMockup}
                  className="bg-black text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-slate-800 transition-all flex items-center shadow-lg shadow-black/10"
                >
                  <i className="fa-solid fa-download mr-2"></i> EXPORT
                </button>
              )}
            </div>

            <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 relative overflow-hidden flex items-center justify-center">
              {isGenerating ? (
                <div className="flex flex-col items-center animate-pulse">
                   <div className="w-20 h-20 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                   <p className="text-sm font-bold text-slate-800">Constructing Scene...</p>
                   <p className="text-xs text-slate-500 mt-1">Applying lighting & textures</p>
                </div>
              ) : result ? (
                <div className="w-full h-full p-4 animate-in fade-in zoom-in duration-500">
                  <img 
                    src={result.imageUrl} 
                    alt="Generated Mockup" 
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </div>
              ) : (
                <div className="text-center opacity-40">
                  <i className="fa-solid fa-image text-6xl text-slate-300 mb-4"></i>
                  <p className="text-sm font-medium text-slate-500">Waiting for input...</p>
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-4 gap-4 border-t border-slate-100 pt-6">
              <div className="text-center">
                 <p className="text-[10px] uppercase font-bold text-slate-400">Target Focus</p>
                 <p className="text-xs font-bold text-slate-700 mt-1">
                   {config.category === ProductCategory.FOOTWEAR ? "Legs & Feet" : "Standard"}
                 </p>
              </div>
              <div className="text-center border-l border-slate-100">
                 <p className="text-[10px] uppercase font-bold text-slate-400">Model</p>
                 <p className="text-xs font-bold text-slate-700 mt-1">{config.gender} • {config.ethnicity}</p>
              </div>
              <div className="text-center border-l border-slate-100">
                 <p className="text-[10px] uppercase font-bold text-slate-400">Environment</p>
                 <p className="text-xs font-bold text-slate-700 mt-1">{config.setting}</p>
              </div>
               <div className="text-center border-l border-slate-100">
                 <p className="text-[10px] uppercase font-bold text-slate-400">Lighting</p>
                 <p className="text-xs font-bold text-slate-700 mt-1">{config.lighting}</p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;