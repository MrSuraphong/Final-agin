const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: String,
    customerEmail: String, // ✅ ต้องมีฟิลด์นี้ไว้เชื่อมประวัติ
    phone: String,
    address: {
        detail: String,
        province: String
    },
    items: Array,
    totalPrice: Number,
    slipImage: String,
    status: { type: String, default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);