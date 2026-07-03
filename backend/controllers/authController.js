const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Đăng ký
const register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ username, email, password' });
    }

    try {
    // Kiểm tra email đã tồn tại chưa
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
        return res.status(409).json({ message: 'Email đã được sử dụng' });
    }

    // Mã hóa password
    const passwordHash = await bcrypt.hash(password, 10);

    // Lưu vào database
    const [result] = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, passwordHash]
    );

    res.status(201).json({ message: 'Đăng ký thành công', userId: result.insertId });
    } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Đăng nhập
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập email và password' });
    }

    try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
        return res.status(401).json({ message: 'Email hoặc password không đúng' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        return res.status(401).json({ message: 'Email hoặc password không đúng' });
    }

    // Tạo JWT token
    const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.json({
        message: 'Đăng nhập thành công',
        token,
        user: { id: user.id, username: user.username, email: user.email }
    });
    } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

module.exports = { register, login };