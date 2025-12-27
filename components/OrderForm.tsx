
import React, { useState } from 'react';
import { Brand, Order, OrderStatus } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  onClose: () => void;
  onSubmit: (order: Partial<Order> & { files?: File[] }) => void;
  brands: Brand[];
  customerId: string;
}

const OrderForm: React.FC<Props> = ({ onClose, onSubmit, brands, customerId }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [formData, setFormData] = useState({
    brandId: brands[0]?.id || '',
    title: '',
    description: '',
    creativeExpectations: '',
    colors: '',
    sizes: '',
    features: '',
    targetAudience: '',
    usage: '',
    notes: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleAiAssist = async () => {
    if (!formData.title) {
      alert("Please enter an Order Title first to help the AI understand your concept.");
      return;
    }

    setIsAiGenerating(true);
    try {
      // Accessing process.env.API_KEY directly as per environment injection rules
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `You are a professional apparel creative director. Based on the title "${formData.title}", generate a detailed apparel description and specific creative expectations for a marketing campaign. Return only a JSON object with "description" and "expectations" keys.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text || '{}');
      setFormData(prev => ({
        ...prev,
        description: result.description || prev.description,
        creativeExpectations: result.expectations || prev.creativeExpectations
      }));
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("AI Assistant failed to generate a brief. Please try again.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder = {
      ...formData,
      customerId,
      status: OrderStatus.PENDING,
      files: selectedFiles
    };
    onSubmit(newOrder);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col scale-in-center animate-in zoom-in-95">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">Start New Creative Project</h2>
            <p className="text-sm text-slate-500">Provide the details for your next apparel campaign.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Target Brand</label>
              <select 
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                value={formData.brandId}
                onChange={(e) => setFormData({...formData, brandId: e.target.value})}
              >
                <option value="">Select a brand...</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Project Title</label>
              <input 
                required
                type="text"
                placeholder="e.g., Summer Flux Collection Launch"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
          </div>

          {/* AI Brief Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">The Creative Brief</label>
              <button 
                type="button" 
                onClick={handleAiAssist}
                disabled={isAiGenerating}
                className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full transition-all border border-indigo-100 disabled:opacity-50"
              >
                {isAiGenerating ? (
                  <div className="animate-spin h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full" />
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3l1 4h4l-3 3 1 4-3-3-3 3 1-4-3-3h4l1-4z" /></svg>
                )}
                {isAiGenerating ? "Generating..." : "AI Assistant Magic"}
              </button>
            </div>
            <div className="space-y-4">
              <textarea 
                required
                rows={4}
                placeholder="Describe the items (type, material, fit, purpose)..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <textarea 
                rows={3}
                placeholder="Creative expectations (Vibe, mood, specific shots needed)..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                value={formData.creativeExpectations}
                onChange={(e) => setFormData({...formData, creativeExpectations: e.target.value})}
              />
            </div>
          </div>

          {/* Asset Upload */}
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:border-indigo-400 transition-colors group cursor-pointer relative bg-slate-50/50">
            <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="text-center pointer-events-none">
              <div className="bg-white w-12 h-12 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-slate-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <p className="text-sm font-semibold text-slate-600">Drop brief assets or click to upload</p>
              <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 25MB</p>
              {selectedFiles.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {selectedFiles.map((f, i) => (
                    <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded uppercase truncate max-w-[120px]">{f.name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Colors</label>
                <input type="text" className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={formData.colors} onChange={(e) => setFormData({...formData, colors: e.target.value})} placeholder="e.g. Pantone 19-4052, White" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sizes</label>
                <input type="text" className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={formData.sizes} onChange={(e) => setFormData({...formData, sizes: e.target.value})} placeholder="S, M, L, XL" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Audience</label>
                <input type="text" className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={formData.targetAudience} onChange={(e) => setFormData({...formData, targetAudience: e.target.value})} placeholder="Gen Z, Urban Active" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Usage</label>
                <input type="text" className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={formData.usage} onChange={(e) => setFormData({...formData, usage: e.target.value})} placeholder="Instagram, Web Store" />
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Discard</button>
          <button type="submit" onClick={handleSubmit} className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">Submit Brief</button>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
