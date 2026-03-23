import { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronLeft, ShoppingBag, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client'; // ✅ 1. นำเข้า Socket.io

// ✅ 2. เชื่อมต่อ Socket (ตรวจสอบ Port ให้ตรงกับ Backend)
const socket = io('http://localhost:5000');

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('user'));

  // ✅ 3. แยกฟังก์ชันดึงข้อมูลออกมา เพื่อให้เรียกใช้ซ้ำได้เมื่อมีการอัปเดต
  const fetchOrders = () => {
    if (!userData?.email) return;
    
    axios.get(`http://localhost:5000/api/orders/user/${userData.email}`)
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch Orders Error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!userData?.email) {
      navigate('/login');
      return;
    }

    fetchOrders(); // ดึงข้อมูลครั้งแรกเมื่อเปิดหน้า

    // ✅ 4. ฟังคำสั่งจาก Backend: ถ้ามีการอัปเดตสถานะออเดอร์
    socket.on('order_status_updated', (data) => {
      // ตรวจสอบว่าออเดอร์ที่ถูกอัปเดต เป็นของลูกค้าคนนี้หรือไม่
      if (data.customerEmail === userData.email) {
        console.log("Order updated real-time!", data);
        fetchOrders(); // ดึงข้อมูลใหม่ทันที
      }
    });

    // ล้างการเชื่อมต่อเมื่อปิด Component
    return () => socket.off('order_status_updated');
  }, [userData?.email, navigate]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="font-black uppercase tracking-widest text-[10px] text-gray-400">Scanning Database...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 font-sans text-left text-[#1a1a1a]">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-black transition-all font-bold uppercase text-[10px] tracking-widest">
            <ChevronLeft size={20} /> Back to Shop
          </Link>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">My <span className="text-blue-600">History</span></h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-20 rounded-[3.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
             <ShoppingBag size={64} className="text-gray-100 mb-6" />
             <h3 className="text-xl font-bold text-gray-900">No orders found</h3>
             <p className="text-gray-400 text-sm mb-8">เริ่มช้อปปิ้งเพื่อสร้างประวัติการสั่งซื้อของคุณ</p>
             <Link to="/" className="bg-black text-white px-10 py-4 rounded-2xl font-black uppercase text-xs">Explore Kicks</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={order._id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden text-left">
                
                {/* ✅ แถบสถานะ (จะเปลี่ยนสี Real-time ตามสถานะล่าสุด) */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 transition-colors duration-500
                  ${order.status === 'Completed' ? 'bg-green-500' 
                    : order.status === 'Shipped' || order.status === 'Shipping' ? 'bg-blue-500' 
                    : 'bg-yellow-400'}`}>
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                       <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full 
                         ${order.status === 'Completed' ? 'bg-green-50 text-green-600' 
                           : order.status === 'Shipped' || order.status === 'Shipping' ? 'bg-blue-50 text-blue-600' 
                           : 'bg-yellow-50 text-yellow-600'}`}>
                         {order.status}
                       </span>
                       <span className="text-[10px] text-gray-300 font-bold uppercase flex items-center gap-1">
                         <Clock size={12}/> {new Date(order.createdAt).toLocaleString('th-TH')}
                       </span>
                    </div>

                    <div className="space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-gray-50 rounded-xl p-1 flex items-center justify-center border border-gray-100">
                             <img src={item.image} className="w-full h-full object-contain" alt="" />
                           </div>
                           <div>
                              <p className="text-xs font-bold text-gray-900 leading-none mb-1">{item.name}</p>
                              <p className="text-[9px] font-black text-gray-400 uppercase">Size: US {item.size} | Qty: {item.quantity}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:text-right border-t md:border-t-0 md:border-l border-gray-50 pt-6 md:pt-0 md:pl-8 min-w-[150px] flex flex-col justify-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Total Paid</p>
                    <p className="text-3xl font-black italic text-gray-900 tracking-tighter">
                      ฿{(order.totalPrice || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}