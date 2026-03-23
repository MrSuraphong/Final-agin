import { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Zap, ShieldCheck, Chrome, Facebook } from 'lucide-react';
import Swal from 'sweetalert2';
import ReCAPTCHA from "react-google-recaptcha";

export default function Signup() {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return Swal.fire({ icon: 'error', title: 'Mismatch!', text: 'รหัสผ่านไม่ตรงกัน' });
    }
    if (!captchaToken) {
      return Swal.fire({ icon: 'warning', title: 'CAPTCHA!', text: 'กรุณายืนยันตัวตน' });
    }

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        email: formData.email, // ✅ เปลี่ยนจาก username เป็น email
        password: formData.password,
        fullName: formData.fullName,
        captchaToken: captchaToken 
      });
      Swal.fire({ icon: 'success', title: 'WELCOME!', showConfirmButton: false, timer: 1500 });
      navigate('/login');
    } catch (err) {
      captchaRef.current.reset();
      setCaptchaToken(null);
      Swal.fire({ icon: 'error', title: 'Failed', text: err.response?.data || 'สมัครไม่สำเร็จ' });
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl bg-[#111] p-12 rounded-[3.5rem] border border-gray-800 shadow-2xl relative">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-blue-600 p-3 rounded-2xl mb-4"><Zap className="text-white fill-current"/></div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Join the <span className="text-blue-600">Lab</span></h1>
        </div>
        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-4">
            <div className="relative"><User className="absolute left-5 top-5 text-gray-600" size={18}/><input type="text" placeholder="Full Name" required className="w-full bg-black border border-gray-800 p-5 pl-14 rounded-2xl text-white outline-none focus:border-blue-600" onChange={(e) => setFormData({...formData, fullName: e.target.value})} /></div>
            <div className="relative"><Mail className="absolute left-5 top-5 text-gray-600" size={18}/><input type="email" placeholder="Email Address" required className="w-full bg-black border border-gray-800 p-5 pl-14 rounded-2xl text-white outline-none focus:border-blue-600" onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative"><Lock className="absolute left-5 top-5 text-gray-600" size={18}/><input type="password" placeholder="Password" required className="w-full bg-black border border-gray-800 p-5 pl-14 rounded-2xl text-white outline-none focus:border-blue-600" onChange={(e) => setFormData({...formData, password: e.target.value})} /></div>
              <div className="relative"><ShieldCheck className="absolute left-5 top-5 text-gray-600" size={18}/><input type="password" placeholder="Confirm" required className="w-full bg-black border border-gray-800 p-5 pl-14 rounded-2xl text-white outline-none focus:border-blue-600" onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} /></div>
            </div>
          </div>
          <div className="flex justify-center p-4 bg-black/50 border border-gray-800 rounded-2xl">
            <ReCAPTCHA ref={captchaRef} sitekey="6LdiKJAsAAAAAJWATlKiie4YsfR6OOvQPbIZ_13c" onChange={(t) => setCaptchaToken(t)} theme="dark" />
          </div>
          <button className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black hover:bg-blue-700 transition-all uppercase tracking-widest text-sm">Create Account</button>
        </form>
        <p className="text-center mt-8 text-gray-500 text-sm">Already have an account? <Link to="/login" className="text-blue-500 font-bold hover:underline">Sign In</Link></p>
      </div>
    </div>
  );
}