const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    // 🔥 ใช้ Object เพื่อรองรับคีย์อย่าง "10.5"
    sizeStock: { type: Object, default: {} }
}, { timestamps: true, minimize: false });

module.exports = mongoose.model('Product', productSchema);