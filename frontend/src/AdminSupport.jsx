import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Send, User, MessageSquare, Zap, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const socket = io('http://localhost:5000');

export default function AdminSupport() {
  const [rooms, setRooms] = useState([]); 
  const [activeRoom, setActiveRoom] = useState(null);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const chatContainerRef = useRef(null);

  // 1. ดึงรายชื่อลูกค้าที่มีการทักแชทเข้ามาจริงๆ
  const fetchRooms = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/chat/rooms');
      setRooms(res.data);
    } catch (err) { console.error("Fetch Rooms Error:", err); }
  };

  useEffect(() => {
    fetchRooms();
    
    // ฟังข้อความใหม่เพื่อให้รายการห้องอัปเดต (ถ้ามีคนใหม่ทักมา)
    socket.on('receive_message', (data) => {
      setRooms((prev) => [...new Set([...prev, data.room])]);
      if (data.room === activeRoom) {
        setChatLog((prev) => [...prev, data]);
      }
    });

    return () => socket.off('receive_message');
  }, [activeRoom]);

  // 2. เมื่อเลือกห้อง (ลูกค้า)
  useEffect(() => {
    if (activeRoom) {
      socket.emit('join_room', activeRoom);
      axios.get(`http://localhost:5000/api/chat/${activeRoom}`).then(res => {
        setChatLog(res.data);
      });
    }
  }, [activeRoom]);

  // เลื่อนลงล่างสุดอัตโนมัติเมื่อมีข้อความใหม่
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatLog]);

  const sendResponse = (e) => {
    e.preventDefault();
    if (!message.trim() || !activeRoom) return;

    const msgData = { 
      room: activeRoom, 
      message, 
      sender: "Admin", 
      type: 'admin',
      timestamp: new Date()
    };

    socket.emit('send_message', msgData);
    setChatLog((prev) => [...prev, msgData]); // เพิ่มในหน้าจอเราทันที
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans text-left">
      <div className="bg-white border-b p-6 flex justify-between items-center shadow-sm">
        <Link to="/admin/orders" className="flex items-center gap-2 text-gray-400 hover:text-black font-bold uppercase text-[10px] tracking-widest">
          <ChevronLeft size={18}/> Dashboard
        </Link>
        <h1 className="text-xl font-black italic uppercase tracking-tighter">Support <span className="text-blue-600">Central</span></h1>
        <div className="w-20"></div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: รายชื่อลูกค้า */}
        <div className="w-80 bg-white border-r overflow-y-auto p-6 space-y-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Active Conversations</p>
          {rooms.length === 0 ? (
             <p className="text-xs text-gray-300 italic">No messages yet...</p>
          ) : (
            rooms.map(email => (
              <button key={email} onClick={() => setActiveRoom(email)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all border ${activeRoom === email ? 'bg-black text-white border-black shadow-xl scale-[1.02]' : 'bg-white border-gray-50 text-gray-600 hover:border-blue-200'}`}>
                <div className={`p-2 rounded-xl ${activeRoom === email ? 'bg-blue-600' : 'bg-gray-100'}`}><User size={18} className={activeRoom === email ? 'text-white' : ''}/></div>
                <p className="text-xs font-black truncate flex-1">{email}</p>
              </button>
            ))
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50/30">
          {activeRoom ? (
            <>
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-10 space-y-6">
                <div className="flex flex-col items-center mb-8">
                  <span className="text-[9px] font-black bg-gray-100 text-gray-400 px-4 py-1 rounded-full uppercase tracking-widest">Secure Connection Active</span>
                </div>
                {chatLog.map((msg, i) => (
                  <div key={i} className={`flex ${msg.type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[65%] p-5 rounded-[2rem] text-sm font-bold shadow-sm ${msg.type === 'admin' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendResponse} className="p-8 bg-white border-t border-gray-100 flex gap-4">
                <input 
                  type="text" 
                  placeholder={`Reply to ${activeRoom}...`} 
                  className="flex-1 bg-gray-50 p-5 rounded-[1.5rem] outline-none focus:ring-2 ring-blue-500 font-bold text-sm transition-all" 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                />
                <button className="bg-black text-white px-10 rounded-[1.5rem] hover:bg-blue-600 transition-all shadow-lg active:scale-95 flex items-center gap-2 font-black uppercase text-xs tracking-widest">
                  Send <Send size={16}/>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 flex flex-col items-center">
                <MessageSquare size={48} className="mb-4 text-blue-100" />
                <p className="font-black uppercase tracking-widest text-[10px]">Select a chat to begin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}