const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');

const Order = require('./models/Order');
const Product = require('./models/Product');
const User = require('./models/User');
const Message = require('./models/Message');

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "http://localhost:5173", methods: ["GET", "POST", "PATCH"] }
});

app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

mongoose.connect(process.env.MONGO_URI).then(() => console.log('DB Connected! ✅'));

// 💬 Socket.io
io.on('connection', (socket) => {
    socket.on('join_room', (room) => { socket.join(room); });
    socket.on('send_message', async (data) => {
        try {
            const newMessage = new Message({ ...data, timestamp: new Date() });
            await newMessage.save();
            io.to(data.room).emit('receive_message', data);
        } catch (err) { console.error(err); }
    });
});

// --- Auth & Cart APIs ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, fullName, captchaToken } = req.body;
        const secretKey = "6LdiKJAsAAAAALOPKWaSFeDvS6HgKixeiffpvHQR";
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;
        const googleRes = await axios.post(verifyUrl);
        if (!googleRes.data.success) return res.status(400).json({ message: "Captcha failed" });
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, fullName, role: 'user' });
        await newUser.save();
        res.status(201).json("Registered Successfully");
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { identity, password } = req.body;
        const user = await User.findOne({ $or: [{ email: identity }, { fullName: identity }] });
        if (!user) return res.status(400).json({ message: "ไม่พบผู้ใช้งาน" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "รหัสผ่านไม่ถูกต้อง" });
        const token = jwt.sign({ id: user._id, role: user.role }, "SECRET_KEY_123", { expiresIn: '1d' });
        res.status(200).json({ token, fullName: user.fullName, email: user.email, role: user.role, cart: user.cart || [] });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.patch('/api/auth/cart', async (req, res) => {
    try {
        await User.findOneAndUpdate({ email: req.body.email }, { cart: req.body.cart });
        res.json("Cart synced");
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- Product APIs ---
app.get('/api/products', async (req, res) => {
    try { res.json(await Product.find().sort({ createdAt: -1 })); } 
    catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/products', async (req, res) => { 
    try {
        const p = new Product({ ...req.body, price: Number(req.body.price) }); 
        await p.save(); 
        res.status(201).json(p); 
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.patch('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "ไม่พบสินค้า" });
        Object.assign(product, req.body);
        if (req.body.sizeStock) product.markModified('sizeStock');
        await product.save();
        res.json(product);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- Order APIs ---

// 1. ดึงออเดอร์ทั้งหมด
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. ดึงประวัติรายบุคคล
app.get('/api/orders/user/:email', async (req, res) => {
    try {
        const orders = await Order.find({ customerEmail: req.params.email }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 3. สั่งซื้อ
app.post('/api/orders', async (req, res) => { 
    try {
        let { items, ...orderData } = req.body; 
        for (let item of items) {
            const product = await Product.findById(item._id || item.id);
            if (!product) return res.status(404).json({ message: `ไม่พบสินค้า: ${item.name}` });
            const currentStock = Number(product.sizeStock[String(item.size)]) || 0;
            if (currentStock < item.quantity) {
                return res.status(400).json({ message: `ขออภัย! ${product.name} ไซส์ ${item.size} เหลือเพียง ${currentStock} คู่` });
            }
        }
        for (let item of items) {
            const product = await Product.findById(item._id || item.id);
            product.sizeStock[String(item.size)] -= item.quantity;
            product.markModified('sizeStock');
            await product.save();
        }
        const newOrder = new Order({ ...orderData, items, createdAt: new Date() }); 
        await newOrder.save(); 
        res.status(201).json({ status: "success", message: "สั่งซื้อสำเร็จ!" }); 
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 4. อัปเดตสถานะ (แก้ไขจุดนี้ให้ส่งสัญญาณ Real-time ไปยังลูกค้า)
app.patch('/api/orders/:id', async (req, res) => {
    try {
        const updated = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        
        // ✅ ส่งสัญญาณบอกทุก Client ว่าออเดอร์มีการอัปเดตสถานะแล้ว
        io.emit('order_status_updated', updated);

        res.json(updated);
    } catch (err) { res.status(500).json(err.message); }
});

// 5. ลบออเดอร์
app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ status: "success" });
    } catch (err) { res.status(500).json(err.message); }
});

// --- Chat APIs ---
app.get('/api/chat/rooms', async (req, res) => {
    try { res.json(await Message.distinct("room")); } catch (err) { res.status(500).json({ message: err.message }); }
});
app.get('/api/chat/:room', async (req, res) => {
    try {
        const roomName = decodeURIComponent(req.params.room);
        const history = await Message.find({ room: roomName }).sort({ timestamp: 1 });
        res.json(history);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}... 🚀`));