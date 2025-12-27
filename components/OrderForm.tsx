
import React, { useState } from 'react';
import { Brand, Order, OrderStatus } from '../types';

interface Props {
  onClose: () => void;
  onSubmit: (order: Partial<Order> & { files?: File[] }) => void;
  brands: Brand[];
  customerId: string;
}

const OrderForm: React.FC<Props> = ({ onClose, onSubmit, brands, customerId }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Create New Order</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Brand</label>
              <select 
                required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                value={formData.brandId}
                onChange={(e) => setFormData({...formData, brandId: e.target.value})}
              >
                <option value="">Select a brand...</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Title</label>
              <input 
                required
                type="text"
                placeholder="e.g., Winter Jackets Social Assets"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apparel Description</label>
            <textarea 
              required
              rows={3}
              placeholder="Describe the items (type, material, fit, purpose)..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Brief / References (PDF, Images)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Upload files</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} accept="image/*,.pdf" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB each</p>
                {selectedFiles.length > 0 && (
                  <div className="mt-2 text-sm text-indigo-600 font-semibold">
                    {selectedFiles.length} file(s) selected
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-widest">Essential Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Colors</label>
                <input 
                  type="text" 
                  className="w-full p-2 bg-white border border-indigo-100 rounded text-sm"
                  value={formData.colors}
                  onChange={(e) => setFormData({...formData, colors: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Sizes</label>
                <input 
                  type="text" 
                  className="w-full p-2 bg-white border border-indigo-100 rounded text-sm"
                  value={formData.sizes}
                  onChange={(e) => setFormData({...formData, sizes: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Target Audience</label>
                <input 
                  type="text" 
                  className="w-full p-2 bg-white border border-indigo-100 rounded text-sm"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800">Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all">Submit Order</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
