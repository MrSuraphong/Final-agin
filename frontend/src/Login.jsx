import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from './store/useCartStore'; 
import Swal from 'sweetalert2';
import { LogIn, User, Lock, Zap } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  
  // ✅ ดึง setUser มาแจ้งเตือนแอปว่ามีคนเข้าสู่ระบบแล้ว
  const { setUser, setCart } = useCartStore(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { 
        identity: email, 
        password: password 
      });

      // 1. เซฟลงเครื่อง
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));

      // 2. 🔥 แจ้ง Store ให้รู้ตัว (ปุ่มแชทจะเด้งทันทีตรงนี้)
      setUser(res.data);
      if (res.data.cart) {
        setCart(res.data.cart);
      }

      Swal.fire({
        icon: 'success',
        title: 'WELCOME BACK!',
        text: `ยินดีต้อนรับคุณ ${res.data.fullName}`,
        showConfirmButton: false,
        timer: 1500,
        customClass: { popup: 'rounded-[2rem]' }
      });

      navigate('/');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.response?.data || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        confirmButtonColor: '#000',
        customClass: { popup: 'rounded-[2rem]' }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans text-left">
      <div className="w-full max-w-md bg-[#111] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-blue-600 p-3 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
            <Zap className="text-white fill-current" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Shoe <span className="text-blue-500">Lab</span></h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">Authentication Terminal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <User className="absolute left-5 top-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input type="text" placeholder="Email or Full Name" className="w-full bg-white/5 border border-white/5 p-5 pl-14 rounded-2xl text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="relative group">
            <Lock className="absolute left-5 top-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input type="password" placeholder="Password" className="w-full bg-white/5 border border-white/5 p-5 pl-14 rounded-2xl text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase py-5 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 mt-4">
            Sign In <LogIn size={18} />
          </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-gray-500 text-[11px] font-bold">New to Shoe Lab? <Link to="/signup" className="text-blue-500 hover:underline">Create Account</Link></p>
        </div>
      </div>
    </div>
  );
}