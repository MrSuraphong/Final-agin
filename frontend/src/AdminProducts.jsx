import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, Trash2, ChevronLeft, Package, Tag, DollarSign, Save, Upload, CheckCircle2, FileCheck } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', brand: '', price: '', image: '', sizeStock: {} });
  const [isImageReady, setIsImageReady] = useState(false);
  const [editingData, setEditingData] = useState({});

  const allSizes = ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"];

  const fetchProducts = () => {
    axios.get('http://localhost:5000/api/products')
      .then(res => {
        setProducts(res.data);
        setEditingData({});
      })
      .catch(err => console.error("Fetch Error:", err));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleFieldChange = (id, field, value) => {
    const currentItem = products.find(p => p._id === id);
    const currentEdit = editingData[id] || { ...currentItem };
    let newValue = field === 'price' ? (value === "" ? 0 : Number(value)) : value;

    setEditingData({
      ...editingData,
      [id]: { ...currentEdit, [field]: newValue }
    });
  };

  // ✅ แก้ไข: ระบบจัดการสต็อกให้จิ้มได้ทั้งสองฝั่ง
  const handleSizeChange = (id, size, value) => {
    const numValue = value === "" ? 0 : parseInt(value);

    if (id === null) {
      // 🟢 สำหรับเพิ่มสินค้าใหม่ (ฝั่งซ้าย)
      setNewProduct(prev => ({
        ...prev,
        sizeStock: { ...prev.sizeStock, [size]: numValue }
      }));
    } else {
      // 🔵 สำหรับแก้ไขสินค้าเดิม (ฝั่งขวา)
      const currentItem = products.find(p => p._id === id);
      const currentEdit = editingData[id] || { ...currentItem };
      const currentSizeStock = { ...currentEdit.sizeStock };
      currentSizeStock[size] = numValue;

      setEditingData({
        ...editingData,
        [id]: { ...currentEdit, sizeStock: currentSizeStock }
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3000000) return Swal.fire('ไฟล์ใหญ่ไป', 'กรุณาใช้รูปไม่เกิน 3MB ครับ', 'warning');
      const reader = new FileReader();
      reader.onloadend = () => { 
        setNewProduct({ ...newProduct, image: reader.result }); 
        setIsImageReady(true); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.image) return Swal.fire('Warning', 'กรุณาอัปโหลดรูปภาพ', 'warning');
    const hasStock = Object.values(newProduct.sizeStock).some(v => v > 0);
    if (!hasStock) return Swal.fire('Warning', 'กรุณาใส่สต็อกอย่างน้อย 1 ไซส์', 'warning');

    Swal.fire({ title: 'กำลังเพิ่มสินค้า...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      await axios.post('http://localhost:5000/api/products', { ...newProduct, price: Number(newProduct.price) });
      Swal.fire({ icon: 'success', title: 'ADDED!', timer: 1000, showConfirmButton: false });
      setNewProduct({ name: '', brand: '', price: '', image: '', sizeStock: {} });
      setIsImageReady(false);
      fetchProducts();
    } catch (err) { Swal.fire('Error', 'เพิ่มไม่สำเร็จ', 'error'); }
  };

  const handleSaveAll = async () => {
    const ids = Object.keys(editingData);
    if (ids.length === 0) return;
    Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      await Promise.all(ids.map(id => axios.patch(`http://localhost:5000/api/products/${id}`, editingData[id])));
      setEditingData({});
      fetchProducts();
      Swal.fire({ icon: 'success', title: 'SAVED ALL!', timer: 1000, showConfirmButton: false });
    } catch (err) { Swal.fire('Error', 'บันทึกไม่สำเร็จ', 'error'); }
  };

  const deleteProduct = async (id) => {
    const res = await Swal.fire({ title: 'ลบสินค้านี้?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (res.isConfirmed) {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      fetchProducts();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 lg:p-16 font-sans text-left">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
            <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-black transition-all font-bold uppercase text-[10px] tracking-widest">
              <ChevronLeft size={20} /> Back to Shop
            </Link>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Inventory <span className="text-blue-600">Lab</span></h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* 👟 ฝั่งซ้าย: เพิ่มสินค้าใหม่ */}
          <div className="lg:col-span-4">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-50 sticky top-10">
              <h2 className="text-xl font-black italic uppercase mb-8 flex items-center gap-2"><Plus className="text-blue-600" /> ADD NEW SHOE</h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="relative"><Package className="absolute left-5 top-5 text-gray-300" size={18}/><input type="text" placeholder="Name" required className="w-full bg-gray-50 p-5 pl-14 rounded-2xl outline-none focus:ring-2 ring-blue-50 font-bold" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} /></div>
                <div className="relative"><Tag className="absolute left-5 top-5 text-gray-300" size={18}/><input type="text" placeholder="Brand" required className="w-full bg-gray-50 p-5 pl-14 rounded-2xl outline-none focus:ring-2 ring-blue-50 font-bold" value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} /></div>
                <div className="relative"><DollarSign className="absolute left-5 top-5 text-gray-300" size={18}/><input type="number" placeholder="Price (THB)" required className="w-full bg-gray-50 p-5 pl-14 rounded-2xl outline-none focus:ring-2 ring-blue-50 font-bold" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} /></div>

                <p className="text-[10px] font-black uppercase text-gray-400 mt-6 mb-2 tracking-widest">Initial Stock per Size</p>
                <div className="grid grid-cols-5 gap-2">
                  {allSizes.map(size => (
                    <div key={size} className="flex flex-col gap-1 text-center">
                      <span className="text-[8px] font-bold text-gray-400 uppercase">{size}</span>
                      <input type="number" placeholder="0" className="w-full bg-gray-50 p-2 rounded-xl text-xs font-black text-center outline-none focus:ring-2 ring-blue-500" 
                        value={newProduct.sizeStock[size] || ""} onChange={e => handleSizeChange(null, size, e.target.value)} />
                    </div>
                  ))}
                </div>

                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50 cursor-pointer overflow-hidden mt-4 group hover:bg-gray-100">
                  {isImageReady ? (
                    <div className="flex flex-col items-center text-green-500 animate-in fade-in zoom-in duration-500"><FileCheck size={32} className="mb-2" /><p className="text-[10px] font-black uppercase tracking-widest">Image Ready</p></div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-300 group-hover:text-blue-400"><Upload size={24} /><p className="text-[9px] mt-2 font-black uppercase tracking-widest">Upload Shoe Photo</p></div>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
                <button className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-blue-600 shadow-xl active:scale-95 mt-2">ADD TO STORE</button>
              </form>
            </div>
          </div>

          {/* 📋 ฝั่งขวา: รายการสินค้า */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center mb-6 px-4">
                <h2 className="text-xs font-black uppercase text-gray-400 tracking-widest">Inventory List</h2>
                <button onClick={handleSaveAll} disabled={Object.keys(editingData).length === 0}
                 className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] transition-all shadow-xl ${Object.keys(editingData).length > 0 ? 'bg-blue-600 text-white shadow-blue-100' : 'bg-gray-100 text-gray-300'}`}>
                  <CheckCircle2 size={16} /> Save All Changes ({Object.keys(editingData).length})
                </button>
            </div>

            {products.map((item) => {
              const current = editingData[item._id] || item;
              const sizeStock = current.sizeStock || {};
              
              return (
                <div key={item._id} className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-gray-100 flex gap-8 relative transition-all hover:shadow-md group text-left">
                  <div className="w-32 h-32 bg-gray-50 rounded-[2.2rem] p-3 flex items-center justify-center shrink-0 shadow-inner">
                    <img src={item.image} className="w-full h-full object-contain" alt="shoe" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4 pr-12">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          value={current.brand} 
                          onChange={(e) => handleFieldChange(item._id, 'brand', e.target.value)}
                          className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-transparent border-none outline-none focus:ring-1 ring-blue-100 rounded px-1 w-full mb-1"
                        />
                        <input 
                          type="text" 
                          value={current.name} 
                          onChange={(e) => handleFieldChange(item._id, 'name', e.target.value)}
                          className="font-bold text-gray-900 text-xl leading-tight bg-transparent border-none outline-none focus:ring-1 ring-blue-100 rounded px-1 w-full"
                        />
                      </div>
                      
                      <div className="flex items-center group/price">
                        <span className="text-xl font-black italic mr-1 text-gray-300">฿</span>
                        <input 
                          type="number" 
                          value={current.price} 
                          onChange={(e) => handleFieldChange(item._id, 'price', e.target.value)}
                          className="text-2xl font-black italic tracking-tighter text-gray-900 bg-transparent border-none outline-none focus:ring-1 ring-blue-100 rounded px-1 w-28 text-right"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-3 border-t border-gray-50 pt-6">
                      {allSizes.map(size => {
                        const qty = sizeStock[size] || 0;
                        return (
                          <div key={size} className="text-center">
                            <p className="text-[8px] font-black text-gray-400 mb-1 uppercase">{size}</p>
                            <input 
                              type="number" 
                              className={`w-full text-center text-xs font-black p-2 rounded-xl bg-gray-50 outline-none transition-all ${qty > 0 ? 'text-blue-600 ring-1 ring-blue-100 bg-blue-50/30' : 'text-gray-300'}`}
                              value={qty} 
                              onChange={e => handleSizeChange(item._id, size, e.target.value)} 
                            />
                          </div>
                        );
                      })}
                    </div>
                    
                    <button onClick={() => deleteProduct(item._id)} className="absolute top-8 right-8 p-3 text-gray-200 hover:text-red-500 rounded-2xl hover:bg-red-50 transition-all">
                      <Trash2 size={20}/>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}