import { useCartStore } from './store/useCartStore'
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

export default function CartDrawer() {
  // ✅ ดึง toggleSelection และ toggleSelectAll มาใช้
  const { cart, isDrawerOpen, toggleDrawer, addToCart, removeFromCart, clearItem, toggleSelection, toggleSelectAll } = useCartStore()
  const navigate = useNavigate()
  const token = localStorage.getItem('token');

  // ✅ กรองเอาเฉพาะสินค้าที่ถูกเลือก (selected)
  const selectedItems = cart.filter(item => item.selected);
  // ✅ คำนวณราคารวมเฉพาะที่เลือก
  const totalPrice = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  // ✅ ตรวจสอบว่าเลือกครบทุกชิ้นหรือยัง
  const isAllSelected = cart.length > 0 && cart.every(item => item.selected);

  const handleCheckout = () => {
    if (selectedItems.length === 0) return; // ถ้าไม่เลือกเลย ห้ามไปต่อ
    if (!token) {
      toggleDrawer();
      Swal.fire({
        title: 'LOGIN REQUIRED',
        text: 'กรุณาเข้าสู่ระบบก่อนดำเนินการชำระเงิน',
        icon: 'info',
        confirmButtonColor: '#000',
        confirmButtonText: 'LOGIN NOW',
        customClass: { popup: 'rounded-[2rem]' }
      }).then((result) => { if (result.isConfirmed) navigate('/login'); });
      return;
    }
    toggleDrawer();
    navigate('/checkout');
  }

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleDrawer} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" />
          
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col text-left">
            
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-blue-600" />
                <h2 className="text-xl font-black italic uppercase">Your <span className="text-blue-600">Bag</span></h2>
              </div>
              <button onClick={toggleDrawer} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X /></button>
            </div>

            {/* ✅ ส่วนเลือกทั้งหมด (Select All) */}
            {cart.length > 0 && (
              <div className="px-8 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <button 
                  onClick={() => toggleSelectAll(!isAllSelected)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {isAllSelected ? <CheckCircle2 size={18} className="text-blue-600" /> : <Circle size={18} />}
                  {isAllSelected ? 'Unselect All' : 'Select All'}
                </button>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{selectedItems.length} SELECTED</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-8 space-y-6 text-left">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-300">
                  <ShoppingBag size={64} strokeWidth={1} className="mb-4" />
                  <p className="font-bold uppercase tracking-widest text-xs text-center">Your bag is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={`${item._id}-${item.size}`} className={`flex items-center gap-4 group text-left transition-opacity ${!item.selected ? 'opacity-50' : 'opacity-100'}`}>
                    
                    {/* ✅ Checkbox เลือกรายคู่ */}
                    <button 
                      onClick={() => toggleSelection(item._id, item.size)}
                      className="shrink-0 transition-transform active:scale-90"
                    >
                      {item.selected ? <CheckCircle2 className="text-blue-600" size={22} /> : <Circle className="text-gray-200" size={22} />}
                    </button>

                    <div className="w-20 h-20 bg-gray-50 rounded-2xl p-2 flex-shrink-0 flex items-center justify-center">
                      <img src={item.image} className="w-full h-full object-contain" alt="" />
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <h3 className="font-bold text-xs leading-tight mb-1 truncate">{item.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">{item.brand}</span>
                        <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md uppercase">US {item.size}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-gray-100 rounded-lg px-2 py-0.5">
                          <button onClick={() => removeFromCart(item._id, item.size)} className="p-1 hover:text-blue-600"><Minus size={12}/></button>
                          <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                          <button onClick={() => addToCart(item, item.size)} className="p-1 hover:text-blue-600"><Plus size={12}/></button>
                        </div>
                        <button onClick={() => clearItem(item._id, item.size)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </div>
                    <div className="text-right font-black italic text-sm">฿{(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 bg-gray-50 rounded-t-[3rem] border-t border-gray-100">
                <div className="flex justify-between items-end mb-8">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Amount</span>
                  <span className="text-3xl font-black italic text-blue-600">฿{totalPrice.toLocaleString()}</span>
                </div>
                
                <button 
                  onClick={handleCheckout} 
                  disabled={selectedItems.length === 0}
                  className={`w-full py-6 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl uppercase tracking-widest text-sm group
                    ${selectedItems.length > 0 ? 'bg-blue-600 text-white shadow-blue-100 hover:bg-black' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
                >
                  Checkout {selectedItems.length > 0 ? `(${selectedItems.length})` : ''} <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}