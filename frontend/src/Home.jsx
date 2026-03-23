import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from './store/useCartStore' 
import { ShoppingBag, Plus, Zap, Search, User, LogOut, Package, X, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CartDrawer from './CartDrawer'
import AdminHub from './AdminHub'
import Swal from 'sweetalert2'

function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("ALL")
  
  const [showSizeModal, setShowSizeModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)

  const navigate = useNavigate()
  const userData = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  
  // ✅ ดึงตะกร้าและฟังก์ชันเซตค่าจาก Store
  const { cart, setCart, isDrawerOpen, toggleDrawer, addToCart } = useCartStore()

  useEffect(() => {
    // 1. ดึงข้อมูลสินค้าจากหลังบ้าน
    axios.get('http://localhost:5000/api/products').then(res => {
      setProducts(res.data); 
      setLoading(false);
    });

    // 2. 🔥 แก้จุดนี้: ดึงตะกร้าจาก LocalStorage มาใส่หน้าจอทันทีที่เปิดเว็บ
    // เพื่อให้ของที่เคยกดไว้ (และถูกบันทึกลง user.cart) กลับมาโชว์
    if (userData && userData.cart && cart.length === 0) {
        setCart(userData.cart);
    }
  }, []);

  // ✅ แก้ไขการ Logout ให้ล้างข้อมูลทั้งเครื่องและ Store
  const handleLogout = () => {
    localStorage.clear();
    setCart([]); // 🔥 ล้างตะกร้าใน Zustand ทันที ไม่ต้องรอรีโหลด
    Swal.fire({ icon: 'success', title: 'LOGGED OUT', showConfirmButton: false, timer: 1000 });
    setTimeout(() => {
        window.location.href = "/"; // รีเฟรชไปหน้าแรกแบบคลีนๆ
    }, 1000);
  }

  const handleOpenSizeModal = (item) => {
    if (!token) {
        Swal.fire({ 
          title: 'SIGN IN REQUIRED', 
          text: 'กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า',
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Login Now',
          confirmButtonColor: '#000'
        }).then(res => { if(res.isConfirmed) navigate('/login') });
        return;
    }
    setSelectedProduct(item); 
    setShowSizeModal(true);
  }

  const handleConfirmAddToCart = async () => {
    if (!selectedSize) return;
    
    // ดึงสต๊อกเฉพาะไซส์ที่เลือก
    const qtyInStock = selectedProduct.sizeStock?.[selectedSize] || 0;
    const itemInCart = cart.find(i => i._id === selectedProduct._id && i.size === selectedSize);
    
    if (itemInCart && itemInCart.quantity >= qtyInStock) {
        Swal.fire({ icon: 'warning', title: 'LIMIT REACHED', text: `ไซส์ ${selectedSize} มีของในสต๊อกเพียง ${qtyInStock} คู่เท่านั้นครับ` });
        return;
    }

    // ✅ ส่งเข้าตะกร้า (ฟังก์ชันนี้จะ sync ลง DB และ LocalStorage อัตโนมัติ)
    await addToCart(selectedProduct, selectedSize);
    
    setShowSizeModal(false); 
    setSelectedSize(null);
    
    // แจ้งเตือนแบบเก๋ๆ
    const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    Toast.fire({ icon: 'success', title: 'Added to your bag' });
  }

  const filteredProducts = products.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const brandMatch = selectedBrand === "ALL" || item.brand.toUpperCase() === selectedBrand;
    return nameMatch && brandMatch;
  });

  const brands = ["ALL", ...new Set(products.map(p => p.brand.toUpperCase()).filter(b => b))];
  const allPossibleSizes = ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1a] font-sans text-left selection:bg-blue-100">
      <CartDrawer />
      {userData?.role === 'admin' && !isDrawerOpen && <AdminHub />}

      <AnimatePresence>
        {showSizeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSizeModal(false)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-2xl relative z-10 text-left">
              <button onClick={() => setShowSizeModal(false)} className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-all"><X size={20}/></button>
              <div className="flex items-center gap-6 mb-10 text-left">
                <div className="w-28 h-28 bg-gray-50 rounded-[2.2rem] p-3 flex items-center justify-center shadow-inner"><img src={selectedProduct?.image} className="w-full h-full object-contain" alt="shoe" /></div>
                <div className="text-left">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{selectedProduct?.brand}</p>
                    <h3 className="font-bold text-xl leading-tight text-gray-900">{selectedProduct?.name}</h3>
                </div>
              </div>
              <div className="mb-10 text-left">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-5">Select Size (US)</h4>
                <div className="grid grid-cols-4 gap-3">
                  {allPossibleSizes.map(size => {
                    const qty = selectedProduct?.sizeStock?.[size] || 0;
                    const isAvailable = qty > 0;
                    return (
                      <button key={size} disabled={!isAvailable} onClick={() => setSelectedSize(size)}
                        className={`relative flex flex-col items-center justify-center py-4 rounded-2xl text-sm font-bold transition-all border-2 
                          ${!isAvailable ? 'bg-gray-50 border-gray-100 text-gray-200 cursor-not-allowed opacity-60' 
                          : selectedSize === size ? 'bg-black text-white border-black scale-105 shadow-xl shadow-black/10' 
                          : 'bg-white text-gray-800 border-gray-100 hover:border-blue-500'}`}>
                        <span className={!isAvailable ? 'line-through' : ''}>{size}</span>
                        <span className={`text-[7px] font-black uppercase tracking-tighter mt-0.5 ${isAvailable ? 'text-blue-500' : 'text-red-400'}`}>
                          {isAvailable ? `${qty} LEFT` : 'SOLD OUT'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button onClick={handleConfirmAddToCart} disabled={!selectedSize} className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 ${selectedSize ? 'bg-black text-white hover:bg-blue-600' : 'bg-gray-100 text-gray-300'}`}>ADD TO BAG <Plus size={18} /></button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-black p-2 rounded-xl group-hover:rotate-12 transition-all">
                <Zap className="text-white w-6 h-6 fill-current" />
            </div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">Shoe <span className="text-blue-600">Lab</span></h1>
          </Link>

          <div className="hidden lg:flex items-center bg-gray-100 px-5 py-2.5 rounded-2xl w-80">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Search kicks..." className="bg-transparent border-none outline-none ml-3 text-sm w-full font-medium" onChange={e => setSearchTerm(e.target.value)} />
          </div>

          <div className="flex items-center gap-6">
            {!token ? (
              <div className="flex items-center gap-5"><Link to="/login" className="text-[10px] font-black uppercase text-gray-400 hover:text-black transition-colors">Sign In</Link><Link to="/signup" className="bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Join Us</Link></div>
            ) : (
              <div className="flex items-center gap-4 border-r pr-6 border-gray-100">
                <Link to="/order-history" className="p-2.5 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-xl transition-all relative group"><Package size={20} /></Link>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md"><User size={16} /></div>
                    <div className="hidden md:block">
                        <p className="text-[8px] font-black uppercase text-blue-600 leading-none mb-0.5">{userData?.role}</p>
                        <p className="text-xs font-bold leading-none text-gray-800">{userData?.fullName}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="p-2 text-gray-300 hover:text-red-500 transition-all ml-2"><LogOut size={20} /></button>
              </div>
            )}
            <div onClick={toggleDrawer} className="relative cursor-pointer group p-2.5 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all active:scale-90">
              <ShoppingBag className="w-6 h-6 group-hover:text-blue-600 transition-colors" />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-lg">{cart.length}</span>}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-6xl font-black mb-10 italic uppercase tracking-tighter text-left">The Digital <br/> <span className="text-blue-600">Sneaker</span> Age.</motion.h2>
        
        <div className="flex gap-3 overflow-x-auto pb-10 no-scrollbar">
          {brands.map(brand => (
            <button key={brand} onClick={() => setSelectedBrand(brand)} 
              className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap shadow-sm border
                ${selectedBrand === brand ? 'bg-black text-white border-black scale-105 shadow-xl shadow-black/10' : 'bg-white text-gray-400 border-gray-50 hover:bg-gray-50'}`}>{brand}</button>
          ))}
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {[1,2,3,4,5].map(n => <div key={n} className="h-80 bg-white rounded-[2.5rem] animate-pulse border border-gray-100"></div>)}
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              <AnimatePresence>
                {filteredProducts.map((item) => {
                   const totalStock = Object.values(item.sizeStock || {}).reduce((a, b) => a + b, 0);
                   return (
                    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={item._id} className="group bg-white rounded-[2.8rem] p-5 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50 flex flex-col h-full relative overflow-hidden text-left">
                      {totalStock <= 0 && <div className="absolute inset-0 bg-white/70 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center text-center"><AlertTriangle className="text-red-500 mb-2" size={32} /><span className="text-red-600 font-black text-[11px] uppercase tracking-widest bg-white px-4 py-1.5 rounded-full shadow-sm">Sold Out</span></div>}
                      <div className="aspect-square bg-gray-50 rounded-[2.2rem] overflow-hidden flex items-center justify-center mb-6 relative text-left">
                        <img src={item.image} className={`w-full h-full object-contain p-6 transition-all duration-700 ${totalStock <= 0 ? 'grayscale opacity-50' : 'group-hover:scale-110 group-hover:-rotate-6'}`} />
                        {totalStock > 0 && <button onClick={() => handleOpenSizeModal(item)} className="absolute bottom-4 right-4 bg-white text-black p-4 rounded-2xl shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-black hover:text-white transition-all duration-300"><Plus size={22} /></button>}
                      </div>
                      <div className="px-2 text-left flex-1 flex flex-col justify-between">
                        <div className="text-left">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{item.brand}</span>
                              <span className={`text-[8px] font-black px-2.5 py-1 rounded-full border ${totalStock > 5 ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>{totalStock > 0 ? `TOTAL: ${totalStock}` : 'N/A'}</span>
                            </div>
                            <h3 className="font-bold text-gray-900 leading-snug mb-4 line-clamp-2 h-10">{item.name}</h3>
                        </div>
                        <div className="flex justify-between items-center mt-auto border-t border-gray-50 pt-4">
                          <span className="text-2xl font-black italic tracking-tighter">฿{item.price.toLocaleString()}</span>
                          <div className={`h-2.5 w-2.5 rounded-full ${totalStock > 0 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-red-400'}`}></div>
                        </div>
                      </div>
                    </motion.div>
                   )
                })}
              </AnimatePresence>
            </div>
        )}
      </main>
    </div>
  )
}

export default Home