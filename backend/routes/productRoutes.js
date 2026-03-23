const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // ดึงแม่พิมพ์ที่เราทำไว้มาใช้

// 1. [POST] - เพิ่มรองเท้าคู่ใหม่ (Admin Use)
router.post('/', async (req, res) => {
  try {
    const newProduct = new Product(req.body); // รับค่าจากหน้าบ้านมาใส่ในแม่พิมพ์
    const savedProduct = await newProduct.save(); // บันทึกลง MongoDB
    res.status(201).json(savedProduct); // ส่งข้อมูลที่บันทึกสำเร็จกลับไปบอกหน้าบ้าน
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. [GET] - ดึงข้อมูลรองเท้าทั้งหมด (ไปโชว์หน้าเว็บ)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find(); // หาของทั้งหมดในฐานข้อมูล
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;