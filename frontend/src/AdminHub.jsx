import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Settings, ShoppingCart, PlusCircle, X, LayoutDashboard, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminHub() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-[100] text-left">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-64 bg-black text-white rounded-[2.5rem] p-6 shadow-2xl border border-white/10 backdrop-blur-xl"
          >
            <div className="mb-6 border-b border-white/10 pb-4">
              <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1">Admin Control</p>
              <h3 className="text-lg font-black italic uppercase">Management</h3>
            </div>

            <div className="space-y-2">
              {/* ✅ เปลี่ยนเป็น Link เพื่อไม่ให้รีหน้าเว็บ */}
              <Link 
                to="/admin/products" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between w-full p-4 hover:bg-white/10 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <PlusCircle size={18} className="text-blue-500" />
                  <span className="text-xs font-bold uppercase tracking-widest">Add New Shoe</span>
                </div>
                <motion.span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</motion.span>
              </Link>

              <Link 
                to="/admin/orders" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between w-full p-4 hover:bg-white/10 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-green-500" />
                  <span className="text-xs font-bold uppercase tracking-widest">Manage Orders</span>
                </div>
                <motion.span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</motion.span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-5 rounded-full shadow-2xl transition-all duration-500 ${isOpen ? 'bg-white text-black rotate-90' : 'bg-black text-white hover:bg-blue-600'}`}
      >
        {isOpen ? <X size={24} /> : <Settings size={24} className="animate-spin-slow" />}
      </button>
    </div>
  )
}