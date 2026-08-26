require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ربط ملفات الواجهة الأساسية (HTML, CSS, JS)
// (ملاحظة: لو مجلد الواجهة عندك اسمه frontend بدل public، غير كلمة public لـ frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

// الاتصال بـ Supabase مباشرة بدون SQL معقد
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// نقطة اختبار للسيرفر
app.get('/api/test', (req, res) => {
    res.json({ message: "Server is running successfully! 🚀" });
});

// 1. جلب المشاريع النشطة من Supabase
app.get('/api/projects', async (req, res) => {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// 2. إضافة مشروع جديد إلى Supabase
app.post('/api/projects', async (req, res) => {
    const { data, error } = await supabase.from('projects').insert([req.body]);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// 3. جلب طلبات الزبائن (Client Requests)
app.get('/api/requests', async (req, res) => {
    const { data, error } = await supabase.from('client_requests').select('*');
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// 4. إضافة طلب زبون جديد
app.post('/api/requests', async (req, res) => {
    const { data, error } = await supabase.from('client_requests').insert([req.body]);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

app.listen(PORT, () => {
    console.log("Server is running on port: " + PORT);
});