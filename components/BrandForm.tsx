
import React, { useState } from 'react';
import { Brand } from '../types';

interface Props {
  onClose: () => void;
  onSubmit: (brand: Partial<Brand>) => void;
  customerId: string;
}

const BrandForm: React.FC<Props> = ({ onClose, onSubmit, customerId }) => {
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    isPrimary: false,
    color1: '#4f46e5',
    color2: '#10b981'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBrand: Partial<Brand> = {
      customerId,
      name: formData.name,
      tagline: formData.tagline,
      description: formData.description,
      isPrimary: formData.isPrimary,
      colorPalette: [formData.color1, formData.color2],
    };
    onSubmit(newBrand);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Add New Brand Identity</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
            <input 
              required
              type="text"
              placeholder="e.g., Zenith Activewear"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline / Slogan</label>
            <input 
              type="text"
              placeholder="The soul of movement..."
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              value={formData.tagline}
              onChange={(e) => setFormData({...formData, tagline: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              required
              rows={3}
              placeholder="Who is this brand for? What is the core aesthetic?"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Primary Color</label>
              <input 
                type="color"
                className="w-full h-10 p-1 bg-white border border-gray-200 rounded cursor-pointer"
                value={formData.color1}
                onChange={(e) => setFormData({...formData, color1: e.target.value})}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Accent Color</label>
              <input 
                type="color"
                className="w-full h-10 p-1 bg-white border border-gray-200 rounded cursor-pointer"
                value={formData.color2}
                onChange={(e) => setFormData({...formData, color2: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input 
              type="checkbox"
              id="isPrimary"
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              checked={formData.isPrimary}
              onChange={(e) => setFormData({...formData, isPrimary: e.target.checked})}
            />
            <label htmlFor="isPrimary" className="ml-2 text-sm text-gray-700">Set as Primary Brand</label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all"
            >
              Create Brand
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandForm;
