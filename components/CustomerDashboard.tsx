
import React, { useState } from 'react';
import { User, Brand, Order, OrderStatus, Attachment } from '../types';
import OrderForm from './OrderForm';
import BrandForm from './BrandForm';

interface Props {
  user: User;
  brands: Brand[];
  orders: Order[];
  addOrder: (order: Order) => void;
  addBrand: (brand: Brand) => void;
  updateStatus: (id: string, status: OrderStatus, notes?: string) => void;
}

const CustomerDashboard: React.FC<Props> = ({ user, brands, orders, addOrder, addBrand, updateStatus }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'brands'>('orders');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showRevisionInput, setShowRevisionInput] = useState(false);

  const customerBrands = brands.filter(b => b.customerId === user.id);
  const customerOrders = orders.filter(o => o.customerId === user.id);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
      case OrderStatus.AWAITING_FEEDBACK: return 'bg-purple-100 text-purple-800';
      case OrderStatus.COMPLETED: return 'bg-green-100 text-green-800';
      case OrderStatus.REVISIONS_REQUESTED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRequestRevision = () => {
    if (!selectedOrder || !revisionNotes) return;
    updateStatus(selectedOrder.id, OrderStatus.REVISIONS_REQUESTED, revisionNotes);
    setSelectedOrder(null);
    setRevisionNotes('');
    setShowRevisionInput(false);
  };

  const handleSatisfied = (orderId: string) => {
    updateStatus(orderId, OrderStatus.COMPLETED);
    if (selectedOrder?.id === orderId) setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back, {user.name}</h1>
          <p className="text-gray-500">Manage your brands and track your creative orders.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'brands' ? (
            <button 
              onClick={() => setShowBrandForm(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              New Brand
            </button>
          ) : (
            <button 
              onClick={() => setShowOrderForm(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Create Order
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`${activeTab === 'orders' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all`}
          >
            My Orders
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={`${activeTab === 'brands' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all`}
          >
            My Brands
          </button>
        </nav>
      </div>

      {activeTab === 'orders' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {customerOrders.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border-2 border-dashed border-gray-300">
              <p className="text-gray-500">No orders yet. Ready to start something new?</p>
            </div>
          ) : (
            customerOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:border-indigo-300 transition-all">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-xs text-gray-400">#{order.id.slice(0, 5)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{order.title}</h3>
                  <p className="text-sm text-indigo-600 font-medium mb-3">
                    {brands.find(b => b.id === order.brandId)?.name}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{order.description}</p>
                  
                  {order.status === OrderStatus.AWAITING_FEEDBACK && (
                    <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <p className="text-xs font-semibold text-indigo-800 mb-2">Admin Results Ready</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleSatisfied(order.id)}
                          className="flex-1 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 font-medium transition-colors"
                        >
                          I'm Satisfied
                        </button>
                        <button 
                          onClick={() => { setSelectedOrder(order); setShowRevisionInput(true); }}
                          className="flex-1 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 font-medium transition-colors"
                        >
                          Needs Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Updated {new Date(order.updatedAt).toLocaleDateString()}</span>
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="text-indigo-600 text-xs font-bold hover:underline uppercase tracking-tight"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {customerBrands.map(brand => (
            <div key={brand.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-start space-x-4">
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                {brand.logoUrl ? (
                  <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-2xl font-bold text-gray-300">{brand.name[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900 truncate">{brand.name}</h3>
                  {brand.isPrimary && <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Primary</span>}
                </div>
                <p className="text-xs text-gray-500 italic mb-2">{brand.tagline}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{brand.description}</p>
                <div className="mt-4 flex gap-1">
                  {brand.colorPalette.map((c, i) => (
                    <div key={i} className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedOrder.title}</h2>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                  <span className="text-xs text-gray-400">#{selectedOrder.id.slice(0, 5)}</span>
                </div>
              </div>
              <button onClick={() => { setSelectedOrder(null); setShowRevisionInput(false); }} className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {selectedOrder.resultFiles && selectedOrder.resultFiles.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                  <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Creative Results From Admin
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.resultFiles.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-200 shadow-sm">
                        <span className="text-sm font-medium text-gray-700">{file.name}</span>
                        <a href={file.url} target="_blank" className="text-indigo-600 text-sm font-bold hover:underline bg-indigo-50 px-3 py-1 rounded">Download</a>
                      </div>
                    ))}
                  </div>
                  {selectedOrder.adminNotes && (
                    <div className="mt-4 pt-4 border-t border-indigo-100">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">ADMIN NOTES</p>
                      <p className="text-sm text-indigo-800 italic">"{selectedOrder.adminNotes}"</p>
                    </div>
                  )}
                </div>
              )}

              <section>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Original Brief</h4>
                <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Apparel Description:</span>
                    <p className="text-sm text-gray-800">{selectedOrder.description}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Creative Expectations:</span>
                    <p className="text-sm text-gray-800">{selectedOrder.creativeExpectations}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Colors:</span>
                      <p className="text-sm text-gray-800">{selectedOrder.colors}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Target Audience:</span>
                      <p className="text-sm text-gray-800">{selectedOrder.targetAudience}</p>
                    </div>
                  </div>
                </div>
              </section>

              {showRevisionInput && (
                <div className="animate-in slide-in-from-bottom duration-300">
                  <label className="block text-sm font-bold text-red-700 mb-2">Revision Request Details</label>
                  <textarea 
                    autoFocus
                    className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                    placeholder="Describe what needs to be changed..."
                    value={revisionNotes}
                    onChange={(e) => setRevisionNotes(e.target.value)}
                  />
                  <div className="mt-2 flex gap-2">
                    <button 
                      onClick={handleRequestRevision}
                      className="flex-1 bg-red-600 text-white py-2 rounded text-xs font-bold"
                    >
                      Submit Revision Request
                    </button>
                    <button 
                      onClick={() => setShowRevisionInput(false)}
                      className="px-4 py-2 border border-gray-200 text-xs font-bold text-gray-500 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex justify-end gap-3">
              {selectedOrder.status === OrderStatus.AWAITING_FEEDBACK && !showRevisionInput && (
                <>
                  <button 
                    onClick={() => setShowRevisionInput(true)}
                    className="px-6 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Request Revisions
                  </button>
                  <button 
                    onClick={() => handleSatisfied(selectedOrder.id)}
                    className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 shadow-lg shadow-green-500/20"
                  >
                    Mark as Satisfied
                  </button>
                </>
              )}
              <button 
                onClick={() => { setSelectedOrder(null); setShowRevisionInput(false); }}
                className="px-6 py-2 text-sm font-bold text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showOrderForm && (
        <OrderForm 
          onClose={() => setShowOrderForm(false)} 
          onSubmit={(o) => { addOrder(o); setShowOrderForm(false); }} 
          brands={customerBrands}
          customerId={user.id}
        />
      )}

      {showBrandForm && (
        <BrandForm 
          onClose={() => setShowBrandForm(false)} 
          onSubmit={(b) => { addBrand(b); setShowBrandForm(false); }}
          customerId={user.id}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
