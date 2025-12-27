
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

  // Statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
    active: orders.filter(o => [OrderStatus.IN_PROGRESS, OrderStatus.REVISIONS_REQUESTED].includes(o.status)).length,
    completed: orders.filter(o => o.status === OrderStatus.COMPLETED).length
  };

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
    const folderName = `${selectedOrder.title.replace(/\s+/g, '_')}_Bundle`;
    const folder = zip.folder(folderName);

    const assetPromises: Promise<void>[] = [];

    const addToZip = async (url: string, name: string, subfolder: string) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        folder?.folder(subfolder)?.file(name, blob);
      } catch (err) {
        console.error(`Failed to download ${name}:`, err);
      }
    };

    selectedOrder.resultFiles?.forEach((file, index) => {
      const category = file.type === 'result' ? 'Admin_Finals' : 'Client_Briefs';
      assetPromises.push(addToZip(file.url, file.name || `file_${index}`, category));
    });

    brand.referenceAssets?.forEach((url, index) => {
      const fileName = url.split('/').pop() || `ref_${index}`;
      assetPromises.push(addToZip(url, fileName, 'Brand_Identity'));
    });

    if (brand.logoUrl) {
      assetPromises.push(addToZip(brand.logoUrl, 'logo', 'Brand_Identity'));
    }

    try {
      await Promise.all(assetPromises);
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${folderName}.zip`;
      link.click();
    } catch (err) {
      console.error('ZIP generation failed:', err);
      alert('Asset bundling failed.');
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

  const getStatusStyle = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case OrderStatus.IN_PROGRESS: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case OrderStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case OrderStatus.REVISIONS_REQUESTED: return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: stats.total, color: 'text-slate-900', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2' },
          { label: 'Pending Queue', value: stats.pending, color: 'text-amber-600', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'In Production', value: stats.active, color: 'text-indigo-600', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
          { label: 'Completed', value: stats.completed, color: 'text-emerald-600', icon: 'M5 13l4 4L19 7' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
              <svg className={`w-4 h-4 ${stat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
            </div>
            <p className={`text-2xl font-bold font-heading ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading">Production Hub</h1>
          <p className="text-sm text-slate-500">Manage creative execution for all brand partners.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          {(['ALL', ...Object.values(OrderStatus)] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {f === 'ALL' ? 'Show All' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Details</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deadline (Rel)</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredOrders.map(order => {
              const brand = getBrandInfo(order.brandId);
              return (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-sm group-hover:scale-110 transition-transform">
                        {brand?.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{order.title}</div>
                        <div className="text-xs text-indigo-600 font-medium uppercase tracking-tight">{brand?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => { setSelectedOrder(order); setAdminNotes(order.adminNotes || ''); }}
                      className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-xl transition-all hover:shadow-sm"
                    >
                      Manage Project
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 text-sm italic font-medium">No orders found matching this status.</p>
          </div>
        )}
      </div>

      {/* Order Management Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full my-8 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
                  {getBrandInfo(selectedOrder.brandId)?.name[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 font-heading leading-tight">{selectedOrder.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-indigo-600 font-bold uppercase tracking-tight">{getBrandInfo(selectedOrder.brandId)?.name}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-400 font-medium tracking-tight">Project ID: #{selectedOrder.id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleBulkDownload}
                  disabled={isDownloading}
                  className="flex items-center px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  {isDownloading ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-indigo-500 border-t-transparent mr-2"></div> : <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                  {isDownloading ? 'Packaging...' : 'Download All Assets'}
                </button>
                <button onClick={() => setSelectedOrder(null)} className="p-2.5 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 rounded-full">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* LEFT: Project Brief */}
              <div className="lg:col-span-4 space-y-8">
                <section>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Project Briefing</label>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 shadow-inner">
                    <p className="text-sm text-slate-800 leading-relaxed font-medium">{selectedOrder.description}</p>
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Success Criteria</p>
                      <p className="text-sm text-slate-600 italic leading-snug">"{selectedOrder.creativeExpectations}"</p>
                    </div>
                  </div>
                </section>

                <section>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Technical Specs</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { l: 'Colors', v: selectedOrder.colors },
                      { l: 'Target', v: selectedOrder.targetAudience },
                      { l: 'Usage', v: selectedOrder.usage },
                      { l: 'Sizes', v: selectedOrder.sizes }
                    ].map((spec, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{spec.l}</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{spec.v || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Input Documents</label>
                  <div className="space-y-2">
                    {selectedOrder.resultFiles?.filter(f => f.type === 'document').map(file => (
                      <a key={file.id} href={file.url} target="_blank" className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 text-xs font-bold text-indigo-600 hover:border-indigo-200 transition-all hover:shadow-sm">
                        <span className="truncate mr-2 text-slate-700">{file.name}</span>
                        <span className="shrink-0 uppercase tracking-tighter">View File</span>
                      </a>
                    ))}
                    {!selectedOrder.resultFiles?.some(f => f.type === 'document') && <p className="text-xs text-slate-400 italic font-medium">No files provided by client.</p>}
                  </div>
                </section>
              </div>

              {/* CENTER: Brand Identity Context */}
              <div className="lg:col-span-4 space-y-8 px-2">
                {(() => {
                  const brand = getBrandInfo(selectedOrder.brandId);
                  if (!brand) return null;
                  return (
                    <>
                      <section>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Brand Context</label>
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">{brand.description}</p>
                          <div className="flex gap-2.5 pt-2">
                            {brand.colorPalette.map((color, i) => (
                              <div key={i} className="group relative">
                                <div className="w-9 h-9 rounded-full border border-slate-200 shadow-inner group-hover:scale-110 transition-transform cursor-help" style={{ backgroundColor: color }} />
                                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[8px] bg-slate-900 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-20 shadow-lg">{color}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                      <section>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Brand Style Guides</label>
                        <div className="grid grid-cols-2 gap-3">
                          {brand.referenceAssets?.map((url, i) => (
                            <a key={i} href={url} target="_blank" className="block aspect-square bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden group relative hover:border-indigo-400 transition-all">
                              <img src={url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          ))}
                        </div>
                      </section>
                    </>
                  );
                })()}
              </div>

              {/* RIGHT: Production & Delivery */}
              <div className="lg:col-span-4 space-y-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                <section>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Production Workflow</label>
                  <div className="space-y-6">
                    <div className="flex gap-2">
                      {[OrderStatus.IN_PROGRESS, OrderStatus.AWAITING_FEEDBACK].map(status => (
                        <button 
                          key={status}
                          onClick={() => handleUpdate(status)} 
                          className={`flex-1 px-4 py-3 text-[10px] rounded-xl font-bold uppercase tracking-widest transition-all shadow-sm ${selectedOrder.status === status ? 'bg-indigo-600 text-white border-indigo-600 scale-105 z-10' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-400'}`}
                        >
                          {status === OrderStatus.IN_PROGRESS ? 'Start Production' : 'Submit for Review'}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">Project Log / Message</label>
                      <textarea 
                        value={adminNotes} 
                        onChange={(e) => setAdminNotes(e.target.value)} 
                        placeholder="Detail your updates or ask client questions..." 
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[140px] shadow-sm resize-none" 
                      />
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <label className="block text-xs font-bold text-slate-700 mb-3">Deliver Final Assets</label>
                      <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:bg-white hover:border-indigo-400 transition-all group relative cursor-pointer bg-white/50">
                        <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                        <div className="text-center pointer-events-none">
                          <svg className="mx-auto h-10 w-10 text-slate-400 group-hover:text-indigo-600 transition-colors mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Click to Select Files</span>
                        </div>
                      </div>
                      {selectedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {selectedFiles.map((f, i) => (
                            <div key={i} className="text-[10px] text-slate-600 bg-white p-3 rounded-xl flex justify-between items-center border border-slate-100 shadow-sm animate-in slide-in-from-top-2">
                              <span className="truncate w-40 font-bold">{f.name}</span>
                              <button onClick={() => setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i))} className="text-rose-500 hover:text-rose-700 font-black">X</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 shrink-0 flex justify-end gap-3">
              <button onClick={() => setSelectedOrder(null)} className="px-8 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest">Close</button>
              <button 
                onClick={() => handleUpdate(selectedOrder.status)} 
                disabled={isUploading} 
                className="px-10 py-3 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 disabled:opacity-50 transition-all active:scale-95 uppercase tracking-widest flex items-center"
              >
                {isUploading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-3"></div> : null}
                {isUploading ? 'Updating Cloud...' : 'Commit Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
