import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Package, Key, ShoppingBag, Tag, BarChart3 } from 'lucide-react';
import AdminProducts from './AdminProducts';
import AdminKeys from './AdminKeys';
import AdminOrders from './AdminOrders';
import AdminPromoCodes from './AdminPromoCodes';
import AdminStats from './AdminStats';

const AdminDashboard = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', label: 'Stats', icon: BarChart3 },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/keys', label: 'Keys', icon: Key },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { path: '/admin/promo-codes', label: 'Promo Codes', icon: Tag },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <div className="w-full md:w-64">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path !== '/admin' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<AdminStats />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/keys" element={<AdminKeys />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/promo-codes" element={<AdminPromoCodes />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;



