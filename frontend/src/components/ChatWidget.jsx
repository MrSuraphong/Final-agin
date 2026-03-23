import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { MessageCircle, X, Send, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';

const socket = io('http://localhost:5000');

export default function ChatWidget() {
  const { user } = useCartStore(); 
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const chatRef = useRef(null);

  useEffect(() => {
    if (user?.email && user.role !== 'admin') {
      socket.emit('join_room', user.email);
      
      // ดึงประวัติแชทเก่า
      axios.get(`http://localhost:5000/api/chat/${user.email}`).then(res => setChatLog(res.data));
      
      // ✅ เคลียร์ Listener และดักฟังข้อความใหม่จาก Admin
      socket.off('receive_message');
      socket.on('receive_message', (data) => {
        if (data.room === user.email) {
          setChatLog(prev => [...prev, data]);
        }
      });
    }
    return () => socket.off('receive_message');
  }, [user]);

  useEffect(() => { 
    if(chatRef.current) {
        chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatLog, isOpen]);

  // ✅ แสดงเฉพาะลูกค้า
  if (!user || user.role === 'admin') return null;

  const send = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const data = { 
        room: user.email, 
        message: message.trim(), 
        sender: user.fullName, 
        type: 'user', 
        timestamp: new Date() 
    };

    socket.emit('send_message', data);
    setChatLog(prev => [...prev, data]); // ✅ เพิ่มลงหน้าจอตัวเองทันที
    setMessage("");
  };

  return (
    <div className="fixed bottom-8 right-8 z-[1000] font-sans text-left">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-80 h-[480px] mb-4 rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
            <div className="bg-black p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3"><div className="bg-blue-600 p-2 rounded-xl"><Zap size={16} className="fill-current"/></div><p className="font-bold text-sm">Shoe Lab Support</p></div>
              <button onClick={() => setIsOpen(false)}><X size={20}/></button>
            </div>
            <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
              {chatLog.map((m, i) => (
                <div key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl text-xs font-bold ${m.type === 'user' ? 'bg-blue-600 text-white rounded-br-none shadow-sm' : 'bg-white text-gray-800 shadow-sm rounded-bl-none border border-gray-100'}`}>{m.message}</div>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="p-4 bg-white border-t flex gap-2">
              <input type="text" className="flex-1 bg-gray-50 p-3 rounded-xl text-xs outline-none focus:ring-1 ring-blue-500 font-medium" value={message} onChange={e => setMessage(e.target.value)} placeholder="พิมพ์ข้อความ..." />
              <button className="bg-black text-white p-3 rounded-xl hover:bg-blue-600 transition-all"><Send size={16}/></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setIsOpen(!isOpen)} className="bg-black text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2">
        {isOpen ? <X size={28}/> : <><MessageCircle size={28}/><span className="font-black text-[10px] uppercase tracking-widest pr-2">Support</span></>}
      </button>
    </div>
  );
}