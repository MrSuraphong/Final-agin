import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Upload, Package, ArrowLeft, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2'; // <--- เพิ่มตัวนี้

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    const res = await axios.get('http://localhost:5000/api/products');
    setProducts(res.data);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleUpload = async () => {
    if (!image || !name || !price || !brand) {
      return Swal.fire({ icon: 'warning', title: 'ข้อมูลไม่ครบ!', text: 'กรุณากรอกรายละเอียดให้ครบถ้วนก่อนอัปโหลด', customClass: { popup: 'rounded-[2.5rem]' }});
    }

    // เริ่มโชว์ Loading
    Swal.fire({
      title: 'UPLOADING...',
      text: 'กำลังนำรองเท้าคู่ใหม่เข้าสู่ระบบ',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading() },
      customClass: { popup: 'rounded-[2.5rem]' }
    });

    try {
      const data = new FormData();
      data.append("file", image);
      data.append("upload_preset", "ml_default"); 
      data.append("cloud_name", "dg8xm2npc"); 

      const res = await axios.post("https://api.cloudinary.com/v1_1/dg8xm2npc/image/upload", data);
      const imageUrl = res.data.secure_url;

      await axios.post('http://localhost:5000/api/products', {
        name, price, brand, image: imageUrl
      });

      // สำเร็จ!
      Swal.fire({
        icon: 'success',
        title: 'SUCCESS!',
        text: 'เพิ่มรองเท้าเข้าสต็อกเรียบร้อยแล้ว',
        showConfirmButton: false,
        timer: 2000,
        customClass: { popup: 'rounded-[2.5rem]' }
      });

      setName(""); setPrice(""); setBrand(""); setImage(null);
      fetchProducts();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Oops!', text: 'อัปโหลดภาพไม่สำเร็จ กรุณาเช็คการตั้งค่า Cloudinary', customClass: { popup: 'rounded-[2.5rem]' }});
    }
  };

  const deleteProduct = async (id) => {
    const result = await Swal.fire({
      title: 'ลบสินค้านี้?',
      text: "คุณจะไม่สามารถกู้คืนข้อมูลรองเท้าคู่นี้ได้!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#f3f4f6',
      confirmButtonText: 'ลบเลย!',
      cancelButtonText: 'ยกเลิก',
      customClass: { popup: 'rounded-[2.5rem]', confirmButton: 'rounded-2xl px-6 py-3', cancelButton: 'rounded-2xl px-6 py-3 text-black' }
    });

    if (result.isConfirmed) {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      fetchProducts();
      Swal.fire({ title: 'DELETED!', icon: 'success', showConfirmButton: false, timer: 1000, customClass: { popup: 'rounded-[2.5rem]' } });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 font-sans text-[#1a1a1a]">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <Link to="/" className="flex items-center gap-2 font-bold text-gray-400 hover:text-black transition-all group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> BACK TO SHOP
          </Link>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Inventory <span className="text-blue-600">Lab</span></h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-fit sticky top-8">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-widest"><Plus className="text-blue-600" /> New Kick</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Shoe Name" value={name} className="w-full p-4 bg-gray-50 rounded-2xl outline-none" onChange={(e) => setName(e.target.value)} />
              <input type="text" placeholder="Brand" value={brand} className="w-full p-4 bg-gray-50 rounded-2xl outline-none" onChange={(e) => setBrand(e.target.value)} />
              <input type="number" placeholder="Price (฿)" value={price} className="w-full p-4 bg-gray-50 rounded-2xl outline-none" onChange={(e) => setPrice(e.target.value)} />
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all overflow-hidden">
                {image ? <span className="text-xs font-black text-blue-600 italic">READY TO FLY!</span> : <Upload className="text-gray-200" />}
                <input type="file" className="hidden" onChange={(e) => setImage(e.target.files[0])} />
              </label>
              <button onClick={handleUpload} className="w-full bg-black text-white py-5 rounded-2xl font-black hover:bg-blue-600 transition-all shadow-xl shadow-blue-50">UPLOAD TO STORE</button>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-black mb-6 uppercase tracking-widest flex items-center gap-2"><Package className="text-blue-600" /> Stock ({products.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map(product => (
                <div key={product._id} className="bg-white p-4 rounded-[2rem] border border-gray-50 flex items-center gap-4 group hover:shadow-lg transition-all">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl p-2"><img src={product.image} className="w-full h-full object-contain" alt="" /></div>
                  <div className="flex-1"><p className="text-[10px] font-black text-blue-600 uppercase">{product.brand}</p><h3 className="font-bold text-sm truncate w-32">{product.name}</h3><p className="font-black text-blue-600">฿{product.price.toLocaleString()}</p></div>
                  <button onClick={() => deleteProduct(product._id)} className="p-3 text-gray-200 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}