
import React, { useState, useEffect } from 'react';
import { UserRole, User, Brand, Order, OrderStatus, Attachment } from './types';
import { LOGO_ICON } from './constants';
import AdminDashboard from './components/AdminDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch data from Supabase
  const fetchData = async (user: User) => {
    setLoading(true);
    try {
      // Fetch Brands
      const brandQuery = user.role === UserRole.ADMIN 
        ? supabase.from('brands').select('*')
        : supabase.from('brands').select('*').eq('customer_id', user.id);
      
      const { data: brandData, error: brandError } = await brandQuery;
      if (brandError) throw brandError;
      
      if (brandData) {
        setBrands(brandData.map(b => ({
          id: b.id,
          customerId: b.customer_id,
          name: b.name,
          logoUrl: b.logo_url,
          tagline: b.tagline,
          description: b.description,
          colorPalette: b.color_palette || [],
          isPrimary: b.is_primary,
          referenceAssets: b.reference_assets || []
        })));
      }

      // Fetch Orders with nested attachments
      const orderQuery = user.role === UserRole.ADMIN
        ? supabase.from('orders').select('*, attachments(*)')
        : supabase.from('orders').select('*, attachments(*)').eq('customer_id', user.id);
      
      const { data: orderData, error: orderError } = await orderQuery;
      if (orderError) throw orderError;

      if (orderData) {
        const mappedOrders: Order[] = (orderData as any[]).map(o => ({
          id: o.id,
          customerId: o.customer_id,
          brandId: o.brand_id,
          title: o.title,
          description: o.description,
          creativeExpectations: o.creative_expectations,
          status: o.status as OrderStatus,
          createdAt: o.created_at,
          updatedAt: o.updated_at,
          colors: o.colors,
          sizes: o.sizes,
          features: o.features,
          targetAudience: o.target_audience,
          usage: o.usage,
          notes: o.notes,
          adminNotes: o.admin_notes,
          resultFiles: (o.attachments || []).map((a: any) => ({
            id: a.id,
            orderId: a.order_id,
            name: a.name,
            url: a.url,
            type: a.type,
            createdAt: a.created_at
          }))
        }));
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to upload files to Supabase Storage
  const uploadFiles = async (files: File[], orderId: string, type: 'image' | 'document' | 'result'): Promise<void> => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${orderId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('attachments').insert([{
        order_id: orderId,
        name: file.name,
        url: publicUrl,
        type: type
      }]);

      if (dbError) throw dbError;
    });

    await Promise.all(uploadPromises);
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!currentUser) return;

    const channels = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchData(currentUser);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'brands' }, () => {
        fetchData(currentUser);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channels);
    };
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    fetchData(user);
  };

  const logout = () => {
    setCurrentUser(null);
    setOrders([]);
    setBrands([]);
  };

  const addOrder = async (newOrder: Partial<Order> & { files?: File[] }) => {
    const { data, error } = await supabase.from('orders').insert([{
      customer_id: newOrder.customerId,
      brand_id: newOrder.brandId,
      title: newOrder.title,
      description: newOrder.description,
      creative_expectations: newOrder.creativeExpectations,
      status: OrderStatus.PENDING,
      colors: newOrder.colors,
      sizes: newOrder.sizes,
      features: newOrder.features,
      target_audience: newOrder.targetAudience,
      usage: newOrder.usage,
      notes: newOrder.notes
    }]).select().single();

    if (error) {
      console.error('Error adding order:', error);
      alert('Failed to create order. Please try again.');
    } else if (data && newOrder.files && newOrder.files.length > 0) {
      try {
        await uploadFiles(newOrder.files, data.id, 'document');
        fetchData(currentUser!);
      } catch (uploadError) {
        console.error('Error uploading files:', uploadError);
        alert('Order created, but file upload failed.');
      }
    } else {
      fetchData(currentUser!);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, adminNotes?: string, newFiles?: File[]) => {
    const { error } = await supabase.from('orders').update({
      status,
      admin_notes: adminNotes,
      updated_at: new Date().toISOString()
    }).eq('id', orderId);

    if (error) {
      console.error('Error updating status:', error);
      return;
    }

    if (newFiles && newFiles.length > 0) {
      try {
        await uploadFiles(newFiles, orderId, 'result');
      } catch (uploadError) {
        console.error('Error uploading result files:', uploadError);
      }
    }

    fetchData(currentUser!);
  };

  const addBrand = async (newBrand: Partial<Brand>) => {
    const { error } = await supabase.from('brands').insert([{
      customer_id: newBrand.customerId,
      name: newBrand.name,
      tagline: newBrand.tagline,
      description: newBrand.description,
      color_palette: newBrand.colorPalette,
      is_primary: newBrand.isPrimary
    }]);

    if (error) {
      console.error('Error adding brand:', error);
    } else {
      fetchData(currentUser!);
    }
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                {LOGO_ICON}
                <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">ApparelCreative</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end mr-4">
                <span className="text-sm font-medium text-gray-900">{currentUser.name}</span>
                <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">{currentUser.role}</span>
              </div>
              <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}
        {!loading && (
          currentUser.role === UserRole.ADMIN ? (
            <AdminDashboard orders={orders} updateStatus={updateOrderStatus} brands={brands} />
          ) : (
            <CustomerDashboard 
              user={currentUser} 
              brands={brands} 
              orders={orders} 
              addOrder={addOrder as any} 
              addBrand={addBrand as any} 
              updateStatus={updateOrderStatus}
            />
          )
        )}
      </main>
    </div>
  );
};

export default App;
