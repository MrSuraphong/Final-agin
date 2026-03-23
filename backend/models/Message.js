const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    room: { type: String, required: true }, // มักจะใช้อีเมลลูกค้าเป็นชื่อห้อง
    sender: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['user', 'admin'], required: true },
    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);