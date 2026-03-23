import { useEffect, useState } from 'react';
import axios from 'axios';
import { Truck, CheckCircle, Trash2, ChevronLeft, ShoppingBag, Banknote, BarChart3, Maximize2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    axios.get('http://localhost:5000/api/orders')
      .then(res => {
        setOrders(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/orders/${id}`, { status: newStatus });
      fetchOrders();
      Swal.fire({ icon: 'success', title: 'STATUS UPDATED', timer: 1000, showConfirmButton: false });
    } catch (err) { Swal.fire({ icon: 'error', title: 'FAILED' }); }
  };

  const deleteOrder = async (id) => {
    const res = await Swal.fire({ title: 'ลบออเดอร์นี้?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (res.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/orders/${id}`);
        fetchOrders();
      } catch (err) { Swal.fire('Error', 'ลบไม่สำเร็จ'); }
    }
  };

  // ✅ คำนวณ Stats จาก totalPrice (ชื่อฟิลด์ใน MongoDB ของพี่)
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'Pending' || o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 font-sans text-left text-[#1a1a1a]">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Orders <span className="text-blue-600">Feed</span></h1>
          <Link to="/" className="bg-white px-6 py-3 rounded-2xl shadow-sm font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black hover:text-white transition-all">
            <ChevronLeft size={16}/> Back to Store
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm flex items-center gap-6 border border-gray-50">
            <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-100"><Banknote size={24}/></div>
            <div><p className="text-[10px] font-black text-gray-300 uppercase leading-none mb-1">Revenue</p><p className="text-2xl font-black italic text-gray-900">฿{totalRevenue.toLocaleString()}</p></div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm flex items-center gap-6 border border-gray-50">
            <div className="bg-black p-4 rounded-2xl text-white shadow-lg"><ShoppingBag size={24}/></div>
            <div><p className="text-[10px] font-black text-gray-300 uppercase leading-none mb-1">Total Sales</p><p className="text-2xl font-black italic text-gray-900">{orders.length}</p></div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm flex items-center gap-6 border border-gray-50">
            <div className="bg-yellow-400 p-4 rounded-2xl text-white shadow-lg shadow-yellow-100"><BarChart3 size={24}/></div>
            <div><p className="text-[10px] font-black text-gray-300 uppercase leading-none mb-1">Pending</p><p className="text-2xl font-black italic text-gray-900">{pendingCount}</p></div>
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <p className="text-center font-bold text-gray-400 uppercase italic">Fetching data...</p>
          ) : orders.length === 0 ? (
            <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-100">
               <p className="text-gray-300 font-black uppercase text-xs">No orders in database feed.</p>
            </div>
          ) : (
            <AnimatePresence>
              {orders.map(order => (
                <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={order._id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-8 relative overflow-hidden">
                   <div className={`absolute left-0 top-0 bottom-0 w-2 ${order.status === 'Shipped' ? 'bg-blue-500' : order.status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                   <div className="flex-1">
                      <p className="text-[10px] text-gray-400 font-black uppercase mb-2 italic">Customer Details</p>
                      <h3 className="font-bold text-lg leading-none mb-1">{order.customerName || 'Unknown'}</h3>
                      <p className="text-sm text-gray-400 mb-4">{order.phone}</p>
                      <div className="bg-gray-50 p-4 rounded-2xl text-left"><p className="text-[10px] text-gray-400 font-black uppercase mb-1">Shipping to:</p><p className="text-xs text-gray-500 leading-relaxed">{order.address?.detail}, {order.address?.province}</p></div>
                   </div>
                   <div className="flex-1 border-y lg:border-y-0 lg:border-x border-gray-50 py-6 lg:py-0 lg:px-8">
                      <p className="text-[10px] text-gray-400 font-black uppercase mb-4 italic text-left">Items Summary</p>
                      <div className="space-y-2">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                             <span className="font-bold text-gray-800">{item.name} <span className="text-gray-300 ml-2 text-xs">x{item.quantity}</span></span>
                             <span className="font-black text-gray-300 italic">฿{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-6 text-2xl font-black text-blue-600 italic">฿{(Number(order.totalPrice) || 0).toLocaleString()}</p>
                   </div>
                   <div className="flex flex-col items-center justify-between gap-6 min-w-[150px]">
                      <div className="relative group cursor-zoom-in text-center" onClick={() => setSelectedSlip(order.slipImage)}>
                        <img src={order.slipImage} className="w-24 h-32 object-cover rounded-2xl shadow-md border-2 border-white group-hover:brightness-50 transition-all" alt="slip" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Maximize2 className="text-white" size={24} /></div>
                        <p className="text-[8px] font-black uppercase text-gray-400 mt-2 tracking-widest text-center">View Slip</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(order._id, 'Shipped')} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Truck size={18}/></button>
                        <button onClick={() => updateStatus(order._id, 'Completed')} className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm"><CheckCircle size={18}/></button>
                        <button onClick={() => deleteOrder(order._id)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={18}/></button>
                      </div>
                   </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedSlip && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 lg:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSlip(null)} className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-zoom-out" />
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="relative max-w-full max-h-full flex flex-col items-center gap-6">
              <img src={selectedSlip} className="max-h-[80vh] w-auto rounded-3xl shadow-2xl border-4 border-white/10" alt="Full Slip" />
              <button onClick={() => setSelectedSlip(null)} className="bg-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 backdrop-blur-xl hover:bg-white/20 transition-all"><X size={18}/> CLOSE</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}