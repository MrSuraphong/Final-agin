import { useState } from 'react';
import { useCartStore } from './store/useCartStore';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import generatePayload from 'promptpay-qr';
import axios from 'axios'; 
import { ChevronLeft, CreditCard, MapPin, CheckCircle, Image as ImageIcon, Globe, Plus, FileCheck, ShoppingBag } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Checkout() {
  const { cart, clearSelectedItems } = useCartStore();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('user'));
  
  const [address, setAddress] = useState({ name: '', phone: '', country: 'Thailand', province: '', district: '', subDistrict: '', zipCode: '', detail: '' });
  const [slipBase64, setSlipBase64] = useState(""); 
  const [isUploaded, setIsUploaded] = useState(false); 
  const [isPaid, setIsPaid] = useState(false);

  const checkoutItems = cart.filter(item => item.selected);
  const totalPrice = checkoutItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const payload = generatePayload("0630020970", { amount: totalPrice });

  const isReadyToConfirm = address.name && address.phone && address.province && address.district && address.subDistrict && address.zipCode && address.detail && slipBase64;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setSlipBase64(reader.result); setIsUploaded(true); };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmOrder = async () => {
    if (!isReadyToConfirm) return;

    // เตรียมข้อมูลไอเทม
    const itemsWithId = checkoutItems.map(item => ({ ...item, _id: item._id || item.id }));

    const orderData = {
      customerName: address.name,
      customerEmail: userData?.email,
      phone: address.phone,
      address: { detail: `${address.detail} ต.${address.subDistrict} อ.${address.district} ${address.zipCode}`, province: address.province },
      items: itemsWithId,
      totalPrice: totalPrice,
      slipImage: slipBase64,
      status: 'Pending'
    };

    try {
      // ✅ ตัดส่วน Swal.fire({ title: 'กำลังบันทึก...' }) ออกไปเลยครับ
      // พอกด Confirm ปุ๊บ ระบบจะส่งข้อมูลไปหลังบ้านทันทีโดยไม่มีตัวหมุนค้าง
      
      const res = await axios.post('http://localhost:5000/api/orders', orderData);
      
      // ✅ ถ้าสำเร็จ ให้เด้งหน้าเขียวทันที
      setIsPaid(true);
      setTimeout(() => { 
        clearSelectedItems(); 
        navigate('/order-history'); 
      }, 2000);

    } catch (err) {
      // ✅ ถ้าพัง ให้เด้งบอกเหตุผล แต่ไม่มีตัวหมุนค้างแน่นอน
      const msg = err.response?.data?.message || 'บันทึกออเดอร์ไม่สำเร็จ';
      Swal.fire({ 
        icon: 'error', 
        title: 'Oops!', 
        text: msg, 
        confirmButtonColor: '#000', 
        customClass: { popup: 'rounded-[2rem]' } 
      });
    }
  };

  if (isPaid) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <CheckCircle className="w-20 h-20 text-green-500 mb-6 animate-bounce" />
      <h1 className="text-3xl font-black mb-2 uppercase italic text-gray-900">Success!</h1>
      <p className="text-gray-400">สั่งซื้อสำเร็จ! กำลังพาไปหน้าประวัติการสั่งซื้อ...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-[#1a1a1a] text-left">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-black mb-8 font-bold transition-all group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1" /> Back
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* ข้อมูลที่อยู่ และรายการสินค้า (คงเดิมตาม UI พี่) */}
          <div className="lg:col-span-7 space-y-10">
            <section>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3 mb-8"><MapPin className="text-blue-600" /> Shipping Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><input type="text" placeholder="ชื่อ-นามสกุล *" className="w-full p-4 bg-white rounded-2xl border border-gray-100 outline-none focus:ring-2 ring-blue-500" onChange={(e) => setAddress({...address, name: e.target.value})} /></div>
                <input type="text" placeholder="เบอร์โทรศัพท์ *" className="w-full p-4 bg-white rounded-2xl border border-gray-100 outline-none" onChange={(e) => setAddress({...address, phone: e.target.value})} />
                <div className="relative"><input type="text" value={address.country} disabled className="w-full p-4 bg-gray-100 rounded-2xl border border-gray-100 text-gray-400" /><Globe className="absolute right-4 top-4 text-gray-300 w-5 h-5" /></div>
                <input type="text" placeholder="จังหวัด *" className="w-full p-4 bg-white rounded-2xl border border-gray-100 outline-none" onChange={(e) => setAddress({...address, province: e.target.value})} />
                <input type="text" placeholder="อำเภอ / เขต *" className="w-full p-4 bg-white rounded-2xl border border-gray-100 outline-none" onChange={(e) => setAddress({...address, district: e.target.value})} />
                <input type="text" placeholder="ตำบล / แขวง *" className="w-full p-4 bg-white rounded-2xl border border-gray-100 outline-none" onChange={(e) => setAddress({...address, subDistrict: e.target.value})} />
                <input type="text" placeholder="รหัสไปรษณีย์ *" className="w-full p-4 bg-white rounded-2xl border border-gray-100 outline-none" onChange={(e) => setAddress({...address, zipCode: e.target.value})} />
                <div className="md:col-span-2"><textarea placeholder="ที่อยู่โดยละเอียด *" rows="3" className="w-full p-4 bg-white rounded-2xl border border-gray-100 outline-none" onChange={(e) => setAddress({...address, detail: e.target.value})} /></div>
              </div>
            </section>
            <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-blue-600 mb-6 flex items-center gap-2"><ShoppingBag size={18} /> Review Items ({checkoutItems.length})</h3>
              <div className="space-y-4">
                {checkoutItems.map((item, idx) => (
                  <div key={`${item._id}-${item.size}`} className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl p-2"><img src={item.image} className="w-full h-full object-contain" /></div>
                    <div className="flex-1"><h4 className="font-bold text-sm">{item.name}</h4><p className="text-[10px] text-gray-400">Size: US {item.size} | Qty: {item.quantity}</p></div>
                    <p className="font-black italic">฿{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-white cursor-pointer overflow-hidden group hover:bg-gray-50 transition-all">
                {isUploaded ? (<div className="text-green-500 flex flex-col items-center"><FileCheck size={48}/><p className="text-sm font-black uppercase">Slip Uploaded</p></div>) : (<div className="text-gray-300 flex flex-col items-center"><Plus size={32}/><p className="text-[10px] font-black uppercase">Upload Transfer Slip</p></div>)}
                <input type="file" className="hidden" onChange={handleFileChange} />
              </label>
            </section>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl border border-gray-100 flex flex-col items-center sticky top-24">
              <div className="bg-white p-6 rounded-[2.5rem] border-4 border-blue-50 mb-8 shadow-sm"><QRCodeSVG value={payload} size={200} includeMargin={true} /></div>
              <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-2">Total Amount</p>
              <p className="text-5xl font-black text-gray-900 mb-10 tracking-tighter">฿{totalPrice.toLocaleString()}</p>
              <button 
                onClick={handleConfirmOrder} 
                disabled={!isReadyToConfirm} 
                className={`w-full py-6 rounded-3xl font-black text-lg transition-all shadow-xl active:scale-95 ${isReadyToConfirm ? 'bg-black text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                {isReadyToConfirm ? 'CONFIRM ORDER' : 'FILL INFO & SLIP'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}