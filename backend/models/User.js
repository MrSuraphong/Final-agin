const mongoose = require('mongoose'); // ✅ เพิ่มบรรทัดนี้เพื่อแก้ ReferenceError

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    fullName: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        default: 'user' 
    },
    // 🔥 ฟิลด์สำหรับเก็บข้อมูลตะกร้าสินค้าถาวร
    cart: { 
        type: Array, 
        default: [] 
    } 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);