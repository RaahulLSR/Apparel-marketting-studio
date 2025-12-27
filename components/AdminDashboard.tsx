
import React, { useState } from 'react';
import { Order, OrderStatus, Brand, Attachment } from '../types';

interface Props {
  orders: Order[];
  updateStatus: (id: string, status: OrderStatus, notes?: string, attachments?: Attachment[]) => void;
  brands: Brand[];
}

const AdminDashboard: React.FC<Props> = ({ orders, updateStatus, brands }) => {
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [tempFileUrl, setTempFileUrl] = useState('');

  const filteredOrders = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  const handleUpdate = (status: OrderStatus) => {
    if (!selectedOrder) return;
    updateStatus(selectedOrder.id, status, adminNotes);
    setSelectedOrder(null);
    setAdminNotes('');
  };

  const handleAddResult = () => {
    if (!selectedOrder || !tempFileUrl) return;
    const newAttachment: Attachment = {
      id: Math.random().toString(36).substr(2, 9),
      orderId: selectedOrder.id,
      name: `Result File - ${new Date().toLocaleDateString()}`,
      url: tempFileUrl,
      type: 'result',
      createdAt: new Date().toISOString()
    };
    updateStatus(selectedOrder.id, selectedOrder.status, adminNotes, [newAttachment]);
    setTempFileUrl('');
    setShowUploader(false);
    setSelectedOrder({...selectedOrder, resultFiles: [...(selectedOrder.resultFiles || []), newAttachment]});
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
                      <span className="text-xs text-indigo-600 font-medium">{brand?.name || 'Loading...'}</span>
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
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-gray-500">No orders found matching this filter.</div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedOrder.title}</h2>
                <p className="text-sm text-indigo-600 font-semibold">{getBrandInfo(selectedOrder.brandId)?.name}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                <section>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Creative Brief</h4>
                  <p className="text-sm text-gray-800 leading-relaxed">{selectedOrder.description}</p>
                </section>
                
                <section>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Expectations</h4>
                  <p className="text-sm text-gray-800 leading-relaxed italic border-l-4 border-indigo-200 pl-4">{selectedOrder.creativeExpectations}</p>
                </section>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Colors</span>
                    <span className="text-sm font-medium">{selectedOrder.colors}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Target</span>
                    <span className="text-sm font-medium">{selectedOrder.targetAudience}</span>
                  </div>
                </div>
                
                {selectedOrder.resultFiles && selectedOrder.resultFiles.length > 0 && (
                  <section>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Uploaded Results</h4>
                    <div className="space-y-2">
                      {selectedOrder.resultFiles.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-100 text-xs">
                          <span className="font-medium text-green-800">{file.name}</span>
                          <a href={file.url} target="_blank" className="text-indigo-600 font-bold hover:underline">View File</a>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <div className="space-y-6 border-t md:border-t-0 md:border-l border-gray-100 md:pl-8">
                <section>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Admin Workflow</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleUpdate(OrderStatus.IN_PROGRESS)}
                          className={`px-3 py-2 text-xs rounded-lg font-bold border transition-colors ${selectedOrder.status === OrderStatus.IN_PROGRESS ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}
                        >
                          Mark In Progress
                        </button>
                        <button 
                          onClick={() => handleUpdate(OrderStatus.AWAITING_FEEDBACK)}
                          className={`px-3 py-2 text-xs rounded-lg font-bold border transition-colors ${selectedOrder.status === OrderStatus.AWAITING_FEEDBACK ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}
                        >
                          Send for Review
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Internal / Customer Notes</label>
                      <textarea 
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Log work or add notes for the customer..."
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-[10px] text-gray-400 mb-3 uppercase font-bold tracking-widest">UPLOAD COMPLETED ASSETS</p>
                      {!showUploader ? (
                        <button 
                          onClick={() => setShowUploader(true)}
                          className="w-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                        >
                          <div className="text-center">
                            <svg className="mx-auto h-8 w-8 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span className="mt-2 block text-xs font-bold text-gray-400 uppercase group-hover:text-indigo-600">Click to Upload Final Files</span>
                          </div>
                        </button>
                      ) : (
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 animate-in fade-in duration-300">
                          <label className="block text-xs font-bold text-indigo-700 mb-2">File URL (Simulation)</label>
                          <input 
                            type="text" 
                            className="w-full p-2 text-sm rounded border border-indigo-200 mb-3"
                            placeholder="https://cloud-storage.com/result.zip"
                            value={tempFileUrl}
                            onChange={(e) => setTempFileUrl(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={handleAddResult}
                              disabled={!tempFileUrl}
                              className="flex-1 bg-indigo-600 text-white py-2 rounded text-xs font-bold disabled:opacity-50"
                            >
                              Confirm Attachment
                            </button>
                            <button 
                              onClick={() => { setShowUploader(false); setTempFileUrl(''); }}
                              className="bg-white text-gray-500 px-3 rounded text-xs border border-gray-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex justify-end gap-3">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 text-sm font-bold text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button 
                onClick={() => handleUpdate(selectedOrder.status)}
                className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
