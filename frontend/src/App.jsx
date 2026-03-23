import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import Checkout from './Checkout';
import AdminOrders from './AdminOrders';
import OrderHistory from './OrderHistory';
import AdminProducts from './AdminProducts';
import AdminSupport from './AdminSupport'; 
import ChatWidget from './components/ChatWidget'; 

export default function App() {
  return (
    <BrowserRouter>
      {/* 💬 วาง ChatWidget ไว้ข้างใน BrowserRouter เพื่อให้ใช้ Link/Navigate ได้ */}
      <ChatWidget />

      <Routes>
        {/* 🏠 Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* 🛒 User Routes */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-history" element={<OrderHistory />} />
        
        {/* 📦 Admin Routes */}
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/support" element={<AdminSupport />} /> 
        
        {/* 🔄 Redirect สำหรับ URL ที่ไม่มีจริง */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}