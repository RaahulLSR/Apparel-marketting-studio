
import React, { useState } from 'react';
import { Order, OrderStatus, Brand, Attachment } from '../types';
import JSZip from 'jszip';

interface Props {
  orders: Order[];
  updateStatus: (id: string, status: OrderStatus, notes?: string, files?: File[]) => void;
  brands: Brand[];
}

const AdminDashboard: React.FC<Props> = ({ orders, updateStatus, brands }) => {
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const filteredOrders = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  const handleUpdate = async (status: OrderStatus) => {
    if (!selectedOrder) return;
    setIsUploading(true);
    await updateStatus(selectedOrder.id, status, adminNotes, selectedFiles);
    setSelectedOrder(null);
    setAdminNotes('');
    setSelectedFiles([]);
    setIsUploading(false);
  };

  const handleBulkDownload = async () => {
    if (!selectedOrder) return;
    const brand = getBrandInfo(selectedOrder.brandId);
    if (!brand) return;

    setIsDownloading(true);
    const zip = new JSZip();
    const folderName = `${selectedOrder.title.replace(/\s+/g, '_')}_Assets`;
    const folder = zip.folder(folderName);

    const assetPromises: Promise<void>[] = [];

    // Helper to fetch and add to zip
    const addToZip = async (url: string, name: string, subfolder: string) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        folder?.folder(subfolder)?.file(name, blob);
      } catch (err) {
        console.error(`Failed to download ${name}:`, err);
      }
    };

    // 1. Add Order Attachments (Briefs & Documents)
    selectedOrder.resultFiles?.forEach((file, index) => {
      const category = file.type === 'result' ? 'Admin_Results' : 'Customer_Briefs';
      assetPromises.push(addToZip(file.url, file.name || `file_${index}`, category));
    });

    // 2. Add Brand Reference Assets
    brand.referenceAssets?.forEach((url, index) => {
      const fileName = url.split('/').pop() || `brand_asset_${index}`;
      assetPromises.push(addToZip(url, fileName, 'Brand_Identity_Assets'));
    });

    // 3. Add Brand Logo if exists
    if (brand.logoUrl) {
      assetPromises.push(addToZip(brand.logoUrl, 'brand_logo', 'Brand_Identity_Assets'));
    }

    try {
      await Promise.all(assetPromises);
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${folderName}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('ZIP generation failed:', err);
      alert('Failed to generate ZIP. Some files might be inaccessible.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const getBrandInfo = (brandId: string) => brands.find(b => String(b.id) === String(brandId));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Control Center</h1>
          <p className="text-gray-500">Oversee and execute active creative orders across all brands.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {(['ALL', ...Object.values(OrderStatus)] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order / Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map(order => {
                const brand = getBrandInfo(order.brandId);
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{order.title}</span>
                        <span className="text-xs text-indigo-600 font-medium">{brand?.name || 'Unknown Brand'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                        order.status === OrderStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' :
                        order.status === OrderStatus.AWAITING_FEEDBACK ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => {
                          setSelectedOrder(order);
                          setAdminNotes(order.adminNotes || '');
                        }}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-md"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8 animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedOrder.title}</h2>
                <p className="text-sm text-indigo-600 font-semibold">{getBrandInfo(selectedOrder.brandId)?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleBulkDownload}
                  disabled={isDownloading}
                  className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all disabled:opacity-50"
                >
                  {isDownloading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent mr-2"></div>
                  ) : (
                    <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  )}
                  {isDownloading ? 'Bundling Assets...' : 'Download All Assets (.zip)'}
                </button>
                <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 max-h-[75vh] overflow-y-auto">
              {/* LEFT: Brief & Assets */}
              <div className="md:col-span-1 space-y-6">
                <section>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Creative Brief</h4>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-800 leading-relaxed">{selectedOrder.description}</p>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Expectations:</p>
                      <p className="text-xs text-gray-600 italic">{selectedOrder.creativeExpectations}</p>
                    </div>
                  </div>
                </section>
                
                <section>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Order Specs</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <span className="block text-[9px] font-bold text-gray-400 uppercase">Colors</span>
                      <span className="text-xs font-medium text-gray-900 truncate block">{selectedOrder.colors}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <span className="block text-[9px] font-bold text-gray-400 uppercase">Target</span>
                      <span className="text-xs font-medium text-gray-900 truncate block">{selectedOrder.targetAudience}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Brief Attachments</h4>
                  <div className="space-y-2">
                    {selectedOrder.resultFiles?.filter(f => f.type === 'document').map(file => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-indigo-50/50 rounded-lg border border-indigo-100 text-[11px]">
                        <span className="font-medium text-indigo-900 truncate mr-2">{file.name}</span>
                        <a href={file.url} target="_blank" className="text-indigo-600 font-bold hover:underline shrink-0">View</a>
                      </div>
                    ))}
                    {!selectedOrder.resultFiles?.some(f => f.type === 'document') && <p className="text-xs text-gray-400">No brief assets provided.</p>}
                  </div>
                </section>
              </div>

              {/* CENTER: Brand Identity */}
              <div className="md:col-span-1 space-y-6 border-l border-r border-gray-100 px-4">
                {(() => {
                  const brand = getBrandInfo(selectedOrder.brandId);
                  if (!brand) return <div className="text-gray-400 text-sm italic">Brand data not available.</div>;
                  return (
                    <>
                      <section>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Brand Identity</h4>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                            {brand.logoUrl ? (
                              <img src={brand.logoUrl} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl font-bold text-gray-300">{brand.name[0]}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{brand.name}</p>
                            <p className="text-[10px] text-gray-500 italic truncate w-40">{brand.tagline}</p>
                          </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                          <p className="text-xs text-gray-600 leading-relaxed mb-4">{brand.description}</p>
                          <div className="space-y-3">
                            <div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase mb-2">Color Palette</p>
                              <div className="flex gap-2">
                                {brand.colorPalette.map((color, i) => (
                                  <div key={i} className="group relative">
                                    <div className="w-8 h-8 rounded-full border border-gray-200 shadow-inner" style={{ backgroundColor: color }} />
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] bg-gray-800 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">{color}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Reference Assets</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {brand.referenceAssets?.map((url, i) => (
                            <a 
                              key={i} 
                              href={url} 
                              target="_blank" 
                              className="block aspect-square bg-gray-50 rounded-lg border border-gray-200 overflow-hidden group relative hover:border-indigo-300 transition-all"
                            >
                              <img src={url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </div>
                            </a>
                          ))}
                          {(!brand.referenceAssets || brand.referenceAssets.length === 0) && (
                            <p className="text-[10px] text-gray-400 italic col-span-2">No references uploaded for this brand.</p>
                          )}
                        </div>
                      </section>
                    </>
                  );
                })()}
              </div>

              {/* RIGHT: Workflow & Upload */}
              <div className="md:col-span-1 space-y-6">
                <section>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Admin Workflow</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                      <div className="flex flex-wrap gap-2">
                        {[OrderStatus.IN_PROGRESS, OrderStatus.AWAITING_FEEDBACK].map(status => (
                          <button 
                            key={status}
                            onClick={() => handleUpdate(status)} 
                            className={`px-3 py-2 text-xs rounded-lg font-bold border transition-all ${selectedOrder.status === status ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
                          >
                            {status === OrderStatus.IN_PROGRESS ? 'Start Work' : 'Send for Review'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Internal / Customer Notes</label>
                      <textarea 
                        value={adminNotes} 
                        onChange={(e) => setAdminNotes(e.target.value)} 
                        placeholder="Log work or add notes for the customer..." 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 min-h-[120px] transition-all" 
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-[10px] text-gray-400 mb-3 uppercase font-bold tracking-widest">Upload Result Assets</p>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors group relative cursor-pointer">
                        <input 
                          type="file" 
                          multiple 
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleFileChange} 
                        />
                        <div className="text-center pointer-events-none">
                          <svg className="mx-auto h-8 w-8 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span className="mt-2 block text-[10px] font-bold text-gray-400 uppercase group-hover:text-indigo-600 transition-colors">Select Final Files</span>
                        </div>
                      </div>
                      {selectedFiles.length > 0 && (
                        <div className="mt-3 space-y-1.5 animate-in slide-in-from-top-2">
                          {selectedFiles.map((f, i) => (
                            <div key={i} className="text-[10px] text-gray-500 bg-gray-50 p-2 rounded flex justify-between items-center border border-gray-100">
                              <span className="truncate w-40">{f.name}</span>
                              <button onClick={(e) => { e.stopPropagation(); setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i)); }} className="text-red-500 hover:text-red-700 font-bold ml-2">Remove</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex justify-end gap-3">
              <button onClick={() => setSelectedOrder(null)} className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
              <button 
                onClick={() => handleUpdate(selectedOrder.status)} 
                disabled={isUploading} 
                className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all transform active:scale-95 flex items-center"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Uploading...
                  </>
                ) : 'Confirm Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
