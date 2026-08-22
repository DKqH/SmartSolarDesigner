const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ربط ملفات الواجهة الأساسية (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// نقطة اختبار للسيرفر
app.get('/api/test', (req, res) => {
    res.json({ message: "Server is running successfully! 🚀" });
});

app.listen(PORT, () => {
    console.log("Server is running on port: " + PORT);
});