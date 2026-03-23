import React from 'react';
import { PlusCircle, Package, MessageSquare, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminMenu = ({ onClose }) => {
  const navigate = useNavigate();

  // ฟังก์ชันนำทางและปิดเมนู
  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="relative inline-block text-left">
      {/* 🖤 กล่องเมนูหลัก MANAGEMENT */}
      <div className="bg-black text-white p-10 rounded-[3rem] w-[340px] shadow-2xl border border-white/5 select-none">
        
        <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
          Admin Control
        </p>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8">
          Management
        </h2>

        {/* เส้นคั่นกลาง */}
        <div className="w-full h-[1px] bg-gray-800/50 mb-10"></div>

        <div className="space-y-10">
          
          {/* 1. เมนูเพิ่มรองเท้า */}
          <button 
            onClick={() => handleNavigation('/admin-products')}
            className="group flex items-center gap-5 w-full transition-all hover:translate-x-1"
          >
            <PlusCircle className="text-blue-500 group-hover:scale-110 transition-transform" size={22} />
            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-200 group-hover:text-white">
              Add New Shoe
            </span>
          </button>

          {/* 2. เมนูจัดการออเดอร์ */}
          <button 
            onClick={() => handleNavigation('/admin-orders')}
            className="group flex items-center gap-5 w-full transition-all hover:translate-x-1"
          >
            <Package className="text-green-500 group-hover:scale-110 transition-transform" size={22} />
            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-200 group-hover:text-white">
              Manage Orders
            </span>
          </button>

          {/* 🎯 3. เมนูแชทลูกค้า (เพิ่มเข้าไปให้แล้วครับ) 🎯 */}
          <button 
            onClick={() => handleNavigation('/admin-support')}
            className="group flex items-center gap-5 w-full transition-all hover:translate-x-1"
          >
            <div className="relative">
              <MessageSquare className="text-purple-500 group-hover:scale-110 transition-transform" size={22} />
              {/* จุดแจ้งเตือนสีแดง */}
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-black rounded-full"></div>
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-200 group-hover:text-white">
              Customer Chat
            </span>
          </button>

        </div>
      </div>

      {/* ⚪ ปุ่มปิด X ด้านล่าง */}
      <div className="absolute -bottom-20 right-0">
        <button 
          onClick={onClose}
          className="bg-white text-black p-5 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all border-4 border-gray-50 flex items-center justify-center"
        >
          <X size={28} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default AdminMenu;